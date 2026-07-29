"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  X,
  Activity,
  Heart,
  Scale,
  Droplet,
  Thermometer,
  Moon,
  Clock,
} from "lucide-react";

import { DatePicker } from "@/components/ui/date-picker";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface HealthMetricInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricKey: string;
  onSave: (
    metricKey: string,
    value: number,
    secondaryValue?: number,
    measuredAt?: string
  ) => Promise<void>;
}

type MetricConfig = {
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
  hasSecondary: boolean;
  primaryLabelKey: string;
  primaryPhKey: string;
  secondaryLabelKey?: string;
  secondaryPhKey?: string;
};

const METRIC_CONFIG_MAP: Record<string, MetricConfig> = {
  BMI: {
    titleKey: "bmi_title",
    descKey: "bmi_desc",
    icon: Scale,
    hasSecondary: true,
    primaryLabelKey: "bmi_primary",
    primaryPhKey: "bmi_primary_ph",
    secondaryLabelKey: "bmi_secondary",
    secondaryPhKey: "bmi_secondary_ph",
  },
  BLOOD_PRESSURE: {
    titleKey: "blood_pressure_title",
    descKey: "blood_pressure_desc",
    icon: Heart,
    hasSecondary: true,
    primaryLabelKey: "blood_pressure_primary",
    primaryPhKey: "blood_pressure_primary_ph",
    secondaryLabelKey: "blood_pressure_secondary",
    secondaryPhKey: "blood_pressure_secondary_ph",
  },
  HEART_RATE: {
    titleKey: "heart_rate_title",
    descKey: "heart_rate_desc",
    icon: Heart,
    hasSecondary: false,
    primaryLabelKey: "heart_rate_primary",
    primaryPhKey: "heart_rate_primary_ph",
  },
  SLEEP_HOURS: {
    titleKey: "sleep_hours_title",
    descKey: "sleep_hours_desc",
    icon: Moon,
    hasSecondary: false,
    primaryLabelKey: "sleep_hours_primary",
    primaryPhKey: "sleep_hours_primary_ph",
  },
  GLUCOSE: {
    titleKey: "glucose_title",
    descKey: "glucose_desc",
    icon: Droplet,
    hasSecondary: false,
    primaryLabelKey: "glucose_primary",
    primaryPhKey: "glucose_primary_ph",
  },
  BLOOD_GLUCOSE: {
    titleKey: "glucose_title",
    descKey: "glucose_desc",
    icon: Droplet,
    hasSecondary: false,
    primaryLabelKey: "glucose_primary",
    primaryPhKey: "glucose_primary_ph",
  },
  SPO2: {
    titleKey: "spo2_title",
    descKey: "spo2_desc",
    icon: Droplet,
    hasSecondary: false,
    primaryLabelKey: "spo2_primary",
    primaryPhKey: "spo2_primary_ph",
  },
  BLOOD_OXYGEN: {
    titleKey: "spo2_title",
    descKey: "spo2_desc",
    icon: Droplet,
    hasSecondary: false,
    primaryLabelKey: "spo2_primary",
    primaryPhKey: "spo2_primary_ph",
  },
  TEMPERATURE: {
    titleKey: "temperature_title",
    descKey: "temperature_desc",
    icon: Thermometer,
    hasSecondary: false,
    primaryLabelKey: "temperature_primary",
    primaryPhKey: "temperature_primary_ph",
  },
  WEIGHT: {
    titleKey: "weight_title",
    descKey: "weight_desc",
    icon: Scale,
    hasSecondary: false,
    primaryLabelKey: "weight_primary",
    primaryPhKey: "weight_primary_ph",
  },
};

export function HealthMetricInputModal({
  isOpen,
  onClose,
  metricKey,
  onSave,
}: HealthMetricInputModalProps) {
  const t = useTranslations("HealthMetricInputModal");

  const [value, setValue] = useState<string>("");
  const [secondaryValue, setSecondaryValue] = useState<string>("");
  const [measuredNow, setMeasuredNow] = useState(true);
  const [measuredDate, setMeasuredDate] = useState<Date | undefined>(
    new Date()
  );
  const [measuredTime, setMeasuredTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const config = METRIC_CONFIG_MAP[metricKey] || {
    titleKey: "title_default",
    descKey: "desc_default",
    icon: Activity,
    hasSecondary: false,
    primaryLabelKey: "bmi_primary",
    primaryPhKey: "bmi_primary_ph",
  };

  const {
    titleKey,
    descKey,
    icon: Icon,
    hasSecondary,
    primaryLabelKey,
    primaryPhKey,
    secondaryLabelKey,
    secondaryPhKey,
  } = config;

  const handleSave = async () => {
    if (!value) return;
    try {
      setIsSubmitting(true);

      let finalMeasuredAt: string;
      if (measuredNow) {
        finalMeasuredAt = new Date().toISOString();
      } else if (measuredDate && measuredTime) {
        const [hours, minutes] = measuredTime.split(":").map(Number);
        const finalDate = new Date(measuredDate);
        finalDate.setHours(hours, minutes, 0, 0);
        finalMeasuredAt = finalDate.toISOString();
      } else {
        finalMeasuredAt = new Date().toISOString();
      }

      await onSave(
        metricKey,
        parseFloat(value),
        hasSecondary && secondaryValue
          ? parseFloat(secondaryValue)
          : undefined,
        finalMeasuredAt
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans transition-colors">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 w-full max-w-md shadow-2xl relative rounded-3xl overflow-hidden flex flex-col">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="border-b border-gray-100 dark:border-gray-800 p-6 flex justify-between items-start bg-gray-50/60 dark:bg-[#050505] shrink-0">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
              <Icon className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t(titleKey)}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t(descKey)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── BODY ───────────────────────────────────────────────────── */}
        <div className="p-6 flex flex-col space-y-4 bg-white dark:bg-[#0a0a0a]">
          {/* Campo Principal */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t(primaryLabelKey)}
            </label>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t(primaryPhKey)}
              className="w-full h-11 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 p-3.5 text-xs font-mono font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs placeholder:text-gray-400 font-sans"
            />
          </div>

          {/* Campo Secundario (si aplica) */}
          {hasSecondary && secondaryLabelKey && secondaryPhKey && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                {t(secondaryLabelKey)}
              </label>
              <input
                type="number"
                step="any"
                value={secondaryValue}
                onChange={(e) => setSecondaryValue(e.target.value)}
                placeholder={t(secondaryPhKey)}
                className="w-full h-11 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 p-3.5 text-xs font-mono font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs placeholder:text-gray-400 font-sans"
              />
            </div>
          )}

          {/* Timestamp Selector */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("when_measured")}
            </label>

            <div className="grid grid-cols-2 gap-2 bg-gray-50/60 dark:bg-[#050505] p-1 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xs">
              <button
                type="button"
                onClick={() => setMeasuredNow(true)}
                className={cn(
                  "h-9 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  measuredNow
                    ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                {t("measured_now")}
              </button>
              <button
                type="button"
                onClick={() => setMeasuredNow(false)}
                className={cn(
                  "h-9 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  !measuredNow
                    ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                {t("measured_custom")}
              </button>
            </div>

            {!measuredNow && (
              <div className="flex gap-2 pt-1">
                <div className="flex-1">
                  <DatePicker
                    value={measuredDate}
                    onChange={setMeasuredDate}
                    placeholder="DD/MM/AAAA"
                    toYear={new Date().getFullYear()}
                  />
                </div>
                <div className="w-1/3 relative">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
                  <input
                    type="time"
                    value={measuredTime}
                    onChange={(e) => setMeasuredTime(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs [&::-webkit-calendar-picker-indicator]:dark:invert"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-5 bg-gray-50/60 dark:bg-[#050505] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11 px-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {t("btn_cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!value || isSubmitting}
            className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <QhSpinner size="sm" className="text-white" />
                <span>{t("btn_saving")}</span>
              </>
            ) : (
              <span>{t("btn_save")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}