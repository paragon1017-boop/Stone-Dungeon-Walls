import { useEffect, useRef, useState, useCallback } from 'react';
import { GameData } from '@/lib/game-engine';
import { createWebGLContext } from '@/lib/webgl/renderer';
import { DungeonRenderer } from '@/lib/webgl/dungeon-renderer';
import { getMonsterTextureUrl } from '@/lib/webgl/models';

interface MonsterRenderData {
  id: string;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  textureUrl: string;
  animationState: 'idle' | 'attack' | 'hit' | 'death' | 'entrance';
  hitFlash: number;
}

interface WebGLDungeonViewProps {
  gameData: GameData;
  className?: string;
  renderWidth?: number;
  renderHeight?: number;
  visualX?: number;
  visualY?: number;
  isMoving?: boolean;
  monsters?: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    animationState?: 'idle' | 'attack' | 'hit' | 'death' | 'entrance';
  }>;
  onError?: (error: string) => void;
}

export function WebGLDungeonView({
  gameData,
  className = '',
  renderWidth = 800,
  renderHeight = 600,
  visualX,
  visualY,
  monsters = [],
  onError
}: WebGLDungeonViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<DungeonRenderer | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = renderWidth;
    canvas.height = renderHeight;

    // Create WebGL context
    const context = createWebGLContext(canvas);
    if (!context) {
      const errorMsg = 'WebGL2 is not supported by your browser. Please use a modern browser like Chrome, Firefox, or Edge.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Create renderer
    try {
      const renderer = new DungeonRenderer(context);
      rendererRef.current = renderer;
      
      // Load level textures
      renderer.loadLevel(gameData.level).then(() => {
        setIsReady(true);
      });
      
      // Initial camera setup
      renderer.setCamera(gameData.x, gameData.y, gameData.dir);
    } catch (err) {
      const errorMsg = 'Failed to initialize WebGL renderer: ' + (err instanceof Error ? err.message : String(err));
      setError(errorMsg);
      onError?.(errorMsg);
    }

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      rendererRef.current?.dispose();
    };
  }, [renderWidth, renderHeight, onError]);

  // Update camera when game data changes
  useEffect(() => {
    if (!rendererRef.current || !isReady) return;
    rendererRef.current.setCamera(gameData.x, gameData.y, gameData.dir);
  }, [gameData.x, gameData.y, gameData.dir, isReady]);

  // Load level when it changes
  useEffect(() => {
    if (!rendererRef.current || !isReady) return;
    rendererRef.current.loadLevel(gameData.level);
  }, [gameData.level, isReady]);

  // Update monsters
  useEffect(() => {
    if (!rendererRef.current || !isReady) return;
    
    const renderMonsters: MonsterRenderData[] = monsters.map(m => ({
      id: m.id,
      name: m.name,
      x: m.x,
      y: m.y,
      hp: m.hp,
      maxHp: m.maxHp,
      textureUrl: getMonsterTextureUrl(m.name),
      animationState: m.animationState || 'idle',
      hitFlash: m.animationState === 'hit' ? 0.5 : 0
    }));
    
    rendererRef.current.setMonsters(renderMonsters);
  }, [monsters, isReady]);

  // Render loop
  useEffect(() => {
    if (!rendererRef.current || !isReady) return;

    const render = () => {
      rendererRef.current?.render(gameData.map, visualX, visualY);
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameData.map, visualX, visualY, isReady]);

  // Handle resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !rendererRef.current) return;
    rendererRef.current.resize(renderWidth, renderHeight);
  }, [renderWidth, renderHeight]);

  useEffect(() => {
    handleResize();
  }, [handleResize]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-black text-red-500 p-8 ${className}`}
        style={{ width: renderWidth, height: renderHeight }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-lg font-bold mb-2">WebGL Error</div>
          <div className="text-sm opacity-80 max-w-md">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={renderWidth}
        height={renderHeight}
        className="block"
        style={{
          width: renderWidth,
          height: renderHeight,
          imageRendering: 'pixelated'
        }}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-yellow-500 animate-pulse">
            Loading WebGL...
          </div>
        </div>
      )}
    </div>
  );
}

export default WebGLDungeonView;
