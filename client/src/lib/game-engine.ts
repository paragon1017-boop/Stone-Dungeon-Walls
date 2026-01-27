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

// Equipment System
export type EquipmentSlot = 'weapon' | 'armor' | 'helmet' | 'accessory';

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  attack: number;
  defense: number;
  hp: number;
  mp: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  allowedJobs: string[]; // Which jobs can equip this
  description: string;
}

export interface PlayerEquipment {
  weapon: Equipment | null;
  armor: Equipment | null;
  helmet: Equipment | null;
  accessory: Equipment | null;
}

export interface Player extends Entity {
  job: string;
  xp: number;
  level: number;
  equipment: PlayerEquipment;
}

// Equipment Database
export const EQUIPMENT_DATABASE: Equipment[] = [
  // Weapons
  { id: 'rusty_sword', name: 'Rusty Sword', slot: 'weapon', attack: 3, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'A worn but serviceable blade' },
  { id: 'iron_sword', name: 'Iron Sword', slot: 'weapon', attack: 6, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'A sturdy iron blade' },
  { id: 'steel_sword', name: 'Steel Sword', slot: 'weapon', attack: 10, defense: 1, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'A finely crafted steel blade' },
  { id: 'wooden_staff', name: 'Wooden Staff', slot: 'weapon', attack: 1, defense: 0, hp: 0, mp: 5, rarity: 'common', allowedJobs: ['Mage'], description: 'A simple magical focus' },
  { id: 'crystal_staff', name: 'Crystal Staff', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 12, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Channels magical energy effectively' },
  { id: 'arcane_staff', name: 'Arcane Staff', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 20, rarity: 'rare', allowedJobs: ['Mage'], description: 'Crackling with arcane power' },
  { id: 'brass_knuckles', name: 'Brass Knuckles', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Monk'], description: 'Enhances unarmed strikes' },
  { id: 'iron_fists', name: 'Iron Fists', slot: 'weapon', attack: 7, defense: 1, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Heavy iron knuckle guards' },
  { id: 'chi_gloves', name: 'Chi Gloves', slot: 'weapon', attack: 9, defense: 0, hp: 0, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Channel inner energy into strikes' },
  
  // Armor
  { id: 'leather_vest', name: 'Leather Vest', slot: 'armor', attack: 0, defense: 2, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Monk'], description: 'Basic leather protection' },
  { id: 'chainmail', name: 'Chainmail', slot: 'armor', attack: 0, defense: 5, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Interlocking metal rings' },
  { id: 'plate_armor', name: 'Plate Armor', slot: 'armor', attack: 0, defense: 10, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Heavy steel plates' },
  { id: 'cloth_robe', name: 'Cloth Robe', slot: 'armor', attack: 0, defense: 1, hp: 0, mp: 8, rarity: 'common', allowedJobs: ['Mage'], description: 'Simple enchanted cloth' },
  { id: 'silk_robe', name: 'Silk Robe', slot: 'armor', attack: 0, defense: 2, hp: 0, mp: 15, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Woven with magical thread' },
  { id: 'monk_garb', name: 'Monk Garb', slot: 'armor', attack: 1, defense: 3, hp: 5, mp: 3, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Traditional fighting attire' },
  
  // Helmets
  { id: 'leather_cap', name: 'Leather Cap', slot: 'helmet', attack: 0, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Monk'], description: 'Simple head protection' },
  { id: 'iron_helm', name: 'Iron Helm', slot: 'helmet', attack: 0, defense: 3, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Solid iron helmet' },
  { id: 'wizard_hat', name: 'Wizard Hat', slot: 'helmet', attack: 0, defense: 0, hp: 0, mp: 10, rarity: 'common', allowedJobs: ['Mage'], description: 'Pointed hat of wisdom' },
  { id: 'headband', name: 'Focus Headband', slot: 'helmet', attack: 1, defense: 1, hp: 0, mp: 3, rarity: 'common', allowedJobs: ['Monk'], description: 'Aids concentration' },
  
  // Accessories
  { id: 'power_ring', name: 'Power Ring', slot: 'accessory', attack: 2, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Boosts attack power' },
  { id: 'guard_ring', name: 'Guard Ring', slot: 'accessory', attack: 0, defense: 2, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Boosts defense' },
  { id: 'life_pendant', name: 'Life Pendant', slot: 'accessory', attack: 0, defense: 0, hp: 15, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Increases vitality' },
  { id: 'mana_crystal', name: 'Mana Crystal', slot: 'accessory', attack: 0, defense: 0, hp: 0, mp: 15, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Stores magical energy' },
  { id: 'warriors_medal', name: "Warrior's Medal", slot: 'accessory', attack: 4, defense: 2, hp: 5, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Badge of a true warrior' },
  { id: 'arcane_focus', name: 'Arcane Focus', slot: 'accessory', attack: 2, defense: 0, hp: 0, mp: 20, rarity: 'rare', allowedJobs: ['Mage'], description: 'Amplifies magical power' },
  { id: 'zen_stone', name: 'Zen Stone', slot: 'accessory', attack: 3, defense: 1, hp: 5, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Perfect inner balance' },
];

// Get equipment by ID
export function getEquipmentById(id: string): Equipment | undefined {
  return EQUIPMENT_DATABASE.find(e => e.id === id);
}

// Check if a character can equip an item
export function canEquip(player: Player, equipment: Equipment): boolean {
  return equipment.allowedJobs.includes(player.job);
}

// Calculate total stats including equipment bonuses
export function getEffectiveStats(player: Player): { attack: number; defense: number; maxHp: number; maxMp: number } {
  let attack = player.attack;
  let defense = player.defense;
  let maxHp = player.maxHp;
  let maxMp = player.maxMp;
  
  const slots: EquipmentSlot[] = ['weapon', 'armor', 'helmet', 'accessory'];
  for (const slot of slots) {
    const item = player.equipment[slot];
    if (item) {
      attack += item.attack;
      defense += item.defense;
      maxHp += item.hp;
      maxMp += item.mp;
    }
  }
  
  return { attack, defense, maxHp, maxMp };
}

// Get equipment that can drop from monsters (based on rarity chances)
export function getRandomEquipmentDrop(floor: number): Equipment | null {
  // 20% chance to drop equipment
  if (Math.random() > 0.20) return null;
  
  // Higher floors = better rarity chances
  const rarityRoll = Math.random();
  let targetRarity: 'common' | 'uncommon' | 'rare' | 'epic';
  
  if (floor >= 3 && rarityRoll < 0.05) {
    targetRarity = 'epic';
  } else if (floor >= 2 && rarityRoll < 0.15) {
    targetRarity = 'rare';
  } else if (rarityRoll < 0.40) {
    targetRarity = 'uncommon';
  } else {
    targetRarity = 'common';
  }
  
  // Filter equipment by rarity
  const possibleDrops = EQUIPMENT_DATABASE.filter(e => e.rarity === targetRarity);
  if (possibleDrops.length === 0) return null;
  
  return possibleDrops[Math.floor(Math.random() * possibleDrops.length)];
}

// Default empty equipment
export function createEmptyEquipment(): PlayerEquipment {
  return {
    weapon: null,
    armor: null,
    helmet: null,
    accessory: null,
  };
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
  goldValue: number;
}

export interface Tile {
  type: 'floor' | 'wall' | 'door';
  texture?: string;
  event?: 'monster' | 'treasure' | 'stairs';
}

// Map tile values:
// 0 = floor, 1 = wall, 2 = door, 3 = ladder down, 4 = ladder up
export const TILE_FLOOR = 0;
export const TILE_WALL = 1;
export const TILE_DOOR = 2;
export const TILE_LADDER_DOWN = 3;
export const TILE_LADDER_UP = 4;

// Get dungeon size based on floor level
// Floor 1: 16x16, Floor 2: 20x20, Floor 3: 24x24, etc. (max 40x40)
export function getDungeonSize(floor: number): { width: number; height: number } {
  const baseSize = 16;
  const growthPerFloor = 4;
  const size = Math.min(40, baseSize + (floor - 1) * growthPerFloor);
  return { width: size, height: size };
}

export interface GameData {
  party: Player[];
  x: number;
  y: number;
  dir: Direction;
  map: number[][]; // 0 = floor, 1 = wall
  inventory: string[];
  equipmentInventory: Equipment[]; // Unequipped gear
  gold: number;
  level: number; // Dungeon Floor
}

// Initial State Factory
export function createInitialState(): GameData {
  // Get starting equipment for each character
  const fighterWeapon = getEquipmentById('rusty_sword') || null;
  const fighterArmor = getEquipmentById('leather_vest') || null;
  const mageWeapon = getEquipmentById('wooden_staff') || null;
  const mageArmor = getEquipmentById('cloth_robe') || null;
  const monkWeapon = getEquipmentById('brass_knuckles') || null;
  const monkArmor = getEquipmentById('leather_vest') || null;
  
  const startingFloor = 1;
  const { width, height } = getDungeonSize(startingFloor);
  
  return {
    party: [
      { 
        id: 'p1', name: 'Bork', job: 'Fighter', 
        hp: 50, maxHp: 50, mp: 0, maxMp: 0, attack: 12, defense: 8, 
        color: '#e74c3c', xp: 0, level: 1,
        equipment: { weapon: fighterWeapon, armor: fighterArmor, helmet: null, accessory: null }
      },
      { 
        id: 'p2', name: 'Pyra', job: 'Mage', 
        hp: 30, maxHp: 30, mp: 40, maxMp: 40, attack: 4, defense: 4, 
        color: '#9b59b6', xp: 0, level: 1,
        equipment: { weapon: mageWeapon, armor: mageArmor, helmet: null, accessory: null }
      },
      { 
        id: 'p3', name: 'Milo', job: 'Monk', 
        hp: 45, maxHp: 45, mp: 10, maxMp: 10, attack: 10, defense: 6, 
        color: '#f1c40f', xp: 0, level: 1,
        equipment: { weapon: monkWeapon, armor: monkArmor, helmet: null, accessory: null }
      },
    ],
    x: 1,
    y: 1,
    dir: EAST,
    map: generateMaze(width, height, startingFloor),
    inventory: ['Potion', 'Torch'],
    equipmentInventory: [], // Start with no extra equipment
    gold: 0,
    level: startingFloor,
  };
}

// Generate a new floor map when changing levels
export function generateFloorMap(floor: number): { map: number[][]; startX: number; startY: number; ladderDownX: number; ladderDownY: number } {
  const { width, height } = getDungeonSize(floor);
  const map = generateMaze(width, height, floor);
  
  // Find the ladder up position for spawning player (when descending to this floor)
  let startX = 1, startY = 1;
  let ladderDownX = 1, ladderDownY = 1;
  
  outerUp: for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      if (map[y][x] === TILE_LADDER_UP) {
        startX = x;
        startY = y;
        break outerUp;
      }
    }
  }
  
  // Find ladder down position (for spawning when ascending from below)
  outerDown: for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      if (map[y][x] === TILE_LADDER_DOWN) {
        ladderDownX = x;
        ladderDownY = y;
        break outerDown;
      }
    }
  }
  
  // For floor 1, spawn at starting position (no ladder up exists)
  if (floor === 1) {
    startX = 1;
    startY = 1;
  }
  
  return { map, startX, startY, ladderDownX, ladderDownY };
}

// Improved Maze Generation - ensures connectivity and proper starting area
function generateMaze(width: number, height: number, floor: number = 1): number[][] {
  const map = Array(height).fill(0).map(() => Array(width).fill(1)); // Fill with walls
  
  // Use iterative approach with explicit stack to avoid recursion issues
  function carveIterative(startX: number, startY: number) {
    const stack: [number, number][] = [[startX, startY]];
    map[startY][startX] = 0;
    
    while (stack.length > 0) {
      const [x, y] = stack[stack.length - 1];
      
      // Get unvisited neighbors (2 cells away to create corridors)
      const directions = [
        [0, -2], [0, 2], [-2, 0], [2, 0] // N, S, W, E
      ].filter(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        return nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && map[ny][nx] === 1;
      });
      
      if (directions.length > 0) {
        // Pick a random direction
        const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
        const nx = x + dx;
        const ny = y + dy;
        
        // Carve the passage
        map[ny][nx] = 0;
        map[y + dy / 2][x + dx / 2] = 0;
        
        stack.push([nx, ny]);
      } else {
        // Backtrack
        stack.pop();
      }
    }
  }
  
  // Start carving from position (3, 1) to ensure room for starting area
  // First, ensure starting area is clear
  map[1][1] = 0; // Player start position
  map[1][2] = 0; // Path forward (east)
  map[1][3] = 0; // Continue east corridor
  
  // Carve maze from a point connected to start
  carveIterative(3, 1);
  
  // Add additional connections to ensure the maze is more open and connected
  // Create some extra passages to avoid dead ends near start
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      if (map[y][x] === 0) {
        // Occasionally add extra connections (10% chance)
        if (Math.random() < 0.1) {
          const neighbors = [
            [0, 2], [0, -2], [2, 0], [-2, 0]
          ].filter(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            return nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && map[ny][nx] === 0;
          });
          
          if (neighbors.length > 0) {
            const [dx, dy] = neighbors[Math.floor(Math.random() * neighbors.length)];
            map[y + dy / 2][x + dx / 2] = 0; // Create extra passage
          }
        }
      }
    }
  }
  
  // Ensure starting area has a door/entrance behind (west wall at x=0 is the "entrance")
  // Mark position (0, 1) as a special "door" tile (value 2) - only on floor 1
  if (floor === 1) {
    map[1][0] = TILE_DOOR; // Door behind player at start (entrance to dungeon)
  } else {
    // On deeper floors, place ladder UP near start (player comes from above)
    map[1][1] = TILE_LADDER_UP;
  }
  
  // Make sure player isn't boxed in - verify path exists to the east
  // The carving algorithm guarantees connectivity, but double-check
  if (map[1][2] === 1) {
    map[1][2] = 0; // Ensure path to the east
  }
  
  // Place ladder DOWN to next level - find a floor tile far from start
  let ladderDownX = 1, ladderDownY = 1;
  let maxDistance = 0;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (map[y][x] === TILE_FLOOR) {
        const distance = Math.abs(x - 1) + Math.abs(y - 1); // Manhattan distance from start
        if (distance > maxDistance) {
          maxDistance = distance;
          ladderDownX = x;
          ladderDownY = y;
        }
      }
    }
  }
  
  // Place the ladder down at the farthest reachable point
  map[ladderDownY][ladderDownX] = TILE_LADDER_DOWN;
  
  return map;
}

// Combat Logic Helpers
export const MONSTERS: Monster[] = [
  // Easy monsters for level 1 (low gold)
  { id: 'm1', name: 'Slimy Ooze', hp: 20, maxHp: 20, mp: 0, maxMp: 0, attack: 5, defense: 2, xpValue: 10, goldValue: 5, color: '#2ecc71', image: '/assets/monsters/ooze.png' },
  { id: 'm2', name: 'Giant Rat', hp: 15, maxHp: 15, mp: 0, maxMp: 0, attack: 4, defense: 1, xpValue: 8, goldValue: 3, color: '#8B4513', image: '/assets/monsters/rat.png' },
  { id: 'm3', name: 'Cave Bat', hp: 12, maxHp: 12, mp: 0, maxMp: 0, attack: 3, defense: 1, xpValue: 6, goldValue: 2, color: '#4a0080', image: '/assets/monsters/bat.png' },
  { id: 'm4', name: 'Poison Mushroom', hp: 18, maxHp: 18, mp: 0, maxMp: 0, attack: 4, defense: 2, xpValue: 9, goldValue: 4, color: '#e74c3c', image: '/assets/monsters/mushroom.png' },
  { id: 'm5', name: 'Dungeon Spider', hp: 22, maxHp: 22, mp: 0, maxMp: 0, attack: 6, defense: 2, xpValue: 12, goldValue: 7, color: '#2c3e50', image: '/assets/monsters/spider.png' },
  { id: 'm6', name: 'Small Goblin', hp: 25, maxHp: 25, mp: 0, maxMp: 0, attack: 6, defense: 3, xpValue: 14, goldValue: 10, color: '#27ae60', image: '/assets/monsters/goblin.png' },
  { id: 'm7', name: 'Slime Warrior', hp: 35, maxHp: 35, mp: 0, maxMp: 0, attack: 8, defense: 3, xpValue: 20, goldValue: 15, color: '#9b59b6', image: '/assets/monsters/slime.png' },
  // Harder monsters for later floors (more gold)
  { id: 'm8', name: 'Orc Warrior', hp: 60, maxHp: 60, mp: 0, maxMp: 0, attack: 12, defense: 5, xpValue: 40, goldValue: 35, color: '#27ae60', image: '/assets/monsters/orc.png' },
  { id: 'm9', name: 'Skeleton', hp: 40, maxHp: 40, mp: 0, maxMp: 0, attack: 10, defense: 4, xpValue: 25, goldValue: 20, color: '#bdc3c7' },
];

export function getRandomMonster(floor: number): Monster {
  // All easy monsters (first 7) available on floor 1, harder ones unlock later
  const easyMonsterCount = 7; // Cave Bat through Slime Warrior
  const maxIndex = Math.min(MONSTERS.length, easyMonsterCount + Math.floor(floor / 2));
  const index = Math.floor(Math.random() * maxIndex);
  const base = MONSTERS[index];
  return {
    ...base,
    id: crypto.randomUUID(),
    hp: Math.floor(base.hp * (1 + (floor * 0.1))), // 10% buff per floor
    maxHp: Math.floor(base.maxHp * (1 + (floor * 0.1))),
    attack: Math.floor(base.attack * (1 + (floor * 0.1))),
    goldValue: Math.floor(base.goldValue * (1 + (floor * 0.15))), // 15% more gold per floor
  };
}
