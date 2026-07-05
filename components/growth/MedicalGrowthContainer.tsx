"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { growthService } from '@/services/growth.service';
import { GrowthMeasurementRequest, GrowthMeasurementResponse, WhoGrowthStandard } from '@/types/growth';
import MedicalGrowthChart from './MedicalGrowthChart';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { toast } from 'react-toastify';
import GrowthMeasurementForm from './GrowthMeasurementForm';

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

  const handleSubmit = async (request: GrowthMeasurementRequest) => {
    setIsSubmitting(true);
    try {
      await growthService.recordMeasurementProvider(request);
      toast.success("Medición registrada con éxito.");
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
      <GrowthMeasurementForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />

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
