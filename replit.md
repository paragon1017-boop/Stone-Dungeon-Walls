# Shining in the Darkness - Web Edition

## Overview

A retro-styled first-person dungeon crawler RPG inspired by classic games like "Shining in the Darkness." Players explore procedurally generated dungeons from a first-person perspective using raycasting rendering, engage in turn-based combat with monsters, manage a party of characters with different classes (Fighter, Mage, Monk), and collect equipment with various rarity tiers. The game features persistent save states backed by PostgreSQL and authentication via Replit Auth.

## Recent Changes (Feb 2026)

### Combat System
- Max **3 monsters** per encounter in single-row formation for large sprite display
- Monster sprite sizes: 1 monster=580px, 2=500px, 3=420px on large screens
- Fullscreen combat with enhanced atmospheric effects

### Performance Optimizations
- **Smooth Movement Interpolation**: Camera slides smoothly between tiles at 20 tiles/sec using requestAnimationFrame, eliminating choppy tile-to-tile snapping
- **Fast Key Response**: Movement delay reduced to 100ms between moves (was 150ms), initial delay 120ms (was 200ms)
- **Canvas Dirty Checking**: DungeonView skips redundant redraws when position/direction/level unchanged; uses alpha:false context for GPU performance
- **Atmospheric Effects Optimized**: Reduced dust particles from 15 to 8, added will-change CSS hints, removed blur filters from slime decorations, slowed animation cycles (dust 15-27s, fog 30-35s)

### Expanded Abilities (4 per Class)
- **Fighter**: Strike, Heavy Blow, Shield Bash, **Provoke** (forces enemy to attack you)
- **Mage**: Fire, Ice Shard (40% freeze chance), Lightning, Heal
- **Monk**: Palm Strike, Ki Blast, Meditate, **Stealth** (35% dodge chance)

### Status Effect System
- **Freeze**: Affected monster skips their turn (from Ice Shard)
- **Taunt/Provoke**: Forces enemy to attack provoker, -25% attack for 2 turns
- **Stealth**: Party member gains persistent dodge chance
- **Burn**: Fire DoT from equipment set bonuses
- **Slow**: Speed reduction from ice equipment effects
- All effects properly cleared on combat end

### Immersive Fullscreen Combat
- Combat now triggers fullscreen mode with enhanced atmospheric effects
- Larger monster sprites (up to 400px) for dramatic battles
- Enhanced vignette effect and pulsing red border during combat
- Torch glow intensifies during battle
- Compact party stats overlay shows HP/MP with current turn indicator
- FLEE button (ESC key) to exit combat
- Minimap and side panels hidden during combat for immersion

### Massive Equipment Expansion (v2)
- Expanded from 6 to 11 equipment slots: weapon, shield (Fighter), armor, helmet, gloves, boots, necklace, ring1, ring2, relic (Mage), offhand (Monk)
- **18 thematic equipment sets** with **519 total items** (486 set items + 33 starter/common items)
- Each set has 9 pieces per class (27 items per set), allowing full 9-piece set bonuses
- Equipment data now stored in `client/src/lib/equipment-data.ts` for maintainability

#### Starter Sets (Uncommon - Early Game)
  - **Warrior's Might** - Defensive Evolution (+Defense, +HP)
  - **Hunter's Focus** - Speed & Critical hits (+Speed, +Crit, +Penetration)
  - **Brute Force** - Raw Attack Power (+Attack, +Defense Penetration)
  - **Elemental Apprentice** - Mage elemental magic (+MP, +Spell Power)
  - **Arcane Scholar** - Spell Efficiency (+Spell Power, +MP)
  - **Battle Mage** - Hybrid Fighter (+Attack, +MP, +Lifesteal at 9p)
  - **Martial Disciple** - Balanced martial arts (+Attack, +Speed, +Crit at 9p)
  - **Shadow Stalker** - Speed & Evasion (+Speed, +Evasion, +Crit Damage)
  - **Iron Body** - Defense & Sustain (+HP, +Defense, +On-hit Heal at 9p)

#### Advanced Sets (Epic - Endgame)
  - **Blade Dancer** - Maximum Damage (+Attack, +Crit Chance, +Crit Damage)
  - **Bulwark Sentinel** - Ultimate Defense (+Defense, +HP, +Counter at 9p)
  - **Vampiric Embrace** - Lifesteal (+Lifesteal up to 30%, +Attack)
  - **Wind Dancer** - Speed & Evasion (+Speed up to 60%, +Evasion up to 35%)
  - **Riposte** - Counter Attacks (+Counter up to 50%, +Defense)
  - **Frozen Wasteland** - Ice Control (+Attack, +Slow Effect up to 50%)
  - **Inferno Blaze** - Fire DoT (+Attack, +Burn Damage up to 25/turn)
  - **Storm Caller** - Lightning Chain (+Attack, +Chain Damage up to 75%)
  - **Earthen Colossus** - Earth/Defense (+Defense up to 70%, +HP up to 40%)

#### Set Bonus Mechanics
- **Percentage bonuses**: Attack%, Defense%, HP%, MP%, Speed%
- **Critical system**: Crit chance (10-25%), Crit damage (25-50%)
- **Evasion**: Dodge chance (10-35%)
- **Lifesteal**: Heal % of damage dealt (10-30%)
- **Counter-attacks**: Chance to counter when hit (15-50%)
- **Defense Penetration**: Ignore % of enemy defense (10-25%)
- **Elemental effects**: Ice slow (10-50%), Fire burn (5-25 DoT), Lightning chain (25-75%)
- **On-hit healing**: Fixed HP per hit (Iron Body 9p: 3 HP)

#### Additional Features
- 'legendary' rarity tier for top-tier items
- Class-specific slots: Shield (Fighter only), Relic (Mage only), Offhand (Monk only)
- Ring slot has two positions (ring1, ring2) for dual ring equipping
- Old saves are automatically migrated to new equipment format

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