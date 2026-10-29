"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useMemo } from "react";
import {
  PackageCheck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  FileText,
  BadgeAlert,
  HelpCircle,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ReturnPolicyProps {
  policyText: string;
  onChange: (text: string) => void;
}

export function ReturnPolicySection({
  policyText,
  onChange,
}: ReturnPolicyProps) {
  const charCount = policyText?.length || 0;
  const charLimit = 1200;

  // ── PLANTILLAS LEGALES PARA INSUMOS Y PRODUCTOS MÉDICOS ────────────
  const RETURN_TEMPLATES = useMemo(
    () => [
      {
        id: "standard_medical",
        name: "Estándar Insumos (Norma COFEPRIS)",
        icon: PackageCheck,
        badge: "Recomendado Insumos",
        text: "Aceptamos devoluciones dentro de los primeros 7 días naturales posteriores a la entrega con empaque original sellado e intacto. Por disposición sanitaria y bioseguridad, no aplican devoluciones en material estéril abierto ni productos con cadena de frío. Garantía de 30 días contra defectos de fabricación.",
      },
      {
        id: "extended_equipment",
        name: "Garantía Ampliada (Equipos y Dispositivos)",
        icon: ShieldCheck,
        badge: "Equipamiento / B2B",
        text: "Devoluciones válidas dentro de los primeros 15 días naturales posteriores a la recepción con empaque y accesorios originales. En caso de daño por paquetería o falla técnica, ofrecemos reemplazo o reembolso del 100% notificando en las primeras 48 horas con evidencia fotográfica.",
      },
      {
        id: "final_sale_strict",
        name: "Venta Final / Solo Defecto de Fábrica",
        icon: RotateCcw,
        badge: "Alta Bioseguridad",
        text: "Por la naturaleza sanitaria y control estéril de estos insumos, todas las ventas son finales una vez entregadas. Únicamente se realizan reposiciones o reembolsos por defectos de fabricación o errores en el surtido reportados en las primeras 72 horas.",
      },
    ],
    []
  );

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs font-sans transition-colors select-none overflow-hidden">
      {/* ── CABECERA INTERIOR ────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-gray-50/60 dark:bg-[#050505]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
            <PackageCheck className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Política de Devolución, Garantías y Reembolso
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              Define los plazos de retorno, condiciones de empaque sellado y garantías contra defectos para tus productos e insumos médicos.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* ── PLANTILLAS RÁPIDAS DE POLÍTICA ──────────────────────────── */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
            Selecciona una plantilla base para tu catálogo de insumos
          </Label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RETURN_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isSelected = policyText === template.text;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onChange(template.text)}
                  className={cn(
                    "flex flex-col items-start justify-between gap-3 p-5 rounded-2xl border text-left transition-all duration-200 relative group cursor-pointer shadow-2xs min-h-[170px]",
                    isSelected
                      ? "border-blue-200/90 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-blue-500/30"
                      : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-blue-500/30 hover:bg-gray-50/50 dark:hover:bg-[#050505]"
                  )}
                >
                  <div className="space-y-2.5 w-full">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={cn(
                            "w-5 h-5 shrink-0 transition-colors",
                            isSelected
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          )}
                          strokeWidth={2}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/30">
                          {template.badge}
                        </span>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" strokeWidth={2} />
                      )}
                    </div>

                    <h4
                      className={cn(
                        "text-xs sm:text-sm font-bold transition-colors tracking-tight line-clamp-1",
                        isSelected
                          ? "text-blue-950 dark:text-blue-200"
                          : "text-gray-900 dark:text-white"
                      )}
                    >
                      {template.name}
                    </h4>

                    <p
                      className={cn(
                        "text-xs font-medium leading-relaxed transition-colors line-clamp-4",
                        isSelected
                          ? "text-blue-900/90 dark:text-blue-300/90"
                          : "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {template.text}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── EDITOR PERSONALIZADO ───────────────────────────────────── */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              <span>Redacción personalizada de la política</span>
            </Label>

            <span
              className={cn(
                "text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border shadow-2xs",
                charCount > charLimit
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
                  : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              )}
            >
              {charCount} / {charLimit}
            </span>
          </div>

          <Textarea
            value={policyText || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe aquí tus términos de devolución: días hábiles para notificar, estado del empaque sellado, excepciones sanitarias (cadena de frío, material estéril) y cómo solicitar reemplazo..."
            className={cn(
              "rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white p-4 min-h-[140px] focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all resize-none leading-relaxed shadow-2xs placeholder:text-gray-400 placeholder:font-normal",
              charCount > charLimit
                ? "border-rose-300 dark:border-rose-900/50 ring-2 ring-rose-500/20"
                : ""
            )}
          />

          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Esta política se mostrará públicamente en tu tienda, en la ficha técnica de tus productos y en el recibo de compra del comprador.
          </p>
        </div>

        {/* ── CONSEJO REGULATORIO COFEPRIS / B2B ──────────────────────── */}
        <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 p-5 bg-blue-50/40 dark:bg-blue-950/20 shadow-2xs flex gap-3.5">
          <BadgeAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" strokeWidth={2} />
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300">
              Recomendación Sanitaria COFEPRIS
            </p>
            <p className="text-xs font-medium text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
              Para material de curación estéril, apósitos o reactivos de diagnóstico in vitro, se sugiere especificar que <strong>no se admiten devoluciones si el sello de bioseguridad ha sido violado</strong>, protegiendo tanto tu inventario como la seguridad de futuros pacientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
