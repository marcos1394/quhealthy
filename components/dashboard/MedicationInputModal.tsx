"use client";
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { X, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AddMedicationRequest,
  MedicationTaskDto,
} from "@/services/eldercare.service";

interface MedicationInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationToEdit?: MedicationTaskDto | null;
  onSave: (data: AddMedicationRequest, taskId?: number) => Promise<void>;
}

export const FREQUENCY_OPTIONS = [
  { value: "EVERY_4_HOURS", label: "Cada 4 horas" },
  { value: "EVERY_6_HOURS", label: "Cada 6 horas" },
  { value: "EVERY_8_HOURS", label: "Cada 8 horas" },
  { value: "EVERY_12_HOURS", label: "Cada 12 horas" },
  { value: "ONCE_DAILY", label: "Una vez al día" },
  { value: "AS_NEEDED", label: "Según necesidad (PRN)" },
];

export function MedicationInputModal({
  isOpen,
  onClose,
  medicationToEdit,
  onSave,
}: MedicationInputModalProps) {
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("EVERY_8_HOURS");
  const [durationDays, setDurationDays] = useState("30");
  const [instructions, setInstructions] = useState("");
  const [startsNow, setStartsNow] = useState(true);
  const [firstDoseTime, setFirstDoseTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (medicationToEdit) {
        setMedicationName(medicationToEdit.medicationName || "");
        setDosage(medicationToEdit.dosage || "");
        setFrequency(medicationToEdit.frequency || "EVERY_8_HOURS");
        setDurationDays(
          medicationToEdit.durationDays
            ? medicationToEdit.durationDays.toString()
            : "30",
        );
        setInstructions(medicationToEdit.instructions || "");
        setStartsNow(false);
        // Formatear fecha para el input datetime-local si existe
        if (medicationToEdit.nextDueTime) {
          try {
            const dateStr = medicationToEdit.nextDueTime.slice(0, 16); // yyyy-MM-ddThh:mm
            setFirstDoseTime(dateStr);
          } catch (e) {
            setFirstDoseTime("");
          }
        }
      } else {
        setMedicationName("");
        setDosage("");
        setFrequency("EVERY_8_HOURS");
        setDurationDays("30");
        setInstructions("");
        setStartsNow(true);
        setFirstDoseTime("");
      }
    }
  }, [isOpen, medicationToEdit]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!medicationName || !dosage || !frequency) return;

    try {
      setIsSubmitting(true);

      let finalFirstDoseTime = undefined;
      if (!isEditMode) {
        if (!startsNow && firstDoseTime) {
          // Convertimos al formato LocalDateTime ISO que espera Spring
          finalFirstDoseTime = new Date(firstDoseTime).toISOString();
        } else if (startsNow) {
          finalFirstDoseTime = new Date().toISOString();
        }
      } else {
        if (firstDoseTime) {
          finalFirstDoseTime = new Date(firstDoseTime).toISOString();
        }
      }

      await onSave(
        {
          medicationName,
          dosage,
          frequency,
          durationDays: durationDays ? parseInt(durationDays) : undefined,
          instructions,
          firstDoseTime: finalFirstDoseTime,
        },
        medicationToEdit?.id,
      );
      onClose();
    } catch (error) {
      console.error("Error saving medication:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = !!medicationToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-100 dark:border-gray-800 p-6 flex justify-between items-start sticky top-0 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur z-10 rounded-t-3xl">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 shadow-sm">
              <Pill
                className="w-6 h-6"
                strokeWidth={2}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {isEditMode ? "Editar Medicamento" : "Añadir Medicamento"}
              </h2>
              <p className="text-sm font-medium text-gray-500 mt-0.5">
                Completa los detalles de la receta.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500">
              Nombre del Medicamento *
            </label>
            <input
              type="text"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="Ej. Paracetamol"
              className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all shadow-sm placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500">
              Dosis *
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="Ej. 500mg, 1 pastilla"
              className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all shadow-sm placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500">
              Frecuencia *
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all shadow-sm"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500">
              ¿Cuándo es la primera toma?
            </label>
            {!isEditMode && (
              <div className="flex gap-4 mb-2 mt-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={startsNow}
                    onChange={() => setStartsNow(true)}
                    className="accent-quhealthy-green w-4 h-4"
                  />
                  Ahora
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={!startsNow}
                    onChange={() => setStartsNow(false)}
                    className="accent-quhealthy-green w-4 h-4"
                  />
                  Programar
                </label>
              </div>
            )}

            {(!startsNow || isEditMode) && (
              <input
                type="datetime-local"
                value={firstDoseTime}
                onChange={(e) => setFirstDoseTime(e.target.value)}
                className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all shadow-sm"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500">
              Duración del tratamiento (días)
            </label>
            <input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="Ej. 30"
              className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all shadow-sm placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500">
              Instrucciones Adicionales
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ej. Tomar con alimentos"
              className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all shadow-sm placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50/50 dark:bg-gray-900/10 flex justify-end gap-3 sticky bottom-0 rounded-b-3xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-bold shadow-sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!medicationName || !dosage || !frequency || isSubmitting}
            className="rounded-xl bg-quhealthy-green hover:bg-emerald-700 text-white text-sm font-bold border-0 shadow-sm"
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
