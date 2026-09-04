"use client";
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  MessageCircle,
  Instagram,
  Star,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  Video,
  Building2,
  Globe,
  ShieldCheck,
  Tag as TagIcon,
  ShoppingBag,
  GraduationCap,
  Box,
  PlayCircle,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, generateSlug } from "@/lib/utils";

import { useStorefront } from "@/hooks/useStorefront";
import { StorefrontItem } from "@/types/storefront";
import { useBookingStore } from "@/hooks/useBookingStore";
import { CourseCurriculumView } from "@/components/store/CourseCurriculumView";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { useMyFavorites } from "@/hooks/useMyFavorites";
import { QhSpinner } from "@/components/ui/QhSpinner";

import { ActiveCreditsBanner } from "@/components/packages/ActiveCreditsBanner";
import { useBookingCheckout } from "@/hooks/useBookingCheckout";
import { useSessionStore } from "@/stores/SessionStore";
import { useProviderScore } from "@/hooks/useProviderScore";
import { QuScoreModal } from "@/components/store/QuScoreModal";
import { CrossSellingCarousel } from "@/components/discover/CrossSellingCarousel";
import { ImageGalleryViewer } from "@/components/ui/gallery/ImageGalleryViewer";
import { BeforeAfterComparator } from "@/components/ui/gallery/BeforeAfterComparator";
import { CertificationGrid } from "@/components/ui/gallery/CertificationGrid";
import { StorefrontHero } from "@/components/store/StorefrontHero";
import { StickyBookingBar } from "@/components/store/StickyBookingBar";
import { StorefrontReviews } from "@/components/store/StorefrontReviews";
import { StorefrontNavigation } from "@/components/store/StorefrontNavigation";
import { StoreStructuredData } from "@/components/store/StoreStructuredData";
import { MultiLocationSelector } from "@/components/store/MultiLocationSelector";
import { StorefrontStickyBookingCard } from "@/components/store/StorefrontStickyBookingCard";
import { toast } from "react-toastify";

type TabType = "servicios" | "paquetes" | "productos" | "cursos";

const formatPrice = (price: number) => {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function PublicStorePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const slug = params?.slug as string;
  const t = useTranslations("StorePublic");
  const autoBookServiceId = searchParams?.get("autoBook");

  const [activeTab, setActiveTab] = useState<TabType>("servicios");
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>("ALL");
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [visibleProducts, setVisibleProducts] = useState(12);
  const { cart, addToCart, removeFromCart, setProvider, updateQuantity } =
    useBookingStore();
  const { user } = useSessionStore();
  const userId = user?.id;
  const [showQuScoreModal, setShowQuScoreModal] = useState(false);

  const { singleScore, fetchSingleScore } = useProviderScore();

  const { favoriteIds: favoriteProviderIds } = useMyFavorites("PROVIDER");
  const { favoriteIds: favoritePackageIds } = useMyFavorites("PACKAGE");
  const { favoriteIds: favoriteServiceIds } = useMyFavorites("SERVICE");
  const { favoriteIds: favoriteProductIds } = useMyFavorites("PRODUCT");
  const { favoriteIds: favoriteCourseIds } = useMyFavorites("COURSE");

  const { store, isLoading, isError } = useStorefront(slug);

  useEffect(() => {
    if (store && slug) {
      // Smart tab selection
      const hasServices = store.services && store.services.length > 0;
      const hasProducts = store.products && store.products.length > 0;
      const hasPackages = store.packages && store.packages.length > 0;
      const hasCourses = store.courses && store.courses.length > 0;

      if (!hasServices) {
        if (hasProducts) setActiveTab("productos");
        else if (hasPackages) setActiveTab("paquetes");
        else if (hasCourses) setActiveTab("cursos");
      }

      // Inicializar ubicación seleccionada si existe
      if (store.locations && store.locations.length > 0) {
        setSelectedLocationId((prev) => {
          if (prev) return prev;
          const mainLoc = store.locations?.find((l) => l.isMain) || store.locations?.[0];
          return mainLoc ? mainLoc.id : null;
        });
      }

      setProvider(
        store.providerId,
        slug,
        store.displayName,
        store.primaryColor || "#000000",
      );
      fetchSingleScore(store.providerId);
      
      // LOG VISIT TO ANALYTICS
      import('@/services/analytics.service').then(({ analyticsService }) => {
        const searchQuery = searchParams?.get("q") || "";
        const referrer = document.referrer || "";
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        
        analyticsService.logStoreVisit({
          providerId: store.providerId,
          consumerId: user?.id,
          searchQuery,
          referrer,
          deviceType: isMobile ? "MOBILE" : "DESKTOP"
        }).catch(err => console.error("Error logging store visit", err));
      });
    }
  }, [
    store?.providerId,
    store?.displayName,
    store?.primaryColor,
    store?.locations,
    slug,
    setProvider,
    fetchSingleScore,
    user?.id,
    searchParams
  ]);

  // AUTO-BOOK LOGIC
  useEffect(() => {
    if (store && autoBookServiceId && !isLoading) {
      const serviceId = Number(autoBookServiceId);
      const serviceToBook = store.services?.find(
        (s: StorefrontItem) => s.id === serviceId,
      );

      if (serviceToBook) {
        setProvider(
          store.providerId,
          slug,
          store.displayName,
          store.primaryColor || "#000000",
        );
        addToCart(serviceToBook, slug, store.displayName, store.primaryColor || "#000000");
        const query = selectedLocationId ? `?locationId=${selectedLocationId}` : "";
        router.replace(`/${locale}/patient/booking/${slug}${query}`);
      }
    }
  }, [
    store,
    autoBookServiceId,
    isLoading,
    locale,
    slug,
    selectedLocationId,
    addToCart,
    setProvider,
    router,
  ]);

  const handleAddToCart = (item: StorefrontItem) => {
    addToCart(item, slug, store?.displayName, store?.primaryColor || "#000000");
    toast.success(
      <div className="flex items-center justify-between gap-3 text-xs font-semibold">
        <span className="truncate">{item.name} {t("added_to_selection", { defaultValue: "agregado" })}</span>
        <button
          type="button"
          onClick={() => {
            const query = selectedLocationId ? `?locationId=${selectedLocationId}` : "";
            router.push(`/${locale}/patient/booking/${slug}${query}`);
          }}
          className="font-bold underline text-white hover:text-emerald-200 shrink-0 cursor-pointer"
        >
          {item.type === "SERVICE" || item.type === "PACKAGE" ? "Agendar →" : "Ver Selección →"}
        </button>
      </div>,
      { autoClose: 3500 }
    );
  };

  const handleSelectQuickSlot = (slotTime: string, locId?: number) => {
    const targetLocId = locId || selectedLocationId;
    const queryParams = new URLSearchParams();
    if (targetLocId) queryParams.set("locationId", String(targetLocId));
    if (slotTime) queryParams.set("timeSlot", slotTime);
    router.push(`/${locale}/patient/booking/${slug}?${queryParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
          Cargando la Tienda...
        </p>
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center transition-colors duration-300">
        <div className="w-16 h-16 border border-red-500 bg-red-50 dark:bg-red-900/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-bold tracking-tight uppercase text-black dark:text-white mb-2">
          Directorio Inaccesible
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-md mx-auto mb-8">
          EL CATÁLOGO SOLICITADO NO EXISTE O SE ENCUENTRA TEMPORALMENTE FUERA DE
          SERVICIO.
        </p>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          Retornar a Búsqueda
        </Button>
      </div>
    );
  }

  const safePrimaryColor = store.primaryColor || "#000000";
  const hasValidPrimaryColor =
    store.primaryColor &&
    store.primaryColor !== "#000000" &&
    store.primaryColor !== "#ffffff";

  const renderModalityBadge = (modality?: string) => {
    if (modality === "ONLINE")
      return (
        <span className="bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-900/40 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
          <Video className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
          <span>{t("modality_online")}</span>
        </span>
      );
    if (modality === "IN_PERSON")
      return (
        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/40 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
          <Building2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
          <span>{t("modality_in_person")}</span>
        </span>
      );
    if (modality === "HYBRID")
      return (
        <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/40 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
          <Globe className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
          <span>{t("modality_hybrid")}</span>
        </span>
      );
    return null;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pb-40 font-sans selection:bg-gray-200 dark:selection:bg-white/20 text-black dark:text-white transition-colors duration-300">
      <StoreStructuredData store={store} />
      <StorefrontNavigation storeName={store.displayName} category={store.tags?.[0]} />
      
      {/* --- BANNER DE CRÉDITOS ACTIVOS --- */}
      <ActiveCreditsBanner
        providerId={store.providerId}
        brandColor={store.primaryColor}
      />

      {/* --- HERO SECTION Y CONFIANZA --- */}
      <StorefrontHero
        store={store}
        scoreData={singleScore}
        isFavorited={favoriteProviderIds.has(store.providerId)}
        selectedLocationId={selectedLocationId}
        onSelectSlot={handleSelectQuickSlot}
      />

      {/* --- SEDES Y CONSULTORIOS DE ATENCIÓN (TOP-FOLD) --- */}
      {store.locations && store.locations.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
          <MultiLocationSelector
            locations={store.locations}
            primaryColor={safePrimaryColor}
            selectedLocationId={selectedLocationId}
            onSelectLocation={(loc) => setSelectedLocationId(loc.id)}
          />
        </div>
      )}

      {/* --- CONTENIDO PRINCIPAL EN 2 COLUMNAS (DESKTOP) --- */}
      <div id="catalog-section" className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUMNA PRINCIPAL (8 COLS) */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            {/* NAVEGACIÓN TABULAR MODERNA CON SEGMENTED PILLS */}
            <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/80 py-3 shadow-2xs rounded-2xl px-2">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {/* SERVICIOS */}
                <button
                  onClick={() => setActiveTab("servicios")}
                  className={cn(
                    "h-11 px-4 sm:px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer shrink-0 border border-transparent",
                    activeTab === "servicios"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-sm"
                      : "bg-gray-100/80 dark:bg-[#141414] text-gray-600 dark:text-gray-400 hover:bg-gray-200/80 dark:hover:bg-[#1e1e1e] hover:text-gray-900 dark:hover:text-white"
                  )}
                  style={
                    activeTab === "servicios" && hasValidPrimaryColor
                      ? { backgroundColor: safePrimaryColor, color: "#ffffff" }
                      : undefined
                  }
                >
                  <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{t("tab_services", { defaultValue: "Servicios" })}</span>
                  <span
                    className={cn(
                      "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                      activeTab === "servicios"
                        ? "bg-white/20 text-white"
                        : "bg-gray-200/80 dark:bg-[#252525] text-gray-600 dark:text-gray-300"
                    )}
                  >
                    {store.services?.length || 0}
                  </span>
                </button>

                {/* PRODUCTOS */}
                <button
                  onClick={() => setActiveTab("productos")}
                  className={cn(
                    "h-11 px-4 sm:px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer shrink-0 border border-transparent",
                    activeTab === "productos"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-sm"
                      : "bg-gray-100/80 dark:bg-[#141414] text-gray-600 dark:text-gray-400 hover:bg-gray-200/80 dark:hover:bg-[#1e1e1e] hover:text-gray-900 dark:hover:text-white"
                  )}
                  style={
                    activeTab === "productos" && hasValidPrimaryColor
                      ? { backgroundColor: safePrimaryColor, color: "#ffffff" }
                      : undefined
                  }
                >
                  <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{t("tab_products", { defaultValue: "Productos" })}</span>
                  <span
                    className={cn(
                      "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                      activeTab === "productos"
                        ? "bg-white/20 text-white"
                        : "bg-gray-200/80 dark:bg-[#252525] text-gray-600 dark:text-gray-300"
                    )}
                  >
                    {store.products?.length || 0}
                  </span>
                </button>

                {/* PAQUETES */}
                <button
                  onClick={() => setActiveTab("paquetes")}
                  className={cn(
                    "h-11 px-4 sm:px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer shrink-0 border border-transparent",
                    activeTab === "paquetes"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-sm"
                      : "bg-gray-100/80 dark:bg-[#141414] text-gray-600 dark:text-gray-400 hover:bg-gray-200/80 dark:hover:bg-[#1e1e1e] hover:text-gray-900 dark:hover:text-white"
                  )}
                  style={
                    activeTab === "paquetes" && hasValidPrimaryColor
                      ? { backgroundColor: safePrimaryColor, color: "#ffffff" }
                      : undefined
                  }
                >
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{t("tab_packages", { defaultValue: "Paquetes" })}</span>
                  <span
                    className={cn(
                      "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                      activeTab === "paquetes"
                        ? "bg-white/20 text-white"
                        : "bg-gray-200/80 dark:bg-[#252525] text-gray-600 dark:text-gray-300"
                    )}
                  >
                    {store.packages?.length || 0}
                  </span>
                </button>

                {/* CURSOS */}
                <button
                  onClick={() => setActiveTab("cursos")}
                  className={cn(
                    "h-11 px-4 sm:px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer shrink-0 border border-transparent",
                    activeTab === "cursos"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-sm"
                      : "bg-gray-100/80 dark:bg-[#141414] text-gray-600 dark:text-gray-400 hover:bg-gray-200/80 dark:hover:bg-[#1e1e1e] hover:text-gray-900 dark:hover:text-white"
                  )}
                  style={
                    activeTab === "cursos" && hasValidPrimaryColor
                      ? { backgroundColor: safePrimaryColor, color: "#ffffff" }
                      : undefined
                  }
                >
                  <GraduationCap className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{t("tab_courses", { defaultValue: "Cursos" })}</span>
                  <span
                    className={cn(
                      "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                      activeTab === "cursos"
                        ? "bg-white/20 text-white"
                        : "bg-gray-200/80 dark:bg-[#252525] text-gray-600 dark:text-gray-300"
                    )}
                  >
                    {store.courses?.length || 0}
                  </span>
                </button>
              </div>
            </div>

            {/* --- CONTENIDO DE PESTAÑAS Y CATÁLOGO --- */}
            <div>
        <AnimatePresence mode="wait">
          {/* VISTA 1: SERVICIOS CORREGIDA Y REDISEÑADA */}
          {activeTab === "servicios" && (
            <motion.div
              key="servicios"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* --- BUSCADOR RÁPIDO DE SERVICIOS Y TRATAMIENTOS --- */}
              {store.services && store.services.length > 3 && (
                <div className="relative w-full max-w-md">
                  <input
                    type="text"
                    value={serviceSearchQuery}
                    onChange={(e) => setServiceSearchQuery(e.target.value)}
                    placeholder={t("search_services_placeholder", { defaultValue: "Buscar consulta, estudio o procedimiento..." })}
                    className="w-full h-11 pl-10 pr-8 rounded-2xl bg-gray-50/80 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  {serviceSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setServiceSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              {/* --- FILTRO RÁPIDO DE CATEGORÍAS DE SERVICIO --- */}
              {(() => {
                const categories = Array.from(
                  new Set((store.services || []).map((s) => s.category).filter(Boolean))
                );
                if (categories.length <= 1 && (store.services?.length || 0) <= 3) return null;

                return (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    <button
                      type="button"
                      onClick={() => setSelectedServiceCategory("ALL")}
                      className={cn(
                        "h-8 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border",
                        selectedServiceCategory === "ALL"
                          ? "bg-gray-900 text-white border-transparent dark:bg-white dark:text-black shadow-2xs"
                          : "bg-gray-50 dark:bg-[#141414] text-gray-600 dark:text-gray-400 border-gray-200/80 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-[#1e1e1e]"
                      )}
                    >
                      {t("all_categories", { defaultValue: "Todas las Categorías" })} ({store.services.length})
                    </button>

                    {categories.map((cat) => {
                      const count = store.services.filter((s) => s.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedServiceCategory(cat)}
                          className={cn(
                            "h-8 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border",
                            selectedServiceCategory === cat
                              ? "bg-gray-900 text-white border-transparent dark:bg-white dark:text-black shadow-2xs"
                              : "bg-gray-50 dark:bg-[#141414] text-gray-600 dark:text-gray-400 border-gray-200/80 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-[#1e1e1e]"
                          )}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {store.services && store.services.length > 0 ? (
                (() => {
                  const filteredServices = store.services.filter((s) => {
                    const matchesCategory =
                      selectedServiceCategory === "ALL" || s.category === selectedServiceCategory;
                    const matchesSearch =
                      !serviceSearchQuery.trim() ||
                      s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
                      (s.description &&
                        s.description.toLowerCase().includes(serviceSearchQuery.toLowerCase()));
                    return matchesCategory && matchesSearch;
                  });

                  if (filteredServices.length === 0) {
                    return (
                      <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-[#050505]">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          No encontramos servicios que coincidan con tu búsqueda.
                        </p>
                      </div>
                    );
                  }

                  return filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800/90 transition-all p-6 sm:p-7 flex flex-col md:flex-row gap-6 md:items-start group hover:-translate-y-0.5 hover:shadow-lg rounded-3xl relative hover:z-10 shadow-2xs"
                      style={
                        hasValidPrimaryColor
                          ? ({
                              "--store-color": safePrimaryColor,
                            } as React.CSSProperties)
                          : undefined
                      }
                    >
                      <div className="flex-1 flex flex-col gap-4">
                        {/* Cabecera Interna: Badges de Modalidad, Categoría y Favoritos */}
                        <div className="flex items-start justify-between gap-4 w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            {service.category && (
                              <span
                                className={cn(
                                  "border px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-transparent",
                                  !hasValidPrimaryColor &&
                                    "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400",
                                )}
                                style={
                                  hasValidPrimaryColor
                                    ? {
                                        borderColor: safePrimaryColor,
                                        color: safePrimaryColor,
                                      }
                                    : {}
                                }
                              >
                                {service.category}
                              </span>
                            )}
                            {renderModalityBadge(service.modality)}
                            {Boolean(service.durationMinutes) && (
                              <span className="bg-gray-50 dark:bg-[#121212] border border-gray-200/60 dark:border-gray-800 px-2.5 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5 shadow-2xs">
                                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={2} />
                                <span>{service.durationMinutes} min</span>
                              </span>
                            )}
                          </div>

                          <div className="shrink-0">
                            <FavoriteButton
                              entityType="SERVICE"
                              entityId={service.id}
                              initialIsFavorite={favoriteServiceIds.has(service.id)}
                              brandColor={safePrimaryColor}
                            />
                          </div>
                        </div>

                        {/* Nombre y Descripción */}
                        <div className="space-y-2">
                          <Link
                            href={`/${locale}/market/item/${service.id}-${generateSlug(service.name)}`}
                            className="hover:underline"
                          >
                            <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight">
                              {service.name}
                            </h3>
                          </Link>
                          <p className="text-xs sm:text-sm font-normal text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                            {service.description}
                          </p>
                        </div>

                        {/* Tags */}
                        {service.searchTags && service.searchTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {service.searchTags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center text-[11px] font-medium bg-gray-50 dark:bg-[#121212] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800/80 px-2.5 py-0.5 rounded-lg"
                              >
                                <TagIcon className="w-3 h-3 mr-1 text-gray-400" strokeWidth={1.5} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* --- GALERÍA DEL SERVICIO --- */}
                        {service.galleryImages && service.galleryImages.length > 0 && (
                          <div className="mt-4 space-y-4">
                            {service.galleryImages.some((img) => img.galleryType === "SERVICE_WORK") && (
                              <ImageGalleryViewer
                                images={service.galleryImages.filter((img) => img.galleryType === "SERVICE_WORK")}
                                className="max-w-xl"
                              />
                            )}

                            {service.galleryImages.some((img) => img.galleryType === "BEFORE_AFTER") && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {service.galleryImages
                                  .filter((img) => img.galleryType === "BEFORE_AFTER")
                                  .map((pair) => (
                                    <BeforeAfterComparator key={pair.id} imagePair={pair} />
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Panel Lateral de Precios y Acción */}
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-between gap-4 border-t border-gray-100 dark:border-gray-800/80 md:border-t-0 pt-4 md:pt-0 md:min-w-[190px] self-stretch">
                        <div className="flex flex-col items-start md:items-end">
                          {service.compareAtPrice && service.compareAtPrice > service.price && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-gray-400 line-through">
                                ${formatPrice(service.compareAtPrice)}
                              </span>
                              <span className="text-[10px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-md">
                                {Math.round(((service.compareAtPrice - service.price) / service.compareAtPrice) * 100)}% OFF
                              </span>
                            </div>
                          )}
                          <div className="flex flex-col md:items-end">
                            <span className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                              ${formatPrice(service.price)}
                            </span>
                            {service.requiresEvaluation && (
                              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
                                * {t("requires_eval", { defaultValue: "Requiere valoración" })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botón de Agendar / Carrito */}
                        {(() => {
                          const isInCart = cart.some((c) => c.id === service.id && c.type === service.type);
                          return (
                            <Button
                              onClick={() =>
                                isInCart ? removeFromCart(service.id) : handleAddToCart(service)
                              }
                              className={cn(
                                "rounded-2xl px-6 h-12 w-full text-xs font-bold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer border-0",
                                isInCart
                                  ? "bg-gray-100 text-gray-900 dark:bg-[#181818] dark:text-white border border-gray-200 dark:border-gray-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                  : "text-white"
                              )}
                              style={
                                !isInCart
                                  ? { backgroundColor: safePrimaryColor }
                                  : {}
                              }
                            >
                              {isInCart ? (
                                <span>{t("remove_from_cart", { defaultValue: "Quitar" })}</span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <span>{t("add_to_cart", { defaultValue: "Agendar Cita" })}</span>
                                  <ArrowRight className="w-4 h-4" />
                                </span>
                              )}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  ));
                })()
              ) : (
                <div className="text-center py-16 border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] rounded-3xl">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {t("empty_services", {
                      defaultValue: "CATÁLOGO DE SERVICIOS NO DISPONIBLE.",
                    })}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA 2: PAQUETES */}
          {activeTab === "paquetes" && (
            <motion.div
              key="paquetes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {store.packages && store.packages.length > 0 ? (
                store.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-all group p-6 md:p-10 flex flex-col md:flex-row gap-6 md:items-start rounded-3xl hover:-translate-y-1 hover:shadow-lg relative hover:z-10"
                    style={
                      hasValidPrimaryColor
                        ? ({
                            "--store-color": safePrimaryColor,
                          } as React.CSSProperties)
                        : undefined
                    }
                  >
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4 w-full">
                        <span className="border border-black dark:border-white px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-lg flex items-center gap-1.5 w-fit">
                          <Sparkles className="w-3 h-3" strokeWidth={2} />{" "}
                          {t("badge_special", {
                            defaultValue: "Paquete Especial",
                          })}
                        </span>
                        <FavoriteButton
                          entityType="PACKAGE"
                          entityId={pkg.id}
                          initialIsFavorite={favoritePackageIds.has(pkg.id)}
                          brandColor={safePrimaryColor}
                        />
                      </div>

                      <div className="space-y-4">
                        <Link
                          href={`/${locale}/market/item/${pkg.id}-${generateSlug(pkg.name)}`}
                          className="hover:underline"
                        >
                          <h3 className="font-bold text-xl uppercase tracking-wider text-black dark:text-white">
                            {pkg.name}
                          </h3>
                        </Link>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed max-w-2xl">
                          {pkg.description}
                        </p>

                        <ul className="space-y-3 mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                          <li className="flex items-center text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                            <CheckCircle2
                              className="w-3.5 h-3.5 mr-3"
                              strokeWidth={2}
                              style={{ color: safePrimaryColor }}
                            />
                            {t("includes_services", {
                              defaultValue: "INCLUYE MÚLTIPLES SESIONES",
                            })}
                          </li>
                          <li className="flex items-center text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                            <CheckCircle2
                              className="w-3.5 h-3.5 mr-3"
                              strokeWidth={2}
                              style={{ color: safePrimaryColor }}
                            />
                            {t("preferential_price", {
                              defaultValue: "VALORACIÓN PREFERENCIAL",
                            })}
                          </li>
                        </ul>

                        {/* --- GALERÍA DEL PAQUETE --- */}
                        {pkg.galleryImages && pkg.galleryImages.length > 0 && (
                          <div className="mt-6 space-y-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                            {/* Galería general (fotos del resultado) */}
                            {pkg.galleryImages.some(
                              (img) => img.galleryType === "SERVICE_WORK",
                            ) && (
                              <ImageGalleryViewer
                                images={pkg.galleryImages.filter(
                                  (img) => img.galleryType === "SERVICE_WORK",
                                )}
                                className="max-w-xl"
                              />
                            )}

                            {/* Casos Antes / Después */}
                            {pkg.galleryImages.some(
                              (img) => img.galleryType === "BEFORE_AFTER",
                            ) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {pkg.galleryImages
                                  .filter(
                                    (img) => img.galleryType === "BEFORE_AFTER",
                                  )
                                  .map((pair) => (
                                    <BeforeAfterComparator
                                      key={pair.id}
                                      imagePair={pair}
                                    />
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-6 border-t border-gray-200 dark:border-gray-800 md:border-t-0 pt-6 md:pt-0 min-w-[180px] self-stretch md:self-auto">
                      <div className="text-left sm:text-right">
                        {pkg.compareAtPrice &&
                          pkg.compareAtPrice > pkg.price && (
                            <span className="text-[10px] font-bold text-gray-400 line-through block mb-1">
                              ${formatPrice(pkg.compareAtPrice)}
                            </span>
                          )}
                        <span className="text-3xl font-semibold tracking-tight text-black dark:text-white leading-none">
                          ${formatPrice(pkg.price)}
                        </span>
                      </div>

                      {(() => {
                        const isInCart = cart.some(
                          (c) => c.id === pkg.id && c.type === pkg.type,
                        );
                        return (
                          <Button
                            onClick={() =>
                              isInCart
                                ? removeFromCart(pkg.id)
                                : handleAddToCart(pkg)
                            }
                            className={cn(
                              "rounded-xl px-8 h-14 w-full text-[10px] font-bold uppercase tracking-widest transition-colors border-0",
                              isInCart
                                ? "bg-gray-100 text-black dark:bg-[#111] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
                                : "text-white",
                            )}
                            style={
                              !isInCart
                                ? { backgroundColor: safePrimaryColor }
                                : {}
                            }
                          >
                            {isInCart
                              ? t("remove_from_cart", { defaultValue: "Quitar" })
                              : t("btn_promo", {
                                  defaultValue: "Elegir Paquete",
                                })}
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {t("empty_packages", {
                      defaultValue: "NO HAY PAQUETES CONFIGURADOS.",
                    })}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA 3: PRODUCTOS CORREGIDA */}
          {activeTab === "productos" && (
            <motion.div
              key="productos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {store.products && store.products.length > 0 ? (
                <div className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {store.products.slice(0, visibleProducts).map((product) => {
                      const isOutOfStock =
                        product.stockQuantity === 0 && !product.isDigital;
                      const isLowStock =
                        !product.isDigital &&
                        product.stockQuantity != null &&
                        product.stockQuantity > 0 &&
                        product.stockQuantity <= 5;

                      return (
                        <div
                          key={product.id}
                          className={cn(
                            "bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-all group hover:-translate-y-1 hover:shadow-lg flex flex-col h-full",
                            isOutOfStock ? "opacity-60" : "",
                          )}
                          style={
                            hasValidPrimaryColor
                              ? ({
                                  "--store-color": safePrimaryColor,
                                } as React.CSSProperties)
                              : undefined
                          }
                        >
                          {/* Box Image */}
                          <div className="h-48 mb-6 border border-gray-100 dark:border-gray-800 relative flex items-center justify-center bg-gray-50 dark:bg-[#050505] overflow-hidden rounded-2xl">
                            {product.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover transition-all"
                              />
                            ) : (
                              <Box
                                className="w-10 h-10 text-gray-300 dark:text-gray-700"
                                strokeWidth={1.5}
                              />
                            )}

                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
                                <span className="border border-red-500 bg-red-50 text-red-600 px-3 py-1 text-xs font-bold rounded-lg">
                                  Agotado
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col flex-1">
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <span
                                className={cn(
                                  "border px-2.5 py-0.5 text-[10px] font-bold rounded-md tracking-wide bg-transparent",
                                  !hasValidPrimaryColor &&
                                    "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400",
                                )}
                                style={
                                  hasValidPrimaryColor
                                    ? {
                                        borderColor: safePrimaryColor,
                                        color: safePrimaryColor,
                                      }
                                    : {}
                                }
                              >
                                {product.category || "Producto"}
                              </span>

                              {/* Botón integrado de forma segura en la esquina superior del bloque de datos */}
                              <div className="shrink-0">
                                <FavoriteButton
                                  entityType="PRODUCT"
                                  entityId={product.id}
                                  initialIsFavorite={favoriteProductIds.has(
                                    product.id,
                                  )}
                                  brandColor={safePrimaryColor}
                                />
                              </div>
                            </div>

                            {isLowStock && (
                              <span className="text-[10px] font-bold tracking-wide text-amber-600 dark:text-amber-400 mb-3 flex items-center">
                                <AlertCircle
                                  className="w-3.5 h-3.5 mr-1"
                                  strokeWidth={2}
                                />{" "}
                                Últimas {product.stockQuantity} piezas
                              </span>
                            )}

                            <Link
                              href={`/${locale}/market/item/${product.id}-${generateSlug(product.name)}`}
                              className="hover:underline"
                            >
                              <h3 className="font-bold text-sm text-black dark:text-white line-clamp-1 mb-2">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-xs font-medium text-gray-500 line-clamp-2 mb-6 flex-1 leading-relaxed">
                              {product.description}
                            </p>

                            <div className="flex items-end justify-between pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
                              <div className="flex flex-col">
                                {product.compareAtPrice &&
                                  product.compareAtPrice > product.price && (
                                    <span className="text-xs font-bold text-gray-400 line-through mb-0.5">
                                      ${formatPrice(product.compareAtPrice)}
                                    </span>
                                  )}
                                <span className="text-xl font-bold tracking-tight text-black dark:text-white leading-none">
                                  ${formatPrice(product.price)}
                                </span>
                              </div>

                              {(() => {
                                const cartItem = cart.find(
                                  (c) =>
                                    c.id === product.id &&
                                    c.type === product.type,
                                );
                                const isInCart = !!cartItem;

                                if (isInCart) {
                                  return (
                                    <div className="flex items-center h-10 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-xl">
                                      <button
                                        onClick={() => {
                                          if (
                                            cartItem.cartQuantity &&
                                            cartItem.cartQuantity > 1
                                          ) {
                                            updateQuantity(
                                              product.id,
                                              cartItem.cartQuantity - 1,
                                            );
                                          } else {
                                            removeFromCart(product.id);
                                          }
                                        }}
                                        className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
                                      >
                                        -
                                      </button>
                                      <span className="w-10 text-center text-xs font-bold text-black dark:text-white">
                                        {cartItem.cartQuantity || 1}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            product.id,
                                            (cartItem.cartQuantity || 1) + 1,
                                          )
                                        }
                                        className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
                                      >
                                        +
                                      </button>
                                    </div>
                                  );
                                }

                                return (
                                  <Button
                                    disabled={isOutOfStock}
                                    onClick={() => handleAddToCart(product)}
                                    className={cn(
                                      "rounded-xl h-10 px-6 text-xs font-bold border-0 transition-colors cursor-pointer",
                                      isOutOfStock
                                        ? "bg-gray-100 text-gray-400 dark:bg-[#111] dark:text-gray-600 cursor-not-allowed"
                                        : "text-white",
                                    )}
                                    style={
                                      !isOutOfStock
                                        ? { backgroundColor: safePrimaryColor }
                                        : {}
                                    }
                                  >
                                    {isOutOfStock ? "Agotado" : "Agregar"}
                                  </Button>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {visibleProducts < store.products.length && (
                    <div className="flex justify-center mt-4">
                      <Button
                        onClick={() => setVisibleProducts((prev) => prev + 12)}
                        variant="outline"
                        className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors"
                      >
                        {t("load_more", { defaultValue: "Mostrar más" })}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                  <ShoppingBag
                    className="w-8 h-8 text-gray-400 mx-auto mb-4"
                    strokeWidth={1.5}
                  />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                    INVENTARIO VACÍO
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    EL ESPECIALISTA NO CUENTA CON PRODUCTOS FÍSICOS LISTADOS.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA 4: CURSOS DIGITALES */}
          {activeTab === "cursos" && (
            <motion.div
              key="cursos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {store.courses && store.courses.length > 0 ? (
                store.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col sm:flex-row border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl transition-all group hover:-translate-y-1 hover:shadow-lg relative overflow-hidden"
                    style={
                      hasValidPrimaryColor
                        ? ({
                            "--store-color": safePrimaryColor,
                          } as React.CSSProperties)
                        : undefined
                    }
                  >
                    <div className="w-full sm:w-1/3 h-48 sm:h-auto border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] relative flex items-center justify-center overflow-hidden">
                      {course.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={course.imageUrl}
                          alt={course.name}
                          className="w-full h-full object-cover transition-all"
                        />
                      ) : (
                        <PlayCircle
                          className="w-10 h-10 text-gray-300 dark:text-gray-700"
                          strokeWidth={1.5}
                        />
                      )}
                    </div>

                    <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <span className="border border-black dark:border-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit text-black dark:text-white rounded-full">
                            <GraduationCap
                              className="w-3.5 h-3.5"
                              strokeWidth={1.5}
                            />{" "}
                            Curso Online
                          </span>
                          <FavoriteButton
                            entityType="COURSE"
                            entityId={course.id}
                            initialIsFavorite={favoriteCourseIds.has(course.id)}
                            brandColor={safePrimaryColor}
                          />
                        </div>
                        <Link
                          href={`/${locale}/market/item/${course.id}-${generateSlug(course.name)}`}
                          className="hover:underline"
                        >
                          <h3 className="font-semibold text-lg text-black dark:text-white mb-2 tracking-tight">
                            {course.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 max-w-xl line-clamp-3">
                          {course.description}
                        </p>
                        <CourseCurriculumView catalogItemId={course.id} />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                        <span className="text-2xl font-semibold tracking-tight text-black dark:text-white leading-none">
                          ${formatPrice(course.price)}
                        </span>
                        {(() => {
                          const isInCart = cart.some(
                            (c) => c.id === course.id && c.type === course.type,
                          );
                          return (
                            <Button
                              onClick={() =>
                                isInCart
                                  ? removeFromCart(course.id)
                                  : handleAddToCart(course)
                              }
                              className={cn(
                                "rounded-full w-full sm:w-auto h-11 px-6 text-xs font-semibold tracking-wide transition-colors border-0",
                                isInCart
                                  ? "bg-gray-100 text-black dark:bg-[#111] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
                                  : "text-white shadow-sm",
                              )}
                              style={
                                !isInCart
                                  ? { backgroundColor: safePrimaryColor }
                                  : {}
                              }
                            >
                              {isInCart
                                ? "Quitar de selección"
                                : "Inscribirme al curso"}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                  <GraduationCap
                    className="w-8 h-8 text-gray-400 mx-auto mb-4"
                    strokeWidth={1.5}
                  />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                    SIN RESULTADOS DIGITALES
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    EL ESPECIALISTA NO HA PUBLICADO CONTENIDO FORMATIVO.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- GALERÍAS DE LA TIENDA (Instalaciones, Equipo, Certificaciones) --- */}
        {store.galleryImages && store.galleryImages.length > 0 && (
          <div className="mt-16 pt-16 border-t border-gray-200 dark:border-gray-800 space-y-16">
            {/* Fotos de Instalaciones */}
            {store.galleryImages.some(
              (img) => img.galleryType === "OFFICE",
            ) && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-6">
                  Instalaciones
                </h3>
                <ImageGalleryViewer
                  images={store.galleryImages.filter(
                    (img) => img.galleryType === "OFFICE",
                  )}
                />
              </div>
            )}

            {/* Fotos de Equipo Médico */}
            {store.galleryImages.some(
              (img) => img.galleryType === "EQUIPMENT",
            ) && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-6">
                  Equipamiento y Tecnología
                </h3>
                <ImageGalleryViewer
                  images={store.galleryImages.filter(
                    (img) => img.galleryType === "EQUIPMENT",
                  )}
                />
              </div>
            )}

            {/* Certificaciones */}
            {store.galleryImages.some(
              (img) => img.galleryType === "CERTIFICATION",
            ) && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-6">
                  Certificaciones y Respaldo Médico
                </h3>
                <CertificationGrid images={store.galleryImages} />
              </div>
            )}
          </div>
        )}

        {/* 🚀 RESEÑAS (FASE 4) */}
        <StorefrontReviews providerId={store.providerId} />

        {/* 🚀 CARRUSELES DE CROSS-SELLING (FASE 1) */}
        <div className="mt-12">
          <CrossSellingCarousel
            itemType="COURSE"
            title="Sugerencias Académicas"
            subtitle="Otros pacientes también exploraron estos cursos"
          />
          <CrossSellingCarousel
            itemType="PRODUCT"
            title="Complementos Recomendados"
          />
        </div>
      </div>
    </div>

          {/* COLUMNA STICKY LATERAL (4 COLS EN DESKTOP) */}
          <div className="hidden lg:block lg:col-span-4">
            <StorefrontStickyBookingCard
              store={store}
              scoreData={singleScore}
              selectedLocationId={selectedLocationId}
              onSelectLocation={(loc) => setSelectedLocationId(loc.id)}
              brandColor={safePrimaryColor}
            />
          </div>
        </div>
      </div>

      <QuScoreModal
        isOpen={showQuScoreModal}
        onClose={() => setShowQuScoreModal(false)}
        scoreData={singleScore}
      />

      <StickyBookingBar
        providerSlug={slug}
        brandColor={safePrimaryColor}
        selectedLocationId={selectedLocationId}
        locationName={store.locations?.find((l) => l.id === selectedLocationId)?.name}
      />
    </div>
  );
}
