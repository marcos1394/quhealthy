"use-client";

import React from 'react';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useDashboardAnalytics } from '@/hooks/useDasboardAnalytics';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, BarChart2, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Importamos los componentes "widget"
import { SummaryCard } from '@/app/quhealthy/components/dashboard/SummaryCard';
import { UpcomingAppointments } from '@/app/quhealthy/components/dashboard/UpcomingAppointments';
import { VerificationStatus } from '@/app/quhealthy/components/dashboard/VerificationStatus';

export default function DashboardPage() {
  // Usamos ambos hooks para obtener toda la información
  const { data: summaryData, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = useDashboardSummary();
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useDashboardAnalytics();
  
  // El estado de carga y error ahora considera ambas llamadas
  const isLoading = summaryLoading || analyticsLoading;
  const error = summaryError || analyticsError;

  const handleRefetch = () => {
    refetchSummary();
    refetchAnalytics();
  };

  // --- Renderizado de Carga ---
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-purple-200/50 rounded-full animate-pulse"></div>
          </div>
          <p className="text-slate-400 font-medium">Cargando dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // --- Renderizado de Error ---
  if (error || !summaryData || !analyticsData) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex flex-col justify-center items-center text-center space-y-4"
      >
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Error al cargar el dashboard</h3>
          <p className="text-slate-400">{error}</p>
          <Button onClick={handleRefetch} className="mt-4">Reintentar</Button>
        </div>
      </motion.div>
    );
  }

  // Obtenemos los datos de ambos hooks
  const { upcomingAppointments, verificationStatus } = summaryData;
  const { monthlyRevenue, completedAppointments, newClients } = analyticsData;

  // --- Renderizado Principal ---
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Bienvenido de vuelta, aquí tienes un resumen de tu actividad.</p>
      </div>

      <VerificationStatus status={verificationStatus} />

      {/* Las tarjetas de resumen ahora muestran las nuevas analíticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Ingresos del Mes" 
          value={monthlyRevenue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} 
          icon={BarChart2}
          color="text-green-400"
          bgColor="bg-green-500/10"
          borderColor="border-green-500/20"
          hoverColor="bg-green-500"
        />
        <SummaryCard 
          title="Citas Completadas (Mes)" 
          value={completedAppointments.toString()} 
          icon={CheckCircle} 
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          borderColor="border-blue-500/20"
          hoverColor="bg-blue-500"
        />
        <SummaryCard 
          title="Nuevos Pacientes (Mes)" 
          value={newClients.toString()} 
          icon={Users} 
          color="text-pink-400"
          bgColor="bg-pink-500/10"
          borderColor="border-pink-500/20"
          hoverColor="bg-pink-500"
        />
      </div>

      <UpcomingAppointments appointments={upcomingAppointments} />
      
    </motion.div>
  );
}