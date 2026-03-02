"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Calendar, Plus } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

// Hooks & Types
import { useAppointments } from '@/hooks/useAppointment';
import { AppointmentResponse } from '@/types/appointments';

// Modular Components (Los que acabamos de crear)
import { AppointmentStats } from '@/components/appointments/AppointmentStats';
import { AppointmentFilters, TabValue, SortValue } from '@/components/appointments/AppointmentFilters';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { AppointmentEmptyState } from '@/components/appointments/AppointmentEmptyState';

export default function ConsumerAppointmentsPage() {
  const router = useRouter();
  const t = useTranslations('PatientAppointments');
  
  // 🚀 HOOK PRINCIPAL: Extrae la data real de Spring Boot
  const { appointments, isLoading, fetchAppointments, cancelAppointment } = useAppointments();

  // Estados locales de la UI
  const [activeTab, setActiveTab] = useState<TabValue>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortValue>('date');
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelModalState, setCancelModalState] = useState<{
    isOpen: boolean;
    appointment: AppointmentResponse | null;
  }>({
    isOpen: false,
    appointment: null
  });

  // Al cargar la página, traemos los datos
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // 🧮 CÁLCULO DE ESTADÍSTICAS (Memorizado para rendimiento)
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: appointments.length,
      upcoming: appointments.filter(a => new Date(a.startTime) >= now && (a.status === 'SCHEDULED' || a.status === 'PENDING_PAYMENT')).length,
      completed: appointments.filter(a => a.status === 'COMPLETED').length,
      cancelled: appointments.filter(a => a.status === 'CANCELED_BY_CONSUMER' || a.status === 'CANCELED_BY_PROVIDER' || a.status === 'NO_SHOW').length
    };
  }, [appointments]);

  // 🔍 FILTRADO Y ORDENAMIENTO (Memorizado)
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];
    const now = new Date();

    // 1. Filtrar por Pestaña Activa
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(a =>
        new Date(a.startTime) >= now &&
        (a.status === 'SCHEDULED' || a.status === 'PENDING_PAYMENT' || a.status === 'IN_PROGRESS')
      );
    } else if (activeTab === 'past') {
      filtered = filtered.filter(a =>
        a.status === 'COMPLETED' || 
        (new Date(a.endTime) < now && a.status !== 'CANCELED_BY_CONSUMER' && a.status !== 'CANCELED_BY_PROVIDER')
      );
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(a =>
        a.status === 'CANCELED_BY_CONSUMER' || a.status === 'CANCELED_BY_PROVIDER' || a.status === 'NO_SHOW'
      );
    }

    // 2. Filtrar por Búsqueda (Texto)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.providerNameSnapshot.toLowerCase().includes(query) ||
        a.serviceName.toLowerCase().includes(query) ||
        (a.providerSpecialty && a.providerSpecialty.toLowerCase().includes(query))
      );
    }

    // 3. Ordenar
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    } else {
      filtered.sort((a, b) => a.providerNameSnapshot.localeCompare(b.providerNameSnapshot));
    }

    return filtered;
  }, [appointments, activeTab, searchQuery, sortBy]);

  // ❌ MANEJADOR DE CANCELACIÓN
  const handleCancelAppointment = async () => {
    if (!cancelModalState.appointment) return;
    setIsCanceling(true);
    
    // Llamamos al hook con el ID y un motivo genérico
    const success = await cancelAppointment(
      cancelModalState.appointment.id, 
      "Cancelado por el paciente desde portal web"
    );
    
    if (success) {
      setCancelModalState({ isOpen: false, appointment: null });
    }
    setIsCanceling(false);
  };

  // --- ESTADO 1: CARGANDO ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4 bg-slate-50 dark:bg-slate-950 transition-colors">
        <Loader2 className="w-12 h-12 animate-spin text-medical-500" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">{t('loading', { defaultValue: 'Cargando citas...' })}</p>
      </div>
    );
  }

  // --- ESTADO 2: PÁGINA PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30 transition-colors">
      <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">

        {/* --- CABECERA --- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm transition-colors">
              <Calendar className="w-8 h-8 text-medical-600 dark:text-medical-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('title', { defaultValue: 'Mis Citas' })}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {t('subtitle', { defaultValue: 'Gestiona tu historial y próximas consultas.' })}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => router.push('/discover')} 
            className="bg-gradient-to-r from-medical-600 to-medical-500 hover:from-medical-700 hover:to-medical-600 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> 
            {t('btn_new', { defaultValue: 'Agendar Cita' })}
          </Button>
        </div>

        {/* --- COMPONENTE DE ESTADÍSTICAS --- */}
        <AppointmentStats stats={stats} />

        {/* --- COMPONENTE DE FILTROS --- */}
        <AppointmentFilters 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* --- LISTA DE CITAS O ESTADO VACÍO --- */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt, index) => (
                <AppointmentCard 
                  key={appt.id} 
                  appt={appt} 
                  index={index} 
                  onRequestCancel={(appointment) => setCancelModalState({ isOpen: true, appointment })}
                />
              ))
            ) : (
              <AppointmentEmptyState 
                activeTab={activeTab} 
                searchQuery={searchQuery} 
              />
            )}
          </AnimatePresence>
        </div>

        {/* --- MODAL DE CANCELACIÓN --- */}
        <ConfirmationModal
          isOpen={cancelModalState.isOpen}
          onClose={() => setCancelModalState({ isOpen: false, appointment: null })}
          onConfirm={handleCancelAppointment}
          title={t('btn_cancel', { defaultValue: 'Cancelar Cita' })}
          message={`¿Estás seguro que deseas cancelar tu cita para ${cancelModalState.appointment?.serviceName} con el ${cancelModalState.appointment?.providerNameSnapshot}? Esta acción no se puede deshacer.`}
          isLoading={isCanceling}
          variant="destructive"
        />
        
      </div>
    </div>
  );
}