"use client"
import React, { useState, useEffect } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { X, Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Appointment } from "@/types/appointments";
import { useAvailability } from "@/hooks/useAvailability";
import { appointmentService } from "@/services/appointment.service";
import { toast } from "react-toastify";
import { handleApiError } from "@/lib/handleApiError";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess?: () => void;
}

export function RescheduleModal({ isOpen, onClose, appointment, onSuccess }: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { availableSlots, isLoadingSlots, fetchAvailableSlots } = useAvailability();

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(undefined);
      setSelectedTime(null);
      setReason("");
    }
  }, [isOpen]);

  // Fetch slots whenever the date changes
  useEffect(() => {
    if (selectedDate && appointment.providerId) {
      // Usamos undefined para autodetectar la sede, y durationMinutes de la cita (o 30 por defecto)
      const duration = appointment.durationMinutes || 30;
      fetchAvailableSlots(appointment.providerId, undefined, selectedDate, duration);
      setSelectedTime(null);
    }
  }, [selectedDate, appointment.providerId, appointment.durationMinutes, fetchAvailableSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error("Por favor, selecciona una fecha y una hora.");
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

      toast.success("Cita reprogramada exitosamente.");
      onSuccess?.();
      onClose();
    } catch (error) {
      handleApiError(error, "Error al reprogramar la cita.");
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Encabezado */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
              Reprogramar Cita
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors border border-transparent hover:border-black dark:hover:border-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formulario */}
          <div className="p-6 overflow-y-auto">
            <form id="reschedule-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Fecha */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  1. Nueva Fecha
                </label>
                <DatePicker
                  date={selectedDate}
                  onDateChange={setSelectedDate}
                  placeholder="Selecciona una fecha"
                  disabledDays={isPastDate}
                  className="w-full"
                />
              </div>

              {/* Horas Disponibles */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  2. Horario Disponible
                  {isLoadingSlots && <Loader2 className="w-3 h-3 animate-spin text-black dark:text-white" />}
                </label>

                {!selectedDate ? (
                  <div className="p-6 border border-dashed border-gray-300 dark:border-gray-700 text-center bg-gray-50 dark:bg-[#050505]">
                    <CalendarIcon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Selecciona una fecha para ver disponibilidad
                    </p>
                  </div>
                ) : isLoadingSlots ? (
                  <div className="p-6 border border-gray-200 dark:border-gray-800 text-center flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-black dark:text-white mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Consultando agenda...
                    </p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-6 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-center text-red-600 dark:text-red-400">
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      No hay horarios disponibles este día
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`
                          py-3 text-[11px] font-bold tracking-widest transition-colors border
                          ${selectedTime === slot 
                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                            : 'bg-white text-gray-700 border-gray-200 hover:border-black dark:bg-[#0a0a0a] dark:text-gray-300 dark:border-gray-800 dark:hover:border-white'
                          }
                        `}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Motivo */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-900">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  3. Motivo del cambio (Opcional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej. Inconveniente de última hora..."
                  className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white resize-none h-24"
                  maxLength={500}
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-none h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-gray-300 dark:border-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="reschedule-form"
              disabled={isSubmitting || !selectedDate || !selectedTime}
              className="rounded-none h-12 px-8 text-[10px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
