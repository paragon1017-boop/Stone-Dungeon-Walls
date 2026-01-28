import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGameState, useSaveGame } from "@/hooks/use-game";
import { DungeonView } from "@/components/DungeonView";
import dungeonWallBg from "@assets/Gemini_Generated_Image_8w52n78w52n78w52_1769494784513.png";
import { TransparentMonster } from "@/components/TransparentMonster";
import { RetroCard, RetroButton, StatBar } from "@/components/RetroUI";
import { 
  GameData, createInitialState, 
  NORTH, SOUTH, EAST, WEST, 
  getRandomMonster, Monster,
  xpForLevel, getLevelUpStats, Player,
  Ability, getAbilitiesForJob, getScaledAbilityPower,
  getEffectiveStats, Equipment, getRandomEquipmentDrop, canEquip,
  getEnhancedName, getEnhancedStats,
  TILE_FLOOR, TILE_WALL, TILE_DOOR, TILE_LADDER_DOWN, TILE_LADDER_UP,
  generateFloorMap,
  Potion, getRandomPotionDrop
} from "@/lib/game-engine";
import { useKey } from "react-use";
import { Loader2, Skull, Sword, User, LogOut, Save, RotateCw, RotateCcw, ArrowUp, ChevronDown, Backpack } from "lucide-react";

function formatEquipmentStats(item: Equipment): string {
  const stats = getEnhancedStats(item);
  const parts: string[] = [];
  if (stats.attack > 0) parts.push(`+${stats.attack} ATK`);
  if (stats.defense > 0) parts.push(`+${stats.defense} DEF`);
  if (stats.hp > 0) parts.push(`+${stats.hp} HP`);
  if (stats.mp > 0) parts.push(`+${stats.mp} MP`);
  return parts.join(' ');
}

export default function Game() {
  const { user, logout } = useAuth();
  const { data: serverState, isLoading } = useGameState();
  const saveMutation = useSaveGame();

  const [game, setGame] = useState<GameData | null>(null);
  const [logs, setLogs] = useState<string[]>(["Welcome to the dungeon..."]);
  const [combatState, setCombatState] = useState<{ 
    active: boolean, 
    monsters: Monster[],
    targetIndex: number,
    turn: number,
    currentCharIndex: number,
    turnOrder: number[],  // Party member indices sorted by speed (highest first)
    turnOrderPosition: number,  // Current position in turnOrder
    defending: boolean 
  }>({ active: false, monsters: [], targetIndex: 0, turn: 0, currentCharIndex: 0, turnOrder: [], turnOrderPosition: 0, defending: false });
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [selectedCharForEquip, setSelectedCharForEquip] = useState(0);
  const [selectedCharForStats, setSelectedCharForStats] = useState(0);
  const [selectedCharForPotion, setSelectedCharForPotion] = useState(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Restore focus after combat ends
  useEffect(() => {
    if (!combatState.active && gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  }, [combatState.active]);

  // Initialize game state from server or default
  useEffect(() => {
    if (!isLoading) {
      if (serverState && serverState.data) {
        // Migrate old saves that don't have equipment fields
        const loadedData = serverState.data as unknown as GameData;
        
        // Add equipment to party members if missing
        const migratedParty = loadedData.party.map(char => {
          if (!char.equipment) {
            return {
              ...char,
              equipment: { weapon: null, shield: null, armor: null, helmet: null, gloves: null, accessory: null }
            };
          }
          return char;
        });
        
        // Add equipmentInventory and potionInventory if missing
        const migratedData: GameData = {
          ...loadedData,
          party: migratedParty,
          equipmentInventory: loadedData.equipmentInventory || [],
          potionInventory: loadedData.potionInventory || [],
        };
        
        setGame(migratedData);
        log("Game loaded from server.");
      } else {
        setGame(createInitialState());
        log("New game started.");
      }
    }
  }, [serverState, isLoading]);

  const log = useCallback((msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  }, []);

  const move = useCallback((dx: number, dy: number) => {
    if (!game || combatState.active) return;
    
    const nx = game.x + dx;
    const ny = game.y + dy;

    // Check bounds
    if (ny < 0 || ny >= game.map.length || nx < 0 || nx >= game.map[0].length) {
      log("Blocked.");
      return;
    }

    const tile = game.map[ny][nx];
    // Wall/door collision (1 = wall, 2 = door) - can walk on floor, ladder down, ladder up
    if (tile === TILE_WALL || tile === TILE_DOOR) {
      log("Blocked.");
      return;
    }

    setGame(prev => prev ? ({ ...prev, x: nx, y: ny }) : null);

    // Check for ladder tiles and show prompt
    if (tile === TILE_LADDER_DOWN) {
      log("A ladder leading deeper! Press SPACE to descend.");
    } else if (tile === TILE_LADDER_UP && game.level > 1) {
      log("A ladder leading up! Press SPACE to climb.");
    }

    // Random Encounter Chance (10%) - not on ladder tiles
    if (tile === TILE_FLOOR && Math.random() < 0.1) {
      // Spawn 1-3 monsters, more likely to have multiple on deeper floors
      const baseCount = 1 + Math.floor(Math.random() * 2);
      const bonusMonsters = Math.floor(game.level / 2);
      const monsterCount = Math.min(4, baseCount + (Math.random() < 0.3 ? bonusMonsters : 0));
      const monsters: Monster[] = [];
      for (let i = 0; i < monsterCount; i++) {
        monsters.push(getRandomMonster(game.level));
      }
      
      // Calculate turn order based on speed (highest speed goes first)
      const partyWithSpeed = game.party
        .map((char, idx) => ({ idx, speed: char.hp > 0 ? getEffectiveStats(char).speed : -1 }))
        .filter(c => c.speed > 0)
        .sort((a, b) => b.speed - a.speed);
      const turnOrder = partyWithSpeed.map(c => c.idx);
      const firstCharIdx = turnOrder.length > 0 ? turnOrder[0] : 0;
      
      setCombatState({ 
        active: true, 
        monsters, 
        targetIndex: 0, 
        turn: 0, 
        currentCharIndex: firstCharIdx,
        turnOrder,
        turnOrderPosition: 0,
        defending: false 
      });
      if (monsterCount === 1) {
        log(`A wild ${monsters[0].name} appeared!`);
      } else {
        log(`${monsterCount} monsters appeared!`);
      }
    }
  }, [game, combatState.active, log]);

  // Ladder climbing function
  const useLadder = useCallback(() => {
    if (!game || combatState.active) return;
    
    const currentTile = game.map[game.y][game.x];
    
    if (currentTile === TILE_LADDER_DOWN) {
      // Descend to next floor
      const newFloor = game.level + 1;
      const { map, startX, startY } = generateFloorMap(newFloor);
      setGame(prev => prev ? ({
        ...prev,
        level: newFloor,
        map,
        x: startX,
        y: startY,
        dir: EAST
      }) : null);
      log(`Descended to Floor ${newFloor}. The dungeon grows darker...`);
    } else if (currentTile === TILE_LADDER_UP && game.level > 1) {
      // Ascend to previous floor
      const newFloor = game.level - 1;
      const { map, ladderDownX, ladderDownY } = generateFloorMap(newFloor);
      // When going up, spawn at the ladder down position of the floor above
      setGame(prev => prev ? ({
        ...prev,
        level: newFloor,
        map,
        x: ladderDownX,
        y: ladderDownY,
        dir: EAST
      }) : null);
      log(`Ascended to Floor ${newFloor}. The air feels lighter.`);
    }
  }, [game, combatState.active, log]);

  const rotate = useCallback((dir: 'left' | 'right') => {
    if (!game || combatState.active) return;
    setGame(prev => {
      if (!prev) return null;
      let newDir = prev.dir;
      if (dir === 'left') newDir = (prev.dir - 1 + 4) % 4 as any;
      if (dir === 'right') newDir = (prev.dir + 1) % 4 as any;
      return { ...prev, dir: newDir };
    });
  }, [game, combatState.active]);

  // Controls
  useKey('ArrowUp', () => {
    if (!game) return;
    if (game.dir === NORTH) move(0, -1);
    if (game.dir === SOUTH) move(0, 1);
    if (game.dir === EAST) move(1, 0);
    if (game.dir === WEST) move(-1, 0);
  }, {}, [game]);

  useKey('ArrowDown', () => {
    if (!game) return;
    // Walk backwards
    if (game.dir === NORTH) move(0, 1);
    if (game.dir === SOUTH) move(0, -1);
    if (game.dir === EAST) move(-1, 0);
    if (game.dir === WEST) move(1, 0);
  }, {}, [game]);

  useKey('ArrowLeft', () => rotate('left'), {}, [game]);
  useKey('ArrowRight', () => rotate('right'), {}, [game]);

  // WASD controls
  useKey('w', () => {
    if (!game) return;
    if (game.dir === NORTH) move(0, -1);
    if (game.dir === SOUTH) move(0, 1);
    if (game.dir === EAST) move(1, 0);
    if (game.dir === WEST) move(-1, 0);
  }, {}, [game]);

  useKey('s', () => {
    if (!game) return;
    if (game.dir === NORTH) move(0, 1);
    if (game.dir === SOUTH) move(0, -1);
    if (game.dir === EAST) move(-1, 0);
    if (game.dir === WEST) move(1, 0);
  }, {}, [game]);

  useKey('a', () => rotate('left'), {}, [game]);
  useKey('d', () => rotate('right'), {}, [game]);
  
  // Toggle mini map
  useKey('m', () => setShowMiniMap(prev => !prev), {}, []);
  
  // Out-of-combat Heal All skill (H key)
  const healAllParty = useCallback(() => {
    if (!game || combatState.active) return;
    
    // Find the mage in the party
    const mageIndex = game.party.findIndex(c => c.job === 'Mage' && c.hp > 0);
    if (mageIndex === -1) {
      log("No Mage available to cast Heal!");
      return;
    }
    
    const mage = game.party[mageIndex];
    const mpCost = 10; // MP cost for out-of-combat heal all
    
    if (mage.mp < mpCost) {
      log(`${mage.name} doesn't have enough MP! (${mpCost} required)`);
      return;
    }
    
    // Check if anyone needs healing
    const partyNeedsHealing = game.party.some(c => {
      const stats = getEffectiveStats(c);
      return c.hp > 0 && c.hp < stats.maxHp;
    });
    
    if (!partyNeedsHealing) {
      log("Everyone is already at full health!");
      return;
    }
    
    // Calculate heal amount based on mage level (base 20 + 5 per level)
    const baseHeal = 20 + (mage.level * 5);
    
    // Heal all party members
    let totalHealed = 0;
    const newParty = game.party.map(char => {
      if (char.hp <= 0) return char; // Can't heal dead characters
      
      const charStats = getEffectiveStats(char);
      const healAmount = Math.min(baseHeal, charStats.maxHp - char.hp);
      totalHealed += healAmount;
      
      return { ...char, hp: char.hp + healAmount };
    });
    
    // Deduct MP from mage
    newParty[mageIndex] = { ...newParty[mageIndex], mp: mage.mp - mpCost };
    
    setGame(prev => prev ? ({ ...prev, party: newParty }) : null);
    log(`${mage.name} casts Heal All! Party healed ${totalHealed} HP total!`);
  }, [game, combatState.active, log]);
  
  useKey('h', () => healAllParty(), {}, [healAllParty]);
  
  // Toggle equipment panel (E key) - handle both lowercase and uppercase
  useKey('e', () => {
    if (!combatState.active) {
      setShowEquipment(prev => !prev);
    }
  }, {}, [combatState.active]);
  useKey('E', () => {
    if (!combatState.active) {
      setShowEquipment(prev => !prev);
    }
  }, {}, [combatState.active]);
  
  // Toggle stats panel (C key for Character stats)
  useKey('c', () => {
    if (!combatState.active) {
      setShowStats(prev => !prev);
    }
  }, {}, [combatState.active]);
  useKey('C', () => {
    if (!combatState.active) {
      setShowStats(prev => !prev);
    }
  }, {}, [combatState.active]);
  
  // Toggle inventory panel (I key)
  useKey('i', () => {
    if (!combatState.active) {
      setShowInventory(prev => !prev);
    }
  }, {}, [combatState.active]);
  useKey('I', () => {
    if (!combatState.active) {
      setShowInventory(prev => !prev);
    }
  }, {}, [combatState.active]);
  
  // Equip an item from inventory
  const equipItem = useCallback((charIndex: number, item: Equipment) => {
    if (!game) return;
    const char = game.party[charIndex];
    if (!canEquip(char, item)) {
      log(`${char.name} cannot equip ${getEnhancedName(item)}!`);
      return;
    }
    
    const slot = item.slot;
    const currentEquip = char.equipment[slot];
    
    // Update party with new equipment and clamp HP/MP to new effective max
    const newParty = game.party.map((c, idx) => {
      if (idx !== charIndex) return c;
      const updatedChar = {
        ...c,
        equipment: { ...c.equipment, [slot]: item }
      };
      const newStats = getEffectiveStats(updatedChar);
      return {
        ...updatedChar,
        hp: Math.min(c.hp, newStats.maxHp),
        mp: Math.min(c.mp, newStats.maxMp)
      };
    });
    
    // Update equipment inventory (remove equipped, add unequipped if any)
    let newEquipInv = game.equipmentInventory.filter(e => e.id !== item.id);
    if (currentEquip) {
      newEquipInv = [...newEquipInv, currentEquip];
    }
    
    setGame(prev => prev ? ({ ...prev, party: newParty, equipmentInventory: newEquipInv }) : null);
    log(`${char.name} equipped ${getEnhancedName(item)}!`);
  }, [game, log]);
  
  // Unequip an item to inventory
  const unequipItem = useCallback((charIndex: number, slot: 'weapon' | 'shield' | 'armor' | 'helmet' | 'gloves' | 'accessory') => {
    if (!game) return;
    const char = game.party[charIndex];
    const item = char.equipment[slot];
    if (!item) return;
    
    // Update party and clamp HP/MP to new effective max after unequipping
    const newParty = game.party.map((c, idx) => {
      if (idx !== charIndex) return c;
      const updatedChar = {
        ...c,
        equipment: { ...c.equipment, [slot]: null }
      };
      const newStats = getEffectiveStats(updatedChar);
      return {
        ...updatedChar,
        hp: Math.min(c.hp, newStats.maxHp),
        mp: Math.min(c.mp, newStats.maxMp)
      };
    });
    
    // Add to inventory
    const newEquipInv = [...game.equipmentInventory, item];
    
    setGame(prev => prev ? ({ ...prev, party: newParty, equipmentInventory: newEquipInv }) : null);
    log(`${char.name} unequipped ${getEnhancedName(item)}.`);
  }, [game, log]);
  
  // Drop (discard) an item from inventory
  const dropItem = useCallback((item: Equipment) => {
    if (!game) return;
    
    // Remove item from inventory
    const newEquipInv = game.equipmentInventory.filter(i => i.id !== item.id);
    
    setGame(prev => prev ? ({ ...prev, equipmentInventory: newEquipInv }) : null);
    log(`Dropped ${getEnhancedName(item)}.`);
  }, [game, log]);
  
  // Use a potion on a character
  const usePotion = useCallback((potion: Potion, charIndex: number) => {
    if (!game) return;
    
    const char = game.party[charIndex];
    if (char.hp <= 0) {
      log(`${char.name} is unconscious!`);
      return;
    }
    
    const effectiveStats = getEffectiveStats(char);
    let healedHp = 0;
    let restoredMp = 0;
    
    // Apply healing
    const newParty = game.party.map((c, idx) => {
      if (idx !== charIndex) return c;
      
      let newHp = c.hp;
      let newMp = c.mp;
      
      if (potion.healAmount > 0) {
        healedHp = Math.min(potion.healAmount, effectiveStats.maxHp - c.hp);
        newHp = Math.min(effectiveStats.maxHp, c.hp + potion.healAmount);
      }
      if (potion.manaAmount > 0) {
        restoredMp = Math.min(potion.manaAmount, effectiveStats.maxMp - c.mp);
        newMp = Math.min(effectiveStats.maxMp, c.mp + potion.manaAmount);
      }
      
      return { ...c, hp: newHp, mp: newMp };
    });
    
    // Remove potion from inventory
    const newPotionInv = game.potionInventory.filter(p => p.id !== potion.id);
    
    setGame(prev => prev ? ({ ...prev, party: newParty, potionInventory: newPotionInv }) : null);
    
    // Log the effect
    const effects: string[] = [];
    if (healedHp > 0) effects.push(`+${healedHp} HP`);
    if (restoredMp > 0) effects.push(`+${restoredMp} MP`);
    log(`${char.name} used ${potion.name}: ${effects.join(', ')}`);
  }, [game, log]);
  
  // Drop a potion
  const dropPotion = useCallback((potion: Potion) => {
    if (!game) return;
    
    const newPotionInv = game.potionInventory.filter(p => p.id !== potion.id);
    setGame(prev => prev ? ({ ...prev, potionInventory: newPotionInv }) : null);
    log(`Dropped ${potion.name}.`);
  }, [game, log]);

  // Combat keyboard shortcuts and ladder interaction
  useKey(' ', (e) => {
    e.preventDefault();
    if (combatState.active && combatState.monsters.length > 0) {
      handleAttack();
    } else if (game && !combatState.active) {
      // Try to use ladder when not in combat
      useLadder();
    }
  }, {}, [combatState, game, useLadder]);

  useKey('Shift', (e) => {
    if (e.location === 2 && combatState.active) { // Right Shift only
      handleRun();
    }
  }, {}, [combatState]);

  const handleSave = () => {
    if (!game) return;
    saveMutation.mutate({
      data: game as any,
      lastSavedAt: new Date().toISOString()
    });
  };

  const awardXP = useCallback((xpAmount: number) => {
    if (!game) return;
    
    const newParty = game.party.map(char => {
      const newXp = char.xp + xpAmount;
      const xpNeeded = xpForLevel(char.level + 1);
      
      // Check for level up
      if (newXp >= xpNeeded) {
        const stats = getLevelUpStats(char.job);
        const newLevel = char.level + 1;
        log(`${char.name} leveled up to ${newLevel}!`);
        
        return {
          ...char,
          level: newLevel,
          xp: newXp - xpNeeded,
          maxHp: char.maxHp + stats.hp,
          hp: Math.min(char.hp + stats.hp, char.maxHp + stats.hp),
          maxMp: char.maxMp + stats.mp,
          mp: Math.min(char.mp + stats.mp, char.maxMp + stats.mp),
          attack: char.attack + stats.attack,
          defense: char.defense + stats.defense,
          speed: char.speed + stats.speed,
        };
      }
      
      return { ...char, xp: newXp };
    });
    
    setGame(prev => prev ? ({ ...prev, party: newParty }) : null);
  }, [game, log]);

  const monsterTurn = useCallback((updatedMonsters: Monster[], defendingActive: boolean) => {
    if (updatedMonsters.length === 0 || !game) return;
    
    // Each alive monster attacks a random alive party member (sorted by speed)
    const aliveMembers = game.party.filter(c => c.hp > 0);
    if (aliveMembers.length === 0) {
      log("GAME OVER");
      return;
    }
    
    let newParty = [...game.party];
    
    // Sort alive monsters by speed (fastest attacks first)
    const sortedMonsters = [...updatedMonsters].filter(m => m.hp > 0).sort((a, b) => b.speed - a.speed);
    
    for (const monster of sortedMonsters) {
      const aliveMembersNow = newParty.filter(c => c.hp > 0);
      if (aliveMembersNow.length === 0) break;
      
      const targetIdx = Math.floor(Math.random() * aliveMembersNow.length);
      const target = aliveMembersNow[targetIdx];
      const targetStats = getEffectiveStats(target);
      const defenseMultiplier = defendingActive ? 2 : 1;
      const monsterDmg = Math.max(1, Math.floor(monster.attack - (targetStats.defense * defenseMultiplier / 2)));
      
      newParty = newParty.map(c => 
        c.id === target.id ? { ...c, hp: Math.max(0, c.hp - monsterDmg) } : c
      );
      
      log(`${monster.name} hits ${target.name} for ${monsterDmg} dmg!`);
    }
    
    setGame(prev => prev ? ({ ...prev, party: newParty }) : null);
    
    // Recalculate turn order for next round (based on current party speed)
    const partyWithSpeed = newParty
      .map((char, idx) => ({ idx, speed: char.hp > 0 ? getEffectiveStats(char).speed : -1 }))
      .filter(c => c.speed > 0)
      .sort((a, b) => b.speed - a.speed);
    const newTurnOrder = partyWithSpeed.map(c => c.idx);
    const firstCharIdx = newTurnOrder.length > 0 ? newTurnOrder[0] : 0;
    
    setCombatState(prev => ({ 
      ...prev, 
      monsters: updatedMonsters,
      currentCharIndex: firstCharIdx,
      turnOrder: newTurnOrder,
      turnOrderPosition: 0,
      defending: false
    }));
    
    if (newParty.every(c => c.hp <= 0)) {
      log("GAME OVER");
    }
  }, [game, log]);

  const useAbility = (ability: Ability, charIndex: number) => {
    if (combatState.monsters.length === 0 || !game) return;
    
    (document.activeElement as HTMLElement)?.blur();
    
    const char = game.party[charIndex];
    const targetMonster = combatState.monsters[combatState.targetIndex];
    
    // Check MP cost
    if (ability.mpCost > char.mp) {
      log(`${char.name} doesn't have enough MP!`);
      return;
    }
    
    let newMonsters = [...combatState.monsters];
    let newParty = [...game.party];
    let isDefending = combatState.defending;
    
    // Deduct MP
    if (ability.mpCost > 0) {
      newParty[charIndex] = { ...newParty[charIndex], mp: char.mp - ability.mpCost };
    }
    
    // Scale ability power with character level
    const scaledPower = getScaledAbilityPower(ability, char.level);
    
    // Get effective stats with equipment
    const charStats = getEffectiveStats(char);
    
    switch (ability.type) {
      case 'attack': {
        const damage = Math.max(1, Math.floor(charStats.attack * scaledPower - (targetMonster.defense / 2)));
        newMonsters[combatState.targetIndex] = { ...targetMonster, hp: targetMonster.hp - damage };
        log(`${char.name} uses ${ability.name} on ${targetMonster.name}! ${damage} damage!`);
        break;
      }
      case 'heal': {
        // Meditate heals self, other heals heal the most injured party member
        let targetIdx: number;
        if (ability.id === 'meditate') {
          targetIdx = charIndex;
        } else {
          // Heal the most injured party member
          targetIdx = newParty.reduce((minIdx, c, idx) => {
            const cStats = getEffectiveStats(c);
            const minStats = getEffectiveStats(newParty[minIdx]);
            return c.hp > 0 && (c.hp / cStats.maxHp) < (newParty[minIdx].hp / minStats.maxHp) ? idx : minIdx;
          }, 0);
        }
        // Scale heal amount with level (using scaledPower for heal abilities)
        const targetEffectiveStats = getEffectiveStats(newParty[targetIdx]);
        const baseHeal = ability.type === 'heal' ? scaledPower : ability.power;
        const healAmount = Math.min(Math.floor(baseHeal), targetEffectiveStats.maxHp - newParty[targetIdx].hp);
        newParty[targetIdx] = { ...newParty[targetIdx], hp: newParty[targetIdx].hp + healAmount };
        log(`${char.name} uses ${ability.name}! ${newParty[targetIdx].name} healed ${healAmount} HP!`);
        break;
      }
      case 'buff': {
        isDefending = true;
        log(`${char.name} takes a defensive stance!`);
        break;
      }
    }
    
    setGame(prev => prev ? ({ ...prev, party: newParty }) : null);
    
    // Check if targeted monster is defeated
    if (newMonsters[combatState.targetIndex].hp <= 0) {
      log(`Defeated ${targetMonster.name}!`);
    }
    
    // Check for total victory (all monsters defeated)
    const aliveMonsters = newMonsters.filter(m => m.hp > 0);
    if (aliveMonsters.length === 0) {
      const totalXp = newMonsters.reduce((sum, m) => sum + m.xpValue, 0);
      const totalGold = newMonsters.reduce((sum, m) => sum + m.goldValue, 0);
      log(`Victory! +${totalXp} XP, +${totalGold} Gold`);
      
      // Award gold
      setGame(prev => prev ? ({ ...prev, gold: prev.gold + totalGold }) : null);
      
      // Check for equipment drops from each monster
      const droppedEquipment: Equipment[] = [];
      for (const monster of newMonsters) {
        const drop = getRandomEquipmentDrop(game.level);
        if (drop) {
          // Create a unique instance of the dropped item
          droppedEquipment.push({ ...drop, id: `${drop.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` });
        }
      }
      
      if (droppedEquipment.length > 0) {
        droppedEquipment.forEach(item => {
          log(`Found ${getEnhancedName(item)}!`);
        });
        // Add dropped equipment to inventory
        setGame(prev => prev ? ({
          ...prev,
          equipmentInventory: [...prev.equipmentInventory, ...droppedEquipment]
        }) : null);
      }
      
      // Check for potion drops from each monster
      const droppedPotions: Potion[] = [];
      for (const monster of newMonsters) {
        const potionDrop = getRandomPotionDrop(game.level);
        if (potionDrop) {
          droppedPotions.push(potionDrop);
        }
      }
      
      if (droppedPotions.length > 0) {
        droppedPotions.forEach(potion => {
          log(`Found ${potion.name}!`);
        });
        // Add dropped potions to inventory
        setGame(prev => prev ? ({
          ...prev,
          potionInventory: [...prev.potionInventory, ...droppedPotions]
        }) : null);
      }
      
      setCombatState({ active: false, monsters: [], targetIndex: 0, turn: 0, currentCharIndex: 0, turnOrder: [], turnOrderPosition: 0, defending: false });
      setTimeout(() => awardXP(totalXp), 100);
      return;
    }
    
    // Auto-target next alive monster if current target is dead
    let newTargetIndex = combatState.targetIndex;
    if (newMonsters[newTargetIndex].hp <= 0) {
      newTargetIndex = newMonsters.findIndex(m => m.hp > 0);
    }
    
    // Find next character in speed-based turn order
    let nextTurnPos = combatState.turnOrderPosition + 1;
    // Skip dead characters
    while (nextTurnPos < combatState.turnOrder.length && game.party[combatState.turnOrder[nextTurnPos]]?.hp <= 0) {
      nextTurnPos++;
    }
    
    if (nextTurnPos < combatState.turnOrder.length) {
      const nextCharIdx = combatState.turnOrder[nextTurnPos];
      setCombatState(prev => ({ 
        ...prev, 
        monsters: newMonsters,
        targetIndex: newTargetIndex,
        currentCharIndex: nextCharIdx,
        turnOrderPosition: nextTurnPos,
        defending: isDefending
      }));
    } else {
      // All party members acted, monsters' turn (sorted by speed)
      setTimeout(() => monsterTurn(newMonsters, isDefending), 500);
    }
  };

  const handleAttack = () => {
    const abilities = getAbilitiesForJob(game?.party[combatState.currentCharIndex]?.job || 'Fighter');
    const attackAbility = abilities.find(a => a.id === 'attack');
    if (attackAbility) {
      useAbility(attackAbility, combatState.currentCharIndex);
    }
  };

  const handleRun = () => {
    (document.activeElement as HTMLElement)?.blur();
    log("You fled from battle!");
    setCombatState({ active: false, monsters: [], targetIndex: 0, turn: 0, currentCharIndex: 0, turnOrder: [], turnOrderPosition: 0, defending: false });
  };

  if (isLoading || !game) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-primary font-pixel">
        <Loader2 className="w-8 h-8 animate-spin mr-4" />
        LOADING DUNGEON...
      </div>
    );
  }

  return (
    <div 
      ref={gameContainerRef}
      tabIndex={-1}
      className="min-h-screen p-4 md:p-8 flex items-center justify-center relative overflow-hidden outline-none bg-black">
      {/* Stone wall background with grayscale filter */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${dungeonWallBg})`,
          backgroundSize: '400px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          filter: 'grayscale(100%) brightness(0.35) contrast(1.1)'
        }} 
      />
      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)'
      }} />
      {/* Torch glow effects */}
      <div className="absolute top-0 left-0 w-64 h-80 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at top left, rgba(255,150,50,0.2) 0%, transparent 60%)'
      }} />
      <div className="absolute top-0 right-0 w-64 h-80 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at top right, rgba(255,150,50,0.2) 0%, transparent 60%)'
      }} />
      
      {/* Slime decorations */}
      {/* Green slime pool - bottom left */}
      <div className="absolute bottom-[15%] left-[8%] w-20 h-10 pointer-events-none opacity-60" style={{
        background: 'radial-gradient(ellipse at center, rgba(80,180,80,0.5) 0%, rgba(50,120,50,0.3) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(2px)'
      }} />
      {/* Purple slime drip - top left */}
      <div className="absolute top-[25%] left-[5%] w-3 h-16 pointer-events-none opacity-50" style={{
        background: 'linear-gradient(180deg, rgba(140,80,180,0.6) 0%, rgba(100,50,140,0.4) 60%, transparent 100%)',
        borderRadius: '0 0 50% 50%',
        filter: 'blur(1px)'
      }} />
      {/* Green slime drops - right side */}
      <div className="absolute top-[40%] right-[6%] w-4 h-4 pointer-events-none opacity-50" style={{
        background: 'radial-gradient(circle, rgba(100,200,100,0.6) 0%, transparent 70%)',
        borderRadius: '50%'
      }} />
      <div className="absolute top-[45%] right-[7%] w-2 h-2 pointer-events-none opacity-40" style={{
        background: 'radial-gradient(circle, rgba(80,160,80,0.5) 0%, transparent 70%)',
        borderRadius: '50%'
      }} />
      {/* Purple slime pool - bottom right */}
      <div className="absolute bottom-[20%] right-[10%] w-16 h-8 pointer-events-none opacity-50" style={{
        background: 'radial-gradient(ellipse at center, rgba(120,60,160,0.5) 0%, rgba(80,40,120,0.3) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(2px)'
      }} />
      {/* Green slime line - left side */}
      <div className="absolute top-[55%] left-[3%] w-2 h-24 pointer-events-none opacity-40" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(70,150,70,0.4) 20%, rgba(90,180,90,0.5) 50%, rgba(60,130,60,0.3) 80%, transparent 100%)',
        borderRadius: '50%',
        filter: 'blur(1px)'
      }} />
      {/* Small purple drops */}
      <div className="absolute bottom-[35%] left-[12%] w-3 h-3 pointer-events-none opacity-45" style={{
        background: 'radial-gradient(circle, rgba(150,90,190,0.5) 0%, transparent 70%)',
        borderRadius: '50%'
      }} />
      
      <div className="max-w-5xl w-full relative z-10 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: Commands & Equipment */}
        <div className="lg:col-span-2 space-y-2 order-2 lg:order-1">
          <RetroCard title="COMMANDS">
            <div className="grid grid-cols-2 gap-2">
              <RetroButton onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "SAVING..." : "SAVE"} <Save className="w-3 h-3 ml-2 inline" />
              </RetroButton>
              <RetroButton onClick={() => logout()} variant="danger">
                EXIT <LogOut className="w-3 h-3 ml-2 inline" />
              </RetroButton>
            </div>
            
            {/* Equipment Toggle Button */}
            <RetroButton 
              onClick={() => setShowEquipment(prev => !prev)}
              className="w-full mt-2"
              variant={showEquipment ? "default" : "ghost"}
              data-testid="button-equipment"
            >
              <Sword className="w-4 h-4 mr-2" />
              EQUIPMENT (E)
            </RetroButton>
            
            {/* Stats Toggle Button */}
            <RetroButton 
              onClick={() => setShowStats(prev => !prev)}
              className="w-full mt-2"
              variant={showStats ? "default" : "ghost"}
              data-testid="button-stats"
            >
              <User className="w-4 h-4 mr-2" />
              STATS (C)
            </RetroButton>
            
            {/* Inventory Toggle Button */}
            <RetroButton 
              onClick={() => setShowInventory(prev => !prev)}
              className="w-full mt-2"
              variant={showInventory ? "default" : "ghost"}
              data-testid="button-inventory"
            >
              <Backpack className="w-4 h-4 mr-2" />
              ITEMS (I)
            </RetroButton>
          </RetroCard>
          
          {/* Equipment Panel - Below Commands */}
          {showEquipment && (
            <div className="w-full bg-black/95 backdrop-blur-sm border border-primary/30 rounded-lg shadow-2xl shadow-black/50 mt-2">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-primary font-pixel text-sm">EQUIPMENT</h3>
                  <button 
                    onClick={() => setShowEquipment(false)}
                    className="text-muted-foreground hover:text-primary text-lg px-2"
                    data-testid="button-close-equipment"
                  >
                    ×
                  </button>
                </div>
                
                {/* Character Selection */}
                <div className="flex gap-1 mb-3">
                  {game.party.map((char, idx) => (
                    <button
                      key={char.id}
                      onClick={() => setSelectedCharForEquip(idx)}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                        selectedCharForEquip === idx 
                          ? 'bg-primary/20 text-primary border border-primary/40 shadow-lg shadow-primary/10' 
                          : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                      }`}
                      data-testid={`button-select-char-${idx}`}
                    >
                      {char.name}
                    </button>
                  ))}
                </div>
                
                {/* Selected Character's Equipment Slots */}
                {game.party[selectedCharForEquip] && (
                  <div className="space-y-1 mb-2">
                    {(['weapon', 'shield', 'armor', 'helmet', 'gloves', 'accessory'] as const).map(slot => {
                      const item = game.party[selectedCharForEquip].equipment[slot];
                      return (
                        <div 
                          key={slot} 
                          className="flex items-center justify-between bg-white/5 px-2 py-1 rounded border border-white/10"
                        >
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <span className="text-[9px] text-muted-foreground capitalize w-10 flex-shrink-0">{slot}:</span>
                            {item ? (
                              <span className={`text-[9px] font-medium truncate ${
                                item.rarity === 'rare' ? 'text-blue-400' : 
                                item.rarity === 'uncommon' ? 'text-green-400' : 
                                item.rarity === 'epic' ? 'text-purple-400' : 
                                (item.enhancement || 0) > 0 ? 'text-yellow-400' : 'text-foreground'
                              }`}>
                                {getEnhancedName(item)}
                              </span>
                            ) : (
                              <span className="text-[9px] text-muted-foreground italic">-</span>
                            )}
                          </div>
                          {item && (
                            <button
                              onClick={() => unequipItem(selectedCharForEquip, slot)}
                              className="text-[9px] px-1 bg-destructive/20 text-destructive hover:bg-destructive/40 rounded transition-colors ml-1"
                              data-testid={`button-unequip-${slot}`}
                            >
                              X
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Show effective stats - grid */}
                <div className="grid grid-cols-2 gap-1 text-[9px] text-muted-foreground mb-2">
                  <span className="bg-white/5 px-1 py-0.5 rounded text-center">ATK: {getEffectiveStats(game.party[selectedCharForEquip]).attack}</span>
                  <span className="bg-white/5 px-1 py-0.5 rounded text-center">DEF: {getEffectiveStats(game.party[selectedCharForEquip]).defense}</span>
                  <span className="bg-white/5 px-1 py-0.5 rounded text-center">HP: {getEffectiveStats(game.party[selectedCharForEquip]).maxHp}</span>
                  <span className="bg-white/5 px-1 py-0.5 rounded text-center">MP: {getEffectiveStats(game.party[selectedCharForEquip]).maxMp}</span>
                </div>
                
                {/* Equipment Inventory */}
                <div className="pt-2 border-t border-white/10">
                  <div className="text-[10px] text-muted-foreground mb-1">
                    Bag ({game.equipmentInventory.length})
                  </div>
                  {game.equipmentInventory.length === 0 ? (
                    <div className="text-[10px] text-muted-foreground italic text-center py-2">
                      Empty
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {game.equipmentInventory.map((item, idx) => {
                        const char = game.party[selectedCharForEquip];
                        const canEquipThis = canEquip(char, item);
                        return (
                          <div 
                            key={`${item.id}-${idx}`}
                            className={`bg-white/5 px-2 py-1.5 rounded border border-white/10 transition-opacity ${
                              !canEquipThis ? 'opacity-40' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex-1 min-w-0">
                                <span className={`text-[9px] font-medium block truncate ${
                                  item.rarity === 'rare' ? 'text-blue-400' : 
                                  item.rarity === 'uncommon' ? 'text-green-400' : 
                                  item.rarity === 'epic' ? 'text-purple-400' : 
                                  (item.enhancement || 0) > 0 ? 'text-yellow-400' : 'text-foreground'
                                }`}>
                                  {getEnhancedName(item)}
                                </span>
                                <div className="text-[8px] text-amber-400/80">
                                  {formatEquipmentStats(item)}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => equipItem(selectedCharForEquip, item)}
                                  disabled={!canEquipThis}
                                  className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${
                                    canEquipThis 
                                      ? 'bg-primary/20 text-primary hover:bg-primary/40' 
                                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                                  }`}
                                  data-testid={`button-equip-${item.id}`}
                                >
                                  Eq
                                </button>
                                <button
                                  onClick={() => dropItem(item)}
                                  className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded transition-colors"
                                  data-testid={`button-drop-${item.id}`}
                                >
                                  Drop
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Stats Panel - Below Equipment */}
          {showStats && (
            <div className="w-full bg-black/95 backdrop-blur-sm border border-primary/30 rounded-lg shadow-2xl shadow-black/50 mt-2">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-primary font-pixel text-sm">CHARACTER STATS</h3>
                  <button 
                    onClick={() => setShowStats(false)}
                    className="text-muted-foreground hover:text-primary text-lg px-2"
                    data-testid="button-close-stats"
                  >
                    ×
                  </button>
                </div>
                
                {/* Character Selection */}
                <div className="flex gap-1 mb-3">
                  {game.party.map((char, idx) => (
                    <button
                      key={char.id}
                      onClick={() => setSelectedCharForStats(idx)}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                        selectedCharForStats === idx 
                          ? 'bg-primary/20 text-primary border border-primary/40 shadow-lg shadow-primary/10' 
                          : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                      }`}
                      data-testid={`button-stats-char-${idx}`}
                    >
                      {char.name}
                    </button>
                  ))}
                </div>
                
                {/* Selected Character's Stats */}
                {game.party[selectedCharForStats] && (() => {
                  const char = game.party[selectedCharForStats];
                  const effectiveStats = getEffectiveStats(char);
                  const xpNeeded = xpForLevel(char.level + 1);
                  const xpProgress = Math.min(100, Math.round((char.xp / xpNeeded) * 100));
                  
                  return (
                    <div className="space-y-2">
                      {/* Basic Info */}
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-primary font-pixel text-sm">{char.name}</span>
                          <span className="text-[10px] text-amber-400 uppercase">{char.job}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Level {char.level} | XP: {char.xp}/{xpNeeded} ({xpProgress}%)
                        </div>
                        <div className="w-full bg-black/50 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-amber-400 h-1.5 rounded-full transition-all" 
                            style={{ width: `${xpProgress}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* HP/MP */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                          <div className="text-[9px] text-muted-foreground mb-1">HP</div>
                          <div className="text-sm text-green-400 font-pixel">{char.hp}/{effectiveStats.maxHp}</div>
                          <div className="w-full bg-black/50 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full transition-all" 
                              style={{ width: `${Math.round((char.hp / effectiveStats.maxHp) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                          <div className="text-[9px] text-muted-foreground mb-1">MP</div>
                          <div className="text-sm text-blue-400 font-pixel">{char.mp}/{effectiveStats.maxMp}</div>
                          <div className="w-full bg-black/50 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all" 
                              style={{ width: `${effectiveStats.maxMp > 0 ? Math.round((char.mp / effectiveStats.maxMp) * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Combat Stats */}
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                        <div className="text-[9px] text-muted-foreground mb-2">COMBAT STATS</div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex justify-between">
                            <span className="text-[10px] text-muted-foreground">ATK:</span>
                            <span className="text-[10px] text-red-400 font-medium">{effectiveStats.attack}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-muted-foreground">DEF:</span>
                            <span className="text-[10px] text-blue-400 font-medium">{effectiveStats.defense}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-muted-foreground">SPD:</span>
                            <span className="text-[10px] text-yellow-400 font-medium">{effectiveStats.speed}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Base Stats vs Equipment Bonus */}
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                        <div className="text-[9px] text-muted-foreground mb-2">STAT BREAKDOWN</div>
                        <div className="space-y-1 text-[9px]">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base ATK:</span>
                            <span className="text-foreground">{char.attack}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equipment ATK:</span>
                            <span className="text-green-400">+{effectiveStats.attack - char.attack}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base DEF:</span>
                            <span className="text-foreground">{char.defense}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equipment DEF:</span>
                            <span className="text-green-400">+{effectiveStats.defense - char.defense}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base HP:</span>
                            <span className="text-foreground">{char.maxHp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equipment HP:</span>
                            <span className="text-green-400">+{effectiveStats.maxHp - char.maxHp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base MP:</span>
                            <span className="text-foreground">{char.maxMp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equipment MP:</span>
                            <span className="text-green-400">+{effectiveStats.maxMp - char.maxMp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base SPD:</span>
                            <span className="text-foreground">{char.speed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equipment SPD:</span>
                            <span className="text-green-400">+{effectiveStats.speed - char.speed}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Equipped Items Summary */}
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                        <div className="text-[9px] text-muted-foreground mb-2">EQUIPPED</div>
                        <div className="space-y-0.5">
                          {(['weapon', 'shield', 'armor', 'helmet', 'gloves', 'accessory'] as const).map(slot => {
                            const item = char.equipment[slot];
                            return (
                              <div key={slot} className="flex justify-between text-[9px]">
                                <span className="text-muted-foreground capitalize">{slot}:</span>
                                {item ? (
                                  <span className={`${
                                    item.rarity === 'rare' ? 'text-blue-400' : 
                                    item.rarity === 'uncommon' ? 'text-green-400' : 
                                    item.rarity === 'epic' ? 'text-purple-400' : 
                                    (item.enhancement || 0) > 0 ? 'text-yellow-400' : 'text-foreground'
                                  }`}>
                                    {getEnhancedName(item)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground italic">None</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
          
          {/* Inventory Panel - Potions */}
          {showInventory && (
            <div className="w-full bg-black/95 backdrop-blur-sm border border-primary/30 rounded-lg shadow-2xl shadow-black/50 mt-2">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-primary font-pixel text-sm">ITEMS BAG</h3>
                  <button 
                    onClick={() => setShowInventory(false)}
                    className="text-muted-foreground hover:text-primary text-lg px-2"
                    data-testid="button-close-inventory"
                  >
                    ×
                  </button>
                </div>
                
                {/* Character Selection for using potions */}
                <div className="flex gap-1 mb-3">
                  {game.party.map((char, idx) => (
                    <button
                      key={char.id}
                      onClick={() => setSelectedCharForPotion(idx)}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                        selectedCharForPotion === idx 
                          ? 'bg-primary/20 text-primary border border-primary/40 shadow-lg shadow-primary/10' 
                          : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                      } ${char.hp <= 0 ? 'opacity-50' : ''}`}
                      data-testid={`button-potion-char-${idx}`}
                    >
                      {char.name}
                      {char.hp <= 0 && ' (KO)'}
                    </button>
                  ))}
                </div>
                
                {/* Selected Character HP/MP preview */}
                {game.party[selectedCharForPotion] && (() => {
                  const char = game.party[selectedCharForPotion];
                  const effectiveStats = getEffectiveStats(char);
                  return (
                    <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
                      <div className="bg-white/5 rounded px-2 py-1 border border-white/10">
                        <span className="text-green-400">{char.hp}/{effectiveStats.maxHp} HP</span>
                      </div>
                      <div className="bg-white/5 rounded px-2 py-1 border border-white/10">
                        <span className="text-blue-400">{char.mp}/{effectiveStats.maxMp} MP</span>
                      </div>
                    </div>
                  );
                })()}
                
                {/* Potions List */}
                <div className="pt-2 border-t border-white/10">
                  <div className="text-[10px] text-muted-foreground mb-1">
                    Potions ({game.potionInventory.length})
                  </div>
                  {game.potionInventory.length === 0 ? (
                    <div className="text-[10px] text-muted-foreground italic text-center py-2">
                      No potions
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                      {game.potionInventory.map((potion) => (
                        <div 
                          key={potion.id}
                          className="flex items-center justify-between bg-white/5 px-2 py-1.5 rounded border border-white/10"
                        >
                          <div className="flex-1 min-w-0">
                            <div className={`text-[10px] font-medium truncate ${
                              potion.rarity === 'rare' ? 'text-blue-400' : 
                              potion.rarity === 'uncommon' ? 'text-green-400' : 
                              'text-foreground'
                            }`}>
                              {potion.type === 'health' && '❤️ '}
                              {potion.type === 'mana' && '💧 '}
                              {potion.type === 'elixir' && '✨ '}
                              {potion.name}
                            </div>
                            <div className="text-[8px] text-muted-foreground">
                              {potion.description}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0 ml-2">
                            <button
                              onClick={() => usePotion(potion, selectedCharForPotion)}
                              disabled={game.party[selectedCharForPotion]?.hp <= 0}
                              className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${
                                game.party[selectedCharForPotion]?.hp > 0
                                  ? 'bg-primary/20 text-primary hover:bg-primary/40' 
                                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                              }`}
                              data-testid={`button-use-potion-${potion.id}`}
                            >
                              Use
                            </button>
                            <button
                              onClick={() => dropPotion(potion)}
                              className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded transition-colors"
                              data-testid={`button-drop-potion-${potion.id}`}
                            >
                              Drop
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CENTER COLUMN: Viewport */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <RetroCard className="p-1">
            <div className="relative aspect-[4/3] w-full bg-black overflow-hidden rounded-lg">
              {/* Always show dungeon view as background */}
              <DungeonView gameData={game} className="w-full h-full" />
              
              {/* Mini Map in top left (toggle with M key) - centered on player */}
              {showMiniMap && (() => {
                const mapSize = 11; // Odd number so player is always centered
                const halfSize = Math.floor(mapSize / 2);
                const mapHeight = game.map.length;
                const mapWidth = game.map[0]?.length || 0;
                
                // Calculate view bounds centered on player
                const startY = Math.max(0, Math.min(game.y - halfSize, mapHeight - mapSize));
                const startX = Math.max(0, Math.min(game.x - halfSize, mapWidth - mapSize));
                const endY = Math.min(mapHeight, startY + mapSize);
                const endX = Math.min(mapWidth, startX + mapSize);
                
                return (
                  <div className="absolute top-3 left-3 z-30 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-2 shadow-xl">
                    {/* Floor indicator */}
                    <div className="text-[10px] text-amber-400 font-bold text-center mb-1.5 tracking-wider">
                      FLOOR {game.level}
                    </div>
                    <div className="grid gap-[1px]" style={{ 
                      gridTemplateColumns: `repeat(${endX - startX}, 6px)` 
                    }}>
                      {game.map.slice(startY, endY).map((row, viewY) => 
                        row.slice(startX, endX).map((cell, viewX) => {
                          const actualX = startX + viewX;
                          const actualY = startY + viewY;
                          const isPlayer = actualX === game.x && actualY === game.y;
                          const isWall = cell === TILE_WALL;
                          const isDoor = cell === TILE_DOOR;
                          const isLadderDown = cell === TILE_LADDER_DOWN;
                          const isLadderUp = cell === TILE_LADDER_UP;
                          return (
                            <div
                              key={`${actualX}-${actualY}`}
                              className={`w-[6px] h-[6px] rounded-[1px] ${
                                isPlayer 
                                  ? 'bg-amber-400 shadow-sm shadow-amber-400/50' 
                                  : isLadderDown
                                    ? 'bg-green-500 shadow-sm shadow-green-500/50'
                                    : isLadderUp
                                      ? 'bg-yellow-400 shadow-sm shadow-yellow-400/50'
                                      : isDoor
                                        ? 'bg-amber-600'
                                        : isWall 
                                          ? 'bg-slate-500' 
                                          : 'bg-slate-800'
                              }`}
                              style={isPlayer ? {
                                clipPath: game.dir === 0 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : // North
                                          game.dir === 1 ? 'polygon(0% 0%, 100% 50%, 0% 100%)' : // East
                                          game.dir === 2 ? 'polygon(0% 0%, 100% 0%, 50% 100%)' : // South
                                          'polygon(100% 0%, 100% 100%, 0% 50%)', // West
                              } : undefined}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}
              
              {/* Monster overlay during combat */}
              {combatState.active && combatState.monsters.length > 0 && (
                <>
                  {/* Atmospheric overlay for combat - radial vignette that darkens edges */}
                  <div 
                    className="absolute inset-0 z-[5] pointer-events-none animate-in fade-in duration-500"
                    style={{
                      background: 'radial-gradient(ellipse 60% 50% at 50% 45%, transparent 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.6) 100%)'
                    }}
                  />
                  
                  {/* Multiple monsters positioned side by side */}
                  <div className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none pb-28">
                    <div className="flex items-end justify-center gap-2 animate-in fade-in zoom-in duration-300">
                      {combatState.monsters.map((monster, idx) => (
                        <div 
                          key={monster.id} 
                          className={`relative cursor-pointer transition-all duration-200 ${
                            monster.hp <= 0 ? 'opacity-30 grayscale' : ''
                          } ${idx === combatState.targetIndex && monster.hp > 0 ? 'scale-105' : 'scale-95'}`}
                          onClick={() => monster.hp > 0 && setCombatState(prev => ({ ...prev, targetIndex: idx }))}
                          style={{ pointerEvents: 'auto' }}
                        >
                          {/* Target indicator */}
                          {idx === combatState.targetIndex && monster.hp > 0 && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                              <ChevronDown className="w-6 h-6" />
                            </div>
                          )}
                          {monster.image ? (
                            <>
                              <TransparentMonster 
                                src={monster.image} 
                                alt={monster.name} 
                                className={`object-contain drop-shadow-[0_0_25px_rgba(0,0,0,0.9)] ${
                                  combatState.monsters.length === 1 ? 'w-72 h-72' :
                                  combatState.monsters.length === 2 ? 'w-52 h-52' : 'w-40 h-40'
                                }`}
                              />
                              {/* Ground shadow beneath monster */}
                              <div 
                                className={`absolute bottom-0 left-1/2 rounded-[50%] bg-black/60 blur-md ${
                                  combatState.monsters.length === 1 ? 'w-52 h-8' :
                                  combatState.monsters.length === 2 ? 'w-36 h-6' : 'w-28 h-5'
                                }`}
                                style={{ transform: 'translateX(-50%) translateY(12px)' }}
                              />
                            </>
                          ) : (
                            <Skull className={`text-red-500 drop-shadow-lg ${
                              combatState.monsters.length === 1 ? 'w-40 h-40' :
                              combatState.monsters.length === 2 ? 'w-28 h-28' : 'w-20 h-20'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Combat UI overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4">
                    <div className="space-y-3">
                      {/* All Monsters HP bars */}
                      <div className="flex flex-wrap gap-2">
                        {combatState.monsters.map((monster, idx) => (
                          <div 
                            key={monster.id} 
                            className={`flex-1 min-w-[120px] p-1 rounded border cursor-pointer transition-all ${
                              idx === combatState.targetIndex ? 'border-yellow-400 bg-yellow-400/10' : 'border-primary/30 bg-black/40'
                            } ${monster.hp <= 0 ? 'opacity-50' : ''}`}
                            onClick={() => monster.hp > 0 && setCombatState(prev => ({ ...prev, targetIndex: idx }))}
                          >
                            <h2 className="font-pixel text-destructive text-xs mb-1 truncate">{monster.name}</h2>
                            <StatBar 
                              label="HP" 
                              current={Math.max(0, monster.hp)} 
                              max={monster.maxHp} 
                              color={monster.color} 
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Current Character Turn */}
                      {game.party[combatState.currentCharIndex] && game.party[combatState.currentCharIndex].hp > 0 && (
                        <div className="bg-black/60 p-2 rounded border border-primary/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-pixel text-xs text-primary">
                              {game.party[combatState.currentCharIndex].name}'s Turn
                            </span>
                            <span className="font-retro text-xs text-blue-400">
                              MP: {game.party[combatState.currentCharIndex].mp}/{getEffectiveStats(game.party[combatState.currentCharIndex]).maxMp}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {getAbilitiesForJob(game.party[combatState.currentCharIndex].job).map((ability) => (
                              <RetroButton 
                                key={ability.id}
                                onClick={() => useAbility(ability, combatState.currentCharIndex)} 
                                className="px-3 py-1 text-xs"
                                disabled={ability.mpCost > game.party[combatState.currentCharIndex].mp}
                                data-testid={`button-${ability.id}`}
                              >
                                {ability.name}
                                {ability.mpCost > 0 && <span className="ml-1 text-blue-300">({ability.mpCost})</span>}
                              </RetroButton>
                            ))}
                            <RetroButton onClick={handleRun} variant="ghost" className="px-3 py-1 text-xs" data-testid="button-run">
                              RUN
                            </RetroButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Message Log */}
            <div className="h-32 bg-gradient-to-t from-black/90 to-black/60 border-t border-white/10 p-4 text-base overflow-hidden flex flex-col justify-end">
              {logs.map((msg, i) => (
                <div key={i} className={`transition-opacity ${i === 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`} style={{ opacity: 1 - i * 0.2 }}>
                  {i === 0 ? '▸ ' : '  '}{msg}
                </div>
              ))}
            </div>
            
            {/* Movement Controls */}
            <div className="bg-black/40 backdrop-blur-sm p-4 border-t border-white/10 flex justify-center gap-8 items-center">
              <div className="grid grid-cols-3 gap-2 place-items-center">
                <div />
                <RetroButton onClick={() => {
                  if (game.dir === NORTH) move(0, -1);
                  if (game.dir === SOUTH) move(0, 1);
                  if (game.dir === EAST) move(1, 0);
                  if (game.dir === WEST) move(-1, 0);
                }} className="w-12 h-12 p-0 flex items-center justify-center rounded-xl" data-testid="button-forward">
                  <ArrowUp className="w-5 h-5" />
                </RetroButton>
                <div />
                
                <RetroButton onClick={() => rotate('left')} className="w-12 h-12 p-0 flex items-center justify-center rounded-xl" data-testid="button-rotate-left">
                  <RotateCcw className="w-5 h-5" />
                </RetroButton>
                <div className="w-12 h-12 flex items-center justify-center text-xs text-muted-foreground">
                  WASD
                </div>
                <RetroButton onClick={() => rotate('right')} className="w-12 h-12 p-0 flex items-center justify-center rounded-xl" data-testid="button-rotate-right">
                  <RotateCw className="w-5 h-5" />
                </RetroButton>
              </div>
              
              {/* Skills Section (Non-combat) */}
              {!combatState.active && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-muted-foreground text-center mb-1">SKILLS</div>
                  <RetroButton 
                    onClick={healAllParty} 
                    className="px-4 py-2 text-sm"
                    disabled={!game.party.some(c => c.job === 'Mage' && c.hp > 0 && c.mp >= 10)}
                    data-testid="button-heal-all"
                  >
                    <span className="text-green-400">Heal All</span>
                    <span className="ml-2 text-blue-300 text-xs">(10 MP)</span>
                  </RetroButton>
                  <div className="text-[10px] text-muted-foreground text-center">Press H</div>
                </div>
              )}
            </div>
          </RetroCard>
        </div>

        {/* RIGHT COLUMN: Party Stats */}
        <div className="lg:col-span-2 order-3">
          <RetroCard title="PARTY STATUS" className="h-full space-y-3">
            {game.party.map((char, idx) => {
              const isCurrentTurn = combatState.active && idx === combatState.currentCharIndex && char.hp > 0;
              return (
              <div 
                key={char.id} 
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  isCurrentTurn 
                    ? 'bg-primary/20 border-primary/50 shadow-lg shadow-primary/30 animate-pulse' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold text-sm transition-all duration-300 ${
                    isCurrentTurn ? 'text-primary drop-shadow-[0_0_8px_rgba(200,140,50,0.8)]' : 'text-primary'
                  }`}>
                    {char.name}
                    {isCurrentTurn && <span className="ml-2 text-xs">⚔️</span>}
                  </span>
                  <span className="text-muted-foreground text-xs bg-white/5 px-2 py-0.5 rounded-full">Lv.{char.level} {char.job}</span>
                </div>
                <div className="space-y-2">
                  <StatBar label="HP" current={char.hp} max={getEffectiveStats(char).maxHp} color={char.color} />
                  <StatBar label="MP" current={char.mp} max={getEffectiveStats(char).maxMp} color="#3b82f6" />
                  <StatBar label="XP" current={char.xp} max={xpForLevel(char.level + 1)} color="#f59e0b" />
                </div>
              </div>
            );
            })}
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center bg-gradient-to-r from-amber-500/20 to-amber-600/10 px-4 py-3 rounded-lg border border-amber-500/20">
                <span className="text-amber-400 font-semibold">GOLD</span>
                <span className="text-amber-300 font-bold text-xl">{game.gold}</span>
              </div>
            </div>
          </RetroCard>
        </div>
        </div>
      </div>
    </div>
  );
}
