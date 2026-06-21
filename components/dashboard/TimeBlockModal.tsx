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

interface TimeBlockModalProps { isOpen: boolean; onClose: () => void; onSaveSuccess: () => void; initialDate?: Date; }

const blockTemplates = [
  { id: "lunch", title: "LUNCH", icon: Utensils, duration: 60 },
  { id: "break", title: "BREAK", icon: Coffee, duration: 30 },
  { id: "vacation", title: "VACATION", icon: Plane, duration: 480 },
  { id: "morning", title: "MORNING", icon: Sun, duration: 120 }
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
  const fmtDuration = (m: number) => m < 60 ? `${m} MIN` : (m % 60 > 0 ? `${Math.floor(m / 60)}H ${m % 60}MIN` : `${Math.floor(m / 60)}H`);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white text-black dark:text-white sm:max-w-xl p-0 overflow-hidden rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
        {/* Header */}
        <div className="px-6 py-5 bg-gray-50 dark:bg-[#111] border-b-2 border-black dark:border-white relative">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
                  <Calendar className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-2xl font-serif font-bold tracking-widest uppercase">{t('title')}</DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{t('subtitle')}</DialogDescription>
                </div>
              </div>
              {!loading && (
                <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-[#0a0a0a] rounded-none">
                  <X className="w-5 h-5" strokeWidth={2} />
                </Button>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 overflow-y-auto max-h-[65vh] custom-scrollbar space-y-8">
          {/* Templates */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-black dark:text-white" strokeWidth={2} />
              <p className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">{t('templates_label')}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {blockTemplates.map(tmpl => {
                const Icon = tmpl.icon; const isSel = selectedTemplate === tmpl.id;
                return (
                  <motion.button key={tmpl.id} onClick={() => applyTemplate(tmpl.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={cn("flex flex-col items-center gap-2 p-3 border-2 transition-colors rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]",
                      isSel ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black" : "border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-gray-100 dark:hover:bg-[#111]")}>
                    <div className={cn("p-2 border-2", isSel ? "border-white dark:border-black bg-black text-white dark:bg-white dark:text-black" : "border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white")}>
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div className="text-center mt-1">
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest", isSel ? "text-white dark:text-black" : "text-black dark:text-white")}>{tmpl.title}</p>
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-0.5", isSel ? "text-gray-300 dark:text-gray-600" : "text-gray-500")}>{fmtDuration(tmpl.duration)}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-black dark:bg-white h-[2px]" />

          {/* Title */}
          <div className="space-y-2">
            <Label className="flex items-center text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">
              <Sparkles className="w-3.5 h-3.5 mr-2" strokeWidth={2} />{t('event_title_label')}
            </Label>
            <Input name="title" value={formData.title} onChange={handleInput} placeholder={t('event_title_placeholder')}
              className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white h-12 text-sm font-bold uppercase tracking-widest transition-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]" disabled={loading} />
          </div>

          {/* Date/Time Pickers */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4 p-5 bg-gray-50 dark:bg-[#111] border-2 border-black dark:border-white">
              <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">
                  <Clock className="w-4 h-4" strokeWidth={2} />{t('start')}
                </div>
                <Badge variant="outline" className="border-2 border-black dark:border-white rounded-none bg-white dark:bg-[#0a0a0a] text-black dark:text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">{t('from')}</Badge>
              </div>
              <div className="space-y-3 flex flex-col">
                <Input type="date" name="startDate" value={formData.startDate} onChange={handleInput}
                  className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white h-10 text-xs font-bold uppercase tracking-widest focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]" disabled={loading} />
                <Input type="time" name="startTime" value={formData.startTime} onChange={handleInput}
                  className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white h-10 text-xs font-bold uppercase tracking-widest focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]" disabled={loading} />
              </div>
            </div>
            <div className="space-y-4 p-5 bg-gray-50 dark:bg-[#111] border-2 border-black dark:border-white">
              <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">
                  <Clock className="w-4 h-4" strokeWidth={2} />{t('end')}
                </div>
                <Badge variant="outline" className="border-2 border-black dark:border-white rounded-none bg-white dark:bg-[#0a0a0a] text-black dark:text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">{t('until')}</Badge>
              </div>
              <div className="space-y-3 flex flex-col">
                <Input type="date" name="endDate" value={formData.endDate} onChange={handleInput}
                  className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white h-10 text-xs font-bold uppercase tracking-widest focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]" disabled={loading} />
                <Input type="time" name="endTime" value={formData.endTime} onChange={handleInput}
                  className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white h-10 text-xs font-bold uppercase tracking-widest focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]" disabled={loading} />
              </div>
            </div>
          </div>

          {validationError && (
            <div className="bg-white border-2 border-red-600 p-4 flex items-start gap-3 shadow-[4px_4px_0_0_#dc2626]">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" strokeWidth={2} />
              <div className="flex-1 text-left mt-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-1">{t('validation_error')}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-black">{validationError}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 p-6 bg-gray-50 dark:bg-[#111] border-t-2 border-black dark:border-white">
          <Button variant="outline" onClick={onClose} disabled={loading}
            className="flex-1 sm:flex-none h-12 border-2 border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] text-[10px] uppercase font-bold tracking-widest transition-colors px-8">
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={loading || !isValid}
            className={cn("flex-1 sm:flex-none min-w-[180px] h-12 border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] text-[10px] uppercase font-bold tracking-widest transition-colors px-8",
              savingStep === "success" ? "bg-white text-black dark:bg-[#0a0a0a] dark:text-white" : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200")}>
            <AnimatePresence mode="wait">
              {savingStep === "saving" && <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />{t('saving')}</motion.div>}
              {savingStep === "success" && <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" strokeWidth={2} />{t('created')}</motion.div>}
              {savingStep === "idle" && <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2"><Plus className="w-4 h-4" strokeWidth={2} />{t('block_time')}</motion.div>}
            </AnimatePresence>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};