import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGameState, useSaveGame } from "@/hooks/use-game";
import { DungeonView } from "@/components/DungeonView";
import { TransparentMonster } from "@/components/TransparentMonster";
import { RetroCard, RetroButton, StatBar } from "@/components/RetroUI";
import { 
  GameData, createInitialState, 
  NORTH, SOUTH, EAST, WEST, 
  getRandomMonster, Monster 
} from "@/lib/game-engine";
import { useKey } from "react-use";
import { Loader2, Skull, Sword, User, LogOut, Save, RotateCw, RotateCcw, ArrowUp } from "lucide-react";

export default function Game() {
  const { user, logout } = useAuth();
  const { data: serverState, isLoading } = useGameState();
  const saveMutation = useSaveGame();

  const [game, setGame] = useState<GameData | null>(null);
  const [logs, setLogs] = useState<string[]>(["Welcome to the dungeon..."]);
  const [combatState, setCombatState] = useState<{ active: boolean, monster?: Monster, turn: number }>({ active: false, turn: 0 });

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
      setCombatState({ active: true, monster, turn: 0 });
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
  useKey(' ', () => {
    if (combatState.active && combatState.monster) {
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

  const handleAttack = () => {
    if (!combatState.monster || !game) return;
    
    // Blur active element to restore keyboard focus
    (document.activeElement as HTMLElement)?.blur();
    
    // Player Turn
    const damage = Math.max(1, Math.floor(game.party[0].attack - (combatState.monster.defense / 2)));
    const newMonsterHp = combatState.monster.hp - damage;
    log(`You hit ${combatState.monster.name} for ${damage} dmg!`);

    if (newMonsterHp <= 0) {
      // Victory
      log(`Defeated ${combatState.monster.name}! +${combatState.monster.xpValue} XP`);
      setCombatState({ active: false, turn: 0 });
      return;
    }

    // Monster Turn
    const monsterDmg = Math.max(1, Math.floor(combatState.monster.attack - (game.party[0].defense / 2)));
    const newParty = [...game.party];
    newParty[0].hp = Math.max(0, newParty[0].hp - monsterDmg);
    log(`${combatState.monster.name} hits you for ${monsterDmg} dmg!`);

    setGame(prev => prev ? ({ ...prev, party: newParty }) : null);
    setCombatState(prev => ({ ...prev, monster: { ...prev.monster!, hp: newMonsterHp } }));

    if (newParty[0].hp <= 0) {
      log("GAME OVER");
      // Could reset game here or show modal
    }
  };

  const handleRun = () => {
    (document.activeElement as HTMLElement)?.blur();
    setCombatState({ active: false, turn: 0 });
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
    <div className="min-h-screen bg-neutral-950 p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 scanlines z-50 pointer-events-none opacity-20" />
      
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: Controls & Info */}
        <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
          <RetroCard title="COMMANDS" className="h-full">
            <div className="grid grid-cols-2 gap-2 mb-6">
              <RetroButton onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "SAVING..." : "SAVE"} <Save className="w-3 h-3 ml-2 inline" />
              </RetroButton>
              <RetroButton onClick={() => logout()} variant="danger">
                EXIT <LogOut className="w-3 h-3 ml-2 inline" />
              </RetroButton>
            </div>

            <div className="bg-black/40 p-4 rounded border border-border">
              <h3 className="font-pixel text-xs mb-2 text-muted-foreground">CONTROLS</h3>
              <div className="grid grid-cols-3 gap-1 place-items-center">
                <div />
                <RetroButton onClick={() => {
                  if (game.dir === NORTH) move(0, -1);
                  if (game.dir === SOUTH) move(0, 1);
                  if (game.dir === EAST) move(1, 0);
                  if (game.dir === WEST) move(-1, 0);
                }} className="w-10 h-10 p-0 flex items-center justify-center">
                  <ArrowUp className="w-4 h-4" />
                </RetroButton>
                <div />
                
                <RetroButton onClick={() => rotate('left')} className="w-10 h-10 p-0 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </RetroButton>
                <div className="w-10 h-10 flex items-center justify-center text-xs text-muted-foreground font-pixel">
                  WASD
                </div>
                <RetroButton onClick={() => rotate('right')} className="w-10 h-10 p-0 flex items-center justify-center">
                  <RotateCw className="w-4 h-4" />
                </RetroButton>
              </div>
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
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="font-pixel text-destructive text-sm mb-1">{combatState.monster.name}</h2>
                        <StatBar 
                          label="HP" 
                          current={combatState.monster.hp} 
                          max={combatState.monster.maxHp} 
                          color={combatState.monster.color} 
                        />
                      </div>
                      <div className="flex gap-2">
                        <RetroButton onClick={handleAttack} className="px-4 py-2" data-testid="button-attack">
                          <Sword className="w-4 h-4 mr-1 inline" /> ATTACK
                        </RetroButton>
                        <RetroButton onClick={handleRun} variant="ghost" className="px-4 py-2" data-testid="button-run">
                          RUN
                        </RetroButton>
                      </div>
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
          </RetroCard>
        </div>

        {/* RIGHT COLUMN: Party Stats */}
        <div className="lg:col-span-3 order-3">
          <RetroCard title="PARTY STATUS" className="h-full space-y-4">
            {game.party.map((char) => (
              <div key={char.id} className="bg-black/40 p-3 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-xs text-primary">{char.name}</span>
                  <span className="font-retro text-muted-foreground text-sm">{char.job}</span>
                </div>
                <div className="space-y-1">
                  <StatBar label="HP" current={char.hp} max={char.maxHp} color={char.color} />
                  <StatBar label="MP" current={char.mp} max={char.maxMp} color="#3498db" />
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
  );
}
