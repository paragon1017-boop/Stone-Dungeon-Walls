import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Game Routes
  app.get(api.game.load.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const state = await storage.getGameState(userId);
    if (!state) {
      return res.status(404).json({ message: "No saved game found" });
    }
    res.json(state);
  });

  app.post(api.game.save.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.game.save.input.parse(req.body);
      const saved = await storage.saveGameState(userId, input);
      res.json(saved);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  });

  return httpServer;
}
