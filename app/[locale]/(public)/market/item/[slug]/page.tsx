import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Tag as TagIcon,
  Building2,
  Video,
  MapPin,
  Clock,
  Package,
  Layers,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  FileCheck,
  Award,
  BookOpen,
  TrendingDown,
} from "lucide-react";
import { CatalogItemDTO } from "@/types/catalog";
import { AddToCartButton } from "./AddToCartButton";
import { ProviderTrustCard } from "./ProviderTrustCard";
import { MoreFromProvider } from "./MoreFromProvider";
import { SmartFavoriteButton } from "./SmartFavoriteButton";
import { ItemShareButton } from "./ItemShareButton";
import { CourseDetailsSection } from "./CourseDetailsSection";
import { PackageDetailsSection } from "./PackageDetailsSection";
import { MarketplaceFaqSection } from "./MarketplaceFaqSection";
import { StickyBottomBar } from "./StickyBottomBar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getCatalogItem(id: string): Promise<CatalogItemDTO | null> {
  try {
    const baseUrl = (
      process.env.NEXT_PUBLIC_API_URL || "https://api.quhealthy.org"
    ).replace(/\/$/, "");
    const res = await fetch(`${baseUrl}/api/catalog/items/${id}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; QuHealthy/1.0; +Next.js Server)",
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching catalog item:", error);
    return null;
  }
}

async function getProviderProfile(providerId: number) {
  try {
    const baseUrl = (
      process.env.NEXT_PUBLIC_API_URL || "https://api.quhealthy.org"
    ).replace(/\/$/, "");
    const res = await fetch(
      `${baseUrl}/api/catalog/store/profile/${providerId}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (compatible; QuHealthy/1.0; +Next.js Server)",
        },
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    return null;
  }
}

async function getProviderItems(
  providerId: number
): Promise<CatalogItemDTO[]> {
  try {
    const baseUrl = (
      process.env.NEXT_PUBLIC_API_URL || "https://api.quhealthy.org"
    ).replace(/\/$/, "");
    const res = await fetch(
      `${baseUrl}/api/catalog/provider/${providerId}/items`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (compatible; QuHealthy/1.0; +Next.js Server)",
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.content || [];
  } catch (error) {
    console.error("Error fetching provider items:", error);
    return [];
  }
}

type Params = Promise<{ slug: string; locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const id = slug.split("-")[0];
  const item = await getCatalogItem(id);

  if (!item) {
    return { title: "Item no encontrado - QuHealthy" };
  }

  const provider = await getProviderProfile(item.providerId || 0);
  const providerImage =
    provider?.bannerUrl ||
    provider?.logoUrl ||
    (provider?.galleryImages && provider.galleryImages.length > 0
      ? provider.galleryImages[0].imageUrl
      : null);
  const imageUrl = item.imageUrl || providerImage;

  const url = `https://www.quhealthy.org/${locale}/market/item/${slug}`;
  const title = `${item.name} | QuHealthy Marketplace`;
  const description =
    item.description ||
    `Adquiere ${item.name} en QuHealthy Marketplace con garantía médica certificada.`;

  return {
    title,
    description,
    keywords: (item as any).searchTags
      ? (item as any).searchTags.join(", ")
      : "",
    openGraph: {
      title,
      description,
      url: url,
      siteName: "QuHealthy",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: item.name,
            },
          ]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: url,
      languages: {
        es: `https://www.quhealthy.org/es/market/item/${slug}`,
        en: `https://www.quhealthy.org/en/market/item/${slug}`,
        "x-default": `https://www.quhealthy.org/es/market/item/${slug}`,
      },
    },
  };
}

export default async function MarketItemPage({
  params,
}: {
  params: Params;
}) {
  const { slug, locale } = await params;
  const id = slug.split("-")[0];
  const item = await getCatalogItem(id);

  if (!item) {
    notFound();
  }

  const [providerProfile, allProviderItems] = await Promise.all([
    getProviderProfile(item.providerId || 0),
    getProviderItems(item.providerId || 0),
  ]);

  const relatedItems = allProviderItems.filter((i) => i.id !== item.id);

  let schemaType = "Product";
  if (item.type === "SERVICE") schemaType = "Service";
  if (item.type === "COURSE") schemaType = "Course";

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: item.name,
    description: item.description,
    image: item.imageUrl ? [item.imageUrl] : undefined,
    offers: {
      "@type": "Offer",
      price: item.price,
      priceCurrency: (item as any).currency || "MXN",
      availability: "https://schema.org/InStock",
      url: `https://www.quhealthy.org/${locale}/market/item/${slug}`,
    },
  };

  const isCourse = item.type === "COURSE";
  const isPackage = item.type === "PACKAGE";
  const isService = item.type === "SERVICE";
  const isProduct = item.type === "PRODUCT";

  // Solo mostrar especificaciones farmacéuticas si es un PRODUCTO real con datos de laboratorio
  const showPharmaTechSheet =
    isProduct &&
    (Boolean(item.manufacturer) ||
      Boolean(item.activeIngredient) ||
      Boolean(item.requiresPrescription));

  const comparePrice = item.compareAtPrice || 0;
  const currentPrice = item.price || 0;
  const hasDiscount = comparePrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="min-h-screen bg-gray-50/40 dark:bg-[#070707] pt-28 pb-28 font-sans select-none selection:bg-emerald-100 dark:selection:bg-emerald-950/40">
        <div className="container mx-auto px-4 sm:px-6 md:px-10 max-w-6xl space-y-8">
          {/* ── Breadcrumbs ─────────────────────────────────────────── */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <Link
              href={`/${locale}`}
              className="hover:text-emerald-600 transition-colors"
            >
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/${locale}/discover?type=${item.type}`}
              className="hover:text-emerald-600 transition-colors"
            >
              {isCourse
                ? "Cursos & Talleres"
                : isPackage
                ? "Paquetes de Salud"
                : isService
                ? "Consultas Médicas"
                : "Farmacia & Productos"}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400 truncate max-w-[150px]">
              {item.category || "General"}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 dark:text-white truncate font-bold max-w-[200px]">
              {item.name}
            </span>
          </nav>

          {/* ── Main Detail Grid ────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Columna Izquierda: Imagen del Ítem + Ficha de Confianza */}
            <div className="lg:col-span-6 space-y-6">
              <div className="w-full aspect-square rounded-3xl bg-white dark:bg-[#0f0f0f] relative flex items-center justify-center overflow-hidden border border-gray-200/80 dark:border-gray-800 shadow-md">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 space-y-2">
                    <TagIcon className="w-20 h-20 stroke-1" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      QuHealthy Marketplace
                    </span>
                  </div>
                )}

                {/* Badge de tipo de ítem */}
                <div className="absolute top-4 left-4 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs flex items-center gap-1.5">
                  {isCourse ? (
                    <>
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Curso Digital</span>
                    </>
                  ) : isPackage ? (
                    <>
                      <Package className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Paquete de Salud</span>
                    </>
                  ) : isService ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Consulta / Servicio Clínico</span>
                    </>
                  ) : (
                    <>
                      <TagIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Producto de Farmacia</span>
                    </>
                  )}
                </div>

                {hasDiscount && (
                  <div className="absolute top-4 right-4 bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-md flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>-{discountPercent}% OFF</span>
                  </div>
                )}
              </div>

              {/* Ficha de Confianza y Datos del Proveedor */}
              <ProviderTrustCard provider={providerProfile} locale={locale} />
            </div>

            {/* Columna Derecha: Información del Ítem, Precio y Acciones */}
            <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Categoría, Modalidad & Duración */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold">
                  {item.category || "Salud y Bienestar"}
                </span>

                {isCourse && (
                  <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Certificado con QR</span>
                  </span>
                )}

                {item.modality && (
                  <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#181818] text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5">
                    {item.modality === "ONLINE" ? (
                      <Video className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>{item.modality === "ONLINE" ? "100% Online" : "Presencial en Consultorio"}</span>
                  </span>
                )}

                {item.durationMinutes && (
                  <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#181818] text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span>{item.durationMinutes} min</span>
                  </span>
                )}
              </div>

              {/* Título */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                  {item.name}
                </h1>
                {providerProfile?.displayName && (
                  <Link
                    href={`/${locale}/store/${providerProfile.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>Impartido / Emitido por {providerProfile.displayName}</span>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Tarjeta de Precio con Comparativa */}
              <div className="p-4 rounded-2xl bg-gray-50/90 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Precio Total Garantizado
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-gray-900 dark:text-white">
                      ${currentPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-gray-400 font-mono">
                      {(item as any).currency || "MXN"}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm font-bold text-gray-400 line-through font-mono">
                        ${comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {item.requiresEvaluation && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Requiere valoración</span>
                  </span>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                  Descripción General
                </h3>
                <p>{item.description || "Sin descripción detallada disponible."}</p>
              </div>

              {/* ── Especificaciones Farmacéuticas (ÚNICAMENTE si es PRODUCT) ── */}
              {showPharmaTechSheet && (
                <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 space-y-2.5">
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    Ficha Técnica de Farmacia
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {item.manufacturer && (
                      <div>
                        <span className="text-gray-400 block text-[10px] font-bold uppercase">
                          Laboratorio / Fabricante
                        </span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {item.manufacturer}
                        </span>
                      </div>
                    )}
                    {item.activeIngredient && (
                      <div>
                        <span className="text-gray-400 block text-[10px] font-bold uppercase">
                          Principio Activo
                        </span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {item.activeIngredient}
                        </span>
                      </div>
                    )}
                    {item.requiresPrescription && (
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Requiere Receta Médica Certificada para Entrega</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Botones de Compra Rápida & Carrito ────────────────── */}
              <div className="space-y-3 pt-2">
                <AddToCartButton
                  item={item}
                  providerName={providerProfile?.displayName}
                  providerSlug={providerProfile?.slug}
                  brandColor={providerProfile?.primaryColor}
                />

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <ItemShareButton itemName={item.name} />
                  <SmartFavoriteButton
                    entityType={item.type as any}
                    entityId={item.id || 0}
                    brandColor={providerProfile?.primaryColor}
                  />
                </div>
              </div>

              {/* ── Garantía Médica QuHealthy ────────────────────────── */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2.5 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Especialista verificado con Cédula Profesional SEP y NOM-004</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Transacción protegida con Stripe y Cifrado Bancario AES-256</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Secciones Especializadas por Tipo de Ítem ───────────── */}
          {isCourse && (
            <CourseDetailsSection
              item={item}
              providerName={providerProfile?.displayName}
            />
          )}

          {isPackage && <PackageDetailsSection item={item} />}

          {/* ── Preguntas Frecuentes & Garantías ─────────────────────── */}
          <MarketplaceFaqSection
            itemType={item.type}
            providerName={providerProfile?.displayName}
          />

          {/* ── Más del Especialista / Proveedor ────────────────────── */}
          <MoreFromProvider
            items={relatedItems}
            locale={locale}
            providerName={providerProfile?.displayName || "Proveedor"}
          />
        </div>

        {/* ── Barra Fija Flotante Inferior para Móviles ────────────── */}
        <StickyBottomBar
          item={item}
          providerName={providerProfile?.displayName}
          providerSlug={providerProfile?.slug}
          brandColor={providerProfile?.primaryColor}
        />
      </main>
    </>
  );
}
