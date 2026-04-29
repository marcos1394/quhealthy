"use client";

import React, { KeyboardEvent, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { BloodType, PatientHealthProfile } from '@/types/healthProfile';

interface EditHealthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: PatientHealthProfile | null;
  onSave: (data: Partial<PatientHealthProfile>) => Promise<boolean>;
  isSubmitting?: boolean;
}

interface TagInputProps {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (next: string[]) => void;
  badgeColorClass: string;
}

const BLOOD_TYPE_OPTIONS: Array<{ value: BloodType; label: string }> = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
  { value: 'UNKNOWN', label: 'Desconocido' }
];

function TagInput({ label, placeholder, value, onChange, badgeColorClass }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const newTag = inputValue.trim();
    if (!newTag) return;
    if (value.includes(newTag)) {
      setInputValue('');
      return;
    }
    onChange([...value, newTag]);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className={`pl-2 pr-1 py-1 flex items-center gap-1 ${badgeColorClass}`}>
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((item) => item !== tag))}
              className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-7 w-7 p-0"
          onClick={addTag}
        >
          <Plus className="w-4 h-4 text-slate-400" />
        </Button>
      </div>
      <p className="text-[10px] text-slate-400 font-light italic">Presiona Enter para agregar.</p>
    </div>
  );
}

export function EditHealthProfileModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  isSubmitting: externalSubmitting = false
}: EditHealthProfileModalProps) {
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientHealthProfile>>({
    bloodType: null,
    heightCm: null,
    weightKg: null,
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    surgicalHistory: '',
    familyHistory: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        bloodType: initialData?.bloodType ?? null,
        heightCm: initialData?.heightCm ?? null,
        weightKg: initialData?.weightKg ?? null,
        allergies: initialData?.allergies ?? [],
        chronicConditions: initialData?.chronicConditions ?? [],
        currentMedications: initialData?.currentMedications ?? [],
        surgicalHistory: initialData?.surgicalHistory ?? '',
        familyHistory: initialData?.familyHistory ?? ''
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Editar Antecedentes Medicos</DialogTitle>
            <DialogDescription>Actualiza la ficha clinica base de este paciente.</DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Sangre</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 dark:border-slate-800 dark:bg-slate-900"
                value={formData.bloodType || ''}
                onChange={(e) => setFormData({ ...formData, bloodType: (e.target.value || null) as BloodType | null })}
              >
                <option value="">Seleccionar...</option>
                {BLOOD_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estatura (cm)</label>
              <Input
                type="number"
                placeholder="Ej: 175"
                value={formData.heightCm ?? ''}
                onChange={(e) => setFormData({ ...formData, heightCm: e.target.value ? parseInt(e.target.value, 10) : null })}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peso (kg)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="Ej: 70.5"
                value={formData.weightKg ?? ''}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value ? parseFloat(e.target.value) : null })}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TagInput
              label="Alergias"
              placeholder="Ej: Penicilina, Latex..."
              value={formData.allergies ?? []}
              onChange={(next) => setFormData((prev) => ({ ...prev, allergies: next }))}
              badgeColorClass="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
            />
            <TagInput
              label="Condiciones Cronicas"
              placeholder="Ej: Diabetes tipo 2..."
              value={formData.chronicConditions ?? []}
              onChange={(next) => setFormData((prev) => ({ ...prev, chronicConditions: next }))}
              badgeColorClass="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
            />
          </div>

          <TagInput
            label="Medicamentos Actuales"
            placeholder="Ej: Metformina 500mg..."
            value={formData.currentMedications ?? []}
            onChange={(next) => setFormData((prev) => ({ ...prev, currentMedications: next }))}
            badgeColorClass="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
          />

          <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-4" />

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historial Quirurgico</label>
              <Textarea
                placeholder="Describa cirugias previas y fechas aproximadas..."
                value={formData.surgicalHistory ?? ''}
                onChange={(e) => setFormData({ ...formData, surgicalHistory: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Antecedentes Familiares</label>
              <Textarea
                placeholder="Enfermedades hereditarias relevantes en la familia..."
                value={formData.familyHistory ?? ''}
                onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[80px]"
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-medical-600 hover:bg-medical-700 text-white">
              {isSubmitting ? 'Guardando...' : 'Guardar Ficha Clinica'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
