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
      
      // First pass: identify background pixels more conservatively
      const width = canvas.width;
      const height = canvas.height;
      const isBackground = new Uint8Array(width * height);
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const pixelIndex = i / 4;
        
        // More conservative purple detection - must be very clearly purple
        const isPurpleBackground = r > 90 && r < 150 && b > 90 && b < 150 && 
                                    Math.abs(r - b) < 30 && g < r - 10 && g < b - 10 &&
                                    g > 50 && g < 120;
        
        // More conservative green background detection
        const isGreenBackground = g > 150 && g > r * 1.1 && g > b * 1.4 && r > 100 && r < 180;
        
        // White/gray backgrounds
        const brightness = (r + g + b) / 3;
        const isGrayish = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;
        const isWhiteBackground = brightness > 240 && isGrayish;
        
        if (isPurpleBackground || isGreenBackground || isWhiteBackground) {
          isBackground[pixelIndex] = 1;
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
