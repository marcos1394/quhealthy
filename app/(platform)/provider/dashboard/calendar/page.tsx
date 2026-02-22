// app/provider/dashboard/calendar/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Calendar as CalendarIcon, Clock, Plus, Loader2, Settings, 
  Link as LinkIcon, CheckCircle, RefreshCcw,
  Badge
} from 'lucide-react';

// 🚀 IMPORTAMOS TU INSTANCIA DE AXIOS
import axiosInstance from '@/lib/axios';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Tus Componentes Inteligentes
import { CalendarView } from '@/components/dashboard/CalendarView';
import { OperatingHoursModal } from '@/components/dashboard/OperatingHours';
import { TimeBlockModal } from '@/components/dashboard/TimeBlockModal';

// --- COMPONENTE DE CARGA (FALLBACK) ---
function CalendarLoading() {
  return (
    <div className="h-[80vh] w-full flex flex-col items-center justify-center bg-gray-950">
      <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
      <p className="text-gray-400 animate-pulse font-medium">Cargando tu espacio de trabajo...</p>
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
  
  // Estado para Sincronizar Componentes (Fuerza a CalendarView a recargar cuando creamos algo)
  const [refreshKey, setRefreshKey] = useState(0);

  // Estado de Google Calendar
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isCheckingGoogle, setIsCheckingGoogle] = useState(true);

  // 1. VERIFICAR ESTADO DE GOOGLE CALENDAR (Llama a tu CalendarIntegrationController)
  useEffect(() => {
    const checkGoogleStatus = async () => {
      try {
const { data } = await axiosInstance.get('/api/appointments/integrations/calendar/status'); // 🚀 Ajustado
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
    const syncStatus = searchParams.get('calendar_status'); // Coincide con tu redirect de Java
    if (syncStatus === 'success') {
      toast.success("¡Google Calendar conectado exitosamente! 🎉");
      setIsGoogleConnected(true);
      router.replace('/provider/dashboard/calendar'); // Limpiar URL
    } else if (syncStatus === 'error') {
      toast.error("Error al conectar con Google.");
      router.replace('/provider/dashboard/calendar'); // Limpiar URL
    }
  }, [searchParams, router]);

  // 3. INICIAR CONEXIÓN CON GOOGLE (Llama a tu Controller para pedir la URL de Auth)
  const handleGoogleConnect = async () => {
    try {
      const { data } = await axiosInstance.get('/api/appointments/integrations/calendar/connect/GOOGLE_CALENDAR'); // 🚀 Ajustado
      window.location.href = data; // Redirigir a la pantalla de Google
    } catch (error) {
      toast.error("No se pudo iniciar la conexión con Google.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-8 max-w-[1600px] mx-auto"
      >
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-purple-500" />
              Disponibilidad y Agenda
            </h1>
            <p className="text-gray-400">Gestiona tus horarios laborales y citas agendadas.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setIsHoursModalOpen(true)} 
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all shadow-sm"
            >
              <Clock className="w-4 h-4 mr-2 text-purple-400" />
              Configurar Horarios
            </Button>

            <Button 
              onClick={() => setIsBlockModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Bloquear Tiempo
            </Button>
          </div>
        </div>

        {/* --- GOOGLE INTEGRATION CARD --- */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-900/50 border border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-md">
                <svg className="w-6 h-6" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path fill="#4285F4" d="M3 10.5v27C3 41.085 5.915 44 9.5 44h29c3.585 0 6.5-2.915 6.5-6.5v-27H3z"/>
  <path fill="#1666D5" d="M3 10.5v12h42v-12H3z"/>
  <path fill="#E8EAED" d="M3 10.5h42V20H3z"/>
  <text x="24" y="34" fill="#1666D5" fontFamily="Arial" fontSize="16" fontWeight="bold" textAnchor="middle">31</text>
  <path fill="#EA4335" d="M9.5 4h5v9h-5z"/>
  <path fill="#FBBC04" d="M33.5 4h5v9h-5z"/>
</svg>
                </div>
                <div>
                    <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                        Google Calendar
                        {isGoogleConnected && <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] uppercase">Conectado</Badge>}
                    </h3>
                    <p className="text-sm text-gray-400">Sincroniza tus eventos personales para evitar que los pacientes agenden sobre ellos.</p>
                </div>
            </div>
            
            {isCheckingGoogle ? (
              <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
            ) : isGoogleConnected ? (
                <Button variant="ghost" disabled className="text-green-500 bg-green-500/5 border border-green-500/10">
                    <CheckCircle className="w-4 h-4 mr-2" /> Sincronizado
                </Button>
            ) : (
                <Button onClick={handleGoogleConnect} variant="secondary" className="bg-white text-gray-900 hover:bg-gray-200 font-bold shadow-lg">
                    <LinkIcon className="w-4 h-4 mr-2" /> Conectar Cuenta
                </Button>
            )}
        </div>

        {/* --- CALENDARIO PRINCIPAL --- */}
        <div className="h-[75vh] min-h-[650px] relative rounded-xl bg-gray-950 border border-gray-800 shadow-2xl overflow-hidden p-2">
            {/* Al cambiar el 'key', forzamos a CalendarView a re-montarse y re-cargar los eventos del backend */}
            <CalendarView key={refreshKey} />
        </div>

        {/* --- QUICK STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900 border-gray-800 p-5 flex items-center gap-4 hover:border-purple-500/30 transition-colors">
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Horario</p>
                    <p className="text-lg font-bold text-white">Configurado</p>
                </div>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 p-5 flex items-center gap-4 hover:border-blue-500/30 transition-colors">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                    <RefreshCcw className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Sincronización</p>
                    <p className="text-lg font-bold text-white">{isGoogleConnected ? 'Activa' : 'Inactiva'}</p>
                </div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-5 flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <Settings className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Estado</p>
                    <p className="text-lg font-bold text-emerald-400">Operativo</p>
                </div>
            </Card>
        </div>

        {/* --- MODALES --- */}
        <OperatingHoursModal
            isOpen={isHoursModalOpen}
            onClose={() => setIsHoursModalOpen(false)}
            onSaveSuccess={() => setRefreshKey(prev => prev + 1)} // 🚀 Actualiza el calendario al guardar
        />

        <TimeBlockModal
            isOpen={isBlockModalOpen}
            onClose={() => setIsBlockModalOpen(false)}
            onSaveSuccess={() => setRefreshKey(prev => prev + 1)} // 🚀 Actualiza el calendario al guardar
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