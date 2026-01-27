import { useEffect, useRef, useState } from "react";

interface TransparentMonsterProps {
  src: string;
  alt: string;
  className?: string;
}

export function TransparentMonster({ src, alt, className }: TransparentMonsterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // First pass: identify background pixels aggressively
      const width = canvas.width;
      const height = canvas.height;
      const isBackground = new Uint8Array(width * height);
      
      // Sample corners to detect the likely background color
      const corners = [
        0, // top-left
        width - 1, // top-right
        (height - 1) * width, // bottom-left
        (height - 1) * width + width - 1, // bottom-right
      ];
      
      // Get average corner colors
      let bgR = 0, bgG = 0, bgB = 0;
      for (const idx of corners) {
        bgR += data[idx * 4];
        bgG += data[idx * 4 + 1];
        bgB += data[idx * 4 + 2];
      }
      bgR /= 4; bgG /= 4; bgB /= 4;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const pixelIndex = i / 4;
        
        // Check if pixel matches detected background color (with tolerance)
        const matchesBg = Math.abs(r - bgR) < 35 && Math.abs(g - bgG) < 35 && Math.abs(b - bgB) < 35;
        
        // Purple detection (common AI generation background)
        const isPurpleBackground = r > 80 && r < 180 && b > 80 && b < 180 && 
                                    Math.abs(r - b) < 40 && g < Math.max(r, b) - 5;
        
        // Green screen detection
        const isGreenBackground = g > 140 && g > r * 1.05 && g > b * 1.2;
        
        // White/light gray backgrounds
        const brightness = (r + g + b) / 3;
        const isGrayish = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
        const isWhiteBackground = brightness > 230 && isGrayish;
        const isLightGray = brightness > 200 && isGrayish;
        
        // Very dark backgrounds
        const isDarkBackground = brightness < 25 && isGrayish;
        
        // Blue/cyan backgrounds
        const isBlueBackground = b > 140 && b > r * 1.2 && b > g * 1.1;
        
        // Beige/tan AI backgrounds
        const isBeigeBackground = r > 180 && g > 160 && b > 140 && 
                                   r > g && g > b && (r - b) < 60 && brightness > 170;
        
        if (matchesBg || isPurpleBackground || isGreenBackground || isWhiteBackground || 
            isLightGray || isDarkBackground || isBlueBackground || isBeigeBackground) {
          isBackground[pixelIndex] = 1;
        }
      }
      
      // Flood fill from edges to catch connected background regions
      const visited = new Uint8Array(width * height);
      const queue: number[] = [];
      
      // Add edge pixels that are background to queue
      for (let x = 0; x < width; x++) {
        if (isBackground[x]) queue.push(x);
        if (isBackground[(height - 1) * width + x]) queue.push((height - 1) * width + x);
      }
      for (let y = 0; y < height; y++) {
        if (isBackground[y * width]) queue.push(y * width);
        if (isBackground[y * width + width - 1]) queue.push(y * width + width - 1);
      }
      
      // Flood fill to mark connected background
      while (queue.length > 0) {
        const idx = queue.pop()!;
        if (visited[idx]) continue;
        visited[idx] = 1;
        
        const x = idx % width;
        const y = Math.floor(idx / width);
        
        // Check 4-connected neighbors
        const neighbors = [
          y > 0 ? idx - width : -1,
          y < height - 1 ? idx + width : -1,
          x > 0 ? idx - 1 : -1,
          x < width - 1 ? idx + 1 : -1,
        ];
        
        for (const n of neighbors) {
          if (n >= 0 && !visited[n] && isBackground[n]) {
            queue.push(n);
          }
        }
      }
      
      // Only keep background pixels that are connected to edges
      for (let i = 0; i < isBackground.length; i++) {
        if (isBackground[i] && !visited[i]) {
          isBackground[i] = 0; // Interior pixel that matched bg color but isn't connected
        }
      }
      
      // Second pass: apply transparency with edge softening and dungeon color grading
      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        if (isBackground[pixelIndex]) {
          // Check if this is an edge pixel (next to non-background)
          let isEdge = false;
          for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const neighborIdx = ny * width + nx;
                if (!isBackground[neighborIdx]) {
                  isEdge = true;
                  break;
                }
              }
            }
            if (isEdge) break;
          }
          
          if (isEdge) {
            // Soften edge - partial transparency
            data[i + 3] = 80;
          } else {
            // Full transparency for definite background
            data[i + 3] = 0;
          }
        } else {
          // Apply dungeon atmosphere color grading to non-background pixels
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];
          
          // Add warm torch-like tint (slight orange/amber shift)
          r = Math.min(255, r * 1.05 + 8);
          g = Math.min(255, g * 0.95);
          b = Math.min(255, b * 0.85);
          
          // Darken slightly for dungeon atmosphere
          const darkenAmount = 0.88;
          r *= darkenAmount;
          g *= darkenAmount;
          b *= darkenAmount;
          
          // Add subtle vignette based on distance from center
          const centerX = width / 2;
          const centerY = height / 2;
          const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
          const vignette = 1 - (distFromCenter / maxDist) * 0.15;
          
          r *= vignette;
          g *= vignette;
          b *= vignette;
          
          data[i] = Math.floor(r);
          data[i + 1] = Math.floor(g);
          data[i + 2] = Math.floor(b);
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      setLoaded(true);
    };
    
    img.src = src;
  }, [src]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      style={{ 
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in'
      }}
    />
  );
}
