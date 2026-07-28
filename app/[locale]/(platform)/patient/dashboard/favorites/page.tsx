"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-chain-state-updates */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Star,
  MapPin,
  ChevronRight,
  Search,
  Sparkles,
  Navigation,
  Package,
  MonitorPlay,
  Clock,
  ShoppingBag,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

// Hooks & Services
import { useMyFavorites } from "@/hooks/useMyFavorites";
import { useDiscover } from "@/hooks/useDiscover";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { catalogService } from "@/services/catalog.service";
import { CatalogItemDTO } from "@/types/catalog";

type TabType = "PROVIDER" | "PACKAGE" | "COURSE" | "SERVICE" | "PRODUCT";

const SafeImage = ({
  src,
  alt,
  fallback,
}: {
  src: string;
  alt: string;
  fallback: React.ReactNode;
}) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <>{fallback}</>;
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      onError={() => setError(true)}
    />
  );
};

// ── COMPONENTE: PESTAÑA DE ESPECIALISTAS ───────────────────────────────────
function ProviderTabContent({ router }: { router: ReturnType<typeof useRouter> }) {
  const t = useTranslations("PatientFavoritesDashboard");
  const { favoriteIds } = useMyFavorites("PROVIDER");
  const { providers } = useDiscover();

  const savedProviders = useMemo(() => {
    if (!providers) return [];
    return providers.filter((p) => favoriteIds.has(p.id));
  }, [providers, favoriteIds]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {savedProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {savedProviders.map((provider) => (
            <div
              key={provider.id}
              className="group flex flex-col rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all overflow-hidden"
            >
              {/* Imagen / Header del Especialista */}
              <div className="h-48 w-full relative bg-gray-50 dark:bg-gray-900 overflow-hidden flex items-center justify-center shrink-0">
                <SafeImage
                  src={provider.imageUrl || ""}
                  alt={provider.name}
                  fallback={
                    <User
                      className="w-10 h-10 text-gray-400 dark:text-gray-500"
                      strokeWidth={1.5}
                    />
                  }
                />
                <div className="absolute top-4 right-4 z-10">
                  <FavoriteButton
                    entityType="PROVIDER"
                    entityId={provider.id}
                    initialIsFavorite={true}
                  />
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800 px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                    {provider.rating || "N/A"}
                  </span>
                </div>
              </div>

              {/* Información */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white tracking-tight mb-0.5 truncate">
                  {provider.name}
                </h3>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-6 truncate">
                  {provider.category || t("default_specialty")}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 truncate mr-3">
                    <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-emerald-500" strokeWidth={2} />
                    <span className="truncate">{provider.city || t("default_location")}</span>
                  </span>
                  <Button
                    onClick={() => router.push(`/store/${provider.slug}`)}
                    className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold h-10 px-4 transition-all shadow-sm border-0 shrink-0 flex items-center gap-1.5"
                  >
                    <span>{t("buy_item")}</span>
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Estado Vacío de Especialistas */
        <div className="flex flex-col items-center justify-center py-20 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center mb-6">
            <Search className="w-8 h-8" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {t("empty_providers_title")}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 max-w-sm leading-relaxed">
            {t("empty_providers_desc")}
          </p>
          <Button
            onClick={() => router.push("/discover")}
            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-12 px-8 text-xs font-bold transition-all shadow-sm border-0 flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_explore")}</span>
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ── COMPONENTE: PESTAÑA DE ITEMS DEL CATÁLOGO ────────────────────────────
function ItemsTabContent({
  activeTab,
  router,
}: {
  activeTab: TabType;
  router: ReturnType<typeof useRouter>;
}) {
  const t = useTranslations("PatientFavoritesDashboard");
  const { favoriteIds } = useMyFavorites(activeTab);
  const [savedItems, setSavedItems] = useState<CatalogItemDTO[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchItems = async () => {
      if (favoriteIds.size > 0) {
        setIsLoadingItems(true);
        try {
          const items = await catalogService.getItemsBatch(
            Array.from(favoriteIds)
          );
          if (isMounted) setSavedItems(items);
        } catch (error) {
          console.error("Error fetching favorite items:", error);
        } finally {
          if (isMounted) setIsLoadingItems(false);
        }
      } else {
        if (isMounted) setSavedItems([]);
      }
    };
    fetchItems();
    return () => {
      isMounted = false;
    };
  }, [favoriteIds]);

  const getItemPlaceholder = (type: TabType) => {
    switch (type) {
      case "PACKAGE":
        return <Package className="w-8 h-8 text-gray-400" strokeWidth={1.5} />;
      case "COURSE":
        return <MonitorPlay className="w-8 h-8 text-gray-400" strokeWidth={1.5} />;
      case "SERVICE":
        return <Clock className="w-8 h-8 text-gray-400" strokeWidth={1.5} />;
      case "PRODUCT":
        return <ShoppingBag className="w-8 h-8 text-gray-400" strokeWidth={1.5} />;
      default:
        return <Sparkles className="w-8 h-8 text-gray-400" strokeWidth={1.5} />;
    }
  };

  const getEmptyStateIcon = (type: TabType) => {
    switch (type) {
      case "PACKAGE":
        return <Package className="w-8 h-8" strokeWidth={2} />;
      case "COURSE":
        return <MonitorPlay className="w-8 h-8" strokeWidth={2} />;
      case "SERVICE":
        return <Clock className="w-8 h-8" strokeWidth={2} />;
      case "PRODUCT":
        return <ShoppingBag className="w-8 h-8" strokeWidth={2} />;
      default:
        return <Search className="w-8 h-8" strokeWidth={2} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {isLoadingItems ? (
        <div className="flex justify-center items-center py-28">
          <QhSpinner size="lg" />
        </div>
      ) : savedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all overflow-hidden"
            >
              {/* Imagen del Artículo */}
              <div className="h-48 w-full relative bg-gray-50 dark:bg-gray-900 overflow-hidden flex items-center justify-center shrink-0">
                <SafeImage
                  src={item.imageUrl || ""}
                  alt={item.name}
                  fallback={getItemPlaceholder(activeTab)}
                />
                <div className="absolute top-4 right-4 z-10">
                  <FavoriteButton
                    entityType={activeTab}
                    entityId={item.id!}
                    initialIsFavorite={true}
                  />
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white tracking-tight mb-1.5 line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-3 mb-6 leading-relaxed">
                  {item.description || t("no_description")}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      {t("price_label")}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight font-mono">
                      ${item.price?.toLocaleString()}{" "}
                      <span className="text-xs font-sans font-medium text-gray-500">
                        {t("currency_symbol")}
                      </span>
                    </span>
                  </div>

                  <Button
                    onClick={() => router.push(`/store/checkout/${item.id}`)}
                    className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold h-10 px-4 transition-all shadow-sm border-0 shrink-0 flex items-center gap-1.5"
                  >
                    <span>{t("buy_item")}</span>
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Estado Vacío de Items */
        <div className="flex flex-col items-center justify-center py-20 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center mb-6">
            {getEmptyStateIcon(activeTab)}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {t("empty_items_title")}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 max-w-sm leading-relaxed">
            {t("empty_items_desc")}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function PatientFavoritesDashboard() {
  const t = useTranslations("PatientFavoritesDashboard");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("PROVIDER");

  const tabs: { id: TabType; label: string }[] = [
    { id: "PROVIDER", label: t("tab_providers") },
    { id: "PACKAGE", label: t("tab_packages") },
    { id: "COURSE", label: t("tab_courses") },
    { id: "SERVICE", label: t("tab_services") },
    { id: "PRODUCT", label: t("tab_products") },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-12 space-y-10">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 shadow-sm flex items-center justify-center shrink-0">
            <Heart className="w-7 h-7 fill-rose-600 dark:fill-rose-400" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* ── SELECTOR DE PESTAÑAS ──────────────────────────────────────── */}
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800 gap-2 no-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 h-11 text-xs font-bold transition-all whitespace-nowrap rounded-xl border flex items-center gap-2",
                activeTab === tab.id
                  ? "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a]"
              )}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── CONTENIDO DINÁMICO SEGÚN PESTAÑA ──────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "PROVIDER" ? (
            <ProviderTabContent key="provider-tab" router={router} />
          ) : (
            <ItemsTabContent
              key={`item-tab-${activeTab}`}
              activeTab={activeTab}
              router={router}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}