"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-initialize-state */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-giant-component */;
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
 CalendarDays, Users, ShoppingBag, Calculator, TrendingUp, 
 FileText, MessageCircle, Package, PackageCheck, CreditCard, 
 BadgeX, Handshake, UserCircle, LayoutDashboard, ChevronRight, 
 Stethoscope, Search, Star, Shield, BookOpen, Wallet, Vault,
 ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

type RoleType = "provider" | "patient";

const PlatformModulesSection = () => {
 const t = useTranslations('PlatformModules');
 const [activeRole, setActiveRole] = useState<RoleType>("patient");
 
 const [activeProviderCat, setActiveProviderCat] = useState("provider_clinic");
 const [activePatientCat, setActivePatientCat] = useState("patient_health");

 const [mounted, setMounted] = useState(false);
 useEffect(() => setMounted(true), []);

 const providerCategories = [
 {
 id: "provider_clinic",
 title: t('categories.provider_clinic.title'),
 icon: Stethoscope,
 description: t('categories.provider_clinic.description'),
 modules: [
 { title: t('categories.provider_clinic.modules.calendar.title'), icon: CalendarDays, description: t('categories.provider_clinic.modules.calendar.description') },
 { title: t('categories.provider_clinic.modules.history.title'), icon: FileText, description: t('categories.provider_clinic.modules.history.description') },
 { title: t('categories.provider_clinic.modules.messages.title'), icon: MessageCircle, description: t('categories.provider_clinic.modules.messages.description') },
 { title: t('categories.provider_clinic.modules.patients.title'), icon: Users, description: t('categories.provider_clinic.modules.patients.description') }
 ]
 },
 {
 id: "provider_commerce",
 title: t('categories.provider_commerce.title'),
 icon: ShoppingBag,
 description: t('categories.provider_commerce.description'),
 modules: [
 { title: t('categories.provider_commerce.modules.store.title'), icon: ShoppingBag, description: t('categories.provider_commerce.modules.store.description') },
 { title: t('categories.provider_commerce.modules.orders.title'), icon: Package, description: t('categories.provider_commerce.modules.orders.description') },
 { title: t('categories.provider_commerce.modules.inventory.title'), icon: PackageCheck, description: t('categories.provider_commerce.modules.inventory.description') }
 ]
 },
 {
 id: "provider_finance",
 title: t('categories.provider_finance.title'),
 icon: Calculator,
 description: t('categories.provider_finance.description'),
 modules: [
 { title: t('categories.provider_finance.modules.cash_register.title'), icon: Calculator, description: t('categories.provider_finance.modules.cash_register.description') },
 { title: t('categories.provider_finance.modules.billing.title'), icon: CreditCard, description: t('categories.provider_finance.modules.billing.description') },
 { title: t('categories.provider_finance.modules.dashboard.title'), icon: LayoutDashboard, description: t('categories.provider_finance.modules.dashboard.description') }
 ]
 },
 {
 id: "provider_growth",
 title: t('categories.provider_growth.title'),
 icon: TrendingUp,
 description: t('categories.provider_growth.description'),
 modules: [
 { title: t('categories.provider_growth.modules.profile.title'), icon: UserCircle, description: t('categories.provider_growth.modules.profile.description') },
 { title: t('categories.provider_growth.modules.marketing.title'), icon: BadgeX, description: t('categories.provider_growth.modules.marketing.description') },
 { title: t('categories.provider_growth.modules.referrals.title'), icon: Handshake, description: t('categories.provider_growth.modules.referrals.description') }
 ]
 }
 ];

 const patientCategories = [
 {
 id: "patient_health",
 title: t('categories.patient_health.title'),
 icon: Search,
 description: t('categories.patient_health.description'),
 modules: [
 { title: t('categories.patient_health.modules.discover.title'), icon: Search, description: t('categories.patient_health.modules.discover.description') },
 { title: t('categories.patient_health.modules.appointments.title'), icon: CalendarDays, description: t('categories.patient_health.modules.appointments.description') },
 { title: t('categories.patient_health.modules.reviews.title'), icon: Star, description: t('categories.patient_health.modules.reviews.description') }
 ]
 },
 {
 id: "patient_records",
 title: t('categories.patient_records.title'),
 icon: Shield,
 description: t('categories.patient_records.description'),
 modules: [
 { title: t('categories.patient_records.modules.vault.title'), icon: Vault, description: t('categories.patient_records.modules.vault.description') },
 { title: t('categories.patient_records.modules.dependents.title'), icon: Users, description: t('categories.patient_records.modules.dependents.description') },
 { title: t('categories.patient_records.modules.messages.title'), icon: MessageCircle, description: t('categories.patient_records.modules.messages.description') }
 ]
 },
 {
 id: "patient_commerce",
 title: t('categories.patient_commerce.title'),
 icon: ShoppingBag,
 description: t('categories.patient_commerce.description'),
 modules: [
 { title: t('categories.patient_commerce.modules.store.title'), icon: ShoppingBag, description: t('categories.patient_commerce.modules.store.description') },
 { title: t('categories.patient_commerce.modules.wallet.title'), icon: Wallet, description: t('categories.patient_commerce.modules.wallet.description') },
 { title: t('categories.patient_commerce.modules.packages.title'), icon: Package, description: t('categories.patient_commerce.modules.packages.description') }
 ]
 },
 {
 id: "patient_education",
 title: t('categories.patient_education.title'),
 icon: BookOpen,
 description: t('categories.patient_education.description'),
 modules: [
 { title: t('categories.patient_education.modules.courses.title'), icon: BookOpen, description: t('categories.patient_education.modules.courses.description') }
 ]
 }
 ];

 if (!mounted) return null;

 const currentCategories = activeRole === "provider" ? providerCategories : patientCategories;
 const activeCategoryId = activeRole === "provider" ? activeProviderCat : activePatientCat;
 
 const setActiveCat = (id: string) => {
 if (activeRole === "provider") setActiveProviderCat(id);
 else setActivePatientCat(id);
 };

 const currentData = currentCategories.find((c) => c.id === activeCategoryId) || currentCategories[0];

 // Configuración de animación arquitectónica
 const customTransition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

 return (
 <section id="platform-modules" className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 border-t border-gray-200 dark:border-gray-800 selection:bg-gray-200 dark:selection:bg-white/20">
 
 <div className="container mx-auto px-6 md:px-12 xl:px-24">
 
 {/* Toggle Maestro (Architectural Split Button) */}
 <div className="flex justify-center mb-20">
 <div className="flex items-center border border-black dark:border-white p-1">
 <button
 onClick={() => setActiveRole("patient")}
 className={cn(
 "px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 flex items-center gap-2",
 activeRole === "patient" ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 hover:text-black dark:hover:text-white"
 )}
 >
 {t('switch_patient')}
 </button>
 <button
 onClick={() => setActiveRole("provider")}
 className={cn(
 "px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 flex items-center gap-2",
 activeRole === "provider" ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 hover:text-black dark:hover:text-white"
 )}
 >
 {t('switch_provider')}
 </button>
 </div>
 </div>

 {/* Header Dinámico (Editorial) */}
 <div className="max-w-4xl mb-16 md:mb-24 mx-auto text-center flex flex-col items-center">
 <div className="border-l-2 border-black dark:border-white pl-4 mb-8">
 <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 {t('badge')}
 </span>
 </div>
 
 <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold text-black dark:text-white mb-6 tracking-tight leading-[1.1] flex flex-col sm:block min-h-[120px] sm:min-h-0">
 <AnimatePresence mode="wait">
 <motion.div
 key={activeRole}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={customTransition}
 >
 {t('title_start')} <br className="hidden md:block" />
 <span className="font-serif italic text-gray-400 dark:text-gray-500 font-light ml-2">
 {activeRole === "provider" ? t('title_highlight_provider') : t('title_highlight_patient')}
 </span>
 </motion.div>
 </AnimatePresence>
 </h2>
 
 <AnimatePresence mode="wait">
 <motion.p
 key={activeRole}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={customTransition}
 className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-light max-w-2xl mx-auto"
 >
 {activeRole === "provider" ? t('description_provider') : t('description_patient')}
 </motion.p>
 </AnimatePresence>
 </div>

 {/* Layout Interactivo (Rigid Wireframe) */}
 <div className="grid lg:grid-cols-[1fr_2fr] gap-0 border border-gray-200 dark:border-gray-800">
 
 {/* Menú de Categorías (Izquierda - Flush Menu) */}
 <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
 <AnimatePresence mode="wait">
 <motion.div
 key={activeRole}
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 transition={customTransition}
 className="flex flex-col h-full"
 >
 {currentCategories.map((category) => {
 const isActive = activeCategoryId === category.id;
 const Icon = category.icon;

 return (
 <button
 key={category.id}
 onClick={() => setActiveCat(category.id)}
 className={cn(
 "flex items-center gap-4 p-6 md:p-8 text-left transition-all duration-300 group border-b border-gray-200 dark:border-gray-800 last:border-b-0 relative",
 isActive 
 ? "bg-black text-white dark:bg-white dark:text-black" 
 : "hover:bg-gray-200/50 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400"
 )}
 >
 <div className="w-8 h-8 border border-current flex items-center justify-center shrink-0">
 <Icon className="w-4 h-4" strokeWidth={1.5} />
 </div>
 <span className="text-sm font-semibold tracking-wide uppercase flex-1">
 {category.title}
 </span>
 {isActive && (
 <motion.div layoutId="activeArrow" className="absolute right-6 opacity-50">
 <ChevronRight className="w-5 h-5" />
 </motion.div>
 )}
 </button>
 );
 })}
 </motion.div>
 </AnimatePresence>
 </div>

 {/* Área de Visualización (Derecha - Diagrama Técnico) */}
 <div className="bg-white dark:bg-[#0a0a0a] min-h-[500px] relative overflow-hidden flex flex-col">
 
 {/* Grid de fondo decorativo */}
 <div className="absolute inset-0 opacity-10 dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

 <AnimatePresence mode="wait">
 <motion.div
 key={activeCategoryId}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={customTransition}
 className="h-full flex flex-col relative z-10"
 >
 {/* Categoría Header */}
 <div className="p-8 md:p-12 border-b border-gray-200 dark:border-gray-800">
 <div className="flex items-center gap-6 mb-6">
 <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
 <currentData.icon className="w-8 h-8 text-black dark:text-white" strokeWidth={1} />
 </div>
 <h3 className="text-3xl lg:text-4xl font-semibold text-black dark:text-white tracking-tight">
 {currentData.title}
 </h3>
 </div>
 <p className="text-lg text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-xl">
 {currentData.description}
 </p>
 </div>

 {/* Grid de Módulos (Blueprint Matrix) */}
 <div className="grid md:grid-cols-2 gap-0 mt-auto bg-gray-200 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 flex-1">
 {currentData.modules.map((mod, idx) => (
 <div
 key={mod.title}
 className={cn(
 "group p-8 md:p-10 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors hover:bg-gray-50 dark:hover:bg-[#050505]",
 idx % 2 === 0 ? "border-r border-b border-gray-200 dark:border-gray-800" : "border-b border-gray-200 dark:border-gray-800"
 )}
 >
 <div className="flex flex-col h-full">
 <div className="mb-6 w-10 h-10 border border-gray-300 dark:border-gray-700 flex items-center justify-center group-hover:border-black dark:group-hover:border-white transition-colors">
 <mod.icon className="w-4 h-4 text-black dark:text-white opacity-60 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
 </div>
 <h4 className="text-lg font-semibold text-black dark:text-white mb-3 tracking-tight">
 {mod.title}
 </h4>
 <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light flex-1">
 {mod.description}
 </p>
 </div>
 </div>
 ))}
 
 {/* ✨ NUEVO: Celdas vacías transparentes para lucir el Grid Arquitectónico */}
 {currentData.modules.length % 2 !== 0 && (
 <div className="hidden md:block bg-transparent border-b border-gray-200 dark:border-gray-800" />
 )}
 </div>

 {/* Acción al final */}
 <div className="p-8 md:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-[#0a0a0a]">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
 {t('explore_all')}
 </p>
 <Link 
 href="#pricing"
 className="w-full sm:w-auto flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-all group border-0"
 >
 {t('view_plans')}
 <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>

 </motion.div>
 </AnimatePresence>

 </div>
 </div>
 </div>
 </section>
 );
};

export default PlatformModulesSection;