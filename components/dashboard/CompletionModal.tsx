/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Loader2, CheckCircle2, X, AlertCircle, Info, Calendar, User, Sparkles, Mail, Star, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { handleApiError } from '@/lib/handleApiError';

interface Appointment {
  id: number;
  consumer?: { name: string; email?: string };
  service?: { name: string; duration?: string };
  date?: string;
  time?: string;
}

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  appointment: Appointment | null;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ appointment, isOpen, onClose, onComplete }) => {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [completionStep, setCompletionStep] = useState<"idle" | "processing" | "success">("idle");
  const [charCount, setCharCount] = useState(0);

  useEffect(() => { if (isOpen) { setNotes(""); setCharCount(0); setCompletionStep("idle"); } }, [isOpen]);
  useEffect(() => { setCharCount(notes.length); }, [notes]);

  const handleSubmit = async () => {
    if (!appointment) return;
    setIsLoading(true);
    setCompletionStep("processing");
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCompletionStep("success");
      toast.success("Appointment completed successfully! 🎉");
      setTimeout(() => { onComplete(); onClose(); }, 1500);
    } catch (error: any) {
      console.error(error);
      setCompletionStep("idle");
      return;
    } finally { setTimeout(() => setIsLoading(false), 1500); }
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-xl max-h-[90vh] overflow-y-auto transition-colors">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200 }}
                className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </motion.div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-medium text-slate-900 dark:text-white mb-0.5">Complete Appointment</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm font-light">Confirm that the service was performed successfully</DialogDescription>
              </div>
            </div>
            {!isLoading && (
              <Button variant="ghost" size="default" onClick={onClose}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Appointment Summary */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appointment Summary</p>
              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 text-xs">
                <CheckCircle2 className="w-2.5 h-2.5 mr-1" />To Complete
              </Badge>
            </div>
            <div className="space-y-2">
              {appointment.consumer && (
                <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="p-1.5 bg-medical-50 dark:bg-medical-500/10 rounded-lg"><User className="w-3.5 h-3.5 text-medical-600 dark:text-medical-400" /></div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-medium">Patient</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{appointment.consumer.name}</p>
                    {appointment.consumer.email && <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Mail className="w-2.5 h-2.5" />{appointment.consumer.email}</p>}
                  </div>
                </div>
              )}
              {appointment.service && (
                <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg"><Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /></div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-medium">Service</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{appointment.service.name}</p>
                    {appointment.service.duration && <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" />{appointment.service.duration}</p>}
                  </div>
                </div>
              )}
              {(appointment.date || appointment.time) && (
                <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg"><Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /></div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-medium">Date & Time</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{appointment.date} {appointment.time && `• ${appointment.time}`}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* What Will Happen */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl p-3.5">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">What will happen?</p>
                <ul className="space-y-1 text-xs text-blue-600/80 dark:text-blue-300/80 font-light">
                  {[
                    { icon: CheckCircle2, text: "The appointment will be marked as completed" },
                    { icon: Mail, text: "An automatic email will be sent requesting a rating" },
                    { icon: Star, text: "The patient can leave a 1-5 star review" },
                    { icon: FileText, text: "Your private notes will be saved in history" }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5"><item.icon className="w-3 h-3 flex-shrink-0 mt-0.5" /><span>{item.text}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          <Separator className="bg-slate-200 dark:bg-slate-800" />

          {/* Notes */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">Private Notes (Optional)</label>
              <span className={cn("text-xs font-medium", charCount > 500 ? "text-red-500" : "text-slate-400")}>{charCount}/500</span>
            </div>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              placeholder="E.g.: Patient showed notable improvement. Follow-up recommended in 15 days."
              className={cn("bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[100px] resize-none transition-all rounded-xl text-sm",
                "focus:border-medical-500 focus:ring-1 focus:ring-medical-500/20",
                charCount > 500 ? "border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-500/5" : "")}
              disabled={isLoading} />
            <div className="flex items-start gap-2 bg-medical-50 dark:bg-medical-500/5 border border-medical-200 dark:border-medical-500/20 rounded-lg p-2.5">
              <AlertCircle className="w-3.5 h-3.5 text-medical-600 dark:text-medical-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-medical-600/80 dark:text-medical-400/80 font-light">
                <span className="font-medium">Private:</span> These notes are only for you. The patient will not have access.
              </p>
            </div>
          </motion.div>
        </div>

        <Separator className="bg-slate-200 dark:bg-slate-800" />

        <DialogFooter className="flex-col sm:flex-row gap-2.5">
          <Button variant="outline" onClick={onClose} disabled={isLoading}
            className="flex-1 sm:flex-none border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}
            className={cn("flex-1 sm:flex-none min-w-[180px] h-10 font-semibold shadow-none transition-all rounded-xl",
              completionStep === "success" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100")}>
            <AnimatePresence mode="wait">
              {completionStep === "processing" && <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Processing...</motion.div>}
              {completionStep === "success" && <motion.div key="s" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Completed!</motion.div>}
              {completionStep === "idle" && <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Confirm & Finish</motion.div>}
            </AnimatePresence>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};