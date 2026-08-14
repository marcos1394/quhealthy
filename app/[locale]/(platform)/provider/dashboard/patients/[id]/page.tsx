"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Clock,
  Lock,
  Download,
  Activity,
  ClipboardList,
  Edit3,
  PlusCircle,
  User,
  Paperclip,
  Baby,
  ActivitySquare,
} from "lucide-react";
import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";

// ShadCN UI & Custom UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";

// Modales y Contenedores
import { EditPatientModal } from "@/components/dashboard/EditPatientModal";
import { EditHealthProfileModal } from "@/components/dashboard/EditHealthProfileModal";
import { MedicalGrowthContainer } from "@/components/growth/MedicalGrowthContainer";
import { ActiveProblemsTable } from "@/components/provider/health-profile/ActiveProblemsTable";
import { AllergiesTable } from "@/components/provider/health-profile/AllergiesTable";
import { MedicationsTable } from "@/components/provider/health-profile/MedicationsTable";
import { ClinicalSummaryTab } from "@/components/provider/health-profile/ClinicalSummaryTab";
import { PatientBackgroundPanel } from "@/components/consultation/PatientBackgroundPanel";
import { ProviderInternalNotesTab } from "@/components/provider/health-profile/ProviderInternalNotesTab";

// Hooks & Services
import { usePatientDetail } from "@/hooks/usePatientDetail";
import { usePatientDirectory } from "@/hooks/usePatientDirectory";
import { appointmentService } from "@/services/appointment.service";
import { cn } from "@/lib/utils";

const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
  UNKNOWN: "DESCONOCIDO",
};

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("DashboardPatientDetail");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;

  const patientDirectoryId = Number(
    Array.isArray(params.id) ? params.id[0] : params.id
  );

  const {
    profile,
    history,
    healthProfile,
    vaultDocuments,
    isLoading,
    isUpdating,
    hasAccessError,
    updateHealthProfile,
    addActiveProblem,
    deleteActiveProblem,
    addAllergy,
    deleteAllergy,
    addMedication,
    deleteMedication,
    refetch,
  } = usePatientDetail(patientDirectoryId);

  const { requestAccess } = usePatientDirectory();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditHealthModalOpen, setIsEditHealthModalOpen] = useState(false);
  const [downloadingAppointmentId, setDownloadingAppointmentId] = useState<
    number | null
  >(null);

  const isPediatric = useMemo(() => {
    if (!profile?.birthDate) return false;
    const dob = new Date(profile.birthDate);
    const age_dt = new Date(Date.now() - dob.getTime());
    const age = Math.abs(age_dt.getUTCFullYear() - 1970);
    return age <= 5;
  }, [profile]);

  const combinedTimeline = useMemo(() => {
    const items: Array<{
      type: "APPOINTMENT" | "VAULT_DOCUMENT";
      date: Date;
      data: any;
    }> = [];

    if (history?.timeline) {
      history.timeline.forEach((appt: any) => {
        items.push({
          type: "APPOINTMENT",
          date: new Date(appt.date),
          data: appt,
        });
      });
    }

    if (vaultDocuments && vaultDocuments.length > 0) {
      vaultDocuments.forEach((doc: any) => {
        items.push({
          type: "VAULT_DOCUMENT",
          date: new Date(doc.uploadDate || doc.createdAt),
          data: doc,
        });
      });
    }

    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [history?.timeline, vaultDocuments]);

  const hasHealthData = Boolean(
    healthProfile &&
      (healthProfile.bloodType ||
        (healthProfile.activeProblems?.length ?? 0) > 0 ||
        (healthProfile.allergies?.length ?? 0) > 0 ||
        (healthProfile.medications?.length ?? 0) > 0 ||
        healthProfile.personalBackground ||
        healthProfile.familyBackground ||
        healthProfile.socialBackground)
  );

  const handlePrintPdf = async (appointmentId: number) => {
    try {
      setDownloadingAppointmentId(appointmentId);
      const pdfBlob =
        await appointmentService.downloadPrescriptionPdf(appointmentId);
      const fileURL = URL.createObjectURL(pdfBlob);
      window.open(fileURL, "_blank");
      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    } catch (error) {
      console.error(error);
      toast.error(t("error_download_pdf"));
    } finally {
      setDownloadingAppointmentId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8 max-w-7xl mx-auto"
      >
        {/* ── BARRA DE COMANDOS SUPERIOR ────────────────────────────────────── */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" strokeWidth={2} />
            <span>{t("back_to_list")}</span>
          </Button>
          <span className="text-xs font-mono font-semibold text-gray-400 hidden sm:inline-block">
            ID: #{profile.id}
          </span>
        </div>

        {/* ── GRID PRINCIPAL ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ── COLUMNA IZQUIERDA: TARJETA DE IDENTIFICACIÓN Y CONTACTO ─────── */}
          <div className="lg:col-span-1 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-3xl shadow-sm h-fit overflow-hidden transition-colors">
            
            {/* Cabecera Tarjeta */}
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col items-center text-center bg-gray-50/50 dark:bg-[#050505]">
              <div className="w-24 h-24 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-4 overflow-hidden shrink-0 shadow-sm text-gray-400">
                {profile.isPlatformUser && profile.firstName ? (
                  <User className="w-10 h-10" strokeWidth={2} />
                ) : (
                  <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {profile.firstName.charAt(0)}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-2">
                {profile.firstName} {profile.lastName}
              </h2>

              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {profile.isPlatformUser ? (
                  <span className="rounded-full border border-sky-200 bg-sky-50 dark:bg-sky-950/30 dark:border-sky-900/40 text-sky-700 dark:text-sky-400 px-3 py-0.5 text-[10px] font-bold shadow-sm">
                    {t("app_user")}
                  </span>
                ) : (
                  <span className="rounded-full border border-gray-200 bg-gray-50 dark:bg-gray-800/60 dark:border-gray-800 text-gray-600 dark:text-gray-400 px-3 py-0.5 text-[10px] font-bold shadow-sm">
                    {t("offline")}
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                {t("patient_since", {
                  year: new Date(profile.createdAt).getFullYear(),
                })}
              </p>

              {/* Indicador de Cumplimiento NOM-024 */}
              <div className="w-full max-w-[200px] flex flex-col gap-1.5 mt-1">
                <div className="flex justify-between items-center w-full text-[10px] font-bold">
                  <span className="text-gray-400 uppercase tracking-wider">
                    NOM-024
                  </span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    {Math.round(profile.nom024CompliancePercentage || 0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                      (profile.nom024CompliancePercentage || 0) >= 100
                        ? "bg-emerald-500"
                        : (profile.nom024CompliancePercentage || 0) >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    )}
                    style={{
                      width: `${profile.nom024CompliancePercentage || 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Datos de Contacto */}
            <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <Mail
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                  strokeWidth={2}
                />
                <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {profile.email || t("no_email")}
                </span>
              </div>
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <Phone
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                  strokeWidth={2}
                />
                <span className="text-xs font-mono font-semibold text-gray-900 dark:text-white">
                  {profile.phone || t("no_phone")}
                </span>
              </div>

              <div className="p-6 bg-gray-50/50 dark:bg-[#050505]">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                  disabled={profile.isPlatformUser}
                  className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
                >
                  {t("edit_profile")}
                </Button>
              </div>
            </div>
          </div>

          {/* ── COLUMNA DERECHA: PESTAÑAS Y EXPEDIENTE CLÍNICO ────────────── */}
          <div className="lg:col-span-2 space-y-0 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors rounded-3xl shadow-sm overflow-hidden">
            <Tabs defaultValue="summary" className="w-full flex flex-col">
              
              {/* Header de Selección de Pestañas */}
              <div className="p-2 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                <TabsList className="flex flex-row w-full bg-transparent p-0 h-auto overflow-x-auto gap-2 custom-scrollbar">
                  <TabsTrigger
                    value="summary"
                    className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#0a0a0a] dark:data-[state=active]:text-emerald-400 bg-transparent text-gray-500 dark:text-gray-400 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[120px]"
                  >
                    <ActivitySquare className="w-4 h-4" strokeWidth={2} />
                    <span>{t("tabs.summary")}</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="history"
                    className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#0a0a0a] dark:data-[state=active]:text-emerald-400 bg-transparent text-gray-500 dark:text-gray-400 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[120px]"
                  >
                    <Activity className="w-4 h-4" strokeWidth={2} />
                    <span>{t("tabs.timeline")}</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="health-profile"
                    className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#0a0a0a] dark:data-[state=active]:text-emerald-400 bg-transparent text-gray-500 dark:text-gray-400 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[120px]"
                  >
                    <ClipboardList className="w-4 h-4" strokeWidth={2} />
                    <span>{t("base_background")}</span>
                  </TabsTrigger>

                  {isPediatric && (
                    <TabsTrigger
                      value="growth"
                      className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#0a0a0a] dark:data-[state=active]:text-emerald-400 bg-transparent text-gray-500 dark:text-gray-400 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[120px]"
                    >
                      <Baby className="w-4 h-4" strokeWidth={2} />
                      <span>{t("tabs.growth")}</span>
                    </TabsTrigger>
                  )}

                  <TabsTrigger
                    value="notes"
                    className="flex-1 rounded-xl data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-indigo-950/30 dark:data-[state=active]:text-indigo-400 bg-transparent text-gray-500 dark:text-gray-400 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[120px]"
                  >
                    <FileText className="w-4 h-4" strokeWidth={2} />
                    <span>Notas Internas</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ── TAB 1: RESUMEN CLINICO ────────────────────────────────────── */}
              <TabsContent
                value="summary"
                className="m-0 p-0 border-0 outline-none focus-visible:ring-0"
              >
                <ClinicalSummaryTab
                  healthProfile={healthProfile}
                  history={history}
                />
              </TabsContent>

              {/* ── TAB 2: CRONOLOGÍA / HISTORIAL DE CONSULTAS ──────────────── */}
              <TabsContent
                value="history"
                className="m-0 p-0 border-0 outline-none focus-visible:ring-0"
              >
                {hasAccessError ? (
                  <div className="p-16 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-[#050505] gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
                      <Lock className="w-7 h-7" strokeWidth={2} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      {t("access_restricted_title")}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
                      {t("access_restricted_description")}
                    </p>
                    <Button
                      onClick={() =>
                        profile.consumerId && requestAccess(profile.consumerId)
                      }
                      disabled={!profile.consumerId}
                      className="h-11 px-6 mt-2 bg-rose-600 hover:bg-rose-700 text-white transition-all text-xs font-bold rounded-xl shadow-sm border-0 disabled:opacity-50"
                    >
                      {t("request_access")}
                    </Button>
                  </div>
                ) : combinedTimeline.length > 0 ? (
                  <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505] relative p-6">
                    {/* Línea vertical de la cronología */}
                    <div className="absolute left-10 md:left-14 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 z-0" />

                    {combinedTimeline.map((item, index) => (
                      <div
                        key={`${item.type}-${
                          item.data.id || item.data.appointmentId || index
                        }`}
                        className="relative z-10 flex flex-col pt-6 pb-4"
                      >
                        {item.type === "APPOINTMENT" ? (
                          <div className="bg-white dark:bg-[#0a0a0a] ml-12 md:ml-20 border border-gray-100 dark:border-gray-800 flex flex-col shadow-sm rounded-3xl overflow-hidden">
                            {/* Marcador en cronología */}
                            <div className="absolute left-[12px] md:left-[28px] mt-4 w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-gray-50 dark:border-[#050505]" />

                            {/* Header del Registro */}
                            <div className="px-6 py-4 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                                <Clock
                                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                                  strokeWidth={2}
                                />
                                {format(item.date, "dd MMM yyyy", {
                                  locale: dateLocale,
                                })}
                              </div>
                              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-0.5 text-[10px] font-bold shadow-sm">
                                {t("status_completed")}
                              </span>
                            </div>

                            {/* Cuerpo del Registro */}
                            <div className="p-6 flex flex-col gap-4">
                              <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                                {item.data.serviceName}
                              </h4>

                              {item.data.publicNotes && (
                                <div className="border-l-2 border-emerald-500/40 pl-4 py-1">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    {t("instructions")}
                                  </p>
                                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {item.data.publicNotes}
                                  </p>
                                </div>
                              )}

                              {item.data.prescriptions &&
                                item.data.prescriptions.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    {item.data.prescriptions.map((doc: any) => {
                                      const isThisPrinting =
                                        downloadingAppointmentId ===
                                        item.data.appointmentId;
                                      return (
                                        <Button
                                          key={doc.documentId}
                                          variant="outline"
                                          disabled={
                                            downloadingAppointmentId !== null
                                          }
                                          onClick={() =>
                                            handlePrintPdf(item.data.appointmentId)
                                          }
                                          className="h-9 px-3.5 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm"
                                        >
                                          {isThisPrinting ? (
                                            <QhSpinner size="sm" />
                                          ) : (
                                            <FileText
                                              className="w-3.5 h-3.5 mr-1.5"
                                              strokeWidth={2}
                                            />
                                          )}
                                          <span>{t("prescription_document")}</span>
                                          {!isThisPrinting && (
                                            <Download
                                              className="w-3.5 h-3.5 ml-1.5 text-gray-400"
                                              strokeWidth={2}
                                            />
                                          )}
                                        </Button>
                                      );
                                    })}
                                  </div>
                                )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white dark:bg-[#0a0a0a] ml-12 md:ml-20 border border-gray-100 dark:border-gray-800 flex flex-col shadow-sm rounded-3xl overflow-hidden">
                            {/* Marcador en cronología */}
                            <div className="absolute left-[12px] md:left-[28px] mt-4 w-3.5 h-3.5 rounded-full bg-sky-500 border-4 border-gray-50 dark:border-[#050505]" />

                            <div className="px-6 py-4 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                                <Paperclip
                                  className="w-4 h-4 text-sky-500"
                                  strokeWidth={2}
                                />
                                {format(item.date, "dd MMM yyyy", {
                                  locale: dateLocale,
                                })}
                              </div>
                              <span className="rounded-full bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 text-sky-700 dark:text-sky-400 px-3 py-0.5 text-[10px] font-bold shadow-sm">
                                {t("vault_document")}
                              </span>
                            </div>

                            <div className="p-6">
                              <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                                {item.data.documentType === "MEDICAL_RECORD"
                                  ? "Expediente Médico"
                                  : item.data.documentType === "LAB_RESULT"
                                  ? "Estudio de Laboratorio"
                                  : item.data.documentType === "PRESCRIPTION"
                                  ? "Receta"
                                  : "Documento Clínico"}
                              </h4>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                                {item.data.fileName || item.data.title}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 flex flex-col items-center justify-center text-center bg-white dark:bg-[#0a0a0a] gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                      <Calendar className="w-7 h-7" strokeWidth={2} />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                      {t("empty_history")}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* ── TAB 3: FICHA CLÍNICA (ANTECEDENTES) ─────────────────────── */}
              <TabsContent
                value="health-profile"
                className="m-0 p-0 border-0 outline-none focus-visible:ring-0 flex flex-col"
              >
                {/* Header Antecedentes */}
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {t("medical_background")}
                    </h3>
                  </div>

                  {!profile.isPlatformUser && (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditHealthModalOpen(true)}
                      className="h-10 px-5 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm"
                    >
                      {hasHealthData ? (
                        <>
                          <Edit3 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                          <span>{t("edit_background")}</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                          <span>{t("create_background")}</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Matriz de Datos Físicos */}
                <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-b border-gray-100 dark:border-gray-800">
                    <div className="p-6 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {t("blood_type")}
                      </p>
                      <p className="text-base font-mono font-bold text-gray-900 dark:text-white">
                        {healthProfile?.bloodType
                          ? BLOOD_TYPE_LABELS[healthProfile.bloodType] ||
                            healthProfile.bloodType
                          : "—"}
                      </p>
                    </div>

                    <div className="p-6 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {t("height")}
                      </p>
                      <p className="text-base font-mono font-bold text-gray-900 dark:text-white">
                        {healthProfile?.heightCm
                          ? `${healthProfile.heightCm} cm`
                          : "—"}
                      </p>
                    </div>

                    <div className="p-6 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {t("weight")}
                      </p>
                      <p className="text-base font-mono font-bold text-gray-900 dark:text-white">
                        {healthProfile?.weightKg
                          ? `${healthProfile.weightKg} kg`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Tablas de Problemas, Alergias y Medicación */}
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 space-y-6">
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

                  {/* Panel de Antecedentes */}
                  <div className="border-b border-gray-100 dark:border-gray-800">
                    <PatientBackgroundPanel
                      patientDirectoryId={patientDirectoryId}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* ── TAB 4: CRECIMIENTO PEDIÁTRICO ───────────────────────────── */}
              {isPediatric && (
                <TabsContent
                  value="growth"
                  className="m-0 p-0 border-0 outline-none focus-visible:ring-0 flex flex-col"
                >
                  <MedicalGrowthContainer
                    dependentId={patientDirectoryId}
                    sex={profile.gender === "FEMALE" ? "FEMALE" : "MALE"}
                  />
                </TabsContent>
              )}

              {/* ── TAB: NOTAS INTERNAS DEL MÉDICO ─────────────────────────── */}
              <TabsContent
                value="notes"
                className="m-0 p-0 border-0 outline-none focus-visible:ring-0"
              >
                <ProviderInternalNotesTab patientDirectoryId={patientDirectoryId} />
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </motion.div>

      {/* ── MODALES ───────────────────────────────────────────────────────── */}
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