"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  HeartHandshake,
  Layers,
  Users,
  Ticket,
  CalendarDays,
  BarChart3,
  UsersRound,
  ShieldCheck,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { clearAuthCookies } from "@/app/actions/auth-cookies";

interface FoundationLayoutProps {
  children: React.ReactNode;
}

export default function FoundationLayout({ children }: FoundationLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await clearAuthCookies();
    router.push("/login");
  };

  const navItems = [
    {
      label: "Centro de Mando",
      href: "/foundation/dashboard",
      icon: HeartHandshake,
      description: "Resumen institucional & métricas",
    },
    {
      label: "Programas Asistenciales",
      href: "/foundation/programs",
      icon: Layers,
      description: "Causas, presupuestos y reglas",
    },
    {
      label: "Padrón de Beneficiarios",
      href: "/foundation/beneficiaries",
      icon: Users,
      description: "Registro, CURP y vulnerabilidad",
    },
    {
      label: "Subsidios & Vouchers",
      href: "/foundation/subsidies",
      icon: Ticket,
      description: "Autorizaciones de apoyo",
      badge: "Fase 2",
    },
    {
      label: "Campañas de Salud",
      href: "/foundation/campaigns",
      icon: CalendarDays,
      description: "Jornadas y tamizajes",
      badge: "Fase 3",
    },
    {
      label: "Impacto Social (BI)",
      href: "/foundation/social-bi",
      icon: BarChart3,
      description: "Indicadores y reportes",
      badge: "Fase 4",
    },
    {
      label: "Equipo Institucional",
      href: "/foundation/team",
      icon: UsersRound,
      description: "Roles, Trabajo Social y Médicos",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans flex flex-col selection:bg-rose-500/20">
      {/* 🚀 Topbar Institucional */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base lg:text-lg tracking-tight">
                QuHealthy Fundación
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/70">
                Portal Institucional
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Gestión de Programas Asistenciales, Beneficiarios y Subsidios de Salud
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Security Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200/80">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>LFPDPPP & NOM-004</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* 🧭 Master Body */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 p-4 space-y-6 flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 pb-3 lg:hidden">
              <span className="font-bold text-slate-900 text-sm">Menú Fundación</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Navegación Institucional
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.includes(item.href);
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all duration-150 relative ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      isActive ? "bg-white/10 text-white" : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold truncate block">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isActive ? "bg-white text-slate-900" : "bg-slate-100 text-slate-500"
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

          {/* Institutional Badge Card */}
          <div className="p-4 bg-gradient-to-br from-rose-900 to-slate-900 rounded-2xl text-white shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-rose-200">Soberanía de Datos</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">
                RBAC
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Los expedientes clínicos están protegidos y requieren autorización del paciente.
            </p>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
