
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Simple mock user that always works
const mockUser = {
  id: "local-user-123",
  claims: { sub: "local-user-123" }
};

// Auth middleware that always passes through
const bypassAuth = (req: any, res: any, next: any) => {
  req.user = mockUser;
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  console.log("🔓 Auth bypass enabled for local development");

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", auth: "bypassed", user: mockUser.id });
  });

  // Game Routes - HARDCODED paths
  app.get("/api/game/load", bypassAuth, async (req, res) => {
    try {
      const userId = mockUser.id;
      console.log("Loading game for user:", userId);
      
      const state = await storage.getGameState(userId);
      
      if (!state) {
        console.log("No saved game found, returning 404");
        return res.status(404).json({ message: "No saved game found" });
      }
      
      res.json(state);
    } catch (err) {
      console.error("Error loading game:", err);
      res.status(500).json({ message: "Server error loading game" });
    }
  });

  app.post("/api/game/save", bypassAuth, async (req, res) => {
    try {
      const userId = mockUser.id;
      console.log("Saving game for user:", userId);
      console.log("Request body:", req.body);
      
      // Simple validation - just check it's an object
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: "Invalid data: expected object" });
      }
      
      const saved = await storage.saveGameState(userId, req.body);
      
      res.json(saved);
    } catch (err) {
      console.error("Error saving game:", err);
      res.status(500).json({ message: "Server error saving game" });
    }
  });

  console.log("✅ Routes registered:");
  console.log("  GET /api/health");
  console.log("  GET /api/game/load");
  console.log("  POST /api/game/save");

  return httpServer;
}