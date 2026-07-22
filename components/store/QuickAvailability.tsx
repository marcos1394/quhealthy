"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { scheduleService } from '@/services/schedule.service';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface QuickAvailabilityProps {
  providerId: number;
}

export const QuickAvailability: React.FC<QuickAvailabilityProps> = ({ providerId }) => {
  const [nextSlots, setNextSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        const tomorrow = addDays(today, 1);
        
        // Asumiendo que 30 min es la duración estándar para mostrar disponibilidad rápida
        const slotsToday = await scheduleService.getAvailableSlots(
          providerId, 
          undefined, // Sin locationId específico por ahora en el storefront global
          format(today, 'yyyy-MM-dd'),
          format(tomorrow, 'yyyy-MM-dd'),
          30
        );

        // Tomamos los primeros 3 slots
        setNextSlots(slotsToday.slice(0, 3));
      } catch (error) {
        console.error("Error fetching quick availability", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [providerId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 mt-6 p-4 border border-gray-200 dark:border-gray-800 animate-pulse bg-gray-50 dark:bg-[#050505]">
        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 w-32" />
      </div>
    );
  }

  if (nextSlots.length === 0) {
    return (
      <div className="flex items-center justify-between mt-6 p-4 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
            Agenda sujeta a confirmación
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 border border-black dark:border-white bg-white dark:bg-black group hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Próximos turnos disponibles
          </span>
        </div>
        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {nextSlots.map((slot, i) => {
          let dateObj: Date;
          let time = "";
          let isToday = false;

          try {
            if (Array.isArray(slot)) {
              dateObj = new Date(slot[0], slot[1] - 1, slot[2], slot[3] || 0, slot[4] || 0);
            } else if (typeof slot === 'string' && slot.includes(':') && !slot.includes('T')) {
              // Si solo viene la hora "14:00"
              const [h, m] = slot.split(':');
              dateObj = new Date();
              dateObj.setHours(parseInt(h), parseInt(m), 0, 0);
            } else {
              dateObj = new Date(slot);
            }

            if (isNaN(dateObj.getTime())) throw new Error("Invalid");

            time = format(dateObj, 'HH:mm');
            isToday = format(dateObj, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          } catch {
            return null;
          }
          
          return (
            <div key={i} className="px-3 py-1.5 border border-black dark:border-white text-[11px] font-bold tracking-widest group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white transition-colors">
              {isToday ? 'Hoy' : 'Mñn'} {time}
            </div>
          );
        })}
      </div>
    </div>
  );
};
