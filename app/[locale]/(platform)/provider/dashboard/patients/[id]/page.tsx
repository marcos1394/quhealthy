"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
 Calendar, ArrowLeft, Mail, Phone,
 FileText, Clock, Lock, Download, Activity, ClipboardList, Edit3, PlusCircle, Loader2, User, Paperclip
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';

// ShadCN UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { EditPatientModal } from '@/components/dashboard/EditPatientModal';
import { EditHealthProfileModal } from '@/components/dashboard/EditHealthProfileModal';
import { MedicalGrowthContainer } from '@/components/growth/MedicalGrowthContainer';
import { ActiveProblemsTable } from '@/components/provider/health-profile/ActiveProblemsTable';
import { AllergiesTable } from '@/components/provider/health-profile/AllergiesTable';
import { MedicationsTable } from '@/components/provider/health-profile/MedicationsTable';
import { ClinicalSummaryTab } from '@/components/provider/health-profile/ClinicalSummaryTab';
import { PatientBackgroundPanel } from '@/components/consultation/PatientBackgroundPanel';
import { Baby, ActivitySquare } from 'lucide-react';

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
 
 const { profile, history, healthProfile, vaultDocuments, isLoading, isUpdating, hasAccessError, updateHealthProfile, addActiveProblem, deleteActiveProblem, addAllergy, deleteAllergy, addMedication, deleteMedication, refetch } = usePatientDetail(patientDirectoryId);
 const { requestAccess } = usePatientDirectory();
 
 const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
 const [isEditHealthModalOpen, setIsEditHealthModalOpen] = React.useState(false);
 const [downloadingAppointmentId, setDownloadingAppointmentId] = useState<number | null>(null);

 const isPediatric = React.useMemo(() => {
    if (!profile?.birthDate) return false;
    const dob = new Date(profile.birthDate);
    const age_dt = new Date(Date.now() - dob.getTime());
    const age = Math.abs(age_dt.getUTCFullYear() - 1970);
    return age <= 5;
  }, [profile]);

 const combinedTimeline = React.useMemo(() => {
    const items: Array<{ type: 'APPOINTMENT' | 'VAULT_DOCUMENT'; date: Date; data: any }> = [];

    if (history?.timeline) {
      history.timeline.forEach((appt: any) => {
        items.push({
          type: 'APPOINTMENT',
          date: new Date(appt.date),
          data: appt
        });
      });
    }

    if (vaultDocuments && vaultDocuments.length > 0) {
      vaultDocuments.forEach((doc: any) => {
        items.push({
          type: 'VAULT_DOCUMENT',
          date: new Date(doc.uploadDate || doc.createdAt),
          data: doc
        });
      });
    }

    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
 }, [history?.timeline, vaultDocuments]);

 const hasHealthData = Boolean(
 healthProfile && (
 healthProfile.bloodType ||
 (healthProfile.activeProblems?.length ?? 0) > 0 ||
 (healthProfile.allergies?.length ?? 0) > 0 ||
 (healthProfile.medications?.length ?? 0) > 0 ||
 healthProfile.personalBackground ||
 healthProfile.familyBackground ||
 healthProfile.socialBackground
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
 <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
 <button 
 onClick={() => router.back()} 
 className="h-10 px-4 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-semibold rounded-xl shadow-sm"
 >
 <ArrowLeft className="w-4 h-4" strokeWidth={2} /> 
 {t("back_to_list", { defaultValue: 'Volver al Directorio' })}
 </button>
 <p className="text-sm font-semibold text-gray-500 hidden sm:block">
 ID de Sistema: #{profile.id}
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

 {/* --- COLUMNA IZQUIERDA: TARJETA DE IDENTIFICACIÓN --- */}
 <div className="lg:col-span-1 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-3xl shadow-sm h-fit overflow-hidden transition-colors">
 
 {/* Cabecera Tarjeta */}
 <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col items-center text-center bg-gray-50/50 dark:bg-[#050505]/50">
 <div className="w-24 h-24 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6 overflow-hidden shrink-0 shadow-sm">
 {profile.isPlatformUser && profile.firstName ? (
 <User className="w-8 h-8 text-gray-400" strokeWidth={2} />
 ) : (
 <span className="text-3xl font-bold text-gray-700 dark:text-gray-300">
 {profile.firstName.charAt(0)}
 </span>
 )}
 </div>
 <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
 {profile.firstName} {profile.lastName}
 </h2>
 <div className="flex flex-wrap justify-center gap-2 mb-4">
 {profile.isPlatformUser ? (
 <span className="rounded-xl border border-blue-100 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 px-3 py-1 text-xs font-semibold">
 {t("app_user", { defaultValue: 'Usuario Vinculado' })}
 </span>
 ) : (
 <span className="rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400 px-3 py-1 text-xs font-semibold">
 {t("offline", { defaultValue: 'Registro Local' })}
 </span>
 )}
 </div>
 <p className="text-xs font-medium text-gray-500 mb-4">
 {t("patient_since", { year: new Date(profile.createdAt).getFullYear(), defaultValue: `Registrado en ${new Date(profile.createdAt).getFullYear()}` })}
 </p>

 {/* NOM-024 Compliance Bar */}
 <div className="w-full max-w-[200px] flex flex-col gap-2 mt-2">
 <div className="flex justify-between items-center w-full">
 <span className="text-xs font-semibold text-gray-500">NOM-024</span>
 <span className="text-xs font-bold text-gray-900 dark:text-white">{Math.round(profile.nom024CompliancePercentage || 0)}%</span>
 </div>
 <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
 <div 
 className={cn(
 "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
 (profile.nom024CompliancePercentage || 0) >= 100 ? "bg-emerald-500" :
 (profile.nom024CompliancePercentage || 0) >= 50 ? "bg-amber-500" : "bg-red-500"
 )}
 style={{ width: `${profile.nom024CompliancePercentage || 0}%` }}
 />
 </div>
 </div>
 </div>

 {/* Datos de Contacto */}
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
 <div className="p-5 border-b border-gray-50 dark:border-gray-800/50 flex items-center gap-4">
 <Mail className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2} />
 <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
 {profile.email || t("no_email", { defaultValue: 'No registrado' })}
 </span>
 </div>
 <div className="p-5 border-b border-gray-50 dark:border-gray-800/50 flex items-center gap-4">
 <Phone className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2} />
 <span className="text-sm font-medium text-gray-900 dark:text-white">
 {profile.phone || t("no_phone", { defaultValue: 'No registrado' })}
 </span>
 </div>
 <div className="p-6 bg-gray-50/50 dark:bg-[#050505]/50">
 <button
 onClick={() => setIsEditModalOpen(true)}
 disabled={profile.isPlatformUser}
 className="w-full h-12 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
 >
 {t("edit_profile", { defaultValue: 'Editar Perfil' })}
 </button>
 </div>
 </div>
 </div>

 {/* --- COLUMNA DERECHA: PESTAÑAS Y CONTENIDO --- */}
 <div className="lg:col-span-2 space-y-0 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors rounded-3xl shadow-sm overflow-hidden">
 
 <Tabs defaultValue="summary" className="w-full flex flex-col">
 {/* Tabs Headers */}
 <div className="p-2 bg-gray-50/50 dark:bg-[#050505]/50 border-b border-gray-100 dark:border-gray-800">
 <TabsList className="flex flex-row w-full bg-transparent p-0 h-auto overflow-x-auto gap-2">
 <TabsTrigger 
 value="summary" 
 className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#111] dark:data-[state=active]:text-emerald-400 bg-transparent text-gray-500 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 min-w-[140px]"
 >
 <ActivitySquare className="w-4 h-4" strokeWidth={2} /> 
 Resumen
 </TabsTrigger>
 <TabsTrigger 
 value="history" 
 className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#111] dark:data-[state=active]:text-emerald-400 bg-transparent text-gray-500 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 min-w-[140px]"
 >
 <Activity className="w-4 h-4" strokeWidth={2} /> 
 Cronología
 </TabsTrigger>
 <TabsTrigger 
 value="health-profile" 
 className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#111] dark:data-[state=active]:text-emerald-400 bg-transparent text-gray-500 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 min-w-[140px]"
 >
 <ClipboardList className="w-4 h-4" strokeWidth={2} /> 
 {t("base_background", { defaultValue: 'Ficha Clínica' })}
 </TabsTrigger>
 {isPediatric && (
 <TabsTrigger 
 value="growth" 
 className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#111] dark:data-[state=active]:text-emerald-400 bg-transparent text-gray-500 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2"
 >
 <Baby className="w-4 h-4" strokeWidth={2} /> 
 Crecimiento
 </TabsTrigger>
 )}
 </TabsList>
 </div>

 {/* --- TAB: RESUMEN (DASHBOARD) --- */}
 <TabsContent value="summary" className="m-0 p-0 border-0 outline-none">
    <ClinicalSummaryTab healthProfile={healthProfile} history={history} />
 </TabsContent>

 {/* --- TAB: HISTORIAL CLÍNICO --- */}
 <TabsContent value="history" className="m-0 p-0 border-0 outline-none">
 {hasAccessError ? (
 <div className="p-16 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-[#050505]/50">
 <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center mb-6">
 <Lock className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={2} />
 </div>
 <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
 {t("access_restricted_title", { defaultValue: 'Acceso Restringido' })}
 </h3>
 <p className="text-sm font-medium text-gray-500 max-w-md mx-auto leading-relaxed mb-6">
 {t("access_restricted_description", { defaultValue: 'El paciente debe autorizar la visualización de su historial médico.' })}
 </p>
 <button
 onClick={() => profile.consumerId && requestAccess(profile.consumerId)}
 disabled={!profile.consumerId}
 className="h-12 px-8 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-semibold rounded-xl border-0 disabled:opacity-50 shadow-sm"
 >
 {t("request_access", { defaultValue: 'Solicitar Permiso' })}
 </button>
 </div>
 ) : combinedTimeline.length > 0 ? (
 <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505]/50 relative">
 {/* Línea vertical de la cronología */}
 <div className="absolute left-10 md:left-14 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 z-0"></div>
 
 {combinedTimeline.map((item, index) => (
 <div key={`${item.type}-${item.data.id || item.data.appointmentId || index}`} className="relative z-10 flex flex-col pt-8 pb-4">
 
 {item.type === 'APPOINTMENT' ? (
 <div className="bg-white dark:bg-[#0a0a0a] ml-16 md:ml-24 mr-6 border border-gray-100 dark:border-gray-800 flex flex-col shadow-sm rounded-3xl overflow-hidden">
 {/* Marcador cronología */}
 <div className="absolute left-[34px] md:left-[50px] mt-4 w-4 h-4 rounded-full bg-emerald-500 border-4 border-gray-50 dark:border-[#050505]"></div>
 
 {/* Header del Registro */}
 <div className="px-6 py-4 bg-gray-50/50 dark:bg-[#050505]/50 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
 <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
 <Clock className="w-4 h-4 text-emerald-500" strokeWidth={2} />
 {format(item.date, "dd MMM yyyy", { locale: dateLocale })}
 </div>
 <span className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-semibold">
 {t("status_completed", { defaultValue: 'Completado' })}
 </span>
 </div>

 {/* Cuerpo del Registro */}
 <div className="p-6 flex flex-col gap-6">
 <h4 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
 {item.data.serviceName}
 </h4>

 {item.data.publicNotes && (
 <div className="border-l-2 border-gray-200 dark:border-gray-800 pl-4 py-1">
 <p className="text-xs font-semibold text-gray-400 mb-2">
 {t("instructions", { defaultValue: 'OBSERVACIONES / INDICACIONES' })}
 </p>
 <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
 {item.data.publicNotes}
 </p>
 </div>
 )}

 {item.data.prescriptions && item.data.prescriptions.length > 0 && (
 <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
 {item.data.prescriptions.map((doc: any) => {
 const isThisPrinting = downloadingAppointmentId === item.data.appointmentId;
 return (
 <button 
 key={doc.documentId} 
 disabled={downloadingAppointmentId !== null}
 onClick={() => handlePrintPdf(item.data.appointmentId)}
 className="h-10 px-4 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#111] transition-colors text-xs font-semibold flex items-center justify-center gap-2 rounded-xl disabled:opacity-50"
 >
 {isThisPrinting ? (
 <QhSpinner size="sm" className="text-current" />
 ) : (
 <FileText className="w-4 h-4" strokeWidth={2} />
 )}
 {t("prescription_document", { defaultValue: 'Receta Médica' })} 
 {!isThisPrinting && <Download className="w-3.5 h-3.5 ml-2 opacity-50" strokeWidth={2} />}
 </button>
 )})}
 </div>
 )}
 </div>
 </div>
 ) : (
 <div className="bg-white dark:bg-[#0a0a0a] ml-16 md:ml-24 mr-6 border border-gray-100 dark:border-gray-800 flex flex-col shadow-sm rounded-3xl overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
 {/* Marcador cronología */}
 <div className="absolute left-[34px] md:left-[50px] mt-4 w-4 h-4 rounded-full bg-blue-500 border-4 border-gray-50 dark:border-[#050505]"></div>
 
 {/* Header Documento */}
 <div className="px-6 py-4 bg-gray-50/50 dark:bg-[#050505]/50 flex flex-wrap items-center justify-between gap-4">
 <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
 <Paperclip className="w-4 h-4 text-blue-500" strokeWidth={2} />
 {format(item.date, "dd MMM yyyy", { locale: dateLocale })}
 </div>
 <span className="rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 px-3 py-1 text-xs font-semibold">
 Bóveda de Salud
 </span>
 </div>
 
 {/* Contenido Documento */}
 <div className="px-6 pb-6 pt-4">
 <h4 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
 {item.data.documentType === 'MEDICAL_RECORD' ? 'Expediente Médico' : 
 item.data.documentType === 'LAB_RESULT' ? 'Estudio de Laboratorio' : 
 item.data.documentType === 'PRESCRIPTION' ? 'Receta' : 'Documento Clínico'}
 </h4>
 <p className="text-sm text-gray-500 mt-1">{item.data.fileName || item.data.title}</p>
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 ) : (
 <div className="p-24 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-[#050505]/50">
 <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-6 shadow-sm">
 <Calendar className="w-6 h-6 text-gray-400" strokeWidth={2} />
 </div>
 <p className="text-sm font-semibold text-gray-500">
 {t("empty_history", { defaultValue: 'Cero registros operativos en el historial.' })}
 </p>
 </div>
 )}
 </TabsContent>

 {/* --- TAB: FICHA CLÍNICA (ANTECEDENTES) --- */}
 <TabsContent value="health-profile" className="m-0 p-0 border-0 outline-none flex flex-col">
 
 {/* Controles Ficha Clínica */}
 <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <h3 className="text-base font-bold text-gray-900 dark:text-white">
 {t("medical_background", { defaultValue: 'Antecedentes Médicos Base' })}
 </h3>
 {!profile.isPlatformUser ? (
 <button 
 onClick={() => setIsEditHealthModalOpen(true)} 
 className="h-10 px-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-semibold flex items-center justify-center gap-2 rounded-xl shadow-sm"
 >
 {hasHealthData ? <Edit3 className="w-4 h-4" strokeWidth={2} /> : <PlusCircle className="w-4 h-4" strokeWidth={2} />}
 {hasHealthData
 ? t("edit_background", { defaultValue: 'Actualizar Ficha' })
 : t("create_background", { defaultValue: 'Crear Ficha' })}
 </button>
 ) : null}
 </div>

 {/* Matriz de Datos de Salud */}
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
 
 {/* Fila 1: Signos / Física */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-b border-gray-100 dark:border-gray-800">
 <div className="p-6 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center">
 <p className="text-xs font-semibold text-gray-500 mb-2">
 {t("blood_type", { defaultValue: 'Tipo de Sangre' })}
 </p>
 <p className="text-lg font-bold text-gray-900 dark:text-white">
 {healthProfile?.bloodType ? (BLOOD_TYPE_LABELS[healthProfile.bloodType] || healthProfile.bloodType) : '—'}
 </p>
 </div>
 <div className="p-6 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center">
 <p className="text-xs font-semibold text-gray-500 mb-2">
 {t("height", { defaultValue: 'Estatura' })}
 </p>
 <p className="text-lg font-bold text-gray-900 dark:text-white">
 {healthProfile?.heightCm ? `${healthProfile.heightCm} CM` : '—'}
 </p>
 </div>
 <div className="p-6 flex flex-col justify-center">
 <p className="text-xs font-semibold text-gray-500 mb-2">
 {t("weight", { defaultValue: 'Peso' })}
 </p>
 <p className="text-lg font-bold text-gray-900 dark:text-white">
 {healthProfile?.weightKg ? `${healthProfile.weightKg} KG` : '—'}
 </p>
 </div>
 </div>

        {/* Fila 2: Problemas Activos, Alergias, Medicación */}
 <div className="p-6 border-b border-gray-100 dark:border-gray-800">
 <ActiveProblemsTable 
 problems={healthProfile?.activeProblems || []}
 isReadOnly={profile.isPlatformUser}
 onAdd={addActiveProblem}
 onDelete={deleteActiveProblem}
 />
 <AllergiesTable 
 allergies={healthProfile?.allergies || []}
 isReadOnly={profile.isPlatformUser}
 onAdd={addAllergy}
 onDelete={deleteAllergy}
 />
 <MedicationsTable 
 medications={healthProfile?.medications || []}
 isReadOnly={profile.isPlatformUser}
 onAdd={addMedication}
 onDelete={deleteMedication}
 />
 </div>

 {/* Panel de Antecedentes (Editable) */}
 <div className="border-b border-gray-100 dark:border-gray-800">
 <PatientBackgroundPanel 
 patientDirectoryId={patientDirectoryId} 
 />
 </div>

 </div>
 </TabsContent>
 
 {/* --- TAB: CRECIMIENTO PEDIÁTRICO --- */}
 {isPediatric && (
   <TabsContent value="growth" className="m-0 p-0 border-0 outline-none flex flex-col">
     <MedicalGrowthContainer 
       dependentId={patientDirectoryId} 
       sex={profile.gender === 'FEMALE' ? 'FEMALE' : 'MALE'} 
     />
   </TabsContent>
 )}
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