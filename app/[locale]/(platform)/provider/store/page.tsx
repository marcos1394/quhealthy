/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
// Ubicación: src/app/[locale]/(platform)/provider/store/page.tsx
"use client";

import React, { useEffect } from "react";
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
  Package,
  Share2
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
      path: "/provider/store/identity"
    },
    {
      id: "catalog",
      title: t('steps.catalog.title', { defaultValue: 'Catálogo y Precios' }),
      description: t('steps.catalog.desc', { defaultValue: 'Servicios, productos y cursos' }),
      icon: ShoppingBag,
      isComplete: isCatalogComplete,
      path: "/provider/store/catalog",
      badge: realCatalogCount > 0 ? `${realCatalogCount} ítems` : null
    },
    {
      id: "policies",
      title: t('steps.policies.title'),
      description: t('steps.policies.desc'),
      icon: ShieldCheck,
      isComplete: isPoliciesComplete,
      path: "/provider/store/policies"
    },
    {
      id: "staff",
      title: t('steps.staff.title'),
      description: t('steps.staff.desc'),
      icon: Users,
      isComplete: isStaffComplete,
      path: "/provider/store/staff"
    },
    {
      id: "integrations",
      title: "Canales de Contacto", 
      description: "Conecta WhatsApp, Gmail y Redes Sociales.",
      icon: Share2,
      isComplete: true, 
      path: "/provider/store/integrations"
    },
  ];

  const completedCount = steps.filter(s => s.isComplete).length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);
  const isStoreReady = completedCount === steps.length;

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (isGlobalLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center bg-white dark:bg-[#0a0a0a] selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
        <QhSpinner size="lg" label={t('loading_title')} />
      </div>
    );
  }

  // ============================================================================
  // 🚀 MODO 1: CENTRO DE MANDO (Cuando la tienda ya está configurada)
  // ============================================================================
  if (isStoreReady) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white p-6 md:p-12 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto space-y-12 pb-10">
          
          {/* Header del Centro de Mando */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-gray-200 dark:border-gray-800 pb-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
                <Store className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-semibold tracking-tight">Centro de Mando</h1>
                  <span className={cn(
                    "px-2 py-1 text-[9px] font-bold uppercase tracking-widest border",
                    profile?.marketplaceVisible 
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" 
                      : "border-gray-300 text-gray-500 dark:border-gray-700"
                  )}>
                    {profile?.marketplaceVisible ? "Pública" : "Oculta"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-light uppercase tracking-widest">
                  Gestión integral de plataforma y catálogo
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleToggleVisibility} 
                disabled={isPublishing}
                variant="outline"
                className="h-12 rounded-none border-black dark:border-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                {isPublishing ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <Settings className="w-4 h-4 mr-3" />}
                {profile?.marketplaceVisible ? "Ocultar Tienda" : "Publicar Tienda"}
              </Button>
              
              <Button 
                onClick={() => window.open(`/store/${profile?.slug}`, '_blank')}
                disabled={!profile?.marketplaceVisible}
                className="h-12 rounded-none bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors border-0"
              >
                <Eye className="w-4 h-4 mr-3" /> Ver en Vivo
              </Button>
            </div>
          </div>

          {/* Grid de Gestión (Blueprint) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
            
            {/* Bloque: Catálogo e Inventario */}
            <div className="lg:col-span-2 border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col">
              <div className="p-8 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <ShoppingBag className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Catálogo e Inventario</h3>
                </div>
                <button onClick={() => router.push("/provider/store/catalog")} className="w-8 h-8 border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:border-black dark:hover:border-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 flex-1">
                <div onClick={() => router.push("/provider/store/catalog")} className="p-6 text-center border-b md:border-b-0 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer group/card transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">
                  <Stethoscope className="w-5 h-5 mb-4 text-gray-400 group-hover/card:text-white dark:group-hover/card:text-black transition-colors" strokeWidth={1.5} />
                  <p className="text-3xl font-semibold tracking-tighter mb-2 text-black dark:text-white group-hover/card:text-white dark:group-hover/card:text-black transition-colors">{activeServices}</p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest group-hover/card:text-gray-300 dark:group-hover/card:text-gray-600 transition-colors">Servicios</p>
                </div>
                <div onClick={() => router.push("/provider/store/catalog")} className="p-6 text-center border-b md:border-b-0 border-r md:border-r-0 lg:border-r border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer group/card transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">
                  <Pill className="w-5 h-5 mb-4 text-gray-400 group-hover/card:text-white dark:group-hover/card:text-black transition-colors" strokeWidth={1.5} />
                  <p className="text-3xl font-semibold tracking-tighter mb-2 text-black dark:text-white group-hover/card:text-white dark:group-hover/card:text-black transition-colors">{activeProducts}</p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest group-hover/card:text-gray-300 dark:group-hover/card:text-gray-600 transition-colors">Productos</p>
                </div>
                <div onClick={() => router.push("/provider/store/catalog")} className="p-6 text-center border-r border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer group/card transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">
                  <GraduationCap className="w-5 h-5 mb-4 text-gray-400 group-hover/card:text-white dark:group-hover/card:text-black transition-colors" strokeWidth={1.5} />
                  <p className="text-3xl font-semibold tracking-tighter mb-2 text-black dark:text-white group-hover/card:text-white dark:group-hover/card:text-black transition-colors">{activeCourses}</p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest group-hover/card:text-gray-300 dark:group-hover/card:text-gray-600 transition-colors">Cursos</p>
                </div>
                <div onClick={() => router.push("/provider/store/catalog")} className="p-6 text-center flex flex-col items-center justify-center cursor-pointer group/card transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">
                  <Package className="w-5 h-5 mb-4 text-gray-400 group-hover/card:text-white dark:group-hover/card:text-black transition-colors" strokeWidth={1.5} />
                  <p className="text-3xl font-semibold tracking-tighter mb-2 text-black dark:text-white group-hover/card:text-white dark:group-hover/card:text-black transition-colors">{activePackages}</p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest group-hover/card:text-gray-300 dark:group-hover/card:text-gray-600 transition-colors">Paquetes</p>
                </div>
              </div>
            </div>

            {/* Bloque: Equipo Médico */}
            <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">
              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between group-hover:border-white/20 dark:group-hover:border-black/20">
                <div className="flex items-center gap-4">
                  <Users className="w-5 h-5 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                  <h3 className="text-sm font-bold uppercase tracking-widest group-hover:text-white dark:group-hover:text-black transition-colors">Personal</h3>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest border border-gray-300 dark:border-gray-700 px-2 py-1 bg-white dark:bg-black group-hover:bg-transparent group-hover:text-white dark:group-hover:bg-transparent dark:group-hover:text-black group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors">
                  {activeStaffCount} Activos
                </span>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <p className="text-xs text-gray-500 font-light leading-relaxed mb-6 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
                  Profesionales registrados para la atención y provisión de servicios.
                </p>
                <button onClick={() => router.push("/provider/store/staff")} className="w-full py-3 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest group-hover:border-white/20 group-hover:bg-white/10 dark:group-hover:border-black/20 dark:group-hover:bg-black/10 group-hover:text-white dark:group-hover:text-black transition-colors">
                  Administrar Equipo
                </button>
              </div>
            </div>

            {/* Bloque: Identidad */}
            <div className="border-b lg:border-b-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">
              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4 group-hover:border-white/20 dark:group-hover:border-black/20">
                <Palette className="w-5 h-5 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                <h3 className="text-sm font-bold uppercase tracking-widest group-hover:text-white dark:group-hover:text-black transition-colors">Identidad Visual</h3>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <p className="text-xs text-gray-500 font-light leading-relaxed mb-6 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
                  Logo, colores de marca, imágenes de portada y biografía de la tienda.
                </p>
                <button onClick={() => router.push("/provider/store/identity")} className="w-full py-3 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest group-hover:border-white/20 group-hover:bg-white/10 dark:group-hover:border-black/20 dark:group-hover:bg-black/10 group-hover:text-white dark:group-hover:text-black transition-colors">
                  Editar Identidad
                </button>
              </div>
            </div>

            {/* Bloque: Políticas */}
            <div className="border-b lg:border-b-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">
              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4 group-hover:border-white/20 dark:group-hover:border-black/20">
                <ShieldCheck className="w-5 h-5 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                <h3 className="text-sm font-bold uppercase tracking-widest group-hover:text-white dark:group-hover:text-black transition-colors">Legal y Políticas</h3>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <p className="text-xs text-gray-500 font-light leading-relaxed mb-6 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
                  Políticas de cancelación, reembolsos y términos de venta.
                </p>
                <button onClick={() => router.push("/provider/store/policies")} className="w-full py-3 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest group-hover:border-white/20 group-hover:bg-white/10 dark:group-hover:border-black/20 dark:group-hover:bg-black/10 group-hover:text-white dark:group-hover:text-black transition-colors">
                  Actualizar Políticas
                </button>
              </div>
            </div>

            {/* Bloque: Integraciones */}
            <div className="border-b lg:border-b-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">
              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4 group-hover:border-white/20 dark:group-hover:border-black/20">
                <Share2 className="w-5 h-5 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                <h3 className="text-sm font-bold uppercase tracking-widest group-hover:text-white dark:group-hover:text-black transition-colors">Canales y Redes</h3>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <p className="text-xs text-gray-500 font-light leading-relaxed mb-6 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
                  Conexiones a WhatsApp, Gmail, Calendario y Redes Sociales.
                </p>
                <button onClick={() => router.push("/provider/store/integrations")} className="w-full py-3 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest group-hover:border-white/20 group-hover:bg-white/10 dark:group-hover:border-black/20 dark:group-hover:bg-black/10 group-hover:text-white dark:group-hover:text-black transition-colors">
                  Configurar Canales
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🚀 MODO 2: ASISTENTE DE CONFIGURACIÓN
  // ============================================================================
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white p-6 md:p-12 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">

        {/* Header Setup */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-gray-200 dark:border-gray-800 pb-8">
          <div className="space-y-6">
            <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
              <Store className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-semibold tracking-tight">{t('title')}</h1>
                <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> {t('badge_marketplace')}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-light text-lg max-w-xl">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Blueprint */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 mb-2">
                <Trophy className="w-4 h-4" strokeWidth={1.5} /> {t('progress_title')}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">
                {t('progress_subtitle', { completed: completedCount, total: steps.length })}
              </p>
            </div>
            
            <div className="flex-1 max-w-md w-full">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Avance</span>
                <span className="text-2xl font-semibold tracking-tighter">{progressPercentage}%</span>
              </div>
              <div className="w-full h-px bg-gray-300 dark:bg-gray-700 relative">
                <motion.div className="absolute top-0 left-0 h-full bg-black dark:bg-white" initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Steps Checklist */}
        <div className="border-t border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isComplete = step.isComplete;
            const isNext = !isComplete && index === steps.findIndex(s => !s.isComplete);

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                onClick={() => router.push(step.path)}
                className={cn(
                  "border-b border-r border-gray-200 dark:border-gray-800 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer transition-all duration-300 group relative hover:z-10",
                  isComplete ? "bg-gray-50 dark:bg-[#050505] hover:bg-gray-100 dark:hover:bg-[#0a0a0a]" : "bg-white dark:bg-[#0a0a0a] hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] [&_*]:group-hover:text-white dark:[&_*]:group-hover:text-black",
                  isNext ? "bg-white dark:bg-[#0a0a0a] ring-1 ring-inset ring-black dark:ring-white" : ""
                )}
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-12 h-12 border flex items-center justify-center shrink-0 transition-colors",
                    isComplete ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black" : "border-gray-300 dark:border-gray-700 bg-white dark:bg-black group-hover:border-black dark:group-hover:border-white",
                    isNext ? "border-black dark:border-white" : ""
                  )}>
                    {isComplete ? <Check className="w-5 h-5" strokeWidth={2} /> : <Icon className="w-5 h-5" strokeWidth={1.5} />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-bold uppercase tracking-widest">{step.title}</h3>
                      {step.badge && (
                        <span className="px-2 py-0.5 border border-gray-300 dark:border-gray-700 text-[8px] font-bold uppercase tracking-widest text-gray-500">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-light">{step.description}</p>
                  </div>
                </div>

                <div>
                  {isComplete ? (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      Completado <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-transform",
                      isNext ? "text-black dark:text-white" : "text-gray-400 group-hover:text-black dark:group-hover:text-white"
                    )}>
                      {isNext ? t('status_continue') : t('status_configure')}
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completion CTA */}
        <AnimatePresence>
          {isStoreReady && !profile?.marketplaceVisible && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="border border-black dark:border-white p-10 md:p-16 text-center bg-gray-50 dark:bg-[#050505] mt-12">
                <Trophy className="w-12 h-12 mx-auto mb-6 text-black dark:text-white" strokeWidth={1.5} />
                <h3 className="text-2xl font-semibold tracking-tight mb-3">
                  {t('ready_title')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-light mb-10 max-w-lg mx-auto">
                  {t('ready_desc')}
                </p>
                <Button
                  onClick={handlePublishStore}
                  disabled={isPublishing}
                  className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-14 px-12 text-[10px] font-bold uppercase tracking-widest transition-colors w-full md:w-auto border-0"
                >
                  {isPublishing ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <Sparkles className="w-4 h-4 mr-3" />}
                  {isPublishing ? t('btn_publishing') : t('btn_publish')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Footer (Architectural Note) */}
        <div className="border-l-2 border-black dark:border-white pl-6 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-2">
            <Info className="w-3.5 h-3.5" strokeWidth={2} /> Soporte Técnico
          </p>
          <p className="text-xs text-gray-500 font-light">
            {t('help_desc').split('support@quhealthy.com')[0]}
            <a href="mailto:support@quhealthy.com" className="font-bold text-black dark:text-white hover:underline ml-1">
              support@quhealthy.com
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}