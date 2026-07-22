"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

// Componentes Extraídos
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { NextAppointmentHero } from '@/components/dashboard/NextAppointmentHero';
import { QuickAccessCards } from '@/components/dashboard/QuickAccessCards';
import { HealthScoreWidget } from '@/components/dashboard/HealthScoreWidget';
import { HealthOnboardingModal } from '@/components/dashboard/HealthOnboardingModal';
import { HealthMetricsCarousel } from '@/components/dashboard/HealthMetricsCarousel';
import { HealthMetricInputModal } from '@/components/dashboard/HealthMetricInputModal';

// Store & Hooks
import { useSessionStore } from '@/stores/SessionStore';
import { useConsumerDashboard } from '@/hooks/useConsumerDashboard';
import { useHealthScore } from '@/hooks/useHealthScore';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { consumerProfileService } from '@/services/consumerProfile.service';

export default function ConsumerDashboardPage() {
 const { user } = useSessionStore();
 const router = useRouter();
 const t = useTranslations('PatientDashboard');
 
 // 1. Hook de Salud (Score)
 const { 
 scoreData, 
 isLoading: isScoreLoading, 
 isSubmitting, 
 fetchMyScore, 
 submitHealthProfile 
 } = useHealthScore();

 // 2. Hook del Dashboard (Citas y Métricas)
 const { 
 nextAppointment, 
 healthMetrics, 
 isLoading: isDashboardLoading, 
 error: dashboardError,
 refreshDashboard
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

 const handleMetricSave = async (metricKey: string, value: number, secondaryValue?: number) => {
 try {
 await consumerProfileService.updateMetric(metricKey, value, secondaryValue);
 await refreshDashboard();
 } catch (err) {
 console.error(err);
 // Opcional: mostrar toast error
 }
 };


 // Pantallas de Carga/Error generales
  if (isDashboardLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse mt-2">
          {t('loading')}
        </p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-6 text-center bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 mb-6 shadow-sm">
          <AlertCircle className="w-10 h-10" strokeWidth={2} />
        </div>
        <div className="space-y-2 mb-8">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('error_title')}</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">{dashboardError}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4 mr-2" strokeWidth={2} /> {t('btn_retry')}
        </Button>
      </div>
    );
  }

 const firstName = user?.firstName || t('fallback_name');

 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
 className="max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-16"
 >
 {/* --- HEADER --- */}
 <DashboardHeader firstName={firstName} />

      {/* --- SECCIÓN PRINCIPAL --- */}
      <div className="flex flex-col gap-8 mt-6">
        
        {/* PRIMER BLOQUE: Próxima Cita */}
        <div className="w-full">
          <NextAppointmentHero 
            appointment={nextAppointment}
            onNavigate={(id) => router.push(`/patient/appointments/${id}`)}
            onSearch={() => router.push('/discover')}
          />
        </div>

        {/* SEGUNDO BLOQUE: Módulos (Full Width) */}
        <div className="w-full">
          <QuickAccessCards />
        </div>

        {/* TERCER BLOQUE: Salud y Métricas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
 <div className="lg:col-span-4 xl:col-span-4">
 <HealthScoreWidget 
 scoreData={scoreData}
 isLoading={isScoreLoading}
 onOpenOnboarding={() => setIsOnboardingOpen(true)} 
 />
 </div>
 
 <div className="lg:col-span-8 xl:col-span-8">
 <HealthMetricsCarousel 
 metrics={healthMetrics} 
 isLoading={isDashboardLoading} 
 onMetricClick={handleMetricClick}
 />
 </div>
 </div>

 </div>

 {/* 🚀 MODAL DE ONBOARDING DE SALUD */}
 <HealthOnboardingModal 
 isOpen={isOnboardingOpen} 
 onClose={() => setIsOnboardingOpen(false)} 
 onSubmit={submitHealthProfile}
 isSubmitting={isSubmitting}
 />

 {/* 🚀 MODAL DE INPUT MANUAL DE TELEMETRÍA */}
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