import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronRight, Swords, Shield, DoorOpen, Zap, Skull, Wand2, Hand } from "lucide-react";
import type { GameData, Monster, Player, Ability } from "@/lib/game-engine";

// Level 1 Stone Dungeon backgrounds - randomly selected per battle
import stoneDungeonBg1 from "@assets/Gemini_Generated_Image_haabe3haabe3haab_1770316826611.png";
import stoneDungeonBg2 from "@assets/Gemini_Generated_Image_8ydwe58ydwe58ydw_1770316967886.png";
import stoneDungeonBg3 from "@assets/Gemini_Generated_Image_ig45onig45onig45_1770316967886.png";
import stoneDungeonBg4 from "@assets/Gemini_Generated_Image_oek41koek41koek4_1770316967886.png";

const STONE_DUNGEON_BACKGROUNDS = [
  stoneDungeonBg1,
  stoneDungeonBg2,
  stoneDungeonBg3,
  stoneDungeonBg4
];

interface EffectiveStats {
  attack: number;
  defense: number;
  maxHp: number;
  maxMp: number;
  speed: number;
}

interface BattleViewProps {
  game: GameData;
  combatState: {
    active: boolean;
    monsters: Monster[];
    currentCharIndex: number;
    targetIndex: number;
  };
  onTargetSelect: (index: number) => void;
  onAbilityUse: (ability: Ability, charIndex: number) => void;
  onFlee: () => void;
  getAbilitiesForJob: (job: string) => Ability[];
  getEffectiveStats: (char: Player) => EffectiveStats;
  monsterAnimations: Record<number, string>;
  logs: string[];
}

const JOB_COLORS: Record<string, string> = {
  fighter: "#ef4444",
  mage: "#3b82f6",
  monk: "#22c55e"
};

function JobIcon({ job, className }: { job: string; className?: string }) {
  const normalizedJob = job.toLowerCase();
  switch (normalizedJob) {
    case 'fighter':
      return <Swords className={className} />;
    case 'mage':
      return <Wand2 className={className} />;
    case 'monk':
      return <Hand className={className} />;
    default:
      return <Swords className={className} />;
  }
}

function TransparentMonster({ 
  src, 
  alt, 
  className,
  animationState = 'idle',
  isFlying = false
}: { 
  src: string; 
  alt: string; 
  className?: string;
  animationState?: 'idle' | 'attacking' | 'hit';
  isFlying?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processingState, setProcessingState] = useState<'loading' | 'processed' | 'fallback'>('loading');

  useEffect(() => {
    setProcessingState('loading');
    const canvas = canvasRef.current;
    if (!canvas) {
      setProcessingState('fallback');
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setProcessingState('fallback');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Sample edge pixels but only 1 pixel deep to avoid hitting sprite content
        const edgePixels: number[][] = [];
        const edgeDepth = 1; // Only 1 pixel deep - very conservative
        
        // Top edge
        for (let y = 0; y < edgeDepth; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            edgePixels.push([data[idx], data[idx + 1], data[idx + 2]]);
          }
        }
        // Bottom edge
        for (let y = canvas.height - edgeDepth; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            edgePixels.push([data[idx], data[idx + 1], data[idx + 2]]);
          }
        }
        // Left edge (excluding corners already counted)
        for (let y = edgeDepth; y < canvas.height - edgeDepth; y++) {
          for (let x = 0; x < edgeDepth; x++) {
            const idx = (y * canvas.width + x) * 4;
            edgePixels.push([data[idx], data[idx + 1], data[idx + 2]]);
          }
        }
        // Right edge (excluding corners already counted)
        for (let y = edgeDepth; y < canvas.height - edgeDepth; y++) {
          for (let x = canvas.width - edgeDepth; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            edgePixels.push([data[idx], data[idx + 1], data[idx + 2]]);
          }
        }

        // Find the most common edge color (the background)
        const colorCounts: Record<string, { count: number; r: number; g: number; b: number }> = {};
        edgePixels.forEach(([r, g, b]) => {
          // Quantize to group similar colors
          const qr = Math.round(r / 15) * 15;
          const qg = Math.round(g / 15) * 15;
          const qb = Math.round(b / 15) * 15;
          const key = `${qr},${qg},${qb}`;
          if (!colorCounts[key]) {
            colorCounts[key] = { count: 0, r: qr, g: qg, b: qb };
          }
          colorCounts[key].count++;
        });

        // Get the most common color - just needs to be the dominant one (>25% threshold)
        let bgR = 0, bgG = 0, bgB = 0;
        let maxCount = 0;
        let foundBg = false;
        const totalPixels = edgePixels.length;
        for (const entry of Object.values(colorCounts)) {
          // Low threshold - just find the most common edge color
          if (entry.count > maxCount && entry.count > totalPixels * 0.25) {
            maxCount = entry.count;
            bgR = entry.r;
            bgG = entry.g;
            bgB = entry.b;
            foundBg = true;
          }
        }

        // Only process if we found a clear dominant background color
        if (foundBg) {
          // Hard clip tolerance - ultra conservative to preserve all sprite details
          const tolerance = 18;

          // Process pixels - hard clip background (no fading)
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Calculate color distance from background
            const distance = Math.sqrt(
              Math.pow(r - bgR, 2) +
              Math.pow(g - bgG, 2) +
              Math.pow(b - bgB, 2)
            );

            // Hard cutout - fully transparent if within tolerance, fully opaque otherwise
            if (distance < tolerance) {
              data[i + 3] = 0; // Fully transparent
            }
            // Keep original alpha for non-background pixels
          }

          ctx.putImageData(imageData, 0, 0);
          setProcessingState('processed');
        } else {
          // No dominant background found - use fallback image
          setProcessingState('fallback');
        }
      } catch (e) {
        // Canvas tainted by CORS or other error - fallback to original image
        console.warn('Could not process monster image, using fallback:', e);
        setProcessingState('fallback');
      }
    };

    img.onerror = () => {
      setProcessingState('fallback');
    };

    img.src = src;
  }, [src]);

  const getAnimationStyle = () => {
    switch (animationState) {
      case 'attacking':
        return { transform: 'translateX(30px) scale(1.1)', filter: 'brightness(1.3)' };
      case 'hit':
        return { transform: 'translateX(-10px)', filter: 'brightness(1.5) hue-rotate(30deg)' };
      default:
        return {};
    }
  };

  return (
    <div 
      className={`relative transition-all duration-200 ${isFlying ? 'animate-float' : ''}`}
      style={getAnimationStyle()}
    >
      {/* Processed canvas - shown when background removal succeeds */}
      <canvas 
        ref={canvasRef}
        className={`${className} object-contain ${processingState === 'processed' ? 'opacity-100' : 'opacity-0 absolute'}`}
        style={{ 
          transition: 'opacity 0.2s ease-in'
        }}
      />
      {/* Fallback image - shown when canvas processing fails or during loading */}
      {processingState !== 'processed' && (
        <img 
          src={src} 
          alt={alt} 
          className={`${className} object-contain ${processingState === 'fallback' ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            transition: 'opacity 0.2s ease-in'
          }}
        />
      )}
    </div>
  );
}

function isFlying(name: string): boolean {
  const flyingTypes = ['bat', 'bird', 'dragon', 'fairy', 'ghost', 'spirit', 'wisp', 'eye', 'floating'];
  return flyingTypes.some(type => name.toLowerCase().includes(type));
}

// Floor theme configuration - matches dungeon textures per level
interface FloorTheme {
  name: string;
  bg: string;
  ground: string;
  groundTexture: 'cobblestone' | 'dirt' | 'crystal' | 'volcanic' | 'dark_tile' | 'moss' | 'ice' | 'bone' | 'ancient' | 'obsidian';
  silhouette: 'stone_bricks' | 'stalactites' | 'crystals' | 'volcanic' | 'ruins' | 'roots' | 'icicles' | 'bones' | 'pillars' | 'void';
  atmosphere: 'torches' | 'drips' | 'crystal_glow' | 'lava_embers' | 'runes' | 'spores' | 'snowfall' | 'souls' | 'dust' | 'void_rifts';
  ambientColor: string;
  fogColor: string;
  backgroundImages?: string[];
}

const FLOOR_THEMES: FloorTheme[] = [
  // Level 1: Stone Dungeon - classic dungeon entrance (randomly picks from 4 backgrounds)
  { 
    name: 'Stone Dungeon',
    bg: 'from-stone-900 via-stone-800 to-gray-900',
    ground: 'bg-gradient-to-b from-stone-600 to-stone-800',
    groundTexture: 'cobblestone',
    silhouette: 'stone_bricks',
    atmosphere: 'torches',
    ambientColor: 'rgba(255, 180, 100, 0.08)',
    fogColor: 'rgba(80, 70, 60, 0.2)',
    backgroundImages: STONE_DUNGEON_BACKGROUNDS
  },
  // Level 2: Mossy Cavern - overgrown tunnels
  {
    name: 'Mossy Cavern',
    bg: 'from-green-950 via-emerald-900 to-green-950',
    ground: 'bg-gradient-to-b from-green-800 to-emerald-950',
    groundTexture: 'moss',
    silhouette: 'roots',
    atmosphere: 'spores',
    ambientColor: 'rgba(100, 200, 100, 0.1)',
    fogColor: 'rgba(50, 80, 50, 0.4)'
  },
  // Level 3: Crystal Caves - glittering underground
  {
    name: 'Crystal Caves',
    bg: 'from-cyan-950 via-blue-900 to-indigo-950',
    ground: 'bg-gradient-to-b from-cyan-800 to-blue-950',
    groundTexture: 'crystal',
    silhouette: 'crystals',
    atmosphere: 'crystal_glow',
    ambientColor: 'rgba(100, 200, 255, 0.15)',
    fogColor: 'rgba(50, 100, 150, 0.3)'
  },
  // Level 4: Flooded Depths - dripping water
  {
    name: 'Flooded Depths',
    bg: 'from-slate-900 via-blue-950 to-slate-950',
    ground: 'bg-gradient-to-b from-slate-700 to-blue-950',
    groundTexture: 'cobblestone',
    silhouette: 'stalactites',
    atmosphere: 'drips',
    ambientColor: 'rgba(100, 150, 200, 0.1)',
    fogColor: 'rgba(60, 80, 100, 0.4)'
  },
  // Level 5: Ice Caverns - frozen passages
  {
    name: 'Ice Caverns',
    bg: 'from-sky-950 via-cyan-900 to-blue-950',
    ground: 'bg-gradient-to-b from-sky-800 to-cyan-950',
    groundTexture: 'ice',
    silhouette: 'icicles',
    atmosphere: 'snowfall',
    ambientColor: 'rgba(200, 230, 255, 0.15)',
    fogColor: 'rgba(180, 200, 220, 0.3)'
  },
  // Level 6: Fire Depths - volcanic tunnels
  {
    name: 'Fire Depths',
    bg: 'from-red-950 via-orange-900 to-amber-950',
    ground: 'bg-gradient-to-b from-red-900 to-orange-950',
    groundTexture: 'volcanic',
    silhouette: 'volcanic',
    atmosphere: 'lava_embers',
    ambientColor: 'rgba(255, 100, 50, 0.2)',
    fogColor: 'rgba(100, 50, 30, 0.4)'
  },
  // Level 7: Bone Catacombs - skeletal remains
  {
    name: 'Bone Catacombs',
    bg: 'from-stone-950 via-neutral-900 to-zinc-950',
    ground: 'bg-gradient-to-b from-stone-800 to-neutral-950',
    groundTexture: 'bone',
    silhouette: 'bones',
    atmosphere: 'souls',
    ambientColor: 'rgba(200, 200, 180, 0.1)',
    fogColor: 'rgba(100, 100, 90, 0.4)'
  },
  // Level 8: Ancient Ruins - forgotten temple
  {
    name: 'Ancient Ruins',
    bg: 'from-amber-950 via-yellow-900 to-orange-950',
    ground: 'bg-gradient-to-b from-amber-800 to-yellow-950',
    groundTexture: 'ancient',
    silhouette: 'pillars',
    atmosphere: 'runes',
    ambientColor: 'rgba(255, 200, 100, 0.15)',
    fogColor: 'rgba(80, 60, 40, 0.3)'
  },
  // Level 9: Dark Abyss - shadowy depths
  {
    name: 'Dark Abyss',
    bg: 'from-gray-950 via-zinc-900 to-black',
    ground: 'bg-gradient-to-b from-gray-900 to-zinc-950',
    groundTexture: 'dark_tile',
    silhouette: 'void',
    atmosphere: 'void_rifts',
    ambientColor: 'rgba(100, 50, 150, 0.1)',
    fogColor: 'rgba(30, 20, 40, 0.5)'
  },
  // Level 10: Obsidian Throne - final floor
  {
    name: 'Obsidian Throne',
    bg: 'from-purple-950 via-violet-900 to-fuchsia-950',
    ground: 'bg-gradient-to-b from-purple-900 to-violet-950',
    groundTexture: 'obsidian',
    silhouette: 'ruins',
    atmosphere: 'dust',
    ambientColor: 'rgba(200, 100, 255, 0.15)',
    fogColor: 'rgba(60, 30, 80, 0.4)'
  }
];

// Themed silhouette SVG components for background
function ThemeSilhouette({ type }: { type: FloorTheme['silhouette'] }) {
  switch (type) {
    case 'stone_bricks':
      return (
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Stone wall with archways */}
          <path d="M0,200 L0,80 L50,80 L50,60 L100,60 L100,80 L200,80 L200,40 L250,40 L250,80 L400,80 L400,50 L450,50 L450,80 L550,80 L550,60 L600,60 L600,80 L750,80 L750,30 L800,30 L800,80 L950,80 L950,55 L1000,55 L1000,80 L1100,80 L1100,45 L1150,45 L1150,80 L1200,80 L1200,200 Z" fill="currentColor" className="text-black/50" />
          {/* Stone brick lines */}
          <line x1="0" y1="100" x2="1200" y2="100" stroke="currentColor" strokeWidth="2" className="text-black/20" />
          <line x1="0" y1="130" x2="1200" y2="130" stroke="currentColor" strokeWidth="2" className="text-black/20" />
          <line x1="0" y1="160" x2="1200" y2="160" stroke="currentColor" strokeWidth="2" className="text-black/20" />
        </svg>
      );
    case 'stalactites':
      return (
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Hanging stalactites */}
          <path d="M0,200 L0,120 L30,80 L60,140 L100,60 L130,130 L180,40 L210,120 L280,50 L320,140 L380,30 L420,100 L480,70 L540,150 L600,20 L650,110 L720,45 L780,130 L840,55 L900,140 L960,35 L1020,120 L1080,60 L1140,130 L1200,80 L1200,200 Z" fill="currentColor" className="text-black/50" />
          {/* Dripping formations */}
          <path d="M100,0 L110,60 L90,60 Z" fill="currentColor" className="text-black/30" />
          <path d="M350,0 L365,80 L335,80 Z" fill="currentColor" className="text-black/30" />
          <path d="M600,0 L620,100 L580,100 Z" fill="currentColor" className="text-black/30" />
          <path d="M850,0 L865,70 L835,70 Z" fill="currentColor" className="text-black/30" />
          <path d="M1100,0 L1115,50 L1085,50 Z" fill="currentColor" className="text-black/30" />
        </svg>
      );
    case 'crystals':
      return (
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Crystal formations */}
          <path d="M0,200 L0,100 L40,60 L80,100 L120,30 L160,80 L200,50 L240,90 L280,20 L320,70 L360,40 L400,100 L440,60 L480,90 L520,10 L560,80 L600,40 L640,70 L680,30 L720,100 L760,50 L800,80 L840,25 L880,90 L920,55 L960,85 L1000,35 L1040,75 L1080,45 L1120,95 L1160,60 L1200,80 L1200,200 Z" fill="currentColor" className="text-cyan-900/60" />
          {/* Crystal shards */}
          <polygon points="150,0 170,90 130,90" fill="currentColor" className="text-cyan-400/30" />
          <polygon points="400,0 425,70 375,70" fill="currentColor" className="text-blue-400/30" />
          <polygon points="700,0 730,100 670,100" fill="currentColor" className="text-cyan-300/30" />
          <polygon points="950,0 975,60 925,60" fill="currentColor" className="text-blue-300/30" />
        </svg>
      );
    case 'volcanic':
      return (
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Jagged volcanic rock */}
          <path d="M0,200 L0,100 L50,70 L80,100 L130,50 L180,90 L230,40 L280,80 L350,30 L400,70 L460,45 L520,85 L580,25 L640,75 L700,35 L760,90 L820,50 L880,80 L940,40 L1000,95 L1060,55 L1120,85 L1180,60 L1200,80 L1200,200 Z" fill="currentColor" className="text-black/60" />
          {/* Lava glow along base */}
          <path d="M0,200 L0,170 Q100,160 200,175 T400,165 T600,180 T800,160 T1000,175 T1200,165 L1200,200 Z" fill="currentColor" className="text-orange-600/40" />
        </svg>
      );
    case 'ruins':
      return (
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Broken pillars and ruins */}
          <path d="M0,200 L0,120 L40,120 L40,60 L80,60 L80,120 L150,120 L150,80 L180,50 L210,80 L210,120 L300,120 L300,40 L340,40 L340,120 L450,120 L450,90 L500,30 L550,90 L550,120 L650,120 L650,70 L700,70 L700,120 L800,120 L800,50 L850,20 L900,50 L900,120 L1000,120 L1000,80 L1050,80 L1050,120 L1150,120 L1150,60 L1200,60 L1200,200 Z" fill="currentColor" className="text-black/50" />
          {/* Fallen debris */}
          <ellipse cx="250" cy="180" rx="40" ry="15" fill="currentColor" className="text-black/30" />
          <ellipse cx="600" cy="185" rx="50" ry="12" fill="currentColor" className="text-black/30" />
          <ellipse cx="950" cy="175" rx="35" ry="18" fill="currentColor" className="text-black/30" />
        </svg>
      );
    case 'roots':
      return (
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Tangled roots and vines */}
          <path d="M0,200 L0,100 Q50,80 100,110 T200,90 T300,120 T400,85 T500,115 T600,80 T700,100 T800,75 T900,105 T1000,90 T1100,110 T1200,85 L1200,200 Z" fill="currentColor" className="text-green-950/60" />
          {/* Hanging roots */}
          <path d="M100,0 Q90,60 110,100 Q130,140 100,180" stroke="currentColor" strokeWidth="8" fill="none" className="text-green-900/40" />
          <path d="M400,0 Q380,80 420,120 Q440,160 400,200" stroke="currentColor" strokeWidth="6" fill="none" className="text-green-800/40" />
          <path d="M750,0 Q780,50 740,100 Q710,150 760,180" stroke="currentColor" strokeWidth="10" fill="none" className="text-green-900/40" />
          <path d="M1050,0 Q1030,70 1070,110 Q1090,140 1040,170" stroke="currentColor" strokeWidth="7" fill="none" className="text-green-800/40" />
        </svg>
      );
    case 'icicles':
      return (
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Ice formations */}
          <path d="M0,200 L0,100 L40,50 L80,100 L120,30 L160,90 L200,60 L240,100 L280,20 L320,80 L360,40 L400,95 L440,55 L480,100 L520,25 L560,85 L600,45 L640,100 L680,35 L720,75 L760,50 L800,100 L840,30 L880,85 L920,55 L960,95 L1000,40 L1040,80 L1080,60 L1120,100 L1160,45 L1200,80 L1200,200 Z" fill="currentColor" className="text-cyan-200/30" />
          {/* Icicle spikes */}
          <polygon points="80,0 95,80 65,80" fill="currentColor" className="text-sky-100/50" />
          <polygon points="280,0 300,120 260,120" fill="currentColor" className="text-cyan-100/50" />
          <polygon points="520,0 545,90 495,90" fill="currentColor" className="text-sky-200/50" />
          <polygon points="780,0 800,110 760,110" fill="currentColor" className="text-cyan-100/50" />
          <polygon points="1000,0 1020,70 980,70" fill="currentColor" className="text-sky-100/50" />
        </svg>
      );
    case 'bones':
      return (
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Bone pile silhouette */}
          <path d="M0,200 L0,130 Q80,110 160,130 T320,120 T480,135 T640,115 T800,130 T960,120 T1120,135 L1200,125 L1200,200 Z" fill="currentColor" className="text-stone-800/50" />
          {/* Skull shapes */}
          <circle cx="150" cy="100" r="25" fill="currentColor" className="text-stone-600/40" />
          <circle cx="500" cy="90" r="30" fill="currentColor" className="text-stone-600/40" />
          <circle cx="900" cy="95" r="28" fill="currentColor" className="text-stone-600/40" />
          {/* Rib cage arch */}
          <path d="M600,0 Q650,40 700,0" stroke="currentColor" strokeWidth="8" fill="none" className="text-stone-500/30" />
          <path d="M580,20 Q650,70 720,20" stroke="currentColor" strokeWidth="6" fill="none" className="text-stone-500/25" />
        </svg>
      );
    case 'pillars':
      return (
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Ancient temple pillars */}
          <rect x="50" y="0" width="60" height="200" fill="currentColor" className="text-amber-900/40" />
          <rect x="250" y="0" width="50" height="200" fill="currentColor" className="text-amber-900/35" />
          <rect x="500" y="0" width="70" height="200" fill="currentColor" className="text-amber-900/45" />
          <rect x="750" y="0" width="55" height="200" fill="currentColor" className="text-amber-900/35" />
          <rect x="1000" y="0" width="65" height="200" fill="currentColor" className="text-amber-900/40" />
          {/* Pillar capitals */}
          <rect x="40" y="30" width="80" height="15" fill="currentColor" className="text-amber-800/50" />
          <rect x="240" y="20" width="70" height="12" fill="currentColor" className="text-amber-800/45" />
          <rect x="490" y="25" width="90" height="18" fill="currentColor" className="text-amber-800/55" />
          <rect x="740" y="35" width="75" height="14" fill="currentColor" className="text-amber-800/45" />
          <rect x="990" y="28" width="85" height="16" fill="currentColor" className="text-amber-800/50" />
        </svg>
      );
    case 'void':
      return (
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Void darkness with floating fragments */}
          <path d="M0,200 L0,120 Q100,100 200,130 T400,110 T600,140 T800,100 T1000,125 T1200,110 L1200,200 Z" fill="currentColor" className="text-black/70" />
          {/* Floating void fragments */}
          <rect x="100" y="50" width="40" height="30" fill="currentColor" className="text-purple-950/50" transform="rotate(15 120 65)" />
          <rect x="350" y="30" width="50" height="25" fill="currentColor" className="text-purple-950/40" transform="rotate(-10 375 42)" />
          <rect x="650" y="60" width="35" height="35" fill="currentColor" className="text-purple-950/50" transform="rotate(25 667 77)" />
          <rect x="900" y="40" width="45" height="28" fill="currentColor" className="text-purple-950/45" transform="rotate(-20 922 54)" />
        </svg>
      );
  }
}

// Atmospheric effects component
function AtmosphereEffects({ type, ambientColor }: { type: FloorTheme['atmosphere']; ambientColor: string }) {
  const particleStyle = (delay: number, duration: number, x: string, y: string) => ({
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    left: x,
    top: y
  });

  switch (type) {
    case 'torches':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Torch glow on walls */}
          <div className="absolute left-[5%] top-[30%] w-20 h-32 rounded-full animate-pulse" style={{ background: 'radial-gradient(ellipse, rgba(255,150,50,0.3) 0%, transparent 70%)' }} />
          <div className="absolute right-[8%] top-[25%] w-24 h-36 rounded-full animate-pulse" style={{ background: 'radial-gradient(ellipse, rgba(255,120,40,0.25) 0%, transparent 70%)', animationDelay: '0.5s' }} />
          {/* Floating embers */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-400 rounded-full animate-float-up opacity-60"
              style={particleStyle(i * 0.8, 4 + i * 0.5, `${10 + i * 12}%`, '60%')}
            />
          ))}
        </div>
      );
    case 'drips':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Water droplets */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-4 bg-gradient-to-b from-blue-400/60 to-transparent animate-drip"
              style={particleStyle(i * 1.2, 2 + i * 0.3, `${15 + i * 15}%`, '0%')}
            />
          ))}
          {/* Water reflection shimmer */}
          <div className="absolute bottom-0 left-0 right-0 h-[20%] opacity-30" style={{ background: 'linear-gradient(180deg, transparent, rgba(100,150,200,0.2))' }} />
        </div>
      );
    case 'crystal_glow':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Crystal light sources */}
          <div className="absolute left-[15%] top-[20%] w-16 h-24 animate-pulse" style={{ background: 'radial-gradient(ellipse, rgba(100,200,255,0.4) 0%, transparent 70%)' }} />
          <div className="absolute right-[20%] top-[35%] w-20 h-16 animate-pulse" style={{ background: 'radial-gradient(ellipse, rgba(150,180,255,0.35) 0%, transparent 70%)', animationDelay: '0.7s' }} />
          <div className="absolute left-[40%] top-[15%] w-12 h-20 animate-pulse" style={{ background: 'radial-gradient(ellipse, rgba(80,220,255,0.3) 0%, transparent 70%)', animationDelay: '1.4s' }} />
          {/* Sparkle particles */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-300 rounded-full animate-twinkle"
              style={particleStyle(i * 0.5, 2 + (i % 3) * 0.5, `${5 + i * 10}%`, `${20 + (i % 4) * 15}%`)}
            />
          ))}
        </div>
      );
    case 'lava_embers':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Rising embers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-float-up"
              style={{
                ...particleStyle(i * 0.6, 3 + i * 0.3, `${5 + i * 8}%`, '70%'),
                background: i % 2 === 0 ? 'radial-gradient(circle, #ff6b35, #ff4500)' : 'radial-gradient(circle, #ffa500, #ff6600)'
              }}
            />
          ))}
          {/* Lava glow from below */}
          <div className="absolute bottom-0 left-0 right-0 h-[25%]" style={{ background: 'linear-gradient(180deg, transparent, rgba(255,100,50,0.4))' }} />
        </div>
      );
    case 'runes':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Glowing runes */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-pulse opacity-40"
              style={particleStyle(i * 0.8, 3 + i * 0.5, `${10 + i * 18}%`, `${25 + (i % 3) * 20}%`)}
            >
              <div className="text-amber-400 drop-shadow-lg" style={{ textShadow: '0 0 10px rgba(255,200,100,0.8)' }}>
                {['⬡', '◇', '△', '☉', '⬢'][i]}
              </div>
            </div>
          ))}
        </div>
      );
    case 'spores':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating spores */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-float-drift opacity-50"
              style={{
                ...particleStyle(i * 0.4, 6 + i * 0.5, `${i * 7}%`, `${30 + (i % 5) * 12}%`),
                background: 'radial-gradient(circle, rgba(150,200,100,0.8), rgba(100,150,50,0.3))'
              }}
            />
          ))}
        </div>
      );
    case 'snowfall':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Falling snow */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/60 animate-snow"
              style={{
                ...particleStyle(i * 0.3, 4 + (i % 4) * 1, `${i * 5}%`, '-5%'),
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`
              }}
            />
          ))}
        </div>
      );
    case 'souls':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating souls/wisps */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-6 rounded-full animate-float-drift opacity-40"
              style={{
                ...particleStyle(i * 1, 8 + i, `${10 + i * 15}%`, `${30 + (i % 3) * 15}%`),
                background: 'radial-gradient(ellipse, rgba(200,200,180,0.6), transparent 70%)'
              }}
            />
          ))}
        </div>
      );
    case 'dust':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Dust motes */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-purple-200/40 animate-float-drift"
              style={particleStyle(i * 0.5, 10 + i, `${i * 8}%`, `${20 + (i % 6) * 12}%`)}
            />
          ))}
        </div>
      );
    case 'void_rifts':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Void rifts/tears */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-16 animate-pulse opacity-60"
              style={{
                ...particleStyle(i * 2, 4 + i, `${20 + i * 30}%`, `${25 + i * 10}%`),
                background: 'linear-gradient(180deg, transparent, rgba(150,50,200,0.6), transparent)',
                transform: `rotate(${-15 + i * 15}deg)`
              }}
            />
          ))}
        </div>
      );
  }
}

// Ground texture pattern component
function GroundTexture({ type }: { type: FloorTheme['groundTexture'] }) {
  switch (type) {
    case 'cobblestone':
      return (
        <div className="absolute inset-0 opacity-30">
          {/* Cobblestone pattern */}
          <svg className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="cobble" patternUnits="userSpaceOnUse" width="60" height="40">
                <rect x="2" y="2" width="25" height="15" rx="3" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
                <rect x="32" y="2" width="25" height="15" rx="3" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
                <rect x="17" y="22" width="25" height="15" rx="3" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cobble)" />
          </svg>
        </div>
      );
    case 'moss':
      return (
        <div className="absolute inset-0 opacity-40">
          {/* Mossy patches */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-green-600/30"
              style={{
                width: `${40 + i * 20}px`,
                height: `${20 + i * 10}px`,
                left: `${i * 12}%`,
                top: `${20 + (i % 3) * 25}%`
              }}
            />
          ))}
        </div>
      );
    case 'crystal':
      return (
        <div className="absolute inset-0 opacity-30">
          {/* Crystal shards on ground */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute border-l-2 border-r-2 border-b-4 border-cyan-400/50"
              style={{
                width: `${8 + i % 4}px`,
                height: `${15 + i % 6}px`,
                left: `${5 + i * 10}%`,
                top: `${40 + (i % 4) * 15}%`,
                transform: `rotate(${-30 + i * 10}deg)`
              }}
            />
          ))}
        </div>
      );
    case 'volcanic':
      return (
        <div className="absolute inset-0 opacity-40">
          {/* Volcanic cracks */}
          <svg className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,30 Q100,50 200,25 T400,40 T600,20 T800,45 T1000,30 T1200,40" stroke="rgba(255,100,50,0.5)" strokeWidth="3" fill="none" />
            <path d="M0,70 Q150,90 300,65 T600,80 T900,60 T1200,75" stroke="rgba(255,80,30,0.4)" strokeWidth="2" fill="none" />
          </svg>
        </div>
      );
    case 'ice':
      return (
        <div className="absolute inset-0 opacity-30">
          {/* Ice surface cracks */}
          <svg className="w-full h-full" preserveAspectRatio="none">
            <path d="M100,0 L150,50 L120,100" stroke="rgba(200,230,255,0.5)" strokeWidth="1" fill="none" />
            <path d="M400,20 L450,80 L500,60 L480,120" stroke="rgba(200,230,255,0.4)" strokeWidth="1" fill="none" />
            <path d="M700,0 L720,40 L780,80 L750,100" stroke="rgba(200,230,255,0.5)" strokeWidth="1" fill="none" />
            <path d="M1000,30 L1050,70 L1020,110" stroke="rgba(200,230,255,0.4)" strokeWidth="1" fill="none" />
          </svg>
        </div>
      );
    case 'bone':
      return (
        <div className="absolute inset-0 opacity-25">
          {/* Scattered bones */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-12 h-2 bg-stone-400 rounded-full"
              style={{
                left: `${10 + i * 15}%`,
                top: `${30 + (i % 3) * 25}%`,
                transform: `rotate(${-45 + i * 30}deg)`
              }}
            />
          ))}
        </div>
      );
    case 'ancient':
      return (
        <div className="absolute inset-0 opacity-30">
          {/* Ancient tile pattern */}
          <svg className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="tiles" patternUnits="userSpaceOnUse" width="80" height="80">
                <rect x="0" y="0" width="75" height="75" fill="none" stroke="rgba(200,150,100,0.3)" strokeWidth="2" />
                <rect x="10" y="10" width="55" height="55" fill="none" stroke="rgba(200,150,100,0.2)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tiles)" />
          </svg>
        </div>
      );
    case 'dark_tile':
      return (
        <div className="absolute inset-0 opacity-20">
          {/* Dark geometric tiles */}
          <svg className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="darktiles" patternUnits="userSpaceOnUse" width="50" height="50">
                <rect x="0" y="0" width="48" height="48" fill="none" stroke="rgba(100,100,120,0.4)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#darktiles)" />
          </svg>
        </div>
      );
    case 'obsidian':
      return (
        <div className="absolute inset-0 opacity-35">
          {/* Obsidian glass-like reflections */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-fuchsia-500/10" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-20 h-1 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"
              style={{
                left: `${i * 20}%`,
                top: `${30 + i * 12}%`,
                transform: `rotate(${-10 + i * 5}deg)`
              }}
            />
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function BattleView({
  game,
  combatState,
  onTargetSelect,
  onAbilityUse,
  onFlee,
  getAbilitiesForJob,
  getEffectiveStats,
  monsterAnimations,
  logs
}: BattleViewProps) {
  const [menuMode, setMenuMode] = useState<'main' | 'fight' | 'tactics'>('main');
  
  const currentChar = game.party[combatState.currentCharIndex];
  const aliveParty = game.party.filter(c => c.hp > 0);
  
  // Get theme for current floor (1-indexed, clamped to available themes)
  const theme = FLOOR_THEMES[Math.min(Math.max(0, game.level - 1), FLOOR_THEMES.length - 1)];
  
  // Randomly select a background image for this battle (stable for duration of component)
  const selectedBackground = useMemo(() => {
    if (theme.backgroundImages && theme.backgroundImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * theme.backgroundImages.length);
      return theme.backgroundImages[randomIndex];
    }
    return null;
  }, [theme.backgroundImages]);

  return (
    <div className="relative w-full h-full overflow-hidden" data-testid="battle-view">
      {/* Background - either custom image or procedural theme */}
      {selectedBackground ? (
        <>
          {/* Custom background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${selectedBackground})` }}
          />
          {/* Subtle ambient overlay for consistency */}
          <div className="absolute inset-0" style={{ background: theme.ambientColor }} />
        </>
      ) : (
        <>
          {/* Sky/Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-b ${theme.bg}`} />
          
          {/* Ambient color overlay */}
          <div className="absolute inset-0" style={{ background: theme.ambientColor }} />
          
          {/* Themed wall/ceiling silhouette */}
          <div className="absolute bottom-[40%] left-0 right-0 h-40">
            <ThemeSilhouette type={theme.silhouette} />
          </div>
          
          {/* Fog/mist layer */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{ 
              background: `linear-gradient(180deg, transparent 0%, ${theme.fogColor} 50%, transparent 100%)`
            }}
          />
          
          {/* Ground area with theme-specific texture */}
          <div className={`absolute bottom-0 left-0 right-0 h-[45%] ${theme.ground}`}>
            {/* Theme-specific ground texture */}
            <GroundTexture type={theme.groundTexture} />
            
            {/* Depth perspective lines */}
            <div className="absolute inset-0 opacity-15">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute left-0 right-0 h-px bg-black/40"
                  style={{ 
                    top: `${(i + 1) * 16}%`,
                    transform: `perspective(200px) rotateX(${i * 2}deg)`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Atmospheric effects layer */}
          <AtmosphereEffects type={theme.atmosphere} ambientColor={theme.ambientColor} />
        </>
      )}
      
      {/* Floor name indicator (top-left) */}
      <div className="absolute top-3 left-3 z-30 bg-black/50 px-3 py-1 rounded-lg border border-white/10" data-testid="panel-floor-theme">
        <span className="text-white/60 text-xs" data-testid="text-floor-theme">{theme.name}</span>
      </div>
      
      {/* Battle Speed indicator (top) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/60 px-4 py-1.5 rounded-lg border border-white/20" data-testid="panel-battle-speed">
        <span className="text-white/80 text-sm font-medium">Battle</span>
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 text-sm font-bold" data-testid="text-battle-speed">Normal</span>
      </div>
      
      {/* Monster(s) positioned in lower-middle of the screen */}
      <div className="absolute left-[5%] right-[30%] bottom-[25%] flex items-end justify-center">
        <div className="flex items-end gap-8">
          {combatState.monsters.slice(0, 3).map((monster, idx) => {
            const monsterSize = combatState.monsters.length === 1 
              ? 'w-64 h-64 md:w-80 md:h-80' 
              : combatState.monsters.length === 2 
                ? 'w-48 h-48 md:w-64 md:h-64' 
                : 'w-40 h-40 md:w-52 md:h-52';
            
            return (
              <div 
                key={monster.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  monster.hp <= 0 ? 'opacity-40 grayscale' : ''
                } ${idx === combatState.targetIndex && monster.hp > 0 ? 'scale-110 z-10' : ''}`}
                onClick={() => monster.hp > 0 && onTargetSelect(idx)}
                data-testid={`monster-target-${idx}`}
              >
                {/* Target indicator */}
                {idx === combatState.targetIndex && monster.hp > 0 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                    <ChevronRight className="w-8 h-8 rotate-90" />
                  </div>
                )}
                
                {monster.image ? (
                  <TransparentMonster
                    src={monster.image}
                    alt={monster.name}
                    className={monsterSize}
                    animationState={monsterAnimations[idx] as 'idle' | 'attacking' | 'hit' || 'idle'}
                    isFlying={isFlying(monster.name)}
                  />
                ) : (
                  <div className={`${monsterSize} bg-red-500/50 rounded-lg flex items-center justify-center`}>
                    <Skull className="w-16 h-16 text-red-400" />
                  </div>
                )}
                
                {/* Monster shadow */}
                <div 
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/40 rounded-[50%] blur-sm"
                />
                
                {/* Monster name & HP (shown below monster) */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                  <div className="text-white text-xs font-bold drop-shadow-lg">{monster.name}</div>
                  <div className="w-24 h-2 bg-black/60 rounded-full mt-1 overflow-hidden border border-white/20">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                      style={{ width: `${Math.max(0, (monster.hp / monster.maxHp) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Party HP/MP display (right side panel) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 space-y-2">
        {aliveParty.map((char, idx) => {
          const stats = getEffectiveStats(char);
          const isCurrentTurn = game.party.indexOf(char) === combatState.currentCharIndex;
          
          return (
            <div 
              key={char.name}
              className={`bg-black/70 backdrop-blur-sm rounded-lg p-2 border-2 transition-all min-w-[140px] ${
                isCurrentTurn ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' : 'border-white/20'
              }`}
              data-testid={`party-stats-${idx}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-sm">{char.name}</span>
                {isCurrentTurn && (
                  <ChevronRight className="w-4 h-4 text-yellow-400 animate-pulse" />
                )}
              </div>
              
              {/* HP Bar */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-400 text-xs font-bold w-6">HP</span>
                <div className="flex-1 h-3 bg-black/60 rounded overflow-hidden border border-green-600/50">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
                    style={{ width: `${(char.hp / stats.maxHp) * 100}%` }}
                  />
                </div>
                <span className="text-green-300 text-xs font-mono w-12 text-right">{char.hp}</span>
              </div>
              
              {/* MP Bar */}
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-xs font-bold w-6">MP</span>
                <div className="flex-1 h-3 bg-black/60 rounded overflow-hidden border border-blue-600/50">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                    style={{ width: `${(char.mp / stats.maxMp) * 100}%` }}
                  />
                </div>
                <span className="text-blue-300 text-xs font-mono w-12 text-right">{char.mp}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Command Menu (bottom-left) */}
      <div className="absolute left-3 bottom-3 z-30">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-white/30 overflow-hidden min-w-[160px]">
          {menuMode === 'main' && (
            <div className="p-1">
              <button
                onClick={() => setMenuMode('fight')}
                className="w-full text-left px-4 py-2 text-white hover:bg-white/20 transition-colors flex items-center gap-3 rounded"
                data-testid="button-fight-menu"
              >
                <Swords className="w-5 h-5 text-red-400" />
                <span className="font-bold">Fight</span>
              </button>
              <button
                onClick={() => setMenuMode('tactics')}
                className="w-full text-left px-4 py-2 text-white hover:bg-white/20 transition-colors flex items-center gap-3 rounded"
                data-testid="button-tactics-menu"
              >
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="font-bold">Tactics</span>
              </button>
              <button
                onClick={onFlee}
                className="w-full text-left px-4 py-2 text-white hover:bg-white/20 transition-colors flex items-center gap-3 rounded"
                data-testid="button-flee"
              >
                <DoorOpen className="w-5 h-5 text-yellow-400" />
                <span className="font-bold">Flee</span>
              </button>
            </div>
          )}
          
          {menuMode === 'fight' && currentChar && (
            <div className="p-1">
              <div className="px-3 py-1 text-xs text-white/60 border-b border-white/20 mb-1">
                {currentChar.name}'s Actions
              </div>
              {getAbilitiesForJob(currentChar.job).map((ability) => {
                const canUse = ability.mpCost <= currentChar.mp;
                return (
                  <button
                    key={ability.id}
                    onClick={() => {
                      if (canUse) {
                        onAbilityUse(ability, combatState.currentCharIndex);
                        setMenuMode('main');
                      }
                    }}
                    disabled={!canUse}
                    className={`w-full text-left px-4 py-2 transition-colors flex items-center justify-between rounded ${
                      canUse ? 'text-white hover:bg-white/20' : 'text-white/40 cursor-not-allowed'
                    }`}
                    data-testid={`button-ability-${ability.id}`}
                  >
                    <span className="font-medium">{ability.name}</span>
                    {ability.mpCost > 0 && (
                      <span className="text-blue-400 text-sm">{ability.mpCost} MP</span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => setMenuMode('main')}
                className="w-full text-left px-4 py-2 text-white/60 hover:bg-white/20 transition-colors rounded mt-1 border-t border-white/20"
                data-testid="button-back"
              >
                ← Back
              </button>
            </div>
          )}
          
          {menuMode === 'tactics' && (
            <div className="p-1">
              <div className="px-3 py-1 text-xs text-white/60 border-b border-white/20 mb-1">
                Tactics
              </div>
              <button
                onClick={() => setMenuMode('main')}
                className="w-full text-left px-4 py-2 text-white hover:bg-white/20 transition-colors rounded"
                data-testid="button-defend"
              >
                Defend
              </button>
              <button
                onClick={() => setMenuMode('main')}
                className="w-full text-left px-4 py-2 text-white/60 hover:bg-white/20 transition-colors rounded mt-1 border-t border-white/20"
                data-testid="button-back-tactics"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Combat Log (bottom center) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 max-w-md w-full px-4">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg border border-white/20 p-3">
          <div className="text-white text-sm font-medium text-center" data-testid="text-combat-log">
            {logs[0] || "Battle Start!"}
          </div>
        </div>
      </div>
      
      {/* Control hints (bottom) */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-4 text-white/60 text-xs">
        <div className="flex items-center gap-1">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">ESC</span>
          <span>Flee</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Tab</span>
          <span>Target</span>
        </div>
      </div>
    </div>
  );
}
