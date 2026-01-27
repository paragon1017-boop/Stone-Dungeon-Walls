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
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Detect green background (the new slime has a bright green background)
        // Green background has high G, moderate R, and low B relative to G
        const isGreenBackground = g > 130 && g > r * 0.9 && g > b * 1.2 && r > 80 && r < 200;
        
        // Also detect white/gray backgrounds
        const brightness = (r + g + b) / 3;
        const isGrayish = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
        const isWhiteBackground = brightness > 230 && isGrayish;
        
        if (isGreenBackground || isWhiteBackground) {
          // Make background transparent
          data[i + 3] = 0;
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
