import { useEffect, useRef } from "react";
import { GameData, NORTH, EAST, SOUTH, WEST } from "@/lib/game-engine";

interface DungeonViewProps {
  gameData: GameData;
  className?: string;
}

export function DungeonView({ gameData, className }: DungeonViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const texturesRef = useRef<{ wall: HTMLImageElement | null; floor: HTMLImageElement | null }>({ wall: null, floor: null });

  // Load textures once
  useEffect(() => {
    const wallImg = new Image();
    wallImg.src = "/assets/textures/wall_stone.jpg";
    const floorImg = new Image();
    floorImg.src = "/assets/textures/floor_cobble.jpg";

    wallImg.onload = () => { texturesRef.current.wall = wallImg; draw(); };
    floorImg.onload = () => { texturesRef.current.floor = floorImg; draw(); };
  }, []);

  // Redraw when game data changes
  useEffect(() => {
    draw();
  }, [gameData]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear screen
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple Raycaster Settings
    const map = gameData.map;
    const posX = gameData.x + 0.5; // Center inside tile
    const posY = gameData.y + 0.5;
    
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

    // Draw Ceiling with perspective texture (matching floor but darker with moss)
    const ceilingTex = texturesRef.current.floor; // Use same texture as floor
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
          hit = 1;
        }
      }

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
         
         // Draw slice
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
         
         // Draw stone baseboard at bottom of wall (matching floor texture)
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
  };

  return (
    <div className={className}>
      <canvas 
        ref={canvasRef} 
        width={320} 
        height={240} 
        className="w-full h-full image-pixelated rounded-lg border-4 border-muted shadow-inner bg-black"
      />
      {/* Compass / Coords Overlay */}
      <div className="absolute top-4 right-4 text-primary font-pixel text-xs bg-black/50 p-2 rounded">
        X:{gameData.x} Y:{gameData.y} L:{gameData.level}
      </div>
    </div>
  );
}
