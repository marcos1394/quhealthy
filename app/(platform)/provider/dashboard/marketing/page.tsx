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
import { 
  Link as LinkIcon, CheckCircle, Facebook, Sparkles, 
  Loader2, Video, Linkedin, Youtube, Image as ImageIcon,
  Share2
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

// Tipos Locales
interface Service { id: number; name: string; }

// --- COMPONENTE DE CARGA (FALLBACK) ---
function MarketingLoading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-950">
      <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
      <p className="text-gray-400 animate-pulse">Cargando estudio de marketing...</p>
    </div>
  );
}

// --- CONTENIDO PRINCIPAL (Tu lógica original) ---
function MarketingContent() {
  const { user, fetchSession } = useSessionStore();
  const router = useRouter();
  const searchParams = useSearchParams(); // Esto causaba el error sin Suspense

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

  // 1. Manejo de Redirección OAuth (Facebook, Google, etc.)
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
        
        toast.success(`¡Cuenta de ${platformName} conectada!`);
        fetchSession(); // Actualizar usuario para ver el estado "Conectado"
        router.replace('/provider/dashboard/marketing'); // Limpiar URL
    }
    if (error) {
        toast.error("No se pudo conectar la cuenta.");
        router.replace('/provider/dashboard/marketing');
    }
  }, [searchParams, router, fetchSession]);

  // 2. Cargar Datos Iniciales (Servicios y Galería)
  const fetchGallery = useCallback(async () => {
    try {
      // Mock Data para Demo (o API real)
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
    // Cargar servicios
    axios.get('/api/provider/services', { withCredentials: true })
      .then(res => setServices(res.data))
      .catch(() => setServices([{ id: 1, name: 'Consulta General' }, { id: 2, name: 'Limpieza Dental' }])); // Mock

    fetchGallery();
    
    // Polling para actualizar estado de generación
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
      toast.success("Generando post... aparecerá pronto en la galería.");
      fetchGallery();
    } catch (error) {
      toast.error("Error al generar post.");
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return toast.warn("Describe tu video.");
    setIsGeneratingVideo(true);
    try {
      await axios.post('/api/ai/generate-video', { prompt: videoPrompt }, { withCredentials: true });
      toast.success("Generando video... esto puede tomar unos minutos.");
      setVideoPrompt('');
      fetchGallery();
    } catch (error) {
      toast.error("Error al generar video.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // --- RENDERIZADO DE CONEXIONES ---
  const connections = [
    { id: 'facebook', name: 'Facebook & Instagram', icon: Facebook, color: 'bg-blue-600', check: (u: any) => u?.socialConnections?.some((c: any) => c.platform === 'facebook'), url: '/api/auth/social/facebook' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', check: (u: any) => u?.socialConnections?.some((c: any) => c.platform === 'linkedin'), url: '/api/auth/social/linkedin' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-600', check: (u: any) => u?.socialConnections?.some((c: any) => c.platform === 'youtube'), url: '/api/google/youtube/auth' },
    { id: 'tiktok', name: 'TikTok', icon: Video, color: 'bg-black', check: (u: any) => u?.socialConnections?.some((c: any) => c.platform === 'tiktok'), url: '/api/auth/social/tiktok' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30">
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Share2 className="w-8 h-8 text-purple-500" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Centro de Marketing</h1>
                <p className="text-gray-400">Automatiza tu presencia en redes sociales con IA.</p>
            </div>
        </div>

        {/* 1. Conexiones Sociales */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Conecta tus Redes</CardTitle>
            <CardDescription className="text-gray-400">Vincula tus cuentas para publicar automáticamente.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {connections.map((conn) => {
                const isConnected = conn.check(user);
                return (
                    <div key={conn.id} className="p-4 bg-gray-950/50 rounded-xl border border-gray-800 flex flex-col items-center text-center gap-3 hover:border-gray-700 transition-colors">
                        <div className={`w-10 h-10 ${conn.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
                            <conn.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-white text-sm">{conn.name}</p>
                            <p className="text-xs text-gray-500">{isConnected ? 'Sincronizado' : 'No conectado'}</p>
                        </div>
                        {isConnected ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 w-full justify-center py-1.5">
                                <CheckCircle size={14} className="mr-1" /> Activo
                            </Badge>
                        ) : (
                            <Button variant="outline" size="sm" onClick={() => initiateAuth(conn.url)} className="w-full border-gray-700 hover:bg-gray-800 text-gray-300">
                                <LinkIcon size={14} className="mr-2" /> Conectar
                            </Button>
                        )}
                    </div>
                );
            })}
          </CardContent>
        </Card>

        {/* 2. Estudio de IA (Generadores) */}
        <Card className="bg-gray-900 border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-purple-400" /> 
                Estudio Creativo (IA)
            </CardTitle>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Generador de Imagen */}
            <div className="space-y-4 p-5 bg-gray-950/50 rounded-xl border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-5 h-5 text-pink-400" />
                    <h3 className="font-semibold text-white">Post para Instagram/Facebook</h3>
                </div>
                
                <div className="space-y-2">
                    <Label className="text-gray-400">Servicio a promocionar</Label>
                    <Select onValueChange={setSelectedServiceId} value={selectedServiceId}>
                        <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                            <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            {services.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                
                <Button 
                    onClick={handleGenerateImagePost} 
                    disabled={isGeneratingPost || !selectedServiceId} 
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white border-0"
                >
                    {isGeneratingPost ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generar Post
                </Button>
            </div>

            {/* Generador de Video */}
            <div className="space-y-4 p-5 bg-gray-950/50 rounded-xl border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                    <Video className="w-5 h-5 text-red-400" />
                    <h3 className="font-semibold text-white">Video Corto (Shorts/Reels)</h3>
                </div>
                
                <div className="space-y-2">
                    <Label className="text-gray-400">Idea o tema del video</Label>
                    <Textarea 
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder="Ej: 3 tips para mejorar tu postura..."
                        className="bg-gray-900 border-gray-700 text-white min-h-[80px] resize-none focus:border-red-500" 
                    />
                </div>
                
                <Button 
                    onClick={handleGenerateVideo} 
                    disabled={isGeneratingVideo} 
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white border-0"
                >
                    {isGeneratingVideo ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Video className="w-4 h-4 mr-2" />}
                    Generar Video
                </Button>
            </div>

          </CardContent>
        </Card>

        {/* 3. Galería */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Galería de Contenido</h2>
            
            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
            ) : gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {gallery.map((item: any) => (
                        <div key={item.id} className="relative aspect-[4/5] bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group hover:border-purple-500/50 transition-all">
                            
                            {/* Renderizado Condicional del Media */}
                            {item.status === 'completed' ? (
                                item.contentType === 'social_post_image' ? (
                                    <Image src={item.generatedImageUrl} alt="Post" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 text-gray-500">
                                        <Video className="w-10 h-10 mb-2" />
                                        <span className="text-xs font-medium">Video Generado</span>
                                    </div>
                                )
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900/50">
                                    {item.status === 'processing' ? <Loader2 className="w-6 h-6 animate-spin mb-2 text-purple-500" /> : <span className="text-red-400 text-xs">Error</span>}
                                    <span className="text-xs">{item.status === 'processing' ? 'Creando...' : 'Falló'}</span>
                                </div>
                            )}

                            {/* Overlay de Acciones */}
                            {item.status === 'completed' && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                                    <p className="text-xs text-white text-center line-clamp-2 mb-2">{item.prompt || item.generatedText}</p>
                                    <Button 
                                        size="sm" 
                                        className="w-full bg-white text-black hover:bg-gray-200"
                                        onClick={() => {
                                            setSelectedContent(item);
                                            item.contentType === 'social_post_video' ? setIsVideoModalOpen(true) : setIsImageModalOpen(true);
                                        }}
                                    >
                                        Programar
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/30">
                    <Sparkles className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Tu galería está vacía. Genera tu primer post arriba.</p>
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

// --- EXPORT DEFAULT CON SUSPENSE (CORRECCIÓN CRÍTICA) ---
export default function MarketingPage() {
  return (
    <Suspense fallback={<MarketingLoading />}>
      <MarketingContent />
    </Suspense>
  );
}