// Types and Logic for the Dungeon Crawler

// Helper function for UUID generation
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
  speed: number;  // Determines turn order in combat
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
export type EquipmentSlot = 'weapon' | 'shield' | 'armor' | 'helmet' | 'gloves' | 'accessory';

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  attack: number;
  defense: number;
  hp: number;
  mp: number;
  speed: number;  // Speed bonus from equipment
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  allowedJobs: string[]; // Which jobs can equip this
  description: string;
  enhancement?: number; // 0-4, each level provides bigger stat boosts
}

// Enhancement bonus multipliers: +1 = 10%, +2 = 25%, +3 = 50%, +4 = 100%
export const ENHANCEMENT_MULTIPLIERS = [0, 0.10, 0.25, 0.50, 1.00];

// Potion System
export type PotionType = 'health' | 'mana' | 'elixir';

export interface Potion {
  id: string;
  name: string;
  type: PotionType;
  healAmount: number;  // HP restored (0 for mana potions)
  manaAmount: number;  // MP restored (0 for health potions)
  rarity: 'common' | 'uncommon' | 'rare';
  description: string;
}

// Available potions
export const POTIONS: Potion[] = [
  // Health Potions
  { id: 'minor_health_potion', name: 'Minor Health Potion', type: 'health', healAmount: 25, manaAmount: 0, rarity: 'common', description: 'Restores 25 HP' },
  { id: 'health_potion', name: 'Health Potion', type: 'health', healAmount: 50, manaAmount: 0, rarity: 'uncommon', description: 'Restores 50 HP' },
  { id: 'greater_health_potion', name: 'Greater Health Potion', type: 'health', healAmount: 100, manaAmount: 0, rarity: 'rare', description: 'Restores 100 HP' },
  // Mana Potions
  { id: 'minor_mana_potion', name: 'Minor Mana Potion', type: 'mana', healAmount: 0, manaAmount: 15, rarity: 'common', description: 'Restores 15 MP' },
  { id: 'mana_potion', name: 'Mana Potion', type: 'mana', healAmount: 0, manaAmount: 30, rarity: 'uncommon', description: 'Restores 30 MP' },
  { id: 'greater_mana_potion', name: 'Greater Mana Potion', type: 'mana', healAmount: 0, manaAmount: 60, rarity: 'rare', description: 'Restores 60 MP' },
  // Elixirs (both)
  { id: 'minor_elixir', name: 'Minor Elixir', type: 'elixir', healAmount: 20, manaAmount: 10, rarity: 'uncommon', description: 'Restores 20 HP and 10 MP' },
  { id: 'elixir', name: 'Elixir', type: 'elixir', healAmount: 50, manaAmount: 25, rarity: 'rare', description: 'Restores 50 HP and 25 MP' },
];

// Get random potion drop based on floor level
export function getRandomPotionDrop(floor: number): Potion | null {
  // 30% chance to drop a potion
  if (Math.random() > 0.30) return null;
  
  // Filter potions based on floor (higher floors = better potions)
  let availablePotions: Potion[];
  if (floor <= 2) {
    availablePotions = POTIONS.filter(p => p.rarity === 'common');
  } else if (floor <= 4) {
    availablePotions = POTIONS.filter(p => p.rarity === 'common' || p.rarity === 'uncommon');
  } else {
    availablePotions = POTIONS;
  }
  
  // Weight by rarity (common more likely)
  const weighted: Potion[] = [];
  for (const potion of availablePotions) {
    const weight = potion.rarity === 'common' ? 5 : potion.rarity === 'uncommon' ? 3 : 1;
    for (let i = 0; i < weight; i++) {
      weighted.push(potion);
    }
  }
  
  const selected = weighted[Math.floor(Math.random() * weighted.length)];
  // Return a copy with unique id
  return { ...selected, id: `${selected.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` };
}

// Get display name with enhancement level
export function getEnhancedName(item: Equipment): string {
  const enhancement = item.enhancement || 0;
  return enhancement > 0 ? `${item.name} +${enhancement}` : item.name;
}

// Calculate enhanced stats for an item
export function getEnhancedStats(item: Equipment): { attack: number; defense: number; hp: number; mp: number; speed: number } {
  const enhancement = item.enhancement || 0;
  const multiplier = 1 + ENHANCEMENT_MULTIPLIERS[enhancement];
  
  return {
    attack: Math.floor(item.attack * multiplier),
    defense: Math.floor(item.defense * multiplier),
    hp: Math.floor(item.hp * multiplier),
    mp: Math.floor(item.mp * multiplier),
    speed: Math.floor(item.speed * multiplier)
  };
}

// Roll enhancement level for dropped equipment (higher levels are rarer)
export function rollEnhancement(floor: number): number {
  const roll = Math.random() * 100;
  const floorBonus = Math.min(floor * 2, 20); // Up to 20% bonus from floor
  
  // Base chances: +0 = 60%, +1 = 25%, +2 = 10%, +3 = 4%, +4 = 1%
  // Floor bonus increases chances of higher enhancements
  if (roll < 1 + floorBonus * 0.5) return 4;      // +4: 1% base, up to 11%
  if (roll < 5 + floorBonus * 0.5) return 3;      // +3: 4% base, up to 14%
  if (roll < 15 + floorBonus * 0.3) return 2;     // +2: 10% base, up to 16%
  if (roll < 40 + floorBonus * 0.2) return 1;     // +1: 25% base, up to 29%
  return 0;                                        // +0: remainder
}

export interface PlayerEquipment {
  weapon: Equipment | null;
  shield: Equipment | null;
  armor: Equipment | null;
  helmet: Equipment | null;
  gloves: Equipment | null;
  accessory: Equipment | null;
}

export interface Player extends Entity {
  job: string;
  xp: number;
  level: number;
  equipment: PlayerEquipment;
}

// Equipment Database - Simplified for WebGL demo
export const EQUIPMENT_DATABASE: Equipment[] = [
  // FIGHTER WEAPONS
  { id: 'rusty_sword', name: 'Rusty Sword', slot: 'weapon', attack: 3, defense: 0, hp: 0, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'A worn but serviceable blade' },
  { id: 'iron_sword', name: 'Iron Sword', slot: 'weapon', attack: 6, defense: 0, hp: 0, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'A sturdy iron blade' },
  { id: 'steel_sword', name: 'Steel Sword', slot: 'weapon', attack: 10, defense: 1, hp: 0, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter'], description: 'A finely crafted steel blade' },
  
  // MAGE WEAPONS
  { id: 'wooden_staff', name: 'Wooden Staff', slot: 'weapon', attack: 1, defense: 0, hp: 0, mp: 5, speed: 0, rarity: 'common', allowedJobs: ['Mage'], description: 'A simple magical focus' },
  { id: 'crystal_staff', name: 'Crystal Staff', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 12, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Channels magical energy' },
  
  // MONK WEAPONS
  { id: 'brass_knuckles', name: 'Brass Knuckles', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Monk'], description: 'Enhances unarmed strikes' },
  { id: 'iron_fists', name: 'Iron Fists', slot: 'weapon', attack: 7, defense: 1, hp: 0, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Heavy iron knuckle guards' },
  
  // SHIELDS
  { id: 'wooden_shield', name: 'Wooden Shield', slot: 'shield', attack: 0, defense: 2, hp: 0, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Simple wooden protection' },
  { id: 'iron_shield', name: 'Iron Shield', slot: 'shield', attack: 0, defense: 5, hp: 5, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Solid iron construction' },
  
  // ARMOR
  { id: 'leather_vest', name: 'Leather Vest', slot: 'armor', attack: 0, defense: 2, hp: 0, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter', 'Monk'], description: 'Basic leather protection' },
  { id: 'cloth_robe', name: 'Cloth Robe', slot: 'armor', attack: 0, defense: 1, hp: 0, mp: 8, speed: 0, rarity: 'common', allowedJobs: ['Mage'], description: 'Simple enchanted cloth' },
  { id: 'training_gi', name: 'Training Gi', slot: 'armor', attack: 0, defense: 2, hp: 0, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Monk'], description: 'Simple training clothes' },
];

// Get equipment by ID
export function getEquipmentById(id: string): Equipment | undefined {
  return EQUIPMENT_DATABASE.find(e => e.id === id);
}

// Check if a character can equip an item
export function canEquip(player: Player, equipment: Equipment): boolean {
  return equipment.allowedJobs.includes(player.job);
}

// Calculate total stats including equipment bonuses (with enhancement)
export function getEffectiveStats(player: Player): { attack: number; defense: number; maxHp: number; maxMp: number; speed: number } {
  let attack = player.attack;
  let defense = player.defense;
  let maxHp = player.maxHp;
  let maxMp = player.maxMp;
  let speed = player.speed;
  
  const slots: EquipmentSlot[] = ['weapon', 'shield', 'armor', 'helmet', 'gloves', 'accessory'];
  for (const slot of slots) {
    const item = player.equipment[slot];
    if (item) {
      const enhanced = getEnhancedStats(item);
      attack += enhanced.attack;
      defense += enhanced.defense;
      maxHp += enhanced.hp;
      maxMp += enhanced.mp;
      speed += enhanced.speed;
    }
  }
  
  return { attack, defense, maxHp, maxMp, speed };
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
  
  // Select random item and add enhancement level
  const baseItem = possibleDrops[Math.floor(Math.random() * possibleDrops.length)];
  const enhancement = rollEnhancement(floor);
  
  // Return a copy with enhancement
  return { ...baseItem, enhancement };
}

// Default empty equipment
export function createEmptyEquipment(): PlayerEquipment {
  return {
    weapon: null,
    shield: null,
    armor: null,
    helmet: null,
    gloves: null,
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
export function getLevelUpStats(job: string): { hp: number, mp: number, attack: number, defense: number, speed: number } {
  switch (job) {
    case 'Fighter':
      return { hp: 10, mp: 0, attack: 3, defense: 2, speed: 1 };
    case 'Mage':
      return { hp: 4, mp: 8, attack: 1, defense: 1, speed: 1 };
    case 'Monk':
      return { hp: 8, mp: 2, attack: 2, defense: 1, speed: 2 };
    default:
      return { hp: 6, mp: 2, attack: 2, defense: 1, speed: 1 };
  }
}

export interface Monster extends Entity {
  xpValue: number;
  goldValue: number;
  image?: string; // Optional sprite image URL
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
  potionInventory: Potion[]; // Potions bag
  gold: number;
  level: number; // Dungeon Floor
  actionCount: number;
}

// Initial State Factory
export function createInitialState(): GameData {
  // Get starting equipment for each character
  const fighterWeapon = getEquipmentById('rusty_sword') || null;
  const fighterArmor = getEquipmentById('leather_vest') || null;
  const mageWeapon = getEquipmentById('wooden_staff') || null;
  const mageArmor = getEquipmentById('cloth_robe') || null;
  const monkWeapon = getEquipmentById('brass_knuckles') || null;
  const monkArmor = getEquipmentById('training_gi') || null;
  
  const startingFloor = 1;
  const { width, height } = getDungeonSize(startingFloor);
  
  return {
    party: [
      { 
        id: 'p1', name: 'Bork', job: 'Fighter', 
        hp: 50, maxHp: 50, mp: 0, maxMp: 0, attack: 12, defense: 8, speed: 8,
        color: '#e74c3c', xp: 0, level: 1,
        equipment: { weapon: fighterWeapon, shield: null, armor: fighterArmor, helmet: null, gloves: null, accessory: null }
      },
      { 
        id: 'p2', name: 'Pyra', job: 'Mage', 
        hp: 30, maxHp: 30, mp: 40, maxMp: 40, attack: 4, defense: 4, speed: 6,
        color: '#9b59b6', xp: 0, level: 1,
        equipment: { weapon: mageWeapon, shield: null, armor: mageArmor, helmet: null, gloves: null, accessory: null }
      },
      { 
        id: 'p3', name: 'Milo', job: 'Monk', 
        hp: 45, maxHp: 45, mp: 10, maxMp: 10, attack: 10, defense: 6, speed: 12,
        color: '#f1c40f', xp: 0, level: 1,
        equipment: { weapon: monkWeapon, shield: null, armor: monkArmor, helmet: null, gloves: null, accessory: null }
      },
    ],
    x: 1,
    y: 1,
    dir: EAST,
    map: generateMaze(width, height, startingFloor),
    inventory: ['Torch'],
    equipmentInventory: [], // Start with no extra equipment
    potionInventory: [
      { ...POTIONS[0], id: `minor_health_potion_start_1` }, // 2 minor health potions to start
      { ...POTIONS[0], id: `minor_health_potion_start_2` },
    ],
    gold: 0,
    level: startingFloor,
    actionCount: 0,
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
  const map = Array(height).fill(0).map(() => Array(width).fill(TILE_WALL)); // Fill with walls
  
  // Use iterative approach with explicit stack to avoid recursion issues
  function carveIterative(startX: number, startY: number) {
    const stack: [number, number][] = [[startX, startY]];
    map[startY][startX] = TILE_FLOOR;
    
    while (stack.length > 0) {
      const [x,