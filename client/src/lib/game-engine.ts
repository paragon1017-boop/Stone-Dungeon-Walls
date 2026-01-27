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
export type EquipmentSlot = 'weapon' | 'shield' | 'armor' | 'helmet' | 'gloves' | 'accessory';

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
  enhancement?: number; // 0-4, each level provides bigger stat boosts
}

// Enhancement bonus multipliers: +1 = 10%, +2 = 25%, +3 = 50%, +4 = 100%
export const ENHANCEMENT_MULTIPLIERS = [0, 0.10, 0.25, 0.50, 1.00];

// Get display name with enhancement level
export function getEnhancedName(item: Equipment): string {
  const enhancement = item.enhancement || 0;
  return enhancement > 0 ? `${item.name} +${enhancement}` : item.name;
}

// Calculate enhanced stats for an item
export function getEnhancedStats(item: Equipment): { attack: number; defense: number; hp: number; mp: number } {
  const enhancement = item.enhancement || 0;
  const multiplier = 1 + ENHANCEMENT_MULTIPLIERS[enhancement];
  
  return {
    attack: Math.floor(item.attack * multiplier),
    defense: Math.floor(item.defense * multiplier),
    hp: Math.floor(item.hp * multiplier),
    mp: Math.floor(item.mp * multiplier)
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

// Equipment Database - Organized by tier (common < uncommon < rare < epic < legendary)
export const EQUIPMENT_DATABASE: Equipment[] = [
  // ========== FIGHTER WEAPONS ==========
  // Common (Floors 1-2)
  { id: 'rusty_sword', name: 'Rusty Sword', slot: 'weapon', attack: 3, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'A worn but serviceable blade' },
  { id: 'wooden_club', name: 'Wooden Club', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'A simple bludgeon' },
  { id: 'short_sword', name: 'Short Sword', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Quick and reliable' },
  { id: 'bronze_dagger', name: 'Bronze Dagger', slot: 'weapon', attack: 3, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Small but sharp' },
  { id: 'copper_sword', name: 'Copper Sword', slot: 'weapon', attack: 3, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Basic copper blade' },
  { id: 'hand_axe', name: 'Hand Axe', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Small throwing axe' },
  { id: 'militia_sword', name: 'Militia Sword', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Standard issue blade' },
  // Uncommon (Floors 3-4)
  { id: 'iron_sword', name: 'Iron Sword', slot: 'weapon', attack: 6, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'A sturdy iron blade' },
  { id: 'battle_axe', name: 'Battle Axe', slot: 'weapon', attack: 8, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Heavy and devastating' },
  { id: 'long_sword', name: 'Long Sword', slot: 'weapon', attack: 7, defense: 1, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Balanced for combat' },
  { id: 'broadsword', name: 'Broadsword', slot: 'weapon', attack: 7, defense: 0, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Wide blade for power' },
  { id: 'morningstar', name: 'Morningstar', slot: 'weapon', attack: 8, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Spiked crushing weapon' },
  { id: 'flanged_mace', name: 'Flanged Mace', slot: 'weapon', attack: 7, defense: 1, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Armor-piercing flanges' },
  { id: 'falchion', name: 'Falchion', slot: 'weapon', attack: 8, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Curved slashing blade' },
  { id: 'dane_axe', name: 'Dane Axe', slot: 'weapon', attack: 9, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Long-hafted axe' },
  // Rare (Floors 5-6)
  { id: 'steel_sword', name: 'Steel Sword', slot: 'weapon', attack: 10, defense: 1, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'A finely crafted steel blade' },
  { id: 'flamberge', name: 'Flamberge', slot: 'weapon', attack: 12, defense: 0, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Wavy blade inflicts terrible wounds' },
  { id: 'war_hammer', name: 'War Hammer', slot: 'weapon', attack: 11, defense: 2, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Crushes armor and bones' },
  { id: 'bastard_sword', name: 'Bastard Sword', slot: 'weapon', attack: 11, defense: 1, hp: 5, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Hand-and-a-half sword' },
  { id: 'great_axe', name: 'Great Axe', slot: 'weapon', attack: 13, defense: 0, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Massive two-handed axe' },
  { id: 'claymore', name: 'Claymore', slot: 'weapon', attack: 12, defense: 1, hp: 5, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Scottish great sword' },
  { id: 'halberd', name: 'Halberd', slot: 'weapon', attack: 11, defense: 2, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Axe and spear combined' },
  { id: 'volcanic_blade', name: 'Volcanic Blade', slot: 'weapon', attack: 12, defense: 0, hp: 0, mp: 3, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Forged in lava' },
  { id: 'frost_brand', name: 'Frost Brand', slot: 'weapon', attack: 11, defense: 0, hp: 5, mp: 3, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Eternally frozen blade' },
  // Epic (Floors 7-8)
  { id: 'mithril_blade', name: 'Mithril Blade', slot: 'weapon', attack: 16, defense: 2, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Legendary elven metal' },
  { id: 'executioner', name: 'Executioner', slot: 'weapon', attack: 20, defense: 0, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Made for one purpose' },
  { id: 'dragon_slayer', name: 'Dragon Slayer', slot: 'weapon', attack: 18, defense: 3, hp: 10, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Forged to slay dragons' },
  { id: 'excalibur', name: 'Excalibur', slot: 'weapon', attack: 22, defense: 5, hp: 15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'The legendary holy sword' },
  { id: 'ragnarok', name: 'Ragnarok', slot: 'weapon', attack: 25, defense: 0, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'End of all things' },
  { id: 'masamune', name: 'Masamune', slot: 'weapon', attack: 19, defense: 3, hp: 10, mp: 5, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Perfect blade' },
  { id: 'soul_reaver', name: 'Soul Reaver', slot: 'weapon', attack: 21, defense: 0, hp: 0, mp: 10, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Consumes souls' },
  { id: 'thunder_god_sword', name: 'Thunder God Sword', slot: 'weapon', attack: 20, defense: 2, hp: 5, mp: 5, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Divine lightning blade' },
  { id: 'chaos_blade', name: 'Chaos Blade', slot: 'weapon', attack: 24, defense: -2, hp: -10, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Cursed blade of chaos' },

  // ========== MAGE WEAPONS ==========
  // Common
  { id: 'wooden_staff', name: 'Wooden Staff', slot: 'weapon', attack: 1, defense: 0, hp: 0, mp: 5, rarity: 'common', allowedJobs: ['Mage'], description: 'A simple magical focus' },
  { id: 'apprentice_wand', name: 'Apprentice Wand', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 8, rarity: 'common', allowedJobs: ['Mage'], description: 'First wand of a mage' },
  { id: 'gnarled_stick', name: 'Gnarled Stick', slot: 'weapon', attack: 1, defense: 1, hp: 0, mp: 6, rarity: 'common', allowedJobs: ['Mage'], description: 'Found in the woods' },
  { id: 'bone_wand', name: 'Bone Wand', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 7, rarity: 'common', allowedJobs: ['Mage'], description: 'Carved from bone' },
  { id: 'copper_rod', name: 'Copper Rod', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 6, rarity: 'common', allowedJobs: ['Mage'], description: 'Conducts magic' },
  // Uncommon
  { id: 'crystal_staff', name: 'Crystal Staff', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 12, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Channels magical energy' },
  { id: 'oak_staff', name: 'Oak Staff', slot: 'weapon', attack: 3, defense: 1, hp: 0, mp: 10, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Ancient oak wisdom' },
  { id: 'fire_rod', name: 'Fire Rod', slot: 'weapon', attack: 5, defense: 0, hp: 0, mp: 8, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Burns with inner flame' },
  { id: 'frost_wand', name: 'Frost Wand', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 11, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Cold to the touch' },
  { id: 'silver_staff', name: 'Silver Staff', slot: 'weapon', attack: 3, defense: 0, hp: 0, mp: 13, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Pure silver focus' },
  { id: 'willow_wand', name: 'Willow Wand', slot: 'weapon', attack: 3, defense: 1, hp: 0, mp: 12, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Flexible and strong' },
  { id: 'obsidian_rod', name: 'Obsidian Rod', slot: 'weapon', attack: 5, defense: 0, hp: 0, mp: 10, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Volcanic glass' },
  // Rare
  { id: 'arcane_staff', name: 'Arcane Staff', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 20, rarity: 'rare', allowedJobs: ['Mage'], description: 'Crackling with arcane power' },
  { id: 'ice_scepter', name: 'Ice Scepter', slot: 'weapon', attack: 6, defense: 0, hp: 0, mp: 18, rarity: 'rare', allowedJobs: ['Mage'], description: 'Eternal frost contained' },
  { id: 'thunder_rod', name: 'Thunder Rod', slot: 'weapon', attack: 8, defense: 0, hp: 0, mp: 15, rarity: 'rare', allowedJobs: ['Mage'], description: 'Storms at your command' },
  { id: 'necromancer_staff', name: 'Necromancer Staff', slot: 'weapon', attack: 6, defense: 0, hp: 5, mp: 18, rarity: 'rare', allowedJobs: ['Mage'], description: 'Drains life force' },
  { id: 'elemental_rod', name: 'Elemental Rod', slot: 'weapon', attack: 7, defense: 0, hp: 0, mp: 17, rarity: 'rare', allowedJobs: ['Mage'], description: 'Four elements combined' },
  { id: 'starlight_wand', name: 'Starlight Wand', slot: 'weapon', attack: 5, defense: 1, hp: 0, mp: 22, rarity: 'rare', allowedJobs: ['Mage'], description: 'Captured starlight' },
  { id: 'sage_staff', name: 'Sage Staff', slot: 'weapon', attack: 4, defense: 2, hp: 5, mp: 20, rarity: 'rare', allowedJobs: ['Mage'], description: 'Wisdom of ages' },
  // Epic
  { id: 'void_staff', name: 'Void Staff', slot: 'weapon', attack: 8, defense: 0, hp: 0, mp: 35, rarity: 'epic', allowedJobs: ['Mage'], description: 'Touches the void itself' },
  { id: 'phoenix_wand', name: 'Phoenix Wand', slot: 'weapon', attack: 10, defense: 0, hp: 10, mp: 30, rarity: 'epic', allowedJobs: ['Mage'], description: 'Phoenix feather core' },
  { id: 'staff_of_ages', name: 'Staff of Ages', slot: 'weapon', attack: 6, defense: 2, hp: 0, mp: 40, rarity: 'epic', allowedJobs: ['Mage'], description: 'Contains centuries of power' },
  { id: 'cosmic_staff', name: 'Cosmic Staff', slot: 'weapon', attack: 9, defense: 0, hp: 5, mp: 45, rarity: 'epic', allowedJobs: ['Mage'], description: 'Power of the cosmos' },
  { id: 'elder_wand', name: 'Elder Wand', slot: 'weapon', attack: 12, defense: 0, hp: 0, mp: 50, rarity: 'epic', allowedJobs: ['Mage'], description: 'The death stick' },
  { id: 'archmage_staff', name: 'Archmage Staff', slot: 'weapon', attack: 8, defense: 3, hp: 10, mp: 40, rarity: 'epic', allowedJobs: ['Mage'], description: 'Supreme magical power' },
  { id: 'world_tree_branch', name: 'World Tree Branch', slot: 'weapon', attack: 7, defense: 2, hp: 15, mp: 38, rarity: 'epic', allowedJobs: ['Mage'], description: 'From Yggdrasil itself' },
  { id: 'lich_staff', name: 'Lich Staff', slot: 'weapon', attack: 11, defense: 0, hp: -5, mp: 55, rarity: 'epic', allowedJobs: ['Mage'], description: 'Cursed undead power' },

  // ========== MONK WEAPONS ==========
  // Common
  { id: 'brass_knuckles', name: 'Brass Knuckles', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Monk'], description: 'Enhances unarmed strikes' },
  { id: 'fighting_wraps', name: 'Fighting Wraps', slot: 'weapon', attack: 3, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Monk'], description: 'Protects the knuckles' },
  { id: 'wooden_knuckles', name: 'Wooden Knuckles', slot: 'weapon', attack: 3, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Monk'], description: 'Hardwood guards' },
  { id: 'simple_bo', name: 'Simple Bo', slot: 'weapon', attack: 3, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Monk'], description: 'Wooden staff' },
  { id: 'training_fists', name: 'Training Fists', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Monk'], description: 'Padded training gear' },
  // Uncommon
  { id: 'iron_fists', name: 'Iron Fists', slot: 'weapon', attack: 7, defense: 1, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Heavy iron knuckle guards' },
  { id: 'tiger_claws', name: 'Tiger Claws', slot: 'weapon', attack: 8, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Strike like a tiger' },
  { id: 'nunchaku', name: 'Nunchaku', slot: 'weapon', attack: 6, defense: 2, hp: 0, mp: 2, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Fast and unpredictable' },
  { id: 'steel_knuckles', name: 'Steel Knuckles', slot: 'weapon', attack: 7, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Polished steel' },
  { id: 'bo_staff', name: 'Bo Staff', slot: 'weapon', attack: 6, defense: 3, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Traditional weapon' },
  { id: 'sai_pair', name: 'Sai Pair', slot: 'weapon', attack: 7, defense: 2, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Twin prongs' },
  { id: 'kama_blades', name: 'Kama Blades', slot: 'weapon', attack: 8, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Sickle-like weapons' },
  // Rare
  { id: 'chi_gloves', name: 'Chi Gloves', slot: 'weapon', attack: 9, defense: 0, hp: 0, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Channel inner energy' },
  { id: 'dragon_fang', name: 'Dragon Fang', slot: 'weapon', attack: 11, defense: 1, hp: 0, mp: 3, rarity: 'rare', allowedJobs: ['Monk'], description: 'Crafted from dragon tooth' },
  { id: 'spirit_talons', name: 'Spirit Talons', slot: 'weapon', attack: 10, defense: 0, hp: 5, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Infused with spirit energy' },
  { id: 'phoenix_claws', name: 'Phoenix Claws', slot: 'weapon', attack: 10, defense: 0, hp: 8, mp: 3, rarity: 'rare', allowedJobs: ['Monk'], description: 'Burns with fire' },
  { id: 'adamant_knuckles', name: 'Adamant Knuckles', slot: 'weapon', attack: 12, defense: 0, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Monk'], description: 'Unbreakable metal' },
  { id: 'wind_fan', name: 'Wind Fan', slot: 'weapon', attack: 9, defense: 1, hp: 0, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Razor wind attacks' },
  { id: 'monks_spade', name: "Monk's Spade", slot: 'weapon', attack: 10, defense: 2, hp: 5, mp: 0, rarity: 'rare', allowedJobs: ['Monk'], description: 'Crescent blade staff' },
  // Epic
  { id: 'fists_of_fury', name: 'Fists of Fury', slot: 'weapon', attack: 15, defense: 2, hp: 0, mp: 8, rarity: 'epic', allowedJobs: ['Monk'], description: 'Legendary martial weapon' },
  { id: 'celestial_claws', name: 'Celestial Claws', slot: 'weapon', attack: 14, defense: 0, hp: 10, mp: 10, rarity: 'epic', allowedJobs: ['Monk'], description: 'Blessed by the heavens' },
  { id: 'gods_fist', name: "God's Fist", slot: 'weapon', attack: 18, defense: 0, hp: 5, mp: 5, rarity: 'epic', allowedJobs: ['Monk'], description: 'Divine striking power' },
  { id: 'dragon_claw', name: 'Dragon Claw', slot: 'weapon', attack: 16, defense: 2, hp: 10, mp: 5, rarity: 'epic', allowedJobs: ['Monk'], description: 'True dragon power' },
  { id: 'zen_knuckles', name: 'Zen Knuckles', slot: 'weapon', attack: 14, defense: 3, hp: 15, mp: 10, rarity: 'epic', allowedJobs: ['Monk'], description: 'Perfect inner peace' },
  { id: 'asura_claws', name: 'Asura Claws', slot: 'weapon', attack: 20, defense: 0, hp: -5, mp: 0, rarity: 'epic', allowedJobs: ['Monk'], description: 'Demonic battle fury' },
  { id: 'enlightened_fists', name: 'Enlightened Fists', slot: 'weapon', attack: 15, defense: 2, hp: 10, mp: 15, rarity: 'epic', allowedJobs: ['Monk'], description: 'True enlightenment' },

  // ========== SHIELDS (Fighter Only) ==========
  // Common
  { id: 'wooden_shield', name: 'Wooden Shield', slot: 'shield', attack: 0, defense: 2, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Simple wooden protection' },
  { id: 'buckler', name: 'Buckler', slot: 'shield', attack: 0, defense: 3, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Small and light' },
  { id: 'round_shield', name: 'Round Shield', slot: 'shield', attack: 0, defense: 3, hp: 5, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Classic round design' },
  { id: 'hide_shield', name: 'Hide Shield', slot: 'shield', attack: 0, defense: 2, hp: 5, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Tough animal hide' },
  { id: 'wicker_shield', name: 'Wicker Shield', slot: 'shield', attack: 0, defense: 1, hp: 3, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Woven plant fibers' },
  { id: 'bronze_targe', name: 'Bronze Targe', slot: 'shield', attack: 0, defense: 3, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Small bronze disc' },
  { id: 'militia_shield', name: 'Militia Shield', slot: 'shield', attack: 0, defense: 2, hp: 3, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Standard issue' },
  { id: 'bark_shield', name: 'Bark Shield', slot: 'shield', attack: 0, defense: 2, hp: 0, mp: 2, rarity: 'common', allowedJobs: ['Fighter'], description: 'Enchanted tree bark' },
  { id: 'reed_shield', name: 'Reed Shield', slot: 'shield', attack: 0, defense: 1, hp: 2, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Woven reeds' },
  { id: 'copper_buckler', name: 'Copper Buckler', slot: 'shield', attack: 0, defense: 2, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Polished copper' },
  { id: 'bone_buckler', name: 'Bone Buckler', slot: 'shield', attack: 1, defense: 2, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Animal bones' },
  { id: 'turtle_shell', name: 'Turtle Shell', slot: 'shield', attack: 0, defense: 3, hp: 3, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Natural armor' },
  { id: 'recruit_shield', name: 'Recruit Shield', slot: 'shield', attack: 0, defense: 2, hp: 2, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Training shield' },
  // Uncommon
  { id: 'iron_shield', name: 'Iron Shield', slot: 'shield', attack: 0, defense: 5, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Solid iron construction' },
  { id: 'steel_buckler', name: 'Steel Buckler', slot: 'shield', attack: 1, defense: 4, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Allows quick counters' },
  { id: 'kite_shield', name: 'Kite Shield', slot: 'shield', attack: 0, defense: 6, hp: 8, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Extended body coverage' },
  { id: 'tower_shield', name: 'Tower Shield', slot: 'shield', attack: 0, defense: 8, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Maximum protection' },
  { id: 'spiked_shield', name: 'Spiked Shield', slot: 'shield', attack: 3, defense: 4, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Defensive and offensive' },
  { id: 'heater_shield', name: 'Heater Shield', slot: 'shield', attack: 0, defense: 5, hp: 8, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Classic triangular shape' },
  { id: 'bronze_aspis', name: 'Bronze Aspis', slot: 'shield', attack: 1, defense: 5, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Ancient warrior shield' },
  { id: 'studded_shield', name: 'Studded Shield', slot: 'shield', attack: 2, defense: 5, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Metal studs for impact' },
  { id: 'reinforced_buckler', name: 'Reinforced Buckler', slot: 'shield', attack: 1, defense: 6, hp: 3, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Steel-banded buckler' },
  { id: 'war_shield', name: 'War Shield', slot: 'shield', attack: 2, defense: 6, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Built for battle' },
  { id: 'viking_shield', name: 'Viking Shield', slot: 'shield', attack: 2, defense: 5, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Nordic raiders' },
  { id: 'roman_scutum', name: 'Roman Scutum', slot: 'shield', attack: 0, defense: 7, hp: 8, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Legionary shield' },
  { id: 'bronze_hoplon', name: 'Bronze Hoplon', slot: 'shield', attack: 1, defense: 6, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Greek warrior' },
  { id: 'oak_shield', name: 'Oak Shield', slot: 'shield', attack: 0, defense: 5, hp: 10, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Sturdy oak wood' },
  { id: 'bladed_shield', name: 'Bladed Shield', slot: 'shield', attack: 4, defense: 4, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Razor-edged' },
  { id: 'runed_buckler', name: 'Runed Buckler', slot: 'shield', attack: 1, defense: 5, hp: 0, mp: 5, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Magical runes' },
  { id: 'iron_boss_shield', name: 'Iron Boss Shield', slot: 'shield', attack: 2, defense: 6, hp: 3, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Heavy center boss' },
  // Rare
  { id: 'knights_shield', name: "Knight's Shield", slot: 'shield', attack: 1, defense: 8, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Emblem of knighthood' },
  { id: 'silver_shield', name: 'Silver Shield', slot: 'shield', attack: 0, defense: 7, hp: 5, mp: 5, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Blessed silver surface' },
  { id: 'reinforced_tower', name: 'Reinforced Tower', slot: 'shield', attack: 0, defense: 12, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Steel-reinforced tower' },
  { id: 'guardian_shield', name: 'Guardian Shield', slot: 'shield', attack: 0, defense: 9, hp: 15, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Protects the party' },
  { id: 'flame_shield', name: 'Flame Shield', slot: 'shield', attack: 3, defense: 7, hp: 5, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Burns attackers' },
  { id: 'frost_shield', name: 'Frost Shield', slot: 'shield', attack: 2, defense: 8, hp: 8, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Freezes on contact' },
  { id: 'mithril_shield', name: 'Mithril Shield', slot: 'shield', attack: 2, defense: 10, hp: 8, mp: 3, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Light elven metal' },
  { id: 'crusader_shield', name: 'Crusader Shield', slot: 'shield', attack: 2, defense: 9, hp: 12, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Holy warrior emblem' },
  { id: 'volcanic_shield', name: 'Volcanic Shield', slot: 'shield', attack: 4, defense: 7, hp: 5, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Forged in lava' },
  { id: 'storm_shield', name: 'Storm Shield', slot: 'shield', attack: 3, defense: 8, hp: 5, mp: 5, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Charged with lightning' },
  { id: 'bone_shield', name: 'Bone Shield', slot: 'shield', attack: 3, defense: 8, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Giant creature bones' },
  { id: 'obsidian_shield', name: 'Obsidian Shield', slot: 'shield', attack: 2, defense: 10, hp: 5, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Razor-sharp volcanic glass' },
  { id: 'royal_aegis', name: 'Royal Aegis', slot: 'shield', attack: 1, defense: 11, hp: 10, mp: 5, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Shield of royalty' },
  { id: 'earth_shield', name: 'Earth Shield', slot: 'shield', attack: 0, defense: 13, hp: 15, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Stone and metal fused' },
  { id: 'paladin_shield', name: 'Paladin Shield', slot: 'shield', attack: 1, defense: 10, hp: 12, mp: 5, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Holy warrior' },
  { id: 'wyvern_shield', name: 'Wyvern Shield', slot: 'shield', attack: 3, defense: 9, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Wyvern scales' },
  { id: 'thunder_aegis', name: 'Thunder Aegis', slot: 'shield', attack: 4, defense: 8, hp: 8, mp: 3, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Storm charged' },
  { id: 'crystal_shield', name: 'Crystal Shield', slot: 'shield', attack: 1, defense: 9, hp: 5, mp: 10, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Pure crystal' },
  { id: 'shadow_shield', name: 'Shadow Shield', slot: 'shield', attack: 4, defense: 9, hp: 5, mp: 3, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Dark enchantment' },
  { id: 'sunfire_shield', name: 'Sunfire Shield', slot: 'shield', attack: 3, defense: 9, hp: 8, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Solar flames' },
  { id: 'moonlit_aegis', name: 'Moonlit Aegis', slot: 'shield', attack: 1, defense: 10, hp: 8, mp: 8, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Lunar blessing' },
  { id: 'steel_fortress', name: 'Steel Fortress', slot: 'shield', attack: 0, defense: 14, hp: 12, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Impenetrable steel' },
  { id: 'crimson_guard', name: 'Crimson Guard', slot: 'shield', attack: 3, defense: 10, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Blood red metal' },
  // Epic
  { id: 'dragon_shield', name: 'Dragon Shield', slot: 'shield', attack: 3, defense: 14, hp: 20, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Scales of an ancient dragon' },
  { id: 'aegis', name: 'Aegis', slot: 'shield', attack: 2, defense: 16, hp: 15, mp: 5, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Legendary divine shield' },
  { id: 'wall_of_titans', name: 'Wall of Titans', slot: 'shield', attack: 0, defense: 20, hp: 25, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Immovable barrier' },
  { id: 'mirror_shield', name: 'Mirror Shield', slot: 'shield', attack: 0, defense: 12, hp: 10, mp: 15, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Reflects magic attacks' },
  { id: 'thunderguard', name: 'Thunderguard', slot: 'shield', attack: 5, defense: 13, hp: 15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Lightning strikes back' },
  { id: 'worldbreaker_shield', name: 'Worldbreaker Shield', slot: 'shield', attack: 4, defense: 18, hp: 30, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Shield of the world protector' },
  { id: 'celestial_bulwark', name: 'Celestial Bulwark', slot: 'shield', attack: 3, defense: 17, hp: 20, mp: 10, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Blessed by the heavens' },
  { id: 'demon_wall', name: 'Demon Wall', slot: 'shield', attack: 6, defense: 14, hp: 15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Forged in the abyss' },
  { id: 'phoenix_guard', name: 'Phoenix Guard', slot: 'shield', attack: 2, defense: 15, hp: 25, mp: 5, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Rises from defeat' },
  { id: 'ancient_sentinel', name: 'Ancient Sentinel', slot: 'shield', attack: 0, defense: 22, hp: 30, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Guardian of ruins' },
  { id: 'void_barrier', name: 'Void Barrier', slot: 'shield', attack: 4, defense: 15, hp: 10, mp: 20, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Absorbs all damage' },
  { id: 'soulguard', name: 'Soulguard', slot: 'shield', attack: 3, defense: 16, hp: 20, mp: 10, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Protects body and soul' },
  { id: 'immortal_wall', name: 'Immortal Wall', slot: 'shield', attack: 2, defense: 19, hp: 35, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Never breaks' },
  { id: 'godshield', name: 'Godshield', slot: 'shield', attack: 5, defense: 20, hp: 25, mp: 15, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Divine protection' },
  { id: 'odin_shield', name: "Odin's Shield", slot: 'shield', attack: 6, defense: 18, hp: 20, mp: 10, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Allfather protection' },
  { id: 'valkyrie_shield', name: 'Valkyrie Shield', slot: 'shield', attack: 4, defense: 17, hp: 25, mp: 8, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Chooser of the slain' },
  { id: 'eclipse_barrier', name: 'Eclipse Barrier', slot: 'shield', attack: 3, defense: 18, hp: 20, mp: 12, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Darkness and light' },
  { id: 'cosmic_bulwark', name: 'Cosmic Bulwark', slot: 'shield', attack: 2, defense: 21, hp: 25, mp: 10, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Power of stars' },
  { id: 'archon_shield', name: 'Archon Shield', slot: 'shield', attack: 4, defense: 19, hp: 22, mp: 8, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Angelic defender' },
  { id: 'abyssal_guard', name: 'Abyssal Guard', slot: 'shield', attack: 7, defense: 15, hp: 15, mp: 5, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Depths of the abyss' },
  { id: 'terminus_wall', name: 'Terminus Wall', slot: 'shield', attack: 0, defense: 25, hp: 35, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Final barrier' },
  { id: 'primordial_aegis', name: 'Primordial Aegis', slot: 'shield', attack: 5, defense: 22, hp: 30, mp: 5, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Ancient power' },
  { id: 'seraphs_embrace', name: "Seraph's Embrace", slot: 'shield', attack: 2, defense: 18, hp: 28, mp: 15, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Angelic blessing' },

  // ========== FIGHTER ARMOR ==========
  // Common
  { id: 'leather_vest', name: 'Leather Vest', slot: 'armor', attack: 0, defense: 2, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Monk'], description: 'Basic leather protection' },
  { id: 'padded_armor', name: 'Padded Armor', slot: 'armor', attack: 0, defense: 3, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Quilted protection' },
  // Uncommon
  { id: 'chainmail', name: 'Chainmail', slot: 'armor', attack: 0, defense: 5, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Interlocking metal rings' },
  { id: 'scale_mail', name: 'Scale Mail', slot: 'armor', attack: 0, defense: 6, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Overlapping metal scales' },
  { id: 'brigandine', name: 'Brigandine', slot: 'armor', attack: 1, defense: 5, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Steel plates in leather' },
  // Rare
  { id: 'plate_armor', name: 'Plate Armor', slot: 'armor', attack: 0, defense: 10, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Heavy steel plates' },
  { id: 'knight_armor', name: 'Knight Armor', slot: 'armor', attack: 2, defense: 9, hp: 15, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Full knightly protection' },
  // Epic
  { id: 'dragon_mail', name: 'Dragon Mail', slot: 'armor', attack: 3, defense: 15, hp: 20, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Scales of a true dragon' },
  { id: 'adamantine_plate', name: 'Adamantine Plate', slot: 'armor', attack: 0, defense: 18, hp: 25, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Nearly indestructible' },

  // ========== MAGE ARMOR ==========
  // Common
  { id: 'cloth_robe', name: 'Cloth Robe', slot: 'armor', attack: 0, defense: 1, hp: 0, mp: 8, rarity: 'common', allowedJobs: ['Mage'], description: 'Simple enchanted cloth' },
  { id: 'apprentice_robe', name: 'Apprentice Robe', slot: 'armor', attack: 0, defense: 1, hp: 0, mp: 10, rarity: 'common', allowedJobs: ['Mage'], description: 'Standard mage attire' },
  // Uncommon
  { id: 'silk_robe', name: 'Silk Robe', slot: 'armor', attack: 0, defense: 2, hp: 0, mp: 15, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Woven with magical thread' },
  { id: 'enchanted_vestment', name: 'Enchanted Vestment', slot: 'armor', attack: 1, defense: 2, hp: 0, mp: 18, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Layered enchantments' },
  // Rare
  { id: 'archmage_robe', name: 'Archmage Robe', slot: 'armor', attack: 2, defense: 4, hp: 0, mp: 25, rarity: 'rare', allowedJobs: ['Mage'], description: 'Worn by masters' },
  { id: 'starweave_mantle', name: 'Starweave Mantle', slot: 'armor', attack: 0, defense: 3, hp: 5, mp: 30, rarity: 'rare', allowedJobs: ['Mage'], description: 'Woven from starlight' },
  // Epic
  { id: 'void_robe', name: 'Void Robe', slot: 'armor', attack: 3, defense: 5, hp: 0, mp: 45, rarity: 'epic', allowedJobs: ['Mage'], description: 'Darkness incarnate' },
  { id: 'elemental_shroud', name: 'Elemental Shroud', slot: 'armor', attack: 4, defense: 6, hp: 10, mp: 40, rarity: 'epic', allowedJobs: ['Mage'], description: 'Four elements combined' },

  // ========== MONK ARMOR ==========
  // Common
  { id: 'training_gi', name: 'Training Gi', slot: 'armor', attack: 0, defense: 2, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Monk'], description: 'Simple training clothes' },
  // Uncommon
  { id: 'monk_garb', name: 'Monk Garb', slot: 'armor', attack: 1, defense: 3, hp: 5, mp: 3, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Traditional fighting attire' },
  { id: 'wind_tunic', name: 'Wind Tunic', slot: 'armor', attack: 2, defense: 3, hp: 0, mp: 5, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Light as the wind' },
  // Rare
  { id: 'master_gi', name: 'Master Gi', slot: 'armor', attack: 3, defense: 5, hp: 10, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Worn by martial masters' },
  { id: 'tiger_hide', name: 'Tiger Hide', slot: 'armor', attack: 4, defense: 6, hp: 5, mp: 0, rarity: 'rare', allowedJobs: ['Monk'], description: 'Spirit of the tiger' },
  // Epic
  { id: 'dragon_gi', name: 'Dragon Gi', slot: 'armor', attack: 5, defense: 8, hp: 15, mp: 10, rarity: 'epic', allowedJobs: ['Monk'], description: 'Dragon warrior attire' },
  { id: 'celestial_wrap', name: 'Celestial Wrap', slot: 'armor', attack: 4, defense: 7, hp: 20, mp: 15, rarity: 'epic', allowedJobs: ['Monk'], description: 'Divine protection' },

  // ========== HELMETS ==========
  // Common
  { id: 'leather_cap', name: 'Leather Cap', slot: 'helmet', attack: 0, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Monk'], description: 'Simple head protection' },
  { id: 'wizard_hat', name: 'Wizard Hat', slot: 'helmet', attack: 0, defense: 0, hp: 0, mp: 10, rarity: 'common', allowedJobs: ['Mage'], description: 'Pointed hat of wisdom' },
  { id: 'headband', name: 'Focus Headband', slot: 'helmet', attack: 1, defense: 1, hp: 0, mp: 3, rarity: 'common', allowedJobs: ['Monk'], description: 'Aids concentration' },
  { id: 'cloth_hood', name: 'Cloth Hood', slot: 'helmet', attack: 0, defense: 1, hp: 0, mp: 5, rarity: 'common', allowedJobs: ['Mage'], description: 'Conceals and protects' },
  // Uncommon
  { id: 'iron_helm', name: 'Iron Helm', slot: 'helmet', attack: 0, defense: 3, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Solid iron helmet' },
  { id: 'great_helm', name: 'Great Helm', slot: 'helmet', attack: 0, defense: 4, hp: 8, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Full face protection' },
  { id: 'mage_circlet', name: 'Mage Circlet', slot: 'helmet', attack: 1, defense: 1, hp: 0, mp: 15, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Enhances magical focus' },
  { id: 'battle_bandana', name: 'Battle Bandana', slot: 'helmet', attack: 2, defense: 2, hp: 0, mp: 3, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Warrior spirit' },
  // Rare
  { id: 'steel_helm', name: 'Steel Helm', slot: 'helmet', attack: 0, defense: 5, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Masterwork helmet' },
  { id: 'crown_of_wisdom', name: 'Crown of Wisdom', slot: 'helmet', attack: 2, defense: 2, hp: 0, mp: 25, rarity: 'rare', allowedJobs: ['Mage'], description: 'Ancient knowledge' },
  { id: 'masters_band', name: "Master's Band", slot: 'helmet', attack: 3, defense: 3, hp: 5, mp: 8, rarity: 'rare', allowedJobs: ['Monk'], description: 'Sign of mastery' },
  // Epic
  { id: 'dragon_helm', name: 'Dragon Helm', slot: 'helmet', attack: 2, defense: 8, hp: 15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Forged from dragon bone' },
  { id: 'arcane_crown', name: 'Arcane Crown', slot: 'helmet', attack: 4, defense: 3, hp: 0, mp: 40, rarity: 'epic', allowedJobs: ['Mage'], description: 'Ultimate magical focus' },
  { id: 'enlightened_crown', name: 'Enlightened Crown', slot: 'helmet', attack: 5, defense: 4, hp: 10, mp: 15, rarity: 'epic', allowedJobs: ['Monk'], description: 'True enlightenment' },

  // ========== GLOVES ==========
  // Common - All Classes
  { id: 'cloth_gloves', name: 'Cloth Gloves', slot: 'gloves', attack: 0, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Simple hand protection' },
  { id: 'leather_gloves', name: 'Leather Gloves', slot: 'gloves', attack: 1, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Basic leather' },
  { id: 'work_gloves', name: 'Work Gloves', slot: 'gloves', attack: 1, defense: 2, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Monk'], description: 'Sturdy work gloves' },
  // Common - Class Specific
  { id: 'padded_mitts', name: 'Padded Mitts', slot: 'gloves', attack: 2, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Padded for combat' },
  { id: 'silk_gloves', name: 'Silk Gloves', slot: 'gloves', attack: 0, defense: 0, hp: 0, mp: 5, rarity: 'common', allowedJobs: ['Mage'], description: 'Magical threads' },
  { id: 'training_wraps', name: 'Training Wraps', slot: 'gloves', attack: 2, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Monk'], description: 'Hand wraps for training' },
  // Uncommon - Fighter
  { id: 'chain_gauntlets', name: 'Chain Gauntlets', slot: 'gloves', attack: 2, defense: 3, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Chainmail gloves' },
  { id: 'spiked_gauntlets', name: 'Spiked Gauntlets', slot: 'gloves', attack: 4, defense: 2, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Adds punch damage' },
  { id: 'plate_gauntlets', name: 'Plate Gauntlets', slot: 'gloves', attack: 2, defense: 4, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Heavy plate protection' },
  // Uncommon - Mage
  { id: 'enchanted_gloves', name: 'Enchanted Gloves', slot: 'gloves', attack: 1, defense: 1, hp: 0, mp: 10, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Magical enhancement' },
  { id: 'fire_mitts', name: 'Fire Mitts', slot: 'gloves', attack: 3, defense: 0, hp: 0, mp: 8, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Warm with fire magic' },
  { id: 'frost_gloves', name: 'Frost Gloves', slot: 'gloves', attack: 2, defense: 1, hp: 0, mp: 10, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Cold to the touch' },
  // Uncommon - Monk
  { id: 'combat_wraps', name: 'Combat Wraps', slot: 'gloves', attack: 4, defense: 1, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Battle-ready wraps' },
  { id: 'weighted_gloves', name: 'Weighted Gloves', slot: 'gloves', attack: 5, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Heavy for stronger hits' },
  { id: 'martial_gloves', name: 'Martial Gloves', slot: 'gloves', attack: 3, defense: 2, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Traditional martial arts' },
  // Rare - Fighter
  { id: 'steel_gauntlets', name: 'Steel Gauntlets', slot: 'gloves', attack: 4, defense: 5, hp: 8, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Finest steel' },
  { id: 'berserker_gloves', name: 'Berserker Gloves', slot: 'gloves', attack: 7, defense: 2, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Rage-infused' },
  { id: 'knights_gauntlets', name: "Knight's Gauntlets", slot: 'gloves', attack: 4, defense: 6, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Knightly protection' },
  { id: 'thunder_fists', name: 'Thunder Fists', slot: 'gloves', attack: 6, defense: 3, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Lightning strikes' },
  // Rare - Mage
  { id: 'arcane_gloves', name: 'Arcane Gloves', slot: 'gloves', attack: 2, defense: 2, hp: 0, mp: 18, rarity: 'rare', allowedJobs: ['Mage'], description: 'Pure arcane energy' },
  { id: 'elemental_gloves', name: 'Elemental Gloves', slot: 'gloves', attack: 4, defense: 1, hp: 0, mp: 15, rarity: 'rare', allowedJobs: ['Mage'], description: 'Four elements' },
  { id: 'void_gloves', name: 'Void Gloves', slot: 'gloves', attack: 3, defense: 0, hp: 0, mp: 22, rarity: 'rare', allowedJobs: ['Mage'], description: 'Touch the void' },
  { id: 'starweave_gloves', name: 'Starweave Gloves', slot: 'gloves', attack: 2, defense: 2, hp: 5, mp: 18, rarity: 'rare', allowedJobs: ['Mage'], description: 'Woven from starlight' },
  // Rare - Monk
  { id: 'tiger_gloves', name: 'Tiger Gloves', slot: 'gloves', attack: 7, defense: 2, hp: 5, mp: 0, rarity: 'rare', allowedJobs: ['Monk'], description: 'Tiger style' },
  { id: 'dragon_wraps', name: 'Dragon Wraps', slot: 'gloves', attack: 6, defense: 3, hp: 8, mp: 3, rarity: 'rare', allowedJobs: ['Monk'], description: 'Dragon spirit' },
  { id: 'masters_gloves', name: "Master's Gloves", slot: 'gloves', attack: 5, defense: 4, hp: 10, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Worn by masters' },
  { id: 'chi_wraps', name: 'Chi Wraps', slot: 'gloves', attack: 4, defense: 2, hp: 5, mp: 10, rarity: 'rare', allowedJobs: ['Monk'], description: 'Focus your chi' },
  // Epic - Fighter
  { id: 'dragon_gauntlets_eq', name: 'Dragon Gauntlets', slot: 'gloves', attack: 8, defense: 8, hp: 15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Dragon claw design' },
  { id: 'titan_fists', name: 'Titan Fists', slot: 'gloves', attack: 12, defense: 5, hp: 10, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Titanic strength' },
  { id: 'godslayer_gauntlets', name: 'Godslayer Gauntlets', slot: 'gloves', attack: 10, defense: 8, hp: 20, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Slay even gods' },
  { id: 'mithril_gauntlets', name: 'Mithril Gauntlets', slot: 'gloves', attack: 7, defense: 10, hp: 15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Elven metal' },
  // Epic - Mage
  { id: 'cosmic_gloves', name: 'Cosmic Gloves', slot: 'gloves', attack: 5, defense: 3, hp: 0, mp: 35, rarity: 'epic', allowedJobs: ['Mage'], description: 'Power of cosmos' },
  { id: 'archmage_gloves', name: 'Archmage Gloves', slot: 'gloves', attack: 6, defense: 4, hp: 10, mp: 30, rarity: 'epic', allowedJobs: ['Mage'], description: 'Ultimate magic' },
  { id: 'phoenix_gloves', name: 'Phoenix Gloves', slot: 'gloves', attack: 4, defense: 3, hp: 15, mp: 28, rarity: 'epic', allowedJobs: ['Mage'], description: 'Rebirth flames' },
  { id: 'time_gloves', name: 'Time Gloves', slot: 'gloves', attack: 3, defense: 2, hp: 0, mp: 40, rarity: 'epic', allowedJobs: ['Mage'], description: 'Bend time itself' },
  // Epic - Monk
  { id: 'celestial_wraps', name: 'Celestial Wraps', slot: 'gloves', attack: 10, defense: 5, hp: 15, mp: 10, rarity: 'epic', allowedJobs: ['Monk'], description: 'Heaven blessed' },
  { id: 'grandmaster_gloves', name: 'Grandmaster Gloves', slot: 'gloves', attack: 9, defense: 6, hp: 20, mp: 8, rarity: 'epic', allowedJobs: ['Monk'], description: 'Ultimate technique' },
  { id: 'phoenix_wraps', name: 'Phoenix Wraps', slot: 'gloves', attack: 8, defense: 4, hp: 18, mp: 12, rarity: 'epic', allowedJobs: ['Monk'], description: 'Rise from ashes' },
  { id: 'spirit_wraps', name: 'Spirit Wraps', slot: 'gloves', attack: 7, defense: 5, hp: 15, mp: 15, rarity: 'epic', allowedJobs: ['Monk'], description: 'Pure spirit energy' },
  // Epic - All Classes
  { id: 'divine_gloves', name: 'Divine Gloves', slot: 'gloves', attack: 6, defense: 6, hp: 15, mp: 15, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Divine blessing' },
  { id: 'infinity_gloves', name: 'Infinity Gloves', slot: 'gloves', attack: 8, defense: 8, hp: 20, mp: 20, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Infinite power' },

  // ========== ACCESSORIES ==========
  // Common
  { id: 'power_ring', name: 'Power Ring', slot: 'accessory', attack: 2, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Boosts attack power' },
  { id: 'guard_ring', name: 'Guard Ring', slot: 'accessory', attack: 0, defense: 2, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Boosts defense' },
  { id: 'lucky_charm', name: 'Lucky Charm', slot: 'accessory', attack: 1, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Brings good fortune' },
  { id: 'copper_band', name: 'Copper Band', slot: 'accessory', attack: 0, defense: 0, hp: 5, mp: 5, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Basic enchantment' },
  // Uncommon
  { id: 'life_pendant', name: 'Life Pendant', slot: 'accessory', attack: 0, defense: 0, hp: 15, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Increases vitality' },
  { id: 'mana_crystal', name: 'Mana Crystal', slot: 'accessory', attack: 0, defense: 0, hp: 0, mp: 15, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Stores magical energy' },
  { id: 'iron_amulet', name: 'Iron Amulet', slot: 'accessory', attack: 2, defense: 2, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Solid protection' },
  { id: 'spirit_bead', name: 'Spirit Bead', slot: 'accessory', attack: 1, defense: 1, hp: 5, mp: 10, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Contains a spirit' },
  { id: 'swift_boots', name: 'Swift Boots', slot: 'accessory', attack: 3, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Move like the wind' },
  // Rare
  { id: 'warriors_medal', name: "Warrior's Medal", slot: 'accessory', attack: 4, defense: 2, hp: 5, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Badge of a true warrior' },
  { id: 'arcane_focus', name: 'Arcane Focus', slot: 'accessory', attack: 2, defense: 0, hp: 0, mp: 20, rarity: 'rare', allowedJobs: ['Mage'], description: 'Amplifies magical power' },
  { id: 'zen_stone', name: 'Zen Stone', slot: 'accessory', attack: 3, defense: 1, hp: 5, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Perfect inner balance' },
  { id: 'ruby_pendant', name: 'Ruby Pendant', slot: 'accessory', attack: 5, defense: 0, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Burning power' },
  { id: 'sapphire_ring', name: 'Sapphire Ring', slot: 'accessory', attack: 0, defense: 0, hp: 0, mp: 25, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Ocean of mana' },
  { id: 'emerald_amulet', name: 'Emerald Amulet', slot: 'accessory', attack: 0, defense: 3, hp: 20, mp: 0, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Nature protection' },
  // Epic
  { id: 'champion_belt', name: 'Champion Belt', slot: 'accessory', attack: 6, defense: 4, hp: 15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Ultimate champion' },
  { id: 'void_orb', name: 'Void Orb', slot: 'accessory', attack: 5, defense: 0, hp: 0, mp: 50, rarity: 'epic', allowedJobs: ['Mage'], description: 'Pure magical essence' },
  { id: 'dragon_scale', name: 'Dragon Scale', slot: 'accessory', attack: 4, defense: 6, hp: 20, mp: 0, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Scale of an ancient' },
  { id: 'phoenix_feather', name: 'Phoenix Feather', slot: 'accessory', attack: 3, defense: 2, hp: 25, mp: 25, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Eternal rebirth' },
  { id: 'monks_prayer', name: "Monk's Prayer", slot: 'accessory', attack: 5, defense: 3, hp: 15, mp: 15, rarity: 'epic', allowedJobs: ['Monk'], description: 'Divine martial blessing' },
  { id: 'ring_of_power', name: 'Ring of Power', slot: 'accessory', attack: 8, defense: 0, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Overwhelming might' },
  { id: 'amulet_of_kings', name: 'Amulet of Kings', slot: 'accessory', attack: 4, defense: 4, hp: 20, mp: 20, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Worn by royalty' },

  // ========== ELEMENTAL WEAPONS ==========
  // Fire
  { id: 'flame_sword', name: 'Flame Sword', slot: 'weapon', attack: 14, defense: 0, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Burns with eternal flame' },
  { id: 'inferno_blade', name: 'Inferno Blade', slot: 'weapon', attack: 22, defense: 0, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Forged in volcanic fire' },
  { id: 'ember_staff', name: 'Ember Staff', slot: 'weapon', attack: 6, defense: 0, hp: 0, mp: 22, rarity: 'rare', allowedJobs: ['Mage'], description: 'Channels fire magic' },
  { id: 'blazing_fists', name: 'Blazing Fists', slot: 'weapon', attack: 12, defense: 0, hp: 0, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Fists of fire' },
  // Ice
  { id: 'frost_blade', name: 'Frost Blade', slot: 'weapon', attack: 13, defense: 1, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Cold as death' },
  { id: 'glacial_sword', name: 'Glacial Sword', slot: 'weapon', attack: 19, defense: 3, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Frozen for millennia' },
  { id: 'blizzard_rod', name: 'Blizzard Rod', slot: 'weapon', attack: 5, defense: 0, hp: 0, mp: 28, rarity: 'rare', allowedJobs: ['Mage'], description: 'Summons winter storms' },
  { id: 'frozen_claws', name: 'Frozen Claws', slot: 'weapon', attack: 11, defense: 2, hp: 0, mp: 3, rarity: 'rare', allowedJobs: ['Monk'], description: 'Freezing touch' },
  // Thunder
  { id: 'thunder_blade', name: 'Thunder Blade', slot: 'weapon', attack: 15, defense: 0, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Crackles with lightning' },
  { id: 'storm_breaker', name: 'Storm Breaker', slot: 'weapon', attack: 24, defense: 0, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Commands the storm' },
  { id: 'lightning_staff', name: 'Lightning Staff', slot: 'weapon', attack: 7, defense: 0, hp: 0, mp: 24, rarity: 'rare', allowedJobs: ['Mage'], description: 'Pure electrical power' },
  { id: 'shock_gauntlets', name: 'Shock Gauntlets', slot: 'weapon', attack: 13, defense: 0, hp: 0, mp: 4, rarity: 'rare', allowedJobs: ['Monk'], description: 'Electric strikes' },
  // Dark
  { id: 'shadow_blade', name: 'Shadow Blade', slot: 'weapon', attack: 16, defense: 0, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Forged in darkness' },
  { id: 'doom_bringer', name: 'Doom Bringer', slot: 'weapon', attack: 25, defense: 0, hp: -10, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Cursed blade of doom' },
  { id: 'dark_scepter', name: 'Dark Scepter', slot: 'weapon', attack: 8, defense: 0, hp: 0, mp: 30, rarity: 'rare', allowedJobs: ['Mage'], description: 'Channels dark magic' },
  { id: 'nightmare_staff', name: 'Nightmare Staff', slot: 'weapon', attack: 12, defense: 0, hp: -5, mp: 50, rarity: 'epic', allowedJobs: ['Mage'], description: 'Power at a cost' },
  { id: 'shadow_claws', name: 'Shadow Claws', slot: 'weapon', attack: 14, defense: 0, hp: 0, mp: 6, rarity: 'rare', allowedJobs: ['Monk'], description: 'Strike from shadows' },
  // Holy
  { id: 'holy_sword', name: 'Holy Sword', slot: 'weapon', attack: 14, defense: 2, hp: 5, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Blessed by the divine' },
  { id: 'sacred_blade', name: 'Sacred Blade', slot: 'weapon', attack: 20, defense: 4, hp: 15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Holy light incarnate' },
  { id: 'divine_staff', name: 'Divine Staff', slot: 'weapon', attack: 4, defense: 2, hp: 10, mp: 25, rarity: 'rare', allowedJobs: ['Mage'], description: 'Channels holy power' },
  { id: 'blessed_fists', name: 'Blessed Fists', slot: 'weapon', attack: 12, defense: 2, hp: 8, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Divine martial arts' },

  // ========== MORE WEAPON TYPES ==========
  // Spears/Polearms (Fighter)
  { id: 'wooden_spear', name: 'Wooden Spear', slot: 'weapon', attack: 4, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Simple thrusting weapon' },
  { id: 'iron_spear', name: 'Iron Spear', slot: 'weapon', attack: 7, defense: 2, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Reliable iron point' },
  { id: 'halberd', name: 'Halberd', slot: 'weapon', attack: 9, defense: 3, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Versatile polearm' },
  { id: 'steel_lance', name: 'Steel Lance', slot: 'weapon', attack: 13, defense: 2, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Knight cavalry weapon' },
  { id: 'dragon_lance', name: 'Dragon Lance', slot: 'weapon', attack: 21, defense: 4, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Made to pierce scales' },
  // Daggers (Fighter)
  { id: 'rusty_dagger', name: 'Rusty Dagger', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'Quick but weak' },
  { id: 'steel_dagger', name: 'Steel Dagger', slot: 'weapon', attack: 5, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Fast and deadly' },
  { id: 'assassin_blade', name: 'Assassin Blade', slot: 'weapon', attack: 9, defense: 0, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Silent killer' },
  { id: 'poison_dagger', name: 'Poison Dagger', slot: 'weapon', attack: 8, defense: 0, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Coated in venom' },
  // Orbs/Grimoires (Mage)
  { id: 'crystal_orb', name: 'Crystal Orb', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 14, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'See magical threads' },
  { id: 'dark_orb', name: 'Dark Orb', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 18, rarity: 'rare', allowedJobs: ['Mage'], description: 'Shadows within' },
  { id: 'apprentice_tome', name: 'Apprentice Tome', slot: 'weapon', attack: 1, defense: 0, hp: 0, mp: 12, rarity: 'common', allowedJobs: ['Mage'], description: 'Basic spell book' },
  { id: 'grimoire', name: 'Grimoire', slot: 'weapon', attack: 3, defense: 0, hp: 0, mp: 20, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Ancient spell book' },
  { id: 'necronomicon', name: 'Necronomicon', slot: 'weapon', attack: 6, defense: 0, hp: -10, mp: 40, rarity: 'epic', allowedJobs: ['Mage'], description: 'Forbidden knowledge' },
  { id: 'book_of_light', name: 'Book of Light', slot: 'weapon', attack: 5, defense: 2, hp: 10, mp: 35, rarity: 'epic', allowedJobs: ['Mage'], description: 'Divine scriptures' },
  // Bo Staff/Martial Weapons (Monk)
  { id: 'bo_staff', name: 'Bo Staff', slot: 'weapon', attack: 5, defense: 2, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Monk'], description: 'Traditional staff' },
  { id: 'iron_bo', name: 'Iron Bo', slot: 'weapon', attack: 8, defense: 3, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Heavy iron staff' },
  { id: 'sai', name: 'Sai', slot: 'weapon', attack: 6, defense: 3, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Defensive weapon' },
  { id: 'tonfa', name: 'Tonfa', slot: 'weapon', attack: 7, defense: 4, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Block and strike' },
  { id: 'jade_bo', name: 'Jade Bo', slot: 'weapon', attack: 11, defense: 4, hp: 5, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Carved from jade' },
  { id: 'monks_fury', name: "Monk's Fury", slot: 'weapon', attack: 16, defense: 3, hp: 10, mp: 10, rarity: 'epic', allowedJobs: ['Monk'], description: 'Ultimate martial weapon' },

  // ========== MORE ARMOR ==========
  // Cloaks (All classes)
  { id: 'travelers_cloak', name: "Traveler's Cloak", slot: 'armor', attack: 0, defense: 2, hp: 5, mp: 5, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Protects from elements' },
  { id: 'shadow_cloak', name: 'Shadow Cloak', slot: 'armor', attack: 2, defense: 4, hp: 0, mp: 10, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Blend with shadows' },
  { id: 'phoenix_cloak', name: 'Phoenix Cloak', slot: 'armor', attack: 3, defense: 6, hp: 20, mp: 20, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Rise from ashes' },
  // More Fighter Armor
  { id: 'banded_mail', name: 'Banded Mail', slot: 'armor', attack: 0, defense: 7, hp: 8, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Horizontal metal bands' },
  { id: 'splint_armor', name: 'Splint Armor', slot: 'armor', attack: 1, defense: 8, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Vertical metal strips' },
  { id: 'crystal_armor', name: 'Crystal Armor', slot: 'armor', attack: 2, defense: 12, hp: 15, mp: 10, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Magical crystal plates' },
  // More Mage Armor
  { id: 'mystic_robe', name: 'Mystic Robe', slot: 'armor', attack: 1, defense: 3, hp: 0, mp: 22, rarity: 'rare', allowedJobs: ['Mage'], description: 'Mystic enchantments' },
  { id: 'chaos_robe', name: 'Chaos Robe', slot: 'armor', attack: 5, defense: 2, hp: -5, mp: 50, rarity: 'epic', allowedJobs: ['Mage'], description: 'Unstable magic' },
  // More Monk Armor
  { id: 'iron_vest', name: 'Iron Vest', slot: 'armor', attack: 1, defense: 4, hp: 8, mp: 0, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Weighted training vest' },
  { id: 'spirit_robe', name: 'Spirit Robe', slot: 'armor', attack: 2, defense: 5, hp: 10, mp: 12, rarity: 'rare', allowedJobs: ['Monk'], description: 'Channel inner spirits' },

  // ========== MORE HELMETS ==========
  { id: 'bandits_mask', name: "Bandit's Mask", slot: 'helmet', attack: 2, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Monk'], description: 'Conceals identity' },
  { id: 'knights_visor', name: "Knight's Visor", slot: 'helmet', attack: 1, defense: 5, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Full face protection' },
  { id: 'crown_of_thorns', name: 'Crown of Thorns', slot: 'helmet', attack: 5, defense: 0, hp: -5, mp: 0, rarity: 'rare', allowedJobs: ['Fighter', 'Monk'], description: 'Pain becomes power' },
  { id: 'sage_hood', name: 'Sage Hood', slot: 'helmet', attack: 1, defense: 2, hp: 0, mp: 20, rarity: 'rare', allowedJobs: ['Mage'], description: 'Ancient wisdom' },
  { id: 'demon_mask', name: 'Demon Mask', slot: 'helmet', attack: 4, defense: 2, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Monk'], description: 'Terrifying presence' },
  { id: 'crown_of_flames', name: 'Crown of Flames', slot: 'helmet', attack: 6, defense: 2, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Burning crown' },
  { id: 'frozen_crown', name: 'Frozen Crown', slot: 'helmet', attack: 3, defense: 4, hp: 10, mp: 25, rarity: 'epic', allowedJobs: ['Mage'], description: 'Eternal ice' },
  { id: 'third_eye_band', name: 'Third Eye Band', slot: 'helmet', attack: 4, defense: 2, hp: 5, mp: 20, rarity: 'epic', allowedJobs: ['Monk'], description: 'See beyond' },

  // ========== MORE ACCESSORIES ==========
  // Boots
  { id: 'leather_boots', name: 'Leather Boots', slot: 'accessory', attack: 0, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Basic footwear' },
  { id: 'iron_boots', name: 'Iron Boots', slot: 'accessory', attack: 0, defense: 3, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Heavy but protective' },
  { id: 'wind_boots', name: 'Wind Boots', slot: 'accessory', attack: 4, defense: 1, hp: 0, mp: 5, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Light as air' },
  { id: 'dragon_boots', name: 'Dragon Boots', slot: 'accessory', attack: 5, defense: 5, hp: 10, mp: 0, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Dragon scale boots' },
  // Belts
  { id: 'leather_belt', name: 'Leather Belt', slot: 'accessory', attack: 1, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Simple belt' },
  { id: 'warriors_belt', name: "Warrior's Belt", slot: 'accessory', attack: 3, defense: 2, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Battle ready' },
  { id: 'mystic_sash', name: 'Mystic Sash', slot: 'accessory', attack: 1, defense: 1, hp: 0, mp: 15, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Magical sash' },
  { id: 'black_belt', name: 'Black Belt', slot: 'accessory', attack: 4, defense: 2, hp: 10, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Master rank' },
  // Capes
  { id: 'wool_cape', name: 'Wool Cape', slot: 'accessory', attack: 0, defense: 2, hp: 5, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Warm and protective' },
  { id: 'battle_cape', name: 'Battle Cape', slot: 'accessory', attack: 2, defense: 3, hp: 10, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Worn into battle' },
  { id: 'wizards_cape', name: "Wizard's Cape", slot: 'accessory', attack: 1, defense: 2, hp: 0, mp: 18, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Magical protection' },
  { id: 'cape_of_shadows', name: 'Cape of Shadows', slot: 'accessory', attack: 4, defense: 4, hp: 0, mp: 15, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Move unseen' },
  { id: 'royal_cape', name: 'Royal Cape', slot: 'accessory', attack: 3, defense: 5, hp: 15, mp: 15, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Worn by kings' },
  // Earrings
  { id: 'copper_earring', name: 'Copper Earring', slot: 'accessory', attack: 1, defense: 0, hp: 0, mp: 3, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Simple copper' },
  { id: 'silver_earring', name: 'Silver Earring', slot: 'accessory', attack: 2, defense: 1, hp: 0, mp: 8, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Fine silver' },
  { id: 'gold_earring', name: 'Gold Earring', slot: 'accessory', attack: 3, defense: 2, hp: 5, mp: 12, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Pure gold' },
  { id: 'diamond_earring', name: 'Diamond Earring', slot: 'accessory', attack: 5, defense: 3, hp: 10, mp: 20, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Flawless diamond' },
  // Gloves
  { id: 'leather_gloves', name: 'Leather Gloves', slot: 'accessory', attack: 1, defense: 1, hp: 0, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Basic hand protection' },
  { id: 'gauntlets', name: 'Gauntlets', slot: 'accessory', attack: 3, defense: 3, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Metal hand guards' },
  { id: 'spell_gloves', name: 'Spell Gloves', slot: 'accessory', attack: 2, defense: 0, hp: 0, mp: 15, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Enhance casting' },
  { id: 'dragon_gauntlets', name: 'Dragon Gauntlets', slot: 'accessory', attack: 6, defense: 4, hp: 10, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Dragon claw design' },

  // ========== LEGENDARY ITEMS (Floor 10+) ==========
  { id: 'excalibur', name: 'Excalibur', slot: 'weapon', attack: 30, defense: 5, hp: 20, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'The legendary sword' },
  { id: 'mjolnir', name: 'Mjolnir', slot: 'weapon', attack: 28, defense: 3, hp: 15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Hammer of the gods' },
  { id: 'masamune', name: 'Masamune', slot: 'weapon', attack: 26, defense: 0, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Perfect katana' },
  { id: 'staff_of_merlin', name: 'Staff of Merlin', slot: 'weapon', attack: 10, defense: 3, hp: 15, mp: 60, rarity: 'epic', allowedJobs: ['Mage'], description: 'Legendary wizard staff' },
  { id: 'wand_of_cosmos', name: 'Wand of Cosmos', slot: 'weapon', attack: 12, defense: 0, hp: 0, mp: 70, rarity: 'epic', allowedJobs: ['Mage'], description: 'Contains a galaxy' },
  { id: 'fist_of_buddha', name: 'Fist of Buddha', slot: 'weapon', attack: 18, defense: 5, hp: 20, mp: 20, rarity: 'epic', allowedJobs: ['Monk'], description: 'Enlightened strikes' },
  { id: 'dragon_emperor_armor', name: 'Dragon Emperor Armor', slot: 'armor', attack: 5, defense: 20, hp: 30, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Ultimate protection' },
  { id: 'robe_of_archmagi', name: 'Robe of the Archmagi', slot: 'armor', attack: 6, defense: 8, hp: 15, mp: 60, rarity: 'epic', allowedJobs: ['Mage'], description: 'Worn by the greatest' },
  { id: 'grandmaster_gi', name: 'Grandmaster Gi', slot: 'armor', attack: 8, defense: 10, hp: 25, mp: 20, rarity: 'epic', allowedJobs: ['Monk'], description: 'Ultimate martial attire' },
  { id: 'crown_of_gods', name: 'Crown of Gods', slot: 'helmet', attack: 6, defense: 6, hp: 20, mp: 30, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Divine crown' },
  { id: 'infinity_band', name: 'Infinity Band', slot: 'accessory', attack: 8, defense: 8, hp: 30, mp: 30, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Infinite power' },
  { id: 'heart_of_dragon', name: 'Heart of Dragon', slot: 'accessory', attack: 10, defense: 5, hp: 50, mp: 0, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'A dragons heart' },
  { id: 'soul_gem', name: 'Soul Gem', slot: 'accessory', attack: 6, defense: 0, hp: 0, mp: 80, rarity: 'epic', allowedJobs: ['Mage'], description: 'Contains souls' },

  // ========== CURSED ITEMS (High power, negative effects) ==========
  { id: 'cursed_blade', name: 'Cursed Blade', slot: 'weapon', attack: 18, defense: 0, hp: -15, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Power at a price' },
  { id: 'blood_sword', name: 'Blood Sword', slot: 'weapon', attack: 20, defense: -2, hp: -10, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Thirsts for blood' },
  { id: 'demon_axe', name: 'Demon Axe', slot: 'weapon', attack: 24, defense: 0, hp: -20, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Demonic power' },
  { id: 'soul_reaver', name: 'Soul Reaver', slot: 'weapon', attack: 28, defense: 0, hp: -25, mp: -10, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Devours souls' },
  { id: 'chaos_staff', name: 'Chaos Staff', slot: 'weapon', attack: 10, defense: 0, hp: -10, mp: 45, rarity: 'epic', allowedJobs: ['Mage'], description: 'Chaotic energy' },
  { id: 'lich_staff', name: 'Lich Staff', slot: 'weapon', attack: 8, defense: 0, hp: -20, mp: 55, rarity: 'epic', allowedJobs: ['Mage'], description: 'Undead power' },
  { id: 'blood_fists', name: 'Blood Fists', slot: 'weapon', attack: 16, defense: 0, hp: -10, mp: 0, rarity: 'epic', allowedJobs: ['Monk'], description: 'Stained red' },
  { id: 'cursed_armor', name: 'Cursed Armor', slot: 'armor', attack: 5, defense: 15, hp: -15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Haunted protection' },
  { id: 'demon_robe', name: 'Demon Robe', slot: 'armor', attack: 6, defense: 4, hp: -10, mp: 55, rarity: 'epic', allowedJobs: ['Mage'], description: 'Demonic magic' },
  { id: 'berserker_helm', name: 'Berserker Helm', slot: 'helmet', attack: 8, defense: 0, hp: -10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Rage unleashed' },
  { id: 'skull_mask', name: 'Skull Mask', slot: 'helmet', attack: 5, defense: 2, hp: -5, mp: 20, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], description: 'Death incarnate' },
  { id: 'cursed_ring', name: 'Cursed Ring', slot: 'accessory', attack: 10, defense: 0, hp: -15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Corrupted power' },
  { id: 'dark_amulet', name: 'Dark Amulet', slot: 'accessory', attack: 6, defense: 0, hp: -10, mp: 40, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Dark blessing' },

  // ========== NATURE/EARTH WEAPONS ==========
  { id: 'vine_whip', name: 'Vine Whip', slot: 'weapon', attack: 8, defense: 0, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Living plant weapon' },
  { id: 'stone_hammer', name: 'Stone Hammer', slot: 'weapon', attack: 10, defense: 3, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Solid as rock' },
  { id: 'earthen_blade', name: 'Earthen Blade', slot: 'weapon', attack: 14, defense: 4, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Born from earth' },
  { id: 'nature_staff', name: 'Nature Staff', slot: 'weapon', attack: 4, defense: 2, hp: 15, mp: 18, rarity: 'rare', allowedJobs: ['Mage'], description: 'Channel nature' },
  { id: 'druid_rod', name: 'Druid Rod', slot: 'weapon', attack: 5, defense: 3, hp: 20, mp: 22, rarity: 'epic', allowedJobs: ['Mage'], description: 'Ancient druid magic' },
  { id: 'stone_fists', name: 'Stone Fists', slot: 'weapon', attack: 10, defense: 5, hp: 8, mp: 0, rarity: 'rare', allowedJobs: ['Monk'], description: 'Fists of stone' },
  { id: 'earth_gauntlets', name: 'Earth Gauntlets', slot: 'weapon', attack: 14, defense: 6, hp: 15, mp: 0, rarity: 'epic', allowedJobs: ['Monk'], description: 'Earths strength' },

  // ========== WIND WEAPONS ==========
  { id: 'gale_blade', name: 'Gale Blade', slot: 'weapon', attack: 12, defense: 0, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Swift as wind' },
  { id: 'hurricane_sword', name: 'Hurricane Sword', slot: 'weapon', attack: 18, defense: 0, hp: 0, mp: 5, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Creates hurricanes' },
  { id: 'zephyr_staff', name: 'Zephyr Staff', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 25, rarity: 'rare', allowedJobs: ['Mage'], description: 'Gentle breeze magic' },
  { id: 'tempest_rod', name: 'Tempest Rod', slot: 'weapon', attack: 7, defense: 0, hp: 0, mp: 35, rarity: 'epic', allowedJobs: ['Mage'], description: 'Storm controller' },
  { id: 'wind_claws', name: 'Wind Claws', slot: 'weapon', attack: 11, defense: 0, hp: 0, mp: 8, rarity: 'rare', allowedJobs: ['Monk'], description: 'Cut like wind' },

  // ========== UNIQUE NAMED WEAPONS ==========
  { id: 'ragnarok', name: 'Ragnarok', slot: 'weapon', attack: 32, defense: 4, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'End of days' },
  { id: 'durandal', name: 'Durandal', slot: 'weapon', attack: 27, defense: 6, hp: 10, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Legendary paladin sword' },
  { id: 'gungnir', name: 'Gungnir', slot: 'weapon', attack: 29, defense: 2, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Spear of the gods' },
  { id: 'caladbolg', name: 'Caladbolg', slot: 'weapon', attack: 25, defense: 3, hp: 15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Rainbow sword' },
  { id: 'claymore', name: 'Claymore', slot: 'weapon', attack: 15, defense: 0, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Massive two-hander' },
  { id: 'katana', name: 'Katana', slot: 'weapon', attack: 11, defense: 1, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Eastern blade' },
  { id: 'scimitar', name: 'Scimitar', slot: 'weapon', attack: 9, defense: 0, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Curved desert blade' },
  { id: 'rapier', name: 'Rapier', slot: 'weapon', attack: 8, defense: 2, hp: 0, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Swift and precise' },
  { id: 'falchion', name: 'Falchion', slot: 'weapon', attack: 10, defense: 0, hp: 0, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Curved chopping blade' },

  // ========== MORE MAGE ITEMS ==========
  { id: 'time_staff', name: 'Time Staff', slot: 'weapon', attack: 6, defense: 0, hp: 0, mp: 38, rarity: 'epic', allowedJobs: ['Mage'], description: 'Bends time' },
  { id: 'gravity_orb', name: 'Gravity Orb', slot: 'weapon', attack: 8, defense: 0, hp: 0, mp: 32, rarity: 'epic', allowedJobs: ['Mage'], description: 'Controls gravity' },
  { id: 'starlight_wand', name: 'Starlight Wand', slot: 'weapon', attack: 5, defense: 0, hp: 5, mp: 28, rarity: 'rare', allowedJobs: ['Mage'], description: 'Captured starlight' },
  { id: 'moon_staff', name: 'Moon Staff', slot: 'weapon', attack: 4, defense: 1, hp: 10, mp: 30, rarity: 'rare', allowedJobs: ['Mage'], description: 'Lunar power' },
  { id: 'sun_rod', name: 'Sun Rod', slot: 'weapon', attack: 9, defense: 0, hp: 0, mp: 26, rarity: 'rare', allowedJobs: ['Mage'], description: 'Solar energy' },
  { id: 'prism_orb', name: 'Prism Orb', slot: 'weapon', attack: 7, defense: 0, hp: 0, mp: 34, rarity: 'epic', allowedJobs: ['Mage'], description: 'Rainbow magic' },

  // ========== MORE MONK ITEMS ==========
  { id: 'meteor_fists', name: 'Meteor Fists', slot: 'weapon', attack: 17, defense: 0, hp: 0, mp: 8, rarity: 'epic', allowedJobs: ['Monk'], description: 'Strike like meteors' },
  { id: 'phoenix_claws', name: 'Phoenix Claws', slot: 'weapon', attack: 15, defense: 2, hp: 15, mp: 10, rarity: 'epic', allowedJobs: ['Monk'], description: 'Rebirth flames' },
  { id: 'lotus_palm', name: 'Lotus Palm', slot: 'weapon', attack: 10, defense: 3, hp: 12, mp: 12, rarity: 'rare', allowedJobs: ['Monk'], description: 'Peaceful yet deadly' },
  { id: 'mantis_claws', name: 'Mantis Claws', slot: 'weapon', attack: 12, defense: 1, hp: 0, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Praying mantis style' },
  { id: 'crane_talons', name: 'Crane Talons', slot: 'weapon', attack: 9, defense: 4, hp: 8, mp: 8, rarity: 'rare', allowedJobs: ['Monk'], description: 'Crane technique' },
  { id: 'snake_fangs', name: 'Snake Fangs', slot: 'weapon', attack: 13, defense: 0, hp: 0, mp: 6, rarity: 'rare', allowedJobs: ['Monk'], description: 'Venomous strikes' },

  // ========== TRIBAL/ANCIENT ARMOR ==========
  { id: 'bone_armor', name: 'Bone Armor', slot: 'armor', attack: 2, defense: 6, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Made from bones' },
  { id: 'tribal_garb', name: 'Tribal Garb', slot: 'armor', attack: 3, defense: 4, hp: 8, mp: 5, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Ancient warrior clothes' },
  { id: 'shaman_robe', name: 'Shaman Robe', slot: 'armor', attack: 2, defense: 3, hp: 5, mp: 22, rarity: 'rare', allowedJobs: ['Mage'], description: 'Spirit magic' },
  { id: 'dragonhide', name: 'Dragonhide', slot: 'armor', attack: 4, defense: 14, hp: 20, mp: 0, rarity: 'epic', allowedJobs: ['Fighter', 'Monk'], description: 'Dragon skin armor' },
  { id: 'ancient_mail', name: 'Ancient Mail', slot: 'armor', attack: 3, defense: 11, hp: 15, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Lost civilization armor' },
  { id: 'spirit_vestment', name: 'Spirit Vestment', slot: 'armor', attack: 3, defense: 5, hp: 10, mp: 28, rarity: 'rare', allowedJobs: ['Mage'], description: 'Spirit enhanced' },

  // ========== HELMETS - MASKS & CROWNS ==========
  { id: 'war_mask', name: 'War Mask', slot: 'helmet', attack: 3, defense: 3, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter', 'Monk'], description: 'Intimidating mask' },
  { id: 'oni_mask', name: 'Oni Mask', slot: 'helmet', attack: 5, defense: 2, hp: 0, mp: 5, rarity: 'rare', allowedJobs: ['Monk'], description: 'Demon warrior mask' },
  { id: 'spirit_mask', name: 'Spirit Mask', slot: 'helmet', attack: 2, defense: 2, hp: 5, mp: 18, rarity: 'rare', allowedJobs: ['Mage', 'Monk'], description: 'See spirits' },
  { id: 'golden_crown', name: 'Golden Crown', slot: 'helmet', attack: 4, defense: 5, hp: 15, mp: 15, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Royal headpiece' },
  { id: 'viking_helm', name: 'Viking Helm', slot: 'helmet', attack: 2, defense: 4, hp: 10, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'Horned helmet' },
  { id: 'samurai_kabuto', name: 'Samurai Kabuto', slot: 'helmet', attack: 3, defense: 5, hp: 8, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Eastern warrior helm' },
  { id: 'mage_crown', name: 'Mage Crown', slot: 'helmet', attack: 3, defense: 2, hp: 0, mp: 30, rarity: 'rare', allowedJobs: ['Mage'], description: 'Crown of magic' },
  { id: 'ancient_circlet', name: 'Ancient Circlet', slot: 'helmet', attack: 2, defense: 3, hp: 10, mp: 25, rarity: 'rare', allowedJobs: ['Mage'], description: 'Lost civilization' },

  // ========== MORE ACCESSORIES - AMULETS ==========
  { id: 'wolf_fang_necklace', name: 'Wolf Fang Necklace', slot: 'accessory', attack: 4, defense: 0, hp: 5, mp: 0, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Wolf spirit' },
  { id: 'bear_claw_pendant', name: 'Bear Claw Pendant', slot: 'accessory', attack: 3, defense: 3, hp: 10, mp: 0, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Bear strength' },
  { id: 'eagle_feather', name: 'Eagle Feather', slot: 'accessory', attack: 4, defense: 0, hp: 0, mp: 10, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Keen vision' },
  { id: 'serpent_fang', name: 'Serpent Fang', slot: 'accessory', attack: 5, defense: 0, hp: 0, mp: 8, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Venomous power' },
  { id: 'tiger_eye', name: 'Tiger Eye', slot: 'accessory', attack: 5, defense: 2, hp: 8, mp: 0, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Predator focus' },
  { id: 'dragon_tooth', name: 'Dragon Tooth', slot: 'accessory', attack: 7, defense: 3, hp: 15, mp: 0, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Ancient dragon' },
  { id: 'phoenix_ash', name: 'Phoenix Ash', slot: 'accessory', attack: 4, defense: 4, hp: 20, mp: 20, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Reborn from ash' },

  // ========== MORE ACCESSORIES - RINGS ==========
  { id: 'iron_ring', name: 'Iron Ring', slot: 'accessory', attack: 0, defense: 2, hp: 5, mp: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Simple iron' },
  { id: 'silver_ring', name: 'Silver Ring', slot: 'accessory', attack: 1, defense: 1, hp: 0, mp: 8, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Enchanted silver' },
  { id: 'gold_ring', name: 'Gold Ring', slot: 'accessory', attack: 2, defense: 2, hp: 5, mp: 5, rarity: 'uncommon', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Fine gold' },
  { id: 'platinum_ring', name: 'Platinum Ring', slot: 'accessory', attack: 3, defense: 3, hp: 10, mp: 10, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Precious platinum' },
  { id: 'mithril_ring', name: 'Mithril Ring', slot: 'accessory', attack: 4, defense: 4, hp: 12, mp: 12, rarity: 'rare', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Elven metal' },
  { id: 'adamant_ring', name: 'Adamant Ring', slot: 'accessory', attack: 6, defense: 6, hp: 15, mp: 15, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Indestructible' },
  { id: 'elemental_ring', name: 'Elemental Ring', slot: 'accessory', attack: 5, defense: 2, hp: 10, mp: 20, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Four elements' },

  // ========== CLASS-SPECIFIC ACCESSORIES ==========
  { id: 'knights_shield', name: "Knight's Shield", slot: 'accessory', attack: 0, defense: 8, hp: 15, mp: 0, rarity: 'rare', allowedJobs: ['Fighter'], description: 'Block attacks' },
  { id: 'tower_shield', name: 'Tower Shield', slot: 'accessory', attack: 0, defense: 12, hp: 20, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Massive protection' },
  { id: 'mana_stone', name: 'Mana Stone', slot: 'accessory', attack: 0, defense: 0, hp: 0, mp: 30, rarity: 'rare', allowedJobs: ['Mage'], description: 'Pure mana' },
  { id: 'arcane_crystal', name: 'Arcane Crystal', slot: 'accessory', attack: 4, defense: 0, hp: 0, mp: 45, rarity: 'epic', allowedJobs: ['Mage'], description: 'Arcane power' },
  { id: 'meditation_beads', name: 'Meditation Beads', slot: 'accessory', attack: 2, defense: 2, hp: 10, mp: 15, rarity: 'rare', allowedJobs: ['Monk'], description: 'Inner peace' },
  { id: 'chi_crystal', name: 'Chi Crystal', slot: 'accessory', attack: 5, defense: 3, hp: 12, mp: 18, rarity: 'epic', allowedJobs: ['Monk'], description: 'Pure chi' },

  // ========== ULTIMATE TIER ITEMS ==========
  { id: 'blade_of_chaos', name: 'Blade of Chaos', slot: 'weapon', attack: 35, defense: 0, hp: 0, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Ultimate chaos weapon' },
  { id: 'aegis_blade', name: 'Aegis Blade', slot: 'weapon', attack: 25, defense: 10, hp: 25, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Attack and defend' },
  { id: 'cosmic_staff', name: 'Cosmic Staff', slot: 'weapon', attack: 12, defense: 2, hp: 10, mp: 75, rarity: 'epic', allowedJobs: ['Mage'], description: 'Power of the cosmos' },
  { id: 'divine_fists', name: 'Divine Fists', slot: 'weapon', attack: 20, defense: 5, hp: 25, mp: 25, rarity: 'epic', allowedJobs: ['Monk'], description: 'Gods blessing' },
  { id: 'godslayer_armor', name: 'Godslayer Armor', slot: 'armor', attack: 8, defense: 22, hp: 40, mp: 0, rarity: 'epic', allowedJobs: ['Fighter'], description: 'Slay even gods' },
  { id: 'cosmos_robe', name: 'Cosmos Robe', slot: 'armor', attack: 8, defense: 10, hp: 20, mp: 70, rarity: 'epic', allowedJobs: ['Mage'], description: 'Woven from stars' },
  { id: 'immortal_gi', name: 'Immortal Gi', slot: 'armor', attack: 10, defense: 12, hp: 35, mp: 25, rarity: 'epic', allowedJobs: ['Monk'], description: 'Never die' },
  { id: 'helm_of_legends', name: 'Helm of Legends', slot: 'helmet', attack: 8, defense: 8, hp: 25, mp: 25, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Legendary helm' },
  { id: 'godstone', name: 'Godstone', slot: 'accessory', attack: 10, defense: 10, hp: 40, mp: 40, rarity: 'epic', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Divine artifact' },
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
export function getEffectiveStats(player: Player): { attack: number; defense: number; maxHp: number; maxMp: number } {
  let attack = player.attack;
  let defense = player.defense;
  let maxHp = player.maxHp;
  let maxMp = player.maxMp;
  
  const slots: EquipmentSlot[] = ['weapon', 'shield', 'armor', 'helmet', 'gloves', 'accessory'];
  for (const slot of slots) {
    const item = player.equipment[slot];
    if (item) {
      const enhanced = getEnhancedStats(item);
      attack += enhanced.attack;
      defense += enhanced.defense;
      maxHp += enhanced.hp;
      maxMp += enhanced.mp;
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
        equipment: { weapon: fighterWeapon, shield: null, armor: fighterArmor, helmet: null, gloves: null, accessory: null }
      },
      { 
        id: 'p2', name: 'Pyra', job: 'Mage', 
        hp: 30, maxHp: 30, mp: 40, maxMp: 40, attack: 4, defense: 4, 
        color: '#9b59b6', xp: 0, level: 1,
        equipment: { weapon: mageWeapon, shield: null, armor: mageArmor, helmet: null, gloves: null, accessory: null }
      },
      { 
        id: 'p3', name: 'Milo', job: 'Monk', 
        hp: 45, maxHp: 45, mp: 10, maxMp: 10, attack: 10, defense: 6, 
        color: '#f1c40f', xp: 0, level: 1,
        equipment: { weapon: monkWeapon, shield: null, armor: monkArmor, helmet: null, gloves: null, accessory: null }
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
  // === EARLY FLOOR MONSTERS (Floors 1-2) ===
  { id: 'm1', name: 'Cave Bat', hp: 12, maxHp: 12, mp: 0, maxMp: 0, attack: 3, defense: 1, xpValue: 6, goldValue: 2, color: '#4a0080' },
  { id: 'm2', name: 'Giant Rat', hp: 15, maxHp: 15, mp: 0, maxMp: 0, attack: 4, defense: 1, xpValue: 8, goldValue: 3, color: '#8B4513' },
  { id: 'm3', name: 'Poison Mushroom', hp: 18, maxHp: 18, mp: 0, maxMp: 0, attack: 4, defense: 2, xpValue: 9, goldValue: 4, color: '#e74c3c' },
  { id: 'm4', name: 'Slimy Ooze', hp: 20, maxHp: 20, mp: 0, maxMp: 0, attack: 5, defense: 2, xpValue: 10, goldValue: 5, color: '#2ecc71' },
  { id: 'm5', name: 'Giant Beetle', hp: 18, maxHp: 18, mp: 0, maxMp: 0, attack: 5, defense: 3, xpValue: 10, goldValue: 5, color: '#1a1a2e' },
  { id: 'm6', name: 'Cave Crawler', hp: 16, maxHp: 16, mp: 0, maxMp: 0, attack: 6, defense: 1, xpValue: 9, goldValue: 4, color: '#5d4e37' },
  { id: 'm7', name: 'Kobold', hp: 20, maxHp: 20, mp: 0, maxMp: 0, attack: 5, defense: 2, xpValue: 11, goldValue: 6, color: '#8b6914' },
  { id: 'm8', name: 'Fire Imp', hp: 14, maxHp: 14, mp: 10, maxMp: 10, attack: 7, defense: 1, xpValue: 12, goldValue: 8, color: '#ff4500' },
  { id: 'm9', name: 'Shadow Wisp', hp: 10, maxHp: 10, mp: 15, maxMp: 15, attack: 8, defense: 0, xpValue: 11, goldValue: 7, color: '#2c2c54' },
  
  // === MID FLOOR MONSTERS (Floors 3-5) ===
  { id: 'm10', name: 'Dungeon Spider', hp: 22, maxHp: 22, mp: 0, maxMp: 0, attack: 6, defense: 2, xpValue: 12, goldValue: 7, color: '#2c3e50' },
  { id: 'm11', name: 'Small Goblin', hp: 25, maxHp: 25, mp: 0, maxMp: 0, attack: 6, defense: 3, xpValue: 14, goldValue: 10, color: '#27ae60' },
  { id: 'm12', name: 'Zombie', hp: 35, maxHp: 35, mp: 0, maxMp: 0, attack: 7, defense: 2, xpValue: 16, goldValue: 8, color: '#556b2f' },
  { id: 'm13', name: 'Slime Warrior', hp: 35, maxHp: 35, mp: 0, maxMp: 0, attack: 8, defense: 3, xpValue: 20, goldValue: 15, color: '#9b59b6' },
  { id: 'm14', name: 'Skeleton', hp: 40, maxHp: 40, mp: 0, maxMp: 0, attack: 10, defense: 4, xpValue: 25, goldValue: 20, color: '#bdc3c7' },
  { id: 'm15', name: 'Harpy', hp: 30, maxHp: 30, mp: 5, maxMp: 5, attack: 9, defense: 2, xpValue: 22, goldValue: 18, color: '#daa520' },
  { id: 'm16', name: 'Mummy', hp: 45, maxHp: 45, mp: 0, maxMp: 0, attack: 8, defense: 5, xpValue: 28, goldValue: 22, color: '#d2b48c' },
  { id: 'm17', name: 'Werewolf', hp: 50, maxHp: 50, mp: 0, maxMp: 0, attack: 12, defense: 4, xpValue: 32, goldValue: 28, color: '#4a4a4a' },
  
  // === DEEP FLOOR MONSTERS (Floors 6-8) ===
  { id: 'm18', name: 'Orc Warrior', hp: 60, maxHp: 60, mp: 0, maxMp: 0, attack: 12, defense: 5, xpValue: 40, goldValue: 35, color: '#2d5a27' },
  { id: 'm19', name: 'Troll', hp: 80, maxHp: 80, mp: 0, maxMp: 0, attack: 14, defense: 6, xpValue: 50, goldValue: 45, color: '#3d5c3a' },
  { id: 'm20', name: 'Dark Knight', hp: 70, maxHp: 70, mp: 10, maxMp: 10, attack: 16, defense: 8, xpValue: 55, goldValue: 50, color: '#1a1a2e' },
  { id: 'm21', name: 'Gargoyle', hp: 65, maxHp: 65, mp: 0, maxMp: 0, attack: 13, defense: 10, xpValue: 48, goldValue: 42, color: '#696969' },
  { id: 'm22', name: 'Minotaur', hp: 90, maxHp: 90, mp: 0, maxMp: 0, attack: 18, defense: 6, xpValue: 60, goldValue: 55, color: '#8b4513' },
  { id: 'm23', name: 'Wraith', hp: 45, maxHp: 45, mp: 30, maxMp: 30, attack: 15, defense: 3, xpValue: 52, goldValue: 48, color: '#483d8b' },
  
  // === BOSS-TIER MONSTERS (Floors 9+) ===
  { id: 'm24', name: 'Golem', hp: 120, maxHp: 120, mp: 0, maxMp: 0, attack: 20, defense: 12, xpValue: 80, goldValue: 75, color: '#708090' },
  { id: 'm25', name: 'Basilisk', hp: 85, maxHp: 85, mp: 0, maxMp: 0, attack: 22, defense: 8, xpValue: 85, goldValue: 80, color: '#228b22' },
  { id: 'm26', name: 'Death Knight', hp: 100, maxHp: 100, mp: 20, maxMp: 20, attack: 24, defense: 10, xpValue: 95, goldValue: 90, color: '#2f0f3d' },
  { id: 'm27', name: 'Lich', hp: 70, maxHp: 70, mp: 50, maxMp: 50, attack: 20, defense: 5, xpValue: 100, goldValue: 100, color: '#4b0082' },
  { id: 'm28', name: 'Demon', hp: 110, maxHp: 110, mp: 25, maxMp: 25, attack: 26, defense: 9, xpValue: 110, goldValue: 110, color: '#8b0000' },
  { id: 'm29', name: 'Dragon', hp: 150, maxHp: 150, mp: 30, maxMp: 30, attack: 30, defense: 12, xpValue: 150, goldValue: 150, color: '#b22222' },
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
