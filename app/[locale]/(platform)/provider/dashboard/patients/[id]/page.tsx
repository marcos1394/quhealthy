"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Calendar, ArrowLeft, Mail, Phone,
    FileText, Clock, Lock, Download, Activity, ClipboardList, Edit3, PlusCircle, Loader2, User
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';

// ShadCN UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { EditPatientModal } from '@/components/dashboard/EditPatientModal';
import { EditHealthProfileModal } from '@/components/dashboard/EditHealthProfileModal';

// Hooks & Services
import { usePatientDetail } from '@/hooks/usePatientDetail';
import { usePatientDirectory } from '@/hooks/usePatientDirectory';
import { appointmentService } from '@/services/appointment.service';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

const BLOOD_TYPE_LABELS: Record<string, string> = {
    A_POSITIVE: 'A+',
    A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+',
    B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+',
    AB_NEGATIVE: 'AB-',
    O_POSITIVE: 'O+',
    O_NEGATIVE: 'O-',
    UNKNOWN: 'DESCONOCIDO'
};

export default function PatientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations("DashboardPatientDetail");
    const locale = useLocale();
    const dateLocale = locale === 'es' ? es : enUS;

    const patientDirectoryId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
    
    const { profile, history, healthProfile, isLoading, isUpdating, hasAccessError, updateHealthProfile, refetch } = usePatientDetail(patientDirectoryId);
    const { requestAccess } = usePatientDirectory();
    
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isEditHealthModalOpen, setIsEditHealthModalOpen] = React.useState(false);
    const [downloadingAppointmentId, setDownloadingAppointmentId] = useState<number | null>(null);

    const hasHealthData = Boolean(
        healthProfile && (
            healthProfile.bloodType ||
            (healthProfile.allergies?.length ?? 0) > 0 ||
            (healthProfile.chronicConditions?.length ?? 0) > 0 ||
            (healthProfile.currentMedications?.length ?? 0) > 0 ||
            healthProfile.surgicalHistory ||
            healthProfile.familyHistory
        )
    );

    const handlePrintPdf = async (appointmentId: number) => {
        try {
            setDownloadingAppointmentId(appointmentId);
            const pdfBlob = await appointmentService.downloadPrescriptionPdf(appointmentId);
            const fileURL = URL.createObjectURL(pdfBlob);
            window.open(fileURL, '_blank');
            setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
        } catch (error) {
            console.error("Error al descargar PDF de la receta:", error);
            toast.error(t('error_download_pdf', { defaultValue: "ERROR EN EXTRACCIÓN DE DOCUMENTO." }));
        } finally {
            setDownloadingAppointmentId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[80vh] bg-gray-50 dark:bg-[#050505] transition-colors">
                <QhSpinner size="lg" className="text-black dark:text-white" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
                    {t("loading", { defaultValue: 'EXTRAYENDO EXPEDIENTE CLÍNICO...' })}
                </p>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] pt-8 px-6 md:px-10 pb-16 transition-colors font-sans selection:bg-gray-200 dark:selection:bg-white/20">

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto">

                {/* Comandos Superiores */}
                <div className="flex items-center justify-between pb-6 border-b border-black/20 dark:border-white/20">
                    <button 
                        onClick={() => router.back()} 
                        className="h-10 px-4 flex items-center justify-center gap-2 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> 
                        {t("back_to_list", { defaultValue: 'VOLVER AL DIRECTORIO' })}
                    </button>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 hidden sm:block">
                        ID DE SISTEMA: #{profile.id}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- COLUMNA IZQUIERDA: TARJETA DE IDENTIFICACIÓN --- */}
                    <div className="lg:col-span-1 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-none h-fit transition-colors">
                        
                        {/* Cabecera Tarjeta */}
                        <div className="p-8 border-b border-black/10 dark:border-white/10 flex flex-col items-center text-center bg-gray-50 dark:bg-[#050505]">
                            <div className="w-24 h-24 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6 overflow-hidden shrink-0">
                                {profile.isPlatformUser && profile.firstName ? (
                                    <User className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                                ) : (
                                    <span className="text-3xl font-semibold uppercase text-black dark:text-white">
                                        {profile.firstName.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none mb-3">
                                {profile.firstName} {profile.lastName}
                            </h2>
                            <div className="flex flex-wrap justify-center gap-2 mb-4">
                                {profile.isPlatformUser ? (
                                    <span className="border border-blue-500/30 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                                        {t("app_user", { defaultValue: 'USUARIO VINCULADO' })}
                                    </span>
                                ) : (
                                    <span className="border border-gray-500/30 bg-gray-50 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                                        {t("offline", { defaultValue: 'REGISTRO LOCAL' })}
                                    </span>
                                )}
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                {t("patient_since", { year: new Date(profile.createdAt).getFullYear(), defaultValue: `REGISTRADO EN ${new Date(profile.createdAt).getFullYear()}` })}
                            </p>
                        </div>

                        {/* Datos de Contacto */}
                        <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
                            <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center gap-4">
                                <Mail className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                                <span className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white truncate">
                                    {profile.email || t("no_email", { defaultValue: 'NO REGISTRADO' })}
                                </span>
                            </div>
                            <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center gap-4">
                                <Phone className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                                <span className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white">
                                    {profile.phone || t("no_phone", { defaultValue: 'NO REGISTRADO' })}
                                </span>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-[#050505]">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    disabled={profile.isPlatformUser}
                                    className="w-full h-12 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none disabled:opacity-50"
                                >
                                    {t("edit_profile", { defaultValue: 'EDITAR IDENTIFICACIÓN' })}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- COLUMNA DERECHA: PESTAÑAS Y CONTENIDO --- */}
                    <div className="lg:col-span-2 space-y-0 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors rounded-none">
                        
                        <Tabs defaultValue="history" className="w-full flex flex-col">
                            {/* Tabs Headers (Blueprint Style) */}
                            <TabsList className="flex flex-row w-full bg-gray-50 dark:bg-[#050505] border-b border-black/20 dark:border-white/20 p-0 h-auto rounded-none">
                                <TabsTrigger 
                                    value="history" 
                                    className="flex-1 rounded-none border-0 border-r border-black/20 dark:border-white/20 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 py-4 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    <Activity className="w-3.5 h-3.5" strokeWidth={1.5} /> 
                                    {t("clinical_history", { defaultValue: 'HISTORIAL OPERATIVO' })}
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="health-profile" 
                                    className="flex-1 rounded-none border-0 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 py-4 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    <ClipboardList className="w-3.5 h-3.5" strokeWidth={1.5} /> 
                                    {t("base_background", { defaultValue: 'FICHA CLÍNICA' })}
                                </TabsTrigger>
                            </TabsList>

                            {/* --- TAB: HISTORIAL CLÍNICO --- */}
                            <TabsContent value="history" className="m-0 p-0 border-0 outline-none">
                                {hasAccessError ? (
                                    <div className="p-16 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-[#050505]">
                                        <div className="w-16 h-16 border border-red-500/30 bg-red-50 dark:bg-red-900/10 flex items-center justify-center mb-6">
                                            <Lock className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-sm font-semibold uppercase tracking-tight text-red-600 dark:text-red-400 mb-2">
                                            {t("access_restricted_title", { defaultValue: 'ACCESO RESTRINGIDO' })}
                                        </h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-md mx-auto leading-relaxed mb-6">
                                            {t("access_restricted_description", { defaultValue: 'EL PACIENTE DEBE AUTORIZAR LA VISUALIZACIÓN DE SU HISTORIAL MÉDICO.' })}
                                        </p>
                                        <button
                                            onClick={() => profile.consumerId && requestAccess(profile.consumerId)}
                                            disabled={!profile.consumerId}
                                            className="h-12 px-8 bg-red-600 text-white hover:bg-red-700 transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none border-0 disabled:opacity-50"
                                        >
                                            {t("request_access", { defaultValue: 'SOLICITAR PERMISO' })}
                                        </button>
                                    </div>
                                ) : history?.timeline && history.timeline.length > 0 ? (
                                    <div className="flex flex-col bg-gray-50 dark:bg-[#050505]">
                                        {history.timeline.map((appt) => (
                                            <div key={appt.appointmentId} className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex flex-col">
                                                
                                                {/* Header del Registro */}
                                                <div className="px-6 md:px-8 py-4 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                                        <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                        {format(new Date(appt.date), "dd MMM yyyy", { locale: dateLocale })}
                                                    </div>
                                                    <span className="border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                                                        {t("status_completed", { defaultValue: 'COMPLETADO' })}
                                                    </span>
                                                </div>

                                                {/* Cuerpo del Registro */}
                                                <div className="p-6 md:p-8 flex flex-col gap-6">
                                                    <h4 className="font-semibold text-lg uppercase tracking-tight text-black dark:text-white leading-none">
                                                        {appt.serviceName}
                                                    </h4>

                                                    {appt.publicNotes && (
                                                        <div className="border-l-2 border-black/20 dark:border-white/20 pl-4 py-1">
                                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                                {t("instructions", { defaultValue: 'OBSERVACIONES / INDICACIONES' })}
                                                            </p>
                                                            <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white leading-relaxed">
                                                                {appt.publicNotes}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {appt.prescriptions && appt.prescriptions.length > 0 && (
                                                        <div className="flex flex-wrap gap-4 pt-4 border-t border-black/10 dark:border-white/10">
                                                            {appt.prescriptions.map(doc => {
                                                                const isThisPrinting = downloadingAppointmentId === appt.appointmentId;
                                                                return (
                                                                <button 
                                                                    key={doc.documentId} 
                                                                    disabled={downloadingAppointmentId !== null}
                                                                    onClick={() => handlePrintPdf(appt.appointmentId)}
                                                                    className="h-10 px-4 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none disabled:opacity-50"
                                                                >
                                                                    {isThisPrinting ? (
                                                                        <QhSpinner size="sm" className="text-current" />
                                                                    ) : (
                                                                        <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                                    )}
                                                                    {t("prescription_document", { defaultValue: 'RECETA MÉDICA' })} 
                                                                    {!isThisPrinting && <Download className="w-3 h-3 ml-2 opacity-50" strokeWidth={1.5} />}
                                                                </button>
                                                            )})}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-24 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-[#050505]">
                                        <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6">
                                            <Calendar className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            {t("empty_history", { defaultValue: 'CERO REGISTROS OPERATIVOS EN EL HISTORIAL.' })}
                                        </p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* --- TAB: FICHA CLÍNICA (ANTECEDENTES) --- */}
                            <TabsContent value="health-profile" className="m-0 p-0 border-0 outline-none flex flex-col">
                                
                                {/* Controles Ficha Clínica */}
                                <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h3 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
                                        {t("medical_background", { defaultValue: 'ANTECEDENTES MÉDICOS BASE' })}
                                    </h3>
                                    {!profile.isPlatformUser ? (
                                        <button 
                                            onClick={() => setIsEditHealthModalOpen(true)} 
                                            className="h-10 px-6 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none"
                                        >
                                            {hasHealthData ? <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} /> : <PlusCircle className="w-3.5 h-3.5" strokeWidth={1.5} />}
                                            {hasHealthData
                                                ? t("edit_background", { defaultValue: 'ACTUALIZAR FICHA' })
                                                : t("create_background", { defaultValue: 'CREAR FICHA' })}
                                        </button>
                                    ) : null}
                                </div>

                                {/* Matriz de Datos de Salud (Grid Blueprint) */}
                                <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
                                    
                                    {/* Fila 1: Signos / Física */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-b border-black/10 dark:border-white/10">
                                        <div className="p-6 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                                                {t("blood_type", { defaultValue: 'TIPO DE SANGRE' })}
                                            </p>
                                            <p className="text-lg font-semibold uppercase tracking-widest text-black dark:text-white">
                                                {healthProfile?.bloodType ? (BLOOD_TYPE_LABELS[healthProfile.bloodType] || healthProfile.bloodType) : '—'}
                                            </p>
                                        </div>
                                        <div className="p-6 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                                                {t("height", { defaultValue: 'ESTATURA' })}
                                            </p>
                                            <p className="text-lg font-semibold uppercase tracking-widest text-black dark:text-white">
                                                {healthProfile?.heightCm ? `${healthProfile.heightCm} CM` : '—'}
                                            </p>
                                        </div>
                                        <div className="p-6 flex flex-col justify-center">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                                                {t("weight", { defaultValue: 'PESO' })}
                                            </p>
                                            <p className="text-lg font-semibold uppercase tracking-widest text-black dark:text-white">
                                                {healthProfile?.weightKg ? `${healthProfile.weightKg} KG` : '—'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Fila 2: Alergias y Condiciones */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10">
                                        <div className="p-6 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10 flex flex-col">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                                                {t("allergies", { defaultValue: 'ALERGIAS' })}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {healthProfile?.allergies?.length ? healthProfile.allergies.map((allergy) => (
                                                    <span key={allergy} className="border border-red-500/30 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                                                        {allergy}
                                                    </span>
                                                )) : <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{t("no_records", { defaultValue: 'SIN REGISTRO' })}</span>}
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                                                {t("chronic_conditions", { defaultValue: 'CONDICIONES CRÓNICAS' })}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {healthProfile?.chronicConditions?.length ? healthProfile.chronicConditions.map((condition) => (
                                                    <span key={condition} className="border border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                                                        {condition}
                                                    </span>
                                                )) : <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{t("no_records", { defaultValue: 'SIN REGISTRO' })}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fila 3: Medicación */}
                                    <div className="p-6 border-b border-black/10 dark:border-white/10">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                                            {t("current_medications", { defaultValue: 'MEDICACIÓN ACTUAL' })}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {healthProfile?.currentMedications?.length ? healthProfile.currentMedications.map((medication) => (
                                                <span key={medication} className="border border-blue-500/30 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                                                    {medication}
                                                </span>
                                            )) : <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{t("no_records", { defaultValue: 'SIN REGISTRO' })}</span>}
                                        </div>
                                    </div>

                                    {/* Fila 4: Historiales Textuales */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 bg-gray-50 dark:bg-[#050505]">
                                        <div className="p-6 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                                                {t("surgical_history", { defaultValue: 'HISTORIAL QUIRÚRGICO' })}
                                            </p>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white leading-relaxed">
                                                {healthProfile?.surgicalHistory || <span className="text-gray-400 text-[9px]">{t("no_records", { defaultValue: 'SIN REGISTRO' })}</span>}
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                                                {t("family_history", { defaultValue: 'HISTORIAL FAMILIAR' })}
                                            </p>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white leading-relaxed">
                                                {healthProfile?.familyHistory || <span className="text-gray-400 text-[9px]">{t("no_records", { defaultValue: 'SIN REGISTRO' })}</span>}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                </div>

            </motion.div>

            <EditPatientModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                patient={profile}
                onUpdated={refetch}
            />
            <EditHealthProfileModal
                isOpen={isEditHealthModalOpen}
                onClose={() => setIsEditHealthModalOpen(false)}
                initialData={healthProfile}
                isSubmitting={isUpdating}
                onSave={updateHealthProfile}
            />
        </div>
    );
}