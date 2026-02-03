import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGameState, useSaveGame } from "@/hooks/use-game";
import { DungeonView } from "@/components/DungeonView";
import dungeonWallBg from "@assets/Gemini_Generated_Image_8w52n78w52n78w52_1769494784513.png";
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
    turnOrder: number[],  // Party member indices sorted by speed (highest first)
    turnOrderPosition: number,  // Current position in turnOrder
    defending: boolean 
  }>({ active: false, monsters: [], targetIndex: 0, turn: 0, currentCharIndex: 0, turnOrder: [], turnOrderPosition: 0, defending: false });
  const [monsterAnimations, setMonsterAnimations] = useState<{ [key: number]: MonsterAnimationState }>({});
  
  // Track monster status effects (burn damage, slow, etc.)
  const [monsterEffects, setMonsterEffects] = useState<{ 
    [monsterId: string]: { 
      burn?: number;  // Burn damage per turn
      slow?: number;  // Speed reduction percentage
      frozen?: boolean; // Skip next turn
      tauntTarget?: number; // Index of party member to attack
      tauntTurns?: number; // Remaining turns for taunt
      attackDebuff?: number; // Attack reduction
    } 
  }>({});
  
  // Track party-level combat effects
  const [partyEffects, setPartyEffects] = useState<{
    [charId: string]: {
      stealth?: number; // Chance to dodge attacks (persists for battle)
    }
  }>({});
  
  // Helper to check if monster is flying type
  const isFlying = (name: string) => {
    const flyingMonsters = ['cave bat', 'shadow wisp', 'harpy', 'wraith', 'gargoyle'];
    return flyingMonsters.some(f => name.toLowerCase().includes(f));
  };
  
  // Trigger monster animation
  const triggerMonsterAnimation = (monsterIndex: number, state: MonsterAnimationState, duration: number = 600) => {
    setMonsterAnimations(prev => ({ ...prev, [monsterIndex]: state }));
    setTimeout(() => {
      setMonsterAnimations(prev => ({ ...prev, [monsterIndex]: 'idle' }));
    }, duration);
  };
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showEquipment, setShowEquipment] = useState(false);
  const showEquipmentRef = useRef(showEquipment);
  useEffect(() => { showEquipmentRef.current = showEquipment; }, [showEquipment]);
  const [showStats, setShowStats] = useState(false);
  const showStatsRef = useRef(showStats);
  useEffect(() => { showStatsRef.current = showStats; }, [showStats]);
  const [showInventory, setShowInventory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpFilter, setHelpFilter] = useState<string>('all');
  const [helpTab, setHelpTab] = useState<'items' | 'sets'>('items');
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>('high');
  const [showSettings, setShowSettings] = useState(false);
  const [showCheatMenu, setShowCheatMenu] = useState(false);
  const [isCombatFullscreen, setIsCombatFullscreen] = useState(false);
  const [combatTransition, setCombatTransition] = useState<'none' | 'entering' | 'active'>('none');
  const [selectedCharForEquip, setSelectedCharForEquip] = useState(0);
  const [selectedCharForStats, setSelectedCharForStats] = useState(0);
  const [selectedCharForPotion, setSelectedCharForPotion] = useState(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // Visual position for smooth movement interpolation
  const [visualPos, setVisualPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const visualPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isAnimatingRef = useRef(false);
  
  // Refs to access current state in keyboard handlers without re-registering hooks
  const gameRef = useRef<GameData | null>(null);
  const combatActiveRef = useRef(false);
  
  // Keep refs in sync with state
  useEffect(() => {
    gameRef.current = game;
  }, [game]);
  
  useEffect(() => {
    combatActiveRef.current = combatState.active;
  }, [combatState.active]);

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
        
        // Add equipment to party members if missing (migrate old saves)
        const migratedParty = loadedData.party.map(char => {
          if (!char.equipment) {
            return {
              ...char,
              equipment: { weapon: null, shield: null, armor: null, helmet: null, gloves: null, boots: null, necklace: null, ring1: null, ring2: null, relic: null, offhand: null }
            };
          }
          // Migrate old equipment format (add missing slots)
          // Handle legacy 'accessory' slot -> migrate to ring1
          const legacyAccessory = (char.equipment as any).accessory ?? null;
          const existingRing1 = (char.equipment as any).ring1 ?? null;
          const existingRing2 = (char.equipment as any).ring2 ?? null;
          
          // Class-based slot restrictions:
          // Fighter: can use shield (no offhand/relic)
          // Mage: can use offhand and relic (no shield)
          // Monk: can use offhand (no shield/relic)
          const job = char.job;
          const canUseShield = job === 'Fighter';
          const canUseOffhand = job !== 'Fighter';
          const canUseRelic = job === 'Mage';
          
          const migratedEquipment = {
            weapon: char.equipment.weapon ?? null,
            // Clear shield for non-Fighters
            shield: canUseShield ? (char.equipment.shield ?? null) : null,
            armor: char.equipment.armor ?? null,
            helmet: char.equipment.helmet ?? null,
            gloves: char.equipment.gloves ?? null,
            boots: (char.equipment as any).boots ?? null,
            necklace: (char.equipment as any).necklace ?? null,
            // Migrate legacy accessory to ring1 if ring1 is empty, else to ring2
            ring1: existingRing1 ?? legacyAccessory ?? null,
            ring2: existingRing2 ?? (existingRing1 ? legacyAccessory : null) ?? null,
            // Clear relic for non-Mages
            relic: canUseRelic ? ((char.equipment as any).relic ?? null) : null,
            // Clear offhand for Fighters
            offhand: canUseOffhand ? ((char.equipment as any).offhand ?? null) : null,
          };
          return { ...char, equipment: migratedEquipment };
        });
        
        // Add equipmentInventory and potionInventory if missing
        const migratedData: GameData = {
          ...loadedData,
          party: migratedParty,
          equipmentInventory: loadedData.equipmentInventory || [],
          potionInventory: loadedData.potionInventory || [],
        };
        
        setGame(migratedData);
        // Initialize visual position to match loaded game
        setVisualPos({ x: migratedData.x, y: migratedData.y });
        visualPosRef.current = { x: migratedData.x, y: migratedData.y };
        targetPosRef.current = { x: migratedData.x, y: migratedData.y };
        log("Game loaded from server.");
      } else {
        const newGame = createInitialState();
        setGame(newGame);
        // Initialize visual position for new game
        setVisualPos({ x: newGame.x, y: newGame.y });
        visualPosRef.current = { x: newGame.x, y: newGame.y };
        targetPosRef.current = { x: newGame.x, y: newGame.y };
        log("New game started.");
      }
    }
  }, [serverState, isLoading]);

  // Smooth movement interpolation animation loop
  useEffect(() => {
    const INTERPOLATION_SPEED = 20; // Higher = faster movement (tiles per second)
    let animationId: number;
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000; // Convert to seconds
      lastTime = time;
      
      const current = visualPosRef.current;
      const target = targetPosRef.current;
      
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0.01) {
        // Move toward target at constant speed
        const moveAmount = Math.min(distance, INTERPOLATION_SPEED * deltaTime);
        const ratio = moveAmount / distance;
        
        const newX = current.x + dx * ratio;
        const newY = current.y + dy * ratio;
        
        visualPosRef.current = { x: newX, y: newY };
        setVisualPos({ x: newX, y: newY });
        isAnimatingRef.current = true;
      } else if (isAnimatingRef.current) {
        // Snap to target when close enough
        visualPosRef.current = { x: target.x, y: target.y };
        setVisualPos({ x: target.x, y: target.y });
        isAnimatingRef.current = false;
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const log = useCallback((msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  }, []);

  const move = useCallback((dx: number, dy: number) => {
    const currentGame = gameRef.current;
    if (!currentGame || combatActiveRef.current || showEquipmentRef.current || showStatsRef.current) return;
    
    const nx = currentGame.x + dx;
    const ny = currentGame.y + dy;

    // Check bounds
    if (ny < 0 || ny >= currentGame.map.length || nx < 0 || nx >= currentGame.map[0].length) {
      log("Blocked.");
      return;
    }

    const tile = currentGame.map[ny][nx];
    // Wall/door collision (1 = wall, 2 = door) - can walk on floor, ladder down, ladder up
    if (tile === TILE_WALL || tile === TILE_DOOR) {
      log("Blocked.");
      return;
    }

    setGame(prev => prev ? ({ ...prev, x: nx, y: ny }) : null);
    
    // Update target position for smooth interpolation
    targetPosRef.current = { x: nx, y: ny };

    // Check for ladder tiles and show prompt
    if (tile === TILE_LADDER_DOWN) {
      log("A ladder leading deeper! Press SPACE to descend.");
    } else if (tile === TILE_LADDER_UP && currentGame.level > 1) {
      log("A ladder leading up! Press SPACE to climb.");
    }

    // Random Encounter Chance (10%) - not on ladder tiles
    if (tile === TILE_FLOOR && Math.random() < 0.1) {
      // Spawn 1-5 monsters, more likely to have multiple on deeper floors
      // Level 1-2: 1-2 monsters, Level 3+: 1-3 monsters (max 3)
      const baseCount = 1 + Math.floor(Math.random() * 2); // 1-2 base
      const levelBonus = currentGame.level >= 3 ? 1 : 0; // +1 at level 3+
      const maxMonsters = Math.min(3, 2 + Math.floor(currentGame.level / 3)); // Cap at 3
      const extraMonsters = Math.random() < 0.25 + (currentGame.level * 0.05) ? levelBonus : 0; // Chance for extras
      const monsterCount = Math.min(maxMonsters, baseCount + extraMonsters);
      const monsters: Monster[] = [];
      for (let i = 0; i < monsterCount; i++) {
        monsters.push(getRandomMonster(currentGame.level));
      }
      
      // Calculate turn order based on speed (highest speed goes first)
      const partyWithSpeed = currentGame.party
        .map((char, idx) => ({ idx, speed: char.hp > 0 ? getEffectiveStats(char).speed : -1 }))
        .filter(c => c.speed >= 0)
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
      
      // Trigger combat transition animation
      setCombatTransition('entering');
      setTimeout(() => {
        setIsCombatFullscreen(true);
        setCombatTransition('active');
      }, 650); // Dramatic transition with animations
      
      // Trigger entrance animation for all monsters
      monsters.forEach((_, idx) => {
        setTimeout(() => {
          triggerMonsterAnimation(idx, 'entrance', 800);
        }, idx * 150);
      });
      
      if (monsterCount === 1) {
        log(`A wild ${monsters[0].name} appeared!`);
      } else {
        log(`${monsterCount} monsters appeared!`);
      }
    }
  }, [log]);

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
      // Snap visual position immediately on level change
      setVisualPos({ x: startX, y: startY });
      visualPosRef.current = { x: startX, y: startY };
      targetPosRef.current = { x: startX, y: startY };
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
      // Snap visual position immediately on level change
      setVisualPos({ x: ladderDownX, y: ladderDownY });
      visualPosRef.current = { x: ladderDownX, y: ladderDownY };
      targetPosRef.current = { x: ladderDownX, y: ladderDownY };
      log(`Ascended to Floor ${newFloor}. The air feels lighter.`);
    }
  }, [game, combatState.active, log]);

  const rotate = useCallback((dir: 'left' | 'right') => {
    if (!gameRef.current || combatActiveRef.current) return;
    setGame(prev => {
      if (!prev) return null;
      let newDir = prev.dir;
      if (dir === 'left') newDir = (prev.dir - 1 + 4) % 4 as any;
      if (dir === 'right') newDir = (prev.dir + 1) % 4 as any;
      return { ...prev, dir: newDir };
    });
  }, []);

  // Movement controls - using held-key tracking for smooth, responsive input
  // Single keypress = immediate move, held key = continuous movement at MOVE_DELAY intervals
  const heldKeys = useRef<Set<string>>(new Set());
  const lastMoveTime = useRef<number>(0);
  const MOVE_DELAY = 100; // ms between moves when holding key (faster movement)
  const INITIAL_DELAY = 120; // ms before continuous movement starts
  const keyPressTime = useRef<Map<string, number>>(new Map());
  
  // Movement execution helper
  const executeMovement = useCallback((key: string) => {
    const g = gameRef.current;
    if (!g || combatActiveRef.current) return;
    
    if (key === 'arrowup' || key === 'w') {
      if (g.dir === NORTH) move(0, -1);
      else if (g.dir === SOUTH) move(0, 1);
      else if (g.dir === EAST) move(1, 0);
      else if (g.dir === WEST) move(-1, 0);
    } else if (key === 'arrowdown' || key === 's') {
      if (g.dir === NORTH) move(0, 1);
      else if (g.dir === SOUTH) move(0, -1);
      else if (g.dir === EAST) move(-1, 0);
      else if (g.dir === WEST) move(1, 0);
    } else if (key === 'arrowleft' || key === 'a') {
      rotate('left');
    } else if (key === 'arrowright' || key === 'd') {
      rotate('right');
    }
  }, [move, rotate]);
  
  useEffect(() => {
    const movementKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!movementKeys.includes(key)) return;
      
      // On first press (not repeat), execute immediately and record press time
      if (!e.repeat && !heldKeys.current.has(key)) {
        heldKeys.current.add(key);
        keyPressTime.current.set(key, performance.now());
        executeMovement(key);
        lastMoveTime.current = performance.now();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      heldKeys.current.delete(key);
      keyPressTime.current.delete(key);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [executeMovement]);
  
  // Animation frame loop for continuous movement when key is held
  useEffect(() => {
    let animationId: number;
    
    const tick = (time: number) => {
      const g = gameRef.current;
      if (g && !combatActiveRef.current && heldKeys.current.size > 0) {
        // Find the first held movement key that's been held long enough for continuous movement
        for (const key of Array.from(heldKeys.current)) {
          const pressTime = keyPressTime.current.get(key);
          if (pressTime && time - pressTime >= INITIAL_DELAY) {
            // Key held long enough - check if enough time passed since last move
            if (time - lastMoveTime.current >= MOVE_DELAY) {
              executeMovement(key);
              lastMoveTime.current = time;
              break; // Only process one movement per frame
            }
          }
        }
      }
      animationId = requestAnimationFrame(tick);
    };
    
    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [executeMovement]);
  
  // Toggle mini map
  useKey('m', () => setShowMiniMap(prev => !prev), {}, []);
  
  // Toggle cheat menu (backtick key)
  useKey('`', () => setShowCheatMenu(prev => !prev), {}, []);
  
  // ESC key to flee combat or close modals
  useKey('Escape', () => {
    // First check if equipment modal is open
    if (showEquipmentRef.current) {
      setShowEquipment(false);
      return;
    }
    // Check if stats modal is open
    if (showStatsRef.current) {
      setShowStats(false);
      return;
    }
    // Then check for combat
    if (combatActiveRef.current) {
      (document.activeElement as HTMLElement)?.blur();
      setLogs(prev => ["You fled from battle!", ...prev].slice(0, 5));
      setCombatState({ active: false, monsters: [], targetIndex: 0, turn: 0, currentCharIndex: 0, turnOrder: [], turnOrderPosition: 0, defending: false });
      setMonsterEffects({}); // Clear status effects
      setPartyEffects({}); // Clear party effects
      setIsCombatFullscreen(false);
      setCombatTransition('none');
    }
  }, {}, []);
  
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
  
  // Toggle equipment panel (E key) - switches from stats if open
  useKey('e', () => {
    if (!combatState.active) {
      if (showStatsRef.current) {
        setShowStats(false);
      }
      setShowEquipment(prev => !prev);
    }
  }, {}, [combatState.active]);
  useKey('E', () => {
    if (!combatState.active) {
      if (showStatsRef.current) {
        setShowStats(false);
      }
      setShowEquipment(prev => !prev);
    }
  }, {}, [combatState.active]);
  
  // Toggle stats panel (C key for Character stats) - switches from equipment if open
  useKey('c', () => {
    if (!combatState.active) {
      if (showEquipmentRef.current) {
        setShowEquipment(false);
      }
      setShowStats(prev => !prev);
    }
  }, {}, [combatState.active]);
  useKey('C', () => {
    if (!combatState.active) {
      if (showEquipmentRef.current) {
        setShowEquipment(false);
      }
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
    
    // Map equipment slot to player equipment slot (handle ring1/ring2)
    let playerSlot: keyof PlayerEquipment = item.slot as keyof PlayerEquipment;
    if (item.slot === 'ring') {
      // Prefer ring1 if empty, else ring2
      playerSlot = char.equipment.ring1 === null ? 'ring1' : 'ring2';
    }
    const currentEquip = char.equipment[playerSlot];
    
    // Update party with new equipment and clamp HP/MP to new effective max
    const newParty = game.party.map((c, idx) => {
      if (idx !== charIndex) return c;
      const updatedChar = {
        ...c,
        equipment: { ...c.equipment, [playerSlot]: item }
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
  const unequipItem = useCallback((charIndex: number, slot: keyof PlayerEquipment) => {
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

  const handleNewGame = () => {
    if (window.confirm("Start a new game? All unsaved progress will be lost!")) {
      const newGame = createInitialState();
      setGame(newGame);
      // Snap visual position for new game
      setVisualPos({ x: newGame.x, y: newGame.y });
      visualPosRef.current = { x: newGame.x, y: newGame.y };
      targetPosRef.current = { x: newGame.x, y: newGame.y };
      setCombatState({ active: false, monsters: [], targetIndex: 0, turn: 0, currentCharIndex: 0, turnOrder: [], turnOrderPosition: 0, defending: false });
      setMonsterEffects({});
      setPartyEffects({});
      setLogs([]);
      log("New adventure begins!");
    }
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
    
    // Apply burn damage to monsters at start of their turn
    for (let i = 0; i < updatedMonsters.length; i++) {
      const m = updatedMonsters[i];
      if (m.hp > 0 && monsterEffects[m.id]?.burn) {
        const burnDmg = monsterEffects[m.id].burn!;
        updatedMonsters[i] = { ...m, hp: m.hp - burnDmg };
        log(`${m.name} takes ${burnDmg} burn damage!`);
        if (updatedMonsters[i].hp <= 0) {
          log(`${m.name} burned to death!`);
          triggerMonsterAnimation(i, 'death', 1200);
          // Clean up effects for dead monster
          setMonsterEffects(prev => {
            const { [m.id]: _, ...rest } = prev;
            return rest;
          });
        }
      }
    }
    
    // Sort alive monsters by speed (fastest attacks first), applying slow effect
    const getEffectiveSpeed = (m: Monster) => {
      const slow = monsterEffects[m.id]?.slow || 0;
      return Math.floor(m.speed * (1 - slow / 100));
    };
    const sortedMonsters = [...updatedMonsters].filter(m => m.hp > 0).sort((a, b) => getEffectiveSpeed(b) - getEffectiveSpeed(a));
    
    for (let i = 0; i < sortedMonsters.length; i++) {
      const monster = sortedMonsters[i];
      const aliveMembersNow = newParty.filter(c => c.hp > 0);
      if (aliveMembersNow.length === 0) break;
      
      // Find original index of this monster for animation
      const originalIdx = updatedMonsters.findIndex(m => m.id === monster.id);
      
      // Check if monster is frozen (skip turn)
      const mEffects = monsterEffects[monster.id];
      if (mEffects?.frozen) {
        log(`${monster.name} is frozen and cannot act!`);
        // Clear frozen status after skipping
        setMonsterEffects(prev => ({
          ...prev,
          [monster.id]: { ...prev[monster.id], frozen: false }
        }));
        continue;
      }
      
      // Determine target - if taunted, attack the provoker
      let target: typeof aliveMembersNow[0];
      
      if (mEffects?.tauntTarget !== undefined && mEffects.tauntTurns && mEffects.tauntTurns > 0) {
        const tauntedMember = newParty[mEffects.tauntTarget];
        if (tauntedMember && tauntedMember.hp > 0) {
          target = tauntedMember;
          // Decrement taunt turns and clear debuff when it expires
          const newTauntTurns = (mEffects.tauntTurns || 1) - 1;
          setMonsterEffects(prev => ({
            ...prev,
            [monster.id]: { 
              ...prev[monster.id], 
              tauntTurns: newTauntTurns,
              ...(newTauntTurns <= 0 ? { tauntTarget: undefined, attackDebuff: 0 } : {})
            }
          }));
        } else {
          // Taunted target is dead, clear taunt and attack random
          setMonsterEffects(prev => ({
            ...prev,
            [monster.id]: { ...prev[monster.id], tauntTarget: undefined, tauntTurns: 0, attackDebuff: 0 }
          }));
          const randomIdx = Math.floor(Math.random() * aliveMembersNow.length);
          target = aliveMembersNow[randomIdx];
        }
      } else {
        const randomIdx = Math.floor(Math.random() * aliveMembersNow.length);
        target = aliveMembersNow[randomIdx];
      }
      
      const targetStats = getEffectiveStats(target);
      const targetCombatStats = getCombatStats(target);
      const defenseMultiplier = defendingActive ? 2 : 1;
      
      // Check for stealth dodge (from Monk's Stealth ability)
      const stealthChance = partyEffects[target.id]?.stealth || 0;
      if (stealthChance > 0 && Math.random() * 100 < stealthChance) {
        log(`${target.name} dodges from stealth!`);
        if (originalIdx >= 0) {
          setTimeout(() => {
            triggerMonsterAnimation(originalIdx, 'attack', 600);
          }, i * 200);
        }
        continue; // Skip damage
      }
      
      // Check for evasion (player dodges attack)
      if (targetCombatStats.evasion > 0 && Math.random() * 100 < targetCombatStats.evasion) {
        log(`${target.name} evades ${monster.name}'s attack!`);
        if (originalIdx >= 0) {
          setTimeout(() => {
            triggerMonsterAnimation(originalIdx, 'attack', 600);
          }, i * 200);
        }
        continue; // Skip damage, but still animate
      }
      
      // Apply attack debuff from Provoke
      const attackDebuff = mEffects?.attackDebuff || 0;
      const effectiveAttack = Math.max(1, monster.attack - attackDebuff);
      const monsterDmg = Math.max(1, Math.floor(effectiveAttack - (targetStats.defense * defenseMultiplier / 2)));
      
      if (originalIdx >= 0) {
        // Stagger animations for multiple monsters
        setTimeout(() => {
          triggerMonsterAnimation(originalIdx, 'attack', 600);
        }, i * 200);
      }
      
      newParty = newParty.map(c => 
        c.id === target.id ? { ...c, hp: Math.max(0, c.hp - monsterDmg) } : c
      );
      
      log(`${monster.name} hits ${target.name} for ${monsterDmg} dmg!`);
      
      // Check for counter-attack
      if (targetCombatStats.counterChance > 0 && Math.random() * 100 < targetCombatStats.counterChance) {
        const counterDamage = Math.max(1, Math.floor(targetStats.attack * 0.5)); // Counter does 50% attack damage
        const monsterIdx = updatedMonsters.findIndex(m => m.id === monster.id);
        if (monsterIdx >= 0) {
          updatedMonsters[monsterIdx] = { ...updatedMonsters[monsterIdx], hp: updatedMonsters[monsterIdx].hp - counterDamage };
          log(`${target.name} counters ${monster.name} for ${counterDamage} dmg!`);
        }
      }
    }
    
    setGame(prev => prev ? ({ ...prev, party: newParty }) : null);
    
    // Recalculate turn order for next round (based on current party speed)
    const partyWithSpeed = newParty
      .map((char, idx) => ({ idx, speed: char.hp > 0 ? getEffectiveStats(char).speed : -1 }))
      .filter(c => c.speed >= 0)
      .sort((a, b) => b.speed - a.speed);
    const newTurnOrder = partyWithSpeed.map(c => c.idx);
    
    // Check if all party members are dead
    if (newTurnOrder.length === 0 || newParty.every(c => c.hp <= 0)) {
      log("GAME OVER");
      setCombatState(prev => ({ 
        ...prev, 
        monsters: updatedMonsters,
        currentCharIndex: 0,
        turnOrder: [],
        turnOrderPosition: 0,
        defending: false
      }));
      return;
    }
    
    const firstCharIdx = newTurnOrder[0];
    
    setCombatState(prev => ({ 
      ...prev, 
      monsters: updatedMonsters,
      currentCharIndex: firstCharIdx,
      turnOrder: newTurnOrder,
      turnOrderPosition: 0,
      defending: false
    }))
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
    const combatStats = getCombatStats(char);
    
    switch (ability.type) {
      case 'attack': {
        // Apply defense penetration (reduce effective enemy defense)
        const effectiveDefense = targetMonster.defense * (1 - combatStats.defensePenetration / 100);
        
        // Calculate base damage
        let damage = Math.max(1, Math.floor(charStats.attack * scaledPower - (effectiveDefense / 2)));
        
        // Check for critical hit
        let isCrit = false;
        if (combatStats.critChance > 0 && Math.random() * 100 < combatStats.critChance) {
          isCrit = true;
          const critMultiplier = 1.5 + (combatStats.critDamage / 100); // Base 1.5x + bonus crit damage
          damage = Math.floor(damage * critMultiplier);
        }
        
        newMonsters[combatState.targetIndex] = { ...targetMonster, hp: targetMonster.hp - damage };
        
        if (isCrit) {
          log(`${char.name} CRITICAL HIT on ${targetMonster.name}! ${damage} damage!`);
        } else {
          log(`${char.name} uses ${ability.name} on ${targetMonster.name}! ${damage} damage!`);
        }
        
        // Apply lifesteal healing
        if (combatStats.lifesteal > 0) {
          const healFromLifesteal = Math.floor(damage * combatStats.lifesteal / 100);
          if (healFromLifesteal > 0) {
            const maxHp = charStats.maxHp;
            const newHp = Math.min(maxHp, char.hp + healFromLifesteal);
            newParty[charIndex] = { ...char, hp: newHp };
            log(`${char.name} heals ${healFromLifesteal} HP from lifesteal!`);
          }
        }
        
        // Apply on-hit heal
        if (combatStats.onHitHeal > 0) {
          const maxHp = charStats.maxHp;
          const newHp = Math.min(maxHp, newParty[charIndex].hp + combatStats.onHitHeal);
          newParty[charIndex] = { ...newParty[charIndex], hp: newHp };
          log(`${char.name} heals ${combatStats.onHitHeal} HP on hit!`);
        }
        
        // Apply elemental effects
        const targetMonsterId = targetMonster.id;
        
        // Apply burn damage (Fire DoT)
        if (combatStats.burnDamage > 0) {
          setMonsterEffects(prev => ({
            ...prev,
            [targetMonsterId]: { ...prev[targetMonsterId], burn: combatStats.burnDamage }
          }));
          log(`${targetMonster.name} is burning! (${combatStats.burnDamage} dmg/turn)`);
        }
        
        // Apply slow effect (Ice)
        if (combatStats.slowEffect > 0) {
          setMonsterEffects(prev => ({
            ...prev,
            [targetMonsterId]: { ...prev[targetMonsterId], slow: combatStats.slowEffect }
          }));
          log(`${targetMonster.name} is slowed by ${combatStats.slowEffect}%!`);
        }
        
        // Apply lightning chain damage to other monsters
        if (combatStats.chainDamage > 0 && newMonsters.filter(m => m.hp > 0).length > 1) {
          const otherMonsters = newMonsters
            .map((m, idx) => ({ m, idx }))
            .filter(({ m, idx }) => m.hp > 0 && idx !== combatState.targetIndex);
          
          for (const { m, idx } of otherMonsters) {
            const chainDmg = Math.max(1, Math.floor(damage * combatStats.chainDamage / 100));
            newMonsters[idx] = { ...m, hp: m.hp - chainDmg };
            log(`Lightning chains to ${m.name} for ${chainDmg} dmg!`);
          }
        }
        
        // Ice Shard freeze effect (40% chance to freeze enemy)
        if (ability.id === 'ice_shard' && newMonsters[combatState.targetIndex].hp > 0) {
          if (Math.random() < 0.4) {
            setMonsterEffects(prev => ({
              ...prev,
              [targetMonsterId]: { ...prev[targetMonsterId], frozen: true }
            }));
            log(`${targetMonster.name} is FROZEN! It will skip its next turn!`);
          }
        }
        
        // Trigger hit animation on monster
        triggerMonsterAnimation(combatState.targetIndex, 'hit', 500);
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
        if (ability.id === 'stealth') {
          // Stealth gives dodge chance for the rest of combat
          setPartyEffects(prev => ({
            ...prev,
            [char.id]: { ...prev[char.id], stealth: ability.power }
          }));
          log(`${char.name} enters stealth! (${ability.power}% dodge chance)`);
        } else {
          // Defend ability
          isDefending = true;
          log(`${char.name} takes a defensive stance!`);
        }
        break;
      }
      case 'debuff': {
        // Provoke ability - force enemy to attack this character and reduce their attack
        const targetMonsterId = targetMonster.id;
        setMonsterEffects(prev => ({
          ...prev,
          [targetMonsterId]: { 
            ...prev[targetMonsterId], 
            tauntTarget: charIndex,
            tauntTurns: 2,
            attackDebuff: ability.power 
          }
        }));
        log(`${char.name} provokes ${targetMonster.name}! It must attack ${char.name} for 2 turns!`);
        break;
      }
    }
    
    setGame(prev => prev ? ({ ...prev, party: newParty }) : null);
    
    // Check if targeted monster is defeated
    if (newMonsters[combatState.targetIndex].hp <= 0) {
      log(`Defeated ${targetMonster.name}!`);
      // Trigger death animation
      triggerMonsterAnimation(combatState.targetIndex, 'death', 1200);
      // Clean up effects for dead monster
      setMonsterEffects(prev => {
        const { [targetMonster.id]: _, ...rest } = prev;
        return rest;
      });
    }
    
    // Clean up effects for any monsters killed by chain damage
    for (const m of newMonsters) {
      if (m.hp <= 0 && monsterEffects[m.id]) {
        setMonsterEffects(prev => {
          const { [m.id]: _, ...rest } = prev;
          return rest;
        });
      }
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
      setMonsterEffects({}); // Clear status effects
      setPartyEffects({}); // Clear party effects
      setIsCombatFullscreen(false);
      setCombatTransition('none');
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
    setMonsterEffects({}); // Clear status effects
    setPartyEffects({}); // Clear party effects
    setIsCombatFullscreen(false);
    setCombatTransition('none');
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
      className={`${isCombatFullscreen ? 'fixed inset-0 z-50' : 'h-screen w-screen'} flex items-center justify-center relative overflow-hidden outline-none bg-black transition-all duration-300`}>
      {/* Stone wall background with grayscale filter */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${dungeonWallBg})`,
          backgroundSize: '400px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          filter: 'grayscale(100%) brightness(0.35) contrast(1.1)',
          transform: isCombatFullscreen ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 300ms ease-out'
        }} 
      />
      {/* Vignette effect - stronger during combat */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: isCombatFullscreen 
          ? 'radial-gradient(ellipse at center, transparent 10%, rgba(0,0,0,0.9) 100%)'
          : 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        transition: 'background 300ms ease-out'
      }} />
      {/* Torch glow effects - enhanced during combat */}
      <div className="absolute top-0 left-0 w-64 h-80 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at top left, rgba(255,150,50,0.3) 0%, transparent 60%)',
        opacity: isCombatFullscreen ? 0.8 : 0.2,
        transition: 'opacity 300ms ease-out'
      }} />
      <div className="absolute top-0 right-0 w-64 h-80 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at top right, rgba(255,150,50,0.3) 0%, transparent 60%)',
        opacity: isCombatFullscreen ? 0.8 : 0.2,
        transition: 'opacity 300ms ease-out'
      }} />
      
      {/* Atmospheric Effects - Floating Dust Particles */}
      {!isCombatFullscreen && (
        <div data-testid="effect-dust-particles" className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Dust particles floating in air - reduced to 8 for performance */}
          {[...Array(8)].map((_, i) => {
            const size = 1 + (i % 3);
            const startX = ((i * 37) % 100);
            const startY = ((i * 53) % 100);
            const duration = 15 + (i % 4) * 4; // Slower animations
            const delay = (i % 6) * 1.5;
            return (
              <div
                key={`dust-${i}`}
                className="absolute rounded-full bg-amber-100/25"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${startX}%`,
                  top: `${startY}%`,
                  animation: `dustFloat ${duration}s ease-in-out ${delay}s infinite`,
                  willChange: 'transform, opacity'
                }}
              />
            );
          })}
        </div>
      )}
      
      {/* Flickering Torch Glow Effect */}
      {!isCombatFullscreen && (
        <div data-testid="effect-torch-glow">
          <div className="absolute top-[20%] left-[5%] w-32 h-32 pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(255,150,50,0.35) 0%, rgba(255,100,30,0.15) 40%, transparent 70%)',
            animation: 'torchFlicker 0.4s ease-in-out infinite alternate',
            willChange: 'opacity'
          }} />
          <div className="absolute top-[25%] right-[8%] w-28 h-28 pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(255,140,40,0.3) 0%, rgba(255,90,20,0.12) 40%, transparent 70%)',
            animation: 'torchFlicker 0.35s ease-in-out 0.15s infinite alternate',
            willChange: 'opacity'
          }} />
        </div>
      )}
      
      {/* Fog/Mist Layer - Ground fog effect */}
      {!isCombatFullscreen && (
        <div data-testid="effect-fog-layer" className="absolute bottom-0 left-0 right-0 h-[25%] pointer-events-none" style={{
          background: 'linear-gradient(to top, rgba(40,45,50,0.35) 0%, rgba(30,35,40,0.15) 50%, transparent 100%)',
          animation: 'fogDrift 35s ease-in-out infinite',
          willChange: 'transform'
        }}>
          {/* Rolling fog wisps */}
          <div className="absolute bottom-0 left-0 right-0 h-full" style={{
            background: `
              radial-gradient(ellipse 80% 30% at 20% 90%, rgba(60,65,70,0.25) 0%, transparent 60%),
              radial-gradient(ellipse 60% 25% at 70% 85%, rgba(50,55,60,0.2) 0%, transparent 50%)
            `,
            animation: 'fogWisps 30s ease-in-out infinite alternate',
            willChange: 'transform'
          }} />
        </div>
      )}
      
      {/* Dripping Water Animation */}
      {!isCombatFullscreen && (
        <div data-testid="effect-water-drips" className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Water drip 1 - left side */}
          <div className="absolute left-[15%] top-[35%]">
            <div className="w-1 h-1 rounded-full bg-cyan-200/40" style={{
              animation: 'waterDrip 4s ease-in 0s infinite'
            }} />
          </div>
          {/* Water drip 2 - center */}
          <div className="absolute left-[50%] top-[36%]">
            <div className="w-1 h-1 rounded-full bg-cyan-200/35" style={{
              animation: 'waterDrip 5s ease-in 2s infinite'
            }} />
          </div>
          {/* Water drip 3 - right side */}
          <div className="absolute left-[80%] top-[38%]">
            <div className="w-1 h-1 rounded-full bg-cyan-200/30" style={{
              animation: 'waterDrip 4.5s ease-in 3.5s infinite'
            }} />
          </div>
        </div>
      )}
      
      {/* Animated Cobweb Corners */}
      {!isCombatFullscreen && (
        <div data-testid="effect-cobwebs">
          {/* Top-left cobweb */}
          <div className="absolute top-[15%] left-0 w-20 h-20 pointer-events-none opacity-25" style={{
            background: `
              linear-gradient(135deg, rgba(200,200,210,0.35) 0%, transparent 50%),
              repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(180,180,195,0.15) 4px, rgba(180,180,195,0.15) 5px)
            `,
            animation: 'cobwebSway 12s ease-in-out infinite'
          }} />
          {/* Top-right cobweb */}
          <div className="absolute top-[18%] right-0 w-16 h-16 pointer-events-none opacity-20" style={{
            background: `
              linear-gradient(225deg, rgba(200,200,210,0.35) 0%, transparent 50%),
              repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(180,180,195,0.15) 3px, rgba(180,180,195,0.15) 4px)
            `,
            animation: 'cobwebSway 15s ease-in-out 3s infinite'
          }} />
        </div>
      )}
      
      {/* Scurrying Critter Animation */}
      {!isCombatFullscreen && (
        <div data-testid="effect-critter" className="absolute bottom-[12%] left-0 right-0 w-full pointer-events-none">
          <div className="absolute" style={{
            animation: 'critterScurry 18s linear infinite'
          }}>
            <div className="w-3 h-2 bg-gray-800/50 rounded-full relative">
              <div className="absolute -left-1 top-0 w-1.5 h-1 bg-gray-700/40 rounded-full" />
              <div className="absolute -right-0.5 top-0.5 w-0.5 h-2 bg-gray-700/30 rounded-full origin-top" style={{
                animation: 'tailWag 0.4s ease-in-out infinite alternate'
              }} />
            </div>
          </div>
        </div>
      )}
      
      {/* Combat Transition Effect - Dramatic Battle Entry */}
      {combatTransition === 'entering' && (
        <div 
          className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
          style={{
            animation: 'combatScreenShake 600ms ease-out'
          }}
        >
          {/* Black background for dramatic effect */}
          <div className="absolute inset-0 bg-black" style={{
            animation: 'combatFlashBright 600ms ease-out forwards',
            animationDelay: '100ms'
          }} />
          
          {/* White flash burst */}
          <div className="absolute inset-0 bg-white" style={{
            animation: 'combatFlashBright 400ms ease-out forwards'
          }} />
          
          {/* Red vignette pulse */}
          <div className="absolute inset-0" style={{
            animation: 'combatRedPulse 600ms ease-out forwards'
          }} />
          
          {/* Diagonal slash lines */}
          <div className="absolute inset-0" style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,100,100,0.3) 10px, rgba(255,100,100,0.3) 20px)',
            animation: 'combatSlash 400ms ease-out forwards'
          }} />
          <div className="absolute inset-0" style={{
            background: 'repeating-linear-gradient(-45deg, transparent, transparent 15px, rgba(255,150,50,0.2) 15px, rgba(255,150,50,0.2) 25px)',
            animation: 'combatSlash 500ms ease-out forwards',
            animationDelay: '100ms'
          }} />
          
          {/* Swirling vortex effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{
              width: '200px',
              height: '200px',
              background: 'conic-gradient(from 0deg, transparent, rgba(200,50,50,0.4), transparent, rgba(255,100,50,0.3), transparent)',
              borderRadius: '50%',
              animation: 'combatVortex 600ms ease-out forwards'
            }} />
          </div>
          
          {/* ENCOUNTER text slam */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="text-5xl font-pixel text-red-500 tracking-wider"
              style={{
                textShadow: '0 0 30px rgba(255,100,100,0.9), 0 0 60px rgba(255,50,50,0.6), 2px 2px 0 #000, -2px -2px 0 #000',
                animation: 'combatTextSlam 600ms ease-out forwards'
              }}
            >
              ENCOUNTER!
            </div>
          </div>
          
          {/* Speed lines radiating from center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="absolute bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{
                  width: '150%',
                  height: '2px',
                  transform: `rotate(${i * 30}deg)`,
                  animation: `combatLinesSweep 400ms ease-out forwards`,
                  animationDelay: `${i * 20}ms`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      
      {/* Slime decorations - hide during combat (blur filters removed for performance) */}
      {!isCombatFullscreen && (
        <>
          {/* Green slime pool - bottom left */}
          <div className="absolute bottom-[15%] left-[8%] w-20 h-10 pointer-events-none opacity-60" style={{
            background: 'radial-gradient(ellipse at center, rgba(80,180,80,0.5) 0%, rgba(50,120,50,0.3) 50%, transparent 70%)',
            borderRadius: '50%'
          }} />
          {/* Purple slime drip - top left */}
          <div className="absolute top-[25%] left-[5%] w-3 h-16 pointer-events-none opacity-50" style={{
            background: 'linear-gradient(180deg, rgba(140,80,180,0.6) 0%, rgba(100,50,140,0.4) 60%, transparent 100%)',
            borderRadius: '0 0 50% 50%'
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
            borderRadius: '50%'
          }} />
          {/* Green slime line - left side */}
          <div className="absolute top-[55%] left-[3%] w-2 h-24 pointer-events-none opacity-40" style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(70,150,70,0.4) 20%, rgba(90,180,90,0.5) 50%, rgba(60,130,60,0.3) 80%, transparent 100%)',
            borderRadius: '50%'
          }} />
          {/* Small purple drops */}
          <div className="absolute bottom-[35%] left-[12%] w-3 h-3 pointer-events-none opacity-45" style={{
            background: 'radial-gradient(circle, rgba(150,90,190,0.5) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
        </>
      )}
      
      <div className={`${isCombatFullscreen ? 'w-full h-full p-0 flex' : 'max-w-6xl w-full pt-16 pb-4 px-2'} relative z-10 transition-all duration-300`}>
        
        {/* Monster Health Bars - Fixed at top center during combat fullscreen */}
        {isCombatFullscreen && combatState.active && combatState.monsters.length > 0 && (
          <div className="fixed top-0 left-72 right-80 z-[100] p-3 bg-gradient-to-b from-black/95 via-black/80 to-transparent">
            <div className="flex flex-nowrap gap-2 justify-center overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {combatState.monsters.map((monster, idx) => {
                const barWidth = combatState.monsters.length === 1 ? 'w-56' : combatState.monsters.length === 2 ? 'w-48' : 'w-44';
                return (
                  <div 
                    key={monster.id}
                    className={`flex-shrink-0 ${barWidth} px-2 py-1.5 rounded-lg border-2 cursor-pointer transition-all ${
                      idx === combatState.targetIndex && monster.hp > 0
                        ? 'border-yellow-400 bg-yellow-400/30 scale-105 shadow-lg shadow-yellow-400/30' 
                        : 'border-amber-500/60 bg-black/90'
                    } ${monster.hp <= 0 ? 'opacity-40' : ''}`}
                    onClick={() => monster.hp > 0 && setCombatState(prev => ({ ...prev, targetIndex: idx }))}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-bold truncate ${
                        monster.hp <= 0 ? 'text-gray-500 line-through' : 'text-amber-300'
                      }`}>
                        {monster.name}
                      </span>
                      {idx === combatState.targetIndex && monster.hp > 0 && (
                        <span className="text-yellow-400 text-xs flex-shrink-0">◀</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-2.5 bg-black/80 rounded-full overflow-hidden border border-white/20">
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: `${Math.max(0, (monster.hp / monster.maxHp) * 100)}%`,
                            backgroundColor: monster.color || '#f59e0b'
                          }}
                        />
                      </div>
                      <span className="text-xs text-white font-semibold flex-shrink-0 min-w-[40px] text-right">
                        {monster.hp}/{monster.maxHp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* COMBAT FULLSCREEN LAYOUT - Side panel with combat info */}
        {isCombatFullscreen && (
          <div className="w-72 h-full bg-black/90 border-r border-primary/30 flex flex-col p-2 gap-2 overflow-y-auto z-30" style={{ scrollbarWidth: 'thin' }}>
            {/* Party Health */}
            <div className="bg-black/60 rounded border border-primary/30 p-2">
              <div className="font-pixel text-xs text-primary mb-2">PARTY</div>
              {game.party.map((char, idx) => {
                const stats = getEffectiveStats(char);
                const isCurrentTurn = idx === combatState.currentCharIndex && char.hp > 0;
                return (
                  <div 
                    key={char.id}
                    className={`p-2 rounded border mb-1 transition-all ${
                      isCurrentTurn 
                        ? 'bg-primary/20 border-primary/50' 
                        : char.hp <= 0 
                          ? 'bg-black/40 border-red-500/30 opacity-60' 
                          : 'bg-black/40 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isCurrentTurn ? 'text-primary' : char.hp <= 0 ? 'text-red-400 line-through' : 'text-white'}`}>
                        {char.name} {isCurrentTurn && '◀'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-red-400">HP</span>
                      <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all"
                          style={{ width: `${Math.max(0, (char.hp / stats.maxHp) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-red-300 w-12 text-right">{char.hp}/{stats.maxHp}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-blue-400">MP</span>
                      <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                          style={{ width: `${Math.max(0, (char.mp / stats.maxMp) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-blue-300 w-12 text-right">{char.mp}/{stats.maxMp}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Combat Commands */}
            {game.party[combatState.currentCharIndex] && game.party[combatState.currentCharIndex].hp > 0 && (
              <div className="bg-black/60 rounded border border-primary/30 p-2">
                <div className="font-pixel text-xs text-primary mb-2">
                  {game.party[combatState.currentCharIndex].name}'s TURN
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {getAbilitiesForJob(game.party[combatState.currentCharIndex].job).map((ability) => (
                    <RetroButton 
                      key={ability.id}
                      onClick={() => useAbility(ability, combatState.currentCharIndex)} 
                      className="px-2 py-1.5 text-xs"
                      disabled={ability.mpCost > game.party[combatState.currentCharIndex].mp}
                      data-testid={`button-${ability.id}`}
                    >
                      {ability.name}
                      {ability.mpCost > 0 && <span className="ml-1 text-blue-300 text-[10px]">({ability.mpCost})</span>}
                    </RetroButton>
                  ))}
                </div>
                <RetroButton onClick={handleRun} variant="danger" className="w-full mt-2 py-1.5 text-xs" data-testid="button-run">
                  FLEE (ESC)
                </RetroButton>
              </div>
            )}

          </div>
        )}

        {/* CENTER - Main game area (monsters during combat) */}
        <div className={`${isCombatFullscreen ? 'flex-1 h-full' : 'grid grid-cols-1 lg:grid-cols-12 gap-3 w-full'}`}>
        
        {/* LEFT COLUMN: Commands & Party Stats stacked - hide during combat fullscreen */}
        {!isCombatFullscreen && (
        <div className="lg:col-span-3 space-y-2 order-2 lg:order-1 overflow-y-auto max-h-[calc(100vh-6rem)] pr-1 pt-20" style={{ scrollbarWidth: 'thin' }}>
          <RetroCard title="COMMANDS">
            <div className="grid grid-cols-2 gap-2">
              <RetroButton onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "SAVING..." : "SAVE"} <Save className="w-3 h-3 ml-2 inline" />
              </RetroButton>
              <RetroButton onClick={handleNewGame} variant="ghost" data-testid="button-new-game">
                NEW <RotateCw className="w-3 h-3 ml-2 inline" />
              </RetroButton>
            </div>
            <div className="mt-2">
              <RetroButton onClick={() => logout()} variant="danger" className="w-full">
                EXIT GAME <LogOut className="w-3 h-3 ml-2 inline" />
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
            
            <RetroButton 
              onClick={() => setShowHelp(true)}
              className="w-full mt-2"
              variant="ghost"
              data-testid="button-help"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              HELP (?)
            </RetroButton>
          </RetroCard>
          
          {/* Movement Controls */}
          <RetroCard title="MOVE" className="mt-2">
            <div className="flex flex-col items-center gap-2">
              <div className="grid grid-cols-3 gap-1 place-items-center">
                <div />
                <RetroButton onClick={() => {
                  if (game.dir === NORTH) move(0, -1);
                  if (game.dir === SOUTH) move(0, 1);
                  if (game.dir === EAST) move(1, 0);
                  if (game.dir === WEST) move(-1, 0);
                }} className="w-10 h-10 p-0 flex items-center justify-center rounded-lg" data-testid="button-forward">
                  <ArrowUp className="w-4 h-4" />
                </RetroButton>
                <div />
                
                <RetroButton onClick={() => rotate('left')} className="w-10 h-10 p-0 flex items-center justify-center rounded-lg" data-testid="button-rotate-left">
                  <RotateCcw className="w-4 h-4" />
                </RetroButton>
                <div className="w-10 h-10 flex items-center justify-center text-[10px] text-muted-foreground">
                  WASD
                </div>
                <RetroButton onClick={() => rotate('right')} className="w-10 h-10 p-0 flex items-center justify-center rounded-lg" data-testid="button-rotate-right">
                  <RotateCw className="w-4 h-4" />
                </RetroButton>
              </div>
              
              {/* Ladder Interaction */}
              {!combatState.active && game.map[game.y][game.x] === TILE_LADDER_DOWN && (
                <RetroButton 
                  onClick={useLadder}
                  className="w-full text-sm"
                  data-testid="button-descend"
                >
                  <ChevronDown className="w-4 h-4 mr-1" />
                  <span className="text-yellow-400">Descend</span>
                  <span className="ml-1 text-muted-foreground text-xs">(Space)</span>
                </RetroButton>
              )}
              {!combatState.active && game.map[game.y][game.x] === TILE_LADDER_UP && game.level > 1 && (
                <RetroButton 
                  onClick={useLadder}
                  className="w-full text-sm"
                  data-testid="button-ascend"
                >
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span className="text-yellow-400">Ascend</span>
                  <span className="ml-1 text-muted-foreground text-xs">(Space)</span>
                </RetroButton>
              )}
              
              {/* Skills Section (Non-combat) */}
              {!combatState.active && (
                <div className="w-full pt-2 border-t border-white/10">
                  <RetroButton 
                    onClick={healAllParty} 
                    className="w-full text-sm"
                    disabled={!game.party.some(c => c.job === 'Mage' && c.hp > 0 && c.mp >= 10)}
                    data-testid="button-heal-all"
                  >
                    <span className="text-green-400">Heal</span>
                    <span className="ml-1 text-blue-300 text-xs">(H)</span>
                  </RetroButton>
                </div>
              )}
            </div>
          </RetroCard>
          
          
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
          
          {/* Party Stats - moved to left column */}
          <RetroCard title="PARTY" className="space-y-2">
            {game.party.map((char, idx) => {
              const isCurrentTurn = combatState.active && idx === combatState.currentCharIndex && char.hp > 0;
              const xpNeeded = xpForLevel(char.level + 1);
              const xpPercent = Math.min(100, Math.round((char.xp / xpNeeded) * 100));
              return (
              <div 
                key={char.id} 
                className={`p-2 rounded-lg border transition-all duration-300 ${
                  isCurrentTurn 
                    ? 'bg-primary/20 border-primary/50 shadow-lg shadow-primary/30 animate-pulse' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold text-xs transition-all duration-300 ${
                    isCurrentTurn ? 'text-primary drop-shadow-[0_0_8px_rgba(200,140,50,0.8)]' : 'text-primary'
                  }`}>
                    {char.name}
                  </span>
                  <span className="text-muted-foreground text-[10px] bg-white/5 px-1.5 py-0.5 rounded-full">Lv.{char.level}</span>
                </div>
                <div className="space-y-1">
                  <StatBar label="HP" current={char.hp} max={getEffectiveStats(char).maxHp} color={char.color} />
                  <StatBar label="MP" current={char.mp} max={getEffectiveStats(char).maxMp} color="#3b82f6" />
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-amber-400 w-5">XP</span>
                    <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 transition-all" 
                        style={{ width: `${xpPercent}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-amber-300 w-8 text-right">{xpPercent}%</span>
                  </div>
                </div>
              </div>
            );
            })}
            
            <div className="pt-2 border-t border-white/10">
              <div className="flex justify-between items-center bg-gradient-to-r from-amber-500/20 to-amber-600/10 px-3 py-2 rounded-lg border border-amber-500/20">
                <span className="text-amber-400 font-semibold text-sm">GOLD</span>
                <span className="text-amber-300 font-bold text-lg">{game.gold}</span>
              </div>
            </div>
          </RetroCard>
        </div>
        )}

        {/* CENTER COLUMN: Viewport */}
        <div className={`${isCombatFullscreen ? 'w-full h-full' : 'lg:col-span-7'} order-1 lg:order-2`}>
          <RetroCard className={`${isCombatFullscreen ? 'h-full rounded-none border-0 bg-transparent' : 'p-1'}`}>
            <div className="relative aspect-[4/3] w-full bg-black overflow-hidden rounded-lg">
              {/* Always show dungeon view as background */}
              <DungeonView 
                gameData={game} 
                className="w-full h-full" 
                renderWidth={RESOLUTION_PRESETS[graphicsQuality].width}
                renderHeight={RESOLUTION_PRESETS[graphicsQuality].height}
                visualX={visualPos.x}
                visualY={visualPos.y}
              />
              
              {/* Mini Map in top left (toggle with M key) - hide during combat fullscreen */}
              {showMiniMap && !isCombatFullscreen && (() => {
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
                      background: isCombatFullscreen 
                        ? 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(100,0,0,0.2) 0%, rgba(50,0,0,0.5) 30%, rgba(0,0,0,0.9) 80%)'
                        : 'radial-gradient(ellipse 60% 50% at 50% 45%, transparent 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.6) 100%)'
                    }}
                  />
                  
                  {/* Pulsing combat border effect - fullscreen only */}
                  {isCombatFullscreen && (
                    <div className="absolute inset-0 z-[6] pointer-events-none border-[4px] border-red-500/30 animate-pulse" />
                  )}
                  
                  
                  {/* Monster display - single row for up to 5 monsters */}
                  <div className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none ${
                    isCombatFullscreen ? 'pt-6' : 'pb-10'
                  }`}>
                    <div className="relative w-full flex flex-col justify-center items-center animate-in fade-in zoom-in duration-300">
                      {/* All monsters in single row (max 3) */}
                      <div className="flex items-end justify-center z-20" style={{ gap: isCombatFullscreen ? '-15px' : '4px' }}>
                        {combatState.monsters.slice(0, 3).map((monster, idx) => {
                          const getMonsterSize = () => {
                            if (isCombatFullscreen) {
                              // Large sizes for 1-3 monsters
                              if (combatState.monsters.length === 1) return 'w-[400px] h-[400px] md:w-[500px] md:h-[500px] lg:w-[580px] lg:h-[580px]';
                              if (combatState.monsters.length === 2) return 'w-[320px] h-[320px] md:w-[420px] md:h-[420px] lg:w-[500px] lg:h-[500px]';
                              // 3 monsters
                              return 'w-[280px] h-[280px] md:w-[360px] md:h-[360px] lg:w-[420px] lg:h-[420px]';
                            }
                            if (combatState.monsters.length === 1) return 'w-56 h-56';
                            if (combatState.monsters.length === 2) return 'w-48 h-48';
                            return 'w-40 h-40';
                          };
                          return (
                            <div 
                              key={monster.id} 
                              className={`relative cursor-pointer transition-all duration-200 ${
                                monster.hp <= 0 ? 'opacity-40 grayscale' : ''
                              } ${idx === combatState.targetIndex && monster.hp > 0 ? 'scale-110 z-30' : 'scale-100'}`}
                              onClick={() => monster.hp > 0 && setCombatState(prev => ({ ...prev, targetIndex: idx }))}
                              style={{ pointerEvents: 'auto', filter: monster.hp <= 0 ? 'brightness(0.6)' : 'none' }}
                            >
                              {idx === combatState.targetIndex && monster.hp > 0 && (
                                <div className={`absolute ${isCombatFullscreen ? '-top-14' : '-top-6'} left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce z-40`}>
                                  <ChevronDown className={isCombatFullscreen ? 'w-10 h-10' : 'w-6 h-6'} />
                                </div>
                              )}
                              {monster.image ? (
                                <>
                                  <TransparentMonster 
                                    src={monster.image} 
                                    alt={monster.name} 
                                    className={`object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.9)] ${getMonsterSize()}`}
                                    animationState={monsterAnimations[idx] || 'idle'}
                                    isFlying={isFlying(monster.name)}
                                  />
                                  <div 
                                    className={`absolute bottom-0 left-1/2 rounded-[50%] bg-black/60 blur-md ${
                                      isCombatFullscreen
                                        ? combatState.monsters.length === 1 ? 'w-[360px] h-14' :
                                          combatState.monsters.length === 2 ? 'w-[300px] h-12' : 'w-[260px] h-10'
                                        : combatState.monsters.length === 1 ? 'w-44 h-6' :
                                          combatState.monsters.length === 2 ? 'w-36 h-5' : 'w-32 h-5'
                                    }`}
                                    style={{ transform: 'translateX(-50%) translateY(8px)' }}
                                  />
                                </>
                              ) : (
                                <Skull className={`text-red-500 drop-shadow-lg ${
                                  isCombatFullscreen 
                                    ? combatState.monsters.length === 1 ? 'w-[120px] h-[120px]' :
                                      combatState.monsters.length === 2 ? 'w-[100px] h-[100px]' : 'w-[80px] h-[80px]'
                                    : combatState.monsters.length === 1 ? 'w-44 h-44' :
                                      combatState.monsters.length === 2 ? 'w-36 h-36' : 'w-32 h-32'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  
                  {/* Combat UI overlay at bottom - only show in non-fullscreen mode */}
                  {!isCombatFullscreen && (
                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2">
                      <div className="space-y-2">
                        {/* All Monsters HP bars */}
                        <div className="flex flex-wrap gap-1">
                          {combatState.monsters.map((monster, idx) => (
                            <div 
                              key={monster.id} 
                              className={`flex-1 min-w-[100px] p-1 rounded border cursor-pointer transition-all ${
                                idx === combatState.targetIndex ? 'border-yellow-400 bg-yellow-400/10' : 'border-primary/30 bg-black/40'
                              } ${monster.hp <= 0 ? 'opacity-50' : ''}`}
                              onClick={() => monster.hp > 0 && setCombatState(prev => ({ ...prev, targetIndex: idx }))}
                            >
                              <h2 className="font-pixel text-destructive text-[10px] truncate">{monster.name}</h2>
                              <div className="h-1.5 bg-black/50 rounded-full overflow-hidden mt-0.5">
                                <div 
                                  className="h-full transition-all"
                                  style={{ 
                                    width: `${Math.max(0, (monster.hp / monster.maxHp) * 100)}%`,
                                    backgroundColor: monster.color || '#ef4444'
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Current Character Turn */}
                        {game.party[combatState.currentCharIndex] && game.party[combatState.currentCharIndex].hp > 0 && (
                          <div className="bg-black/60 p-1.5 rounded border border-primary/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-pixel text-[10px] text-primary">
                                {game.party[combatState.currentCharIndex].name}'s Turn
                              </span>
                              <span className="font-retro text-[10px] text-blue-400">
                                MP: {game.party[combatState.currentCharIndex].mp}/{getEffectiveStats(game.party[combatState.currentCharIndex]).maxMp}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {getAbilitiesForJob(game.party[combatState.currentCharIndex].job).map((ability) => (
                                <RetroButton 
                                  key={ability.id}
                                  onClick={() => useAbility(ability, combatState.currentCharIndex)} 
                                  className="px-2 py-0.5 text-[10px]"
                                  disabled={ability.mpCost > game.party[combatState.currentCharIndex].mp}
                                  data-testid={`button-${ability.id}`}
                                >
                                  {ability.name}
                                  {ability.mpCost > 0 && <span className="ml-1 text-blue-300">({ability.mpCost})</span>}
                                </RetroButton>
                              ))}
                              <RetroButton onClick={handleRun} variant="ghost" className="px-2 py-0.5 text-[10px]" data-testid="button-run">
                                RUN
                              </RetroButton>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            </RetroCard>
        </div>

        {/* RIGHT COLUMN: Message Log - hide during combat fullscreen */}
        {!isCombatFullscreen && (
        <div className="lg:col-span-2 order-3 overflow-y-auto max-h-[calc(100vh-6rem)] pl-1 pt-20 flex flex-col gap-2" style={{ scrollbarWidth: 'thin' }}>
          <RetroCard title="LOG" className="flex-1">
            <div className="space-y-1 text-xs" data-testid="panel-message-log">
              {logs.map((msg, i) => (
                <div key={i} className={`transition-opacity py-0.5 ${i === 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`} style={{ opacity: 1 - i * 0.1 }}>
                  {i === 0 ? '▸ ' : '  '}{msg}
                </div>
              ))}
            </div>
          </RetroCard>
          
          {/* Settings and Fullscreen buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  document.documentElement.requestFullscreen();
                }
              }}
              className="flex-1 bg-slate-800/90 hover:bg-slate-700 border border-amber-600/30 rounded-lg p-2 text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-2"
              data-testid="button-fullscreen"
              title={document.fullscreenElement ? "Exit Fullscreen (F11)" : "Fullscreen (F11)"}
            >
              {document.fullscreenElement ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="text-xs">Screen</span>
            </button>
            
            <div className="relative flex-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full bg-slate-800/90 hover:bg-slate-700 border border-amber-600/30 rounded-lg p-2 text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-2"
                data-testid="button-settings"
              >
                <Settings className="w-4 h-4" />
                <span className="text-xs">Graphics</span>
              </button>
              
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-slate-900/95 backdrop-blur-sm border border-amber-600/30 rounded-lg p-3 min-w-[160px] shadow-xl z-50">
                  <div className="text-xs text-amber-400 font-bold mb-2 tracking-wider">QUALITY</div>
                  {(['high', 'medium', 'low'] as GraphicsQuality[]).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => {
                        setGraphicsQuality(quality);
                        setShowSettings(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                        graphicsQuality === quality 
                          ? 'bg-amber-600/50 text-amber-200' 
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                      data-testid={`button-quality-${quality}`}
                    >
                      {RESOLUTION_PRESETS[quality].label}
                      {graphicsQuality === quality && <span className="ml-2 text-amber-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        )}
        </div>
        
        {/* RIGHT SIDEBAR - Battle Log during combat fullscreen */}
        {isCombatFullscreen && (
          <div className="w-80 min-h-screen bg-black/90 border-l border-primary/30 flex flex-col p-2 z-30">
            <div className="bg-black/60 rounded border border-white/10 p-3 flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="font-pixel text-sm text-primary mb-2">BATTLE LOG</div>
              <div className="flex-1 space-y-1 text-sm overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin' }}>
                {logs.slice(0, 50).map((msg, i) => (
                  <div key={i} className={`py-0.5 ${i === 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`} style={{ opacity: 1 - i * 0.02 }}>
                    {msg}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Settings and Fullscreen buttons */}
            <div className="flex gap-2 mt-2 flex-shrink-0">
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    document.documentElement.requestFullscreen();
                  }
                }}
                className="flex-1 bg-slate-800/90 hover:bg-slate-700 border border-amber-600/30 rounded-lg p-2 text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-2"
                data-testid="button-fullscreen-combat"
                title={document.fullscreenElement ? "Exit Fullscreen (F11)" : "Fullscreen (F11)"}
              >
                {document.fullscreenElement ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span className="text-xs">Screen</span>
              </button>
              
              <div className="relative flex-1">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full bg-slate-800/90 hover:bg-slate-700 border border-amber-600/30 rounded-lg p-2 text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-2"
                  data-testid="button-settings-combat"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-xs">Graphics</span>
                </button>
                
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-slate-900/95 backdrop-blur-sm border border-amber-600/30 rounded-lg p-3 min-w-[160px] shadow-xl z-50">
                    <div className="text-xs text-amber-400 font-bold mb-2 tracking-wider">QUALITY</div>
                    {(['high', 'medium', 'low'] as GraphicsQuality[]).map((quality) => (
                      <button
                        key={quality}
                        onClick={() => {
                          setGraphicsQuality(quality);
                          setShowSettings(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                          graphicsQuality === quality 
                            ? 'bg-amber-600/50 text-amber-200' 
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                        data-testid={`button-quality-combat-${quality}`}
                      >
                        {RESOLUTION_PRESETS[quality].label}
                        {graphicsQuality === quality && <span className="ml-2 text-amber-400">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Help Modal - Equipment Index */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div 
            className="bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-primary/50 rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-amber-400 font-pixel text-lg" data-testid="text-help-title">HELP</h2>
              <RetroButton 
                onClick={() => setShowHelp(false)}
                className="w-8 h-8 p-0"
                variant="ghost"
                data-testid="button-close-help"
              >
                <X className="w-4 h-4" />
              </RetroButton>
            </div>
            
            {/* Main Tabs: Items / Sets */}
            <div className="flex gap-2 p-3 border-b border-white/10 bg-black/40">
              <RetroButton
                onClick={() => setHelpTab('items')}
                className="px-4 py-2 text-sm"
                variant={helpTab === 'items' ? 'default' : 'ghost'}
                data-testid="tab-items"
              >
                Equipment Index
              </RetroButton>
              <RetroButton
                onClick={() => setHelpTab('sets')}
                className="px-4 py-2 text-sm"
                variant={helpTab === 'sets' ? 'default' : 'ghost'}
                data-testid="tab-sets"
              >
                Set Bonuses
              </RetroButton>
            </div>
            
            {/* Items Tab - Filter Tabs */}
            {helpTab === 'items' && (
              <div className="flex flex-wrap gap-1 p-3 border-b border-white/10 bg-black/30">
                {['all', 'weapon', 'armor', 'helmet', 'gloves', 'boots', 'shield', 'necklace', 'ring', 'relic', 'offhand'].map(filter => (
                  <RetroButton
                    key={filter}
                    onClick={() => setHelpFilter(filter)}
                    className="px-3 py-1 text-xs capitalize"
                    variant={helpFilter === filter ? 'default' : 'ghost'}
                    data-testid={`filter-${filter}`}
                  >
                    {filter}
                  </RetroButton>
                ))}
              </div>
            )}
            
            {/* Equipment List (Items Tab) */}
            {helpTab === 'items' && (
              <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-4">
                <div className="grid gap-2">
                  {EQUIPMENT_DATABASE
                    .filter(item => helpFilter === 'all' || item.slot === helpFilter)
                    .sort((a, b) => {
                      const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
                      return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
                    })
                    .map(item => {
                      const rarityColors: Record<string, string> = {
                        common: 'text-gray-400 border-gray-600/30',
                        uncommon: 'text-green-400 border-green-600/30',
                        rare: 'text-blue-400 border-blue-600/30',
                        epic: 'text-purple-400 border-purple-600/30',
                        legendary: 'text-amber-400 border-amber-600/30'
                      };
                      const colorClass = rarityColors[item.rarity] || rarityColors.common;
                      
                      return (
                        <div 
                          key={item.id}
                          className={`p-3 rounded-lg border bg-black/40 ${colorClass.split(' ')[1]}`}
                          data-testid={`item-${item.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-semibold ${colorClass.split(' ')[0]}`} data-testid={`text-name-${item.id}`}>{item.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground capitalize" data-testid={`text-slot-${item.id}`}>{item.slot}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded bg-white/5 capitalize ${colorClass.split(' ')[0]}`} data-testid={`text-rarity-${item.id}`}>{item.rarity}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                              <div className="flex flex-wrap gap-2 mt-2 text-xs" data-testid={`text-stats-${item.id}`}>
                                {item.attack > 0 && <span className="text-red-400">+{item.attack} ATK</span>}
                                {item.defense > 0 && <span className="text-blue-400">+{item.defense} DEF</span>}
                                {item.hp > 0 && <span className="text-green-400">+{item.hp} HP</span>}
                                {item.mp > 0 && <span className="text-cyan-400">+{item.mp} MP</span>}
                                {item.speed > 0 && <span className="text-yellow-400">+{item.speed} SPD</span>}
                              </div>
                            </div>
                            <div className="text-right text-[10px] text-muted-foreground">
                              <div data-testid={`text-jobs-${item.id}`}>{item.allowedJobs.join(', ')}</div>
                              {item.set && <div className="text-amber-400/70 mt-1" data-testid={`text-set-${item.id}`}>Set: {item.set}</div>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="text-center text-muted-foreground text-xs mt-4" data-testid="text-item-count">
                  {EQUIPMENT_DATABASE.filter(item => helpFilter === 'all' || item.slot === helpFilter).length} items
                </div>
              </div>
            )}
            
            {/* Set Bonuses Tab */}
            {helpTab === 'sets' && (
              <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Collect equipment from the same set to unlock powerful bonuses. Each set has 9 pieces per class with bonus thresholds at 2, 4, 6, and 9 pieces equipped.
                </div>
                
                {/* Starter Sets */}
                <div className="mb-6">
                  <h3 className="text-green-400 font-semibold mb-3 border-b border-green-600/30 pb-2">Starter Sets (Uncommon - Early Game)</h3>
                  <div className="grid gap-3">
                    {Object.entries(SET_BONUSES).slice(0, 9).map(([setName, setData]) => (
                      <div key={setName} className="p-3 rounded-lg border border-green-600/30 bg-black/40" data-testid={`set-${setName.replace(/\s+/g, '-').toLowerCase()}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-green-400 font-semibold">{setData.name}</span>
                            <span className="text-muted-foreground text-xs ml-2">({setData.theme})</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {setData.bonuses.map((bonus, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <span className="text-amber-400 font-medium min-w-[24px]">{bonus.threshold}p:</span>
                              <span className="text-muted-foreground">{bonus.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Advanced Sets */}
                <div>
                  <h3 className="text-purple-400 font-semibold mb-3 border-b border-purple-600/30 pb-2">Advanced Sets (Epic - Endgame)</h3>
                  <div className="grid gap-3">
                    {Object.entries(SET_BONUSES).slice(9).map(([setName, setData]) => (
                      <div key={setName} className="p-3 rounded-lg border border-purple-600/30 bg-black/40" data-testid={`set-${setName.replace(/\s+/g, '-').toLowerCase()}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-purple-400 font-semibold">{setData.name}</span>
                            <span className="text-muted-foreground text-xs ml-2">({setData.theme})</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {setData.bonuses.map((bonus, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <span className="text-amber-400 font-medium min-w-[24px]">{bonus.threshold}p:</span>
                              <span className="text-muted-foreground">{bonus.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center text-muted-foreground text-xs mt-4">
                  {Object.keys(SET_BONUSES).length} equipment sets
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Equipment Modal - Full screen overlay on main view */}
      {showEquipment && !isCombatFullscreen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEquipment(false)}>
          <div 
            className="bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-primary/50 rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-amber-400 font-pixel text-lg">EQUIPMENT</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">(Press E or ESC to close)</span>
                <RetroButton 
                  onClick={() => setShowEquipment(false)}
                  className="w-8 h-8 p-0"
                  variant="ghost"
                  data-testid="button-close-equipment"
                >
                  <X className="w-4 h-4" />
                </RetroButton>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
              {/* Character Selection */}
              <div className="flex gap-2 mb-4">
                {game.party.map((char, idx) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharForEquip(idx)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      selectedCharForEquip === idx 
                        ? 'bg-primary/20 text-primary border-2 border-primary/50 shadow-lg shadow-primary/10' 
                        : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                    }`}
                    data-testid={`button-select-char-${idx}`}
                  >
                    <div>{char.name}</div>
                    <div className="text-xs opacity-70">{char.job}</div>
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Left: Equipment Slots */}
                <div>
                  <h3 className="text-sm text-amber-400 font-semibold mb-2">Equipped</h3>
                  {game.party[selectedCharForEquip] && (
                    <div className="space-y-1.5">
                      {(['weapon', 'shield', 'armor', 'helmet', 'gloves', 'boots', 'necklace', 'ring1', 'ring2', 'relic', 'offhand'] as const)
                        .filter(slot => {
                          const job = game.party[selectedCharForEquip].job;
                          if (slot === 'shield') return job === 'Fighter';
                          if (slot === 'offhand') return job !== 'Fighter';
                          if (slot === 'relic') return job === 'Mage';
                          return true;
                        })
                        .map(slot => {
                        const item = game.party[selectedCharForEquip].equipment[slot];
                        return (
                          <div 
                            key={slot} 
                            className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/10"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-xs text-muted-foreground capitalize w-14 flex-shrink-0">{slot}:</span>
                              {item ? (
                                <span className={`text-xs font-medium truncate ${
                                  item.rarity === 'legendary' ? 'text-amber-400' :
                                  item.rarity === 'epic' ? 'text-purple-400' : 
                                  item.rarity === 'rare' ? 'text-blue-400' : 
                                  item.rarity === 'uncommon' ? 'text-green-400' : 
                                  'text-foreground'
                                }`}>
                                  {getEnhancedName(item)}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Empty</span>
                              )}
                            </div>
                            {item && (
                              <button
                                onClick={() => unequipItem(selectedCharForEquip, slot)}
                                className="text-xs px-2 py-1 bg-destructive/20 text-destructive hover:bg-destructive/40 rounded transition-colors ml-2"
                                data-testid={`button-unequip-${slot}`}
                              >
                                Unequip
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Stats Summary */}
                  <div className="mt-4 p-3 bg-black/40 rounded-lg border border-white/10">
                    <h4 className="text-xs text-amber-400 mb-2">Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-red-400">ATK: {getEffectiveStats(game.party[selectedCharForEquip]).attack}</span>
                      <span className="text-blue-400">DEF: {getEffectiveStats(game.party[selectedCharForEquip]).defense}</span>
                      <span className="text-green-400">HP: {getEffectiveStats(game.party[selectedCharForEquip]).maxHp}</span>
                      <span className="text-cyan-400">MP: {getEffectiveStats(game.party[selectedCharForEquip]).maxMp}</span>
                      <span className="text-yellow-400">SPD: {getEffectiveStats(game.party[selectedCharForEquip]).speed}</span>
                    </div>
                  </div>
                </div>
                
                {/* Right: Inventory */}
                <div>
                  <h3 className="text-sm text-amber-400 font-semibold mb-2">
                    Inventory ({game.equipmentInventory.length})
                  </h3>
                  {game.equipmentInventory.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic text-center py-8 bg-white/5 rounded-lg border border-white/10">
                      No equipment in bag
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                      {game.equipmentInventory.map((item, idx) => {
                        const char = game.party[selectedCharForEquip];
                        const canEquipThis = canEquip(char, item);
                        return (
                          <div 
                            key={`${item.id}-${idx}`}
                            className={`bg-white/5 px-3 py-2 rounded-lg border border-white/10 transition-opacity ${
                              !canEquipThis ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <span className={`text-xs font-medium block truncate ${
                                  item.rarity === 'legendary' ? 'text-amber-400' :
                                  item.rarity === 'epic' ? 'text-purple-400' : 
                                  item.rarity === 'rare' ? 'text-blue-400' : 
                                  item.rarity === 'uncommon' ? 'text-green-400' : 
                                  'text-foreground'
                                }`}>
                                  {getEnhancedName(item)}
                                </span>
                                <div className="text-[10px] text-amber-400/80 mt-0.5">
                                  {formatEquipmentStats(item)}
                                </div>
                                <div className="text-[10px] text-muted-foreground capitalize">
                                  {item.slot} • {item.allowedJobs.join(', ')}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => equipItem(selectedCharForEquip, item)}
                                  disabled={!canEquipThis}
                                  className={`text-xs px-2 py-1 rounded transition-colors ${
                                    canEquipThis 
                                      ? 'bg-primary/20 text-primary hover:bg-primary/40' 
                                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                                  }`}
                                  data-testid={`button-equip-${item.id}`}
                                >
                                  Equip
                                </button>
                                <button
                                  onClick={() => dropItem(item)}
                                  className="text-xs px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded transition-colors"
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
          </div>
        </div>
      )}
      
      {/* Stats Modal - Full screen overlay on main view */}
      {showStats && !isCombatFullscreen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowStats(false)}>
          <div 
            className="bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-primary/50 rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-amber-400 font-pixel text-lg">CHARACTER STATS</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">(Press C or ESC to close)</span>
                <RetroButton 
                  onClick={() => setShowStats(false)}
                  className="w-8 h-8 p-0"
                  variant="ghost"
                  data-testid="button-close-stats-modal"
                >
                  <X className="w-4 h-4" />
                </RetroButton>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
              {/* Character Selection */}
              <div className="flex gap-2 mb-4">
                {game.party.map((char, idx) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharForStats(idx)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      selectedCharForStats === idx 
                        ? 'bg-primary/20 text-primary border-2 border-primary/50 shadow-lg shadow-primary/10' 
                        : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                    }`}
                    data-testid={`button-stats-char-${idx}`}
                  >
                    <div>{char.name}</div>
                    <div className="text-xs opacity-70">{char.job}</div>
                  </button>
                ))}
              </div>
              
              {/* Selected Character's Stats */}
              {game.party[selectedCharForStats] && (() => {
                const char = game.party[selectedCharForStats];
                const effectiveStats = getEffectiveStats(char);
                const xpNeeded = xpForLevel(char.level + 1);
                const xpProgress = Math.min(100, Math.round((char.xp / xpNeeded) * 100));
                const equippedItems = getEquippedItemsArray(char);
                const activeBonuses = getActiveSetBonuses(equippedItems);
                const combatStats = getCombatStats(char);
                
                return (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-3">
                      {/* Basic Info */}
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-primary font-pixel text-base">{char.name}</span>
                          <span className="text-xs text-amber-400 uppercase">{char.job}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Level {char.level} | XP: {char.xp}/{xpNeeded} ({xpProgress}%)
                        </div>
                        <div className="w-full bg-black/50 rounded-full h-2 mt-2">
                          <div 
                            className="bg-amber-400 h-2 rounded-full transition-all" 
                            style={{ width: `${xpProgress}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* HP/MP */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-xs text-muted-foreground mb-1">HP</div>
                          <div className="text-base text-green-400 font-pixel">{char.hp}/{effectiveStats.maxHp}</div>
                          <div className="w-full bg-black/50 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all" 
                              style={{ width: `${Math.round((char.hp / effectiveStats.maxHp) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-xs text-muted-foreground mb-1">MP</div>
                          <div className="text-base text-blue-400 font-pixel">{char.mp}/{effectiveStats.maxMp}</div>
                          <div className="w-full bg-black/50 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all" 
                              style={{ width: `${effectiveStats.maxMp > 0 ? Math.round((char.mp / effectiveStats.maxMp) * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Combat Stats */}
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="text-xs text-muted-foreground mb-2">COMBAT STATS</div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ATK:</span>
                            <span className="text-red-400 font-medium">{effectiveStats.attack}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">DEF:</span>
                            <span className="text-blue-400 font-medium">{effectiveStats.defense}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">SPD:</span>
                            <span className="text-yellow-400 font-medium">{effectiveStats.speed}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stat Breakdown */}
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="text-xs text-muted-foreground mb-2">STAT BREAKDOWN</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base ATK:</span>
                            <span className="text-foreground">{char.attack}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equip ATK:</span>
                            <span className="text-green-400">+{effectiveStats.attack - char.attack}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base DEF:</span>
                            <span className="text-foreground">{char.defense}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equip DEF:</span>
                            <span className="text-green-400">+{effectiveStats.defense - char.defense}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base HP:</span>
                            <span className="text-foreground">{char.maxHp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equip HP:</span>
                            <span className="text-green-400">+{effectiveStats.maxHp - char.maxHp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base MP:</span>
                            <span className="text-foreground">{char.maxMp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equip MP:</span>
                            <span className="text-green-400">+{effectiveStats.maxMp - char.maxMp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base SPD:</span>
                            <span className="text-foreground">{char.speed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equip SPD:</span>
                            <span className="text-green-400">+{effectiveStats.speed - char.speed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-3">
                      {/* Active Set Bonuses */}
                      {activeBonuses.length > 0 && (
                        <div className="bg-white/5 rounded-lg p-3 border border-purple-400/30">
                          <div className="text-xs text-purple-400 mb-2">ACTIVE SET BONUSES</div>
                          <div className="space-y-2">
                            {activeBonuses.map(({ setName, pieceCount, bonuses }) => (
                              <div key={setName} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-purple-300 font-medium">{setName}</span>
                                  <span className="text-xs text-muted-foreground">({pieceCount}pc)</span>
                                </div>
                                {bonuses.map((bonus, idx) => (
                                  <div key={idx} className="text-xs text-green-400 pl-2">
                                    • {bonus.description}
                                  </div>
                                ))}
                              </div>
                            ))}
                            
                            {/* Combat bonus summary */}
                            <div className="mt-2 pt-2 border-t border-white/10">
                              <div className="text-xs text-muted-foreground mb-1">Combat Effects:</div>
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                {combatStats.critChance > 0 && (
                                  <span className="text-yellow-400">Crit: {combatStats.critChance}%</span>
                                )}
                                {combatStats.critDamage > 0 && (
                                  <span className="text-orange-400">Crit Dmg: +{combatStats.critDamage}%</span>
                                )}
                                {combatStats.evasion > 0 && (
                                  <span className="text-cyan-400">Evasion: {combatStats.evasion}%</span>
                                )}
                                {combatStats.lifesteal > 0 && (
                                  <span className="text-red-400">Lifesteal: {combatStats.lifesteal}%</span>
                                )}
                                {combatStats.counterChance > 0 && (
                                  <span className="text-amber-400">Counter: {combatStats.counterChance}%</span>
                                )}
                                {combatStats.defensePenetration > 0 && (
                                  <span className="text-pink-400">Pen: {combatStats.defensePenetration}%</span>
                                )}
                                {combatStats.burnDamage > 0 && (
                                  <span className="text-orange-500">Burn: {combatStats.burnDamage}/turn</span>
                                )}
                                {combatStats.slowEffect > 0 && (
                                  <span className="text-blue-400">Slow: {combatStats.slowEffect}%</span>
                                )}
                                {combatStats.chainDamage > 0 && (
                                  <span className="text-purple-400">Chain: {combatStats.chainDamage}%</span>
                                )}
                                {combatStats.onHitHeal > 0 && (
                                  <span className="text-green-400">On-hit: +{combatStats.onHitHeal} HP</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Equipped Items Summary */}
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="text-xs text-muted-foreground mb-2">EQUIPPED ITEMS</div>
                        <div className="space-y-1">
                          {(['weapon', 'shield', 'armor', 'helmet', 'gloves', 'boots', 'necklace', 'ring1', 'ring2', 'relic', 'offhand'] as const)
                            .filter(slot => {
                              if (slot === 'shield') return char.job === 'Fighter';
                              if (slot === 'offhand') return char.job !== 'Fighter';
                              if (slot === 'relic') return char.job === 'Mage';
                              return true;
                            })
                            .map(slot => {
                            const item = char.equipment[slot];
                            return (
                              <div key={slot} className="flex justify-between text-xs">
                                <span className="text-muted-foreground capitalize">{slot}:</span>
                                {item ? (
                                  <span className={`${
                                    item.rarity === 'legendary' ? 'text-amber-400' :
                                    item.rarity === 'epic' ? 'text-purple-400' : 
                                    item.rarity === 'rare' ? 'text-blue-400' : 
                                    item.rarity === 'uncommon' ? 'text-green-400' : 
                                    'text-foreground'
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
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* Cheat Menu - Press ` to toggle */}
      {showCheatMenu && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowCheatMenu(false)}>
          <div 
            className="bg-gradient-to-b from-red-950 to-stone-950 border-2 border-red-500/50 rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-red-500/30">
              <h2 className="text-red-400 font-pixel text-lg">CHEAT MENU</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400/60">(Press ` to close)</span>
                <RetroButton 
                  onClick={() => setShowCheatMenu(false)}
                  className="w-8 h-8 p-0"
                  variant="ghost"
                  data-testid="button-close-cheats"
                >
                  <X className="w-4 h-4" />
                </RetroButton>
              </div>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(80vh-80px)]">
              {/* Level Controls */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-xs text-red-400 mb-2">DUNGEON LEVEL</div>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => {
                        if (game) {
                          const newGame = { ...game, level: lvl };
                          setGame(newGame);
                          saveMutation.mutate({ data: newGame as any, lastSavedAt: new Date().toISOString() });
                          log(`Warped to level ${lvl}!`);
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        game?.level === lvl 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                      data-testid={`cheat-level-${lvl}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Gold */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-xs text-red-400 mb-2">GOLD: {game?.gold || 0}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (game) {
                        const newGame = { ...game, gold: game.gold + 100 };
                        setGame(newGame);
                        saveMutation.mutate({ data: newGame as any, lastSavedAt: new Date().toISOString() });
                        log("+100 Gold!");
                      }
                    }}
                    className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40 rounded transition-colors"
                    data-testid="cheat-gold-100"
                  >
                    +100
                  </button>
                  <button
                    onClick={() => {
                      if (game) {
                        const newGame = { ...game, gold: game.gold + 1000 };
                        setGame(newGame);
                        saveMutation.mutate({ data: newGame as any, lastSavedAt: new Date().toISOString() });
                        log("+1000 Gold!");
                      }
                    }}
                    className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40 rounded transition-colors"
                    data-testid="cheat-gold-1000"
                  >
                    +1000
                  </button>
                </div>
              </div>
              
              {/* Party HP/MP */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-xs text-red-400 mb-2">PARTY</div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      if (game) {
                        const newParty = game.party.map(c => ({
                          ...c,
                          hp: getEffectiveStats(c).maxHp,
                          mp: getEffectiveStats(c).maxMp
                        }));
                        const newGame = { ...game, party: newParty };
                        setGame(newGame);
                        saveMutation.mutate({ data: newGame as any, lastSavedAt: new Date().toISOString() });
                        log("Party fully healed!");
                      }
                    }}
                    className="px-3 py-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/40 rounded transition-colors"
                    data-testid="cheat-heal-party"
                  >
                    Full Heal
                  </button>
                  <button
                    onClick={() => {
                      if (game) {
                        const newParty = game.party.map(c => ({
                          ...c,
                          level: c.level + 1,
                          xp: 0,
                          attack: c.attack + 3,
                          defense: c.defense + 2,
                          maxHp: c.maxHp + 10,
                          hp: c.hp + 10,
                          maxMp: c.maxMp + 5,
                          mp: c.mp + 5,
                          speed: c.speed + 1
                        }));
                        const newGame = { ...game, party: newParty };
                        setGame(newGame);
                        saveMutation.mutate({ data: newGame as any, lastSavedAt: new Date().toISOString() });
                        log("Party leveled up!");
                      }
                    }}
                    className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/40 rounded transition-colors"
                    data-testid="cheat-level-up"
                  >
                    Level Up All
                  </button>
                  <button
                    onClick={() => {
                      if (game) {
                        const newParty = game.party.map(c => ({
                          ...c,
                          level: c.level + 10,
                          xp: 0,
                          attack: c.attack + 30,
                          defense: c.defense + 20,
                          maxHp: c.maxHp + 100,
                          hp: c.maxHp + 100,
                          maxMp: c.maxMp + 50,
                          mp: c.maxMp + 50,
                          speed: c.speed + 10
                        }));
                        const newGame = { ...game, party: newParty };
                        setGame(newGame);
                        saveMutation.mutate({ data: newGame as any, lastSavedAt: new Date().toISOString() });
                        log("Party gained 10 levels!");
                      }
                    }}
                    className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/40 rounded transition-colors"
                    data-testid="cheat-level-up-10"
                  >
                    +10 Levels
                  </button>
                </div>
              </div>
              
              {/* Potions */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-xs text-red-400 mb-2">POTIONS ({game?.potionInventory?.length || 0})</div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      if (game) {
                        const newPotions = [
                          { id: `hp_cheat_${Date.now()}_1`, name: 'Health Potion', type: 'health' as const, healAmount: 50, manaAmount: 0, rarity: 'uncommon' as const, description: 'Restores 50 HP' },
                          { id: `hp_cheat_${Date.now()}_2`, name: 'Health Potion', type: 'health' as const, healAmount: 50, manaAmount: 0, rarity: 'uncommon' as const, description: 'Restores 50 HP' },
                          { id: `mp_cheat_${Date.now()}_1`, name: 'Mana Potion', type: 'mana' as const, healAmount: 0, manaAmount: 30, rarity: 'uncommon' as const, description: 'Restores 30 MP' },
                          { id: `mp_cheat_${Date.now()}_2`, name: 'Mana Potion', type: 'mana' as const, healAmount: 0, manaAmount: 30, rarity: 'uncommon' as const, description: 'Restores 30 MP' },
                          { id: `elixir_cheat_${Date.now()}`, name: 'Elixir', type: 'elixir' as const, healAmount: 50, manaAmount: 25, rarity: 'rare' as const, description: 'Restores 50 HP and 25 MP' },
                        ];
                        const newGame = { 
                          ...game, 
                          potionInventory: [...game.potionInventory, ...newPotions]
                        };
                        setGame(newGame);
                        saveMutation.mutate({ data: newGame as any, lastSavedAt: new Date().toISOString() });
                        log("+5 Potions added!");
                      }
                    }}
                    className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40 rounded transition-colors"
                    data-testid="cheat-potions"
                  >
                    +Potions
                  </button>
                </div>
              </div>
              
              {/* Equipment */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-xs text-red-400 mb-2">EQUIPMENT</div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      if (game) {
                        const newItem = getRandomEquipmentDrop(game.level);
                        if (newItem) {
                          const newGame = { 
                            ...game, 
                            equipmentInventory: [...game.equipmentInventory, newItem]
                          };
                          setGame(newGame);
                          saveMutation.mutate({ data: newGame as any, lastSavedAt: new Date().toISOString() });
                          log(`Found ${newItem.name}!`);
                        } else {
                          log("No item dropped, try again!");
                        }
                      }
                    }}
                    className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded transition-colors"
                    data-testid="cheat-random-equip"
                  >
                    Random Item
                  </button>
                  <button
                    onClick={() => {
                      if (game) {
                        // Force drop 3 items
                        const items: Equipment[] = [];
                        for (let i = 0; i < 3; i++) {
                          const item = getRandomEquipmentDrop(game.level + 5);
                          if (item) items.push(item);
                        }
                        if (items.length > 0) {
                          const newGame = { 
                            ...game, 
                            equipmentInventory: [...game.equipmentInventory, ...items]
                          };
                          setGame(newGame);
                          saveMutation.mutate({ data: newGame as any, lastSavedAt: new Date().toISOString() });
                          log(`Found ${items.length} items!`);
                        }
                      }
                    }}
                    className="px-3 py-1 text-xs bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 rounded transition-colors"
                    data-testid="cheat-legendary"
                  >
                    +3 Items
                  </button>
                </div>
              </div>
              
              {/* Combat */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-xs text-red-400 mb-2">COMBAT</div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      if (game && !combatState.active) {
                        const monsters: Monster[] = [];
                        const count = 1 + Math.floor(Math.random() * 4);
                        for (let i = 0; i < count; i++) {
                          monsters.push(getRandomMonster(game.level));
                        }
                        setCombatState({
                          active: true,
                          monsters,
                          targetIndex: 0,
                          turn: 0,
                          currentCharIndex: 0,
                          turnOrder: [],
                          turnOrderPosition: 0,
                          defending: false
                        });
                        setIsCombatFullscreen(true);
                        log("Combat started!");
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded transition-colors"
                    data-testid="cheat-start-combat"
                  >
                    Start Battle
                  </button>
                  <button
                    onClick={() => {
                      if (combatState.active) {
                        const deadMonsters = combatState.monsters.map(m => ({ ...m, hp: 0 }));
                        setCombatState({ ...combatState, monsters: deadMonsters });
                        log("All monsters killed!");
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded transition-colors"
                    data-testid="cheat-kill-monsters"
                  >
                    Kill All Monsters
                  </button>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                <div className="text-xs text-red-500 mb-2">DANGER ZONE</div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      if (confirm("Reset all progress? This cannot be undone!")) {
                        const freshGame = createInitialState();
                        setGame(freshGame);
                        saveMutation.mutate({ data: freshGame as any, lastSavedAt: new Date().toISOString() });
                        log("Game reset!");
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-600/30 text-red-400 hover:bg-red-600/50 rounded transition-colors"
                    data-testid="cheat-reset"
                  >
                    Reset Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
