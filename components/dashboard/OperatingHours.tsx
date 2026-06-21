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
  { id: 1, key: "monday", short: "MON" }, { id: 2, key: "tuesday", short: "TUE" }, { id: 3, key: "wednesday", short: "WED" },
  { id: 4, key: "thursday", short: "THU" }, { id: 5, key: "friday", short: "FRI" }, { id: 6, key: "saturday", short: "SAT" }, { id: 0, key: "sunday", short: "SUN" }
];

const scheduleTemplates = [
  {
    id: "standard", name: "MON–FRI", description: "9:00 – 18:00", icon: Sun,
    apply: (s: UIDaySchedule[]) => s.map(d => ({ ...d, isActive: d.dayOfWeek >= 1 && d.dayOfWeek <= 5, openTime: "09:00", closeTime: "18:00" }))
  },
  {
    id: "extended", name: "MON–SAT EXT", description: "8:00 – 20:00", icon: Zap,
    apply: (s: UIDaySchedule[]) => s.map(d => ({ ...d, isActive: d.dayOfWeek >= 1 && d.dayOfWeek <= 6, openTime: "08:00", closeTime: "20:00" }))
  },
  {
    id: "allweek", name: "FULL WEEK", description: "9:00 – 17:00", icon: Calendar,
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
        if (ch * 60 + cm <= oh * 60 + om) errors[d.dayOfWeek] = t('error_close_after_open');
      }
    });
    setValidationErrors(errors);
  }, [schedules]);

  const handleChange = (dayId: number, field: keyof UIDaySchedule, value: string | boolean) =>
    setSchedules(c => c.map(d => d.dayOfWeek === dayId ? { ...d, [field]: value } : d));

  const handleCopy = (srcId: number) => {
    const src = schedules.find(s => s.dayOfWeek === srcId);
    if (!src) return;
    setSchedules(c => c.map(d => d.dayOfWeek !== srcId ? { ...d, openTime: src.openTime, closeTime: src.closeTime, isActive: src.isActive } : d));
    setCopiedFromDay(srcId); setTimeout(() => setCopiedFromDay(null), 2000);
    toast.success(t('copied_toast'));
  };

  const handleSave = async () => {
    if (Object.keys(validationErrors).length > 0) { return; return; }
    setSavingStep("saving");
    const success = await saveSchedules(DEFAULT_LOCATION_ID, schedules);
    if (success) { setSavingStep("success"); toast.success(t('save_success')); setTimeout(() => { onSaveSuccess(); onClose(); }, 1000); }
    else setSavingStep("idle");
  };

  const activeCount = schedules.filter(s => s.isActive).length;
  const hasChanges = JSON.stringify(schedules) !== JSON.stringify(originalSchedules);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white text-black dark:text-white sm:max-w-3xl p-0 overflow-hidden rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
        {/* Header */}
        <div className="px-6 py-5 bg-gray-50 dark:bg-[#111] border-b-2 border-black dark:border-white relative">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
                  <Clock className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-2xl font-serif font-bold tracking-widest uppercase">{t('title')}</DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{t('subtitle')}</DialogDescription>
                </div>
              </div>
              {!isSaving && !isLoading && (
                <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-[#0a0a0a] rounded-none">
                  <X className="w-5 h-5" strokeWidth={2} />
                </Button>
              )}
            </div>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center">
            <QhSpinner size="md" />
            <p className="text-[10px] font-bold uppercase tracking-widest mt-4 animate-pulse">{t('loading')}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="px-6 py-6 overflow-y-auto max-h-[65vh] custom-scrollbar space-y-8">
              {/* Templates */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-4 h-4 text-black dark:text-white" strokeWidth={2} />
                  <p className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">{t('templates_label')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scheduleTemplates.map(tmpl => {
                    const Icon = tmpl.icon;
                    return (
                      <button key={tmpl.id} onClick={() => { setSchedules(tmpl.apply(schedules)); toast.success(`"${tmpl.name}" ${t('template_applied', { name: '' }).includes('applied') ? 'applied' : t('template_applied', { name: tmpl.name })}`); }}
                        className={cn("flex items-center gap-3 p-3 border-2 border-black dark:border-white bg-white dark:bg-[#0a0a0a] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-left group shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]")}>
                        <div className="p-2 border-2 border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                          <Icon className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest">{tmpl.name}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-0.5">{tmpl.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Rows */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-black dark:text-white" strokeWidth={2} />
                    <p className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">{t('your_week')}</p>
                  </div>
                  <Badge variant="outline" className="border-2 border-black dark:border-white rounded-none text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </Badge>
                </div>
                <div className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] divide-y-2 divide-black dark:divide-white">
                  {schedules.map(day => {
                    const info = daysOfWeek.find(d => d.id === day.dayOfWeek);
                    const hasError = validationErrors[day.dayOfWeek];
                    const isCopied = copiedFromDay === day.dayOfWeek;
                    return (
                      <div key={day.dayOfWeek}
                        className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 transition-colors",
                          !day.isActive && "opacity-60", isCopied && "bg-black text-white dark:bg-white dark:text-black")}>
                        <div className="flex items-center gap-4 min-w-[140px]">
                          <Switch checked={day.isActive} onCheckedChange={v => handleChange(day.dayOfWeek, "isActive", v)}
                            className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-200 border-2 border-black dark:border-white rounded-none [&>span]:rounded-none" />
                          <span className={cn("font-bold text-sm uppercase tracking-widest", day.isActive ? (isCopied ? "text-white dark:text-black" : "text-black dark:text-white") : "text-gray-500")}>{t(`days.${info?.key?.toLowerCase()}`)}</span>
                        </div>
                        <div className="flex flex-1 items-center justify-end gap-3">
                          {day.isActive ? (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                              <div className={cn("relative border-2", hasError ? "border-red-500 bg-red-50" : "border-black dark:border-white bg-white dark:bg-[#0a0a0a]")}>
                                <Input type="time" value={day.openTime} onChange={e => handleChange(day.dayOfWeek, "openTime", e.target.value)}
                                  className="w-[110px] h-10 border-0 bg-transparent text-sm font-bold tracking-widest text-center focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none text-black dark:text-white" />
                              </div>
                              <span className={cn("font-bold text-[10px] uppercase tracking-widest", isCopied ? "text-white dark:text-black" : "text-gray-500")}>{t('to')}</span>
                              <div className={cn("relative border-2", hasError ? "border-red-500 bg-red-50" : "border-black dark:border-white bg-white dark:bg-[#0a0a0a]")}>
                                <Input type="time" value={day.closeTime} onChange={e => handleChange(day.dayOfWeek, "closeTime", e.target.value)}
                                  className="w-[110px] h-10 border-0 bg-transparent text-sm font-bold tracking-widest text-center focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none text-black dark:text-white" />
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleCopy(day.dayOfWeek)} title={t('copy_all')}
                                className={cn("h-10 w-10 border-2 rounded-none transition-colors", isCopied ? "border-white dark:border-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white" : "border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black")}>
                                <Copy className="w-4 h-4" strokeWidth={2} />
                              </Button>
                            </motion.div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-500 h-10 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700">
                              <Moon className="w-4 h-4" strokeWidth={2} /><span className="text-[10px] font-bold uppercase tracking-widest">{t('closed')}</span>
                            </div>
                          )}
                        </div>
                        {hasError && (
                          <div className="w-full md:w-auto flex items-center gap-2 text-[10px] font-bold tracking-widest text-red-600 border-2 border-red-600 bg-white px-3 py-1 mt-2 md:mt-0">
                            <AlertCircle className="w-3 h-3" strokeWidth={2} />{hasError}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {!isLoading && activeCount === 0 && (
              <div className="px-6 py-4 bg-black text-white dark:bg-white dark:text-black border-t-2 border-black dark:border-white flex items-center gap-3">
                <AlertCircle className="w-5 h-5" strokeWidth={2} />
                <p className="text-[10px] uppercase tracking-widest font-bold">{t('warning_no_days')}</p>
              </div>
            )}

            <DialogFooter className="px-6 py-5 bg-gray-50 dark:bg-[#111] border-t-2 border-black dark:border-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto text-left">
                {hasChanges && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-black dark:bg-white animate-pulse" />{t('unsaved_changes')}
                  </span>
                )}
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="outline" onClick={onClose} disabled={isSaving || isLoading}
                  className="flex-1 sm:flex-none border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] text-[10px] uppercase font-bold tracking-widest h-12 px-8 bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                  {t('cancel')}
                </Button>
                <Button onClick={handleSave} disabled={isSaving || isLoading || Object.keys(validationErrors).length > 0 || !hasChanges}
                  className={cn("flex-1 sm:flex-none min-w-[140px] border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] text-[10px] uppercase font-bold tracking-widest h-12 px-8 transition-colors",
                    savingStep === "success" ? "bg-white text-black dark:bg-[#0a0a0a] dark:text-white" : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200")}>
                  <AnimatePresence mode="wait">
                    {savingStep === "saving" && <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />{t('saving')}</motion.div>}
                    {savingStep === "success" && <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" strokeWidth={2} />{t('saved')}</motion.div>}
                    {savingStep === "idle" && <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{t('save')}</motion.div>}
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