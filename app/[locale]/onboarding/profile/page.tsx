"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Phone,
  ArrowRight,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Star,
  User,
  Info,
  Zap,
  ChevronRight,
  Shield,
  Trophy,
  Check,
  Navigation,
  Stethoscope,
  Scissors,
} from "lucide-react";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import LocationPicker from "@/components/shared/location/LocationPicker";
import CategorySelector from "@/components/shared/CategorySelector";
import { useProfileOnboarding } from "@/hooks/useProfileOnboarding";
import { cn } from "@/lib/utils";
import { googleService } from "@/services/google.service";
import { handleApiError } from "@/lib/handleApiError";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const t = useTranslations("OnboardingProfile");

  const {
    initialData,
    isLoading: pageLoading,
    isSaving,
    saveProfile,
    error: pageError,
    refetch,
    categories,
    tags,
    getSubCategories,
    createCategory,
    createSubcategory,
    createTag,
  } = useProfileOnboarding();

  const [
    {
      formData,
      loading,
      error,
      focusedField,
      completedSteps,
      predictions,
      isSearching,
      selectedPlaceInfo,
      isPlaceSelected,
      activeStep,
    },
    dispatch,
  ] = React.useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case "SET_FORMDATA":
          return {
            ...state,
            formData:
              typeof action.payload === "function"
                ? action.payload(state.formData)
                : action.payload,
          };
        case "SET_LOADING":
          return {
            ...state,
            loading:
              typeof action.payload === "function"
                ? action.payload(state.loading)
                : action.payload,
          };
        case "SET_ERROR":
          return {
            ...state,
            error:
              typeof action.payload === "function"
                ? action.payload(state.error)
                : action.payload,
          };
        case "SET_FOCUSEDFIELD":
          return {
            ...state,
            focusedField:
              typeof action.payload === "function"
                ? action.payload(state.focusedField)
                : action.payload,
          };
        case "SET_COMPLETEDSTEPS":
          return {
            ...state,
            completedSteps:
              typeof action.payload === "function"
                ? action.payload(state.completedSteps)
                : action.payload,
          };
        case "SET_PREDICTIONS":
          return {
            ...state,
            predictions:
              typeof action.payload === "function"
                ? action.payload(state.predictions)
                : action.payload,
          };
        case "SET_ISSEARCHING":
          return {
            ...state,
            isSearching:
              typeof action.payload === "function"
                ? action.payload(state.isSearching)
                : action.payload,
          };
        case "SET_SELECTEDPLACEINFO":
          return {
            ...state,
            selectedPlaceInfo:
              typeof action.payload === "function"
                ? action.payload(state.selectedPlaceInfo)
                : action.payload,
          };
        case "SET_ISPLACESELECTED":
          return {
            ...state,
            isPlaceSelected:
              typeof action.payload === "function"
                ? action.payload(state.isPlaceSelected)
                : action.payload,
          };
        case "SET_ACTIVESTEP":
          return {
            ...state,
            activeStep:
              typeof action.payload === "function"
                ? action.payload(state.activeStep)
                : action.payload,
          };
        default:
          return state;
      }
    },
    {
      formData: {
        businessName: "",
        parentCategoryId: 0,
        bio: "",
        timeZone: "",
        profileImageUrl: "",
        address: "",
        latitude: 0,
        longitude: 0,
        placeId: "",
        contactEmail: "",
        contactPhone: "",
        websiteUrl: "",
        categoryId: 0,
        subCategoryId: 0,
        tagIds: [],
        personType: "",
      },
      loading: false,
      error: null,
      focusedField: null,
      completedSteps: new Set(),
      predictions: [],
      isSearching: false,
      selectedPlaceInfo: null,
      isPlaceSelected: false,
      activeStep: 1,
    },
  );

  const setFormData = (val: any) =>
    dispatch({ type: "SET_FORMDATA", payload: val });
  const setLoading = (val: any) =>
    dispatch({ type: "SET_LOADING", payload: val });
  const setError = (val: any) => dispatch({ type: "SET_ERROR", payload: val });
  const setFocusedField = (val: any) =>
    dispatch({ type: "SET_FOCUSEDFIELD", payload: val });
  const setCompletedSteps = (val: any) =>
    dispatch({ type: "SET_COMPLETEDSTEPS", payload: val });
  const setPredictions = (val: any) =>
    dispatch({ type: "SET_PREDICTIONS", payload: val });
  const setIsSearching = (val: any) =>
    dispatch({ type: "SET_ISSEARCHING", payload: val });
  const setSelectedPlaceInfo = (val: any) =>
    dispatch({ type: "SET_SELECTEDPLACEINFO", payload: val });
  const setIsPlaceSelected = (val: any) =>
    dispatch({ type: "SET_ISPLACESELECTED", payload: val });
  const setActiveStep = (val: any) =>
    dispatch({ type: "SET_ACTIVESTEP", payload: val });

  useEffect(() => {
    if (initialData) {
      setFormData({
        businessName: initialData.businessName || "",
        parentCategoryId:
          initialData.sector?.toUpperCase() === "HEALTH"
            ? 1
            : initialData.sector?.toUpperCase() === "BEAUTY"
              ? 2
              : 0,
        bio: initialData.bio || "",
        timeZone:
          initialData.timeZone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        profileImageUrl: initialData.profileImageUrl || "",
        address: initialData.address || "",
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        placeId: initialData.googlePlaceId || "",
        contactEmail: initialData.contactEmail || "",
        contactPhone: initialData.contactPhone || "",
        websiteUrl: initialData.websiteUrl || "",
        categoryId: initialData.categoryId || 0,
        subCategoryId: initialData.subCategoryId || 0,
        tagIds: initialData.tagIds || [],
        personType: initialData.personType || "",
      });
    }
  }, [initialData]);

  const isStep1Valid =
    formData.businessName.length >= 3 &&
    formData.bio.length >= 20 &&
    (formData.contactPhone ?? "").length >= 10;
  const isStep2Valid = formData.categoryId > 0 && formData.subCategoryId > 0;
  const isStep3Valid =
    formData.address !== "" &&
    formData.latitude !== 0 &&
    formData.longitude !== 0;
  const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid;

  useEffect(() => {
    const newCompleted = new Set<number>();
    if (isStep1Valid) newCompleted.add(1);
    if (isStep2Valid) newCompleted.add(2);
    if (isStep3Valid) newCompleted.add(3);
    setCompletedSteps(newCompleted);
  }, [isStep1Valid, isStep2Valid, isStep3Valid]);

  const completionPercentage = (completedSteps.size / 3) * 100;

  const steps = [
    {
      id: 1,
      title: t("step1_title", { defaultValue: "Identidad del Negocio" }),
      description: t("step1_desc", { defaultValue: "Datos básicos y sector" }),
      icon: Building2,
      completed: completedSteps.has(1),
      valid: isStep1Valid,
    },
    {
      id: 2,
      title: t("step2_title", { defaultValue: "Especialidad y Categorías" }),
      description: t("step2_desc", { defaultValue: "Servicios y etiquetas" }),
      icon: Star,
      completed: completedSteps.has(2),
      valid: isStep2Valid,
    },
    {
      id: 3,
      title: t("step3_title", { defaultValue: "Ubicación Geográfica" }),
      description: t("step3_desc", { defaultValue: "Consultorio o clínica" }),
      icon: MapPin,
      completed: completedSteps.has(3),
      valid: isStep3Valid,
    },
  ];

  const filteredCategories = useMemo(() => {
    if (!formData.parentCategoryId) return [];
    return categories.filter(
      (cat) =>
        Number(cat.parentCategoryId) === Number(formData.parentCategoryId)
    );
  }, [categories, formData.parentCategoryId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (isPlaceSelected) return;
    const searchTerm = formData.businessName;
    if (searchTerm.length >= 3) {
      const handler = setTimeout(async () => {
        setIsSearching(true);
        try {
          const data = await googleService.autocomplete(searchTerm);
          setPredictions(typeof data === "string" ? JSON.parse(data) : data);
        } catch (e) {
          console.error("Autocomplete error:", e);
        } finally {
          setIsSearching(false);
        }
      }, 800);
      return () => clearTimeout(handler);
    } else {
      setPredictions([]);
    }
  }, [formData.businessName, isPlaceSelected]);

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaceSelected(false);
    if (selectedPlaceInfo) setSelectedPlaceInfo(null);
    setFormData((prev: any) => ({ ...prev, businessName: e.target.value }));
  };

  const selectPlace = async (prediction: any) => {
    setIsPlaceSelected(true);
    setPredictions([]);
    const displayName =
      prediction.structuredFormatting?.mainText || prediction.description;
    setFormData((prev: any) => ({ ...prev, businessName: displayName }));
    try {
      const detailsRaw = await googleService.getDetails(prediction.placeId);
      const details =
        typeof detailsRaw === "string" ? JSON.parse(detailsRaw) : detailsRaw;
      setFormData((prev: any) => ({
        ...prev,
        businessName: details.name || displayName,
        contactPhone: (
          details.internationalPhoneNumber ||
          details.formattedPhoneNumber ||
          prev.contactPhone ||
          ""
        ).replace(/\s+/g, ""),
        websiteUrl: details.website || prev.websiteUrl,
        address: details.formattedAddress || prev.address,
        latitude: details.geometry?.location?.lat || prev.latitude,
        longitude: details.geometry?.location?.lng || prev.longitude,
        placeId: details.placeId,
      }));
      setSelectedPlaceInfo({
        rating: details.rating || 0,
        userRatingsTotal: details.userRatingsTotal || 0,
      });
      toast.success("🏪 " + t("imported_ok", { defaultValue: "Datos importados de Google" }));
    } catch (e) {
      console.error("Details error:", e);
      handleApiError(e);
    }
  };

  const selectManualPlace = () => {
    setIsPlaceSelected(true);
    setPredictions([]);
    toast.success("✅ Registro manual de establecimiento seleccionado");
  };

  const handleFinish = async () => {
    if (formData.parentCategoryId === 0 || formData.categoryId === 0) {
      return;
    }
    if (formData.businessName.length < 3 || formData.bio.length < 20) {
      return;
    }
    const success = await saveProfile(formData);
    if (success) {
      toast.success("✅ Perfil guardado correctamente");
      router.push("/onboarding");
    }
  };

  // ── ESTADO: CARGANDO ───────────────────────────────────────────────────────
  if (pageLoading)
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center gap-3 transition-colors font-sans">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400 animate-pulse">
          {t("loading", { defaultValue: "Cargando datos de perfil..." })}
        </p>
      </div>
    );

  // ── ESTADO: ERROR ──────────────────────────────────────────────────────────
  if (pageError)
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex items-center justify-center p-6 transition-colors font-sans">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-[#0a0a0a] border border-red-200 dark:border-red-900/40 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t("error_title", { defaultValue: "Error de Carga" })}
                </h3>
                <p className="text-xs font-medium text-gray-500 leading-relaxed">
                  {pageError}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              className="w-full h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
            >
              <span>{t("retry", { defaultValue: "Reintentar Carga" })}</span>
            </button>
          </div>
        </motion.div>
      </div>
    );

  // ── RENDERIZADO PRINCIPAL ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-28 pb-20 px-6 md:px-12 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("badge", { defaultValue: "Configuración de Perfil Profesional" })}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
            {t("title", { defaultValue: "Información de tu Consultorio o Negocio" })}
          </h1>

          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
            {t("desc", { defaultValue: "Configura la presencia de tu establecimiento o práctica clínica para figurar en el directorio médico y habilitar la agenda digital." })}
          </p>
        </motion.div>

        {/* Stepper Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
        >
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
            
            {/* Header / Progreso */}
            <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{t("progress_title", { defaultValue: "Pasos de Configuración" })}</span>
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  {completedSteps.size} {t("sections_of", { defaultValue: "de 3 secciones completadas" })}
                </p>
              </div>

              <span className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                {Math.round(completionPercentage)}%
              </span>
            </div>

            {/* Linea de Progreso */}
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-600"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {/* Tabs de Pasos */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800/80">
              {steps.map((step) => {
                const isActive = activeStep === step.id;
                const StepIcon = step.icon;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStep(step.id)}
                    className={cn(
                      "flex items-center gap-3.5 p-5 transition-all text-left group",
                      isActive
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                        : "hover:bg-gray-50 dark:hover:bg-[#111]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors",
                        isActive
                          ? "bg-emerald-600 text-white"
                          : step.completed
                            ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      )}
                    >
                      {step.completed ? (
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      ) : (
                        <StepIcon className="w-4 h-4" strokeWidth={2} />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <p className={cn(
                        "text-xs font-bold truncate",
                        isActive ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-white"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 truncate">
                        {step.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </motion.div>

        {/* Formulario Principal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        >
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-sm">
            <AnimatePresence mode="wait">
              
              {/* ── PASO 1: PERFIL BASE ─────────────────────────────────── */}
              {activeStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-8"
                >
                  <AnimatePresence mode="wait">
                    {!formData.personType || !formData.parentCategoryId ? (
                      <motion.div
                        key="config-choice"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="space-y-8"
                      >
                        {/* Selección Tipo de Persona */}
                        <div className="space-y-4">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            ¿Qué tipo de perfil profesional deseas registrar?
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev: any) => ({
                                  ...prev,
                                  personType: "FISICA",
                                }))
                              }
                              className={cn(
                                "p-6 rounded-2xl border text-left transition-all space-y-3 group shadow-sm",
                                formData.personType === "FISICA"
                                  ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                                  : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/30"
                              )}
                            >
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                                <User className="w-5 h-5" strokeWidth={2} />
                              </div>

                              <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-900 dark:text-white">
                                  Profesional Independiente
                                </p>
                                <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                                  Persona Física. Ofrezco consultas de manera individual bajo mi propia cédula profesional.
                                </p>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev: any) => ({
                                  ...prev,
                                  personType: "MORAL",
                                }))
                              }
                              className={cn(
                                "p-6 rounded-2xl border text-left transition-all space-y-3 group shadow-sm",
                                formData.personType === "MORAL"
                                  ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                                  : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/30"
                              )}
                            >
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                                <Building2 className="w-5 h-5" strokeWidth={2} />
                              </div>

                              <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-900 dark:text-white">
                                  Clínica / Centro Médico / Empresa
                                </p>
                                <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                                  Persona Moral. Represento a una clínica, laboratorio o centro de salud con equipo médico.
                                </p>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Selección de Sector */}
                        {formData.personType && (
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800"
                          >
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                              ¿A qué sector pertenece tu práctica?
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev: any) => ({
                                    ...prev,
                                    parentCategoryId: 1,
                                  }))
                                }
                                className={cn(
                                  "p-6 rounded-2xl border text-left transition-all space-y-3 group shadow-sm",
                                  formData.parentCategoryId === 1
                                    ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                                    : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/30"
                                )}
                              >
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                                  <Stethoscope className="w-5 h-5" strokeWidth={2} />
                                </div>

                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                                    {t("health_sector", { defaultValue: "Sector Salud & Medicina" })}
                                  </p>
                                  <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                                    {t("health_desc", { defaultValue: "Atención médica, especialidades clínicas, nutrición y psicología." })}
                                  </p>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev: any) => ({
                                    ...prev,
                                    parentCategoryId: 2,
                                  }))
                                }
                                className={cn(
                                  "p-6 rounded-2xl border text-left transition-all space-y-3 group shadow-sm",
                                  formData.parentCategoryId === 2
                                    ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                                    : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/30"
                                )}
                              >
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                                  <Scissors className="w-5 h-5" strokeWidth={2} />
                                </div>

                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                                    {t("beauty_sector", { defaultValue: "Bienestar & Estética" })}
                                  </p>
                                  <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                                    {t("beauty_desc", { defaultValue: "Servicios de spa, cuidado personal y estética profesional." })}
                                  </p>
                                </div>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      /* Formulario Nombre y Datos */
                      <motion.div
                        key="business-info"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        {/* Selector Resumen */}
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                              {formData.parentCategoryId === 1 ? (
                                <Stethoscope className="w-4 h-4" strokeWidth={2} />
                              ) : (
                                <Scissors className="w-4 h-4" strokeWidth={2} />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white">
                                {t("business_identity", { defaultValue: "Identidad Configurada" })}
                              </p>
                              <p className="text-[11px] font-medium text-gray-400">
                                {formData.personType === "FISICA" ? "Persona Física" : "Persona Moral"} • {formData.parentCategoryId === 1 ? "Sector Salud" : "Bienestar"}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev: any) => ({
                                ...prev,
                                parentCategoryId: null,
                                personType: null,
                              }))
                            }
                            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm"
                          >
                            {t("change_sector", { defaultValue: "Cambiar" })}
                          </button>
                        </div>

                        {/* Nombre Comercial (Autocomplete Google) */}
                        <div className="space-y-1.5 relative">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {t("business_name_label", { defaultValue: "Nombre del Establecimiento o Nombre Profesional *" })}
                            </Label>
                            <span className="text-[10px] font-medium text-gray-400">
                              {t("business_name_hint", { defaultValue: "Google Places Sync" })}
                            </span>
                          </div>

                          <div className="relative">
                            <Building2
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                              strokeWidth={2}
                            />
                            <Input
                              name="businessName"
                              value={formData.businessName}
                              onChange={handleBusinessNameChange}
                              onFocus={() => setFocusedField("businessName")}
                              onBlur={() => setFocusedField(null)}
                              placeholder={
                                formData.parentCategoryId === 1
                                  ? t("business_placeholder_health", { defaultValue: "Ej. Dr. Marcos Sandoval / Clínica Central" })
                                  : t("business_placeholder_beauty", { defaultValue: "Ej. Studio Estética QuHealthy" })
                              }
                              className="h-11 pl-10 pr-10 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 shadow-sm"
                            />
                            {isSearching && (
                              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                              </div>
                            )}
                          </div>

                          {/* Sugerencias Google Places */}
                          <AnimatePresence>
                            {(predictions.length > 0 ||
                              (formData.businessName.length >= 3 &&
                                !isPlaceSelected)) && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute w-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl mt-1.5 shadow-xl max-h-56 overflow-y-auto z-50 p-1 space-y-1"
                              >
                                {predictions.map((p: any) => (
                                  <button
                                    key={p.placeId}
                                    onClick={() => selectPlace(p)}
                                    type="button"
                                    className="w-full p-3 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-[#111] flex items-start gap-3 transition-colors"
                                  >
                                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                                    <div>
                                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                                        {p.structuredFormatting?.mainText || p.description}
                                      </p>
                                      <p className="text-[10px] font-medium text-gray-400">
                                        {p.structuredFormatting?.secondaryText}
                                      </p>
                                    </div>
                                  </button>
                                ))}

                                <button
                                  type="button"
                                  onClick={selectManualPlace}
                                  className="w-full p-3 text-left rounded-xl bg-gray-50/80 dark:bg-[#050505] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-gray-100 dark:border-gray-800 flex items-center gap-3 transition-colors"
                                >
                                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                                  <div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                                      Usar "{formData.businessName}"
                                    </p>
                                    <p className="text-[10px] font-medium text-gray-400">
                                      Ingresar datos manualmente sin vincular Google Places
                                    </p>
                                  </div>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Tarjeta Datos Google */}
                        {selectedPlaceInfo && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3"
                          >
                            <div className="flex justify-between items-center">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{t("linked_data", { defaultValue: "Google Places Vinculado" })}</span>
                              </span>

                              <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>{selectedPlaceInfo.rating}</span>
                                <span className="text-[10px] text-gray-400">({selectedPlaceInfo.userRatingsTotal})</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs font-bold text-gray-900 dark:text-white">
                                {formData.businessName}
                              </p>
                              <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>{formData.address}</span>
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {/* Bio / Descripción */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {t("bio_label", { defaultValue: "Descripción Profesional / Reseña Clínica *" })}
                            </Label>
                            <span className="text-[10px] font-mono font-bold text-gray-400">
                              {formData.bio.length} / 20 mín.
                            </span>
                          </div>

                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField("bio")}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Describe tu trayectoria, enfoque clínico, años de experiencia y servicios..."
                            className="w-full min-h-[110px] rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 p-3.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                          />
                        </div>

                        {/* Teléfono */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {t("phone_label", { defaultValue: "Teléfono de Contacto Directo *" })}
                          </Label>

                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                            <Input
                              name="contactPhone"
                              value={formData.contactPhone || ""}
                              onChange={handleInputChange}
                              onFocus={() => setFocusedField("contactPhone")}
                              onBlur={() => setFocusedField(null)}
                              placeholder="+52 55 1234 5678"
                              className="h-11 pl-10 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 shadow-sm"
                            />
                          </div>
                        </div>

                        {/* Zona Horaria */}
                        <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                          <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            <span>Zona Horaria Sincronizada: </span>
                            <strong className="font-bold text-gray-900 dark:text-white font-mono">
                              {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </strong>
                          </div>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ── PASO 2: ESPECIALIDAD Y CATEGORÍAS ──────────────────── */}
              {activeStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                        <Star className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          {t("specialty_title", { defaultValue: "Categoría y Especialidades" })}
                        </h3>
                        <p className="text-xs font-medium text-gray-400">
                          {t("specialty_desc", { defaultValue: "Selecciona las áreas médicas o de servicio" })}
                        </p>
                      </div>
                    </div>

                    {completedSteps.has(2) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Configurado</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <CategorySelector
                      tags={tags}
                      categories={filteredCategories}
                      onGetSubCategories={getSubCategories}
                      selectedCategoryId={formData.categoryId}
                      selectedSubCategoryId={formData.subCategoryId}
                      selectedTagIds={formData.tagIds}
                      onSelectionChange={(catId, subId, tagIds) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          categoryId: catId,
                          subCategoryId: subId,
                          tagIds,
                        }))
                      }
                      onCreateCategory={(name) => createCategory(name, formData.parentCategoryId)}
                      onCreateSubCategory={createSubcategory}
                      onCreateTag={createTag}
                    />
                  </div>
                </motion.div>
              )}

              {/* ── PASO 3: UBICACIÓN GEOGRÁFICA ─────────────────────────── */}
              {activeStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                        <MapPin className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          {t("location_title", { defaultValue: "Geolocalización del Consultorio" })}
                        </h3>
                        <p className="text-xs font-medium text-gray-400">
                          {t("location_desc", { defaultValue: "Ubica tu establecimiento en la cartografía" })}
                        </p>
                      </div>
                    </div>

                    {completedSteps.has(3) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ubicación Lista</span>
                      </span>
                    )}
                  </div>

                  {/* Resumen Dirección */}
                  <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-start gap-3">
                    <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Dirección Registrada
                      </p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {formData.address || "No especificada todavía en el mapa."}
                      </p>
                    </div>
                  </div>

                  {/* Mapa Interactivo */}
                  <div className="h-[380px] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                    <LocationPicker
                      className="w-full h-full"
                      initialLocation={{
                        address: formData.address || "",
                        lat: formData.latitude || 23.6345,
                        lng: formData.longitude || -102.5528,
                      }}
                      onLocationSelect={(data) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          address: data.address,
                          latitude: data.lat,
                          longitude: data.lng,
                          placeId: data.placeId || prev.placeId,
                        }));
                        setCompletedSteps((prev: any) => new Set(prev).add(3));
                      }}
                    />
                  </div>

                  {isStep3Valid && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            Ubicación Geográfica Confirmada
                          </p>
                          <p className="text-[11px] font-medium text-gray-500">
                            Tu consultorio figurará correctamente en el directorio de la plataforma.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleFinish}
                        disabled={!isFormValid || isSaving}
                        className="h-10 px-5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        {isSaving ? "Guardando..." : "Guardar Perfil"}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            {/* Acciones de Navegación */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <div>
                {activeStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev: number) => prev - 1)}
                    className="h-11 px-5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Atrás
                  </button>
                )}
              </div>

              <div>
                {activeStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev: number) => prev + 1)}
                    disabled={
                      (activeStep === 1 && !isStep1Valid) ||
                      (activeStep === 2 && !isStep2Valid)
                    }
                    className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Siguiente Paso</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={!isFormValid || isSaving}
                    className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <QhSpinner size="sm" className="text-white" />
                        <span>{t("saving", { defaultValue: "Guardando..." })}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Guardar Perfil Profesional</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        </motion.div>

        {/* Footer Seguridad */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 pb-4">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>Información encriptada e integrada bajo estándar de seguridad SSL.</span>
        </div>

      </div>
    </div>
  );
}