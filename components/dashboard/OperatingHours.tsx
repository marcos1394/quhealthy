"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Loader2, 
  CheckCircle, 
  Settings, 
  CalendarDays,
  X,
  Copy,
  Zap,
  Info,
  AlertCircle,
  Sun,
  Moon,
  Calendar
} from 'lucide-react';
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * OperatingHoursModal Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. MINIMIZAR CARGA COGNITIVA
 *    - Templates predefinidos
 *    - "Copiar a todos" quick action
 *    - Defaults inteligentes
 *    - Agrupación visual
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Preview de horarios
 *    - Validación en tiempo real
 *    - Contador de días activos
 *    - Estados visuales claros
 * 
 * 3. AFFORDANCE
 *    - Switches claros
 *    - Disabled states visibles
 *    - Hover effects
 *    - Templates clickeables
 * 
 * 4. MINIMIZAR ERRORES
 *    - Validación de horas
 *    - Warnings visibles
 *    - Confirmación de cambios
 *    - Preview antes de guardar
 * 
 * 5. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos por día
 *    - Colores consistentes
 *    - Labels claros
 *    - Estado visible
 * 
 * 6. SATISFICING
 *    - Templates comunes
 *    - Quick copy
 *    - Bulk actions
 *    - Shortcuts visuales
 */

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

// Templates predefinidos - SATISFICING
const scheduleTemplates = [
  {
    id: 'standard',
    name: 'Lunes a Viernes',
    description: '9:00 - 18:00',
    icon: Sun,
    apply: (schedules: DaySchedule[]) => 
      schedules.map(s => ({
        ...s,
        isActive: s.dayOfWeek >= 1 && s.dayOfWeek <= 5,
        openTime: '09:00',
        closeTime: '18:00'
      }))
  },
  {
    id: 'extended',
    name: 'Lun-Sáb Extendido',
    description: '8:00 - 20:00',
    icon: Zap,
    apply: (schedules: DaySchedule[]) => 
      schedules.map(s => ({
        ...s,
        isActive: s.dayOfWeek >= 1 && s.dayOfWeek <= 6,
        openTime: '08:00',
        closeTime: '20:00'
      }))
  },
  {
    id: 'allweek',
    name: 'Toda la Semana',
    description: '9:00 - 17:00',
    icon: Calendar,
    apply: (schedules: DaySchedule[]) => 
      schedules.map(s => ({
        ...s,
        isActive: true,
        openTime: '09:00',
        closeTime: '17:00'
      }))
  }
];

export const OperatingHoursModal: React.FC<OperatingHoursModalProps> = ({ 
  isOpen, 
  onClose, 
  initialHours, 
  onSaveSuccess 
}) => {
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingStep, setSavingStep] = useState<'idle' | 'saving' | 'success'>('idle');
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const [copiedFromDay, setCopiedFromDay] = useState<number | null>(null);

  // Inicializar estado - DEFAULTS INTELIGENTES
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
      setSavingStep('idle');
      setValidationErrors({});
    }
  }, [isOpen, initialHours]);

  // Validación en tiempo real - MINIMIZAR ERRORES
  useEffect(() => {
    const errors: Record<number, string> = {};
    
    schedules.forEach(day => {
      if (day.isActive) {
        const [openHour, openMin] = day.openTime.split(':').map(Number);
        const [closeHour, closeMin] = day.closeTime.split(':').map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        
        if (closeMinutes <= openMinutes) {
          errors[day.dayOfWeek] = 'El horario de cierre debe ser posterior a la apertura';
        }
      }
    });
    
    setValidationErrors(errors);
  }, [schedules]);

  const handleScheduleChange = (dayId: number, field: keyof DaySchedule, value: string | boolean) => {
    setSchedules(currentSchedules =>
      currentSchedules.map(day => 
        day.dayOfWeek === dayId ? { ...day, [field]: value } : day
      )
    );
  };

  // Quick action: Copiar horario a otros días - MINIMIZAR CARGA COGNITIVA
  const handleCopyToOtherDays = (sourceDayId: number) => {
    const sourceDay = schedules.find(s => s.dayOfWeek === sourceDayId);
    if (!sourceDay) return;

    setSchedules(currentSchedules =>
      currentSchedules.map(day => 
        day.dayOfWeek !== sourceDayId 
          ? { 
              ...day, 
              openTime: sourceDay.openTime, 
              closeTime: sourceDay.closeTime,
              isActive: sourceDay.isActive
            } 
          : day
      )
    );
    
    setCopiedFromDay(sourceDayId);
    setTimeout(() => setCopiedFromDay(null), 2000);
    toast.success(`Horario copiado a todos los días`);
  };

  // Aplicar template - SATISFICING
  const applyTemplate = (templateId: string) => {
    const template = scheduleTemplates.find(t => t.id === templateId);
    if (!template) return;

    setSchedules(template.apply(schedules));
    toast.success(`Plantilla "${template.name}" aplicada`);
  };

  const handleSave = async () => {
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Corrige los errores antes de guardar");
      return;
    }

    setLoading(true);
    setSavingStep('saving');

    try {
      const activeHours = schedules
        .filter(s => s.isActive)
        .map(({ dayOfWeek, openTime, closeTime }) => ({
          dayOfWeek, openTime, closeTime
        }));
      
      await axios.post('/api/calendar/operating-hours', activeHours, { withCredentials: true });
      
      setSavingStep('success');
      toast.success("¡Horarios actualizados correctamente! ✅");

      setTimeout(() => {
        onSaveSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setSavingStep('idle');
      toast.error(error?.response?.data?.message || "Error al guardar horarios");
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const activeSchedulesCount = schedules.filter(s => s.isActive).length;
  const hasChanges = JSON.stringify(schedules) !== JSON.stringify(
    daysOfWeek.map(day => {
      const existing = initialHours.find(h => h.day_of_week === day.id);
      return {
        dayOfWeek: day.id,
        isActive: !!existing,
        openTime: existing ? existing.open_time.slice(0, 5) : '09:00',
        closeTime: existing ? existing.close_time.slice(0, 5) : '17:00'
      };
    })
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-3xl max-h-[95vh] p-0 overflow-hidden gap-0">
        
        {/* Header - JERARQUÍA VISUAL */}
        <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <DialogHeader className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="p-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20 shadow-lg"
                >
                  <Clock className="w-6 h-6 text-purple-400" />
                </motion.div>
                <div>
                  <DialogTitle className="text-2xl font-black text-white tracking-tight mb-1">
                    Horarios de Atención
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Define tu disponibilidad semanal
                  </DialogDescription>
                </div>
              </div>

              {!loading && (
                <Button
                  variant="ghost"
                  size="default"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <CalendarDays className="w-3 h-3 mr-1" />
                {activeSchedulesCount} días activos
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                <Settings className="w-3 h-3 mr-1" />
                Zona: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </Badge>
              {hasChanges && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Cambios sin guardar
                </Badge>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Templates Section - SATISFICING */}
        <div className="px-6 pt-6 bg-gray-950/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Plantillas Rápidas
            </p>
            <Info className="w-4 h-4 text-gray-600" />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {scheduleTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <motion.button
                  key={template.id}
                  onClick={() => applyTemplate(template.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-purple-500/30 hover:bg-gray-900 transition-all group"
                >
                  <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <Icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <Separator className="bg-gray-800 mt-6" />

        {/* Schedule List - AFFORDANCE */}
        <ScrollArea className="h-[400px] px-6 py-4 bg-gray-950/50">
          <div className="space-y-3">
            {schedules.map((day, index) => {
              const dayInfo = daysOfWeek.find(d => d.id === day.dayOfWeek);
              const hasError = validationErrors[day.dayOfWeek];
              
              return (
                <motion.div
                  key={day.dayOfWeek}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200",
                    day.isActive 
                      ? 'bg-gray-900 border-purple-500/30 shadow-lg' 
                      : 'bg-gray-900/30 border-gray-800',
                    hasError && "border-red-500/30 bg-red-500/5",
                    copiedFromDay === day.dayOfWeek ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-gray-950" : ""
                  )}
                >
                  {/* Day Info + Toggle */}
                  <div className="flex items-center gap-4 flex-1">
                    <Switch 
                      checked={day.isActive}
                      onCheckedChange={(checked) => handleScheduleChange(day.dayOfWeek, 'isActive', checked)}
                      className="data-[state=checked]:bg-purple-600"
                    />
                    <div className="flex-1">
                      <p className={cn(
                        "font-bold text-base",
                        day.isActive ? 'text-white' : 'text-gray-500'
                      )}>
                        {dayInfo?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {day.isActive 
                          ? `${day.openTime} - ${day.closeTime}` 
                          : 'Cerrado'}
                      </p>
                    </div>
                  </div>

                  {/* Time Inputs */}
                  <div className={cn(
                    "flex items-center gap-3 transition-opacity",
                    day.isActive ? 'opacity-100' : 'opacity-30 pointer-events-none'
                  )}>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">
                        Apertura
                      </span>
                      <Input 
                        type="time" 
                        value={day.openTime}
                        onChange={(e) => handleScheduleChange(day.dayOfWeek, 'openTime', e.target.value)}
                        className={cn(
                          "w-32 bg-gray-950 border-gray-700 h-10 text-sm",
                          "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
                          hasError && "border-red-500/50"
                        )}
                      />
                    </div>
                    
                    <span className="text-gray-600 mt-5">—</span>
                    
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">
                        Cierre
                      </span>
                      <Input 
                        type="time" 
                        value={day.closeTime}
                        onChange={(e) => handleScheduleChange(day.dayOfWeek, 'closeTime', e.target.value)}
                        className={cn(
                          "w-32 bg-gray-950 border-gray-700 h-10 text-sm",
                          "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
                          hasError && "border-red-500/50"
                        )}
                      />
                    </div>

                    {/* Copy to All Button */}
                    {day.isActive && (
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={() => handleCopyToOtherDays(day.dayOfWeek)}
                        className="mt-5 h-10 w-10 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10"
                        title="Copiar a todos los días"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Error Message */}
                  {hasError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="w-full flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg mt-2"
                    >
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {hasError}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Warning if no days active */}
        {activeSchedulesCount === 0 && (
          <div className="px-6 pb-4 bg-gray-950/50">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                <span className="font-semibold">Sin horarios activos:</span> Activa al menos un día para recibir citas
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="p-6 bg-gray-900 border-t border-gray-800 gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-none border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleSave} 
            disabled={loading || Object.keys(validationErrors).length > 0 || !hasChanges}
            className={cn(
              "flex-1 sm:flex-none min-w-[160px] h-12 font-bold shadow-xl transition-all duration-300",
              savingStep === 'success'
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
            )}
          >
            <AnimatePresence mode="wait">
              {savingStep === 'saving' && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </motion.div>
              )}
              {savingStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  ¡Guardado!
                </motion.div>
              )}
              {savingStep === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Guardar Cambios
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};