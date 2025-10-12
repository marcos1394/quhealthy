"use client";

import React, { useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, BarChart2, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Importamos los componentes "widget"
import { SummaryCard } from '@/app/quhealthy/components/dashboard/SummaryCard';
import { UpcomingAppointments } from '@/app/quhealthy/components/dashboard/UpcomingAppointments';
import { VerificationStatus } from '@/app/quhealthy/components/dashboard/VerificationStatus';

export default function DashboardPage() {
  // Estado para controlar el filtro de fecha
  const [dateRange, setDateRange] = useState('this_month');
  
  // Usamos un solo hook que reacciona a los cambios del filtro
  const { data, isLoading, error, refetch } = useDashboardData(dateRange);

  // Renderizado de Carga
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

  // Renderizado de Error
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
          <p className="text-slate-400">{error || "No se pudieron cargar los datos."}</p>
          <Button onClick={() => refetch()} className="mt-4">Reintentar</Button>
        </div>
      </motion.div>
    );
  }

  // Obtenemos los datos del objeto unificado
  const { analytics, upcomingAppointments, verificationStatus } = data;

  // Renderizado Principal
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Bienvenido de vuelta, aquí tienes un resumen de tu actividad.</p>
        </div>
        
        {/* Selector de Fechas */}
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full md:w-[180px] bg-gray-800 border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">Este Mes</SelectItem>
            <SelectItem value="last_month">Mes Pasado</SelectItem>
            <SelectItem value="all_time">Todo el Historial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <VerificationStatus status={verificationStatus} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Ingresos" 
          value={analytics.monthlyRevenue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} 
          icon={BarChart2} color="text-green-400" bgColor="bg-green-500/10"
        />
        <SummaryCard 
          title="Citas Completadas" 
          value={analytics.completedAppointments.toString()} 
          icon={CheckCircle} color="text-blue-400" bgColor="bg-blue-500/10"
        />
        <SummaryCard 
          title="Nuevos Pacientes" 
          value={analytics.newClients.toString()} 
          icon={Users} color="text-pink-400" bgColor="bg-pink-500/10"
        />
      </div>

      <UpcomingAppointments appointments={upcomingAppointments} />
      
    </motion.div>
  );
}