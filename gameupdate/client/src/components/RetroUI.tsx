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
      "relative rounded-xl bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm",
      "border border-white/10 shadow-xl shadow-black/30",
      "p-4",
      className
    )}>
      {title && (
        <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground font-semibold text-xs tracking-wide shadow-lg">
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
    default: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20",
    danger: "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:from-destructive/90 hover:to-destructive/70 shadow-lg shadow-destructive/20",
    ghost: "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2.5 font-semibold text-sm rounded-lg transition-all duration-200",
        "disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider",
        "active:scale-[0.98] active:shadow-none",
        "flex items-center justify-center gap-2",
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
  
  const getGradient = () => {
    if (color.includes('green') || color.includes('#22c55e') || color.includes('emerald')) {
      return 'linear-gradient(90deg, #059669, #10b981, #34d399)';
    } else if (color.includes('blue') || color.includes('#3b82f6')) {
      return 'linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)';
    } else if (color.includes('red') || color.includes('#ef4444')) {
      return 'linear-gradient(90deg, #dc2626, #ef4444, #f87171)';
    } else if (color.includes('amber') || color.includes('yellow') || color.includes('#f59e0b')) {
      return 'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)';
    }
    return `linear-gradient(90deg, ${color}, ${color})`;
  };
  
  return (
    <div className="flex items-center gap-3 font-medium text-base leading-none">
      <span className="w-8 text-right text-muted-foreground text-sm">{label}</span>
      <div className="flex-1 h-4 bg-black/40 rounded-full overflow-hidden border border-white/10 relative">
        <div 
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{ 
            width: `${percent}%`, 
            background: getGradient(),
            boxShadow: `0 0 10px ${color}40`
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold drop-shadow-lg">
          {current}/{max}
        </span>
      </div>
    </div>
  );
}
