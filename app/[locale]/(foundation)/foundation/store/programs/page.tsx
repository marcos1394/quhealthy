"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layers, Plus, CheckCircle2, Eye, ShieldCheck, DollarSign } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { foundationService } from "@/services/foundation.service";
import { FoundationProgram } from "@/types/foundation";

export default function FoundationStoreProgramsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<FoundationProgram[]>([]);

  useEffect(() => {
    foundationService.getPrograms()
      .then((data) => setPrograms(data || []))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-0 duration-300">
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <Link
            href="/foundation/store"
            className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-200" strokeWidth={2} />
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              Programas Asistenciales en Vitrina Pública
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              Controla qué programas están visibles para que los pacientes soliciten apoyo en tu portal público.
            </p>
          </div>
        </div>

        <Link
          href="/foundation/programs?action=new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Programa</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <QhSpinner size="lg" />
        </div>
      ) : programs.length === 0 ? (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Sin programas registrados</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Crea tu primer programa de apoyo para que aparezca publicado en tu vitrina y los beneficiarios puedan postularse.
          </p>
          <Link
            href="/foundation/programs?action=new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primer Programa</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex items-center justify-between gap-6"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{prog.name}</h3>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {prog.cause}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{prog.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                  <span>Presupuesto: ${Number(prog.allocatedBudget).toLocaleString()} MXN</span>
                  <span>•</span>
                  <span>Meta: {prog.targetBeneficiariesCount} beneficiarios</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Visible al Público
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
