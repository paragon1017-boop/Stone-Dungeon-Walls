// Types and Logic for the Dungeon Crawler

export type Direction = 0 | 1 | 2 | 3; // N, E, S, W
export const NORTH = 0;
export const EAST = 1;
export const SOUTH = 2;
export const WEST = 3;

export interface Entity {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  image?: string;
  color: string;
}

export interface Player extends Entity {
  job: string;
}

export interface Monster extends Entity {
  xpValue: number;
}

export interface Tile {
  type: 'floor' | 'wall' | 'door';
  texture?: string;
  event?: 'monster' | 'treasure' | 'stairs';
}

export interface GameData {
  party: Player[];
  x: number;
  y: number;
  dir: Direction;
  map: number[][]; // 0 = floor, 1 = wall
  inventory: string[];
  gold: number;
  level: number; // Dungeon Floor
}

// Initial State Factory
export function createInitialState(): GameData {
  return {
    party: [
      { id: 'p1', name: 'Bork', job: 'Fighter', hp: 50, maxHp: 50, mp: 0, maxMp: 0, attack: 12, defense: 8, color: '#e74c3c' },
      { id: 'p2', name: 'Pyra', job: 'Mage', hp: 30, maxHp: 30, mp: 40, maxMp: 40, attack: 4, defense: 4, color: '#9b59b6' },
      { id: 'p3', name: 'Milo', job: 'Monk', hp: 45, maxHp: 45, mp: 10, maxMp: 10, attack: 10, defense: 6, color: '#f1c40f' },
    ],
    x: 1,
    y: 1,
    dir: EAST,
    map: generateMaze(32, 32),
    inventory: ['Potion', 'Torch'],
    gold: 0,
    level: 1,
  };
}

// Simple Recursive Backtracker Maze Generation
function generateMaze(width: number, height: number): number[][] {
  const map = Array(height).fill(0).map(() => Array(width).fill(1)); // Fill with walls

  function carve(x: number, y: number) {
    const directions = [
      [0, -2], [0, 2], [-2, 0], [2, 0] // N, S, W, E
    ].sort(() => Math.random() - 0.5);

    directions.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;

      if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && map[ny][nx] === 1) {
        map[ny][nx] = 0;
        map[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    });
  }

  map[1][1] = 0;
  carve(1, 1);
  return map;
}

// Combat Logic Helpers
export const MONSTERS: Monster[] = [
  { id: 'm1', name: 'Slimy Ooze', hp: 20, maxHp: 20, mp: 0, maxMp: 0, attack: 5, defense: 2, xpValue: 10, color: '#2ecc71' },
  { id: 'm2', name: 'Slime Warrior', hp: 35, maxHp: 35, mp: 0, maxMp: 0, attack: 8, defense: 3, xpValue: 20, color: '#9b59b6', image: '/assets/monsters/slime.png' },
  { id: 'm3', name: 'Orc Warrior', hp: 60, maxHp: 60, mp: 0, maxMp: 0, attack: 12, defense: 5, xpValue: 40, color: '#c0392b' },
  { id: 'm4', name: 'Skeleton', hp: 40, maxHp: 40, mp: 0, maxMp: 0, attack: 10, defense: 4, xpValue: 25, color: '#bdc3c7' },
];

export function getRandomMonster(floor: number): Monster {
  // Simple scaling: harder monsters available at higher floors
  const index = Math.floor(Math.random() * Math.min(MONSTERS.length, floor + 2));
  const base = MONSTERS[index];
  return {
    ...base,
    id: crypto.randomUUID(),
    hp: Math.floor(base.hp * (1 + (floor * 0.1))), // 10% buff per floor
    maxHp: Math.floor(base.maxHp * (1 + (floor * 0.1))),
    attack: Math.floor(base.attack * (1 + (floor * 0.1))),
  };
}
