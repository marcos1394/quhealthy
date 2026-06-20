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

// Store & Hooks
import { useSessionStore } from '@/stores/SessionStore';
import { useConsumerDashboard } from '@/hooks/useConsumerDashboard';
import { useHealthScore } from '@/hooks/useHealthScore';
import { QhSpinner } from '@/components/ui/QhSpinner';

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
    error: dashboardError 
  } = useConsumerDashboard();
  
  // 3. Estado local del Modal
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Cargar el score al montar la página
  useEffect(() => {
    fetchMyScore();
  }, [fetchMyScore]);

  // Abrir el modal automáticamente si es un paciente nuevo (scoreData null)
  useEffect(() => {
    if (!isScoreLoading && scoreData === null && dashboardError === null) {
      setIsOnboardingOpen(true);
    }
  }, [isScoreLoading, scoreData, dashboardError]);

  // Pantallas de Carga/Error generales
  if (isDashboardLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-6 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white animate-pulse">
          {t('loading')}
        </p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-6 text-center bg-white dark:bg-[#0a0a0a] transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
        <div className="w-16 h-16 border border-red-500 flex items-center justify-center bg-red-50 dark:bg-red-900/10 mb-6">
          <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
        </div>
        <div className="space-y-2 mb-8">
          <h3 className="text-xl font-bold tracking-tight text-black dark:text-white uppercase">{t('error_title')}</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm mx-auto">{dashboardError}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest border-0 flex items-center gap-3 transition-colors"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={1.5} /> {t('btn_retry')}
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
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mt-8">
          
          {/* --- COLUMNA IZQUIERDA (Gestión y Citas) --- */}
          <div className="flex-1 min-w-0 flex flex-col gap-12">
            <NextAppointmentHero 
              appointment={nextAppointment}
              onNavigate={(id) => router.push(`/patient/appointments/${id}`)}
              onSearch={() => router.push('/patient/discover')}
            />
            
            <QuickAccessCards />
          </div>

          {/* --- COLUMNA DERECHA (Salud y Métricas) --- */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-12">
            <div className="min-h-[300px]">
              <HealthScoreWidget 
                scoreData={scoreData}
                isLoading={isScoreLoading}
                onOpenOnboarding={() => setIsOnboardingOpen(true)} 
              />
            </div>
            
            <HealthMetricsCarousel 
              metrics={healthMetrics} 
              isLoading={isDashboardLoading} 
            />
          </div>

        </div>

        {/* 🚀 MODAL DE ONBOARDING DE SALUD */}
        <HealthOnboardingModal 
          isOpen={isOnboardingOpen} 
          onClose={() => setIsOnboardingOpen(false)} 
          onSubmit={submitHealthProfile}
          isSubmitting={isSubmitting}
        />
      </motion.div>
    </div>
  );
}