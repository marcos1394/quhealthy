"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, BarChart2, CheckCircle, Users, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

// Componentes del Dashboard (Rutas Limpias)
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { VerificationStatus } from '@/components/dashboard/VerificationStatus';

// Hook
import { useDashboardData } from '@/hooks/useDashboardData';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('this_month');
  const { data, isLoading, refetch } = useDashboardData(dateRange);

  // Renderizado de Carga
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center flex-col gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-purple-200/20 rounded-full"></div>
        </div>
        <p className="text-gray-400 font-medium text-sm animate-pulse">Sincronizando métricas...</p>
      </div>
    );
  }

  // Renderizado de Error (Aunque el hook tiene fallback, dejamos esto por seguridad)
  if (!data) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex flex-col justify-center items-center text-center space-y-4"
      >
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">No pudimos cargar los datos</h3>
          <Button onClick={() => refetch()} variant="outline" className="mt-2 border-gray-700 text-gray-300">
            Reintentar
          </Button>
        </div>
      </motion.div>
    );
  }

  const { analytics, upcomingAppointments, verificationStatus } = data;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-400 mt-1">Resumen de actividad y rendimiento.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-900 p-1 rounded-xl border border-gray-800 w-fit">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] bg-transparent border-0 text-gray-300 h-9 focus:ring-0">
              <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
              <SelectItem value="this_month">Este Mes</SelectItem>
              <SelectItem value="last_month">Mes Pasado</SelectItem>
              <SelectItem value="all_time">Todo el Historial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- ALERTAS --- */}
      <VerificationStatus status={verificationStatus} />

      {/* --- KPIS (CARDS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Ingresos Estimados" 
          value={analytics.monthlyRevenue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} 
          icon={BarChart2} 
          color="text-emerald-400" 
          bgColor="bg-emerald-500/10"
          borderColor="border-emerald-500/20"
          trend={{ value: 12.5, isPositive: true }}
        />
        <SummaryCard 
          title="Citas Completadas" 
          value={analytics.completedAppointments.toString()} 
          icon={CheckCircle} 
          color="text-blue-400" 
          bgColor="bg-blue-500/10"
          borderColor="border-blue-500/20"
          trend={{ value: 4.2, isPositive: true }}
        />
        <SummaryCard 
          title="Nuevos Pacientes" 
          value={analytics.newClients.toString()} 
          icon={Users} 
          color="text-pink-400" 
          bgColor="bg-pink-500/10"
          borderColor="border-pink-500/20"
          trend={{ value: 2.1, isPositive: false }}
        />
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        
        {/* Columna Izquierda: Gráfica (Placeholder) */}
        <div className="lg:col-span-2 h-full min-h-[400px]">
            <Card className="bg-gray-900 border-gray-800 h-full flex flex-col p-6 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-500" />
                            Rendimiento Financiero
                        </h3>
                        <p className="text-sm text-gray-500">Comparativa mensual</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-700 text-gray-400">Ver Reporte</Button>
                </div>
                
                {/* Placeholder Visual de Gráfica */}
                <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-4">
                    {[35, 45, 30, 60, 55, 70, 65, 80, 75, 90, 85, 100].map((h, i) => (
                        <div key={i} className="w-full bg-gray-800 rounded-t-sm relative group/bar hover:bg-purple-600/20 transition-colors" style={{ height: `${h}%` }}>
                            <div 
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-pink-600 opacity-60 rounded-t-sm transition-all duration-500" 
                                style={{ height: `${h}%` }}
                            />
                            {/* Tooltip on hover */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                ${h * 240}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-4 uppercase font-medium">
                    <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
                    <span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span>
                </div>
            </Card>
        </div>

        {/* Columna Derecha: Agenda */}
        <div className="lg:col-span-1 h-full min-h-[400px]">
          <UpcomingAppointments appointments={upcomingAppointments} />
        </div>

      </div>
      
    </motion.div>
  );
}