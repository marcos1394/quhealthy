"use client";

/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  User,
  Mail,
  Phone,
  Save,
  HeartPulse,
  AlertTriangle,
  Loader2,
  RotateCcw,
  Activity,
  Camera,
  Printer,
  FileText,
  Building2,
  ShieldCheck,
  Calendar,
  MapPin,
  Pill,
  Scissors,
  Sparkles,
  Stethoscope,
  HeartHandshake,
  Award,
  CheckCircle2,
  Edit3,
  Layers,
  Download,
} from "lucide-react";

import { useSessionStore } from "@/stores/SessionStore";
import { useConsumerProfile } from "@/hooks/useConsumerProfile";
import { generatePatientProfilePdf } from "@/lib/pdf/patientProfilePdf";
import { consumerProfileService } from "@/services/consumerProfile.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { handleApiError } from "@/lib/handleApiError";

import { ClinicalFormsHistory } from "@/components/consultation/ClinicalFormsHistory";
import { PatientBackgroundPanel } from "@/components/consultation/PatientBackgroundPanel";
import { LanguageSettingsCard } from "@/components/settings/LanguageSettingsCard";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { PatientMedicalSummaryCV } from "@/components/patient/PatientMedicalSummaryCV";
import { SelfieCameraModal } from "@/components/ui/SelfieCameraModal";
import { cn } from "@/lib/utils";

type ProfileViewMode = "CV" | "EDIT";

export default function PatientProfilePage() {
  const t = useTranslations("PatientProfile");
  const [viewMode, setViewMode] = useState<ProfileViewMode>("CV");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks de Backend y Sesión
  const { user } = useSessionStore();
  const { profile, isLoading, fetchProfile, updateProfile } = useConsumerProfile();

  // Esquema de Validación Completo
  const patientProfileSchema = useMemo(() => {
    return z.object({
      fullName: z.string().min(3, t("err_full_name")),
      email: z.string().email(t("err_email")),
      phone: z.string().min(10, t("err_phone")),
      birthDate: z.string().optional().or(z.literal("")),
      curp: z.string().max(18).optional().or(z.literal("")),
      rfc: z.string().max(13).optional().or(z.literal("")),
      biologicalSex: z.string().optional(),
      gender: z.string().optional(),
      bloodType: z.string().optional(),
      maritalStatus: z.string().optional(),
      occupation: z.string().optional(),
      nationality: z.string().optional(),
      organDonor: z.string().optional(),
      // Seguro y Póliza
      insuranceType: z.string().optional(),
      insuranceProvider: z.string().optional(),
      insurancePolicyNumber: z.string().optional(),
      insurancePlanName: z.string().optional(),
      // Domicilio
      addressStreet: z.string().optional(),
      addressCity: z.string().optional(),
      addressState: z.string().optional(),
      addressPostalCode: z.string().optional(),
      // Contacto de Emergencia
      emergencyContactName: z.string().optional().or(z.literal("")),
      emergencyContactRelationship: z.string().optional().or(z.literal("")),
      emergencyContactPhone: z.string().optional().or(z.literal("")),
      emergencyContactPhoneAlt: z.string().optional().or(z.literal("")),
      // Antecedentes Clínicos
      allergies: z.string().optional(),
      currentMedications: z.string().optional(),
      chronicDiseases: z.string().optional(),
      surgeries: z.string().optional(),
      implantsDevices: z.string().optional(),
      vaccinations: z.string().optional(),
      primaryPhysician: z.string().optional(),
    });
  }, [t]);

  type PatientProfileValues = z.infer<typeof patientProfileSchema>;

  // Formulario
  const form = useForm<PatientProfileValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      birthDate: "",
      curp: "",
      rfc: "",
      biologicalSex: "",
      gender: "",
      bloodType: "",
      maritalStatus: "",
      occupation: "",
      nationality: "Mexicana",
      organDonor: "FAMILY_DECIDES",
      insuranceType: "NONE",
      insuranceProvider: "",
      insurancePolicyNumber: "",
      insurancePlanName: "",
      addressStreet: "",
      addressCity: "",
      addressState: "",
      addressPostalCode: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      emergencyContactPhoneAlt: "",
      allergies: "",
      currentMedications: "",
      chronicDiseases: "",
      surgeries: "",
      implantsDevices: "",
      vaccinations: "",
      primaryPhysician: "",
    },
  });

  // Cargar Perfil
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Rellenar formulario cuando el perfil carga
  useEffect(() => {
    if (!isLoading && profile) {
      const pb = (profile.personalBackground as Record<string, string>) || {};

      form.reset({
        fullName:
          profile.fullName ||
          (user?.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : ""),
        email: user?.email || "",
        phone: profile.phoneNumber || "",
        birthDate: profile.birthDate || "",
        curp: profile.curp || pb.curp || "",
        rfc: profile.rfc || pb.rfc || "",
        biologicalSex: profile.biologicalSex || "",
        gender: profile.gender || "",
        bloodType: profile.bloodType || "",
        maritalStatus: profile.maritalStatus || pb.maritalStatus || "",
        occupation: profile.occupation || pb.occupation || "",
        nationality: profile.nationality || pb.nationality || "Mexicana",
        organDonor: profile.organDonor || pb.organDonor || "FAMILY_DECIDES",
        insuranceType: profile.insuranceType || pb.insuranceType || (profile.healthInsurance ? "PUBLIC" : "NONE"),
        insuranceProvider: profile.insuranceProvider || pb.insuranceProvider || profile.healthInsurance || "",
        insurancePolicyNumber: profile.insurancePolicyNumber || pb.insurancePolicyNumber || "",
        insurancePlanName: profile.insurancePlanName || pb.insurancePlanName || "",
        addressStreet: profile.addressStreet || pb.addressStreet || "",
        addressCity: profile.addressCity || pb.addressCity || profile.location || "",
        addressState: profile.addressState || pb.addressState || "",
        addressPostalCode: profile.addressPostalCode || pb.addressPostalCode || "",
        emergencyContactName: profile.emergencyContactName || pb.emergencyContactName || "",
        emergencyContactRelationship: profile.emergencyContactRelationship || pb.emergencyContactRelationship || "",
        emergencyContactPhone: profile.emergencyContactPhone || pb.emergencyContactPhone || "",
        emergencyContactPhoneAlt: profile.emergencyContactPhoneAlt || pb.emergencyContactPhoneAlt || "",
        allergies:
          profile.allergies
            ?.map((a: any) => (typeof a === "string" ? a : a?.name || ""))
            .filter(Boolean)
            .join(", ") || "",
        currentMedications: profile.currentMedications?.join(", ") || "",
        chronicDiseases: profile.chronicDiseases || pb.chronicDiseases || "",
        surgeries: profile.surgeries || pb.surgeries || "",
        implantsDevices: profile.implantsDevices || pb.implantsDevices || "",
        vaccinations: profile.vaccinations || pb.vaccinations || "",
        primaryPhysician: profile.primaryPhysician || pb.primaryPhysician || "",
      });
    }
  }, [isLoading, profile, user, form]);

  const isDirty = form.formState.isDirty;

  const onSubmit = async (data: PatientProfileValues) => {
    setIsSaving(true);
    try {
      const success = await updateProfile({
        ...profile,
        fullName: data.fullName,
        birthDate: data.birthDate || "",
        phoneNumber: data.phone,
        bloodType: data.bloodType || profile.bloodType || "",
        biologicalSex: data.biologicalSex || profile.biologicalSex || "",
        gender: data.gender || profile.gender || "",
        curp: data.curp || "",
        rfc: data.rfc || "",
        maritalStatus: data.maritalStatus || "",
        occupation: data.occupation || "",
        nationality: data.nationality || "Mexicana",
        organDonor: data.organDonor || "FAMILY_DECIDES",
        insuranceType: data.insuranceType || "NONE",
        insuranceProvider: data.insuranceProvider || "",
        insurancePolicyNumber: data.insurancePolicyNumber || "",
        insurancePlanName: data.insurancePlanName || "",
        addressStreet: data.addressStreet || "",
        addressCity: data.addressCity || "",
        addressState: data.addressState || "",
        addressPostalCode: data.addressPostalCode || "",
        location: data.addressCity || profile.location || "",
        emergencyContactName: data.emergencyContactName || "",
        emergencyContactRelationship: data.emergencyContactRelationship || "",
        emergencyContactPhone: data.emergencyContactPhone || "",
        emergencyContactPhoneAlt: data.emergencyContactPhoneAlt || "",
        chronicDiseases: data.chronicDiseases || "",
        surgeries: data.surgeries || "",
        implantsDevices: data.implantsDevices || "",
        vaccinations: data.vaccinations || "",
        primaryPhysician: data.primaryPhysician || "",
        allergies: data.allergies
          ? data.allergies.split(",").flatMap((s) => {
              const trimmed = s.trim();
              return trimmed ? [{ name: trimmed }] : [];
            })
          : [],
        currentMedications: data.currentMedications
          ? data.currentMedications.split(",").flatMap((s) => {
              const trimmed = s.trim();
              return trimmed ? [trimmed] : [];
            })
          : [],
      });

      if (success) {
        toast.success(t("profile_updated_success"));
        form.reset(data);
        setViewMode("CV"); // Regresar a la vista ejecutiva para previsualizar
      }
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCapturePhoto = async (file: File) => {
    setIsUploadingPicture(true);
    try {
      await consumerProfileService.uploadProfilePicture(file);
      toast.success(t("photo_updated_toast"));
      await fetchProfile();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsUploadingPicture(false);
      setIsSelfieModalOpen(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!profile) return;
    setIsDownloadingPdf(true);
    try {
      await generatePatientProfilePdf(profile, user?.email);
      toast.success(t("pdf_download_success"));
    } catch (err) {
      console.error("Error al generar PDF:", err);
      toast.error(t("pdf_download_error"));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] p-3 sm:p-6 md:p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* ── HEADER PRINCIPAL CON ACCIONES RÁPIDAS ─────────────────────── */}
        <div className="no-print bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar Interactivo con Acceso a Selfie */}
            <div
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#111] border-2 border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center shrink-0 group cursor-pointer shadow-inner"
              onClick={() => setIsSelfieModalOpen(true)}
              title={t("change_photo")}
            >
              {isUploadingPicture ? (
                <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
              ) : profile?.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <User
                  className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 group-hover:scale-105 transition-transform duration-300"
                  strokeWidth={1.5}
                />
              )}

              {!isUploadingPicture && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-xs text-white gap-1">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-center px-2">
                    {t("selfie_button_tooltip")}
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/40">
                  {t("digital_record_badge")}
                </span>
                <span className="text-[10px] font-bold text-gray-400 font-mono">
                  {t("norm_badge")}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
                {profile?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}` : t("title"))}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("subtitle")}
              </p>
            </div>
          </div>

          {/* Botones de Vista (Expediente CV / Edición / Descargar PDF / Imprimir) */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
            {/* Toggle de Modo de Vista */}
            <div className="bg-gray-100 dark:bg-[#151515] p-1 rounded-2xl flex items-center gap-1 border border-gray-200 dark:border-gray-800 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("CV")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  viewMode === "CV"
                    ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t("tab_medical_cv")}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("EDIT")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  viewMode === "EDIT"
                    ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t("tab_edit_data")}</span>
              </button>
            </div>

            {/* Botón Descargar PDF Directo */}
            <Button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5 border-0 disabled:opacity-50"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isDownloadingPdf ? t("btn_generating_pdf") : t("btn_download_pdf")}</span>
            </Button>

            {/* Botón Imprimir / Vista Previa */}
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="h-10 px-3 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#151515] transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">{t("btn_print")}</span>
            </Button>
          </div>
        </div>

        {/* ── MODO 1: EXPEDIENTE MÉDICO CV / PASAPORTE CLÍNICO ─────────── */}
        {viewMode === "CV" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <PatientMedicalSummaryCV
              profile={profile}
              userEmail={user?.email}
              onEditClick={() => setViewMode("EDIT")}
              onPhotoClick={() => setIsSelfieModalOpen(true)}
              onDownloadPdf={handleDownloadPdf}
              onPrint={handlePrint}
              isDownloadingPdf={isDownloadingPdf}
            />
          </motion.div>
        )}

        {/* ── MODO 2: FORMULARIO MODULAR DE EDICIÓN ───────────────────── */}
        {viewMode === "EDIT" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="no-print space-y-6 sm:space-y-8"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                
                {/* ── SECCIÓN 1: DATOS PERSONALES & DEMOGRÁFICOS ─────────────── */}
                <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
                  <div className="bg-gray-50/50 dark:bg-[#111]/30 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 flex items-center justify-center shrink-0 text-teal-600 dark:text-teal-400">
                      <User className="w-4.5 h-4.5" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {t("section_identity_title")}
                      </h2>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {t("section_identity_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_full_name_required")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_full_name_detailed")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_birth_date")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="curp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_curp")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              maxLength={18}
                              placeholder={t("placeholder_curp")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-mono uppercase focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rfc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_rfc")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              maxLength={13}
                              placeholder={t("placeholder_rfc")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-mono uppercase focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="biologicalSex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_biological_sex_field")}
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium">
                                <SelectValue placeholder={t("placeholder_select_sex")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                              <SelectItem value="MALE" className="text-xs font-medium">{t("sex_male_option")}</SelectItem>
                              <SelectItem value="FEMALE" className="text-xs font-medium">{t("sex_female_option")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_marital_status")}
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium">
                                <SelectValue placeholder={t("placeholder_select_marital")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                              <SelectItem value="Soltero(a)" className="text-xs font-medium">{t("marital_single")}</SelectItem>
                              <SelectItem value="Casado(a)" className="text-xs font-medium">{t("marital_married")}</SelectItem>
                              <SelectItem value="Unión Libre" className="text-xs font-medium">{t("marital_cohabitation")}</SelectItem>
                              <SelectItem value="Divorciado(a)" className="text-xs font-medium">{t("marital_divorced")}</SelectItem>
                              <SelectItem value="Viudo(a)" className="text-xs font-medium">{t("marital_widowed")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_occupation")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_occupation")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organDonor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_organ_donor")}
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium">
                                <SelectValue placeholder={t("label_organ_donor")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                              <SelectItem value="YES" className="text-xs font-medium">{t("donor_yes")}</SelectItem>
                              <SelectItem value="NO" className="text-xs font-medium">{t("donor_no")}</SelectItem>
                              <SelectItem value="FAMILY_DECIDES" className="text-xs font-medium">{t("donor_family_decides")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ── SECCIÓN 2: SEGURIDAD SOCIAL & PÓLIZAS DE SEGURO ─────────── */}
                <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
                  <div className="bg-gray-50/50 dark:bg-[#111]/30 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                      <Building2 className="w-4.5 h-4.5" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {t("section_insurance_title")}
                      </h2>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {t("section_insurance_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="insuranceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_insurance_type")}
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium">
                                <SelectValue placeholder={t("label_insurance_type")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                              <SelectItem value="PUBLIC" className="text-xs font-medium">{t("insurance_type_public")}</SelectItem>
                              <SelectItem value="PRIVATE" className="text-xs font-medium">{t("insurance_type_private")}</SelectItem>
                              <SelectItem value="NONE" className="text-xs font-medium">{t("insurance_type_none")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insuranceProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_insurance_provider")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_insurance_provider")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insurancePolicyNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_policy_number")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_policy_number")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-mono focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insurancePlanName"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_plan_name")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_plan_name")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ── SECCIÓN 3: CONTACTO DIRECTO & DOMICILIO ─────────────────── */}
                <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
                  <div className="bg-gray-50/50 dark:bg-[#111]/30 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                      <Phone className="w-4.5 h-4.5" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {t("section_address_title")}
                      </h2>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {t("section_address_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_phone_primary")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_phone_primary")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_email_read")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              disabled
                              placeholder={t("placeholder_email")}
                              className="h-11 rounded-xl bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-gray-800 text-xs font-medium opacity-80"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="addressStreet"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_address_street")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_address_street")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="addressPostalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_postal_code")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              maxLength={5}
                              placeholder={t("placeholder_postal_code")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-mono focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="addressCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_address_city")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_address_city")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="addressState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_address_state")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_address_state")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ── SECCIÓN 4: CONTACTO DE EMERGENCIA ──────────────────────── */}
                <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
                  <div className="bg-gray-50/50 dark:bg-[#111]/30 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-4.5 h-4.5" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {t("section_emergency_title")}
                      </h2>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {t("section_emergency_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_emergency_name_field")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_emergency_name_field")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContactRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_emergency_relationship")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_emergency_relationship")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_emergency_phone_primary")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_emergency_phone_primary")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContactPhoneAlt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {t("label_emergency_phone_alt")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_emergency_phone_alt")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ── SECCIÓN 5: PERFIL & ANTECEDENTES CLÍNICOS ───────────────── */}
                <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
                  <div className="bg-gray-50/50 dark:bg-[#111]/30 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                      <HeartPulse className="w-4.5 h-4.5" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {t("section_clinical_title")}
                      </h2>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {t("section_clinical_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <FormField
                        control={form.control}
                        name="bloodType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                              {t("label_blood_type_field")}
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium">
                                  <SelectValue placeholder={t("placeholder_select_blood")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "INDETERMINADO"].map((bt) => (
                                  <SelectItem key={bt} value={bt} className="text-xs font-medium">
                                    {bt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs text-rose-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="primaryPhysician"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                              {t("label_primary_physician")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t("placeholder_primary_physician")}
                                className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-rose-500" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{t("label_allergies_field")}</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t("placeholder_allergies_field")}
                              className="min-h-[80px] resize-none rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="chronicDiseases"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t("label_chronic_diseases")}</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t("placeholder_chronic_diseases")}
                              className="min-h-[80px] resize-none rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentMedications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t("label_medications_field")}</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t("placeholder_medications_field")}
                              className="min-h-[80px] resize-none rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="surgeries"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                              <Scissors className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t("label_surgeries")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t("placeholder_surgeries")}
                                className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-rose-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="implantsDevices"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t("label_implants")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t("placeholder_implants")}
                                className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-rose-500" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="vaccinations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t("label_vaccinations")}</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("placeholder_vaccinations")}
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ── BARRA FLOTANTE DE GUARDADO ───────────────────────────────── */}
                <AnimatePresence>
                  {isDirty && (
                    <motion.div
                      initial={{ opacity: 0, y: "100%" }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: "100%" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="fixed bottom-4 sm:bottom-6 left-3 right-3 sm:left-4 sm:right-4 z-50 pointer-events-none"
                    >
                      <div className="max-w-4xl mx-auto bg-white dark:bg-[#0a0a0a] rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pointer-events-auto">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/40">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                              {t("unsaved_title")}
                            </p>
                            <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400 line-clamp-1">
                              {t("unsaved_desc")}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isSaving}
                            className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] h-10 sm:h-11 px-4 sm:px-5 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                            onClick={() => form.reset()}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{t("btn_revert")}</span>
                          </Button>

                          <Button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-10 sm:h-11 px-4 sm:px-6 text-xs font-bold transition-all border-0 shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" strokeWidth={2} />
                            )}
                            <span>{isSaving ? t("btn_saving") : t("btn_save")}</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </Form>
          </motion.div>
        )}

        {/* ── SECCIÓN DE ANTECEDENTES NOM-004 DETALLADOS ─────────────── */}
        {user?.id && (
          <div className="no-print">
            <PatientBackgroundPanel consumerId={user.id} />
          </div>
        )}

        {/* ── SECCIÓN DE FICHAS CLÍNICAS (PLANTILLAS) ───────────────────── */}
        {user?.id && (
          <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden no-print">
            <div className="bg-gray-50/50 dark:bg-[#111]/30 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Activity className="w-4.5 h-4.5" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    Historial de Fichas Clínicas & Formularios
                  </h2>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                    Plantillas y cuestionarios médicos completados en tus consultas.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <ClinicalFormsHistory patientId={user.id} />
            </div>
          </div>
        )}

        {/* ── SECCIÓN DE IDIOMA Y PREFERENCIAS ─────────────────────────── */}
        <div className="no-print">
          <LanguageSettingsCard />
        </div>

        {/* ── MODAL DE CÁMARA & SELFIE EN VIVO ─────────────────────────── */}
        <SelfieCameraModal
          isOpen={isSelfieModalOpen}
          onClose={() => setIsSelfieModalOpen(false)}
          onCapture={handleCapturePhoto}
        />

      </div>
    </div>
  );
}