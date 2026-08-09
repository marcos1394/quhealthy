"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { womensHealthService } from "@/services/womensHealth.service";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { consumerProfileService } from "@/services/consumerProfile.service";
import { ConsumerProfile } from "@/types/consumerProfile";

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
  const [lmpDate, setLmpDate] = useState<Date | undefined>(new Date());
  const [eddDate, setEddDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<ConsumerProfile | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      consumerProfileService.getProfile().then(setProfile).catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await womensHealthService.createOrUpdatePregnancy(consumerId, {
        lastMenstrualPeriod: lmpDate ? format(lmpDate, "yyyy-MM-dd") : undefined,
        estimatedDueDate: eddDate ? format(eddDate, "yyyy-MM-dd") : undefined,
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
              {profile?.medicalConditions && profile.medicalConditions.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-xl text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Aviso de Expediente Médico</p>
                    <p>Tienes condiciones de salud previas registradas. Tu médico será notificado para darte el seguimiento adecuado.</p>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ingresa la fecha de tu último periodo menstrual o tu fecha probable de parto si ya te la indicó tu médico.
                {profile?.bloodType && (
                  <span className="block mt-1 font-medium text-emerald-600 dark:text-emerald-400">
                    Tipo de sangre registrado: {profile.bloodType}
                  </span>
                )}
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="lmpDate">Fecha de Última Menstruación (FUR)</Label>
                  <DatePicker
                    value={lmpDate}
                    onChange={setLmpDate}
                    placeholder="Selecciona la fecha"
                    disabled={(date) => date > new Date()}
                  />
                  {!eddDate && !lmpDate && (
                    <p className="text-xs text-rose-500 mt-1">Requerido si no se ingresa FPP</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="eddDate">Fecha Probable de Parto (Opcional)</Label>
                  <DatePicker
                    value={eddDate}
                    onChange={setEddDate}
                    placeholder="Selecciona la fecha"
                  />
                </div>
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
