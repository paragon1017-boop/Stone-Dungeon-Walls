import { useEffect, useRef, useCallback } from "react";
import { GameData, NORTH, EAST, SOUTH, WEST } from "@/lib/game-engine";

interface DungeonViewProps {
  gameData: GameData;
  className?: string;
  renderWidth?: number;
  renderHeight?: number;
  visualX?: number;  // Optional interpolated X position for smooth movement
  visualY?: number;  // Optional interpolated Y position for smooth movement
  onCanvasRef?: (canvas: HTMLCanvasElement | null) => void;  // Callback to get canvas reference for post-processing
}

// Get texture paths for a specific dungeon level (1-10, each with unique textures)
function getTexturesForLevel(level: number): { wall: string; floor: string; ceiling: string } {
  const lvl = Math.max(1, Math.min(10, level));
  
  // Level 1 uses new stone dungeon textures matching battle screen aesthetic
  if (lvl === 1) {
    return {
      wall: '/assets/textures/wall_stone_dungeon.png',
      floor: '/assets/textures/floor_stone_dungeon.png',
      ceiling: '/assets/textures/ceiling_stone_dungeon.png'
    };
  }
  
  // Levels 2-10 use the existing numbered texture assets
  return {
    wall: `/assets/textures/wall_${lvl}.png`,
    floor: `/assets/textures/floor_${lvl}.png`,
    ceiling: '/assets/textures/ceiling_stone_dungeon.png' // Use same ceiling for now
  };
}

export function DungeonView({ gameData, className, renderWidth = 800, renderHeight = 600, visualX, visualY, onCanvasRef }: DungeonViewProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const texturesRef = useRef<{ wall: HTMLImageElement | null; floor: HTMLImageElement | null; ceiling: HTMLImageElement | null; door: HTMLImageElement | null }>({ wall: null, floor: null, ceiling: null, door: null });
  
  // Callback ref to notify parent when canvas is mounted, and store locally
  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    internalCanvasRef.current = canvas;
    if (onCanvasRef) {
      onCanvasRef(canvas);
    }
  }, [onCanvasRef]);
  
  // Alias for internal usage
  const canvasRef = internalCanvasRef;
  const currentLevelRef = useRef<number | null>(null);
  
  // Dirty tracking to skip redundant redraws
  const lastRenderState = useRef<{ x: number; y: number; dir: number; level: number; width: number; height: number } | null>(null);

  // Load textures based on current dungeon level (unique textures for each level 1-10)
  useEffect(() => {
    const level = Math.max(1, Math.min(10, gameData.level));
    
    // Only reload textures if level changed
    if (currentLevelRef.current !== level) {
      currentLevelRef.current = level;
      const texturePaths = getTexturesForLevel(level);
      
      const wallImg = new Image();
      wallImg.src = texturePaths.wall;
      const floorImg = new Image();
      floorImg.src = texturePaths.floor;
      const ceilingImg = new Image();
      ceilingImg.src = texturePaths.ceiling;
      const doorImg = new Image();
      doorImg.src = "/assets/textures/door_metal.png";

      wallImg.onload = () => { texturesRef.current.wall = wallImg; draw(); };
      floorImg.onload = () => { texturesRef.current.floor = floorImg; draw(); };
      ceilingImg.onload = () => { texturesRef.current.ceiling = ceilingImg; draw(); };
      doorImg.onload = () => { texturesRef.current.door = doorImg; draw(); };
    }
  }, [gameData.level]);

  // Redraw when game data, visual position, or resolution changes
  useEffect(() => {
    draw();
  }, [gameData, renderWidth, renderHeight, visualX, visualY]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Use interpolated visual position if provided, otherwise use logical position
    const currentX = visualX !== undefined ? visualX : gameData.x;
    const currentY = visualY !== undefined ? visualY : gameData.y;
    
    // Dirty check - skip redraw if nothing changed (with small tolerance for floating point)
    const last = lastRenderState.current;
    if (last && 
        Math.abs(last.x - currentX) < 0.001 && 
        Math.abs(last.y - currentY) < 0.001 && 
        last.dir === gameData.dir && 
        last.level === gameData.level &&
        last.width === renderWidth &&
        last.height === renderHeight) {
      return; // Skip redraw - nothing changed
    }
    
    // Update last render state
    lastRenderState.current = { x: currentX, y: currentY, dir: gameData.dir, level: gameData.level, width: renderWidth, height: renderHeight };
    
    // Get context with alpha:false for better performance
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Clear screen
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple Raycaster Settings
    const map = gameData.map;
    const posX = currentX + 0.5;
    const posY = currentY + 0.5;
    
    // Direction vectors based on cardinal direction (0=N, 1=E, 2=S, 3=W)
    let dirX = 0, dirY = 0, planeX = 0, planeY = 0;
    
    switch(gameData.dir) {
      case NORTH: dirY = -1; planeX = 0.66; break;
      case SOUTH: dirY = 1; planeX = -0.66; break;
      case EAST: dirX = 1; planeY = 0.66; break;
      case WEST: dirX = -1; planeY = -0.66; break;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Draw Ceiling with perspective texture using dedicated ceiling texture
    const ceilingTex = texturesRef.current.ceiling || texturesRef.current.floor; // Use ceiling texture, fallback to floor
    if (ceilingTex) {
      const texW = ceilingTex.width;
      const texH = ceilingTex.height;
      const texScale = 128;
      
      // Ceiling casting - mirror of floor casting
      for (let y = 0; y < Math.floor(h / 2); y++) {
        const p = Math.floor(h / 2) - y;
        const rowDistance = (h * 0.5) / p;
        
        const ceilStepX = rowDistance * (planeX * 2) / w;
        const ceilStepY = rowDistance * (planeY * 2) / w;
        
        let ceilX = posX + rowDistance * (dirX - planeX);
        let ceilY = posY + rowDistance * (dirY - planeY);
        
        for (let x = 0; x < w; x += 2) {
          const tx = Math.floor(Math.abs(ceilX * texScale) % texW);
          const ty = Math.floor(Math.abs(ceilY * texScale) % texH);
          
          ctx.drawImage(
            ceilingTex,
            tx, ty, 2, 2,
            x, y, 2, 1
          );
          
          ceilX += ceilStepX * 2;
          ceilY += ceilStepY * 2;
        }
      }
      
      // Apply jagged stone texture with color variations to ceiling
      const stoneColors = [
        { r: 45, g: 42, b: 38 },   // Dark brown-gray
        { r: 55, g: 50, b: 45 },   // Medium gray-brown
        { r: 38, g: 45, b: 40 },   // Dark green-gray
        { r: 50, g: 48, b: 52 },   // Purple-gray
        { r: 42, g: 40, b: 35 },   // Warm dark gray
      ];
      
      // Seed for consistent random pattern
      let seed = 12345;
      const seededRandom = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
      };
      
      for (let y = 0; y < Math.floor(h / 2); y += 2) {
        const p = Math.floor(h / 2) - y;
        const rowDistance = (h * 0.5) / p;
        const darkness = Math.min(0.75, 0.4 + rowDistance / 15);
        
        // Add jagged stone blocks with color variation
        for (let x = 0; x < w; x += 6 + Math.floor(seededRandom() * 8)) {
          const blockWidth = 4 + Math.floor(seededRandom() * 10);
          const colorIdx = Math.floor(seededRandom() * stoneColors.length);
          const color = stoneColors[colorIdx];
          
          // Vary brightness slightly for each block
          const brightVar = 0.85 + seededRandom() * 0.3;
          const r = Math.floor(color.r * brightVar);
          const g = Math.floor(color.g * brightVar);
          const b = Math.floor(color.b * brightVar);
          
          // Add jagged edge effect
          const jaggedOffset = Math.floor(seededRandom() * 2) - 1;
          
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + seededRandom() * 0.2})`;
          ctx.fillRect(x, y + jaggedOffset, blockWidth, 3);
        }
        
        // Dark mossy overlay
        ctx.fillStyle = `rgba(5, 12, 8, ${darkness})`;
        ctx.fillRect(0, y, w, 2);
      }
      
      // Draw wooden support beams across ceiling
      const beamCount = 5;
      const beamSizes = [1.2, 0.8, 1.0, 0.9, 1.1]; // Variation in beam thickness
      
      // Seeded random for consistent wood details
      let woodSeed = 54321;
      const woodRandom = () => {
        woodSeed = (woodSeed * 1103515245 + 12345) & 0x7fffffff;
        return woodSeed / 0x7fffffff;
      };
      
      for (let i = 1; i <= beamCount; i++) {
        const beamY = Math.floor((h / 2) * (i / (beamCount + 1)));
        const p = Math.floor(h / 2) - beamY;
        const rowDistance = (h * 0.5) / p;
        
        // Beam gets thicker as it gets closer (perspective) with size variation
        const sizeMultiplier = beamSizes[(i - 1) % beamSizes.length];
        const beamHeight = Math.max(8, Math.floor(22 / rowDistance * sizeMultiplier));
        const darkness = Math.min(0.6, rowDistance / 8);
        const beamTop = beamY - beamHeight/2;
        const beamBottom = beamY + beamHeight/2;
        
        // Base wood colors with slight variation per beam
        const baseR = 90 + Math.floor(woodRandom() * 20);
        const baseG = 66 + Math.floor(woodRandom() * 15);
        const baseB = 40 + Math.floor(woodRandom() * 10);
        
        // Top edge highlight
        ctx.fillStyle = `rgb(${baseR - 32}, ${baseG - 26}, ${baseB - 22})`;
        ctx.fillRect(0, beamTop, w, 2);
        
        // Main beam body with wood grain texture
        for (let bx = 0; bx < w; bx += 2) {
          // Vertical color variation (lighter in middle, darker at edges)
          for (let by = beamTop + 2; by < beamBottom - 2; by += 2) {
            const distFromCenter = Math.abs(by - beamY) / (beamHeight / 2);
            const edgeDarken = distFromCenter * 0.3;
            
            // Horizontal grain streaks
            const grainOffset = Math.sin(bx * 0.1 + i * 10) * 8;
            const grainBrightness = 0.85 + Math.sin((bx + grainOffset) * 0.05 + by * 0.2) * 0.15;
            
            const r = Math.floor((baseR - edgeDarken * 40) * grainBrightness);
            const g = Math.floor((baseG - edgeDarken * 30) * grainBrightness);
            const b = Math.floor((baseB - edgeDarken * 20) * grainBrightness);
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(bx, by, 2, 2);
          }
        }
        
        // Add detailed wood grain lines with slight waviness
        ctx.lineWidth = 1;
        const grainSpacing = Math.max(2, Math.floor(beamHeight / 5));
        for (let gy = beamTop + grainSpacing; gy < beamBottom - 2; gy += grainSpacing) {
          ctx.strokeStyle = `rgba(30, 20, 10, ${0.2 + woodRandom() * 0.2})`;
          ctx.beginPath();
          ctx.moveTo(0, gy);
          for (let gx = 0; gx < w; gx += 10) {
            const waveY = gy + Math.sin(gx * 0.03 + i) * 1.5;
            ctx.lineTo(gx, waveY);
          }
          ctx.stroke();
        }
        
        // Add wood knots (darker oval spots)
        const knotCount = 2 + Math.floor(woodRandom() * 3);
        for (let k = 0; k < knotCount; k++) {
          const knotX = Math.floor(woodRandom() * w);
          const knotY = beamTop + 3 + Math.floor(woodRandom() * (beamHeight - 6));
          const knotW = 3 + Math.floor(woodRandom() * 4);
          const knotH = 2 + Math.floor(woodRandom() * 3);
          
          // Knot center (dark)
          ctx.fillStyle = `rgba(25, 18, 10, ${0.6 + woodRandom() * 0.3})`;
          ctx.beginPath();
          ctx.ellipse(knotX, knotY, knotW, knotH, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Knot ring (slightly lighter)
          ctx.strokeStyle = `rgba(45, 32, 20, 0.5)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(knotX, knotY, knotW + 1, knotH + 1, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Add lighter streaks (weathered wood highlights)
        for (let s = 0; s < 3; s++) {
          const streakY = beamTop + 3 + Math.floor(woodRandom() * (beamHeight - 6));
          const streakStart = Math.floor(woodRandom() * w * 0.5);
          const streakLen = 20 + Math.floor(woodRandom() * 60);
          ctx.fillStyle = `rgba(140, 115, 80, ${0.15 + woodRandom() * 0.15})`;
          ctx.fillRect(streakStart, streakY, streakLen, 1);
        }
        
        // Add darker cracks/age lines
        for (let c = 0; c < 2; c++) {
          const crackY = beamTop + 2 + Math.floor(woodRandom() * (beamHeight - 4));
          const crackStart = Math.floor(woodRandom() * w * 0.7);
          const crackLen = 10 + Math.floor(woodRandom() * 30);
          ctx.fillStyle = `rgba(20, 12, 5, ${0.3 + woodRandom() * 0.2})`;
          ctx.fillRect(crackStart, crackY, crackLen, 1);
        }
        
        // Bottom edge (darker)
        ctx.fillStyle = `rgb(${baseR - 48}, ${baseG - 40}, ${baseB - 30})`;
        ctx.fillRect(0, beamBottom - 2, w, 2);
        
        // Darken distant beams
        ctx.fillStyle = `rgba(5, 8, 5, ${darkness})`;
        ctx.fillRect(0, beamTop, w, beamHeight);
        
        // Hard bottom shadow for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, beamBottom, w, 3);
      }
    } else {
      // Fallback gradient ceiling
      const ceilingGradient = ctx.createLinearGradient(0, 0, 0, h / 2);
      ceilingGradient.addColorStop(0, "#0a0806");
      ceilingGradient.addColorStop(1, "#1a1510");
      ctx.fillStyle = ceilingGradient;
      ctx.fillRect(0, 0, w, h / 2);
    }
    
    // Stone boulder fascia at ceiling/wall transition
    const fasciaY = Math.floor(h / 2) - 8;
    const fasciaHeight = 12;
    
    // Seeded random for consistent boulder pattern
    let fasciaSeed = 98765;
    const fasciaRandom = () => {
      fasciaSeed = (fasciaSeed * 1103515245 + 12345) & 0x7fffffff;
      return fasciaSeed / 0x7fffffff;
    };
    
    // Draw stone boulders across the fascia
    let boulderX = 0;
    while (boulderX < w) {
      const boulderW = 12 + Math.floor(fasciaRandom() * 18);
      const boulderH = 8 + Math.floor(fasciaRandom() * 5);
      const boulderYOffset = Math.floor(fasciaRandom() * 3) - 1;
      
      // Boulder base color with variation
      const baseGray = 65 + Math.floor(fasciaRandom() * 25);
      const rVar = Math.floor(fasciaRandom() * 15) - 7;
      const gVar = Math.floor(fasciaRandom() * 10) - 5;
      const bVar = Math.floor(fasciaRandom() * 10) - 5;
      
      const r = baseGray + rVar;
      const g = baseGray + gVar - 3;
      const b = baseGray + bVar - 5;
      
      // Main boulder body
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.moveTo(boulderX + 2, fasciaY + boulderYOffset);
      ctx.lineTo(boulderX + boulderW - 2, fasciaY + boulderYOffset);
      ctx.lineTo(boulderX + boulderW, fasciaY + boulderYOffset + 3);
      ctx.lineTo(boulderX + boulderW - 1, fasciaY + boulderYOffset + boulderH - 2);
      ctx.lineTo(boulderX + boulderW - 3, fasciaY + boulderYOffset + boulderH);
      ctx.lineTo(boulderX + 3, fasciaY + boulderYOffset + boulderH);
      ctx.lineTo(boulderX, fasciaY + boulderYOffset + boulderH - 3);
      ctx.lineTo(boulderX + 1, fasciaY + boulderYOffset + 2);
      ctx.closePath();
      ctx.fill();
      
      // Boulder top highlight
      ctx.fillStyle = `rgb(${r + 20}, ${g + 18}, ${b + 15})`;
      ctx.beginPath();
      ctx.moveTo(boulderX + 3, fasciaY + boulderYOffset + 1);
      ctx.lineTo(boulderX + boulderW - 3, fasciaY + boulderYOffset + 1);
      ctx.lineTo(boulderX + boulderW - 4, fasciaY + boulderYOffset + 3);
      ctx.lineTo(boulderX + 4, fasciaY + boulderYOffset + 3);
      ctx.closePath();
      ctx.fill();
      
      // Boulder bottom shadow
      ctx.fillStyle = `rgba(0, 0, 0, 0.4)`;
      ctx.beginPath();
      ctx.moveTo(boulderX + 4, fasciaY + boulderYOffset + boulderH - 1);
      ctx.lineTo(boulderX + boulderW - 4, fasciaY + boulderYOffset + boulderH - 1);
      ctx.lineTo(boulderX + boulderW - 2, fasciaY + boulderYOffset + boulderH - 3);
      ctx.lineTo(boulderX + 2, fasciaY + boulderYOffset + boulderH - 3);
      ctx.closePath();
      ctx.fill();
      
      // Cracks and texture on boulder
      if (fasciaRandom() > 0.4) {
        ctx.strokeStyle = `rgba(30, 28, 25, 0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const crackStartX = boulderX + 3 + Math.floor(fasciaRandom() * (boulderW - 6));
        ctx.moveTo(crackStartX, fasciaY + boulderYOffset + 2);
        ctx.lineTo(crackStartX + (fasciaRandom() - 0.5) * 4, fasciaY + boulderYOffset + boulderH - 2);
        ctx.stroke();
      }
      
      // Mortar/gap between boulders
      ctx.fillStyle = 'rgba(20, 18, 15, 0.7)';
      ctx.fillRect(boulderX + boulderW - 1, fasciaY, 2, fasciaHeight);
      
      boulderX += boulderW + 1;
    }
    
    // Shadow below fascia (transition to wall)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, fasciaY + fasciaHeight - 2, w, 3);
    
    // Dark line at very top of fascia (ceiling shadow)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, fasciaY - 1, w, 2);

    // Draw Floor with perspective floor casting (cobblestone walkway effect)
    const floorTex = texturesRef.current.floor;
    if (floorTex) {
      const texW = floorTex.width;
      const texH = floorTex.height;
      const texScale = 128; // Larger = bigger visible cobblestones
      
      // Floor casting - draw every scanline for maximum sharpness
      for (let y = Math.floor(h / 2) + 1; y < h; y++) {
        const p = y - h / 2;
        const rowDistance = (h * 0.5) / p;
        
        const floorStepX = rowDistance * (planeX * 2) / w;
        const floorStepY = rowDistance * (planeY * 2) / w;
        
        let floorX = posX + rowDistance * (dirX - planeX);
        let floorY = posY + rowDistance * (dirY - planeY);
        
        // Draw each pixel for sharp cobblestone texture
        for (let x = 0; x < w; x += 2) {
          const tx = Math.floor(Math.abs(floorX * texScale) % texW);
          const ty = Math.floor(Math.abs(floorY * texScale) % texH);
          
          ctx.drawImage(
            floorTex,
            tx, ty, 2, 2,
            x, y, 2, 1
          );
          
          floorX += floorStepX * 2;
          floorY += floorStepY * 2;
        }
      }
      
      // Apply mossy green-tinted fog overlay for atmosphere
      for (let y = Math.floor(h / 2) + 1; y < h; y += 2) {
        const p = y - h / 2;
        const rowDistance = (h * 0.5) / p;
        const fog = Math.min(0.6, rowDistance / 12);
        // Green-tinted fog for mossy dungeon atmosphere
        ctx.fillStyle = `rgba(8, 15, 10, ${fog})`;
        ctx.fillRect(0, y, w, 2);
      }
    } else {
      // Fallback gradient floor
      const floorGradient = ctx.createLinearGradient(0, h / 2, 0, h);
      floorGradient.addColorStop(0, "#2a2520");
      floorGradient.addColorStop(0.5, "#3d3528");
      floorGradient.addColorStop(1, "#1a1510");
      ctx.fillStyle = floorGradient;
      ctx.fillRect(0, h / 2, w, h / 2);
    }

    // Raycasting Loop
    for (let x = 0; x < w; x+=2) { // Optimization: Step by 2 pixels
      const cameraX = 2 * x / w - 1;
      const rayDirX = dirX + planeX * cameraX;
      const rayDirY = dirY + planeY * cameraX;

      let mapX = Math.floor(posX);
      let mapY = Math.floor(posY);

      let sideDistX, sideDistY;
      
      const deltaDistX = Math.abs(1 / rayDirX);
      const deltaDistY = Math.abs(1 / rayDirY);
      
      let perpWallDist;
      let stepX, stepY;
      let hit = 0;
      let side;

      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (posX - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - posX) * deltaDistX;
      }

      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (posY - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - posY) * deltaDistY;
      }

      // DDA
      while (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }
        // Bounds check
        if (mapY < 0 || mapX < 0 || mapY >= map.length || mapX >= map[0].length) {
          hit = 1; perpWallDist = 100; // Infinity
        } else if (map[mapY][mapX] > 0) {
          hit = map[mapY][mapX]; // 1 = wall, 2 = door
        }
      }
      
      const isDoor = hit === 2;

      if (side === 0) perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
      else           perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;

      // Draw Wall Strip
      const lineHeight = Math.floor(h / perpWallDist);
      const drawStart = Math.max(0, -lineHeight / 2 + h / 2);
      const drawEnd = Math.min(h - 1, lineHeight / 2 + h / 2);

      // Texture mapping
      if (texturesRef.current.wall) {
         let wallX; 
         if (side === 0) wallX = posY + perpWallDist * rayDirY;
         else            wallX = posX + perpWallDist * rayDirX;
         wallX -= Math.floor(wallX);

         const texX = Math.floor(wallX * texturesRef.current.wall.width);
         
         // Darken farther walls
         ctx.globalAlpha = 1.0;
         if (side === 1) ctx.globalAlpha = 0.7; // Shading for y-axis walls
         
         // Distance fog
         const fog = Math.min(1, 4.0 / perpWallDist); 
         
         if (isDoor) {
           // Draw metal door using texture with stone frame
           const doorHeight = drawEnd - drawStart;
           const doorTex = texturesRef.current.door;
           const wallTex = texturesRef.current.wall;
           
           // Door frame parameters (percentage of door width)
           const frameWidth = 0.12; // Stone frame on each side
           const topFrameHeight = 0.08; // Stone lintel at top
           const isInFrame = wallX < frameWidth || wallX > (1 - frameWidth);
           const isInTopFrame = true; // We'll handle top frame with height
           
           if (isInFrame && wallTex) {
             // Draw stone frame on edges using wall texture
             const frameTexX = Math.floor(wallX * wallTex.width);
             
             if (side === 1) {
               ctx.globalAlpha = 0.8;
             }
             
             ctx.drawImage(
               wallTex,
               frameTexX, 0, 1, wallTex.height,
               x, drawStart, 2, doorHeight
             );
             
             // Add dark edge to create depth/recess effect
             ctx.globalAlpha = 0.4;
             ctx.fillStyle = "#000";
             if (wallX < frameWidth) {
               // Left frame - dark on right edge
               if (wallX > frameWidth - 0.03) {
                 ctx.fillRect(x, drawStart, 2, doorHeight);
               }
             } else {
               // Right frame - dark on left edge
               if (wallX < (1 - frameWidth) + 0.03) {
                 ctx.fillRect(x, drawStart, 2, doorHeight);
               }
             }
             ctx.globalAlpha = 1.0;
           } else if (doorTex) {
             // Draw the door itself (recessed slightly)
             // Map wallX from frame area to full door texture
             const doorAreaStart = frameWidth;
             const doorAreaEnd = 1 - frameWidth;
             const doorTexWallX = (wallX - doorAreaStart) / (doorAreaEnd - doorAreaStart);
             const doorTexX = Math.floor(Math.max(0, Math.min(1, doorTexWallX)) * doorTex.width);
             
             // Top stone lintel
             const lintelHeight = Math.floor(doorHeight * topFrameHeight);
             
             if (wallTex) {
               // Draw lintel at top
               const lintelTexX = Math.floor(wallX * wallTex.width);
               ctx.drawImage(
                 wallTex,
                 lintelTexX, 0, 1, wallTex.height * 0.2,
                 x, drawStart, 2, lintelHeight
               );
               // Dark bottom edge of lintel
               ctx.globalAlpha = 0.5;
               ctx.fillStyle = "#000";
               ctx.fillRect(x, drawStart + lintelHeight - 2, 2, 3);
               ctx.globalAlpha = 1.0;
             }
             
             // Apply side shading (darker on one side for depth)
             if (side === 1) {
               ctx.globalAlpha = 0.85;
             }
             
             // Draw door below lintel
             ctx.drawImage(
               doorTex,
               doorTexX, 0, 1, doorTex.height,
               x, drawStart + lintelHeight, 2, doorHeight - lintelHeight
             );
             
             ctx.globalAlpha = 1.0;
           } else {
             // Fallback solid color if texture not loaded
             ctx.fillStyle = side === 1 ? '#3a4a50' : '#4a5a60';
             ctx.fillRect(x, drawStart, 2, doorHeight);
           }
           
           // Apply fog to door
           ctx.globalAlpha = 1 - fog;
           ctx.fillStyle = "#000";
           ctx.fillRect(x, drawStart, 2, doorHeight);
           ctx.globalAlpha = 1.0;
         } else {
           // Draw regular wall slice
           ctx.drawImage(
              texturesRef.current.wall, 
              texX, 0, 1, texturesRef.current.wall.height,
              x, drawStart, 2, drawEnd - drawStart // Width 2 because loop step is 2
           );
           
           // Apply fog (draw black rect with opacity over it)
           ctx.globalAlpha = 1 - fog;
           ctx.fillStyle = "#000";
           ctx.fillRect(x, drawStart, 2, drawEnd - drawStart);
           ctx.globalAlpha = 1.0;
         }
         
         // Draw stone baseboard at bottom of wall (matching floor texture) - skip for doors
         if (!isDoor) {
         const baseboardHeight = Math.max(3, Math.floor(lineHeight * 0.06));
         const baseboardTop = drawEnd - baseboardHeight;
         
         // Use floor texture for baseboard
         if (texturesRef.current.floor) {
           const floorTex = texturesRef.current.floor;
           // Sample from floor texture using wall position for continuity
           const texX = Math.floor((wallX * 64) % floorTex.width);
           
           ctx.globalAlpha = side === 1 ? 0.8 : 1.0; // Slightly darker on side walls
           ctx.drawImage(
             floorTex,
             texX, 0, 2, floorTex.height,
             x, baseboardTop, 2, baseboardHeight
           );
           ctx.globalAlpha = 1.0;
           
           // Darken slightly to differentiate from floor
           ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
           ctx.fillRect(x, baseboardTop, 2, baseboardHeight);
         }
         
         // Top edge highlight (stone cap)
         ctx.fillStyle = 'rgba(180, 170, 155, 0.4)';
         ctx.fillRect(x, baseboardTop, 2, 1);
         
         // Bottom shadow where it meets floor
         ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
         ctx.fillRect(x, drawEnd - 1, 2, 1);
         
         // Apply distance fog to baseboard
         ctx.globalAlpha = 1 - fog;
         ctx.fillStyle = "#000";
         ctx.fillRect(x, baseboardTop, 2, baseboardHeight);
         ctx.globalAlpha = 1.0;
         } // end if !isDoor for baseboard
      } else {
         // Fallback color
         const color = side === 1 ? '#555' : '#777';
         ctx.fillStyle = color;
         ctx.fillRect(x, drawStart, 2, drawEnd - drawStart);
      }
    }
    
    // Draw wall decorations (spider webs, vines, moss) as overlay
    // Uses player position as seed for consistent decorations per view
    let decorSeed = Math.floor(posX * 1000 + posY * 100 + gameData.dir * 10);
    const decorRandom = () => {
      decorSeed = (decorSeed * 1103515245 + 12345) & 0x7fffffff;
      return decorSeed / 0x7fffffff;
    };
    
    // Check if player is facing a door - skip decorations if so
    let facingDoor = false;
    {
      // Cast a ray straight ahead to check what's in front
      let checkX = Math.floor(posX);
      let checkY = Math.floor(posY);
      for (let step = 1; step <= 3; step++) {
        const nextX = Math.floor(posX + dirX * step);
        const nextY = Math.floor(posY + dirY * step);
        if (nextX >= 0 && nextX < map[0].length && nextY >= 0 && nextY < map.length) {
          if (map[nextY][nextX] === 2) {
            facingDoor = true;
            break;
          }
          if (map[nextY][nextX] === 1) {
            break; // Hit a wall, stop checking
          }
        }
      }
    }
    
    // Skip all decorations when facing a door
    if (!facingDoor) {
    
    // Spider webs in corners (where ceiling meets walls)
    // Top-left corner web
    if (decorRandom() > 0.3) {
      const webSize = 25 + decorRandom() * 20;
      const webAlpha = 0.35 + decorRandom() * 0.25;
      
      ctx.strokeStyle = `rgba(200, 200, 210, ${webAlpha})`;
      ctx.lineWidth = 1;
      
      // Corner anchor point
      const cornerX = 0;
      const cornerY = Math.floor(h / 2) - 5;
      
      // Radial strands from corner
      const strandCount = 5 + Math.floor(decorRandom() * 3);
      for (let s = 0; s < strandCount; s++) {
        const angle = (s / strandCount) * Math.PI * 0.5; // Quarter circle from corner
        ctx.beginPath();
        ctx.moveTo(cornerX, cornerY);
        ctx.lineTo(cornerX + Math.cos(angle) * webSize, cornerY - Math.sin(angle) * webSize);
        ctx.stroke();
      }
      
      // Spiral threads
      ctx.strokeStyle = `rgba(180, 180, 195, ${webAlpha * 0.6})`;
      for (let ring = 0.3; ring < 1; ring += 0.25) {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 0.55; a += 0.15) {
          const rx = cornerX + Math.cos(a) * webSize * ring;
          const ry = cornerY - Math.sin(a) * webSize * ring;
          if (a === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.stroke();
      }
    }
    
    // Top-right corner web
    if (decorRandom() > 0.3) {
      const webSize = 25 + decorRandom() * 20;
      const webAlpha = 0.35 + decorRandom() * 0.25;
      
      ctx.strokeStyle = `rgba(200, 200, 210, ${webAlpha})`;
      ctx.lineWidth = 1;
      
      const cornerX = w;
      const cornerY = Math.floor(h / 2) - 5;
      
      const strandCount = 5 + Math.floor(decorRandom() * 3);
      for (let s = 0; s < strandCount; s++) {
        const angle = Math.PI * 0.5 + (s / strandCount) * Math.PI * 0.5;
        ctx.beginPath();
        ctx.moveTo(cornerX, cornerY);
        ctx.lineTo(cornerX + Math.cos(angle) * webSize, cornerY - Math.sin(angle) * webSize);
        ctx.stroke();
      }
      
      ctx.strokeStyle = `rgba(180, 180, 195, ${webAlpha * 0.6})`;
      for (let ring = 0.3; ring < 1; ring += 0.25) {
        ctx.beginPath();
        for (let a = Math.PI * 0.5; a < Math.PI * 1.05; a += 0.15) {
          const rx = cornerX + Math.cos(a) * webSize * ring;
          const ry = cornerY - Math.sin(a) * webSize * ring;
          if (a === Math.PI * 0.5) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.stroke();
      }
    }
    
    // Wall cracks
    const crackCount = 3 + Math.floor(decorRandom() * 4);
    for (let i = 0; i < crackCount; i++) {
      const crackX = 20 + decorRandom() * (w - 40);
      const crackY = h / 2 + 10 + decorRandom() * 80;
      const crackLen = 15 + decorRandom() * 35;
      const crackAlpha = 0.4 + decorRandom() * 0.3;
      
      // Main crack line
      ctx.strokeStyle = `rgba(20, 18, 15, ${crackAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(crackX, crackY);
      
      let cx = crackX;
      let cy = crackY;
      const crackDir = decorRandom() < 0.5 ? -1 : 1;
      
      for (let c = 0; c < crackLen; c += 4) {
        cx += (decorRandom() - 0.5) * 6 + crackDir * 2;
        cy += 3 + decorRandom() * 3;
        ctx.lineTo(cx, cy);
        
        // Branch cracks
        if (decorRandom() > 0.6) {
          const branchLen = 5 + decorRandom() * 10;
          const branchDir = decorRandom() < 0.5 ? -1 : 1;
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + branchDir * branchLen, cy + branchLen * 0.5);
          ctx.moveTo(cx, cy);
        }
      }
      ctx.stroke();
      
      // Crack shadow (depth effect)
      ctx.strokeStyle = `rgba(0, 0, 0, ${crackAlpha * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(crackX + 1, crackY + 1);
      cx = crackX + 1;
      cy = crackY + 1;
      for (let c = 0; c < crackLen; c += 4) {
        cx += (decorRandom() - 0.5) * 6 + crackDir * 2;
        cy += 3 + decorRandom() * 3;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
    
    // Hanging vines from ceiling (sparse, small, slimy)
    const vineCount = 1 + Math.floor(decorRandom() * 2); // Sparse: 1-2 vines
    for (let i = 0; i < vineCount; i++) {
      if (decorRandom() > 0.6) continue; // Extra sparseness
      
      const vineX = 40 + decorRandom() * (w - 80);
      const vineStartY = h / 2 - 15 - decorRandom() * 20;
      const vineLength = 15 + decorRandom() * 25; // Smaller
      const vineAlpha = 0.6 + decorRandom() * 0.25;
      
      // Thin vine stem with natural curve
      ctx.strokeStyle = `rgba(35, 55, 30, ${vineAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(vineX, vineStartY);
      
      let vx = vineX;
      let vy = vineStartY;
      const swayDir = decorRandom() < 0.5 ? -1 : 1;
      const vinePoints: {x: number, y: number}[] = [{x: vx, y: vy}];
      
      for (let v = 0; v < vineLength; v += 3) {
        vx += swayDir * (0.5 + decorRandom() * 1.5);
        vy += 3;
        ctx.lineTo(vx, vy);
        vinePoints.push({x: vx, y: vy});
      }
      ctx.stroke();
      
      // Small tendrils branching off
      if (vinePoints.length > 3) {
        ctx.strokeStyle = `rgba(30, 50, 25, ${vineAlpha * 0.7})`;
        ctx.lineWidth = 1;
        for (let t = 0; t < 2; t++) {
          const pointIdx = 2 + Math.floor(decorRandom() * (vinePoints.length - 3));
          const pt = vinePoints[pointIdx];
          const tendrilDir = decorRandom() < 0.5 ? -1 : 1;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.quadraticCurveTo(
            pt.x + tendrilDir * 6, pt.y + 4,
            pt.x + tendrilDir * 8, pt.y + 8
          );
          ctx.stroke();
        }
      }
      
      // Slime drips on vine
      const slimeCount = 2 + Math.floor(decorRandom() * 3);
      for (let s = 0; s < slimeCount; s++) {
        const pointIdx = Math.floor(decorRandom() * vinePoints.length);
        const pt = vinePoints[pointIdx];
        const slimeLen = 3 + decorRandom() * 6;
        
        // Slime droplet
        ctx.fillStyle = `rgba(120, 180, 90, ${0.4 + decorRandom() * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y + slimeLen, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Slime strand
        ctx.strokeStyle = `rgba(100, 160, 80, 0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x, pt.y + slimeLen);
        ctx.stroke();
        
        // Slime highlight
        ctx.fillStyle = `rgba(180, 220, 150, 0.3)`;
        ctx.beginPath();
        ctx.arc(pt.x - 0.5, pt.y + slimeLen - 1, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Tiny leaves (sparse)
      if (decorRandom() > 0.5) {
        const leafIdx = 1 + Math.floor(decorRandom() * (vinePoints.length - 2));
        const pt = vinePoints[leafIdx];
        const leafDir = decorRandom() < 0.5 ? -1 : 1;
        
        ctx.fillStyle = `rgba(40, 60, 35, ${vineAlpha})`;
        ctx.beginPath();
        ctx.ellipse(pt.x + leafDir * 3, pt.y, 2.5, 1.5, leafDir * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Wall moss patches
    const mossCount = 4 + Math.floor(decorRandom() * 4);
    for (let i = 0; i < mossCount; i++) {
      const mossX = decorRandom() * w;
      const mossY = h / 2 + 20 + decorRandom() * 60;
      const mossW = 15 + decorRandom() * 25;
      const mossH = 8 + decorRandom() * 15;
      const mossAlpha = 0.2 + decorRandom() * 0.2;
      
      // Fuzzy moss texture
      for (let mx = 0; mx < mossW; mx += 3) {
        for (let my = 0; my < mossH; my += 3) {
          const distFromCenter = Math.sqrt(Math.pow((mx - mossW/2) / (mossW/2), 2) + Math.pow((my - mossH/2) / (mossH/2), 2));
          if (distFromCenter < 1 && decorRandom() > 0.3) {
            const g = 45 + Math.floor(decorRandom() * 30);
            ctx.fillStyle = `rgba(25, ${g}, 20, ${mossAlpha * (1 - distFromCenter * 0.5)})`;
            ctx.fillRect(mossX + mx, mossY + my, 3, 3);
          }
        }
      }
    }
    
    // Dripping water stains
    const stainCount = 2 + Math.floor(decorRandom() * 3);
    for (let i = 0; i < stainCount; i++) {
      const stainX = 20 + decorRandom() * (w - 40);
      const stainY = h / 2 - 10;
      const stainLen = 40 + decorRandom() * 60;
      
      ctx.strokeStyle = `rgba(60, 70, 65, 0.25)`;
      ctx.lineWidth = 3 + decorRandom() * 3;
      ctx.beginPath();
      ctx.moveTo(stainX, stainY);
      ctx.lineTo(stainX + (decorRandom() - 0.5) * 8, stainY + stainLen);
      ctx.stroke();
    }
    
    // Wall-mounted candles and lanterns (sparse, positioned high near ceiling)
    // Only 0-1 light source per view
    if (decorRandom() > 0.5) {
      const lightX = 60 + decorRandom() * (w - 120);
      const lightY = h / 2 + 5 + decorRandom() * 15; // Higher on wall, near ceiling line
      const isLantern = decorRandom() > 0.6;
      
      if (isLantern) {
        // Wall lantern with iron hook
        const lanternW = 8;
        const lanternH = 12;
        const hookY = lightY - lanternH - 8;
        
        // Iron wall hook/bracket
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(lightX - 1, hookY, 2, 3); // Wall mount
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(lightX - 1, hookY + 2, 8, 2); // Horizontal arm
        ctx.fillRect(lightX + 5, hookY + 2, 2, 6); // Vertical drop
        
        // Hook curl
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(lightX + 4, hookY + 10, 3, 0, Math.PI);
        ctx.stroke();
        
        // Lantern chain
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(lightX + 3, hookY + 10, 2, 4);
        
        // Lantern frame (dark metal)
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(lightX - lanternW/2 + 3, lightY - lanternH + 2, lanternW, lanternH);
        
        // Glass panels (amber glow)
        ctx.fillStyle = 'rgba(255, 180, 80, 0.8)';
        ctx.fillRect(lightX - lanternW/2 + 4, lightY - lanternH + 4, lanternW - 2, lanternH - 4);
        
        // Flame inside
        ctx.fillStyle = 'rgba(255, 220, 100, 0.9)';
        ctx.beginPath();
        ctx.ellipse(lightX + 3, lightY - lanternH/2 + 2, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Lantern top cap
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(lightX - lanternW/2 + 2, lightY - lanternH, lanternW + 2, 3);
        ctx.fillRect(lightX - lanternW/2 + 3, lightY + 1, lanternW, 2);
        
        // Glow effect
        const glowGrad = ctx.createRadialGradient(lightX + 3, lightY - lanternH/2 + 2, 0, lightX + 3, lightY - lanternH/2 + 2, 35);
        glowGrad.addColorStop(0, 'rgba(255, 180, 80, 0.25)');
        glowGrad.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(lightX - 40, lightY - lanternH - 30, 80, 70);
      } else {
        // Wall torch on iron bracket (positioned high near ceiling)
        const torchY = h / 2 - 5 - decorRandom() * 10; // Very high, near ceiling
        const torchH = 14 + decorRandom() * 4;
        
        // Iron wall bracket
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(lightX - 2, torchY + torchH - 4, 4, 6); // Wall mount plate
        
        // Iron ring holder
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(lightX, torchY + torchH - 6, 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Torch handle (wooden)
        ctx.fillStyle = '#4a3520';
        ctx.fillRect(lightX - 2, torchY, 4, torchH);
        
        // Handle wood grain
        ctx.strokeStyle = 'rgba(30, 20, 10, 0.4)';
        ctx.lineWidth = 1;
        for (let g = torchY + 3; g < torchY + torchH - 2; g += 4) {
          ctx.beginPath();
          ctx.moveTo(lightX - 1, g);
          ctx.lineTo(lightX + 1, g);
          ctx.stroke();
        }
        
        // Handle wrapping (cloth/rope)
        ctx.fillStyle = '#5a4a35';
        ctx.fillRect(lightX - 2, torchY + torchH - 8, 4, 3);
        ctx.fillRect(lightX - 2, torchY + torchH - 12, 4, 2);
        
        // Torch head (burning material)
        ctx.fillStyle = '#3a2a1a';
        ctx.beginPath();
        ctx.ellipse(lightX, torchY - 2, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Burning embers on torch head
        ctx.fillStyle = 'rgba(200, 80, 30, 0.8)';
        ctx.beginPath();
        ctx.ellipse(lightX - 1, torchY - 1, 2, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(lightX + 1, torchY - 2, 1.5, 2, -0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Main flame
        ctx.fillStyle = 'rgba(255, 180, 60, 0.95)';
        ctx.beginPath();
        ctx.ellipse(lightX, torchY - 8, 4, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Flame inner core
        ctx.fillStyle = 'rgba(255, 220, 100, 0.9)';
        ctx.beginPath();
        ctx.ellipse(lightX, torchY - 7, 2.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Flame bright center
        ctx.fillStyle = 'rgba(255, 255, 200, 0.85)';
        ctx.beginPath();
        ctx.ellipse(lightX, torchY - 5, 1.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Flame tip
        ctx.fillStyle = 'rgba(255, 200, 80, 0.7)';
        ctx.beginPath();
        ctx.moveTo(lightX, torchY - 14);
        ctx.lineTo(lightX - 2, torchY - 8);
        ctx.lineTo(lightX + 2, torchY - 8);
        ctx.closePath();
        ctx.fill();
        
        // Sparks/embers floating up
        for (let s = 0; s < 3; s++) {
          const sparkX = lightX + (decorRandom() - 0.5) * 10;
          const sparkY = torchY - 16 - decorRandom() * 12;
          ctx.fillStyle = `rgba(255, ${150 + Math.floor(decorRandom() * 80)}, 50, ${0.5 + decorRandom() * 0.4})`;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Large glow effect
        const glowGrad = ctx.createRadialGradient(lightX, torchY - 6, 0, lightX, torchY - 6, 45);
        glowGrad.addColorStop(0, 'rgba(255, 150, 50, 0.3)');
        glowGrad.addColorStop(0.5, 'rgba(255, 120, 40, 0.15)');
        glowGrad.addColorStop(1, 'rgba(255, 100, 30, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(lightX - 50, torchY - 50, 100, 90);
      }
    }
    
    // Floor Props - Barrels, Crates, Skull Piles
    // Wooden Barrel (rare)
    if (decorRandom() > 0.75) {
      const barrelX = 60 + decorRandom() * (w - 120);
      const barrelY = h - 40 - decorRandom() * 30;
      const barrelW = 20 + decorRandom() * 10;
      const barrelH = 25 + decorRandom() * 10;
      const barrelAlpha = 0.7 + decorRandom() * 0.2;
      
      // Barrel body (wood)
      ctx.fillStyle = `rgba(100, 70, 45, ${barrelAlpha})`;
      ctx.beginPath();
      ctx.ellipse(barrelX, barrelY, barrelW/2, barrelH/2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Wood grain lines
      ctx.strokeStyle = `rgba(70, 50, 30, ${barrelAlpha * 0.6})`;
      ctx.lineWidth = 1;
      for (let g = -barrelW/2 + 3; g < barrelW/2 - 3; g += 4) {
        ctx.beginPath();
        ctx.moveTo(barrelX + g, barrelY - barrelH/2 + 3);
        ctx.lineTo(barrelX + g, barrelY + barrelH/2 - 3);
        ctx.stroke();
      }
      
      // Metal bands
      ctx.strokeStyle = `rgba(60, 55, 50, ${barrelAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(barrelX, barrelY - barrelH/3, barrelW/2, 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(barrelX, barrelY + barrelH/3, barrelW/2, 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Highlight
      ctx.fillStyle = `rgba(140, 100, 65, ${barrelAlpha * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(barrelX - barrelW/4, barrelY - barrelH/4, barrelW/6, barrelH/3, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Wooden Crate (rare)
    if (decorRandom() > 0.8) {
      const crateX = 80 + decorRandom() * (w - 160);
      const crateY = h - 35 - decorRandom() * 25;
      const crateSize = 18 + decorRandom() * 12;
      const crateAlpha = 0.65 + decorRandom() * 0.25;
      
      // Crate body
      ctx.fillStyle = `rgba(90, 65, 40, ${crateAlpha})`;
      ctx.fillRect(crateX - crateSize/2, crateY - crateSize/2, crateSize, crateSize);
      
      // Wood plank lines (horizontal)
      ctx.strokeStyle = `rgba(60, 45, 25, ${crateAlpha * 0.7})`;
      ctx.lineWidth = 1;
      for (let p = -crateSize/2 + 4; p < crateSize/2 - 2; p += 5) {
        ctx.beginPath();
        ctx.moveTo(crateX - crateSize/2 + 1, crateY + p);
        ctx.lineTo(crateX + crateSize/2 - 1, crateY + p);
        ctx.stroke();
      }
      
      // Cross braces
      ctx.strokeStyle = `rgba(70, 50, 30, ${crateAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(crateX - crateSize/2 + 2, crateY - crateSize/2 + 2);
      ctx.lineTo(crateX + crateSize/2 - 2, crateY + crateSize/2 - 2);
      ctx.moveTo(crateX + crateSize/2 - 2, crateY - crateSize/2 + 2);
      ctx.lineTo(crateX - crateSize/2 + 2, crateY + crateSize/2 - 2);
      ctx.stroke();
      
      // Edge highlight
      ctx.fillStyle = `rgba(120, 90, 55, ${crateAlpha * 0.3})`;
      ctx.fillRect(crateX - crateSize/2, crateY - crateSize/2, crateSize, 3);
    }
    
    // Skull Pile (rare, spooky)
    if (decorRandom() > 0.85) {
      const pileX = 100 + decorRandom() * (w - 200);
      const pileY = h - 25 - decorRandom() * 20;
      const pileAlpha = 0.6 + decorRandom() * 0.25;
      const skullCount = 2 + Math.floor(decorRandom() * 3);
      
      for (let s = 0; s < skullCount; s++) {
        const sx = pileX + (s - skullCount/2) * 8 + (decorRandom() - 0.5) * 6;
        const sy = pileY + (decorRandom() - 0.5) * 5 - s * 2;
        const sSize = 5 + decorRandom() * 3;
        
        // Skull
        ctx.fillStyle = `rgba(195, 185, 165, ${pileAlpha})`;
        ctx.beginPath();
        ctx.ellipse(sx, sy, sSize, sSize * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye sockets
        ctx.fillStyle = `rgba(15, 10, 5, ${pileAlpha})`;
        ctx.beginPath();
        ctx.arc(sx - sSize * 0.3, sy - sSize * 0.1, sSize * 0.22, 0, Math.PI * 2);
        ctx.arc(sx + sSize * 0.3, sy - sSize * 0.1, sSize * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Scattered bones around pile
      for (let b = 0; b < 3; b++) {
        const bx = pileX + (decorRandom() - 0.5) * 40;
        const by = pileY + 5 + decorRandom() * 8;
        const bLen = 6 + decorRandom() * 8;
        const bAngle = decorRandom() * Math.PI;
        
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(bAngle);
        ctx.fillStyle = `rgba(185, 175, 155, ${pileAlpha * 0.7})`;
        ctx.fillRect(-bLen/2, -1, bLen, 2);
        ctx.restore();
      }
    }
    
    // Treasure Chest (very rare)
    if (decorRandom() > 0.92) {
      const chestX = 120 + decorRandom() * (w - 240);
      const chestY = h - 30 - decorRandom() * 15;
      const chestW = 24;
      const chestH = 16;
      const chestAlpha = 0.75;
      
      // Chest body (wood with gold trim)
      ctx.fillStyle = `rgba(100, 65, 35, ${chestAlpha})`;
      ctx.fillRect(chestX - chestW/2, chestY - chestH/2, chestW, chestH);
      
      // Chest lid (curved top)
      ctx.fillStyle = `rgba(90, 60, 30, ${chestAlpha})`;
      ctx.beginPath();
      ctx.ellipse(chestX, chestY - chestH/2, chestW/2, 5, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      
      // Gold band (horizontal)
      ctx.fillStyle = `rgba(200, 170, 80, ${chestAlpha})`;
      ctx.fillRect(chestX - chestW/2, chestY - 2, chestW, 4);
      
      // Gold lock
      ctx.fillStyle = `rgba(220, 190, 100, ${chestAlpha})`;
      ctx.fillRect(chestX - 4, chestY - 5, 8, 8);
      ctx.fillStyle = `rgba(180, 150, 60, ${chestAlpha})`;
      ctx.beginPath();
      ctx.arc(chestX, chestY - 1, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Gold corner studs
      ctx.fillStyle = `rgba(210, 180, 90, ${chestAlpha})`;
      ctx.beginPath();
      ctx.arc(chestX - chestW/2 + 3, chestY - chestH/2 + 3, 2, 0, Math.PI * 2);
      ctx.arc(chestX + chestW/2 - 3, chestY - chestH/2 + 3, 2, 0, Math.PI * 2);
      ctx.arc(chestX - chestW/2 + 3, chestY + chestH/2 - 3, 2, 0, Math.PI * 2);
      ctx.arc(chestX + chestW/2 - 3, chestY + chestH/2 - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Weapon Rack on Wall (rare)
    if (decorRandom() > 0.88) {
      const rackX = 50 + decorRandom() * (w - 100);
      const rackY = h/2 + 15 + decorRandom() * 30;
      const rackAlpha = 0.6 + decorRandom() * 0.25;
      
      // Wooden plank (horizontal)
      ctx.fillStyle = `rgba(80, 55, 35, ${rackAlpha})`;
      ctx.fillRect(rackX - 25, rackY, 50, 4);
      
      // Iron brackets
      ctx.fillStyle = `rgba(50, 45, 40, ${rackAlpha})`;
      ctx.fillRect(rackX - 22, rackY + 4, 4, 8);
      ctx.fillRect(rackX + 18, rackY + 4, 4, 8);
      
      // Sword on rack
      ctx.fillStyle = `rgba(150, 145, 140, ${rackAlpha})`;
      ctx.fillRect(rackX - 15, rackY + 3, 2, 25);
      ctx.fillStyle = `rgba(100, 70, 40, ${rackAlpha})`;
      ctx.fillRect(rackX - 17, rackY + 25, 6, 8);
      
      // Axe on rack
      ctx.fillStyle = `rgba(90, 65, 40, ${rackAlpha})`;
      ctx.fillRect(rackX + 8, rackY + 3, 3, 22);
      ctx.fillStyle = `rgba(140, 135, 130, ${rackAlpha})`;
      ctx.beginPath();
      ctx.moveTo(rackX + 11, rackY + 8);
      ctx.lineTo(rackX + 20, rackY + 5);
      ctx.lineTo(rackX + 20, rackY + 15);
      ctx.lineTo(rackX + 11, rackY + 18);
      ctx.closePath();
      ctx.fill();
    }
    
    // Stone Altar (very rare, ominous)
    if (decorRandom() > 0.94) {
      const altarX = w/2 + (decorRandom() - 0.5) * 150;
      const altarY = h - 25;
      const altarAlpha = 0.65;
      
      // Altar base (stone)
      ctx.fillStyle = `rgba(70, 65, 60, ${altarAlpha})`;
      ctx.fillRect(altarX - 30, altarY - 15, 60, 20);
      
      // Altar top
      ctx.fillStyle = `rgba(80, 75, 70, ${altarAlpha})`;
      ctx.fillRect(altarX - 35, altarY - 20, 70, 8);
      
      // Carved symbols
      ctx.strokeStyle = `rgba(120, 40, 40, ${altarAlpha * 0.6})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(altarX, altarY - 8, 5, 0, Math.PI * 2);
      ctx.moveTo(altarX - 8, altarY - 8);
      ctx.lineTo(altarX + 8, altarY - 8);
      ctx.moveTo(altarX, altarY - 16);
      ctx.lineTo(altarX, altarY);
      ctx.stroke();
      
      // Candles on altar
      ctx.fillStyle = `rgba(200, 180, 150, ${altarAlpha})`;
      ctx.fillRect(altarX - 25, altarY - 30, 4, 12);
      ctx.fillRect(altarX + 21, altarY - 30, 4, 12);
      
      // Candle flames
      ctx.fillStyle = `rgba(255, 180, 80, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(altarX - 23, altarY - 33, 2, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(altarX + 23, altarY - 33, 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Floor debris and scattered stones
    const debrisCount = 5 + Math.floor(decorRandom() * 8);
    for (let i = 0; i < debrisCount; i++) {
      const debrisX = 20 + decorRandom() * (w - 40);
      const debrisY = h - 30 - decorRandom() * 80;
      const debrisSize = 2 + decorRandom() * 5;
      const debrisAlpha = 0.3 + decorRandom() * 0.3;
      
      // Small rocks/pebbles
      const grayVal = 40 + Math.floor(decorRandom() * 40);
      ctx.fillStyle = `rgba(${grayVal}, ${grayVal - 5}, ${grayVal - 10}, ${debrisAlpha})`;
      ctx.beginPath();
      ctx.ellipse(debrisX, debrisY, debrisSize, debrisSize * 0.6, decorRandom() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = `rgba(${grayVal + 30}, ${grayVal + 25}, ${grayVal + 20}, ${debrisAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(debrisX - 1, debrisY - 1, debrisSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Floor bones scattered around
    const boneCount = Math.floor(decorRandom() * 4);
    for (let i = 0; i < boneCount; i++) {
      const boneX = 40 + decorRandom() * (w - 80);
      const boneY = h - 20 - decorRandom() * 60;
      const boneLen = 8 + decorRandom() * 12;
      const boneAngle = decorRandom() * Math.PI;
      const boneAlpha = 0.4 + decorRandom() * 0.3;
      
      ctx.save();
      ctx.translate(boneX, boneY);
      ctx.rotate(boneAngle);
      
      // Bone shaft
      ctx.fillStyle = `rgba(200, 190, 170, ${boneAlpha})`;
      ctx.fillRect(-boneLen/2, -1.5, boneLen, 3);
      
      // Bone ends (knobs)
      ctx.beginPath();
      ctx.arc(-boneLen/2, 0, 3, 0, Math.PI * 2);
      ctx.arc(boneLen/2, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
    
    // Occasional skull on floor or wall
    if (decorRandom() > 0.7) {
      const skullX = 50 + decorRandom() * (w - 100);
      const skullY = decorRandom() > 0.5 ? (h - 25 - decorRandom() * 40) : (h/2 + 30 + decorRandom() * 50);
      const skullSize = 6 + decorRandom() * 4;
      const skullAlpha = 0.5 + decorRandom() * 0.3;
      
      // Skull shape
      ctx.fillStyle = `rgba(190, 180, 160, ${skullAlpha})`;
      ctx.beginPath();
      ctx.ellipse(skullX, skullY, skullSize, skullSize * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye sockets
      ctx.fillStyle = `rgba(20, 15, 10, ${skullAlpha})`;
      ctx.beginPath();
      ctx.ellipse(skullX - skullSize * 0.35, skullY - skullSize * 0.15, skullSize * 0.25, skullSize * 0.3, 0, 0, Math.PI * 2);
      ctx.ellipse(skullX + skullSize * 0.35, skullY - skullSize * 0.15, skullSize * 0.25, skullSize * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Nose hole
      ctx.beginPath();
      ctx.moveTo(skullX, skullY + skullSize * 0.1);
      ctx.lineTo(skullX - skullSize * 0.15, skullY + skullSize * 0.35);
      ctx.lineTo(skullX + skullSize * 0.15, skullY + skullSize * 0.35);
      ctx.closePath();
      ctx.fill();
      
      // Teeth suggestion
      ctx.fillStyle = `rgba(170, 160, 140, ${skullAlpha})`;
      ctx.fillRect(skullX - skullSize * 0.4, skullY + skullSize * 0.5, skullSize * 0.8, skullSize * 0.3);
    }
    
    // Wall chains hanging
    if (decorRandom() > 0.6) {
      const chainX = 30 + decorRandom() * (w - 60);
      const chainStartY = h/2 - 5;
      const chainLen = 20 + decorRandom() * 40;
      const chainAlpha = 0.5 + decorRandom() * 0.3;
      
      // Chain links
      ctx.strokeStyle = `rgba(80, 75, 70, ${chainAlpha})`;
      ctx.lineWidth = 2;
      for (let cy = chainStartY; cy < chainStartY + chainLen; cy += 6) {
        ctx.beginPath();
        ctx.ellipse(chainX, cy + 3, 2, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Chain mount on wall
      ctx.fillStyle = `rgba(60, 55, 50, ${chainAlpha})`;
      ctx.fillRect(chainX - 4, chainStartY - 2, 8, 5);
      
      // Shackle or hook at end
      if (decorRandom() > 0.5) {
        const endY = chainStartY + chainLen;
        ctx.strokeStyle = `rgba(70, 65, 60, ${chainAlpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(chainX, endY + 5, 5, 0, Math.PI);
        ctx.stroke();
      }
    }
    
    // Ceiling stalactites/drips
    const stalCount = 2 + Math.floor(decorRandom() * 4);
    for (let i = 0; i < stalCount; i++) {
      const stalX = 30 + decorRandom() * (w - 60);
      const stalY = h/2 - 10 - decorRandom() * 15;
      const stalLen = 8 + decorRandom() * 15;
      const stalAlpha = 0.35 + decorRandom() * 0.25;
      
      // Stalactite shape (pointed down)
      ctx.fillStyle = `rgba(70, 65, 60, ${stalAlpha})`;
      ctx.beginPath();
      ctx.moveTo(stalX - 3, stalY);
      ctx.lineTo(stalX + 3, stalY);
      ctx.lineTo(stalX, stalY + stalLen);
      ctx.closePath();
      ctx.fill();
      
      // Water drip at tip
      if (decorRandom() > 0.5) {
        ctx.fillStyle = `rgba(100, 120, 140, 0.4)`;
        ctx.beginPath();
        ctx.ellipse(stalX, stalY + stalLen + 2, 1.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Floor puddles (water)
    const puddleCount = Math.floor(decorRandom() * 3);
    for (let i = 0; i < puddleCount; i++) {
      const puddleX = 50 + decorRandom() * (w - 100);
      const puddleY = h - 15 - decorRandom() * 50;
      const puddleW = 15 + decorRandom() * 25;
      const puddleH = 4 + decorRandom() * 6;
      
      // Dark water puddle
      ctx.fillStyle = 'rgba(30, 40, 50, 0.4)';
      ctx.beginPath();
      ctx.ellipse(puddleX, puddleY, puddleW, puddleH, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Reflection highlight
      ctx.fillStyle = 'rgba(80, 100, 120, 0.2)';
      ctx.beginPath();
      ctx.ellipse(puddleX - puddleW * 0.2, puddleY - puddleH * 0.3, puddleW * 0.4, puddleH * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Small critters (rats or bugs) - rare
    if (decorRandom() > 0.8) {
      const critterX = 30 + decorRandom() * (w - 60);
      const critterY = h - 12 - decorRandom() * 30;
      const isRat = decorRandom() > 0.4;
      
      if (isRat) {
        // Small rat silhouette
        const ratSize = 4 + decorRandom() * 3;
        ctx.fillStyle = 'rgba(40, 35, 30, 0.6)';
        
        // Body
        ctx.beginPath();
        ctx.ellipse(critterX, critterY, ratSize, ratSize * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.beginPath();
        ctx.ellipse(critterX + ratSize * 0.8, critterY - ratSize * 0.1, ratSize * 0.4, ratSize * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.strokeStyle = 'rgba(50, 40, 35, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(critterX - ratSize, critterY);
        ctx.quadraticCurveTo(critterX - ratSize * 1.5, critterY - ratSize * 0.5, critterX - ratSize * 2, critterY + ratSize * 0.3);
        ctx.stroke();
        
        // Ears
        ctx.fillStyle = 'rgba(50, 40, 35, 0.5)';
        ctx.beginPath();
        ctx.arc(critterX + ratSize * 0.7, critterY - ratSize * 0.4, ratSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Spider/bug
        const bugSize = 2 + decorRandom() * 2;
        ctx.fillStyle = 'rgba(30, 25, 20, 0.6)';
        
        // Body
        ctx.beginPath();
        ctx.arc(critterX, critterY, bugSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs
        ctx.strokeStyle = 'rgba(30, 25, 20, 0.5)';
        ctx.lineWidth = 1;
        for (let leg = 0; leg < 4; leg++) {
          const legAngle = (leg / 4) * Math.PI - Math.PI * 0.5;
          ctx.beginPath();
          ctx.moveTo(critterX, critterY);
          ctx.lineTo(critterX + Math.cos(legAngle) * bugSize * 2.5, critterY + Math.sin(legAngle) * bugSize * 1.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(critterX, critterY);
          ctx.lineTo(critterX - Math.cos(legAngle) * bugSize * 2.5, critterY + Math.sin(legAngle) * bugSize * 1.5);
          ctx.stroke();
        }
      }
    }
    
    // Scratch marks on walls
    if (decorRandom() > 0.6) {
      const scratchX = 60 + decorRandom() * (w - 120);
      const scratchY = h/2 + 20 + decorRandom() * 60;
      const scratchCount = 3 + Math.floor(decorRandom() * 2);
      
      ctx.strokeStyle = 'rgba(25, 20, 15, 0.4)';
      ctx.lineWidth = 1;
      
      for (let s = 0; s < scratchCount; s++) {
        const sx = scratchX + s * 4;
        ctx.beginPath();
        ctx.moveTo(sx, scratchY);
        ctx.lineTo(sx + 2 + decorRandom() * 3, scratchY + 15 + decorRandom() * 10);
        ctx.stroke();
      }
    }
    
    } // end if (!facingDoor)
  };

  return (
    <div className={className}>
      <canvas 
        ref={setCanvasRef} 
        width={renderWidth} 
        height={renderHeight} 
        className="w-full h-full image-pixelated rounded-lg border-4 border-muted shadow-inner bg-black"
      />
      {/* Compass / Coords Overlay */}
      <div className="absolute top-4 right-4 text-primary font-pixel text-xs bg-black/50 p-2 rounded">
        X:{gameData.x} Y:{gameData.y} L:{gameData.level}
      </div>
    </div>
  );
}
