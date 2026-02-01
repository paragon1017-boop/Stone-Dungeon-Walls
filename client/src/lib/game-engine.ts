// Types and Logic for the Dungeon Crawler

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
  type: 'attack' | 'heal' | 'buff';
  power: number; // multiplier or base value
  description: string;
}

// Equipment System
export type EquipmentSlot = 'weapon' | 'shield' | 'armor' | 'helmet' | 'gloves' | 'boots' | 'necklace' | 'ring' | 'relic' | 'offhand';

// Equipment set names for set bonuses
export type EquipmentSet = 'Blade Dancer' | 'Bulwark Sentinel' | 'Vampiric Embrace' | 'Wind Dancer' | 'Riposte' | 'Frozen Wasteland' | 'Inferno Blaze' | 'Storm Caller' | 'Earthen Colossus' | 'None';

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

// Equipment Database - Organized by tier (common < uncommon < rare < epic < legendary)
// Equipment Database - 243 items across 9 thematic sets
// Sets: Blade Dancer, Bulwark Sentinel, Vampiric Embrace, Wind Dancer, Riposte, 
//       Frozen Wasteland, Inferno Blaze, Storm Caller, Earthen Colossus
export const EQUIPMENT_DATABASE: Equipment[] = [
  // ==================== BLADE DANCER SET (Attack-focused, Fighter/Monk) ====================
  // Weapons
  { id: 'bd_dancing_blade', name: 'Dancing Blade', slot: 'weapon', attack: 18, defense: 0, hp: 0, mp: 0, speed: 3, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'A blade that flows like water. Set: Blade Dancer' },
  { id: 'bd_swift_katana', name: 'Swift Katana', slot: 'weapon', attack: 22, defense: 0, hp: 0, mp: 0, speed: 5, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'Strikes faster than the eye can see. Set: Blade Dancer' },
  { id: 'bd_whirlwind_fists', name: 'Whirlwind Fists', slot: 'weapon', attack: 16, defense: 2, hp: 0, mp: 10, speed: 4, rarity: 'rare', allowedJobs: ['Monk'], set: 'Blade Dancer', description: 'Gloves imbued with wind essence. Set: Blade Dancer' },
  { id: 'bd_tempest_knuckles', name: 'Tempest Knuckles', slot: 'weapon', attack: 20, defense: 3, hp: 0, mp: 15, speed: 6, rarity: 'epic', allowedJobs: ['Monk'], set: 'Blade Dancer', description: 'Strike like a storm. Set: Blade Dancer' },
  // Armor
  { id: 'bd_dancer_vest', name: 'Dancer\'s Vest', slot: 'armor', attack: 2, defense: 8, hp: 15, mp: 0, speed: 3, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Light armor for fluid movement. Set: Blade Dancer' },
  { id: 'bd_flowing_robe', name: 'Flowing Battle Robe', slot: 'armor', attack: 4, defense: 10, hp: 20, mp: 10, speed: 5, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Moves with the wearer. Set: Blade Dancer' },
  // Helmet
  { id: 'bd_swift_circlet', name: 'Swift Circlet', slot: 'helmet', attack: 1, defense: 4, hp: 8, mp: 0, speed: 2, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Enhances reflexes. Set: Blade Dancer' },
  { id: 'bd_wind_crown', name: 'Crown of Winds', slot: 'helmet', attack: 2, defense: 6, hp: 12, mp: 5, speed: 4, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Wind whispers guidance. Set: Blade Dancer' },
  // Gloves
  { id: 'bd_agile_gloves', name: 'Agile Gloves', slot: 'gloves', attack: 3, defense: 2, hp: 0, mp: 0, speed: 2, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Perfect grip and dexterity. Set: Blade Dancer' },
  { id: 'bd_flash_gauntlets', name: 'Flash Gauntlets', slot: 'gloves', attack: 5, defense: 3, hp: 5, mp: 0, speed: 4, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Strike in a flash. Set: Blade Dancer' },
  // Boots
  { id: 'bd_dancer_boots', name: 'Dancer\'s Boots', slot: 'boots', attack: 1, defense: 3, hp: 0, mp: 0, speed: 3, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Silent and swift. Set: Blade Dancer' },
  { id: 'bd_zephyr_treads', name: 'Zephyr Treads', slot: 'boots', attack: 2, defense: 4, hp: 5, mp: 0, speed: 5, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Walk on wind. Set: Blade Dancer' },
  // Necklace
  { id: 'bd_swift_pendant', name: 'Swift Pendant', slot: 'necklace', attack: 2, defense: 0, hp: 10, mp: 0, speed: 2, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Quickens the spirit. Set: Blade Dancer' },
  { id: 'bd_haste_amulet', name: 'Amulet of Haste', slot: 'necklace', attack: 3, defense: 1, hp: 15, mp: 5, speed: 4, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Time seems to slow. Set: Blade Dancer' },
  // Rings
  { id: 'bd_speed_ring', name: 'Ring of Speed', slot: 'ring', attack: 1, defense: 0, hp: 5, mp: 0, speed: 2, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Enhances agility. Set: Blade Dancer' },
  { id: 'bd_velocity_band', name: 'Velocity Band', slot: 'ring', attack: 2, defense: 1, hp: 8, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Move like lightning. Set: Blade Dancer' },
  { id: 'bd_blur_ring', name: 'Blur Ring', slot: 'ring', attack: 1, defense: 1, hp: 5, mp: 5, speed: 2, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Become a blur. Set: Blade Dancer' },
  { id: 'bd_phantom_band', name: 'Phantom Band', slot: 'ring', attack: 2, defense: 2, hp: 10, mp: 5, speed: 3, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Blade Dancer', description: 'Phase through attacks. Set: Blade Dancer' },
  // Relic (Mage) - Blade Dancer doesn't have Mage items, use offhand for Monk
  { id: 'bd_wind_charm', name: 'Wind Charm', slot: 'offhand', attack: 4, defense: 1, hp: 10, mp: 10, speed: 3, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], set: 'Blade Dancer', description: 'Channels wind energy. Set: Blade Dancer' },
  { id: 'bd_tempest_focus', name: 'Tempest Focus', slot: 'offhand', attack: 6, defense: 2, hp: 15, mp: 15, speed: 5, rarity: 'epic', allowedJobs: ['Mage', 'Monk'], set: 'Blade Dancer', description: 'Focus of the storm. Set: Blade Dancer' },
  // Shield (Fighter)
  { id: 'bd_parry_buckler', name: 'Parry Buckler', slot: 'shield', attack: 2, defense: 6, hp: 10, mp: 0, speed: 2, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'Light for quick parries. Set: Blade Dancer' },
  { id: 'bd_deflection_guard', name: 'Deflection Guard', slot: 'shield', attack: 3, defense: 8, hp: 15, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'Redirects force effortlessly. Set: Blade Dancer' },

  // ==================== BULWARK SENTINEL SET (Defense-focused, Fighter) ====================
  // Weapons
  { id: 'bs_warden_blade', name: 'Warden\'s Blade', slot: 'weapon', attack: 12, defense: 5, hp: 20, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'A defender\'s weapon. Set: Bulwark Sentinel' },
  { id: 'bs_fortress_sword', name: 'Fortress Sword', slot: 'weapon', attack: 15, defense: 8, hp: 30, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Heavy but impenetrable. Set: Bulwark Sentinel' },
  { id: 'bs_guardian_mace', name: 'Guardian\'s Mace', slot: 'weapon', attack: 14, defense: 6, hp: 25, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Crush those who threaten. Set: Bulwark Sentinel' },
  { id: 'bs_bastion_hammer', name: 'Bastion Hammer', slot: 'weapon', attack: 18, defense: 10, hp: 40, mp: 0, speed: -2, rarity: 'legendary', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'The ultimate guardian weapon. Set: Bulwark Sentinel' },
  // Armor
  { id: 'bs_sentinel_plate', name: 'Sentinel Plate', slot: 'armor', attack: 0, defense: 18, hp: 40, mp: 0, speed: -1, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Heavy protective armor. Set: Bulwark Sentinel' },
  { id: 'bs_fortress_armor', name: 'Fortress Armor', slot: 'armor', attack: 0, defense: 25, hp: 60, mp: 0, speed: -2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Walking fortress. Set: Bulwark Sentinel' },
  { id: 'bs_citadel_plate', name: 'Citadel Plate', slot: 'armor', attack: 2, defense: 30, hp: 80, mp: 0, speed: -3, rarity: 'legendary', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Impenetrable defense. Set: Bulwark Sentinel' },
  // Helmet
  { id: 'bs_warden_helm', name: 'Warden\'s Helm', slot: 'helmet', attack: 0, defense: 8, hp: 20, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Protects the vigilant. Set: Bulwark Sentinel' },
  { id: 'bs_tower_helm', name: 'Tower Helm', slot: 'helmet', attack: 0, defense: 12, hp: 30, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Unyielding protection. Set: Bulwark Sentinel' },
  // Gloves
  { id: 'bs_iron_gauntlets', name: 'Iron Gauntlets', slot: 'gloves', attack: 2, defense: 6, hp: 15, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Reinforced hand protection. Set: Bulwark Sentinel' },
  { id: 'bs_adamant_fists', name: 'Adamant Fists', slot: 'gloves', attack: 3, defense: 10, hp: 25, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Unbreakable grip. Set: Bulwark Sentinel' },
  // Boots
  { id: 'bs_sentinel_greaves', name: 'Sentinel Greaves', slot: 'boots', attack: 0, defense: 6, hp: 15, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Stand firm. Set: Bulwark Sentinel' },
  { id: 'bs_immovable_boots', name: 'Immovable Boots', slot: 'boots', attack: 0, defense: 10, hp: 25, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Cannot be moved. Set: Bulwark Sentinel' },
  // Shield
  { id: 'bs_tower_shield', name: 'Tower Shield', slot: 'shield', attack: 0, defense: 15, hp: 30, mp: 0, speed: -1, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Massive protective barrier. Set: Bulwark Sentinel' },
  { id: 'bs_fortress_wall', name: 'Fortress Wall', slot: 'shield', attack: 0, defense: 22, hp: 50, mp: 0, speed: -2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'A wall of steel. Set: Bulwark Sentinel' },
  { id: 'bs_aegis_eternal', name: 'Aegis Eternal', slot: 'shield', attack: 2, defense: 28, hp: 70, mp: 0, speed: -2, rarity: 'legendary', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'The ultimate shield. Set: Bulwark Sentinel' },
  // Necklace
  { id: 'bs_guardian_chain', name: 'Guardian Chain', slot: 'necklace', attack: 0, defense: 4, hp: 25, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Protective amulet. Set: Bulwark Sentinel' },
  { id: 'bs_fortress_pendant', name: 'Fortress Pendant', slot: 'necklace', attack: 0, defense: 6, hp: 40, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Enhances fortitude. Set: Bulwark Sentinel' },
  // Rings
  { id: 'bs_iron_band', name: 'Iron Band', slot: 'ring', attack: 0, defense: 3, hp: 15, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Sturdy protection. Set: Bulwark Sentinel' },
  { id: 'bs_adamant_ring', name: 'Adamant Ring', slot: 'ring', attack: 0, defense: 5, hp: 25, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Unbreakable. Set: Bulwark Sentinel' },
  { id: 'bs_warden_signet', name: 'Warden\'s Signet', slot: 'ring', attack: 1, defense: 4, hp: 20, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Mark of the guardian. Set: Bulwark Sentinel' },
  { id: 'bs_citadel_seal', name: 'Citadel Seal', slot: 'ring', attack: 1, defense: 6, hp: 30, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Seal of the fortress. Set: Bulwark Sentinel' },

  // ==================== VAMPIRIC EMBRACE SET (Lifesteal-themed, Fighter/Monk) ====================
  // Weapons
  { id: 've_bloodthirst_blade', name: 'Bloodthirst Blade', slot: 'weapon', attack: 20, defense: 0, hp: -10, mp: 0, speed: 2, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Drains life with each strike. Set: Vampiric Embrace' },
  { id: 've_sanguine_sword', name: 'Sanguine Sword', slot: 'weapon', attack: 26, defense: 0, hp: -15, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Thirsts for blood. Set: Vampiric Embrace' },
  { id: 've_crimson_fists', name: 'Crimson Fists', slot: 'weapon', attack: 18, defense: 0, hp: -8, mp: 5, speed: 2, rarity: 'rare', allowedJobs: ['Monk'], set: 'Vampiric Embrace', description: 'Blood-soaked knuckles. Set: Vampiric Embrace' },
  { id: 've_blood_lotus', name: 'Blood Lotus', slot: 'weapon', attack: 24, defense: 0, hp: -12, mp: 10, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Vampiric Embrace', description: 'Beautiful and deadly. Set: Vampiric Embrace' },
  // Armor
  { id: 've_bloodweave', name: 'Bloodweave Armor', slot: 'armor', attack: 3, defense: 10, hp: 0, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Woven with blood magic. Set: Vampiric Embrace' },
  { id: 've_crimson_shroud', name: 'Crimson Shroud', slot: 'armor', attack: 5, defense: 14, hp: 0, mp: 10, speed: 2, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Bathed in crimson. Set: Vampiric Embrace' },
  // Helmet
  { id: 've_vampire_crown', name: 'Vampire Crown', slot: 'helmet', attack: 2, defense: 5, hp: 0, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Crown of the night. Set: Vampiric Embrace' },
  { id: 've_lords_diadem', name: 'Blood Lord\'s Diadem', slot: 'helmet', attack: 4, defense: 8, hp: 0, mp: 5, speed: 2, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Ruler of blood. Set: Vampiric Embrace' },
  // Gloves
  { id: 've_bloodstained_grips', name: 'Bloodstained Grips', slot: 'gloves', attack: 4, defense: 2, hp: 0, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Stained crimson. Set: Vampiric Embrace' },
  { id: 've_sanguine_claws', name: 'Sanguine Claws', slot: 'gloves', attack: 7, defense: 3, hp: 0, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Rend and drain. Set: Vampiric Embrace' },
  // Boots
  { id: 've_stalker_boots', name: 'Stalker Boots', slot: 'boots', attack: 2, defense: 3, hp: 0, mp: 0, speed: 2, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Hunt in silence. Set: Vampiric Embrace' },
  { id: 've_nightwalkers', name: 'Nightwalkers', slot: 'boots', attack: 4, defense: 5, hp: 0, mp: 5, speed: 3, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'One with the night. Set: Vampiric Embrace' },
  // Necklace
  { id: 've_blood_pendant', name: 'Blood Pendant', slot: 'necklace', attack: 3, defense: 0, hp: 0, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Pulses with life. Set: Vampiric Embrace' },
  { id: 've_crimson_heart', name: 'Crimson Heart', slot: 'necklace', attack: 5, defense: 0, hp: 0, mp: 10, speed: 2, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Still beating. Set: Vampiric Embrace' },
  // Rings
  { id: 've_bloodstone_ring', name: 'Bloodstone Ring', slot: 'ring', attack: 2, defense: 0, hp: 0, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Deep red stone. Set: Vampiric Embrace' },
  { id: 've_sanguine_seal', name: 'Sanguine Seal', slot: 'ring', attack: 4, defense: 0, hp: 0, mp: 5, speed: 2, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Sealed in blood. Set: Vampiric Embrace' },
  { id: 've_vampire_band', name: 'Vampire\'s Band', slot: 'ring', attack: 3, defense: 1, hp: 0, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Gift of the undead. Set: Vampiric Embrace' },
  { id: 've_nosferatu_ring', name: 'Nosferatu Ring', slot: 'ring', attack: 5, defense: 2, hp: 0, mp: 5, speed: 2, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], set: 'Vampiric Embrace', description: 'Ancient vampire power. Set: Vampiric Embrace' },
  // Offhand (Monk)
  { id: 've_blood_focus', name: 'Blood Focus', slot: 'offhand', attack: 5, defense: 0, hp: 0, mp: 15, speed: 1, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], set: 'Vampiric Embrace', description: 'Focus blood energy. Set: Vampiric Embrace' },
  { id: 've_crimson_crystal', name: 'Crimson Crystal', slot: 'offhand', attack: 8, defense: 0, hp: 0, mp: 25, speed: 2, rarity: 'epic', allowedJobs: ['Mage', 'Monk'], set: 'Vampiric Embrace', description: 'Crystallized blood. Set: Vampiric Embrace' },
  // Shield (Fighter)
  { id: 've_blood_aegis', name: 'Blood Aegis', slot: 'shield', attack: 3, defense: 8, hp: 0, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Absorbs damage as life. Set: Vampiric Embrace' },
  { id: 've_sanguine_barrier', name: 'Sanguine Barrier', slot: 'shield', attack: 5, defense: 12, hp: 0, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Barrier of blood. Set: Vampiric Embrace' },

  // ==================== WIND DANCER SET (Evasion/Speed, all classes) ====================
  // Weapons
  { id: 'wd_breeze_blade', name: 'Breeze Blade', slot: 'weapon', attack: 14, defense: 0, hp: 0, mp: 0, speed: 4, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Light as a breeze. Set: Wind Dancer' },
  { id: 'wd_cyclone_saber', name: 'Cyclone Saber', slot: 'weapon', attack: 18, defense: 0, hp: 0, mp: 0, speed: 6, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Spins like a cyclone. Set: Wind Dancer' },
  { id: 'wd_gale_staff', name: 'Gale Staff', slot: 'weapon', attack: 8, defense: 0, hp: 0, mp: 30, speed: 4, rarity: 'rare', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Commands the gale. Set: Wind Dancer' },
  { id: 'wd_hurricane_rod', name: 'Hurricane Rod', slot: 'weapon', attack: 12, defense: 0, hp: 0, mp: 45, speed: 6, rarity: 'epic', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Storm in a rod. Set: Wind Dancer' },
  { id: 'wd_wind_fists', name: 'Wind Fists', slot: 'weapon', attack: 12, defense: 0, hp: 0, mp: 10, speed: 4, rarity: 'rare', allowedJobs: ['Monk'], set: 'Wind Dancer', description: 'Strike with wind. Set: Wind Dancer' },
  { id: 'wd_typhoon_knuckles', name: 'Typhoon Knuckles', slot: 'weapon', attack: 16, defense: 0, hp: 0, mp: 18, speed: 6, rarity: 'epic', allowedJobs: ['Monk'], set: 'Wind Dancer', description: 'Fists of the typhoon. Set: Wind Dancer' },
  // Armor
  { id: 'wd_breeze_tunic', name: 'Breeze Tunic', slot: 'armor', attack: 0, defense: 6, hp: 10, mp: 5, speed: 3, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Light as air. Set: Wind Dancer' },
  { id: 'wd_cyclone_garb', name: 'Cyclone Garb', slot: 'armor', attack: 2, defense: 9, hp: 15, mp: 10, speed: 5, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Worn by wind masters. Set: Wind Dancer' },
  // Helmet
  { id: 'wd_wind_cap', name: 'Wind Cap', slot: 'helmet', attack: 0, defense: 3, hp: 5, mp: 5, speed: 2, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Hair flows freely. Set: Wind Dancer' },
  { id: 'wd_gale_crown', name: 'Gale Crown', slot: 'helmet', attack: 1, defense: 5, hp: 10, mp: 10, speed: 4, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Crown of storms. Set: Wind Dancer' },
  // Gloves
  { id: 'wd_feather_gloves', name: 'Feather Gloves', slot: 'gloves', attack: 2, defense: 1, hp: 0, mp: 5, speed: 2, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Light touch. Set: Wind Dancer' },
  { id: 'wd_tempest_mitts', name: 'Tempest Mitts', slot: 'gloves', attack: 3, defense: 2, hp: 5, mp: 10, speed: 4, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Command the tempest. Set: Wind Dancer' },
  // Boots
  { id: 'wd_cloud_walkers', name: 'Cloud Walkers', slot: 'boots', attack: 0, defense: 2, hp: 0, mp: 5, speed: 4, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Walk on clouds. Set: Wind Dancer' },
  { id: 'wd_sky_striders', name: 'Sky Striders', slot: 'boots', attack: 1, defense: 3, hp: 5, mp: 10, speed: 6, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Stride through sky. Set: Wind Dancer' },
  // Necklace
  { id: 'wd_feather_pendant', name: 'Feather Pendant', slot: 'necklace', attack: 1, defense: 1, hp: 5, mp: 10, speed: 2, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Light as a feather. Set: Wind Dancer' },
  { id: 'wd_zephyr_charm', name: 'Zephyr Charm', slot: 'necklace', attack: 2, defense: 2, hp: 10, mp: 15, speed: 4, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Blessed by zephyrs. Set: Wind Dancer' },
  // Rings
  { id: 'wd_air_ring', name: 'Air Ring', slot: 'ring', attack: 1, defense: 0, hp: 0, mp: 5, speed: 2, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Essence of air. Set: Wind Dancer' },
  { id: 'wd_gale_band', name: 'Gale Band', slot: 'ring', attack: 2, defense: 1, hp: 5, mp: 10, speed: 3, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Band of gales. Set: Wind Dancer' },
  { id: 'wd_breeze_signet', name: 'Breeze Signet', slot: 'ring', attack: 1, defense: 1, hp: 5, mp: 5, speed: 2, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Signet of wind. Set: Wind Dancer' },
  { id: 'wd_tempest_seal', name: 'Tempest Seal', slot: 'ring', attack: 2, defense: 2, hp: 10, mp: 10, speed: 3, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], set: 'Wind Dancer', description: 'Seal of storms. Set: Wind Dancer' },
  // Relic (Mage)
  { id: 'wd_wind_crystal', name: 'Wind Crystal', slot: 'relic', attack: 3, defense: 0, hp: 5, mp: 25, speed: 3, rarity: 'rare', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Crystallized wind. Set: Wind Dancer' },
  { id: 'wd_storm_orb', name: 'Storm Orb', slot: 'relic', attack: 5, defense: 1, hp: 10, mp: 40, speed: 5, rarity: 'epic', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Contains a storm. Set: Wind Dancer' },
  // Offhand (Monk)
  { id: 'wd_breeze_fan', name: 'Breeze Fan', slot: 'offhand', attack: 3, defense: 1, hp: 5, mp: 15, speed: 3, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], set: 'Wind Dancer', description: 'Creates gentle breezes. Set: Wind Dancer' },
  { id: 'wd_cyclone_spinner', name: 'Cyclone Spinner', slot: 'offhand', attack: 5, defense: 2, hp: 10, mp: 25, speed: 5, rarity: 'epic', allowedJobs: ['Mage', 'Monk'], set: 'Wind Dancer', description: 'Spins up cyclones. Set: Wind Dancer' },
  // Shield (Fighter)
  { id: 'wd_wind_barrier', name: 'Wind Barrier', slot: 'shield', attack: 1, defense: 5, hp: 5, mp: 0, speed: 2, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Deflects with wind. Set: Wind Dancer' },
  { id: 'wd_gale_guard', name: 'Gale Guard', slot: 'shield', attack: 2, defense: 8, hp: 10, mp: 5, speed: 4, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Guarded by gales. Set: Wind Dancer' },

  // ==================== RIPOSTE SET (Counter-attack focused, Fighter) ====================
  // Weapons
  { id: 'rp_counter_blade', name: 'Counter Blade', slot: 'weapon', attack: 16, defense: 4, hp: 0, mp: 0, speed: 2, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Strike back harder. Set: Riposte' },
  { id: 'rp_vengeance_sword', name: 'Vengeance Sword', slot: 'weapon', attack: 22, defense: 6, hp: 0, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Returns all pain. Set: Riposte' },
  { id: 'rp_retribution', name: 'Retribution', slot: 'weapon', attack: 28, defense: 8, hp: 10, mp: 0, speed: 4, rarity: 'legendary', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Justice delivered. Set: Riposte' },
  // Armor
  { id: 'rp_thorn_mail', name: 'Thorn Mail', slot: 'armor', attack: 4, defense: 14, hp: 20, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Hurts those who strike. Set: Riposte' },
  { id: 'rp_bramble_armor', name: 'Bramble Armor', slot: 'armor', attack: 6, defense: 18, hp: 30, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Covered in thorns. Set: Riposte' },
  { id: 'rp_spike_fortress', name: 'Spike Fortress', slot: 'armor', attack: 10, defense: 24, hp: 45, mp: 0, speed: 2, rarity: 'legendary', allowedJobs: ['Fighter'], set: 'Riposte', description: 'A walking spike trap. Set: Riposte' },
  // Helmet
  { id: 'rp_thorn_crown', name: 'Thorn Crown', slot: 'helmet', attack: 2, defense: 6, hp: 10, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Pain is power. Set: Riposte' },
  { id: 'rp_bramble_helm', name: 'Bramble Helm', slot: 'helmet', attack: 4, defense: 10, hp: 15, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Protected by thorns. Set: Riposte' },
  // Gloves
  { id: 'rp_spike_gauntlets', name: 'Spike Gauntlets', slot: 'gloves', attack: 5, defense: 4, hp: 5, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Spiked for combat. Set: Riposte' },
  { id: 'rp_thorn_fists', name: 'Thorn Fists', slot: 'gloves', attack: 8, defense: 6, hp: 10, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Every touch hurts. Set: Riposte' },
  // Boots
  { id: 'rp_bramble_boots', name: 'Bramble Boots', slot: 'boots', attack: 2, defense: 4, hp: 5, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Thorny steps. Set: Riposte' },
  { id: 'rp_spike_treads', name: 'Spike Treads', slot: 'boots', attack: 4, defense: 6, hp: 10, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Leave marks. Set: Riposte' },
  // Shield
  { id: 'rp_thorn_shield', name: 'Thorn Shield', slot: 'shield', attack: 3, defense: 10, hp: 10, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Reflects damage. Set: Riposte' },
  { id: 'rp_spike_barrier', name: 'Spike Barrier', slot: 'shield', attack: 5, defense: 15, hp: 20, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Don\'t touch. Set: Riposte' },
  { id: 'rp_vengeance_wall', name: 'Vengeance Wall', slot: 'shield', attack: 8, defense: 20, hp: 30, mp: 0, speed: 2, rarity: 'legendary', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Returns all harm. Set: Riposte' },
  // Necklace
  { id: 'rp_thorn_pendant', name: 'Thorn Pendant', slot: 'necklace', attack: 2, defense: 2, hp: 15, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Pain amplifier. Set: Riposte' },
  { id: 'rp_retribution_charm', name: 'Retribution Charm', slot: 'necklace', attack: 4, defense: 4, hp: 25, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Channels vengeance. Set: Riposte' },
  // Rings
  { id: 'rp_spike_ring', name: 'Spike Ring', slot: 'ring', attack: 2, defense: 2, hp: 8, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Thorny band. Set: Riposte' },
  { id: 'rp_vengeance_band', name: 'Vengeance Band', slot: 'ring', attack: 4, defense: 3, hp: 12, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Band of revenge. Set: Riposte' },
  { id: 'rp_counter_signet', name: 'Counter Signet', slot: 'ring', attack: 3, defense: 2, hp: 10, mp: 0, speed: 1, rarity: 'rare', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Counters all. Set: Riposte' },
  { id: 'rp_thorn_seal', name: 'Thorn Seal', slot: 'ring', attack: 5, defense: 4, hp: 15, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Sealed in thorns. Set: Riposte' },

  // ==================== FROZEN WASTELAND SET (Ice/slow effects, Mage) ====================
  // Weapons
  { id: 'fw_frost_staff', name: 'Frost Staff', slot: 'weapon', attack: 8, defense: 2, hp: 5, mp: 35, speed: 0, rarity: 'rare', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Chills the air. Set: Frozen Wasteland' },
  { id: 'fw_blizzard_rod', name: 'Blizzard Rod', slot: 'weapon', attack: 12, defense: 3, hp: 10, mp: 50, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Summons blizzards. Set: Frozen Wasteland' },
  { id: 'fw_absolute_zero', name: 'Absolute Zero', slot: 'weapon', attack: 16, defense: 5, hp: 15, mp: 70, speed: 0, rarity: 'legendary', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Freezes all. Set: Frozen Wasteland' },
  // Armor
  { id: 'fw_frost_robe', name: 'Frost Robe', slot: 'armor', attack: 2, defense: 8, hp: 10, mp: 25, speed: 0, rarity: 'rare', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Cold to touch. Set: Frozen Wasteland' },
  { id: 'fw_blizzard_cloak', name: 'Blizzard Cloak', slot: 'armor', attack: 4, defense: 12, hp: 15, mp: 40, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Wrapped in snow. Set: Frozen Wasteland' },
  { id: 'fw_glacial_mantle', name: 'Glacial Mantle', slot: 'armor', attack: 6, defense: 16, hp: 25, mp: 60, speed: 0, rarity: 'legendary', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Ice incarnate. Set: Frozen Wasteland' },
  // Helmet
  { id: 'fw_ice_crown', name: 'Ice Crown', slot: 'helmet', attack: 1, defense: 4, hp: 5, mp: 15, speed: 0, rarity: 'rare', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Crown of ice. Set: Frozen Wasteland' },
  { id: 'fw_frost_diadem', name: 'Frost Diadem', slot: 'helmet', attack: 2, defense: 6, hp: 10, mp: 25, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Frozen elegance. Set: Frozen Wasteland' },
  // Gloves
  { id: 'fw_frostbite_gloves', name: 'Frostbite Gloves', slot: 'gloves', attack: 2, defense: 2, hp: 0, mp: 12, speed: 0, rarity: 'rare', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Touch of frost. Set: Frozen Wasteland' },
  { id: 'fw_glacier_hands', name: 'Glacier Hands', slot: 'gloves', attack: 4, defense: 4, hp: 5, mp: 20, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Frozen solid. Set: Frozen Wasteland' },
  // Boots
  { id: 'fw_snow_treads', name: 'Snow Treads', slot: 'boots', attack: 0, defense: 3, hp: 0, mp: 10, speed: 1, rarity: 'rare', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Walk on snow. Set: Frozen Wasteland' },
  { id: 'fw_glacier_stride', name: 'Glacier Stride', slot: 'boots', attack: 1, defense: 5, hp: 5, mp: 18, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Stride over ice. Set: Frozen Wasteland' },
  // Relic
  { id: 'fw_frost_crystal', name: 'Frost Crystal', slot: 'relic', attack: 4, defense: 1, hp: 5, mp: 30, speed: 0, rarity: 'rare', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Pure ice magic. Set: Frozen Wasteland' },
  { id: 'fw_blizzard_orb', name: 'Blizzard Orb', slot: 'relic', attack: 6, defense: 2, hp: 10, mp: 45, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Contains eternal winter. Set: Frozen Wasteland' },
  { id: 'fw_heart_of_winter', name: 'Heart of Winter', slot: 'relic', attack: 10, defense: 4, hp: 20, mp: 65, speed: 0, rarity: 'legendary', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Winter\'s core. Set: Frozen Wasteland' },
  // Necklace
  { id: 'fw_icicle_pendant', name: 'Icicle Pendant', slot: 'necklace', attack: 2, defense: 1, hp: 5, mp: 15, speed: 0, rarity: 'rare', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Never melts. Set: Frozen Wasteland' },
  { id: 'fw_avalanche_charm', name: 'Avalanche Charm', slot: 'necklace', attack: 4, defense: 2, hp: 10, mp: 25, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Power of avalanche. Set: Frozen Wasteland' },
  // Rings
  { id: 'fw_frost_ring', name: 'Frost Ring', slot: 'ring', attack: 1, defense: 1, hp: 0, mp: 10, speed: 0, rarity: 'rare', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Cold band. Set: Frozen Wasteland' },
  { id: 'fw_glacier_band', name: 'Glacier Band', slot: 'ring', attack: 2, defense: 2, hp: 5, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Ancient ice. Set: Frozen Wasteland' },
  { id: 'fw_permafrost_signet', name: 'Permafrost Signet', slot: 'ring', attack: 1, defense: 1, hp: 5, mp: 12, speed: 0, rarity: 'rare', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Eternal cold. Set: Frozen Wasteland' },
  { id: 'fw_tundra_seal', name: 'Tundra Seal', slot: 'ring', attack: 3, defense: 2, hp: 8, mp: 20, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Seal of the tundra. Set: Frozen Wasteland' },

  // ==================== INFERNO BLAZE SET (Fire damage, Mage) ====================
  // Weapons
  { id: 'ib_flame_staff', name: 'Flame Staff', slot: 'weapon', attack: 12, defense: 0, hp: 0, mp: 30, speed: 1, rarity: 'rare', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Burns with passion. Set: Inferno Blaze' },
  { id: 'ib_inferno_rod', name: 'Inferno Rod', slot: 'weapon', attack: 18, defense: 0, hp: 0, mp: 45, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Wield the inferno. Set: Inferno Blaze' },
  { id: 'ib_phoenix_wand', name: 'Phoenix Wand', slot: 'weapon', attack: 24, defense: 0, hp: 10, mp: 65, speed: 3, rarity: 'legendary', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Reborn in flame. Set: Inferno Blaze' },
  // Armor
  { id: 'ib_ember_robe', name: 'Ember Robe', slot: 'armor', attack: 3, defense: 6, hp: 5, mp: 25, speed: 1, rarity: 'rare', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Smoldering warmth. Set: Inferno Blaze' },
  { id: 'ib_blaze_cloak', name: 'Blaze Cloak', slot: 'armor', attack: 5, defense: 10, hp: 10, mp: 40, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Cloaked in fire. Set: Inferno Blaze' },
  { id: 'ib_phoenix_mantle', name: 'Phoenix Mantle', slot: 'armor', attack: 8, defense: 14, hp: 20, mp: 55, speed: 3, rarity: 'legendary', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Rise from ashes. Set: Inferno Blaze' },
  // Helmet
  { id: 'ib_flame_crown', name: 'Flame Crown', slot: 'helmet', attack: 2, defense: 3, hp: 0, mp: 15, speed: 1, rarity: 'rare', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Crown of flames. Set: Inferno Blaze' },
  { id: 'ib_inferno_diadem', name: 'Inferno Diadem', slot: 'helmet', attack: 4, defense: 5, hp: 5, mp: 25, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Burning bright. Set: Inferno Blaze' },
  // Gloves
  { id: 'ib_ember_gloves', name: 'Ember Gloves', slot: 'gloves', attack: 3, defense: 1, hp: 0, mp: 12, speed: 1, rarity: 'rare', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Warm hands. Set: Inferno Blaze' },
  { id: 'ib_blaze_hands', name: 'Blaze Hands', slot: 'gloves', attack: 5, defense: 2, hp: 5, mp: 20, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Touch of fire. Set: Inferno Blaze' },
  // Boots
  { id: 'ib_cinder_steps', name: 'Cinder Steps', slot: 'boots', attack: 1, defense: 2, hp: 0, mp: 10, speed: 2, rarity: 'rare', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Leave embers. Set: Inferno Blaze' },
  { id: 'ib_flame_walkers', name: 'Flame Walkers', slot: 'boots', attack: 2, defense: 4, hp: 5, mp: 18, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Walk through fire. Set: Inferno Blaze' },
  // Relic
  { id: 'ib_ember_crystal', name: 'Ember Crystal', slot: 'relic', attack: 5, defense: 0, hp: 0, mp: 28, speed: 1, rarity: 'rare', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Captured flame. Set: Inferno Blaze' },
  { id: 'ib_inferno_orb', name: 'Inferno Orb', slot: 'relic', attack: 8, defense: 0, hp: 5, mp: 42, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Ball of fire. Set: Inferno Blaze' },
  { id: 'ib_phoenix_heart', name: 'Phoenix Heart', slot: 'relic', attack: 12, defense: 2, hp: 15, mp: 60, speed: 3, rarity: 'legendary', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Heart of rebirth. Set: Inferno Blaze' },
  // Necklace
  { id: 'ib_flame_pendant', name: 'Flame Pendant', slot: 'necklace', attack: 3, defense: 0, hp: 0, mp: 15, speed: 1, rarity: 'rare', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Warm glow. Set: Inferno Blaze' },
  { id: 'ib_inferno_charm', name: 'Inferno Charm', slot: 'necklace', attack: 5, defense: 1, hp: 5, mp: 25, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Burns eternally. Set: Inferno Blaze' },
  // Rings
  { id: 'ib_ember_ring', name: 'Ember Ring', slot: 'ring', attack: 2, defense: 0, hp: 0, mp: 10, speed: 1, rarity: 'rare', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Warm band. Set: Inferno Blaze' },
  { id: 'ib_blaze_band', name: 'Blaze Band', slot: 'ring', attack: 4, defense: 0, hp: 0, mp: 18, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Ring of fire. Set: Inferno Blaze' },
  { id: 'ib_cinder_signet', name: 'Cinder Signet', slot: 'ring', attack: 2, defense: 1, hp: 5, mp: 12, speed: 1, rarity: 'rare', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Smoldering seal. Set: Inferno Blaze' },
  { id: 'ib_phoenix_seal', name: 'Phoenix Seal', slot: 'ring', attack: 5, defense: 1, hp: 8, mp: 22, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Mark of rebirth. Set: Inferno Blaze' },

  // ==================== STORM CALLER SET (Lightning/thunder, Mage/Monk) ====================
  // Weapons
  { id: 'sc_spark_staff', name: 'Spark Staff', slot: 'weapon', attack: 10, defense: 0, hp: 0, mp: 32, speed: 2, rarity: 'rare', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Crackles with energy. Set: Storm Caller' },
  { id: 'sc_thunder_rod', name: 'Thunder Rod', slot: 'weapon', attack: 15, defense: 0, hp: 0, mp: 48, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Summons thunder. Set: Storm Caller' },
  { id: 'sc_storm_fists', name: 'Storm Fists', slot: 'weapon', attack: 16, defense: 2, hp: 0, mp: 15, speed: 3, rarity: 'rare', allowedJobs: ['Monk'], set: 'Storm Caller', description: 'Electrified strikes. Set: Storm Caller' },
  { id: 'sc_lightning_knuckles', name: 'Lightning Knuckles', slot: 'weapon', attack: 22, defense: 3, hp: 0, mp: 22, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: 'Storm Caller', description: 'Strike like lightning. Set: Storm Caller' },
  // Armor
  { id: 'sc_spark_robe', name: 'Spark Robe', slot: 'armor', attack: 2, defense: 7, hp: 8, mp: 22, speed: 2, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Static charged. Set: Storm Caller' },
  { id: 'sc_thunder_cloak', name: 'Thunder Cloak', slot: 'armor', attack: 4, defense: 11, hp: 12, mp: 35, speed: 3, rarity: 'epic', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Wrapped in storm. Set: Storm Caller' },
  // Helmet
  { id: 'sc_spark_crown', name: 'Spark Crown', slot: 'helmet', attack: 1, defense: 4, hp: 5, mp: 12, speed: 1, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Electric crown. Set: Storm Caller' },
  { id: 'sc_thunder_helm', name: 'Thunder Helm', slot: 'helmet', attack: 2, defense: 6, hp: 8, mp: 20, speed: 2, rarity: 'epic', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Storm protection. Set: Storm Caller' },
  // Gloves
  { id: 'sc_shock_gloves', name: 'Shock Gloves', slot: 'gloves', attack: 3, defense: 2, hp: 0, mp: 10, speed: 1, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Shocking touch. Set: Storm Caller' },
  { id: 'sc_bolt_gauntlets', name: 'Bolt Gauntlets', slot: 'gloves', attack: 5, defense: 3, hp: 5, mp: 18, speed: 2, rarity: 'epic', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Conduct lightning. Set: Storm Caller' },
  // Boots
  { id: 'sc_static_boots', name: 'Static Boots', slot: 'boots', attack: 1, defense: 3, hp: 0, mp: 8, speed: 2, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Charge up. Set: Storm Caller' },
  { id: 'sc_lightning_stride', name: 'Lightning Stride', slot: 'boots', attack: 2, defense: 5, hp: 5, mp: 15, speed: 4, rarity: 'epic', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Move like lightning. Set: Storm Caller' },
  // Relic (Mage)
  { id: 'sc_spark_crystal', name: 'Spark Crystal', slot: 'relic', attack: 4, defense: 0, hp: 0, mp: 28, speed: 2, rarity: 'rare', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Stored electricity. Set: Storm Caller' },
  { id: 'sc_thunder_orb', name: 'Thunder Orb', slot: 'relic', attack: 7, defense: 1, hp: 5, mp: 42, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Rolling thunder. Set: Storm Caller' },
  // Offhand (Monk)
  { id: 'sc_storm_charm', name: 'Storm Charm', slot: 'offhand', attack: 4, defense: 1, hp: 5, mp: 18, speed: 2, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Storm focus. Set: Storm Caller' },
  { id: 'sc_lightning_focus', name: 'Lightning Focus', slot: 'offhand', attack: 7, defense: 2, hp: 10, mp: 28, speed: 3, rarity: 'epic', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Channel lightning. Set: Storm Caller' },
  // Necklace
  { id: 'sc_spark_pendant', name: 'Spark Pendant', slot: 'necklace', attack: 2, defense: 1, hp: 5, mp: 12, speed: 1, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Electric spark. Set: Storm Caller' },
  { id: 'sc_storm_amulet', name: 'Storm Amulet', slot: 'necklace', attack: 4, defense: 2, hp: 10, mp: 22, speed: 2, rarity: 'epic', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Storm power. Set: Storm Caller' },
  // Rings
  { id: 'sc_spark_ring', name: 'Spark Ring', slot: 'ring', attack: 2, defense: 0, hp: 0, mp: 8, speed: 1, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Electric band. Set: Storm Caller' },
  { id: 'sc_bolt_band', name: 'Bolt Band', slot: 'ring', attack: 3, defense: 1, hp: 5, mp: 15, speed: 2, rarity: 'epic', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Lightning ring. Set: Storm Caller' },
  { id: 'sc_thunder_signet', name: 'Thunder Signet', slot: 'ring', attack: 2, defense: 1, hp: 5, mp: 10, speed: 1, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Thunder mark. Set: Storm Caller' },
  { id: 'sc_storm_seal', name: 'Storm Seal', slot: 'ring', attack: 4, defense: 2, hp: 8, mp: 18, speed: 2, rarity: 'epic', allowedJobs: ['Mage', 'Monk'], set: 'Storm Caller', description: 'Seal of storms. Set: Storm Caller' },

  // ==================== EARTHEN COLOSSUS SET (Earth/defense, Monk) ====================
  // Weapons
  { id: 'ec_stone_fists', name: 'Stone Fists', slot: 'weapon', attack: 14, defense: 6, hp: 20, mp: 5, speed: -1, rarity: 'rare', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Fists of stone. Set: Earthen Colossus' },
  { id: 'ec_boulder_knuckles', name: 'Boulder Knuckles', slot: 'weapon', attack: 20, defense: 10, hp: 35, mp: 10, speed: -1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Crushing boulders. Set: Earthen Colossus' },
  { id: 'ec_mountain_breaker', name: 'Mountain Breaker', slot: 'weapon', attack: 28, defense: 14, hp: 50, mp: 15, speed: -2, rarity: 'legendary', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Break mountains. Set: Earthen Colossus' },
  // Armor
  { id: 'ec_stone_gi', name: 'Stone Gi', slot: 'armor', attack: 2, defense: 16, hp: 35, mp: 5, speed: -1, rarity: 'rare', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Heavy stone armor. Set: Earthen Colossus' },
  { id: 'ec_boulder_robe', name: 'Boulder Robe', slot: 'armor', attack: 4, defense: 22, hp: 50, mp: 10, speed: -1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Wrapped in rock. Set: Earthen Colossus' },
  { id: 'ec_mountain_mantle', name: 'Mountain Mantle', slot: 'armor', attack: 6, defense: 28, hp: 70, mp: 15, speed: -2, rarity: 'legendary', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Weight of mountains. Set: Earthen Colossus' },
  // Helmet
  { id: 'ec_stone_crown', name: 'Stone Crown', slot: 'helmet', attack: 1, defense: 7, hp: 18, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Crown of stone. Set: Earthen Colossus' },
  { id: 'ec_boulder_helm', name: 'Boulder Helm', slot: 'helmet', attack: 2, defense: 11, hp: 28, mp: 5, speed: -1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Hard as rock. Set: Earthen Colossus' },
  // Gloves
  { id: 'ec_stone_grips', name: 'Stone Grips', slot: 'gloves', attack: 3, defense: 5, hp: 12, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Grip of stone. Set: Earthen Colossus' },
  { id: 'ec_boulder_fists', name: 'Boulder Fists', slot: 'gloves', attack: 5, defense: 8, hp: 20, mp: 5, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Crushing grip. Set: Earthen Colossus' },
  // Boots
  { id: 'ec_stone_treads', name: 'Stone Treads', slot: 'boots', attack: 1, defense: 5, hp: 12, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Heavy steps. Set: Earthen Colossus' },
  { id: 'ec_boulder_boots', name: 'Boulder Boots', slot: 'boots', attack: 2, defense: 8, hp: 20, mp: 5, speed: -1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Grounded firmly. Set: Earthen Colossus' },
  // Offhand
  { id: 'ec_stone_focus', name: 'Stone Focus', slot: 'offhand', attack: 3, defense: 4, hp: 15, mp: 10, speed: 0, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], set: 'Earthen Colossus', description: 'Earth focus. Set: Earthen Colossus' },
  { id: 'ec_boulder_orb', name: 'Boulder Orb', slot: 'offhand', attack: 5, defense: 7, hp: 25, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage', 'Monk'], set: 'Earthen Colossus', description: 'Orb of earth. Set: Earthen Colossus' },
  { id: 'ec_mountain_heart', name: 'Mountain Heart', slot: 'offhand', attack: 8, defense: 10, hp: 40, mp: 25, speed: 0, rarity: 'legendary', allowedJobs: ['Mage', 'Monk'], set: 'Earthen Colossus', description: 'Heart of mountain. Set: Earthen Colossus' },
  // Necklace
  { id: 'ec_stone_pendant', name: 'Stone Pendant', slot: 'necklace', attack: 1, defense: 3, hp: 20, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Solid stone. Set: Earthen Colossus' },
  { id: 'ec_boulder_amulet', name: 'Boulder Amulet', slot: 'necklace', attack: 2, defense: 5, hp: 32, mp: 5, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Boulder strength. Set: Earthen Colossus' },
  // Rings
  { id: 'ec_stone_ring', name: 'Stone Ring', slot: 'ring', attack: 1, defense: 2, hp: 12, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Band of stone. Set: Earthen Colossus' },
  { id: 'ec_boulder_band', name: 'Boulder Band', slot: 'ring', attack: 2, defense: 4, hp: 20, mp: 5, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Heavy ring. Set: Earthen Colossus' },
  { id: 'ec_granite_signet', name: 'Granite Signet', slot: 'ring', attack: 1, defense: 3, hp: 15, mp: 0, speed: 0, rarity: 'rare', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Granite seal. Set: Earthen Colossus' },
  { id: 'ec_mountain_seal', name: 'Mountain Seal', slot: 'ring', attack: 3, defense: 5, hp: 25, mp: 8, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Seal of earth. Set: Earthen Colossus' },

  // ==================== COMMON/STARTER EQUIPMENT (No set, all classes) ====================
  // Basic Weapons
  { id: 'rusty_sword', name: 'Rusty Sword', slot: 'weapon', attack: 3, defense: 0, hp: 0, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'A worn but serviceable blade' },
  { id: 'wooden_staff', name: 'Wooden Staff', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 8, speed: 0, rarity: 'common', allowedJobs: ['Mage'], description: 'A basic magic staff' },
  { id: 'cloth_wraps', name: 'Cloth Wraps', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 3, speed: 1, rarity: 'common', allowedJobs: ['Monk'], description: 'Simple hand wraps' },
  { id: 'iron_sword', name: 'Iron Sword', slot: 'weapon', attack: 6, defense: 0, hp: 0, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'A reliable iron blade' },
  { id: 'oak_staff', name: 'Oak Staff', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 15, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Carved from sturdy oak' },
  { id: 'leather_wraps', name: 'Leather Wraps', slot: 'weapon', attack: 5, defense: 1, hp: 0, mp: 5, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Reinforced hand wraps' },
  // Basic Armor
  { id: 'cloth_shirt', name: 'Cloth Shirt', slot: 'armor', attack: 0, defense: 2, hp: 5, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Basic cloth protection' },
  { id: 'leather_armor', name: 'Leather Armor', slot: 'armor', attack: 0, defense: 5, hp: 10, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter', 'Monk'], description: 'Light leather protection' },
  { id: 'apprentice_robe', name: 'Apprentice Robe', slot: 'armor', attack: 0, defense: 3, hp: 5, mp: 12, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Robe for novice mages' },
  // Basic Helmets
  { id: 'cloth_cap', name: 'Cloth Cap', slot: 'helmet', attack: 0, defense: 1, hp: 3, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Simple head covering' },
  { id: 'leather_cap', name: 'Leather Cap', slot: 'helmet', attack: 0, defense: 3, hp: 5, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter', 'Monk'], description: 'Leather head protection' },
  { id: 'wizard_hat', name: 'Wizard Hat', slot: 'helmet', attack: 0, defense: 2, hp: 3, mp: 8, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Traditional wizard headwear' },
  // Basic Gloves
  { id: 'cloth_gloves', name: 'Cloth Gloves', slot: 'gloves', attack: 0, defense: 1, hp: 0, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Simple cloth gloves' },
  { id: 'leather_gloves', name: 'Leather Gloves', slot: 'gloves', attack: 1, defense: 2, hp: 0, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter', 'Monk'], description: 'Sturdy leather gloves' },
  { id: 'silk_gloves', name: 'Silk Gloves', slot: 'gloves', attack: 0, defense: 1, hp: 0, mp: 5, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Delicate magic-conducting gloves' },
  // Basic Boots
  { id: 'cloth_shoes', name: 'Cloth Shoes', slot: 'boots', attack: 0, defense: 1, hp: 0, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Simple footwear' },
  { id: 'leather_boots', name: 'Leather Boots', slot: 'boots', attack: 0, defense: 2, hp: 3, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter', 'Monk'], description: 'Sturdy leather boots' },
  { id: 'silk_slippers', name: 'Silk Slippers', slot: 'boots', attack: 0, defense: 1, hp: 0, mp: 5, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Light magical footwear' },
  // Basic Shields
  { id: 'wooden_shield', name: 'Wooden Shield', slot: 'shield', attack: 0, defense: 4, hp: 5, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Basic wooden shield' },
  { id: 'iron_shield', name: 'Iron Shield', slot: 'shield', attack: 0, defense: 7, hp: 10, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Solid iron protection' },
  // Basic Necklaces
  { id: 'copper_chain', name: 'Copper Chain', slot: 'necklace', attack: 0, defense: 0, hp: 5, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Simple copper necklace' },
  { id: 'silver_chain', name: 'Silver Chain', slot: 'necklace', attack: 0, defense: 1, hp: 8, mp: 5, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Silver necklace' },
  // Basic Rings
  { id: 'copper_ring', name: 'Copper Ring', slot: 'ring', attack: 0, defense: 0, hp: 3, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Simple copper band' },
  { id: 'silver_ring', name: 'Silver Ring', slot: 'ring', attack: 0, defense: 1, hp: 5, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Silver band' },
  { id: 'iron_band', name: 'Iron Band', slot: 'ring', attack: 1, defense: 1, hp: 5, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter', 'Monk'], description: 'Sturdy iron ring' },
  { id: 'glass_bead', name: 'Glass Bead Ring', slot: 'ring', attack: 0, defense: 0, hp: 0, mp: 5, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Ring with magic bead' },
  // Basic Relics (Mage only)
  { id: 'quartz_shard', name: 'Quartz Shard', slot: 'relic', attack: 1, defense: 0, hp: 0, mp: 10, speed: 0, rarity: 'common', allowedJobs: ['Mage'], description: 'Basic magic focus' },
  { id: 'amethyst_crystal', name: 'Amethyst Crystal', slot: 'relic', attack: 2, defense: 0, hp: 0, mp: 18, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Channeling crystal' },
  // Basic Offhand (Monk only)
  { id: 'prayer_beads', name: 'Prayer Beads', slot: 'offhand', attack: 1, defense: 0, hp: 5, mp: 8, speed: 0, rarity: 'common', allowedJobs: ['Mage', 'Monk'], description: 'Aids concentration' },
  { id: 'meditation_stone', name: 'Meditation Stone', slot: 'offhand', attack: 2, defense: 1, hp: 8, mp: 12, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage', 'Monk'], description: 'Focuses inner energy' },
];

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

// Calculate total stats including equipment bonuses (with enhancement)
// Only counts equipment in valid slots for the player's class
export function getEffectiveStats(player: Player): { attack: number; defense: number; maxHp: number; maxMp: number; speed: number } {
  let attack = player.attack;
  let defense = player.defense;
  let maxHp = player.maxHp;
  let maxMp = player.maxMp;
  let speed = player.speed;
  
  // Class-based slot validity
  const job = player.job;
  const canUseShield = job === 'Fighter';
  const canUseOffhand = job !== 'Fighter';
  const canUseRelic = job === 'Mage';
  
  // Get all equipped items from the new slot system, respecting class restrictions
  const equippedItems: (Equipment | null)[] = [
    player.equipment.weapon,
    canUseShield ? player.equipment.shield : null,  // Fighter only
    player.equipment.armor,
    player.equipment.helmet,
    player.equipment.gloves,
    player.equipment.boots,
    player.equipment.necklace,
    player.equipment.ring1,
    player.equipment.ring2,
    canUseRelic ? player.equipment.relic : null,    // Mage only
    canUseOffhand ? player.equipment.offhand : null, // Mage/Monk only
  ];
  
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
