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
  className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
  >
  {/* Encabezado */}
  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#0a0a0a]">
  <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
  Reprogramar Cita
  </h2>
  <button
  onClick={onClose}
  className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#222] text-gray-500 transition-colors shrink-0"
  >
  <X className="w-5 h-5" strokeWidth={2} />
  </button>
  </div>

 {/* Formulario */}
 <div className="p-6 overflow-y-auto">
 <form id="reschedule-form" onSubmit={handleSubmit} className="space-y-6">
  {/* Fecha */}
  <div className="space-y-3">
  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
  1. Nueva Fecha
  </label>
  <DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  placeholder="Selecciona una fecha"
  disabled={isPastDate}
  className="w-full"
  />
  </div>

  {/* Horas Disponibles */}
  <div className="space-y-3">
  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
  2. Horario Disponible
  {isLoadingSlots && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
  </label>

  {!selectedDate ? (
  <div className="p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center bg-gray-50/50 dark:bg-[#111]/30">
  <CalendarIcon className="w-8 h-8 mx-auto mb-3 text-gray-400" strokeWidth={1.5} />
  <p className="text-sm font-medium text-gray-500">
  Selecciona una fecha para ver disponibilidad
  </p>
  </div>
  ) : isLoadingSlots ? (
  <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#111]/30">
  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
  <p className="text-sm font-medium text-gray-500">
  Consultando agenda...
  </p>
  </div>
  ) : availableSlots.length === 0 ? (
  <div className="p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 text-center text-rose-600 dark:text-rose-400">
  <p className="text-sm font-medium">
  No hay horarios disponibles este día
  </p>
  </div>
  ) : (
  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
  {availableSlots.map((slot) => (
  <button
  key={slot}
  type="button"
  onClick={() => setSelectedTime(slot)}
  className={`
  py-3 text-sm font-semibold transition-all rounded-xl border shadow-sm
  ${selectedTime === slot 
  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-[#111] dark:text-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
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
  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
  3. Motivo del cambio (Opcional)
  </label>
  <textarea
  value={reason}
  onChange={(e) => setReason(e.target.value)}
  placeholder="Ej. Inconveniente de última hora..."
  className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/30 p-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900 dark:text-white resize-none h-28 shadow-inner"
  maxLength={500}
  />
  </div>
 </form>
 </div>

  {/* Footer */}
  <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
  <Button
  type="button"
  variant="outline"
  onClick={onClose}
  disabled={isSubmitting}
  className="rounded-xl h-12 px-6 text-sm font-semibold border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111]"
  >
  Cancelar
  </Button>
  <Button
  type="submit"
  form="reschedule-form"
  disabled={isSubmitting || !selectedDate || !selectedTime}
  className="rounded-xl h-12 px-8 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-sm"
  >
  {isSubmitting ? (
  <>
  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  Procesando...
  </>
  ) : (
  "Confirmar Reprogramación"
  )}
  </Button>
  </div>
 </motion.div>
 </div>
 </AnimatePresence>
 );
}
