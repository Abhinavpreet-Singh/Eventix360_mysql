/* eslint-env node */
/* global process */
import "../../../Backend/src/loadEnv.js";
import { initDatabase, getPool } from "../db.js";
import { hashPassword } from "../utils/password.js";

async function seed() {
  await initDatabase();
  const pool = getPool();

  // Clubs to create
  const clubs = [
    {
      club_name: "CodeHub",
      club_email: "codehub@college.edu",
      club_password: "codehub123",
      club_description: "Coding club for developers and hackathon lovers.",
    },
    {
      club_name: "DesignStudio",
      club_email: "design@college.edu",
      club_password: "design123",
      club_description: "UI/UX and product design enthusiasts.",
    },
    {
      club_name: "RoboticsClub",
      club_email: "robotics@college.edu",
      club_password: "robotics123",
      club_description: "Robotics projects and competitions.",
    },
    {
      club_name: "ArtCircle",
      club_email: "art@college.edu",
      club_password: "art123",
      club_description: "Creative arts, painting and exhibitions.",
    },
    {
      club_name: "Entrepreneurs",
      club_email: "entre@college.edu",
      club_password: "entre123",
      club_description: "Startup talks and business workshops.",
    },
    {
      club_name: "MusicSociety",
      club_email: "music@college.edu",
      club_password: "music123",
      club_description: "Performances, jams and music workshops.",
    },
  ];

  const clubMap = {};
  for (const c of clubs) {
    try {
      const [existing] = await pool.query(
        "SELECT club_id FROM clubs WHERE club_name = ? LIMIT 1",
        [c.club_name]
      );
      if (Array.isArray(existing) && existing.length > 0) {
        clubMap[c.club_name] = existing[0].club_id;
        console.log("Club exists:", c.club_name);
        continue;
      }
      const hashed = await hashPassword(c.club_password);
      const [result] = await pool.query(
        "INSERT INTO clubs (club_name, club_email, club_password, club_description) VALUES (?, ?, ?, ?)",
        [c.club_name, c.club_email, hashed, c.club_description]
      );
      clubMap[c.club_name] = result.insertId;
      console.log("Inserted club:", c.club_name, "id=", result.insertId);
    } catch (err) {
      console.error("Error inserting club", c.club_name, err.message);
    }
  }

  // Events to create (tech + non-tech)
  const events = [
    {
      event_title: "Campus Hackathon 2025",
      event_date: "2025-12-05T09:00:00",
      event_location: "Main Auditorium",
      image_url: "https://picsum.photos/seed/hackathon/800/450",
      club_name: "CodeHub",
      category_id: "Tech",
      event_description:
        "24-hour coding marathon to build solutions and prototypes. Prizes for top teams.",
      brochure_url: "",
      event_schedule: "Day 1: Kickoff & ideation; Day 2: Demos & awards",
      terms: "Team of up to 4. Follow code of conduct.",
    },
    {
      event_title: "UI/UX Design Sprint",
      event_date: "2025-11-28T10:00:00",
      event_location: "Design Lab",
      image_url: "https://picsum.photos/seed/designsprint/800/450",
      club_name: "DesignStudio",
      category_id: "Tech",
      event_description:
        "Hands-on sprint for rapid prototyping and user testing.",
      brochure_url: "",
      event_schedule: "10:00 - Intro; 11:00 - Sketching; 14:00 - Prototype",
      terms: "Bring your laptop; materials provided.",
    },
    {
      event_title: "Robotics Workshop: Basics to Bots",
      event_date: "2025-12-10T13:00:00",
      event_location: "Robotics Lab",
      image_url: "https://picsum.photos/seed/robotics/800/450",
      club_name: "RoboticsClub",
      category_id: "Tech",
      event_description:
        "Introductory robotics workshop — assemble and program a line-following bot.",
      brochure_url: "",
      event_schedule: "13:00 - Setup; 15:00 - Build; 17:00 - Test",
      terms: "Limited seats. Prior registration required.",
    },
    {
      event_title: "Open Mic Night",
      event_date: "2025-11-30T19:00:00",
      event_location: "Cafeteria Stage",
      image_url: "https://picsum.photos/seed/openmic/800/450",
      club_name: "MusicSociety",
      category_id: "Non-Tech",
      event_description:
        "Perform your original songs, poetry, or stand-up at our monthly open mic.",
      brochure_url: "",
      event_schedule: "19:00 - Doors; 19:30 - Performances",
      terms: "Sign up on arrival. Respect performers.",
    },
    {
      event_title: "Watercolor Weekend",
      event_date: "2025-12-14T10:00:00",
      event_location: "Art Studio",
      image_url: "https://picsum.photos/seed/watercolor/800/450",
      club_name: "ArtCircle",
      category_id: "Non-Tech",
      event_description:
        "Relaxed watercolor painting session for beginners and pros.",
      brochure_url: "",
      event_schedule:
        "10:00 - Materials; 10:30 - Lesson; 13:00 - Free painting",
      terms: "Materials included for first 20 attendees.",
    },
    {
      event_title: "Startup Pitch Night",
      event_date: "2025-12-02T18:00:00",
      event_location: "Auditorium",
      image_url: "https://picsum.photos/seed/pitchnight/800/450",
      club_name: "Entrepreneurs",
      category_id: "Non-Tech",
      event_description:
        "Student startups pitch ideas to guest investors and mentors.",
      brochure_url: "",
      event_schedule: "18:00 - Pitches; 20:00 - Feedback",
      terms: "Apply to pitch; audience seats first-come.",
    },
    {
      event_title: "AI & ML Seminar",
      event_date: "2025-12-08T11:00:00",
      event_location: "Lecture Hall A",
      image_url: "https://picsum.photos/seed/aiml/800/450",
      club_name: "CodeHub",
      category_id: "Tech",
      event_description:
        "Introductory seminar on practical AI & ML use-cases and career paths.",
      brochure_url: "",
      event_schedule: "11:00 - Talk; 12:30 - Q&A",
      terms: "Open to all students.",
    },
    {
      event_title: "Photography Walk",
      event_date: "2025-11-29T07:30:00",
      event_location: "Campus Green",
      image_url: "https://picsum.photos/seed/photowalk/800/450",
      club_name: "ArtCircle",
      category_id: "Non-Tech",
      event_description:
        "Sunrise photography walk across campus with tips from seniors.",
      brochure_url: "",
      event_schedule: "07:30 - Meet; 08:00 - Walk; 10:00 - Review",
      terms: "Bring your camera or phone.",
    },
    {
      event_title: "Entrepreneurship Workshop: MVP",
      event_date: "2025-12-11T14:00:00",
      event_location: "Seminar Room 2",
      image_url: "https://picsum.photos/seed/mvp/800/450",
      club_name: "Entrepreneurs",
      category_id: "Non-Tech",
      event_description:
        "Build a minimum viable product and validate ideas quickly.",
      brochure_url: "",
      event_schedule: "14:00 - Workshop; 17:00 - Demos",
      terms: "Bring a problem statement.",
    },
    {
      event_title: "Beat Making Workshop",
      event_date: "2025-12-03T16:00:00",
      event_location: "Music Room",
      image_url: "https://picsum.photos/seed/beatmaking/800/450",
      club_name: "MusicSociety",
      category_id: "Non-Tech",
      event_description: "Create beats and short tracks using free tools.",
      brochure_url: "",
      event_schedule: "16:00 - Tools; 18:00 - Jam",
      terms: "Laptops recommended.",
    },
  ];

  for (const ev of events) {
    try {
      // find club id
      const clubId = clubMap[ev.club_name];
      if (!clubId) {
        console.warn(
          "Skipping event, club not found:",
          ev.event_title,
          ev.club_name
        );
        continue;
      }

      const eventDate = new Date(ev.event_date);
      const formatted = eventDate.toISOString().slice(0, 19).replace("T", " ");

      const [resInsert] = await pool.query(
        `INSERT INTO events (public_id, title, image_url, event_title, event_date, club_id, event_location, category_id) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
        [
          ev.event_title,
          ev.image_url,
          ev.event_title,
          formatted,
          String(clubId),
          ev.event_location,
          ev.category_id,
        ]
      );
      const eventId = resInsert.insertId;
      console.log("Inserted event:", ev.event_title, "id=", eventId);

      // insert event_details
      try {
        await pool.query(
          `INSERT INTO event_details (event_id, event_description, brochure_url, event_schedule, terms) VALUES (?, ?, ?, ?, ?)`,
          [
            eventId,
            ev.event_description || null,
            ev.brochure_url || null,
            ev.event_schedule || null,
            ev.terms || null,
          ]
        );
      } catch (err) {
        console.warn(
          "Could not insert event_details for",
          ev.event_title,
          err.message
        );
      }
    } catch (err) {
      console.error("Error inserting event", ev.event_title, err.message);
    }
  }

  console.log("Seeding complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
