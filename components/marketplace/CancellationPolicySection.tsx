"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useMemo } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  CheckCircle2,
  Sliders,
  Clock,
  Percent,
  Sparkles,
  Info,
  CalendarCheck,
  Ban,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function generateCancellationPolicyText(hours: number, refundPercent: number): string {
  if (refundPercent === 0) {
    return "Cita no reembolsable. Una vez reservada y confirmada, no se admiten cancelaciones con devolución de dinero ni compensación económica.";
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  let timeStr = "";
  if (days > 0 && remainingHours === 0) {
    timeStr = days === 1 ? "24 horas (1 día)" : `${hours} horas (${days} días)`;
  } else if (days > 0) {
    timeStr = `${hours} horas (${days} días y ${remainingHours}h)`;
  } else {
    timeStr = `${hours} horas`;
  }

  if (refundPercent === 100) {
    return `Cancelación sin costo con reembolso del 100% notificando con al menos ${timeStr} de anticipación al horario reservado. Cancelaciones con menor tiempo o inasistencia no son elegibles para reembolso.`;
  }
  return `Cancelación con reembolso del ${refundPercent}% notificando con al menos ${timeStr} de anticipación al horario reservado. Cancelaciones con menor tiempo o inasistencia no son elegibles para reembolso.`;
}

export interface CancellationPolicyProps {
  policyText: string;
  onChange: (text: string) => void;
  deadlineHours?: number;
  onChangeDeadlineHours?: (hours: number) => void;
  refundPercent?: number;
  onChangeRefundPercent?: (percent: number) => void;
  policyType?: string;
  onChangePolicyType?: (type: string) => void;
}

export function CancellationPolicySection({
  policyText,
  onChange,
  deadlineHours = 24,
  onChangeDeadlineHours,
  refundPercent = 100,
  onChangeRefundPercent,
  policyType = "FLEXIBLE",
  onChangePolicyType,
}: CancellationPolicyProps) {

  // ── PRESETS PARAMÉTRICOS ───────────────────────────────────────────
  const PRESETS = useMemo(
    () => [
      {
        id: "FLEXIBLE",
        name: "Flexible (Recomendado)",
        badge: "Más popular",
        hours: 24,
        refund: 100,
        icon: ShieldCheck,
        color: "emerald",
        summary: "24h de anticipación · Reembolso 100%",
        desc: "El paciente puede cancelar hasta 24h antes y recibir su dinero íntegro.",
      },
      {
        id: "MODERATE",
        name: "Moderada",
        badge: "Especialidades",
        hours: 48,
        refund: 100,
        icon: Shield,
        color: "blue",
        summary: "48h de anticipación · Reembolso 100%",
        desc: "Ideal para consultas que requieren preparación o estudios previos.",
      },
      {
        id: "STRICT",
        name: "Estricta",
        badge: "Procedimientos",
        hours: 72,
        refund: 50,
        icon: ShieldAlert,
        color: "amber",
        summary: "72h de anticipación · Reembolso 50%",
        desc: "Requiere 3 días de aviso y aplica penalización del 50% por cancelación.",
      },
      {
        id: "NON_REFUNDABLE",
        name: "No Reembolsable",
        badge: "Quirófano / Bloqueo",
        hours: 0,
        refund: 0,
        icon: Ban,
        color: "rose",
        summary: "Sin cancelación · Reembolso 0%",
        desc: "Cobro definitivo al reservar. No permite reembolsos ni cancelaciones.",
      },
    ],
    []
  );

  const handleSelectPreset = (preset: (typeof PRESETS)[0]) => {
    onChangePolicyType?.(preset.id);
    onChangeDeadlineHours?.(preset.hours);
    onChangeRefundPercent?.(preset.refund);
    const newText = generateCancellationPolicyText(preset.hours, preset.refund);
    onChange(newText);
  };

  const handleCustomHoursChange = (hours: number) => {
    const validHours = Math.max(0, Math.min(720, hours)); // Máx 30 días
    onChangePolicyType?.("CUSTOM");
    onChangeDeadlineHours?.(validHours);
    const newText = generateCancellationPolicyText(validHours, refundPercent);
    onChange(newText);
  };

  const handleCustomRefundChange = (percent: number) => {
    const validPercent = Math.max(0, Math.min(100, percent));
    onChangePolicyType?.("CUSTOM");
    onChangeRefundPercent?.(validPercent);
    const newText = generateCancellationPolicyText(deadlineHours, validPercent);
    onChange(newText);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs font-sans transition-colors select-none overflow-hidden">
      {/* ── CABECERA ─────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-gray-50/60 dark:bg-[#050505]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <CalendarCheck className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Política Global de Cancelación de Citas
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              Configura los valores numéricos de tiempo y porcentaje que se aplicarán automáticamente a tus servicios y reservas.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* ── BANNER EXPLICATIVO GLOBAL VS ATÓMICO ─────────────────────── */}
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 p-4 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
            <strong>Asignación Global Automática:</strong> Esta regla regirá por defecto todas tus consultas y paquetes. Si lo deseas, puedes asignar una regla atómica personalizada a un servicio en específico directamente desde tu Catálogo.
          </div>
        </div>

        {/* ── SELECTOR DE PLANTILLAS BASE ─────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
              1. Selecciona un esquema base o personalízalo
            </Label>
            {policyType === "CUSTOM" && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-900/30">
                Personalizado Activo
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected =
                policyType === preset.id &&
                deadlineHours === preset.hours &&
                refundPercent === preset.refund;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={cn(
                    "flex flex-col items-start justify-between gap-3 p-4 rounded-2xl border text-left transition-all duration-200 relative group cursor-pointer shadow-2xs min-h-[140px]",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-400/50 hover:bg-gray-50/50 dark:hover:bg-[#0f0f0f]"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isSelected
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-gray-400 group-hover:text-emerald-600"
                        )}
                        strokeWidth={2}
                      />
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {preset.badge}
                      </span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className={cn("text-xs font-bold", isSelected ? "text-emerald-950 dark:text-emerald-200" : "text-gray-900 dark:text-white")}>
                      {preset.name}
                    </h4>
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {preset.summary}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
                      {preset.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── PARÁMETROS NUMÉRICOS PERSONALIZABLES ────────────────────── */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-[#060606] p-5 md:p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-800">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              2. Parámetros Numéricos Aplicados en Reservas y Reembolsos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Anticipación en Horas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Anticipación Mínima Requerida</span>
                </Label>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                  {deadlineHours} horas ({Math.round((deadlineHours / 24) * 10) / 10} días)
                </span>
              </div>

              {/* Quick Choice Chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "12h", value: 12 },
                  { label: "24h (1 día)", value: 24 },
                  { label: "48h (2 días)", value: 48 },
                  { label: "72h (3 días)", value: 72 },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => handleCustomHoursChange(chip.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                      deadlineHours === chip.value
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/40"
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="number"
                  min={0}
                  max={720}
                  value={deadlineHours}
                  onChange={(e) => handleCustomHoursChange(Number(e.target.value))}
                  className="h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-bold"
                  placeholder="Horas..."
                />
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  horas de margen
                </span>
              </div>
            </div>

            {/* Porcentaje de Reembolso */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Porcentaje de Reembolso a Tiempo</span>
                </Label>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                  {refundPercent}% Reembolsable
                </span>
              </div>

              {/* Quick Choice Chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "100% (Total)", value: 100 },
                  { label: "80%", value: 80 },
                  { label: "50%", value: 50 },
                  { label: "0% (No reembolsable)", value: 0 },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => handleCustomRefundChange(chip.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                      refundPercent === chip.value
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/40"
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={refundPercent}
                  onChange={(e) => handleCustomRefundChange(Number(e.target.value))}
                  className="h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-bold"
                  placeholder="%"
                />
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  % reembolsado al paciente
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── REDACCIÓN GENERADA DINÁMICAMENTE (REGLA ACTIVA) ─────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Resumen Generado y Visible para los Pacientes</span>
            </Label>
            <span className="text-[11px] text-gray-400 font-medium">
              Calculado automáticamente según tus parámetros
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed shadow-2xs">
            {generateCancellationPolicyText(deadlineHours, refundPercent)}
          </div>

          {/* Notas Adicionales o Redacción Personalizada */}
          <div className="space-y-1.5 pt-2">
            <Label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
              Aclaraciones o términos adicionales (opcional):
            </Label>
            <Textarea
              value={policyText || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Ejemplo: Si presentas síntomas gripales imprevistos, por favor comunícate directamente por WhatsApp para reagendar sin penalización..."
              className="rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white p-3.5 min-h-[90px] focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 resize-none shadow-2xs placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
