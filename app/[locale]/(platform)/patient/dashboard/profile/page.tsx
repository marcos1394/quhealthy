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
      fullName: z.string().min(3, "El nombre completo es requerido"),
      email: z.string().email("Correo electrónico inválido"),
      phone: z.string().min(10, "Ingresa un número telefónico válido a 10 dígitos"),
      birthDate: z.string().optional().or(z.literal("")),
      curp: z.string().max(18, "La CURP debe tener máximo 18 caracteres").optional().or(z.literal("")),
      rfc: z.string().max(13, "El RFC debe tener máximo 13 caracteres").optional().or(z.literal("")),
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
  }, []);

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
        toast.success("¡Perfil médico y personal actualizado con éxito!");
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
      toast.success(t("photo_updated_toast") || "¡Foto de perfil actualizada con éxito!");
      await fetchProfile();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleCapturePhoto(file);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await generatePatientProfilePdf(profile, user?.email);
      toast.success("¡Expediente descargado en formato PDF con éxito!");
    } catch (err) {
      console.error("Error al generar PDF:", err);
      toast.error("Hubo un problema al generar el archivo PDF. Puedes utilizar el botón de Imprimir.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-32 print:bg-white print:p-0 print:pb-0">
      
      {/* ── ESTILOS CSS DEDICADOS PARA IMPRESIÓN Y PDF ────────────────── */}
      <style jsx global>{`
        @media print {
          nav, header, footer, .no-print, [role="navigation"] {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 11pt !important;
          }
          .print-full-width {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 print:max-w-full print:p-0 print:m-0">
        
        {/* ── HEADER PRINCIPAL Y ACCIONES ──────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 bg-white dark:bg-[#0a0a0a] p-5 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm no-print">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Foto de perfil con botón rápido de cambio / selfie */}
            <div
              className="relative group cursor-pointer w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-emerald-50 dark:border-emerald-950/30 bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
              onClick={() => setIsSelfieModalOpen(true)}
              title="Tomar selfie o cambiar foto"
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
                    Selfie / Foto
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/40">
                  Expediente Digital
                </span>
                <span className="text-[10px] font-bold text-gray-400 font-mono">
                  NOM-004-SSA3
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
                {profile?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Mi Perfil Médico")}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Resumen clínico, seguro médico, datos personales y antecedentes de salud.
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
                <span>Expediente CV</span>
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
                <span>Editar Datos</span>
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
              <span className="hidden sm:inline">{isDownloadingPdf ? "Generando..." : "Descargar PDF"}</span>
            </Button>

            {/* Botón Imprimir / Vista Previa */}
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="h-10 px-3 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#151515] transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              title="Imprimir o guardar como PDF mediante el navegador"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">Imprimir</span>
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
                        Datos Personales & Identidad Oficial
                      </h2>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Identificación civil requerida para expedientes clínicos y recetas médicas electrónicas.
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
                            Nombre(s) y Apellidos Completos *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. María Elena López Castro"
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
                            Fecha de Nacimiento
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
                            CURP (18 caracteres)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              maxLength={18}
                              placeholder="ABCD900101HDFRRN01"
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
                            RFC (Con Homoclave)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              maxLength={13}
                              placeholder="ABCD900101XXX"
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
                            Sexo Biológico
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium">
                                <SelectValue placeholder="Selecciona sexo biológico" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                              <SelectItem value="MALE" className="text-xs font-medium">Masculino</SelectItem>
                              <SelectItem value="FEMALE" className="text-xs font-medium">Femenino</SelectItem>
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
                            Estado Civil
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium">
                                <SelectValue placeholder="Selecciona estado civil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                              <SelectItem value="Soltero(a)" className="text-xs font-medium">Soltero(a)</SelectItem>
                              <SelectItem value="Casado(a)" className="text-xs font-medium">Casado(a)</SelectItem>
                              <SelectItem value="Unión Libre" className="text-xs font-medium">Unión Libre</SelectItem>
                              <SelectItem value="Divorciado(a)" className="text-xs font-medium">Divorciado(a)</SelectItem>
                              <SelectItem value="Viudo(a)" className="text-xs font-medium">Viudo(a)</SelectItem>
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
                            Ocupación / Profesión
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. Docente, Ingeniero, Estudiante"
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
                            Donador de Órganos y Tejidos
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium">
                                <SelectValue placeholder="Voluntad de donación" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                              <SelectItem value="YES" className="text-xs font-medium">Sí, Donador Expreso</SelectItem>
                              <SelectItem value="NO" className="text-xs font-medium">No</SelectItem>
                              <SelectItem value="FAMILY_DECIDES" className="text-xs font-medium">Decisión de mis Familiares</SelectItem>
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
                        Seguridad Social & Pólizas de Seguro Médico
                      </h2>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Información de tu seguro público (IMSS, ISSSTE) o póliza de Gastos Médicos Mayores (GNP, AXA, MetLife, etc.).
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
                            Tipo de Cobertura Médica
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium">
                                <SelectValue placeholder="Selecciona tipo de seguro" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                              <SelectItem value="PUBLIC" className="text-xs font-medium">Seguridad Social Pública (IMSS, ISSSTE)</SelectItem>
                              <SelectItem value="PRIVATE" className="text-xs font-medium">Seguro de Gastos Médicos Privado (SGMM)</SelectItem>
                              <SelectItem value="NONE" className="text-xs font-medium">Particular / Sin Seguro</SelectItem>
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
                            Institución o Aseguradora
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. IMSS, ISSSTE, GNP, MetLife, AXA, Seguros Monterrey"
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
                            NSS o Número de Póliza
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. 1234567890 o POL-987654"
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
                            Nombre del Plan / Nivel de Cobertura (Opcional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. Cobertura Amplia Hospitalaria, Deducible $15,000, Coaseguro 10%"
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
                        Canales de Contacto & Domicilio
                      </h2>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Dirección y medios para notificaciones de citas y resultados de estudios.
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
                            Teléfono Móvil / WhatsApp *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. 668 123 4567"
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
                            Correo Electrónico *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              placeholder="correo@ejemplo.com"
                              className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
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
                            Calle y Número Exterior / Interior
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. Av. Insurgentes Sur 1234, Int. 5B"
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
                            Código Postal
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              maxLength={5}
                              placeholder="Ej. 81200"
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
                            Ciudad / Municipio
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. Los Mochis"
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
                            Estado / Entidad Federativa
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. Sinaloa"
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
                        Contacto en Caso de Emergencia
                      </h2>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Persona a contactar de inmediato en situaciones de urgencia médica o quirúrgica.
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
                            Nombre del Contacto
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. Roberto Castro Gómez"
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
                            Parentesco / Relación
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium">
                                <SelectValue placeholder="Selecciona parentesco" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                              <SelectItem value="Cónyuge / Pareja" className="text-xs font-medium">Cónyuge / Pareja</SelectItem>
                              <SelectItem value="Madre / Padre" className="text-xs font-medium">Madre / Padre</SelectItem>
                              <SelectItem value="Hijo(a)" className="text-xs font-medium">Hijo(a)</SelectItem>
                              <SelectItem value="Hermano(a)" className="text-xs font-medium">Hermano(a)</SelectItem>
                              <SelectItem value="Familiar" className="text-xs font-medium">Familiar</SelectItem>
                              <SelectItem value="Tutor Legal" className="text-xs font-medium">Tutor Legal</SelectItem>
                              <SelectItem value="Amigo(a)" className="text-xs font-medium">Amigo(a)</SelectItem>
                            </SelectContent>
                          </Select>
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
                            Teléfono de Emergencia Principal
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. 668 987 6543"
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
                            Teléfono Alternativo (Opcional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. 668 555 4321"
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
                        Expediente & Antecedentes Clínicos (NOM-004)
                      </h2>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Historial de alergias, enfermedades crónicas, medicamentos habituales y cirugías.
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
                              Grupo Sanguíneo y Factor Rh
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium">
                                  <SelectValue placeholder="Selecciona tipo de sangre" />
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
                              Médico de Cabecera o Clínica Habitual
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej. Dr. Alejandro Mendoza / Hospital Ángeles"
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
                            <span>Alergias Medicamentosas, Alimentarias o Ambientales (Separadas por comas)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Ej. Penicilina (Severa), Ibuprofeno, Mariscos, Polvo/Ácaros"
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
                            <span>Diagnósticos Actuales & Enfermedades Crónicas</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Ej. Hipertensión arterial sistémica (dx 2019), Diabetes Mellitus Tipo 2, Hipotiroidismo"
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
                            <span>Medicación Continua & Dosis Habituales (Separadas por comas)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Ej. Losartán 50mg cada 24 hrs, Metformina 850mg con alimentos, Levotiroxina 100mcg en ayuno"
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
                              <span>Cirugías & Hospitalizaciones Previas</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej. Apendicectomía (2015), Colecistectomía (2020)"
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
                              <span>Prótesis, Implantes o Dispositivos</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej. Marcapasos bicameral, Prótesis de rodilla derecha"
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
                            <span>Esquema de Vacunación Relevante</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. COVID-19 (3 dosis), Influenza (2025), Tétanos (2022)"
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
                              Tienes modificaciones sin guardar
                            </p>
                            <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400 line-clamp-1">
                              Guarda los cambios para actualizar tu expediente digital y pasaporte médico.
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
                            <span>Descartar</span>
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
                            <span>{isSaving ? "Guardando..." : "Guardar Expediente"}</span>
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