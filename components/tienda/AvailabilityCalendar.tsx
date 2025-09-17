"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import axios from 'axios';
import {  Calendar, Clock, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
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
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl blur-xl"></div>
      
      <div className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-2xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/20">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Reserva tu Cita
            </h3>
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <p className="text-slate-400">
            Selecciona el día y horario que mejor se adapte a ti
          </p>
        </div>

        <div className="p-8">
          <style jsx global>{`
            .rdp {
              --rdp-cell-size: 48px;
              --rdp-accent-color: rgb(147, 51, 234);
              --rdp-background-color: rgba(147, 51, 234, 0.1);
              margin: 0;
            }
            
            .rdp-months {
              display: flex;
              justify-content: center;
            }
            
            .rdp-month {
              margin: 0;
            }
            
            .rdp-caption {
              display: flex;
              align-items: center;
              justify-content: between;
              padding: 0 0 1.5rem 0;
              text-align: center;
            }
            
            .rdp-caption_label {
              font-size: 1.25rem;
              font-weight: 700;
              color: white;
              margin: 0 auto;
            }
            
            .rdp-nav {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .rdp-nav_button {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 2.5rem;
              height: 2.5rem;
              border-radius: 0.75rem;
              border: 1px solid rgba(100, 116, 139, 0.3);
              background: rgba(51, 65, 85, 0.5);
              color: rgb(148, 163, 184);
              transition: all 0.2s ease;
            }
            
            .rdp-nav_button:hover:not([disabled]) {
              background: rgba(147, 51, 234, 0.2);
              border-color: rgba(147, 51, 234, 0.5);
              color: white;
            }
            
            .rdp-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 4px;
            }
            
            .rdp-head_row {
              height: auto;
            }
            
            .rdp-head_cell {
              font-weight: 600;
              font-size: 0.875rem;
              color: rgb(148, 163, 184);
              text-align: center;
              padding: 0.75rem 0;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .rdp-tbody .rdp-row {
              height: auto;
            }
            
            .rdp-cell {
              text-align: center;
              position: relative;
            }
            
            .rdp-button {
              display: flex;
              align-items: center;
              justify-content: center;
              width: var(--rdp-cell-size);
              height: var(--rdp-cell-size);
              border-radius: 12px;
              border: 1px solid rgba(100, 116, 139, 0.2);
              background: rgba(30, 41, 59, 0.5);
              color: rgb(148, 163, 184);
              font-weight: 500;
              transition: all 0.3s ease;
              cursor: pointer;
            }
            
            .rdp-button:hover:not([disabled]) {
              background: rgba(147, 51, 234, 0.2);
              border-color: rgba(147, 51, 234, 0.5);
              color: white;
              transform: scale(1.05);
            }
            
            .rdp-button[disabled] {
              background: rgba(15, 23, 42, 0.5);
              color: rgb(71, 85, 105);
              cursor: not-allowed;
              opacity: 0.5;
            }
            
            .rdp-day_today .rdp-button {
              background: rgba(147, 51, 234, 0.2);
              border-color: rgba(147, 51, 234, 0.5);
              color: rgb(196, 181, 253);
              font-weight: 700;
            }
            
            .rdp-day_selected .rdp-button {
              background: linear-gradient(135deg, rgb(147, 51, 234), rgb(59, 130, 246));
              border-color: transparent;
              color: white;
              box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
            }
            
            .rdp-day_available .rdp-button {
              border-color: rgba(34, 197, 94, 0.4);
              background: rgba(34, 197, 94, 0.1);
              position: relative;
            }
            
            .rdp-day_available .rdp-button::after {
              content: '';
              position: absolute;
              top: 2px;
              right: 2px;
              width: 6px;
              height: 6px;
              background: rgb(34, 197, 94);
              border-radius: 50%;
            }
            
            .rdp-day_outside {
              opacity: 0.3;
            }
          `}</style>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Calendar */}
            <div className="flex-1 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <DayPicker
                  mode="single"
                  selected={selectedDay}
                  onSelect={setSelectedDay}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  locale={es}
                  modifiers={{ 
                    available: availableDays,
                    today: new Date()
                  }}
                  disabled={{ before: new Date() }}
                  className="text-white"
                  showOutsideDays={false}
                />
              </motion.div>
            </div>
            
            {/* Time Slots */}
            <div className="flex-1 min-h-[300px]">
              <div className="border-t-2 lg:border-t-0 lg:border-l-2 border-slate-700/50 pt-6 lg:pt-0 lg:pl-8">
                {/* Selected day header */}
                <div className="mb-6">
                  {selectedDay ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h4 className="font-bold text-lg text-white mb-2">
                        {format(selectedDay, 'eeee, d \'de\' MMMM', { locale: es })}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {selectedDaySlots.length} {selectedDaySlots.length === 1 ? 'horario disponible' : 'horarios disponibles'}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-white mb-2">Selecciona un día</h4>
                      <p className="text-slate-400 text-sm">
                        Elige una fecha disponible para ver los horarios
                      </p>
                    </div>
                  )}
                </div>

                {/* Time slots grid */}
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-3 border-purple-200/20 border-t-purple-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
                    </div>
                    <p className="text-slate-400 text-sm">Cargando horarios...</p>
                  </div>
                ) : selectedDay && selectedDaySlots.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto custom-scrollbar"
                  >
                    {selectedDaySlots.map((slot, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="group w-full h-12 border-slate-600/50 bg-slate-700/30 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:border-transparent text-slate-300 hover:text-white transition-all duration-300 font-medium rounded-xl shadow-sm hover:shadow-lg hover:shadow-purple-500/25"
                          onClick={() => onSlotSelect(slot)}
                        >
                          <Clock className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                          {format(slot, 'HH:mm')}
                          <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : selectedDay && selectedDaySlots.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-700/30 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-slate-400 text-sm">No hay horarios disponibles este día</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Footer tip */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <CheckCircle className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-blue-300 font-medium text-sm">Reserva Instantánea</p>
                <p className="text-slate-400 text-xs">Tu cita se confirmará inmediatamente al seleccionar un horario</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
};