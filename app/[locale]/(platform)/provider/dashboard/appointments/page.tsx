"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-gray-on-colored-background */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */;
/* eslint-disable react-doctor/js-combine-iterations */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Check, User, Clock, Calendar, Activity, CheckCircle2, XCircle, Timer, Phone, MessageSquare, Star, Zap, X, Video, Heart, Sparkles, Award, PlayCircle, UserCheck, Filter } from "lucide-react";
import { format } from "date-fns"; 
import { es } from "date-fns/locale";
// Agrega esto a tus importaciones
import { MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProviderLocations } from "@/hooks/useProviderLocations";

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
import { cn } from "@/lib/utils";

export default function ProviderAppointmentsPage() {
 const router = useRouter();
 const { appointments, setAppointments, isLoading, refetch } = useProviderAppointments();
 const t = useTranslations('DashboardAppointments');

 // 🚀 FASE 2.3: Hook de ubicaciones
 const { locations, fetchLocations, isLoading: isLoadingLocations } = useProviderLocations();
 const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

 React.useEffect(() => {
 fetchLocations();
 }, [fetchLocations]);

 // Autoseleccionar la sede principal por defecto
 React.useEffect(() => {
 if (locations.length > 0 && !selectedLocationId) {
 const mainLoc = locations.find(l => l.isMain) || locations[0];
 setSelectedLocationId(mainLoc.id);
 }
 }, [locations, selectedLocationId]);

 const [{ isCompleteModalOpen, isNewAppointmentModalOpen, selectedAppointment, cancelModalState, isCanceling, dateFilter, draggedApptId }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_ISCOMPLETEMODALOPEN': return { ...state, isCompleteModalOpen: typeof action.payload === 'function' ? action.payload(state.isCompleteModalOpen) : action.payload };
 case 'SET_ISNEWAPPOINTMENTMODALOPEN': return { ...state, isNewAppointmentModalOpen: typeof action.payload === 'function' ? action.payload(state.isNewAppointmentModalOpen) : action.payload };
 case 'SET_SELECTEDAPPOINTMENT': return { ...state, selectedAppointment: typeof action.payload === 'function' ? action.payload(state.selectedAppointment) : action.payload };
 case 'SET_CANCELMODALSTATE': return { ...state, cancelModalState: typeof action.payload === 'function' ? action.payload(state.cancelModalState) : action.payload };
 case 'SET_ISCANCELING': return { ...state, isCanceling: typeof action.payload === 'function' ? action.payload(state.isCanceling) : action.payload };
 case 'SET_DATEFILTER': return { ...state, dateFilter: typeof action.payload === 'function' ? action.payload(state.dateFilter) : action.payload };
 case 'SET_DRAGGEDAPPTID': return { ...state, draggedApptId: typeof action.payload === 'function' ? action.payload(state.draggedApptId) : action.payload };
 default: return state;
 }
 },
 {
 isCompleteModalOpen: false, isNewAppointmentModalOpen: false, selectedAppointment: null, cancelModalState: { isOpen: false, appointment: null }, isCanceling: false, dateFilter: 'ALL', draggedApptId: null
 }
 );

 const setIsCompleteModalOpen = (val: any) => dispatch({ type: 'SET_ISCOMPLETEMODALOPEN', payload: val });
 const setIsNewAppointmentModalOpen = (val: any) => dispatch({ type: 'SET_ISNEWAPPOINTMENTMODALOPEN', payload: val });
 const setSelectedAppointment = (val: any) => dispatch({ type: 'SET_SELECTEDAPPOINTMENT', payload: val });
 const setCancelModalState = (val: any) => dispatch({ type: 'SET_CANCELMODALSTATE', payload: val });
 const setIsCanceling = (val: any) => dispatch({ type: 'SET_ISCANCELING', payload: val });
 const setDateFilter = (val: any) => dispatch({ type: 'SET_DATEFILTER', payload: val });
 const setDraggedApptId = (val: any) => dispatch({ type: 'SET_DRAGGEDAPPTID', payload: val });


 const normalizeStatus = (status: string) => {
 if (!status) return "SCHEDULED";
 const s = status.toUpperCase();
 if (s === "CONFIRMED") return "SCHEDULED"; 
 if (s === "PENDING") return "SCHEDULED"; 
 return s;
 };

 const translateStatus = (status: string) => {
 switch (status) {
 case "WAITING_ROOM": return "SALA DE ESPERA";
 case "IN_PROGRESS": return "EN PROGRESO";
 case "COMPLETED": return "COMPLETADA";
 case "SCHEDULED": return "PROGRAMADA";
 case "CONFIRMED": return "CONFIRMADA";
 default: return status;
 }
 };

 const handleOpenCancelModal = (appointment: ProviderAppointment) => setCancelModalState({ isOpen: true, appointment });

 const handleConfirmCancel = async () => {
 if (!cancelModalState.appointment) return;
 setIsCanceling(true);
 try {
 await appointmentService.cancelAppointment(cancelModalState.appointment.id, "Cancelada desde agenda");
 toast.success(t('toast_cancelled_success', { defaultValue: 'CITA ANULADA CON ÉXITO' }), { theme: "colored" });
 setAppointments(prev => prev.map(a => a.id === cancelModalState.appointment?.id ? { ...a, status: "CANCELED_BY_PROVIDER" } : a));
 setCancelModalState({ isOpen: false, appointment: null });
 } catch (error) { 
 handleApiError(error); 
 } finally { 
 setIsCanceling(false); 
 }
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
 toast.success(`ESTADO ACTUALIZADO: ${translateStatus(newStatus)}`, { theme: "colored" });
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
 case "COMPLETED": return "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400";
 case "SCHEDULED": return "border-black/20 bg-gray-50 text-black dark:bg-[#050505] dark:text-white dark:border-white/20";
 case "WAITING_ROOM": return "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400";
 case "IN_PROGRESS": return "border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400 animate-pulse";
 case "PENDING_PAYMENT": return "border-purple-500/30 bg-purple-50 text-purple-700 dark:bg-purple-900/10 dark:text-purple-400";
 case "CANCELED_BY_CONSUMER":
 case "CANCELED_BY_PROVIDER": return "border-red-500/30 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400 line-through opacity-70";
 default: return "border-gray-500/30 bg-gray-50 text-gray-600 dark:bg-gray-900/10 dark:text-gray-400";
 }
 };

 const getStatusIcon = (status: string) => {
 switch (normalizeStatus(status)) {
 case "COMPLETED": return <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />;
 case "SCHEDULED": return <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />;
 case "WAITING_ROOM": return <UserCheck className="w-3.5 h-3.5" strokeWidth={1.5} />;
 case "IN_PROGRESS": return <PlayCircle className="w-3.5 h-3.5" strokeWidth={1.5} />;
 case "PENDING_PAYMENT": return <Timer className="w-3.5 h-3.5" strokeWidth={1.5} />;
 default: return <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />;
 }
 };

 const getStatusText = (status: string) => {
 switch (normalizeStatus(status)) {
 case "COMPLETED": return t('card.completed', { defaultValue: 'FINALIZADO' });
 case "SCHEDULED": return t('card.scheduled', { defaultValue: 'PROGRAMADO' });
 case "WAITING_ROOM": return t('card.waiting_room', { defaultValue: 'ESPERA' });
 case "IN_PROGRESS": return t('card.in_progress', { defaultValue: 'ACTIVO' });
 case "PENDING_PAYMENT": return t('card.pending_payment', { defaultValue: 'PAGO PENDIENTE' });
 case "CANCELED_BY_CONSUMER": return t('card.cancelled_by_patient', { defaultValue: 'ANULADO (PACIENTE)' });
 case "CANCELED_BY_PROVIDER": return t('card.cancelled_by_you', { defaultValue: 'ANULADO (PROVEEDOR)' });
 default: return status;
 }
 };

 // Y MODIFÍCALA ASÍ:
 const filteredAppointments = appointments.filter(appt => {
 if (selectedLocationId && appt.locationId && appt.locationId !== selectedLocationId) return false;

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
 <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20">
 <QhSpinner size="lg" className="text-black dark:text-white" />
 <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-6 animate-pulse">
 {t('loading', { defaultValue: 'SINCRONIZANDO AGENDA...' })}
 </p>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-8 font-sans transition-colors duration-500 selection:bg-gray-200 dark:selection:bg-white/20">
 <div className="max-w-7xl mx-auto space-y-8">
 
 {/* --- HEADER ARQUITECTÓNICO --- */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
 <div className="flex items-start gap-5">
 <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
 <Calendar className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
 Motor Operativo
 </p>
 <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
 {t('title', { defaultValue: 'SISTEMA DE CITAS' })}
 </h1>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 {t('subtitle', { defaultValue: 'AGENDA, TIEMPOS Y CONTROL CLÍNICO.' })}
 </p>
 </div>
 </div>
 <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
 {/* 🚀 FASE 2.3: SELECTOR DE SEDE */}
 <div className="w-full sm:w-64">
 <Select 
 value={selectedLocationId?.toString()} 
 onValueChange={(val) => setSelectedLocationId(Number(val))}
 disabled={isLoadingLocations || locations.length === 0}
 >
 <SelectTrigger className="h-12 rounded-none border-black dark:border-white font-bold text-[10px] uppercase tracking-widest bg-transparent">
 <div className="flex items-center gap-2">
 <MapPin className="w-4 h-4" />
 <SelectValue placeholder="Seleccionar Sede" />
 </div>
 </SelectTrigger>
 <SelectContent className="rounded-none border-black dark:border-white z-50">
 {locations.map(loc => (
 <SelectItem 
 key={loc.id} 
 value={loc.id.toString()}
 className="text-[10px] font-bold uppercase tracking-widest cursor-pointer"
 >
 {loc.name} {loc.isMain ? '(Principal)' : ''}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <button 
 onClick={() => setIsNewAppointmentModalOpen(true)} 
 className="w-full md:w-auto h-12 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none border-0"
 >
 <Zap className="w-4 h-4" strokeWidth={1.5} /> {t('quick_actions.new_appointment', { defaultValue: 'NUEVO REGISTRO' })}
 </button>
 </div>
 </div>

 {/* --- MÉTRICAS DEL DÍA (GRID BLUEPRINT) --- */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
 <div className="p-6 md:p-8 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] group hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">
 <div className="flex items-center gap-2 mb-2">
 <Timer className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
 {t('avg_wait_today', { defaultValue: 'TIEMPO DE ESPERA (HOY)' })}
 </span>
 </div>
 <p className="text-3xl font-semibold tracking-tight text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors leading-none">
 {avgWaitTime} <span className="text-sm font-bold text-gray-400 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors tracking-widest ml-1">MIN</span>
 </p>
 </div>
 <div className="p-6 md:p-8 flex flex-col justify-center bg-white dark:bg-[#0a0a0a] group hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">
 <div className="flex items-center gap-2 mb-2">
 <PlayCircle className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
 {t('avg_consultation_today', { defaultValue: 'TIEMPO CONSULTA (HOY)' })}
 </span>
 </div>
 <p className="text-3xl font-semibold tracking-tight text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors leading-none">
 {avgConsultationTime} <span className="text-sm font-bold text-gray-400 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors tracking-widest ml-1">MIN</span>
 </p>
 </div>
 </div>

 {/* --- SISTEMA DE PESTAÑAS (TABS Y FILTROS) --- */}
 <Tabs defaultValue="list" className="w-full flex flex-col border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] rounded-none transition-colors">
 
 <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
 <TabsList className="flex flex-row w-full md:w-auto bg-transparent border-0 p-0 h-auto rounded-none justify-start shrink-0">
 <TabsTrigger 
 value="list" 
 className="flex-1 md:flex-none md:w-32 rounded-none border-0 border-b md:border-b-0 border-r border-black/20 dark:border-white/20 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 h-12 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center"
 >
 {t('view_mode.list', { defaultValue: 'LISTA' })}
 </TabsTrigger>
 <TabsTrigger 
 value="kanban" 
 className="flex-1 md:flex-none md:w-32 rounded-none border-0 border-b md:border-b-0 border-r border-black/20 dark:border-white/20 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 h-12 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center"
 >
 {t('view_mode.kanban', { defaultValue: 'KANBAN' })}
 </TabsTrigger>
 <TabsTrigger 
 value="calendar" 
 className="flex-1 md:flex-none md:w-32 rounded-none border-0 border-b md:border-b-0 md:border-r border-black/20 dark:border-white/20 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 h-12 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center"
 >
 {t('view_mode.calendar', { defaultValue: 'CALENDARIO' })}
 </TabsTrigger>
 </TabsList>

 <div className="flex items-center gap-0 w-full md:w-auto">
 <div className="h-12 w-12 flex items-center justify-center border-r border-black/20 dark:border-white/20 shrink-0">
 <Filter className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
 </div>
 <button 
 onClick={() => setDateFilter('ALL')} 
 className={cn(
 "flex-1 md:flex-none h-12 px-4 border-r border-black/20 dark:border-white/20 transition-colors text-[9px] font-bold uppercase tracking-widest",
 dateFilter === 'ALL' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-gray-500 hover:bg-white dark:hover:bg-[#111]'
 )}
 >
 {t('tabs.all', { defaultValue: 'TODAS' })}
 </button>
 <button 
 onClick={() => setDateFilter('TODAY')} 
 className={cn(
 "flex-1 md:flex-none h-12 px-4 border-r border-black/20 dark:border-white/20 transition-colors text-[9px] font-bold uppercase tracking-widest",
 dateFilter === 'TODAY' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-gray-500 hover:bg-white dark:hover:bg-[#111]'
 )}
 >
 {t('tabs.today', { defaultValue: 'HOY' })}
 </button>
 <button 
 onClick={() => setDateFilter('UPCOMING')} 
 className={cn(
 "flex-1 md:flex-none h-12 px-4 transition-colors text-[9px] font-bold uppercase tracking-widest",
 dateFilter === 'UPCOMING' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-gray-500 hover:bg-white dark:hover:bg-[#111]'
 )}
 >
 {t('tabs.upcoming', { defaultValue: 'FUTURAS' })}
 </button>
 </div>
 </div>

 {/* VISTA DE LISTA */}
 <TabsContent value="list" className="m-0 p-0 border-none outline-none bg-gray-50 dark:bg-[#050505]">
 <AnimatePresence mode="popLayout">
 {filteredAppointments.length > 0 ? (
 <div className="flex flex-col">
 {filteredAppointments.map((appt) => {
 const currentStatus = normalizeStatus(appt.status);

 return (
 <motion.div key={appt.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
 className="bg-white dark:bg-[#0a0a0a] border-b border-black/10 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer"
 >
 <div className="flex items-start md:items-center gap-5">
 <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-gray-500 group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black transition-colors flex items-center justify-center shrink-0">
 {appt.service?.serviceDeliveryType === 'video_call' ? <Video className="w-5 h-5" strokeWidth={1.5} /> : <User className="w-5 h-5" strokeWidth={1.5} />}
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-3 mb-1.5">
 <h3 className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors leading-none">
 {appt.service?.name || t('medical_appointment', { defaultValue: 'CONSULTA MÉDICA' })}
 </h3>
 <span className={cn(
 "px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border flex items-center gap-1.5 w-fit",
 getStatusBadgeStyle(appt.status)
 )}>
 {getStatusIcon(appt.status)} {getStatusText(appt.status)}
 </span>
 </div>
 <div className="flex flex-wrap items-center gap-3">
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
 PACIENTE: <strong className="text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">{appt.consumer?.name || t('card.patient', { defaultValue: 'PACIENTE' })}</strong>
 </span>
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors flex items-center gap-1.5">
 <Clock className="w-3 h-3 text-gray-400 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors" strokeWidth={1.5} />
 {formatLocalTime(appt.startTime, "dd MMM yyyy, HH:mm")}
 </span>
 </div>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end">
 {["SCHEDULED", "WAITING_ROOM", "PENDING_PAYMENT"].includes(currentStatus) && (
 <button onClick={() => handleOpenCancelModal(appt)} className="h-10 px-4 border border-black/20 dark:border-white/20 bg-transparent text-gray-500 hover:text-red-500 hover:bg-red-50 hover:border-red-500/30 dark:hover:bg-red-900/10 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 rounded-none flex-1 md:flex-none justify-center">
 <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('actions.cancel', { defaultValue: 'ANULAR' })}
 </button>
 )}

 {currentStatus === "SCHEDULED" && (
 <button onClick={() => handleUpdateStatus(appt.id, "WAITING_ROOM")} className="h-10 px-4 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 rounded-none flex-1 md:flex-none justify-center">
 <UserCheck className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('actions.arrived', { defaultValue: 'LLEGÓ' })}
 </button>
 )}

 {["SCHEDULED", "WAITING_ROOM"].includes(currentStatus) && (
 <button onClick={() => handleUpdateStatus(appt.id, "IN_PROGRESS")} className="h-10 px-4 bg-black text-white dark:bg-white dark:text-black group-hover:bg-transparent group-hover:border group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border-0 rounded-none flex-1 md:flex-none justify-center animate-pulse">
 <PlayCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('actions.start', { defaultValue: 'INICIAR' })}
 </button>
 )}

 {currentStatus === "IN_PROGRESS" && (
 <button onClick={() => handleOpenCompletionModal(appt)} className="h-10 px-4 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border-0 rounded-none flex-1 md:flex-none justify-center">
 <Check className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('actions.finish', { defaultValue: 'FINALIZAR' })}
 </button>
 )}
 </div>
 </motion.div>
 );
 })}
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-[#0a0a0a]">
 <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
 <Calendar className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
 </div>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs leading-relaxed">
 {t('no_appointments_filter', { defaultValue: 'CERO REGISTROS ENCONTRADOS BAJO LOS FILTROS ACTUALES.' })}
 </p>
 </div>
 )}
 </AnimatePresence>
 </TabsContent>

 {/* VISTA KANBAN */}
 <TabsContent value="kanban" className="m-0 p-0 border-none outline-none overflow-x-auto bg-gray-50 dark:bg-[#050505] custom-scrollbar pb-6">
 <div className="flex gap-0 min-w-[1200px] h-[70vh] border-b border-black/10 dark:border-white/10">
 {[
 { id: "SCHEDULED", title: t('kanban_columns.scheduled', { defaultValue: 'PROGRAMADAS' }) },
 { id: "WAITING_ROOM", title: t('kanban_columns.waiting_room', { defaultValue: 'ESPERANDO' }) },
 { id: "IN_PROGRESS", title: t('kanban_columns.in_progress', { defaultValue: 'ACTIVOS' }) },
 { id: "COMPLETED", title: t('kanban_columns.completed', { defaultValue: 'FINALIZADOS' }) }
 ].map((column, colIdx) => (
 <div 
 key={column.id}
 onDrop={(e) => handleDrop(e, column.id)}
 onDragOver={handleDragOver}
 className={cn(
 "flex-1 min-w-[300px] flex flex-col bg-white dark:bg-[#0a0a0a]",
 colIdx !== 3 && "border-r border-black/10 dark:border-white/10"
 )}
 >
 <div className="p-4 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center justify-between shrink-0">
 <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 {column.title}
 </h3>
 <span className="border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-2 py-0.5 text-[8px] font-bold text-black dark:text-white">
 {filteredAppointments.filter(a => normalizeStatus(a.status) === column.id).length}
 </span>
 </div>

 <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-gray-50/50 dark:bg-[#050505]/50">
 {filteredAppointments
 .filter(appt => normalizeStatus(appt.status) === column.id)
 .map(appt => (
 /* Asumiendo que KanbanCard puede recibir className o se adaptará, 
 lo renderizamos. Si KanbanCard usa estilos propios que rompen el diseño, 
 debes aplicar las mismas reglas Blueprint dentro de él. */
 <KanbanCard 
 key={appt.id}
 appt={appt}
 columnId={column.id}
 onDragStart={handleDragStart}
 onOpenCompletionModal={handleOpenCompletionModal}
 />
 ))}
 
 {filteredAppointments.filter(appt => normalizeStatus(appt.status) === column.id).length === 0 && (
 <div className="h-full flex items-center justify-center p-8 text-center border border-dashed border-black/20 dark:border-white/20 bg-transparent">
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
 {t('drag_here', { defaultValue: 'ZONA DE ARRASTRE' })}
 </span>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </TabsContent>

 {/* VISTA CALENDARIO */}
 <TabsContent value="calendar" className="m-0 p-0 border-none outline-none bg-white dark:bg-[#0a0a0a] h-[70vh]">
 {/* 🚀 Pasamos locationId y aseguramos que se recargue si cambia */}
 {selectedLocationId ? (
 <CalendarView key={`calendar-${selectedLocationId}`} locationId={selectedLocationId} />
 ) : (
 <div className="h-full flex items-center justify-center">
 <QhSpinner size="lg" />
 </div>
 )}
 </TabsContent>

 </Tabs>
 </div>

 <CompletionModal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} appointment={selectedAppointment} onComplete={() => { refetch(); setIsCompleteModalOpen(false); }} />
 <ConfirmationModal isOpen={cancelModalState.isOpen} onClose={() => setCancelModalState({ isOpen: false, appointment: null })} onConfirm={handleConfirmCancel} title="ANULAR CITA" message="ESTA ACCIÓN CANCELARÁ EL REGISTRO DE FORMA IRREVERSIBLE." isLoading={isCanceling} variant="destructive" />
 
 {/* 🚀 Pasamos locationId al Modal de Nueva Cita */}
 {selectedLocationId && (
 <NewAppointmentModal 
 isOpen={isNewAppointmentModalOpen} 
 onClose={() => setIsNewAppointmentModalOpen(false)} 
 locationId={selectedLocationId}
 onCreated={refetch} 
 />
 )}
 </div>
 );
}