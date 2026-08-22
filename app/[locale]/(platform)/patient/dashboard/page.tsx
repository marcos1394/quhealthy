"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

// Componentes del Dashboard Rediseñado
import { PatientDashboardHeader } from "@/components/dashboard/PatientDashboardHeader";
import { NextAppointmentHero } from "@/components/dashboard/NextAppointmentHero";
import { PatientCopilotInsightCard } from "@/components/dashboard/PatientCopilotInsightCard";
import { PatientClinicalMetricsGrid } from "@/components/dashboard/PatientClinicalMetricsGrid";
import { HealthScoreWidget } from "@/components/dashboard/HealthScoreWidget";
import { HealthOnboardingModal } from "@/components/dashboard/HealthOnboardingModal";
import { HealthMetricsCarousel } from "@/components/dashboard/HealthMetricsCarousel";
import { HealthMetricInputModal } from "@/components/dashboard/HealthMetricInputModal";
import { PatientActivityTimeline } from "@/components/dashboard/PatientActivityTimeline";

// Store & Hooks
import { useSessionStore } from "@/stores/SessionStore";
import { useConsumerDashboard } from "@/hooks/useConsumerDashboard";
import { useHealthScore } from "@/hooks/useHealthScore";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { consumerProfileService } from "@/services/consumerProfile.service";

export default function ConsumerDashboardPage() {
  const { user } = useSessionStore();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("PatientDashboard");

  // 1. Hook de Salud (Score)
  const {
    scoreData,
    isLoading: isScoreLoading,
    isSubmitting,
    fetchMyScore,
    submitHealthProfile,
  } = useHealthScore();

  // 2. Hook del Dashboard Enriquecido (Citas, Métricas, Billetera, Actividad, Perfiles)
  const {
    nextAppointment,
    healthMetrics,
    pendingPrescriptionsCount,
    walletBalance,
    walletCurrency,
    activePackagesCount,
    vaultDocsCount,
    activeOrdersCount,
    recentActivity,
    profiles,
    selectedProfileId,
    setSelectedProfileId,
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
  if (isDashboardLoading && !nextAppointment && profiles.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (dashboardError && !nextAppointment) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] px-6 text-center bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 mb-6 border border-rose-100 dark:border-rose-900/40 shadow-sm">
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
          className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-6 text-xs font-bold transition-all shadow-sm border-0 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2} />
          <span>{t("btn_retry")}</span>
        </Button>
      </div>
    );
  }

  const firstName = user?.firstName || t("fallback_name");

  return (
    <div className="min-h-screen bg-gray-50/40 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 space-y-8"
      >
        {/* ── 1. CABECERA CON SELECTOR FAMILIAR Y ACCIONES RÁPIDAS ──────── */}
        <PatientDashboardHeader
          firstName={firstName}
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          onProfileChange={(newId) => setSelectedProfileId(newId)}
        />

        {/* ── 2. HERO: PRÓXIMA CITA CLÍNICA / TELECONSULTA ──────────────── */}
        <div className="w-full">
          <NextAppointmentHero
            appointment={nextAppointment}
            onNavigate={(id) => router.push(`/patient/dashboard/appointments`)}
            onSearch={() => router.push("/discover")}
            locale={locale}
          />
        </div>

        {/* ── 3. BANNER IA: COPILOT CLINICAL INSIGHT ────────────────────── */}
        <div className="w-full">
          <PatientCopilotInsightCard />
        </div>

        {/* ── 4. RESUMEN CLÍNICO DINÁMICO (4 CARDS CON DATOS REALES) ────── */}
        <div className="w-full">
          <PatientClinicalMetricsGrid
            walletBalance={walletBalance}
            currency={walletCurrency}
            activePackagesCount={activePackagesCount}
            pendingPrescriptionsCount={pendingPrescriptionsCount}
            vaultDocsCount={vaultDocsCount}
            activeOrdersCount={activeOrdersCount}
            isLoading={isDashboardLoading}
          />
        </div>

        {/* ── 5. TELEMETRÍA BIOMÉTRICA Y QUHEALTHSCORE™ ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 xl:col-span-4">
            <HealthScoreWidget
              scoreData={scoreData}
              isLoading={isScoreLoading}
              onOpenOnboarding={() => setIsOnboardingOpen(false || true)}
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

        {/* ── 6. LÍNEA DE TIEMPO: ACTIVIDAD MÉDICA RECIENTE ─────────────── */}
        <div className="w-full">
          <PatientActivityTimeline
            activities={recentActivity}
            isLoading={isDashboardLoading}
            locale={locale}
          />
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