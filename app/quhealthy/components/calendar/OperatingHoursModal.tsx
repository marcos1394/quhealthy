/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Loader2, CheckCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'react-toastify';
import { OperatingHour } from '@/app/quhealthy/types/calendar';

const daysOfWeek = [
  { id: 1, name: 'Lunes', short: 'Lun' }, 
  { id: 2, name: 'Martes', short: 'Mar' }, 
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' }, 
  { id: 5, name: 'Viernes', short: 'Vie' }, 
  { id: 6, name: 'Sábado', short: 'Sáb' }, 
  { id: 0, name: 'Domingo', short: 'Dom' }
];

interface DaySchedule {
  dayOfWeek: number;
  isActive: boolean;
  openTime: string;
  closeTime: string;
}

interface OperatingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHours: OperatingHour[];
  onSaveSuccess: () => void;
}

export const OperatingHoursModal: React.FC<OperatingHoursModalProps> = ({ 
  isOpen, 
  onClose, 
  initialHours, 
  onSaveSuccess 
}) => {
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialData = daysOfWeek.map(day => {
      const existing = initialHours.find(h => h.day_of_week === day.id);
      return {
        dayOfWeek: day.id,
        isActive: !!existing,
        openTime: existing ? existing.open_time.slice(0, 5) : '09:00',
        closeTime: existing ? existing.close_time.slice(0, 5) : '17:00'
      };
    });
    setSchedules(initialData);
  }, [isOpen, initialHours]);

  const handleScheduleChange = (dayId: number, field: keyof DaySchedule, value: string | boolean) => {
    setSchedules(currentSchedules =>
      currentSchedules.map(day => 
        day.dayOfWeek === dayId ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const activeHours = schedules
        .filter(s => s.isActive)
        .map(({ dayOfWeek, openTime, closeTime }) => ({
          dayOfWeek, openTime, closeTime
        }));
      
      await axios.post('/api/calendar/operating-hours', activeHours, { withCredentials: true });
      
      toast.success("Horarios guardados exitosamente.");
      onSaveSuccess();
      onClose();
    } catch (error) {
      toast.error("No se pudieron guardar los horarios.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const activeSchedules = schedules.filter(s => s.isActive).length;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 rounded-3xl border border-purple-500/20 w-full max-w-2xl shadow-2xl overflow-hidden"
        >
          {/* Decorative gradient line */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>
          
          {/* Header */}
          <div className="p-8 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Configurar Horarios
                  </h2>
                  <p className="text-slate-400 mt-1">Define tu disponibilidad semanal</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-xl p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick stats */}
            <div className="mt-6 flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300">
                  {activeSchedules} días activos
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-400">Horarios de atención</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-6">
              {schedules.map((day, index) => {
                const dayInfo = daysOfWeek.find(d => d.id === day.dayOfWeek);
                return (
                  <motion.div
                    key={day.dayOfWeek}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      group relative p-6 rounded-2xl border transition-all duration-300
                      ${day.isActive 
                        ? 'bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10' 
                        : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
                      }
                    `}
                  >
                    {/* Day selector */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id={`day-${day.dayOfWeek}`}
                            checked={day.isActive}
                            onChange={(e) => handleScheduleChange(day.dayOfWeek, 'isActive', e.target.checked)}
                            className="sr-only"
                          />
                          <label
                            htmlFor={`day-${day.dayOfWeek}`}
                            className={`
                              flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer transition-all duration-300
                              ${day.isActive
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300'
                              }
                            `}
                          >
                            {day.isActive ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : (
                              <span className="text-sm font-bold">{dayInfo?.short}</span>
                            )}
                          </label>
                        </div>
                        
                        <div>
                          <h3 className={`font-semibold transition-colors ${
                            day.isActive ? 'text-white' : 'text-slate-400'
                          }`}>
                            {dayInfo?.name}
                          </h3>
                          <p className={`text-sm transition-colors ${
                            day.isActive ? 'text-purple-300' : 'text-slate-500'
                          }`}>
                            {day.isActive ? 'Día laboral activo' : 'Día inactivo'}
                          </p>
                        </div>
                      </div>

                      {/* Time inputs */}
                      <div className={`
                        flex items-center space-x-3 transition-all duration-300
                        ${day.isActive ? 'opacity-100' : 'opacity-40 pointer-events-none'}
                      `}>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Inicio</label>
                          <input
                            type="time"
                            value={day.openTime}
                            onChange={e => handleScheduleChange(day.dayOfWeek, 'openTime', e.target.value)}
                            disabled={!day.isActive}
                            className="bg-slate-700/50 text-white p-3 rounded-xl border border-slate-600/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm font-medium w-24"
                          />
                        </div>
                        
                        <div className="text-slate-400 mt-5">—</div>
                        
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Fin</label>
                          <input
                            type="time"
                            value={day.closeTime}
                            onChange={e => handleScheduleChange(day.dayOfWeek, 'closeTime', e.target.value)}
                            disabled={!day.isActive}
                            className="bg-slate-700/50 text-white p-3 rounded-xl border border-slate-600/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm font-medium w-24"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Active indicator */}
                    {day.isActive && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-700/50 bg-slate-800/30">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-400">
                {activeSchedules > 0 ? (
                  <span>✓ {activeSchedules} días configurados</span>
                ) : (
                  <span>Selecciona al menos un día</span>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="border-slate-600/50 hover:border-slate-500 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all px-6 py-3 rounded-xl"
                >
                  Cancelar
                </Button>
                
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all px-8 py-3 rounded-xl font-medium"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Guardar Horarios</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};