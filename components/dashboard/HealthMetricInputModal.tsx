"use client";

import React, { useState } from 'react';
import { X, Activity, Heart, Scale, Droplet, Thermometer, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HealthMetricInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricKey: string;
  onSave: (metricKey: string, value: number, secondaryValue?: number) => Promise<void>;
}

export function HealthMetricInputModal({
  isOpen,
  onClose,
  metricKey,
  onSave
}: HealthMetricInputModalProps) {
  const [value, setValue] = useState<string>('');
  const [secondaryValue, setSecondaryValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  let title = "Actualizar Métrica";
  let description = "Ingresa el valor más reciente.";
  let Icon = Activity;
  let hasSecondary = false;
  let primaryPlaceholder = "Valor";
  let secondaryPlaceholder = "";
  let primaryLabel = "Valor";
  let secondaryLabel = "";

  switch (metricKey) {
    case "BMI":
      title = "Peso y Altura (IMC)";
      description = "Para calcular tu IMC actualiza tu peso y altura.";
      Icon = Scale;
      hasSecondary = true;
      primaryLabel = "Peso (kg)";
      primaryPlaceholder = "Ej. 70.5";
      secondaryLabel = "Altura (cm)";
      secondaryPlaceholder = "Ej. 175";
      break;
    case "BLOOD_PRESSURE":
      title = "Presión Arterial";
      description = "Ingresa tu presión sistólica y diastólica.";
      Icon = Heart;
      hasSecondary = true;
      primaryLabel = "Sistólica";
      primaryPlaceholder = "Ej. 120";
      secondaryLabel = "Diastólica";
      secondaryPlaceholder = "Ej. 80";
      break;
    case "HEART_RATE":
      title = "Frecuencia Cardíaca";
      description = "Ingresa tu frecuencia cardíaca en reposo.";
      Icon = Heart;
      primaryLabel = "Latidos por minuto (lpm)";
      primaryPlaceholder = "Ej. 72";
      break;
    case "SLEEP_HOURS":
      title = "Horas de Sueño";
      description = "Ingresa el promedio de horas que duermes por noche.";
      Icon = Moon;
      primaryLabel = "Horas (hrs)";
      primaryPlaceholder = "Ej. 7.5";
      break;
    case "BLOOD_GLUCOSE":
      title = "Glucosa en Sangre";
      description = "Ingresa tu nivel de glucosa en ayuno.";
      Icon = Droplet;
      primaryLabel = "Glucosa (mg/dL)";
      primaryPlaceholder = "Ej. 95";
      break;
    case "BLOOD_OXYGEN":
      title = "Saturación de Oxígeno";
      description = "Ingresa tu porcentaje de SpO2.";
      Icon = Droplet;
      primaryLabel = "SpO2 (%)";
      primaryPlaceholder = "Ej. 98";
      break;
  }

  const handleSave = async () => {
    if (!value) return;
    try {
      setIsSubmitting(true);
      await onSave(
        metricKey, 
        parseFloat(value), 
        hasSecondary && secondaryValue ? parseFloat(secondaryValue) : undefined
      );
      setValue('');
      setSecondaryValue('');
      onClose();
    } catch (error) {
      console.error("Error updating metric:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white w-full max-w-md shadow-2xl relative">
        
        {/* Header */}
        <div className="border-b border-black dark:border-white p-6 flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
              <Icon className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
                {title}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {description}
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
        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              {primaryLabel}
            </label>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={primaryPlaceholder}
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 p-3 text-lg focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
            />
          </div>

          {hasSecondary && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                {secondaryLabel}
              </label>
              <input
                type="number"
                step="any"
                value={secondaryValue}
                onChange={(e) => setSecondaryValue(e.target.value)}
                placeholder={secondaryPlaceholder}
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 p-3 text-lg focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-black dark:border-white p-6 bg-gray-50 dark:bg-[#050505] flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-none border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 uppercase tracking-widest text-[10px] font-bold"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!value || isSubmitting}
            className="rounded-none bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black uppercase tracking-widest text-[10px] font-bold"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Dato'}
          </Button>
        </div>
      </div>
    </div>
  );
}
