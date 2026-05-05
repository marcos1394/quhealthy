"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';

// Componentes Extraídos
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { NextAppointmentHero } from '@/components/dashboard/NextAppointmentHero';
import { QuickAccessCards } from '@/components/dashboard/QuickAccessCards';
import { HealthScoreWidget } from '@/components/dashboard/HealthScoreWidget';
import { HealthOnboardingModal } from '@/components/dashboard/HealthOnboardingModal';

// Store & Hooks
import { useSessionStore } from '@/stores/SessionStore';
import { useConsumerDashboard } from '@/hooks/useConsumerDashboard';
import { useHealthScore } from '@/hooks/useHealthScore'; // 🚀 Hook de Salud
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function ConsumerDashboardPage() {
  const { user } = useSessionStore();
  const router = useRouter();
  const t = useTranslations('PatientDashboard');
  
  // 1. Hook del Dashboard (Citas)
  const { nextAppointment, isLoading: isDashboardLoading, error: dashboardError } = useConsumerDashboard();
  
  // 2. Hook de Salud (Score) - ELEVADO AQUÍ
  const { 
    scoreData, 
    isLoading: isScoreLoading, 
    isSubmitting, 
    fetchMyScore, 
    submitHealthProfile 
  } = useHealthScore();
  
  // 3. Estado local del Modal
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Cargar el score al montar la página
  useEffect(() => {
    fetchMyScore();
  }, [fetchMyScore]);

  // Pantallas de Carga/Error generales (Solo para los datos críticos del dashboard)
  if (isDashboardLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4 bg-slate-50 dark:bg-slate-950">
        <QhSpinner size="lg" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">{t('loading')}</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-6 px-4 text-center bg-slate-50 dark:bg-slate-950">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('error_title')}</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs">{dashboardError}</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>{t('btn_retry')}</Button>
      </div>
    );
  }

  const firstName = user?.firstName || t('fallback_name');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* --- HEADER --- */}
        <DashboardHeader firstName={firstName} />

        {/* --- SECCIÓN PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <NextAppointmentHero 
            appointment={nextAppointment}
            onNavigate={(id) => router.push(`/patient/appointments/${id}`)}
            onSearch={() => router.push('/patient/discover')}
          />

          <div className="h-full">
            {/* Le pasamos el estado y la función para abrir el modal */}
            <HealthScoreWidget 
              scoreData={scoreData}
              isLoading={isScoreLoading}
              onOpenOnboarding={() => setIsOnboardingOpen(true)} 
            />
          </div>
        </div>

        {/* --- ACCESOS RÁPIDOS --- */}
        <QuickAccessCards />

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