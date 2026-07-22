"use client"
/* eslint-disable react-doctor/button-has-type */;

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, Settings, Link as LinkIcon, CheckCircle2, RefreshCcw, CalendarDays, Sparkles, AlertCircle, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { OperatingHoursModal } from "@/components/dashboard/OperatingHours";
import { TimeBlockModal } from "@/components/dashboard/TimeBlockModal";
import { useCalendarIntegration } from "@/hooks/useCalendarIntegration";
import { useOperatingHours } from "@/hooks/useOperatingHours";
import { useProviderLocations } from "@/hooks/useProviderLocations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QhSpinner } from '@/components/ui/QhSpinner';

function CalendarLoading() {
 const t = useTranslations('DashboardCalendar');
 return (
 <div className="min-h-[60vh] w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#050505] transition-colors">
 <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
 <p className="text-sm font-semibold text-gray-500 mt-6 animate-pulse">
 {t('loading', { defaultValue: 'Sincronizando agenda...' })}
 </p>
 </div>
 );
}

function CalendarContent() {
 const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
 const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
 const [refreshKey, setRefreshKey] = useState(0);
 const [hasConfiguredHours, setHasConfiguredHours] = useState<boolean | null>(null);
 const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
 
 const { isGoogleConnected, isCheckingGoogle, handleGoogleConnect } = useCalendarIntegration();
 const { fetchSchedules } = useOperatingHours();
 const { locations, fetchLocations, isLoading: isLoadingLocations } = useProviderLocations();
 const t = useTranslations('DashboardCalendar');

 const searchParams = useSearchParams();
 const router = useRouter();

 useEffect(() => {
 fetchLocations();
 }, [fetchLocations]);

 useEffect(() => {
 if (locations.length > 0 && !selectedLocationId) {
 const mainLocation = locations.find(location => location.isMain) || locations[0];
 setSelectedLocationId(mainLocation.id);
 }
 }, [locations, selectedLocationId]);

 useEffect(() => {
 const status = searchParams.get("calendar_status");
 const code = searchParams.get("code");

 if (status === "error") {
 toast.error(
 code === "AUTH_FAILED" 
 ? t('toast_auth_failed', { defaultValue: "ERROR DE AUTENTICACIÓN: VERIFIQUE PERMISOS DE GOOGLE." })
 : t('toast_auth_error', { defaultValue: "ERROR AL VINCULAR PROTOCOLO DE CALENDARIO." })
 );
 router.replace("/provider/dashboard/calendar", { scroll: false });
 } else if (status === "success") {
 toast.success(t('toast_auth_success', { defaultValue: "VINCULACIÓN EXTERNA ESTABLECIDA." }));
 router.replace("/provider/dashboard/calendar", { scroll: false });
 }
 }, [searchParams, router, t]);

 useEffect(() => {
 const loadHours = async () => {
 if (!selectedLocationId) return;
 const data = await fetchSchedules(selectedLocationId);
 setHasConfiguredHours(data.length > 0 && data.some(d => d.isActive));
 };
 loadHours();
 }, [fetchSchedules, refreshKey, selectedLocationId]);

 return (
 <div className="space-y-12 pb-16 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300 bg-gray-50 dark:bg-[#050505] min-h-screen pt-8">
 
 <div className="max-w-7xl mx-auto space-y-12 px-6 md:px-10">

 {/* HEADER */}
 <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
 <div className="space-y-2">
 <div className="flex items-center gap-5">
 <div className="w-16 h-16 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 shadow-sm">
 <CalendarDays className="w-7 h-7 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-500 mb-1">
 Módulo de Programación
 </p>
 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
 {t('title', { defaultValue: 'Agenda Operativa' })}
 </h1>
 <p className="text-sm font-medium text-gray-500 mt-2">
 {t('subtitle', { defaultValue: 'Control de disponibilidad y bloqueos horarios.' })}
 </p>
 </div>
 </div>
 </div>
 <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
 <div className="w-full sm:w-64">
 <Select
 value={selectedLocationId?.toString()}
 onValueChange={(value) => setSelectedLocationId(Number(value))}
 disabled={isLoadingLocations || locations.length === 0}
 >
 <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-800 font-semibold text-sm bg-white dark:bg-[#0a0a0a] shadow-sm">
 <div className="flex items-center gap-2">
 <MapPin className="w-4 h-4 text-emerald-600" strokeWidth={2} />
 <SelectValue placeholder="Seleccionar sede" />
 </div>
 </SelectTrigger>
 <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 z-50 shadow-xl">
 {locations.map(location => (
 <SelectItem
 key={location.id}
 value={location.id.toString()}
 className="text-sm font-medium cursor-pointer"
 >
 {location.name} {location.isMain ? "(Principal)" : ""}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <button 
 onClick={() => setIsHoursModalOpen(true)}
 disabled={!selectedLocationId}
 className="flex items-center justify-center gap-3 h-12 px-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-sm transition-colors shadow-sm w-full sm:w-auto"
 >
 <Clock className="w-4 h-4" strokeWidth={2} />
 {t('operating_hours', { defaultValue: 'Matriz Horaria' })}
 </button>
 <button 
 onClick={() => setIsBlockModalOpen(true)}
 disabled={!selectedLocationId}
 className="flex items-center justify-center gap-3 h-12 px-6 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-semibold text-sm border-0 transition-colors shadow-sm w-full sm:w-auto"
 >
 <Plus className="w-4 h-4" strokeWidth={2} />
 {t('block_time', { defaultValue: 'Bloquear Turno' })}
 </button>
 </div>
 </div>

 {/* ALERTA DE HORARIOS NO CONFIGURADOS */}
 <AnimatePresence>
 {hasConfiguredHours === false && (
 <motion.div 
 layout 
 initial={{ opacity: 0, height: 0 }} 
 animate={{ opacity: 1, height: "auto" }} 
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden"
 >
 <div className="border border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors shadow-sm">
 <div className="flex items-start gap-5">
 <div className="w-12 h-12 bg-white dark:bg-[#0a0a0a] text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0 border border-amber-200 rounded-2xl shadow-sm">
 <AlertCircle className="w-6 h-6" strokeWidth={2} />
 </div>
 <div>
 <h3 className="text-sm font-bold text-amber-900 dark:text-amber-50 mb-1">
 {t('missing_hours_title', { defaultValue: 'Escaparate Deshabilitado' })}
 </h3>
 <p className="text-sm font-medium text-amber-700 dark:text-amber-200/70 max-w-2xl leading-relaxed">
 {t('missing_hours_desc', { defaultValue: 'La agenda pública permanecerá bloqueada hasta establecer la matriz de disponibilidad operativa.' })}
 </p>
 </div>
 </div>
 <button 
 onClick={() => setIsHoursModalOpen(true)}
 className="w-full md:w-auto h-12 px-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm border-0 transition-colors shrink-0 flex items-center justify-center gap-3 shadow-sm"
 >
 <Clock className="w-4 h-4" strokeWidth={2} />
 {t('btn_configure_hours', { fallback: 'Configurar Matriz' })}
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* BANNER DE INTEGRACIÓN GOOGLE */}
 <AnimatePresence>
 <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
 <div className="border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors bg-white dark:bg-[#0a0a0a]">
 
 <div className="flex items-start gap-5">
 <div className="w-14 h-14 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#050505] shadow-sm flex items-center justify-center shrink-0">
 <svg className="w-6 h-6" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
 <path fill="#4285F4" d="M3 10.5v27C3 41.085 5.915 44 9.5 44h29c3.585 0 6.5-2.915 6.5-6.5v-27H3z" />
 <path fill="#1666D5" d="M3 10.5v12h42v-12H3z" />
 <path fill="#E8EAED" d="M3 10.5h42V20H3z" />
 <text x="24" y="34" fill="#1666D5" fontFamily="Arial" fontSize="16" fontWeight="bold" textAnchor="middle">31</text>
 <path fill="#EA4335" d="M9.5 4h5v9h-5z" />
 <path fill="#FBBC04" d="M33.5 4h5v9h-5z" />
 </svg>
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-3 mb-2">
 <h3 className="text-lg font-bold text-gray-900 dark:text-white">
 {t('sync_title', { defaultValue: 'Vínculo Google Calendar' })}
 </h3>
 {isGoogleConnected ? (
 <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 px-2.5 py-1 rounded-lg">
 <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
 {t('sync_active', { defaultValue: 'Sincronizado' })}
 </span>
 ) : (
 <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
 <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
 {t('sync_recommended', { defaultValue: 'Recomendado' })}
 </span>
 )}
 </div>
 <p className="text-sm font-medium text-gray-500 max-w-2xl leading-relaxed">
 {isGoogleConnected
 ? t('sync_connected_desc', { defaultValue: 'Lectura de disponibilidad externa activa para prevenir conflictos de agenda.' })
 : t('sync_disconnected_desc', { defaultValue: 'Vincule su cuenta para bloquear automáticamente horarios ocupados.' })}
 </p>
 </div>
 </div>

 <div className="shrink-0 w-full md:w-auto">
 {isCheckingGoogle ? (
 <div className="h-12 w-48 bg-gray-100 dark:bg-[#111] animate-pulse rounded-xl" />
 ) : isGoogleConnected ? (
 <button className="w-full md:w-auto flex items-center justify-center gap-3 h-12 px-6 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl font-semibold text-sm transition-colors shadow-sm">
 <Settings className="w-4 h-4" strokeWidth={2} />
 {t('settings', { defaultValue: 'Gestionar Vínculo' })}
 </button>
 ) : (
 <button 
 onClick={handleGoogleConnect}
 className="w-full md:w-auto flex items-center justify-center gap-3 h-12 px-6 bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold rounded-xl border-0 text-sm transition-colors shadow-sm"
 >
 <LinkIcon className="w-4 h-4" strokeWidth={2} />
 {t('connect_google', { defaultValue: 'Vincular Cuenta' })}
 </button>
 )}
 </div>
 </div>
 </motion.div>
 </AnimatePresence>

 {/* ÁREA DEL CALENDARIO (Contenedor Estricto) */}
 <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
 <div className="w-full relative p-4 md:p-6 flex flex-col">
 {selectedLocationId ? (
 <CalendarView key={`${refreshKey}-${selectedLocationId}`} locationId={selectedLocationId} />
 ) : (
 <div className="min-h-[50vh] flex items-center justify-center">
 <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
 </div>
 )}
 </div>
 </div>

 {/* MÉTRICAS DE ESTADO OPERATIVO */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 { label: t('metrics.operating_hours', { defaultValue: 'Matriz Horaria' }), value: t('metrics.configured', { defaultValue: 'Configurada' }), icon: Clock },
 { label: t('metrics.sync', { defaultValue: 'Sincronización' }), value: isGoogleConnected ? t('metrics.real_time', { defaultValue: 'Tiempo Real' }) : t('metrics.manual', { defaultValue: 'Manual' }), icon: RefreshCcw },
 { label: t('metrics.booking_engine', { defaultValue: 'Motor de Reservas' }), value: t('metrics.active', { defaultValue: 'Activo' }), icon: Sparkles },
 ].map((metric, i) => (
 <div key={i} className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[160px] group transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-12 h-12 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 shadow-sm">
 <metric.icon className="w-6 h-6" strokeWidth={2} />
 </div>
 <span className="text-sm font-semibold text-gray-500 transition-colors">
 {metric.label}
 </span>
 </div>
 <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none transition-colors">
 {metric.value}
 </p>
 </div>
 ))}
 </div>

 {/* MODALES OPERATIVOS */}
 {selectedLocationId && (
 <OperatingHoursModal isOpen={isHoursModalOpen} onClose={() => setIsHoursModalOpen(false)} onSaveSuccess={() => setRefreshKey(p => p + 1)} locationId={selectedLocationId} />
 )}
 <TimeBlockModal isOpen={isBlockModalOpen} onClose={() => setIsBlockModalOpen(false)} onSaveSuccess={() => setRefreshKey(p => p + 1)} />
 
 </div>
 </div>
 );
}

export default function CalendarPage() {
 return (
 <Suspense fallback={<CalendarLoading />}>
 <CalendarContent />
 </Suspense>
 );
}
