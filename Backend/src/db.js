import "./loadEnv.js";

import mysql from "mysql2/promise";

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
