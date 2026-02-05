import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useGameState, useSaveGame } from "@/hooks/use-game";
import Phase5 from "@/phases/phase5";
import Phase8 from "@/phases/phase8";
import PerfBadge from "@/components/PerfBadge";
import Renderer2DFallback from "@/components/Renderer2DFallback";
import Renderer25D from "@/components/Renderer25D";
import CombatPanel from "@/components/CombatPanel";
import TutorialOverlay from "@/components/TutorialOverlay";
import LevelEditor from "@/components/LevelEditor";
import { saveGameData, loadGameData } from "@/saves/save-system";
import FPSDisplay from "@/components/FPSDisplay";
import HUDStatus from "@/components/HUDStatus";
import HUDHeader from "@/components/HUDHeader";
import { TransparentMonster, MonsterAnimationState } from "@/components/TransparentMonster";
import { RetroCard, RetroButton, StatBar } from "@/components/RetroUI";
import { 
  GameData, createInitialState, 
  NORTH, SOUTH, EAST, WEST, 
  getRandomMonster, Monster,
  xpForLevel, getLevelUpStats, Player,
  Ability, getAbilitiesForJob, getScaledAbilityPower,
  getEffectiveStats, getCombatStats, getActiveSetBonuses, getEquippedItemsArray,
  Equipment, getRandomEquipmentDrop, canEquip,
  getEnhancedName, getEnhancedStats, PlayerEquipment,
  TILE_FLOOR, TILE_WALL, TILE_DOOR, TILE_LADDER_DOWN, TILE_LADDER_UP,
  EQUIPMENT_DATABASE, SET_BONUSES,
  generateFloorMap,
  Potion, getRandomPotionDrop
} from "@/lib/game-engine";
import { useKey } from "react-use";
import { Loader2, Skull, Sword, User, LogOut, Save, RotateCw, RotateCcw, ArrowUp, ChevronDown, Backpack, Settings, HelpCircle, X, Maximize2, Minimize2 } from "lucide-react";

// Graphics resolution presets
type GraphicsQuality = 'high' | 'medium' | 'low';
const RESOLUTION_PRESETS: Record<GraphicsQuality, { width: number; height: number; label: string }> = {
  high: { width: 800, height: 600, label: 'High (800x600)' },
  medium: { width: 640, height: 480, label: 'Medium (640x480)' },
  low: { width: 400, height: 300, label: 'Low (400x300)' }
};

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
    turnOrder: number[],
    turnOrderPosition: number,
    defending: boolean 
  }>({ active: false, monsters: [], targetIndex: 0, turn: 0, currentCharIndex: 0, turnOrder: [], turnOrderPosition: 0, defending: false });
  const [monsterAnimations, setMonsterAnimations] = useState<{ [key: number]: MonsterAnimationState }>({});
  const [showGameOver, setShowGameOver] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>('high');
  const [showSettings, setShowSettings] = useState(false);
  const [levelEditorOpen, setLevelEditorOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showCheatMenu, setShowCheatMenu] = useState(false);
  const [isCombatFullscreen, setIsCombatFullscreen] = useState(false);

  // Log helper
  const log = useCallback((msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  }, []);

  // Initialize game
  useEffect(() => {
    if (!isLoading) {
      if (serverState?.data) {
        setGame(serverState.data as GameData);
        log("Game loaded from server.");
      } else {
        const newGame = createInitialState();
        setGame(newGame);
        log("New game started.");
      }
    }
  }, [serverState, isLoading]);

  // Check for tutorial
  useEffect(() => {
    const done = localStorage.getItem('tutorial_completed');
    if (!done) {
      setShowTutorial(true);
    }
  }, []);

  // Enable performance mode on startup
  useEffect(() => {
    try {
      if (!Phase8.isPerformanceEnabled()) {
        Phase8.enablePerformanceMode();
      }
    } catch {
      // ignore
    }
  }, []);

  // Keyboard handler - P for combat, L for level editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key === 'p') {
        console.log('P key pressed!', { game: !!game, combatActive: combatState.active });
        e.preventDefault();
        e.stopPropagation();
        
        if (game && !combatState.active) {
          console.log('Starting Phase 5 combat...');
          const next = Phase5.startPhase5(game);
          if (next) {
            setGame(next);
            if (next.combatState) {
              setCombatState(next.combatState);
            }
            log("Phase 5 combat started! Use Attack button to fight.");
          }
        } else {
          console.log('Cannot start combat:', { hasGame: !!game, combatActive: combatState.active });
        }
      }
      
      if (key === 'l') {
        e.preventDefault();
        setLevelEditorOpen(v => !v);
      }
      
      // MOVEMENT: WASD or Arrow keys
      if (!combatState.active && game) {
        let dx = 0, dy = 0;
        let newDir = game.dir;
        
        if (key === 'w' || key === 'arrowup') {
          dy = -1;
          newDir = NORTH;
        } else if (key === 's' || key === 'arrowdown') {
          dy = 1;
          newDir = SOUTH;
        } else if (key === 'a' || key === 'arrowleft') {
          dx = -1;
          newDir = WEST;
        } else if (key === 'd' || key === 'arrowright') {
          dx = 1;
          newDir = EAST;
        }
        
        if (dx !== 0 || dy !== 0) {
          e.preventDefault();
          const newX = game.x + dx;
          const newY = game.y + dy;
          
          // Check bounds and walls
          if (newY >= 0 && newY < game.map.length && 
              newX >= 0 && newX < game.map[0].length &&
              game.map[newY][newX] !== TILE_WALL) {
            setGame({
              ...game,
              x: newX,
              y: newY,
              dir: newDir
            });
          } else {
            // Just turn if blocked
            setGame({
              ...game,
              dir: newDir
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    console.log('Keyboard handler registered');
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game, combatState.active, log]);

  // Combat action handlers
  const handlePlayerAttack = () => {
    if (!combatState.active) return;
    const res1 = Phase5.doPlayerAttack(game);
    let g = res1.game;
    if (res1.ok && g) {
      const resM = Phase5.monstersTurn(g);
      if (resM.ok) {
        g = resM.game;
        const allMonstersDead = combatState.monsters?.every((m: any) => m.hp <= 0);
        if (allMonstersDead) {
          const end = Phase5.resolvePhase5End(g);
          if (end.ok) {
            setGame(end.game);
            setCombatState({ active: false, monsters: [], targetIndex: 0, turn: 0, currentCharIndex: 0, turnOrder: [], turnOrderPosition: 0, defending: false });
            return;
          }
        }
        setGame(g);
      }
    }
  };

  if (!game) {
    return <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white w-full">
      {/* HUD Elements */}
      <HUDHeader game={game} />
      <HUDStatus game={game} />
      <FPSDisplay />
      <PerfBadge />

      {/* Main Viewport */}
      <div className="relative aspect-[4/3] w-full bg-black overflow-hidden rounded-lg">
        <Renderer25D
          gameData={game}
          map={game.map}
          width={RESOLUTION_PRESETS[graphicsQuality].width}
          height={RESOLUTION_PRESETS[graphicsQuality].height}
        />

        {/* Mini Map */}
        {showMiniMap && (
          <div className="absolute top-3 left-3 z-30 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-2 shadow-xl">
            <div className="text-[10px] text-amber-400 font-bold text-center mb-1.5 tracking-wider">
              FLOOR {game.level}
            </div>
            {/* Mini map grid would go here */}
          </div>
        )}

        {/* Combat Panel */}
        {combatState.active && (
          <div className="absolute bottom-4 left-4 right-4 z-50 flex justify-center">
            <CombatPanel
              onAttack={handlePlayerAttack}
              onDefend={() => {}}
              onItem={() => {}}
              onFlee={() => {}}
              logs={logs}
              monsters={combatState.monsters}
            />
          </div>
        )}

      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay 
          onClose={() => {
            setShowTutorial(false);
            localStorage.setItem('tutorial_completed', '1');
          }}
          steps={[
            { title: 'Welcome', body: 'Use WASD or Arrow keys to move. Press P to start combat when you encounter enemies.' },
            { title: 'Combat', body: 'In combat, use Attack to fight, Defend to reduce damage, or Flee to escape. Watch your HP!' },
            { title: 'Progress', body: 'Defeat enemies to gain XP and loot. Clear the floor to advance to deeper, more dangerous levels.' }
          ]}
        />
      )}
      </div>

      {/* Level Editor */}
      {levelEditorOpen && (
        <LevelEditor onClose={() => setLevelEditorOpen(false)} />
      )}

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-400">
        Press P to start combat | L for Level Editor | WASD to move
      </div>

      {/* DEBUG: Start Combat Button */}
      {!combatState.active && (
        <button 
          onClick={() => {
            console.log('Button clicked - starting combat');
            if (game) {
              const next = Phase5.startPhase5(game);
              if (next) {
                setGame(next);
                if (next.combatState) {
                  setCombatState(next.combatState);
                }
                log("Phase 5 combat started!");
              }
            }
          }}
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '20px',
            padding: '12px 24px',
            background: '#f59e0b',
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '8px',
            zIndex: 10000
          }}
        >
          🎮 START COMBAT (Click or Press P)
        </button>
      )}
    </div>
  );
}
