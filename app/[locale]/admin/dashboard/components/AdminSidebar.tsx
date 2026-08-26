"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  BarChart3,
  Stethoscope,
  Server,
  FileCheck,
  MessageSquare,
  Share2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export type AdminTab =
  | "pulse"
  | "crm"
  | "channels"
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
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  pendingKycCount = 1,
  unhealthyServicesCount = 0,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("quhealthy_admin_sidebar_collapsed");
      if (saved !== null) {
        setInternalCollapsed(saved === "true");
      }
    } catch {
      // Ignorar errores de storage
    }
  }, []);

  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setInternalCollapsed(nextState);
    if (onToggleCollapse) {
      onToggleCollapse(nextState);
    }
    try {
      localStorage.setItem("quhealthy_admin_sidebar_collapsed", String(nextState));
    } catch {
      // Ignorar
    }
  };

  const menuItems = [
    {
      id: "pulse" as AdminTab,
      label: "Executive Pulse",
      description: "Visión 360° Negocio & Ops",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "crm" as AdminTab,
      label: "Admin CRM & Leads",
      description: "Inbox Omnicanal & Soporte",
      icon: MessageSquare,
      badge: "En vivo",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "channels" as AdminTab,
      label: "Métricas CMO & Redes",
      description: "Facebook, IG & Canales",
      icon: Share2,
      badge: "Meta / CMO",
      badgeColor: "bg-indigo-100 text-indigo-700",
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

  const handleSelectTab = (tab: AdminTab) => {
    onTabChange(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderNavItems = (collapsed: boolean) => (
    <div className="space-y-1.5 w-full">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <div key={item.id} className="relative group w-full">
            <button
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all duration-150 relative ${
                collapsed ? "justify-center" : "justify-start"
              } ${
                isActive
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200/70"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {!collapsed && (
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
              )}

              {/* Badge flotante en modo colapsado */}
              {collapsed && item.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
              )}
            </button>

            {/* Tooltip flotante en modo colapsado desktop */}
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap shadow-xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-white/20 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-300 font-normal">
                  {item.description}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* 📱 Mobile Drawer Overlay & Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full p-4 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Navegación
                </span>
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>
              {renderNavItems(false)}
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-2xl text-xs space-y-1 mt-4">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>QuHealthy Core</span>
                <span className="text-[10px] text-emerald-400 font-mono">v2.4 PROD</span>
              </div>
              <p className="text-[10px] text-slate-400">
                NOM-004-SSA3 & Stripe Connect
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🖥️ Desktop Sidebar */}
      <aside
        className={`hidden lg:flex bg-white border-r border-slate-200/80 shrink-0 p-3 lg:p-4 space-y-6 flex-col justify-between transition-all duration-300 ease-in-out select-none ${
          isCollapsed ? "w-20 items-center" : "w-64 xl:w-72"
        }`}
      >
        <div className="space-y-1.5 w-full">
          {/* Header con botón colapsable */}
          <div
            className={`flex items-center pb-2 border-b border-slate-100 mb-2 ${
              isCollapsed ? "justify-center" : "justify-between px-2"
            }`}
          >
            {!isCollapsed && (
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Navegación Maestra
              </span>
            )}
            <button
              onClick={toggleCollapse}
              title={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-slate-600" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              )}
            </button>
          </div>

          {/* Lista de navegación */}
          {renderNavItems(isCollapsed)}
        </div>

        {/* Footer del Sidebar Desktop */}
        {!isCollapsed ? (
          <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-sm space-y-2 text-xs w-full">
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
        ) : (
          <div
            title="QuHealthy Core v2.4 PROD"
            className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-mono text-[10px] font-bold shadow-sm"
          >
            v2.4
          </div>
        )}
      </aside>
    </>
  );
};
