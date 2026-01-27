import { useState, useEffect } from "react";
import { useGameState, useDeal, useResetGame, useResetBalance } from "@/hooks/use-game";
import { PlayingCard } from "@/components/PlayingCard";
import { Chip } from "@/components/Chip";
import { BettingSpot } from "@/components/BettingSpot";
import { Roadmap } from "@/components/Roadmap";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Trash2, Repeat, Wallet, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BetType } from "@shared/schema";
import { AnimatePresence, motion } from "framer-motion";

const CHIP_VALUES = [10, 50, 100, 500, 1000];

export default function Game() {
  const { data: gameState, isLoading } = useGameState();
  const dealMutation = useDeal();
  const resetMutation = useResetGame();
  const balanceMutation = useResetBalance();

  // Local state for betting
  const [bets, setBets] = useState<Record<BetType, number>>({
    player: 0, banker: 0, tie: 0, player_pair: 0, banker_pair: 0
  });
  const [selectedChip, setSelectedChip] = useState(100);
  const [previousBets, setPreviousBets] = useState<Record<BetType, number> | null>(null);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);
  const userBalance = gameState?.user.balance || 0;

  // Sound effects could go here (useEffect)

  const handlePlaceBet = (type: BetType) => {
    if (dealMutation.isPending) return;
    if (userBalance - totalBet < selectedChip) return; // Basic client-side validation logic needs refining against real balance

    setBets(prev => ({
      ...prev,
      [type]: prev[type] + selectedChip
    }));
  };

  const clearBets = () => setBets({ player: 0, banker: 0, tie: 0, player_pair: 0, banker_pair: 0 });
  
  const rebet = () => {
    if (previousBets) {
      setBets(previousBets);
    }
  };

  const handleDeal = async () => {
    setPreviousBets(bets);
    await dealMutation.mutateAsync(bets);
    // After deal, bets are cleared from state conceptually, but we keep them visual until next round or clear
    setTimeout(() => clearBets(), 4000); // Auto clear after showing result for a bit
  };

  if (isLoading || !gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--casino-green-dark))] text-[hsl(var(--casino-gold))]">
        <Loader2 className="w-12 h-12 animate-spin" />
        <span className="ml-4 font-serif text-xl">Loading Table...</span>
      </div>
    );
  }

  const { currentRound, shoe, history } = gameState;
  const lastResult = history[history.length - 1];

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      {/* --- HEADER --- */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 px-4 py-3 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="text-[hsl(var(--casino-gold))] font-serif font-bold text-2xl tracking-wider">
            百家樂
            <span className="text-xs ml-2 text-white/50 font-sans tracking-normal block md:inline">貴賓席 1</span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
             <span className="text-xs text-white/60 uppercase">Shoe</span>
             <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-[hsl(var(--casino-gold))]" 
                 style={{ width: `${(shoe.remainingCards / (shoe.decks * 52)) * 100}%` }}
               />
             </div>
             <span className="text-xs font-mono text-white">{shoe.remainingCards} Cards</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex flex-col items-end mr-4">
             <span className="text-xs text-[hsl(var(--casino-gold))] uppercase tracking-widest">餘額</span>
             <div className="flex items-center gap-2 text-white font-mono text-lg font-bold">
               <Wallet className="w-4 h-4 text-[hsl(var(--casino-gold))]" />
               ${userBalance.toLocaleString()}
             </div>
           </div>
           
           <Button 
             variant="outline" 
             size="icon" 
             onClick={() => balanceMutation.mutate()}
             disabled={balanceMutation.isPending}
             className="border-white/20 hover:bg-white/10 text-white"
             title="Reset Balance"
           >
             <RotateCcw className="w-4 h-4" />
           </Button>

           <Button
             variant="outline"
             size="icon"
             onClick={() => resetMutation.mutate()}
             disabled={resetMutation.isPending}
             className="border-white/20 hover:bg-white/10 text-white"
             title="Shuffle Deck"
           >
             <Shuffle className="w-4 h-4" />
           </Button>
        </div>
      </header>

      {/* --- MAIN TABLE AREA --- */}
      <main className="flex-1 relative flex flex-col">
        
        {/* Dealer / Cards Area */}
        <div className="flex-1 flex flex-col justify-center items-center py-8 relative">
          
          {/* Result Banner Overlay */}
          <AnimatePresence>
            {lastResult && !dealMutation.isPending && bets.player === 0 && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className="absolute top-10 z-30 bg-black/60 backdrop-blur px-8 py-2 rounded-full border border-[hsl(var(--casino-gold))]/50"
               >
                 <h2 className="text-2xl font-serif text-[hsl(var(--casino-gold))] text-center">
                   {lastResult.outcome}
                 </h2>
               </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-8 md:gap-32 w-full max-w-4xl justify-center items-start px-4">
            
            {/* PLAYER HAND */}
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-[hsl(var(--player-blue))] font-serif text-xl md:text-2xl font-bold tracking-widest uppercase mb-4">閒家</h3>
              <div className="flex -space-x-12 md:-space-x-16 min-h-[144px] md:min-h-[192px]">
                 {gameState.currentRound?.status === 'payout' || lastResult ? (
                    lastResult?.player.cards.map((card, i) => (
                      <PlayingCard key={`p-${i}`} card={card} index={i} className="shadow-[-10px_0_20px_rgba(0,0,0,0.5)]" />
                    ))
                 ) : (
                    <>
                      {/* Empty placeholders or card backs */}
                      <PlayingCard hidden className="opacity-20" />
                      <PlayingCard hidden className="opacity-20 translate-x-4" />
                    </>
                 )}
              </div>
              <div className="h-8">
                 {lastResult && (
                   <div className="bg-[hsl(var(--player-blue))] text-white px-3 py-0.5 rounded-full text-lg font-bold shadow-lg">
                     {lastResult.player.score}
                   </div>
                 )}
              </div>
            </div>

            {/* BANKER HAND */}
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-[hsl(var(--banker-red))] font-serif text-xl md:text-2xl font-bold tracking-widest uppercase mb-4">莊家</h3>
              <div className="flex -space-x-12 md:-space-x-16 min-h-[144px] md:min-h-[192px]">
                 {gameState.currentRound?.status === 'payout' || lastResult ? (
                    lastResult?.banker.cards.map((card, i) => (
                      <PlayingCard key={`b-${i}`} card={card} index={i} className="shadow-[-10px_0_20px_rgba(0,0,0,0.5)]" />
                    ))
                 ) : (
                    <>
                      <PlayingCard hidden className="opacity-20" />
                      <PlayingCard hidden className="opacity-20 translate-x-4" />
                    </>
                 )}
              </div>
              <div className="h-8">
                {lastResult && (
                   <div className="bg-[hsl(var(--banker-red))] text-white px-3 py-0.5 rounded-full text-lg font-bold shadow-lg">
                     {lastResult.banker.score}
                   </div>
                 )}
              </div>
            </div>

          </div>
        </div>

        {/* Betting Interface */}
        <div className="bg-gradient-to-b from-transparent to-black/80 pb-6">
          <div className="max-w-6xl mx-auto px-4 w-full">
            
            {/* Betting Spots Grid */}
            <div className="grid grid-cols-6 grid-rows-2 gap-3 mb-6 h-48 md:h-64">
              
              {/* Layout Logic: 
                 Row 1: Player Pair (Left), TIE (Center), Banker Pair (Right)
                 Row 2: PLAYER (Left Large), BANKER (Right Large) 
              */}
              
              <BettingSpot 
                type="player_pair" label="閒對" payout="11:1" 
                amount={bets.player_pair} onBet={handlePlaceBet}
                className="col-span-2 row-span-1 border-r-0 rounded-br-none"
                color="player"
                winner={lastResult?.player.isPair}
              />
              
              <BettingSpot 
                type="tie" label="和局" payout="8:1" 
                amount={bets.tie} onBet={handlePlaceBet}
                className="col-span-2 row-span-1 rounded-b-none"
                color="tie"
                winner={lastResult?.winner === 'tie'}
              />
              
              <BettingSpot 
                type="banker_pair" label="莊對" payout="11:1" 
                amount={bets.banker_pair} onBet={handlePlaceBet}
                className="col-span-2 row-span-1 border-l-0 rounded-bl-none"
                color="banker"
                winner={lastResult?.banker.isPair}
              />

              <BettingSpot 
                type="player" label="閒家" payout="1:1" 
                amount={bets.player} onBet={handlePlaceBet}
                className="col-span-3 row-span-1 rounded-tr-none rounded-t-none"
                color="player"
                winner={lastResult?.winner === 'player'}
              />
              
              <BettingSpot 
                type="banker" label="莊家" payout="0.95:1" 
                amount={bets.banker} onBet={handlePlaceBet}
                className="col-span-3 row-span-1 rounded-tl-none rounded-t-none"
                color="banker"
                winner={lastResult?.winner === 'banker'}
              />
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
              
              {/* Chip Selector */}
              <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto justify-center">
                {CHIP_VALUES.map(val => (
                  <Chip 
                    key={val} 
                    value={val} 
                    selected={selectedChip === val}
                    onClick={() => setSelectedChip(val)}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-center">
                <Button 
                  variant="ghost" 
                  onClick={clearBets}
                  disabled={totalBet === 0 || dealMutation.isPending}
                  className="text-white hover:bg-white/10 hover:text-red-400 gap-2"
                >
                  <Trash2 className="w-4 h-4" /> 清空
                </Button>

                {previousBets && (
                  <Button 
                    variant="ghost" 
                    onClick={rebet}
                    disabled={totalBet > 0 || dealMutation.isPending}
                    className="text-white hover:bg-white/10 gap-2"
                  >
                    <Repeat className="w-4 h-4" /> 重複下注
                  </Button>
                )}
                
                <Button 
                  size="lg"
                  onClick={handleDeal}
                  disabled={totalBet === 0 || dealMutation.isPending}
                  className={cn(
                    "min-w-[140px] font-serif text-lg tracking-wider font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all",
                    dealMutation.isPending 
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-b from-[hsl(var(--casino-gold-light))] to-[hsl(var(--casino-gold))] text-black hover:scale-105 active:scale-95 border border-yellow-200"
                  )}
                >
                  {dealMutation.isPending ? "發牌中..." : "發牌"}
                </Button>
              </div>

            </div>

          </div>
        </div>

      </main>

      {/* --- FOOTER / ROADMAP --- */}
      <footer className="z-10 bg-black">
        <Roadmap roadmaps={gameState.roadmaps} />
      </footer>
    </div>
  );
}
