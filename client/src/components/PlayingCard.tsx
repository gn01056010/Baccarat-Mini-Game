import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type Card, type Suit, type Rank } from "@shared/schema";

interface PlayingCardProps {
  card?: Card;
  hidden?: boolean;
  index?: number;
  className?: string;
}

const suitIcons: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors: Record<Suit, string> = {
  hearts: "text-red-600",
  diamonds: "text-red-600",
  clubs: "text-slate-900",
  spades: "text-slate-900",
};

export function PlayingCard({ card, hidden, index = 0, className }: PlayingCardProps) {
  // If no card is provided (placeholder state)
  if (!card && !hidden) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8, rotateY: 180 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateY: 0,
        transition: { 
          delay: index * 0.2, 
          duration: 0.5,
          type: "spring",
          stiffness: 100 
        } 
      }}
      className={cn(
        "relative w-24 h-36 md:w-32 md:h-48 rounded-xl shadow-2xl border border-white/10 select-none overflow-hidden transform-gpu bg-white",
        className
      )}
    >
      {hidden ? (
        // Card Back
        <div className="absolute inset-0 bg-red-800 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] flex items-center justify-center border-4 border-white">
           <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center">
             <span className="text-white/20 font-serif text-2xl font-bold">B</span>
           </div>
        </div>
      ) : (
        // Card Front
        card && (
          <div className={cn("absolute inset-0 flex flex-col justify-between p-2 md:p-4", suitColors[card.suit])}>
            {/* Top Left */}
            <div className="flex flex-col items-center leading-none">
              <span className="text-xl md:text-3xl font-bold font-serif">{card.rank}</span>
              <span className="text-xl md:text-3xl">{suitIcons[card.suit]}</span>
            </div>

            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <span className="text-6xl md:text-8xl">{suitIcons[card.suit]}</span>
            </div>

            {/* Bottom Right (Rotated) */}
            <div className="flex flex-col items-center leading-none transform rotate-180">
              <span className="text-xl md:text-3xl font-bold font-serif">{card.rank}</span>
              <span className="text-xl md:text-3xl">{suitIcons[card.suit]}</span>
            </div>
          </div>
        )
      )}
    </motion.div>
  );
}
