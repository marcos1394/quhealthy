"use client";

import React from "react";
import { ShieldCheck, RefreshCw, LogOut, Calendar, Activity } from "lucide-react";

interface AdminHeaderProps {
  selectedPeriod: "24h" | "7d" | "30d" | "month" | "90d";
  onSelectPeriod: (period: "24h" | "7d" | "30d" | "month" | "90d") => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onLogout: () => void;
  adminEmail?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  selectedPeriod,
  onSelectPeriod,
  onRefresh,
  isRefreshing,
  onLogout,
  adminEmail = "admin@quhealthy.org",
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Brand & Live status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-medical-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 text-base lg:text-lg tracking-tight">
              QuHealthy Command Center
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Control Financiero, Operativo, Telemetría y Microservicios
          </p>
        </div>
      </div>

      {/* Date filter, Refresh & Actions */}
      <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
        {/* Date pills */}
        <div className="bg-slate-100/90 p-1 rounded-xl flex items-center border border-slate-200/60 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onSelectPeriod("24h")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedPeriod === "24h"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "hover:text-slate-900"
            }`}
          >
            24h
          </button>
          <button
            onClick={() => onSelectPeriod("7d")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedPeriod === "7d"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "hover:text-slate-900"
            }`}
          >
            7D
          </button>
          <button
            onClick={() => onSelectPeriod("30d")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedPeriod === "30d"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "hover:text-slate-900"
            }`}
          >
            30D
          </button>
          <button
            onClick={() => onSelectPeriod("month")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedPeriod === "month"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Este Mes
          </button>
        </div>

        {/* Sync Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/80 bg-white"
          title="Actualizar datos"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin text-medical-600" : ""}`}
          />
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};
