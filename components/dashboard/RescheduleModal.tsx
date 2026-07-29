"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { DatePicker } from "@/components/ui/date-picker";
import { Appointment } from "@/types/appointments";
import { useAvailability } from "@/hooks/useAvailability";
import { appointmentService } from "@/services/appointment.service";
import { handleApiError } from "@/lib/handleApiError";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess?: () => void;
}

export function RescheduleModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: RescheduleModalProps) {
  const t = useTranslations("DashboardAppointments.RescheduleModal");

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { availableSlots, isLoadingSlots, fetchAvailableSlots } =
    useAvailability();

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(undefined);
      setSelectedTime(null);
      setReason("");
    }
  }, [isOpen]);

  // Consulta de slots al cambiar la fecha
  useEffect(() => {
    if (selectedDate && appointment.providerId) {
      const duration = appointment.durationMinutes || 30;
      fetchAvailableSlots(
        appointment.providerId,
        undefined,
        selectedDate,
        duration
      );
      setSelectedTime(null);
    }
  }, [
    selectedDate,
    appointment.providerId,
    appointment.durationMinutes,
    fetchAvailableSlots,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error(t("toast_select_required"));
      return;
    }

    try {
      setIsSubmitting(true);
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const newStartTime = `${dateStr}T${selectedTime}:00`;

      await appointmentService.rescheduleAppointment(appointment.id, {
        newStartTime,
        reason: reason.trim() || undefined,
      });

      toast.success(t("toast_success"));
      onSuccess?.();
      onClose();
    } catch (error) {
      handleApiError(error, t("toast_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPastDate = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans transition-colors">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div className="p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
                <Clock className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                  {t("title")}
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* ── BODY ───────────────────────────────────────────────────── */}
          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0a0a0a] flex-1">
            <form id="reschedule-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Selección de Fecha */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("step1_label")}
                </label>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  placeholder={t("date_placeholder")}
                  disabled={isPastDate}
                  className="w-full h-11 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold shadow-2xs"
                />
              </div>

              {/* Horarios Disponibles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("step2_label")}
                  </label>
                  {isLoadingSlots && (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <QhSpinner size="sm" />
                      <span>{t("checking_slots")}</span>
                    </span>
                  )}
                </div>

                {!selectedDate ? (
                  <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-center bg-gray-50/50 dark:bg-[#050505] shadow-2xs space-y-2">
                    <CalendarIcon
                      className="w-7 h-7 mx-auto text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t("select_date_first")}
                    </p>
                  </div>
                ) : isLoadingSlots ? (
                  <div className="p-8 rounded-2xl border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#050505] shadow-2xs gap-3">
                    <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-semibold text-gray-400">
                      {t("checking_slots")}
                    </p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 text-center text-rose-700 dark:text-rose-400 text-xs font-bold shadow-2xs">
                    {t("no_slots_available")}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={cn(
                            "h-10 text-xs font-mono font-bold transition-all rounded-xl border shadow-2xs cursor-pointer flex items-center justify-center",
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-gray-50/50 dark:bg-[#050505] text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:border-emerald-500/30 hover:bg-white dark:hover:bg-[#111]"
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Motivo del cambio */}
              <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("step3_label")}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t("reason_placeholder")}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] p-3.5 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs resize-none h-24 leading-relaxed placeholder:text-gray-400"
                  maxLength={500}
                />
              </div>
            </form>
          </div>

          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <div className="p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {t("btn_cancel")}
            </button>
            <button
              type="submit"
              form="reschedule-form"
              disabled={isSubmitting || !selectedDate || !selectedTime}
              className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("btn_submitting")}</span>
                </>
              ) : (
                <span>{t("btn_confirm")}</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}