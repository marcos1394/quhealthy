"use client";

import React, { useState } from "react";
import { X, CalendarDays, Droplet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { womensHealthService, MenstrualCycleLog } from "@/services/womensHealth.service";

interface LogCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  consumerId: number;
  onSuccess: () => void;
}

export function LogCycleModal({ isOpen, onClose, consumerId, onSuccess }: LogCycleModalProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [intensity, setIntensity] = useState<MenstrualCycleLog["intensity"]>("MEDIUM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      toast.error("La fecha de inicio es requerida");
      return;
    }

    setIsSubmitting(true);
    try {
      await womensHealthService.logCycle(consumerId, {
        consumerId,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
        intensity,
      });
      toast.success("Ciclo registrado exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Ocurrió un error al registrar el ciclo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Droplet className="w-5 h-5 text-pink-500" />
              Registrar Ciclo
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Selecciona la fecha de inicio"
                  disabled={(date) => date > new Date()}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Fecha de Fin (Opcional si aún no termina)</Label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Selecciona la fecha de fin"
                  disabled={(date) => date > new Date() || (!!startDate && date < startDate)}
                />
              </div>

              <div>
                <Label>Intensidad del Flujo</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {(["SPOTTING", "LIGHT", "MEDIUM", "HEAVY"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setIntensity(level)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        intensity === level
                          ? "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-200 dark:border-pink-800"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-[#121212] dark:text-gray-400 border border-transparent"
                      }`}
                    >
                      {level === "SPOTTING" && "Goteo"}
                      {level === "LIGHT" && "Ligero"}
                      {level === "MEDIUM" && "Medio"}
                      {level === "HEAVY" && "Fuerte"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-xl">
                {isSubmitting ? "Guardando..." : "Guardar Ciclo"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
