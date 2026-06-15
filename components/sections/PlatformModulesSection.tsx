"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  CalendarDays, Users, ShoppingBag, Calculator, TrendingUp, 
  FileText, MessageCircle, Package, PackageCheck, CreditCard, 
  BadgeX, Handshake, UserCircle, LayoutDashboard, ChevronRight, 
  Stethoscope, Search, Star, Shield, BookOpen, Wallet, Vault
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type RoleType = "provider" | "patient";

const PlatformModulesSection = () => {
  const t = useTranslations('PlatformModules');
  const [activeRole, setActiveRole] = useState<RoleType>("patient");
  
  // We need state for active category per role
  const [activeProviderCat, setActiveProviderCat] = useState("provider_clinic");
  const [activePatientCat, setActivePatientCat] = useState("patient_health");

  // Prevent hydration mismatch for translations
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

  return (
    <section id="platform-modules" className="py-24 md:py-32 bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-slate-200/50 dark:bg-slate-800/20 blur-[100px]" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full bg-slate-300/30 dark:bg-slate-900/40 blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 md:px-12 xl:px-24 relative z-10">
        
        {/* Toggle Maestro */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-200/50 dark:bg-slate-900/50 backdrop-blur-md p-1.5 rounded-full flex items-center border border-slate-200 dark:border-slate-800 relative z-20">
            <button
              onClick={() => setActiveRole("patient")}
              className={cn(
                "relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                activeRole === "patient" ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {activeRole === "patient" && (
                <motion.div layoutId="roleIndicator" className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50" />
              )}
              <span className="relative z-10">{t('switch_patient')}</span>
            </button>
            <button
              onClick={() => setActiveRole("provider")}
              className={cn(
                "relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                activeRole === "provider" ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {activeRole === "provider" && (
                <motion.div layoutId="roleIndicator" className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50" />
              )}
              <span className="relative z-10">{t('switch_provider')}</span>
            </button>
          </div>
        </div>

        {/* Header Dinámico */}
        <div className="max-w-3xl mb-16 md:mb-24 mx-auto text-center">
          <div className="inline-block border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 backdrop-blur-sm mb-6 bg-white/50 dark:bg-slate-900/50">
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
              {t('badge')}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {t('title_start')} <span className="text-slate-500 dark:text-slate-400 font-serif italic">{activeRole === "provider" ? t('title_highlight_provider') : t('title_highlight_patient')}</span>
              </motion.div>
            </AnimatePresence>
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeRole}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-light max-w-2xl mx-auto"
            >
              {activeRole === "provider" ? t('description_provider') : t('description_patient')}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Layout Interactivo */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-16 items-start">
          
          {/* Menú de Categorías (Izquierda) */}
          <div className="flex flex-col gap-3 sticky top-32 z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3"
              >
                {currentCategories.map((category) => {
                  const isActive = activeCategoryId === category.id;
                  const Icon = category.icon;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCat(category.id)}
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-3xl text-left transition-all duration-300 group relative overflow-hidden",
                        isActive 
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-slate-900/10 dark:shadow-white/5 border-transparent" 
                          : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-2xl transition-colors",
                        isActive 
                          ? "bg-white/20 dark:bg-slate-900/10 text-white dark:text-slate-900" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                      )}>
                        <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                      </div>
                      <span className="font-semibold text-lg flex-1 tracking-tight">
                        {category.title}
                      </span>
                      {isActive && (
                        <motion.div layoutId="activeCatIndicator" className="absolute right-6 text-white/50 dark:text-slate-900/50">
                          <ChevronRight className="w-5 h-5" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Área de Visualización (Derecha) */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 min-h-[500px] shadow-sm relative overflow-hidden">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategoryId}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full flex flex-col"
              >
                {/* Categoría Header */}
                <div className="mb-10">
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white mb-6 shadow-inner">
                    <currentData.icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                    {currentData.title}
                  </h3>
                  <p className="text-lg text-slate-500 dark:text-slate-400 font-light leading-relaxed max-w-xl">
                    {currentData.description}
                  </p>
                </div>

                {/* Grid de Módulos */}
                <div className="grid md:grid-cols-2 gap-5 mt-auto">
                  {currentData.modules.map((mod, idx) => (
                    <motion.div
                      key={mod.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                      className="group p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none"
                    >
                      <div className="flex flex-col h-full">
                        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                          <mod.icon className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">
                          {mod.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light flex-1">
                          {mod.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Acción al final */}
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {t('explore_all')}
                  </p>
                  <Button asChild className="rounded-full px-8 py-6 text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                    <Link href="#pricing">
                      {t('view_plans')}
                    </Link>
                  </Button>
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
