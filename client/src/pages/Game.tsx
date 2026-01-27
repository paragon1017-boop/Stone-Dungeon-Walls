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
  Ability, getAbilitiesForJob
} from "@/lib/game-engine";
import { useKey } from "react-use";
import { Loader2, Skull, Sword, User, LogOut, Save, RotateCw, RotateCcw, ArrowUp } from "lucide-react";

export default function Game() {
  const { user, logout } = useAuth();
  const { data: serverState, isLoading } = useGameState();
  const saveMutation = useSaveGame();

  const [game, setGame] = useState<GameData | null>(null);
  const [logs, setLogs] = useState<string[]>(["Welcome to the dungeon..."]);
  const [combatState, setCombatState] = useState<{ 
    active: boolean, 
    monster?: Monster, 
    turn: number,
    currentCharIndex: number,
    defending: boolean 
  }>({ active: false, turn: 0, currentCharIndex: 0, defending: false });
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
        setGame(serverState.data as unknown as GameData);
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

    // Wall collision
    if (game.map[ny][nx] === 1) {
      log("Blocked.");
      return;
    }

    setGame(prev => prev ? ({ ...prev, x: nx, y: ny }) : null);

    // Random Encounter Chance (10%)
    if (Math.random() < 0.1) {
      const monster = getRandomMonster(game.level);
      setCombatState({ active: true, monster, turn: 0, currentCharIndex: 0, defending: false });
      log(`A wild ${monster.name} appeared!`);
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

  // Combat keyboard shortcuts
  useKey(' ', (e) => {
    if (combatState.active && combatState.monster) {
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

  const monsterTurn = useCallback((newMonsterHp: number, defendingActive: boolean) => {
    if (!combatState.monster || !game) return;
    
    // Monster attacks a random alive party member
    const aliveMembers = game.party.filter(c => c.hp > 0);
    if (aliveMembers.length === 0) {
      log("GAME OVER");
      return;
    }
    
    const targetIdx = Math.floor(Math.random() * aliveMembers.length);
    const target = aliveMembers[targetIdx];
    const defenseMultiplier = defendingActive ? 2 : 1;
    const monsterDmg = Math.max(1, Math.floor(combatState.monster.attack - (target.defense * defenseMultiplier / 2)));
    
    const newParty = game.party.map(c => 
      c.id === target.id ? { ...c, hp: Math.max(0, c.hp - monsterDmg) } : c
    );
    
    log(`${combatState.monster.name} hits ${target.name} for ${monsterDmg} dmg!`);
    
    setGame(prev => prev ? ({ ...prev, party: newParty }) : null);
    setCombatState(prev => ({ 
      ...prev, 
      monster: { ...prev.monster!, hp: newMonsterHp },
      currentCharIndex: 0,
      defending: false
    }));
    
    if (newParty.every(c => c.hp <= 0)) {
      log("GAME OVER");
    }
  }, [combatState.monster, game, log]);

  const useAbility = (ability: Ability, charIndex: number) => {
    if (!combatState.monster || !game) return;
    
    (document.activeElement as HTMLElement)?.blur();
    
    const char = game.party[charIndex];
    
    // Check MP cost
    if (ability.mpCost > char.mp) {
      log(`${char.name} doesn't have enough MP!`);
      return;
    }
    
    let newMonsterHp = combatState.monster.hp;
    let newParty = [...game.party];
    let isDefending = combatState.defending;
    
    // Deduct MP
    if (ability.mpCost > 0) {
      newParty[charIndex] = { ...newParty[charIndex], mp: char.mp - ability.mpCost };
    }
    
    switch (ability.type) {
      case 'attack': {
        const damage = Math.max(1, Math.floor(char.attack * ability.power - (combatState.monster.defense / 2)));
        newMonsterHp = combatState.monster.hp - damage;
        log(`${char.name} uses ${ability.name}! ${damage} damage!`);
        break;
      }
      case 'heal': {
        // Meditate heals self, other heals heal the most injured party member
        let targetIdx: number;
        if (ability.id === 'meditate') {
          targetIdx = charIndex;
        } else {
          // Heal the most injured party member
          targetIdx = newParty.reduce((minIdx, c, idx) => 
            c.hp > 0 && (c.hp / c.maxHp) < (newParty[minIdx].hp / newParty[minIdx].maxHp) ? idx : minIdx, 0);
        }
        const healAmount = Math.min(ability.power, newParty[targetIdx].maxHp - newParty[targetIdx].hp);
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
    
    // Check for victory
    if (newMonsterHp <= 0) {
      const xpGained = combatState.monster.xpValue;
      log(`Defeated ${combatState.monster.name}! +${xpGained} XP`);
      setCombatState({ active: false, turn: 0, currentCharIndex: 0, defending: false });
      setTimeout(() => awardXP(xpGained), 100);
      return;
    }
    
    // Find next alive character's turn or monster's turn
    let nextCharIdx = charIndex + 1;
    while (nextCharIdx < game.party.length && game.party[nextCharIdx].hp <= 0) {
      nextCharIdx++;
    }
    
    if (nextCharIdx < game.party.length) {
      setCombatState(prev => ({ 
        ...prev, 
        monster: { ...prev.monster!, hp: newMonsterHp },
        currentCharIndex: nextCharIdx,
        defending: isDefending
      }));
    } else {
      // All party members acted, monster's turn
      setTimeout(() => monsterTurn(newMonsterHp, isDefending), 500);
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
    setCombatState({ active: false, turn: 0, currentCharIndex: 0, defending: false });
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
              <StatBar label="HP" current={char.hp} max={char.maxHp} color={char.color} />
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
              
              {/* Monster overlay during combat */}
              {combatState.active && combatState.monster && (
                <>
                  {/* Monster sprite centered in dungeon view */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <div className="animate-in fade-in zoom-in duration-300">
                      {combatState.monster.image ? (
                        <TransparentMonster 
                          src={combatState.monster.image} 
                          alt={combatState.monster.name} 
                          className="w-56 h-56 object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]" 
                        />
                      ) : (
                        <Skull className="w-32 h-32 text-red-500 drop-shadow-lg" />
                      )}
                    </div>
                  </div>
                  
                  {/* Combat UI overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4">
                    <div className="space-y-3">
                      {/* Monster HP */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h2 className="font-pixel text-destructive text-sm mb-1">{combatState.monster.name}</h2>
                          <StatBar 
                            label="HP" 
                            current={combatState.monster.hp} 
                            max={combatState.monster.maxHp} 
                            color={combatState.monster.color} 
                          />
                        </div>
                      </div>
                      
                      {/* Current Character Turn */}
                      {game.party[combatState.currentCharIndex] && game.party[combatState.currentCharIndex].hp > 0 && (
                        <div className="bg-black/60 p-2 rounded border border-primary/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-pixel text-xs text-primary">
                              {game.party[combatState.currentCharIndex].name}'s Turn
                            </span>
                            <span className="font-retro text-xs text-blue-400">
                              MP: {game.party[combatState.currentCharIndex].mp}/{game.party[combatState.currentCharIndex].maxMp}
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
                  <StatBar label="HP" current={char.hp} max={char.maxHp} color={char.color} />
                  <StatBar label="MP" current={char.mp} max={char.maxMp} color="#3498db" />
                  <StatBar label="XP" current={char.xp} max={xpForLevel(char.level + 1)} color="#f39c12" />
                </div>
              </div>
            ))}
            
            <div className="mt-8 p-4 border-t border-border">
              <div className="flex justify-between font-retro text-xl text-yellow-500">
                <span>GOLD</span>
                <span>{game.gold}</span>
              </div>
            </div>
          </RetroCard>
        </div>
        </div>
      </div>
    </div>
  );
}
