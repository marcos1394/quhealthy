import { motion } from "framer-motion";
import { Clock } from "lucide-react";

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
      className={`
        h-16 rounded-2xl border-2 font-bold transition-all duration-300 flex items-center justify-center gap-2
        ${isSelected 
          ? 'text-white shadow-2xl scale-105' 
          : 'bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800/80 hover:border-gray-700'
        }
      `}
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