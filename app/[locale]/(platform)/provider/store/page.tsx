"use client";

/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Store,
  Palette,
  ShieldCheck,
  Check,
  ChevronRight,
  Sparkles,
  Users,
  Trophy,
  Info,
  ShoppingBag,
  Eye,
  Settings,
  Pill,
  GraduationCap,
  Stethoscope,
  Package,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Hooks
import { useStoreProfile } from "@/hooks/useStoreProfile";
import { useCatalog } from "@/hooks/useCatalog";
import { useStaff } from "@/hooks/useStaff";

export default function StoreSetupPage() {
  const router = useRouter();
  const t = useTranslations("StoreHub");

  // Backend Data
  const {
    profile,
    isLoading: loadingProfile,
    updateProfile,
  } = useStoreProfile();
  const {
    services,
    packages,
    products,
    courses,
    fetchInventory,
    isLoading: loadingCatalog,
  } = useCatalog();
  const { staff, fetchStaff, isLoading: loadingStaff } = useStaff();

  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchStaff();
  }, [fetchInventory, fetchStaff]);

  const isGlobalLoading = loadingProfile || loadingCatalog || loadingStaff;

  // Lógica de Estado de Pasos
  const isIdentityComplete = !!profile?.displayName && !!profile?.slug;

  const activeServices = services.filter((s) => !s.isNew).length;
  const activePackages = packages.filter((p) => !p.isNew).length;
  const activeProducts = products.filter((p) => !p.isNew).length;
  const activeCourses = courses.filter((c) => !c.isNew).length;

  const realCatalogCount =
    activeServices + activePackages + activeProducts + activeCourses;
  const isCatalogComplete = realCatalogCount > 0;

  const isPoliciesComplete = !!profile?.cancellationPolicy;

  const activeStaffCount = staff.filter((s) => !s.isNew).length;
  const isStaffComplete = activeStaffCount > 0;

  const handlePublishStore = async () => {
    setIsPublishing(true);
    const success = await updateProfile({ marketplaceVisible: true });
    if (success) {
      window.open(`/store/${profile?.slug}`, "_blank");
    }
    setIsPublishing(false);
  };

  const handleToggleVisibility = async () => {
    setIsPublishing(true);
    await updateProfile({ marketplaceVisible: !profile?.marketplaceVisible });
    setIsPublishing(false);
  };

  // Pasos de Configuración
  const steps = [
    {
      id: "identity",
      title: t("steps.identity.title"),
      description: t("steps.identity.desc"),
      icon: Palette,
      isComplete: isIdentityComplete,
      path: "/provider/store/identity",
    },
    {
      id: "catalog",
      title: t("steps.catalog.title"),
      description: t("steps.catalog.desc"),
      icon: ShoppingBag,
      isComplete: isCatalogComplete,
      path: "/provider/store/catalog",
      badge:
        realCatalogCount > 0
          ? t("steps.catalog.badge", { count: realCatalogCount })
          : null,
    },
    {
      id: "policies",
      title: t("steps.policies.title"),
      description: t("steps.policies.desc"),
      icon: ShieldCheck,
      isComplete: isPoliciesComplete,
      path: "/provider/store/policies",
    },
    {
      id: "staff",
      title: t("steps.staff.title"),
      description: t("steps.staff.desc"),
      icon: Users,
      isComplete: isStaffComplete,
      path: "/provider/store/staff",
    },
    {
      id: "integrations",
      title: t("steps.integrations.title"),
      description: t("steps.integrations.desc"),
      icon: Share2,
      isComplete: true,
      path: "/provider/store/integrations",
    },
  ];

  const completedCount = steps.filter((s) => s.isComplete).length;
  const progressPercentage = Math.round(
    (completedCount / steps.length) * 100
  );
  const isStoreReady = completedCount === steps.length;

  if (isGlobalLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading_subtitle")}
        </p>
      </div>
    );
  }

  // ─── MODO 1: CENTRO DE MANDO (CUANDO LA TIENDA YA ESTÁ LISTA) ─────────────
  if (isStoreReady) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Centro de Mando */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                <Store className="w-7 h-7" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                    {t("command_center.title")}
                  </h1>
                  <span
                    className={cn(
                      "px-3 py-0.5 text-[10px] font-bold rounded-full border shadow-sm",
                      profile?.marketplaceVisible
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                        : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-800"
                    )}
                  >
                    {profile?.marketplaceVisible
                      ? t("command_center.status_public")
                      : t("command_center.status_hidden")}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("command_center.subtitle")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                onClick={handleToggleVisibility}
                disabled={isPublishing}
                variant="outline"
                className="h-11 px-5 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm"
              >
                {isPublishing ? (
                  <QhSpinner size="sm" />
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" strokeWidth={2} />
                    <span>
                      {profile?.marketplaceVisible
                        ? t("command_center.hide_store")
                        : t("command_center.publish_store")}
                    </span>
                  </>
                )}
              </Button>

              <Button
                onClick={() => window.open(`/store/${profile?.slug}`, "_blank")}
                disabled={!profile?.marketplaceVisible}
                className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold border-0 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Eye className="w-4 h-4" strokeWidth={2} />
                <span>{t("command_center.view_live")}</span>
              </Button>
            </div>
          </div>

          {/* Grid de Gestión */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Bloque: Catálogo e Inventario */}
            <div className="lg:col-span-2 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
                <div className="flex items-center gap-3">
                  <ShoppingBag
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    strokeWidth={2}
                  />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("command_center.catalog_title")}
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push("/provider/store/catalog")}
                  className="w-9 h-9 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" strokeWidth={2} />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 md:p-8">
                <div
                  onClick={() => router.push("/provider/store/catalog")}
                  className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all group shadow-sm"
                >
                  <Stethoscope className="w-6 h-6 mb-2 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" strokeWidth={2} />
                  <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white mb-0.5">
                    {activeServices}
                  </p>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("command_center.services")}
                  </p>
                </div>

                <div
                  onClick={() => router.push("/provider/store/catalog")}
                  className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all group shadow-sm"
                >
                  <Pill className="w-6 h-6 mb-2 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" strokeWidth={2} />
                  <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white mb-0.5">
                    {activeProducts}
                  </p>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("command_center.products")}
                  </p>
                </div>

                <div
                  onClick={() => router.push("/provider/store/catalog")}
                  className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all group shadow-sm"
                >
                  <GraduationCap className="w-6 h-6 mb-2 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" strokeWidth={2} />
                  <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white mb-0.5">
                    {activeCourses}
                  </p>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("command_center.courses")}
                  </p>
                </div>

                <div
                  onClick={() => router.push("/provider/store/catalog")}
                  className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all group shadow-sm"
                >
                  <Package className="w-6 h-6 mb-2 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" strokeWidth={2} />
                  <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white mb-0.5">
                    {activePackages}
                  </p>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("command_center.packages")}
                  </p>
                </div>
              </div>
            </div>

            {/* Bloque: Equipo Médico */}
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("command_center.staff_title")}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  {t("command_center.staff_active", { count: activeStaffCount })}
                </span>
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("command_center.staff_desc")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/provider/store/staff")}
                  className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
                >
                  {t("command_center.manage_staff")}
                </Button>
              </div>
            </div>

            {/* Bloque: Identidad */}
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center gap-3">
                <Palette className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("command_center.identity_title")}
                </h3>
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("command_center.identity_desc")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/provider/store/identity")}
                  className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
                >
                  {t("command_center.edit_identity")}
                </Button>
              </div>
            </div>

            {/* Bloque: Políticas */}
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("command_center.policies_title")}
                </h3>
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("command_center.policies_desc")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/provider/store/policies")}
                  className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
                >
                  {t("command_center.update_policies")}
                </Button>
              </div>
            </div>

            {/* Bloque: Integraciones */}
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center gap-3">
                <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("command_center.channels_title")}
                </h3>
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("command_center.channels_desc")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/provider/store/integrations")}
                  className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
                >
                  {t("command_center.configure_channels")}
                </Button>
              </div>
            </div>


          </div>
        </div>
      </div>
    );
  }

  // ─── MODO 2: ASISTENTE DE CONFIGURACIÓN INICIAL ─────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Setup */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <Store className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                  {t("title")}
                </h1>
                <span className="px-3 py-0.5 text-[10px] font-bold rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400 shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" strokeWidth={2} />
                  <span>{t("badge_marketplace")}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sección de Avance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" strokeWidth={2} />
                <span>{t("progress_title")}</span>
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t("progress_subtitle", {
                  completed: completedCount,
                  total: steps.length,
                })}
              </p>
            </div>

            <div className="flex-1 max-w-xs w-full space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-400">Avance</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lista de Pasos */}
        <div className="grid gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isComplete = step.isComplete;
            const isNext =
              !isComplete && index === steps.findIndex((s) => !s.isComplete);

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.1 }}
                onClick={() => router.push(step.path)}
                className={cn(
                  "rounded-2xl border p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all duration-300 group shadow-sm",
                  isComplete
                    ? "bg-gray-50/50 dark:bg-[#050505] border-gray-100 dark:border-gray-800"
                    : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-900/40",
                  isNext
                    ? "ring-2 ring-emerald-500/20 border-emerald-300 dark:border-emerald-900/50"
                    : ""
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-sm",
                      isComplete
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40"
                        : "bg-gray-50 dark:bg-gray-800/60 text-gray-400 border border-gray-100 dark:border-gray-800 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                    )}
                  >
                    {isComplete ? (
                      <Check className="w-5 h-5" strokeWidth={2.5} />
                    ) : (
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          "text-xs font-bold",
                          isComplete
                            ? "text-gray-500 dark:text-gray-400"
                            : "text-gray-900 dark:text-white"
                        )}
                      >
                        {step.title}
                      </h3>
                      {step.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div>
                  {isComplete ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                      <span>{t("status_completed")}</span>
                      <Check className="w-3.5 h-3.5" strokeWidth={2} />
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "text-xs font-bold flex items-center gap-1 transition-transform",
                        isNext
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      )}
                    >
                      <span>
                        {isNext ? t("status_continue") : t("status_configure")}
                      </span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Banner de Tienda Lista */}
        <AnimatePresence>
          {isStoreReady && !profile?.marketplaceVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/40 p-8 md:p-12 text-center bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                  <Trophy className="w-7 h-7" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {t("ready_title")}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                    {t("ready_desc")}
                  </p>
                </div>
                <Button
                  onClick={handlePublishStore}
                  disabled={isPublishing}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-8 text-xs font-bold transition-all border-0 shadow-sm inline-flex items-center gap-2"
                >
                  {isPublishing ? (
                    <QhSpinner size="sm" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" strokeWidth={2} />
                      <span>{t("btn_publish")}</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer de Soporte */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-start gap-3.5 shadow-sm">
          <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" strokeWidth={2} />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("help_title")}
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("help_desc")}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}