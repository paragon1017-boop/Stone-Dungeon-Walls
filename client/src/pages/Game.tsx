import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGameState, useSaveGame } from "@/hooks/use-game";
import { DungeonView } from "@/components/DungeonView";
import { TransparentMonster } from "@/components/TransparentMonster";
import { RetroCard, RetroButton, StatBar } from "@/components/RetroUI";
import { 
  GameData, createInitialState, 
  NORTH, SOUTH, EAST, WEST, 
  getRandomMonster, Monster,
  xpForLevel, getLevelUpStats, Player,
  Ability, getAbilitiesForJob, getScaledAbilityPower,
  getEffectiveStats, Equipment, getRandomEquipmentDrop, canEquip
} from "@/lib/game-engine";
import { useKey } from "react-use";
import { Loader2, Skull, Sword, User, LogOut, Save, RotateCw, RotateCcw, ArrowUp, ChevronDown } from "lucide-react";

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
    defending: boolean 
  }>({ active: false, monsters: [], targetIndex: 0, turn: 0, currentCharIndex: 0, defending: false });
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showEquipment, setShowEquipment] = useState(false);
  const [selectedCharForEquip, setSelectedCharForEquip] = useState(0);
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
              equipment: { weapon: null, armor: null, helmet: null, accessory: null }
            };
          }
          return char;
        });
        
        // Add equipmentInventory if missing
        const migratedData: GameData = {
          ...loadedData,
          party: migratedParty,
          equipmentInventory: loadedData.equipmentInventory || [],
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

    // Wall/door collision (1 = wall, 2 = door)
    if (game.map[ny][nx] !== 0) {
      log("Blocked.");
      return;
    }

    setGame(prev => prev ? ({ ...prev, x: nx, y: ny }) : null);

    // Random Encounter Chance (10%)
    if (Math.random() < 0.1) {
      // Spawn 1-3 monsters
      const monsterCount = 1 + Math.floor(Math.random() * 3);
      const monsters: Monster[] = [];
      for (let i = 0; i < monsterCount; i++) {
        monsters.push(getRandomMonster(game.level));
      }
      setCombatState({ active: true, monsters, targetIndex: 0, turn: 0, currentCharIndex: 0, defending: false });
      if (monsterCount === 1) {
        log(`A wild ${monsters[0].name} appeared!`);
      } else {
        log(`${monsterCount} monsters appeared!`);
      }
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
  
  // Equip an item from inventory
  const equipItem = useCallback((charIndex: number, item: Equipment) => {
    if (!game) return;
    const char = game.party[charIndex];
    if (!canEquip(char, item)) {
      log(`${char.name} cannot equip ${item.name}!`);
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
    log(`${char.name} equipped ${item.name}!`);
  }, [game, log]);
  
  // Unequip an item to inventory
  const unequipItem = useCallback((charIndex: number, slot: 'weapon' | 'armor' | 'helmet' | 'accessory') => {
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
    log(`${char.name} unequipped ${item.name}.`);
  }, [game, log]);

  // Combat keyboard shortcuts
  useKey(' ', (e) => {
    if (combatState.active && combatState.monsters.length > 0) {
      e.preventDefault();
      handleAttack();
    }
  }, {}, [combatState, game]);

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
        };
      }
      
      return { ...char, xp: newXp };
    });
    
    setGame(prev => prev ? ({ ...prev, party: newParty }) : null);
  }, [game, log]);

  const monsterTurn = useCallback((updatedMonsters: Monster[], defendingActive: boolean) => {
    if (updatedMonsters.length === 0 || !game) return;
    
    // Each alive monster attacks a random alive party member
    const aliveMembers = game.party.filter(c => c.hp > 0);
    if (aliveMembers.length === 0) {
      log("GAME OVER");
      return;
    }
    
    let newParty = [...game.party];
    
    for (const monster of updatedMonsters) {
      if (monster.hp <= 0) continue;
      
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
    setCombatState(prev => ({ 
      ...prev, 
      monsters: updatedMonsters,
      currentCharIndex: 0,
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
      log(`Victory! +${totalXp} XP`);
      
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
          log(`Found ${item.name}!`);
        });
        // Add dropped equipment to inventory
        setGame(prev => prev ? ({
          ...prev,
          equipmentInventory: [...prev.equipmentInventory, ...droppedEquipment]
        }) : null);
      }
      
      setCombatState({ active: false, monsters: [], targetIndex: 0, turn: 0, currentCharIndex: 0, defending: false });
      setTimeout(() => awardXP(totalXp), 100);
      return;
    }
    
    // Auto-target next alive monster if current target is dead
    let newTargetIndex = combatState.targetIndex;
    if (newMonsters[newTargetIndex].hp <= 0) {
      newTargetIndex = newMonsters.findIndex(m => m.hp > 0);
    }
    
    // Find next alive character's turn or monster's turn
    let nextCharIdx = charIndex + 1;
    while (nextCharIdx < game.party.length && game.party[nextCharIdx].hp <= 0) {
      nextCharIdx++;
    }
    
    if (nextCharIdx < game.party.length) {
      setCombatState(prev => ({ 
        ...prev, 
        monsters: newMonsters,
        targetIndex: newTargetIndex,
        currentCharIndex: nextCharIdx,
        defending: isDefending
      }));
    } else {
      // All party members acted, monsters' turn
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
    setCombatState({ active: false, monsters: [], targetIndex: 0, turn: 0, currentCharIndex: 0, defending: false });
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
      className="min-h-screen bg-neutral-950 p-4 md:p-8 flex items-center justify-center relative overflow-hidden outline-none">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 scanlines z-50 pointer-events-none opacity-20" />
      
      <div className="max-w-5xl w-full relative z-10 space-y-4">
        {/* TOP: Player Health Bars */}
        <div className="bg-black/80 border-2 border-primary/50 p-3 flex justify-around gap-4">
          {game.party.map((char) => (
            <div key={char.id} className="flex-1 max-w-48">
              <div className="flex items-center justify-between mb-1">
                <span className="font-pixel text-xs text-primary">{char.name}</span>
                <span className="font-retro text-xs text-muted-foreground">Lv.{char.level}</span>
              </div>
              <StatBar label="HP" current={char.hp} max={getEffectiveStats(char).maxHp} color={char.color} />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Commands */}
        <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
          <RetroCard title="COMMANDS" className="h-full">
            <div className="grid grid-cols-2 gap-2">
              <RetroButton onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "SAVING..." : "SAVE"} <Save className="w-3 h-3 ml-2 inline" />
              </RetroButton>
              <RetroButton onClick={() => logout()} variant="danger">
                EXIT <LogOut className="w-3 h-3 ml-2 inline" />
              </RetroButton>
            </div>
          </RetroCard>
        </div>

        {/* CENTER COLUMN: Viewport */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <RetroCard className="p-1 bg-neutral-900 border-primary">
            <div className="relative aspect-[4/3] w-full bg-black overflow-hidden">
              {/* Always show dungeon view as background */}
              <DungeonView gameData={game} className="w-full h-full" />
              
              {/* Mini Map in top left (toggle with M key) */}
              {showMiniMap && (
              <div className="absolute top-2 left-2 z-30 bg-black/70 border border-primary/50 rounded p-1">
                <div className="grid gap-[1px]" style={{ 
                  gridTemplateColumns: `repeat(${Math.min(game.map[0]?.length || 15, 15)}, 6px)` 
                }}>
                  {game.map.slice(0, 15).map((row, y) => 
                    row.slice(0, 15).map((cell, x) => {
                      const isPlayer = x === game.x && y === game.y;
                      const isWall = cell === 1;
                      const isDoor = cell === 2;
                      return (
                        <div
                          key={`${x}-${y}`}
                          className={`w-[6px] h-[6px] ${
                            isPlayer 
                              ? 'bg-yellow-400' 
                              : isDoor
                                ? 'bg-amber-700'
                                : isWall 
                                  ? 'bg-stone-600' 
                                  : 'bg-stone-900'
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
              )}
              
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
            <div className="h-32 bg-black border-t-2 border-primary/20 p-4 font-retro text-lg overflow-hidden flex flex-col justify-end">
              {logs.map((msg, i) => (
                <div key={i} className={`opacity-${100 - i * 20} ${i===0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {i === 0 ? '> ' : '  '}{msg}
                </div>
              ))}
            </div>
            
            {/* Movement Controls */}
            <div className="bg-black/60 p-4 border-t-2 border-primary/20 flex justify-center">
              <div className="grid grid-cols-3 gap-2 place-items-center">
                <div />
                <RetroButton onClick={() => {
                  if (game.dir === NORTH) move(0, -1);
                  if (game.dir === SOUTH) move(0, 1);
                  if (game.dir === EAST) move(1, 0);
                  if (game.dir === WEST) move(-1, 0);
                }} className="w-12 h-12 p-0 flex items-center justify-center" data-testid="button-forward">
                  <ArrowUp className="w-5 h-5" />
                </RetroButton>
                <div />
                
                <RetroButton onClick={() => rotate('left')} className="w-12 h-12 p-0 flex items-center justify-center" data-testid="button-rotate-left">
                  <RotateCcw className="w-5 h-5" />
                </RetroButton>
                <div className="w-12 h-12 flex items-center justify-center text-xs text-muted-foreground font-pixel">
                  WASD
                </div>
                <RetroButton onClick={() => rotate('right')} className="w-12 h-12 p-0 flex items-center justify-center" data-testid="button-rotate-right">
                  <RotateCw className="w-5 h-5" />
                </RetroButton>
              </div>
            </div>
          </RetroCard>
        </div>

        {/* RIGHT COLUMN: Party Stats */}
        <div className="lg:col-span-3 order-3">
          <RetroCard title="PARTY STATUS" className="h-full space-y-4">
            {game.party.map((char) => (
              <div key={char.id} className="bg-black/40 p-3 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-xs text-primary">{char.name}</span>
                  <span className="font-retro text-muted-foreground text-sm">Lv.{char.level} {char.job}</span>
                </div>
                <div className="space-y-1">
                  <StatBar label="HP" current={char.hp} max={getEffectiveStats(char).maxHp} color={char.color} />
                  <StatBar label="MP" current={char.mp} max={getEffectiveStats(char).maxMp} color="#3498db" />
                  <StatBar label="XP" current={char.xp} max={xpForLevel(char.level + 1)} color="#f39c12" />
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-4 border-t border-border">
              <div className="flex justify-between font-retro text-xl text-yellow-500">
                <span>GOLD</span>
                <span>{game.gold}</span>
              </div>
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
          </RetroCard>
          
          {/* Equipment Panel - Compact */}
          {showEquipment && (
            <RetroCard title="EQUIPMENT" className="mt-2">
              {/* Character Selection */}
              <div className="flex gap-1 mb-2">
                {game.party.map((char, idx) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharForEquip(idx)}
                    className={`flex-1 px-1 py-0.5 text-[10px] font-pixel rounded border transition-colors ${
                      selectedCharForEquip === idx 
                        ? 'border-primary bg-primary/20 text-primary' 
                        : 'border-border bg-black/40 text-muted-foreground hover:bg-black/60'
                    }`}
                    data-testid={`button-select-char-${idx}`}
                  >
                    {char.name}
                  </button>
                ))}
              </div>
              
              {/* Selected Character's Equipment Slots */}
              {game.party[selectedCharForEquip] && (
                <div className="space-y-1">
                  {(['weapon', 'armor', 'helmet', 'accessory'] as const).map(slot => {
                    const item = game.party[selectedCharForEquip].equipment[slot];
                    return (
                      <div 
                        key={slot} 
                        className="flex items-center justify-between bg-black/40 px-1.5 py-1 rounded border border-border/50"
                      >
                        <div className="flex-1 truncate">
                          <span className="text-[10px] font-retro text-muted-foreground capitalize">{slot}:</span>
                          {item ? (
                            <span className={`ml-1 text-[10px] font-pixel ${
                              item.rarity === 'rare' ? 'text-blue-400' : 
                              item.rarity === 'uncommon' ? 'text-green-400' : 
                              item.rarity === 'epic' ? 'text-purple-400' : 'text-foreground'
                            }`}>
                              {item.name}
                            </span>
                          ) : (
                            <span className="ml-1 text-[10px] text-muted-foreground italic">-</span>
                          )}
                        </div>
                        {item && (
                          <button
                            onClick={() => unequipItem(selectedCharForEquip, slot)}
                            className="text-[10px] px-1 bg-destructive/20 text-destructive hover:bg-destructive/40 rounded ml-1"
                            data-testid={`button-unequip-${slot}`}
                          >
                            X
                          </button>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Show effective stats - inline */}
                  <div className="flex gap-2 text-[10px] font-retro text-muted-foreground pt-1">
                    <span>ATK:{getEffectiveStats(game.party[selectedCharForEquip]).attack}</span>
                    <span>DEF:{getEffectiveStats(game.party[selectedCharForEquip]).defense}</span>
                    <span>HP:{getEffectiveStats(game.party[selectedCharForEquip]).maxHp}</span>
                    <span>MP:{getEffectiveStats(game.party[selectedCharForEquip]).maxMp}</span>
                  </div>
                </div>
              )}
              
              {/* Equipment Inventory - Compact */}
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-[10px] font-pixel text-muted-foreground mb-1">
                  Bag ({game.equipmentInventory.length})
                </div>
                {game.equipmentInventory.length === 0 ? (
                  <div className="text-[10px] text-muted-foreground italic text-center py-1">
                    Empty
                  </div>
                ) : (
                  <div className="space-y-0.5 max-h-24 overflow-y-auto">
                    {game.equipmentInventory.map((item, idx) => {
                      const char = game.party[selectedCharForEquip];
                      const canEquipThis = canEquip(char, item);
                      return (
                        <div 
                          key={`${item.id}-${idx}`}
                          className={`flex items-center justify-between bg-black/40 px-1.5 py-0.5 rounded border border-border/50 ${
                            !canEquipThis ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex-1 truncate">
                            <span className={`text-[10px] font-pixel ${
                              item.rarity === 'rare' ? 'text-blue-400' : 
                              item.rarity === 'uncommon' ? 'text-green-400' : 
                              item.rarity === 'epic' ? 'text-purple-400' : 'text-foreground'
                            }`}>
                              {item.name}
                            </span>
                          </div>
                          <button
                            onClick={() => equipItem(selectedCharForEquip, item)}
                            disabled={!canEquipThis}
                            className={`text-[10px] px-1.5 py-0.5 rounded ml-1 ${
                              canEquipThis 
                                ? 'bg-primary/20 text-primary hover:bg-primary/40' 
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                            data-testid={`button-equip-${item.id}`}
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </RetroCard>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
