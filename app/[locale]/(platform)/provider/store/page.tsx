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
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8">
 <div className="flex items-center gap-6">
 <div className="w-16 h-16 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-[#0a0a0a] shrink-0 shadow-sm">
 <Store className="w-7 h-7 text-emerald-600" strokeWidth={2} />
 </div>
 <div>
 <div className="flex items-center gap-4 mb-2">
 <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Centro de Mando</h1>
 <span className={cn(
 "px-3 py-1 text-xs font-semibold rounded-full",
 profile?.marketplaceVisible 
 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
 : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
 )}>
 {profile?.marketplaceVisible ? "Pública" : "Oculta"}
 </span>
 </div>
 <p className="text-sm text-gray-500 font-medium">
 Gestión integral de plataforma y catálogo
 </p>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row gap-3">
 <Button 
 onClick={handleToggleVisibility} 
 disabled={isPublishing}
 variant="outline"
 className="h-12 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
 >
 {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
 {profile?.marketplaceVisible ? "Ocultar Tienda" : "Publicar Tienda"}
 </Button>
 
 <Button 
 onClick={() => window.open(`/store/${profile?.slug}`, '_blank')}
 disabled={!profile?.marketplaceVisible}
 className="h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors border-0 text-sm font-semibold shadow-sm"
 >
 <Eye className="w-4 h-4 mr-2" /> Ver en Vivo
 </Button>
 </div>
 </div>

 {/* Grid de Gestión */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Bloque: Catálogo e Inventario */}
 <div className="lg:col-span-2 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col shadow-sm overflow-hidden">
 <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-[#050505]/50">
 <div className="flex items-center gap-3">
 <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-500" strokeWidth={2} />
 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Catálogo e Inventario</h3>
 </div>
 <button onClick={() => router.push("/provider/store/catalog")} className="w-10 h-10 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#111] transition-colors shadow-sm">
 <ChevronRight className="w-5 h-5 text-gray-500" />
 </button>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 md:p-8">
 <div onClick={() => router.push("/provider/store/catalog")} className="p-6 rounded-2xl bg-gray-50/50 dark:bg-[#050505]/50 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-100 dark:hover:bg-emerald-900/10 dark:hover:border-emerald-900/30 transition-colors group">
 <Stethoscope className="w-6 h-6 mb-3 text-gray-400 group-hover:text-emerald-600 transition-colors" strokeWidth={2} />
 <p className="text-3xl font-bold tracking-tight mb-1 text-gray-900 dark:text-white">{activeServices}</p>
 <p className="text-xs font-semibold text-gray-500">Servicios</p>
 </div>
 <div onClick={() => router.push("/provider/store/catalog")} className="p-6 rounded-2xl bg-gray-50/50 dark:bg-[#050505]/50 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-100 dark:hover:bg-emerald-900/10 dark:hover:border-emerald-900/30 transition-colors group">
 <Pill className="w-6 h-6 mb-3 text-gray-400 group-hover:text-emerald-600 transition-colors" strokeWidth={2} />
 <p className="text-3xl font-bold tracking-tight mb-1 text-gray-900 dark:text-white">{activeProducts}</p>
 <p className="text-xs font-semibold text-gray-500">Productos</p>
 </div>
 <div onClick={() => router.push("/provider/store/catalog")} className="p-6 rounded-2xl bg-gray-50/50 dark:bg-[#050505]/50 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-100 dark:hover:bg-emerald-900/10 dark:hover:border-emerald-900/30 transition-colors group">
 <GraduationCap className="w-6 h-6 mb-3 text-gray-400 group-hover:text-emerald-600 transition-colors" strokeWidth={2} />
 <p className="text-3xl font-bold tracking-tight mb-1 text-gray-900 dark:text-white">{activeCourses}</p>
 <p className="text-xs font-semibold text-gray-500">Cursos</p>
 </div>
 <div onClick={() => router.push("/provider/store/catalog")} className="p-6 rounded-2xl bg-gray-50/50 dark:bg-[#050505]/50 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-100 dark:hover:bg-emerald-900/10 dark:hover:border-emerald-900/30 transition-colors group">
 <Package className="w-6 h-6 mb-3 text-gray-400 group-hover:text-emerald-600 transition-colors" strokeWidth={2} />
 <p className="text-3xl font-bold tracking-tight mb-1 text-gray-900 dark:text-white">{activePackages}</p>
 <p className="text-xs font-semibold text-gray-500">Paquetes</p>
 </div>
 </div>
 </div>

 {/* Bloque: Equipo Médico */}
 <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col shadow-sm overflow-hidden">
 <div className="p-6 md:p-8 border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-[#050505]/50 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Users className="w-5 h-5 text-emerald-600" strokeWidth={2} />
 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal</h3>
 </div>
 <span className="text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-3 py-1 rounded-full">
 {activeStaffCount} Activos
 </span>
 </div>
 <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
 <p className="text-sm font-medium text-gray-500 mb-6">
 Profesionales registrados para la atención y provisión de servicios.
 </p>
 <button onClick={() => router.push("/provider/store/staff")} className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors shadow-sm">
 Administrar Equipo
 </button>
 </div>
 </div>

 {/* Bloque: Identidad */}
 <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col shadow-sm overflow-hidden">
 <div className="p-6 md:p-8 border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-[#050505]/50 flex items-center gap-3">
 <Palette className="w-5 h-5 text-emerald-600" strokeWidth={2} />
 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Identidad Visual</h3>
 </div>
 <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
 <p className="text-sm font-medium text-gray-500 mb-6">
 Logo, colores de marca, imágenes de portada y biografía de la tienda.
 </p>
 <button onClick={() => router.push("/provider/store/identity")} className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors shadow-sm">
 Editar Identidad
 </button>
 </div>
 </div>

 {/* Bloque: Políticas */}
 <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col shadow-sm overflow-hidden">
 <div className="p-6 md:p-8 border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-[#050505]/50 flex items-center gap-3">
 <ShieldCheck className="w-5 h-5 text-emerald-600" strokeWidth={2} />
 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Legal y Políticas</h3>
 </div>
 <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
 <p className="text-sm font-medium text-gray-500 mb-6">
 Políticas de cancelación, reembolsos y términos de venta.
 </p>
 <button onClick={() => router.push("/provider/store/policies")} className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors shadow-sm">
 Actualizar Políticas
 </button>
 </div>
 </div>

 {/* Bloque: Integraciones */}
 <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col shadow-sm overflow-hidden">
 <div className="p-6 md:p-8 border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-[#050505]/50 flex items-center gap-3">
 <Share2 className="w-5 h-5 text-emerald-600" strokeWidth={2} />
 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Canales y Redes</h3>
 </div>
 <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
 <p className="text-sm font-medium text-gray-500 mb-6">
 Conexiones a WhatsApp, Gmail, Calendario y Redes Sociales.
 </p>
 <button onClick={() => router.push("/provider/store/integrations")} className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors shadow-sm">
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
 <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8">
 <div className="space-y-6">
 <div className="w-16 h-16 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-[#0a0a0a] shadow-sm">
 <Store className="w-7 h-7 text-emerald-600" strokeWidth={2} />
 </div>
 <div>
 <div className="flex items-center gap-4 mb-2">
 <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{t('title')}</h1>
 <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
 <Sparkles className="w-3 h-3" /> {t('badge_marketplace')}
 </span>
 </div>
 <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-xl">
 {t('subtitle')}
 </p>
 </div>
 </div>
 </motion.div>

 {/* Progress Section */}
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
 <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm">
 <div>
 <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
 <Trophy className="w-5 h-5 text-amber-500" strokeWidth={2} /> {t('progress_title')}
 </h3>
 <p className="text-sm font-medium text-gray-500">
 {t('progress_subtitle', { completed: completedCount, total: steps.length })}
 </p>
 </div>
 
 <div className="flex-1 max-w-md w-full">
 <div className="flex justify-between items-end mb-3">
 <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Avance</span>
 <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tighter">{progressPercentage}%</span>
 </div>
 <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
 <motion.div className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.5 }} />
 </div>
 </div>
 </div>
 </motion.div>

 {/* Steps Checklist */}
 <div className="grid gap-4 mt-8">
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
 "rounded-2xl border p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer transition-all duration-300 group",
 isComplete 
 ? "bg-gray-50/50 dark:bg-[#050505]/50 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111]" 
 : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-700 hover:border-emerald-200 hover:bg-emerald-50/30 dark:hover:border-emerald-900/50 shadow-sm",
 isNext ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#0a0a0a] border-emerald-200 dark:border-emerald-900" : ""
 )}
 >
 <div className="flex items-center gap-6">
 <div className={cn(
 "w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors",
 isComplete 
 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" 
 : "bg-gray-50 dark:bg-[#111] text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500",
 isNext ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : ""
 )}>
 {isComplete ? <Check className="w-6 h-6" strokeWidth={2.5} /> : <Icon className="w-6 h-6" strokeWidth={2} />}
 </div>
 
 <div>
 <div className="flex items-center gap-3 mb-1">
 <h3 className={cn("text-lg font-bold", isComplete ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white")}>{step.title}</h3>
 {step.badge && (
 <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold">
 {step.badge}
 </span>
 )}
 </div>
 <p className="text-sm text-gray-500 font-medium">{step.description}</p>
 </div>
 </div>

 <div>
 {isComplete ? (
 <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
 Completado <Check className="w-4 h-4" />
 </span>
 ) : (
 <span className={cn(
 "text-sm font-semibold flex items-center gap-2 transition-transform",
 isNext ? "text-emerald-600" : "text-gray-400 group-hover:text-emerald-600"
 )}>
 {isNext ? t('status_continue') : t('status_configure')}
 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
 <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/50 p-10 md:p-16 text-center bg-emerald-50/50 dark:bg-emerald-900/10 mt-12 shadow-sm">
 <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
 <Trophy className="w-8 h-8 text-emerald-600" strokeWidth={2} />
 </div>
 <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
 {t('ready_title')}
 </h3>
 <p className="text-gray-500 dark:text-gray-400 font-medium mb-10 max-w-lg mx-auto">
 {t('ready_desc')}
 </p>
 <Button
 onClick={handlePublishStore}
 disabled={isPublishing}
 className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 h-14 px-12 text-sm font-bold transition-colors w-full md:w-auto border-0 shadow-sm"
 >
 {isPublishing ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Sparkles className="w-5 h-5 mr-3" />}
 {isPublishing ? t('btn_publishing') : t('btn_publish')}
 </Button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Help Footer */}
 <div className="mt-12 p-6 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-start gap-4">
 <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" strokeWidth={2} />
 <div>
 <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
 Soporte Técnico
 </p>
 <p className="text-sm text-gray-500 font-medium">
 {t('help_desc').split('support@quhealthy.org')[0]}
 <a href="mailto:support@quhealthy.org" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
 support@quhealthy.org
 </a>
 </p>
 </div>
 </div>

 </div>
 </div>
 );
}