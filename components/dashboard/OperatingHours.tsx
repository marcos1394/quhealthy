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

interface OperatingHoursModalProps { isOpen: boolean; onClose: () => void; onSaveSuccess: () => void; }

const daysOfWeek = [
  { id: 1, key: "monday", short: "Mon" }, { id: 2, key: "tuesday", short: "Tue" }, { id: 3, key: "wednesday", short: "Wed" },
  { id: 4, key: "thursday", short: "Thu" }, { id: 5, key: "friday", short: "Fri" }, { id: 6, key: "saturday", short: "Sat" }, { id: 0, key: "sunday", short: "Sun" }
];

const scheduleTemplates = [
  {
    id: "standard", name: "Mon–Fri", description: "9:00 – 18:00", icon: Sun,
    color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/40",
    apply: (s: UIDaySchedule[]) => s.map(d => ({ ...d, isActive: d.dayOfWeek >= 1 && d.dayOfWeek <= 5, openTime: "09:00", closeTime: "18:00" }))
  },
  {
    id: "extended", name: "Mon–Sat Extended", description: "8:00 – 20:00", icon: Zap,
    color: "text-medical-600 dark:text-medical-400", bg: "bg-medical-50 dark:bg-medical-500/10 border-medical-200 dark:border-medical-500/20 hover:border-medical-300 dark:hover:border-medical-500/40",
    apply: (s: UIDaySchedule[]) => s.map(d => ({ ...d, isActive: d.dayOfWeek >= 1 && d.dayOfWeek <= 6, openTime: "08:00", closeTime: "20:00" }))
  },
  {
    id: "allweek", name: "Full Week", description: "9:00 – 17:00", icon: Calendar,
    color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-500/40",
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
        const data = await fetchSchedules();
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
    if (Object.keys(validationErrors).length > 0) { toast.error(t('save_error')); return; }
    setSavingStep("saving");
    const success = await saveSchedules(schedules);
    if (success) { setSavingStep("success"); toast.success(t('save_success')); setTimeout(() => { onSaveSuccess(); onClose(); }, 1000); }
    else setSavingStep("idle");
  };

  const activeCount = schedules.filter(s => s.isActive).length;
  const hasChanges = JSON.stringify(schedules) !== JSON.stringify(originalSchedules);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-2xl p-0 overflow-hidden rounded-xl transition-colors">
        {/* Header */}
        <div className="px-5 pt-5 pb-3.5 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 relative">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-200 dark:border-medical-500/20">
                  <Clock className="w-5 h-5 text-medical-600 dark:text-medical-400" />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">{t('title')}</DialogTitle>
                  <DialogDescription className="text-slate-500 dark:text-slate-400 font-light text-sm">{t('subtitle')}</DialogDescription>
                </div>
              </div>
              {!isSaving && !isLoading && (
                <Button variant="ghost" size="default" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="h-[350px] flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-medical-600 dark:text-medical-400 animate-spin mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-light">{t('loading')}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="px-5 py-5 overflow-y-auto max-h-[60vh] custom-scrollbar space-y-6">
              {/* Templates */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5 px-0.5">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{t('templates_label')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {scheduleTemplates.map(tmpl => {
                    const Icon = tmpl.icon;
                    return (
                      <button key={tmpl.id} onClick={() => { setSchedules(tmpl.apply(schedules)); toast.success(`"${tmpl.name}" ${t('template_applied', { name: '' }).includes('applied') ? 'applied' : t('template_applied', { name: tmpl.name })}`); }}
                        className={cn("flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left group", tmpl.bg)}>
                        <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg group-hover:scale-105 transition-transform border border-slate-200 dark:border-slate-700">
                          <Icon className={cn("w-3.5 h-3.5", tmpl.color)} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">{tmpl.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">{tmpl.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Rows */}
              <div>
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{t('your_week')}</p>
                  </div>
                  <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 text-[10px]">
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </Badge>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
                  {schedules.map(day => {
                    const info = daysOfWeek.find(d => d.id === day.dayOfWeek);
                    const hasError = validationErrors[day.dayOfWeek];
                    const isCopied = copiedFromDay === day.dayOfWeek;
                    return (
                      <div key={day.dayOfWeek}
                        className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 transition-all",
                          !day.isActive && "opacity-60", isCopied && "bg-emerald-50 dark:bg-emerald-500/10")}>
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <Switch checked={day.isActive} onCheckedChange={v => handleChange(day.dayOfWeek, "isActive", v)}
                            className="data-[state=checked]:bg-medical-600 dark:data-[state=checked]:bg-medical-500" />
                          <span className={cn("font-medium text-sm", day.isActive ? "text-slate-900 dark:text-white" : "text-slate-400")}>{t(`days.${info?.key}`)}</span>
                        </div>
                        <div className="flex flex-1 items-center justify-end gap-2">
                          {day.isActive ? (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                              <div className={cn("relative rounded-lg border transition-colors", hasError ? "border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-500/5" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900")}>
                                <Input type="time" value={day.openTime} onChange={e => handleChange(day.dayOfWeek, "openTime", e.target.value)}
                                  className="w-[100px] h-8 border-0 bg-transparent text-sm font-medium text-center focus-visible:ring-0 focus-visible:ring-offset-0" />
                              </div>
                              <span className="text-slate-300 dark:text-slate-600 font-medium text-xs">{t('to')}</span>
                              <div className={cn("relative rounded-lg border transition-colors", hasError ? "border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-500/5" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900")}>
                                <Input type="time" value={day.closeTime} onChange={e => handleChange(day.dayOfWeek, "closeTime", e.target.value)}
                                  className="w-[100px] h-8 border-0 bg-transparent text-sm font-medium text-center focus-visible:ring-0 focus-visible:ring-offset-0" />
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleCopy(day.dayOfWeek)}
                                className="h-8 px-2 text-xs text-medical-600 dark:text-medical-400 hover:text-medical-700 dark:hover:text-medical-300 hover:bg-medical-50 dark:hover:bg-medical-500/10 rounded-lg hidden sm:flex items-center gap-1 border border-transparent hover:border-medical-200 dark:hover:border-medical-500/20">
                                <Copy className="w-3 h-3" /><span className="hidden md:inline font-medium">{t('copy_all')}</span>
                              </Button>
                            </motion.div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 h-8 px-3">
                              <Moon className="w-3.5 h-3.5" /><span className="text-sm font-light">{t('closed')}</span>
                            </div>
                          )}
                        </div>
                        {hasError && (
                          <div className="w-full sm:w-auto flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-2 py-0.5 rounded-md">
                            <AlertCircle className="w-2.5 h-2.5" />{hasError}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {!isLoading && activeCount === 0 && (
              <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-500/5 border-t border-amber-200 dark:border-amber-500/20 flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{t('warning_no_days')}</p>
              </div>
            )}

            <DialogFooter className="px-5 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between sm:justify-between">
              <div className="hidden sm:block">
                {hasChanges && (
                  <span className="text-xs font-medium text-medical-600 dark:text-medical-400 flex items-center gap-1.5 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-medical-600 dark:bg-medical-400" />{t('unsaved_changes')}
                  </span>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="ghost" onClick={onClose} disabled={isSaving || isLoading}
                  className="flex-1 sm:flex-none text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium text-sm">
                  {t('cancel')}
                </Button>
                <Button onClick={handleSave} disabled={isSaving || isLoading || Object.keys(validationErrors).length > 0 || !hasChanges}
                  className={cn("flex-1 sm:flex-none min-w-[120px] rounded-xl font-semibold shadow-none transition-all text-sm",
                    savingStep === "success" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100")}>
                  <AnimatePresence mode="wait">
                    {savingStep === "saving" && <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" />{t('saving')}</motion.div>}
                    {savingStep === "success" && <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" />{t('saved')}</motion.div>}
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