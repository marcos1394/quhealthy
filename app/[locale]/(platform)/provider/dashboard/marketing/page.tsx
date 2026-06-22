"use client"
/* eslint-disable react-doctor/button-has-type */;

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import {
  Share2,
  UserCircle,
  Search,
  CheckCircle2,
  QrCode,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';

// ShadCN UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Hooks
import { useCatalog } from '@/hooks/useCatalog';

// Componentes modulares
import { AiStudioForm } from '@/components/dashboard/marketing/AiStudioForm';
import { ContentGallery } from '@/components/dashboard/marketing/ContentGallery';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';

// ── Fallback de carga ──────────────────────────────────────────────────────────

function MarketingLoading() {
  const t = useTranslations('DashboardMarketing');
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#050505]">
      <QhSpinner size="lg" className="text-black dark:text-white" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
        {t('loading_studio', { defaultValue: 'INICIALIZANDO MÓDULO DE DISTRIBUCIÓN...' })}
      </p>
    </div>
  );
}

// ── Contenido principal ────────────────────────────────────────────────────────

function MarketingContent() {
  const t = useTranslations('DashboardMarketing');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { services, packages, products, courses, fetchInventory } = useCatalog();

  // ── Estado global de la página ─────────────────────────────────────────────
  const [galleryRefresh, setGalleryRefresh] = useState(0);
  const oauthProcessed = useRef(false);

  // ── Tab 3: Perfil Público ──────────────────────────────────────────────────
  const [bio, setBio] = useState(
    'Dr. Especialista con más de 10 años de experiencia clínica. Comprometido con la salud integral de mis pacientes.'
  );
  const profileCompleteness = 85;

  // ── OAuth callback ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (oauthProcessed.current) return;

    const isConnected = searchParams.get('facebook_connected');
    const error = searchParams.get('error');

    if (isConnected === 'true') {
      oauthProcessed.current = true;
      toast.success(t('oauth_success', { defaultValue: 'CONEXIÓN ESTABLECIDA.' }));
      router.replace(pathname, { scroll: false });
    } else if (error) {
      oauthProcessed.current = true;
      toast.error(t('oauth_error', { defaultValue: 'FALLO DE AUTENTICACIÓN.' }));
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router, t]);

  // ── Catálogo del doctor ────────────────────────────────────────────────────
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] pt-8 px-6 md:px-10 pb-16 font-sans transition-colors duration-500 selection:bg-gray-200 dark:selection:bg-white/20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 max-w-7xl mx-auto"
      >

        {/* ── HEADER ARQUITECTÓNICO ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <Share2 className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                Motor de Difusión
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
                {t('title', { defaultValue: 'DISTRIBUCIÓN Y MARKETING' })}
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {t('subtitle', { defaultValue: 'GESTIÓN DE REDES SOCIALES E IDENTIDAD PÚBLICA.' })}
              </p>
            </div>
          </div>
        </div>

        {/* ── TABS ESTRUCTURALES ────────────────────────────────────────────────────────── */}
        <Tabs defaultValue="social" className="w-full flex flex-col gap-0 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] rounded-none">

          <TabsList className="flex flex-row w-full bg-gray-50 dark:bg-[#050505] border-b border-black/20 dark:border-white/20 p-0 h-auto rounded-none justify-start">
            <TabsTrigger
              value="social"
              className="flex-1 sm:flex-none sm:w-64 rounded-none border-0 border-r border-black/20 dark:border-white/20 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 h-14 text-[9px] font-bold uppercase tracking-widest transition-colors"
            >
              {t('tab_social', { defaultValue: 'CONTENIDO IA' })}
            </TabsTrigger>

            <TabsTrigger
              value="profile"
              className="flex-1 sm:flex-none sm:w-64 rounded-none border-0 border-r border-black/20 dark:border-white/20 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 h-14 text-[9px] font-bold uppercase tracking-widest transition-colors"
            >
              {t('tab_profile', { defaultValue: 'PERFIL PÚBLICO' })}
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: Redes & IA ───────────────────────────────────────────── */}
          <TabsContent value="social" className="m-0 p-0 border-none outline-none">
            
            <div className="flex flex-col">
              <div className="border-b border-black/20 dark:border-white/20">
                <AiStudioForm
                  catalogItems={[
                    ...services.map((s) => ({ ...s, itemType: t('item_service') || 'Servicio' })),
                    ...packages.map((p) => ({ ...p, itemType: t('item_package') || 'Paquete' })),
                    ...products.map((p) => ({ ...p, itemType: t('item_product') || 'Producto' })),
                    ...courses.map((c) => ({ ...c, itemType: t('item_course') || 'Curso' }))
                  ].map((item) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    imageUrl: item.imageUrl,
                    category: item.category,
                    price: item.price,
                    itemType: item.itemType
                  }))}
                  onGenerationSuccess={() => setGalleryRefresh((prev) => prev + 1)}
                />
              </div>

              <div>
                <ContentGallery refreshTrigger={galleryRefresh} />
              </div>
            </div>

          </TabsContent>

          {/* ── TAB 2: Perfil Clínico Público ───────────────────────────────── */}
          <TabsContent value="profile" className="m-0 p-0 border-none outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 bg-gray-50 dark:bg-[#050505]">

              {/* COLUMNA IZQUIERDA: EDITOR + SEO */}
              <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-black/20 dark:border-white/20 flex flex-col bg-white dark:bg-[#0a0a0a]">

                {/* Editor de Biografía */}
                <div className="flex flex-col border-b border-black/10 dark:border-white/10">
                  <div className="p-6 md:p-8 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10">
                    <h2 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-1 flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                      {t('profile_bio_title', { defaultValue: 'IDENTIDAD PROFESIONAL' })}
                    </h2>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                      {t('profile_bio_desc', { defaultValue: 'CONFIGURACIÓN DE BIOGRAFÍA PÚBLICA.' })}
                    </p>
                  </div>
                  
                  <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start gap-6">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 flex flex-col items-center justify-center text-gray-500 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors cursor-pointer shrink-0">
                      <ImageIcon className="w-6 h-6 mb-2" strokeWidth={1.5} />
                      <span className="text-[8px] font-bold uppercase tracking-widest">{t('profile_avatar_change', { defaultValue: 'MODIFICAR' })}</span>
                    </div>

                    <div className="flex-1 w-full flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">
                        {t('profile_about_label', { defaultValue: 'EXTRACTO PROFESIONAL' })}
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full min-h-[160px] p-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-400 uppercase resize-y"
                        placeholder={t('profile_bio_placeholder', { defaultValue: 'INGRESE SU BIOGRAFÍA...' })}
                      />
                    </div>
                  </div>

                  <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/10 dark:border-white/10 flex justify-end">
                    <button className="h-12 px-8 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none">
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {t('save_changes', { defaultValue: 'APLICAR CAMBIOS' })}
                    </button>
                  </div>
                </div>

                {/* SEO Preview */}
                <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
                  <div className="p-6 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                    <h2 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Search className="w-3 h-3 text-black dark:text-white" strokeWidth={1.5} />
                      {t('profile_seo_preview_title', { defaultValue: 'SIMULADOR DE BÚSQUEDA' })}
                    </h2>
                    <span className="border border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">
                      {t('profile_seo_optimized', { defaultValue: 'INDEXADO' })}
                    </span>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="max-w-2xl">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 truncate">
                        HTTPS://QUHEALTHY.COM/DIRECTORIO/DR-JOHN-DOE
                      </p>
                      <h3 className="text-lg font-semibold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-2 line-clamp-1">
                        Dr. John Doe | Especialista en QuHealthy Directory
                      </h3>
                      <p className="text-xs font-semibold text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 uppercase tracking-widest leading-relaxed">
                        Agenda tu cita médica con el Dr. John Doe. {bio}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: ESTADO Y COMPARTIR */}
              <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">

                {/* Completeness Kardex */}
                <div className="p-6 md:p-8 flex flex-col items-center border-b border-black/10 dark:border-white/10 text-center">
                  <div className="w-24 h-24 border-4 border-gray-100 dark:border-[#111] relative flex items-center justify-center mb-6">
                    {/* Barra de progreso plana */}
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-black dark:bg-white transition-all duration-1000"
                      style={{ height: `${profileCompleteness}%` }}
                    />
                    <span className="relative z-10 text-2xl font-semibold tracking-tight mix-blend-difference text-white">
                      {profileCompleteness}%
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
                    {t('profile_completeness_title', { defaultValue: 'ESTATUS DEL PERFIL' })}
                  </h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-8 max-w-xs">
                    {t('profile_completeness_desc', { defaultValue: 'UN PERFIL COMPLETO GENERA MAYOR CONFIANZA.' })}
                  </p>

                  <div className="w-full flex flex-col gap-0 border border-black/10 dark:border-white/10 text-left">
                    <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center gap-3 bg-gray-50 dark:bg-[#050505]">
                      <CheckCircle2 className="w-4 h-4 text-black dark:text-white shrink-0" strokeWidth={1.5} />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">
                        {t('profile_check_photo', { defaultValue: 'FOTOGRAFÍA' })}
                      </span>
                    </div>
                    <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center gap-3 bg-gray-50 dark:bg-[#050505]">
                      <CheckCircle2 className="w-4 h-4 text-black dark:text-white shrink-0" strokeWidth={1.5} />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">
                        {t('profile_check_bio', { defaultValue: 'BIOGRAFÍA' })}
                      </span>
                    </div>
                    <div className="p-3 flex items-center gap-3 bg-white dark:bg-[#0a0a0a]">
                      <div className="w-4 h-4 border border-black/20 dark:border-white/20 shrink-0" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                        {t('profile_check_cedula', { defaultValue: 'CÉDULA PROFESIONAL' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Compartir (Código QR) */}
                <div className="p-6 md:p-8 bg-black text-white dark:bg-white dark:text-black flex flex-col items-center text-center">
                  <div className="w-16 h-16 border border-white/20 dark:border-black/20 bg-white/5 dark:bg-black/5 flex items-center justify-center mb-6">
                    <QrCode className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-tight mb-2">
                    {t('profile_share_title', { defaultValue: 'ENLACE DIRECTO' })}
                  </h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-8 max-w-xs">
                    {t('profile_share_desc', { defaultValue: 'COPIE Y COMPARTA ESTA URL EN SUS CANALES DE ATENCIÓN.' })}
                  </p>
                  <button
                    className="w-full h-12 bg-white text-black dark:bg-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none"
                    onClick={() => {
                      navigator.clipboard.writeText('https://quhealthy.com/directorio/dr-john-doe')
                        .then(() => toast.success(t('copied_to_clipboard', { defaultValue: 'COPIADO' })))
                        .catch(() => toast.error(t('copy_error', { defaultValue: 'ERROR' })));
                    }}
                  >
                    <LinkIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {t('profile_share_copy_btn', { defaultValue: 'COPIAR URL' })}
                  </button>
                </div>

              </div>
            </div>
          </TabsContent>

        </Tabs>
      </motion.div>
    </div>
  );
}

// ── Export con Suspense (requerido por useSearchParams) ────────────────────────

export default function MarketingPage() {
  return (
    <Suspense fallback={<MarketingLoading />}>
      <MarketingContent />
    </Suspense>
  );
}