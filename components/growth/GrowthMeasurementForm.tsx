"use client";

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { GrowthMeasurementRequest } from '@/types/growth';
import { toast } from 'react-toastify';

interface GrowthMeasurementFormProps {
  onSubmit: (request: GrowthMeasurementRequest) => Promise<void>;
  isSubmitting: boolean;
}

export default function GrowthMeasurementForm({ onSubmit, isSubmitting }: GrowthMeasurementFormProps) {
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState('');
  const [measurementDate, setMeasurementDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg && !heightCm && !headCircumferenceCm) {
      toast.warn("Debes ingresar al menos una medición (Peso, Talla o Perímetro Cefálico).");
      return;
    }

    const request: GrowthMeasurementRequest = {
      measurementDate,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      headCircumferenceCm: headCircumferenceCm ? parseFloat(headCircumferenceCm) : undefined,
    };

    try {
      await onSubmit(request);
      // Clear form only on success
      setWeightKg('');
      setHeightCm('');
      setHeadCircumferenceCm('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mb-6">
        Registrar Nueva Medición
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Fecha
          </label>
          <input 
            type="date" 
            required
            value={measurementDate}
            onChange={(e) => setMeasurementDate(e.target.value)}
            className="h-10 px-3 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Peso (kg)
          </label>
          <input 
            type="number" 
            step="0.01"
            placeholder="Ej: 14.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="h-10 px-3 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Talla (cm)
          </label>
          <input 
            type="number" 
            step="0.1"
            placeholder="Ej: 95.5"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="h-10 px-3 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Perímetro Cefálico (cm)
          </label>
          <input 
            type="number" 
            step="0.1"
            placeholder="Ej: 48.0"
            value={headCircumferenceCm}
            onChange={(e) => setHeadCircumferenceCm(e.target.value)}
            className="h-10 px-3 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-4 border border-black/20 dark:border-white/20 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none disabled:opacity-50"
          >
            {isSubmitting ? <QhSpinner size="sm" className="text-current" /> : <PlusCircle className="w-3.5 h-3.5" strokeWidth={1.5} />}
            Registrar
          </button>
        </div>
      </form>
    </div>
  );
}
