"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { growthService } from '@/services/growth.service';
import { GrowthMeasurementRequest, GrowthMeasurementResponse, WhoGrowthStandard } from '@/types/growth';
import MedicalGrowthChart from './MedicalGrowthChart';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface MedicalGrowthContainerProps {
  dependentId: number;
  sex: 'MALE' | 'FEMALE';
}

export function MedicalGrowthContainer({ dependentId, sex }: MedicalGrowthContainerProps) {
  const t = useTranslations("DashboardPatientDetail");
  
  const [history, setHistory] = useState<GrowthMeasurementResponse[]>([]);
  const [standards, setStandards] = useState<WhoGrowthStandard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState('');
  const [measurementDate, setMeasurementDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeIndicator, setActiveIndicator] = useState<'WEIGHT_FOR_AGE' | 'LENGTH_FOR_AGE' | 'HEAD_CIRCUMFERENCE_FOR_AGE'>('WEIGHT_FOR_AGE');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [histRes, stdRes] = await Promise.all([
        growthService.getPatientHistoryProvider(dependentId),
        growthService.getStandards()
      ]);
      setHistory(histRes);
      setStandards(stdRes);
    } catch (error) {
      console.error("Error fetching pediatric growth data", error);
      toast.error("Error al cargar los datos de crecimiento.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dependentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg && !heightCm && !headCircumferenceCm) {
      toast.warn("Debes ingresar al menos una medición (Peso, Talla o Perímetro Cefálico).");
      return;
    }

    setIsSubmitting(true);
    try {
      const request: GrowthMeasurementRequest = {
        measurementDate,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        headCircumferenceCm: headCircumferenceCm ? parseFloat(headCircumferenceCm) : undefined,
      };

      await growthService.recordMeasurementProvider(request);
      toast.success("Medición registrada con éxito.");
      
      // Clear form
      setWeightKg('');
      setHeightCm('');
      setHeadCircumferenceCm('');
      
      // Refresh Data
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar la medición.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-gray-50 dark:bg-[#050505]">
        <QhSpinner size="lg" className="text-black dark:text-white" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
          CARGANDO GRÁFICAS DE CRECIMIENTO OMS...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Registration Form */}
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

      {/* Chart Viewer */}
      <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a]">
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveIndicator('WEIGHT_FOR_AGE')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors whitespace-nowrap rounded-none
              ${activeIndicator === 'WEIGHT_FOR_AGE' 
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                : 'bg-transparent text-gray-500 border-black/20 dark:border-white/20 hover:text-black dark:hover:text-white'}`}
          >
            Peso para la Edad
          </button>
          <button 
            onClick={() => setActiveIndicator('LENGTH_FOR_AGE')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors whitespace-nowrap rounded-none
              ${activeIndicator === 'LENGTH_FOR_AGE' 
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                : 'bg-transparent text-gray-500 border-black/20 dark:border-white/20 hover:text-black dark:hover:text-white'}`}
          >
            Talla para la Edad
          </button>
          <button 
            onClick={() => setActiveIndicator('HEAD_CIRCUMFERENCE_FOR_AGE')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors whitespace-nowrap rounded-none
              ${activeIndicator === 'HEAD_CIRCUMFERENCE_FOR_AGE' 
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                : 'bg-transparent text-gray-500 border-black/20 dark:border-white/20 hover:text-black dark:hover:text-white'}`}
          >
            Perímetro Cefálico
          </button>
        </div>

        {standards.length > 0 ? (
          <MedicalGrowthChart 
            measurements={history} 
            standards={standards} 
            sex={sex} 
            indicator={activeIndicator} 
          />
        ) : (
          <div className="p-12 text-center text-gray-500 text-sm">
            Los estándares de la OMS no están disponibles en este momento.
          </div>
        )}
      </div>
    </div>
  );
}
