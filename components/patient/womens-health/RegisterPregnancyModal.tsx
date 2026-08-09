"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { womensHealthService } from "@/services/womensHealth.service";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { format } from "date-fns";

interface RegisterPregnancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  consumerId: number;
  onSuccess: () => void;
}

export function RegisterPregnancyModal({
  isOpen,
  onClose,
  consumerId,
  onSuccess,
}: RegisterPregnancyModalProps) {
  const [lmpDate, setLmpDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [eddDate, setEddDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await womensHealthService.createOrUpdatePregnancy(consumerId, {
        lastMenstrualPeriod: lmpDate || undefined,
        estimatedDueDate: eddDate || undefined,
      });
      toast.success("Embarazo registrado con éxito");
      onSuccess();
    } catch (error) {
      toast.error("Error al registrar el embarazo");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-xl flex items-center justify-center">
                  <Baby className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Registrar Embarazo</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ingresa la fecha de tu último periodo menstrual o tu fecha probable de parto si ya te la indicó tu médico.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Fecha de Última Menstruación (FUR)
                </label>
                <input
                  type="date"
                  required={!eddDate}
                  value={lmpDate}
                  onChange={(e) => setLmpDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Fecha Probable de Parto (Opcional)
                </label>
                <input
                  type="date"
                  value={eddDate}
                  onChange={(e) => setEddDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white">
                  {isSubmitting ? "Guardando..." : "Confirmar"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
