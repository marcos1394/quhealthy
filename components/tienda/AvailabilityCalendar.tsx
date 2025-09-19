"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Tipos de datos (pueden venir de un archivo central)
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

  const availableDays = Object.keys(slotsByDay).map(dayStr => new Date(dayStr));
  const selectedDaySlots = selectedDay ? slotsByDay[format(selectedDay, 'yyyy-MM-dd')] || [] : [];

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl blur-xl"></div>
      
      <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 backdrop-blur-2xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-gray-700/50">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/20">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Reserva tu Cita
            </h3>
          </div>
          <p className="text-gray-400">
            Selecciona el día y horario que mejor se adapte a ti.
          </p>
        </div>

        <div className="p-6">
  <div className="flex flex-col md:flex-row gap-8">
    
    {/* Contenedor del Calendario */}
    <div className="w-full md:w-auto flex justify-center">
      <DayPicker
        mode="single"
        selected={selectedDay}
        onSelect={setSelectedDay}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        locale={es}
        modifiers={{ available: availableDays }}
        disabled={{ before: new Date() }}
        showOutsideDays
        
        // --- INICIO DE LA CORRECCIÓN DE ESTILOS ---
        classNames={{
          root: 'bg-gray-800/50 p-4 rounded-xl border border-gray-700 w-full',
          months: 'flex flex-col sm:flex-row',
          month: 'space-y-4',
          caption: 'flex justify-between items-center mb-4 px-1', // Corregido para alinear botones
          caption_label: 'text-lg font-bold text-white',
          nav: 'space-x-1 flex items-center',
          nav_button: 'h-8 w-8 bg-gray-700/50 hover:bg-purple-500/20 p-1 rounded-lg transition-colors',
          table: 'w-full border-collapse',
          head_row: 'flex justify-around mb-2',
          head_cell: 'text-gray-400 rounded-md w-10 font-normal text-sm',
          row: 'flex w-full mt-2 justify-around',
          cell: 'p-0',
          day: 'h-10 w-10 p-0 font-normal rounded-md transition-colors hover:bg-purple-500/20',
          day_selected: 'bg-purple-600 text-white hover:bg-purple-700',
          day_today: 'bg-purple-500/20 text-purple-300 font-bold',
          day_disabled: 'text-gray-600 opacity-50',
          day_outside: 'text-gray-600 opacity-50',
        }}
        // --- FIN DE LA CORRECCIÓN DE ESTILOS ---
      />
    </div>
    
    {/* Contenedor de los Horarios (Time Slots) */}
    <div className="flex-1 min-h-[300px] border-t-2 md:border-t-0 md:border-l-2 border-gray-700/50 pt-6 md:pt-0 md:pl-8">
      <div className="mb-4">
        {selectedDay ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h4 className="font-bold text-lg text-white">
              {format(selectedDay, "eeee, d 'de' MMMM", { locale: es })}
            </h4>
            <p className="text-gray-400 text-sm">
              {isLoading ? 'Cargando...' : `${selectedDaySlots.length} ${selectedDaySlots.length === 1 ? 'horario disponible' : 'horarios disponibles'}`}
            </p>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h4 className="font-semibold text-white">Selecciona un día</h4>
            <p className="text-gray-400 text-sm">Elige una fecha disponible para ver los horarios.</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-400"/></div>
      ) : selectedDay && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto"
        >
          {selectedDaySlots.length > 0 ? selectedDaySlots.map((slot, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Button 
                variant="outline" 
                className="group w-full h-12 border-gray-600/50 bg-gray-700/30 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:border-transparent text-gray-300 hover:text-white"
                onClick={() => onSlotSelect(slot)}
              >
                {format(slot, 'HH:mm')}
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </motion.div>
          )) : (
            <p className="text-gray-500 col-span-3 text-center py-4">No hay horarios disponibles este día.</p>
          )}
        </motion.div>
      )}
    </div>
  </div>
</div>
        
        <div className="p-6 border-t border-gray-700/50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-green-300 font-medium text-sm">Reserva Instantánea</p>
              <p className="text-gray-400 text-xs">Tu cita se confirmará inmediatamente al seleccionar un horario.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};