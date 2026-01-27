import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChipProps {
  value: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const chipColors: Record<number, string> = {
  10: "bg-red-600 border-dashed border-white",
  50: "bg-blue-600 border-dashed border-white",
  100: "bg-slate-900 border-dashed border-white",
  500: "bg-purple-700 border-dashed border-white",
  1000: "bg-[hsl(var(--casino-gold))] border-double border-black text-black",
};

export function Chip({ value, selected, onClick, className, disabled }: ChipProps) {
  return (
    <motion.button
      whileHover={{ y: disabled ? 0 : -5, scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.4)] flex items-center justify-center font-bold text-white transition-all duration-200 border-4",
        chipColors[value] || "bg-gray-500",
        selected ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-green-900 -translate-y-2" : "border-white/30",
        disabled && "opacity-50 grayscale cursor-not-allowed",
        className
      )}
    >
      <div className="absolute inset-0 rounded-full border-2 border-white/20 m-1" />
      <span className={cn("relative z-10 text-sm md:text-base font-serif drop-shadow-md", value === 1000 && "text-black")}>
        {value}
      </span>
    </motion.button>
  );
}
