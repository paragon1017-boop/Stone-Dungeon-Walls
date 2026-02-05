import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertGameState, type GameState } from "@shared/routes";
import { useToast } from "./use-toast";

// ============================================
// GAME STATE HOOKS
// ============================================

export function useGameState() {
  return useQuery({
    queryKey: [api.game.load.path],
    queryFn: async () => {
      const res = await fetch(api.game.load.path, { credentials: "include" });
      if (res.status === 404) return null; // New game
      if (res.status === 401) return null; // Not logged in
      if (!res.ok) throw new Error('Failed to load game');
      return api.game.load.responses[200].parse(await res.json());
    },
    retry: false,
    staleTime: Infinity, // Don't refetch automatically, manual save/load only
  });
}

export function useSaveGame() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertGameState) => {
      const validated = api.game.save.input.parse(data);
      const res = await fetch(api.game.save.path, {
        method: api.game.save.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (res.status === 401) {
        throw new Error("Please log in to save your game.");
      }
      if (!res.ok) throw new Error('Failed to save game');
      
      return api.game.save.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.game.load.path], data);
      toast({
        title: "Game Saved",
        description: "Your progress has been recorded in the chronicles.",
        className: "font-pixel text-xs border-2 border-primary bg-background text-primary",
      });
    },
    onError: (err) => {
      toast({
        title: "Save Failed",
        description: err.message,
        variant: "destructive",
        className: "font-pixel text-xs",
      });
    }
  });
}
