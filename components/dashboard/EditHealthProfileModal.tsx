"use client";
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */

import React, { KeyboardEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X, FileHeart } from "lucide-react";
import { BloodType, PatientHealthProfile } from "@/types/healthProfile";
import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditHealthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: PatientHealthProfile | null;
  onSave: (data: Partial<PatientHealthProfile>) => Promise<boolean>;
  isSubmitting?: boolean;
}

const BLOOD_TYPE_OPTIONS: Array<{ value: BloodType; label: string }> = [
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
  { value: "UNKNOWN", label: "DESCONOCIDO" },
];

export function EditHealthProfileModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  isSubmitting: externalSubmitting = false,
}: EditHealthProfileModalProps) {
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientHealthProfile>>({
    bloodType: null,
    heightCm: null,
    weightKg: null,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        bloodType: initialData?.bloodType ?? null,
        heightCm: initialData?.heightCm ?? null,
        weightKg: initialData?.weightKg ?? null,
      });
    }
  }, [isOpen, initialData]);

  const isSubmitting = localSubmitting || externalSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalSubmitting(true);
    const success = await onSave(formData);
    setLocalSubmitting(false);
    if (success) onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent className="sm:max-w-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl transition-colors [&>button]:hidden">
        {/* HEADER */}
        <div className="flex items-start justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 shadow-sm">
              <FileHeart
                className="w-6 h-6 text-emerald-600"
                strokeWidth={2}
              />
            </div>
            <div>
              <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                Editar Antecedentes Médicos
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-gray-500 mt-1">
                Actualice la ficha clínica base de este paciente en el directorio.
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#111] transition-colors shrink-0 disabled:opacity-50"
          >
            <X
              className="w-5 h-5 text-gray-500"
              strokeWidth={2}
            />
          </button>
        </div>

        {/* BODY */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-gray-50/50 dark:bg-[#050505]/50"
        >
          {/* Fila 1: Datos Físicos Básicos */}
          <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Sangre
                </label>
                <Select
                  value={formData.bloodType || "none"}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      bloodType: (val === "none"
                        ? null
                        : val) as BloodType | null,
                    })
                  }
                >
                  <SelectTrigger className="w-full h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 transition-shadow">
                    <SelectValue placeholder="No registrado" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-xl">
                    <SelectItem
                      value="none"
                      className="text-sm font-medium focus:bg-gray-50 dark:focus:bg-[#111] rounded-lg cursor-pointer"
                    >
                      No registrado
                    </SelectItem>
                    {BLOOD_TYPE_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-sm font-medium focus:bg-gray-50 dark:focus:bg-[#111] rounded-lg cursor-pointer"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Estatura (CM)
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 175"
                  value={formData.heightCm ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      heightCm: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    })
                  }
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 transition-shadow rounded-xl placeholder:text-gray-400"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Peso (KG)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ej: 70.5"
                  value={formData.weightKg ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weightKg: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 transition-shadow rounded-xl placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* FOOTER DE COMANDOS */}
          <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505]/50 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-semibold rounded-xl disabled:opacity-50 shadow-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-8 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 shadow-sm border-0"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-current" /> Guardando...
                </>
              ) : (
                <>Guardar Cambios</>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
