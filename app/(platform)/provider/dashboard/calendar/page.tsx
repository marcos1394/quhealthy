"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Calendar as CalendarIcon, Clock, Plus, Loader2, Settings, 
  Link as LinkIcon, CheckCircle, RefreshCcw,
  Badge,
  CalendarDays,
  Sparkles,
  AlertCircle
} from 'lucide-react';

// 🚀 IMPORTAMOS TU INSTANCIA DE AXIOS
import axiosInstance from '@/lib/axios';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Tus Componentes Inteligentes
import { CalendarView } from '@/components/dashboard/CalendarView';
import { OperatingHoursModal } from '@/components/dashboard/OperatingHours';
import { TimeBlockModal } from '@/components/dashboard/TimeBlockModal';
import { cn } from '@/lib/utils';

// --- COMPONENTE DE CARGA (FALLBACK) ---
function CalendarLoading() {
  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center bg-gray-950">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin relative z-10 mb-4" />
      </div>
      <p className="text-gray-400 animate-pulse font-medium">Preparando tu agenda inteligente...</p>
    </div>
  );
}

// --- CONTENIDO PRINCIPAL ---
function CalendarContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 

  // Estados de Modales
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  
  // Estado para Sincronizar Componentes
  const [refreshKey, setRefreshKey] = useState(0);

  // Estado de Google Calendar
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isCheckingGoogle, setIsCheckingGoogle] = useState(true);

  // 1. VERIFICAR ESTADO DE GOOGLE CALENDAR
  useEffect(() => {
    const checkGoogleStatus = async () => {
      try {
        const { data } = await axiosInstance.get('/api/appointments/integrations/calendar/status');
        setIsGoogleConnected(data.connected);
      } catch (error) {
        console.error("Error verificando estado de Google Calendar", error);
      } finally {
        setIsCheckingGoogle(false);
      }
    };

    checkGoogleStatus();
  }, []);

  // 2. MANEJAR CALLBACK OAUTH DE GOOGLE
  useEffect(() => {
    const syncStatus = searchParams.get('calendar_status');
    if (syncStatus === 'success') {
      toast.success("¡Google Calendar conectado exitosamente! 🎉", { theme: "dark" });
      setIsGoogleConnected(true);
      router.replace('/provider/dashboard/calendar');
    } else if (syncStatus === 'error') {
      toast.error("Error al conectar con Google.", { theme: "dark" });
      router.replace('/provider/dashboard/calendar');
    }
  }, [searchParams, router]);

  // 3. INICIAR CONEXIÓN CON GOOGLE
  const handleGoogleConnect = async () => {
    try {
      const { data } = await axiosInstance.get('/api/appointments/integrations/calendar/connect/GOOGLE_CALENDAR');
      window.location.href = data; 
    } catch (error) {
      toast.error("No se pudo iniciar la conexión con Google.", { theme: "dark" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 lg:p-8 font-sans selection:bg-purple-500/30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="space-y-8 max-w-7xl mx-auto"
      >
        
        {/* --- 🚀 HEADER PREMIUM --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-gray-800/60">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <CalendarDays className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Agenda Virtual
              </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed ml-14">
              Controla tus horas de atención, bloquea espacios personales y visualiza a tus próximos pacientes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={() => setIsHoursModalOpen(true)} 
              variant="outline" 
              className="h-11 px-5 border-gray-700 bg-gray-900/50 text-gray-300 hover:bg-gray-800 hover:text-white transition-all shadow-sm rounded-xl font-semibold"
            >
              <Clock className="w-4 h-4 mr-2 text-purple-400" />
              Horarios Laborales
            </Button>

            <Button 
              onClick={() => setIsBlockModalOpen(true)}
              className="h-11 px-6 bg-white text-purple-950 hover:bg-gray-200 shadow-xl shadow-white/10 transition-transform hover:scale-105 rounded-xl font-black"
            >
              <Plus className="w-5 h-5 mr-1.5" />
              Bloquear Tiempo
            </Button>
          </div>
        </div>

        {/* --- 🚀 INTEGRACIÓN GOOGLE (BANNER INTELIGENTE) --- */}
        <AnimatePresence>
          <motion.div 
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={cn(
              "rounded-3xl border p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden transition-all duration-500",
              isGoogleConnected 
                ? "bg-gray-900/50 border-gray-800" 
                : "bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/30"
            )}
          >
            {/* Brillo decorativo si no está conectado */}
            {!isGoogleConnected && (
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            )}

            <div className="flex items-center gap-5 relative z-10">
              <div className="p-4 bg-white rounded-2xl shadow-xl shadow-black/20 shrink-0">
                <svg className="w-8 h-8" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M3 10.5v27C3 41.085 5.915 44 9.5 44h29c3.585 0 6.5-2.915 6.5-6.5v-27H3z"/>
                  <path fill="#1666D5" d="M3 10.5v12h42v-12H3z"/>
                  <path fill="#E8EAED" d="M3 10.5h42V20H3z"/>
                  <text x="24" y="34" fill="#1666D5" fontFamily="Arial" fontSize="16" fontWeight="bold" textAnchor="middle">31</text>
                  <path fill="#EA4335" d="M9.5 4h5v9h-5z"/>
                  <path fill="#FBBC04" d="M33.5 4h5v9h-5z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-3 mb-1">
                  Sincronización Bidireccional
                  {isGoogleConnected ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" /> ACTIVO
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      <AlertCircle className="w-3 h-3" /> RECOMENDADO
                    </span>
                  )}
                </h3>
                <p className={cn("text-sm", isGoogleConnected ? "text-gray-400" : "text-purple-200/80")}>
                  {isGoogleConnected 
                    ? "Tus eventos personales bloquean automáticamente tu agenda médica." 
                    : "Conecta tu calendario para evitar que los pacientes agenden sobre tus compromisos personales."}
                </p>
              </div>
            </div>
            
            <div className="shrink-0 relative z-10 w-full md:w-auto">
              {isCheckingGoogle ? (
                <div className="h-11 w-32 bg-gray-800 rounded-xl animate-pulse" />
              ) : isGoogleConnected ? (
                <Button variant="outline" className="w-full md:w-auto h-11 px-6 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl font-semibold">
                  <Settings className="w-4 h-4 mr-2" /> Ajustes
                </Button>
              ) : (
                <Button 
                  onClick={handleGoogleConnect} 
                  className="w-full md:w-auto h-11 px-8 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-transform hover:scale-105"
                >
                  <LinkIcon className="w-4 h-4 mr-2" /> Vincular Google
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* --- 🚀 ÁREA DEL CALENDARIO (EL CORAZÓN) --- */}
        <Card className="bg-gray-900/80 border-gray-800 shadow-2xl overflow-hidden rounded-3xl">
          <CardContent className="p-0">
            {/* Contenedor del Calendario (El componente CalendarView debe tener su propio scroll interno si crece mucho) */}
            <div className="h-[70vh] min-h-[650px] w-full relative">
              <CalendarView key={refreshKey} />
            </div>
          </CardContent>
        </Card>

        {/* --- 🚀 MÉTRICAS DE ESTADO --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex items-center gap-5 hover:border-gray-700 transition-colors">
            <div className="p-3.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Horario Laboral</p>
              <p className="text-lg font-black text-white">Configurado</p>
            </div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex items-center gap-5 hover:border-gray-700 transition-colors">
            <div className="p-3.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <RefreshCcw className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Sincronización</p>
              <p className="text-lg font-black text-white">{isGoogleConnected ? 'En tiempo real' : 'Manual'}</p>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex items-center gap-5 hover:border-gray-700 transition-colors">
            <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Motor de Reservas</p>
              <p className="text-lg font-black text-emerald-400">Activo y Operativo</p>
            </div>
          </div>
        </div>

        {/* --- MODALES --- */}
        <OperatingHoursModal
          isOpen={isHoursModalOpen}
          onClose={() => setIsHoursModalOpen(false)}
          onSaveSuccess={() => setRefreshKey(prev => prev + 1)} 
        />

        <TimeBlockModal
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          onSaveSuccess={() => setRefreshKey(prev => prev + 1)} 
        />

      </motion.div>
    </div>
  );
}

// --- EXPORT DEFAULT CON SUSPENSE ---
export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarLoading />}>
      <CalendarContent />
    </Suspense>
  );
}