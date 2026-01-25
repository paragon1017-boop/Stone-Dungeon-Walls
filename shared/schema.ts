import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
// Import auth models to ensure they are included in the schema
import { users } from "./models/auth";
export * from "./models/auth";

export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Links to auth.users.id
  data: jsonb("data").notNull(), // Stores the entire game state (party, dungeon, etc.)
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
