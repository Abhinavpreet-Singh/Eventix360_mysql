import { Router } from "express";
import { z } from "zod";
import { getPool } from "../db.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

router.post("/signup", async (req, res) => {
  const parseResult = signupSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parseResult.error.flatten() });
  }
  const { name, email, password } = parseResult.data;

  try {
    const pool = getPool();

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const passwordHash = await hashPassword(password);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );

    const userId = result.insertId;
    const token = signToken({ userId, email, role: "user" });
    return res.status(201).json({
      user: { id: userId, name, email, role: "user" },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

router.post("/login", async (req, res) => {
  // allow optional "as" field to login as a 'club' instead of a user
  const loginWithType = loginSchema.extend({
    as: z.enum(["user", "club"]).optional(),
  });
  const parseResult = loginWithType.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parseResult.error.flatten() });
  }
  const { email, password, as } = parseResult.data;

  try {
    const pool = getPool();

    if (as === "club") {
      // Authenticate as club
      const [clubRows] = await pool.query(
        "SELECT club_id, club_name, club_email, club_password FROM clubs WHERE club_email = ? LIMIT 1",
        [email]
      );
      const club =
        Array.isArray(clubRows) && clubRows.length > 0 ? clubRows[0] : null;
      if (!club) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const matchClub = await verifyPassword(password, club.club_password);
      if (!matchClub) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = signToken({
        clubId: club.club_id,
        role: "club",
        club_name: club.club_name,
      });
      return res.json({
        club: {
          id: club.club_id,
          name: club.club_name,
          email: club.club_email,
        },
        token,
      });
    }

    // Default: authenticate as user
    const [rows] = await pool.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await verifyPassword(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    // If token belongs to a club, return club info
    if (req.user?.role === "club") {
      const clubId = req.user.clubId;
      if (!clubId) return res.status(400).json({ error: "Invalid token" });
      const [rows] = await pool.query(
        "SELECT club_id AS id, club_name AS name, club_email AS email, created_at FROM clubs WHERE club_id = ? LIMIT 1",
        [clubId]
      );
      const club = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      if (!club) return res.status(404).json({ error: "Club not found" });
      return res.json({ club });
    }

    // Default: user
    const [rows] = await pool.query(
      "SELECT id, name, email, created_at, role FROM users WHERE id = ? LIMIT 1",
      [req.user.userId]
    );
    const user = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Debug: return token payload
router.get("/check", authMiddleware, async (req, res) => {
  return res.json({ payload: req.user });
});

export default router;
