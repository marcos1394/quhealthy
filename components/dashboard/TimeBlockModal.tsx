"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Loader2, Plus, Sparkles, Clock, AlertCircle, X, Coffee, Utensils, Plane, Sun, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTimeBlock } from "@/hooks/useTimeBlock";
import { useTranslations } from "next-intl";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

interface TimeBlockModalProps { isOpen: boolean; onClose: () => void; onSaveSuccess: () => void; initialDate?: Date; }

const blockTemplates = [
 { id: "lunch", title: "ALMUERZO", icon: Utensils, duration: 60 },
 { id: "break", title: "DESCANSO", icon: Coffee, duration: 30 },
 { id: "vacation", title: "INACTIVO (DÍA)", icon: Plane, duration: 480 },
 { id: "morning", title: "BLOQUE MAÑANA", icon: Sun, duration: 120 }
];

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({ isOpen, onClose, onSaveSuccess, initialDate }) => {
 const [{ formData, loading, savingStep, validationError, duration, selectedTemplate }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_FORMDATA': return { ...state, formData: typeof action.payload === 'function' ? action.payload(state.formData) : action.payload };
 case 'SET_LOADING': return { ...state, loading: typeof action.payload === 'function' ? action.payload(state.loading) : action.payload };
 case 'SET_SAVINGSTEP': return { ...state, savingStep: typeof action.payload === 'function' ? action.payload(state.savingStep) : action.payload };
 case 'SET_VALIDATIONERROR': return { ...state, validationError: typeof action.payload === 'function' ? action.payload(state.validationError) : action.payload };
 case 'SET_DURATION': return { ...state, duration: typeof action.payload === 'function' ? action.payload(state.duration) : action.payload };
 case 'SET_SELECTEDTEMPLATE': return { ...state, selectedTemplate: typeof action.payload === 'function' ? action.payload(state.selectedTemplate) : action.payload };
 default: return state;
 }
 },
 {
 formData: { title: "BLOQUEO OPERATIVO", startDate: "", startTime: "", endDate: "", endTime: "" }, loading: false, savingStep: "idle", validationError: "", duration: 0, selectedTemplate: null
 }
 );

 const setFormData = (val: any) => dispatch({ type: 'SET_FORMDATA', payload: val });
 const setLoading = (val: any) => dispatch({ type: 'SET_LOADING', payload: val });
 const setSavingStep = (val: any) => dispatch({ type: 'SET_SAVINGSTEP', payload: val });
 const setValidationError = (val: any) => dispatch({ type: 'SET_VALIDATIONERROR', payload: val });
 const setDuration = (val: any) => dispatch({ type: 'SET_DURATION', payload: val });
 const setSelectedTemplate = (val: any) => dispatch({ type: 'SET_SELECTEDTEMPLATE', payload: val });






 const { createBlock, isCreating } = useTimeBlock();
 const t = useTranslations('DashboardTimeBlock');

 useEffect(() => {
 if (isOpen) {
 const today = initialDate || new Date();
 const offset = today.getTimezoneOffset() * 60000;
 const localISO = new Date(today.getTime() - offset).toISOString().split("T")[0];
 setFormData({ title: "BLOQUEO OPERATIVO", startDate: localISO, startTime: "12:00", endDate: localISO, endTime: "13:00" });
 setSavingStep("idle"); 
 setValidationError(""); 
 setSelectedTemplate(null);
 }
 }, [isOpen, initialDate]);

 useEffect(() => {
 if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
 const s = new Date(`${formData.startDate}T${formData.startTime}`);
 const e = new Date(`${formData.endDate}T${formData.endTime}`);
 const diffMins = Math.floor((e.getTime() - s.getTime()) / 60000);
 setDuration(diffMins);
 setValidationError(diffMins <= 0 ? t('end_after_start', { defaultValue: 'LA FECHA/HORA DE TÉRMINO DEBE SER POSTERIOR AL INICIO.' }) : "");
 }
 }, [formData, t]);

 const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { name, value } = e.target;
 
 setFormData((prev: any) => {
 const next = { ...prev, [name]: value };
 
 if (name === "startDate" || name === "startTime") {
 if (prev.startDate && prev.startTime && prev.endDate && prev.endTime) {
 const prevStart = new Date(`${prev.startDate}T${prev.startTime}`);
 const prevEnd = new Date(`${prev.endDate}T${prev.endTime}`);
 const prevDiffMins = Math.floor((prevEnd.getTime() - prevStart.getTime()) / 60000);
 
 if (prevDiffMins > 0 && next.startDate && next.startTime) {
 const newStart = new Date(`${next.startDate}T${next.startTime}`);
 const newEnd = new Date(newStart.getTime() + prevDiffMins * 60000);
 
 // Only auto-shift if the new date doesn't throw invalid date
 if (!isNaN(newEnd.getTime())) {
 next.endDate = newEnd.toISOString().split("T")[0];
 next.endTime = `${String(newEnd.getHours()).padStart(2, "0")}:${String(newEnd.getMinutes()).padStart(2, "0")}`;
 }
 }
 }
 }
 
 if (name === "endDate" || name === "endTime") {
 setSelectedTemplate(null);
 }
 
 return next;
 });
 };

 const applyTemplate = (id: string) => {
 const tmpl = blockTemplates.find(x => x.id === id); if (!tmpl) return;
 const startStr = formData.startDate || new Date().toISOString().split("T")[0];
 const startTimeStr = formData.startTime || "12:00";
 const startObj = new Date(`${startStr}T${startTimeStr}:00`);
 const endObj = new Date(startObj.getTime() + tmpl.duration * 60000);
 setFormData({
 title: tmpl.title, startDate: startStr, startTime: startTimeStr, endDate: endObj.toISOString().split("T")[0],
 endTime: `${String(endObj.getHours()).padStart(2, "0")}:${String(endObj.getMinutes()).padStart(2, "0")}`
 });
 setSelectedTemplate(id); 
 toast.success(t('template_applied', { name: tmpl.title, defaultValue: `MACRO "${tmpl.title}" APLICADA.` }));
 };

 const handleSave = async () => {
 if (validationError) return;
 setSavingStep("saving");
 const success = await createBlock({
 startDateTime: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
 endDateTime: new Date(`${formData.endDate}T${formData.endTime}`).toISOString(), 
 title: formData.title,
 reason: formData.title
 });
 if (success) { 
 setSavingStep("success"); 
 toast.success(t('success_msg', { defaultValue: 'BLOQUEO OPERATIVO REGISTRADO EN EL SISTEMA.' })); 
 setTimeout(() => { onSaveSuccess(); onClose(); }, 1500); 
 } else {
 setSavingStep("idle");
 }
 };

 const isValid = formData.startDate && formData.startTime && formData.endDate && formData.endTime && formData.title && !validationError;
 const fmtDuration = (m: number) => m < 60 ? `${m} MIN` : (m % 60 > 0 ? `${Math.floor(m / 60)}H ${m % 60}MIN` : `${Math.floor(m / 60)}H`);

 return (
 <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
 <DialogContent className="bg-white dark:bg-[#0a0a0a] border-0 text-black dark:text-white sm:max-w-3xl p-0 overflow-hidden rounded-3xl shadow-2xl flex flex-col max-h-[90vh] [&>button.absolute]:hidden">
 
 {/* HEADER */}
 <div className="px-6 md:px-8 py-6 md:py-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 flex items-start justify-between shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 shadow-sm">
 <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-500 mb-1">
 {t('subtitle', { defaultValue: 'Restringir disponibilidad operativa' })}
 </p>
 <DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
 {t('title', { defaultValue: 'Bloqueo de Agenda' })}
 </DialogTitle>
 </div>
 </div>
 {!loading && (
 <button 
 onClick={onClose} 
 className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#111] flex items-center justify-center transition-colors shrink-0"
 >
 <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
 </button>
 )}
 </div>

 {/* CUERPO DEL MODAL (GRID BLUEPRINT) */}
 <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#050505] flex flex-col">
 
 {/* MACROS (Templates) */}
 <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
 <div className="flex items-center gap-3 mb-4">
 <Sparkles className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
 {t('templates_label', { defaultValue: 'MACROS DE CONFIGURACIÓN RÁPIDA' })}
 </p>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-black/20 dark:border-white/20">
 {blockTemplates.map(tmpl => {
 const Icon = tmpl.icon; 
 const isSel = selectedTemplate === tmpl.id;
 return (
 <button 
 key={tmpl.id} 
 onClick={() => applyTemplate(tmpl.id)} 
 className={cn(
 "flex flex-col items-start gap-4 p-5 border-b border-r border-black/20 dark:border-white/20 transition-all duration-300 text-left group rounded-none",
 isSel 
 ? "bg-black text-white dark:bg-white dark:text-black" 
 : "bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:border-black hover:text-white dark:hover:bg-white dark:hover:border-white dark:hover:text-black hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)]"
 )}
 >
 <div className={cn("w-10 h-10 border flex items-center justify-center shrink-0 transition-colors", 
 isSel 
 ? "border-white/30 dark:border-black/30 bg-black text-white dark:bg-white dark:text-black" 
 : "border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white group-hover:bg-white group-hover:text-black group-hover:border-transparent dark:group-hover:bg-black dark:group-hover:text-white dark:group-hover:border-transparent"
 )}>
 <Icon className="w-5 h-5" strokeWidth={1.5} />
 </div>
 <div>
 <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors", isSel ? "text-white dark:text-black" : "text-black dark:text-white group-hover:text-white dark:group-hover:text-black")}>
 {tmpl.title}
 </p>
 <p className={cn("text-[9px] font-bold uppercase tracking-widest transition-colors", isSel ? "opacity-70" : "text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600")}>
 {fmtDuration(tmpl.duration)}
 </p>
 </div>
 </button>
 );
 })}
 </div>
 </div>

 {/* FORMULARIO DE ENTRADA (CELDAS DE DATOS) */}
 <div className="grid grid-cols-1 gap-0">
 
 {/* MOTIVO */}
 <div className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col">
 <Label className="flex items-center text-[9px] uppercase font-bold tracking-widest text-gray-500 mb-3 gap-2">
 <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">1</span>
 {t('event_title_label', { defaultValue: 'MOTIVO / ETIQUETA DEL BLOQUEO' })}
 </Label>
 <Input 
 name="title" 
 value={formData.title} 
 onChange={handleInput} 
 placeholder={t('event_title_placeholder', { defaultValue: 'EJ. RECESO, ASUNTOS PERSONALES...' })}
 className="bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 h-12 text-sm font-medium rounded-xl transition-colors focus-visible:ring-emerald-500 w-full" 
 disabled={loading} 
 />
 </div>

 {/* SELECTORES DE FECHA Y HORA */}
 <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white dark:bg-[#0a0a0a]">
 
 {/* Inicio */}
 <div className="flex flex-col">
 <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
 <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500">2</span>
 {t('start', { defaultValue: 'Inicio (Desde)' })}
 </div>
 <div className="flex flex-col gap-3">
 <DatePicker
 value={formData.startDate ? new Date(formData.startDate + "T12:00:00") : undefined}
 onChange={(date) => handleInput({ target: { name: 'startDate', value: date ? format(date, "yyyy-MM-dd") : "" } } as any)}
 disabled={loading ? () => true : undefined}
 placeholder="DD/MM/AAAA"
 className="bg-gray-50 dark:bg-[#050505] h-12 rounded-xl border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-emerald-500"
 popoverClassName="rounded-xl border-gray-100 shadow-xl bg-white dark:bg-[#0a0a0a]"
 />
 <Input 
 type="time" 
 name="startTime" 
 value={formData.startTime} 
 onChange={handleInput}
 className="bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 h-12 rounded-xl text-sm font-medium transition-colors focus-visible:ring-emerald-500 w-full" 
 disabled={loading} 
 />
 </div>
 </div>
 
 {/* Término */}
 <div className="flex flex-col">
 <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
 <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500">3</span>
 {t('end', { defaultValue: 'Término (Hasta)' })}
 </div>
 <div className="flex flex-col gap-3">
 <DatePicker
 value={formData.endDate ? new Date(formData.endDate + "T12:00:00") : undefined}
 onChange={(date) => handleInput({ target: { name: 'endDate', value: date ? format(date, "yyyy-MM-dd") : "" } } as any)}
 disabled={loading ? () => true : undefined}
 placeholder="DD/MM/AAAA"
 className="bg-gray-50 dark:bg-[#050505] h-12 rounded-xl border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-emerald-500"
 popoverClassName="rounded-xl border-gray-100 shadow-xl bg-white dark:bg-[#0a0a0a]"
 />
 <Input 
 type="time" 
 name="endTime" 
 value={formData.endTime} 
 onChange={handleInput}
 className="bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 h-12 rounded-xl text-sm font-medium transition-colors focus-visible:ring-emerald-500 w-full" 
 disabled={loading} 
 />
 </div>
 </div>
 </div>
 
 {/* BLOQUE DE ERROR */}
 {validationError && (
 <div className="px-6 md:px-8 pb-6 bg-white dark:bg-[#0a0a0a]">
 <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex items-start gap-4">
 <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
 <div className="flex-1 text-left">
 <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-500 mb-1">
 {t('validation_error', { defaultValue: 'Error de Validación' })}
 </p>
 <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
 {validationError}
 </p>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* FOOTER DE COMANDOS */}
 <DialogFooter className="flex-col sm:flex-row gap-4 p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 shrink-0">
 <Button 
 variant="outline" 
 onClick={onClose} 
 disabled={loading}
 className="flex-1 sm:flex-none h-12 border border-gray-200 dark:border-gray-800 bg-white text-gray-700 hover:bg-gray-50 dark:bg-[#050505] dark:text-gray-300 dark:hover:bg-[#111] rounded-xl text-sm font-semibold transition-colors px-10 shadow-sm"
 >
 {t('cancel', { defaultValue: 'Cancelar' })}
 </Button>
 <Button 
 onClick={handleSave} 
 disabled={loading || !isValid}
 className={cn(
 "flex-1 sm:flex-none min-w-[220px] h-12 border rounded-xl text-sm font-semibold transition-colors px-10 shadow-sm disabled:opacity-50",
 savingStep === "success" 
 ? "border-emerald-200 bg-emerald-50 text-emerald-700" 
 : "border-0 bg-emerald-600 text-white hover:bg-emerald-700"
 )}
 >
 <AnimatePresence mode="wait">
 {savingStep === "saving" && (
 <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
 <QhSpinner size="sm" className="text-current" /> {t('saving', { defaultValue: 'Procesando...' })}
 </motion.div>
 )}
 {savingStep === "success" && (
 <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
 <CheckCircle2 className="w-5 h-5" strokeWidth={2} /> {t('created', { defaultValue: 'Bloqueo Aplicado' })}
 </motion.div>
 )}
 {savingStep === "idle" && (
 <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
 <Plus className="w-5 h-5" strokeWidth={2} /> {t('block_time', { defaultValue: 'Registrar Bloqueo' })}
 </motion.div>
 )}
 </AnimatePresence>
 </Button>
 </DialogFooter>
 
 </DialogContent>
 </Dialog>
 );
};