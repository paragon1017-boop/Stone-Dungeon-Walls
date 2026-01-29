import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { RetroButton } from "@/components/RetroUI";
import { Sword, Shield, Sparkles } from "lucide-react";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/game");
    }
  }, [isAuthenticated, setLocation]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-20 text-center space-y-12 max-w-3xl">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
            <span className="bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-2xl">
              SHINING IN THE
            </span>
            <br />
            <span className="bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 bg-clip-text text-transparent">
              DARKNESS
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground tracking-[0.3em] font-medium">
            WEB EDITION
          </p>
        </div>

        <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <p className="text-lg md:text-xl text-secondary-foreground/80 max-w-lg mx-auto leading-relaxed">
            Enter the labyrinth. Fight monsters. Survive the darkness.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <Sword className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Turn-Based Combat</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-muted-foreground">Equipment System</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-muted-foreground">3D Dungeon</span>
            </div>
          </div>
          
          <a href="/api/login" className="no-underline mt-4">
            <RetroButton className="text-lg px-10 py-5 rounded-xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
              START YOUR ADVENTURE
            </RetroButton>
          </a>
          
          <div className="text-xs text-muted-foreground mt-8 tracking-wider">
            A classic dungeon crawler reimagined
          </div>
        </div>
      </div>
    </div>
  );
}
