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
  Sparkles,
  Flower2,
  Activity,
  Heart,
  Utensils,
  Video,
  AlertTriangle,
  Pill,
  HeartHandshake,
  Boxes,
  ThermometerSnowflake,
  Warehouse,
  ShieldCheck,
  BarChart3,
  Truck
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type RoleType = "patient" | "provider" | "foundation" | "supplier";

export const PlatformModulesSection: React.FC = () => {
  const t = useTranslations('PlatformModules');
  const [activeRole, setActiveRole] = useState<RoleType>("patient");
  
  const [activeProviderCat, setActiveProviderCat] = useState("provider_clinic");
  const [activePatientCat, setActivePatientCat] = useState("patient_health");
  const [activeFoundationCat, setActiveFoundationCat] = useState("foundation_programs");
  const [activeSupplierCat, setActiveSupplierCat] = useState("supplier_catalog");

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
        { title: t('categories.provider_clinic.modules.teleconsultation.title', { defaultValue: "Teleconsulta HD & Traducción" }), icon: Video, description: t('categories.provider_clinic.modules.teleconsultation.description', { defaultValue: "Videoconsultas cifradas con transcripción simultánea y subtítulos en vivo." }) },
        { title: t('categories.provider_clinic.modules.prescription.title', { defaultValue: "Receta Digital con QR" }), icon: Pill, description: t('categories.provider_clinic.modules.prescription.description', { defaultValue: "Emisión de recetas conformes a COFEPRIS con firma y código de verificación." }) },
        { title: t('categories.provider_clinic.modules.patients.title'), icon: Users, description: t('categories.provider_clinic.modules.patients.description') },
        { title: t('categories.provider_clinic.modules.emergencies.title', { defaultValue: "Consola de Urgencias" }), icon: AlertTriangle, description: t('categories.provider_clinic.modules.emergencies.description', { defaultValue: "Monitor de triaje y alertas de pacientes en estado crítico." }) }
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
        { title: t('categories.provider_commerce.modules.inventory.title'), icon: PackageCheck, description: t('categories.provider_commerce.modules.inventory.description') },
        { title: t('categories.provider_commerce.modules.packages.title', { defaultValue: "Paquetes Clínicos" }), icon: Sparkles, description: t('categories.provider_commerce.modules.packages.description', { defaultValue: "Venta de membresías anuales, check-ups y tratamientos integrales." }) }
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
        { title: t('categories.patient_health.modules.telemedicine.title', { defaultValue: "Telemedicina HD" }), icon: Video, description: t('categories.patient_health.modules.telemedicine.description', { defaultValue: "Consultas virtuales sin salir de casa con especialistas certificados." }) },
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
        { title: t('categories.patient_records.modules.messages.title'), icon: MessageCircle, description: t('categories.patient_records.modules.messages.description') },
        { title: t('categories.patient_records.modules.treatments.title', { defaultValue: "Pastillero Inteligente" }), icon: Pill, description: t('categories.patient_records.modules.treatments.description', { defaultValue: "Recordatorios de dosis, horarios y adherencia a tus recetas médicas." }) }
      ]
    },
    {
      id: "patient_specialized",
      title: t('categories.patient_specialized.title', { defaultValue: "Salud Especializada" }),
      icon: Heart,
      description: t('categories.patient_specialized.description', { defaultValue: "Monitoreo continuo para cada etapa y condición de tu vida." }),
      modules: [
        { title: t('categories.patient_specialized.modules.womens.title', { defaultValue: "Salud Mujer & Embarazo" }), icon: Flower2, description: t('categories.patient_specialized.modules.womens.description', { defaultValue: "Ciclo menstrual, ovulación con IA, seguimiento de embarazo y postparto." }) },
        { title: t('categories.patient_specialized.modules.diabetes.title', { defaultValue: "Diabetes & Metabolismo" }), icon: Activity, description: t('categories.patient_specialized.modules.diabetes.description', { defaultValue: "Control de glucosa, HbA1c y semáforo nutricional." }) },
        { title: t('categories.patient_specialized.modules.oncology.title', { defaultValue: "Oncología & Crónicos" }), icon: Heart, description: t('categories.patient_specialized.modules.oncology.description', { defaultValue: "Estadiaje TNM, seguimiento de ciclos y acompañamiento integral." }) },
        { title: t('categories.patient_specialized.modules.nutrition.title', { defaultValue: "Nutrición IA" }), icon: Utensils, description: t('categories.patient_specialized.modules.nutrition.description', { defaultValue: "Análisis instantáneo de alimentos por fotografía y conteo de macros." }) }
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
        { title: t('categories.patient_commerce.modules.packages.title'), icon: Package, description: t('categories.patient_commerce.modules.packages.description') },
        { title: t('categories.patient_commerce.modules.courses.title', { defaultValue: "QuBlocks Academy" }), icon: BookOpen, description: t('categories.patient_commerce.modules.courses.description', { defaultValue: "Masterclasses y cursos de salud preventiva impartidos por médicos." }) }
      ]
    }
  ];

  const foundationCategories = [
    {
      id: "foundation_programs",
      title: t('categories.foundation_programs.title', { defaultValue: "Programas & Beneficiarios" }),
      icon: HeartHandshake,
      description: t('categories.foundation_programs.description', { defaultValue: "Gestión comunitaria de asistencia social, tamizajes masivos y subsidios." }),
      modules: [
        { title: t('categories.foundation_programs.modules.roster.title', { defaultValue: "Padrón de Beneficiarios" }), icon: Users, description: t('categories.foundation_programs.modules.roster.description', { defaultValue: "Validación de CURP a 18 dígitos, NSE y dictamen digital de Trabajo Social." }) },
        { title: t('categories.foundation_programs.modules.vouchers.title', { defaultValue: "Motor de Subsidios (Vouchers)" }), icon: CreditCard, description: t('categories.foundation_programs.modules.vouchers.description', { defaultValue: "Emisión de FoundationVouchers sin custodia de fondos de terceros." }) },
        { title: t('categories.foundation_programs.modules.screenings.title', { defaultValue: "Jornadas de Salud con IA" }), icon: Activity, description: t('categories.foundation_programs.modules.screenings.description', { defaultValue: "Campañas comunitarias en campo con triaje asistido por IA." }) },
        { title: t('categories.foundation_programs.modules.sharing.title', { defaultValue: "Health Data Sharing" }), icon: Shield, description: t('categories.foundation_programs.modules.sharing.description', { defaultValue: "Acceso granular temporal al expediente médico conforme a NOM-004." }) }
      ]
    },
    {
      id: "foundation_impact",
      title: t('categories.foundation_impact.title', { defaultValue: "Impacto Social & Transparencia" }),
      icon: BarChart3,
      description: t('categories.foundation_impact.description', { defaultValue: "Medición de retorno social SROI y rendición de cuentas fiscal." }),
      modules: [
        { title: t('categories.foundation_impact.modules.sroi.title', { defaultValue: "Social BI & Medición SROI" }), icon: TrendingUp, description: t('categories.foundation_impact.modules.sroi.description', { defaultValue: "Tableros de impacto y retorno social sobre la inversión de donantes." }) },
        { title: t('categories.foundation_impact.modules.tax_reports.title', { defaultValue: "Reportes Fiscales SAT" }), icon: FileText, description: t('categories.foundation_impact.modules.tax_reports.description', { defaultValue: "Evidencia documental para donatarias autorizadas y CLUNI." }) },
        { title: t('categories.foundation_impact.modules.storefront.title', { defaultValue: "Tienda Institucional Pública" }), icon: ShoppingBag, description: t('categories.foundation_impact.modules.storefront.description', { defaultValue: "Presencia en el marketplace para captación de beneficiarios." }) }
      ]
    }
  ];

  const supplierCategories = [
    {
      id: "supplier_catalog",
      title: t('categories.supplier_catalog.title', { defaultValue: "Catálogo B2B & Cotizaciones" }),
      icon: Boxes,
      description: t('categories.supplier_catalog.description', { defaultValue: "Venta mayorista a clínicas, hospitales y profesionales de la salud." }),
      modules: [
        { title: t('categories.supplier_catalog.modules.catalog.title', { defaultValue: "Catálogo Sanitario & Lotes" }), icon: PackageCheck, description: t('categories.supplier_catalog.modules.catalog.description', { defaultValue: "Control por número de lote, semáforo de caducidad y registro COFEPRIS." }) },
        { title: t('categories.supplier_catalog.modules.b2b_pricing.title', { defaultValue: "Precios de Mayoreo Escalonados" }), icon: Calculator, description: t('categories.supplier_catalog.modules.b2b_pricing.description', { defaultValue: "Tarifas diferenciadas por volumen de compra para clínicas y médicos." }) },
        { title: t('categories.supplier_catalog.modules.quotes.title', { defaultValue: "Cotizaciones Formales & PO" }), icon: FileText, description: t('categories.supplier_catalog.modules.quotes.description', { defaultValue: "Generación de cotizaciones membretadas con IVA y crédito comercial." }) },
        { title: t('categories.supplier_catalog.modules.rentals.title', { defaultValue: "Renta de Equipo Biomédico" }), icon: Stethoscope, description: t('categories.supplier_catalog.modules.rentals.description', { defaultValue: "Arrendamiento por número de serie y gestión de depósito en garantía." }) }
      ]
    },
    {
      id: "supplier_logistics",
      title: t('categories.supplier_logistics.title', { defaultValue: "Logística & Cadena de Frío" }),
      icon: Truck,
      description: t('categories.supplier_logistics.description', { defaultValue: "Operación multi-almacén y trazabilidad técnica en ruta." }),
      modules: [
        { title: t('categories.supplier_logistics.modules.cold_chain.title', { defaultValue: "Cadena de Frío IoT (2°C - 8°C)" }), icon: ThermometerSnowflake, description: t('categories.supplier_logistics.modules.cold_chain.description', { defaultValue: "Supervisión térmica en tiempo real para biológicos y fármacos." }) },
        { title: t('categories.supplier_logistics.modules.warehouses.title', { defaultValue: "Multi-Almacén & Kardex" }), icon: Warehouse, description: t('categories.supplier_logistics.modules.warehouses.description', { defaultValue: "Gestión de inventario en múltiples bodegas con auditoría inmutable." }) },
        { title: t('categories.supplier_logistics.modules.compliance.title', { defaultValue: "Cumplimiento NOM-072 / COFEPRIS" }), icon: ShieldCheck, description: t('categories.supplier_logistics.modules.compliance.description', { defaultValue: "Diferenciación de insumos con registro y libre venta." }) }
      ]
    }
  ];

  if (!mounted) return null;

  let currentCategories = patientCategories;
  let activeCategoryId = activePatientCat;

  if (activeRole === "provider") {
    currentCategories = providerCategories;
    activeCategoryId = activeProviderCat;
  } else if (activeRole === "foundation") {
    currentCategories = foundationCategories;
    activeCategoryId = activeFoundationCat;
  } else if (activeRole === "supplier") {
    currentCategories = supplierCategories;
    activeCategoryId = activeSupplierCat;
  }
  
  const setActiveCat = (id: string) => {
    if (activeRole === "provider") setActiveProviderCat(id);
    else if (activeRole === "patient") setActivePatientCat(id);
    else if (activeRole === "foundation") setActiveFoundationCat(id);
    else if (activeRole === "supplier") setActiveSupplierCat(id);
  };

  const currentData = currentCategories.find((c) => c.id === activeCategoryId) || currentCategories[0];

  const customTransition = { duration: 0.35, ease: "easeOut" };

  return (
    <section id="platform-modules" className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 border-t border-b border-gray-100 dark:border-gray-800 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      
      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-7xl">
        
        {/* ── SELECTOR MAESTRO DE LOS 4 ROLES ───────────── */}
        <div className="flex justify-center mb-12">
          <div className="p-1.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200/80 dark:border-gray-800 flex flex-wrap items-center justify-center gap-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveRole("patient")}
              className={cn(
                "px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                activeRole === "patient"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>{t('switch_patient')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole("provider")}
              className={cn(
                "px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                activeRole === "provider"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{t('switch_provider')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole("foundation")}
              className={cn(
                "px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                activeRole === "foundation"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{t('switch_foundation', { defaultValue: "Fundaciones" })}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole("supplier")}
              className={cn(
                "px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                activeRole === "supplier"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{t('switch_supplier', { defaultValue: "Proveedores" })}</span>
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
                <span className={cn(
                  "font-serif italic font-normal",
                  activeRole === "foundation" ? "text-rose-600 dark:text-rose-400" :
                  activeRole === "supplier" ? "text-blue-600 dark:text-blue-400" :
                  "text-emerald-600 dark:text-emerald-400"
                )}>
                  {activeRole === "provider" ? t('title_highlight_provider') : 
                   activeRole === "foundation" ? t('title_highlight_foundation', { defaultValue: "organizaciones y fundaciones" }) :
                   activeRole === "supplier" ? t('title_highlight_supplier', { defaultValue: "proveedores y farmacias" }) :
                   t('title_highlight_patient')}
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
              {activeRole === "provider" ? t('description_provider') : 
               activeRole === "foundation" ? t('description_foundation', { defaultValue: "Infraestructura tecnológica para programas asistenciales, padrón de beneficiarios y rendición de cuentas con total transparencia." }) :
               activeRole === "supplier" ? t('description_supplier', { defaultValue: "Canal de distribución B2B y B2C con gestión multi-almacén, cadena de frío IoT y cotizaciones formales para el sector salud." }) :
               t('description_patient')}
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
                        "w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl transition-all text-left group shadow-sm cursor-pointer",
                        isActive
                          ? activeRole === "foundation"
                            ? "bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40"
                            : activeRole === "supplier"
                            ? "bg-blue-50/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40"
                            : "bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40"
                          : "bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 hover:bg-gray-50 dark:hover:bg-[#111]"
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors",
                            isActive
                              ? activeRole === "foundation"
                                ? "bg-rose-600 text-white"
                                : activeRole === "supplier"
                                ? "bg-blue-600 text-white"
                                : "bg-emerald-600 text-white"
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
                            ? activeRole === "foundation" ? "text-rose-600 dark:text-rose-400 translate-x-0.5" :
                              activeRole === "supplier" ? "text-blue-600 dark:text-blue-400 translate-x-0.5" :
                              "text-emerald-600 dark:text-emerald-400 translate-x-0.5"
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
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border",
                    activeRole === "foundation" 
                      ? "bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400"
                      : activeRole === "supplier"
                      ? "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  )}>
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

            {/* Footer Informativo con enlace a la página de features correspondiente */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  activeRole === "foundation" ? "bg-rose-500" :
                  activeRole === "supplier" ? "bg-blue-500" :
                  "bg-emerald-500"
                )} />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t('explore_all')}
                </span>
              </div>

              <Link
                href={
                  activeRole === "provider" ? "/business" :
                  activeRole === "foundation" ? "/foundations" :
                  activeRole === "supplier" ? "/suppliers" :
                  "/discover"
                }
                className={cn(
                  "inline-flex items-center gap-2 text-xs font-bold transition-colors group",
                  activeRole === "foundation" ? "text-rose-600 dark:text-rose-400 hover:text-rose-700" :
                  activeRole === "supplier" ? "text-blue-600 dark:text-blue-400 hover:text-blue-700" :
                  "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                )}
              >
                <span>
                  {activeRole === "provider" ? t('cta_provider', { defaultValue: "Conoce la solución para Médicos y Clínicas" }) : 
                   activeRole === "foundation" ? t('cta_foundation', { defaultValue: "Ver todas las funciones para Fundaciones" }) :
                   activeRole === "supplier" ? t('cta_supplier', { defaultValue: "Ver todas las funciones para Proveedores" }) :
                   t('cta_patient', { defaultValue: "Explorar Directorio de Pacientes" })}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default PlatformModulesSection;