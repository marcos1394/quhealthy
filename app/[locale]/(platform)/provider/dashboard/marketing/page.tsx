"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import {
  Share2,
  UserCircle,
  Search,
  CheckCircle2,
  QrCode,
  Link as LinkIcon,
  Sparkles,
  Globe,
} from "lucide-react";

// ShadCN UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Hooks
import { useCatalog } from "@/hooks/useCatalog";
import { useSocial } from "@/hooks/useSocial";
import { useGoogleBusinessProfile } from "@/hooks/useGoogleBusinessProfile";

// Componentes modulares
import { AiStudioForm } from "@/components/dashboard/marketing/AiStudioForm";
import { ContentGallery } from "@/components/dashboard/marketing/ContentGallery";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

// ── Fallback de carga ──────────────────────────────────────────────────────────

function MarketingLoading() {
  const t = useTranslations("DashboardMarketing");
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 bg-gray-50/50 dark:bg-[#050505]">
      <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
      <p className="text-sm font-semibold text-gray-500 animate-pulse">
        {t("loading_studio", {
          defaultValue: "Inicializando módulo de distribución...",
        })}
      </p>
    </div>
  );
}

// ── Contenido principal ────────────────────────────────────────────────────────

function MarketingContent() {
  const t = useTranslations("DashboardMarketing");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { services, packages, products, courses, fetchInventory } =
    useCatalog();

  // ── Estado global de la página ─────────────────────────────────────────────
  const [galleryRefresh, setGalleryRefresh] = useState(0);
  const oauthProcessed = useRef(false);

  // ── Tab 3: Perfil Público ──────────────────────────────────────────────────
  const { connections, loadConnections, getAuthUrl } = useSocial();
  const {
    profile,
    loading: googleLoading,
    loadProfile,
    updateDescription,
  } = useGoogleBusinessProfile();

  const [bio, setBio] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  useEffect(() => {
    const isGoogleConnected = connections.some(
      (c) => c.platform === "GOOGLE_BUSINESS",
    );
    setGoogleConnected(isGoogleConnected);
    if (isGoogleConnected) {
      loadProfile();
    }
  }, [connections, loadProfile]);

  useEffect(() => {
    if (profile) {
      setBio(profile.description || "");
    }
  }, [profile]);

  // ── OAuth callback ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (oauthProcessed.current) return;

    const isFacebookConnected = searchParams.get("facebook_connected");
    const isGoogleConnectedParam =
      searchParams.get("status") === "success_google";
    const error = searchParams.get("error");

    if (isFacebookConnected === "true" || isGoogleConnectedParam) {
      oauthProcessed.current = true;
      toast.success(
        t("oauth_success", { defaultValue: "Conexión establecida correctamente." }),
        { theme: "colored" }
      );
      loadConnections(); // Recargar conexiones tras OAuth
      router.replace(pathname, { scroll: false });
    } else if (error) {
      oauthProcessed.current = true;
      toast.error(
        t("oauth_error", { defaultValue: "Fallo de autenticación." }),
        { theme: "colored" }
      );
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router, t, loadConnections]);

  // ── Catálogo del doctor ────────────────────────────────────────────────────
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-8 px-4 md:px-10 pb-16 font-sans transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 max-w-7xl mx-auto"
      >
        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
              <Share2
                className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                strokeWidth={2}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Motor de Difusión
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
                {t("title", { defaultValue: "Distribución y Marketing" })}
              </h1>
            </div>
          </div>
        </div>

        {/* ── TABS ESTRUCTURALES ────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden min-w-0">
          <Tabs defaultValue="social" className="w-full flex flex-col rounded-none">
            <TabsList className="flex items-center bg-gray-50 dark:bg-[#050505] p-2 gap-2 border-b border-gray-100 dark:border-gray-800 shrink-0 h-auto rounded-none w-full justify-start">
              <TabsTrigger
                value="social"
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("tab_social", { defaultValue: "Contenido IA" })}</span>
              </TabsTrigger>

              <TabsTrigger
                value="profile"
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("tab_profile", { defaultValue: "Perfil Público" })}</span>
              </TabsTrigger>
            </TabsList>

            {/* ── TAB 1: Redes & IA ───────────────────────────────────────────── */}
            <TabsContent
              value="social"
              className="m-0 p-0 border-none outline-none"
            >
              <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                <div>
                  <AiStudioForm
                    catalogItems={[
                      ...services.map((s) => ({
                        ...s,
                        itemType: t("item_service") || "Servicio",
                      })),
                      ...packages.map((p) => ({
                        ...p,
                        itemType: t("item_package") || "Paquete",
                      })),
                      ...products.map((p) => ({
                        ...p,
                        itemType: t("item_product") || "Producto",
                      })),
                      ...courses.map((c) => ({
                        ...c,
                        itemType: t("item_course") || "Curso",
                      })),
                    ].map((item) => ({
                      id: item.id,
                      name: item.name,
                      description: item.description,
                      imageUrl: item.imageUrl,
                      category: item.category,
                      price: item.price,
                      itemType: item.itemType,
                    }))}
                    onGenerationSuccess={() =>
                      setGalleryRefresh((prev) => prev + 1)
                    }
                  />
                </div>

                <div>
                  <ContentGallery refreshTrigger={galleryRefresh} />
                </div>
              </div>
            </TabsContent>

            {/* ── TAB 2: Perfil Clínico Público ───────────────────────────────── */}
            <TabsContent
              value="profile"
              className="m-0 p-0 border-none outline-none"
            >
              {!googleConnected ? (
                <div className="flex flex-col items-center justify-center p-12 md:p-16 text-center bg-white dark:bg-[#0a0a0a]">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 shadow-sm">
                    <Search className="w-6 h-6 text-gray-400" strokeWidth={2} />
                  </div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    Conecta tu Perfil de Google Business
                  </h2>
                  <p className="text-xs font-medium text-gray-500 max-w-md leading-relaxed mb-6">
                    Mantén sincronizada la información de tu clínica en Google Maps y el buscador directamente desde QuHealthy.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const { url } = await getAuthUrl("GOOGLE_BUSINESS");
                        window.location.href = url;
                      } catch (e) {
                        toast.error("Error al generar enlace de conexión");
                      }
                    }}
                    className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <LinkIcon className="w-4 h-4" strokeWidth={2} />
                    <span>Conectar Ahora</span>
                  </button>
                </div>
              ) : googleLoading ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-[#0a0a0a] min-h-[350px] gap-4">
                  <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
                  <p className="text-xs font-semibold text-gray-500 animate-pulse">
                    Sincronizando con Google...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#0a0a0a]">
                  
                  {/* COLUMNA IZQUIERDA: EDITOR + SEO */}
                  <div className="lg:col-span-2 flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                    
                    {/* Editor de Biografía */}
                    <div className="p-6 md:p-8 space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                            <UserCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                          </div>
                          <div>
                            <h2 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white leading-tight">
                              Perfil de Google Maps
                            </h2>
                            <p className="text-[11px] font-semibold text-gray-500">
                              Edite su descripción pública para potenciar su presencia local.
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/40 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>Conectado</span>
                        </span>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                          Descripción del Negocio (Máx 750 caracteres)
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          maxLength={750}
                          rows={5}
                          className="w-full p-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm resize-y"
                          placeholder="Ingrese la descripción de su clínica en Google..."
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await updateDescription(bio);
                              toast.success(
                                "Perfil de Google actualizado exitosamente",
                                { theme: "colored" }
                              );
                            } catch (e) {
                              toast.error("Error al actualizar en Google");
                            }
                          }}
                          className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                        >
                          <CheckCircle2
                            className="w-4 h-4"
                            strokeWidth={2}
                          />
                          <span>Guardar en Google</span>
                        </button>
                      </div>
                    </div>

                    {/* SEO Preview */}
                    <div className="p-6 md:p-8 space-y-4 bg-gray-50/30 dark:bg-[#050505]/30">
                      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                          Previsualización en Buscador
                        </h3>
                      </div>

                      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-1.5 max-w-2xl">
                        <p className="text-[11px] font-mono text-gray-400 truncate">
                          {profile?.websiteUrl || "https://business.google.com"}
                        </p>
                        <h4 className="text-base font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
                          {profile?.title || "Mi Clínica"} | Google Business Profile
                        </h4>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {bio || "Descripción pendiente..."}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* COLUMNA DERECHA: COMPARTIR */}
                  <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center text-center justify-center space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shadow-sm">
                      <QrCode className="w-7 h-7 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    </div>

                    <div className="space-y-1 max-w-xs">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Reseñas de Google
                      </h3>
                      <p className="text-xs font-medium text-gray-500 leading-relaxed">
                        Copie y comparta esta URL en sus canales de atención para obtener más opiniones de sus pacientes.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="w-full max-w-xs h-11 px-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
                      onClick={() => {
                        const link =
                          profile?.websiteUrl || "https://google.com";
                        navigator.clipboard
                          .writeText(link)
                          .then(() =>
                            toast.success(
                              t("copied_to_clipboard", {
                                defaultValue: "URL copiada al portapapeles",
                              }),
                              { theme: "colored" }
                            ),
                          )
                          .catch(() =>
                            toast.error(
                              t("copy_error", { defaultValue: "Error al copiar" }),
                            ),
                          );
                      }}
                    >
                      <LinkIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <span>Copiar URL de Reseñas</span>
                    </button>
                  </div>

                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}

// ── Export con Suspense ────────────────────────────────────────────────────────

export default function MarketingPage() {
  return (
    <Suspense fallback={<MarketingLoading />}>
      <MarketingContent />
    </Suspense>
  );
}