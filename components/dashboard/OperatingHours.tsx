"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Loader2, CheckCircle, Settings, CalendarDays } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- TIPOS ---
export interface OperatingHour {
  day_of_week: number;
  open_time: string;
  close_time: string;
}

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

const daysOfWeek = [
  { id: 1, name: 'Lunes', short: 'Lun' }, 
  { id: 2, name: 'Martes', short: 'Mar' }, 
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' }, 
  { id: 5, name: 'Viernes', short: 'Vie' }, 
  { id: 6, name: 'Sábado', short: 'Sáb' }, 
  { id: 0, name: 'Domingo', short: 'Dom' }
];

export const OperatingHoursModal: React.FC<OperatingHoursModalProps> = ({ 
  isOpen, 
  onClose, 
  initialHours, 
  onSaveSuccess 
}) => {
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);

  // Inicializar estado al abrir
  useEffect(() => {
    if (isOpen) {
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
    }
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
      
      // Simulación o llamada real
      await axios.post('/api/calendar/operating-hours', activeHours, { withCredentials: true });
      
      toast.success("Horarios actualizados correctamente.");
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar horarios.");
    } finally {
      setLoading(false);
    }
  };

  const activeSchedulesCount = schedules.filter(s => s.isActive).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-2xl p-0 overflow-hidden gap-0">
        
        {/* Header Decorativo */}
        <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
                        <Clock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-bold text-white tracking-tight">Configuración de Horarios</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Define tu disponibilidad semanal para recibir citas.
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            {/* Mini Stats en Header */}
            <div className="flex items-center gap-6 mt-4 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-emerald-500" />
                    <span className="text-gray-300">{activeSchedulesCount} días activos</span>
                </div>
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-300">Zona Horaria: Auto</span>
                </div>
            </div>
        </div>

        {/* Lista Scrollable */}
        <ScrollArea className="h-[400px] p-6 bg-gray-950/50">
            <div className="space-y-4">
                {schedules.map((day) => {
                    const dayInfo = daysOfWeek.find(d => d.id === day.dayOfWeek);
                    return (
                        <div 
                            key={day.dayOfWeek}
                            className={`
                                flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all duration-200
                                ${day.isActive 
                                    ? 'bg-gray-900 border-purple-500/30 shadow-sm' 
                                    : 'bg-gray-900/30 border-gray-800 opacity-60 hover:opacity-80'
                                }
                            `}
                        >
                            {/* Toggle y Nombre */}
                            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                <Switch 
                                    checked={day.isActive}
                                    onCheckedChange={(checked) => handleScheduleChange(day.dayOfWeek, 'isActive', checked)}
                                    className="data-[state=checked]:bg-purple-600"
                                />
                                <div>
                                    <p className={`font-semibold ${day.isActive ? 'text-white' : 'text-gray-500'}`}>
                                        {dayInfo?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {day.isActive ? 'Abierto' : 'Cerrado'}
                                    </p>
                                </div>
                            </div>

                            {/* Inputs de Tiempo */}
                            <div className={`flex items-center gap-3 transition-opacity ${day.isActive ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wider">Apertura</span>
                                    <div className="relative">
                                        <Input 
                                            type="time" 
                                            value={day.openTime}
                                            onChange={(e) => handleScheduleChange(day.dayOfWeek, 'openTime', e.target.value)}
                                            className="w-28 bg-gray-950 border-gray-700 h-9 text-sm focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                                <span className="text-gray-600 mt-4">-</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wider">Cierre</span>
                                    <div className="relative">
                                        <Input 
                                            type="time" 
                                            value={day.closeTime}
                                            onChange={(e) => handleScheduleChange(day.dayOfWeek, 'closeTime', e.target.value)}
                                            className="w-28 bg-gray-950 border-gray-700 h-9 text-sm focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-6 bg-gray-900 border-t border-gray-800 gap-3">
            <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                Cancelar
            </Button>
            <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                    </>
                ) : (
                    <>
                        <CheckCircle className="mr-2 h-4 w-4" /> Guardar Cambios
                    </>
                )}
            </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};