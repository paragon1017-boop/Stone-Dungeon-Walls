import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-primary font-pixel">
      <div className="text-center space-y-6 p-8 border-4 border-destructive rounded shadow-[0_0_30px_rgba(239,68,68,0.3)]">
        <AlertTriangle className="h-24 w-24 mx-auto text-destructive animate-bounce" />
        <h1 className="text-4xl">404 ERROR</h1>
        <p className="font-retro text-2xl text-muted-foreground">The dungeon floor you are looking for has collapsed.</p>
        
        <Link href="/" className="inline-block mt-8 text-primary hover:underline hover:text-white transition-colors">
          RETURN TO SAFETY
        </Link>
      </div>
    </div>
  );
}
