"use client";

import React from "react";
import { Ticket, ShieldCheck, Clock, ArrowRight, DollarSign, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FoundationSubsidiesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-rose-600" />
            Subsidios & Vouchers Administrativos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Emisión y redención de autorizaciones de apoyo médico sin custodia de fondos financieros.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          Fase 2 en Hoja de Ruta
        </span>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Motor de Subsidios Institucionales y Vouchers de Salud
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          En la <strong>Fase 2</strong>, este módulo permitirá emitir autorizaciones administrativas de subsidio (ej. 100% en consulta de nefrología o $1,500 en fármacos) que los pacientes redimen directamente al agendar en QuHealthy.
        </p>

        <div className="p-4 bg-slate-50 rounded-2xl text-left text-xs space-y-2 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Trazabilidad contable: Autorizado vs. Redimido vs. Remanente</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Vinculación a folio de cita y receta médica electrónica</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Reportes de conciliación para liquidación directa al proveedor</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/foundation/beneficiaries")}
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
        >
          Ir al Padrón de Beneficiarios <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
