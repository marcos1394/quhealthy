"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Stethoscope,
  Package,
  Pill,
  Video,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { discoverService } from "@/services/discover.service";
import { DiscoverItem, DiscoverProvider } from "@/types/discover";
import { ProviderCard } from "@/components/discover/ProviderCard";
import { DiscoverItemCard } from "@/components/discover/DiscoverItemCard";
import { cn } from "@/lib/utils";

type ShowcaseTab = "specialists" | "packages" | "services" | "pharmacy";

export function MarketplaceShowcaseSection() {
  const t = useTranslations("MarketplaceShowcase");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("specialists");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Estados reales cargados de las APIs de producción
  const [providers, setProviders] = useState<DiscoverProvider[]>([]);
  const [packages, setPackages] = useState<DiscoverItem[]>([]);
  const [services, setServices] = useState<DiscoverItem[]>([]);
  const [products, setProducts] = useState<DiscoverItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchMarketplaceData() {
      try {
        setIsLoading(true);
        const [providersRes, packagesRes, servicesRes, productsRes] = await Promise.allSettled([
          discoverService.getAllProviders(undefined, "STORE", { size: 8 }),
          discoverService.searchItems({ type: "PACKAGE", size: 8 }),
          discoverService.searchItems({ type: "SERVICE", size: 8 }),
          discoverService.searchItems({ type: "PRODUCT", size: 8 }),
        ]);

        if (!isMounted) return;

        if (providersRes.status === "fulfilled" && providersRes.value) {
          const list = [
            ...(providersRes.value.sponsored || []),
            ...(providersRes.value.organic || []),
          ];
          setProviders(list);
        }

        if (packagesRes.status === "fulfilled" && packagesRes.value) {
          const list = [
            ...(packagesRes.value.sponsored || []),
            ...(packagesRes.value.organic || []),
          ];
          setPackages(list);
        }

        if (servicesRes.status === "fulfilled" && servicesRes.value) {
          const list = [
            ...(servicesRes.value.sponsored || []),
            ...(servicesRes.value.organic || []),
          ];
          setServices(list);
        }

        if (productsRes.status === "fulfilled" && productsRes.value) {
          const list = [
            ...(productsRes.value.sponsored || []),
            ...(productsRes.value.organic || []),
          ];
          setProducts(list);
        }
      } catch (err) {
        console.error("Error fetching live marketplace data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchMarketplaceData();

    return () => {
      isMounted = false;
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
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

        {/* ── CONTENEDOR CARRUSEL DE CARDS HOMOLOGADAS ────────────────── */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto no-scrollbar pb-4 pt-1 snap-x snap-mandatory min-h-[380px]"
        >
          {isLoading ? (
            /* Skeletons Homologados */
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-gray-800 p-5 space-y-4 animate-pulse"
              >
                <div className="w-full aspect-video rounded-2xl bg-gray-100 dark:bg-[#181818]" />
                <div className="h-4 w-3/4 rounded-full bg-gray-100 dark:bg-[#181818]" />
                <div className="h-3 w-1/2 rounded-full bg-gray-100 dark:bg-[#181818]" />
                <div className="h-10 w-full rounded-2xl bg-gray-100 dark:bg-[#181818]" />
              </div>
            ))
          ) : (
            <>
              {/* 1. DOCTORES Y ESPECIALISTAS (HOMOLOGADO CON ProviderCard) */}
              {activeTab === "specialists" && (
                providers.length > 0 ? (
                  providers.map((doc) => (
                    <div
                      key={doc.id}
                      className="w-[280px] sm:w-[320px] shrink-0 snap-start flex flex-col"
                    >
                      <ProviderCard provider={doc} isGrid={true} />
                    </div>
                  ))
                ) : (
                  <div className="w-full py-16 flex flex-col items-center justify-center text-center space-y-3 text-gray-500">
                    <Stethoscope className="w-10 h-10 stroke-1 text-gray-400" />
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Explora todos los especialistas en el directorio</p>
                    <Button asChild size="sm" variant="outline" className="rounded-xl">
                      <Link href={`/${locale}/discover`}>Ver especialistas</Link>
                    </Button>
                  </div>
                )
              )}

              {/* 2. PAQUETES Y CHECKUPS (HOMOLOGADO CON DiscoverItemCard) */}
              {activeTab === "packages" && (
                packages.length > 0 ? (
                  packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="w-[280px] sm:w-[320px] shrink-0 snap-start flex flex-col"
                    >
                      <DiscoverItemCard item={pkg} isGrid={true} />
                    </div>
                  ))
                ) : (
                  <div className="w-full py-16 flex flex-col items-center justify-center text-center space-y-3 text-gray-500">
                    <Package className="w-10 h-10 stroke-1 text-gray-400" />
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Explora todos los paquetes y checkups</p>
                    <Button asChild size="sm" variant="outline" className="rounded-xl">
                      <Link href={`/${locale}/discover?type=PACKAGE`}>Ver catálogo de paquetes</Link>
                    </Button>
                  </div>
                )
              )}

              {/* 3. SERVICIOS Y TELEMEDICINA (HOMOLOGADO CON DiscoverItemCard) */}
              {activeTab === "services" && (
                services.length > 0 ? (
                  services.map((srv) => (
                    <div
                      key={srv.id}
                      className="w-[280px] sm:w-[320px] shrink-0 snap-start flex flex-col"
                    >
                      <DiscoverItemCard item={srv} isGrid={true} />
                    </div>
                  ))
                ) : (
                  <div className="w-full py-16 flex flex-col items-center justify-center text-center space-y-3 text-gray-500">
                    <Video className="w-10 h-10 stroke-1 text-gray-400" />
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Explora todos los servicios clínicos y telemedicina</p>
                    <Button asChild size="sm" variant="outline" className="rounded-xl">
                      <Link href={`/${locale}/discover?type=SERVICE`}>Ver catálogo de servicios</Link>
                    </Button>
                  </div>
                )
              )}

              {/* 4. FARMACIA Y BIENESTAR (HOMOLOGADO CON DiscoverItemCard) */}
              {activeTab === "pharmacy" && (
                products.length > 0 ? (
                  products.map((prod) => (
                    <div
                      key={prod.id}
                      className="w-[280px] sm:w-[320px] shrink-0 snap-start flex flex-col"
                    >
                      <DiscoverItemCard item={prod} isGrid={true} />
                    </div>
                  ))
                ) : (
                  <div className="w-full py-16 flex flex-col items-center justify-center text-center space-y-3 text-gray-500">
                    <Pill className="w-10 h-10 stroke-1 text-gray-400" />
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Explora la farmacia y productos de salud</p>
                    <Button asChild size="sm" variant="outline" className="rounded-xl">
                      <Link href={`/${locale}/discover?type=PRODUCT`}>Ver catálogo de farmacia</Link>
                    </Button>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
