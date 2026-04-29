"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Calendar, ArrowLeft, Mail, Phone,
    FileText, Clock, Lock, Download, Activity, ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { EditPatientModal } from '@/components/dashboard/EditPatientModal';
import { EditHealthProfileModal } from '@/components/dashboard/EditHealthProfileModal';

// 🚀 Hook de Arquitectura
import { usePatientDetail } from '@/hooks/usePatientDetail';
import { usePatientDirectory } from '@/hooks/usePatientDirectory';

const BLOOD_TYPE_LABELS: Record<string, string> = {
    A_POSITIVE: 'A+',
    A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+',
    B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+',
    AB_NEGATIVE: 'AB-',
    O_POSITIVE: 'O+',
    O_NEGATIVE: 'O-',
    UNKNOWN: 'Desconocido'
};

export default function PatientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations("DashboardPatientDetail");
    const locale = useLocale();
    const dateLocale = locale === 'es' ? es : enUS;

    const patientDirectoryId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
    
    // 🚀 Extraemos los datos reales
    const { profile, history, healthProfile, isLoading, isUpdating, hasAccessError, updateHealthProfile, refetch } = usePatientDetail(patientDirectoryId);
    const { requestAccess } = usePatientDirectory();
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isEditHealthModalOpen, setIsEditHealthModalOpen] = React.useState(false);

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[80vh] bg-slate-50 dark:bg-slate-950 transition-colors">
                <QhSpinner size="md" />
                <p className="text-slate-500 dark:text-slate-400 font-light mt-4">{t("loading", { defaultValue: 'Cargando expediente...' })}</p>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors">

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">

                {/* Header / Botón Atrás */}
                <div>
                    <Button variant="ghost" onClick={() => router.back()} className="pl-2 pr-4 gap-2 mb-2">
                        <ArrowLeft className="w-4 h-4" /> {t("back_to_list", { defaultValue: 'Volver al directorio' })}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* --- Columna Izquierda: Datos Personales --- */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm md:col-span-1 h-fit transition-colors rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-col items-center text-center pb-2 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            <Avatar className="w-24 h-24 mb-4 border-4 border-white dark:border-slate-900 shadow-sm mt-4">
                                <AvatarFallback className="text-3xl bg-gradient-to-br from-medical-500 to-emerald-500 text-white font-bold">
                                    {profile.firstName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-xl text-slate-900 dark:text-white tracking-tight">
                                {profile.firstName} {profile.lastName}
                            </CardTitle>
                            
                            <div className="flex gap-2 mt-2">
                                {profile.isPlatformUser ? (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none">{t("app_user")}</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-slate-500 dark:text-slate-400">{t("offline")}</Badge>
                                )}
                            </div>

                            <CardDescription className="text-slate-500 dark:text-slate-400 font-light mt-2">
                                {t("patient_since", { year: new Date(profile.createdAt).getFullYear(), defaultValue: `Paciente desde ${new Date(profile.createdAt).getFullYear()}` })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-3 text-sm font-light">
                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0 border border-slate-200 dark:border-slate-700">
                                        <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <span className="truncate">{profile.email || t("no_email")}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0 border border-slate-200 dark:border-slate-700">
                                        <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <span>{profile.phone || t("no_phone")}</span>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full mt-6"
                                onClick={() => setIsEditModalOpen(true)}
                                disabled={profile.isPlatformUser}
                            >
                                {t("edit_profile", { defaultValue: 'Editar Perfil' })}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* --- Columna Derecha: Tabs --- */}
                    <div className="md:col-span-2 space-y-6">
                        <Tabs defaultValue="history" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 h-auto">
                                <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                                    <Activity className="w-4 h-4 mr-2" /> {t("clinical_history", { defaultValue: 'Expediente Clínico' })}
                                </TabsTrigger>
                                <TabsTrigger value="health-profile" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                                    <ClipboardList className="w-4 h-4 mr-2" /> {t("base_background", { defaultValue: 'Antecedentes Base' })}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="history">
                                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-colors rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                                        <CardTitle className="flex items-center gap-2.5 text-slate-900 dark:text-white tracking-tight">
                                            <div className="p-2 bg-medical-50 dark:bg-medical-500/10 rounded-lg border border-medical-200 dark:border-medical-500/20">
                                                <Calendar className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                                            </div>
                                            {t("clinical_history", { defaultValue: 'Expediente Clínico' })}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {hasAccessError ? (
                                            <div className="text-center py-12 px-4 border border-dashed border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-2xl">
                                                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl inline-block mb-3 shadow-sm">
                                                    <Lock className="w-8 h-8 text-red-500" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("access_restricted_title")}</h3>
                                                <p className="text-slate-500 dark:text-slate-400 font-light max-w-sm mx-auto mt-2">
                                                    {t("access_restricted_description")}
                                                </p>
                                                <Button
                                                    onClick={() => profile.consumerId && requestAccess(profile.consumerId)}
                                                    disabled={!profile.consumerId}
                                                    className="mt-6 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                                >
                                                    {t("request_access")}
                                                </Button>
                                            </div>
                                        ) : history?.timeline && history.timeline.length > 0 ? (
                                            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8 py-2">
                                                {history.timeline.map((appt) => (
                                                    <div key={appt.appointmentId} className="relative pl-8">
                                                        <div className="absolute left-[-7px] top-1.5 w-3 h-3 rounded-full border-2 bg-white dark:bg-slate-900 border-emerald-500 shadow-sm z-10" />

                                                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-medical-200 dark:hover:border-medical-500/30 hover:shadow-sm transition-all group">
                                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                                                <div>
                                                                    <h4 className="font-semibold text-slate-900 dark:text-white text-lg group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">{appt.serviceName}</h4>
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-light">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        {format(new Date(appt.date), "EEEE d MMMM, yyyy", { locale: dateLocale })}
                                                                    </p>
                                                                </div>
                                                                <div className="shrink-0">
                                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 font-medium">{t("status_completed")}</Badge>
                                                                </div>
                                                            </div>

                                                            {appt.publicNotes && (
                                                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-2">{t("instructions")}</p>
                                                                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-light leading-relaxed shadow-sm">
                                                                        {appt.publicNotes}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {appt.prescriptions && appt.prescriptions.length > 0 && (
                                                                <div className="mt-4 flex gap-2 flex-wrap">
                                                                    {appt.prescriptions.map(doc => (
                                                                        <Button key={doc.documentId} variant="outline" size="sm" className="text-xs rounded-lg border-medical-200 text-medical-700 bg-medical-50 hover:bg-medical-100">
                                                                            <FileText className="w-3.5 h-3.5 mr-1.5" /> {t("prescription_document")} <Download className="w-3 h-3 ml-2 opacity-50"/>
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl inline-block mb-3 border border-slate-200 dark:border-slate-700">
                                                    <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 font-light">{t("empty_history", { defaultValue: 'Aún no hay consultas finalizadas.' })}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="health-profile">
                                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-row justify-between items-center">
                                        <CardTitle className="text-lg text-slate-900 dark:text-white">{t("medical_background", { defaultValue: 'Antecedentes Médicos' })}</CardTitle>
                                        {!profile.isPlatformUser ? (
                                            <Button variant="outline" size="sm" onClick={() => setIsEditHealthModalOpen(true)}>
                                                {t("edit_background", { defaultValue: 'Editar Antecedentes' })}
                                            </Button>
                                        ) : null}
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <p className="text-xs text-slate-500 uppercase font-bold">{t("blood_type", { defaultValue: 'Tipo de Sangre' })}</p>
                                                <p className="text-lg font-semibold text-slate-900 dark:text-white">{healthProfile?.bloodType ? (BLOOD_TYPE_LABELS[healthProfile.bloodType] || healthProfile.bloodType) : '—'}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <p className="text-xs text-slate-500 uppercase font-bold">{t("height", { defaultValue: 'Estatura' })}</p>
                                                <p className="text-lg font-semibold text-slate-900 dark:text-white">{healthProfile?.heightCm ? `${healthProfile.heightCm} cm` : '—'}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <p className="text-xs text-slate-500 uppercase font-bold">{t("weight", { defaultValue: 'Peso' })}</p>
                                                <p className="text-lg font-semibold text-slate-900 dark:text-white">{healthProfile?.weightKg ? `${healthProfile.weightKg} kg` : '—'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t("allergies", { defaultValue: 'Alergias' })}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {healthProfile?.allergies?.length ? healthProfile.allergies.map((allergy) => (
                                                    <Badge key={allergy} variant="destructive" className="bg-red-100 text-red-700 border-none">{allergy}</Badge>
                                                )) : <span className="text-sm text-slate-500">{t("no_records", { defaultValue: 'Sin registro' })}</span>}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t("chronic_conditions", { defaultValue: 'Condiciones Crónicas' })}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {healthProfile?.chronicConditions?.length ? healthProfile.chronicConditions.map((condition) => (
                                                    <Badge key={condition} variant="secondary" className="bg-amber-100 text-amber-700 border-none">{condition}</Badge>
                                                )) : <span className="text-sm text-slate-500">{t("no_records", { defaultValue: 'Sin registro' })}</span>}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t("current_medications", { defaultValue: 'Medicación Actual' })}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {healthProfile?.currentMedications?.length ? healthProfile.currentMedications.map((medication) => (
                                                    <Badge key={medication} variant="outline" className="text-slate-700 dark:text-slate-300">{medication}</Badge>
                                                )) : <span className="text-sm text-slate-500">{t("no_records", { defaultValue: 'Sin registro' })}</span>}
                                            </div>
                                        </div>

                                        {healthProfile?.surgicalHistory ? (
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t("surgical_history", { defaultValue: 'Historial Quirúrgico' })}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">{healthProfile.surgicalHistory}</p>
                                            </div>
                                        ) : null}

                                        {healthProfile?.familyHistory ? (
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t("family_history", { defaultValue: 'Historial Familiar' })}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">{healthProfile.familyHistory}</p>
                                            </div>
                                        ) : null}
                                    </CardContent>
                                </Card>
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
