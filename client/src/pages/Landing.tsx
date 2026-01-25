import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { RetroButton } from "@/components/RetroUI";

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
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background with scanlines and glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-black z-0" />
      <div className="absolute inset-0 scanlines opacity-30 pointer-events-none z-10" />

      <div className="relative z-20 text-center space-y-12 max-w-2xl">
        <div className="space-y-4 animate-in fade-in zoom-in duration-1000">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-pixel text-transparent bg-clip-text bg-gradient-to-b from-primary to-red-900 drop-shadow-[0_4px_0_rgba(255,0,0,0.5)] leading-tight py-4">
            SHINING IN THE<br />DARKNESS
          </h1>
          <p className="font-retro text-2xl md:text-3xl text-muted-foreground tracking-widest">
            WEB EDITION
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom duration-1000 delay-500">
          <p className="font-retro text-xl text-primary/80 max-w-md mx-auto">
            Enter the labyrinth. Fight monsters. Survive the darkness.
          </p>
          
          <a href="/api/login" className="no-underline">
            <RetroButton className="text-xl px-12 py-6 border-4 shadow-[0_0_20px_rgba(234,88,12,0.5)] hover:shadow-[0_0_40px_rgba(234,88,12,0.8)] animate-pulse">
              INSERT COIN TO START
            </RetroButton>
          </a>
          
          <div className="text-xs font-pixel text-muted-foreground mt-8">
            © 2024 RETRO RPG SYSTEMS
          </div>
        </div>
      </div>
    </div>
  );
}
