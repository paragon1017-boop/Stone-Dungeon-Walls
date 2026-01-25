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
    floorImg.src = "/assets/textures/floor_stone.jpg";

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

    // Draw Floor & Ceiling (Gradient fallback if texture missing)
    if (!texturesRef.current.floor) {
      // Ceiling
      const ceilingGradient = ctx.createLinearGradient(0, 0, 0, h / 2);
      ceilingGradient.addColorStop(0, "#111");
      ceilingGradient.addColorStop(1, "#000");
      ctx.fillStyle = ceilingGradient;
      ctx.fillRect(0, 0, w, h / 2);

      // Floor
      const floorGradient = ctx.createLinearGradient(0, h / 2, 0, h);
      floorGradient.addColorStop(0, "#1a1a1a");
      floorGradient.addColorStop(1, "#0a0a0a");
      ctx.fillStyle = floorGradient;
      ctx.fillRect(0, h / 2, w, h / 2);
    } else {
        // Simple floor fill for now - fully textured floor casting is expensive in JS without optimization
        // We'll stick to a solid color gradient for performance and "retro" feel, 
        // OR simply draw the image stretched if user really wants texture, 
        // but raycasting floor is tricky.
        // Let's stick to the gradient for retro vibe + performance, it looks cleaner.
        // If specific texture requested, we can pattern fill:
        const ptrn = ctx.createPattern(texturesRef.current.floor, 'repeat');
        if (ptrn) {
           ctx.fillStyle = "#000"; 
           ctx.fillRect(0,0,w,h/2); // Ceiling black
           ctx.fillStyle = ptrn;
           // Perspective transform is hard in 2D canvas, so we just fill bottom half
           // To make it look "ok", we add a dark gradient overlay
           ctx.fillRect(0, h/2, w, h/2);
           
           const fade = ctx.createLinearGradient(0, h/2, 0, h);
           fade.addColorStop(0, "rgba(0,0,0,0.9)");
           fade.addColorStop(1, "rgba(0,0,0,0.2)");
           ctx.fillStyle = fade;
           ctx.fillRect(0, h/2, w, h/2);
        }
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
      } else {
         // Fallback color
         const color = side === 1 ? '#555' : '#777';
         ctx.fillStyle = color;
         ctx.fillRect(x, drawStart, 2, drawEnd - drawStart);
      }
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
