/* eslint-env node */
/* global process */
import "./loadEnv.js";

import mysql from "mysql2/promise";
import { hashPassword } from "./utils/password.js";

const {
  MYSQL_HOST = "localhost",
  MYSQL_PORT = "3306",
  MYSQL_USER = "root",
  MYSQL_PASSWORD = "",
  MYSQL_DATABASE = "Eventix",
} = process.env;

let pool;

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    multipleStatements: true,
  });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log("Database created successfully");
  } finally {
    await connection.end();
  }
}

export async function initDatabase() {
  await ensureDatabaseExists();

  pool = mysql.createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Initialize tables
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(30) NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

  await pool.query(`
        CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            public_id CHAR(36) NOT NULL UNIQUE,
            title VARCHAR(255) NULL,
            image_url VARCHAR(500),
            event_title VARCHAR(255),
            event_date DATETIME,
            club_id VARCHAR(100),
            event_location VARCHAR(255),
            category_id VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

  // Create clubs table (new schema compatibility)
  await pool.query(`
        CREATE TABLE IF NOT EXISTS clubs (
                club_id INT AUTO_INCREMENT PRIMARY KEY,
                club_name VARCHAR(100) UNIQUE NOT NULL,
                club_email VARCHAR(120) UNIQUE NOT NULL,
                club_password VARCHAR(255) NOT NULL,
                club_description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

  // Create super_admins table (schema-compatible with eventix.sql)
  await pool.query(`
        CREATE TABLE IF NOT EXISTS super_admins (
            admin_id INT PRIMARY KEY AUTO_INCREMENT,
            admin_name VARCHAR(100) NOT NULL,
            admin_email VARCHAR(120) UNIQUE NOT NULL,
            admin_password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

  // Ensure club passwords are hashed (hash any non-bcrypt passwords)
  try {
    const [clubRows] = await pool.query(
      "SELECT club_id, club_password FROM clubs"
    );
    for (const c of clubRows) {
      const pw = c.club_password || "";
      if (pw && !pw.startsWith("$2")) {
        const hashed = await hashPassword(pw);
        await pool.query(
          "UPDATE clubs SET club_password = ? WHERE club_id = ?",
          [hashed, c.club_id]
        );
        console.log("Hashed club password for club_id=", c.club_id);
      }
    }
  } catch (err) {
    // If clubs table empty or permission issue, ignore
    console.log("Club password hashing check skipped or failed:", err.message);
  }

  // Create event_details table (holds long-form event fields)
  await pool.query(`
        CREATE TABLE IF NOT EXISTS event_details (
            event_id INT PRIMARY KEY,
            event_description TEXT,
            brochure_url VARCHAR(255),
            event_schedule TEXT,
            terms TEXT,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

  // Create categories table
  await pool.query(`
          CREATE TABLE IF NOT EXISTS categories (
            category_id INT PRIMARY KEY AUTO_INCREMENT,
            category_name VARCHAR(100) UNIQUE NOT NULL,
            category_description TEXT
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

  // Insert default categories if table is empty
  try {
    const [cCount] = await pool.query("SELECT COUNT(*) AS c FROM categories");
    if (Array.isArray(cCount) && cCount[0].c === 0) {
      const defaults = [
        ["Tech", "Technical events, hackathons, coding"],
        ["Non-Tech", "Non-technical events like quizzes and discussions"],
        ["Workshop", "Hands-on workshops and training sessions"],
        ["Seminar", "Talks and seminars"],
        ["Cultural", "Cultural and arts events"],
        ["Sports", "Sports and physical activities"],
        ["Social", "Social meetups and networking"],
      ];
      for (const d of defaults) {
        try {
          await pool.query(
            "INSERT INTO categories (category_name, category_description) VALUES (?, ?)",
            d
          );
        } catch {
          // ignore duplicates
        }
      }
      console.log("Inserted default categories");
    }
  } catch (err) {
    console.log("Could not seed default categories:", err.message);
  }

  // Create registrations table
  await pool.query(`
          CREATE TABLE IF NOT EXISTS registrations (
            registration_id INT PRIMARY KEY AUTO_INCREMENT,
            event_id INT NOT NULL,
            user_id INT NOT NULL,
            registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            confirmation_code CHAR(36) DEFAULT (UUID()) UNIQUE,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

  // Create feedbacks table
  await pool.query(`
          CREATE TABLE IF NOT EXISTS feedbacks (
            feedback_id INT PRIMARY KEY AUTO_INCREMENT,
            event_id INT NOT NULL,
            user_id INT NOT NULL,
            rating TINYINT NOT NULL,
            comments TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

  // Create payments table
  await pool.query(`
          CREATE TABLE IF NOT EXISTS payments (
            payment_id INT PRIMARY KEY AUTO_INCREMENT,
            registration_id INT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            payment_status ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL,
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (registration_id) REFERENCES registrations(registration_id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

  // Create event_logs table
  await pool.query(`
          CREATE TABLE IF NOT EXISTS event_logs (
            log_id INT PRIMARY KEY AUTO_INCREMENT,
            action_type VARCHAR(50),
            description TEXT,
            action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

  // Create event_cards table for compatibility (if not present)
  await pool.query(`
          CREATE TABLE IF NOT EXISTS event_cards (
            event_card_id INT PRIMARY KEY AUTO_INCREMENT,
            event_id INT NOT NULL UNIQUE,
            event_title VARCHAR(100) NOT NULL,
            event_date DATE NOT NULL,
            event_location VARCHAR(100) NOT NULL,
            image_url VARCHAR(255),
            event_description TEXT,
            brochure_url VARCHAR(255),
            event_schedule TEXT,
            terms TEXT,
            club_id INT NOT NULL,
            category_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
            FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

  // Ensure public_id exists on older databases and backfill missing values
  try {
    // Check if public_id column exists
    const [columns] = await pool.query(
      "SHOW COLUMNS FROM events LIKE 'public_id'"
    );

    if (columns.length === 0) {
      // Column doesn't exist, add it
      await pool.query(`
                ALTER TABLE events
                ADD COLUMN public_id CHAR(36);
            `);
    }

    // Update existing records with UUID if public_id is NULL or empty
    await pool.query(`
            UPDATE events SET public_id = UUID() WHERE public_id IS NULL OR public_id = '';
        `);

    // Make the column NOT NULL
    await pool.query(`
            ALTER TABLE events
            MODIFY COLUMN public_id CHAR(36) NOT NULL;
        `);

    // Add unique constraint if it doesn't exist
    const [uniqueOnPublicId] = await pool.query(
      "SHOW INDEX FROM events WHERE Column_name = 'public_id' AND Non_unique = 0"
    );
    if (uniqueOnPublicId.length === 0) {
      await pool.query(
        "ALTER TABLE events ADD UNIQUE KEY public_id_unique (public_id)"
      );
    }
  } catch (error) {
    console.log(
      "Column public_id already exists or error occurred:",
      error.message
    );
  }

  // Ensure image_url column exists on older databases
  try {
    const [imageColumns] = await pool.query(
      "SHOW COLUMNS FROM events LIKE 'image_url'"
    );

    if (imageColumns.length === 0) {
      // Column doesn't exist, add it
      await pool.query(`
                ALTER TABLE events
                ADD COLUMN image_url VARCHAR(500);
            `);
      console.log("Added image_url column to events table");
    }
  } catch (error) {
    console.log(
      "Column image_url already exists or error occurred:",
      error.message
    );
  }

  // Add new columns for the updated form fields
  try {
    // Ensure role column exists on users table (backwards compat)
    const [roleCols] = await pool.query("SHOW COLUMNS FROM users LIKE 'role'");
    if (roleCols.length === 0) {
      await pool.query(
        `ALTER TABLE users ADD COLUMN role VARCHAR(30) NOT NULL DEFAULT 'user'`
      );
      console.log("Added role column to users table");
    }
    // Add event_title column
    const [eventTitleColumns] = await pool.query(
      "SHOW COLUMNS FROM events LIKE 'event_title'"
    );
    if (eventTitleColumns.length === 0) {
      await pool.query(
        `ALTER TABLE events ADD COLUMN event_title VARCHAR(255);`
      );
      console.log("Added event_title column to events table");
    }

    // Add event_date column
    const [eventDateColumns] = await pool.query(
      "SHOW COLUMNS FROM events LIKE 'event_date'"
    );
    if (eventDateColumns.length === 0) {
      await pool.query(`ALTER TABLE events ADD COLUMN event_date DATETIME;`);
      console.log("Added event_date column to events table");
    }

    // Add club_id column
    const [clubIdColumns] = await pool.query(
      "SHOW COLUMNS FROM events LIKE 'club_id'"
    );
    if (clubIdColumns.length === 0) {
      await pool.query(`ALTER TABLE events ADD COLUMN club_id VARCHAR(100);`);
      console.log("Added club_id column to events table");
    }

    // Add event_location column
    const [eventLocationColumns] = await pool.query(
      "SHOW COLUMNS FROM events LIKE 'event_location'"
    );
    if (eventLocationColumns.length === 0) {
      await pool.query(
        `ALTER TABLE events ADD COLUMN event_location VARCHAR(255);`
      );
      console.log("Added event_location column to events table");
    }

    // Add category_id column
    const [categoryIdColumns] = await pool.query(
      "SHOW COLUMNS FROM events LIKE 'category_id'"
    );
    if (categoryIdColumns.length === 0) {
      await pool.query(
        `ALTER TABLE events ADD COLUMN category_id VARCHAR(100);`
      );
      console.log("Added category_id column to events table");
    }

    // Update legacy columns to allow NULL values
    try {
      await pool.query(
        `ALTER TABLE events MODIFY COLUMN title VARCHAR(255) NULL;`
      );
      console.log("Updated title column to allow NULL values");
    } catch (error) {
      console.log(
        "Title column already allows NULL or error occurred:",
        error.message
      );
    }
  } catch (error) {
    console.log("Error adding new columns:", error.message);
  }

  // Ensure there is at least one superadmin in the dedicated table. Do not
  // keep superadmins as rows in the `users` table (users should only contain students/users).
  try {
    const SUPER_EMAIL = process.env.SUPER_ADMIN_EMAIL;
    const SUPER_PW = process.env.SUPER_ADMIN_PASSWORD;
    const SUPER_NAME = process.env.SUPER_ADMIN_NAME || "superadmin";
    if (SUPER_EMAIL && SUPER_PW) {
      const pwHash = await hashPassword(SUPER_PW);
      // Insert or update in super_admins table directly
      const [sa] = await pool.query(
        "SELECT admin_id FROM super_admins WHERE admin_email = ? LIMIT 1",
        [SUPER_EMAIL]
      );
      if (Array.isArray(sa) && sa.length > 0) {
        await pool.query(
          "UPDATE super_admins SET admin_name = ?, admin_password = ? WHERE admin_id = ?",
          [SUPER_NAME, pwHash, sa[0].admin_id]
        );
        console.log("Updated super_admins entry for", SUPER_EMAIL);
      } else {
        await pool.query(
          "INSERT INTO super_admins (admin_name, admin_email, admin_password) VALUES (?, ?, ?)",
          [SUPER_NAME, SUPER_EMAIL, pwHash]
        );
        console.log("Created super_admins entry for", SUPER_EMAIL);
      }
    }

    // If no superadmins exist at all, create a default dev superadmin in super_admins
    const [existingSa] = await pool.query(
      "SELECT admin_id FROM super_admins LIMIT 1"
    );
    if (Array.isArray(existingSa) && existingSa.length === 0) {
      const devEmail = "admin@gmail.com";
      const devPw = "admin@123";
      const devName = "Admin";
      try {
        const pwHash = await hashPassword(devPw);
        await pool.query(
          "INSERT INTO super_admins (admin_name, admin_email, admin_password) VALUES (?, ?, ?)",
          [devName, devEmail, pwHash]
        );
        console.log(
          "Created default dev superadmin in super_admins:",
          devEmail
        );
      } catch (err) {
        console.log(
          "Failed to create default super_admins entry:",
          err.message
        );
      }
    }
  } catch (err) {
    console.log("Super admin creation/ensure skipped or failed:", err.message);
  }

  // Migrate any legacy users with role 'superadmin' or 'club' into their
  // respective tables. Do not delete the original users to avoid FK issues;
  // instead mark them as migrated so they won't be treated as normal users.
  try {
    // Migrate superadmins
    const [legacySupers] = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE role = 'superadmin'"
    );
    for (const s of legacySupers) {
      try {
        const [exists] = await pool.query(
          "SELECT admin_id FROM super_admins WHERE admin_email = ? LIMIT 1",
          [s.email]
        );
        if (Array.isArray(exists) && exists.length > 0) {
          await pool.query(
            "UPDATE super_admins SET admin_name = ?, admin_password = ? WHERE admin_id = ?",
            [s.name, s.password_hash, exists[0].admin_id]
          );
        } else {
          await pool.query(
            "INSERT INTO super_admins (admin_name, admin_email, admin_password) VALUES (?, ?, ?)",
            [s.name || "migrated_admin", s.email, s.password_hash]
          );
        }
        // Mark original user as migrated to avoid being treated as a regular user
        await pool.query(
          "UPDATE users SET role = 'migrated_superadmin' WHERE id = ?",
          [s.id]
        );
        await pool.query(
          "INSERT INTO event_logs (action_type, description) VALUES (?, ?)",
          [
            "migrate",
            `Migrated superadmin ${s.email} (users.id=${s.id}) into super_admins table`,
          ]
        );
      } catch (inner) {
        console.log("Failed to migrate superadmin", s.email, inner.message);
      }
    }

    // Migrate clubs that were mistakenly created in users table (role = 'club')
    const [legacyClubs] = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE role = 'club'"
    );
    for (const c of legacyClubs) {
      try {
        const [exists] = await pool.query(
          "SELECT club_id FROM clubs WHERE club_email = ? LIMIT 1",
          [c.email]
        );
        if (Array.isArray(exists) && exists.length > 0) {
          await pool.query(
            "UPDATE clubs SET club_name = ?, club_password = ? WHERE club_id = ?",
            [c.name || "migrated_club", c.password_hash, exists[0].club_id]
          );
        } else {
          await pool.query(
            "INSERT INTO clubs (club_name, club_email, club_password) VALUES (?, ?, ?)",
            [c.name || "migrated_club", c.email, c.password_hash]
          );
        }
        // Mark original user as migrated
        await pool.query(
          "UPDATE users SET role = 'migrated_club' WHERE id = ?",
          [c.id]
        );
        await pool.query(
          "INSERT INTO event_logs (action_type, description) VALUES (?, ?)",
          [
            "migrate",
            `Migrated club ${c.email} (users.id=${c.id}) into clubs table`,
          ]
        );
      } catch (inner) {
        console.log("Failed to migrate club", c.email, inner.message);
      }
    }
  } catch (err) {
    console.log("Migration of legacy users skipped or failed:", err.message);
  }

  // Now remove any non-user rows from `users` as requested (keep only role='user')
  try {
    // Backup count for logging
    const [counts] = await pool.query(
      "SELECT COUNT(*) AS total, SUM(role <> 'user') AS to_delete FROM users"
    );
    if (Array.isArray(counts) && counts.length > 0) {
      console.log(
        `Users table: total=${counts[0].total}, non-user rows to delete=${counts[0].to_delete}`
      );
    }

    // Delete rows where role is present and not 'user'
    await pool.query(
      "DELETE FROM users WHERE role IS NOT NULL AND role != 'user'"
    );
    await pool.query(
      "INSERT INTO event_logs (action_type, description) VALUES (?, ?)",
      [
        "cleanup",
        "Deleted non-user rows from users table (removed roles other than 'user')",
      ]
    );
    console.log("Removed non-user rows from users table");
  } catch (err) {
    console.log("Failed to cleanup non-user rows:", err.message);
  }

  // Ensure users table matches the strict schema required by the user.
  try {
    // Rename legacy columns if present: id -> user_id, name -> user_name, email -> user_email, password_hash -> user_password
    const [idCol] = await pool.query("SHOW COLUMNS FROM users LIKE 'id'");
    if (idCol.length > 0) {
      await pool.query(
        "ALTER TABLE users CHANGE COLUMN id user_id INT NOT NULL AUTO_INCREMENT"
      );
      console.log("Renamed users.id -> users.user_id");
    }

    const [nameCol] = await pool.query("SHOW COLUMNS FROM users LIKE 'name'");
    if (nameCol.length > 0) {
      await pool.query(
        "ALTER TABLE users CHANGE COLUMN name user_name VARCHAR(100) NOT NULL"
      );
      console.log("Renamed users.name -> users.user_name");
    }

    const [emailCol] = await pool.query("SHOW COLUMNS FROM users LIKE 'email'");
    if (emailCol.length > 0) {
      await pool.query(
        "ALTER TABLE users CHANGE COLUMN email user_email VARCHAR(120) NOT NULL"
      );
      try {
        await pool.query(
          "ALTER TABLE users ADD UNIQUE KEY user_email_unique (user_email)"
        );
      } catch {
        // ignore if unique already exists
      }
      console.log("Renamed users.email -> users.user_email");
    }

    const [pwCol] = await pool.query(
      "SHOW COLUMNS FROM users LIKE 'password_hash'"
    );
    if (pwCol.length > 0) {
      await pool.query(
        "ALTER TABLE users CHANGE COLUMN password_hash user_password VARCHAR(255) NOT NULL"
      );
      console.log("Renamed users.password_hash -> users.user_password");
    }

    // Drop role column if still present
    try {
      const [roleCols2] = await pool.query(
        "SHOW COLUMNS FROM users LIKE 'role'"
      );
      if (roleCols2.length > 0) {
        await pool.query("ALTER TABLE users DROP COLUMN role");
        console.log("Dropped role column from users table");
      }
    } catch (e) {
      console.log("Could not drop role column:", e.message);
    }

    // Ensure profile columns exist
    const [phoneCol] = await pool.query(
      "SHOW COLUMNS FROM users LIKE 'user_phone'"
    );
    if (phoneCol.length === 0) {
      // Add with a safe default for existing rows
      await pool.query(
        "ALTER TABLE users ADD COLUMN user_phone CHAR(10) NOT NULL DEFAULT '0000000000'"
      );
      // Add a CHECK constraint for 10 digits (MySQL supports CHECK as of 8+)
      try {
        await pool.query(
          "ALTER TABLE users ADD CONSTRAINT chk_user_phone CHECK (user_phone REGEXP '^[0-9]{10}$')"
        );
      } catch {
        // Ignore if the server/version doesn't support adding named check constraints
      }
      console.log("Added user_phone column to users table");
    }

    const [deptCol] = await pool.query(
      "SHOW COLUMNS FROM users LIKE 'department'"
    );
    if (deptCol.length === 0) {
      await pool.query(
        "ALTER TABLE users ADD COLUMN department VARCHAR(100) NULL"
      );
      console.log("Added department column to users table");
    }

    const [yearCol] = await pool.query(
      "SHOW COLUMNS FROM users LIKE 'year_of_study'"
    );
    if (yearCol.length === 0) {
      await pool.query(
        "ALTER TABLE users ADD COLUMN year_of_study TINYINT NOT NULL DEFAULT 1"
      );
      try {
        await pool.query(
          "ALTER TABLE users ADD CONSTRAINT chk_year_of_study CHECK (year_of_study BETWEEN 1 AND 4)"
        );
      } catch {
        // Ignore when check constraints not supported or already present
      }
      console.log("Added year_of_study column to users table");
    }
  } catch (err) {
    console.log("Error enforcing users schema:", err.message);
  }

  // Remove legacy columns (description, club_name, date, time)
  try {
    // Check if description column exists and drop it
    const [descColumns] = await pool.query(
      "SHOW COLUMNS FROM events LIKE 'description'"
    );
    if (descColumns.length > 0) {
      await pool.query(`ALTER TABLE events DROP COLUMN description;`);
      console.log("Removed description column from events table");
    }

    // Check if club_name column exists and drop it
    const [clubNameColumns] = await pool.query(
      "SHOW COLUMNS FROM events LIKE 'club_name'"
    );
    if (clubNameColumns.length > 0) {
      await pool.query(`ALTER TABLE events DROP COLUMN club_name;`);
      console.log("Removed club_name column from events table");
    }

    // Check if date column exists and drop it
    const [dateColumns] = await pool.query(
      "SHOW COLUMNS FROM events LIKE 'date'"
    );
    if (dateColumns.length > 0) {
      await pool.query(`ALTER TABLE events DROP COLUMN date;`);
      console.log("Removed date column from events table");
    }

    // Check if time column exists and drop it
    const [timeColumns] = await pool.query(
      "SHOW COLUMNS FROM events LIKE 'time'"
    );
    if (timeColumns.length > 0) {
      await pool.query(`ALTER TABLE events DROP COLUMN time;`);
      console.log("Removed time column from events table");
    }
  } catch (error) {
    console.log("Error removing legacy columns:", error.message);
  }
}

export function getPool() {
  if (!pool) {
    throw new Error(
      "Database pool not initialized. Call initDatabase() first."
    );
  }
  return pool;
}
