"use client";

import React from "react";
import { m, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isBefore, startOfMonth, isSameMonth, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDay } from "@/components/booking/CalendarDay";

type BookingCalendarStepProps = {
 scheduleNow: boolean;
 stepNumber: number;
 currentMonth: Date;
 calendarDays: Date[];
 monthStart: Date;
 selectedDate: Date | null;
 safeColor: string;
 t: (key: string) => string;
 onPrevMonth: () => void;
 onNextMonth: () => void;
 onDateSelect: (date: Date) => void;
};

export function BookingCalendarStep({
 scheduleNow,
 stepNumber,
 currentMonth,
 calendarDays,
 monthStart,
 selectedDate,
 safeColor,
 t,
 onPrevMonth,
 onNextMonth,
 onDateSelect,
}: BookingCalendarStepProps) {
 // We use suppressHydrationWarning on the button instead of a mount effect to avoid extra renders

 return (
 <AnimatePresence>
 {scheduleNow && (
 <m.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
 <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 mt-8">
 <div className="w-10 h-10 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
 <span className="font-bold text-sm">{stepNumber}</span>
 </div>
 <div>
 <h2 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white">{t('step_date')}</h2>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">DEFINA EL DÍA DE ATENCIÓN CLÍNICA.</p>
 </div>
 </div>

 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 md:p-12 ml-0 md:ml-16">
 <div className="flex items-center justify-between mb-10">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
 <CalendarIcon className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
 {format(currentMonth, "MMMM yyyy", { locale: es })}
 </h3>
 </div>
 <div className="flex gap-0 border border-gray-300 dark:border-gray-700">
 <button 
 type="button" 
 onClick={onPrevMonth} 
 disabled={isBefore(currentMonth, startOfMonth(new Date()))} 
 suppressHydrationWarning
 className="w-12 h-12 flex items-center justify-center bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-[#111] disabled:opacity-30 border-r border-gray-300 dark:border-gray-700 transition-colors"
 >
 <ChevronLeft className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
 </button>
 <button type="button" onClick={onNextMonth} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
 <ChevronRight className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
 </button>
 </div>
 </div>
 <div className="grid grid-cols-7 mb-4">
 {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">{d}</div>)}
 </div>
 <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-200 dark:border-gray-800">
 {calendarDays.map((date) => (
 <div key={date.toISOString()} className="border-b border-r border-gray-200 dark:border-gray-800 p-1">
 <CalendarDay 
 date={date} 
 isCurrentMonth={isSameMonth(date, monthStart)} 
 isPast={isBefore(date, startOfDay(new Date()))} 
 selectedDate={selectedDate} 
 providerColor={safeColor} 
 onSelect={onDateSelect} 
 />
 </div>
 ))}
 </div>
 </div>
 </m.section>
 )}
 </AnimatePresence>
 );
}
