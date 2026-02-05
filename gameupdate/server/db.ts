import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

// Use SQLite for local development (no PostgreSQL required)
const sqlite = new Database("game.db");
export const db = drizzle(sqlite, { schema });

// For compatibility with existing code
export const pool = { query: () => Promise.resolve({ rows: [] }) };
