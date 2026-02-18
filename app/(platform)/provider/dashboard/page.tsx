"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  AlertCircle, 
  BarChart2, 
  CheckCircle, 
  Users, 
  Calendar as CalendarIcon, 
  TrendingUp,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Components
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { VerificationStatus } from '@/components/dashboard/VerificationStatus';

// Hook
import { useDashboardData } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';


export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('this_month');
  const { data, isLoading, refetch } = useDashboardData(dateRange);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center flex-col gap-6">
        <motion.div 
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-16 h-16 text-purple-500" />
        </motion.div>
        <div className="text-center space-y-2">
          <p className="text-gray-300 font-semibold text-lg">Cargando tu dashboard</p>
          <p className="text-gray-500 text-sm animate-pulse">Sincronizando métricas y citas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!data) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[70vh] flex flex-col justify-center items-center text-center px-4"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center border-2 border-red-500/20 mb-6">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <div className="space-y-4 max-w-md">
          <h3 className="text-2xl font-black text-white">No pudimos cargar los datos</h3>
          <p className="text-gray-400">Ocurrió un error al sincronizar tu información. Por favor, intenta nuevamente.</p>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="border-gray-700 text-gray-300 hover:bg-gray-800 h-11 px-6"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar Carga
          </Button>
        </div>
      </motion.div>
    );
  }

  const { analytics, upcomingAppointments, verificationStatus } = data;

  // Get date range label
  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'this_month': return 'Este Mes';
      case 'last_month': return 'Mes Pasado';
      case 'all_time': return 'Todo el Historial';
      default: return 'Este Mes';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-10"
    >
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              <Sparkles className="w-3 h-3 mr-1" />
              En Vivo
            </Badge>
          </div>
          <p className="text-gray-400 text-lg">Resumen de actividad y rendimiento</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[200px] bg-transparent border-0 text-gray-300 h-12 focus:ring-0 font-semibold">
                <CalendarIcon className="w-4 h-4 mr-2 text-purple-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
                <SelectItem value="this_month" className="font-semibold">Este Mes</SelectItem>
                <SelectItem value="last_month" className="font-semibold">Mes Pasado</SelectItem>
                <SelectItem value="all_time" className="font-semibold">Todo el Historial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <Button 
            variant="outline" 
            className="border-gray-800 hover:bg-gray-800 h-12 px-4"
          >
            <Download className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {/* Verification Status */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <VerificationStatus status={verificationStatus} />
        </motion.div>
      </AnimatePresence>

      {/* KPIs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-400" />
            Métricas Clave
            <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
              {getDateRangeLabel()}
            </Badge>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SummaryCard 
              title="Ingresos Estimados" 
              value={analytics.monthlyRevenue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} 
              icon={BarChart2} 
              color="text-emerald-400" 
              bgColor="bg-emerald-500/10"
              borderColor="border-emerald-500/20"
              trend={{ value: 12.5, isPositive: true }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SummaryCard 
              title="Citas Completadas" 
              value={analytics.completedAppointments.toString()} 
              icon={CheckCircle} 
              color="text-blue-400" 
              bgColor="bg-blue-500/10"
              borderColor="border-blue-500/20"
              trend={{ value: 4.2, isPositive: true }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SummaryCard 
              title="Nuevos Pacientes" 
              value={analytics.newClients.toString()} 
              icon={Users} 
              color="text-pink-400" 
              bgColor="bg-pink-500/10"
              borderColor="border-pink-500/20"
              trend={{ value: 2.1, isPositive: false }}
            />
          </motion.div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart Section */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-gray-900 to-gray-900/50 border-gray-800 shadow-2xl overflow-hidden group">
            <CardContent className="p-0">
              {/* Chart Header */}
              <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2 mb-1">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                      Rendimiento Financiero
                    </h3>
                    <p className="text-sm text-gray-400">Comparativa de ingresos mensuales</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Reporte
                  </Button>
                </div>

                {/* Summary Stats */}
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600" />
                    <span className="text-xs text-gray-500 font-semibold">Ingresos</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-bold">+12.5%</span>
                  </div>
                </div>
              </div>
              
              {/* Chart Visualization */}
              <div className="p-8">
                <div className="flex items-end justify-between gap-2 h-64">
                  {[35, 45, 30, 60, 55, 70, 65, 80, 75, 90, 85, 100].map((h, i) => (
                    <motion.div 
                      key={i} 
                      className="w-full relative group/bar cursor-pointer"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                    >
                      <div 
                        className={cn(
                          "w-full h-full bg-gray-800 rounded-t-lg relative overflow-hidden transition-all duration-300",
                          "hover:bg-gray-700"
                        )}
                      >
                        <motion.div 
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 via-purple-500 to-pink-500 rounded-t-lg"
                          initial={{ height: 0 }}
                          animate={{ height: '100%' }}
                          transition={{ delay: 0.6 + i * 0.05, duration: 0.4 }}
                        />
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        <div className="bg-gray-900 border border-gray-700 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                          <p className="font-bold">${(h * 240).toLocaleString()}</p>
                          <p className="text-gray-400 text-xs">MXN</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* X-axis Labels */}
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 mt-4 font-semibold">
                  <span className="text-center">Ene</span>
                  <span className="text-center">Feb</span>
                  <span className="text-center">Mar</span>
                  <span className="text-center">Abr</span>
                  <span className="text-center">May</span>
                  <span className="text-center">Jun</span>
                  <span className="text-center">Jul</span>
                  <span className="text-center">Ago</span>
                  <span className="text-center">Sep</span>
                  <span className="text-center">Oct</span>
                  <span className="text-center">Nov</span>
                  <span className="text-center">Dic</span>
                </div>
              </div>

              {/* Chart Footer */}
              <div className="p-4 bg-gray-950/50 border-t border-gray-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
                  <span>Actualizado hace 5 minutos</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Appointments Section */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <UpcomingAppointments appointments={upcomingAppointments} />
        </motion.div>
      </div>
      
    </motion.div>
  );
}