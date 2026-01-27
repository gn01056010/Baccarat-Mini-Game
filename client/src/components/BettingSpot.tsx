import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Chip } from "./Chip";
import { type BetType } from "@shared/schema";

interface BettingSpotProps {
  type: BetType;
  label: string;
  payout: string;
  amount: number;
  onBet: (type: BetType) => void;
  className?: string;
  color?: "player" | "banker" | "tie" | "neutral";
  winner?: boolean;
}

export function BettingSpot({ 
  type, 
  label, 
  payout, 
  amount, 
  onBet, 
  className,
  color = "neutral",
  winner
}: BettingSpotProps) {
  
  const baseStyles = "relative flex flex-col items-center justify-center border-2 rounded-xl transition-colors duration-300 cursor-pointer overflow-hidden backdrop-blur-sm group";
  
  const colorStyles = {
    player: "border-blue-400/30 hover:bg-blue-900/20 bg-blue-900/5",
    banker: "border-red-400/30 hover:bg-red-900/20 bg-red-900/5",
    tie: "border-green-400/30 hover:bg-green-900/20 bg-green-900/5",
    neutral: "border-yellow-400/30 hover:bg-yellow-900/20 bg-yellow-900/5",
  };

  const activeColor = winner 
    ? "bg-yellow-500/20 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-pulse" 
    : colorStyles[color];

  return (
    <div 
      onClick={() => onBet(type)}
      className={cn(baseStyles, activeColor, className)}
    >
      {/* Label Content */}
      <div className="z-10 text-center pointer-events-none">
        <h3 className="text-sm md:text-lg font-bold font-serif uppercase tracking-widest text-white/90 group-hover:text-white group-hover:scale-105 transition-transform">
          {label}
        </h3>
        <span className="text-xs md:text-sm font-medium text-white/50">{payout}</span>
      </div>

      {/* Chips Stack (Simplified Visual) */}
      <AnimatePresence>
        {amount > 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute z-20"
          >
             <div className="relative">
               <Chip value={amount} className="w-12 h-12 md:w-14 md:h-14 text-xs pointer-events-none shadow-xl" />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
