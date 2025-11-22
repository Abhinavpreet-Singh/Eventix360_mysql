import { Router } from "express";
import { z } from "zod";
import { getPool } from "../db.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

// Validation schema for creating/updating events (updated for new fields)
const eventSchema = z.object({
  // Legacy field (for backward compatibility) - OPTIONAL
  title: z.string().optional().or(z.literal("")),
  image_url: z.string().optional().or(z.literal("")),

  // New fields - REQUIRED
  event_title: z.string().min(1, "Event title is required"),
  event_date: z.string().min(1, "Event date is required"),
  club_id: z
    .union([z.string().min(1), z.number().int().positive()])
    .refine(Boolean, "Club ID is required"),
  event_location: z.string().min(1, "Event location is required"),
  category_id: z
    .union([z.string().min(1), z.number().int().positive()])
    .refine(Boolean, "Category ID is required"),
  // allow numeric ids as well
  // Event details
  event_description: z.string().optional().or(z.literal("")),
  brochure_url: z.string().optional().or(z.literal("")),
  event_schedule: z.string().optional().or(z.literal("")),
  terms: z.string().optional().or(z.literal("")),
});

// Create a new event
router.post("/", authMiddleware, async (req, res) => {
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

  let {
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

    // Authorization: only club users and superadmin can create events
    const role = req.user?.role;
    if (role !== "club" && role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden: cannot create events" });
    }

    // If club, force club_id to the authenticated club id
    if (role === "club") {
      club_id = String(
        req.user.clubId ||
          req.user.club_id ||
          req.user.clubID ||
          req.user.clubid
      );
    }

    // Convert event_date string to proper datetime format
    const eventDateTime = new Date(event_date);
    const formattedEventDate = eventDateTime
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Ensure category_id is numeric (store only id in events table)
    if (typeof category_id === "string") {
      category_id = category_id.trim();
    }
    const catIdNum = parseInt(category_id, 10);
    if (Number.isNaN(catIdNum) || catIdNum <= 0) {
      return res.status(400).json({ error: "Invalid category_id" });
    }
    category_id = catIdNum;

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

    // Insert into event_cards table
    try {
      const eventDateOnly = formattedEventDate.split(" ")[0]; // Extract DATE portion
      await pool.query(
        `INSERT INTO event_cards (event_id, event_title, event_date, event_location, image_url, event_description, brochure_url, event_schedule, terms, club_id, category_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventId,
          event_title,
          eventDateOnly,
          event_location,
          image_url || null,
          event_description || null,
          brochure_url || null,
          event_schedule || null,
          terms || null,
          club_id,
          category_id,
        ]
      );
    } catch (err) {
      console.warn("Could not insert event_card:", err.message);
    }

    // Fetch the created event (with joined details and category) to return it
    const [rows] = await pool.query(
      `SELECT e.*, d.event_description, d.brochure_url, d.event_schedule, d.terms, c.club_name, cat.category_name AS category_name
       FROM events e
       LEFT JOIN event_details d ON e.id = d.event_id
       LEFT JOIN clubs c ON e.club_id = c.club_id
       LEFT JOIN categories cat ON e.category_id = cat.category_id
       WHERE e.id = ? LIMIT 1`,
      [eventId]
    );
    const event = rows[0];

    return res
      .status(201)
      .json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Create event error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get all events with event_cards data (optimized for frontend display)
router.get("/cards/all", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT ec.*, c.club_name, cat.category_name 
       FROM event_cards ec
       LEFT JOIN clubs c ON ec.club_id = c.club_id
       LEFT JOIN categories cat ON ec.category_id = cat.category_id
       ORDER BY ec.event_date ASC`
    );
    return res.json({ eventCards: rows });
  } catch (error) {
    console.error("Get event cards error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get all events
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT e.*, d.event_description, d.brochure_url, d.event_schedule, d.terms, c.club_name, cat.category_name AS category_name
       FROM events e
       LEFT JOIN event_details d ON e.id = d.event_id
       LEFT JOIN clubs c ON e.club_id = c.club_id
       LEFT JOIN categories cat ON e.category_id = cat.category_id
       ORDER BY e.event_date ASC`
    );

    return res.json({ events: rows });
  } catch (error) {
    console.error("Get events error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get events for current authenticated user/club or all for superadmin
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const role = req.user?.role;
    if (role === "club") {
      const clubId = req.user.clubId || req.user.club_id || req.user.clubId;
      const [rows] = await pool.query(
        `SELECT e.*, d.event_description, d.brochure_url, d.event_schedule, d.terms, c.club_name, cat.category_name AS category_name
         FROM events e
         LEFT JOIN event_details d ON e.id = d.event_id
         LEFT JOIN clubs c ON e.club_id = c.club_id
         LEFT JOIN categories cat ON e.category_id = cat.category_id
         WHERE e.club_id = ?
         ORDER BY e.event_date ASC`,
        [String(clubId)]
      );
      return res.json({ events: rows });
    }

    // superadmin or other roles with access -> return all
    const [rows] = await pool.query(
      `SELECT e.*, d.event_description, d.brochure_url, d.event_schedule, d.terms, c.club_name, cat.category_name AS category_name
       FROM events e
       LEFT JOIN event_details d ON e.id = d.event_id
       LEFT JOIN clubs c ON e.club_id = c.club_id
       LEFT JOIN categories cat ON e.category_id = cat.category_id
       ORDER BY e.event_date ASC`
    );
    return res.json({ events: rows });
  } catch (error) {
    console.error("Get my events error:", error);
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
      `SELECT e.*, d.event_description, d.brochure_url, d.event_schedule, d.terms, c.club_name, cat.category_name AS category_name
       FROM events e
       LEFT JOIN event_details d ON e.id = d.event_id
       LEFT JOIN clubs c ON e.club_id = c.club_id
       LEFT JOIN categories cat ON e.category_id = cat.category_id
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
router.put("/:id", authMiddleware, async (req, res) => {
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
    event_description,
    brochure_url,
    event_schedule,
    terms,
  } = parseResult.data;

  // For updates we should also coerce category_id where applicable (handled later in code)

  try {
    const pool = getPool();
    // Check if event exists
    const [existing] = await pool.query("SELECT * FROM events WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Authorization: only superadmin or owning club can update
    const role = req.user?.role;
    if (role === "club") {
      const clubId = String(
        req.user.clubId || req.user.club_id || req.user.clubId
      );
      if (String(existing[0].club_id) !== clubId) {
        return res
          .status(403)
          .json({ error: "Forbidden: cannot update this event" });
      }
    } else if (role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden: cannot update events" });
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
    // Upsert event_details
    try {
      const [exists] = await pool.query(
        "SELECT event_id FROM event_details WHERE event_id = ? LIMIT 1",
        [id]
      );
      if (Array.isArray(exists) && exists.length > 0) {
        await pool.query(
          `UPDATE event_details SET event_description = ?, brochure_url = ?, event_schedule = ?, terms = ? WHERE event_id = ?`,
          [
            event_description || null,
            brochure_url || null,
            event_schedule || null,
            terms || null,
            id,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO event_details (event_id, event_description, brochure_url, event_schedule, terms) VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            event_description || null,
            brochure_url || null,
            event_schedule || null,
            terms || null,
          ]
        );
      }
    } catch (err) {
      console.warn("Could not upsert event_details:", err.message);
    }

    // Update event_cards table
    try {
      const eventDateOnly = formattedEventDate.split(" ")[0]; // Extract DATE portion
      const [cardExists] = await pool.query(
        "SELECT event_card_id FROM event_cards WHERE event_id = ? LIMIT 1",
        [id]
      );
      if (Array.isArray(cardExists) && cardExists.length > 0) {
        await pool.query(
          `UPDATE event_cards SET event_title = ?, event_date = ?, event_location = ?, image_url = ?, event_description = ?, brochure_url = ?, event_schedule = ?, terms = ?, club_id = ?, category_id = ? WHERE event_id = ?`,
          [
            event_title,
            eventDateOnly,
            event_location,
            image_url || null,
            event_description || null,
            brochure_url || null,
            event_schedule || null,
            terms || null,
            club_id,
            category_id,
            id,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO event_cards (event_id, event_title, event_date, event_location, image_url, event_description, brochure_url, event_schedule, terms, club_id, category_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            event_title,
            eventDateOnly,
            event_location,
            image_url || null,
            event_description || null,
            brochure_url || null,
            event_schedule || null,
            terms || null,
            club_id,
            category_id,
          ]
        );
      }
    } catch (err) {
      console.warn("Could not upsert event_card:", err.message);
    }

    // Return joined event with details
    const [rows] = await pool.query(
      `SELECT e.*, d.event_description, d.brochure_url, d.event_schedule, d.terms, c.club_name
       FROM events e
       LEFT JOIN event_details d ON e.id = d.event_id
       LEFT JOIN clubs c ON e.club_id = c.club_id
       WHERE e.id = ? LIMIT 1`,
      [id]
    );

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
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  try {
    const pool = getPool();

    // Check if event exists
    const [existing] = await pool.query("SELECT * FROM events WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Authorization: only superadmin or owning club can delete
    const role = req.user?.role;
    if (role === "club") {
      const clubId = String(
        req.user.clubId || req.user.club_id || req.user.clubId
      );
      if (String(existing[0].club_id) !== clubId) {
        return res
          .status(403)
          .json({ error: "Forbidden: cannot delete this event" });
      }
    } else if (role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden: cannot delete events" });
    }

    // Delete the event (cascades to event_cards and event_details via FK)
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
