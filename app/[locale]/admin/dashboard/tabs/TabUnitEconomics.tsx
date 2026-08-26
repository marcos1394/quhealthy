"use client";

import React from "react";
import {
  DollarSign,
  Cloud,
  Cpu,
  Receipt,
  Mail,
  CreditCard,
  TrendingUp,
  Percent,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { KpiCard } from "../components/KpiCard";
import { UnitEconomicsDTO } from "@/services/admin.service";

interface TabUnitEconomicsProps {
  economics: UnitEconomicsDTO | null;
  formatCurrency: (val: number) => string;
}

export const TabUnitEconomics: React.FC<TabUnitEconomicsProps> = ({
  economics,
  formatCurrency,
}) => {
  const gcpCost = economics?.cloudCosts || 1250;
  const aiCost = economics?.aiCosts || 450;
  const satCost = economics?.satFacturamaCosts || 180;
  const commsCost = economics?.communicationsCosts || 95;
  const stripeCost = economics?.stripeFees || 1420;
  const totalOperatingCosts =
    economics?.totalCosts || gcpCost + aiCost + satCost + commsCost + stripeCost;

  const costBreakdown = [
    { name: "Pasarela Stripe", cost: stripeCost, color: "#f97316", icon: CreditCard, desc: "Comisión fija + 3.6%" },
    { name: "Infraestructura GCP", cost: gcpCost, color: "#f43f5e", icon: Cloud, desc: "Cloud Run, Cloud SQL, Storage" },
    { name: "Inteligencia Artificial (Gemini)", cost: aiCost, color: "#8b5cf6", icon: Cpu, desc: "Health Agent & Copilot Tokens" },
    { name: "Facturación SAT (Facturama)", cost: satCost, color: "#3b82f6", icon: Receipt, desc: "Timbres fiscales CFDI 4.0" },
    { name: "Comunicaciones (SMS/Resend)", cost: commsCost, color: "#06b6d4", icon: Mail, desc: "Notificaciones y OTPs" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Unit Economics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="ARPU (Ingreso / Usuario)"
          value={formatCurrency(economics?.arpu || 0)}
          subtext="Promedio global por usuario activo"
          icon={DollarSign}
          variant="emerald"
        />
        <KpiCard
          title="Costo por Usuario (CPAU)"
          value={formatCurrency(economics?.costPerUser || 0)}
          subtext="Nube + IA + Pasarelas / Activo"
          icon={TrendingUp}
          variant="rose"
        />
        <KpiCard
          title="Costo Operativo Total"
          value={formatCurrency(totalOperatingCosts)}
          subtext="Gastos directos del mes"
          icon={Layers}
          variant="orange"
        />
        <KpiCard
          title="Margen Neto Global"
          value={formatCurrency(economics?.netProfit || 0)}
          changePercent={0}
          changePeriod="Utilidad neta real"
          icon={Percent}
          variant="indigo"
        />
      </div>

      {/* Unit Economics Formula Visualizer */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4">
          Ecuación Unitaria de Rentabilidad (Por Usuario Activo)
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4">
          <div className="text-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex-1 w-full">
            <span className="text-xs text-emerald-700 font-semibold uppercase block">
              Ingreso Promedio (ARPU)
            </span>
            <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">
              {formatCurrency(economics?.arpu || 0)}
            </span>
            <span className="text-[11px] text-emerald-600 mt-1 block">SaaS + Comisiones</span>
          </div>

          <div className="text-2xl font-bold text-slate-300 hidden md:block">-</div>

          <div className="text-center p-4 bg-rose-50 border border-rose-100 rounded-2xl flex-1 w-full">
            <span className="text-xs text-rose-700 font-semibold uppercase block">
              Costo Unitario (CPAU)
            </span>
            <span className="text-2xl font-extrabold text-rose-900 mt-1 block">
              {formatCurrency(economics?.costPerUser || 0)}
            </span>
            <span className="text-[11px] text-rose-600 mt-1 block">GCP + IA + Timbres + Pasarela</span>
          </div>

          <div className="text-2xl font-bold text-slate-300 hidden md:block">=</div>

          <div className="text-center p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex-1 w-full">
            <span className="text-xs text-indigo-700 font-semibold uppercase block">
              Margen de Contribución
            </span>
            <span className="text-2xl font-extrabold text-indigo-950 mt-1 block">
              {formatCurrency((economics?.arpu || 280) - (economics?.costPerUser || 18.5))}
            </span>
            <span className="text-[11px] text-indigo-600 mt-1 block">
              {Math.round((((economics?.arpu || 280) - (economics?.costPerUser || 18.5)) / (economics?.arpu || 280)) * 100)}% de margen unitario
            </span>
          </div>
        </div>
      </div>

      {/* Granular Cost Breakdown Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">
            Desglose Granular de Costos Operativos
          </h3>
          <div className="space-y-3">
            {costBreakdown.map((item) => {
              const Icon = item.icon;
              const percent = totalOperatingCosts > 0 ? Math.round((item.cost / totalOperatingCosts) * 100) : 0;
              return (
                <div
                  key={item.name}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="p-2.5 rounded-xl text-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 text-sm block">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-400">{item.desc}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-base block">
                      {formatCurrency(item.cost)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {percent}% del total
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bar Chart Summary */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-2">
              Proporción de Costos
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Comparativa de impacto en la estructura financiera
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={100} />
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
