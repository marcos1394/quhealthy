"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useMemo } from "react";
import {
  PackageCheck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  BadgeAlert,
  Sliders,
  Calendar,
  Percent,
  Sparkles,
  Info,
  Ban,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function generateReturnPolicyText(days: number, refundPercent: number): string {
  if (days === 0 || refundPercent === 0) {
    return "Venta final por control sanitario y bioseguridad. No se admiten devoluciones ni cancelaciones una vez despachado el producto, salvo defecto de fabricación o daño comprobable por paquetería reportado dentro de las primeras 48 horas.";
  }
  if (refundPercent === 100) {
    return `Aceptamos devoluciones dentro de los primeros ${days} días naturales posteriores a la entrega con empaque original sellado e intacto, otorgando el 100% de reembolso. Por bioseguridad no aplica en material estéril abierto ni medicamentos con cadena de frío.`;
  }
  return `Aceptamos devoluciones dentro de los primeros ${days} días naturales posteriores a la entrega con empaque original sellado e intacto, con reembolso del ${refundPercent}% (deducción por costos de reacondicionamiento y logística). No aplica en material abierto ni cadena de frío.`;
}

export interface ReturnPolicyProps {
  policyText: string;
  onChange: (text: string) => void;
  returnWindowDays?: number;
  onChangeReturnWindowDays?: (days: number) => void;
  returnRefundPercent?: number;
  onChangeReturnRefundPercent?: (percent: number) => void;
  policyType?: string;
  onChangePolicyType?: (type: string) => void;
}

export function ReturnPolicySection({
  policyText,
  onChange,
  returnWindowDays = 7,
  onChangeReturnWindowDays,
  returnRefundPercent = 100,
  onChangeReturnRefundPercent,
  policyType = "STANDARD_7_DAYS",
  onChangePolicyType,
}: ReturnPolicyProps) {

  // ── PRESETS PARAMÉTRICOS DE DEVOLUCIÓN ─────────────────────────────
  const PRESETS = useMemo(
    () => [
      {
        id: "STANDARD_7_DAYS",
        name: "Estándar 7 Días",
        badge: "Norma COFEPRIS",
        days: 7,
        refund: 100,
        icon: PackageCheck,
        summary: "7 días de devolución · Reembolso 100%",
        desc: "Acepta devoluciones en la primera semana con empaque original sellado.",
      },
      {
        id: "EXTENDED_15_DAYS",
        name: "Ampliada 15 Días",
        badge: "Equipos / B2B",
        days: 15,
        refund: 100,
        icon: ShieldCheck,
        summary: "15 días de devolución · Reembolso 100%",
        desc: "Ideal para instrumental, dispositivos médicos o aparatos con prueba inicial.",
      },
      {
        id: "EXTENDED_30_DAYS",
        name: "Garantía 30 Días",
        badge: "Dispositivos",
        days: 30,
        refund: 100,
        icon: RotateCcw,
        summary: "30 días de garantía · Reembolso 100%",
        desc: "Garantía extendida contra defectos de fábrica o reposición de piezas.",
      },
      {
        id: "FINAL_SALE",
        name: "Venta Final / Sanitaria",
        badge: "Bioseguridad Crítica",
        days: 0,
        refund: 0,
        icon: Ban,
        summary: "Sin devolución · Reembolso 0%",
        desc: "Medicamentos controlados, material estéril o reactivos sin posibilidad de retorno.",
      },
    ],
    []
  );

  const handleSelectPreset = (preset: (typeof PRESETS)[0]) => {
    onChangePolicyType?.(preset.id);
    onChangeReturnWindowDays?.(preset.days);
    onChangeReturnRefundPercent?.(preset.refund);
    const newText = generateReturnPolicyText(preset.days, preset.refund);
    onChange(newText);
  };

  const handleCustomDaysChange = (days: number) => {
    const validDays = Math.max(0, Math.min(365, days));
    onChangePolicyType?.("CUSTOM");
    onChangeReturnWindowDays?.(validDays);
    const newText = generateReturnPolicyText(validDays, returnRefundPercent);
    onChange(newText);
  };

  const handleCustomRefundChange = (percent: number) => {
    const validPercent = Math.max(0, Math.min(100, percent));
    onChangePolicyType?.("CUSTOM");
    onChangeReturnRefundPercent?.(validPercent);
    const newText = generateReturnPolicyText(returnWindowDays, validPercent);
    onChange(newText);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs font-sans transition-colors select-none overflow-hidden">
      {/* ── CABECERA ─────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-gray-50/60 dark:bg-[#050505]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
            <PackageCheck className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Política Global de Devolución e Insumos
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              Define los plazos de garantía y porcentaje de reembolso aplicables a tus productos, fármacos y material de curación.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* ── BANNER EXPLICATIVO GLOBAL VS ATÓMICO ─────────────────────── */}
        <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 p-4 bg-blue-50/30 dark:bg-blue-950/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
            <strong>Asignación Global en Catálogo:</strong> Esta política de devolución se asignará por defecto a todos los productos físicos y suministros de tu tienda, con opción a personalizarla para cada producto individual en tu catálogo.
          </div>
        </div>

        {/* ── SELECTOR DE PLANTILLAS BASE ─────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
              1. Selecciona un esquema base de garantía o personalízalo
            </Label>
            {policyType === "CUSTOM" && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/30">
                Personalizado Activo
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected =
                policyType === preset.id &&
                returnWindowDays === preset.days &&
                returnRefundPercent === preset.refund;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={cn(
                    "flex flex-col items-start justify-between gap-3 p-4 rounded-2xl border text-left transition-all duration-200 relative group cursor-pointer shadow-2xs min-h-[140px]",
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-blue-400/50 hover:bg-gray-50/50 dark:hover:bg-[#0f0f0f]"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isSelected
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 group-hover:text-blue-600"
                        )}
                        strokeWidth={2}
                      />
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {preset.badge}
                      </span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" strokeWidth={2.5} />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className={cn("text-xs font-bold", isSelected ? "text-blue-950 dark:text-blue-200" : "text-gray-900 dark:text-white")}>
                      {preset.name}
                    </h4>
                    <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
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
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              2. Parámetros Numéricos de Garantía y Devolución
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ventana de Devolución en Días */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Plazo Límite de Devolución</span>
                </Label>
                <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900/40">
                  {returnWindowDays === 0 ? "Venta final (0 días)" : `${returnWindowDays} días naturales`}
                </span>
              </div>

              {/* Quick Choice Chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "0 días (Venta final)", value: 0 },
                  { label: "7 días", value: 7 },
                  { label: "15 días", value: 15 },
                  { label: "30 días", value: 30 },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => handleCustomDaysChange(chip.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                      returnWindowDays === chip.value
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-blue-500/40"
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
                  max={365}
                  value={returnWindowDays}
                  onChange={(e) => handleCustomDaysChange(Number(e.target.value))}
                  className="h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-bold"
                  placeholder="Días..."
                />
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  días tras entrega
                </span>
              </div>
            </div>

            {/* Porcentaje de Reembolso */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-blue-600" />
                  <span>Porcentaje de Reembolso en Devolución</span>
                </Label>
                <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900/40">
                  {returnRefundPercent}% Reembolsable
                </span>
              </div>

              {/* Quick Choice Chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "100% (Total)", value: 100 },
                  { label: "90% (Deducción 10%)", value: 90 },
                  { label: "80%", value: 80 },
                  { label: "0% (Sin reembolso)", value: 0 },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => handleCustomRefundChange(chip.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                      returnRefundPercent === chip.value
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-blue-500/40"
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
                  value={returnRefundPercent}
                  onChange={(e) => handleCustomRefundChange(Number(e.target.value))}
                  className="h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-bold"
                  placeholder="%"
                />
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  % reembolsado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── REDACCIÓN GENERADA DINÁMICAMENTE ─────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Resumen Generado para Compradores</span>
            </Label>
            <span className="text-[11px] text-gray-400 font-medium">
              Calculado automáticamente según tus parámetros
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs font-medium text-blue-900 dark:text-blue-200 leading-relaxed shadow-2xs">
            {generateReturnPolicyText(returnWindowDays, returnRefundPercent)}
          </div>

          {/* Notas Adicionales o Redacción Personalizada */}
          <div className="space-y-1.5 pt-2">
            <Label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
              Términos sanitarios específicos o excepciones de empaque (opcional):
            </Label>
            <Textarea
              value={policyText || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Ejemplo: Por disposición de COFEPRIS, medicamentos que requieran refrigeración o empaques estériles violados no son elegibles para retorno..."
              className="rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white p-3.5 min-h-[90px] focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 resize-none shadow-2xs placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* ── CONSEJO REGULATORIO COFEPRIS ────────────────────────────── */}
        <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 p-4 bg-blue-50/30 dark:bg-blue-950/20 flex gap-3">
          <BadgeAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
            <strong>Marco Sanitario:</strong> En insumos estériles o con cadena de frío, la ley sanitaria prohíbe la reintegración a inventario de productos manipulados o abiertos fuera de supervisión médica.
          </div>
        </div>
      </div>
    </div>
  );
}
