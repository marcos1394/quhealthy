"use client";

import React from 'react';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { Loader2, MessageSquare, CalendarDays, BarChart2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Importamos los componentes "widget" desde sus archivos
import { SummaryCard } from '@/app/quhealthy/components/dashboard/SummaryCard';
import { UpcomingAppointments } from '@/app/quhealthy/components/dashboard/UpcomingAppointments';
import { VerificationStatus } from '@/app/quhealthy/components/dashboard/VerificationStatus';

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardSummary();

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

  if (error || !data) {
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
          <Button onClick={() => refetch()} className="mt-4">Reintentar</Button>
        </div>
      </motion.div>
    );
  }

  // Obtenemos los datos directamente del hook
  const { summaryCards, upcomingAppointments, verificationStatus } = data;

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

      {/* Pasamos los datos directamente al componente. Ya no hay conflicto de tipos. */}
      <VerificationStatus status={verificationStatus} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Citas para Hoy" 
          value={summaryCards.todayAppointments.toString()} 
          icon={CalendarDays} 
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          borderColor="border-blue-500/20"
        />
        <SummaryCard 
          title="Mensajes No Leídos" 
          value={summaryCards.unreadMessages.toString()} 
          icon={MessageSquare} 
          color="text-pink-400"
          bgColor="bg-pink-500/10"
          borderColor="border-pink-500/20"
        />
        <SummaryCard 
          title="Ingresos del Mes" 
          value={summaryCards.monthlyRevenue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} 
          icon={BarChart2}
          color="text-green-400"
          bgColor="bg-green-500/10"
          borderColor="border-green-500/20"
        />
      </div>

      <UpcomingAppointments appointments={upcomingAppointments} />
      
    </motion.div>
  );
}