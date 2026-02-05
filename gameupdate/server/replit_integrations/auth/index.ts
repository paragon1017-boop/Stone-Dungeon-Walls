import session from "express-session";
import { setupAuth, isAuthenticated, getSession as getReplitSession } from "./replitAuth";

export { setupAuth, isAuthenticated };
export { authStorage, type IAuthStorage } from "./storage";
export { registerAuthRoutes } from "./routes";

// Check if running locally
const isLocalDev = !process.env.REPL_ID;

// Mock session for local development (uses MemoryStore instead of PostgreSQL)
const getLocalSession = () => {
  return session({
    secret: "local-dev-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Allow HTTP for local dev
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  });
};

// Export appropriate session handler
export const getSession = isLocalDev ? getLocalSession : getReplitSession;
