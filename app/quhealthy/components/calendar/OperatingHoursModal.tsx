/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'react-toastify';
import { OperatingHour } from '@/app/quhealthy/types/calendar'; // <-- Importamos el tipo centralizado

const daysOfWeek = [
  { id: 1, name: 'Lunes' }, { id: 2, name: 'Martes' }, { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' }, { id: 5, name: 'Viernes' }, { id: 6, name: 'Sábado' }, { id: 0, name: 'Domingo' }
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

export const OperatingHoursModal: React.FC<OperatingHoursModalProps> = ({ isOpen, onClose, initialHours, onSaveSuccess }) => {
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cuando el modal se abre, inicializamos el estado con los horarios existentes
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center"><Clock className="mr-3 text-purple-400"/>Definir Horarios de Atención</h2>
              <Button variant="ghost" size="default" onClick={onClose}><X className="text-gray-400"/></Button>
            </div>
          </div>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {schedules.map(day => (
              <div key={day.dayOfWeek} className="grid grid-cols-3 items-center gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`day-${day.dayOfWeek}`}
                    checked={day.isActive}
                    onChange={(e) => handleScheduleChange(day.dayOfWeek, 'isActive', e.target.checked)}
                    className="w-5 h-5 rounded text-purple-500 bg-gray-700 border-gray-600 focus:ring-purple-600"
                  />
                  <label htmlFor={`day-${day.dayOfWeek}`} className="ml-3 text-white font-medium">{daysOfWeek.find(d => d.id === day.dayOfWeek)?.name}</label>
                </div>
                <div className={`col-span-2 grid grid-cols-2 gap-2 transition-opacity ${!day.isActive && 'opacity-40 pointer-events-none'}`}>
                  <input type="time" value={day.openTime} onChange={e => handleScheduleChange(day.dayOfWeek, 'openTime', e.target.value)} disabled={!day.isActive} className="bg-gray-700 p-2 rounded-lg border border-gray-600"/>
                  <input type="time" value={day.closeTime} onChange={e => handleScheduleChange(day.dayOfWeek, 'closeTime', e.target.value)} disabled={!day.isActive} className="bg-gray-700 p-2 rounded-lg border border-gray-600"/>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 flex justify-end gap-3 border-t border-gray-700">
            <Button variant="outline" onClick={onClose} className="border-gray-600 hover:bg-gray-700">Cancelar</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? <Loader2 className="animate-spin" /> : 'Guardar Horarios'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};