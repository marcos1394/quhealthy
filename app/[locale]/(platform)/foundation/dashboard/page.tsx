"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Users,
  DollarSign,
  TrendingUp,
  PlusCircle,
  UserPlus,
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { foundationService } from "@/services/foundation.service";
import {
  FoundationProgram,
  FoundationBeneficiary,
  FoundationStatsSummary,
} from "@/types/foundation";

export default function FoundationDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<FoundationStatsSummary | null>(null);
  const [programs, setPrograms] = useState<FoundationProgram[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<FoundationBeneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      foundationService.getStatsSummary(),
      foundationService.getPrograms(),
      foundationService.getBeneficiaries(undefined, "ALL", 0, 5),
    ])
      .then(([statsData, progData, benData]) => {
        setStats(statsData);
        setPrograms(progData);
        setBeneficiaries(benData.content);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(val);

  const budgetTrendData = [
    { mes: "Mar", asignado: 450000, ejercido: 210000 },
    { mes: "Abr", asignado: 550000, ejercido: 290000 },
    { mes: "May", asignado: 620000, ejercido: 345000 },
    { mes: "Jun", asignado: 750000, ejercido: 447400 },
  ];

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Cargando Centro de Mando Institucional...</p>
      </div>
    );
  }

  const allocated = stats?.totalAllocatedBudget || 750000;
  const disbursed = stats?.totalDisbursedBudget || 447400;
  const progressPercent = allocated > 0 ? Math.round((disbursed / allocated) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 🚀 Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-semibold border border-rose-500/30">
            <HeartHandshake className="w-3.5 h-3.5" />
            Vertical Institucional de Salud
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Centro de Mando de Asistencia Social
          </h1>
          <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">
            Administración transparente de programas asistenciales, padrón de beneficiarios vulnerables y autorizaciones de subsidio en consultas, medicamentos y cirugías.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => router.push("/foundation/beneficiaries?action=new")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-rose-600/30"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Beneficiario
          </button>
          <button
            onClick={() => router.push("/foundation/programs?action=new")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border border-white/20"
          >
            <PlusCircle className="w-4 h-4" />
            Crear Programa
          </button>
        </div>
      </div>

      {/* 📊 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Programas Activos</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">
            {stats?.activePrograms || 3}
          </h3>
          <span className="text-xs text-slate-400 mt-2 block">
            {stats?.totalPrograms || 3} programas registrados
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Beneficiarios Atendidos</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">
            {stats?.activeBeneficiaries || 136}
          </h3>
          <span className="text-xs text-emerald-600 font-semibold mt-2 block">
            Padrón activo validado
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Presupuesto Ejercido</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-emerald-600 mt-2">
            {formatCurrency(disbursed)}
          </h3>
          <span className="text-xs text-slate-400 mt-2 block">
            {progressPercent}% del fondo asignado
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Fondo Disponible</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">
            {formatCurrency(stats?.availableBudget || 302600)}
          </h3>
          <span className="text-xs text-amber-700 font-semibold mt-2 block">
            Remanente para subsidios
          </span>
        </div>
      </div>

      {/* 📈 Charts & Budget Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Execution Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base lg:text-lg">
                Evolución Presupuestal & Subsidios
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparativa de fondos asignados vs. apoyos redimidos en los últimos meses
              </p>
            </div>
            <button
              onClick={() => router.push("/foundation/programs")}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              Ver programas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={budgetTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAsignado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorEjercido" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                <Area
                  type="monotone"
                  dataKey="asignado"
                  name="Presupuesto Asignado"
                  stroke="#64748b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAsignado)"
                />
                <Area
                  type="monotone"
                  dataKey="ejercido"
                  name="Subsidios Ejercidos"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorEjercido)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Progress & Transparency Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-base">Avance de Fondos</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {progressPercent}% Ejercido
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-4">
              <div className="bg-rose-600 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Total Autorizado:</span>
                <span className="font-bold text-slate-900">{formatCurrency(allocated)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50/60 rounded-xl text-rose-900">
                <span className="font-medium">Total Redimido:</span>
                <span className="font-extrabold">{formatCurrency(disbursed)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-xl text-emerald-900">
                <span className="font-medium">Remanente Activo:</span>
                <span className="font-extrabold">{formatCurrency(stats?.availableBudget || 302600)}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Trazabilidad auditada sin custodia de fondos de terceros.</span>
          </div>
        </div>
      </div>

      {/* 📋 Programs Overview & Recent Beneficiaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programs Summary */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-600" />
              Programas Asistenciales
            </h3>
            <button
              onClick={() => router.push("/foundation/programs")}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              Gestionar todos
            </button>
          </div>

          <div className="space-y-3">
            {programs.map((prog) => {
              const progAllocated = prog.allocatedBudget || 1;
              const progDisbursed = prog.disbursedBudget || 0;
              const progPercent = Math.round((progDisbursed / progAllocated) * 100);
              return (
                <div key={prog.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{prog.name}</span>
                    <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      {prog.cause}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{prog.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>
                      {prog.activeBeneficiariesCount || 0} / {prog.targetBeneficiariesCount} beneficiarios
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(progDisbursed)} / {formatCurrency(progAllocated)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${progPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Beneficiaries Census */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Padrón Reciente de Beneficiarios
            </h3>
            <button
              onClick={() => router.push("/foundation/beneficiaries")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Ver padrón completo
            </button>
          </div>

          <div className="space-y-3">
            {beneficiaries.map((b) => (
              <div
                key={b.id}
                className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="font-semibold text-slate-900 text-xs sm:text-sm truncate block">
                    {b.fullName}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>{b.curp}</span>
                    <span>•</span>
                    <span className="font-sans text-slate-600">{b.city || "Sinaloa"}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      b.vulnerabilityLevel === "CRITICAL"
                        ? "bg-rose-100 text-rose-800"
                        : b.vulnerabilityLevel === "HIGH"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    Vuln. {b.vulnerabilityLevel}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {b.origin === "PATIENT_SELF" ? "Auto-postulado" : "Trabajo Social"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
