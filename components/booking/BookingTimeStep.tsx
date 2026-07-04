"use client";

import React from "react";
import { m, AnimatePresence } from "framer-motion";
import { Clock, CalendarX2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TimeSlot } from "@/components/booking/TimeSlot";

type BookingTimeStepProps = {
 scheduleNow: boolean;
 selectedDate: Date | null;
 stepNumber: number;
 duration: number;
 isLoadingSlots: boolean;
 availableSlots: string[];
 selectedTime: string | null;
 safeColor: string;
 t: (key: string) => string;
 onTimeSelect: (time: string) => void;
};

export function BookingTimeStep({
 scheduleNow,
 selectedDate,
 stepNumber,
 duration,
 isLoadingSlots,
 availableSlots,
 selectedTime,
 safeColor,
 t,
 onTimeSelect,
}: BookingTimeStepProps) {
 return (
 <AnimatePresence>
 {scheduleNow && selectedDate && (
 <m.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
 <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 mt-8">
 <div className="w-10 h-10 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
 <span className="font-bold text-sm">{stepNumber}</span>
 </div>
 <div className="flex-1">
 <h2 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white">{t('step_time')}</h2>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">
 {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
 </p>
 </div>
 <span className="border border-black dark:border-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black flex items-center gap-2">
 <Clock className="w-3 h-3" strokeWidth={2} /> {duration} MIN
 </span>
 </div>

 <div className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-8 md:p-12 ml-0 md:ml-16">
 {isLoadingSlots ? (
 <div className="grid grid-cols-3 sm:grid-cols-4 gap-0 border-t border-l border-gray-200 dark:border-gray-800">
 {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
 <div key={i} className="h-12 border-b border-r border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse" />
 ))}
 </div>
 ) : availableSlots.length > 0 ? (
 <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
 {availableSlots.map((time) => (
 <TimeSlot 
 key={time} 
 time={time} 
 isSelected={selectedTime === time} 
 providerColor={safeColor} 
 onSelect={(time) => onTimeSelect(time)} 
 />
 ))}
 </div>
 ) : (
 <div className="py-16 flex flex-col items-center text-center border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a]">
 <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
 <CalendarX2 className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
 </div>
 <h3 className="font-bold text-sm uppercase tracking-widest text-black dark:text-white">Sin Disponibilidad</h3>
 <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">
 EL PROVEEDOR NO TIENE BLOQUES HORARIOS DISPONIBLES EN ESTA FECHA.
 </p>
 </div>
 )}
 </div>
 </m.section>
 )}
 </AnimatePresence>
 );
}
