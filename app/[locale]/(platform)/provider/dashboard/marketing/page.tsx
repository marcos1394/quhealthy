"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import {
  Share2,
  Loader2,
  UserCircle,
  Search,
  CheckCircle,
  QrCode,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Hooks y Stores
import { useAuth } from '@/hooks/useAuth';
import { useCatalog } from '@/hooks/useCatalog';
import axiosInstance from '@/lib/axios';

// 🧩 NUESTROS COMPONENTES MODULARES
import { SocialConnectionsCard } from '@/components/dashboard/marketing/SocialConnectionsCard';
import { AiStudioForm } from '@/components/dashboard/marketing/AiStudioForm';
import { ContentGallery } from '@/components/dashboard/marketing/ContentGallery';
import { SocialInbox } from '@/components/dashboard/marketing/SocialInbox';

// --- COMPONENTE DE CARGA (FALLBACK) ---
function MarketingLoading() {
  const t = useTranslations('DashboardMarketing');
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="w-12 h-12 text-medical-500 animate-spin mb-4" />
      <p className="text-slate-500 dark:text-slate-400 animate-pulse">
        {t('loading_studio') || 'Cargando tu estudio...'}
      </p>
    </div>
  );
}

// --- CONTENIDO PRINCIPAL ENSAMBLADO ---
function MarketingContent() {
  const t = useTranslations('DashboardMarketing');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { checkSession } = useAuth();

  const { services, fetchInventory } = useCatalog();

  // Estados Globales de la Página
  const [galleryRefresh, setGalleryRefresh] = useState(0);
  const [connectionsRefresh, setConnectionsRefresh] = useState(0);
  const oauthProcessed = useRef(false);

  // Estados del Perfil Público (Tab 3)
  const [bio, setBio] = useState('Dr. Especialista con más de 10 años de experiencia clínica. Comprometido con la salud integral de mis pacientes.');
  const profileCompleteness = 85;

  // 1. Manejo de Redirección OAuth (Cuando el usuario regresa de Facebook/Google/LinkedIn)
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Puede contener el platform o provider ID
    const error = searchParams.get('error');

    // Si Meta/Google/LinkedIn nos devolvió un código de autorización
    if (code && !oauthProcessed.current) {
      oauthProcessed.current = true;

      // Determinamos la plataforma desde el state o default a facebook
      const platform = state?.includes('google') ? 'google-business'
        : state?.includes('linkedin') ? 'linkedin'
          : 'facebook';

      axiosInstance.post(`/api/social/auth/${platform}/callback`, { code, state })
        .then(() => {
          toast.success(t('oauth_success') || '¡Cuenta vinculada exitosamente!');
          setConnectionsRefresh(prev => prev + 1);
          router.replace(pathname, { scroll: false });
        })
        .catch((err) => {
          console.error('OAuth callback error:', err);
          toast.error(t('oauth_error') || 'No se pudo vincular la cuenta. Intenta de nuevo.');
          router.replace(pathname, { scroll: false });
        });
    }

    // Si Meta devolvió un error directamente
    if (error) {
      toast.error(t('oauth_error') || 'No se pudo conectar la cuenta. Intenta de nuevo.');
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router, t]);

  // 🚀 2. Cargamos el catálogo del doctor al montar el componente
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 xl:p-8 font-sans">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-[1400px] mx-auto">

        {/* --- CABECERA (HEADER) --- */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
            <Share2 className="w-8 h-8 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('title') || 'Marketing y Pacientes'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {t('subtitle') || 'Atrae, conecta y gestiona pacientes en todas tus redes sociales.'}
            </p>
          </div>
        </div>

        {/* --- SISTEMA DE PESTAÑAS (TABS) --- */}
        <Tabs defaultValue="social" className="w-full">

          <TabsList className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 w-full justify-start overflow-x-auto mb-8 h-12 rounded-xl">
            <TabsTrigger value="social" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm px-6 rounded-lg">
              Redes & IA
            </TabsTrigger>
            <TabsTrigger value="inbox" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm px-6 rounded-lg">
              Mensajes (CRM)
              <span className="ml-2 flex h-2 w-2 rounded-full bg-medical-500 animate-pulse"></span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm px-6 rounded-lg">
              Perfil Clínico Público
            </TabsTrigger>
          </TabsList>

          {/* ============================================================== */}
          {/* PESTAÑA 1: REDES SOCIALES E IA (ESTUDIO Y GALERÍA)               */}
          {/* ============================================================== */}
          <TabsContent value="social" className="space-y-8 mt-0 border-none outline-none">
            {/* Componente 1: Autorizaciones OAuth */}
            <SocialConnectionsCard refreshTrigger={connectionsRefresh} />

            {/* 🚀 Componente 2: Formularios de Generación con IA (Mapeamos la data de useCatalog) */}
            <AiStudioForm
              services={services.map(s => ({ id: s.id, name: s.name }))}
              onGenerationSuccess={() => setGalleryRefresh(prev => prev + 1)}
            />

            {/* Componente 3: Resultados, Descargas y Calendario */}
            <ContentGallery refreshTrigger={galleryRefresh} />
          </TabsContent>


          {/* ============================================================== */}
          {/* PESTAÑA 2: CRM OMNICANAL EN TIEMPO REAL                          */}
          {/* ============================================================== */}
          <TabsContent value="inbox" className="mt-0 border-none outline-none">
            {/* Componente 4: Bandeja de Entrada unificada */}
            <SocialInbox />
          </TabsContent>


          {/* ============================================================== */}
          {/* PESTAÑA 3: PERFIL CLÍNICO PÚBLICO                                */}
          {/* ============================================================== */}
          <TabsContent value="profile" className="space-y-8 mt-0 border-none outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Columna Izquierda: Editor y Preview */}
              <div className="lg:col-span-2 space-y-8">

                {/* Editor de Biografía */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-medical-500" /> Biografía Profesional
                    </CardTitle>
                    <CardDescription>Esta información será visible en el directorio médico y en posicionamiento SEO.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:border-medical-500 hover:text-medical-600 transition-colors cursor-pointer group">
                        <ImageIcon className="w-8 h-8 group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-[10px] font-medium">Cambiar</span>
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Acerca de ti</Label>
                        <Textarea
                          value={bio}
                          onChange={e => setBio(e.target.value)}
                          className="min-h-[160px] resize-none border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:border-medical-500 focus:ring-medical-500/20"
                          placeholder="Describe tu experiencia, especialidades y enfoque clínico..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button className="bg-medical-600 hover:bg-medical-700 text-white">
                        <CheckCircle className="w-4 h-4 mr-2" /> Guardar Cambios
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Preview (Tarjeta Visual Excepcional) */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">Previsualización SEO (Google)</span>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                      Optimizado
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="max-w-2xl">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 truncate">https://quhealthy.com/directorio/dr-john-doe</p>
                      <h3 className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-1 line-clamp-1">
                        Dr. John Doe | Especialista en QuHealthy Directory
                      </h3>
                      <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
                        Agenda tu cita médica con el Dr. John Doe. {bio}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Columna Derecha: Métricas y Share */}
              <div className="space-y-8">

                {/* Profile Completeness Ring */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <CardContent className="pt-6 relative">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-slate-100 dark:stroke-slate-800" />
                        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-medical-500 stroke-[number:283] transition-all duration-1000 ease-out" style={{ strokeDashoffset: 283 - (283 * profileCompleteness) / 100, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{profileCompleteness}%</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Perfil de Excelencia</h3>
                    <p className="text-xs text-slate-500 mb-4 px-4 font-light">Completa tu perfil para aumentar tu visibilidad en el directorio.</p>
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-slate-700 dark:text-slate-300">Foto de perfil</span></div>
                      <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-slate-700 dark:text-slate-300">Biografía médica</span></div>
                      <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" /> <span className="text-slate-500 dark:text-slate-400">Verificar cédula</span></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Share Card (QR y Enlace) */}
                <Card className="bg-gradient-to-br from-medical-600 to-emerald-500 text-white border-none shadow-md overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                  <CardContent className="p-6 relative z-10 flex flex-col items-center text-center">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                      <QrCode className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 tracking-tight">Comparte tu Perfil</h3>
                    <p className="text-sm text-medical-100 mb-6 font-light">Atrae pacientes directamente a tu agenda desde tus redes.</p>
                    <Button className="w-full bg-white text-medical-700 hover:bg-slate-50 font-bold shadow-sm" onClick={() => toast.success("¡Enlace copiado al portapapeles!")}>
                      <LinkIcon className="w-4 h-4 mr-2" /> Copiar Enlace
                    </Button>
                  </CardContent>
                </Card>
              </div>

            </div>
          </TabsContent>

        </Tabs>
      </motion.div>
    </div>
  );
}

// --- EXPORT DEFAULT CON SUSPENSE (REQUERIDO POR USE_SEARCH_PARAMS) ---
export default function MarketingPage() {
  return (
    <Suspense fallback={<MarketingLoading />}>
      <MarketingContent />
    </Suspense>
  );
}