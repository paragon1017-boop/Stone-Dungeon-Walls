import { db } from "./db";
import {
  gameStates,
  type GameState,
  type InsertGameState,
} from "@shared/schema";
import { eq } from "drizzle-orm";
// Re-export auth storage
export { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  getGameState(userId: string): Promise<GameState | undefined>;
  saveGameState(userId: string, state: InsertGameState): Promise<GameState>;
}

export class DatabaseStorage implements IStorage {
  async getGameState(userId: string): Promise<GameState | undefined> {
    const [state] = await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.userId, userId));
    return state;
  }

  async saveGameState(userId: string, state: InsertGameState): Promise<GameState> {
    const [saved] = await db
      .insert(gameStates)
      .values({ ...state, userId })
      .onConflictDoUpdate({
        target: [gameStates.id], // Note: ideally we'd constraint by userId, but for now we assume 1 row per user or manage it via ID. 
        // Actually, let's just use simple update logic if exists, but schema definition above didn't enforce unique userId.
        // Let's check first to keep it simple for this MVP.
        set: state,
      })
      .returning();
    
    // Better upsert logic for single save slot
    const existing = await this.getGameState(userId);
    if (existing) {
       const [updated] = await db.update(gameStates)
         .set(state)
         .where(eq(gameStates.id, existing.id))
         .returning();
       return updated;
    } else {
       const [created] = await db.insert(gameStates)
         .values({...state, userId})
         .returning();
       return created;
    }
  }
}

export const storage = new DatabaseStorage();
