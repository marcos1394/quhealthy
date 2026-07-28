"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

// Componentes Extraídos
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NextAppointmentHero } from "@/components/dashboard/NextAppointmentHero";
import { QuickAccessCards } from "@/components/dashboard/QuickAccessCards";
import { HealthScoreWidget } from "@/components/dashboard/HealthScoreWidget";
import { HealthOnboardingModal } from "@/components/dashboard/HealthOnboardingModal";
import { HealthMetricsCarousel } from "@/components/dashboard/HealthMetricsCarousel";
import { HealthMetricInputModal } from "@/components/dashboard/HealthMetricInputModal";

// Store & Hooks
import { useSessionStore } from "@/stores/SessionStore";
import { useConsumerDashboard } from "@/hooks/useConsumerDashboard";
import { useHealthScore } from "@/hooks/useHealthScore";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { consumerProfileService } from "@/services/consumerProfile.service";

export default function ConsumerDashboardPage() {
  const { user } = useSessionStore();
  const router = useRouter();
  const t = useTranslations("PatientDashboard");

  // 1. Hook de Salud (Score)
  const {
    scoreData,
    isLoading: isScoreLoading,
    isSubmitting,
    fetchMyScore,
    submitHealthProfile,
  } = useHealthScore();

  // 2. Hook del Dashboard (Citas y Métricas)
  const {
    nextAppointment,
    healthMetrics,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refreshDashboard,
  } = useConsumerDashboard();

  // 3. Estado local del Modal Onboarding
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // 4. Estado local del Modal Métricas
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [selectedMetricKey, setSelectedMetricKey] = useState("");

  // Cargar el score al montar la página
  useEffect(() => {
    fetchMyScore();
  }, [fetchMyScore]);

  const handleMetricClick = (key: string) => {
    setSelectedMetricKey(key);
    setIsMetricModalOpen(true);
  };

  const handleMetricSave = async (
    metricKey: string,
    value: number,
    secondaryValue?: number
  ) => {
    try {
      await consumerProfileService.updateMetric(
        metricKey,
        value,
        secondaryValue
      );
      await refreshDashboard();
    } catch (err) {
      console.error("Error updating metric:", err);
    }
  };

  // Pantallas de Carga/Error generales
  if (isDashboardLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] px-6 text-center bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 mb-6 border border-rose-100 dark:border-rose-900/40 shadow-sm">
          <AlertCircle className="w-8 h-8" strokeWidth={2} />
        </div>
        <div className="space-y-2 mb-8">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("error_title")}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            {dashboardError}
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-6 text-xs font-bold transition-all shadow-sm border-0 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2} />
          <span>{t("btn_retry")}</span>
        </Button>
      </div>
    );
  }

  const firstName = user?.firstName || t("fallback_name");

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-6 py-10 sm:py-12 lg:px-12 space-y-10"
      >
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <DashboardHeader firstName={firstName} />

        {/* ── SECCIÓN PRINCIPAL ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          {/* PRIMER BLOQUE: Próxima Cita */}
          <div className="w-full">
            <NextAppointmentHero
              appointment={nextAppointment}
              onNavigate={(id) => router.push(`/patient/appointments/${id}`)}
              onSearch={() => router.push("/discover")}
            />
          </div>

          {/* SEGUNDO BLOQUE: Módulos de Acceso Rápido */}
          <div className="w-full">
            <QuickAccessCards />
          </div>

          {/* TERCER BLOQUE: Salud y Métricas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 xl:col-span-4">
              <HealthScoreWidget
                scoreData={scoreData}
                isLoading={isScoreLoading}
                onOpenOnboarding={() => setIsOnboardingOpen(true)}
              />
            </div>

            <div className="lg:col-span-7 xl:col-span-8">
              <HealthMetricsCarousel
                metrics={healthMetrics}
                isLoading={isDashboardLoading}
                onMetricClick={handleMetricClick}
              />
            </div>
          </div>
        </div>

        {/* ── MODALES DE INTERACCIÓN ────────────────────────────────────── */}
        <HealthOnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onSubmit={submitHealthProfile}
          isSubmitting={isSubmitting}
        />

        <HealthMetricInputModal
          isOpen={isMetricModalOpen}
          onClose={() => setIsMetricModalOpen(false)}
          metricKey={selectedMetricKey}
          onSave={handleMetricSave}
        />
      </motion.div>
    </div>
  );
}