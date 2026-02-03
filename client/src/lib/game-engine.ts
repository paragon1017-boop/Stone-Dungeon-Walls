// Types and Logic for the Dungeon Crawler

// Import equipment database
import { COMPLETE_EQUIPMENT_DATABASE, SET_BONUSES, type ExtendedEquipmentSet, type SetBonus } from './equipment-data';

// Monster sprite imports - unique sprites for each monster
import caveBatSprite from "@/assets/monsters/cave_bat.png";
import giantRatSprite from "@/assets/monsters/giant_rat.png";
import poisonMushroomSprite from "@/assets/monsters/poison_mushroom.png";
import slimyOozeSprite from "@/assets/monsters/slimy_ooze.png";
import giantBeetleSprite from "@/assets/monsters/giant_beetle.png";
import caveCrawlerSprite from "@/assets/monsters/cave_crawler.png";
import koboldSprite from "@/assets/monsters/kobold.png";
import fireImpSprite from "@/assets/monsters/fire_imp.png";
import shadowWispSprite from "@/assets/monsters/shadow_wisp.png";
import dungeonSpiderSprite from "@/assets/monsters/dungeon_spider.png";
import smallGoblinSprite from "@/assets/monsters/small_goblin.png";
import zombieSprite from "@/assets/monsters/zombie.png";
import slimeWarriorSprite from "@/assets/monsters/slime_warrior.png";
import skeletonSprite from "@/assets/monsters/skeleton.png";
import harpySprite from "@/assets/monsters/harpy.png";
import mummySprite from "@/assets/monsters/mummy.png";
import werewolfSprite from "@/assets/monsters/werewolf.png";
import orcWarriorSprite from "@/assets/monsters/orc_warrior.png";
import trollSprite from "@/assets/monsters/troll.png";
import darkKnightSprite from "@/assets/monsters/dark_knight.png";
import gargoyleSprite from "@/assets/monsters/gargoyle.png";
import minotaurSprite from "@/assets/monsters/minotaur.png";
import wraithSprite from "@/assets/monsters/wraith.png";
import golemSprite from "@/assets/monsters/golem.png";
import basiliskSprite from "@/assets/monsters/basilisk.png";
import deathKnightSprite from "@/assets/monsters/death_knight.png";
import lichSprite from "@/assets/monsters/lich.png";
import demonSprite from "@/assets/monsters/demon.png";
import dragonSprite from "@/assets/monsters/dragon.png";

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
  type: 'attack' | 'heal' | 'buff' | 'debuff';
  power: number; // multiplier or base value
  description: string;
}

// Equipment System
export type EquipmentSlot = 'weapon' | 'shield' | 'armor' | 'helmet' | 'gloves' | 'boots' | 'necklace' | 'ring' | 'relic' | 'offhand';

// Equipment set names for set bonuses - Extended to include all 18 sets
export type EquipmentSet = ExtendedEquipmentSet;

// Re-export SET_BONUSES for use in other files
export { SET_BONUSES };

// Set Bonus Calculation System
export interface SetPieceCount {
  set: ExtendedEquipmentSet;
  count: number;
}

export interface ActiveSetBonus {
  setName: ExtendedEquipmentSet;
  pieceCount: number;
  bonuses: SetBonus[];
}

// Count set pieces from equipped items
export function countSetPieces(equippedItems: (Equipment | null)[]): SetPieceCount[] {
  const setCounts = new Map<ExtendedEquipmentSet, number>();
  
  for (const item of equippedItems) {
    if (item?.set && item.set !== 'None') {
      const current = setCounts.get(item.set) || 0;
      setCounts.set(item.set, current + 1);
    }
  }
  
  return Array.from(setCounts.entries()).map(([set, count]) => ({ set, count }));
}

// Get active bonuses for a set based on piece count
export function getActiveSetBonuses(equippedItems: (Equipment | null)[]): ActiveSetBonus[] {
  const setPieces = countSetPieces(equippedItems);
  const activeBonuses: ActiveSetBonus[] = [];
  
  for (const { set, count } of setPieces) {
    if (set === 'None') continue;
    
    // Safe access - SET_BONUSES is properly typed, only access if key exists
    if (!(set in SET_BONUSES)) continue;
    const setBonusData = SET_BONUSES[set as keyof typeof SET_BONUSES];
    if (!setBonusData) continue;
    
    // Get all bonuses where threshold is met
    const activeThresholdBonuses = setBonusData.bonuses.filter(b => count >= b.threshold);
    
    if (activeThresholdBonuses.length > 0) {
      activeBonuses.push({
        setName: set,
        pieceCount: count,
        bonuses: activeThresholdBonuses
      });
    }
  }
  
  return activeBonuses;
}

// Calculate total set bonus modifiers (cumulative for percentage bonuses)
export function calculateSetBonusStats(activeBonuses: ActiveSetBonus[]): {
  attackPercent: number;
  defensePercent: number;
  hpPercent: number;
  mpPercent: number;
  speedPercent: number;
  critChance: number;
  critDamage: number;
  evasion: number;
  defensePenetration: number;
  lifesteal: number;
  counterChance: number;
  onHitHeal: number;
  burnDamage: number;
  slowEffect: number;
  chainDamage: number;
} {
  const totals = {
    attackPercent: 0,
    defensePercent: 0,
    hpPercent: 0,
    mpPercent: 0,
    speedPercent: 0,
    critChance: 0,
    critDamage: 0,
    evasion: 0,
    defensePenetration: 0,
    lifesteal: 0,
    counterChance: 0,
    onHitHeal: 0,
    burnDamage: 0,
    slowEffect: 0,
    chainDamage: 0
  };
  
  for (const { bonuses } of activeBonuses) {
    for (const bonus of bonuses) {
      totals.attackPercent += bonus.attackPercent || 0;
      totals.defensePercent += bonus.defensePercent || 0;
      totals.hpPercent += bonus.hpPercent || 0;
      totals.mpPercent += bonus.mpPercent || 0;
      totals.speedPercent += bonus.speedPercent || 0;
      totals.critChance += bonus.critChance || 0;
      totals.critDamage += bonus.critDamage || 0;
      totals.evasion += bonus.evasion || 0;
      totals.defensePenetration += bonus.defensePenetration || 0;
      totals.lifesteal += bonus.lifesteal || 0;
      totals.counterChance += bonus.counterChance || 0;
      totals.onHitHeal += bonus.onHitHeal || 0;
      totals.burnDamage += bonus.burnDamage || 0;
      totals.slowEffect += bonus.slowEffect || 0;
      totals.chainDamage += bonus.chainDamage || 0;
    }
  }
  
  return totals;
}

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  attack: number;
  defense: number;
  hp: number;
  mp: number;
  speed: number;  // Speed bonus from equipment
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  allowedJobs: string[]; // Which jobs can equip this
  set?: EquipmentSet; // Equipment set for set bonuses
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
  shield: Equipment | null;  // Fighter only (Fighter's offhand)
  armor: Equipment | null;
  helmet: Equipment | null;
  gloves: Equipment | null;
  boots: Equipment | null;
  necklace: Equipment | null;
  ring1: Equipment | null;
  ring2: Equipment | null;
  relic: Equipment | null;   // Mage only
  offhand: Equipment | null; // Mage/Monk only (replaces shield for non-Fighters)
}

export interface Player extends Entity {
  job: string;
  xp: number;
  level: number;
  equipment: PlayerEquipment;
}

// Equipment Database - 486 items across 18 thematic sets
// Starter Sets (Uncommon): Warrior's Might, Hunter's Focus, Brute Force, Elemental Apprentice, 
//                          Arcane Scholar, Battle Mage, Martial Disciple, Shadow Stalker, Iron Body
// Advanced Sets (Epic): Blade Dancer, Bulwark Sentinel, Vampiric Embrace, Wind Dancer, Riposte, 
//                       Frozen Wasteland, Inferno Blaze, Storm Caller, Earthen Colossus
export const EQUIPMENT_DATABASE: Equipment[] = COMPLETE_EQUIPMENT_DATABASE as Equipment[];

// Get equipment by ID
export function getEquipmentById(id: string): Equipment | undefined {
  return EQUIPMENT_DATABASE.find(e => e.id === id);
}

// Check if a character can equip an item
export function canEquip(player: Player, equipment: Equipment): boolean {
  // Check if job is in allowed jobs list
  if (!equipment.allowedJobs.includes(player.job)) {
    return false;
  }
  
  // Enforce slot-based class restrictions
  // Shield: Fighter only (Fighter's offhand)
  if (equipment.slot === 'shield' && player.job !== 'Fighter') {
    return false;
  }
  // Offhand: Mage/Monk only (replaces shield for non-Fighters)
  if (equipment.slot === 'offhand' && player.job === 'Fighter') {
    return false;
  }
  // Relic: Mage only
  if (equipment.slot === 'relic' && player.job !== 'Mage') {
    return false;
  }
  
  return true;
}

// Get equipped items array for a player (respecting class restrictions)
export function getEquippedItemsArray(player: Player): (Equipment | null)[] {
  const job = player.job;
  const canUseShield = job === 'Fighter';
  const canUseOffhand = job !== 'Fighter';
  const canUseRelic = job === 'Mage';
  
  return [
    player.equipment.weapon,
    canUseShield ? player.equipment.shield : null,
    player.equipment.armor,
    player.equipment.helmet,
    player.equipment.gloves,
    player.equipment.boots,
    player.equipment.necklace,
    player.equipment.ring1,
    player.equipment.ring2,
    canUseRelic ? player.equipment.relic : null,
    canUseOffhand ? player.equipment.offhand : null,
  ];
}

// Calculate total stats including equipment bonuses (with enhancement) and set bonuses
// Only counts equipment in valid slots for the player's class
export function getEffectiveStats(player: Player): { attack: number; defense: number; maxHp: number; maxMp: number; speed: number } {
  let attack = player.attack;
  let defense = player.defense;
  let maxHp = player.maxHp;
  let maxMp = player.maxMp;
  let speed = player.speed;
  
  const equippedItems = getEquippedItemsArray(player);
  
  // Add flat equipment stats
  for (const item of equippedItems) {
    if (item) {
      const enhanced = getEnhancedStats(item);
      attack += enhanced.attack;
      defense += enhanced.defense;
      maxHp += enhanced.hp;
      maxMp += enhanced.mp;
      speed += enhanced.speed;
    }
  }
  
  // Apply set bonus percentage modifiers
  const activeBonuses = getActiveSetBonuses(equippedItems);
  const setBonusStats = calculateSetBonusStats(activeBonuses);
  
  // Apply percentage bonuses (additive percentages of base stats + equipment)
  attack = Math.floor(attack * (1 + setBonusStats.attackPercent / 100));
  defense = Math.floor(defense * (1 + setBonusStats.defensePercent / 100));
  maxHp = Math.floor(maxHp * (1 + setBonusStats.hpPercent / 100));
  maxMp = Math.floor(maxMp * (1 + setBonusStats.mpPercent / 100));
  speed = Math.floor(speed * (1 + setBonusStats.speedPercent / 100));
  
  return { attack, defense, maxHp, maxMp, speed };
}

// Extended stats for combat including set bonus combat mechanics
export interface CombatStats {
  attack: number;
  defense: number;
  maxHp: number;
  maxMp: number;
  speed: number;
  critChance: number;
  critDamage: number;
  evasion: number;
  defensePenetration: number;
  lifesteal: number;
  counterChance: number;
  onHitHeal: number;
  burnDamage: number;
  slowEffect: number;
  chainDamage: number;
}

// Get full combat stats including all set bonus effects
export function getCombatStats(player: Player): CombatStats {
  const baseStats = getEffectiveStats(player);
  const equippedItems = getEquippedItemsArray(player);
  const activeBonuses = getActiveSetBonuses(equippedItems);
  const setBonusStats = calculateSetBonusStats(activeBonuses);
  
  return {
    ...baseStats,
    critChance: setBonusStats.critChance,
    critDamage: setBonusStats.critDamage,
    evasion: setBonusStats.evasion,
    defensePenetration: setBonusStats.defensePenetration,
    lifesteal: setBonusStats.lifesteal,
    counterChance: setBonusStats.counterChance,
    onHitHeal: setBonusStats.onHitHeal,
    burnDamage: setBonusStats.burnDamage,
    slowEffect: setBonusStats.slowEffect,
    chainDamage: setBonusStats.chainDamage
  };
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
    boots: null,
    necklace: null,
    ring1: null,
    ring2: null,
    relic: null,
    offhand: null,
  };
}

// Combat abilities for each job
export const JOB_ABILITIES: Record<string, Ability[]> = {
  Fighter: [
    { id: 'attack', name: 'Attack', mpCost: 0, type: 'attack', power: 1.0, description: 'Basic attack' },
    { id: 'power_strike', name: 'Power Strike', mpCost: 0, type: 'attack', power: 2.0, description: 'Powerful attack (2x damage)' },
    { id: 'defend', name: 'Defend', mpCost: 0, type: 'buff', power: 0.5, description: 'Reduce incoming damage' },
    { id: 'provoke', name: 'Provoke', mpCost: 4, type: 'debuff', power: 2, description: 'Force enemy to attack you, reduces their attack for 2 turns' },
  ],
  Mage: [
    { id: 'attack', name: 'Attack', mpCost: 0, type: 'attack', power: 1.0, description: 'Basic attack' },
    { id: 'fireball', name: 'Fireball', mpCost: 8, type: 'attack', power: 3.0, description: 'Powerful fire spell (3x damage)' },
    { id: 'heal', name: 'Heal', mpCost: 6, type: 'heal', power: 25, description: 'Restore 25 HP to a party member' },
    { id: 'ice_shard', name: 'Ice Shard', mpCost: 10, type: 'attack', power: 2.2, description: 'Ice damage, 40% chance to freeze enemy (skip turn)' },
  ],
  Monk: [
    { id: 'attack', name: 'Attack', mpCost: 0, type: 'attack', power: 1.0, description: 'Basic attack' },
    { id: 'chi_strike', name: 'Chi Strike', mpCost: 4, type: 'attack', power: 1.8, description: 'Focused strike (1.8x damage)' },
    { id: 'meditate', name: 'Meditate', mpCost: 0, type: 'heal', power: 15, description: 'Restore 15 HP to self' },
    { id: 'stealth', name: 'Stealth', mpCost: 8, type: 'buff', power: 25, description: 'Enter stealth: 25% chance to dodge all attacks this battle' },
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
        hp: 50, maxHp: 50, mp: 0, maxMp: 0, attack: 12, defense: 8, speed: 8,
        color: '#e74c3c', xp: 0, level: 1,
        equipment: { weapon: fighterWeapon, shield: null, armor: fighterArmor, helmet: null, gloves: null, boots: null, necklace: null, ring1: null, ring2: null, relic: null, offhand: null }
      },
      { 
        id: 'p2', name: 'Pyra', job: 'Mage', 
        hp: 30, maxHp: 30, mp: 40, maxMp: 40, attack: 4, defense: 4, speed: 6,
        color: '#9b59b6', xp: 0, level: 1,
        equipment: { weapon: mageWeapon, shield: null, armor: mageArmor, helmet: null, gloves: null, boots: null, necklace: null, ring1: null, ring2: null, relic: null, offhand: null }
      },
      { 
        id: 'p3', name: 'Milo', job: 'Monk', 
        hp: 45, maxHp: 45, mp: 10, maxMp: 10, attack: 10, defense: 6, speed: 12,
        color: '#f1c40f', xp: 0, level: 1,
        equipment: { weapon: monkWeapon, shield: null, armor: monkArmor, helmet: null, gloves: null, boots: null, necklace: null, ring1: null, ring2: null, relic: null, offhand: null }
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
  // === EARLY FLOOR MONSTERS (Floors 1-2) ===
  { id: 'm1', name: 'Cave Bat', hp: 12, maxHp: 12, mp: 0, maxMp: 0, attack: 3, defense: 1, speed: 14, xpValue: 6, goldValue: 2, color: '#4a0080', image: caveBatSprite },
  { id: 'm2', name: 'Giant Rat', hp: 15, maxHp: 15, mp: 0, maxMp: 0, attack: 4, defense: 1, speed: 10, xpValue: 8, goldValue: 3, color: '#8B4513', image: giantRatSprite },
  { id: 'm3', name: 'Poison Mushroom', hp: 18, maxHp: 18, mp: 0, maxMp: 0, attack: 4, defense: 2, speed: 3, xpValue: 9, goldValue: 4, color: '#e74c3c', image: poisonMushroomSprite },
  { id: 'm4', name: 'Slimy Ooze', hp: 20, maxHp: 20, mp: 0, maxMp: 0, attack: 5, defense: 2, speed: 4, xpValue: 10, goldValue: 5, color: '#2ecc71', image: slimyOozeSprite },
  { id: 'm5', name: 'Giant Beetle', hp: 18, maxHp: 18, mp: 0, maxMp: 0, attack: 5, defense: 3, speed: 6, xpValue: 10, goldValue: 5, color: '#1a1a2e', image: giantBeetleSprite },
  { id: 'm6', name: 'Cave Crawler', hp: 16, maxHp: 16, mp: 0, maxMp: 0, attack: 6, defense: 1, speed: 9, xpValue: 9, goldValue: 4, color: '#5d4e37', image: caveCrawlerSprite },
  { id: 'm7', name: 'Kobold', hp: 20, maxHp: 20, mp: 0, maxMp: 0, attack: 5, defense: 2, speed: 8, xpValue: 11, goldValue: 6, color: '#8b6914', image: koboldSprite },
  { id: 'm8', name: 'Fire Imp', hp: 14, maxHp: 14, mp: 10, maxMp: 10, attack: 7, defense: 1, speed: 12, xpValue: 12, goldValue: 8, color: '#ff4500', image: fireImpSprite },
  { id: 'm9', name: 'Shadow Wisp', hp: 10, maxHp: 10, mp: 15, maxMp: 15, attack: 8, defense: 0, speed: 15, xpValue: 11, goldValue: 7, color: '#2c2c54', image: shadowWispSprite },
  
  // === MID FLOOR MONSTERS (Floors 3-5) ===
  { id: 'm10', name: 'Dungeon Spider', hp: 22, maxHp: 22, mp: 0, maxMp: 0, attack: 6, defense: 2, speed: 11, xpValue: 12, goldValue: 7, color: '#2c3e50', image: dungeonSpiderSprite },
  { id: 'm11', name: 'Small Goblin', hp: 25, maxHp: 25, mp: 0, maxMp: 0, attack: 6, defense: 3, speed: 9, xpValue: 14, goldValue: 10, color: '#27ae60', image: smallGoblinSprite },
  { id: 'm12', name: 'Zombie', hp: 35, maxHp: 35, mp: 0, maxMp: 0, attack: 7, defense: 2, speed: 3, xpValue: 16, goldValue: 8, color: '#556b2f', image: zombieSprite },
  { id: 'm13', name: 'Slime Warrior', hp: 35, maxHp: 35, mp: 0, maxMp: 0, attack: 8, defense: 3, speed: 5, xpValue: 20, goldValue: 15, color: '#9b59b6', image: slimeWarriorSprite },
  { id: 'm14', name: 'Skeleton', hp: 40, maxHp: 40, mp: 0, maxMp: 0, attack: 10, defense: 4, speed: 7, xpValue: 25, goldValue: 20, color: '#bdc3c7', image: skeletonSprite },
  { id: 'm15', name: 'Harpy', hp: 30, maxHp: 30, mp: 5, maxMp: 5, attack: 9, defense: 2, speed: 13, xpValue: 22, goldValue: 18, color: '#daa520', image: harpySprite },
  { id: 'm16', name: 'Mummy', hp: 45, maxHp: 45, mp: 0, maxMp: 0, attack: 8, defense: 5, speed: 4, xpValue: 28, goldValue: 22, color: '#d2b48c', image: mummySprite },
  { id: 'm17', name: 'Werewolf', hp: 50, maxHp: 50, mp: 0, maxMp: 0, attack: 12, defense: 4, speed: 14, xpValue: 32, goldValue: 28, color: '#4a4a4a', image: werewolfSprite },
  
  // === DEEP FLOOR MONSTERS (Floors 6-8) ===
  { id: 'm18', name: 'Orc Warrior', hp: 60, maxHp: 60, mp: 0, maxMp: 0, attack: 12, defense: 5, speed: 7, xpValue: 40, goldValue: 35, color: '#2d5a27', image: orcWarriorSprite },
  { id: 'm19', name: 'Troll', hp: 80, maxHp: 80, mp: 0, maxMp: 0, attack: 14, defense: 6, speed: 5, xpValue: 50, goldValue: 45, color: '#3d5c3a', image: trollSprite },
  { id: 'm20', name: 'Dark Knight', hp: 70, maxHp: 70, mp: 10, maxMp: 10, attack: 16, defense: 8, speed: 10, xpValue: 55, goldValue: 50, color: '#1a1a2e', image: darkKnightSprite },
  { id: 'm21', name: 'Gargoyle', hp: 65, maxHp: 65, mp: 0, maxMp: 0, attack: 13, defense: 10, speed: 8, xpValue: 48, goldValue: 42, color: '#696969', image: gargoyleSprite },
  { id: 'm22', name: 'Minotaur', hp: 90, maxHp: 90, mp: 0, maxMp: 0, attack: 18, defense: 6, speed: 6, xpValue: 60, goldValue: 55, color: '#8b4513', image: minotaurSprite },
  { id: 'm23', name: 'Wraith', hp: 45, maxHp: 45, mp: 30, maxMp: 30, attack: 15, defense: 3, speed: 16, xpValue: 52, goldValue: 48, color: '#483d8b', image: wraithSprite },
  
  // === BOSS-TIER MONSTERS (Floors 9+) ===
  { id: 'm24', name: 'Golem', hp: 120, maxHp: 120, mp: 0, maxMp: 0, attack: 20, defense: 12, speed: 3, xpValue: 80, goldValue: 75, color: '#708090', image: golemSprite },
  { id: 'm25', name: 'Basilisk', hp: 85, maxHp: 85, mp: 0, maxMp: 0, attack: 22, defense: 8, speed: 9, xpValue: 85, goldValue: 80, color: '#228b22', image: basiliskSprite },
  { id: 'm26', name: 'Death Knight', hp: 100, maxHp: 100, mp: 20, maxMp: 20, attack: 24, defense: 10, speed: 11, xpValue: 95, goldValue: 90, color: '#2f0f3d', image: deathKnightSprite },
  { id: 'm27', name: 'Lich', hp: 70, maxHp: 70, mp: 50, maxMp: 50, attack: 20, defense: 5, speed: 12, xpValue: 100, goldValue: 100, color: '#4b0082', image: lichSprite },
  { id: 'm28', name: 'Demon', hp: 110, maxHp: 110, mp: 25, maxMp: 25, attack: 26, defense: 9, speed: 14, xpValue: 110, goldValue: 110, color: '#8b0000', image: demonSprite },
  { id: 'm29', name: 'Dragon', hp: 150, maxHp: 150, mp: 30, maxMp: 30, attack: 30, defense: 12, speed: 10, xpValue: 150, goldValue: 150, color: '#b22222', image: dragonSprite },
];

export function getRandomMonster(floor: number): Monster {
  // Monster tiers unlock based on floor depth:
  // Floor 1-2: Early monsters (indices 0-8)
  // Floor 3-5: + Mid monsters (indices 9-17)
  // Floor 6-8: + Deep monsters (indices 18-23)
  // Floor 9+:  + Boss-tier monsters (indices 24-28)
  
  let maxIndex: number;
  if (floor <= 2) {
    maxIndex = 9;  // Early monsters only
  } else if (floor <= 5) {
    maxIndex = 18; // + Mid monsters
  } else if (floor <= 8) {
    maxIndex = 24; // + Deep monsters
  } else {
    maxIndex = MONSTERS.length; // All monsters including bosses
  }
  
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
