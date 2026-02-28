/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Link as LinkIcon, CheckCircle, Facebook, Sparkles,
  Loader2, Video, Linkedin, Youtube, Image as ImageIcon,
  Share2, ArrowDownToLine, CalendarPlus
} from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Componentes y Tipos
import { VideoScheduleModal, GeneratedContent } from '@/components/dashboard/marketing/VideoScheduleModal';
import { ImageScheduleModal } from '@/components/dashboard/marketing/ImageScheduleModal';
import { useSessionStore } from '@/stores/SessionStore';
import { useAuth } from '@/hooks/useAuth';

// Tipos Locales
interface Service { id: number; name: string; }

// --- COMPONENTE DE CARGA (FALLBACK) ---
function MarketingLoading() {
  const t = useTranslations('DashboardMarketing');
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="w-12 h-12 text-medical-500 animate-spin mb-4" />
      <p className="text-slate-500 dark:text-slate-400 animate-pulse">{t('loading_studio')}</p>
    </div>
  );
}

// --- CONTENIDO PRINCIPAL ---
function MarketingContent() {
  const { user } = useSessionStore();
  const { checkSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('DashboardMarketing');

  // --- ESTADOS ---
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generación
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Modales
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);

  // --- EFECTOS ---

  // 1. Manejo de Redirección OAuth
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      const platformMap: Record<string, string> = {
        'facebook': 'Facebook/Instagram',
        'linkedin': 'LinkedIn',
        'google_business': 'Google Business',
        'youtube': 'YouTube',
        'tiktok': 'TikTok'
      };
      const platformName = platformMap[success] || 'Red Social';

      toast.success(`Cuenta de ${platformName} conectada`);
      checkSession();
      router.replace('/provider/dashboard/marketing');
    }
    if (error) {
      toast.error("No se pudo conectar la cuenta.");
      router.replace('/provider/dashboard/marketing');
    }
  }, [searchParams, router, checkSession]);

  // 2. Cargar Datos Iniciales
  const fetchGallery = useCallback(async () => {
    try {
      await new Promise(r => setTimeout(r, 500));
      setGallery([
        { id: '1', prompt: 'Consejos de nutrición', generatedText: 'Come sano...', generatedImageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300', contentType: 'social_post_image', status: 'completed' } as any,
        { id: '2', prompt: 'Video de ejercicios', generatedText: 'Rutina rápida...', generatedVideoUrl: '#', contentType: 'social_post_video', status: 'completed' } as any,
      ]);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    axios.get('/api/provider/services', { withCredentials: true })
      .then(res => setServices(res.data))
      .catch(() => setServices([{ id: 1, name: 'Consulta General' }, { id: 2, name: 'Limpieza Dental' }]));

    fetchGallery();

    const interval = setInterval(fetchGallery, 15000);
    return () => clearInterval(interval);
  }, [fetchGallery]);

  // --- HANDLERS CONEXIÓN ---
  const initiateAuth = async (endpoint: string) => {
    try {
      const { data } = await axios.get(endpoint, { withCredentials: true });
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error("No se pudo iniciar la conexión.");
    }
  };

  // --- HANDLERS GENERACIÓN ---
  const handleGenerateImagePost = async () => {
    if (!selectedServiceId) return toast.warn("Selecciona un servicio.");
    setIsGeneratingPost(true);
    try {
      await axios.post('/api/ai/generate-image-post', { serviceId: parseInt(selectedServiceId) }, { withCredentials: true });
      toast.success(t('toast_success'));
      fetchGallery();
    } catch (error) {
      toast.error(t('toast_error'));
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return toast.warn("Describe tu video.");
    setIsGeneratingVideo(true);
    try {
      await axios.post('/api/ai/generate-video', { prompt: videoPrompt }, { withCredentials: true });
      toast.success(t('toast_success'));
      setVideoPrompt('');
      fetchGallery();
    } catch (error) {
      toast.error(t('toast_error'));
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // --- RENDERIZADO DE CONEXIONES ---
  const connections = [
    { id: 'facebook', name: 'Facebook & Instagram', icon: Facebook, color: 'bg-[#1877F2]', check: (u: any) => u?.socialConnections?.some((c: any) => c.platform === 'facebook'), url: '/api/auth/social/facebook' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0A66C2]', check: (u: any) => u?.socialConnections?.some((c: any) => c.platform === 'linkedin'), url: '/api/auth/social/linkedin' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-[#FF0000]', check: (u: any) => u?.socialConnections?.some((c: any) => c.platform === 'youtube'), url: '/api/google/youtube/auth' },
    { id: 'tiktok', name: 'TikTok', icon: Video, color: 'bg-black dark:bg-white dark:text-black', check: (u: any) => u?.socialConnections?.some((c: any) => c.platform === 'tiktok'), url: '/api/auth/social/tiktok' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 xl:p-8 font-sans">

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
            <Share2 className="w-8 h-8 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
          </div>
        </div>

        {/* 1. Conexiones Sociales */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{t('connect_section_title')}</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">{t('connect_section_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {connections.map((conn) => {
              const isConnected = conn.check(user);
              return (
                <div key={conn.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className={`w-12 h-12 ${conn.color} rounded-full flex items-center justify-center text-white shadow-md`}>
                    <conn.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">{conn.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{isConnected ? 'Sincronizado' : 'No conectado'}</p>
                  </div>
                  {isConnected ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 w-full justify-center py-1.5 font-medium">
                      <CheckCircle size={14} className="mr-1.5" /> Activo
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => initiateAuth(conn.url)} className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <LinkIcon size={14} className="mr-2" /> {t('connect_btn')}
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 2. Estudio de IA (Generadores) */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-40 bg-medical-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-lg font-bold">
              <Sparkles className="w-5 h-5 text-medical-500" />
              {t('ai_studio_title')}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {t('ai_studio_desc')}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">

            {/* Generador de Imagen */}
            <div className="flex flex-col space-y-5 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{t('image_generator_title')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('image_generator_desc')}</p>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <Label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Servicio a promocionar</Label>
                <Select onValueChange={setSelectedServiceId} value={selectedServiceId}>
                  <SelectTrigger className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-11 focus:ring-medical-500/20 focus:border-medical-500">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    {services.map(s => <SelectItem key={s.id} value={s.id.toString()} className="focus:bg-slate-100 dark:focus:bg-slate-800">{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateImagePost}
                disabled={isGeneratingPost || !selectedServiceId}
                className="w-full h-11 bg-medical-600 hover:bg-medical-700 text-white shadow-sm transition-all"
              >
                {isGeneratingPost ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {isGeneratingPost ? t('generating') : t('generate_btn')}
              </Button>
            </div>

            {/* Generador de Video */}
            <div className="flex flex-col space-y-5 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                  <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{t('video_generator_title')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('video_generator_desc')}</p>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <Label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Idea o tema del video</Label>
                <Textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder={t('video_placeholder')}
                  className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[90px] resize-none focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <Button
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
              >
                {isGeneratingVideo ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Video className="w-4 h-4 mr-2" />}
                {isGeneratingVideo ? t('generating') : t('generate_btn')}
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* 3. Galería */}
        <div className="space-y-6 pt-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {t('content_gallery_title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('content_gallery_desc')}</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-medical-500" /></div>
          ) : gallery.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Renderizado de galería omitido en plan original, pero aquí iteramos */}
              {gallery.map((item: any) => (
                <div key={item.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col h-[380px]">

                  {/* Media Section */}
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-950 w-full flex-shrink-0">
                    {item.status === 'completed' ? (
                      item.contentType === 'social_post_image' ? (
                        <>
                          <Image src={item.generatedImageUrl} alt="Post" fill className="object-cover" />
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-white/90 text-slate-900 dark:bg-slate-900/90 dark:text-white backdrop-blur shadow-sm border-0">
                              <ImageIcon className="w-3 h-3 mr-1" /> {t('image_badge')}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-indigo-50/50 dark:bg-indigo-950/20">
                          <Video className="w-12 h-12 mb-3 text-indigo-400 dark:text-indigo-500" />
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        {item.status === 'processing' ? <Loader2 className="w-8 h-8 animate-spin mb-3 text-medical-500" /> : <span className="text-red-500 text-xs">Error</span>}
                        <span className="text-sm font-medium">{item.status === 'processing' ? t('generating') : 'Falló'}</span>
                      </div>
                    )}

                    {item.status === 'completed' && item.contentType === 'social_post_video' && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-white/90 text-slate-900 dark:bg-slate-900/90 dark:text-white backdrop-blur shadow-sm border-0">
                          <Video className="w-3 h-3 mr-1" /> {t('video_badge')}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="flex flex-col flex-1 p-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 flex-1">
                      {item.prompt || item.generatedText || "Sin descripción."}
                    </p>

                    {item.status === 'completed' && (
                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          onClick={() => window.open(item.generatedImageUrl || item.generatedVideoUrl, '_blank')}
                        >
                          <ArrowDownToLine className="w-4 h-4 mr-1.5" />
                          {t('download_btn')}
                        </Button>
                        <Button
                          size="sm"
                          className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 text-white dark:text-slate-900"
                          onClick={() => {
                            setSelectedContent(item);
                            item.contentType === 'social_post_video' ? setIsVideoModalOpen(true) : setIsImageModalOpen(true);
                          }}
                        >
                          <CalendarPlus className="w-4 h-4 mr-1.5" />
                          {t('schedule_btn')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
                <Sparkles className="w-8 h-8 text-medical-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('gallery_empty_title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{t('gallery_empty_desc')}</p>
            </div>
          )}
        </div>

      </motion.div>

      {/* --- MODALES --- */}
      <VideoScheduleModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        content={selectedContent}
        connections={(user as any)?.socialConnections || []}
        onScheduled={fetchGallery}
      />

      <ImageScheduleModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        content={selectedContent}
        connections={(user as any)?.socialConnections || []}
        onScheduled={fetchGallery}
      />

    </div>
  );
}

// --- EXPORT DEFAULT CON SUSPENSE ---
export default function MarketingPage() {
  return (
    <Suspense fallback={<MarketingLoading />}>
      <MarketingContent />
    </Suspense>
  );
}