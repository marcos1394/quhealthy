"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Loader2, CheckCircle, Settings, CalendarDays, X, Copy, Zap, AlertCircle, Sun, Calendar, Moon } from "lucide-react";
import { toast } from "react-toastify";
import { useOperatingHours, UIDaySchedule } from "@/hooks/useOperatingHours";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { QhSpinner } from '@/components/ui/QhSpinner';

interface OperatingHoursModalProps { isOpen: boolean; onClose: () => void; onSaveSuccess: () => void; }

// 🚀 TODO: Reemplazar con un selector de sede cuando se implemente la UI multi-sede.
// Por ahora usamos la sede principal del proveedor (1 = primera sede de la lista).
const DEFAULT_LOCATION_ID = 1;

const daysOfWeek = [
  { id: 1, key: "monday", short: "LUN" }, { id: 2, key: "tuesday", short: "MAR" }, { id: 3, key: "wednesday", short: "MIE" },
  { id: 4, key: "thursday", short: "JUE" }, { id: 5, key: "friday", short: "VIE" }, { id: 6, key: "saturday", short: "SAB" }, { id: 0, key: "sunday", short: "DOM" }
];

const scheduleTemplates = [
  {
    id: "standard", name: "LUN–VIE", description: "9:00 – 18:00", icon: Sun,
    apply: (s: UIDaySchedule[]) => s.map(d => ({ ...d, isActive: d.dayOfWeek >= 1 && d.dayOfWeek <= 5, openTime: "09:00", closeTime: "18:00" }))
  },
  {
    id: "extended", name: "LUN–SAB EXT", description: "8:00 – 20:00", icon: Zap,
    apply: (s: UIDaySchedule[]) => s.map(d => ({ ...d, isActive: d.dayOfWeek >= 1 && d.dayOfWeek <= 6, openTime: "08:00", closeTime: "20:00" }))
  },
  {
    id: "allweek", name: "TODA LA SEMANA", description: "9:00 – 17:00", icon: Calendar,
    apply: (s: UIDaySchedule[]) => s.map(d => ({ ...d, isActive: true, openTime: "09:00", closeTime: "17:00" }))
  }
];

export const OperatingHoursModal: React.FC<OperatingHoursModalProps> = ({ isOpen, onClose, onSaveSuccess }) => {
  const { fetchSchedules, saveSchedules, isLoading, isSaving } = useOperatingHours();
  const [schedules, setSchedules] = useState<UIDaySchedule[]>([]);
  const [originalSchedules, setOriginalSchedules] = useState<UIDaySchedule[]>([]);
  const [savingStep, setSavingStep] = useState<"idle" | "saving" | "success">("idle");
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const [copiedFromDay, setCopiedFromDay] = useState<number | null>(null);
  const t = useTranslations('DashboardOperatingHours');

  useEffect(() => {
    if (isOpen) {
      const load = async () => {
        const data = await fetchSchedules(DEFAULT_LOCATION_ID);
        const merged = daysOfWeek.map(d => data.find(h => h.dayOfWeek === d.id) || { dayOfWeek: d.id, isActive: false, openTime: "09:00", closeTime: "17:00" });
        setSchedules(merged); setOriginalSchedules(merged); setSavingStep("idle"); setValidationErrors({});
      };
      load();
    }
  }, [isOpen, fetchSchedules]);

  useEffect(() => {
    const errors: Record<number, string> = {};
    schedules.forEach(d => {
      if (d.isActive) {
        const [oh, om] = d.openTime.split(":").map(Number); const [ch, cm] = d.closeTime.split(":").map(Number);
        if (ch * 60 + cm <= oh * 60 + om) errors[d.dayOfWeek] = t('error_close_after_open', { defaultValue: 'HORA INVÁLIDA' });
      }
    });
    setValidationErrors(errors);
  }, [schedules, t]);

  const handleChange = (dayId: number, field: keyof UIDaySchedule, value: string | boolean) =>
    setSchedules(c => c.map(d => d.dayOfWeek === dayId ? { ...d, [field]: value } : d));

  const handleCopy = (srcId: number) => {
    const src = schedules.find(s => s.dayOfWeek === srcId);
    if (!src) return;
    setSchedules(c => c.map(d => d.dayOfWeek !== srcId ? { ...d, openTime: src.openTime, closeTime: src.closeTime, isActive: src.isActive } : d));
    setCopiedFromDay(srcId); setTimeout(() => setCopiedFromDay(null), 2000);
    toast.success(t('copied_toast', { defaultValue: 'HORARIOS CLONADOS' }));
  };

  const handleSave = async () => {
    if (Object.keys(validationErrors).length > 0) { return; }
    setSavingStep("saving");
    const success = await saveSchedules(DEFAULT_LOCATION_ID, schedules);
    if (success) { 
      setSavingStep("success"); 
      toast.success(t('save_success', { defaultValue: 'MATRIZ HORARIA ACTUALIZADA' })); 
      setTimeout(() => { onSaveSuccess(); onClose(); }, 1000); 
    }
    else setSavingStep("idle");
  };

  const activeCount = schedules.filter(s => s.isActive).length;
  const hasChanges = JSON.stringify(schedules) !== JSON.stringify(originalSchedules);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white text-black dark:text-white sm:max-w-3xl p-0 overflow-hidden rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
        
        {/* HEADER ARQUITECTÓNICO */}
        <div className="px-6 py-6 bg-gray-50 dark:bg-[#050505] border-b border-black dark:border-white relative flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight uppercase">
                {t('title', { defaultValue: 'MATRIZ DE DISPONIBILIDAD' })}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                {t('subtitle', { defaultValue: 'CONFIGURACIÓN DE HORARIOS OPERATIVOS Y ESCAPARATE DIGITAL.' })}
              </DialogDescription>
            </div>
          </div>
          {!isSaving && !isLoading && (
            <button 
              onClick={onClose} 
              className="w-10 h-10 border border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-[#0a0a0a] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
            <QhSpinner size="md" className="text-black dark:text-white" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
              {t('loading', { defaultValue: 'EXTRAYENDO REGISTROS HORARIOS...' })}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="px-6 py-8 overflow-y-auto max-h-[65vh] custom-scrollbar space-y-10 bg-white dark:bg-[#0a0a0a]">
              
              {/* PLANTILLAS TÉCNICAS */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                  <p className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">
                    {t('templates_label', { defaultValue: 'MACROS DE CONFIGURACIÓN' })}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scheduleTemplates.map(tmpl => {
                    const Icon = tmpl.icon;
                    return (
                      <button 
                        key={tmpl.id} 
                        onClick={() => { 
                          setSchedules(tmpl.apply(schedules)); 
                          toast.success(`MACRO "${tmpl.name}" APLICADA.`); 
                        }}
                        className="flex items-center gap-4 p-4 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-left group"
                      >
                        <div className="w-10 h-10 border border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest">{tmpl.name}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1">{tmpl.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FILAS DE DÍAS (TABLA RÍGIDA) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                    <p className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">
                      {t('your_week', { defaultValue: 'SECUENCIA SEMANAL' })}
                    </p>
                  </div>
                  <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </span>
                </div>
                
                <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] divide-y divide-gray-200 dark:divide-gray-800">
                  {schedules.map(day => {
                    const info = daysOfWeek.find(d => d.id === day.dayOfWeek);
                    const hasError = validationErrors[day.dayOfWeek];
                    const isCopied = copiedFromDay === day.dayOfWeek;
                    
                    return (
                      <div 
                        key={day.dayOfWeek}
                        className={cn(
                          "flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 md:p-6 transition-colors",
                          !day.isActive && "bg-gray-50 dark:bg-[#050505]", 
                          isCopied && "bg-black text-white dark:bg-white dark:text-black"
                        )}
                      >
                        {/* Control de Activación */}
                        <div className="flex items-center gap-4 min-w-[140px]">
                          <Switch 
                            checked={day.isActive} 
                            onCheckedChange={v => handleChange(day.dayOfWeek, "isActive", v)}
                            className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-700 border border-black dark:border-white rounded-none [&>span]:rounded-none" 
                          />
                          <span className={cn(
                            "font-bold text-[10px] uppercase tracking-widest", 
                            day.isActive ? (isCopied ? "text-white dark:text-black" : "text-black dark:text-white") : "text-gray-400"
                          )}>
                            {info?.short}
                          </span>
                        </div>

                        {/* Entradas de Tiempo */}
                        <div className="flex flex-1 items-center justify-start md:justify-end gap-3">
                          {day.isActive ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-3">
                              <div className={cn("relative border", hasError ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-black dark:border-white bg-white dark:bg-[#0a0a0a]")}>
                                <Input 
                                  type="time" 
                                  value={day.openTime} 
                                  onChange={e => handleChange(day.dayOfWeek, "openTime", e.target.value)}
                                  className={cn("w-[120px] h-10 border-0 bg-transparent text-[10px] font-bold uppercase tracking-widest text-center focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none", isCopied ? "text-black dark:text-white" : "text-black dark:text-white")} 
                                />
                              </div>
                              
                              <span className={cn("font-bold text-[9px] uppercase tracking-widest", isCopied ? "text-white dark:text-black" : "text-gray-500")}>
                                {t('to', { defaultValue: 'A' })}
                              </span>
                              
                              <div className={cn("relative border", hasError ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-black dark:border-white bg-white dark:bg-[#0a0a0a]")}>
                                <Input 
                                  type="time" 
                                  value={day.closeTime} 
                                  onChange={e => handleChange(day.dayOfWeek, "closeTime", e.target.value)}
                                  className={cn("w-[120px] h-10 border-0 bg-transparent text-[10px] font-bold uppercase tracking-widest text-center focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none", isCopied ? "text-black dark:text-white" : "text-black dark:text-white")} 
                                />
                              </div>
                              
                              <button 
                                onClick={() => handleCopy(day.dayOfWeek)} 
                                title={t('copy_all', { defaultValue: 'COPIAR A TODOS' })}
                                className={cn(
                                  "h-10 w-10 border flex items-center justify-center transition-colors shrink-0", 
                                  isCopied 
                                    ? "border-white dark:border-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white" 
                                    : "border-black dark:border-white bg-gray-50 dark:bg-[#050505] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                                )}
                              >
                                <Copy className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                            </motion.div>
                          ) : (
                            <div className="flex items-center gap-3 text-gray-400 h-10 px-6 border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505]">
                              <Moon className="w-4 h-4" strokeWidth={1.5} />
                              <span className="text-[9px] font-bold uppercase tracking-widest">
                                {t('closed', { defaultValue: 'INACTIVO' })}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Mensaje de Error Integrado */}
                        {hasError && (
                          <div className="w-full md:w-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 border border-red-500 bg-red-50 dark:bg-red-900/10 px-3 py-1 mt-2 md:mt-0">
                            <AlertCircle className="w-3 h-3" strokeWidth={1.5} />{hasError}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AVISO DE DÍAS CERO */}
            {!isLoading && activeCount === 0 && (
              <div className="px-6 py-4 bg-black text-white dark:bg-white dark:text-black flex items-center gap-4">
                <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
                <p className="text-[9px] font-bold uppercase tracking-widest">
                  {t('warning_no_days', { defaultValue: 'ADVERTENCIA: ESCAPARATE ACTUALMENTE SIN DISPONIBILIDAD OPERATIVA.' })}
                </p>
              </div>
            )}

            {/* FOOTER DE COMANDOS */}
            <DialogFooter className="px-6 py-6 bg-gray-50 dark:bg-[#050505] border-t border-black dark:border-white flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="w-full sm:w-auto text-left">
                {hasChanges && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                    <div className="w-2 h-2 bg-black dark:bg-white animate-pulse" />
                    {t('unsaved_changes', { defaultValue: 'ALTERACIONES PENDIENTES' })}
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button 
                  onClick={onClose} 
                  disabled={isSaving || isLoading}
                  className="w-full sm:w-auto border border-black dark:border-white rounded-none bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[10px] font-bold uppercase tracking-widest h-12 px-8"
                >
                  {t('cancel', { defaultValue: 'ANULAR' })}
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || isLoading || Object.keys(validationErrors).length > 0 || !hasChanges}
                  className={cn(
                    "w-full sm:w-auto border border-black dark:border-white rounded-none text-[10px] font-bold uppercase tracking-widest h-12 px-10 transition-colors shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] disabled:opacity-50 disabled:shadow-none",
                    savingStep === "success" 
                      ? "bg-white text-black dark:bg-[#0a0a0a] dark:text-white" 
                      : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {savingStep === "saving" && (
                      <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> {t('saving', { defaultValue: 'GUARDANDO...' })}
                      </motion.div>
                    )}
                    {savingStep === "success" && (
                      <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-4 h-4" strokeWidth={1.5} /> {t('saved', { defaultValue: 'COMPLETADO' })}
                      </motion.div>
                    )}
                    {savingStep === "idle" && (
                      <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {t('save', { defaultValue: 'SOBREESCRIBIR DATOS' })}
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