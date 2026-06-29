import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CalendarX2, Package } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";

import { CalendarDay } from "@/components/booking/CalendarDay";
import { TimeSlot } from "@/components/booking/TimeSlot";
import { useAvailability } from "@/hooks/useAvailability";
import { StorefrontItem } from "@/types/storefront";

interface PackageServiceSchedulerItemProps {
  service: StorefrontItem;
  providerId: number;
  providerColor: string;
  onSchedule: (serviceId: number, date: Date | null, time: string | null) => void;
  index: number;
  scheduledPackageServices: Record<number, { date: Date, time: string }>;
}

const PackageServiceSchedulerItem = ({ service, providerId, providerColor, onSchedule, index, scheduledPackageServices }: PackageServiceSchedulerItemProps) => {
  const [saveAsCredit, setSaveAsCredit] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { availableSlots, isLoadingSlots, fetchAvailableSlots } = useAvailability();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return;
    setSelectedDate(date);
    setSelectedTime(null);
    if (providerId) {
      fetchAvailableSlots(providerId, undefined, date, service.durationMinutes || 30);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      onSchedule(service.id, selectedDate, time);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const isTimeDisabled = (time: string) => {
    if (!selectedDate) return false;
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    
    for (const [idStr, slot] of Object.entries(scheduledPackageServices)) {
      if (Number(idStr) !== service.id && slot.date && slot.time === time) {
        if (format(new Date(slot.date), "yyyy-MM-dd") === selectedDateStr) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <div className="mb-12 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
      {/* Header del Servicio */}
      <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
            SESIÓN {index + 1}
          </span>
          <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
            {service.name}
          </h3>
          <span className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={1.5} /> {service.durationMinutes || 30} MIN
          </span>
        </div>
        
        <div className="flex bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-1">
          <button
            onClick={() => {
              setSaveAsCredit(false);
            }}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              !saveAsCredit 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
            style={!saveAsCredit ? { backgroundColor: providerColor, color: '#ffffff' } : {}}
          >
            Agendar Ahora
          </button>
          <button
            onClick={() => {
              setSaveAsCredit(true);
              onSchedule(service.id, null, null); // Clear from parent
            }}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              saveAsCredit 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            Guardar para después
          </button>
        </div>
      </div>

      {saveAsCredit ? (
        <div className="p-8 md:p-12 text-center bg-gray-50 dark:bg-[#050505] flex flex-col items-center">
          <div className="w-12 h-12 border border-black dark:border-white bg-white dark:bg-[#111] flex items-center justify-center mb-4">
            <Package className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
            SESIÓN GUARDADA COMO CRÉDITO
          </h4>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 max-w-md mx-auto leading-relaxed">
            Esta sesión se agregará a tu cuenta tras el pago. Podrás agendarla cuando lo desees desde tu panel de paciente.
          </p>
        </div>
      ) : (
        <div className="p-6 md:p-8 flex flex-col xl:flex-row gap-8">
        {/* Calendario */}
        <div className="flex-1 xl:max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </h4>
            </div>
            <div className="flex gap-0 border border-gray-300 dark:border-gray-700">
              <button onClick={prevMonth} disabled={isBefore(currentMonth, startOfMonth(new Date()))} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-[#111] disabled:opacity-30 border-r border-gray-300 dark:border-gray-700 transition-colors">
                <ChevronLeft className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
              </button>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                <ChevronRight className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d} className="text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-200 dark:border-gray-800">
            {calendarDays.map((date, i) => (
              <div key={i} className="border-b border-r border-gray-200 dark:border-gray-800 p-1">
                 <CalendarDay date={date} isCurrentMonth={isSameMonth(date, monthStart)} isPast={isBefore(date, startOfDay(new Date()))} selectedDate={selectedDate} providerColor={providerColor} onSelect={handleDateSelect} />
              </div>
            ))}
          </div>
        </div>

        {/* Horarios */}
        <div className="flex-1 xl:border-l xl:border-gray-200 xl:dark:border-gray-800 xl:pl-8">
          <h4 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white mb-6">
            {selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: es }) : "Seleccione una fecha"}
          </h4>

          {selectedDate ? (
            isLoadingSlots ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-0 border-t border-l border-gray-200 dark:border-gray-800">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-10 border-b border-r border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse" />)}
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-3 gap-3">
                {availableSlots.map((time) => (
                  <TimeSlot 
                    key={time} 
                    time={time} 
                    isSelected={selectedTime === time} 
                    isDisabled={isTimeDisabled(time)}
                    providerColor={providerColor} 
                    onSelect={handleTimeSelect} 
                  />
                ))}
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center text-center border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a]">
                <div className="w-10 h-10 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-4">
                  <CalendarX2 className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white mb-1">Sin horarios</p>
                <p className="text-[10px] text-gray-500 font-light">Pruebe otro día</p>
              </div>
            )
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-10 xl:py-0">
               <CalendarIcon className="w-8 h-8 text-gray-400 mb-4" strokeWidth={1.5} />
               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                 SELECCIONE UN DÍA PARA VER HORARIOS
               </p>
             </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

interface PackageMultiSchedulerProps {
  cart: StorefrontItem[];
  providerId: number;
  providerColor: string;
  onSchedulePackageService: (serviceId: number, date: Date | null, time: string | null) => void;
  stepCounterStart: number;
  scheduledPackageServices: Record<number, { date: Date, time: string }>;
}

export function PackageMultiScheduler({ cart, providerId, providerColor, onSchedulePackageService, stepCounterStart, scheduledPackageServices }: PackageMultiSchedulerProps) {
  // Extraemos todos los servicios que vienen dentro de los paquetes del carrito
  const packageServices = cart
    .filter(item => item.type === 'PACKAGE')
    .flatMap(pkg => (pkg.packageContents || []).filter(sub => sub.type === 'SERVICE'));

  if (packageServices.length === 0) return null;

  return (
    <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 mt-8">
        <div 
          className="w-10 h-10 border border-black dark:border-white flex items-center justify-center shrink-0 transition-colors"
          style={{ backgroundColor: providerColor, color: '#ffffff' }}
        >
          <span className="font-bold text-sm">{stepCounterStart}</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white">
            AGENDAR CONTENIDO DEL PAQUETE
          </h2>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">
            SELECCIONE LA FECHA Y HORA PARA CADA UNA DE LAS SESIONES INCLUIDAS.
          </p>
        </div>
      </div>

      <div className="ml-0 md:ml-16">
        {packageServices.map((service, index) => (
          <PackageServiceSchedulerItem 
            key={`${service.id}-${index}`}
            index={index}
            service={service}
            providerId={providerId}
            providerColor={providerColor}
            onSchedule={onSchedulePackageService}
            scheduledPackageServices={scheduledPackageServices}
          />
        ))}
      </div>
    </motion.section>
  );
}
