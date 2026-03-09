"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Loader2, Plus, Sparkles, Clock, AlertCircle, X, Coffee, Utensils, Plane, Sun, Info, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTimeBlock } from "@/hooks/useTimeBlock";
import { useTranslations } from "next-intl";
import { handleApiError } from '@/lib/handleApiError';

interface TimeBlockModalProps { isOpen: boolean; onClose: () => void; onSaveSuccess: () => void; initialDate?: Date; }

const blockTemplates = [
  { id: "lunch", title: "Lunch", icon: Utensils, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-500/10", borderColor: "border-orange-200 dark:border-orange-500/20", duration: 60 },
  { id: "break", title: "Break", icon: Coffee, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-500/10", borderColor: "border-blue-200 dark:border-blue-500/20", duration: 30 },
  { id: "vacation", title: "Vacation", icon: Plane, color: "text-medical-600 dark:text-medical-400", bgColor: "bg-medical-50 dark:bg-medical-500/10", borderColor: "border-medical-200 dark:border-medical-500/20", duration: 480 },
  { id: "morning", title: "Morning Routine", icon: Sun, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10", borderColor: "border-amber-200 dark:border-amber-500/20", duration: 120 }
];

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({ isOpen, onClose, onSaveSuccess, initialDate }) => {
  const [formData, setFormData] = useState({ title: "Personal Time", startDate: "", startTime: "", endDate: "", endTime: "" });
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
      setFormData({ title: "Personal Time", startDate: localISO, startTime: "12:00", endDate: localISO, endTime: "13:00" });
      setSavingStep("idle"); setValidationError(""); setSelectedTemplate(null);
    }
  }, [isOpen, initialDate]);

  useEffect(() => {
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const s = new Date(`${formData.startDate}T${formData.startTime}`);
      const e = new Date(`${formData.endDate}T${formData.endTime}`);
      const diffMins = Math.floor((e.getTime() - s.getTime()) / 60000);
      setDuration(diffMins);
      setValidationError(diffMins <= 0 ? t('end_after_start') : "");
    }
  }, [formData]);

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
    setSelectedTemplate(id); toast.success(t('template_applied', { name: tmpl.title }));
  };

  const handleSave = async () => {
    if (validationError) { return; return; }
    setSavingStep("saving");
    const success = await createBlock({
      startDateTime: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
      endDateTime: new Date(`${formData.endDate}T${formData.endTime}`).toISOString(), reason: formData.title
    });
    if (success) { setSavingStep("success"); toast.success("Time blocked!"); setTimeout(() => { onSaveSuccess(); onClose(); }, 1500); }
    else setSavingStep("idle");
  };

  const isValid = formData.startDate && formData.startTime && formData.endDate && formData.endTime && formData.title && !validationError;
  const fmtDuration = (m: number) => m < 60 ? `${m} min` : (m % 60 > 0 ? `${Math.floor(m / 60)}h ${m % 60}min` : `${Math.floor(m / 60)}h`);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-xl max-h-[95vh] overflow-y-auto rounded-xl transition-colors">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200 }}
                className="p-2.5 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-200 dark:border-medical-500/20">
                <Calendar className="w-5 h-5 text-medical-600 dark:text-medical-400" />
              </motion.div>
              <div className="flex-1 text-left">
                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white mb-0.5">{t('title')}</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm font-light">{t('subtitle')}</DialogDescription>
              </div>
            </div>
            {!loading && (
              <Button variant="ghost" size="default" onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Templates */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{t('templates_label')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {blockTemplates.map(tmpl => {
                const Icon = tmpl.icon; const isSel = selectedTemplate === tmpl.id;
                return (
                  <motion.button key={tmpl.id} onClick={() => applyTemplate(tmpl.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={cn("flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all",
                      isSel ? cn(tmpl.bgColor, tmpl.borderColor, "ring-2 ring-medical-500 dark:ring-medical-400") : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-medical-200 dark:hover:border-medical-500/30")}>
                    <div className={cn("p-1.5 rounded-lg", isSel ? tmpl.bgColor : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700")}>
                      <Icon className={cn("w-3.5 h-3.5", isSel ? tmpl.color : "text-slate-400")} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-slate-900 dark:text-white">{tmpl.title}</p>
                      <p className="text-[10px] text-slate-400 font-light">{fmtDuration(tmpl.duration)}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-slate-200 dark:bg-slate-800" />

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-1.5">
            <Label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />{t('event_title_label')}
            </Label>
            <Input name="title" value={formData.title} onChange={handleInput} placeholder={t('event_title_placeholder')}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 text-sm transition-all focus:border-medical-500 focus:ring-1 focus:ring-medical-500/20 rounded-xl" disabled={loading} />
          </motion.div>

          {/* Date/Time Pickers */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2 p-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />{t('start')}
                </div>
                <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 text-[10px]">{t('from')}</Badge>
              </div>
              <div className="space-y-1.5 flex flex-col">
                <Input type="date" name="startDate" value={formData.startDate} onChange={handleInput}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9 text-sm focus:border-emerald-500 rounded-lg" disabled={loading} />
                <Input type="time" name="startTime" value={formData.startTime} onChange={handleInput}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9 text-sm focus:border-emerald-500 rounded-lg" disabled={loading} />
              </div>
            </div>
            <div className="space-y-2 p-3 bg-red-50 dark:bg-red-500/5 rounded-xl border border-red-200 dark:border-red-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />{t('end')}
                </div>
                <Badge variant="outline" className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 text-[10px]">{t('until')}</Badge>
              </div>
              <div className="space-y-1.5 flex flex-col">
                <Input type="date" name="endDate" value={formData.endDate} onChange={handleInput}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9 text-sm focus:border-red-500 rounded-lg" disabled={loading} />
                <Input type="time" name="endTime" value={formData.endTime} onChange={handleInput}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9 text-sm focus:border-red-500 rounded-lg" disabled={loading} />
              </div>
            </div>
          </motion.div>

          {validationError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{t('validation_error')}</p>
                <p className="text-xs text-red-500/80 dark:text-red-300/80 mt-0.5 font-light">{validationError}</p>
              </div>
            </motion.div>
          )}
        </div>

        <Separator className="bg-slate-200 dark:bg-slate-800" />

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-3">
          <Button variant="outline" onClick={onClose} disabled={loading}
            className="flex-1 sm:flex-none border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm">
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={loading || !isValid}
            className={cn("flex-1 sm:flex-none min-w-[160px] h-10 font-semibold shadow-none transition-all rounded-xl text-sm",
              savingStep === "success" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100")}>
            <AnimatePresence mode="wait">
              {savingStep === "saving" && <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" />{t('saving')}</motion.div>}
              {savingStep === "success" && <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />{t('created')}</motion.div>}
              {savingStep === "idle" && <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />{t('block_time')}</motion.div>}
            </AnimatePresence>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};