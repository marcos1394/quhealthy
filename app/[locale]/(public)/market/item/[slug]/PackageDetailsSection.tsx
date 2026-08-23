"use client";

import React from "react";
import {
  Package,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingDown,
  Clock,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { CatalogItemDTO } from "@/types/catalog";

interface PackageDetailsSectionProps {
  item: CatalogItemDTO;
}

export function PackageDetailsSection({ item }: PackageDetailsSectionProps) {
  const comparePrice = item.compareAtPrice || (item.price ? item.price * 1.25 : 0);
  const currentPrice = item.price || 0;
  const savings = Math.max(0, comparePrice - currentPrice);
  const discountPercent = comparePrice > 0 ? Math.round((savings / comparePrice) * 100) : 0;
  const packageContents = item.packageContents || [];

  return (
    <div className="space-y-8 font-sans select-none">
      {/* ── 1. RESUMEN DE AHORRO & PARTIDAS INCLUIDAS ─────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                Servicios & Procedimientos Incluidos en este Paquete
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Todo lo necesario para tu tratamiento integral con precio preferencial
              </p>
            </div>
          </div>

          {savings > 0 && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-black">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Ahorro del {discountPercent}%</span>
            </div>
          )}
        </div>

        {/* Banner de Ahorro Económico */}
        {savings > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                %{discountPercent}
              </div>
              <div>
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 block">
                  Ahorro Total: ${savings.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                </span>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-400">
                  Precio regular individual: ${comparePrice.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono">
              Precio Especial Paquete: ${currentPrice.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
            </span>
          </div>
        )}

        {/* Desglose de Servicios Incluidos */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Sesiones y Consultas del Paquete ({packageContents.length > 0 ? packageContents.length : "Tratamiento Integral"})
          </h4>

          {packageContents.length > 0 ? (
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden bg-gray-50/50 dark:bg-[#111]">
              {packageContents.map((content, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-white dark:hover:bg-[#161616] transition-colors">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-gray-900 dark:text-white block">
                        {content.name}
                      </span>
                      {content.description && (
                        <span className="text-[11px] text-gray-500 line-clamp-1">
                          {content.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 block">
                      ${content.price?.toFixed(2)} MXN
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      Incluido
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#141414] border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 space-y-2">
              <p>Este paquete incluye todas las etapas y procedimientos estipulados en la descripción del tratamiento clínico.</p>
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Valoración inicial y seguimiento post-tratamiento incluidos.</span>
              </div>
            </div>
          )}
        </div>

        {/* ── CONDICIONES & CÓMO REDIMIR EL PAQUETE ─────────────────── */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vigencia Amplia</span>
            </span>
            <p className="text-[11px] text-gray-500">
              Dispones de hasta 12 meses a partir de tu compra para canjear todas las sesiones.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Agendamiento Flexible</span>
            </span>
            <p className="text-[11px] text-gray-500">
              Agenda tus citas una a una según tu disponibilidad desde tu portal de paciente.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Garantía Médica</span>
            </span>
            <p className="text-[11px] text-gray-500">
              Atendido exclusivamente por especialistas con Cédula Profesional SEP verificada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
