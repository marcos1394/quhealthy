"use client";

import React from "react";
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  BarChart3,
  Stethoscope,
  Server,
  FileCheck,
  ShieldAlert,
} from "lucide-react";

export type AdminTab =
  | "pulse"
  | "finances"
  | "economics"
  | "analytics"
  | "operations"
  | "foundations"
  | "health";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingKycCount?: number;
  unhealthyServicesCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  pendingKycCount = 1,
  unhealthyServicesCount = 0,
}) => {
  const menuItems = [
    {
      id: "pulse" as AdminTab,
      label: "Executive Pulse",
      description: "Visión 360° Negocio & Ops",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "finances" as AdminTab,
      label: "Finanzas & SaaS",
      description: "MRR, Comisiones & Stripe",
      icon: DollarSign,
      badge: null,
    },
    {
      id: "economics" as AdminTab,
      label: "Unit Economics & Costos",
      description: "Nube GCP, IA & Márgenes",
      icon: TrendingUp,
      badge: null,
    },
    {
      id: "analytics" as AdminTab,
      label: "Product & User Flow",
      description: "DAU/MAU, Módulos & Funnels",
      icon: BarChart3,
      badge: "Nuevo",
      badgeColor: "bg-indigo-100 text-indigo-700",
    },
    {
      id: "operations" as AdminTab,
      label: "Operaciones Médicas & KYC",
      description: "Citas, Cédulas & Validación",
      icon: Stethoscope,
      badge: pendingKycCount > 0 ? `${pendingKycCount} KYC` : null,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      id: "foundations" as AdminTab,
      label: "Fundaciones & Subsidios",
      description: "Supervisión KYB & Programas",
      icon: FileCheck,
      badge: "Institucional",
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      id: "health" as AdminTab,
      label: "Salud & Auditoría LFPDPPP",
      description: "14 Microservicios & Seguridad",
      icon: Server,
      badge: unhealthyServicesCount > 0 ? `${unhealthyServicesCount} Fallo` : "14 UP",
      badgeColor:
        unhealthyServicesCount > 0
          ? "bg-rose-100 text-rose-700"
          : "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <aside className="w-full lg:w-64 xl:w-72 bg-white border-r border-slate-200/80 shrink-0 p-4 space-y-6 flex flex-col justify-between">
      <div className="space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
          Navegación Maestra
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all duration-150 relative ${
                isActive
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-semibold truncate block">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? "bg-white text-slate-900"
                          : item.badgeColor || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p
                  className={`text-[11px] truncate mt-0.5 ${
                    isActive ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mini System Overview card */}
      <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-sm space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200">QuHealthy Core</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
            v2.4 PROD
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Cifrado E2E, NOM-004-SSA3, LFPDPPP & Stripe Connect activo.
        </p>
      </div>
    </aside>
  );
};
