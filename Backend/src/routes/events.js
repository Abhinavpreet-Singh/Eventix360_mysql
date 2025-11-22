import { Router } from "express";
import { z } from "zod";
import { getPool } from "../db.js";

const router = Router();

// Validation schema for creating/updating events (updated for new fields)
const eventSchema = z.object({
  // Legacy field (for backward compatibility) - OPTIONAL
  title: z.string().optional().or(z.literal("")),
  image_url: z.string().optional().or(z.literal("")),

  // New fields - REQUIRED
  event_title: z.string().min(1, "Event title is required"),
  event_date: z.string().min(1, "Event date is required"),
  club_id: z.string().min(1, "Club ID is required"),
  event_location: z.string().min(1, "Event location is required"),
  category_id: z.string().min(1, "Category ID is required"),
  // Event details
  event_description: z.string().optional().or(z.literal("")),
  brochure_url: z.string().optional().or(z.literal("")),
  event_schedule: z.string().optional().or(z.literal("")),
  terms: z.string().optional().or(z.literal("")),
});

// Create a new event
router.post("/", async (req, res) => {
  console.log("Received payload:", req.body);
  console.log("Payload type:", typeof req.body);
  console.log("Payload keys:", Object.keys(req.body));

  // Use validation schema
  const parseResult = eventSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.log("Validation error:", parseResult.error.flatten());
    return res.status(400).json({
      error: "Invalid payload",
      details: parseResult.error.flatten(),
    });
  }

  const {
    title,
    image_url,
    event_title,
    event_date,
    club_id,
    event_location,
    category_id,
    event_description,
    brochure_url,
    event_schedule,
    terms,
  } = parseResult.data;
  console.log("Extracted data:", {
    event_title,
    event_date,
    club_id,
    event_location,
    image_url,
    category_id,
    event_description,
    brochure_url,
    event_schedule,
    terms,
  });

  try {
    const pool = getPool();

    // Convert event_date string to proper datetime format
    const eventDateTime = new Date(event_date);
    const formattedEventDate = eventDateTime
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const [result] = await pool.query(
      `INSERT INTO events (
                public_id, 
                title, 
                image_url, 
                event_title,
                event_date,
                club_id,
                event_location,
                category_id
            ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || event_title,
        image_url || null,
        event_title,
        formattedEventDate,
        club_id,
        event_location,
        category_id,
      ]
    );

    const eventId = result.insertId;
    // Insert details into event_details table if provided
    try {
      await pool.query(
        `INSERT INTO event_details (event_id, event_description, brochure_url, event_schedule, terms) VALUES (?, ?, ?, ?, ?)`,
        [
          eventId,
          event_description || null,
          brochure_url || null,
          event_schedule || null,
          terms || null,
        ]
      );
    } catch (err) {
      // If event_details table doesn't exist or insert fails, log but continue
      console.warn("Could not insert event_details:", err.message);
    }

    // Fetch the created event to return it
    const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [
      eventId,
    ]);
    const event = rows[0];

    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get all events
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT e.*, d.event_description, d.brochure_url, d.event_schedule, d.terms, c.club_name
       FROM events e
       LEFT JOIN event_details d ON e.id = d.event_id
       LEFT JOIN clubs c ON e.club_id = c.club_id
       ORDER BY e.event_date ASC`
    );

    return res.json({ events: rows });
  } catch (error) {
    console.error("Get events error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific event by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT e.*, d.event_description, d.brochure_url, d.event_schedule, d.terms, c.club_name
       FROM events e
       LEFT JOIN event_details d ON e.id = d.event_id
       LEFT JOIN clubs c ON e.club_id = c.club_id
       WHERE e.id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.json({ event: rows[0] });
  } catch (error) {
    console.error("Get event error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update an event
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  const parseResult = eventSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.log("Validation error:", parseResult.error.flatten());
    return res.status(400).json({
      error: "Invalid payload",
      details: parseResult.error.flatten(),
    });
  }

  const {
    title,
    image_url,
    event_title,
    event_date,
    club_id,
    event_location,
    category_id,
  } = parseResult.data;

  try {
    const pool = getPool();

    // Check if event exists
    const [existing] = await pool.query("SELECT id FROM events WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Convert event_date string to proper datetime format
    const eventDateTime = new Date(event_date);
    const formattedEventDate = eventDateTime
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Update the event
    await pool.query(
      `UPDATE events SET 
                title = ?, 
                image_url = ?, 
                event_title = ?,
                event_date = ?,
                club_id = ?,
                event_location = ?,
                category_id = ?
            WHERE id = ?`,
      [
        title || event_title,
        image_url || null,
        event_title,
        formattedEventDate,
        club_id,
        event_location,
        category_id,
        id,
      ]
    );

    // Fetch the updated event
    const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [id]);

    return res.json({
      message: "Event updated successfully",
      event: rows[0],
    });
  } catch (error) {
    console.error("Update event error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete an event
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  try {
    const pool = getPool();

    // Check if event exists
    const [existing] = await pool.query("SELECT id FROM events WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Delete the event
    await pool.query("DELETE FROM events WHERE id = ?", [id]);

    return res.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
