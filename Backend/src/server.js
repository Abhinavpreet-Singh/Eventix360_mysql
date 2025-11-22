/* eslint-env node */
/* global process */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./db.js";
import authRouter from "./routes/auth.js";
import eventsRouter from "./routes/events.js";
import clubsRouter from "./routes/clubs.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/events", eventsRouter);
app.use("/api/clubs", clubsRouter);

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Auth server listening on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
