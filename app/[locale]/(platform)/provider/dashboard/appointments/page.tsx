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
import { Check, User, Clock, Calendar, Activity, CheckCircle2, XCircle, Timer, Phone, MessageSquare, Star, Zap, X, Video, Heart, Sparkles, Award, PlayCircle, UserCheck, Filter, MapPin, Search } from "lucide-react";
import { format } from "date-fns"; 
import { es } from "date-fns/locale";
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
import { useSessionStore } from '@/stores/SessionStore';

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
            toast.success(t('toast_cancelled_success', { defaultValue: 'Cita anulada con éxito' }), { theme: "colored" });
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
            toast.success(`Estado actualizado: ${translateStatus(newStatus)}`);
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
            
            // 🚀 Solo el ROLE_PROVIDER se redirige automáticamente a la consulta
            if (newStatus === "IN_PROGRESS" && useSessionStore.getState().role === 'ROLE_PROVIDER') {
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
            case "COMPLETED": return "bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
            case "SCHEDULED": return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
            case "WAITING_ROOM": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50 animate-pulse";
            case "PENDING_PAYMENT": return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50";
            case "CANCELED_BY_CONSUMER":
            case "CANCELED_BY_PROVIDER": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50 line-through opacity-80";
            default: return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
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
            case "COMPLETED": return t('card.completed', { defaultValue: 'Finalizado' });
            case "SCHEDULED": return t('card.scheduled', { defaultValue: 'Programado' });
            case "WAITING_ROOM": return t('card.waiting_room', { defaultValue: 'En Espera' });
            case "IN_PROGRESS": return t('card.in_progress', { defaultValue: 'En Progreso' });
            case "PENDING_PAYMENT": return t('card.pending_payment', { defaultValue: 'Pago Pendiente' });
            case "CANCELED_BY_CONSUMER": return t('card.cancelled_by_patient', { defaultValue: 'Anulado (Paciente)' });
            case "CANCELED_BY_PROVIDER": return t('card.cancelled_by_you', { defaultValue: 'Anulado (Proveedor)' });
            default: return status;
        }
    };

    const filteredAppointments = appointments.filter(appt => {
        if (selectedLocationId && appt.locationId && appt.locationId !== selectedLocationId) return false;

        if (dateFilter === 'ALL') return true;
        const apptDate = new Date(appt.startTime).toDateString();
        const today = new Date().toDateString();
        if (dateFilter === 'TODAY') return apptDate === today;
        if (dateFilter === 'UPCOMING') return new Date(appt.endTime) >= new Date();
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
            <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gray-50/50 dark:bg-[#0a0a0a]">
                <QhSpinner size="lg" className="text-emerald-600 mb-4" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">
                    {t('loading', { defaultValue: 'Sincronizando agenda...' })}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 dark:bg-[#0a0a0a] p-4 md:p-8 font-sans transition-colors duration-500">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                            <Calendar className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                                Motor Operativo
                            </p>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                                {t('title', { defaultValue: 'Sistema de Citas' })}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {t('subtitle', { defaultValue: 'Agenda, tiempos y control clínico.' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        {/* SELECTOR DE SEDE */}
                        <div className="w-full sm:w-64">
                            <Select 
                                value={selectedLocationId?.toString()} 
                                onValueChange={(val) => setSelectedLocationId(Number(val))}
                                disabled={isLoadingLocations || locations.length === 0}
                            >
                                <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white dark:bg-[#111] dark:border-gray-800 shadow-sm font-semibold text-sm">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-emerald-600" />
                                        <SelectValue placeholder="Seleccionar Sede" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-200 shadow-lg z-50">
                                    {locations.map(loc => (
                                        <SelectItem 
                                            key={loc.id} 
                                            value={loc.id.toString()}
                                            className="text-sm font-medium cursor-pointer rounded-lg"
                                        >
                                            {loc.name} {loc.isMain ? '(Principal)' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <button 
                            onClick={() => setIsNewAppointmentModalOpen(true)} 
                            className="w-full sm:w-auto h-11 px-6 bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm font-bold transition-colors rounded-xl shadow-sm border-0"
                        >
                            <Zap className="w-4 h-4" strokeWidth={2} /> {t('quick_actions.new_appointment', { defaultValue: 'Nueva Cita' })}
                        </button>
                    </div>
                </div>

                {/* --- MÉTRICAS DEL DÍA --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 flex flex-col justify-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Timer className="w-4 h-4" strokeWidth={2} />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                {t('avg_wait_today', { defaultValue: 'Tiempo de Espera (Hoy)' })}
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">
                            {avgWaitTime} <span className="text-sm font-semibold text-gray-400 ml-1">min</span>
                        </p>
                    </div>
                    <div className="p-6 flex flex-col justify-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <PlayCircle className="w-4 h-4" strokeWidth={2} />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                {t('avg_consultation_today', { defaultValue: 'Tiempo Consulta (Hoy)' })}
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">
                            {avgConsultationTime} <span className="text-sm font-semibold text-gray-400 ml-1">min</span>
                        </p>
                    </div>
                </div>

                {/* --- SISTEMA DE PESTAÑAS (TABS Y FILTROS) --- */}
                <Tabs defaultValue="list" className="w-full flex flex-col space-y-6">
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <TabsList className="bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl h-auto flex flex-row">
                            <TabsTrigger 
                                value="list" 
                                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm px-6 py-2.5 text-sm font-semibold transition-all text-gray-500 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                            >
                                {t('view_mode.list', { defaultValue: 'Lista' })}
                            </TabsTrigger>
                            <TabsTrigger 
                                value="kanban" 
                                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm px-6 py-2.5 text-sm font-semibold transition-all text-gray-500 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                            >
                                {t('view_mode.kanban', { defaultValue: 'Tablero' })}
                            </TabsTrigger>
                            <TabsTrigger 
                                value="calendar" 
                                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm px-6 py-2.5 text-sm font-semibold transition-all text-gray-500 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                            >
                                {t('view_mode.calendar', { defaultValue: 'Calendario' })}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
                            <div className="pl-3 pr-2 flex items-center justify-center">
                                <Filter className="w-4 h-4 text-gray-400" strokeWidth={2} />
                            </div>
                            <button 
                                onClick={() => setDateFilter('ALL')} 
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                                    dateFilter === 'ALL' ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                )}
                            >
                                {t('tabs.all', { defaultValue: 'Todas' })}
                            </button>
                            <button 
                                onClick={() => setDateFilter('TODAY')} 
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                                    dateFilter === 'TODAY' ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                )}
                            >
                                {t('tabs.today', { defaultValue: 'Hoy' })}
                            </button>
                            <button 
                                onClick={() => setDateFilter('UPCOMING')} 
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                                    dateFilter === 'UPCOMING' ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                )}
                            >
                                {t('tabs.upcoming', { defaultValue: 'Futuras' })}
                            </button>
                        </div>
                    </div>

                    {/* VISTA DE LISTA */}
                    <TabsContent value="list" className="m-0 focus-visible:outline-none">
                        <AnimatePresence mode="popLayout">
                            {filteredAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredAppointments.map((appt) => {
                                        const currentStatus = normalizeStatus(appt.status);

                                        return (
                                            <motion.div key={appt.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start md:items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 flex items-center justify-center shrink-0">
                                                        {appt.service?.serviceDeliveryType === 'video_call' ? <Video className="w-5 h-5" strokeWidth={1.5} /> : <User className="w-5 h-5" strokeWidth={1.5} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-3 mb-1.5">
                                                            <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                                                {appt.service?.name || t('medical_appointment', { defaultValue: 'Consulta Médica' })}
                                                            </h3>
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 w-fit shadow-sm",
                                                                getStatusBadgeStyle(appt.status)
                                                            )}>
                                                                {getStatusIcon(appt.status)} {getStatusText(appt.status)}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="font-semibold">{t('card.patient', { defaultValue: 'Paciente' })}:</span> 
                                                                <span className="text-gray-900 dark:text-gray-300 font-medium">{appt.consumer?.name || '---'}</span>
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock className="w-4 h-4 text-gray-400" strokeWidth={2} />
                                                                {formatLocalTime(appt.startTime, "dd MMM yyyy, HH:mm")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end pt-4 md:pt-0 md:border-l border-gray-100 dark:border-gray-800 md:pl-6">
                                                    {["SCHEDULED", "WAITING_ROOM", "PENDING_PAYMENT"].includes(currentStatus) && (
                                                        <button onClick={() => handleOpenCancelModal(appt)} className="h-10 px-4 bg-white border border-gray-200 dark:bg-transparent dark:border-gray-700 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors text-sm font-semibold flex items-center gap-2 rounded-xl flex-1 md:flex-none justify-center shadow-sm">
                                                            <XCircle className="w-4 h-4" strokeWidth={2} /> {t('actions.cancel', { defaultValue: 'Anular' })}
                                                        </button>
                                                    )}

                                                    {currentStatus === "SCHEDULED" && (
                                                        <button onClick={() => handleUpdateStatus(appt.id, "WAITING_ROOM")} className="h-10 px-4 bg-white border border-gray-200 dark:bg-[#111] dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-semibold flex items-center gap-2 rounded-xl flex-1 md:flex-none justify-center shadow-sm">
                                                            <UserCheck className="w-4 h-4" strokeWidth={2} /> {t('actions.arrived', { defaultValue: 'Llegó' })}
                                                        </button>
                                                    )}

                                                    {["SCHEDULED", "WAITING_ROOM"].includes(currentStatus) && (
                                                        <button onClick={() => handleUpdateStatus(appt.id, "IN_PROGRESS")} className="h-10 px-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center gap-2 rounded-xl flex-1 md:flex-none justify-center shadow-sm">
                                                            <PlayCircle className="w-4 h-4" strokeWidth={2} /> {t('actions.start', { defaultValue: 'Iniciar' })}
                                                        </button>
                                                    )}

                                                    {currentStatus === "IN_PROGRESS" && (
                                                        <button onClick={() => handleOpenCompletionModal(appt)} className="h-10 px-4 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-semibold flex items-center gap-2 rounded-xl flex-1 md:flex-none justify-center shadow-sm">
                                                            <Check className="w-4 h-4" strokeWidth={2} /> {t('actions.finish', { defaultValue: 'Finalizar' })}
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm">
                                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                                        <Calendar className="w-6 h-6 text-gray-400" strokeWidth={2} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No hay citas</h3>
                                    <p className="text-sm font-medium text-gray-500 max-w-sm leading-relaxed">
                                        {t('no_appointments_filter', { defaultValue: 'Cero registros encontrados bajo los filtros actuales.' })}
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </TabsContent>

                    {/* VISTA KANBAN */}
                    <TabsContent value="kanban" className="m-0 focus-visible:outline-none overflow-x-auto bg-gray-50/50 dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 p-4 min-h-[70vh]">
                        <div className="flex gap-4 min-w-[1200px] h-full">
                            {[
                                { id: "SCHEDULED", title: t('kanban_columns.scheduled', { defaultValue: 'Programadas' }) },
                                { id: "WAITING_ROOM", title: t('kanban_columns.waiting_room', { defaultValue: 'Esperando' }) },
                                { id: "IN_PROGRESS", title: t('kanban_columns.in_progress', { defaultValue: 'Activos' }) },
                                { id: "COMPLETED", title: t('kanban_columns.completed', { defaultValue: 'Finalizados' }) }
                            ].map((column) => (
                                <div 
                                    key={column.id}
                                    onDrop={(e) => handleDrop(e, column.id)}
                                    onDragOver={handleDragOver}
                                    className="flex-1 min-w-[300px] flex flex-col bg-gray-100/50 dark:bg-gray-900/30 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
                                >
                                    <div className="p-4 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 shadow-sm z-10">
                                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            {column.title}
                                        </h3>
                                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-md text-xs font-bold">
                                            {filteredAppointments.filter(a => normalizeStatus(a.status) === column.id).length}
                                        </span>
                                    </div>

                                    <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                                        {filteredAppointments
                                            .filter(appt => normalizeStatus(appt.status) === column.id)
                                            .map(appt => (
                                                <KanbanCard 
                                                    key={appt.id}
                                                    appt={appt}
                                                    columnId={column.id}
                                                    onDragStart={handleDragStart}
                                                    onOpenCompletionModal={handleOpenCompletionModal}
                                                />
                                            ))}
                                        
                                        {filteredAppointments.filter(appt => normalizeStatus(appt.status) === column.id).length === 0 && (
                                            <div className="h-32 mt-4 mx-2 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-transparent">
                                                <Search className="w-5 h-5 text-gray-400 mb-2" />
                                                <span className="text-xs font-semibold text-gray-400">
                                                    {t('drag_here', { defaultValue: 'Arrastra aquí' })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* VISTA CALENDARIO */}
                    <TabsContent value="calendar" className="m-0 focus-visible:outline-none bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 h-[70vh]">
                        {selectedLocationId ? (
                            <CalendarView key={`calendar-${selectedLocationId}`} locationId={selectedLocationId} />
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <QhSpinner size="lg" className="text-emerald-600" />
                            </div>
                        )}
                    </TabsContent>

                </Tabs>
            </div>

            <CompletionModal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} appointment={selectedAppointment} onComplete={() => { refetch(); setIsCompleteModalOpen(false); }} />
            <ConfirmationModal isOpen={cancelModalState.isOpen} onClose={() => setCancelModalState({ isOpen: false, appointment: null })} onConfirm={handleConfirmCancel} title="Anular Cita" message="Esta acción cancelará el registro de forma irreversible." isLoading={isCanceling} variant="destructive" />
            
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