"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X, HeartPulse, Activity } from "lucide-react";

import { VitalSignRequest } from "@/types/ehr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface VitalSignsCaptureProps {
  vitalSigns: VitalSignRequest[];
  addVitalSign: (vs: VitalSignRequest) => void;
  removeVitalSign: (index: number) => void;
}

export const VitalSignsCapture: React.FC<VitalSignsCaptureProps> = ({
  vitalSigns,
  addVitalSign,
  removeVitalSign,
}) => {
  const t = useTranslations("EHR");

  const [type, setType] = useState("HEART_RATE");
  const [value, setValue] = useState("");
  const [secondaryValue, setSecondaryValue] = useState("");

  const VITAL_SIGN_TYPES = [
    { value: "HEART_RATE", label: t("vs_heart_rate") },
    { value: "BLOOD_PRESSURE", label: t("vs_blood_pressure") },
    { value: "SPO2", label: t("vs_spo2") },
    { value: "TEMPERATURE", label: t("vs_temperature") },
    { value: "WEIGHT", label: t("vs_weight") },
    { value: "HEIGHT", label: t("vs_height") },
    { value: "BMI", label: t("vs_bmi") },
    { value: "RESPIRATORY_RATE", label: t("vs_respiratory_rate") },
    { value: "GLUCOSE", label: t("vs_glucose") },
  ];

  const handleAdd = () => {
    if (!value) return;

    let unit = "";
    switch (type) {
      case "HEART_RATE":
        unit = "bpm";
        break;
      case "BLOOD_PRESSURE":
        unit = "mmHg";
        break;
      case "SPO2":
        unit = "%";
        break;
      case "TEMPERATURE":
        unit = "°C";
        break;
      case "WEIGHT":
        unit = "kg";
        break;
      case "HEIGHT":
        unit = "cm";
        break;
      case "RESPIRATORY_RATE":
        unit = "rpm";
        break;
      case "GLUCOSE":
        unit = "mg/dL";
        break;
      default:
        unit = "";
    }

    addVitalSign({
      type,
      value: parseFloat(value),
      secondaryValue: secondaryValue ? parseFloat(secondaryValue) : undefined,
      unit,
      measuredAt: new Date().toISOString(),
      source: "MANUAL",
      deviceModel: "CONSULTORIO",
    });

    setValue("");
    setSecondaryValue("");
  };

  const isBloodPressure = type === "BLOOD_PRESSURE";

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* ── FORMULARIO DE CAPTURA ────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Selector de Tipo */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
              {t("vital_sign_type_label")}
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:ring-emerald-500/20 shadow-xs">
                <SelectValue placeholder={t("vital_sign_type_placeholder")} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl font-sans">
                {VITAL_SIGN_TYPES.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Valor Principal */}
          <div
            className={
              isBloodPressure ? "sm:col-span-3 space-y-1.5" : "sm:col-span-4 space-y-1.5"
            }
          >
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
              {isBloodPressure
                ? t("systolic_label")
                : t("vital_sign_value_label")}
            </label>
            <Input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
              placeholder="0.0"
            />
          </div>

          {/* Valor Secundario (Diastólica) */}
          {isBloodPressure && (
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("diastolic_label")}
              </label>
              <Input
                type="number"
                step="any"
                value={secondaryValue}
                onChange={(e) => setSecondaryValue(e.target.value)}
                className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
                placeholder="0.0"
              />
            </div>
          )}

          {/* Botón Agregar */}
          <div
            className={
              isBloodPressure ? "sm:col-span-2" : "sm:col-span-3"
            }
          >
            <button
              type="button"
              onClick={handleAdd}
              disabled={!value || (isBloodPressure && !secondaryValue)}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>{t("btn_add_vital")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── LISTA DE SIGNOS VITALES REGISTRADOS ─────────────────────── */}
      {vitalSigns.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {vitalSigns.map((vs, idx) => {
            const labelObj = VITAL_SIGN_TYPES.find((opt) => opt.value === vs.type);
            const label = labelObj ? labelObj.label : vs.type;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xs transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <HeartPulse className="w-4.5 h-4.5" strokeWidth={2} />
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 truncate">
                      {label}
                    </p>
                    <p className="text-xs font-bold font-mono text-gray-900 dark:text-white">
                      {vs.value}
                      {vs.secondaryValue ? ` / ${vs.secondaryValue}` : ""}{" "}
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        {vs.unit}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeVitalSign(idx)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-600 transition-colors shrink-0 cursor-pointer border border-gray-100 dark:border-gray-800"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};