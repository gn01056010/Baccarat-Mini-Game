import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PlaceBetRequest, type GameStateResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Fetch current game state
export function useGameState() {
  return useQuery({
    queryKey: [api.game.state.path],
    queryFn: async () => {
      const res = await fetch(api.game.state.path);
      if (!res.ok) throw new Error("Failed to fetch game state");
      return await res.json() as GameStateResponse;
    },
    refetchInterval: 5000, // Poll occasionally to keep sync if needed
  });
}

// Deal a new round
export function useDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bets: PlaceBetRequest['bets']) => {
      // Validate bets on client before sending
      if (Object.keys(bets).length === 0) {
        throw new Error("Please place at least one bet.");
      }

      const res = await fetch(api.game.deal.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bets }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to deal");
      }

      return await res.json() as GameStateResponse;
    },
    onSuccess: (data) => {
      // Optimistically update the game state
      queryClient.setQueryData([api.game.state.path], data);
      
      // Determine winner message
      const result = data.currentRound?.result;
      if (result) {
        const winnerText = result.winner === 'tie' ? 'Tie Game' : `${result.winner === 'player' ? 'Player' : 'Banker'} Wins`;
        toast({
          title: result.outcome || winnerText,
          description: `Player: ${result.player.score} - Banker: ${result.banker.score}`,
          variant: "default",
          className: "bg-[hsl(var(--casino-gold))] text-black border-none font-serif",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Reset/Shuffle Game
export function useResetGame() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.game.reset.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decks: 8 }),
      });
      if (!res.ok) throw new Error("Failed to shuffle");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.game.state.path] });
      toast({
        title: "Deck Shuffled",
        description: "New shoe is ready to deal.",
      });
    },
  });
}

// Reset User Balance
export function useResetBalance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.user.resetBalance.path, { method: "POST" });
      if (!res.ok) throw new Error("Failed to reset balance");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.game.state.path] });
      toast({
        title: "Balance Reset",
        description: `Balance restored to ${data.balance}`,
      });
    },
  });
}
