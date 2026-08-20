"use client";

import React from "react";
import { CalendarDays, Clock, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FoundationCampaignsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-rose-600" />
            Campañas & Jornadas de Salud
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de eventos de tamizaje masivo, detección temprana y voluntariado médico asistencial.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          Fase 3 en Hoja de Ruta
        </span>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <CalendarDays className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Jornadas de Detección & Asistencia en Campo
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          En la <strong>Fase 3</strong>, podrás calendarizar campañas masivas (mastografías, salud visual, tamizaje de diabetes), registrar resultados en campo y utilizar <strong>IA de acompañamiento</strong> para sintetizar datos sin sustituir el criterio médico profesional.
        </p>

        <div className="p-4 bg-slate-50 rounded-2xl text-left text-xs space-y-2 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Registro ágil de beneficiarios y pruebas rápidas en sedes comunitarias</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Consentimiento Informado Digital (LFPDPPP) para expedientes</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Canalización inmediata de casos positivos a programas de subsidio</span>
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
