/* eslint-env node */
import express from "express";
import { getPool } from "../db.js";

const router = express.Router();

// GET /api/categories
// Retrieve all categories
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT category_id, category_name, category_description FROM categories ORDER BY category_name"
    );
    res.json({ categories: rows });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
