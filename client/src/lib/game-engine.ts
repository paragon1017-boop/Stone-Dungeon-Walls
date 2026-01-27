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

export interface Ability {
  id: string;
  name: string;
  mpCost: number;
  type: 'attack' | 'heal' | 'buff';
  power: number; // multiplier or base value
  description: string;
}

export interface Player extends Entity {
  job: string;
  xp: number;
  level: number;
}

// Combat abilities for each job
export const JOB_ABILITIES: Record<string, Ability[]> = {
  Fighter: [
    { id: 'attack', name: 'Attack', mpCost: 0, type: 'attack', power: 1.0, description: 'Basic attack' },
    { id: 'power_strike', name: 'Power Strike', mpCost: 0, type: 'attack', power: 2.0, description: 'Powerful attack (2x damage)' },
    { id: 'defend', name: 'Defend', mpCost: 0, type: 'buff', power: 0.5, description: 'Reduce incoming damage' },
  ],
  Mage: [
    { id: 'attack', name: 'Attack', mpCost: 0, type: 'attack', power: 1.0, description: 'Basic attack' },
    { id: 'fireball', name: 'Fireball', mpCost: 8, type: 'attack', power: 3.0, description: 'Powerful fire spell (3x damage)' },
    { id: 'heal', name: 'Heal', mpCost: 6, type: 'heal', power: 25, description: 'Restore 25 HP to a party member' },
  ],
  Monk: [
    { id: 'attack', name: 'Attack', mpCost: 0, type: 'attack', power: 1.0, description: 'Basic attack' },
    { id: 'chi_strike', name: 'Chi Strike', mpCost: 4, type: 'attack', power: 1.8, description: 'Focused strike (1.8x damage)' },
    { id: 'meditate', name: 'Meditate', mpCost: 0, type: 'heal', power: 15, description: 'Restore 15 HP to self' },
  ],
};

export function getAbilitiesForJob(job: string): Ability[] {
  return JOB_ABILITIES[job] || JOB_ABILITIES['Fighter'];
}

// Scale ability power based on character level
export function getScaledAbilityPower(ability: Ability, level: number): number {
  // Base power increases by 15% per level after level 1
  const levelMultiplier = 1 + (level - 1) * 0.15;
  return Math.floor(ability.power * levelMultiplier * 10) / 10;
}

// XP required for each level (exponential growth)
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Calculate stat bonuses per level
export function getLevelUpStats(job: string): { hp: number, mp: number, attack: number, defense: number } {
  switch (job) {
    case 'Fighter':
      return { hp: 10, mp: 0, attack: 3, defense: 2 };
    case 'Mage':
      return { hp: 4, mp: 8, attack: 1, defense: 1 };
    case 'Monk':
      return { hp: 8, mp: 2, attack: 2, defense: 1 };
    default:
      return { hp: 6, mp: 2, attack: 2, defense: 1 };
  }
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
      { id: 'p1', name: 'Bork', job: 'Fighter', hp: 50, maxHp: 50, mp: 0, maxMp: 0, attack: 12, defense: 8, color: '#e74c3c', xp: 0, level: 1 },
      { id: 'p2', name: 'Pyra', job: 'Mage', hp: 30, maxHp: 30, mp: 40, maxMp: 40, attack: 4, defense: 4, color: '#9b59b6', xp: 0, level: 1 },
      { id: 'p3', name: 'Milo', job: 'Monk', hp: 45, maxHp: 45, mp: 10, maxMp: 10, attack: 10, defense: 6, color: '#f1c40f', xp: 0, level: 1 },
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
  // Easy monsters for level 1
  { id: 'm1', name: 'Slimy Ooze', hp: 20, maxHp: 20, mp: 0, maxMp: 0, attack: 5, defense: 2, xpValue: 10, color: '#2ecc71', image: '/assets/monsters/ooze.png' },
  { id: 'm2', name: 'Giant Rat', hp: 15, maxHp: 15, mp: 0, maxMp: 0, attack: 4, defense: 1, xpValue: 8, color: '#8B4513', image: '/assets/monsters/rat.png' },
  { id: 'm3', name: 'Cave Bat', hp: 12, maxHp: 12, mp: 0, maxMp: 0, attack: 3, defense: 1, xpValue: 6, color: '#4a0080', image: '/assets/monsters/bat.png' },
  { id: 'm4', name: 'Poison Mushroom', hp: 18, maxHp: 18, mp: 0, maxMp: 0, attack: 4, defense: 2, xpValue: 9, color: '#e74c3c', image: '/assets/monsters/mushroom.png' },
  { id: 'm5', name: 'Dungeon Spider', hp: 22, maxHp: 22, mp: 0, maxMp: 0, attack: 6, defense: 2, xpValue: 12, color: '#2c3e50', image: '/assets/monsters/spider.png' },
  { id: 'm6', name: 'Small Goblin', hp: 25, maxHp: 25, mp: 0, maxMp: 0, attack: 6, defense: 3, xpValue: 14, color: '#27ae60', image: '/assets/monsters/goblin.png' },
  { id: 'm7', name: 'Slime Warrior', hp: 35, maxHp: 35, mp: 0, maxMp: 0, attack: 8, defense: 3, xpValue: 20, color: '#9b59b6', image: '/assets/monsters/slime.png' },
  // Harder monsters for later floors
  { id: 'm8', name: 'Orc Warrior', hp: 60, maxHp: 60, mp: 0, maxMp: 0, attack: 12, defense: 5, xpValue: 40, color: '#27ae60', image: '/assets/monsters/orc.png' },
  { id: 'm9', name: 'Skeleton', hp: 40, maxHp: 40, mp: 0, maxMp: 0, attack: 10, defense: 4, xpValue: 25, color: '#bdc3c7' },
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
