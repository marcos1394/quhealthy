/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Phone, ArrowRight, Loader2, MapPin, Sparkles, AlertCircle, CheckCircle2, Star, User, Info, Lock, Zap, ChevronRight, Shield, Trophy, Check, Navigation, Stethoscope, Scissors } from "lucide-react";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import LocationPicker from "@/components/shared/location/LocationPicker";
import CategorySelector from "@/components/shared/CategorySelector";
import { useProfileOnboarding } from "@/hooks/useProfileOnboarding";
import { UpdateProfileRequest } from "@/types/onboarding";
import { cn } from "@/lib/utils";
import { googleService } from "@/services/google.service";
import { handleApiError } from '@/lib/handleApiError';

export default function OnboardingProfilePage() {
  const router = useRouter();
  const t = useTranslations("OnboardingProfile");

  const { initialData, isLoading: pageLoading, isSaving, saveProfile, error: pageError, refetch, categories, tags, getSubCategories } = useProfileOnboarding();

    const [{ formData, loading, error, focusedField, completedSteps, predictions, isSearching, selectedPlaceInfo, isPlaceSelected, activeStep }, dispatch] = React.useReducer(
      (state: any, action: any) => {
        switch (action.type) {
      case 'SET_FORMDATA': return { ...state, formData: typeof action.payload === 'function' ? action.payload(state.formData) : action.payload };
      case 'SET_LOADING': return { ...state, loading: typeof action.payload === 'function' ? action.payload(state.loading) : action.payload };
      case 'SET_ERROR': return { ...state, error: typeof action.payload === 'function' ? action.payload(state.error) : action.payload };
      case 'SET_FOCUSEDFIELD': return { ...state, focusedField: typeof action.payload === 'function' ? action.payload(state.focusedField) : action.payload };
      case 'SET_COMPLETEDSTEPS': return { ...state, completedSteps: typeof action.payload === 'function' ? action.payload(state.completedSteps) : action.payload };
      case 'SET_PREDICTIONS': return { ...state, predictions: typeof action.payload === 'function' ? action.payload(state.predictions) : action.payload };
      case 'SET_ISSEARCHING': return { ...state, isSearching: typeof action.payload === 'function' ? action.payload(state.isSearching) : action.payload };
      case 'SET_SELECTEDPLACEINFO': return { ...state, selectedPlaceInfo: typeof action.payload === 'function' ? action.payload(state.selectedPlaceInfo) : action.payload };
      case 'SET_ISPLACESELECTED': return { ...state, isPlaceSelected: typeof action.payload === 'function' ? action.payload(state.isPlaceSelected) : action.payload };
      case 'SET_ACTIVESTEP': return { ...state, activeStep: typeof action.payload === 'function' ? action.payload(state.activeStep) : action.payload };
          default: return state;
        }
      },
      {
        formData: {
    businessName: "", parentCategoryId: 0, bio: "", timeZone: "", profileImageUrl: "",
    address: "", latitude: 0, longitude: 0, placeId: "", contactEmail: "",
    contactPhone: "", websiteUrl: "", categoryId: 0, subCategoryId: 0, tagIds: [],
    personType: "" 
  }, loading: false, error: null, focusedField: null, completedSteps: new Set(), predictions: [], isSearching: false, selectedPlaceInfo: null, isPlaceSelected: false, activeStep: 1
      }
    );

    const setFormData = (val: any) => dispatch({ type: 'SET_FORMDATA', payload: val });
    const setLoading = (val: any) => dispatch({ type: 'SET_LOADING', payload: val });
    const setError = (val: any) => dispatch({ type: 'SET_ERROR', payload: val });
    const setFocusedField = (val: any) => dispatch({ type: 'SET_FOCUSEDFIELD', payload: val });
    const setCompletedSteps = (val: any) => dispatch({ type: 'SET_COMPLETEDSTEPS', payload: val });
    const setPredictions = (val: any) => dispatch({ type: 'SET_PREDICTIONS', payload: val });
    const setIsSearching = (val: any) => dispatch({ type: 'SET_ISSEARCHING', payload: val });
    const setSelectedPlaceInfo = (val: any) => dispatch({ type: 'SET_SELECTEDPLACEINFO', payload: val });
    const setIsPlaceSelected = (val: any) => dispatch({ type: 'SET_ISPLACESELECTED', payload: val });
    const setActiveStep = (val: any) => dispatch({ type: 'SET_ACTIVESTEP', payload: val });












  useEffect(() => {
    if (initialData) {
      setFormData({
        businessName: initialData.businessName || "",
        parentCategoryId: initialData.sector === 'HEALTH' ? 1 : initialData.sector === 'BEAUTY' ? 2 : 0,
        bio: initialData.bio || "", timeZone: initialData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        profileImageUrl: initialData.profileImageUrl || "", address: initialData.address || "",
        latitude: initialData.latitude || 0, longitude: initialData.longitude || 0,
        placeId: initialData.googlePlaceId || "", contactEmail: initialData.contactEmail || "",
        contactPhone: initialData.contactPhone || "", websiteUrl: initialData.websiteUrl || "",
        categoryId: initialData.categoryId || 0, subCategoryId: initialData.subCategoryId || 0,
        tagIds: initialData.tagIds || [],
        personType: initialData.personType || ""
      });
    }
  }, [initialData]);

  const isStep1Valid = formData.businessName.length >= 3 && formData.bio.length >= 20 && (formData.contactPhone ?? "").length >= 10;
  const isStep2Valid = formData.categoryId > 0 && formData.subCategoryId > 0;
  const isStep3Valid = formData.address !== "" && formData.latitude !== 0 && formData.longitude !== 0;
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
    { id: 1, title: t("step1_title"), description: t("step1_desc"), icon: Building2, completed: completedSteps.has(1), valid: isStep1Valid },
    { id: 2, title: t("step2_title"), description: t("step2_desc"), icon: Star, completed: completedSteps.has(2), valid: isStep2Valid },
    { id: 3, title: t("step3_title"), description: t("step3_desc"), icon: MapPin, completed: completedSteps.has(3), valid: isStep3Valid }
  ];

  const filteredCategories = useMemo(() => {
    if (!formData.parentCategoryId) return [];
    return categories.filter(cat => Number(cat.parentCategoryId) === Number(formData.parentCategoryId));
  }, [categories, formData.parentCategoryId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (isPlaceSelected) return;
    const searchTerm = formData.businessName;
    if (searchTerm.length >= 3) {
      const handler = setTimeout(async () => {
        setIsSearching(true);
        try { const data = await googleService.autocomplete(searchTerm); setPredictions(typeof data === "string" ? JSON.parse(data) : data); }
        catch (e) { console.error("Autocomplete error:", e); }
        finally { setIsSearching(false); }
      }, 800);
      return () => clearTimeout(handler);
    } else { setPredictions([]); }
  }, [formData.businessName, isPlaceSelected]);

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaceSelected(false); if (selectedPlaceInfo) setSelectedPlaceInfo(null);
    setFormData((prev: any) => ({ ...prev, businessName: e.target.value }));
  };

  const selectPlace = async (prediction: any) => {
    setIsPlaceSelected(true); setPredictions([]);
    const displayName = prediction.structuredFormatting?.mainText || prediction.description;
    setFormData((prev: any) => ({ ...prev, businessName: displayName }));
    try {
      const detailsRaw = await googleService.getDetails(prediction.placeId);
      const details = typeof detailsRaw === "string" ? JSON.parse(detailsRaw) : detailsRaw;
      setFormData((prev: any) => ({
        ...prev, businessName: details.name || displayName,
        contactPhone: (details.internationalPhoneNumber || details.formattedPhoneNumber || prev.contactPhone || "").replace(/\s+/g, ""),
        websiteUrl: details.website || prev.websiteUrl, address: details.formattedAddress || prev.address,
        latitude: details.geometry?.location?.lat || prev.latitude, longitude: details.geometry?.location?.lng || prev.longitude,
        placeId: details.placeId
      }));
      setSelectedPlaceInfo({ rating: details.rating || 0, userRatingsTotal: details.userRatingsTotal || 0 });
      toast.success("🏪 " + t("imported_ok"));
    } catch (e) { console.error("Details error:", e); handleApiError(e); }
  };

  const handleFinish = async () => {
    if (formData.parentCategoryId === 0 || formData.categoryId === 0) { return; }
    if (formData.businessName.length < 3 || formData.bio.length < 20) { return; }
    const success = await saveProfile(formData);
    if (success) { toast.success("✅ Perfil guardado"); router.push("/onboarding"); }
  };

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------------------------
  if (pageLoading) return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 transition-colors">
      <QhSpinner size="lg" label={t("loading")} />
    </div>
  );

  // ---------------------------------------------------------------------------
  // ERROR STATE
  // ---------------------------------------------------------------------------
  if (pageError) return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-6 transition-colors">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#0a0a0a] p-8 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 border border-red-200 dark:border-red-900 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">
                {t("error_title")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                {pageError}
              </p>
            </div>
          </div>
          <button 
            onClick={() => refetch()} 
            className="w-full rounded-none bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center"
          >
            <Loader2 className="w-3.5 h-3.5 mr-3 animate-spin" /> {t("retry")}
          </button>
        </div>
      </motion.div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // MAIN COMPONENT
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] p-4 md:p-8 transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
      <div className="max-w-4xl mx-auto relative z-10 space-y-10">
        
        {/* Editorial Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="border-l-2 border-black dark:border-white pl-4 mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} /> {t("badge")}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-black dark:text-white tracking-tight mb-4">
            {t("title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-light max-w-2xl">
            {t("desc")}
          </p>
        </motion.div>

        {/* Architectual Stepper */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-black dark:text-white flex items-center gap-3 mb-1">
                  <Trophy className="w-4 h-4" strokeWidth={1.5} /> {t("progress_title")}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                  {completedSteps.size} {t("sections_of")}
                </p>
              </div>
              <span className="text-4xl font-semibold tracking-tighter text-black dark:text-white mt-4 sm:mt-0">
                {Math.round(completionPercentage)}%
              </span>
            </div>

            {/* Progress Line */}
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-black dark:bg-white"
                initial={{ width: 0 }} animate={{ width: `${completionPercentage}%` }} transition={{ duration: 0.5 }}
              />
            </div>

            {/* Step Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
              {steps.map(step => {
                const isActive = activeStep === step.id;
                return (
                  <button 
                    key={step.id} 
                    onClick={() => setActiveStep(step.id)}
                    className={cn(
                      "flex items-center gap-4 p-6 transition-colors text-left",
                      isActive ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#050505]"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 border flex items-center justify-center shrink-0 transition-colors",
                      isActive ? "border-white dark:border-black" : "border-gray-300 dark:border-gray-700",
                      step.completed && !isActive ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : ""
                    )}>
                      {step.completed ? <Check className="w-4 h-4" strokeWidth={2} /> : <step.icon className="w-4 h-4" strokeWidth={1.5} />}
                    </div>
                    <div>
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-widest mb-1",
                        isActive ? "text-white dark:text-black" : "text-black dark:text-white"
                      )}>
                        {step.title}
                      </p>
                      <p className={cn(
                        "text-[9px] font-light uppercase tracking-widest",
                        isActive ? "text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"
                      )}>
                        {step.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Form Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 md:p-12">
            <AnimatePresence mode="wait">
              
              {/* --- STEP 1: PERFIL BASE --- */}
              {activeStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                  <AnimatePresence mode="wait">
                    {!formData.personType || !formData.parentCategoryId ? (
                      <motion.div key="config-choice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                        
                        {/* Person Type */}
                        <div className="space-y-6">
                          <h3 className="text-xl font-semibold text-black dark:text-white tracking-tight">¿Qué tipo de perfil deseas crear?</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 dark:border-gray-800">
                            <button 
                              onClick={() => setFormData((prev: any) => ({ ...prev, personType: 'FISICA' }))}
                              className={cn("p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 transition-colors text-left group", formData.personType === 'FISICA' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-50 dark:bg-[#050505] hover:bg-gray-100 dark:hover:bg-[#0a0a0a]")}
                            >
                              <div className={cn("w-12 h-12 border flex items-center justify-center mb-6", formData.personType === 'FISICA' ? "border-white dark:border-black" : "border-black dark:border-white")}>
                                <User className="w-5 h-5" strokeWidth={1.5} />
                              </div>
                              <p className="text-sm font-bold uppercase tracking-widest mb-2">Profesional Independiente</p>
                              <p className={cn("text-xs font-light leading-relaxed", formData.personType === 'FISICA' ? "text-gray-400 dark:text-gray-600" : "text-gray-500")}>Persona Física. Ofrezco mis servicios de manera individual.</p>
                            </button>

                            <button 
                              onClick={() => setFormData((prev: any) => ({ ...prev, personType: 'MORAL' }))}
                              className={cn("p-8 transition-colors text-left group", formData.personType === 'MORAL' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-50 dark:bg-[#050505] hover:bg-gray-100 dark:hover:bg-[#0a0a0a]")}
                            >
                              <div className={cn("w-12 h-12 border flex items-center justify-center mb-6", formData.personType === 'MORAL' ? "border-white dark:border-black" : "border-black dark:border-white")}>
                                <Building2 className="w-5 h-5" strokeWidth={1.5} />
                              </div>
                              <p className="text-sm font-bold uppercase tracking-widest mb-2">Clínica / Empresa</p>
                              <p className={cn("text-xs font-light leading-relaxed", formData.personType === 'MORAL' ? "text-gray-400 dark:text-gray-600" : "text-gray-500")}>Persona Moral. Represento a una clínica, consultorio o equipo.</p>
                            </button>
                          </div>
                        </div>

                        {/* Sector (Render only if personType is selected) */}
                        {formData.personType && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-12 border-t border-gray-200 dark:border-gray-800">
                            <h3 className="text-xl font-semibold text-black dark:text-white tracking-tight">¿A qué industria perteneces?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 dark:border-gray-800">
                              
                              <button 
                                onClick={() => setFormData((prev: any) => ({ ...prev, parentCategoryId: 1 }))}
                                className={cn("p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 transition-colors text-left group", formData.parentCategoryId === 1 ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-50 dark:bg-[#050505] hover:bg-gray-100 dark:hover:bg-[#0a0a0a]")}
                              >
                                <div className={cn("w-12 h-12 border flex items-center justify-center mb-6", formData.parentCategoryId === 1 ? "border-white dark:border-black" : "border-black dark:border-white")}>
                                  <Stethoscope className="w-5 h-5" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-bold uppercase tracking-widest mb-2">{t("health_sector")}</p>
                                <p className={cn("text-xs font-light leading-relaxed", formData.parentCategoryId === 1 ? "text-gray-400 dark:text-gray-600" : "text-gray-500")}>{t("health_desc")}</p>
                              </button>

                              <button 
                                onClick={() => setFormData((prev: any) => ({ ...prev, parentCategoryId: 2 }))}
                                className={cn("p-8 transition-colors text-left group", formData.parentCategoryId === 2 ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-50 dark:bg-[#050505] hover:bg-gray-100 dark:hover:bg-[#0a0a0a]")}
                              >
                                <div className={cn("w-12 h-12 border flex items-center justify-center mb-6", formData.parentCategoryId === 2 ? "border-white dark:border-black" : "border-black dark:border-white")}>
                                  <Scissors className="w-5 h-5" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-bold uppercase tracking-widest mb-2">{t("beauty_sector")}</p>
                                <p className={cn("text-xs font-light leading-relaxed", formData.parentCategoryId === 2 ? "text-gray-400 dark:text-gray-600" : "text-gray-500")}>{t("beauty_desc")}</p>
                              </button>

                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div key="business-info" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        
                        <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
                              {formData.parentCategoryId === 1 ? <Stethoscope className="w-5 h-5" strokeWidth={1.5} /> : <Scissors className="w-5 h-5" strokeWidth={1.5} />}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">{t("business_identity")}</h3>
                              <p className="text-[10px] text-gray-500 font-light">{t("business_sync")}</p>
                            </div>
                          </div>
                          <button onClick={() => setFormData((prev: any) => ({ ...prev, parentCategoryId: null, personType: null }))}
                            className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors border border-gray-200 dark:border-gray-800 px-3 py-1.5">
                            {t("change_sector")}
                          </button>
                        </div>

                        {/* Business Name (Autocomplete) */}
                        <div className="space-y-3 relative z-20">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center justify-between">
                            {t("business_name_label")}
                            <span className="text-[9px] text-gray-400 font-light lowercase tracking-normal">{t("business_name_hint")}</span>
                          </Label>
                          <div className="relative group">
                            <Building2 className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", focusedField === "businessName" ? "text-black dark:text-white" : "text-gray-400")} strokeWidth={1.5} />
                            <Input 
                              name="businessName" 
                              value={formData.businessName} 
                              onChange={handleBusinessNameChange} 
                              onFocus={() => setFocusedField("businessName")} 
                              onBlur={() => setFocusedField(null)}
                              placeholder={formData.parentCategoryId === 1 ? t("business_placeholder_health") : t("business_placeholder_beauty")}
                              className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-14 pl-12 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white text-sm" 
                            />
                            {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-black dark:text-white" />}
                          </div>
                          
                          <AnimatePresence>
                            {predictions.length > 0 && (
                              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="absolute w-full bg-white dark:bg-[#0a0a0a] border border-black dark:border-white mt-1 shadow-2xl max-h-60 overflow-y-auto z-50">
                                {predictions.map((p: any) => (
                                  <button key={p.placeId} onClick={() => selectPlace(p)} type="button"
                                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-200 dark:border-gray-800 last:border-0 flex items-start gap-3 transition-colors">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" strokeWidth={1.5} />
                                    <div>
                                      <p className="text-xs font-bold uppercase tracking-widest text-black dark:text-white mb-0.5">{p.structuredFormatting.mainText}</p>
                                      <p className="text-[10px] text-gray-500 font-light">{p.structuredFormatting.secondaryText}</p>
                                    </div>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Google Card Import (Architectural Format) */}
                        {selectedPlaceInfo && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
                            <div className="p-6 space-y-4">
                              <div className="flex justify-between items-start">
                                <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                                  {t("linked_data")}
                                </span>
                                <div className="flex items-center gap-1.5 border border-gray-300 dark:border-gray-700 px-2 py-0.5 bg-white dark:bg-black">
                                  <Star className="w-3 h-3 text-black dark:text-white fill-current" />
                                  <span className="font-bold text-[10px] text-black dark:text-white">{selectedPlaceInfo.rating}</span>
                                  <span className="text-[9px] text-gray-500">({selectedPlaceInfo.userRatingsTotal})</span>
                                </div>
                              </div>
                              <div className="flex gap-4">
                                <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center shrink-0">
                                  <Building2 className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">{formData.businessName}</h4>
                                  <p className="text-[10px] text-gray-500 flex items-center gap-1 font-light"><MapPin className="w-3 h-3" />{formData.address}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white dark:bg-black border-t border-black dark:border-white p-3 flex justify-between items-center">
                              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white" /> {t("imported_ok")}</p>
                              <button type="button" className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors" onClick={() => setSelectedPlaceInfo(null)}>
                                {t("change")}
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* Bio */}
                        <div className="space-y-3 z-10 relative">
                          <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{t("bio_label")}</Label>
                            <span className={cn("text-[9px] font-bold uppercase tracking-widest border px-2 py-0.5",
                              formData.bio.length >= 20 ? "border-black dark:border-white text-black dark:text-white" : "border-gray-300 dark:border-gray-700 text-gray-400")}>
                              {formData.bio.length} / 20 {t("bio_min")}
                            </span>
                          </div>
                          <textarea 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleInputChange} 
                            onFocus={() => setFocusedField("bio")} 
                            onBlur={() => setFocusedField(null)}
                            placeholder="Describe tu trayectoria, especialidad y enfoque..."
                            className="w-full min-h-[120px] rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 p-4 text-sm focus:border-black dark:focus:border-white focus:ring-0 transition-all outline-none resize-none font-light" 
                          />
                        </div>

                        {/* Phone */}
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{t("phone_label")}</Label>
                          <div className="relative">
                            <Phone className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", focusedField === "contactPhone" ? "text-black dark:text-white" : "text-gray-400")} strokeWidth={1.5} />
                            <Input 
                              name="contactPhone" 
                              value={formData.contactPhone || ""} 
                              onChange={handleInputChange} 
                              onFocus={() => setFocusedField("contactPhone")} 
                              onBlur={() => setFocusedField(null)}
                              placeholder="+52 55 1234 5678"
                              className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-14 pl-12 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white text-sm" 
                            />
                          </div>
                        </div>

                        {/* Timezone (Margin Note Style) */}
                        <div className="border-l-2 border-black dark:border-white pl-4 py-2 bg-gray-50 dark:bg-[#050505]">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-1 flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5" /> {t("timezone_title")}
                          </p>
                          <p className="text-xs text-gray-500 font-light">
                            {t("timezone_desc")} <span className="font-bold text-black dark:text-white">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                          </p>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* --- STEP 2: SPECIALTY --- */}
              {activeStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
                        <Star className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">{t("specialty_title")}</h3>
                        <p className="text-[10px] text-gray-500 font-light">{t("specialty_desc")}</p>
                      </div>
                    </div>
                    {completedSteps.has(2) && (
                      <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest border border-black dark:border-white px-2 py-1 bg-black text-white dark:bg-white dark:text-black">
                        <CheckCircle2 className="w-3 h-3" /> {t("configured")}
                      </span>
                    )}
                  </div>
                  
                  <div className="p-1">
                    {/* Category Selector ya fue refactorizado previamente a estilo Arquitectónico */}
                    <CategorySelector tags={tags} categories={filteredCategories} onGetSubCategories={getSubCategories}
                      selectedCategoryId={formData.categoryId} selectedSubCategoryId={formData.subCategoryId} selectedTagIds={formData.tagIds}
                      onSelectionChange={(catId, subId, tagIds) => setFormData((prev: any) => ({ ...prev, categoryId: catId, subCategoryId: subId, tagIds }))} />
                  </div>
                </motion.div>
              )}

              {/* --- STEP 3: LOCATION --- */}
              {activeStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
                        <MapPin className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">{t("location_title")}</h3>
                        <p className="text-[10px] text-gray-500 font-light">{t("location_desc")}</p>
                      </div>
                    </div>
                    {completedSteps.has(3) && (
                      <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest border border-black dark:border-white px-2 py-1 bg-black text-white dark:bg-white dark:text-black">
                        <CheckCircle2 className="w-3 h-3" /> {t("location_ready")}
                      </span>
                    )}
                  </div>

                  <div className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-5 flex items-start gap-4">
                    <div className="w-8 h-8 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
                      <Navigation className="w-4 h-4 text-black dark:text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Dirección Detectada</p>
                      <p className="text-sm font-light text-black dark:text-white">{formData.address || "No especificada"}</p>
                    </div>
                  </div>

                  {/* Location Picker ya fue refactorizado a Blueprint */}
                  <div className="h-[400px] relative z-0">
                    <LocationPicker className="w-full h-full"
                      initialLocation={{ address: formData.address || "", lat: formData.latitude || 19.4326, lng: formData.longitude || -99.1332 }}
                      onLocationSelect={(data) => { setFormData((prev: any) => ({ ...prev, address: data.address, latitude: data.lat, longitude: data.lng, placeId: data.placeId || prev.placeId })); setCompletedSteps((prev: any) => new Set(prev).add(3)); }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Footer (Flush Buttons) */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                {activeStep > 1 && (
                  <button type="button" onClick={() => setActiveStep((prev: number) => prev - 1)}
                    className="h-14 px-8 border border-gray-200 dark:border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">
                    Atrás
                  </button>
                )}
              </div>
              <div>
                {activeStep < 3 ? (
                  <button type="button" onClick={() => setActiveStep((prev: number) => prev + 1)}
                    disabled={(activeStep === 1 && !isStep1Valid) || (activeStep === 2 && !isStep2Valid)}
                    className={cn("group h-14 px-8 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center",
                      (activeStep === 1 && isStep1Valid) || (activeStep === 2 && isStep2Valid)
                        ? "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                        : "bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed")}>
                    Siguiente <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button type="button" onClick={handleFinish} disabled={!isFormValid || isSaving}
                    className={cn("group h-14 px-8 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center",
                      isFormValid ? "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200" : "bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed")}>
                    {isSaving ? <><Loader2 className="w-4 h-4 mr-3 animate-spin" />{t("saving")}</> :
                      <><Sparkles className="w-4 h-4 mr-3" />{t("finish")}<ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" /></>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 pb-8">
          <Shield className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Your data is protected with SSL encryption</span>
        </motion.div>

      </div>
    </div>
  );
}