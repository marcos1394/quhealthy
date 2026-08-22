"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Package,
  Pill,
  Star,
  ShieldCheck,
  Video,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/hooks/useBookingStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ShowcaseTab = "specialists" | "packages" | "services" | "pharmacy";

export function MarketplaceShowcaseSection() {
  const t = useTranslations("MarketplaceShowcase");
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("specialists");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { addToCart, setProvider, openCart } = useBookingStore();

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // 1. Especialistas Destacados Reales / Representativos
  const specialists = [
    {
      id: 1,
      name: "Dra. Sofía Mendoza",
      specialty: "Medicina Interna & Cardiología",
      rating: 4.9,
      reviews: 142,
      price: 850,
      modality: "ONLINE & PRESENCIAL",
      city: "Ciudad de México",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
      slug: "dra-sofia-mendoza",
      verified: true,
      nextSlot: "Hoy, 16:30 hrs",
    },
    {
      id: 2,
      name: "Dr. Alejandro Morales",
      specialty: "Nutrición Clínica & Diabetes",
      rating: 5.0,
      reviews: 98,
      price: 700,
      modality: "ONLINE",
      city: "Guadalajara, JAL",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
      slug: "dr-alejandro-morales",
      verified: true,
      nextSlot: "Mañana, 10:00 hrs",
    },
    {
      id: 3,
      name: "Dra. Valeria Ramos",
      specialty: "Ginecología & Obstetricia",
      rating: 4.9,
      reviews: 215,
      price: 1100,
      modality: "PRESENCIAL",
      city: "Monterrey, NL",
      image: "https://images.unsplash.com/photo-1594824813575-8162235cfd89?auto=format&fit=crop&q=80&w=400",
      slug: "dra-valeria-ramos",
      verified: true,
      nextSlot: "Hoy, 18:00 hrs",
    },
    {
      id: 4,
      name: "Dr. Carlos Santillán",
      specialty: "Psicología & Salud Mental",
      rating: 4.8,
      reviews: 86,
      price: 650,
      modality: "ONLINE",
      city: "Puebla, PUE",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
      slug: "dr-carlos-santillan",
      verified: true,
      nextSlot: "Hoy, 19:30 hrs",
    },
  ];

  // 2. Paquetes y Checkups Preventivos
  const packages = [
    {
      id: 101,
      name: "Checkup Integral 360° (Mujer)",
      providerName: "Clínica de Salud Integral",
      providerSlug: "clinica-salud-integral",
      sessions: 4,
      price: 2450,
      compareAtPrice: 3500,
      discount: 30,
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600",
      items: ["Biometría Hemática", "Papanicolau Digital", "Ultrasonido Pélvico", "Consulta Ginecológica"],
    },
    {
      id: 102,
      name: "Paquete Control Glucémico & Diabetes",
      providerName: "Centro Endocrinológico",
      providerSlug: "centro-endocrinologico",
      sessions: 3,
      price: 1800,
      compareAtPrice: 2400,
      discount: 25,
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600",
      items: ["HbA1c en Sangre", "Perfil de Lípidos", "2 Consultas de Seguimiento Nutricional"],
    },
    {
      id: 103,
      name: "Plan Bienestar Emocional (5 Sesiones)",
      providerName: "Red Psicológica QuHealthy",
      providerSlug: "red-psicologica",
      sessions: 5,
      price: 2800,
      compareAtPrice: 3750,
      discount: 25,
      image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=600",
      items: ["Evaluación Inicial", "4 Sesiones Terapéuticas Online", "Bitácora Digital de Hábitos"],
    },
  ];

  // 3. Servicios Médicos y Teleconsulta
  const services = [
    {
      id: 201,
      name: "Teleconsulta de Medicina General",
      providerName: "Dr. Roberto Vega",
      providerSlug: "dr-roberto-vega",
      duration: "30 min",
      price: 450,
      modality: "ONLINE",
      category: "Telemedicina",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
      badge: "Receta Digital Inmediata",
    },
    {
      id: 202,
      name: "Perfil Tiroideo Completo + Interpretación",
      providerName: "Laboratorios Clínicos Biomédica",
      providerSlug: "laboratorios-biomedica",
      duration: "Toma de muestra",
      price: 680,
      modality: "PRESENCIAL",
      category: "Laboratorio",
      image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&q=80&w=600",
      badge: "Resultados en 24 hrs",
    },
    {
      id: 203,
      name: "Consulta Pediátrica Preventiva",
      providerName: "Dra. Mariana Garza",
      providerSlug: "dra-mariana-garza",
      duration: "45 min",
      price: 800,
      modality: "PRESENCIAL & ONLINE",
      category: "Pediatría",
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600",
      badge: "Cartilla Digital NOM-031",
    },
  ];

  // 4. Farmacia y Bienestar
  const products = [
    {
      id: 301,
      name: "Glucómetro Inteligente Bluetooth QuSync",
      providerName: "QuHealthy Medical Devices",
      providerSlug: "quhealthy-devices",
      price: 890,
      stock: 45,
      brand: "QuHealthy Tech",
      image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=600",
      tag: "Sincronización Automática",
    },
    {
      id: 302,
      name: "Omega-3 Ultra Puro 1200mg (90 Cápsulas)",
      providerName: "NutriLab Farmacia",
      providerSlug: "nutrilab-farmacia",
      price: 480,
      stock: 120,
      brand: "NutriLab",
      image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=600",
      tag: "Certificado Libre de Metales",
    },
    {
      id: 303,
      name: "Tensiómetro Digital de Brazo con Registro Clínico",
      providerName: "QuHealthy Medical Devices",
      providerSlug: "quhealthy-devices",
      price: 1150,
      stock: 28,
      brand: "QuHealthy Tech",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600",
      tag: "Validación Médica ESH",
    },
  ];

  const handleAddProductToCart = (p: typeof products[0]) => {
    setProvider(1, p.providerSlug, p.providerName, "#10b981");
    addToCart(
      {
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.image,
        type: "PRODUCT",
        category: "Farmacia",
        description: p.tag,
        quantity: 1,
      },
      p.providerSlug,
      p.providerName,
      "#10b981"
    );
    toast.success(`${p.name} añadido al carrito`);
    openCart();
  };

  return (
    <section className="py-20 bg-gray-50/50 dark:bg-[#080808] border-y border-gray-100 dark:border-gray-900 font-sans select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ── CABECERA DE LA SECCIÓN ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("badge")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              {t("title_start")}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                {t("title_highlight")}
              </span>
            </h2>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
              {t("description")}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 transition-all shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 transition-all shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <Button
              asChild
              className="h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:scale-102 transition-all gap-2"
            >
              <Link href={`/${locale}/discover`}>
                <span>{t("btn_explore_all")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* ── SELECTOR DE PESTAÑAS ───────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "specialists" as ShowcaseTab, label: t("tabs.specialists"), icon: Stethoscope },
            { id: "packages" as ShowcaseTab, label: t("tabs.packages"), icon: Package },
            { id: "services" as ShowcaseTab, label: t("tabs.services"), icon: Video },
            { id: "pharmacy" as ShowcaseTab, label: t("tabs.pharmacy"), icon: Pill },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-xs tracking-tight transition-all cursor-pointer whitespace-nowrap shadow-2xs",
                  isSelected
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                    : "bg-white dark:bg-[#121212] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] border border-gray-200/80 dark:border-gray-800"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── CONTENEDOR CARRUSEL DE ÍTEMS ───────────────────────────── */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto no-scrollbar pb-4 pt-1 snap-x snap-mandatory"
        >
          {/* 1. DOCTORES Y ESPECIALISTAS */}
          {activeTab === "specialists" &&
            specialists.map((doc) => (
              <div
                key={doc.id}
                onClick={() => router.push(`/${locale}/store/${doc.slug}`)}
                className="w-[300px] sm:w-[340px] shrink-0 snap-start rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div className="space-y-4">
                  {/* Foto & Status */}
                  <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-2xs">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t("verified_badge")}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 bg-emerald-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-emerald-200 flex items-center justify-between shadow-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{doc.nextSlot}</span>
                      </span>
                    </div>
                  </div>

                  {/* Datos del Doctor */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {doc.specialty}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold font-mono text-gray-900 dark:text-white">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{doc.rating}</span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          {t("reviews_count", { count: doc.reviews })}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight group-hover:text-emerald-600 transition-colors">
                      {doc.name}
                    </h3>

                    <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{doc.city}</span>
                    </p>
                  </div>
                </div>

                {/* Footer Precio y CTA */}
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Consulta desde
                    </span>
                    <span className="text-lg font-black font-mono text-gray-900 dark:text-white">
                      ${doc.price} MXN
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    {t("btn_book")}
                  </Button>
                </div>
              </div>
            ))}

          {/* 2. PAQUETES Y CHECKUPS */}
          {activeTab === "packages" &&
            packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => router.push(`/${locale}/store/${pkg.providerSlug}`)}
                className="w-[310px] sm:w-[350px] shrink-0 snap-start rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-2xs">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-rose-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md">
                      {t("save_badge", { percent: pkg.discount })}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-gray-900 dark:text-white flex items-center gap-1 shadow-xs">
                      <Layers className="w-3 h-3 text-emerald-600" />
                      <span>{t("sessions_count", { count: pkg.sessions })}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider truncate">
                      {pkg.providerName}
                    </p>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug group-hover:text-emerald-600 transition-colors">
                      {pkg.name}
                    </h3>

                    {/* Desglose de contenido */}
                    <ul className="space-y-1 pt-1">
                      {pkg.items.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-500 flex items-center gap-1.5 font-medium truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs line-through text-gray-400 font-mono block">
                      ${pkg.compareAtPrice} MXN
                    </span>
                    <span className="text-lg font-black font-mono text-gray-900 dark:text-white">
                      ${pkg.price} MXN
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs"
                  >
                    {t("btn_view_package")}
                  </Button>
                </div>
              </div>
            ))}

          {/* 3. SERVICIOS Y TELEMEDICINA */}
          {activeTab === "services" &&
            services.map((srv) => (
              <div
                key={srv.id}
                onClick={() => router.push(`/${locale}/store/${srv.providerSlug}`)}
                className="w-[300px] sm:w-[340px] shrink-0 snap-start rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-2xs">
                    <img
                      src={srv.image}
                      alt={srv.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-emerald-300 flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3" />
                      <span>{srv.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md">
                        {srv.category}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {srv.modality}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug group-hover:text-emerald-600 transition-colors">
                      {srv.name}
                    </h3>

                    <p className="text-xs text-gray-500 font-medium truncate">
                      {srv.providerName}
                    </p>

                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{srv.badge}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black font-mono text-gray-900 dark:text-white">
                      ${srv.price} MXN
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    {t("btn_book")}
                  </Button>
                </div>
              </div>
            ))}

          {/* 4. FARMACIA Y BIENESTAR */}
          {activeTab === "pharmacy" &&
            products.map((prod) => (
              <div
                key={prod.id}
                className="w-[300px] sm:w-[330px] shrink-0 snap-start rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#111] p-4 flex items-center justify-center shadow-2xs">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                      {prod.brand}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium truncate">
                      {prod.tag}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold">
                      ✓ En existencia ({prod.stock} disponibles)
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black font-mono text-gray-900 dark:text-white">
                      ${prod.price} MXN
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAddProductToCart(prod)}
                    className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t("btn_add_to_cart")}</span>
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
