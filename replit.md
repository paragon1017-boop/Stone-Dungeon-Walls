# Shining in the Darkness - Web Edition

## Overview

A retro-styled first-person dungeon crawler RPG inspired by classic games like "Shining in the Darkness." Players explore procedurally generated dungeons from a first-person perspective using raycasting rendering, engage in turn-based combat with monsters, manage a party of characters with different classes (Fighter, Mage, Monk), and collect equipment with various rarity tiers. The game features persistent save states backed by PostgreSQL and authentication via Replit Auth.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state synchronization, React useState for local game state
- **Styling**: Tailwind CSS with custom CSS variables for theming (dark dungeon aesthetic with amber/orange accents)
- **UI Components**: shadcn/ui component library built on Radix UI primitives (47+ components available)
- **Game Rendering**: Canvas-based raycasting renderer in `DungeonView.tsx` for first-person dungeon exploration
- **Key Game Logic**: Core engine in `client/src/lib/game-engine.ts` handles combat, equipment, character progression, and dungeon generation

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **Entry Point**: `server/index.ts` creates HTTP server and registers routes
- **Static Serving**: Production builds served from `dist/public`, development uses Vite middleware

### Data Storage
- **Database**: PostgreSQL (required - must provision via Replit)
- **ORM**: Drizzle ORM with drizzle-zod for type-safe schema definitions
- **Schema Location**: `shared/schema.ts` for game tables, `shared/models/auth.ts` for auth tables
- **Key Tables**:
  - `users` - User profiles synced from Replit Auth (required for auth)
  - `sessions` - Session storage for authentication (required for auth)
  - `game_states` - JSON blob storing complete game state per user (party, dungeon, inventory)

### Authentication
- **Provider**: Replit Auth using OpenID Connect
- **Implementation**: Passport.js with custom OIDC strategy in `server/replit_integrations/auth/`
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple with 1-week TTL
- **Protected Routes**: `isAuthenticated` middleware guards game API endpoints

### Build System
- **Development**: `npm run dev` runs Vite dev server with HMR through Express
- **Production**: `npm run build` uses custom script that builds client with Vite and bundles server with esbuild
- **Database Migrations**: `npm run db:push` uses Drizzle Kit to sync schema

## External Dependencies

### Database
- **PostgreSQL**: Required for user data, sessions, and game state persistence. Must set `DATABASE_URL` environment variable. Provision through Replit's database feature.

### Authentication
- **Replit Auth (OIDC)**: Handles user authentication via OpenID Connect. Requires `REPL_ID` (auto-set by Replit) and `SESSION_SECRET` environment variable.

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod`: Database ORM and schema validation
- `express-session` / `connect-pg-simple`: Session management with PostgreSQL store
- `openid-client` / `passport`: OIDC authentication flow
- `@tanstack/react-query`: Server state management
- `react-use`: Keyboard hooks for game movement controls
- `zod`: Runtime type validation for API inputs/outputs

### Assets
- Monster sprites stored in `client/src/assets/monsters/` (29 unique monster images)
- Dungeon textures in `public/assets/textures/` (wall, floor, door images)
- Custom fonts: Cinzel (headings) and Rajdhani (body text) loaded from Google Fonts