"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Check, User, Clock, Calendar, Activity, CheckCircle2, XCircle, Timer, Phone, MessageSquare, Star, Zap, X, Video, Heart, Sparkles, Award, PlayCircle, UserCheck, Filter } from "lucide-react";
import { format } from "date-fns"; // 🚀 Usamos format simple en lugar de formatInTimeZone
import { es } from "date-fns/locale";
import Link from 'next/link'; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompletionModal } from "@/components/dashboard/CompletionModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { NewAppointmentModal } from "@/components/dashboard/NewAppointmentModal";
import { useProviderAppointments, saveApptTime } from "@/hooks/useProviderAppointments";
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

  const normalizeStatus = (status: string) => {
    if (!status) return "SCHEDULED";
    const s = status.toUpperCase();
    if (s === "CONFIRMED") return "SCHEDULED"; 
    if (s === "PENDING") return "SCHEDULED"; 
    return s;
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "WAITING_ROOM": return "Sala de Espera";
      case "IN_PROGRESS": return "En Progreso";
      case "COMPLETED": return "Completada";
      case "SCHEDULED": return "Programada";
      case "CONFIRMED": return "Confirmada";
      default: return status;
    }
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

  const handleUpdateStatus = async (appointmentId: string | number, newStatus: string) => {
    const nowLocalIso = new Date().toISOString(); 

    setAppointments(prev => prev.map(appt => {
      if (appt.id === appointmentId) {
        const updatedAppt = { ...appt, status: newStatus as any };
        
        if (newStatus === "WAITING_ROOM" && !appt.arrivedAt) {
          updatedAppt.arrivedAt = nowLocalIso;
          saveApptTime(appt.id, 'arrivedAt', nowLocalIso);
        }
        if (newStatus === "IN_PROGRESS" && !appt.startedAt) {
          updatedAppt.startedAt = nowLocalIso;
          saveApptTime(appt.id, 'startedAt', nowLocalIso);
        }
        if (newStatus === "COMPLETED" && !appt.completedAt) {
          updatedAppt.completedAt = nowLocalIso;
          saveApptTime(appt.id, 'completedAt', nowLocalIso);
        }
        
        return updatedAppt;
      }
      return appt;
    }));

    try {
      await appointmentService.updateStatus(appointmentId, newStatus);
      toast.success(`Cita actualizada a ${translateStatus(newStatus)}`);
    } catch (error) {
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
      setDraggedApptId(null); 
      
      await handleUpdateStatus(idToMove, newStatus);
      
      if (newStatus === "IN_PROGRESS") {
        router.push(`/provider/consultation/${idToMove}`);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

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
      case "COMPLETED": return "bg-white text-black border-black dark:bg-[#0a0a0a] dark:text-white dark:border-white";
      case "SCHEDULED": return "bg-white text-black border-black dark:bg-[#0a0a0a] dark:text-white dark:border-white";
      case "WAITING_ROOM": return "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white";
      case "IN_PROGRESS": return "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white animate-pulse";
      case "CANCELED_BY_CONSUMER":
      case "CANCELED_BY_PROVIDER": return "bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-900 dark:text-gray-600 dark:border-gray-800 line-through";
      default: return "bg-white text-black border-black dark:bg-[#0a0a0a] dark:text-white dark:border-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (normalizeStatus(status)) {
      case "COMPLETED": return <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />;
      case "SCHEDULED": return <Calendar className="w-3.5 h-3.5" strokeWidth={2} />;
      case "WAITING_ROOM": return <UserCheck className="w-3.5 h-3.5" strokeWidth={2} />;
      case "IN_PROGRESS": return <PlayCircle className="w-3.5 h-3.5" strokeWidth={2} />;
      case "PENDING_PAYMENT": return <Timer className="w-3.5 h-3.5" strokeWidth={2} />;
      default: return <XCircle className="w-3.5 h-3.5" strokeWidth={2} />;
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

  const todayCompletedAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.startTime).toDateString();
    const today = new Date().toDateString();
    return apptDate === today && normalizeStatus(appt.status) === "COMPLETED";
  });

  const getDiffMinutes = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return null;
    try {
      const cleanStart = startStr.replace(/\.\d+/, '');
      const cleanEnd = endStr.replace(/\.\d+/, '');
      const s = new Date(cleanStart).getTime();
      const e = new Date(cleanEnd).getTime();
      if (isNaN(s) || isNaN(e)) return null;
      const diff = Math.floor((e - s) / 60000);
      return diff > 0 ? diff : 0;
    } catch {
      return null;
    }
  };

  const waitTimes = todayCompletedAppointments.map(a => getDiffMinutes(a.arrivedAt, a.startedAt)).filter(v => v !== null) as number[];
  const avgWaitTime = waitTimes.length ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0;

  const consultationTimes = todayCompletedAppointments.map(a => getDiffMinutes(a.startedAt, a.completedAt)).filter(v => v !== null) as number[];
  const avgConsultationTime = consultationTimes.length ? Math.round(consultationTimes.reduce((a, b) => a + b, 0) / consultationTimes.length) : 0;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <QhSpinner size="md" />
        <p className="text-[10px] uppercase font-bold tracking-widest mt-6 animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto px-4 md:px-6">
      {/* 1. Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-black dark:border-white">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold uppercase tracking-wide text-black dark:text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 md:w-10 md:h-10" strokeWidth={2} />
            {t('title')}
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mt-2">
            {t('subtitle')}
          </p>
        </div>
        <div>
          <Button onClick={() => setIsNewAppointmentModalOpen(true)} className="w-full md:w-auto h-12 px-6 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest transition-all">
            <Zap className="w-4 h-4 mr-2" strokeWidth={2} />{t('quick_actions.new_appointment')}
          </Button>
        </div>
      </div>

      {/* 2. Dashboard Analytics: Tiempos Promedio del Día */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white rounded-none p-5 flex flex-col justify-between shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black dark:border-white">
            <Timer className="w-4 h-4 text-black dark:text-white" strokeWidth={2} />
            <span className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">{t('avg_wait_today', { defaultValue: 'Promedio Espera (Hoy)' })}</span>
          </div>
          <p className="text-4xl font-serif font-bold text-black dark:text-white uppercase">
            {avgWaitTime} <span className="text-sm tracking-widest">MIN</span>
          </p>
        </div>
        <div className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white rounded-none p-5 flex flex-col justify-between shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black dark:border-white">
            <PlayCircle className="w-4 h-4 text-black dark:text-white" strokeWidth={2} />
            <span className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">{t('avg_consultation_today', { defaultValue: 'Promedio Consulta (Hoy)' })}</span>
          </div>
          <p className="text-4xl font-serif font-bold text-black dark:text-white uppercase">
            {avgConsultationTime} <span className="text-sm tracking-widest">MIN</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b-2 border-black dark:border-white pb-6">
          <TabsList className="bg-transparent space-x-2 p-0 h-auto">
            <TabsTrigger value="list" className="rounded-none border-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2">
              {t('view_mode.list')}
            </TabsTrigger>
            <TabsTrigger value="kanban" className="rounded-none border-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2">
              {t('view_mode.kanban')}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-none border-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2">
              {t('view_mode.calendar')}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-black dark:text-white hidden sm:block" strokeWidth={2} />
            <Button size="sm" variant="outline" onClick={() => setDateFilter('ALL')} 
              className={`rounded-none border-2 border-black dark:border-white h-8 text-[10px] font-bold uppercase tracking-widest ${dateFilter === 'ALL' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-black dark:text-white'}`}>
              {t('tabs.all')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDateFilter('TODAY')} 
              className={`rounded-none border-2 border-black dark:border-white h-8 text-[10px] font-bold uppercase tracking-widest ${dateFilter === 'TODAY' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-black dark:text-white'}`}>
              {t('tabs.today')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDateFilter('UPCOMING')} 
              className={`rounded-none border-2 border-black dark:border-white h-8 text-[10px] font-bold uppercase tracking-widest ${dateFilter === 'UPCOMING' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-black dark:text-white'}`}>
              {t('tabs.upcoming')}
            </Button>
          </div>
        </div>

        {/* VISTA DE LISTA */}
        <TabsContent value="list" className="space-y-4 m-0">
          <AnimatePresence mode="popLayout">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt, index) => {
                const currentStatus = normalizeStatus(appt.status);

                return (
                  <motion.div key={appt.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white rounded-none p-6 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] group transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff]">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center border-2 border-black dark:border-white shrink-0">
                          {appt.service?.serviceDeliveryType === 'video_call' ? <Video className="w-5 h-5" strokeWidth={2} /> : <User className="w-5 h-5" strokeWidth={2} />}
                        </div>
                        <div>
                          <h3 className="text-xl font-serif font-bold text-black dark:text-white uppercase tracking-wide leading-none mb-3">
                            {appt.service?.name || t('medical_appointment')}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border border-black dark:border-white px-2 py-1 bg-gray-50 dark:bg-gray-900">
                              {appt.consumer?.name || t('card.patient')}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border border-black dark:border-white px-2 py-1 flex items-center gap-1.5">
                              <Clock className="w-3 h-3" strokeWidth={2} />
                              {formatLocalTime(appt.startTime, "d MMM, HH:mm")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 justify-between">
                        <Badge className={`${getStatusBadgeStyle(appt.status)} border rounded-none px-3 py-1 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]`}>
                          <span className="flex items-center gap-2">{getStatusIcon(appt.status)} {getStatusText(appt.status)}</span>
                        </Badge>

                        <div className="flex flex-wrap justify-end gap-2 mt-auto pt-4">
                          {["SCHEDULED", "WAITING_ROOM", "PENDING_PAYMENT"].includes(currentStatus) && (
                            <Button size="sm" variant="outline" onClick={() => handleOpenCancelModal(appt)} className="border-2 border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none h-10 px-4 text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] transition-colors">
                              {t('actions.cancel')}
                            </Button>
                          )}

                          {currentStatus === "SCHEDULED" && (
                            <Button size="sm" onClick={() => handleUpdateStatus(appt.id, "WAITING_ROOM")} className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white rounded-none h-10 px-4 text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] transition-colors">
                              <UserCheck className="w-4 h-4 mr-2" strokeWidth={2} /> {t('actions.arrived')}
                            </Button>
                          )}

                          {["SCHEDULED", "WAITING_ROOM"].includes(currentStatus) && (
                            <Button size="sm" onClick={() => handleUpdateStatus(appt.id, "IN_PROGRESS")} className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white rounded-none h-10 px-4 text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] transition-colors animate-pulse">
                              <PlayCircle className="w-4 h-4 mr-2" strokeWidth={2} /> {t('actions.start')}
                            </Button>
                          )}

                          {currentStatus === "IN_PROGRESS" && (
                            <Button size="sm" onClick={() => handleOpenCompletionModal(appt)} className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white rounded-none h-10 px-4 text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] transition-colors">
                              <Check className="w-4 h-4 mr-2" strokeWidth={2} /> {t('actions.finish')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-black dark:border-white rounded-none bg-white dark:bg-[#0a0a0a]">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
                  {t('no_appointments_filter')}
                </p>
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* VISTA KANBAN */}
        {/* ========================================== */}
        {/* VISTA KANBAN (DRAG & DROP GLOBAL) */}
        {/* ========================================== */}
        <TabsContent value="kanban" className="m-0 overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-[1000px] items-start pt-2">
            {[
              { id: "SCHEDULED", title: t('kanban_columns.scheduled') },
              { id: "WAITING_ROOM", title: t('kanban_columns.waiting_room') },
              { id: "IN_PROGRESS", title: t('kanban_columns.in_progress') },
              { id: "COMPLETED", title: t('kanban_columns.completed') }
            ].map(column => (
              <div 
                key={column.id}
                onDrop={(e) => handleDrop(e, column.id)}
                onDragOver={handleDragOver}
                className="flex-1 min-w-[280px] bg-gray-50 dark:bg-[#111] rounded-none border-2 border-black dark:border-white flex flex-col h-[700px] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]"
              >
                {/* Cabecera de la Columna */}
                <div className={`p-4 border-b-2 border-black dark:border-white bg-white dark:bg-[#0a0a0a]`}>
                  <h3 className={`font-bold text-[10px] uppercase tracking-widest flex justify-between items-center text-black dark:text-white`}>
                    {column.title}
                    <Badge variant="secondary" className="bg-black text-white dark:bg-white dark:text-black rounded-none shadow-none border-0 text-[10px] px-2 py-0.5">
                      {filteredAppointments.filter(a => normalizeStatus(a.status) === column.id).length}
                    </Badge>
                  </h3>
                </div>

                {/* Zona de Arrastre / Contenido */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
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
                    <div className="h-full flex items-center justify-center">
                      <div className="border-2 border-dashed border-black dark:border-white p-4 w-full text-center">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
                          {t('drag_here')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="m-0 h-[600px] border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] p-4 bg-white dark:bg-[#0a0a0a]">
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