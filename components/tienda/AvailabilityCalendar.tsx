"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AvailabilityCalendarProps {
  providerId: number;
  onSlotSelect: (slot: Date) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ providerId, onSlotSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        
        const { data } = await axios.get(`/api/calendar/availability/${providerId}`, {
          params: { startDate, endDate }
        });

        // Convertimos las fechas ISO string a objetos Date
        const slotsAsDates = data.map((slot: string) => parseISO(slot));
        setAvailableSlots(slotsAsDates);
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [providerId, currentMonth]);

  // Agrupamos los slots por día para mostrarlos fácilmente
  const slotsByDay = useMemo(() => {
    return availableSlots.reduce((acc, slot) => {
      const day = format(slot, 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(slot);
      return acc;
    }, {} as Record<string, Date[]>);
  }, [availableSlots]);

  // Días que tienen al menos un slot disponible
  const availableDays = Object.keys(slotsByDay).map(dayStr => new Date(dayStr));
  
  const selectedDaySlots = selectedDay ? slotsByDay[format(selectedDay, 'yyyy-MM-dd')] || [] : [];

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Agenda una Cita</h3>
      <div className="flex flex-col md:flex-row gap-4">
        <DayPicker
          mode="single"
          selected={selectedDay}
          onSelect={setSelectedDay}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          locale={es}
          modifiers={{ available: availableDays }}
          modifiersStyles={{
            available: { fontWeight: 'bold', color: '#a78bfa' },
            selected: { backgroundColor: '#8b5cf6' }
          }}
          disabled={{ before: new Date() }} // No se pueden seleccionar días pasados
          className="text-white"
        />
        <div className="flex-1 border-t-2 md:border-t-0 md:border-l-2 border-gray-700/50 pt-4 md:pt-0 md:pl-4">
          <h4 className="font-semibold text-center mb-2">
            {selectedDay ? format(selectedDay, 'eeee, d \'de\' MMMM', { locale: es }) : 'Selecciona un día'}
          </h4>
          {isLoading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin"/></div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {selectedDaySlots.map((slot, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  className="border-gray-600 hover:bg-purple-500/20 hover:text-purple-300"
                  onClick={() => onSlotSelect(slot)}
                >
                  {format(slot, 'HH:mm')}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};