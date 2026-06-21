"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Loader2, Plus, Sparkles, Clock, AlertCircle, X, Coffee, Utensils, Plane, Sun } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTimeBlock } from "@/hooks/useTimeBlock";
import { useTranslations } from "next-intl";

interface TimeBlockModalProps { isOpen: boolean; onClose: () => void; onSaveSuccess: () => void; initialDate?: Date; }

const blockTemplates = [
  { id: "lunch", title: "ALMUERZO", icon: Utensils, duration: 60 },
  { id: "break", title: "DESCANSO", icon: Coffee, duration: 30 },
  { id: "vacation", title: "INACTIVO (DÍA)", icon: Plane, duration: 480 },
  { id: "morning", title: "BLOQUE MAÑANA", icon: Sun, duration: 120 }
];

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({ isOpen, onClose, onSaveSuccess, initialDate }) => {
  const [formData, setFormData] = useState({ title: "BLOQUEO OPERATIVO", startDate: "", startTime: "", endDate: "", endTime: "" });
  const [loading, setLoading] = useState(false);
  const [savingStep, setSavingStep] = useState<"idle" | "saving" | "success">("idle");
  const [validationError, setValidationError] = useState("");
  const [duration, setDuration] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
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

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const applyTemplate = (id: string) => {
    const tmpl = blockTemplates.find(x => x.id === id); if (!tmpl) return;
    const startStr = formData.startDate || new Date().toISOString().split("T")[0];
    const startObj = new Date(`${startStr}T12:00:00`);
    const endObj = new Date(startObj.getTime() + tmpl.duration * 60000);
    setFormData({
      title: tmpl.title, startDate: startStr, startTime: "12:00", endDate: endObj.toISOString().split("T")[0],
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
      <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white text-black dark:text-white sm:max-w-2xl p-0 overflow-hidden rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
        
        {/* HEADER ARQUITECTÓNICO */}
        <div className="px-6 py-6 bg-gray-50 dark:bg-[#050505] border-b border-black dark:border-white relative">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight uppercase">
                    {t('title', { defaultValue: 'BLOQUEO DE AGENDA' })}
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                    {t('subtitle', { defaultValue: 'RESTRINGIR DISPONIBILIDAD PARA CITAS EN UN PERIODO ESPECÍFICO.' })}
                  </DialogDescription>
                </div>
              </div>
              {!loading && (
                <button 
                  onClick={onClose} 
                  className="w-10 h-10 border border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-[#0a0a0a] flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* CUERPO DEL MODAL */}
        <div className="px-6 py-8 overflow-y-auto max-h-[65vh] custom-scrollbar space-y-10">
          
          {/* MACROS (Templates) */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
              <p className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">
                {t('templates_label', { defaultValue: 'MACROS RÁPIDAS' })}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {blockTemplates.map(tmpl => {
                const Icon = tmpl.icon; 
                const isSel = selectedTemplate === tmpl.id;
                return (
                  <button 
                    key={tmpl.id} 
                    onClick={() => applyTemplate(tmpl.id)} 
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 border transition-colors rounded-none text-center group",
                      isSel 
                        ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-[4px_4px_0_0_currentColor]" 
                        : "border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:shadow-[4px_4px_0_0_currentColor] hover:-translate-y-[2px] hover:-translate-x-[2px]"
                    )}
                  >
                    <div className={cn("w-10 h-10 border flex items-center justify-center shrink-0 transition-colors", 
                      isSel 
                        ? "border-white dark:border-black bg-black text-white dark:bg-white dark:text-black" 
                        : "border-black dark:border-white bg-gray-50 dark:bg-[#050505] text-black dark:text-white group-hover:bg-transparent group-hover:border-white dark:group-hover:border-black"
                    )}>
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", isSel ? "text-white dark:text-black" : "text-black dark:text-white group-hover:text-inherit")}>
                        {tmpl.title}
                      </p>
                      <p className={cn("text-[9px] font-bold uppercase tracking-widest", isSel ? "opacity-70" : "text-gray-500 group-hover:text-inherit group-hover:opacity-70")}>
                        {fmtDuration(tmpl.duration)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full h-px bg-black dark:bg-white" />

          {/* MOTIVO (Título) */}
          <div className="space-y-3">
            <Label className="flex items-center text-[10px] uppercase font-bold tracking-widest text-gray-500">
              {t('event_title_label', { defaultValue: 'MOTIVO / ETIQUETA DEL BLOQUEO' })}
            </Label>
            <Input 
              name="title" 
              value={formData.title} 
              onChange={handleInput} 
              placeholder={t('event_title_placeholder', { defaultValue: 'EJ. RECESO, ASUNTOS PERSONALES...' })}
              className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white h-12 text-sm font-bold uppercase tracking-widest transition-colors focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]" 
              disabled={loading} 
            />
          </div>

          {/* SELECTORES DE FECHA Y HORA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4 p-6 bg-gray-50 dark:bg-[#050505] border border-black dark:border-white">
              <div className="flex items-center justify-between border-b border-black dark:border-white pb-3">
                <div className="flex items-center gap-3 text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">
                  <Clock className="w-4 h-4" strokeWidth={1.5} />
                  {t('start', { defaultValue: 'INICIO' })}
                </div>
                <span className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white text-[9px] uppercase font-bold tracking-widest px-2 py-1">
                  {t('from', { defaultValue: 'DESDE' })}
                </span>
              </div>
              <div className="space-y-4 flex flex-col">
                <Input 
                  type="date" 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleInput}
                  className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white h-12 text-[10px] font-bold uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white rounded-none transition-colors" 
                  disabled={loading} 
                />
                <Input 
                  type="time" 
                  name="startTime" 
                  value={formData.startTime} 
                  onChange={handleInput}
                  className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white h-12 text-[10px] font-bold uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white rounded-none transition-colors" 
                  disabled={loading} 
                />
              </div>
            </div>

            <div className="space-y-4 p-6 bg-gray-50 dark:bg-[#050505] border border-black dark:border-white">
              <div className="flex items-center justify-between border-b border-black dark:border-white pb-3">
                <div className="flex items-center gap-3 text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">
                  <Clock className="w-4 h-4" strokeWidth={1.5} />
                  {t('end', { defaultValue: 'TÉRMINO' })}
                </div>
                <span className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white text-[9px] uppercase font-bold tracking-widest px-2 py-1">
                  {t('until', { defaultValue: 'HASTA' })}
                </span>
              </div>
              <div className="space-y-4 flex flex-col">
                <Input 
                  type="date" 
                  name="endDate" 
                  value={formData.endDate} 
                  onChange={handleInput}
                  className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white h-12 text-[10px] font-bold uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white rounded-none transition-colors" 
                  disabled={loading} 
                />
                <Input 
                  type="time" 
                  name="endTime" 
                  value={formData.endTime} 
                  onChange={handleInput}
                  className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white h-12 text-[10px] font-bold uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white rounded-none transition-colors" 
                  disabled={loading} 
                />
              </div>
            </div>
          </div>

          {/* BLOQUE DE ERROR */}
          {validationError && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-500 p-4 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 text-left mt-0.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">
                  {t('validation_error', { defaultValue: 'ERROR DE VALIDACIÓN' })}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {validationError}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER Y COMANDOS */}
        <DialogFooter className="flex-col sm:flex-row gap-4 p-6 bg-gray-50 dark:bg-[#050505] border-t border-black dark:border-white">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 sm:flex-none h-14 border border-black dark:border-white bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none text-[10px] uppercase font-bold tracking-widest transition-colors px-8"
          >
            {t('cancel', { defaultValue: 'ANULAR' })}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || !isValid}
            className={cn(
              "flex-1 sm:flex-none min-w-[200px] h-14 border border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] text-[10px] uppercase font-bold tracking-widest transition-colors px-8 disabled:opacity-50 disabled:shadow-none",
              savingStep === "success" 
                ? "bg-white text-black dark:bg-[#0a0a0a] dark:text-white" 
                : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            )}
          >
            <AnimatePresence mode="wait">
              {savingStep === "saving" && (
                <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> {t('saving', { defaultValue: 'PROCESANDO...' })}
                </motion.div>
              )}
              {savingStep === "success" && (
                <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /> {t('created', { defaultValue: 'BLOQUEO APLICADO' })}
                </motion.div>
              )}
              {savingStep === "idle" && (
                <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
                  <Plus className="w-4 h-4" strokeWidth={1.5} /> {t('block_time', { defaultValue: 'REGISTRAR BLOQUEO' })}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>
        
      </DialogContent>
    </Dialog>
  );
};