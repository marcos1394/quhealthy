import { format, isToday, isSameDay } from "date-fns";
import { motion } from "framer-motion";

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isPast: boolean;
  selectedDate: Date | null;
  providerColor: string;
  onSelect: (date: Date) => void;
}

export function CalendarDay({ 
  date, 
  isCurrentMonth, 
  isPast, 
  selectedDate, 
  providerColor, 
  onSelect 
}: CalendarDayProps) {
  const selected = selectedDate ? isSameDay(date, selectedDate) : false;
  const today = isToday(date);

  return (
    <motion.button
      onClick={() => onSelect(date)}
      disabled={isPast || !isCurrentMonth}
      whileHover={!isPast && isCurrentMonth ? { scale: 1.05 } : {}}
      whileTap={!isPast && isCurrentMonth ? { scale: 0.95 } : {}}
      className={`
        relative flex flex-col items-center justify-center h-16 rounded-2xl transition-all duration-300 border-2
        ${!isCurrentMonth || isPast ? 'opacity-20 cursor-not-allowed border-transparent' : 'hover:border-gray-700 cursor-pointer border-transparent'}
        ${selected ? 'shadow-2xl scale-105 z-10' : 'bg-gray-900/50 hover:bg-gray-800/50'}
      `}
      style={selected ? { 
        backgroundColor: providerColor, 
        borderColor: providerColor,
        boxShadow: `0 10px 40px -10px ${providerColor}80`
      } : {}}
    >
      {/* Indicador de "Hoy" */}
      {today && !selected && (
        <span 
          className="absolute top-2 w-2 h-2 rounded-full animate-pulse" 
          style={{ backgroundColor: providerColor }} 
        />
      )}
      
      <span className={`text-lg font-black ${
        selected 
          ? 'text-white' 
          : isCurrentMonth && !isPast 
          ? 'text-gray-300' 
          : 'text-gray-700'
      }`}>
        {format(date, 'd')}
      </span>
    </motion.button>
  );
}