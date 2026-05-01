"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Check, User, Clock, Calendar, Activity, CheckCircle2, XCircle, Timer, Phone, MessageSquare, Star, Zap, X, Video, Heart, Sparkles, Award, PlayCircle, UserCheck, Filter } from "lucide-react";
import { format } from "date-fns"; // 🚀 Usamos format simple en lugar de formatInTimeZone
import { es } from "date-fns/locale";
import Link from 'next/link'; // 🚀 Asegúrate de importar Link arriba
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompletionModal } from "@/components/dashboard/CompletionModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { NewAppointmentModal } from "@/components/dashboard/NewAppointmentModal";
import { useProviderAppointments } from "@/hooks/useProviderAppointments";
import { appointmentService } from "@/services/appointment.service";
import { ProviderAppointment } from "@/types/appointments";
import { KanbanCard } from "@/components/dashboard/KanbanCard";
import { useTranslations } from "next-intl";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { handleApiError } from '@/lib/handleApiError';

export default function ProviderAppointmentsPage() {
  const router = useRouter();
  const { appointments, setAppointments, isLoading, refetch } = useProviderAppointments();
  const t = useTranslations('DashboardAppointments');

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ProviderAppointment | null>(null);
  const [cancelModalState, setCancelModalState] = useState<{ isOpen: boolean; appointment: ProviderAppointment | null }>({ isOpen: false, appointment: null });
  const [isCanceling, setIsCanceling] = useState(false);
  
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'UPCOMING'>('ALL');
  const [draggedApptId, setDraggedApptId] = useState<number | string | null>(null);

  // 🚀 FIX: Este normalizador es VITAL porque tu endpoint de Agenda devuelve "pending/confirmed" 
  // pero la lógica del drag&drop funciona con "SCHEDULED/WAITING_ROOM".
  const normalizeStatus = (status: string) => {
    if (!status) return "SCHEDULED";
    const s = status.toUpperCase();
    if (s === "CONFIRMED") return "SCHEDULED"; // Mapeo de legacy
    if (s === "PENDING") return "SCHEDULED"; // 🚀 Forzamos 'pending' a SCHEDULED para que aparezca en el Kanban
    return s;
  };

  const handleOpenCancelModal = (appointment: ProviderAppointment) => setCancelModalState({ isOpen: true, appointment });

  const handleConfirmCancel = async () => {
    if (!cancelModalState.appointment) return;
    setIsCanceling(true);
    try {
      await appointmentService.cancelAppointment(cancelModalState.appointment.id, "Cancelada desde agenda");
      toast.success(t('toast_cancelled_success'));
      setAppointments(prev => prev.map(a => a.id === cancelModalState.appointment?.id ? { ...a, status: "CANCELED_BY_PROVIDER" } : a));
      setCancelModalState({ isOpen: false, appointment: null });
    } catch (error) { console.error(error); handleApiError(error); }
    finally { setIsCanceling(false); }
  };

// 🚀 Optimización del Kanban (Optimistic UI) con Inyección de Tiempos
  const handleUpdateStatus = async (appointmentId: string | number, newStatus: string) => {
    // Capturamos el instante exacto en que se movió la tarjeta
    const nowLocalIso = new Date().toISOString(); 

    // 1. Cambio Visual Inmediato (Para que no parpadee ni se pierda)
    setAppointments(prev => prev.map(appt => {
      if (appt.id === appointmentId) {
        const updatedAppt = { ...appt, status: newStatus as any };
        
        // ⏱️ INYECTOR DE TIMERS: Si no tenía tiempo asignado, se lo ponemos AHORA MISMO
        if (newStatus === "WAITING_ROOM" && !appt.arrivedAt) {
          updatedAppt.arrivedAt = nowLocalIso;
        }
        if (newStatus === "IN_PROGRESS" && !appt.startedAt) {
          updatedAppt.startedAt = nowLocalIso;
        }
        
        return updatedAppt;
      }
      return appt;
    }));

    try {
      // 2. Llamada en segundo plano al backend
      await appointmentService.updateStatus(appointmentId, newStatus);
      toast.success(`Cita actualizada a ${newStatus}`);
    } catch (error) {
      // Si falla, revertimos recargando
      handleApiError(error);
      refetch();
    }
  };

  const handleOpenCompletionModal = (appointment: ProviderAppointment) => { 
    setSelectedAppointment(appointment); 
    setIsCompleteModalOpen(true); 
  };

  const handleDragStart = (e: React.DragEvent, id: number | string) => {
    setDraggedApptId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedApptId) {
      const idToMove = draggedApptId;
      setDraggedApptId(null); // Limpiamos el estado de arrastre
      
      // Actualizamos el estado en BD y disparamos el timer localmente
      await handleUpdateStatus(idToMove, newStatus);
      
      // 🚀 REDIRECCIÓN CORREGIDA: Ruta absoluta exacta
      if (newStatus === "IN_PROGRESS") {
        router.push(`/provider/consultation/${idToMove}`);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // 🚀 FIX DE HORAS: Función segura para interpretar la hora localmente
  const formatLocalTime = (dateString: string, formatStr: string) => {
    try {
      const date = new Date(dateString);
      return format(date, formatStr, { locale: es });
    } catch (e) {
      return "--:--";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (normalizeStatus(status)) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-600 border-0 dark:bg-emerald-500/10 dark:text-emerald-400";
      case "SCHEDULED": return "bg-blue-50 text-blue-600 border-0 dark:bg-blue-500/10 dark:text-blue-400";
      case "WAITING_ROOM": return "bg-violet-50 text-violet-600 border-0 dark:bg-violet-500/10 dark:text-violet-400";
      case "IN_PROGRESS": return "bg-indigo-50 text-indigo-600 border-0 animate-pulse dark:bg-indigo-500/10 dark:text-indigo-400";
      case "CANCELED_BY_CONSUMER":
      case "CANCELED_BY_PROVIDER": return "bg-red-50 text-red-600 border-0 dark:bg-red-500/10 dark:text-red-400";
      default: return "bg-amber-50 text-amber-600 border-0 dark:bg-amber-500/10 dark:text-amber-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (normalizeStatus(status)) {
      case "COMPLETED": return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "SCHEDULED": return <Calendar className="w-3.5 h-3.5" />;
      case "WAITING_ROOM": return <UserCheck className="w-3.5 h-3.5" />;
      case "IN_PROGRESS": return <PlayCircle className="w-3.5 h-3.5" />;
      case "PENDING_PAYMENT": return <Timer className="w-3.5 h-3.5" />;
      default: return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (normalizeStatus(status)) {
      case "COMPLETED": return t('card.completed');
      case "SCHEDULED": return t('card.scheduled');
      case "WAITING_ROOM": return t('card.waiting_room');
      case "IN_PROGRESS": return t('card.in_progress');
      case "PENDING_PAYMENT": return t('card.pending_payment');
      case "CANCELED_BY_CONSUMER": return t('card.cancelled_by_patient');
      case "CANCELED_BY_PROVIDER": return t('card.cancelled_by_you');
      default: return status;
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    if (dateFilter === 'ALL') return true;
    const apptDate = new Date(appt.startTime).toDateString();
    const today = new Date().toDateString();
    if (dateFilter === 'TODAY') return apptDate === today;
    if (dateFilter === 'UPCOMING') return new Date(appt.startTime) >= new Date();
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <QhSpinner size="md" />
        <p className="text-slate-500 mt-4 animate-pulse font-light">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-medical-600 dark:text-medical-400" />{t('title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-light mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsNewAppointmentModalOpen(true)} className="bg-slate-900 text-white rounded-xl shadow-none">
            <Zap className="w-4 h-4 mr-2" />{t('quick_actions.new_appointment')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
          <TabsList className="bg-transparent space-x-1">
            <TabsTrigger value="list" className="rounded-xl data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 dark:text-slate-300">{t('view_mode.list')}</TabsTrigger>
            <TabsTrigger value="kanban" className="rounded-xl data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 dark:text-slate-300">{t('view_mode.kanban')}</TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-xl data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 dark:text-slate-300">{t('view_mode.calendar')}</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <Button size="sm" variant={dateFilter === 'ALL' ? 'secondary' : 'ghost'} onClick={() => setDateFilter('ALL')} className="rounded-lg h-7 text-xs dark:text-slate-300 dark:hover:bg-slate-700">{t('tabs.all')}</Button>
            <Button size="sm" variant={dateFilter === 'TODAY' ? 'secondary' : 'ghost'} onClick={() => setDateFilter('TODAY')} className="rounded-lg h-7 text-xs dark:text-slate-300 dark:hover:bg-slate-700">{t('tabs.today')}</Button>
            <Button size="sm" variant={dateFilter === 'UPCOMING' ? 'secondary' : 'ghost'} onClick={() => setDateFilter('UPCOMING')} className="rounded-lg h-7 text-xs dark:text-slate-300 dark:hover:bg-slate-700">{t('tabs.upcoming')}</Button>
          </div>
        </div>

        {/* VISTA DE LISTA */}
        <TabsContent value="list" className="space-y-3 m-0">
          <AnimatePresence mode="popLayout">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt, index) => {
                const currentStatus = normalizeStatus(appt.status);

                return (
                  <motion.div key={appt.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{appt.service?.name || t('medical_appointment')}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            <span className="text-slate-900 dark:text-slate-200 font-medium">{appt.consumer?.name || t('card.patient')}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-medical-600 dark:text-medical-400">
                              <Clock className="w-3 h-3" />
                              {/* 🚀 FIX: Usamos el formateo local */}
                              {formatLocalTime(appt.startTime, "d MMM, HH:mm")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Badge className={`${getStatusBadgeStyle(appt.status)} px-2.5 py-1`}>
                          <span className="flex items-center gap-1">{getStatusIcon(appt.status)}{getStatusText(appt.status)}</span>
                        </Badge>

                        {["SCHEDULED", "WAITING_ROOM", "PENDING_PAYMENT"].includes(currentStatus) && (
                          <Button size="sm" variant="ghost" onClick={() => handleOpenCancelModal(appt)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 rounded-lg text-xs">
                            {t('actions.cancel')}
                          </Button>
                        )}

                        {currentStatus === "SCHEDULED" && (
                          <Button size="sm" onClick={() => handleUpdateStatus(appt.id, "WAITING_ROOM")} className="bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/30 h-8 rounded-lg text-xs shadow-none">
                            <UserCheck className="w-4 h-4 mr-1" /> {t('actions.arrived')}
                          </Button>
                        )}

                        {["SCHEDULED", "WAITING_ROOM"].includes(currentStatus) && (
                          <Button size="sm" onClick={() => handleUpdateStatus(appt.id, "IN_PROGRESS")} className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white h-8 rounded-lg text-xs shadow-none">
                            <PlayCircle className="w-4 h-4 mr-1" /> {t('actions.start')}
                          </Button>
                        )}

                        {currentStatus === "IN_PROGRESS" && (
                          <Button size="sm" onClick={() => handleOpenCompletionModal(appt)} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white h-8 rounded-lg text-xs shadow-none">
                            <Check className="w-4 h-4 mr-1" /> {t('actions.finish')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-14 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                {t('no_appointments_filter')}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* VISTA KANBAN */}
        {/* ========================================== */}
        {/* VISTA KANBAN (DRAG & DROP GLOBAL) */}
        {/* ========================================== */}
        <TabsContent value="kanban" className="m-0 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1000px] items-start">
            {[
              { id: "SCHEDULED", title: t('kanban_columns.scheduled'), color: "border-blue-500 dark:border-blue-700", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300" },
              { id: "WAITING_ROOM", title: t('kanban_columns.waiting_room'), color: "border-violet-500 dark:border-violet-700", bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-700 dark:text-violet-300" },
              { id: "IN_PROGRESS", title: t('kanban_columns.in_progress'), color: "border-indigo-500 dark:border-indigo-700 animate-pulse", bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-300" },
              { id: "COMPLETED", title: t('kanban_columns.completed'), color: "border-emerald-500 dark:border-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300" }
            ].map(column => (
              <div 
                key={column.id}
                onDrop={(e) => handleDrop(e, column.id)}
                onDragOver={handleDragOver}
                className="flex-1 min-w-[250px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[650px]"
              >
                {/* Cabecera de la Columna */}
                <div className={`p-3 border-b border-slate-200 dark:border-slate-800 ${column.bg} rounded-t-2xl border-t-2 ${column.color}`}>
                  <h3 className={`font-semibold text-sm flex justify-between items-center ${column.text}`}>
                    {column.title}
                    <Badge variant="secondary" className="bg-white dark:bg-slate-800 dark:text-slate-200 shadow-sm border-0">
                      {filteredAppointments.filter(a => normalizeStatus(a.status) === column.id).length}
                    </Badge>
                  </h3>
                </div>

                {/* Zona de Arrastre / Contenido */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  {filteredAppointments
                    .filter(appt => normalizeStatus(appt.status) === column.id)
                    .map(appt => (
                      
                      // 🚀 AQUI USAMOS EL NUEVO COMPONENTE
                      <KanbanCard 
                        key={appt.id}
                        appt={appt}
                        columnId={column.id}
                        onDragStart={handleDragStart}
                        onOpenCompletionModal={handleOpenCompletionModal}
                      />

                    ))}
                  
                  {/* Mensaje vacío si no hay tarjetas */}
                  {filteredAppointments.filter(appt => normalizeStatus(appt.status) === column.id).length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
                      {t('drag_here')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="m-0 h-[600px]">
          <CalendarView />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CompletionModal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} appointment={selectedAppointment} onComplete={() => { refetch(); setIsCompleteModalOpen(false); }} />
      <ConfirmationModal isOpen={cancelModalState.isOpen} onClose={() => setCancelModalState({ isOpen: false, appointment: null })} onConfirm={handleConfirmCancel} title="Cancelar Cita" message="¿Estás seguro de cancelar esta cita?" isLoading={isCanceling} variant="destructive" />
      <NewAppointmentModal isOpen={isNewAppointmentModalOpen} onClose={() => setIsNewAppointmentModalOpen(false)} onCreated={refetch} />
    </div>
  );
}