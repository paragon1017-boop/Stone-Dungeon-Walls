// Complete Equipment Database - 486 Set Items + Starter Equipment
// 18 Sets: 9 Starter (Uncommon) + 9 Advanced (Epic)

import type { Equipment } from './game-engine';

// Extended set names for all 18 sets
export type ExtendedEquipmentSet = 
  // Starter Sets (Uncommon)
  | "Warrior's Might" | "Hunter's Focus" | "Brute Force"
  | "Elemental Apprentice" | "Arcane Scholar" | "Battle Mage"
  | "Martial Disciple" | "Shadow Stalker" | "Iron Body"
  // Advanced Sets (Epic)
  | "Blade Dancer" | "Bulwark Sentinel" | "Vampiric Embrace"
  | "Wind Dancer" | "Riposte" | "Frozen Wasteland"
  | "Inferno Blaze" | "Storm Caller" | "Earthen Colossus"
  | "None";

// Set Bonus Definitions
export interface SetBonus {
  threshold: number; // Number of pieces needed
  attackPercent?: number;
  defensePercent?: number;
  hpPercent?: number;
  mpPercent?: number;
  speedPercent?: number;
  critChance?: number;      // Percentage chance for critical hit
  critDamage?: number;      // Percentage extra damage on crit
  evasion?: number;         // Percentage chance to dodge
  defensePenetration?: number; // Percentage of enemy defense ignored
  lifesteal?: number;       // Percentage of damage returned as HP
  counterChance?: number;   // Percentage chance to counter-attack
  onHitHeal?: number;       // Flat HP healed per hit
  burnDamage?: number;      // DoT damage per turn
  slowEffect?: number;      // Speed reduction percentage
  chainDamage?: number;     // Damage to additional enemies
  description: string;
}

export interface SetBonusData {
  name: string;
  theme: string;
  bonuses: SetBonus[];
}

// Complete Set Bonus Definitions - properly typed to all extended sets
export const SET_BONUSES: Record<Exclude<ExtendedEquipmentSet, "None">, SetBonusData> = {
  // === STARTER SETS (Uncommon) ===
  "Warrior's Might": {
    name: "Warrior's Might",
    theme: "Defensive Evolution",
    bonuses: [
      { threshold: 2, attackPercent: 10, defensePercent: 10, description: "+10% Attack & Defense" },
      { threshold: 4, attackPercent: 20, hpPercent: 20, description: "+20% Attack & HP" },
      { threshold: 6, attackPercent: 30, defensePercent: 30, description: "+30% Attack & Defense" },
      { threshold: 9, defensePercent: 40, hpPercent: 15, description: "+40% Defense, +15% HP" }
    ]
  },
  "Hunter's Focus": {
    name: "Hunter's Focus",
    theme: "Speed & Critical",
    bonuses: [
      { threshold: 2, speedPercent: 15, description: "+15% Speed" },
      { threshold: 4, critChance: 10, description: "+10% Critical Chance" },
      { threshold: 6, speedPercent: 20, critChance: 15, description: "+20% Speed & +15% Crit" },
      { threshold: 9, speedPercent: 30, critChance: 20, defensePenetration: 15, description: "+30% Speed, +20% Crit, Ignore 15% Defense" }
    ]
  },
  "Brute Force": {
    name: "Brute Force",
    theme: "Raw Power",
    bonuses: [
      { threshold: 2, attackPercent: 15, description: "+15% Attack" },
      { threshold: 4, defensePenetration: 10, description: "Ignore 10% Defense" },
      { threshold: 6, attackPercent: 30, defensePenetration: 15, description: "+30% Attack & Ignore 15% Defense" },
      { threshold: 9, attackPercent: 45, defensePenetration: 25, hpPercent: 10, description: "+45% Attack, Ignore 25% Defense, +10% HP" }
    ]
  },
  "Elemental Apprentice": {
    name: "Elemental Apprentice",
    theme: "Elemental Magic",
    bonuses: [
      { threshold: 2, mpPercent: 15, description: "+15% MP" },
      { threshold: 4, attackPercent: 10, description: "+10% Elemental Damage" },
      { threshold: 6, mpPercent: 25, attackPercent: 15, description: "+25% MP & +15% Elemental Damage" },
      { threshold: 9, mpPercent: 30, attackPercent: 20, speedPercent: 10, description: "+30% MP, +20% Elemental Damage, +10% Cast Speed" }
    ]
  },
  "Arcane Scholar": {
    name: "Arcane Scholar",
    theme: "Spell Efficiency",
    bonuses: [
      { threshold: 2, attackPercent: 10, description: "+10% Spell Power" },
      { threshold: 4, mpPercent: 10, description: "-10% Spell Cost (as +10% MP)" },
      { threshold: 6, attackPercent: 20, mpPercent: 15, description: "+20% Spell Power & +15% MP" },
      { threshold: 9, attackPercent: 30, mpPercent: 20, description: "+30% Spell Power, +20% MP" }
    ]
  },
  "Battle Mage": {
    name: "Battle Mage",
    theme: "Hybrid Fighter",
    bonuses: [
      { threshold: 2, attackPercent: 10, mpPercent: 10, description: "+10% Attack & MP" },
      { threshold: 4, attackPercent: 15, mpPercent: 15, description: "+15% Attack & MP" },
      { threshold: 6, attackPercent: 20, mpPercent: 20, description: "+20% Attack & MP" },
      { threshold: 9, attackPercent: 25, mpPercent: 25, hpPercent: 10, lifesteal: 5, description: "+25% Attack & MP, +10% HP, 5% Lifesteal" }
    ]
  },
  "Martial Disciple": {
    name: "Martial Disciple",
    theme: "Balanced Martial Arts",
    bonuses: [
      { threshold: 2, attackPercent: 10, speedPercent: 10, description: "+10% Attack & Speed" },
      { threshold: 4, attackPercent: 15, speedPercent: 15, description: "+15% Attack & Speed" },
      { threshold: 6, attackPercent: 20, speedPercent: 20, hpPercent: 10, description: "+20% Attack & Speed, +10% HP" },
      { threshold: 9, attackPercent: 25, speedPercent: 25, hpPercent: 15, critChance: 5, description: "+25% Attack & Speed, +15% HP, +5% Crit" }
    ]
  },
  "Shadow Stalker": {
    name: "Shadow Stalker",
    theme: "Speed & Evasion",
    bonuses: [
      { threshold: 2, speedPercent: 15, description: "+15% Speed" },
      { threshold: 4, evasion: 10, description: "+10% Evasion" },
      { threshold: 6, speedPercent: 20, evasion: 15, description: "+20% Speed & +15% Evasion" },
      { threshold: 9, speedPercent: 30, evasion: 20, critDamage: 25, description: "+30% Speed, +20% Evasion, +25% Crit Damage" }
    ]
  },
  "Iron Body": {
    name: "Iron Body",
    theme: "Defense & Sustain",
    bonuses: [
      { threshold: 2, hpPercent: 15, description: "+15% HP" },
      { threshold: 4, defensePercent: 10, description: "+10% Defense" },
      { threshold: 6, hpPercent: 20, defensePercent: 15, description: "+20% HP & +15% Defense" },
      { threshold: 9, hpPercent: 30, defensePercent: 20, onHitHeal: 3, description: "+30% HP, +20% Defense, Heal 3 HP on hit" }
    ]
  },

  // === ADVANCED SETS (Epic) ===
  "Blade Dancer": {
    name: "Blade Dancer",
    theme: "Maximum Damage",
    bonuses: [
      { threshold: 2, attackPercent: 15, speedPercent: 10, description: "+15% Attack, +10% Speed" },
      { threshold: 4, critChance: 15, critDamage: 30, description: "+15% Crit Chance, +30% Crit Damage" },
      { threshold: 6, attackPercent: 30, speedPercent: 20, description: "+30% Attack, +20% Speed" },
      { threshold: 9, attackPercent: 50, critChance: 25, critDamage: 50, description: "+50% Attack, +25% Crit, +50% Crit Damage" }
    ]
  },
  "Bulwark Sentinel": {
    name: "Bulwark Sentinel",
    theme: "Ultimate Defense",
    bonuses: [
      { threshold: 2, defensePercent: 20, hpPercent: 10, description: "+20% Defense, +10% HP" },
      { threshold: 4, defensePercent: 35, hpPercent: 20, description: "+35% Defense, +20% HP" },
      { threshold: 6, defensePercent: 50, hpPercent: 30, description: "+50% Defense, +30% HP" },
      { threshold: 9, defensePercent: 75, hpPercent: 50, counterChance: 25, description: "+75% Defense, +50% HP, 25% Counter" }
    ]
  },
  "Vampiric Embrace": {
    name: "Vampiric Embrace",
    theme: "Lifesteal",
    bonuses: [
      { threshold: 2, lifesteal: 10, description: "+10% Lifesteal" },
      { threshold: 4, lifesteal: 15, attackPercent: 10, description: "+15% Lifesteal, +10% Attack" },
      { threshold: 6, lifesteal: 20, attackPercent: 20, speedPercent: 15, description: "+20% Lifesteal, +20% Attack, +15% Speed" },
      { threshold: 9, lifesteal: 30, attackPercent: 35, hpPercent: 15, description: "+30% Lifesteal, +35% Attack, +15% HP" }
    ]
  },
  "Wind Dancer": {
    name: "Wind Dancer",
    theme: "Speed & Evasion",
    bonuses: [
      { threshold: 2, speedPercent: 25, description: "+25% Speed" },
      { threshold: 4, evasion: 15, speedPercent: 15, description: "+15% Evasion, +15% Speed" },
      { threshold: 6, speedPercent: 40, evasion: 25, description: "+40% Speed, +25% Evasion" },
      { threshold: 9, speedPercent: 60, evasion: 35, critChance: 15, description: "+60% Speed, +35% Evasion, +15% Crit" }
    ]
  },
  "Riposte": {
    name: "Riposte",
    theme: "Counter Attacks",
    bonuses: [
      { threshold: 2, counterChance: 15, description: "+15% Counter Chance" },
      { threshold: 4, counterChance: 25, defensePercent: 10, description: "+25% Counter, +10% Defense" },
      { threshold: 6, counterChance: 35, defensePercent: 20, attackPercent: 15, description: "+35% Counter, +20% Defense, +15% Attack" },
      { threshold: 9, counterChance: 50, defensePercent: 30, attackPercent: 30, description: "+50% Counter, +30% Defense, +30% Attack" }
    ]
  },
  "Frozen Wasteland": {
    name: "Frozen Wasteland",
    theme: "Ice Control",
    bonuses: [
      { threshold: 2, attackPercent: 15, slowEffect: 10, description: "+15% Attack, 10% Slow on Hit" },
      { threshold: 4, attackPercent: 25, slowEffect: 20, description: "+25% Attack, 20% Slow on Hit" },
      { threshold: 6, attackPercent: 40, slowEffect: 30, defensePercent: 15, description: "+40% Attack, 30% Slow, +15% Defense" },
      { threshold: 9, attackPercent: 55, slowEffect: 50, hpPercent: 20, description: "+55% Attack, 50% Slow, +20% HP" }
    ]
  },
  "Inferno Blaze": {
    name: "Inferno Blaze",
    theme: "Fire DoT",
    bonuses: [
      { threshold: 2, attackPercent: 15, burnDamage: 5, description: "+15% Attack, 5 Burn/turn" },
      { threshold: 4, attackPercent: 25, burnDamage: 10, description: "+25% Attack, 10 Burn/turn" },
      { threshold: 6, attackPercent: 40, burnDamage: 15, speedPercent: 10, description: "+40% Attack, 15 Burn/turn, +10% Speed" },
      { threshold: 9, attackPercent: 60, burnDamage: 25, critChance: 15, description: "+60% Attack, 25 Burn/turn, +15% Crit" }
    ]
  },
  "Storm Caller": {
    name: "Storm Caller",
    theme: "Lightning Chain",
    bonuses: [
      { threshold: 2, attackPercent: 15, chainDamage: 25, description: "+15% Attack, Chain 25% to 1 enemy" },
      { threshold: 4, attackPercent: 25, chainDamage: 35, speedPercent: 10, description: "+25% Attack, Chain 35%, +10% Speed" },
      { threshold: 6, attackPercent: 40, chainDamage: 50, speedPercent: 20, description: "+40% Attack, Chain 50% to 2 enemies" },
      { threshold: 9, attackPercent: 55, chainDamage: 75, speedPercent: 30, critChance: 10, description: "+55% Attack, Chain 75%, +30% Speed, +10% Crit" }
    ]
  },
  "Earthen Colossus": {
    name: "Earthen Colossus",
    theme: "Earth Defense",
    bonuses: [
      { threshold: 2, defensePercent: 20, attackPercent: 10, description: "+20% Defense, +10% Attack" },
      { threshold: 4, defensePercent: 35, hpPercent: 15, description: "+35% Defense, +15% HP" },
      { threshold: 6, defensePercent: 50, hpPercent: 25, attackPercent: 20, description: "+50% Defense, +25% HP, +20% Attack" },
      { threshold: 9, defensePercent: 70, hpPercent: 40, attackPercent: 35, description: "+70% Defense, +40% HP, +35% Attack" }
    ]
  }
};

// Complete Equipment Database - All 18 Sets + Starter Items
export const COMPLETE_EQUIPMENT_DATABASE: Equipment[] = [
  // ========== STARTER SETS (9 Sets - Uncommon Rarity) ==========
  
  // === SET 1: WARRIOR'S MIGHT (Defensive Evolution) ===
  { id: 'wm_f_armor', name: 'Warrior Chestplate', slot: 'armor', attack: 8, defense: 6, hp: 16, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Warrior's Might", description: 'Basic warrior armor. Set: 2p: +10% Atk/Def, 4p: +20% Atk/HP, 6p: +30% Atk/Def, 9p: +40% Def, +15% HP' },
  { id: 'wm_f_helm', name: 'Warrior Helmet', slot: 'helmet', attack: 4, defense: 4, hp: 9, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Warrior's Might", description: 'Basic warrior helmet.' },
  { id: 'wm_f_weapon', name: 'Warrior Sword', slot: 'weapon', attack: 15, defense: 2, hp: 6, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Warrior's Might", description: 'Basic warrior sword.' },
  { id: 'wm_f_gloves', name: 'Warrior Gauntlets', slot: 'gloves', attack: 3, defense: 3, hp: 5, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Warrior's Might", description: 'Basic warrior gloves.' },
  { id: 'wm_f_shield', name: 'Warrior Shield', slot: 'shield', attack: 2, defense: 9, hp: 12, mp: 0, speed: -1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Warrior's Might", description: 'Basic warrior shield.' },
  { id: 'wm_f_boots', name: 'Warrior Boots', slot: 'boots', attack: 2, defense: 2, hp: 4, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Warrior's Might", description: 'Basic warrior boots.' },
  { id: 'wm_f_necklace', name: 'Warrior Pendant', slot: 'necklace', attack: 4, defense: 2, hp: 7, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Warrior's Might", description: 'Basic warrior necklace.' },
  { id: 'wm_f_ring1', name: 'Warrior Ring', slot: 'ring', attack: 2, defense: 1, hp: 4, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Warrior's Might", description: 'Basic warrior ring.' },
  { id: 'wm_f_ring2', name: 'Might Ring', slot: 'ring', attack: 3, defense: 1, hp: 3, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Warrior's Might", description: 'Basic strength ring.' },
  // Mage - Warrior's Might
  { id: 'wm_m_armor', name: 'Battlemage Robe', slot: 'armor', attack: 5, defense: 4, hp: 11, mp: 15, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Warrior's Might", description: 'Basic battlemage robe.' },
  { id: 'wm_m_helm', name: 'Battlemage Hat', slot: 'helmet', attack: 3, defense: 3, hp: 7, mp: 10, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Warrior's Might", description: 'Basic battlemage hat.' },
  { id: 'wm_m_weapon', name: 'Battlemage Staff', slot: 'weapon', attack: 8, defense: 1, hp: 6, mp: 20, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Warrior's Might", description: 'Basic battlemage staff.' },
  { id: 'wm_m_gloves', name: 'Battlemage Gloves', slot: 'gloves', attack: 2, defense: 2, hp: 5, mp: 8, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Warrior's Might", description: 'Basic battlemage gloves.' },
  { id: 'wm_m_boots', name: 'Battlemage Boots', slot: 'boots', attack: 1, defense: 2, hp: 4, mp: 5, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Warrior's Might", description: 'Basic battlemage boots.' },
  { id: 'wm_m_necklace', name: 'Battlemage Pendant', slot: 'necklace', attack: 3, defense: 1, hp: 5, mp: 8, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Warrior's Might", description: 'Basic battlemage necklace.' },
  { id: 'wm_m_relic', name: 'Battlemage Relic', slot: 'relic', attack: 4, defense: 1, hp: 4, mp: 12, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Warrior's Might", description: 'Basic battlemage relic.' },
  { id: 'wm_m_ring1', name: 'Battlemage Ring', slot: 'ring', attack: 2, defense: 1, hp: 3, mp: 6, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Warrior's Might", description: 'Basic battlemage ring.' },
  { id: 'wm_m_ring2', name: 'Arcane Might Ring', slot: 'ring', attack: 2, defense: 1, hp: 2, mp: 8, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Warrior's Might", description: 'Basic arcane ring.' },
  // Monk - Warrior's Might
  { id: 'wm_k_armor', name: 'Brawler Vest', slot: 'armor', attack: 7, defense: 4, hp: 13, mp: 5, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Warrior's Might", description: 'Basic brawler vest.' },
  { id: 'wm_k_helm', name: 'Brawler Headband', slot: 'helmet', attack: 3, defense: 3, hp: 8, mp: 3, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Warrior's Might", description: 'Basic brawler headband.' },
  { id: 'wm_k_weapon', name: 'Brawler Gloves', slot: 'weapon', attack: 12, defense: 2, hp: 9, mp: 4, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Warrior's Might", description: 'Basic brawler gloves.' },
  { id: 'wm_k_gloves', name: 'Brawler Wraps', slot: 'gloves', attack: 4, defense: 2, hp: 6, mp: 3, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Warrior's Might", description: 'Basic brawler wraps.' },
  { id: 'wm_k_boots', name: 'Brawler Boots', slot: 'boots', attack: 3, defense: 2, hp: 5, mp: 2, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Warrior's Might", description: 'Basic brawler boots.' },
  { id: 'wm_k_necklace', name: 'Brawler Necklace', slot: 'necklace', attack: 5, defense: 2, hp: 7, mp: 5, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Warrior's Might", description: 'Basic brawler necklace.' },
  { id: 'wm_k_offhand', name: 'Brawler Knuckles', slot: 'offhand', attack: 6, defense: 2, hp: 6, mp: 3, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Warrior's Might", description: 'Basic brawler knuckles.' },
  { id: 'wm_k_ring1', name: 'Brawler Ring', slot: 'ring', attack: 3, defense: 1, hp: 4, mp: 2, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Warrior's Might", description: 'Basic brawler ring.' },
  { id: 'wm_k_ring2', name: 'Fist Ring', slot: 'ring', attack: 4, defense: 1, hp: 3, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Warrior's Might", description: 'Basic fist ring.' },

  // === SET 2: HUNTER'S FOCUS (Speed & Critical) ===
  { id: 'hf_f_armor', name: 'Hunter Chestplate', slot: 'armor', attack: 7, defense: 4, hp: 12, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Hunter's Focus", description: 'Basic hunter armor.' },
  { id: 'hf_f_helm', name: 'Hunter Helmet', slot: 'helmet', attack: 3, defense: 2, hp: 7, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Hunter's Focus", description: 'Basic hunter helmet.' },
  { id: 'hf_f_weapon', name: 'Hunter Bow', slot: 'weapon', attack: 14, defense: 0, hp: 6, mp: 0, speed: 3, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Hunter's Focus", description: 'Basic hunter bow.' },
  { id: 'hf_f_gloves', name: 'Hunter Gloves', slot: 'gloves', attack: 4, defense: 1, hp: 5, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Hunter's Focus", description: 'Basic hunter gloves.' },
  { id: 'hf_f_shield', name: 'Hunter Quiver', slot: 'shield', attack: 3, defense: 4, hp: 8, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Hunter's Focus", description: 'Basic hunter quiver.' },
  { id: 'hf_f_boots', name: 'Hunter Boots', slot: 'boots', attack: 3, defense: 1, hp: 4, mp: 0, speed: 4, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Hunter's Focus", description: 'Basic hunter boots.' },
  { id: 'hf_f_necklace', name: 'Hunter Pendant', slot: 'necklace', attack: 5, defense: 0, hp: 5, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Hunter's Focus", description: 'Basic hunter necklace.' },
  { id: 'hf_f_ring1', name: 'Hunter Ring', slot: 'ring', attack: 3, defense: 0, hp: 4, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Hunter's Focus", description: 'Basic hunter ring.' },
  { id: 'hf_f_ring2', name: 'Focus Ring', slot: 'ring', attack: 4, defense: 0, hp: 3, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Hunter's Focus", description: 'Basic focus ring.' },
  // Mage - Hunter's Focus
  { id: 'hf_m_armor', name: 'Arcanist Robe', slot: 'armor', attack: 6, defense: 3, hp: 10, mp: 20, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Hunter's Focus", description: 'Basic arcanist robe.' },
  { id: 'hf_m_helm', name: 'Arcanist Hat', slot: 'helmet', attack: 4, defense: 2, hp: 7, mp: 15, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Hunter's Focus", description: 'Basic arcanist hat.' },
  { id: 'hf_m_weapon', name: 'Arcanist Wand', slot: 'weapon', attack: 10, defense: 0, hp: 6, mp: 25, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Hunter's Focus", description: 'Basic arcanist wand.' },
  { id: 'hf_m_gloves', name: 'Arcanist Gloves', slot: 'gloves', attack: 2, defense: 1, hp: 4, mp: 8, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Hunter's Focus", description: 'Basic arcanist gloves.' },
  { id: 'hf_m_boots', name: 'Arcanist Boots', slot: 'boots', attack: 1, defense: 1, hp: 3, mp: 6, speed: 3, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Hunter's Focus", description: 'Basic arcanist boots.' },
  { id: 'hf_m_necklace', name: 'Arcanist Pendant', slot: 'necklace', attack: 3, defense: 0, hp: 4, mp: 10, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Hunter's Focus", description: 'Basic arcanist pendant.' },
  { id: 'hf_m_relic', name: 'Arcanist Relic', slot: 'relic', attack: 4, defense: 0, hp: 3, mp: 12, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Hunter's Focus", description: 'Basic arcanist relic.' },
  { id: 'hf_m_ring1', name: 'Arcanist Ring', slot: 'ring', attack: 2, defense: 0, hp: 2, mp: 8, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Hunter's Focus", description: 'Basic arcanist ring.' },
  { id: 'hf_m_ring2', name: 'Focus Relic Ring', slot: 'ring', attack: 2, defense: 0, hp: 1, mp: 10, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Hunter's Focus", description: 'Focus relic ring.' },
  // Monk - Hunter's Focus
  { id: 'hf_k_armor', name: 'Scout Vest', slot: 'armor', attack: 8, defense: 3, hp: 12, mp: 8, speed: 3, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Hunter's Focus", description: 'Basic scout vest.' },
  { id: 'hf_k_helm', name: 'Scout Headband', slot: 'helmet', attack: 4, defense: 2, hp: 8, mp: 5, speed: 3, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Hunter's Focus", description: 'Basic scout headband.' },
  { id: 'hf_k_weapon', name: 'Scout Darts', slot: 'weapon', attack: 13, defense: 0, hp: 9, mp: 6, speed: 4, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Hunter's Focus", description: 'Basic scout darts.' },
  { id: 'hf_k_gloves', name: 'Scout Wraps', slot: 'gloves', attack: 4, defense: 1, hp: 6, mp: 4, speed: 3, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Hunter's Focus", description: 'Basic scout wraps.' },
  { id: 'hf_k_boots', name: 'Scout Boots', slot: 'boots', attack: 3, defense: 1, hp: 5, mp: 3, speed: 4, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Hunter's Focus", description: 'Basic scout boots.' },
  { id: 'hf_k_necklace', name: 'Scout Necklace', slot: 'necklace', attack: 5, defense: 0, hp: 7, mp: 5, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Hunter's Focus", description: 'Basic scout necklace.' },
  { id: 'hf_k_offhand', name: 'Scout Offhand', slot: 'offhand', attack: 6, defense: 1, hp: 6, mp: 4, speed: 3, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Hunter's Focus", description: 'Basic scout offhand.' },
  { id: 'hf_k_ring1', name: 'Scout Ring', slot: 'ring', attack: 3, defense: 0, hp: 4, mp: 3, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Hunter's Focus", description: 'Basic scout ring.' },
  { id: 'hf_k_ring2', name: 'Hunter Monk Ring', slot: 'ring', attack: 4, defense: 0, hp: 3, mp: 4, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Hunter's Focus", description: 'Hunter monk ring.' },

  // === SET 3: BRUTE FORCE (Raw Attack & Penetration) ===
  { id: 'bf_f_armor', name: 'Brute Chestplate', slot: 'armor', attack: 10, defense: 3, hp: 16, mp: 0, speed: -1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Brute Force", description: 'Basic brute armor.' },
  { id: 'bf_f_helm', name: 'Brute Helmet', slot: 'helmet', attack: 5, defense: 1, hp: 9, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Brute Force", description: 'Basic brute helmet.' },
  { id: 'bf_f_weapon', name: 'Brute Axe', slot: 'weapon', attack: 18, defense: 1, hp: 8, mp: 0, speed: -1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Brute Force", description: 'Basic brute axe.' },
  { id: 'bf_f_gloves', name: 'Brute Gauntlets', slot: 'gloves', attack: 6, defense: 0, hp: 6, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Brute Force", description: 'Basic brute gloves.' },
  { id: 'bf_f_shield', name: 'Brute Tower Shield', slot: 'shield', attack: 4, defense: 6, hp: 12, mp: 0, speed: -2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Brute Force", description: 'Basic brute shield.' },
  { id: 'bf_f_boots', name: 'Brute Boots', slot: 'boots', attack: 4, defense: 1, hp: 6, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Brute Force", description: 'Basic brute boots.' },
  { id: 'bf_f_necklace', name: 'Brute Pendant', slot: 'necklace', attack: 6, defense: 0, hp: 7, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Brute Force", description: 'Basic brute necklace.' },
  { id: 'bf_f_ring1', name: 'Brute Ring', slot: 'ring', attack: 4, defense: 0, hp: 5, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Brute Force", description: 'Basic brute ring.' },
  { id: 'bf_f_ring2', name: 'Force Ring', slot: 'ring', attack: 5, defense: 0, hp: 4, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Brute Force", description: 'Basic force ring.' },
  // Mage - Brute Force
  { id: 'bf_m_armor', name: 'War Mage Robe', slot: 'armor', attack: 8, defense: 2, hp: 12, mp: 15, speed: -1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Brute Force", description: 'Basic war mage robe.' },
  { id: 'bf_m_helm', name: 'War Mage Hat', slot: 'helmet', attack: 4, defense: 1, hp: 8, mp: 10, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Brute Force", description: 'Basic war mage hat.' },
  { id: 'bf_m_weapon', name: 'War Mage Staff', slot: 'weapon', attack: 12, defense: 0, hp: 6, mp: 20, speed: -1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Brute Force", description: 'Basic war mage staff.' },
  { id: 'bf_m_gloves', name: 'War Mage Gloves', slot: 'gloves', attack: 3, defense: 0, hp: 5, mp: 8, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Brute Force", description: 'Basic war mage gloves.' },
  { id: 'bf_m_boots', name: 'War Mage Boots', slot: 'boots', attack: 2, defense: 0, hp: 4, mp: 6, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Brute Force", description: 'Basic war mage boots.' },
  { id: 'bf_m_necklace', name: 'War Mage Pendant', slot: 'necklace', attack: 4, defense: 0, hp: 5, mp: 8, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Brute Force", description: 'Basic war mage pendant.' },
  { id: 'bf_m_relic', name: 'War Mage Relic', slot: 'relic', attack: 5, defense: 0, hp: 4, mp: 12, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Brute Force", description: 'Basic war mage relic.' },
  { id: 'bf_m_ring1', name: 'War Mage Ring', slot: 'ring', attack: 3, defense: 0, hp: 3, mp: 6, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Brute Force", description: 'Basic war mage ring.' },
  { id: 'bf_m_ring2', name: 'Force Mage Ring', slot: 'ring', attack: 3, defense: 0, hp: 2, mp: 8, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Brute Force", description: 'Force mage ring.' },
  // Monk - Brute Force
  { id: 'bf_k_armor', name: 'Crusher Vest', slot: 'armor', attack: 9, defense: 2, hp: 14, mp: 5, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Brute Force", description: 'Basic crusher vest.' },
  { id: 'bf_k_helm', name: 'Crusher Headband', slot: 'helmet', attack: 4, defense: 1, hp: 9, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Brute Force", description: 'Basic crusher headband.' },
  { id: 'bf_k_weapon', name: 'Crusher Fists', slot: 'weapon', attack: 16, defense: 1, hp: 10, mp: 4, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Brute Force", description: 'Basic crusher fists.' },
  { id: 'bf_k_gloves', name: 'Crusher Wraps', slot: 'gloves', attack: 5, defense: 0, hp: 7, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Brute Force", description: 'Basic crusher wraps.' },
  { id: 'bf_k_boots', name: 'Crusher Boots', slot: 'boots', attack: 4, defense: 0, hp: 6, mp: 2, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Brute Force", description: 'Basic crusher boots.' },
  { id: 'bf_k_necklace', name: 'Crusher Necklace', slot: 'necklace', attack: 6, defense: 0, hp: 8, mp: 5, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Brute Force", description: 'Basic crusher necklace.' },
  { id: 'bf_k_offhand', name: 'Crusher Offhand', slot: 'offhand', attack: 7, defense: 0, hp: 7, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Brute Force", description: 'Basic crusher offhand.' },
  { id: 'bf_k_ring1', name: 'Crusher Ring', slot: 'ring', attack: 4, defense: 0, hp: 5, mp: 2, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Brute Force", description: 'Basic crusher ring.' },
  { id: 'bf_k_ring2', name: 'Force Monk Ring', slot: 'ring', attack: 5, defense: 0, hp: 4, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Brute Force", description: 'Force monk ring.' },

  // === SET 4: ELEMENTAL APPRENTICE (Mage-focused, Elemental Magic) ===
  { id: 'ea_m_armor', name: 'Apprentice Elemental Robe', slot: 'armor', attack: 6, defense: 3, hp: 10, mp: 25, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Elemental Apprentice", description: 'Elemental apprentice robe.' },
  { id: 'ea_m_helm', name: 'Apprentice Elemental Hat', slot: 'helmet', attack: 3, defense: 2, hp: 6, mp: 15, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Elemental Apprentice", description: 'Elemental apprentice hat.' },
  { id: 'ea_m_weapon', name: 'Elemental Staff', slot: 'weapon', attack: 10, defense: 0, hp: 5, mp: 30, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Elemental Apprentice", description: 'Elemental apprentice staff.' },
  { id: 'ea_m_gloves', name: 'Elemental Gloves', slot: 'gloves', attack: 2, defense: 1, hp: 4, mp: 10, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Elemental Apprentice", description: 'Elemental apprentice gloves.' },
  { id: 'ea_m_boots', name: 'Elemental Boots', slot: 'boots', attack: 1, defense: 1, hp: 3, mp: 8, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Elemental Apprentice", description: 'Elemental apprentice boots.' },
  { id: 'ea_m_necklace', name: 'Elemental Pendant', slot: 'necklace', attack: 3, defense: 0, hp: 4, mp: 12, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Elemental Apprentice", description: 'Elemental apprentice pendant.' },
  { id: 'ea_m_relic', name: 'Elemental Relic', slot: 'relic', attack: 4, defense: 0, hp: 3, mp: 18, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Elemental Apprentice", description: 'Elemental apprentice relic.' },
  { id: 'ea_m_ring1', name: 'Elemental Ring', slot: 'ring', attack: 2, defense: 0, hp: 2, mp: 8, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Elemental Apprentice", description: 'Elemental apprentice ring.' },
  { id: 'ea_m_ring2', name: 'Prism Ring', slot: 'ring', attack: 2, defense: 0, hp: 1, mp: 10, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Elemental Apprentice", description: 'Prism ring.' },
  // Fighter - Elemental Apprentice (off-class bonuses)
  { id: 'ea_f_armor', name: 'Runic Plate', slot: 'armor', attack: 6, defense: 6, hp: 15, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Elemental Apprentice", description: 'Runic plate armor.' },
  { id: 'ea_f_helm', name: 'Runic Helm', slot: 'helmet', attack: 3, defense: 4, hp: 9, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Elemental Apprentice", description: 'Runic helm.' },
  { id: 'ea_f_weapon', name: 'Runic Sword', slot: 'weapon', attack: 13, defense: 2, hp: 8, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Elemental Apprentice", description: 'Runic sword.' },
  { id: 'ea_f_gloves', name: 'Runic Gauntlets', slot: 'gloves', attack: 3, defense: 3, hp: 6, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Elemental Apprentice", description: 'Runic gauntlets.' },
  { id: 'ea_f_shield', name: 'Runic Shield', slot: 'shield', attack: 1, defense: 8, hp: 12, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Elemental Apprentice", description: 'Runic shield.' },
  { id: 'ea_f_boots', name: 'Runic Boots', slot: 'boots', attack: 2, defense: 2, hp: 5, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Elemental Apprentice", description: 'Runic boots.' },
  { id: 'ea_f_necklace', name: 'Runic Pendant', slot: 'necklace', attack: 3, defense: 1, hp: 7, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Elemental Apprentice", description: 'Runic pendant.' },
  { id: 'ea_f_ring1', name: 'Runic Ring', slot: 'ring', attack: 2, defense: 1, hp: 4, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Elemental Apprentice", description: 'Runic ring.' },
  { id: 'ea_f_ring2', name: 'Rune Band', slot: 'ring', attack: 2, defense: 1, hp: 3, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Elemental Apprentice", description: 'Rune band.' },
  // Monk - Elemental Apprentice
  { id: 'ea_k_armor', name: 'Elemental Gi', slot: 'armor', attack: 7, defense: 3, hp: 12, mp: 10, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Elemental Apprentice", description: 'Elemental gi.' },
  { id: 'ea_k_helm', name: 'Elemental Headband', slot: 'helmet', attack: 3, defense: 2, hp: 7, mp: 6, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Elemental Apprentice", description: 'Elemental headband.' },
  { id: 'ea_k_weapon', name: 'Elemental Fists', slot: 'weapon', attack: 12, defense: 1, hp: 8, mp: 8, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Elemental Apprentice", description: 'Elemental fists.' },
  { id: 'ea_k_gloves', name: 'Elemental Wraps', slot: 'gloves', attack: 4, defense: 1, hp: 5, mp: 5, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Elemental Apprentice", description: 'Elemental wraps.' },
  { id: 'ea_k_boots', name: 'Elemental Sandals', slot: 'boots', attack: 3, defense: 1, hp: 4, mp: 4, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Elemental Apprentice", description: 'Elemental sandals.' },
  { id: 'ea_k_necklace', name: 'Elemental Charm', slot: 'necklace', attack: 4, defense: 1, hp: 6, mp: 6, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Elemental Apprentice", description: 'Elemental charm.' },
  { id: 'ea_k_offhand', name: 'Elemental Focus', slot: 'offhand', attack: 5, defense: 1, hp: 5, mp: 8, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Elemental Apprentice", description: 'Elemental focus.' },
  { id: 'ea_k_ring1', name: 'Prism Monk Ring', slot: 'ring', attack: 3, defense: 0, hp: 3, mp: 4, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Elemental Apprentice", description: 'Prism monk ring.' },
  { id: 'ea_k_ring2', name: 'Elemental Band', slot: 'ring', attack: 3, defense: 1, hp: 2, mp: 5, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Elemental Apprentice", description: 'Elemental band.' },

  // === SET 5: ARCANE SCHOLAR (Mage-focused, Spell Efficiency) ===
  { id: 'as_m_armor', name: 'Scholar Robe', slot: 'armor', attack: 5, defense: 4, hp: 8, mp: 28, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Arcane Scholar", description: 'Arcane scholar robe.' },
  { id: 'as_m_helm', name: 'Scholar Hat', slot: 'helmet', attack: 3, defense: 2, hp: 5, mp: 18, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Arcane Scholar", description: 'Arcane scholar hat.' },
  { id: 'as_m_weapon', name: 'Scholar Staff', slot: 'weapon', attack: 9, defense: 0, hp: 4, mp: 35, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Arcane Scholar", description: 'Arcane scholar staff.' },
  { id: 'as_m_gloves', name: 'Scholar Gloves', slot: 'gloves', attack: 2, defense: 1, hp: 3, mp: 12, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Arcane Scholar", description: 'Arcane scholar gloves.' },
  { id: 'as_m_boots', name: 'Scholar Boots', slot: 'boots', attack: 1, defense: 1, hp: 2, mp: 10, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Arcane Scholar", description: 'Arcane scholar boots.' },
  { id: 'as_m_necklace', name: 'Scholar Pendant', slot: 'necklace', attack: 3, defense: 0, hp: 3, mp: 15, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Arcane Scholar", description: 'Arcane scholar pendant.' },
  { id: 'as_m_relic', name: 'Scholar Relic', slot: 'relic', attack: 4, defense: 0, hp: 2, mp: 22, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Arcane Scholar", description: 'Arcane scholar relic.' },
  { id: 'as_m_ring1', name: 'Scholar Ring', slot: 'ring', attack: 2, defense: 0, hp: 1, mp: 10, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Arcane Scholar", description: 'Arcane scholar ring.' },
  { id: 'as_m_ring2', name: 'Wisdom Ring', slot: 'ring', attack: 2, defense: 0, hp: 0, mp: 12, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Arcane Scholar", description: 'Wisdom ring.' },
  // Fighter - Arcane Scholar
  { id: 'as_f_armor', name: 'Spellblade Plate', slot: 'armor', attack: 7, defense: 5, hp: 14, mp: 5, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Arcane Scholar", description: 'Spellblade plate.' },
  { id: 'as_f_helm', name: 'Spellblade Helm', slot: 'helmet', attack: 3, defense: 3, hp: 8, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Arcane Scholar", description: 'Spellblade helm.' },
  { id: 'as_f_weapon', name: 'Spellblade Sword', slot: 'weapon', attack: 14, defense: 1, hp: 7, mp: 5, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Arcane Scholar", description: 'Spellblade sword.' },
  { id: 'as_f_gloves', name: 'Spellblade Gauntlets', slot: 'gloves', attack: 3, defense: 2, hp: 5, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Arcane Scholar", description: 'Spellblade gauntlets.' },
  { id: 'as_f_shield', name: 'Spellblade Shield', slot: 'shield', attack: 2, defense: 7, hp: 10, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Arcane Scholar", description: 'Spellblade shield.' },
  { id: 'as_f_boots', name: 'Spellblade Boots', slot: 'boots', attack: 2, defense: 2, hp: 4, mp: 2, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Arcane Scholar", description: 'Spellblade boots.' },
  { id: 'as_f_necklace', name: 'Spellblade Pendant', slot: 'necklace', attack: 4, defense: 1, hp: 6, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Arcane Scholar", description: 'Spellblade pendant.' },
  { id: 'as_f_ring1', name: 'Spellblade Ring', slot: 'ring', attack: 2, defense: 1, hp: 3, mp: 2, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Arcane Scholar", description: 'Spellblade ring.' },
  { id: 'as_f_ring2', name: 'Arcane Warrior Ring', slot: 'ring', attack: 3, defense: 1, hp: 2, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Arcane Scholar", description: 'Arcane warrior ring.' },
  // Monk - Arcane Scholar
  { id: 'as_k_armor', name: 'Sage Vest', slot: 'armor', attack: 6, defense: 3, hp: 11, mp: 12, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Arcane Scholar", description: 'Sage vest.' },
  { id: 'as_k_helm', name: 'Sage Headband', slot: 'helmet', attack: 3, defense: 2, hp: 6, mp: 8, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Arcane Scholar", description: 'Sage headband.' },
  { id: 'as_k_weapon', name: 'Sage Fists', slot: 'weapon', attack: 11, defense: 1, hp: 7, mp: 10, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Arcane Scholar", description: 'Sage fists.' },
  { id: 'as_k_gloves', name: 'Sage Wraps', slot: 'gloves', attack: 3, defense: 1, hp: 4, mp: 6, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Arcane Scholar", description: 'Sage wraps.' },
  { id: 'as_k_boots', name: 'Sage Sandals', slot: 'boots', attack: 2, defense: 1, hp: 3, mp: 5, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Arcane Scholar", description: 'Sage sandals.' },
  { id: 'as_k_necklace', name: 'Sage Charm', slot: 'necklace', attack: 4, defense: 1, hp: 5, mp: 7, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Arcane Scholar", description: 'Sage charm.' },
  { id: 'as_k_offhand', name: 'Sage Focus', slot: 'offhand', attack: 5, defense: 1, hp: 4, mp: 10, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Arcane Scholar", description: 'Sage focus.' },
  { id: 'as_k_ring1', name: 'Sage Ring', slot: 'ring', attack: 2, defense: 0, hp: 2, mp: 5, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Arcane Scholar", description: 'Sage ring.' },
  { id: 'as_k_ring2', name: 'Wisdom Monk Ring', slot: 'ring', attack: 3, defense: 1, hp: 1, mp: 6, speed: 0, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Arcane Scholar", description: 'Wisdom monk ring.' },

  // === SET 6: BATTLE MAGE (Mage-focused, Hybrid) ===
  { id: 'bm_m_armor', name: 'Battle Mage Robe', slot: 'armor', attack: 7, defense: 4, hp: 12, mp: 22, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Battle Mage", description: 'Battle mage robe.' },
  { id: 'bm_m_helm', name: 'Battle Mage Hat', slot: 'helmet', attack: 4, defense: 2, hp: 7, mp: 14, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Battle Mage", description: 'Battle mage hat.' },
  { id: 'bm_m_weapon', name: 'Battle Staff', slot: 'weapon', attack: 11, defense: 1, hp: 6, mp: 28, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Battle Mage", description: 'Battle staff.' },
  { id: 'bm_m_gloves', name: 'Battle Mage Gloves', slot: 'gloves', attack: 3, defense: 1, hp: 4, mp: 10, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Battle Mage", description: 'Battle mage gloves.' },
  { id: 'bm_m_boots', name: 'Battle Mage Boots', slot: 'boots', attack: 2, defense: 1, hp: 3, mp: 8, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Battle Mage", description: 'Battle mage boots.' },
  { id: 'bm_m_necklace', name: 'Battle Mage Pendant', slot: 'necklace', attack: 4, defense: 1, hp: 5, mp: 12, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Battle Mage", description: 'Battle mage pendant.' },
  { id: 'bm_m_relic', name: 'Battle Relic', slot: 'relic', attack: 5, defense: 0, hp: 4, mp: 18, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Battle Mage", description: 'Battle relic.' },
  { id: 'bm_m_ring1', name: 'Battle Mage Ring', slot: 'ring', attack: 3, defense: 0, hp: 2, mp: 8, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Battle Mage", description: 'Battle mage ring.' },
  { id: 'bm_m_ring2', name: 'Hybrid Ring', slot: 'ring', attack: 3, defense: 1, hp: 2, mp: 9, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Battle Mage", description: 'Hybrid ring.' },
  // Fighter - Battle Mage
  { id: 'bm_f_armor', name: 'Hexblade Plate', slot: 'armor', attack: 8, defense: 5, hp: 15, mp: 5, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Battle Mage", description: 'Hexblade plate.' },
  { id: 'bm_f_helm', name: 'Hexblade Helm', slot: 'helmet', attack: 4, defense: 3, hp: 9, mp: 3, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Battle Mage", description: 'Hexblade helm.' },
  { id: 'bm_f_weapon', name: 'Hexblade Sword', slot: 'weapon', attack: 15, defense: 1, hp: 8, mp: 5, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Battle Mage", description: 'Hexblade sword.' },
  { id: 'bm_f_gloves', name: 'Hexblade Gauntlets', slot: 'gloves', attack: 4, defense: 2, hp: 6, mp: 3, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Battle Mage", description: 'Hexblade gauntlets.' },
  { id: 'bm_f_shield', name: 'Hexblade Shield', slot: 'shield', attack: 2, defense: 8, hp: 11, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Battle Mage", description: 'Hexblade shield.' },
  { id: 'bm_f_boots', name: 'Hexblade Boots', slot: 'boots', attack: 3, defense: 2, hp: 5, mp: 2, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Battle Mage", description: 'Hexblade boots.' },
  { id: 'bm_f_necklace', name: 'Hexblade Pendant', slot: 'necklace', attack: 5, defense: 1, hp: 7, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Battle Mage", description: 'Hexblade pendant.' },
  { id: 'bm_f_ring1', name: 'Hexblade Ring', slot: 'ring', attack: 3, defense: 1, hp: 4, mp: 2, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Battle Mage", description: 'Hexblade ring.' },
  { id: 'bm_f_ring2', name: 'Hybrid Warrior Ring', slot: 'ring', attack: 3, defense: 1, hp: 3, mp: 3, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Battle Mage", description: 'Hybrid warrior ring.' },
  // Monk - Battle Mage
  { id: 'bm_k_armor', name: 'Mystic Gi', slot: 'armor', attack: 7, defense: 3, hp: 13, mp: 10, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Battle Mage", description: 'Mystic gi.' },
  { id: 'bm_k_helm', name: 'Mystic Headband', slot: 'helmet', attack: 4, defense: 2, hp: 8, mp: 6, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Battle Mage", description: 'Mystic headband.' },
  { id: 'bm_k_weapon', name: 'Mystic Fists', slot: 'weapon', attack: 13, defense: 1, hp: 9, mp: 8, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Battle Mage", description: 'Mystic fists.' },
  { id: 'bm_k_gloves', name: 'Mystic Wraps', slot: 'gloves', attack: 4, defense: 1, hp: 5, mp: 5, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Battle Mage", description: 'Mystic wraps.' },
  { id: 'bm_k_boots', name: 'Mystic Sandals', slot: 'boots', attack: 3, defense: 1, hp: 4, mp: 4, speed: 3, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Battle Mage", description: 'Mystic sandals.' },
  { id: 'bm_k_necklace', name: 'Mystic Charm', slot: 'necklace', attack: 5, defense: 1, hp: 6, mp: 6, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Battle Mage", description: 'Mystic charm.' },
  { id: 'bm_k_offhand', name: 'Mystic Focus', slot: 'offhand', attack: 6, defense: 1, hp: 5, mp: 8, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Battle Mage", description: 'Mystic focus.' },
  { id: 'bm_k_ring1', name: 'Mystic Ring', slot: 'ring', attack: 3, defense: 0, hp: 3, mp: 4, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Battle Mage", description: 'Mystic ring.' },
  { id: 'bm_k_ring2', name: 'Hybrid Monk Ring', slot: 'ring', attack: 3, defense: 1, hp: 2, mp: 5, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Battle Mage", description: 'Hybrid monk ring.' },

  // === SET 7: MARTIAL DISCIPLE (Monk-focused, Balanced) ===
  { id: 'md_k_armor', name: 'Disciple Vest', slot: 'armor', attack: 8, defense: 4, hp: 14, mp: 10, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Martial Disciple", description: 'Martial disciple vest.' },
  { id: 'md_k_helm', name: 'Disciple Headband', slot: 'helmet', attack: 4, defense: 3, hp: 9, mp: 6, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Martial Disciple", description: 'Martial disciple headband.' },
  { id: 'md_k_weapon', name: 'Disciple Fists', slot: 'weapon', attack: 14, defense: 1, hp: 10, mp: 8, speed: 3, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Martial Disciple", description: 'Martial disciple fists.' },
  { id: 'md_k_gloves', name: 'Disciple Wraps', slot: 'gloves', attack: 5, defense: 2, hp: 7, mp: 5, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Martial Disciple", description: 'Martial disciple wraps.' },
  { id: 'md_k_boots', name: 'Disciple Sandals', slot: 'boots', attack: 4, defense: 2, hp: 6, mp: 4, speed: 3, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Martial Disciple", description: 'Martial disciple sandals.' },
  { id: 'md_k_necklace', name: 'Disciple Charm', slot: 'necklace', attack: 6, defense: 1, hp: 8, mp: 6, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Martial Disciple", description: 'Martial disciple charm.' },
  { id: 'md_k_offhand', name: 'Disciple Focus', slot: 'offhand', attack: 7, defense: 2, hp: 7, mp: 6, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Martial Disciple", description: 'Martial disciple focus.' },
  { id: 'md_k_ring1', name: 'Disciple Ring', slot: 'ring', attack: 4, defense: 1, hp: 5, mp: 3, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Martial Disciple", description: 'Martial disciple ring.' },
  { id: 'md_k_ring2', name: 'Martial Ring', slot: 'ring', attack: 4, defense: 1, hp: 4, mp: 4, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Martial Disciple", description: 'Martial ring.' },
  // Fighter - Martial Disciple
  { id: 'md_f_armor', name: 'Warrior Disciple Plate', slot: 'armor', attack: 7, defense: 5, hp: 16, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Martial Disciple", description: 'Warrior disciple plate.' },
  { id: 'md_f_helm', name: 'Warrior Disciple Helm', slot: 'helmet', attack: 3, defense: 4, hp: 10, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Martial Disciple", description: 'Warrior disciple helm.' },
  { id: 'md_f_weapon', name: 'Warrior Disciple Sword', slot: 'weapon', attack: 14, defense: 2, hp: 11, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Martial Disciple", description: 'Warrior disciple sword.' },
  { id: 'md_f_gloves', name: 'Warrior Disciple Gauntlets', slot: 'gloves', attack: 4, defense: 3, hp: 8, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Martial Disciple", description: 'Warrior disciple gauntlets.' },
  { id: 'md_f_shield', name: 'Warrior Disciple Shield', slot: 'shield', attack: 2, defense: 8, hp: 13, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Martial Disciple", description: 'Warrior disciple shield.' },
  { id: 'md_f_boots', name: 'Warrior Disciple Boots', slot: 'boots', attack: 3, defense: 2, hp: 7, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Martial Disciple", description: 'Warrior disciple boots.' },
  { id: 'md_f_necklace', name: 'Warrior Disciple Pendant', slot: 'necklace', attack: 5, defense: 2, hp: 9, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Martial Disciple", description: 'Warrior disciple pendant.' },
  { id: 'md_f_ring1', name: 'Warrior Disciple Ring', slot: 'ring', attack: 3, defense: 1, hp: 6, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Martial Disciple", description: 'Warrior disciple ring.' },
  { id: 'md_f_ring2', name: 'Martial Warrior Ring', slot: 'ring', attack: 3, defense: 2, hp: 5, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Martial Disciple", description: 'Martial warrior ring.' },
  // Mage - Martial Disciple
  { id: 'md_m_armor', name: 'Mage Disciple Robe', slot: 'armor', attack: 5, defense: 4, hp: 11, mp: 18, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Martial Disciple", description: 'Mage disciple robe.' },
  { id: 'md_m_helm', name: 'Mage Disciple Hat', slot: 'helmet', attack: 3, defense: 2, hp: 7, mp: 12, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Martial Disciple", description: 'Mage disciple hat.' },
  { id: 'md_m_weapon', name: 'Mage Disciple Staff', slot: 'weapon', attack: 9, defense: 1, hp: 8, mp: 22, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Martial Disciple", description: 'Mage disciple staff.' },
  { id: 'md_m_gloves', name: 'Mage Disciple Gloves', slot: 'gloves', attack: 2, defense: 2, hp: 5, mp: 8, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Martial Disciple", description: 'Mage disciple gloves.' },
  { id: 'md_m_boots', name: 'Mage Disciple Boots', slot: 'boots', attack: 1, defense: 1, hp: 4, mp: 6, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Martial Disciple", description: 'Mage disciple boots.' },
  { id: 'md_m_necklace', name: 'Mage Disciple Pendant', slot: 'necklace', attack: 3, defense: 1, hp: 6, mp: 10, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Martial Disciple", description: 'Mage disciple pendant.' },
  { id: 'md_m_relic', name: 'Mage Disciple Relic', slot: 'relic', attack: 3, defense: 1, hp: 5, mp: 15, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Martial Disciple", description: 'Mage disciple relic.' },
  { id: 'md_m_ring1', name: 'Mage Disciple Ring', slot: 'ring', attack: 2, defense: 1, hp: 3, mp: 6, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Martial Disciple", description: 'Mage disciple ring.' },
  { id: 'md_m_ring2', name: 'Martial Mage Ring', slot: 'ring', attack: 2, defense: 1, hp: 2, mp: 7, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Martial Disciple", description: 'Martial mage ring.' },

  // === SET 8: SHADOW STALKER (Monk-focused, Speed & Evasion) ===
  { id: 'ss_k_armor', name: 'Stalker Vest', slot: 'armor', attack: 7, defense: 3, hp: 11, mp: 12, speed: 4, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Shadow Stalker", description: 'Shadow stalker vest.' },
  { id: 'ss_k_helm', name: 'Stalker Headband', slot: 'helmet', attack: 3, defense: 2, hp: 7, mp: 8, speed: 3, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Shadow Stalker", description: 'Shadow stalker headband.' },
  { id: 'ss_k_weapon', name: 'Stalker Blades', slot: 'weapon', attack: 13, defense: 0, hp: 9, mp: 10, speed: 5, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Shadow Stalker", description: 'Shadow stalker blades.' },
  { id: 'ss_k_gloves', name: 'Stalker Wraps', slot: 'gloves', attack: 4, defense: 1, hp: 6, mp: 6, speed: 4, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Shadow Stalker", description: 'Shadow stalker wraps.' },
  { id: 'ss_k_boots', name: 'Stalker Boots', slot: 'boots', attack: 2, defense: 1, hp: 5, mp: 5, speed: 5, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Shadow Stalker", description: 'Shadow stalker boots.' },
  { id: 'ss_k_necklace', name: 'Stalker Necklace', slot: 'necklace', attack: 5, defense: 0, hp: 8, mp: 7, speed: 3, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Shadow Stalker", description: 'Shadow stalker necklace.' },
  { id: 'ss_k_offhand', name: 'Stalker Offhand', slot: 'offhand', attack: 6, defense: 1, hp: 7, mp: 6, speed: 4, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Shadow Stalker", description: 'Shadow stalker offhand.' },
  { id: 'ss_k_ring1', name: 'Stalker Ring', slot: 'ring', attack: 3, defense: 0, hp: 4, mp: 4, speed: 3, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Shadow Stalker", description: 'Shadow stalker ring.' },
  { id: 'ss_k_ring2', name: 'Shadow Ring', slot: 'ring', attack: 3, defense: 1, hp: 3, mp: 5, speed: 3, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Shadow Stalker", description: 'Shadow focus ring.' },
  // Fighter - Shadow Stalker
  { id: 'ss_f_armor', name: 'Nightguard Plate', slot: 'armor', attack: 5, defense: 6, hp: 15, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Shadow Stalker", description: 'Nightguard plate.' },
  { id: 'ss_f_helm', name: 'Nightguard Helm', slot: 'helmet', attack: 2, defense: 4, hp: 8, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Shadow Stalker", description: 'Nightguard helm.' },
  { id: 'ss_f_weapon', name: 'Nightguard Sword', slot: 'weapon', attack: 11, defense: 3, hp: 10, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Shadow Stalker", description: 'Nightguard sword.' },
  { id: 'ss_f_gloves', name: 'Nightguard Gauntlets', slot: 'gloves', attack: 3, defense: 3, hp: 6, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Shadow Stalker", description: 'Nightguard gloves.' },
  { id: 'ss_f_shield', name: 'Nightguard Shield', slot: 'shield', attack: 1, defense: 7, hp: 11, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Shadow Stalker", description: 'Nightguard shield.' },
  { id: 'ss_f_boots', name: 'Nightguard Boots', slot: 'boots', attack: 1, defense: 2, hp: 5, mp: 0, speed: 3, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Shadow Stalker", description: 'Nightguard boots.' },
  { id: 'ss_f_necklace', name: 'Nightguard Pendant', slot: 'necklace', attack: 2, defense: 1, hp: 7, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Shadow Stalker", description: 'Nightguard pendant.' },
  { id: 'ss_f_ring1', name: 'Nightguard Ring', slot: 'ring', attack: 1, defense: 0, hp: 4, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Shadow Stalker", description: 'Nightguard ring.' },
  { id: 'ss_f_ring2', name: 'Shadow Guard Ring', slot: 'ring', attack: 1, defense: 1, hp: 3, mp: 0, speed: 2, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Shadow Stalker", description: 'Shadow guard ring.' },
  // Mage - Shadow Stalker
  { id: 'ss_m_armor', name: 'Shadowweaver Robe', slot: 'armor', attack: 5, defense: 4, hp: 10, mp: 18, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Shadow Stalker", description: 'Shadowweaver robe.' },
  { id: 'ss_m_helm', name: 'Shadowweaver Hat', slot: 'helmet', attack: 2, defense: 2, hp: 6, mp: 12, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Shadow Stalker", description: 'Shadowweaver hat.' },
  { id: 'ss_m_weapon', name: 'Shadowweaver Staff', slot: 'weapon', attack: 9, defense: 1, hp: 7, mp: 15, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Shadow Stalker", description: 'Shadowweaver staff.' },
  { id: 'ss_m_gloves', name: 'Shadowweaver Gloves', slot: 'gloves', attack: 1, defense: 1, hp: 4, mp: 10, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Shadow Stalker", description: 'Shadowweaver gloves.' },
  { id: 'ss_m_boots', name: 'Shadowweaver Boots', slot: 'boots', attack: 1, defense: 1, hp: 3, mp: 8, speed: 3, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Shadow Stalker", description: 'Shadowweaver boots.' },
  { id: 'ss_m_necklace', name: 'Shadowweaver Pendant', slot: 'necklace', attack: 2, defense: 0, hp: 5, mp: 10, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Shadow Stalker", description: 'Shadowweaver pendant.' },
  { id: 'ss_m_relic', name: 'Shadowweaver Relic', slot: 'relic', attack: 3, defense: 0, hp: 4, mp: 12, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Shadow Stalker", description: 'Shadowweaver relic.' },
  { id: 'ss_m_ring1', name: 'Shadowweaver Ring', slot: 'ring', attack: 1, defense: 0, hp: 2, mp: 6, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Shadow Stalker", description: 'Shadowweaver ring.' },
  { id: 'ss_m_ring2', name: 'Shadow Mage Ring', slot: 'ring', attack: 1, defense: 1, hp: 1, mp: 7, speed: 2, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Shadow Stalker", description: 'Shadow mage ring.' },

  // === SET 9: IRON BODY (Monk-focused, Defense & Sustain) ===
  { id: 'ib_k_armor', name: 'Iron Body Vest', slot: 'armor', attack: 9, defense: 6, hp: 16, mp: 8, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Iron Body", description: 'Iron body vest.' },
  { id: 'ib_k_helm', name: 'Iron Body Headband', slot: 'helmet', attack: 4, defense: 4, hp: 9, mp: 5, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Iron Body", description: 'Iron body headband.' },
  { id: 'ib_k_weapon', name: 'Iron Fists', slot: 'weapon', attack: 15, defense: 2, hp: 11, mp: 6, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Iron Body", description: 'Iron fists.' },
  { id: 'ib_k_gloves', name: 'Iron Body Wraps', slot: 'gloves', attack: 5, defense: 2, hp: 8, mp: 4, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Iron Body", description: 'Iron body wraps.' },
  { id: 'ib_k_boots', name: 'Iron Body Boots', slot: 'boots', attack: 3, defense: 2, hp: 7, mp: 3, speed: 2, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Iron Body", description: 'Iron body boots.' },
  { id: 'ib_k_necklace', name: 'Iron Body Necklace', slot: 'necklace', attack: 6, defense: 1, hp: 10, mp: 5, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Iron Body", description: 'Iron body necklace.' },
  { id: 'ib_k_offhand', name: 'Iron Body Knuckles', slot: 'offhand', attack: 7, defense: 2, hp: 9, mp: 4, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Iron Body", description: 'Iron body knuckles.' },
  { id: 'ib_k_ring1', name: 'Iron Body Ring', slot: 'ring', attack: 4, defense: 1, hp: 6, mp: 2, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Iron Body", description: 'Iron body ring.' },
  { id: 'ib_k_ring2', name: 'Iron Ring', slot: 'ring', attack: 4, defense: 2, hp: 5, mp: 3, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], set: "Iron Body", description: 'Iron focus ring.' },
  // Fighter - Iron Body
  { id: 'ibf_f_armor', name: 'Steelguard Plate', slot: 'armor', attack: 8, defense: 9, hp: 20, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Iron Body", description: 'Steelguard plate.' },
  { id: 'ibf_f_helm', name: 'Steelguard Helm', slot: 'helmet', attack: 4, defense: 6, hp: 12, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Iron Body", description: 'Steelguard helm.' },
  { id: 'ibf_f_weapon', name: 'Steelguard Sword', slot: 'weapon', attack: 14, defense: 4, hp: 13, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Iron Body", description: 'Steelguard sword.' },
  { id: 'ibf_f_gloves', name: 'Steelguard Gauntlets', slot: 'gloves', attack: 5, defense: 5, hp: 9, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Iron Body", description: 'Steelguard gloves.' },
  { id: 'ibf_f_shield', name: 'Steelguard Shield', slot: 'shield', attack: 2, defense: 10, hp: 15, mp: 0, speed: -1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Iron Body", description: 'Steelguard shield.' },
  { id: 'ibf_f_boots', name: 'Steelguard Boots', slot: 'boots', attack: 2, defense: 3, hp: 8, mp: 0, speed: 1, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Iron Body", description: 'Steelguard boots.' },
  { id: 'ibf_f_necklace', name: 'Steelguard Pendant', slot: 'necklace', attack: 3, defense: 2, hp: 11, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Iron Body", description: 'Steelguard pendant.' },
  { id: 'ibf_f_ring1', name: 'Steelguard Ring', slot: 'ring', attack: 2, defense: 1, hp: 7, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Iron Body", description: 'Steelguard ring.' },
  { id: 'ibf_f_ring2', name: 'Iron Guard Ring', slot: 'ring', attack: 2, defense: 2, hp: 6, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], set: "Iron Body", description: 'Iron guard ring.' },
  // Mage - Iron Body
  { id: 'ibm_m_armor', name: 'Stoneweaver Robe', slot: 'armor', attack: 6, defense: 7, hp: 14, mp: 12, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Iron Body", description: 'Stoneweaver robe.' },
  { id: 'ibm_m_helm', name: 'Stoneweaver Hat', slot: 'helmet', attack: 3, defense: 4, hp: 8, mp: 8, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Iron Body", description: 'Stoneweaver hat.' },
  { id: 'ibm_m_weapon', name: 'Stoneweaver Staff', slot: 'weapon', attack: 10, defense: 3, hp: 9, mp: 10, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Iron Body", description: 'Stoneweaver staff.' },
  { id: 'ibm_m_gloves', name: 'Stoneweaver Gloves', slot: 'gloves', attack: 2, defense: 3, hp: 6, mp: 6, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Iron Body", description: 'Stoneweaver gloves.' },
  { id: 'ibm_m_boots', name: 'Stoneweaver Boots', slot: 'boots', attack: 1, defense: 2, hp: 5, mp: 5, speed: 1, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Iron Body", description: 'Stoneweaver boots.' },
  { id: 'ibm_m_necklace', name: 'Stoneweaver Pendant', slot: 'necklace', attack: 2, defense: 1, hp: 7, mp: 6, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Iron Body", description: 'Stoneweaver pendant.' },
  { id: 'ibm_m_relic', name: 'Stoneweaver Relic', slot: 'relic', attack: 3, defense: 2, hp: 6, mp: 8, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Iron Body", description: 'Stoneweaver relic.' },
  { id: 'ibm_m_ring1', name: 'Stoneweaver Ring', slot: 'ring', attack: 1, defense: 0, hp: 4, mp: 4, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Iron Body", description: 'Stoneweaver ring.' },
  { id: 'ibm_m_ring2', name: 'Iron Mage Ring', slot: 'ring', attack: 1, defense: 1, hp: 3, mp: 5, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], set: "Iron Body", description: 'Iron mage ring.' },

  // ========== ADVANCED SETS (9 Sets - Epic/Legendary Rarity) ==========
  
  // === SET 10: BLADE DANCER (Attack/Critical) ===
  { id: 'bd_f_armor', name: 'Berserker Plate Armor', slot: 'armor', attack: 15, defense: 8, hp: 20, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Blade Dancer", description: 'Attack-focused armor. Set: Executioner' },
  { id: 'bd_f_helm', name: 'Slayer Helm', slot: 'helmet', attack: 8, defense: 4, hp: 10, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Blade Dancer", description: 'Critical strike helm.' },
  { id: 'bd_f_weapon', name: 'Executioner Greatsword', slot: 'weapon', attack: 32, defense: 2, hp: 12, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Blade Dancer", description: 'Massive damage blade.' },
  { id: 'bd_f_gloves', name: 'Berserker Gauntlets', slot: 'gloves', attack: 12, defense: 3, hp: 8, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Blade Dancer", description: 'Attack speed gloves.' },
  { id: 'bd_f_shield', name: 'Slaughter Shield', slot: 'shield', attack: 8, defense: 10, hp: 15, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Blade Dancer", description: 'Offensive shield.' },
  { id: 'bd_f_boots', name: 'Bloodhound Boots', slot: 'boots', attack: 6, defense: 1, hp: 6, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: "Blade Dancer", description: 'Chasing boots.' },
  { id: 'bd_f_necklace', name: 'Slayer Necklace', slot: 'necklace', attack: 10, defense: 2, hp: 10, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Blade Dancer", description: 'Critical damage necklace.' },
  { id: 'bd_f_ring1', name: 'Ring of Carnage', slot: 'ring', attack: 6, defense: 0, hp: 5, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Blade Dancer", description: 'Damage ring.' },
  { id: 'bd_f_ring2', name: 'Ring of Execution', slot: 'ring', attack: 8, defense: 0, hp: 3, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Blade Dancer", description: 'Execute ring.' },
  // Mage - Blade Dancer
  { id: 'bd_m_armor', name: 'Spellblade Robe', slot: 'armor', attack: 10, defense: 4, hp: 12, mp: 40, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Blade Dancer", description: 'Magic damage robe.' },
  { id: 'bd_m_helm', name: 'Spellblade Cowl', slot: 'helmet', attack: 5, defense: 2, hp: 8, mp: 25, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Blade Dancer", description: 'Spell crit hood.' },
  { id: 'bd_m_weapon', name: 'Spellblade Staff', slot: 'weapon', attack: 22, defense: 1, hp: 10, mp: 35, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Blade Dancer", description: 'Spellblade staff.' },
  { id: 'bd_m_gloves', name: 'Spellblade Gloves', slot: 'gloves', attack: 6, defense: 1, hp: 7, mp: 20, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Blade Dancer", description: 'Spellblade gloves.' },
  { id: 'bd_m_boots', name: 'Spellblade Boots', slot: 'boots', attack: 4, defense: 1, hp: 5, mp: 18, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: "Blade Dancer", description: 'Spellblade boots.' },
  { id: 'bd_m_necklace', name: 'Spellblade Pendant', slot: 'necklace', attack: 7, defense: 1, hp: 8, mp: 22, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Blade Dancer", description: 'Spellblade pendant.' },
  { id: 'bd_m_relic', name: 'Spellblade Relic', slot: 'relic', attack: 8, defense: 0, hp: 6, mp: 28, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Blade Dancer", description: 'Spellblade relic.' },
  { id: 'bd_m_ring1', name: 'Carnage Mage Ring', slot: 'ring', attack: 5, defense: 0, hp: 4, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Blade Dancer", description: 'Carnage mage ring.' },
  { id: 'bd_m_ring2', name: 'Execution Mage Ring', slot: 'ring', attack: 6, defense: 0, hp: 2, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Blade Dancer", description: 'Execution mage ring.' },
  // Monk - Blade Dancer
  { id: 'bd_k_armor', name: 'Striker Vest', slot: 'armor', attack: 12, defense: 5, hp: 15, mp: 15, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: "Blade Dancer", description: 'Attack-focused vest.' },
  { id: 'bd_k_helm', name: 'Striker Headband', slot: 'helmet', attack: 6, defense: 3, hp: 8, mp: 10, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Blade Dancer", description: 'Critical headband.' },
  { id: 'bd_k_weapon', name: 'Striker Fists', slot: 'weapon', attack: 26, defense: 2, hp: 12, mp: 12, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: "Blade Dancer", description: 'Striker fists.' },
  { id: 'bd_k_gloves', name: 'Striker Wraps', slot: 'gloves', attack: 9, defense: 2, hp: 7, mp: 8, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: "Blade Dancer", description: 'Striker wraps.' },
  { id: 'bd_k_boots', name: 'Striker Boots', slot: 'boots', attack: 5, defense: 1, hp: 5, mp: 6, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: "Blade Dancer", description: 'Striker boots.' },
  { id: 'bd_k_necklace', name: 'Striker Necklace', slot: 'necklace', attack: 8, defense: 1, hp: 9, mp: 10, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Blade Dancer", description: 'Striker necklace.' },
  { id: 'bd_k_offhand', name: 'Striker Offhand', slot: 'offhand', attack: 10, defense: 2, hp: 8, mp: 8, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: "Blade Dancer", description: 'Striker offhand.' },
  { id: 'bd_k_ring1', name: 'Striker Ring', slot: 'ring', attack: 5, defense: 0, hp: 4, mp: 5, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Blade Dancer", description: 'Striker ring.' },
  { id: 'bd_k_ring2', name: 'Carnage Monk Ring', slot: 'ring', attack: 6, defense: 0, hp: 3, mp: 6, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Blade Dancer", description: 'Carnage monk ring.' },

  // === SET 11: BULWARK SENTINEL (Ultimate Defense - Fighter-focused) ===
  { id: 'bs_f_armor', name: 'Fortress Plate', slot: 'armor', attack: 6, defense: 25, hp: 50, mp: 0, speed: -2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Bulwark Sentinel", description: 'Ultimate defense armor.' },
  { id: 'bs_f_helm', name: 'Fortress Helm', slot: 'helmet', attack: 3, defense: 15, hp: 30, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Bulwark Sentinel", description: 'Fortress helm.' },
  { id: 'bs_f_weapon', name: 'Guardian Blade', slot: 'weapon', attack: 18, defense: 10, hp: 35, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Bulwark Sentinel", description: 'Defensive blade.' },
  { id: 'bs_f_gloves', name: 'Fortress Gauntlets', slot: 'gloves', attack: 4, defense: 12, hp: 25, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Bulwark Sentinel", description: 'Fortress gauntlets.' },
  { id: 'bs_f_shield', name: 'Aegis Shield', slot: 'shield', attack: 2, defense: 30, hp: 60, mp: 0, speed: -3, rarity: 'legendary', allowedJobs: ['Fighter'], set: "Bulwark Sentinel", description: 'Ultimate shield.' },
  { id: 'bs_f_boots', name: 'Fortress Boots', slot: 'boots', attack: 2, defense: 10, hp: 20, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Bulwark Sentinel", description: 'Fortress boots.' },
  { id: 'bs_f_necklace', name: 'Guardian Pendant', slot: 'necklace', attack: 3, defense: 8, hp: 35, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Bulwark Sentinel", description: 'Guardian pendant.' },
  { id: 'bs_f_ring1', name: 'Fortress Ring', slot: 'ring', attack: 2, defense: 6, hp: 20, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Bulwark Sentinel", description: 'Fortress ring.' },
  { id: 'bs_f_ring2', name: 'Bulwark Ring', slot: 'ring', attack: 2, defense: 8, hp: 25, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Bulwark Sentinel", description: 'Bulwark ring.' },
  // Mage - Bulwark Sentinel
  { id: 'bs_m_armor', name: 'Arcane Ward Robe', slot: 'armor', attack: 5, defense: 15, hp: 35, mp: 25, speed: -1, rarity: 'epic', allowedJobs: ['Mage'], set: "Bulwark Sentinel", description: 'Defensive mage robe.' },
  { id: 'bs_m_helm', name: 'Arcane Ward Hat', slot: 'helmet', attack: 2, defense: 10, hp: 20, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Bulwark Sentinel", description: 'Defensive mage hat.' },
  { id: 'bs_m_weapon', name: 'Warding Staff', slot: 'weapon', attack: 12, defense: 8, hp: 25, mp: 35, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Bulwark Sentinel", description: 'Warding staff.' },
  { id: 'bs_m_gloves', name: 'Arcane Ward Gloves', slot: 'gloves', attack: 2, defense: 8, hp: 18, mp: 15, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Bulwark Sentinel", description: 'Arcane ward gloves.' },
  { id: 'bs_m_boots', name: 'Arcane Ward Boots', slot: 'boots', attack: 1, defense: 6, hp: 15, mp: 12, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Bulwark Sentinel", description: 'Arcane ward boots.' },
  { id: 'bs_m_necklace', name: 'Warding Pendant', slot: 'necklace', attack: 2, defense: 5, hp: 25, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Bulwark Sentinel", description: 'Warding pendant.' },
  { id: 'bs_m_relic', name: 'Warding Relic', slot: 'relic', attack: 3, defense: 5, hp: 20, mp: 25, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Bulwark Sentinel", description: 'Warding relic.' },
  { id: 'bs_m_ring1', name: 'Arcane Ward Ring', slot: 'ring', attack: 1, defense: 4, hp: 15, mp: 10, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Bulwark Sentinel", description: 'Arcane ward ring.' },
  { id: 'bs_m_ring2', name: 'Bulwark Mage Ring', slot: 'ring', attack: 1, defense: 5, hp: 18, mp: 12, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Bulwark Sentinel", description: 'Bulwark mage ring.' },
  // Monk - Bulwark Sentinel
  { id: 'bs_k_armor', name: 'Iron Palm Vest', slot: 'armor', attack: 8, defense: 12, hp: 35, mp: 15, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Bulwark Sentinel", description: 'Defensive monk vest.' },
  { id: 'bs_k_helm', name: 'Iron Palm Headband', slot: 'helmet', attack: 4, defense: 8, hp: 22, mp: 10, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Bulwark Sentinel", description: 'Defensive monk headband.' },
  { id: 'bs_k_weapon', name: 'Iron Palm Fists', slot: 'weapon', attack: 18, defense: 6, hp: 28, mp: 12, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: "Bulwark Sentinel", description: 'Iron palm fists.' },
  { id: 'bs_k_gloves', name: 'Iron Palm Wraps', slot: 'gloves', attack: 5, defense: 6, hp: 18, mp: 8, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Bulwark Sentinel", description: 'Iron palm wraps.' },
  { id: 'bs_k_boots', name: 'Iron Palm Boots', slot: 'boots', attack: 3, defense: 5, hp: 15, mp: 6, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: "Bulwark Sentinel", description: 'Iron palm boots.' },
  { id: 'bs_k_necklace', name: 'Iron Palm Necklace', slot: 'necklace', attack: 5, defense: 4, hp: 25, mp: 10, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Bulwark Sentinel", description: 'Iron palm necklace.' },
  { id: 'bs_k_offhand', name: 'Iron Palm Knuckles', slot: 'offhand', attack: 7, defense: 5, hp: 20, mp: 8, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: "Bulwark Sentinel", description: 'Iron palm knuckles.' },
  { id: 'bs_k_ring1', name: 'Iron Palm Ring', slot: 'ring', attack: 3, defense: 3, hp: 15, mp: 5, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Bulwark Sentinel", description: 'Iron palm ring.' },
  { id: 'bs_k_ring2', name: 'Bulwark Monk Ring', slot: 'ring', attack: 3, defense: 4, hp: 18, mp: 6, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Bulwark Sentinel", description: 'Bulwark monk ring.' },

  // === SET 12: VAMPIRIC EMBRACE (Lifesteal) ===
  { id: 've_f_armor', name: 'Vampiric Plate', slot: 'armor', attack: 12, defense: 10, hp: 25, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Vampiric Embrace", description: 'Life steal armor.' },
  { id: 've_f_helm', name: 'Bloodthirst Helm', slot: 'helmet', attack: 6, defense: 5, hp: 15, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Vampiric Embrace", description: 'Drain helm.' },
  { id: 've_f_weapon', name: 'Vampiric Sword', slot: 'weapon', attack: 25, defense: 4, hp: 18, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Vampiric Embrace", description: 'Vampiric sword.' },
  { id: 've_f_gloves', name: 'Vampiric Gauntlets', slot: 'gloves', attack: 8, defense: 4, hp: 12, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Vampiric Embrace", description: 'Vampiric gloves.' },
  { id: 've_f_shield', name: 'Blood Shield', slot: 'shield', attack: 3, defense: 12, hp: 20, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Vampiric Embrace", description: 'Blood shield.' },
  { id: 've_f_boots', name: 'Vampiric Boots', slot: 'boots', attack: 4, defense: 3, hp: 10, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Vampiric Embrace", description: 'Vampiric boots.' },
  { id: 've_f_necklace', name: 'Vampiric Pendant', slot: 'necklace', attack: 8, defense: 2, hp: 15, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Vampiric Embrace", description: 'Vampiric pendant.' },
  { id: 've_f_ring1', name: 'Vampiric Ring', slot: 'ring', attack: 5, defense: 1, hp: 8, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Vampiric Embrace", description: 'Vampiric ring.' },
  { id: 've_f_ring2', name: 'Blood Drinker Ring', slot: 'ring', attack: 6, defense: 1, hp: 6, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Vampiric Embrace", description: 'Blood drinker ring.' },
  // Mage - Vampiric Embrace
  { id: 've_m_armor', name: 'Blood Mage Robe', slot: 'armor', attack: 9, defense: 5, hp: 18, mp: 30, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Vampiric Embrace", description: 'Blood mage robe.' },
  { id: 've_m_helm', name: 'Blood Mage Hat', slot: 'helmet', attack: 5, defense: 3, hp: 12, mp: 20, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Vampiric Embrace", description: 'Blood mage hat.' },
  { id: 've_m_weapon', name: 'Blood Staff', slot: 'weapon', attack: 18, defense: 2, hp: 15, mp: 35, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Vampiric Embrace", description: 'Blood staff.' },
  { id: 've_m_gloves', name: 'Blood Mage Gloves', slot: 'gloves', attack: 4, defense: 2, hp: 10, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Vampiric Embrace", description: 'Blood mage gloves.' },
  { id: 've_m_boots', name: 'Blood Mage Boots', slot: 'boots', attack: 3, defense: 2, hp: 8, mp: 12, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: "Vampiric Embrace", description: 'Blood mage boots.' },
  { id: 've_m_necklace', name: 'Blood Mage Pendant', slot: 'necklace', attack: 6, defense: 1, hp: 12, mp: 18, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Vampiric Embrace", description: 'Blood mage pendant.' },
  { id: 've_m_relic', name: 'Blood Relic', slot: 'relic', attack: 7, defense: 1, hp: 10, mp: 25, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Vampiric Embrace", description: 'Blood relic.' },
  { id: 've_m_ring1', name: 'Blood Mage Ring', slot: 'ring', attack: 4, defense: 0, hp: 6, mp: 12, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Vampiric Embrace", description: 'Blood mage ring.' },
  { id: 've_m_ring2', name: 'Draining Ring', slot: 'ring', attack: 5, defense: 0, hp: 5, mp: 14, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Vampiric Embrace", description: 'Draining ring.' },
  // Monk - Vampiric Embrace
  { id: 've_k_armor', name: 'Blood Lotus Vest', slot: 'armor', attack: 10, defense: 6, hp: 20, mp: 12, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Vampiric Embrace", description: 'Blood lotus vest.' },
  { id: 've_k_helm', name: 'Blood Lotus Headband', slot: 'helmet', attack: 5, defense: 4, hp: 14, mp: 8, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Vampiric Embrace", description: 'Blood lotus headband.' },
  { id: 've_k_weapon', name: 'Blood Lotus Fists', slot: 'weapon', attack: 22, defense: 3, hp: 16, mp: 10, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Vampiric Embrace", description: 'Blood lotus fists.' },
  { id: 've_k_gloves', name: 'Blood Lotus Wraps', slot: 'gloves', attack: 7, defense: 3, hp: 12, mp: 6, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Vampiric Embrace", description: 'Blood lotus wraps.' },
  { id: 've_k_boots', name: 'Blood Lotus Boots', slot: 'boots', attack: 4, defense: 2, hp: 10, mp: 5, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: "Vampiric Embrace", description: 'Blood lotus boots.' },
  { id: 've_k_necklace', name: 'Blood Lotus Necklace', slot: 'necklace', attack: 7, defense: 2, hp: 14, mp: 8, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Vampiric Embrace", description: 'Blood lotus necklace.' },
  { id: 've_k_offhand', name: 'Blood Lotus Offhand', slot: 'offhand', attack: 8, defense: 2, hp: 12, mp: 6, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Vampiric Embrace", description: 'Blood lotus offhand.' },
  { id: 've_k_ring1', name: 'Blood Lotus Ring', slot: 'ring', attack: 4, defense: 1, hp: 8, mp: 4, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Vampiric Embrace", description: 'Blood lotus ring.' },
  { id: 've_k_ring2', name: 'Draining Monk Ring', slot: 'ring', attack: 5, defense: 1, hp: 6, mp: 5, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Vampiric Embrace", description: 'Draining monk ring.' },

  // === SET 13: WIND DANCER (Speed/Evasion) ===
  { id: 'wdf_f_armor', name: 'Zephyr Plate', slot: 'armor', attack: 10, defense: 6, hp: 18, mp: 0, speed: 4, rarity: 'epic', allowedJobs: ['Fighter'], set: "Wind Dancer", description: 'Fast armor.' },
  { id: 'wdf_f_helm', name: 'Gale Helm', slot: 'helmet', attack: 5, defense: 3, hp: 10, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Wind Dancer", description: 'Swift helm.' },
  { id: 'wdf_f_weapon', name: 'Zephyr Blade', slot: 'weapon', attack: 22, defense: 2, hp: 14, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: "Wind Dancer", description: 'Zephyr blade.' },
  { id: 'wdf_f_gloves', name: 'Zephyr Gauntlets', slot: 'gloves', attack: 7, defense: 2, hp: 11, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: "Wind Dancer", description: 'Zephyr gloves.' },
  { id: 'wdf_f_shield', name: 'Wind Shield', slot: 'shield', attack: 2, defense: 8, hp: 15, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Wind Dancer", description: 'Wind shield.' },
  { id: 'wdf_f_boots', name: 'Zephyr Boots', slot: 'boots', attack: 5, defense: 1, hp: 9, mp: 0, speed: 5, rarity: 'epic', allowedJobs: ['Fighter'], set: "Wind Dancer", description: 'Zephyr boots.' },
  { id: 'wdf_f_necklace', name: 'Zephyr Necklace', slot: 'necklace', attack: 7, defense: 1, hp: 12, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: "Wind Dancer", description: 'Zephyr necklace.' },
  { id: 'wdf_f_ring1', name: 'Zephyr Ring', slot: 'ring', attack: 4, defense: 0, hp: 7, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Wind Dancer", description: 'Zephyr ring.' },
  { id: 'wdf_f_ring2', name: 'Gale Ring', slot: 'ring', attack: 5, defense: 0, hp: 5, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: "Wind Dancer", description: 'Gale ring.' },
  // Mage - Wind Dancer
  { id: 'wdm_m_armor', name: 'Storm Robe', slot: 'armor', attack: 8, defense: 4, hp: 15, mp: 35, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: "Wind Dancer", description: 'Storm robe.' },
  { id: 'wdm_m_helm', name: 'Storm Hat', slot: 'helmet', attack: 4, defense: 2, hp: 10, mp: 22, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: "Wind Dancer", description: 'Storm hat.' },
  { id: 'wdm_m_weapon', name: 'Gale Staff', slot: 'weapon', attack: 16, defense: 1, hp: 12, mp: 40, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: "Wind Dancer", description: 'Gale staff.' },
  { id: 'wdm_m_gloves', name: 'Storm Gloves', slot: 'gloves', attack: 4, defense: 1, hp: 9, mp: 18, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: "Wind Dancer", description: 'Storm gloves.' },
  { id: 'wdm_m_boots', name: 'Storm Boots', slot: 'boots', attack: 3, defense: 1, hp: 7, mp: 15, speed: 4, rarity: 'epic', allowedJobs: ['Mage'], set: "Wind Dancer", description: 'Storm boots.' },
  { id: 'wdm_m_necklace', name: 'Gale Pendant', slot: 'necklace', attack: 5, defense: 1, hp: 10, mp: 20, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: "Wind Dancer", description: 'Gale pendant.' },
  { id: 'wdm_m_relic', name: 'Storm Relic', slot: 'relic', attack: 6, defense: 0, hp: 8, mp: 28, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: "Wind Dancer", description: 'Storm relic.' },
  { id: 'wdm_m_ring1', name: 'Storm Ring', slot: 'ring', attack: 3, defense: 0, hp: 6, mp: 12, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: "Wind Dancer", description: 'Storm ring.' },
  { id: 'wdm_m_ring2', name: 'Gale Mage Ring', slot: 'ring', attack: 4, defense: 0, hp: 4, mp: 14, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: "Wind Dancer", description: 'Gale mage ring.' },
  // Monk - Wind Dancer
  { id: 'wdk_k_armor', name: 'Typhoon Vest', slot: 'armor', attack: 9, defense: 4, hp: 15, mp: 15, speed: 5, rarity: 'epic', allowedJobs: ['Monk'], set: "Wind Dancer", description: 'Typhoon vest.' },
  { id: 'wdk_k_helm', name: 'Typhoon Headband', slot: 'helmet', attack: 4, defense: 2, hp: 10, mp: 10, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: "Wind Dancer", description: 'Typhoon headband.' },
  { id: 'wdk_k_weapon', name: 'Typhoon Fists', slot: 'weapon', attack: 20, defense: 1, hp: 12, mp: 12, speed: 5, rarity: 'epic', allowedJobs: ['Monk'], set: "Wind Dancer", description: 'Typhoon fists.' },
  { id: 'wdk_k_gloves', name: 'Typhoon Wraps', slot: 'gloves', attack: 6, defense: 1, hp: 9, mp: 8, speed: 5, rarity: 'epic', allowedJobs: ['Monk'], set: "Wind Dancer", description: 'Typhoon wraps.' },
  { id: 'wdk_k_boots', name: 'Typhoon Boots', slot: 'boots', attack: 4, defense: 1, hp: 7, mp: 6, speed: 6, rarity: 'epic', allowedJobs: ['Monk'], set: "Wind Dancer", description: 'Typhoon boots.' },
  { id: 'wdk_k_necklace', name: 'Typhoon Necklace', slot: 'necklace', attack: 6, defense: 1, hp: 11, mp: 10, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: "Wind Dancer", description: 'Typhoon necklace.' },
  { id: 'wdk_k_offhand', name: 'Typhoon Offhand', slot: 'offhand', attack: 7, defense: 1, hp: 9, mp: 8, speed: 5, rarity: 'epic', allowedJobs: ['Monk'], set: "Wind Dancer", description: 'Typhoon offhand.' },
  { id: 'wdk_k_ring1', name: 'Typhoon Ring', slot: 'ring', attack: 4, defense: 0, hp: 6, mp: 5, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: "Wind Dancer", description: 'Typhoon ring.' },
  { id: 'wdk_k_ring2', name: 'Gale Monk Ring', slot: 'ring', attack: 4, defense: 0, hp: 4, mp: 6, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: "Wind Dancer", description: 'Gale monk ring.' },

  // === SET 14: RIPOSTE (Counter/Parry - Fighter-focused) ===
  { id: 'rp_f_armor', name: 'Parry Plate', slot: 'armor', attack: 10, defense: 12, hp: 22, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Riposte", description: 'Counter armor.' },
  { id: 'rp_f_helm', name: 'Riposte Helm', slot: 'helmet', attack: 5, defense: 8, hp: 14, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Riposte", description: 'Counter helm.' },
  { id: 'rp_f_weapon', name: 'Parry Sword', slot: 'weapon', attack: 20, defense: 6, hp: 18, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Riposte", description: 'Parry sword.' },
  { id: 'rp_f_gloves', name: 'Parry Gauntlets', slot: 'gloves', attack: 6, defense: 5, hp: 14, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Riposte", description: 'Parry gloves.' },
  { id: 'rp_f_shield', name: 'Riposte Shield', slot: 'shield', attack: 1, defense: 15, hp: 20, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Riposte", description: 'Riposte shield.' },
  { id: 'rp_f_boots', name: 'Parry Boots', slot: 'boots', attack: 4, defense: 3, hp: 11, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Riposte", description: 'Parry boots.' },
  { id: 'rp_f_necklace', name: 'Parry Necklace', slot: 'necklace', attack: 7, defense: 4, hp: 16, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Riposte", description: 'Parry necklace.' },
  { id: 'rp_f_ring1', name: 'Parry Ring', slot: 'ring', attack: 4, defense: 2, hp: 9, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Riposte", description: 'Parry ring.' },
  { id: 'rp_f_ring2', name: 'Counter Ring', slot: 'ring', attack: 5, defense: 3, hp: 7, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Riposte", description: 'Counter ring.' },
  // Mage - Riposte
  { id: 'rp_m_armor', name: 'Reflect Robe', slot: 'armor', attack: 7, defense: 8, hp: 18, mp: 25, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Riposte", description: 'Reflect robe.' },
  { id: 'rp_m_helm', name: 'Reflect Hat', slot: 'helmet', attack: 3, defense: 5, hp: 12, mp: 18, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Riposte", description: 'Reflect hat.' },
  { id: 'rp_m_weapon', name: 'Reflect Staff', slot: 'weapon', attack: 15, defense: 4, hp: 15, mp: 30, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Riposte", description: 'Reflect staff.' },
  { id: 'rp_m_gloves', name: 'Reflect Gloves', slot: 'gloves', attack: 3, defense: 3, hp: 10, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Riposte", description: 'Reflect gloves.' },
  { id: 'rp_m_boots', name: 'Reflect Boots', slot: 'boots', attack: 2, defense: 2, hp: 8, mp: 12, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: "Riposte", description: 'Reflect boots.' },
  { id: 'rp_m_necklace', name: 'Reflect Pendant', slot: 'necklace', attack: 5, defense: 3, hp: 12, mp: 18, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Riposte", description: 'Reflect pendant.' },
  { id: 'rp_m_relic', name: 'Reflect Relic', slot: 'relic', attack: 5, defense: 2, hp: 10, mp: 22, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Riposte", description: 'Reflect relic.' },
  { id: 'rp_m_ring1', name: 'Reflect Ring', slot: 'ring', attack: 3, defense: 2, hp: 7, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Riposte", description: 'Reflect ring.' },
  { id: 'rp_m_ring2', name: 'Counter Mage Ring', slot: 'ring', attack: 3, defense: 2, hp: 5, mp: 12, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Riposte", description: 'Counter mage ring.' },
  // Monk - Riposte
  { id: 'rp_k_armor', name: 'Counterstrike Vest', slot: 'armor', attack: 9, defense: 7, hp: 18, mp: 12, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Riposte", description: 'Counterstrike vest.' },
  { id: 'rp_k_helm', name: 'Counterstrike Headband', slot: 'helmet', attack: 4, defense: 5, hp: 12, mp: 8, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Riposte", description: 'Counterstrike headband.' },
  { id: 'rp_k_weapon', name: 'Counterstrike Fists', slot: 'weapon', attack: 18, defense: 4, hp: 15, mp: 10, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: "Riposte", description: 'Counterstrike fists.' },
  { id: 'rp_k_gloves', name: 'Counterstrike Wraps', slot: 'gloves', attack: 6, defense: 4, hp: 11, mp: 6, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Riposte", description: 'Counterstrike wraps.' },
  { id: 'rp_k_boots', name: 'Counterstrike Boots', slot: 'boots', attack: 3, defense: 2, hp: 9, mp: 5, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: "Riposte", description: 'Counterstrike boots.' },
  { id: 'rp_k_necklace', name: 'Counterstrike Necklace', slot: 'necklace', attack: 6, defense: 3, hp: 13, mp: 8, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Riposte", description: 'Counterstrike necklace.' },
  { id: 'rp_k_offhand', name: 'Counterstrike Offhand', slot: 'offhand', attack: 7, defense: 3, hp: 11, mp: 6, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: "Riposte", description: 'Counterstrike offhand.' },
  { id: 'rp_k_ring1', name: 'Counterstrike Ring', slot: 'ring', attack: 4, defense: 2, hp: 7, mp: 4, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Riposte", description: 'Counterstrike ring.' },
  { id: 'rp_k_ring2', name: 'Counter Monk Ring', slot: 'ring', attack: 4, defense: 2, hp: 5, mp: 5, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Riposte", description: 'Counter monk ring.' },

  // === SET 15: FROZEN WASTELAND (Ice/Control) ===
  { id: 'fw_f_armor', name: 'Frost Plate', slot: 'armor', attack: 12, defense: 10, hp: 22, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Frozen Wasteland", description: 'Ice armor.' },
  { id: 'fw_f_helm', name: 'Glacial Helm', slot: 'helmet', attack: 6, defense: 6, hp: 12, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Frozen Wasteland", description: 'Ice helm.' },
  { id: 'fw_f_weapon', name: 'Frost Sword', slot: 'weapon', attack: 23, defense: 4, hp: 17, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Frozen Wasteland", description: 'Frost sword.' },
  { id: 'fw_f_gloves', name: 'Frost Gauntlets', slot: 'gloves', attack: 7, defense: 4, hp: 13, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Frozen Wasteland", description: 'Frost gloves.' },
  { id: 'fw_f_shield', name: 'Glacial Shield', slot: 'shield', attack: 2, defense: 12, hp: 18, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Frozen Wasteland", description: 'Glacial shield.' },
  { id: 'fw_f_boots', name: 'Frost Boots', slot: 'boots', attack: 4, defense: 3, hp: 10, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Frozen Wasteland", description: 'Frost boots.' },
  { id: 'fw_f_necklace', name: 'Frost Necklace', slot: 'necklace', attack: 8, defense: 2, hp: 15, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Frozen Wasteland", description: 'Frost necklace.' },
  { id: 'fw_f_ring1', name: 'Frost Ring', slot: 'ring', attack: 5, defense: 1, hp: 9, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Frozen Wasteland", description: 'Frost ring.' },
  { id: 'fw_f_ring2', name: 'Glacial Ring', slot: 'ring', attack: 6, defense: 2, hp: 7, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Frozen Wasteland", description: 'Glacial ring.' },
  // Mage - Frozen Wasteland
  { id: 'fw_m_armor', name: 'Ice Mage Robe', slot: 'armor', attack: 10, defense: 5, hp: 16, mp: 38, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Frozen Wasteland", description: 'Ice mage robe.' },
  { id: 'fw_m_helm', name: 'Ice Crown', slot: 'helmet', attack: 5, defense: 3, hp: 10, mp: 25, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Frozen Wasteland", description: 'Ice crown.' },
  { id: 'fw_m_weapon', name: 'Blizzard Staff', slot: 'weapon', attack: 20, defense: 2, hp: 14, mp: 45, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Frozen Wasteland", description: 'Blizzard staff.' },
  { id: 'fw_m_gloves', name: 'Frost Mage Gloves', slot: 'gloves', attack: 5, defense: 2, hp: 10, mp: 20, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Frozen Wasteland", description: 'Frost mage gloves.' },
  { id: 'fw_m_boots', name: 'Ice Mage Boots', slot: 'boots', attack: 3, defense: 2, hp: 8, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Frozen Wasteland", description: 'Ice mage boots.' },
  { id: 'fw_m_necklace', name: 'Blizzard Pendant', slot: 'necklace', attack: 7, defense: 1, hp: 12, mp: 22, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Frozen Wasteland", description: 'Blizzard pendant.' },
  { id: 'fw_m_relic', name: 'Frost Relic', slot: 'relic', attack: 8, defense: 1, hp: 10, mp: 30, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Frozen Wasteland", description: 'Frost relic.' },
  { id: 'fw_m_ring1', name: 'Ice Ring', slot: 'ring', attack: 4, defense: 1, hp: 7, mp: 14, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Frozen Wasteland", description: 'Ice ring.' },
  { id: 'fw_m_ring2', name: 'Glacial Mage Ring', slot: 'ring', attack: 5, defense: 1, hp: 5, mp: 16, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Frozen Wasteland", description: 'Glacial mage ring.' },
  // Monk - Frozen Wasteland
  { id: 'fw_k_armor', name: 'Frozen Palm Vest', slot: 'armor', attack: 11, defense: 6, hp: 18, mp: 15, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Frozen Wasteland", description: 'Frozen palm vest.' },
  { id: 'fw_k_helm', name: 'Frozen Palm Headband', slot: 'helmet', attack: 5, defense: 4, hp: 11, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: "Frozen Wasteland", description: 'Frozen palm headband.' },
  { id: 'fw_k_weapon', name: 'Frozen Fists', slot: 'weapon', attack: 21, defense: 3, hp: 14, mp: 12, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Frozen Wasteland", description: 'Frozen fists.' },
  { id: 'fw_k_gloves', name: 'Frozen Palm Wraps', slot: 'gloves', attack: 7, defense: 3, hp: 11, mp: 8, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Frozen Wasteland", description: 'Frozen palm wraps.' },
  { id: 'fw_k_boots', name: 'Frozen Palm Boots', slot: 'boots', attack: 4, defense: 2, hp: 8, mp: 6, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Frozen Wasteland", description: 'Frozen palm boots.' },
  { id: 'fw_k_necklace', name: 'Frozen Palm Necklace', slot: 'necklace', attack: 7, defense: 2, hp: 13, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: "Frozen Wasteland", description: 'Frozen palm necklace.' },
  { id: 'fw_k_offhand', name: 'Frozen Palm Offhand', slot: 'offhand', attack: 8, defense: 2, hp: 10, mp: 8, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Frozen Wasteland", description: 'Frozen palm offhand.' },
  { id: 'fw_k_ring1', name: 'Frozen Palm Ring', slot: 'ring', attack: 5, defense: 1, hp: 7, mp: 5, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: "Frozen Wasteland", description: 'Frozen palm ring.' },
  { id: 'fw_k_ring2', name: 'Glacial Monk Ring', slot: 'ring', attack: 5, defense: 1, hp: 5, mp: 6, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: "Frozen Wasteland", description: 'Glacial monk ring.' },

  // === SET 16: INFERNO BLAZE (Fire/Burn) ===
  { id: 'ibz_f_armor', name: 'Inferno Plate', slot: 'armor', attack: 13, defense: 9, hp: 21, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Inferno Blaze", description: 'Fire armor.' },
  { id: 'ibz_f_helm', name: 'Blaze Helm', slot: 'helmet', attack: 6, defense: 5, hp: 11, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Inferno Blaze", description: 'Fire helm.' },
  { id: 'ibz_f_weapon', name: 'Inferno Sword', slot: 'weapon', attack: 24, defense: 3, hp: 16, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Inferno Blaze", description: 'Inferno sword.' },
  { id: 'ibz_f_gloves', name: 'Inferno Gauntlets', slot: 'gloves', attack: 8, defense: 3, hp: 12, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Inferno Blaze", description: 'Inferno gloves.' },
  { id: 'ibz_f_shield', name: 'Blaze Shield', slot: 'shield', attack: 3, defense: 10, hp: 17, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Inferno Blaze", description: 'Blaze shield.' },
  { id: 'ibz_f_boots', name: 'Inferno Boots', slot: 'boots', attack: 5, defense: 2, hp: 9, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Inferno Blaze", description: 'Inferno boots.' },
  { id: 'ibz_f_necklace', name: 'Inferno Necklace', slot: 'necklace', attack: 9, defense: 1, hp: 14, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Inferno Blaze", description: 'Inferno necklace.' },
  { id: 'ibz_f_ring1', name: 'Inferno Ring', slot: 'ring', attack: 6, defense: 0, hp: 8, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Inferno Blaze", description: 'Inferno ring.' },
  { id: 'ibz_f_ring2', name: 'Blaze Ring', slot: 'ring', attack: 7, defense: 1, hp: 6, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Inferno Blaze", description: 'Blaze ring.' },
  // Mage - Inferno Blaze
  { id: 'ibz_m_armor', name: 'Flame Mage Robe', slot: 'armor', attack: 11, defense: 4, hp: 15, mp: 40, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Inferno Blaze", description: 'Flame mage robe.' },
  { id: 'ibz_m_helm', name: 'Flame Crown', slot: 'helmet', attack: 6, defense: 2, hp: 9, mp: 26, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Inferno Blaze", description: 'Flame crown.' },
  { id: 'ibz_m_weapon', name: 'Inferno Staff', slot: 'weapon', attack: 22, defense: 1, hp: 13, mp: 48, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Inferno Blaze", description: 'Inferno staff.' },
  { id: 'ibz_m_gloves', name: 'Flame Mage Gloves', slot: 'gloves', attack: 6, defense: 1, hp: 9, mp: 22, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Inferno Blaze", description: 'Flame mage gloves.' },
  { id: 'ibz_m_boots', name: 'Flame Mage Boots', slot: 'boots', attack: 4, defense: 1, hp: 7, mp: 16, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Inferno Blaze", description: 'Flame mage boots.' },
  { id: 'ibz_m_necklace', name: 'Inferno Pendant', slot: 'necklace', attack: 8, defense: 0, hp: 11, mp: 24, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Inferno Blaze", description: 'Inferno pendant.' },
  { id: 'ibz_m_relic', name: 'Flame Relic', slot: 'relic', attack: 9, defense: 0, hp: 9, mp: 32, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Inferno Blaze", description: 'Flame relic.' },
  { id: 'ibz_m_ring1', name: 'Flame Ring', slot: 'ring', attack: 5, defense: 0, hp: 6, mp: 15, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Inferno Blaze", description: 'Flame ring.' },
  { id: 'ibz_m_ring2', name: 'Blaze Mage Ring', slot: 'ring', attack: 6, defense: 0, hp: 4, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Inferno Blaze", description: 'Blaze mage ring.' },
  // Monk - Inferno Blaze
  { id: 'ibz_k_armor', name: 'Burning Palm Vest', slot: 'armor', attack: 12, defense: 5, hp: 17, mp: 16, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Inferno Blaze", description: 'Burning palm vest.' },
  { id: 'ibz_k_helm', name: 'Burning Palm Headband', slot: 'helmet', attack: 6, defense: 3, hp: 10, mp: 11, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: "Inferno Blaze", description: 'Burning palm headband.' },
  { id: 'ibz_k_weapon', name: 'Burning Fists', slot: 'weapon', attack: 22, defense: 2, hp: 13, mp: 13, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Inferno Blaze", description: 'Burning fists.' },
  { id: 'ibz_k_gloves', name: 'Burning Palm Wraps', slot: 'gloves', attack: 8, defense: 2, hp: 10, mp: 9, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Inferno Blaze", description: 'Burning palm wraps.' },
  { id: 'ibz_k_boots', name: 'Burning Palm Boots', slot: 'boots', attack: 5, defense: 1, hp: 7, mp: 7, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Inferno Blaze", description: 'Burning palm boots.' },
  { id: 'ibz_k_necklace', name: 'Burning Palm Necklace', slot: 'necklace', attack: 8, defense: 1, hp: 12, mp: 11, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: "Inferno Blaze", description: 'Burning palm necklace.' },
  { id: 'ibz_k_offhand', name: 'Burning Palm Offhand', slot: 'offhand', attack: 9, defense: 1, hp: 9, mp: 9, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Inferno Blaze", description: 'Burning palm offhand.' },
  { id: 'ibz_k_ring1', name: 'Burning Palm Ring', slot: 'ring', attack: 5, defense: 0, hp: 6, mp: 6, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: "Inferno Blaze", description: 'Burning palm ring.' },
  { id: 'ibz_k_ring2', name: 'Blaze Monk Ring', slot: 'ring', attack: 6, defense: 0, hp: 4, mp: 7, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: "Inferno Blaze", description: 'Blaze monk ring.' },

  // === SET 17: STORM CALLER (Lightning/Chain) ===
  { id: 'sc_f_armor', name: 'Storm Plate', slot: 'armor', attack: 11, defense: 9, hp: 20, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Storm Caller", description: 'Lightning armor.' },
  { id: 'sc_f_helm', name: 'Storm Helm', slot: 'helmet', attack: 5, defense: 5, hp: 11, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Storm Caller", description: 'Lightning helm.' },
  { id: 'sc_f_weapon', name: 'Storm Sword', slot: 'weapon', attack: 22, defense: 4, hp: 15, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Storm Caller", description: 'Storm sword.' },
  { id: 'sc_f_gloves', name: 'Storm Gauntlets', slot: 'gloves', attack: 6, defense: 4, hp: 11, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Storm Caller", description: 'Storm gloves.' },
  { id: 'sc_f_shield', name: 'Storm Shield', slot: 'shield', attack: 2, defense: 11, hp: 16, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Storm Caller", description: 'Storm shield.' },
  { id: 'sc_f_boots', name: 'Storm Boots', slot: 'boots', attack: 4, defense: 3, hp: 9, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: "Storm Caller", description: 'Storm boots.' },
  { id: 'sc_f_necklace', name: 'Storm Necklace', slot: 'necklace', attack: 7, defense: 2, hp: 13, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Storm Caller", description: 'Storm necklace.' },
  { id: 'sc_f_ring1', name: 'Storm Ring', slot: 'ring', attack: 4, defense: 1, hp: 8, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Storm Caller", description: 'Storm ring.' },
  { id: 'sc_f_ring2', name: 'Thunder Ring', slot: 'ring', attack: 5, defense: 2, hp: 6, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Storm Caller", description: 'Thunder ring.' },
  // Mage - Storm Caller
  { id: 'sc_m_armor', name: 'Lightning Robe', slot: 'armor', attack: 10, defense: 4, hp: 14, mp: 38, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: "Storm Caller", description: 'Lightning robe.' },
  { id: 'sc_m_helm', name: 'Thunder Crown', slot: 'helmet', attack: 5, defense: 2, hp: 9, mp: 25, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Storm Caller", description: 'Thunder crown.' },
  { id: 'sc_m_weapon', name: 'Thunder Staff', slot: 'weapon', attack: 20, defense: 1, hp: 12, mp: 45, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: "Storm Caller", description: 'Thunder staff.' },
  { id: 'sc_m_gloves', name: 'Lightning Gloves', slot: 'gloves', attack: 5, defense: 1, hp: 9, mp: 20, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: "Storm Caller", description: 'Lightning gloves.' },
  { id: 'sc_m_boots', name: 'Lightning Boots', slot: 'boots', attack: 3, defense: 1, hp: 7, mp: 15, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: "Storm Caller", description: 'Lightning boots.' },
  { id: 'sc_m_necklace', name: 'Thunder Pendant', slot: 'necklace', attack: 7, defense: 1, hp: 10, mp: 22, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: "Storm Caller", description: 'Thunder pendant.' },
  { id: 'sc_m_relic', name: 'Lightning Relic', slot: 'relic', attack: 8, defense: 0, hp: 8, mp: 30, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: "Storm Caller", description: 'Lightning relic.' },
  { id: 'sc_m_ring1', name: 'Lightning Ring', slot: 'ring', attack: 4, defense: 0, hp: 6, mp: 14, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Storm Caller", description: 'Lightning ring.' },
  { id: 'sc_m_ring2', name: 'Thunder Mage Ring', slot: 'ring', attack: 5, defense: 0, hp: 4, mp: 16, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: "Storm Caller", description: 'Thunder mage ring.' },
  // Monk - Storm Caller
  { id: 'sc_k_armor', name: 'Thunder Palm Vest', slot: 'armor', attack: 10, defense: 5, hp: 16, mp: 15, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: "Storm Caller", description: 'Thunder palm vest.' },
  { id: 'sc_k_helm', name: 'Thunder Palm Headband', slot: 'helmet', attack: 5, defense: 3, hp: 10, mp: 10, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Storm Caller", description: 'Thunder palm headband.' },
  { id: 'sc_k_weapon', name: 'Thunder Fists', slot: 'weapon', attack: 20, defense: 2, hp: 13, mp: 12, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: "Storm Caller", description: 'Thunder fists.' },
  { id: 'sc_k_gloves', name: 'Thunder Palm Wraps', slot: 'gloves', attack: 7, defense: 2, hp: 10, mp: 8, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: "Storm Caller", description: 'Thunder palm wraps.' },
  { id: 'sc_k_boots', name: 'Thunder Palm Boots', slot: 'boots', attack: 4, defense: 1, hp: 7, mp: 6, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: "Storm Caller", description: 'Thunder palm boots.' },
  { id: 'sc_k_necklace', name: 'Thunder Palm Necklace', slot: 'necklace', attack: 7, defense: 1, hp: 11, mp: 10, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Storm Caller", description: 'Thunder palm necklace.' },
  { id: 'sc_k_offhand', name: 'Thunder Palm Offhand', slot: 'offhand', attack: 8, defense: 1, hp: 9, mp: 8, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: "Storm Caller", description: 'Thunder palm offhand.' },
  { id: 'sc_k_ring1', name: 'Thunder Palm Ring', slot: 'ring', attack: 5, defense: 0, hp: 6, mp: 5, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Storm Caller", description: 'Thunder palm ring.' },
  { id: 'sc_k_ring2', name: 'Storm Monk Ring', slot: 'ring', attack: 5, defense: 1, hp: 4, mp: 6, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: "Storm Caller", description: 'Storm monk ring.' },

  // === SET 18: EARTHEN COLOSSUS (Earth/Defense) ===
  { id: 'ec_f_armor', name: 'Stoneform Plate', slot: 'armor', attack: 14, defense: 20, hp: 35, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Earthen Colossus", description: 'Earth armor.' },
  { id: 'ec_f_helm', name: 'Stone Helm', slot: 'helmet', attack: 6, defense: 12, hp: 22, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Earthen Colossus", description: 'Earth helm.' },
  { id: 'ec_f_weapon', name: 'Stone Sword', slot: 'weapon', attack: 26, defense: 8, hp: 25, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Earthen Colossus", description: 'Stone sword.' },
  { id: 'ec_f_gloves', name: 'Stone Gauntlets', slot: 'gloves', attack: 8, defense: 10, hp: 20, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Earthen Colossus", description: 'Stone gloves.' },
  { id: 'ec_f_shield', name: 'Earth Shield', slot: 'shield', attack: 2, defense: 22, hp: 30, mp: 0, speed: -2, rarity: 'epic', allowedJobs: ['Fighter'], set: "Earthen Colossus", description: 'Earth shield.' },
  { id: 'ec_f_boots', name: 'Stone Boots', slot: 'boots', attack: 5, defense: 6, hp: 15, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: "Earthen Colossus", description: 'Stone boots.' },
  { id: 'ec_f_necklace', name: 'Stone Necklace', slot: 'necklace', attack: 10, defense: 8, hp: 25, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Earthen Colossus", description: 'Stone necklace.' },
  { id: 'ec_f_ring1', name: 'Stone Ring', slot: 'ring', attack: 6, defense: 4, hp: 12, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Earthen Colossus", description: 'Stone ring.' },
  { id: 'ec_f_ring2', name: 'Earth Ring', slot: 'ring', attack: 7, defense: 5, hp: 10, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: "Earthen Colossus", description: 'Earth ring.' },
  // Mage - Earthen Colossus
  { id: 'ec_m_armor', name: 'Mountain Robe', slot: 'armor', attack: 9, defense: 12, hp: 28, mp: 30, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Earthen Colossus", description: 'Mountain robe.' },
  { id: 'ec_m_helm', name: 'Mountain Hat', slot: 'helmet', attack: 4, defense: 8, hp: 18, mp: 20, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Earthen Colossus", description: 'Mountain hat.' },
  { id: 'ec_m_weapon', name: 'Mountain Staff', slot: 'weapon', attack: 18, defense: 6, hp: 20, mp: 35, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Earthen Colossus", description: 'Mountain staff.' },
  { id: 'ec_m_gloves', name: 'Mountain Gloves', slot: 'gloves', attack: 4, defense: 6, hp: 15, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Earthen Colossus", description: 'Mountain gloves.' },
  { id: 'ec_m_boots', name: 'Mountain Boots', slot: 'boots', attack: 2, defense: 4, hp: 12, mp: 14, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: "Earthen Colossus", description: 'Mountain boots.' },
  { id: 'ec_m_necklace', name: 'Mountain Pendant', slot: 'necklace', attack: 6, defense: 5, hp: 20, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Earthen Colossus", description: 'Mountain pendant.' },
  { id: 'ec_m_relic', name: 'Mountain Relic', slot: 'relic', attack: 6, defense: 4, hp: 16, mp: 25, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Earthen Colossus", description: 'Mountain relic.' },
  { id: 'ec_m_ring1', name: 'Mountain Ring', slot: 'ring', attack: 3, defense: 3, hp: 10, mp: 12, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Earthen Colossus", description: 'Mountain ring.' },
  { id: 'ec_m_ring2', name: 'Earth Mage Ring', slot: 'ring', attack: 4, defense: 4, hp: 8, mp: 14, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: "Earthen Colossus", description: 'Earth mage ring.' },
  // Monk - Earthen Colossus
  { id: 'ec_k_armor', name: 'Stone Palm Vest', slot: 'armor', attack: 11, defense: 10, hp: 28, mp: 12, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Earthen Colossus", description: 'Stone palm vest.' },
  { id: 'ec_k_helm', name: 'Stone Palm Headband', slot: 'helmet', attack: 5, defense: 6, hp: 18, mp: 8, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Earthen Colossus", description: 'Stone palm headband.' },
  { id: 'ec_k_weapon', name: 'Stone Fists', slot: 'weapon', attack: 22, defense: 5, hp: 22, mp: 10, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Earthen Colossus", description: 'Stone fists.' },
  { id: 'ec_k_gloves', name: 'Stone Palm Wraps', slot: 'gloves', attack: 7, defense: 5, hp: 16, mp: 6, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Earthen Colossus", description: 'Stone palm wraps.' },
  { id: 'ec_k_boots', name: 'Stone Palm Boots', slot: 'boots', attack: 4, defense: 3, hp: 12, mp: 5, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: "Earthen Colossus", description: 'Stone palm boots.' },
  { id: 'ec_k_necklace', name: 'Stone Palm Necklace', slot: 'necklace', attack: 8, defense: 4, hp: 20, mp: 8, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Earthen Colossus", description: 'Stone palm necklace.' },
  { id: 'ec_k_offhand', name: 'Stone Palm Knuckles', slot: 'offhand', attack: 9, defense: 4, hp: 16, mp: 6, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Earthen Colossus", description: 'Stone palm knuckles.' },
  { id: 'ec_k_ring1', name: 'Stone Palm Ring', slot: 'ring', attack: 5, defense: 2, hp: 10, mp: 4, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Earthen Colossus", description: 'Stone palm ring.' },
  { id: 'ec_k_ring2', name: 'Earth Monk Ring', slot: 'ring', attack: 6, defense: 3, hp: 8, mp: 5, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: "Earthen Colossus", description: 'Earth monk ring.' },

  // ========== COMMON/STARTER EQUIPMENT (No set, all classes) ==========
  // Basic Weapons
  { id: 'rusty_sword', name: 'Rusty Sword', slot: 'weapon', attack: 3, defense: 0, hp: 0, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter'], description: 'A worn but serviceable blade' },
  { id: 'wooden_staff', name: 'Wooden Staff', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 8, speed: 0, rarity: 'common', allowedJobs: ['Mage'], description: 'A basic magic staff' },
  { id: 'brass_knuckles', name: 'Brass Knuckles', slot: 'weapon', attack: 3, defense: 0, hp: 0, mp: 3, speed: 1, rarity: 'common', allowedJobs: ['Monk'], description: 'Simple but effective fighting knuckles' },
  { id: 'cloth_wraps', name: 'Cloth Wraps', slot: 'weapon', attack: 2, defense: 0, hp: 0, mp: 3, speed: 1, rarity: 'common', allowedJobs: ['Monk'], description: 'Simple hand wraps' },
  { id: 'iron_sword', name: 'Iron Sword', slot: 'weapon', attack: 6, defense: 0, hp: 0, mp: 0, speed: 0, rarity: 'uncommon', allowedJobs: ['Fighter'], description: 'A reliable iron blade' },
  { id: 'oak_staff', name: 'Oak Staff', slot: 'weapon', attack: 4, defense: 0, hp: 0, mp: 15, speed: 0, rarity: 'uncommon', allowedJobs: ['Mage'], description: 'Carved from sturdy oak' },
  { id: 'leather_wraps', name: 'Leather Wraps', slot: 'weapon', attack: 5, defense: 1, hp: 0, mp: 5, speed: 1, rarity: 'uncommon', allowedJobs: ['Monk'], description: 'Reinforced hand wraps' },
  // Basic Armor
  { id: 'cloth_shirt', name: 'Cloth Shirt', slot: 'armor', attack: 0, defense: 2, hp: 5, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter', 'Mage', 'Monk'], description: 'Basic cloth protection' },
  { id: 'leather_vest', name: 'Leather Vest', slot: 'armor', attack: 0, defense: 4, hp: 8, mp: 0, speed: 0, rarity: 'common', allowedJobs: ['Fighter', 'Monk'], description: 'Light leather protection' },
  { id: 'cloth_robe', name: 'Cloth Robe', slot: 'armor', attack: 0, defense: 2, hp: 4, mp: 10, speed: 0, rarity: 'common', allowedJobs: ['Mage'], description: 'Basic mage robe' },
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
