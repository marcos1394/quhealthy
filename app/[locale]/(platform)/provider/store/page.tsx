// Ubicación: src/app/[locale]/(platform)/provider/store/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Store,
  Palette,
  BriefcaseMedical,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Users,
  Loader2,
  Trophy,
  Info,
  ExternalLink,
  ShoppingBag,
  Eye,
  Settings,
  Pill,
  GraduationCap,
  Stethoscope,
  Package
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { QhSpinner } from '@/components/ui/QhSpinner';

// Hooks
import { useStoreProfile } from "@/hooks/useStoreProfile";
import { useCatalog } from "@/hooks/useCatalog";
import { useStaff } from "@/hooks/useStaff";

export default function StoreSetupPage() {
  const router = useRouter();
  const t = useTranslations('StoreHub');

  // ==========================================
  // 1. EXTRAER DATOS DEL BACKEND
  // ==========================================
  const { profile, isLoading: loadingProfile, updateProfile } = useStoreProfile();

  const { services, packages, products, courses, fetchInventory, isLoading: loadingCatalog } = useCatalog();
  const { staff, fetchStaff, isLoading: loadingStaff } = useStaff();
  const [isPublishing, setIsPublishing] = React.useState(false);

  useEffect(() => {
    fetchInventory();
    fetchStaff();
  }, [fetchInventory, fetchStaff]);

  const isGlobalLoading = loadingProfile || loadingCatalog || loadingStaff;

  // ==========================================
  // 2. LÓGICA DE PROGRESO Y MÉTRICAS
  // ==========================================
  const isIdentityComplete = !!profile?.displayName && !!profile?.slug;

  const activeServices = services.filter(s => !s.isNew).length;
  const activePackages = packages.filter(p => !p.isNew).length;
  const activeProducts = products.filter(p => !p.isNew).length;
  const activeCourses = courses.filter(c => !c.isNew).length;
  
  const realCatalogCount = activeServices + activePackages + activeProducts + activeCourses;
  const isCatalogComplete = realCatalogCount > 0;

  const isPoliciesComplete = !!profile?.cancellationPolicy;
  
  const activeStaffCount = staff.filter(s => !s.isNew).length;
  const isStaffComplete = activeStaffCount > 0;

  const handlePublishStore = async () => {
    setIsPublishing(true);
    const success = await updateProfile({ marketplaceVisible: true });
    if (success) {
      window.open(`/store/${profile?.slug}`, '_blank');
    }
    setIsPublishing(false);
  };

  const handleToggleVisibility = async () => {
    setIsPublishing(true);
    await updateProfile({ marketplaceVisible: !profile?.marketplaceVisible });
    setIsPublishing(false);
  };

  // ==========================================
  // 3. CONFIGURACIÓN DE LOS PASOS
  // ==========================================
  const steps = [
    {
      id: "identity",
      title: t('steps.identity.title'),
      description: t('steps.identity.desc'),
      icon: Palette,
      isComplete: isIdentityComplete,
      path: "/provider/store/identity",
      color: "medical"
    },
    {
      id: "catalog",
      title: t('steps.catalog.title', { defaultValue: 'Catálogo y Precios' }),
      description: t('steps.catalog.desc', { defaultValue: 'Servicios, productos y cursos' }),
      icon: ShoppingBag,
      isComplete: isCatalogComplete,
      path: "/provider/store/catalog",
      badge: realCatalogCount > 0 ? `${realCatalogCount} ítems` : null,
      color: "blue"
    },
    {
      id: "policies",
      title: t('steps.policies.title'),
      description: t('steps.policies.desc'),
      icon: ShieldCheck,
      isComplete: isPoliciesComplete,
      path: "/provider/store/policies",
      color: "emerald"
    },
    {
      id: "staff",
      title: t('steps.staff.title'),
      description: t('steps.staff.desc'),
      icon: Users,
      isComplete: isStaffComplete,
      path: "/provider/store/staff",
      color: "pink"
    },
  ];

  const completedCount = steps.filter(s => s.isComplete).length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);
  const isStoreReady = completedCount === steps.length; // 🚀 MODO: True = Centro de Mando, False = Asistente

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (isGlobalLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-6 bg-slate-50 dark:bg-slate-950">
        <QhSpinner size="lg" />
        <div className="text-center space-y-2">
          <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">{t('loading_title')}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">{t('loading_subtitle')}</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🚀 MODO 1: CENTRO DE MANDO (Cuando la tienda ya está configurada)
  // ============================================================================
  if (isStoreReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
          
          {/* Header del Centro de Mando */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-100 dark:border-medical-500/20 shadow-inner">
                <Store className="w-10 h-10 text-medical-600 dark:text-medical-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Centro de Mando
                  </h1>
                  <Badge variant={profile?.marketplaceVisible ? "success" : "secondary"} className="uppercase tracking-wider text-xs">
                    {profile?.marketplaceVisible ? "Tienda Pública" : "Tienda Oculta"}
                  </Badge>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Gestiona tu catálogo, identidad y equipo desde aquí.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleToggleVisibility} 
                variant="outline" 
                disabled={isPublishing}
                className="h-12 rounded-xl font-bold border-slate-200 dark:border-slate-700"
              >
                {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
                {profile?.marketplaceVisible ? "Ocultar Tienda" : "Publicar Tienda"}
              </Button>
              
              <Button 
                onClick={() => window.open(`/store/${profile?.slug}`, '_blank')}
                disabled={!profile?.marketplaceVisible}
                className="h-12 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 shadow-md"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Tienda en Vivo
              </Button>
            </div>
          </div>

          {/* Grid de Gestión */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Tarjeta: Catálogo (La más importante) */}
            <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-emerald-500" />
                  Catálogo e Inventario
                </CardTitle>
                <Button variant="ghost" onClick={() => router.push("/provider/store/catalog")} className="text-medical-600 dark:text-medical-400 font-bold">
                  Gestionar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                    <Stethoscope className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{activeServices}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Servicios</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                    <Pill className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{activeProducts}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Productos</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{activeCourses}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Cursos</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                    <Package className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{activePackages}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Paquetes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tarjeta: Equipo Médico */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span className="flex items-center gap-2"><Users className="w-6 h-6 text-pink-500" /> Personal</span>
                  <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300">{activeStaffCount} activos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Profesionales que brindan los servicios en tu clínica o de forma online.
                </p>
                <Button onClick={() => router.push("/provider/store/staff")} variant="outline" className="w-full h-12 rounded-xl font-bold">
                  Administrar Equipo
                </Button>
              </CardContent>
            </Card>

            {/* Tarjeta: Identidad */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Palette className="w-6 h-6 text-medical-500" /> Identidad Visual
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Logo, colores de marca, imágenes de portada y biografía de la tienda.
                </p>
                <Button onClick={() => router.push("/provider/store/identity")} variant="outline" className="w-full h-12 rounded-xl font-bold">
                  Editar Identidad
                </Button>
              </CardContent>
            </Card>

            {/* Tarjeta: Políticas */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-amber-500" /> Políticas y Legal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Políticas de cancelación, reembolsos y términos de venta para tus pacientes.
                </p>
                <Button onClick={() => router.push("/provider/store/policies")} variant="outline" className="w-full h-12 rounded-xl font-bold">
                  Actualizar Políticas
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🚀 MODO 2: ASISTENTE DE CONFIGURACIÓN
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
      <div className="max-w-5xl mx-auto space-y-8 pb-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-start justify-between gap-6"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
                <Store className="w-10 h-10 text-medical-600 dark:text-medical-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
                <Badge className="mt-2 bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-200 dark:border-medical-500/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {t('badge_marketplace')}
                </Badge>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          <AnimatePresence>
            {isStoreReady && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={handlePublishStore}
                  disabled={isPublishing || profile?.marketplaceVisible}
                  variant={profile?.marketplaceVisible ? "success" : "default"}
                  size="lg"
                  className="h-14 px-8 text-base font-bold shadow-lg transition-all group"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('btn_publishing')}
                    </>
                  ) : profile?.marketplaceVisible ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {t('btn_active')}
                      <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {t('btn_publish')}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
            {/* Animated Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-medical-500/5 to-emerald-500/5 dark:from-medical-500/10 dark:to-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

            <CardContent className="p-8 md:p-10 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20">
                    <Trophy className="w-7 h-7 text-medical-600 dark:text-medical-400" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">{t('progress_title')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {t('progress_subtitle', { completed: completedCount, total: steps.length })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {isStoreReady ? (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-3 px-6 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
                    >
                      <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{t('progress_complete')}</span>
                    </motion.div>
                  ) : (
                    <span className="text-5xl font-bold bg-gradient-to-r from-medical-500 to-medical-700 bg-clip-text text-transparent">
                      {progressPercentage}%
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Progress value={progressPercentage} className="h-3 shadow-inner" />

                {!isStoreReady && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20"
                  >
                    <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                      {t('missing_steps')}
                    </p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Steps Checklist */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isComplete = step.isComplete;
            const isNext = !isComplete && index === steps.findIndex(s => !s.isComplete);

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
              >
                <Card
                  onClick={() => router.push(step.path)}
                  className={cn(
                    "group cursor-pointer transition-all duration-300 border overflow-hidden relative",
                    isComplete
                      ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 shadow-sm hover:shadow-md"
                      : isNext
                        ? "bg-white dark:bg-slate-900 border-medical-300 dark:border-medical-500/40 shadow-md ring-2 ring-medical-200 dark:ring-medical-500/20"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md"
                  )}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8">

                      {/* Left Side - Icon & Content */}
                      <div className="flex items-start gap-5 flex-1">
                        {/* Icon */}
                        <motion.div
                          className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center border transition-all flex-shrink-0 shadow-sm",
                            isComplete
                              ? "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                              : isNext
                                ? "bg-medical-100 dark:bg-medical-500/20 border-medical-200 dark:border-medical-500/30 text-medical-600 dark:text-medical-400"
                                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-medical-50 dark:group-hover:bg-medical-500/10 group-hover:border-medical-200 dark:group-hover:border-medical-500/20 group-hover:text-medical-600 dark:group-hover:text-medical-400"
                          )}
                          animate={isNext ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 2, repeat: isNext ? Infinity : 0, repeatDelay: 1 }}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-7 h-7" />
                          ) : (
                            <Icon className="w-7 h-7" />
                          )}
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                            <h3 className={cn(
                              "text-lg font-bold",
                              isComplete ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                            )}>
                              {step.title}
                            </h3>

                            {isNext && (
                              <Badge className="bg-medical-100 dark:bg-medical-500/20 text-medical-700 dark:text-medical-300 border-medical-200 dark:border-medical-500/30 animate-pulse">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {t('status_continue')}
                              </Badge>
                            )}

                            {step.badge && (
                              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {step.badge}
                              </Badge>
                            )}
                          </div>

                          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Side - Status & Action */}
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:justify-center pl-20 sm:pl-0">
                        {isComplete ? (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{t('status_completed')}</span>
                          </div>
                        ) : (
                          <span className={cn(
                            "text-sm font-bold flex items-center gap-1 group-hover:underline transition-colors",
                            isNext ? "text-medical-600 dark:text-medical-400" : "text-slate-500 dark:text-slate-400 group-hover:text-medical-600 dark:group-hover:text-medical-400"
                          )}>
                            {isNext ? t('status_continue') : t('status_configure')}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Completion CTA */}
        <AnimatePresence>
          {isStoreReady && !profile?.marketplaceVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Card className="bg-gradient-to-br from-medical-50 via-emerald-50 to-blue-50 dark:from-medical-500/5 dark:via-emerald-500/5 dark:to-blue-500/5 border-medical-200 dark:border-medical-500/20 shadow-lg">
                <CardContent className="p-8 md:p-10 text-center space-y-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <Trophy className="w-20 h-20 text-medical-500 mx-auto" />
                  </motion.div>

                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                      {t('ready_title')}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 max-w-lg mx-auto text-lg leading-relaxed">
                      {t('ready_desc')}
                    </p>
                  </div>

                  <Separator className="bg-medical-200 dark:bg-medical-500/20" />

                  <Button
                    onClick={handlePublishStore}
                    disabled={isPublishing}
                    size="lg"
                    className="px-12 py-6 text-lg h-16 group"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        {t('btn_publishing')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                        {t('btn_publish')}
                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20 flex-shrink-0">
                <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-blue-700 dark:text-blue-400 mb-2 text-base">{t('help_title')}</p>
                <p>
                  {t('help_desc').split('support@quhealthy.com')[0]}
                  <a href="mailto:support@quhealthy.com" className="underline hover:text-blue-500 dark:hover:text-blue-300 font-semibold">
                    support@quhealthy.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}