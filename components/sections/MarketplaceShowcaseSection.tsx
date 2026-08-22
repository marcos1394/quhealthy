"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
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
  Clock,
  Layers,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/hooks/useBookingStore";
import { discoverService } from "@/services/discover.service";
import { DiscoverItem, DiscoverProvider } from "@/types/discover";
import { toast } from "sonner";
import { cn, generateSlug } from "@/lib/utils";

type ShowcaseTab = "specialists" | "packages" | "services" | "pharmacy";

export function MarketplaceShowcaseSection() {
  const t = useTranslations("MarketplaceShowcase");
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("specialists");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { addToCart, setProvider, openCart } = useBookingStore();

  // Estados reales cargados del backend
  const [providers, setProviders] = useState<DiscoverProvider[]>([]);
  const [packages, setPackages] = useState<DiscoverItem[]>([]);
  const [services, setServices] = useState<DiscoverItem[]>([]);
  const [products, setProducts] = useState<DiscoverItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carga paralela de datos 100% reales desde el catálogo y storefront de producción
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
      const scrollAmount = direction === "left" ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAddProductToCart = (prod: DiscoverItem) => {
    setProvider(
      prod.providerId,
      prod.providerSlug || String(prod.providerId),
      prod.providerName || "Proveedor",
      prod.providerColor || "#10b981"
    );
    addToCart(
      {
        id: prod.id,
        name: prod.name,
        price: prod.price,
        imageUrl: prod.imageUrl,
        type: "PRODUCT",
        category: prod.category || "Farmacia",
        description: prod.description || "",
        quantity: 1,
      },
      prod.providerSlug || String(prod.providerId),
      prod.providerName || "Proveedor",
      prod.providerColor || "#10b981"
    );
    toast.success(`${prod.name} agregado al carrito`);
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

        {/* ── CONTENEDOR CARRUSEL DE ÍTEMS 100% REALES ────────────────── */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto no-scrollbar pb-4 pt-1 snap-x snap-mandatory min-h-[360px]"
        >
          {isLoading ? (
            /* Skeletons de Carga */
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[300px] sm:w-[340px] shrink-0 snap-start rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-gray-800 p-5 space-y-4 animate-pulse"
              >
                <div className="w-full aspect-4/3 rounded-2xl bg-gray-100 dark:bg-[#181818]" />
                <div className="h-4 w-3/4 rounded-full bg-gray-100 dark:bg-[#181818]" />
                <div className="h-3 w-1/2 rounded-full bg-gray-100 dark:bg-[#181818]" />
                <div className="h-10 w-full rounded-2xl bg-gray-100 dark:bg-[#181818]" />
              </div>
            ))
          ) : (
            <>
              {/* 1. DOCTORES Y ESPECIALISTAS (STOREFRONT) */}
              {activeTab === "specialists" && (
                providers.length > 0 ? (
                  providers.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => router.push(`/${locale}/store/${doc.slug}`)}
                      className="w-[300px] sm:w-[340px] shrink-0 snap-start rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="space-y-4">
                        <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-2xs">
                          <img
                            src={doc.imageUrl || doc.logoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"}
                            alt={doc.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 shadow-xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t("verified_badge")}</span>
                          </div>

                          {doc.scheduleSummary && (
                            <div className="absolute bottom-3 left-3 right-3 bg-emerald-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-emerald-200 flex items-center justify-between shadow-xs">
                              <span className="flex items-center gap-1 truncate">
                                <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="truncate">{doc.scheduleSummary}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate">
                              {doc.category || "Especialidad Médica"}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold font-mono text-gray-900 dark:text-white shrink-0">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>{doc.rating || 5.0}</span>
                              <span className="text-[10px] text-gray-400 font-normal">
                                {t("reviews_count", { count: doc.reviews || 1 })}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight group-hover:text-emerald-600 transition-colors truncate">
                            {doc.name}
                          </h3>

                          {doc.city && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 font-medium truncate">
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">{doc.city}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Consulta desde
                          </span>
                          <span className="text-lg font-black font-mono text-gray-900 dark:text-white">
                            ${doc.basePrice || 700} MXN
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

              {/* 2. PAQUETES Y CHECKUPS */}
              {activeTab === "packages" && (
                packages.length > 0 ? (
                  packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => router.push(`/${locale}/market/item/${pkg.id}-${generateSlug(pkg.name)}`)}
                      className="w-[310px] sm:w-[350px] shrink-0 snap-start rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="space-y-4">
                        <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-2xs">
                          <img
                            src={pkg.imageUrl || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600"}
                            alt={pkg.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {pkg.discountPercentage && pkg.discountPercentage > 0 && (
                            <div className="absolute top-3 right-3 bg-rose-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md">
                              {t("save_badge", { percent: pkg.discountPercentage })}
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-gray-900 dark:text-white flex items-center gap-1 shadow-xs">
                            <Layers className="w-3 h-3 text-emerald-600" />
                            <span>Paquete Integral</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider truncate">
                            {pkg.providerName || "Proveedor Verificado"}
                          </p>
                          <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug group-hover:text-emerald-600 transition-colors truncate">
                            {pkg.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {pkg.description || "Paquete de salud preventivo con consultas y estudios incluidos."}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div>
                          {pkg.compareAtPrice && pkg.compareAtPrice > pkg.price && (
                            <span className="text-xs line-through text-gray-400 font-mono block">
                              ${pkg.compareAtPrice} MXN
                            </span>
                          )}
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

              {/* 3. SERVICIOS Y TELEMEDICINA */}
              {activeTab === "services" && (
                services.length > 0 ? (
                  services.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => router.push(`/${locale}/market/item/${srv.id}-${generateSlug(srv.name)}`)}
                      className="w-[300px] sm:w-[340px] shrink-0 snap-start rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="space-y-4">
                        <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-2xs">
                          <img
                            src={srv.imageUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600"}
                            alt={srv.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {srv.durationMinutes && (
                            <div className="absolute top-3 left-3 bg-emerald-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-emerald-300 flex items-center gap-1 shadow-xs">
                              <Clock className="w-3 h-3" />
                              <span>{srv.durationMinutes} min</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md truncate">
                              {srv.category || "Consulta Médica"}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 shrink-0">
                              {srv.modality || "ONLINE & PRESENCIAL"}
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug group-hover:text-emerald-600 transition-colors truncate">
                            {srv.name}
                          </h3>

                          <p className="text-xs text-gray-500 font-medium truncate">
                            {srv.providerName || "Especialista Certificado"}
                          </p>
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

              {/* 4. FARMACIA Y BIENESTAR */}
              {activeTab === "pharmacy" && (
                products.length > 0 ? (
                  products.map((prod) => (
                    <div
                      key={prod.id}
                      className="w-[300px] sm:w-[330px] shrink-0 snap-start rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className="space-y-4">
                        <div
                          onClick={() => router.push(`/${locale}/market/item/${prod.id}-${generateSlug(prod.name)}`)}
                          className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#111] p-4 flex items-center justify-center shadow-2xs cursor-pointer"
                        >
                          <img
                            src={prod.imageUrl || "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=600"}
                            alt={prod.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs truncate max-w-[180px]">
                            {prod.providerName || "Farmacia"}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h3
                            onClick={() => router.push(`/${locale}/market/item/${prod.id}-${generateSlug(prod.name)}`)}
                            className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug truncate cursor-pointer hover:text-emerald-600 transition-colors"
                          >
                            {prod.name}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium truncate">
                            {prod.category || "Farmacia y Cuidado"}
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
