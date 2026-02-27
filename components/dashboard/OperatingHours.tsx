"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Loader2, CheckCircle, Settings, CalendarDays,
  X, Copy, Zap, Info, AlertCircle, Sun, Calendar, Moon
} from 'lucide-react';
import { toast } from 'react-toastify';

// 🚀 IMPORTAMOS EL HOOK Y SUS TIPOS
import { useOperatingHours, UIDaySchedule } from '@/hooks/useOperatingHours';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OperatingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
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

// Templates predefinidos
const scheduleTemplates = [
  {
    id: 'standard',
    name: 'Lunes a Viernes',
    description: '9:00 - 18:00',
    icon: Sun,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40',
    apply: (schedules: UIDaySchedule[]) => 
      schedules.map(s => ({
        ...s,
        isActive: s.dayOfWeek >= 1 && s.dayOfWeek <= 5,
        openTime: '09:00',
        closeTime: '18:00'
      }))
  },
  {
    id: 'extended',
    name: 'Lun - Sáb Extendido',
    description: '8:00 - 20:00',
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40',
    apply: (schedules: UIDaySchedule[]) => 
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
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40',
    apply: (schedules: UIDaySchedule[]) => 
      schedules.map(s => ({
        ...s,
        isActive: true,
        openTime: '09:00',
        closeTime: '17:00'
      }))
  }
];

export const OperatingHoursModal: React.FC<OperatingHoursModalProps> = ({ 
  isOpen, onClose, onSaveSuccess 
}) => {
  const { fetchSchedules, saveSchedules, isLoading, isSaving } = useOperatingHours();
  
  const [schedules, setSchedules] = useState<UIDaySchedule[]>([]);
  const [originalSchedules, setOriginalSchedules] = useState<UIDaySchedule[]>([]);
  const [savingStep, setSavingStep] = useState<'idle' | 'saving' | 'success'>('idle');
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const [copiedFromDay, setCopiedFromDay] = useState<number | null>(null);

  // 📥 Cargar datos desde el Backend al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        const fetchedData = await fetchSchedules();
        
        const mergedData = daysOfWeek.map(day => {
          const existing = fetchedData.find(h => h.dayOfWeek === day.id);
          if (existing) return existing;
          return { dayOfWeek: day.id, isActive: false, openTime: '09:00', closeTime: '17:00' };
        });

        setSchedules(mergedData);
        setOriginalSchedules(mergedData);
        setSavingStep('idle');
        setValidationErrors({});
      };
      loadData();
    }
  }, [isOpen, fetchSchedules]);

  // 🛡️ Validación en tiempo real
  useEffect(() => {
    const errors: Record<number, string> = {};
    schedules.forEach(day => {
      if (day.isActive) {
        const [openHour, openMin] = day.openTime.split(':').map(Number);
        const [closeHour, closeMin] = day.closeTime.split(':').map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        
        if (closeMinutes <= openMinutes) {
          errors[day.dayOfWeek] = 'El cierre debe ser posterior';
        }
      }
    });
    setValidationErrors(errors);
  }, [schedules]);

  const handleScheduleChange = (dayId: number, field: keyof UIDaySchedule, value: string | boolean) => {
    setSchedules(current =>
      current.map(day => day.dayOfWeek === dayId ? { ...day, [field]: value } : day)
    );
  };

  const handleCopyToOtherDays = (sourceDayId: number) => {
    const sourceDay = schedules.find(s => s.dayOfWeek === sourceDayId);
    if (!sourceDay) return;

    setSchedules(current =>
      current.map(day => 
        day.dayOfWeek !== sourceDayId 
          ? { ...day, openTime: sourceDay.openTime, closeTime: sourceDay.closeTime, isActive: sourceDay.isActive } 
          : day
      )
    );
    
    setCopiedFromDay(sourceDayId);
    setTimeout(() => setCopiedFromDay(null), 2000);
    toast.success(`Horario copiado a todos los días`, { theme: "dark" });
  };

  const applyTemplate = (templateId: string) => {
    const template = scheduleTemplates.find(t => t.id === templateId);
    if (!template) return;
    setSchedules(template.apply(schedules));
    toast.success(`Plantilla "${template.name}" aplicada`, { theme: "dark" });
  };

  // 💾 Guardar datos en el Backend
  const handleSave = async () => {
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Corrige los errores en rojo antes de guardar", { theme: "dark" });
      return;
    }

    setSavingStep('saving');
    const success = await saveSchedules(schedules);

    if (success) {
      setSavingStep('success');
      toast.success("¡Horarios guardados correctamente! ✅", { theme: "dark" });
      setTimeout(() => {
        onSaveSuccess();
        onClose();
      }, 1000);
    } else {
      setSavingStep('idle');
    }
  };

  const activeSchedulesCount = schedules.filter(s => s.isActive).length;
  const hasChanges = JSON.stringify(schedules) !== JSON.stringify(originalSchedules);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="bg-gray-900/95 backdrop-blur-2xl border-gray-800 text-white sm:max-w-2xl p-0 overflow-hidden rounded-3xl shadow-2xl">
        
        {/* 🚀 HEADER TIPO SETTINGS */}
        <div className="px-6 pt-6 pb-4 bg-gray-950/30 border-b border-gray-800/60 relative">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl border border-purple-500/20 shadow-lg shadow-purple-500/10">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-2xl font-black text-white tracking-tight">
                    Horarios Laborales
                  </DialogTitle>
                  <DialogDescription className="text-gray-400 font-medium">
                    Define los días y horas que estás disponible para consultas.
                  </DialogDescription>
                </div>
              </div>
              {!isSaving && !isLoading && (
                <Button variant="ghost" size="default" onClick={onClose} className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center bg-transparent">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-400 font-medium">Cargando tu configuración...</p>
          </div>
        ) : (
          <div className="bg-transparent flex flex-col">
            
            <div className="px-6 py-6 overflow-y-auto max-h-[60vh] custom-scrollbar">

              {/* 🚀 PLANTILLAS RÁPIDAS */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ajustes Rápidos</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {scheduleTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 text-left group",
                          template.bg
                        )}
                      >
                        <div className="p-2 bg-gray-950/50 rounded-xl group-hover:scale-110 transition-transform">
                          <Icon className={cn("w-4 h-4", template.color)} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{template.name}</p>
                          <p className="text-xs text-gray-400">{template.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🚀 LISTA AGRUPADA TIPO macOS */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tu Semana</p>
                  </div>
                  <Badge variant="outline" className="bg-gray-900 border-gray-800 text-gray-400">
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </Badge>
                </div>

                <div className="bg-gray-900/40 border border-gray-800/60 rounded-3xl overflow-hidden divide-y divide-gray-800/60 shadow-inner">
                  {schedules.map((day) => {
                    const dayInfo = daysOfWeek.find(d => d.id === day.dayOfWeek);
                    const hasError = validationErrors[day.dayOfWeek];
                    const isCopied = copiedFromDay === day.dayOfWeek;
                    
                    return (
                      <div
                        key={day.dayOfWeek}
                        className={cn(
                          "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-all duration-300",
                          day.isActive ? "bg-transparent" : "bg-gray-950/30 opacity-70",
                          isCopied ? "bg-emerald-500/10" :""
                        )}
                      >
                        {/* Control del Día */}
                        <div className="flex items-center gap-4 min-w-[140px]">
                          <Switch 
                            checked={day.isActive}
                            onCheckedChange={(checked) => handleScheduleChange(day.dayOfWeek, 'isActive', checked)}
                            className="data-[state=checked]:bg-purple-500"
                          />
                          <span className={cn("font-semibold text-base", day.isActive ? 'text-white' : 'text-gray-500')}>
                            {dayInfo?.name}
                          </span>
                        </div>

                        {/* Entradas de Tiempo */}
                        <div className="flex flex-1 items-center justify-end gap-2">
                          {day.isActive ? (
                            <motion.div 
                              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} 
                              className="flex items-center gap-2 sm:gap-3"
                            >
                              {/* Pill Input Apertura */}
                              <div className={cn("relative rounded-xl border transition-colors", hasError ? "border-red-500/50 bg-red-500/5" : "border-gray-800 bg-gray-950 hover:border-gray-700")}>
                                <Input 
                                  type="time" 
                                  value={day.openTime}
                                  onChange={(e) => handleScheduleChange(day.dayOfWeek, 'openTime', e.target.value)}
                                  className="w-[100px] h-9 border-0 bg-transparent text-sm font-medium text-center focus-visible:ring-0 focus-visible:ring-offset-0"
                                  style={{ colorScheme: 'dark' }}
                                />
                              </div>
                              
                              <span className="text-gray-600 font-medium">a</span>
                              
                              {/* Pill Input Cierre */}
                              <div className={cn("relative rounded-xl border transition-colors", hasError ? "border-red-500/50 bg-red-500/5" : "border-gray-800 bg-gray-950 hover:border-gray-700")}>
                                <Input 
                                  type="time" 
                                  value={day.closeTime}
                                  onChange={(e) => handleScheduleChange(day.dayOfWeek, 'closeTime', e.target.value)}
                                  className="w-[100px] h-9 border-0 bg-transparent text-sm font-medium text-center focus-visible:ring-0 focus-visible:ring-offset-0"
                                  style={{ colorScheme: 'dark' }}
                                />
                              </div>

                              {/* Botón Copiar Explícito */}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleCopyToOtherDays(day.dayOfWeek)} 
                                className="h-9 px-2.5 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl hidden sm:flex items-center gap-1.5 transition-colors border border-transparent hover:border-purple-500/30" 
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span className="hidden md:inline font-semibold">Aplicar a todos</span>
                              </Button>                           
                            </motion.div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-600 h-9 px-4">
                              <Moon className="w-4 h-4" />
                              <span className="text-sm font-medium">Cerrado</span>
                            </div>
                          )}
                        </div>

                        {/* Mensaje de Error (Mobile mainly o debajo) */}
                        {hasError && (
                          <div className="w-full sm:w-auto flex items-center gap-1.5 text-xs text-red-400 sm:absolute sm:right-6 sm:-mt-10 bg-gray-900 border border-red-500/20 px-2 py-1 rounded-lg shadow-lg">
                            <AlertCircle className="w-3 h-3" /> {hasError}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Warning if no days active */}
            {!isLoading && activeSchedulesCount === 0 && (
              <div className="px-6 py-3 bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <p className="text-sm text-amber-300 font-medium">
                  Atención: Debes activar al menos un día para poder recibir citas.
                </p>
              </div>
            )}

            {/* 🚀 FOOTER TRANSLÚCIDO */}
            <DialogFooter className="px-6 py-5 bg-gray-950/50 border-t border-gray-800/60 flex items-center justify-between sm:justify-between">
              <div className="hidden sm:block">
                {hasChanges && (
                  <span className="text-sm font-medium text-purple-400 flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-purple-500" /> Tienes cambios sin guardar
                  </span>
                )}
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="ghost" onClick={onClose} disabled={isSaving || isLoading} className="flex-1 sm:flex-none text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl font-medium">
                  Cancelar
                </Button>
                
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || isLoading || Object.keys(validationErrors).length > 0 || !hasChanges}
                  className={cn(
                    "flex-1 sm:flex-none min-w-[140px] rounded-xl font-bold shadow-xl transition-all duration-300",
                    savingStep === 'success' ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-white text-gray-900 hover:bg-gray-200"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {savingStep === 'saving' && (
                      <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                      </motion.div>
                    )}
                    {savingStep === 'success' && (
                      <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> ¡Listo!
                      </motion.div>
                    )}
                    {savingStep === 'idle' && (
                      <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        Guardar Cambios
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </DialogFooter>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};