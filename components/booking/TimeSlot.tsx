import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlotProps {
  time: string;
  isSelected: boolean;
  providerColor: string;
  onSelect: (time: string) => void;
}

export function TimeSlot({ time, isSelected, providerColor, onSelect }: TimeSlotProps) {
  return (
    <motion.button
      onClick={() => onSelect(time)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "h-16 rounded-2xl border-2 font-bold transition-all duration-300 flex items-center justify-center gap-2",
        isSelected
          ? "text-white shadow-2xl scale-105"
          : "bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
      )}
      style={isSelected ? {
        backgroundColor: providerColor,
        borderColor: providerColor,
        boxShadow: `0 10px 30px -10px ${providerColor}80`
      } : {}}
    >
      {isSelected && <Clock className="w-4 h-4" />}
      {time}
    </motion.button>
  );
}