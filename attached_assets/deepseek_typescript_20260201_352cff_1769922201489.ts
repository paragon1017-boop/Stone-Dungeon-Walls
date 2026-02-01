// ========== COMPLETE EQUIPMENT DATABASE - ALL 9 SETS ==========
// File: complete_equipment_database.ts
// Total: 243 items (9 sets × 27 items each)
// Updated with 15% explosion mechanics

export const COMPLETE_EQUIPMENT_DATABASE = [
  // ========== SET 1: BLADE DANCER (Attack/Critical) ==========
  // Fighter - 9 items
  { id: 'bd_f_armor', name: 'Berserker Plate Armor', slot: 'armor', attack: 15, defense: 8, hp: 20, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'Attack-focused armor. Set: Executioner (+damage), Critical Chance +15%' },
  { id: 'bd_f_helm', name: 'Slayer Helm', slot: 'helmet', attack: 8, defense: 4, hp: 10, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'Critical strike helm. Set: Executioner (+damage), Critical Chance +15%' },
  { id: 'bd_f_weapon', name: 'Executioner Greatsword', slot: 'weapon', attack: 32, defense: 2, hp: 12, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'Massive damage blade. Set: Executioner (+damage), Critical Chance +15%' },
  { id: 'bd_f_gloves', name: 'Berserker Gauntlets', slot: 'gloves', attack: 12, defense: 3, hp: 8, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'Attack speed gloves. Set: Executioner (+damage), Critical Chance +15%' },
  { id: 'bd_f_shield', name: 'Slaughter Shield', slot: 'shield', attack: 8, defense: 10, hp: 15, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'Offensive shield. Set: Executioner (+damage), Critical Chance +15%' },
  { id: 'bd_f_boots', name: 'Bloodhound Boots', slot: 'boots', attack: 6, defense: 1, hp: 6, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'Chasing boots. Set: Executioner (+damage), Critical Chance +15%' },
  { id: 'bd_f_necklace', name: 'Slayer Necklace', slot: 'necklace', attack: 10, defense: 2, hp: 10, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'Critical damage necklace. Set: Executioner (+damage), Critical Chance +15%' },
  { id: 'bd_f_ring1', name: 'Ring of Carnage', slot: 'ring', attack: 6, defense: 0, hp: 5, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'Damage ring. Set: Executioner (+damage), Critical Chance +15%' },
  { id: 'bd_f_ring2', name: 'Ring of Execution', slot: 'ring', attack: 8, defense: 0, hp: 3, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Blade Dancer', description: 'Execute ring. Set: Executioner (+damage), Critical Chance +15%' },
  
  // Mage - 9 items
  { id: 'bd_m_armor', name: 'Spellblade Robe', slot: 'armor', attack: 10, defense: 4, hp: 12, mp: 40, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Blade Dancer', description: 'Magic damage robe. Set: Overload (damage all enemies), Critical Chance +15%' },
  { id: 'bd_m_helm', name: 'Spellblade Cowl', slot: 'helmet', attack: 5, defense: 2, hp: 8, mp: 25, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Blade Dancer', description: 'Spell crit hood. Set: Overload (damage all enemies), Critical Chance +15%' },
  { id: 'bd_m_weapon', name: 'Annihilation Staff', slot: 'weapon', attack: 14, defense: 1, hp: 10, mp: 50, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Blade Dancer', description: 'AoE staff. Set: Overload (damage all enemies), Critical Chance +15%' },
  { id: 'bd_m_gloves', name: 'Spellblade Gloves', slot: 'gloves', attack: 6, defense: 1, hp: 6, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Blade Dancer', description: 'Casting gloves. Set: Overload (damage all enemies), Critical Chance +15%' },
  { id: 'bd_m_boots', name: 'Sorcerer Striders', slot: 'boots', attack: 4, defense: 1, hp: 7, mp: 10, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Blade Dancer', description: 'Magic move boots. Set: Overload (damage all enemies), Critical Chance +15%' },
  { id: 'bd_m_necklace', name: 'Annihilation Necklace', slot: 'necklace', attack: 8, defense: 1, hp: 9, mp: 12, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Blade Dancer', description: 'Spell power necklace. Set: Overload (damage all enemies), Critical Chance +15%' },
  { id: 'bd_m_relic', name: 'Spellblade Relic', slot: 'relic', attack: 9, defense: 0, hp: 7, mp: 30, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Blade Dancer', description: 'AoE damage relic. Set: Overload (damage all enemies), Critical Chance +15%' },
  { id: 'bd_m_ring1', name: 'Ring of Overload', slot: 'ring', attack: 5, defense: 0, hp: 4, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Blade Dancer', description: 'Overload chance ring. Set: Overload (damage all enemies), Critical Chance +15%' },
  { id: 'bd_m_ring2', name: 'Ring of Annihilation', slot: 'ring', attack: 6, defense: 0, hp: 3, mp: 12, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Blade Dancer', description: 'Explosion damage ring. Set: Overload kills cause 15% max HP explosions' },
  
  // Monk - 9 items
  { id: 'bd_k_armor', name: 'Death Dancer Mantle', slot: 'armor', attack: 14, defense: 6, hp: 18, mp: 12, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Blade Dancer', description: 'Mobile attack armor. Set: Killing Blow (+75% damage), Critical Chance +15%' },
  { id: 'bd_k_helm', name: 'Death Dancer Headband', slot: 'helmet', attack: 6, defense: 3, hp: 10, mp: 8, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Blade Dancer', description: 'Precision headband. Set: Killing Blow (+75% damage), Critical Chance +15%' },
  { id: 'bd_k_weapon', name: 'Deathwhirl Chakram', slot: 'weapon', attack: 24, defense: 1, hp: 14, mp: 10, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: 'Blade Dancer', description: 'Spinning weapon. Set: Killing Blow (+75% damage), Critical Chance +15%' },
  { id: 'bd_k_gloves', name: 'Death Dancer Gauntlets', slot: 'gloves', attack: 10, defense: 4, hp: 9, mp: 8, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Blade Dancer', description: 'Quick strike gloves. Set: Killing Blow (+75% damage), Critical Chance +15%' },
  { id: 'bd_k_boots', name: 'Death Strider Boots', slot: 'boots', attack: 7, defense: 2, hp: 8, mp: 6, speed: 5, rarity: 'epic', allowedJobs: ['Monk'], set: 'Blade Dancer', description: 'Ultra mobile boots. Set: Killing Blow (+75% damage), Critical Chance +15%' },
  { id: 'bd_k_necklace', name: 'Killing Circlet', slot: 'necklace', attack: 9, defense: 1, hp: 8, mp: 15, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Blade Dancer', description: 'Lethal necklace. Set: Killing Blow (+75% damage), Critical Chance +15%' },
  { id: 'bd_k_offhand', name: 'Death Talon', slot: 'offhand', attack: 12, defense: 1, hp: 7, mp: 6, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Blade Dancer', description: 'Secondary claw. Set: Killing Blow (+75% damage), Critical Chance +15%' },
  { id: 'bd_k_ring1', name: 'Ring of Death Dance', slot: 'ring', attack: 7, defense: 0, hp: 5, mp: 8, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Blade Dancer', description: 'Movement ring. Set: Killing Blow (+75% damage), Critical Chance +15%' },
  { id: 'bd_k_ring2', name: 'Ring of Killing Blow', slot: 'ring', attack: 8, defense: 0, hp: 4, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Blade Dancer', description: 'Execute ring. Set: Killing Blow (+75% damage), Critical Chance +15%' },

  // ========== SET 2: BULWARK SENTINEL (Defense/Tank) ==========
  // Fighter - 9 items
  { id: 'bs_f_armor', name: 'Sentinel Plate', slot: 'armor', attack: 5, defense: 25, hp: 40, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Ultimate tank armor. Set: Fortify (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_f_helm', name: 'Bastion Helm', slot: 'helmet', attack: 2, defense: 15, hp: 25, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Protective helm. Set: Fortify (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_f_weapon', name: 'Defender Sword', slot: 'weapon', attack: 20, defense: 15, hp: 25, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Defensive sword. Set: Fortify (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_f_gloves', name: 'Sentinel Gauntlets', slot: 'gloves', attack: 3, defense: 12, hp: 20, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Blocking gloves. Set: Fortify (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_f_shield', name: 'Aegis Shield', slot: 'shield', attack: 4, defense: 30, hp: 35, mp: 0, speed: -2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Legendary shield. Set: Fortify (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_f_boots', name: 'Fortress Boots', slot: 'boots', attack: 1, defense: 8, hp: 15, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Anchor boots. Set: Fortify (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_f_necklace', name: 'Adamantite Necklace', slot: 'necklace', attack: 2, defense: 10, hp: 18, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Durable necklace. Set: Fortify (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_f_ring1', name: 'Bulwark Ring', slot: 'ring', attack: 1, defense: 6, hp: 12, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Defense ring. Set: Fortify (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_f_ring2', name: 'Ring of Protection', slot: 'ring', attack: 1, defense: 8, hp: 10, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Bulwark Sentinel', description: 'Protection ring. Set: Fortify (+25% Defense), Damage Reduction +15%' },
  
  // Mage - 9 items
  { id: 'bs_m_armor', name: 'Warden Robe', slot: 'armor', attack: 3, defense: 18, hp: 30, mp: 40, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Bulwark Sentinel', description: 'Magic defense robe. Set: Arcane Shield (+25% Magic Defense), Damage Reduction +15%' },
  { id: 'bs_m_helm', name: 'Guardian Cowl', slot: 'helmet', attack: 1, defense: 12, hp: 20, mp: 25, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Bulwark Sentinel', description: 'Magic resist hood. Set: Arcane Shield (+25% Magic Defense), Damage Reduction +15%' },
  { id: 'bs_m_weapon', name: 'Barrier Staff', slot: 'weapon', attack: 10, defense: 20, hp: 25, mp: 50, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Bulwark Sentinel', description: 'Shield staff. Set: Arcane Shield (+25% Magic Defense), Damage Reduction +15%' },
  { id: 'bs_m_gloves', name: 'Warden Gloves', slot: 'gloves', attack: 2, defense: 10, hp: 15, mp: 20, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Bulwark Sentinel', description: 'Absorption gloves. Set: Arcane Shield (+25% Magic Defense), Damage Reduction +15%' },
  { id: 'bs_m_boots', name: 'Protector Boots', slot: 'boots', attack: 1, defense: 8, hp: 12, mp: 15, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Bulwark Sentinel', description: 'Grounding boots. Set: Arcane Shield (+25% Magic Defense), Damage Reduction +15%' },
  { id: 'bs_m_necklace', name: 'Amulet of Warding', slot: 'necklace', attack: 2, defense: 15, hp: 18, mp: 30, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Bulwark Sentinel', description: 'Magic ward amulet. Set: Arcane Shield (+25% Magic Defense), Damage Reduction +15%' },
  { id: 'bs_m_relic', name: 'Shield Relic', slot: 'relic', attack: 1, defense: 12, hp: 15, mp: 40, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Bulwark Sentinel', description: 'Force field relic. Set: Arcane Shield (+25% Magic Defense), Damage Reduction +15%' },
  { id: 'bs_m_ring1', name: 'Ring of Shielding', slot: 'ring', attack: 1, defense: 8, hp: 10, mp: 20, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Bulwark Sentinel', description: 'Barrier ring. Set: Arcane Shield (+25% Magic Defense), Damage Reduction +15%' },
  { id: 'bs_m_ring2', name: 'Ring of Warding', slot: 'ring', attack: 1, defense: 10, hp: 8, mp: 25, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Bulwark Sentinel', description: 'Ward ring. Set: Arcane Shield (+25% Magic Defense), Damage Reduction +15%' },
  
  // Monk - 9 items
  { id: 'bs_k_armor', name: 'Iron Mountain Vest', slot: 'armor', attack: 8, defense: 22, hp: 35, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Bulwark Sentinel', description: 'Durable vest. Set: Unbreakable (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_k_helm', name: 'Mountain Headband', slot: 'helmet', attack: 3, defense: 14, hp: 22, mp: 8, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Bulwark Sentinel', description: 'Focus headband. Set: Unbreakable (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_k_weapon', name: 'Iron Fist Weapon', slot: 'weapon', attack: 18, defense: 18, hp: 28, mp: 12, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Bulwark Sentinel', description: 'Defensive weapon. Set: Unbreakable (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_k_gloves', name: 'Mountain Gauntlets', slot: 'gloves', attack: 5, defense: 12, hp: 18, mp: 10, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Bulwark Sentinel', description: 'Impact gloves. Set: Unbreakable (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_k_boots', name: 'Rooted Boots', slot: 'boots', attack: 2, defense: 10, hp: 15, mp: 6, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Bulwark Sentinel', description: 'Stationary boots. Set: Unbreakable (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_k_necklace', name: 'Endurance Necklace', slot: 'necklace', attack: 3, defense: 12, hp: 20, mp: 15, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Bulwark Sentinel', description: 'Stamina necklace. Set: Unbreakable (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_k_offhand', name: 'Stone Palm', slot: 'offhand', attack: 6, defense: 15, hp: 16, mp: 8, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Bulwark Sentinel', description: 'Blocking off-hand. Set: Unbreakable (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_k_ring1', name: 'Ring of Endurance', slot: 'ring', attack: 2, defense: 8, hp: 12, mp: 10, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Bulwark Sentinel', description: 'Resilience ring. Set: Unbreakable (+25% Defense), Damage Reduction +15%' },
  { id: 'bs_k_ring2', name: 'Ring of Stone', slot: 'ring', attack: 2, defense: 10, hp: 10, mp: 8, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Bulwark Sentinel', description: 'Durability ring. Set: Unbreakable (+25% Defense), Damage Reduction +15%' },

  // ========== SET 3: VAMPIRIC EMBRACE (Life Steal/Sustain) ==========
  // Fighter - 9 items
  { id: 've_f_armor', name: 'Vampiric Plate', slot: 'armor', attack: 12, defense: 10, hp: 25, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Life steal armor. Set: Blood Drinker (+20% Life Steal), Attack Speed +15%' },
  { id: 've_f_helm', name: 'Bloodthirst Helm', slot: 'helmet', attack: 6, defense: 5, hp: 15, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Drain helm. Set: Blood Drinker (+20% Life Steal), Attack Speed +15%' },
  { id: 've_f_weapon', name: 'Sanguine Blade', slot: 'weapon', attack: 28, defense: 3, hp: 20, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Life drinker sword. Set: Blood Drinker (+20% Life Steal), Attack Speed +15%' },
  { id: 've_f_gloves', name: 'Bloodletter Gauntlets', slot: 'gloves', attack: 10, defense: 4, hp: 18, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Siphon gloves. Set: Blood Drinker (+20% Life Steal), Attack Speed +15%' },
  { id: 've_f_shield', name: 'Lifebinder Shield', slot: 'shield', attack: 6, defense: 12, hp: 22, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Healing shield. Set: Blood Drinker (+20% Life Steal), Attack Speed +15%' },
  { id: 've_f_boots', name: 'Hemorrhage Striders', slot: 'boots', attack: 5, defense: 3, hp: 12, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Bleeding boots. Set: Blood Drinker (+20% Life Steal), Attack Speed +15%' },
  { id: 've_f_necklace', name: 'Crimson Pendant', slot: 'necklace', attack: 8, defense: 2, hp: 15, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Vampire necklace. Set: Blood Drinker (+20% Life Steal), Attack Speed +15%' },
  { id: 've_f_ring1', name: 'Ring of Thirst', slot: 'ring', attack: 5, defense: 1, hp: 8, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Drain ring. Set: Blood Drinker (+20% Life Steal), Attack Speed +15%' },
  { id: 've_f_ring2', name: 'Ring of Vitality', slot: 'ring', attack: 6, defense: 0, hp: 10, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Vampiric Embrace', description: 'Heal ring. Set: Blood Drinker (+20% Life Steal), Attack Speed +15%' },
  
  // Mage - 9 items
  { id: 've_m_armor', name: 'Bloodmage Robe', slot: 'armor', attack: 8, defense: 8, hp: 20, mp: 35, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Vampiric Embrace', description: 'Spell steal robe. Set: Life Drain (+20% Spell Life Steal), Cast Speed +15%' },
  { id: 've_m_helm', name: 'Hemomancer Cowl', slot: 'helmet', attack: 4, defense: 4, hp: 12, mp: 22, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Vampiric Embrace', description: 'Blood magic hood. Set: Life Drain (+20% Spell Life Steal), Cast Speed +15%' },
  { id: 've_m_weapon', name: 'Siphon Staff', slot: 'weapon', attack: 12, defense: 2, hp: 15, mp: 45, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Vampiric Embrace', description: 'Life drain staff. Set: Life Drain (+20% Spell Life Steal), Cast Speed +15%' },
  { id: 've_m_gloves', name: 'Bloodweaver Gloves', slot: 'gloves', attack: 5, defense: 2, hp: 10, mp: 18, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Vampiric Embrace', description: 'Drain gloves. Set: Life Drain (+20% Spell Life Steal), Cast Speed +15%' },
  { id: 've_m_boots', name: 'Crimson Striders', slot: 'boots', attack: 3, defense: 2, hp: 8, mp: 12, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Vampiric Embrace', description: 'Blood trail boots. Set: Life Drain (+20% Spell Life Steal), Cast Speed +15%' },
  { id: 've_m_necklace', name: 'Sanguine Amulet', slot: 'necklace', attack: 6, defense: 2, hp: 12, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Vampiric Embrace', description: 'Life steal amulet. Set: Life Drain (+20% Spell Life Steal), Cast Speed +15%' },
  { id: 've_m_relic', name: 'Vampire Relic', slot: 'relic', attack: 7, defense: 1, hp: 10, mp: 25, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Vampiric Embrace', description: 'Drain relic. Set: Life Drain (+20% Spell Life Steal), Cast Speed +15%' },
  { id: 've_m_ring1', name: 'Ring of Siphon', slot: 'ring', attack: 4, defense: 0, hp: 6, mp: 12, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Vampiric Embrace', description: 'Drain ring. Set: Life Drain (+20% Spell Life Steal), Cast Speed +15%' },
  { id: 've_m_ring2', name: 'Ring of Transfusion', slot: 'ring', attack: 5, defense: 0, hp: 5, mp: 15, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Vampiric Embrace', description: 'Transfer ring. Set: Life Drain (+20% Spell Life Steal), Cast Speed +15%' },
  
  // Monk - 9 items
  { id: 've_k_armor', name: 'Vitality Mantle', slot: 'armor', attack: 12, defense: 8, hp: 22, mp: 15, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Vampiric Embrace', description: 'Healing armor. Set: Vitality Strike (heal 5% damage dealt), Attack Speed +15%' },
  { id: 've_k_helm', name: 'Lifebringer Headband', slot: 'helmet', attack: 5, defense: 4, hp: 14, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Vampiric Embrace', description: 'Heal helm. Set: Vitality Strike (heal 5% damage dealt), Attack Speed +15%' },
  { id: 've_k_weapon', name: 'Lifestealer Chakram', slot: 'weapon', attack: 22, defense: 2, hp: 18, mp: 12, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Vampiric Embrace', description: 'Heal weapon. Set: Vitality Strike (heal 5% damage dealt), Attack Speed +15%' },
  { id: 've_k_gloves', name: 'Vitality Gauntlets', slot: 'gloves', attack: 8, defense: 5, hp: 12, mp: 10, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Vampiric Embrace', description: 'Healing gloves. Set: Vitality Strike (heal 5% damage dealt), Attack Speed +15%' },
  { id: 've_k_boots', name: 'Lifeflow Boots', slot: 'boots', attack: 5, defense: 3, hp: 10, mp: 8, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Vampiric Embrace', description: 'Heal trail boots. Set: Vitality Strike (heal 5% damage dealt), Attack Speed +15%' },
  { id: 've_k_necklace', name: 'Vitality Circlet', slot: 'necklace', attack: 7, defense: 2, hp: 12, mp: 18, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Vampiric Embrace', description: 'Healing necklace. Set: Vitality Strike (heal 5% damage dealt), Attack Speed +15%' },
  { id: 've_k_offhand', name: 'Life Claw', slot: 'offhand', attack: 10, defense: 2, hp: 10, mp: 8, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Vampiric Embrace', description: 'Healing off-hand. Set: Vitality Strike (heal 5% damage dealt), Attack Speed +15%' },
  { id: 've_k_ring1', name: 'Ring of Vitality', slot: 'ring', attack: 5, defense: 1, hp: 8, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Vampiric Embrace', description: 'Heal ring. Set: Vitality Strike (heal 5% damage dealt), Attack Speed +15%' },
  { id: 've_k_ring2', name: 'Ring of Life', slot: 'ring', attack: 6, defense: 0, hp: 6, mp: 12, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Vampiric Embrace', description: 'Life ring. Set: Vitality Strike (heal 5% damage dealt), Attack Speed +15%' },

  // ========== SET 4: WIND DANCER (Speed/Evasion) ==========
  // Fighter - 9 items
  { id: 'wd_f_armor', name: 'Zephyr Plate', slot: 'armor', attack: 10, defense: 6, hp: 18, mp: 0, speed: 4, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Fast armor. Set: Gale Force (+30% Movement Speed), Evasion +15%' },
  { id: 'wd_f_helm', name: 'Gale Helm', slot: 'helmet', attack: 5, defense: 3, hp: 10, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Swift helm. Set: Gale Force (+30% Movement Speed), Evasion +15%' },
  { id: 'wd_f_weapon', name: 'Whirlwind Blade', slot: 'weapon', attack: 26, defense: 1, hp: 15, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Fast sword. Set: Gale Force (+30% Movement Speed), Evasion +15%' },
  { id: 'wd_f_gloves', name: 'Swiftstrike Gauntlets', slot: 'gloves', attack: 8, defense: 2, hp: 10, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Quick gloves. Set: Gale Force (+30% Movement Speed), Evasion +15%' },
  { id: 'wd_f_shield', name: 'Windshield', slot: 'shield', attack: 5, defense: 8, hp: 12, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Light shield. Set: Gale Force (+30% Movement Speed), Evasion +15%' },
  { id: 'wd_f_boots', name: 'Gale Boots', slot: 'boots', attack: 4, defense: 1, hp: 8, mp: 0, speed: 5, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Ultra fast boots. Set: Gale Force (+30% Movement Speed), Evasion +15%' },
  { id: 'wd_f_necklace', name: 'Zephyr Pendant', slot: 'necklace', attack: 7, defense: 1, hp: 10, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Swift necklace. Set: Gale Force (+30% Movement Speed), Evasion +15%' },
  { id: 'wd_f_ring1', name: 'Ring of Swiftness', slot: 'ring', attack: 4, defense: 0, hp: 6, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Speed ring. Set: Gale Force (+30% Movement Speed), Evasion +15%' },
  { id: 'wd_f_ring2', name: 'Ring of the Wind', slot: 'ring', attack: 5, defense: 0, hp: 5, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Wind Dancer', description: 'Wind ring. Set: Gale Force (+30% Movement Speed), Evasion +15%' },
  
  // Mage - 9 items
  { id: 'wd_m_armor', name: 'Zephyr Robe', slot: 'armor', attack: 8, defense: 6, hp: 15, mp: 30, speed: 5, rarity: 'epic', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Fast robe. Set: Quickcast (25% faster cast speed), Evasion +15%' },
  { id: 'wd_m_helm', name: 'Gale Cowl', slot: 'helmet', attack: 4, defense: 3, hp: 10, mp: 20, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Swift hood. Set: Quickcast (25% faster cast speed), Evasion +15%' },
  { id: 'wd_m_weapon', name: 'Wind Staff', slot: 'weapon', attack: 12, defense: 1, hp: 12, mp: 40, speed: 4, rarity: 'epic', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Fast staff. Set: Quickcast (25% faster cast speed), Evasion +15%' },
  { id: 'wd_m_gloves', name: 'Swiftcast Gloves', slot: 'gloves', attack: 5, defense: 2, hp: 8, mp: 15, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Quick cast gloves. Set: Quickcast (25% faster cast speed), Evasion +15%' },
  { id: 'wd_m_boots', name: 'Windwalker Boots', slot: 'boots', attack: 3, defense: 1, hp: 7, mp: 10, speed: 6, rarity: 'epic', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Fast boots. Set: Quickcast (25% faster cast speed), Evasion +15%' },
  { id: 'wd_m_necklace', name: 'Gale Amulet', slot: 'necklace', attack: 6, defense: 1, hp: 9, mp: 15, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Swift amulet. Set: Quickcast (25% faster cast speed), Evasion +15%' },
  { id: 'wd_m_relic', name: 'Wind Relic', slot: 'relic', attack: 7, defense: 0, hp: 8, mp: 25, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Speed relic. Set: Quickcast (25% faster cast speed), Evasion +15%' },
  { id: 'wd_m_ring1', name: 'Ring of Haste', slot: 'ring', attack: 4, defense: 0, hp: 5, mp: 12, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Haste ring. Set: Quickcast (25% faster cast speed), Evasion +15%' },
  { id: 'wd_m_ring2', name: 'Ring of Quickening', slot: 'ring', attack: 5, defense: 0, hp: 4, mp: 15, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: 'Wind Dancer', description: 'Quick ring. Set: Quickcast (25% faster cast speed), Evasion +15%' },
  
  // Monk - 9 items
  { id: 'wd_k_armor', name: 'Wind Dancer Mantle', slot: 'armor', attack: 12, defense: 5, hp: 16, mp: 15, speed: 6, rarity: 'epic', allowedJobs: ['Monk'], set: 'Wind Dancer', description: 'Ultra fast armor. Set: Blur (15% evasion), Movement Speed +30%' },
  { id: 'wd_k_helm', name: 'Blur Headband', slot: 'helmet', attack: 5, defense: 2, hp: 10, mp: 10, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: 'Wind Dancer', description: 'Evasion helm. Set: Blur (15% evasion), Movement Speed +30%' },
  { id: 'wd_k_weapon', name: 'Gale Chakram', slot: 'weapon', attack: 20, defense: 1, hp: 14, mp: 12, speed: 7, rarity: 'epic', allowedJobs: ['Monk'], set: 'Wind Dancer', description: 'Swift weapon. Set: Blur (15% evasion), Movement Speed +30%' },
  { id: 'wd_k_gloves', name: 'Wind Dancer Gauntlets', slot: 'gloves', attack: 8, defense: 3, hp: 10, mp: 10, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: 'Wind Dancer', description: 'Quick gloves. Set: Blur (15% evasion), Movement Speed +30%' },
  { id: 'wd_k_boots', name: 'Blur Boots', slot: 'boots', attack: 5, defense: 1, hp: 8, mp: 8, speed: 8, rarity: 'epic', allowedJobs: ['Monk'], set: 'Wind Dancer', description: 'Maximum speed boots. Set: Blur (15% evasion), Movement Speed +30%' },
  { id: 'wd_k_necklace', name: 'Evasion Circlet', slot: 'necklace', attack: 7, defense: 1, hp: 9, mp: 15, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Wind Dancer', description: 'Dodge necklace. Set: Blur (15% evasion), Movement Speed +30%' },
  { id: 'wd_k_offhand', name: 'Wind Claw', slot: 'offhand', attack: 10, defense: 1, hp: 8, mp: 8, speed: 5, rarity: 'epic', allowedJobs: ['Monk'], set: 'Wind Dancer', description: 'Fast off-hand. Set: Blur (15% evasion), Movement Speed +30%' },
  { id: 'wd_k_ring1', name: 'Ring of Evasion', slot: 'ring', attack: 5, defense: 0, hp: 6, mp: 10, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Wind Dancer', description: 'Dodge ring. Set: Blur (15% evasion), Movement Speed +30%' },
  { id: 'wd_k_ring2', name: 'Ring of Blur', slot: 'ring', attack: 6, defense: 0, hp: 5, mp: 12, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: 'Wind Dancer', description: 'Blur ring. Set: Blur (15% evasion), Movement Speed +30%' },

  // ========== SET 5: RIPOSTE (Counter/Parry) ==========
  // Fighter - 9 items
  { id: 'rp_f_armor', name: 'Parry Plate', slot: 'armor', attack: 10, defense: 12, hp: 22, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Counter armor. Set: Counter Strike (35% chance to counter), Parry Chance +15%' },
  { id: 'rp_f_helm', name: 'Riposte Helm', slot: 'helmet', attack: 5, defense: 8, hp: 14, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Counter helm. Set: Counter Strike (35% chance to counter), Parry Chance +15%' },
  { id: 'rp_f_weapon', name: 'Counter Blade', slot: 'weapon', attack: 24, defense: 8, hp: 18, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Counter sword. Set: Counter Strike (35% chance to counter), Parry Chance +15%' },
  { id: 'rp_f_gloves', name: 'Parry Gauntlets', slot: 'gloves', attack: 7, defense: 6, hp: 12, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Parry gloves. Set: Counter Strike (35% chance to counter), Parry Chance +15%' },
  { id: 'rp_f_shield', name: 'Riposte Shield', slot: 'shield', attack: 6, defense: 15, hp: 20, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Counter shield. Set: Counter Strike (35% chance to counter), Parry Chance +15%' },
  { id: 'rp_f_boots', name: 'Counter Boots', slot: 'boots', attack: 4, defense: 4, hp: 10, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'React boots. Set: Counter Strike (35% chance to counter), Parry Chance +15%' },
  { id: 'rp_f_necklace', name: 'Parry Pendant', slot: 'necklace', attack: 6, defense: 5, hp: 12, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Counter necklace. Set: Counter Strike (35% chance to counter), Parry Chance +15%' },
  { id: 'rp_f_ring1', name: 'Ring of Parry', slot: 'ring', attack: 4, defense: 3, hp: 8, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Parry ring. Set: Counter Strike (35% chance to counter), Parry Chance +15%' },
  { id: 'rp_f_ring2', name: 'Ring of Counter', slot: 'ring', attack: 5, defense: 4, hp: 6, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Riposte', description: 'Counter ring. Set: Counter Strike (35% chance to counter), Parry Chance +15%' },
  
  // Mage - 9 items
  { id: 'rp_m_armor', name: 'Reflect Robe', slot: 'armor', attack: 6, defense: 10, hp: 18, mp: 30, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Riposte', description: 'Spell reflect robe. Set: Spell Reflect (35% chance to reflect), Magic Defense +15%' },
  { id: 'rp_m_helm', name: 'Mirror Cowl', slot: 'helmet', attack: 3, defense: 6, hp: 12, mp: 20, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Riposte', description: 'Reflect hood. Set: Spell Reflect (35% chance to reflect), Magic Defense +15%' },
  { id: 'rp_m_weapon', name: 'Reflect Staff', slot: 'weapon', attack: 10, defense: 12, hp: 15, mp: 35, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Riposte', description: 'Magic reflect staff. Set: Spell Reflect (35% chance to reflect), Magic Defense +15%' },
  { id: 'rp_m_gloves', name: 'Reflect Gloves', slot: 'gloves', attack: 4, defense: 5, hp: 10, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Riposte', description: 'Reflect gloves. Set: Spell Reflect (35% chance to reflect), Magic Defense +15%' },
  { id: 'rp_m_boots', name: 'Mirror Boots', slot: 'boots', attack: 2, defense: 4, hp: 8, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Riposte', description: 'Reflect boots. Set: Spell Reflect (35% chance to reflect), Magic Defense +15%' },
  { id: 'rp_m_necklace', name: 'Reflect Amulet', slot: 'necklace', attack: 5, defense: 8, hp: 11, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Riposte', description: 'Reflect amulet. Set: Spell Reflect (35% chance to reflect), Magic Defense +15%' },
  { id: 'rp_m_relic', name: 'Mirror Relic', slot: 'relic', attack: 6, defense: 10, hp: 10, mp: 25, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Riposte', description: 'Reflect relic. Set: Spell Reflect (35% chance to reflect), Magic Defense +15%' },
  { id: 'rp_m_ring1', name: 'Ring of Reflection', slot: 'ring', attack: 3, defense: 4, hp: 7, mp: 12, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Riposte', description: 'Reflect ring. Set: Spell Reflect (35% chance to reflect), Magic Defense +15%' },
  { id: 'rp_m_ring2', name: 'Ring of Mirror', slot: 'ring', attack: 4, defense: 5, hp: 6, mp: 15, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Riposte', description: 'Mirror ring. Set: Spell Reflect (35% chance to reflect), Magic Defense +15%' },
  
  // Monk - 9 items
  { id: 'rp_k_armor', name: 'Reversal Mantle', slot: 'armor', attack: 12, defense: 10, hp: 20, mp: 12, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Riposte', description: 'Redirect armor. Set: Reversal (35% chance to redirect), Parry Chance +15%' },
  { id: 'rp_k_helm', name: 'Redirect Headband', slot: 'helmet', attack: 5, defense: 6, hp: 12, mp: 8, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Riposte', description: 'Redirect helm. Set: Reversal (35% chance to redirect), Parry Chance +15%' },
  { id: 'rp_k_weapon', name: 'Reversal Chakram', slot: 'weapon', attack: 20, defense: 6, hp: 16, mp: 10, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Riposte', description: 'Redirect weapon. Set: Reversal (35% chance to redirect), Parry Chance +15%' },
  { id: 'rp_k_gloves', name: 'Redirect Gauntlets', slot: 'gloves', attack: 8, defense: 5, hp: 11, mp: 8, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Riposte', description: 'Redirect gloves. Set: Reversal (35% chance to redirect), Parry Chance +15%' },
  { id: 'rp_k_boots', name: 'Reversal Boots', slot: 'boots', attack: 5, defense: 4, hp: 9, mp: 6, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Riposte', description: 'Redirect boots. Set: Reversal (35% chance to redirect), Parry Chance +15%' },
  { id: 'rp_k_necklace', name: 'Redirect Circlet', slot: 'necklace', attack: 7, defense: 5, hp: 10, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Riposte', description: 'Redirect necklace. Set: Reversal (35% chance to redirect), Parry Chance +15%' },
  { id: 'rp_k_offhand', name: 'Reversal Claw', slot: 'offhand', attack: 10, defense: 4, hp: 9, mp: 6, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Riposte', description: 'Redirect off-hand. Set: Reversal (35% chance to redirect), Parry Chance +15%' },
  { id: 'rp_k_ring1', name: 'Ring of Redirect', slot: 'ring', attack: 5, defense: 3, hp: 7, mp: 8, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Riposte', description: 'Redirect ring. Set: Reversal (35% chance to redirect), Parry Chance +15%' },
  { id: 'rp_k_ring2', name: 'Ring of Reversal', slot: 'ring', attack: 6, defense: 4, hp: 6, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Riposte', description: 'Reversal ring. Set: Reversal (35% chance to redirect), Parry Chance +15%' },

  // ========== SET 6: FROZEN WASTELAND (Ice/Control) ==========
  // Fighter - 9 items
  { id: 'fw_f_armor', name: 'Frost Plate', slot: 'armor', attack: 12, defense: 10, hp: 22, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Frozen Wasteland', description: 'Ice armor. Set: Frost Strike (50% Ice damage), Slow on Hit 30%' },
  { id: 'fw_f_helm', name: 'Glacial Helm', slot: 'helmet', attack: 6, defense: 6, hp: 12, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Frozen Wasteland', description: 'Ice helm. Set: Frost Strike (50% Ice damage), Slow on Hit 30%' },
  { id: 'fw_f_weapon', name: 'Frost Blade', slot: 'weapon', attack: 26, defense: 4, hp: 16, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Frozen Wasteland', description: 'Ice sword. Set: Frost Strike (50% Ice damage), Slow on Hit 30%' },
  { id: 'fw_f_gloves', name: 'Glacial Gauntlets', slot: 'gloves', attack: 8, defense: 4, hp: 11, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Frozen Wasteland', description: 'Ice gloves. Set: Frost Strike (50% Ice damage), Slow on Hit 30%' },
  { id: 'fw_f_shield', name: 'Ice Shield', slot: 'shield', attack: 6, defense: 12, hp: 18, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Frozen Wasteland', description: 'Ice shield. Set: Frost Strike (50% Ice damage), Slow on Hit 30%' },
  { id: 'fw_f_boots', name: 'Frozen Boots', slot: 'boots', attack: 4, defense: 3, hp: 9, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Frozen Wasteland', description: 'Ice trail boots. Set: Frost Strike (50% Ice damage), Slow on Hit 30%' },
  { id: 'fw_f_necklace', name: 'Frost Pendant', slot: 'necklace', attack: 7, defense: 3, hp: 11, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Frozen Wasteland', description: 'Ice necklace. Set: Frost Strike (50% Ice damage), Slow on Hit 30%' },
  { id: 'fw_f_ring1', name: 'Ring of Frost', slot: 'ring', attack: 4, defense: 2, hp: 7, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Frozen Wasteland', description: 'Frost ring. Set: Frost Strike (50% Ice damage), Slow on Hit 30%' },
  { id: 'fw_f_ring2', name: 'Ring of Ice', slot: 'ring', attack: 5, defense: 2, hp: 6, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Frozen Wasteland', description: 'Ice ring. Set: Frost Strike (50% Ice damage), Slow on Hit 30%' },
  
  // Mage - 9 items
  { id: 'fw_m_armor', name: 'Frostwoven Robe', slot: 'armor', attack: 9, defense: 8, hp: 18, mp: 45, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Ice robe. Set: Permafrost (50% Ice damage), Ice Damage +25%' },
  { id: 'fw_m_helm', name: 'Glacial Cowl', slot: 'helmet', attack: 4, defense: 5, hp: 12, mp: 30, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Ice hood. Set: Permafrost (50% Ice damage), Ice Damage +25%' },
  { id: 'fw_m_weapon', name: 'Glacial Staff', slot: 'weapon', attack: 13, defense: 3, hp: 14, mp: 50, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Ice staff. Set: Permafrost (50% Ice damage), Ice Damage +25%' },
  { id: 'fw_m_gloves', name: 'Frost Gloves', slot: 'gloves', attack: 5, defense: 3, hp: 10, mp: 20, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Ice gloves. Set: Permafrost (50% Ice damage), Ice Damage +25%' },
  { id: 'fw_m_boots', name: 'Icewalker Boots', slot: 'boots', attack: 3, defense: 2, hp: 8, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Ice boots. Set: Permafrost (50% Ice damage), Ice Damage +25%' },
  { id: 'fw_m_necklace', name: 'Permafrost Amulet', slot: 'necklace', attack: 6, defense: 4, hp: 11, mp: 20, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Ice amulet. Set: Permafrost (50% Ice damage), Ice Damage +25%' },
  { id: 'fw_m_relic', name: 'Frozen Relic', slot: 'relic', attack: 7, defense: 5, hp: 10, mp: 35, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Ice relic. Set: Permafrost (50% Ice damage), Ice Damage +25%' },
  { id: 'fw_m_ring1', name: 'Ring of Permafrost', slot: 'ring', attack: 4, defense: 2, hp: 7, mp: 15, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Permafrost ring. Set: Permafrost (50% Ice damage), Ice Damage +25%' },
  { id: 'fw_m_ring2', name: 'Ring of Shatter', slot: 'ring', attack: 5, defense: 3, hp: 6, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Frozen Wasteland', description: 'Shatter ring. Set: Permafrost (50% Ice damage), Shatter explosions deal 15% max HP' },
  
  // Monk - 9 items
  { id: 'fw_k_armor', name: 'Frozen Mantle', slot: 'armor', attack: 13, defense: 8, hp: 19, mp: 15, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Frozen Wasteland', description: 'Ice armor. Set: Icicle Strike (Ice damage), Chill on Hit' },
  { id: 'fw_k_helm', name: 'Frost Headband', slot: 'helmet', attack: 6, defense: 4, hp: 11, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Frozen Wasteland', description: 'Ice helm. Set: Icicle Strike (Ice damage), Chill on Hit' },
  { id: 'fw_k_weapon', name: 'Ice Chakram', slot: 'weapon', attack: 22, defense: 2, hp: 15, mp: 12, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Frozen Wasteland', description: 'Ice weapon. Set: Icicle Strike (Ice damage), Chill on Hit' },
  { id: 'fw_k_gloves', name: 'Frost Gauntlets', slot: 'gloves', attack: 9, defense: 4, hp: 12, mp: 10, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Frozen Wasteland', description: 'Ice gloves. Set: Icicle Strike (Ice damage), Chill on Hit' },
  { id: 'fw_k_boots', name: 'Icy Boots', slot: 'boots', attack: 5, defense: 3, hp: 9, mp: 8, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Frozen Wasteland', description: 'Ice trail boots. Set: Icicle Strike (Ice damage), Chill on Hit' },
  { id: 'fw_k_necklace', name: 'Frozen Circlet', slot: 'necklace', attack: 8, defense: 3, hp: 11, mp: 18, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Frozen Wasteland', description: 'Ice necklace. Set: Icicle Strike (Ice damage), Chill on Hit' },
  { id: 'fw_k_offhand', name: 'Ice Claw', slot: 'offhand', attack: 11, defense: 2, hp: 10, mp: 8, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Frozen Wasteland', description: 'Ice off-hand. Set: Icicle Strike (Ice damage), Chill on Hit' },
  { id: 'fw_k_ring1', name: 'Ring of Chill', slot: 'ring', attack: 5, defense: 2, hp: 7, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Frozen Wasteland', description: 'Chill ring. Set: Icicle Strike (Ice damage), Chill on Hit' },
  { id: 'fw_k_ring2', name: 'Ring of Freeze', slot: 'ring', attack: 6, defense: 2, hp: 6, mp: 12, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Frozen Wasteland', description: 'Freeze ring. Set: Icicle Strike (Ice damage), Chill on Hit' },

  // ========== SET 7: INFERNO BLAZE (Fire/Burn) ==========
  // Fighter - 9 items
  { id: 'ib_f_armor', name: 'Inferno Plate', slot: 'armor', attack: 13, defense: 9, hp: 21, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Inferno Blaze', description: 'Fire armor. Set: Fiery Strike (50% Fire damage), Burn on Hit 3%' },
  { id: 'ib_f_helm', name: 'Blaze Helm', slot: 'helmet', attack: 6, defense: 5, hp: 11, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Inferno Blaze', description: 'Fire helm. Set: Fiery Strike (50% Fire damage), Burn on Hit 3%' },
  { id: 'ib_f_weapon', name: 'Inferno Blade', slot: 'weapon', attack: 27, defense: 3, hp: 17, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Inferno Blaze', description: 'Fire sword. Set: Fiery Strike (50% Fire damage), Burn on Hit 3%' },
  { id: 'ib_f_gloves', name: 'Blazing Gauntlets', slot: 'gloves', attack: 9, defense: 3, hp: 12, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Inferno Blaze', description: 'Fire gloves. Set: Fiery Strike (50% Fire damage), Burn on Hit 3%' },
  { id: 'ib_f_shield', name: 'Flame Shield', slot: 'shield', attack: 7, defense: 11, hp: 19, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Inferno Blaze', description: 'Fire shield. Set: Fiery Strike (50% Fire damage), Burn on Hit 3%' },
  { id: 'ib_f_boots', name: 'Blazing Boots', slot: 'boots', attack: 5, defense: 2, hp: 10, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Inferno Blaze', description: 'Fire trail boots. Set: Fiery Strike (50% Fire damage), Burn on Hit 3%' },
  { id: 'ib_f_necklace', name: 'Inferno Pendant', slot: 'necklace', attack: 8, defense: 2, hp: 12, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Inferno Blaze', description: 'Fire necklace. Set: Fiery Strike (50% Fire damage), Burn on Hit 3%' },
  { id: 'ib_f_ring1', name: 'Ring of Flame', slot: 'ring', attack: 5, defense: 1, hp: 8, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Inferno Blaze', description: 'Flame ring. Set: Fiery Strike (50% Fire damage), Burn on Hit 3%' },
  { id: 'ib_f_ring2', name: 'Ring of Combustion', slot: 'ring', attack: 6, defense: 1, hp: 7, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Inferno Blaze', description: 'Combustion ring. Set: Fiery Strike (50% Fire damage), Burn explosions deal 15% max HP' },
  
  // Mage - 9 items
  { id: 'ib_m_armor', name: 'Pyromancer Robe', slot: 'armor', attack: 12, defense: 6, hp: 16, mp: 40, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Fire robe. Set: Inferno (50% Fire damage), Fire Damage +25%' },
  { id: 'ib_m_helm', name: 'Blaze Cowl', slot: 'helmet', attack: 5, defense: 4, hp: 10, mp: 25, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Fire hood. Set: Inferno (50% Fire damage), Fire Damage +25%' },
  { id: 'ib_m_weapon', name: 'Inferno Staff', slot: 'weapon', attack: 15, defense: 2, hp: 12, mp: 45, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Fire staff. Set: Inferno (50% Fire damage), Fire Damage +25%' },
  { id: 'ib_m_gloves', name: 'Pyromancer Gloves', slot: 'gloves', attack: 6, defense: 2, hp: 8, mp: 18, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Fire gloves. Set: Inferno (50% Fire damage), Fire Damage +25%' },
  { id: 'ib_m_boots', name: 'Blazewalker Boots', slot: 'boots', attack: 4, defense: 1, hp: 7, mp: 12, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Fire boots. Set: Inferno (50% Fire damage), Fire Damage +25%' },
  { id: 'ib_m_necklace', name: 'Inferno Amulet', slot: 'necklace', attack: 7, defense: 2, hp: 9, mp: 18, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Fire amulet. Set: Inferno (50% Fire damage), Fire Damage +25%' },
  { id: 'ib_m_relic', name: 'Blaze Relic', slot: 'relic', attack: 8, defense: 3, hp: 8, mp: 30, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Fire relic. Set: Inferno (50% Fire damage), Fire Damage +25%' },
  { id: 'ib_m_ring1', name: 'Ring of Inferno', slot: 'ring', attack: 5, defense: 1, hp: 6, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Inferno ring. Set: Inferno (50% Fire damage), Fire Damage +25%' },
  { id: 'ib_m_ring2', name: 'Ring of Blaze', slot: 'ring', attack: 6, defense: 1, hp: 5, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Inferno Blaze', description: 'Blaze ring. Set: Inferno (50% Fire damage), Fire explosions deal 15% max HP' },
  
  // Monk - 9 items
  { id: 'ib_k_armor', name: 'Blaze Dancer Mantle', slot: 'armor', attack: 14, defense: 7, hp: 18, mp: 14, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Inferno Blaze', description: 'Fire armor. Set: Flame Kick (Fire damage), Burn on Hit' },
  { id: 'ib_k_helm', name: 'Blaze Headband', slot: 'helmet', attack: 6, defense: 3, hp: 10, mp: 9, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Inferno Blaze', description: 'Fire helm. Set: Flame Kick (Fire damage), Burn on Hit' },
  { id: 'ib_k_weapon', name: 'Flame Chakram', slot: 'weapon', attack: 23, defense: 1, hp: 14, mp: 11, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: 'Inferno Blaze', description: 'Fire weapon. Set: Flame Kick (Fire damage), Burn on Hit' },
  { id: 'ib_k_gloves', name: 'Blaze Gauntlets', slot: 'gloves', attack: 9, defense: 3, hp: 11, mp: 9, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Inferno Blaze', description: 'Fire gloves. Set: Flame Kick (Fire damage), Burn on Hit' },
  { id: 'ib_k_boots', name: 'Flame Boots', slot: 'boots', attack: 6, defense: 2, hp: 9, mp: 7, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: 'Inferno Blaze', description: 'Fire trail boots. Set: Flame Kick (Fire damage), Burn on Hit' },
  { id: 'ib_k_necklace', name: 'Blaze Circlet', slot: 'necklace', attack: 8, defense: 2, hp: 10, mp: 17, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Inferno Blaze', description: 'Fire necklace. Set: Flame Kick (Fire damage), Burn on Hit' },
  { id: 'ib_k_offhand', name: 'Flame Claw', slot: 'offhand', attack: 11, defense: 1, hp: 9, mp: 7, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Inferno Blaze', description: 'Fire off-hand. Set: Flame Kick (Fire damage), Burn on Hit' },
  { id: 'ib_k_ring1', name: 'Ring of Burn', slot: 'ring', attack: 5, defense: 1, hp: 7, mp: 9, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Inferno Blaze', description: 'Burn ring. Set: Flame Kick (Fire damage), Burn on Hit' },
  { id: 'ib_k_ring2', name: 'Ring of Ignition', slot: 'ring', attack: 6, defense: 1, hp: 6, mp: 11, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Inferno Blaze', description: 'Ignition ring. Set: Flame Kick (Fire damage), Burn explosions deal 15% max HP' },

  // ========== SET 8: STORM CALLER (Lightning/Chain) ==========
  // Fighter - 9 items
  { id: 'sc_f_armor', name: 'Storm Plate', slot: 'armor', attack: 11, defense: 9, hp: 20, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Storm Caller', description: 'Lightning armor. Set: Thunder Strike (50% Lightning), Chain to 2 enemies' },
  { id: 'sc_f_helm', name: 'Storm Helm', slot: 'helmet', attack: 5, defense: 5, hp: 11, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Storm Caller', description: 'Lightning helm. Set: Thunder Strike (50% Lightning), Chain to 2 enemies' },
  { id: 'sc_f_weapon', name: 'Storm Blade', slot: 'weapon', attack: 25, defense: 3, hp: 16, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Storm Caller', description: 'Lightning sword. Set: Thunder Strike (50% Lightning), Chain to 2 enemies' },
  { id: 'sc_f_gloves', name: 'Storm Gauntlets', slot: 'gloves', attack: 8, defense: 3, hp: 11, mp: 0, speed: 2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Storm Caller', description: 'Lightning gloves. Set: Thunder Strike (50% Lightning), Chain to 2 enemies' },
  { id: 'sc_f_shield', name: 'Storm Shield', slot: 'shield', attack: 6, defense: 10, hp: 18, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Storm Caller', description: 'Lightning shield. Set: Thunder Strike (50% Lightning), Chain to 2 enemies' },
  { id: 'sc_f_boots', name: 'Storm Boots', slot: 'boots', attack: 4, defense: 2, hp: 9, mp: 0, speed: 3, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Storm Caller', description: 'Lightning boots. Set: Thunder Strike (50% Lightning), Chain to 2 enemies' },
  { id: 'sc_f_necklace', name: 'Storm Pendant', slot: 'necklace', attack: 7, defense: 2, hp: 11, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Storm Caller', description: 'Lightning necklace. Set: Thunder Strike (50% Lightning), Chain to 2 enemies' },
  { id: 'sc_f_ring1', name: 'Ring of Lightning', slot: 'ring', attack: 4, defense: 1, hp: 7, mp: 0, speed: 1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Storm Caller', description: 'Lightning ring. Set: Thunder Strike (50% Lightning), Chain to 2 enemies' },
  { id: 'sc_f_ring2', name: 'Ring of Thunder', slot: 'ring', attack: 5, defense: 1, hp: 6, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Storm Caller', description: 'Thunder ring. Set: Thunder Strike (50% Lightning), Chain explosions deal 15% max HP' },
  
  // Mage - 9 items
  { id: 'sc_m_armor', name: 'Stormcaller Robe', slot: 'armor', attack: 11, defense: 5, hp: 15, mp: 50, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Lightning robe. Set: Chain Lightning (50% Lightning), Lightning Damage +25%' },
  { id: 'sc_m_helm', name: 'Storm Cowl', slot: 'helmet', attack: 4, defense: 3, hp: 10, mp: 30, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Lightning hood. Set: Chain Lightning (50% Lightning), Lightning Damage +25%' },
  { id: 'sc_m_weapon', name: 'Storm Staff', slot: 'weapon', attack: 14, defense: 1, hp: 12, mp: 55, speed: 3, rarity: 'epic', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Lightning staff. Set: Chain Lightning (50% Lightning), Lightning Damage +25%' },
  { id: 'sc_m_gloves', name: 'Stormcaller Gloves', slot: 'gloves', attack: 5, defense: 2, hp: 8, mp: 20, speed: 2, rarity: 'epic', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Lightning gloves. Set: Chain Lightning (50% Lightning), Lightning Damage +25%' },
  { id: 'sc_m_boots', name: 'Stormwalker Boots', slot: 'boots', attack: 3, defense: 1, hp: 7, mp: 15, speed: 4, rarity: 'epic', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Lightning boots. Set: Chain Lightning (50% Lightning), Lightning Damage +25%' },
  { id: 'sc_m_necklace', name: 'Storm Amulet', slot: 'necklace', attack: 6, defense: 2, hp: 9, mp: 20, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Lightning amulet. Set: Chain Lightning (50% Lightning), Lightning Damage +25%' },
  { id: 'sc_m_relic', name: 'Storm Relic', slot: 'relic', attack: 7, defense: 3, hp: 8, mp: 40, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Lightning relic. Set: Chain Lightning (50% Lightning), Lightning Damage +25%' },
  { id: 'sc_m_ring1', name: 'Ring of Chain', slot: 'ring', attack: 4, defense: 1, hp: 6, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Chain ring. Set: Chain Lightning (50% Lightning), Lightning Damage +25%' },
  { id: 'sc_m_ring2', name: 'Ring of Storm', slot: 'ring', attack: 5, defense: 1, hp: 5, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Storm Caller', description: 'Storm ring. Set: Chain Lightning (50% Lightning), Thunderclap explosions deal 15% max HP' },
  
  // Monk - 9 items
  { id: 'sc_k_armor', name: 'Storm Dancer Mantle', slot: 'armor', attack: 13, defense: 6, hp: 17, mp: 16, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: 'Storm Caller', description: 'Lightning armor. Set: Lightning Kick (Lightning damage), Chain on Hit' },
  { id: 'sc_k_helm', name: 'Storm Headband', slot: 'helmet', attack: 5, defense: 3, hp: 10, mp: 11, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Storm Caller', description: 'Lightning helm. Set: Lightning Kick (Lightning damage), Chain on Hit' },
  { id: 'sc_k_weapon', name: 'Lightning Chakram', slot: 'weapon', attack: 21, defense: 1, hp: 13, mp: 13, speed: 5, rarity: 'epic', allowedJobs: ['Monk'], set: 'Storm Caller', description: 'Lightning weapon. Set: Lightning Kick (Lightning damage), Chain on Hit' },
  { id: 'sc_k_gloves', name: 'Storm Gauntlets', slot: 'gloves', attack: 8, defense: 3, hp: 10, mp: 11, speed: 3, rarity: 'epic', allowedJobs: ['Monk'], set: 'Storm Caller', description: 'Lightning gloves. Set: Lightning Kick (Lightning damage), Chain on Hit' },
  { id: 'sc_k_boots', name: 'Lightning Boots', slot: 'boots', attack: 5, defense: 2, hp: 8, mp: 9, speed: 6, rarity: 'epic', allowedJobs: ['Monk'], set: 'Storm Caller', description: 'Lightning boots. Set: Lightning Kick (Lightning damage), Chain on Hit' },
  { id: 'sc_k_necklace', name: 'Storm Circlet', slot: 'necklace', attack: 7, defense: 2, hp: 9, mp: 19, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Storm Caller', description: 'Lightning necklace. Set: Lightning Kick (Lightning damage), Chain on Hit' },
  { id: 'sc_k_offhand', name: 'Lightning Claw', slot: 'offhand', attack: 10, defense: 1, hp: 8, mp: 9, speed: 4, rarity: 'epic', allowedJobs: ['Monk'], set: 'Storm Caller', description: 'Lightning off-hand. Set: Lightning Kick (Lightning damage), Chain on Hit' },
  { id: 'sc_k_ring1', name: 'Ring of Shock', slot: 'ring', attack: 5, defense: 1, hp: 6, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Storm Caller', description: 'Shock ring. Set: Lightning Kick (Lightning damage), Chain on Hit' },
  { id: 'sc_k_ring2', name: 'Ring of Static', slot: 'ring', attack: 6, defense: 1, hp: 5, mp: 12, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Storm Caller', description: 'Static ring. Set: Lightning Kick (Lightning damage), Chain explosions deal 15% max HP' },

  // ========== SET 9: EARTHEN COLOSSUS (Earth/Defense) ==========
  // Fighter - 9 items
  { id: 'ec_f_armor', name: 'Stoneform Plate', slot: 'armor', attack: 14, defense: 20, hp: 35, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Earthen Colossus', description: 'Earth armor. Set: Earthen Might (50% Earth damage), Defense +15%' },
  { id: 'ec_f_helm', name: 'Stone Helm', slot: 'helmet', attack: 6, defense: 12, hp: 22, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Earthen Colossus', description: 'Earth helm. Set: Earthen Might (50% Earth damage), Defense +15%' },
  { id: 'ec_f_weapon', name: 'Earth Blade', slot: 'weapon', attack: 28, defense: 10, hp: 25, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Earthen Colossus', description: 'Earth sword. Set: Earthen Might (50% Earth damage), Defense +15%' },
  { id: 'ec_f_gloves', name: 'Stone Gauntlets', slot: 'gloves', attack: 9, defense: 8, hp: 18, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Earthen Colossus', description: 'Earth gloves. Set: Earthen Might (50% Earth damage), Defense +15%' },
  { id: 'ec_f_shield', name: 'Earth Shield', slot: 'shield', attack: 7, defense: 22, hp: 30, mp: 0, speed: -2, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Earthen Colossus', description: 'Earth shield. Set: Earthen Might (50% Earth damage), Defense +15%' },
  { id: 'ec_f_boots', name: 'Stone Boots', slot: 'boots', attack: 5, defense: 6, hp: 15, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Earthen Colossus', description: 'Earth boots. Set: Earthen Might (50% Earth damage), Defense +15%' },
  { id: 'ec_f_necklace', name: 'Earth Pendant', slot: 'necklace', attack: 8, defense: 10, hp: 20, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Earthen Colossus', description: 'Earth necklace. Set: Earthen Might (50% Earth damage), Defense +15%' },
  { id: 'ec_f_ring1', name: 'Ring of Stone', slot: 'ring', attack: 5, defense: 5, hp: 12, mp: 0, speed: 0, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Earthen Colossus', description: 'Stone ring. Set: Earthen Might (50% Earth damage), Defense +15%' },
  { id: 'ec_f_ring2', name: 'Ring of Earth', slot: 'ring', attack: 6, defense: 6, hp: 10, mp: 0, speed: -1, rarity: 'epic', allowedJobs: ['Fighter'], set: 'Earthen Colossus', description: 'Earth ring. Set: Earthen Might (50% Earth damage), Earthquake explosions deal 15% max HP' },
  
  // Mage - 9 items
  { id: 'ec_m_armor', name: 'Geomancer Robe', slot: 'armor', attack: 10, defense: 15, hp: 25, mp: 35, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Earthen Colossus', description: 'Earth robe. Set: Seismic Spell (50% Earth damage), Earth Damage +25%' },
  { id: 'ec_m_helm', name: 'Earth Cowl', slot: 'helmet', attack: 4, defense: 10, hp: 16, mp: 25, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Earthen Colossus', description: 'Earth hood. Set: Seismic Spell (50% Earth damage), Earth Damage +25%' },
  { id: 'ec_m_weapon', name: 'Earth Staff', slot: 'weapon', attack: 12, defense: 12, hp: 20, mp: 40, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Earthen Colossus', description: 'Earth staff. Set: Seismic Spell (50% Earth damage), Earth Damage +25%' },
  { id: 'ec_m_gloves', name: 'Geomancer Gloves', slot: 'gloves', attack: 5, defense: 8, hp: 12, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Earthen Colossus', description: 'Earth gloves. Set: Seismic Spell (50% Earth damage), Earth Damage +25%' },
  { id: 'ec_m_boots', name: 'Earthwalker Boots', slot: 'boots', attack: 3, defense: 6, hp: 10, mp: 12, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Earthen Colossus', description: 'Earth boots. Set: Seismic Spell (50% Earth damage), Earth Damage +25%' },
  { id: 'ec_m_necklace', name: 'Earth Amulet', slot: 'necklace', attack: 6, defense: 12, hp: 15, mp: 20, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Earthen Colossus', description: 'Earth amulet. Set: Seismic Spell (50% Earth damage), Earth Damage +25%' },
  { id: 'ec_m_relic', name: 'Earth Relic', slot: 'relic', attack: 7, defense: 15, hp: 13, mp: 30, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Earthen Colossus', description: 'Earth relic. Set: Seismic Spell (50% Earth damage), Earth Damage +25%' },
  { id: 'ec_m_ring1', name: 'Ring of Seismic', slot: 'ring', attack: 4, defense: 6, hp: 9, mp: 15, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Earthen Colossus', description: 'Seismic ring. Set: Seismic Spell (50% Earth damage), Earth Damage +25%' },
  { id: 'ec_m_ring2', name: 'Ring of Tremor', slot: 'ring', attack: 5, defense: 8, hp: 8, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Mage'], set: 'Earthen Colossus', description: 'Tremor ring. Set: Seismic Spell (50% Earth damage), Earthquake explosions deal 15% max HP' },
  
  // Monk - 9 items
  { id: 'ec_k_armor', name: 'Earth Dancer Mantle', slot: 'armor', attack: 15, defense: 18, hp: 28, mp: 15, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Earth armor. Set: Stone Fist (Earth damage), Knock-up on Crit' },
  { id: 'ec_k_helm', name: 'Earth Headband', slot: 'helmet', attack: 6, defense: 10, hp: 18, mp: 10, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Earth helm. Set: Stone Fist (Earth damage), Knock-up on Crit' },
  { id: 'ec_k_weapon', name: 'Earth Chakram', slot: 'weapon', attack: 24, defense: 8, hp: 20, mp: 12, speed: 2, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Earth weapon. Set: Stone Fist (Earth damage), Knock-up on Crit' },
  { id: 'ec_k_gloves', name: 'Stone Gauntlets', slot: 'gloves', attack: 10, defense: 8, hp: 15, mp: 10, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Earth gloves. Set: Stone Fist (Earth damage), Knock-up on Crit' },
  { id: 'ec_k_boots', name: 'Stone Boots', slot: 'boots', attack: 6, defense: 6, hp: 12, mp: 8, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Earth boots. Set: Stone Fist (Earth damage), Knock-up on Crit' },
  { id: 'ec_k_necklace', name: 'Earth Circlet', slot: 'necklace', attack: 8, defense: 10, hp: 16, mp: 18, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Earth necklace. Set: Stone Fist (Earth damage), Knock-up on Crit' },
  { id: 'ec_k_offhand', name: 'Stone Claw', slot: 'offhand', attack: 12, defense: 6, hp: 14, mp: 8, speed: 1, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Earth off-hand. Set: Stone Fist (Earth damage), Knock-up on Crit' },
  { id: 'ec_k_ring1', name: 'Ring of Rock', slot: 'ring', attack: 6, defense: 5, hp: 10, mp: 10, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Rock ring. Set: Stone Fist (Earth damage), Knock-up on Crit' },
  { id: 'ec_k_ring2', name: 'Ring of Mountain', slot: 'ring', attack: 7, defense: 6, hp: 9, mp: 12, speed: 0, rarity: 'epic', allowedJobs: ['Monk'], set: 'Earthen Colossus', description: 'Mountain ring. Set: Stone Fist (Earth damage), Earthquake explosions deal 15% max HP' }
];

// ========== TYPE DEFINITION ==========
export interface EquipmentItem {
  id: string;
  name: string;
  slot: 'armor' | 'helmet' | 'weapon' | 'gloves' | 'shield' | 'boots' | 'necklace' | 'ring' | 'relic' | 'offhand';
  attack: number;
  defense: number;
  hp: number;
  mp: number;
  speed: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  allowedJobs: ('Fighter' | 'Mage' | 'Monk')[];
  set: 'Blade Dancer' | 'Bulwark Sentinel' | 'Vampiric Embrace' | 'Wind Dancer' | 'Riposte' | 'Frozen Wasteland' | 'Inferno Blaze' | 'Storm Caller' | 'Earthen Colossus';
  description: string;
}

// ========== EXPORT TOTAL COUNT ==========
export const TOTAL_ITEMS = COMPLETE_EQUIPMENT_DATABASE.length; // 243 items

// ========== HELPER FUNCTIONS ==========
export function getItemsBySet(setName: string): EquipmentItem[] {
  return COMPLETE_EQUIPMENT_DATABASE.filter(item => item.set === setName);
}

export function getItemsByJob(job: 'Fighter' | 'Mage' | 'Monk'): EquipmentItem[] {
  return COMPLETE_EQUIPMENT_DATABASE.filter(item => item.allowedJobs.includes(job));
}

export function getItemById(id: string): EquipmentItem | undefined {
  return COMPLETE_EQUIPMENT_DATABASE.find(item => item.id === id);
}