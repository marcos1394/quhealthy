"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Baby, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { womensHealthService } from "@/services/womensHealth.service";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useSessionStore } from "@/stores/SessionStore";

interface StartPostpartumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StartPostpartumModal({ isOpen, onClose, onSuccess }: StartPostpartumModalProps) {
  const { user } = useSessionStore();
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());
  const [deliveryType, setDeliveryType] = useState("VAGINAL");
  const [babyName, setBabyName] = useState("");
  const [babyBiologicalSex, setBabyBiologicalSex] = useState("MALE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !deliveryDate) return;
    
    setIsSubmitting(true);
    try {
      await womensHealthService.startPostpartum(user.id, {
        deliveryDate: format(deliveryDate, "yyyy-MM-dd"),
        deliveryType,
        babyName: babyName.trim() || undefined,
        babyBiologicalSex
      });
      toast.success("¡Felicidades! Se ha iniciado tu etapa de postparto");
      onSuccess();
    } catch (error) {
      toast.error("Error al iniciar el postparto");
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
          className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-xl flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Iniciar Postparto</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ¡Felicidades por la llegada de tu bebé! Ingresa los siguientes datos para comenzar el seguimiento conjunto.
              </p>

              <div>
                <Label>Fecha de Nacimiento</Label>
                <div className="mt-1">
                  <DatePicker
                    value={deliveryDate}
                    onChange={setDeliveryDate}
                    placeholder="Selecciona la fecha"
                    disabled={(date) => date > new Date()}
                  />
                </div>
              </div>

              <div>
                <Label>Tipo de Parto</Label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="mt-1 block w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="VAGINAL">Parto Vaginal</option>
                  <option value="CESAREAN">Cesárea</option>
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Baby className="w-4 h-4 text-teal-500" />
                  Datos del Bebé (Opcional)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Nombre del Bebé</Label>
                    <Input 
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      placeholder="Ej. Mateo"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Sexo Biológico</Label>
                    <select
                      value={babyBiologicalSex}
                      onChange={(e) => setBabyBiologicalSex(e.target.value)}
                      className="mt-1 block w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="MALE">Masculino</option>
                      <option value="FEMALE">Femenino</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || !deliveryDate} className="bg-pink-600 hover:bg-pink-700 text-white">
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
