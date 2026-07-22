"use client";
/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import {
  X,
  Activity,
  Heart,
  Scale,
  Droplet,
  Thermometer,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HealthMetricInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricKey: string;
  onSave: (
    metricKey: string,
    value: number,
    secondaryValue?: number,
    measuredAt?: string,
  ) => Promise<void>;
}

type MetricConfig = {
  title: string;
  description: string;
  icon: React.ElementType;
  hasSecondary: boolean;
  primaryLabel: string;
  primaryPlaceholder: string;
  secondaryLabel?: string;
  secondaryPlaceholder?: string;
};

const METRIC_CONFIG_MAP: Record<string, MetricConfig> = {
  BMI: {
    title: "Peso y Altura (IMC)",
    description: "Para calcular tu IMC actualiza tu peso y altura.",
    icon: Scale,
    hasSecondary: true,
    primaryLabel: "Peso (kg)",
    primaryPlaceholder: "Ej. 70.5",
    secondaryLabel: "Altura (cm)",
    secondaryPlaceholder: "Ej. 175",
  },
  BLOOD_PRESSURE: {
    title: "Presión Arterial",
    description: "Ingresa tu presión sistólica y diastólica.",
    icon: Heart,
    hasSecondary: true,
    primaryLabel: "Sistólica",
    primaryPlaceholder: "Ej. 120",
    secondaryLabel: "Diastólica",
    secondaryPlaceholder: "Ej. 80",
  },
  HEART_RATE: {
    title: "Frecuencia Cardíaca",
    description: "Ingresa tu frecuencia cardíaca en reposo.",
    icon: Heart,
    hasSecondary: false,
    primaryLabel: "Latidos por minuto (lpm)",
    primaryPlaceholder: "Ej. 72",
  },
  SLEEP_HOURS: {
    title: "Horas de Sueño",
    description: "Ingresa el promedio de horas que duermes por noche.",
    icon: Moon,
    hasSecondary: false,
    primaryLabel: "Horas (hrs)",
    primaryPlaceholder: "Ej. 7.5",
  },
  GLUCOSE: {
    title: "Glucosa en Sangre",
    description: "Ingresa tu nivel de glucosa.",
    icon: Droplet,
    hasSecondary: false,
    primaryLabel: "Glucosa (mg/dL)",
    primaryPlaceholder: "Ej. 95",
  },
  BLOOD_GLUCOSE: {
    title: "Glucosa en Sangre",
    description: "Ingresa tu nivel de glucosa en ayuno.",
    icon: Droplet,
    hasSecondary: false,
    primaryLabel: "Glucosa (mg/dL)",
    primaryPlaceholder: "Ej. 95",
  },
  SPO2: {
    title: "Saturación de Oxígeno",
    description: "Ingresa tu porcentaje de SpO2.",
    icon: Droplet,
    hasSecondary: false,
    primaryLabel: "SpO2 (%)",
    primaryPlaceholder: "Ej. 98",
  },
  BLOOD_OXYGEN: {
    title: "Saturación de Oxígeno",
    description: "Ingresa tu porcentaje de SpO2.",
    icon: Droplet,
    hasSecondary: false,
    primaryLabel: "SpO2 (%)",
    primaryPlaceholder: "Ej. 98",
  },
  TEMPERATURE: {
    title: "Temperatura",
    description: "Ingresa tu temperatura corporal.",
    icon: Thermometer,
    hasSecondary: false,
    primaryLabel: "Temperatura (°C)",
    primaryPlaceholder: "Ej. 36.5",
  },
  WEIGHT: {
    title: "Peso Corporal",
    description: "Ingresa tu peso actual.",
    icon: Scale,
    hasSecondary: false,
    primaryLabel: "Peso (kg)",
    primaryPlaceholder: "Ej. 70.5",
  },
};

import { DatePicker } from "@/components/ui/date-picker";

export function HealthMetricInputModal({
  isOpen,
  onClose,
  metricKey,
  onSave,
}: HealthMetricInputModalProps) {
  const [value, setValue] = useState<string>("");
  const [secondaryValue, setSecondaryValue] = useState<string>("");
  const [measuredNow, setMeasuredNow] = useState(true);
  const [measuredDate, setMeasuredDate] = useState<Date | undefined>(
    new Date(),
  );
  const [measuredTime, setMeasuredTime] = useState<string>(
    new Date().toTimeString().slice(0, 5), // "HH:MM"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const config = METRIC_CONFIG_MAP[metricKey] || {
    title: "Actualizar Métrica",
    description: "Ingresa el valor más reciente.",
    icon: Activity,
    hasSecondary: false,
    primaryLabel: "Valor",
    primaryPlaceholder: "Valor",
    secondaryLabel: "",
    secondaryPlaceholder: "",
  };

  const {
    title,
    description,
    icon: Icon,
    hasSecondary,
    primaryLabel,
    primaryPlaceholder,
    secondaryLabel,
    secondaryPlaceholder,
  } = config;

  const handleSave = async () => {
    if (!value) return;
    try {
      setIsSubmitting(true);

      let finalMeasuredAt = undefined;
      if (measuredNow) {
        finalMeasuredAt = new Date().toISOString();
      } else if (measuredDate && measuredTime) {
        const [hours, minutes] = measuredTime.split(":").map(Number);
        const finalDate = new Date(measuredDate);
        finalDate.setHours(hours, minutes, 0, 0);
        finalMeasuredAt = finalDate.toISOString();
      } else {
        finalMeasuredAt = new Date().toISOString(); // fallback
      }

      await onSave(
        metricKey,
        parseFloat(value),
        hasSecondary && secondaryValue ? parseFloat(secondaryValue) : undefined,
        finalMeasuredAt,
      );
      setValue("");
      setSecondaryValue("");
      setMeasuredNow(true);
      setMeasuredDate(new Date());
      setMeasuredTime(new Date().toTimeString().slice(0, 5));
      onClose();
    } catch (error) {
      console.error("Error updating metric:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 w-full max-w-md shadow-xl relative rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 dark:border-gray-800 p-6 flex justify-between items-start bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-50 dark:bg-teal-500/10">
              <Icon
                className="w-5 h-5 text-teal-600 dark:text-teal-400"
                strokeWidth={2}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {title}
              </h2>
              <p className="text-sm font-medium text-gray-500 mt-1">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 block">
              {primaryLabel}
            </label>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={primaryPlaceholder}
              className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 p-3 text-sm rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          {hasSecondary && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 block">
                {secondaryLabel}
              </label>
              <input
                type="number"
                step="any"
                value={secondaryValue}
                onChange={(e) => setSecondaryValue(e.target.value)}
                placeholder={secondaryPlaceholder}
                className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 p-3 text-sm rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          )}

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs font-semibold text-gray-500 block">
              ¿Cuándo se tomó la medida?
            </label>
            <div className="flex gap-4 mb-2 mt-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  checked={measuredNow}
                  onChange={() => setMeasuredNow(true)}
                  className="text-teal-600 focus:ring-teal-500"
                />
                Ahora mismo
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  checked={!measuredNow}
                  onChange={() => setMeasuredNow(false)}
                  className="text-teal-600 focus:ring-teal-500"
                />
                Otra fecha
              </label>
            </div>

            {!measuredNow && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <DatePicker
                    value={measuredDate}
                    onChange={setMeasuredDate}
                    placeholder="DD/MM/AAAA"
                    toYear={new Date().getFullYear()}
                  />
                </div>
                <div className="w-1/3">
                  <input
                    type="time"
                    value={measuredTime}
                    onChange={(e) => setMeasuredTime(e.target.value)}
                    className="w-full h-11 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl px-3 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!value || isSubmitting}
            className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600 text-sm font-bold border-0 px-6"
          >
            {isSubmitting ? "Guardando..." : "Guardar Dato"}
          </Button>
        </div>
      </div>
    </div>
  );
}
