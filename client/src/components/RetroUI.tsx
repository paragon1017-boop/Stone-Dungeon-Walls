import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RetroCardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function RetroCard({ children, title, className }: RetroCardProps) {
  return (
    <div className={cn(
      "relative border-4 border-double border-primary/40 bg-black/90 p-4 shadow-lg shadow-black/50",
      className
    )}>
      {title && (
        <div className="absolute -top-3 left-4 bg-background px-2 text-primary font-pixel text-xs">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function RetroButton({ 
  children, 
  onClick, 
  disabled, 
  className, 
  variant = 'default' 
}: { 
  children: ReactNode, 
  onClick?: () => void, 
  disabled?: boolean, 
  className?: string,
  variant?: 'default' | 'danger' | 'ghost'
}) {
  const variants = {
    default: "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
    danger: "border-destructive text-destructive hover:bg-destructive hover:text-white",
    ghost: "border-transparent text-muted-foreground hover:text-foreground"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 font-pixel text-xs border-2 transition-all active:translate-y-0.5",
        "disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function StatBar({ label, current, max, color }: { label: string, current: number, max: number, color: string }) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  
  return (
    <div className="flex items-center gap-2 font-retro text-lg leading-none">
      <span className="w-8 text-right text-muted-foreground">{label}</span>
      <div className="flex-1 h-3 bg-secondary border border-border relative">
        <div 
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white mix-blend-difference font-pixel">
          {current}/{max}
        </span>
      </div>
    </div>
  );
}
