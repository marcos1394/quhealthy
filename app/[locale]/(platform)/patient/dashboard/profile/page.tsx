"use client";

/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/no-giant-component */

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
} from "lucide-react";

import { useSessionStore } from "@/stores/SessionStore";
import { useConsumerProfile } from "@/hooks/useConsumerProfile";
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

export default function PatientProfilePage() {
  const t = useTranslations("PatientProfile");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks de Backend y Sesión
  const { user } = useSessionStore();
  const { profile, isLoading, fetchProfile, updateProfile } = useConsumerProfile();

  // Esquema de Validación Internacionalizado
  const patientProfileSchema = useMemo(() => {
    return z.object({
      fullName: z.string().min(3, t("err_full_name")),
      email: z.string().email(t("err_email")),
      phone: z.string().min(10, t("err_phone")),
      bloodType: z.string().optional(),
      biologicalSex: z.string().optional(),
      allergies: z.string().optional(),
      currentMedications: z.string().optional(),
      emergencyContactName: z.string().optional().or(z.literal("")),
      emergencyContactPhone: z.string().optional().or(z.literal("")),
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
      bloodType: "",
      biologicalSex: "",
      allergies: "",
      currentMedications: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  // Cargar Perfil
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Rellenar formulario cuando el perfil carga
  useEffect(() => {
    if (!isLoading && profile) {
      form.reset({
        fullName:
          profile.fullName ||
          (user?.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : ""),
        email: user?.email || "",
        phone: profile.phoneNumber || "",
        bloodType: profile.bloodType || "",
        biologicalSex: profile.biologicalSex || "",
        allergies:
          profile.allergies
            ?.map((a: any) => a?.name || a)
            .join(", ") || "",
        currentMedications: profile.currentMedications?.join(", ") || "",
        emergencyContactName: profile.emergencyContactName || "",
        emergencyContactPhone: profile.emergencyContactPhone || "",
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
        phoneNumber: data.phone,
        bloodType: data.bloodType || profile.bloodType || "",
        biologicalSex: data.biologicalSex || profile.biologicalSex || "",
        emergencyContactName:
          data.emergencyContactName || profile.emergencyContactName || "",
        emergencyContactPhone:
          data.emergencyContactPhone || profile.emergencyContactPhone || "",
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
        toast.success(t("profile_saved_toast"));
        form.reset(data);
      }
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPicture(true);
    try {
      await consumerProfileService.uploadProfilePicture(file);
      toast.success(t("photo_updated_toast"));
      await fetchProfile();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsUploadingPicture(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 bg-white dark:bg-[#0a0a0a] p-5 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
            <div
              className="relative group cursor-pointer w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-emerald-50 dark:border-emerald-950/30 bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePictureUpload}
              />
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
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm text-white gap-1">
                  <Camera className="w-4 h-4" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-center px-2">
                    {t("change_photo")}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-0.5 sm:mt-1">
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
            <LanguageToggle showText />
          </div>
        </div>

        {/* ── FORMULARIOS ───────────────────────────────────────────────── */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            
            {/* Sección 1: Datos Personales */}
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 dark:bg-[#111]/30 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 flex items-center justify-center shrink-0 text-teal-600 dark:text-teal-400">
                  <User className="w-4.5 h-4.5" strokeWidth={2} />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  {t("personal_info_title")}
                </h2>
              </div>

              <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<PatientProfileValues, "fullName">;
                  }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {t("label_full_name")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("placeholder_full_name")}
                          className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-medium text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<PatientProfileValues, "email">;
                  }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {t("label_email")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input
                            type="email"
                            {...field}
                            placeholder={t("placeholder_email")}
                            className="h-11 pl-10 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-sm"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs font-medium text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<PatientProfileValues, "phone">;
                  }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {t("label_phone")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input
                            {...field}
                            placeholder={t("placeholder_phone")}
                            className="h-11 pl-10 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-sm"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs font-medium text-rose-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sección 2: Perfil Médico Básico */}
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 dark:bg-[#111]/30 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                  <HeartPulse className="w-4.5 h-4.5" strokeWidth={2} />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  {t("medical_info_title")}
                </h2>
              </div>

              <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<
                        PatientProfileValues,
                        "bloodType"
                      >;
                    }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          {t("label_blood_type")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm">
                              <SelectValue
                                placeholder={t("placeholder_blood_type")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                            {[
                              "A+",
                              "A-",
                              "B+",
                              "B-",
                              "AB+",
                              "AB-",
                              "O+",
                              "O-",
                              "INDETERMINADO",
                            ].map((bt) => (
                              <SelectItem
                                key={bt}
                                value={bt}
                                className="text-xs font-medium"
                              >
                                {bt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs font-medium text-rose-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="biologicalSex"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<
                        PatientProfileValues,
                        "biologicalSex"
                      >;
                    }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          {t("label_biological_sex")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm">
                              <SelectValue
                                placeholder={t("placeholder_biological_sex")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                            <SelectItem value="MALE" className="text-xs font-medium">
                              {t("sex_male")}
                            </SelectItem>
                            <SelectItem value="FEMALE" className="text-xs font-medium">
                              {t("sex_female")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs font-medium text-rose-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<
                      PatientProfileValues,
                      "allergies"
                    >;
                  }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{t("label_allergies")}</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("placeholder_allergies")}
                          className="min-h-[90px] sm:min-h-[100px] resize-none rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all shadow-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-medium text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentMedications"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<
                      PatientProfileValues,
                      "currentMedications"
                    >;
                  }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {t("label_current_medications")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("placeholder_current_medications")}
                          className="min-h-[90px] sm:min-h-[100px] resize-none rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-medium text-rose-500" />
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

        {/* ── SECCIÓN DE ANTECEDENTES NOM-004 ───────────────────────────── */}
        {user?.id && (
          <div>
            <PatientBackgroundPanel consumerId={user.id} />
          </div>
        )}

        {/* ── SECCIÓN DE FICHAS CLÍNICAS (PLANTILLAS) ───────────────────── */}
        {user?.id && (
          <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 dark:bg-[#111]/30 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Activity className="w-4.5 h-4.5" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {t("clinical_forms_title")}
                  </h2>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                    {t("clinical_forms_subtitle")}
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
        <div>
          <LanguageSettingsCard />
        </div>

      </div>
    </div>
  );
}