"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { womensHealthService } from "@/services/womensHealth.service";
import { toast } from "react-toastify";
import { Baby } from "lucide-react";
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Embarazo" icon={<Baby />}>
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
            className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
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
            className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
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
    </Modal>
  );
}
