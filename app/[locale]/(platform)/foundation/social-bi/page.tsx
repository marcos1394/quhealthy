"use client";

import React from "react";
import { BarChart3, Clock, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FoundationSocialBiPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-rose-600" />
            Social BI & Indicadores de Impacto
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analítica de vidas impactadas, retorno social y exportación de reportes de transparencia anonimizados.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          Fase 4 en Hoja de Ruta
        </span>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Inteligencia de Impacto Social para Donantes y Patronato
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          En la <strong>Fase 4</strong>, este módulo agregará métricas anonimizadas de impacto (vidas impactadas, mapa geográfico agregado, fondos canalizados por causa) y facilitará la exportación de reportes de rendición de cuentas.
        </p>

        <div className="p-4 bg-slate-50 rounded-2xl text-left text-xs space-y-2 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Métricas agregadas y anonimizadas (cero datos clínicos identificables)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Distribución geográfica por municipios con minimización de datos</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Generador de reportes en PDF/Excel para donantes y cumplimiento institucional</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/foundation/dashboard")}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all"
        >
          Volver al Centro de Mando <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
