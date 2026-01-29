# Shining in the Darkness - Web Edition

A retro-styled first-person dungeon crawler RPG inspired by classic games like "Shining in the Darkness."

## Features

- **First-Person 3D Dungeon Exploration** - Raycasting-based renderer
- **Turn-Based Combat** - Strategic battles with speed-based turn order
- **Character Classes** - Fighter, Mage, and Monk with unique abilities  
- **Equipment System** - 6 equipment slots with rarity tiers and enhancement system
- **Procedural Dungeons** - Maze-generation algorithm creates unique layouts
- **Persistent Saves** - PostgreSQL-backed game state storage
- **Authentication** - Secure login via Replit Auth

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS for styling
- shadcn/ui component library
- TanStack React Query for state management
- Wouter for routing

### Backend
- Node.js + Express
- PostgreSQL database
- Drizzle ORM
- Replit Auth (OpenID Connect)
- Session management with connect-pg-simple

## Project Structure

```
├── client/               # React frontend
│   ├── index.html
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and game engine
│       ├── pages/        # Route pages
│       └── assets/       # Static assets
├── server/               # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── replit_integrations/auth/  # Authentication
├── shared/               # Shared types and schemas
│   ├── schema.ts         # Database schema
│   ├── routes.ts         # API route definitions
│   └── models/           # Data models
└── script/               # Build scripts
    └── build.ts          # Production build script
```

## Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Replit Auth credentials (or modify for different auth)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
REPL_ID=your-repl-id (for Replit Auth)
ISSUER_URL=https://replit.com/oidc
```

3. Push database schema:
```bash
npm run db:push
```

4. Run development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## Game Controls

- **Arrow Keys / WASD** - Move forward/backward, turn left/right
- **M** - Toggle minimap
- **E** - Toggle equipment panel
- **Space** - Interact (open doors, use ladders)

### Combat
- Click abilities to use them
- Click "Attack" for basic attack
- Click "Run" to attempt escape
- Use potions from inventory during battle

## Monster Images

The game references 29 monster sprite images that should be placed in:
```
client/src/assets/monsters/
```

Required images (PNG format):
- cave_bat.png, giant_rat.png, poison_mushroom.png
- slimy_ooze.png, giant_beetle.png, cave_crawler.png
- kobold.png, fire_imp.png, shadow_wisp.png
- dungeon_spider.png, small_goblin.png, zombie.png
- slime_warrior.png, skeleton.png, harpy.png
- mummy.png, werewolf.png, orc_warrior.png
- troll.png, dark_knight.png, gargoyle.png
- minotaur.png, wraith.png, golem.png
- basilisk.png, death_knight.png, lich.png
- demon.png, dragon.png

The game will work without these images, but combat encounters won't display monster sprites.

## Database Schema

### Tables
- `users` - User profiles from authentication
- `sessions` - Session storage for auth
- `game_states` - Persisted game saves (JSON blob per user)

## API Endpoints

- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login
- `GET /api/logout` - Logout
- `GET /api/game/current` - Load game state
- `POST /api/game/current` - Save game state

## Development

### Type Checking
```bash
npm run check
```

### Database Migrations
```bash
npm run db:push
```

## License

MIT

## Credits

Inspired by "Shining in the Darkness" (1991) by Sega.
Built with modern web technologies for a retro gaming experience.
