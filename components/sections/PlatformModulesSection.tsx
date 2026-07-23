"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-initialize-state */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  CalendarDays, 
  Users, 
  ShoppingBag, 
  Calculator, 
  TrendingUp, 
  FileText, 
  MessageCircle, 
  Package, 
  PackageCheck, 
  CreditCard, 
  BadgeX, 
  Handshake, 
  UserCircle, 
  LayoutDashboard, 
  ChevronRight, 
  Stethoscope, 
  Search, 
  Star, 
  Shield, 
  BookOpen, 
  Wallet, 
  Vault,
  ArrowRight,
  Layers,
  Sparkles
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

  const customTransition = { duration: 0.4, ease: "easeOut" };

  return (
    <section id="platform-modules" className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 border-t border-gray-100 dark:border-gray-800 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      
      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-7xl">
        
        {/* ── SELECTOR MAESTRO DE ROL (PACIENTE vs PROFESIONAL) ───────────── */}
        <div className="flex justify-center mb-12">
          <div className="p-1.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200/80 dark:border-gray-800 flex items-center gap-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveRole("patient")}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                activeRole === "patient"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <span>{t('switch_patient')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole("provider")}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                activeRole === "provider"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <span>{t('switch_provider')}</span>
            </button>
          </div>
        </div>

        {/* ── ENCABEZADO EDITORIAL DE LA SECCIÓN ─────────────────────────── */}
        <div className="max-w-3xl mb-12 md:mb-16 mx-auto text-center flex flex-col items-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
            <Layers className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t('badge')}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.12]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={customTransition}
              >
                {t('title_start')}{" "}
                <span className="font-serif italic text-emerald-600 dark:text-emerald-400 font-normal">
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
              className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xl mx-auto pt-1"
            >
              {activeRole === "provider" ? t('description_provider') : t('description_patient')}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ── CONTENEDOR PRINCIPAL INTERACTIVO ──────────────────────────────── */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMNA IZQUIERDA: MENÚ LATERAL DE CATEGORÍAS */}
          <div className="lg:col-span-4 flex flex-col space-y-2.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={customTransition}
                className="space-y-2"
              >
                {currentCategories.map((category) => {
                  const isActive = activeCategoryId === category.id;
                  const Icon = category.icon;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCat(category.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl transition-all text-left group shadow-sm",
                        isActive
                          ? "bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40"
                          : "bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 hover:bg-gray-50 dark:hover:bg-[#111]"
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors",
                            isActive
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 text-gray-500"
                          )}
                        >
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <span className="text-xs font-bold truncate">
                          {category.title}
                        </span>
                      </div>

                      <ChevronRight
                        className={cn(
                          "w-4 h-4 shrink-0 transition-transform",
                          isActive
                            ? "text-emerald-600 dark:text-emerald-400 translate-x-0.5"
                            : "text-gray-400 opacity-40 group-hover:opacity-100"
                        )}
                      />
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* COLUMNA DERECHA: PANEL DE MÓDULOS DEL ÁREA SELECCIONADA */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-8 min-h-[460px]">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategoryId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={customTransition}
                className="space-y-6"
              >
                {/* Encabezado del Módulo */}
                <div className="flex items-start gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                    <currentData.icon className="w-6 h-6" strokeWidth={2} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {currentData.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                      {currentData.description}
                    </p>
                  </div>
                </div>

                {/* Grilla de Funcionalidades */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentData.modules.map((mod) => {
                    const ModIcon = mod.icon;
                    return (
                      <div
                        key={mod.title}
                        className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 hover:border-emerald-500/30 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all shadow-xs space-y-2.5 group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-105 transition-transform">
                          <ModIcon className="w-4.5 h-4.5" strokeWidth={2} />
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                            {mod.title}
                          </h4>
                          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </motion.div>
            </AnimatePresence>

            {/* Acción Inferior / Footer */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs font-semibold text-gray-400">
                {t('explore_all', { defaultValue: "¿Deseas implementar estas herramientas en tu consultorio?" })}
              </p>

              <Link
                href="#pricing"
                className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 group shrink-0"
              >
                <span>{t('view_plans', { defaultValue: "Ver Planes y Membresías" })}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default PlatformModulesSection;