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
import { useSocial } from '@/hooks/useSocial';
import { useGoogleBusinessProfile } from '@/hooks/useGoogleBusinessProfile';

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
 const { connections, loadConnections, getAuthUrl } = useSocial();
 const { profile, loading: googleLoading, loadProfile, updateDescription } = useGoogleBusinessProfile();

 const [bio, setBio] = useState('');
 const [googleConnected, setGoogleConnected] = useState(false);

 useEffect(() => {
 loadConnections();
 }, [loadConnections]);

 useEffect(() => {
 const isGoogleConnected = connections.some((c) => c.platform === 'GOOGLE_BUSINESS');
 setGoogleConnected(isGoogleConnected);
 if (isGoogleConnected) {
 loadProfile();
 }
 }, [connections, loadProfile]);

 useEffect(() => {
 if (profile) {
 setBio(profile.description || '');
 }
 }, [profile]);

 // ── OAuth callback ─────────────────────────────────────────────────────────
 useEffect(() => {
 if (oauthProcessed.current) return;

 const isFacebookConnected = searchParams.get('facebook_connected');
 const isGoogleConnectedParam = searchParams.get('status') === 'success_google';
 const error = searchParams.get('error');

 if (isFacebookConnected === 'true' || isGoogleConnectedParam) {
 oauthProcessed.current = true;
 toast.success(t('oauth_success', { defaultValue: 'CONEXIÓN ESTABLECIDA.' }));
 loadConnections(); // Recargar conexiones tras OAuth
 router.replace(pathname, { scroll: false });
 } else if (error) {
 oauthProcessed.current = true;
 toast.error(t('oauth_error', { defaultValue: 'FALLO DE AUTENTICACIÓN.' }));
 router.replace(pathname, { scroll: false });
 }
 }, [searchParams, pathname, router, t, loadConnections]);

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
 {!googleConnected ? (
 <div className="flex flex-col items-center justify-center p-12 md:p-24 bg-white dark:bg-[#0a0a0a] min-h-[400px]">
 <div className="w-20 h-20 bg-gray-100 dark:bg-[#111] flex items-center justify-center rounded-full mb-6">
 <Search className="w-10 h-10 text-gray-400" />
 </div>
 <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-center mb-4 text-black dark:text-white">
 Conecta tu Perfil de Google Business
 </h2>
 <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 text-center max-w-md mb-8">
 MANTÉN SINCRONIZADA LA INFORMACIÓN DE TU CLÍNICA EN GOOGLE MAPS Y EL BUSCADOR DIRECTAMENTE DESDE QUHEALTHY.
 </p>
 <button
 onClick={async () => {
 try {
 const { url } = await getAuthUrl('GOOGLE_BUSINESS');
 window.location.href = url;
 } catch (e) {
 toast.error('Error al generar enlace de conexión');
 }
 }}
 className="h-12 px-8 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none cursor-pointer"
 >
 <LinkIcon className="w-4 h-4" strokeWidth={2} />
 CONECTAR AHORA
 </button>
 </div>
 ) : googleLoading ? (
 <div className="flex flex-col items-center justify-center p-24 bg-white dark:bg-[#0a0a0a] min-h-[400px]">
 <QhSpinner size="md" className="text-black dark:text-white mb-4" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 SINCRONIZANDO CON GOOGLE...
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 bg-gray-50 dark:bg-[#050505]">
 {/* COLUMNA IZQUIERDA: EDITOR + SEO */}
 <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-black/20 dark:border-white/20 flex flex-col bg-white dark:bg-[#0a0a0a]">
 
 {/* Editor de Biografía */}
 <div className="flex flex-col border-b border-black/10 dark:border-white/10">
 <div className="p-6 md:p-8 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10 flex items-center justify-between">
 <div>
 <h2 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-1 flex items-center gap-2">
 <UserCircle className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
 PERFIL DE GOOGLE MAPS
 </h2>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 EDITE SU DESCRIPCIÓN PÚBLICA EN GOOGLE.
 </p>
 </div>
 <span className="border border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400 px-3 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
 <CheckCircle2 className="w-3 h-3" /> CONECTADO
 </span>
 </div>
 
 <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start gap-6">
 <div className="flex-1 w-full flex flex-col">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">
 DESCRIPCIÓN DEL NEGOCIO (Máx 750 caracteres)
 </label>
 <textarea
 value={bio}
 onChange={(e) => setBio(e.target.value)}
 maxLength={750}
 className="w-full min-h-[160px] p-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-400 uppercase resize-y"
 placeholder="INGRESE LA DESCRIPCIÓN DE SU CLÍNICA EN GOOGLE..."
 />
 </div>
 </div>

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/10 dark:border-white/10 flex justify-end">
 <button 
 onClick={async () => {
 try {
 await updateDescription(bio);
 toast.success('Perfil de Google actualizado exitosamente');
 } catch (e) {
 toast.error('Error al actualizar en Google');
 }
 }}
 className="h-12 px-8 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none cursor-pointer"
 >
 <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
 GUARDAR EN GOOGLE
 </button>
 </div>
 </div>

 {/* SEO Preview */}
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
 <div className="p-6 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10 flex items-center justify-between">
 <h2 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
 <Search className="w-3 h-3 text-black dark:text-white" strokeWidth={1.5} />
 PREVISUALIZACIÓN EN BUSCADOR
 </h2>
 </div>
 <div className="p-6 md:p-8">
 <div className="max-w-2xl">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 truncate">
 {profile?.websiteUrl ? profile.websiteUrl.toUpperCase() : 'HTTPS://BUSINESS.GOOGLE.COM'}
 </p>
 <h3 className="text-lg font-semibold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-2 line-clamp-1">
 {profile?.title || 'Mi Clínica'} | Google Business Profile
 </h3>
 <p className="text-xs font-semibold text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 uppercase tracking-widest leading-relaxed">
 {bio || 'Descripción pendiente...'}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* COLUMNA DERECHA: COMPARTIR */}
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
 {/* Tarjeta de Compartir (Código QR) */}
 <div className="p-6 md:p-8 bg-black text-white dark:bg-white dark:text-black flex flex-col items-center text-center h-full">
 <div className="w-16 h-16 border border-white/20 dark:border-black/20 bg-white/5 dark:bg-black/5 flex items-center justify-center mb-6 mt-12">
 <QrCode className="w-8 h-8" strokeWidth={1.5} />
 </div>
 <h3 className="text-sm font-semibold uppercase tracking-tight mb-2">
 RESEÑAS DE GOOGLE
 </h3>
 <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-8 max-w-xs">
 COPIE Y COMPARTA ESTA URL EN SUS CANALES DE ATENCIÓN PARA OBTENER MÁS OPINIONES.
 </p>
 <button
 className="w-full h-12 bg-white text-black dark:bg-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none cursor-pointer"
 onClick={() => {
 const link = profile?.websiteUrl || 'https://google.com';
 navigator.clipboard.writeText(link)
 .then(() => toast.success(t('copied_to_clipboard', { defaultValue: 'COPIADO' })))
 .catch(() => toast.error(t('copy_error', { defaultValue: 'ERROR' })));
 }}
 >
 <LinkIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
 COPIAR URL
 </button>
 </div>
 </div>
 </div>
 )}
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