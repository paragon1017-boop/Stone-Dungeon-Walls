import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Simple users table for SQLite (replace auth with simple version)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const gameStates = sqliteTable("game_states", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  data: text("data", { mode: "json" }).notNull(),
  lastSavedAt: text("last_saved_at").notNull(),
});

export const gameStatesRelations = relations(gameStates, ({ one }) => ({
  user: one(users, {
    fields: [gameStates.userId],
    references: [users.id],
  }),
}));

export const insertGameStateSchema = createInsertSchema(gameStates).pick({
  data: true,
  lastSavedAt: true,
});

export type GameState = typeof gameStates.$inferSelect;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;