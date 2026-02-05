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
    // Check if save exists for this user
    const existing = await this.getGameState(userId);
    
    if (existing) {
      // Update existing save
      await db
        .update(gameStates)
        .set({
          ...state,
          userId,
        })
        .where(eq(gameStates.id, existing.id));
      
      // Return updated record
      const updated = await this.getGameState(userId);
      if (!updated) throw new Error("Failed to update game state");
      return updated;
    } else {
      // Create new save
      const result = await db
        .insert(gameStates)
        .values({
          ...state,
          userId,
        });
      
      // Get the last inserted ID
      const lastId = result.lastInsertRowid;
      
      // Fetch the created record
      const [created] = await db
        .select()
        .from(gameStates)
        .where(eq(gameStates.id, Number(lastId)));
      
      if (!created) throw new Error("Failed to create game state");
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
