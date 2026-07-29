"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  ShieldAlert,
  Wrench,
  Clock,
  FileText,
  Settings,
} from "lucide-react";

import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/stores/SessionStore";
import { biomedicalService } from "@/services/biomedical.service";
import { BiomedicalEquipmentDTO } from "@/types/biomedical";

export default function BiomedicalDashboardPage() {
  const t = useTranslations("BiomedicalDashboard");
  const router = useRouter();
  const { user } = useSessionStore();
  const providerId = user?.id?.toString();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEquipments: 0,
    outOfService: 0,
    activeWorkOrders: 0,
    avgMttrMinutes: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!providerId) return;
      setIsLoading(true);
      try {
        const equipments = await biomedicalService.listEquipments(providerId);
        const outOfServiceCount = equipments.filter(
          (eq: BiomedicalEquipmentDTO) => eq.status === "OUT_OF_SERVICE"
        ).length;

        setStats({
          totalEquipments: equipments.length,
          outOfService: outOfServiceCount,
          activeWorkOrders: 0,
          avgMttrMinutes: 0,
        });
      } catch (error) {
        console.error("Failed to load biomedical stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [providerId]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <Activity className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold shadow-sm">
                <span>{t("subtitle")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("title")}
              </h1>
            </div>
          </div>

          <Button
            onClick={() =>
              router.push("/provider/dashboard/biomedical/equipments")
            }
            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-5 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2 shrink-0"
          >
            <Settings className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_catalog")}</span>
          </Button>
        </div>

        {/* ── KPI CARDS ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Equipos */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 flex flex-col rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Activity className="w-4.5 h-4.5" strokeWidth={2} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {t("kpi_total_equipments")}
              </span>
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
              {stats.totalEquipments}
            </div>
          </div>

          {/* Fuera de Servicio */}
          <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 p-6 flex flex-col rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4.5 h-4.5" strokeWidth={2} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                {t("kpi_out_of_service")}
              </span>
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight text-rose-700 dark:text-rose-400">
              {stats.outOfService}
            </div>
          </div>

          {/* Órdenes Pendientes */}
          <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 p-6 flex flex-col rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Wrench className="w-4.5 h-4.5" strokeWidth={2} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                {t("kpi_pending_orders")}
              </span>
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight text-amber-700 dark:text-amber-400">
              {stats.activeWorkOrders}
            </div>
          </div>

          {/* MTTR Promedio */}
          <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 p-6 flex flex-col rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Clock className="w-4.5 h-4.5" strokeWidth={2} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                {t("kpi_avg_mttr")}
              </span>
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight text-blue-700 dark:text-blue-400">
              {stats.avgMttrMinutes}{" "}
              <span className="text-xs font-normal opacity-80 font-sans">
                {t("minutes_abbr")}
              </span>
            </div>
          </div>

        </div>

        {/* ── SECCIONES DESTACADAS ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Próximos Mantenimientos */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl h-[360px] shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center justify-between shrink-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("upcoming_maintenances_title")}</span>
              </h2>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                <Wrench className="w-7 h-7" strokeWidth={2} />
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                {t("no_upcoming_maintenances")}
              </p>
            </div>
          </div>

          {/* Alertas de Garantías */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl h-[360px] shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center justify-between shrink-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("expiring_warranties_title")}</span>
              </h2>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                <ShieldAlert className="w-7 h-7" strokeWidth={2} />
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                {t("no_expiring_warranties")}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}