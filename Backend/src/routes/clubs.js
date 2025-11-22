import { Router } from "express";
import { getPool } from "../db.js";
import { hashPassword } from "../utils/password.js";

const router = Router();

// Get all clubs
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT club_id, club_name, club_email, club_description, created_at FROM clubs ORDER BY created_at DESC"
    );
    return res.json({ clubs: rows });
  } catch (error) {
    console.error("Get clubs error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Optionally, create a new club (admin only in production)
router.post("/", async (req, res) => {
  const { club_name, club_email, club_password, club_description } = req.body;
  if (!club_name || !club_email || !club_password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const pool = getPool();
    const hashed = await hashPassword(club_password);
    const [result] = await pool.query(
      "INSERT INTO clubs (club_name, club_email, club_password, club_description) VALUES (?, ?, ?, ?)",
      [club_name, club_email, hashed, club_description || null]
    );
    return res
      .status(201)
      .json({ message: "Club created", clubId: result.insertId });
  } catch (error) {
    console.error("Create club error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
