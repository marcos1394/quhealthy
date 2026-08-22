"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

// Componentes del Centro de Mando Clínico del Paciente
import { PatientDashboardHeader } from "@/components/dashboard/PatientDashboardHeader";
import { NextAppointmentHero } from "@/components/dashboard/NextAppointmentHero";
import { PatientVitalsTrendChart } from "@/components/dashboard/PatientVitalsTrendChart";
import { PatientTreatmentAdherenceWidget } from "@/components/dashboard/PatientTreatmentAdherenceWidget";
import { PatientClinicalSummaryCard } from "@/components/dashboard/PatientClinicalSummaryCard";
import { HealthScore360Widget } from "@/components/dashboard/HealthScore360Widget";
import { PatientCopilotInsightCard } from "@/components/dashboard/PatientCopilotInsightCard";
import { PatientClinicalMetricsGrid } from "@/components/dashboard/PatientClinicalMetricsGrid";
import { PatientActivityTimeline } from "@/components/dashboard/PatientActivityTimeline";
import { HealthOnboardingModal } from "@/components/dashboard/HealthOnboardingModal";
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

  // 3. Modales
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [selectedMetricKey, setSelectedMetricKey] = useState("glucose");

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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7"
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

        {/* ── 3. CENTRO DE TELEMETRÍA Y GRÁFICAS DE TENDENCIAS CLÍNICAS ─── */}
        <div className="w-full">
          <PatientVitalsTrendChart onLogMetric={handleMetricClick} />
        </div>

        {/* ── 4. CONTROL CLÍNICO Y ADHERENCIA 360° (2 COLUMNAS) ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Columna Izquierda: Adherencia y Ficha Clínica */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <PatientTreatmentAdherenceWidget
              pendingPrescriptionsCount={pendingPrescriptionsCount}
            />
            <PatientClinicalSummaryCard />
          </div>

          {/* Columna Derecha: Score 360° y Copilot IA */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <HealthScore360Widget
              scoreData={scoreData}
              isLoading={isScoreLoading}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
            <PatientCopilotInsightCard />
          </div>
        </div>

        {/* ── 5. RESUMEN CLÍNICO Y FINANCIERO (4 CARDS) ─────────────────── */}
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

        {/* ── 6. LÍNEA DE TIEMPO: HISTORIAL DE ACTIVIDAD MÉDICA ─────────── */}
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