export const JOB_ABILITIES: Record<string, Ability[]> = {
  Fighter: [
    { id: 'attack', name: 'Attack', mpCost: 0, type: 'attack', power: 1.0, description: 'Basic attack' },
    { id: 'power_strike', name: 'Power Strike', mpCost: 0, type: 'attack', power: 2.0, description: 'Powerful attack (2x damage)' },
    { id: 'defend', name: 'Defend', mpCost: 0, type: 'buff', power: 0.5, description: 'Reduce incoming damage' },
    { id: 'provoke', name: 'Provoke', mpCost: 4, type: 'buff', power: 0, description: 'Force single enemy to attack you, reduces their attack by 2 for 2 turns' },
  ],
  Mage: [
    { id: 'attack', name: 'Attack', mpCost: 0, type: 'attack', power: 1.0, description: 'Basic attack' },
    { id: 'fireball', name: 'Fireball', mpCost: 8, type: 'attack', power: 3.0, description: 'Powerful fire spell (3x damage)' },
    { id: 'heal', name: 'Heal', mpCost: 6, type: 'heal', power: 25, description: 'Restore 25 HP to a party member' },
    { id: 'ice_shard', name: 'Ice Shard', mpCost: 10, type: 'attack', power: 2.2, description: 'Ice damage, may freeze enemy (skip turn)' },
  ],
  Monk: [
    { id: 'attack', name: 'Attack', mpCost: 0, type: 'attack', power: 1.0, description: 'Basic attack' },
    { id: 'chi_strike', name: 'Chi Strike', mpCost: 4, type: 'attack', power: 1.8, description: 'Focused strike (1.8x damage)' },
    { id: 'meditate', name: 'Meditate', mpCost: 0, type: 'buff', power: 15, description: 'Restore 15 HP + next attack deals 50% more damage' },
    { id: 'stealth', name: 'Stealth', mpCost: 8, type: 'buff', power: 0.2, description: 'Enter stealth mode: 20% chance to dodge all attacks for the entire battle' },
  ],
};