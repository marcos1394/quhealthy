/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Phone, ArrowRight, Loader2, MapPin, Sparkles, AlertCircle, CheckCircle2, Star, User, Info, Lock, Zap, ChevronRight, Shield, Trophy, Check, Navigation, Stethoscope, Scissors } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import LocationPicker from "@/components/shared/location/LocationPicker";
import CategorySelector from "@/components/shared/CategorySelector";
import { useProfileOnboarding } from "@/hooks/useProfileOnboarding";
import { UpdateProfileRequest } from "@/types/onboarding";
import { cn } from "@/lib/utils";
import { googleService } from "@/services/google.service";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const t = useTranslations("OnboardingProfile");

  const { initialData, isLoading: pageLoading, isSaving, saveProfile, error: pageError, refetch, categories, tags, getSubCategories } = useProfileOnboarding();

  const [formData, setFormData] = useState<any>({
    businessName: "", parentCategoryId: 0, bio: "", timeZone: "", profileImageUrl: "",
    address: "", latitude: 0, longitude: 0, placeId: "", contactEmail: "",
    contactPhone: "", websiteUrl: "", categoryId: 0, subCategoryId: 0, tagIds: [],
    personType: "" // Start empty to force selection
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlaceInfo, setSelectedPlaceInfo] = useState<any>(null);
  const [isPlaceSelected, setIsPlaceSelected] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

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
    } catch (e) { console.error("Details error:", e); toast.error("Could not sync detailed info"); }
  };

  const handleFinish = async () => {
    if (formData.parentCategoryId === 0 || formData.categoryId === 0) { toast.error("Please select your sector and specialty."); return; }
    if (formData.businessName.length < 3 || formData.bio.length < 20) { toast.error("Business name and bio are required."); return; }
    const success = await saveProfile(formData);
    if (success) { toast.success("✅ Profile saved!"); router.push("/onboarding"); }
  };

  if (pageLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center flex-col gap-4 transition-colors">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Sparkles className="w-10 h-10 text-medical-600 dark:text-medical-400" />
      </motion.div>
      <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse font-light">{t("loading")}</p>
    </div>
  );

  if (pageError) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-w-md shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl"><AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" /></div>
              <div><h3 className="font-semibold text-red-600 dark:text-red-400">{t("error_title")}</h3><p className="text-sm text-slate-500 dark:text-slate-400 font-light">{pageError}</p></div>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="w-full border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <Loader2 className="w-4 h-4 mr-2" />{t("retry")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0 mb-1">
            <Sparkles className="w-3 h-3 mr-1" />{t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white tracking-tight">{t("title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light">{t("desc")}</p>
        </motion.div>

        {/* Progress Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-medical-600 dark:text-medical-400" />{t("progress_title")}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-light">{completedSteps.size} {t("sections_of")}</p>
                </div>
                <span className="text-3xl font-medium text-medical-600 dark:text-medical-400">{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2 mb-5 bg-slate-100 dark:bg-slate-800" />
              <div className="grid grid-cols-3 gap-3">
                {steps.map(step => (
                  <button key={step.id} onClick={() => setActiveStep(step.id)}
                    className={cn("flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                      activeStep === step.id ? "bg-slate-100 dark:bg-slate-800 ring-1 ring-medical-500/30" : "",
                      step.completed ? "bg-medical-50/50 dark:bg-medical-500/5" : "")}>
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center border transition-all",
                      step.completed ? "bg-medical-600 dark:bg-medical-500 border-medical-500 text-white" : "",
                      !step.completed && step.valid ? "bg-medical-50 dark:bg-medical-500/10 border-medical-500 text-medical-600 dark:text-medical-400" : "",
                      !step.completed && !step.valid && activeStep === step.id ? "bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300" : "",
                      !step.completed && !step.valid && activeStep !== step.id ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500" : "")}>
                      {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <div className="text-center">
                      <p className={cn("text-xs font-medium",
                        step.completed ? "text-medical-600 dark:text-medical-400" : "",
                        !step.completed && step.valid ? "text-medical-600 dark:text-medical-400" : "",
                        !step.completed && !step.valid ? "text-slate-500" : "")}>{step.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light">{step.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-6 md:p-8 space-y-8">
              <AnimatePresence mode="wait">
                {/* Step 1 */}
                {activeStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <AnimatePresence mode="wait">
                      {!formData.personType || !formData.parentCategoryId ? (
                        <motion.div key="config-choice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                          {/* Person Type */}
                          <div className="space-y-4">
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-medium text-slate-900 dark:text-white">¿Qué tipo de perfil deseas crear?</h3>
                              <p className="text-slate-500 dark:text-slate-400 font-light">Esto determinará los siguientes pasos del registro.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <button onClick={() => setFormData((prev: any) => ({ ...prev, personType: 'FISICA' }))}
                                className={cn("relative p-6 rounded-xl border border-slate-200 dark:border-slate-800 transition-all text-left", formData.personType === 'FISICA' ? "ring-2 ring-medical-500 bg-medical-50/50 dark:bg-medical-500/10" : "bg-white dark:bg-slate-900 hover:border-medical-300")}>
                                <div className="p-3 bg-medical-100 dark:bg-medical-500/20 rounded-xl w-fit mb-3">
                                  <User className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                                </div>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Profesional Independiente</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-light">Persona Física. Ofrezco mis servicios de manera individual.</p>
                              </button>
                              <button onClick={() => setFormData((prev: any) => ({ ...prev, personType: 'MORAL' }))}
                                className={cn("relative p-6 rounded-xl border border-slate-200 dark:border-slate-800 transition-all text-left", formData.personType === 'MORAL' ? "ring-2 ring-medical-500 bg-medical-50/50 dark:bg-medical-500/10" : "bg-white dark:bg-slate-900 hover:border-medical-300")}>
                                <div className="p-3 bg-medical-100 dark:bg-medical-500/20 rounded-xl w-fit mb-3">
                                  <Building2 className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                                </div>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Clínica / Empresa</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-light">Persona Moral. Represento a una clínica, consultorio o equipo médico.</p>
                              </button>
                            </div>
                          </div>

                          {/* Sector */}
                          {formData.personType && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                              <div className="text-center space-y-2">
                                <h3 className="text-xl font-medium text-slate-900 dark:text-white">¿A qué industria perteneces?</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button onClick={() => setFormData((prev: any) => ({ ...prev, parentCategoryId: 1 }))}
                                  className={cn("relative p-6 rounded-xl border border-slate-200 dark:border-slate-800 transition-all text-left", formData.parentCategoryId === 1 ? "ring-2 ring-medical-500 bg-medical-50/50 dark:bg-medical-500/10" : "bg-white dark:bg-slate-900 hover:border-medical-300")}>
                                  <div className="p-3 bg-medical-100 dark:bg-medical-500/20 rounded-xl w-fit mb-3">
                                    <Stethoscope className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                                  </div>
                                  <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{t("health_sector")}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 font-light">{t("health_desc")}</p>
                                </button>
                                <button onClick={() => setFormData((prev: any) => ({ ...prev, parentCategoryId: 2 }))}
                                  className={cn("relative p-6 rounded-xl border border-slate-200 dark:border-slate-800 transition-all text-left", formData.parentCategoryId === 2 ? "ring-2 ring-pink-500 bg-pink-50/50 dark:bg-pink-500/10" : "bg-white dark:bg-slate-900 hover:border-pink-300")}>
                                  <div className="p-3 bg-pink-100 dark:bg-pink-500/20 rounded-xl w-fit mb-3">
                                    <Scissors className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                                  </div>
                                  <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{t("beauty_sector")}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 font-light">{t("beauty_desc")}</p>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div key="business-info" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2.5 rounded-xl border",
                                formData.parentCategoryId === 1 ? "bg-medical-50 dark:bg-medical-500/10 border-medical-200 dark:border-medical-500/20" : "bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/20")}>
                                {formData.parentCategoryId === 1 ? <Stethoscope className="w-5 h-5 text-medical-600 dark:text-medical-400" /> : <Scissors className="w-5 h-5 text-pink-600 dark:text-pink-400" />}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t("business_identity")}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-light">{t("business_sync")}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                              onClick={() => setFormData((prev: any) => ({ ...prev, parentCategoryId: null, personType: null }))}>
                              {t("change_sector")}
                            </Button>
                          </div>
                          <Separator className="bg-slate-200 dark:bg-slate-800" />

                          {/* Business Name */}
                          <div className="space-y-2 relative">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 text-sm">
                              {t("business_name_label")}
                              <span className="text-[10px] text-slate-500 font-light">{t("business_name_hint")}</span>
                            </Label>
                            <div className="relative group">
                              <Building2 className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", focusedField === "businessName" ? "text-medical-600 dark:text-medical-400" : "text-slate-400")} />
                              <Input name="businessName" value={formData.businessName} onChange={handleBusinessNameChange} onFocus={() => setFocusedField("businessName")} onBlur={() => setFocusedField(null)}
                                placeholder={formData.parentCategoryId === 1 ? t("business_placeholder_health") : t("business_placeholder_beauty")}
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 pl-10 focus:border-medical-500 focus:ring-1 focus:ring-medical-500/20 rounded-xl" />
                              {isSearching && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-medical-600 dark:text-medical-400" />}
                            </div>
                            <AnimatePresence>
                              {predictions.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                  className="absolute z-50 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                                  {predictions.map((p: any) => (
                                    <button key={p.placeId} onClick={() => selectPlace(p)} type="button"
                                      className="w-full p-3 text-left hover:bg-medical-50 dark:hover:bg-medical-500/10 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-start gap-3 transition-colors group">
                                      <MapPin className="w-4 h-4 text-slate-400 group-hover:text-medical-600 dark:group-hover:text-medical-400 mt-0.5" />
                                      <div><p className="text-sm font-medium text-slate-900 dark:text-white">{p.structuredFormatting.mainText}</p><p className="text-[10px] text-slate-500">{p.structuredFormatting.secondaryText}</p></div>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Google Business Card */}
                          {selectedPlaceInfo && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                              <div className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                  <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0 text-[10px]">{t("linked_data")}</Badge>
                                  <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-4 h-4 fill-amber-500" /><span className="font-medium text-sm">{selectedPlaceInfo.rating}</span>
                                    <span className="text-slate-500 text-xs">({selectedPlaceInfo.userRatingsTotal})</span>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center border border-slate-300 dark:border-slate-600">
                                    <Building2 className="w-5 h-5 text-slate-500" />
                                  </div>
                                  <div className="flex-1 space-y-0.5">
                                    <h4 className="text-slate-900 dark:text-white font-semibold text-sm">{formData.businessName}</h4>
                                    <p className="text-slate-500 text-[11px] flex items-center gap-1"><MapPin className="w-3 h-3" />{formData.address}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-medical-50 dark:bg-medical-500/5 p-2.5 px-4 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
                                <p className="text-[10px] text-medical-600 dark:text-medical-400 font-light">{t("imported_ok")}</p>
                                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setSelectedPlaceInfo(null)}>{t("change")}</Button>
                              </div>
                            </motion.div>
                          )}

                          {/* Bio */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="text-slate-700 dark:text-slate-300 font-medium text-sm">{t("bio_label")}</Label>
                              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full",
                                formData.bio.length >= 20 ? "bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400")}>
                                {formData.bio.length} / 20 {t("bio_min")}
                              </span>
                            </div>
                            <textarea name="bio" value={formData.bio} onChange={handleInputChange} onFocus={() => setFocusedField("bio")} onBlur={() => setFocusedField(null)}
                              placeholder="Describe your career, specialty and focus..."
                              className="w-full min-h-[100px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white text-sm focus:border-medical-500 focus:ring-1 focus:ring-medical-500/20 transition-all outline-none resize-none font-light" />
                          </div>

                          {/* Phone */}
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium text-sm">{t("phone_label")}</Label>
                            <div className="relative">
                              <Phone className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", focusedField === "contactPhone" ? "text-medical-600 dark:text-medical-400" : "text-slate-400")} />
                              <Input name="contactPhone" value={formData.contactPhone || ""} onChange={handleInputChange} onFocus={() => setFocusedField("contactPhone")} onBlur={() => setFocusedField(null)}
                                placeholder="+52 55 1234 5678"
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 pl-10 focus:border-medical-500 focus:ring-1 focus:ring-medical-500/20 rounded-xl" />
                            </div>
                          </div>

                          {/* Timezone */}
                          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 p-3 rounded-xl">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">{t("timezone_title")}</p>
                              <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 font-light">{t("timezone_desc")} <span className="font-medium">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span></p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Step 2: Specialty */}
                {activeStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                          <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t("specialty_title")}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-light">{t("specialty_desc")}</p>
                        </div>
                      </div>
                      {completedSteps.has(2) && (
                        <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0">
                          <CheckCircle2 className="w-3 h-3 mr-1" />{t("configured")}
                        </Badge>
                      )}
                    </div>
                    <Separator className="bg-slate-200 dark:bg-slate-800" />
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <CategorySelector tags={tags} categories={filteredCategories} onGetSubCategories={getSubCategories}
                        selectedCategoryId={formData.categoryId} selectedSubCategoryId={formData.subCategoryId} selectedTagIds={formData.tagIds}
                        onSelectionChange={(catId, subId, tagIds) => setFormData((prev: any) => ({ ...prev, categoryId: catId, subCategoryId: subId, tagIds }))} />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Location */}
                {activeStep === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t("location_title")}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-light">{t("location_desc")}</p>
                        </div>
                      </div>
                      {completedSteps.has(3) && (
                        <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0">
                          <CheckCircle2 className="w-3 h-3 mr-1" />{t("location_ready")}
                        </Badge>
                      )}
                    </div>
                    <Separator className="bg-slate-200 dark:bg-slate-800" />
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl flex items-start gap-3">
                      <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg"><Navigation className="w-4 h-4 text-medical-600 dark:text-medical-400" /></div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-500 uppercase font-medium tracking-wider mb-0.5">Address</p>
                        <p className="text-sm text-slate-900 dark:text-white font-medium">{formData.address || "No address specified"}</p>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-[320px] shadow-sm relative">
                      <LocationPicker className="w-full h-full"
                        initialLocation={{ address: formData.address || "", lat: formData.latitude || 19.4326, lng: formData.longitude || -99.1332 }}
                        onLocationSelect={(data) => { setFormData((prev: any) => ({ ...prev, address: data.address, latitude: data.lat, longitude: data.lng, placeId: data.placeId || prev.placeId })); setCompletedSteps((prev) => new Set(prev).add(3)); }} />
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-[11px] text-slate-500 font-light italic">Drag the red marker to adjust the exact position of your entrance.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-slate-800">
                <div>
                  {activeStep > 1 && (
                    <Button type="button" variant="outline" onClick={() => setActiveStep(prev => prev - 1)}
                      className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                      Previous
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {activeStep < 3 ? (
                    <Button type="button" onClick={() => setActiveStep(prev => prev + 1)}
                      disabled={(activeStep === 1 && !isStep1Valid) || (activeStep === 2 && !isStep2Valid)}
                      className={cn("group rounded-xl shadow-none",
                        (activeStep === 1 && isStep1Valid) || (activeStep === 2 && isStep2Valid)
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed")}>
                      Next<ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={handleFinish} disabled={!isFormValid || isSaving}
                      className={cn("group rounded-xl shadow-none font-semibold",
                        isFormValid ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100" : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed")}>
                      {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("saving")}</> :
                        <><Sparkles className="w-4 h-4 mr-2" />{t("finish")}<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" /></>}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield className="w-3 h-3" /><span>Your data is protected with SSL encryption</span>
        </motion.div>
      </div>
    </div>
  );
}