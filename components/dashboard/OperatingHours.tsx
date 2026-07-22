"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Loader2, CheckCircle, Settings, CalendarDays, X, Copy, Zap, AlertCircle, Sun, Calendar, Moon } from "lucide-react";
import { toast } from "react-toastify";
import { useOperatingHours, UIDaySchedule } from "@/hooks/useOperatingHours";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { QhSpinner } from '@/components/ui/QhSpinner';

interface OperatingHoursModalProps { isOpen: boolean; onClose: () => void; onSaveSuccess: () => void; locationId: number; }

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

export const OperatingHoursModal: React.FC<OperatingHoursModalProps> = ({ isOpen, onClose, onSaveSuccess, locationId }) => {
 const { fetchSchedules, saveSchedules, isLoading, isSaving } = useOperatingHours();
 const [{ schedules, originalSchedules, savingStep, validationErrors, copiedFromDay }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_SCHEDULES': return { ...state, schedules: typeof action.payload === 'function' ? action.payload(state.schedules) : action.payload };
 case 'SET_ORIGINALSCHEDULES': return { ...state, originalSchedules: typeof action.payload === 'function' ? action.payload(state.originalSchedules) : action.payload };
 case 'SET_SAVINGSTEP': return { ...state, savingStep: typeof action.payload === 'function' ? action.payload(state.savingStep) : action.payload };
 case 'SET_VALIDATIONERRORS': return { ...state, validationErrors: typeof action.payload === 'function' ? action.payload(state.validationErrors) : action.payload };
 case 'SET_COPIEDFROMDAY': return { ...state, copiedFromDay: typeof action.payload === 'function' ? action.payload(state.copiedFromDay) : action.payload };
 default: return state;
 }
 },
 {
 schedules: [], originalSchedules: [], savingStep: "idle", validationErrors: {}, copiedFromDay: null
 }
 );

 const setSchedules = (val: any) => dispatch({ type: 'SET_SCHEDULES', payload: val });
 const setOriginalSchedules = (val: any) => dispatch({ type: 'SET_ORIGINALSCHEDULES', payload: val });
 const setSavingStep = (val: any) => dispatch({ type: 'SET_SAVINGSTEP', payload: val });
 const setValidationErrors = (val: any) => dispatch({ type: 'SET_VALIDATIONERRORS', payload: val });
 const setCopiedFromDay = (val: any) => dispatch({ type: 'SET_COPIEDFROMDAY', payload: val });





 const t = useTranslations('DashboardOperatingHours');

 useEffect(() => {
 if (isOpen && locationId) {
 const load = async () => {
 const data = await fetchSchedules(locationId);
 const merged = daysOfWeek.map(d => data.find(h => h.dayOfWeek === d.id) || { dayOfWeek: d.id, isActive: false, openTime: "09:00", closeTime: "17:00" });
 setSchedules(merged); setOriginalSchedules(merged); setSavingStep("idle"); setValidationErrors({});
 };
 load();
 }
 }, [isOpen, fetchSchedules, locationId]);

 useEffect(() => {
 const errors: Record<number, string> = {};
 schedules.forEach((d: any) => {
 if (d.isActive) {
 const [oh, om] = d.openTime.split(":").map(Number); const [ch, cm] = d.closeTime.split(":").map(Number);
 if (ch * 60 + cm <= oh * 60 + om) errors[d.dayOfWeek] = t('error_close_after_open', { defaultValue: 'HORA INVÁLIDA' });
 }
 });
 setValidationErrors(errors);
 }, [schedules, t]);

 const handleChange = (dayId: number, field: keyof UIDaySchedule, value: string | boolean) =>
 setSchedules((c: any) => c.map((d: any) => d.dayOfWeek === dayId ? { ...d, [field]: value } : d));

 const handleCopy = (srcId: number) => {
 const src = schedules.find((s: any) => s.dayOfWeek === srcId);
 if (!src) return;
 setSchedules((c: any) => c.map((d: any) => d.dayOfWeek !== srcId ? { ...d, openTime: src.openTime, closeTime: src.closeTime, isActive: src.isActive } : d));
 setCopiedFromDay(srcId); setTimeout(() => setCopiedFromDay(null), 2000);
 toast.success(t('copied_toast', { defaultValue: 'HORARIOS CLONADOS' }));
 };

 const handleSave = async () => {
 if (Object.keys(validationErrors).length > 0) { return; }
 setSavingStep("saving");
 const success = await saveSchedules(locationId, schedules);
 if (success) { 
 setSavingStep("success"); 
 toast.success(t('save_success', { defaultValue: 'MATRIZ HORARIA ACTUALIZADA' })); 
 setTimeout(() => { onSaveSuccess(); onClose(); }, 1000); 
 }
 else setSavingStep("idle");
 };

 const activeCount = schedules.filter((s: any) => s.isActive).length;
 const hasChanges = JSON.stringify(schedules) !== JSON.stringify(originalSchedules);

 return (
 <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
 <DialogContent className="bg-white dark:bg-[#0a0a0a] border-0 text-black dark:text-white sm:max-w-4xl p-0 overflow-hidden rounded-3xl shadow-2xl flex flex-col max-h-[90vh] [&>button.absolute]:hidden">
 
 {/* HEADER */}
 <div className="px-6 md:px-8 py-6 md:py-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 flex items-start justify-between shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 shadow-sm">
 <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-500 mb-1">
 {t('subtitle', { defaultValue: 'Configuración de escaparate digital' })}
 </p>
 <DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
 {t('title', { defaultValue: 'Matriz de Disponibilidad' })}
 </DialogTitle>
 </div>
 </div>
 {!isSaving && !isLoading && (
 <button 
 onClick={onClose} 
 className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#111] flex items-center justify-center transition-colors shrink-0"
 >
 <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
 </button>
 )}
 </div>

 {isLoading ? (
 <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#050505] min-h-[400px]">
 <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
 <p className="text-sm font-semibold text-gray-500 mt-6 animate-pulse">
 {t('loading', { defaultValue: 'Extrayendo registros horarios...' })}
 </p>
 </div>
 ) : (
 <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
 <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-10">
 
 {/* PLANTILLAS TÉCNICAS */}
 <div>
 <div className="flex items-center gap-3 mb-4">
 <Settings className="w-4 h-4 text-emerald-600" strokeWidth={2} />
 <p className="text-sm font-bold text-gray-900 dark:text-white">
 {t('templates_label', { defaultValue: 'Macros de Configuración Rápida' })}
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
 toast.success(`Macro "${tmpl.name}" aplicada.`); 
 }}
 className="flex flex-col items-start gap-4 p-5 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 text-left group"
 >
 <div className="w-12 h-12 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 shadow-sm">
 <Icon className="w-6 h-6" strokeWidth={2} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-900 dark:text-white transition-colors">{tmpl.name}</p>
 <p className="text-xs font-semibold text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mt-1 transition-colors">{tmpl.description}</p>
 </div>
 </button>
 );
 })}
 </div>
 </div>

 {/* FILAS DE DÍAS */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-3">
 <CalendarDays className="w-4 h-4 text-emerald-600" strokeWidth={2} />
 <p className="text-sm font-bold text-gray-900 dark:text-white">
 {t('your_week', { defaultValue: 'Secuencia Semanal' })}
 </p>
 </div>
 <span className="rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-500">
 Zona Horaria: {Intl.DateTimeFormat().resolvedOptions().timeZone}
 </span>
 </div>
 
 <div className="flex flex-col gap-3">
 {schedules.map((day: any) => {
 const info = daysOfWeek.find(d => d.id === day.dayOfWeek);
 const hasError = validationErrors[day.dayOfWeek];
 const isCopied = copiedFromDay === day.dayOfWeek;
 
 return (
 <div 
 key={day.dayOfWeek}
 className={cn(
 "flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 md:p-6 rounded-3xl border transition-all duration-300 shadow-sm",
 day.isActive ? "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800" : "bg-gray-50 dark:bg-[#050505] border-transparent", 
 isCopied && "border-emerald-500 ring-1 ring-emerald-500"
 )}
 >
 {/* Control de Activación */}
 <div className="flex items-center gap-4 min-w-[140px]">
 <Switch 
 checked={day.isActive} 
 onCheckedChange={v => handleChange(day.dayOfWeek, "isActive", v)}
 className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700" 
 />
 <span className={cn(
 "font-bold text-sm", 
 day.isActive ? (isCopied ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-white") : "text-gray-400 dark:text-gray-600"
 )}>
 {info?.short}
 </span>
 </div>

 {/* Entradas de Tiempo */}
 <div className="flex flex-1 items-center justify-start md:justify-end gap-3">
 {day.isActive ? (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-3">
 <div className={cn("relative rounded-xl overflow-hidden shadow-sm", hasError ? "border border-amber-200 bg-amber-50 dark:bg-amber-900/10" : "border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#050505]")}>
 <Input 
 type="time" 
 value={day.openTime} 
 onChange={e => handleChange(day.dayOfWeek, "openTime", e.target.value)}
 className={cn("w-[120px] h-10 border-0 bg-transparent text-sm font-semibold text-center focus-visible:ring-0", isCopied ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-white")} 
 />
 </div>
 
 <span className={cn("font-bold text-xs", isCopied ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500")}>
 {t('to', { defaultValue: 'a' })}
 </span>
 
 <div className={cn("relative rounded-xl overflow-hidden shadow-sm", hasError ? "border border-amber-200 bg-amber-50 dark:bg-amber-900/10" : "border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#050505]")}>
 <Input 
 type="time" 
 value={day.closeTime} 
 onChange={e => handleChange(day.dayOfWeek, "closeTime", e.target.value)}
 className={cn("w-[120px] h-10 border-0 bg-transparent text-sm font-semibold text-center focus-visible:ring-0", isCopied ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-white")} 
 />
 </div>
 
 <button 
 onClick={() => handleCopy(day.dayOfWeek)} 
 title={t('copy_all', { defaultValue: 'Copiar a Todos' })}
 className={cn(
 "h-10 w-10 rounded-xl flex items-center justify-center transition-colors shrink-0 border", 
 isCopied 
 ? "border-emerald-200 bg-emerald-50 text-emerald-600" 
 : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0a0a0a] hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
 )}
 >
 <Copy className="w-4 h-4" strokeWidth={2} />
 </button>
 </motion.div>
 ) : (
 <div className="flex items-center gap-3 text-gray-400 h-10 px-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#050505]">
 <Moon className="w-4 h-4" strokeWidth={2} />
 <span className="text-xs font-semibold">
 {t('closed', { defaultValue: 'Inactivo' })}
 </span>
 </div>
 )}
 </div>
 
 {/* Mensaje de Error Integrado */}
 {hasError && (
 <div className="w-full md:w-auto flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 bg-amber-50 dark:bg-amber-900/10 rounded-lg px-3 py-1.5 mt-2 md:mt-0 shadow-sm">
 <AlertCircle className="w-4 h-4" strokeWidth={2} />{hasError}
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>

 {/* AVISO DE DÍAS CERO */}
 {!isLoading && activeCount === 0 && (
 <div className="px-6 py-4 border border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-400 flex items-center gap-4 rounded-3xl mt-6 shadow-sm">
 <AlertCircle className="w-6 h-6" strokeWidth={2} />
 <p className="text-sm font-bold">
 {t('warning_no_days', { defaultValue: 'Advertencia: El escaparate digital se encuentra actualmente sin disponibilidad operativa.' })}
 </p>
 </div>
 )}

 </div>

 {/* FOOTER DE COMANDOS */}
 <DialogFooter className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
 <div className="w-full sm:w-auto text-left">
 {hasChanges && (
 <span className="text-sm font-semibold text-amber-600 flex items-center gap-3">
 <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
 {t('unsaved_changes', { defaultValue: 'Alteraciones pendientes de guardado' })}
 </span>
 )}
 </div>
 <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
 <Button 
 onClick={onClose} 
 disabled={isSaving || isLoading}
 className="w-full sm:w-auto border border-gray-200 dark:border-gray-800 rounded-xl bg-white text-gray-700 hover:bg-gray-50 dark:bg-[#050505] dark:text-gray-300 dark:hover:bg-[#111] transition-colors text-sm font-semibold h-12 px-8 shadow-sm"
 >
 {t('cancel', { defaultValue: 'Cancelar' })}
 </Button>
 <Button 
 onClick={handleSave} 
 disabled={isSaving || isLoading || Object.keys(validationErrors).length > 0 || !hasChanges}
 className={cn(
 "w-full sm:w-auto border rounded-xl text-sm font-semibold h-12 px-10 transition-colors disabled:opacity-50 shadow-sm",
 savingStep === "success" 
 ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
 : "bg-emerald-600 text-white border-0 hover:bg-emerald-700"
 )}
 >
 <AnimatePresence mode="wait">
 {savingStep === "saving" && (
 <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
 <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} /> {t('saving', { defaultValue: 'Guardando...' })}
 </motion.div>
 )}
 {savingStep === "success" && (
 <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
 <CheckCircle className="w-5 h-5" strokeWidth={2} /> {t('saved', { defaultValue: 'Completado' })}
 </motion.div>
 )}
 {savingStep === "idle" && (
 <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
 {t('save', { defaultValue: 'Guardar Disponibilidad' })}
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
