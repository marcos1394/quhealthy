"use client"
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from 'react';
import { X, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddMedicationRequest, MedicationTaskDto } from '@/services/eldercare.service';

interface MedicationInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationToEdit?: MedicationTaskDto | null;
  onSave: (data: AddMedicationRequest, taskId?: number) => Promise<void>;
}

const FREQUENCY_OPTIONS = [
  { value: 'EVERY_4_HOURS', label: 'Cada 4 horas' },
  { value: 'EVERY_6_HOURS', label: 'Cada 6 horas' },
  { value: 'EVERY_8_HOURS', label: 'Cada 8 horas' },
  { value: 'EVERY_12_HOURS', label: 'Cada 12 horas' },
  { value: 'ONCE_DAILY', label: 'Una vez al día' },
  { value: 'AS_NEEDED', label: 'Según necesidad (PRN)' }
];

export function MedicationInputModal({
  isOpen,
  onClose,
  medicationToEdit,
  onSave
}: MedicationInputModalProps) {
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('EVERY_8_HOURS');
  const [durationDays, setDurationDays] = useState('30');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (medicationToEdit) {
        setMedicationName(medicationToEdit.medicationName || '');
        setDosage(medicationToEdit.dosage || '');
        setFrequency(medicationToEdit.frequency || 'EVERY_8_HOURS');
        setDurationDays(medicationToEdit.durationDays ? medicationToEdit.durationDays.toString() : '30');
        setInstructions(medicationToEdit.instructions || '');
      } else {
        setMedicationName('');
        setDosage('');
        setFrequency('EVERY_8_HOURS');
        setDurationDays('30');
        setInstructions('');
      }
    }
  }, [isOpen, medicationToEdit]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!medicationName || !dosage || !frequency) return;
    
    try {
      setIsSubmitting(true);
      await onSave({
        medicationName,
        dosage,
        frequency,
        durationDays: durationDays ? parseInt(durationDays) : undefined,
        instructions
      }, medicationToEdit?.id);
      onClose();
    } catch (error) {
      console.error("Error saving medication:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = !!medicationToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="border-b border-black dark:border-white p-6 flex justify-between items-start sticky top-0 bg-white dark:bg-[#0a0a0a] z-10">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
              <Pill className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
                {isEditMode ? 'Editar Medicamento' : 'Añadir Medicamento'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Completa los detalles de la receta.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              Nombre del Medicamento *
            </label>
            <input
              type="text"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="Ej. Paracetamol"
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 p-2 text-base focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              Dosis *
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="Ej. 500mg, 1 pastilla"
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 p-2 text-base focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              Frecuencia *
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 p-2 text-base focus:outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white"
            >
              {FREQUENCY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="text-black bg-white dark:bg-black dark:text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              Duración del tratamiento (días)
            </label>
            <input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="Ej. 30"
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 p-2 text-base focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              Instrucciones Adicionales
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ej. Tomar con alimentos"
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 p-2 text-base focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black dark:border-white p-6 bg-gray-50 dark:bg-[#050505] flex justify-end gap-3 sticky bottom-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-none border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 uppercase tracking-widest text-[10px] font-bold"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!medicationName || !dosage || !frequency || isSubmitting}
            className="rounded-none bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black uppercase tracking-widest text-[10px] font-bold"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
