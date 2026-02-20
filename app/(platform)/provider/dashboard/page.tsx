"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  BarChart2, 
  CheckCircle, 
  Users, 
  Sparkles,
  RefreshCw,
  Crown,
  Clock,
  Store,
  ArrowRight,
  CalendarDays
} from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Components
import { SummaryCard } from '@/components/dashboard/SummaryCard';

// Hook
import { useDashboardData } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';


export default function DashboardPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('this_month');
  const { data, isLoading, refetch } = useDashboardData(dateRange);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center flex-col gap-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-16 h-16 text-purple-500" />
        </motion.div>
        <div className="text-center space-y-2">
          <p className="text-gray-300 font-semibold text-lg">Cargando tu dashboard</p>
          <p className="text-gray-500 text-sm animate-pulse">Sincronizando información...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!data) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center border-2 border-red-500/20 mb-6">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <div className="space-y-4 max-w-md">
          <h3 className="text-2xl font-black text-white">No pudimos cargar los datos</h3>
          <p className="text-gray-400">Ocurrió un error al sincronizar tu información. Por favor, intenta nuevamente.</p>
          <Button onClick={() => refetch()} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const { plan, hasConfiguredStore, analytics, upcomingAppointments } = data;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-10"
    >
      
      {/* 🚀 1. HEADER Y BANNER DE SUSCRIPCIÓN */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Hola de nuevo 👋</h1>
          <p className="text-gray-400 text-lg">Aquí tienes el resumen de tu negocio.</p>
        </div>
        
        {/* Plan Banner Dinámico */}
        <div className={cn(
          "flex items-center justify-between gap-6 px-5 py-3 rounded-2xl border backdrop-blur-md shadow-xl",
          plan.status === 'TRIAL' ? "bg-blue-500/10 border-blue-500/30" :
          plan.status === 'EXPIRED' ? "bg-red-500/10 border-red-500/30" :
          "bg-purple-500/10 border-purple-500/30"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              plan.status === 'TRIAL' ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
            )}>
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{plan.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className={cn(
                  "text-xs font-semibold",
                  plan.daysLeft <= 3 ? "text-red-400" : "text-gray-400"
                )}>
                  {plan.daysLeft} días restantes
                </span>
              </div>
            </div>
          </div>
          <Button size="sm" className="bg-white text-black hover:bg-gray-200 font-bold rounded-xl shadow-lg shadow-white/10">
            Mejorar Plan
          </Button>
        </div>
      </div>

      {/* 🚀 2. CALL TO ACTION: CONFIGURAR TIENDA (Solo si no la ha configurado) */}
      <AnimatePresence>
        {!hasConfiguredStore && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/30 shadow-2xl overflow-hidden relative group">
              {/* Efecto de luz */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
              
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">Tu tienda aún está vacía</h3>
                    <p className="text-purple-200/80 max-w-xl">
                      Configura tus servicios, precios y horarios para que los pacientes puedan comenzar a agendar citas contigo.
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={() => router.push('/provider/services')}
                  className="w-full md:w-auto bg-white text-purple-900 hover:bg-gray-100 font-black h-12 px-8 shadow-xl shadow-white/10 transition-transform group-hover:scale-105"
                >
                  Configurar Mi Tienda
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 3. MÉTRICAS CLAVE (En ceros para usuarios nuevos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Ingresos (Este mes)" 
          value={analytics.monthlyRevenue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} 
          icon={BarChart2} 
          color="text-emerald-400" 
          bgColor="bg-emerald-500/10"
          borderColor="border-emerald-500/20"
        />
        <SummaryCard 
          title="Citas Completadas" 
          value={analytics.completedAppointments.toString()} 
          icon={CheckCircle} 
          color="text-blue-400" 
          bgColor="bg-blue-500/10"
          borderColor="border-blue-500/20"
        />
        <SummaryCard 
          title="Nuevos Pacientes" 
          value={analytics.newClients.toString()} 
          icon={Users} 
          color="text-pink-400" 
          bgColor="bg-pink-500/10"
          borderColor="border-pink-500/20"
        />
      </div>

      {/* 🚀 4. CONTENIDO PRINCIPAL: ESTADOS VACÍOS ELEGANTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Gráfica Vacía */}
        <Card className="bg-gray-900/50 border-gray-800 min-h-[300px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
          <BarChart2 className="w-16 h-16 text-gray-700 mb-4" />
          <h4 className="text-xl font-bold text-gray-300 mb-2">Sin datos financieros</h4>
          <p className="text-gray-500 max-w-sm">
            Tus gráficas de ingresos aparecerán aquí en cuanto comiences a recibir pagos y completar citas.
          </p>
        </Card>

        {/* Citas Vacías */}
        <Card className="bg-gray-900/50 border-gray-800 min-h-[300px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <CalendarDays className="w-16 h-16 text-gray-700 mb-4" />
          <h4 className="text-xl font-bold text-gray-300 mb-2">No hay citas próximas</h4>
          <p className="text-gray-500 max-w-sm mb-6">
            Aún no tienes reservaciones para los próximos días. Comparte tu perfil para empezar a recibir pacientes.
          </p>
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
            Ver Mi Agenda
          </Button>
        </Card>

      </div>
      
    </motion.div>
  );
}