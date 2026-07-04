"use client";
/* eslint-disable react-doctor/prefer-useReducer */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AnimatePresence } from 'framer-motion';
import { Calendar, Plus } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { QhSpinner } from '@/components/ui/QhSpinner';

// Hooks & Types
import { useAppointments } from '@/hooks/useAppointment';
import { AppointmentResponse } from '@/types/appointments';

// Modular Components
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
 <div className="flex flex-col justify-center items-center min-h-screen gap-6 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
 <QhSpinner size="lg" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white animate-pulse">
 {t('loading', { defaultValue: 'Cargando tu agenda...' })}
 </p>
 </div>
 );
 }

 // --- ESTADO 2: PÁGINA PRINCIPAL ---
 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
 <div className="max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-16 space-y-12">

 {/* --- CABECERA --- */}
 <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
 <div className="flex items-center gap-6">
 <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
 <Calendar className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <h1 className="text-3xl font-semibold text-black dark:text-white tracking-tight mb-2 uppercase">
 {t('title', { defaultValue: 'Mis Citas' })}
 </h1>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 {t('subtitle', { defaultValue: 'Gestiona tus próximas consultas y revisa tu historial.' })}
 </p>
 </div>
 </div>
 
 <Button 
 onClick={() => router.push('/discover')} 
 className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0"
 >
 <Plus className="w-4 h-4 mr-3" strokeWidth={2} /> 
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
 <div className="space-y-6">
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

 {/* --- MODAL DE CANCELACIÓN (Nota: El Modal mantiene sus propias clases, pero envuelve la lógica) --- */}
 <ConfirmationModal
 isOpen={cancelModalState.isOpen}
 onClose={() => setCancelModalState({ isOpen: false, appointment: null })}
 onConfirm={handleCancelAppointment}
 title={t('btn_cancel', { defaultValue: 'Cancelar Cita' })}
 message={`¿¿Estás seguro de que deseas cancelar tu cita de ${cancelModalState.appointment?.serviceName} con ${cancelModalState.appointment?.providerNameSnapshot}? Esta acción no se puede deshacer.`}
 isLoading={isCanceling}
 variant="destructive"
 />
 
 </div>
 </div>
 );
}