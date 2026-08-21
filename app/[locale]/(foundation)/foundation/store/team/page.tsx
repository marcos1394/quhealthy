"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Plus, ShieldCheck, UserCheck } from "lucide-react";

export default function FoundationStoreTeamPage() {
  const router = useRouter();

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
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              Equipo Institucional & Patronato
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              Gestiona a los miembros del equipo que se presentan en tu portal institucional público.
            </p>
          </div>
        </div>

        <Link
          href="/foundation/team"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Administrar Roles</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <UserCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Equipo Institucional Vinculado</h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Los miembros del equipo dados de alta en el módulo institucional aparecen con su respectiva acreditación en el portal público de la fundación.
        </p>
        <Link
          href="/foundation/team"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
        >
          <span>Ir a Gestión de Equipo</span>
        </Link>
      </div>
    </div>
  );
}
