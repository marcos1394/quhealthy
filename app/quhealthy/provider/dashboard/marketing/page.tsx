/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link as LinkIcon, CheckCircle, Facebook, Instagram, Sparkles, Copy, Loader2, CalendarClock, Video } from 'lucide-react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


interface Service { id: number; name: string; }
// --- AÑADE ESTA INTERFAZ ---
interface GeneratedContent {
  id: number;
  contentType: 'social_post_image' | 'social_post_video';
  status: 'completed' | 'processing' | 'failed';
  prompt: string | null;
  generatedText: string | null;
  generatedImageUrl: string | null;
  generatedVideoUrl: string | null;
  createdAt: string;
}


export default function MarketingPage() {
  const { user, fetchSession } = useSessionStore();
  const router = useRouter();
  const searchParams = useSearchParams();
   // --- ESTADOS ACTUALIZADOS ---
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para el generador de posts de imagen
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<{ imageUrl: string; postText: string } | null>(null);
      const [publishAt, setPublishAt] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');

  // Estados para el generador de video
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);


  // Verificamos si la conexión fue exitosa al volver de Facebook
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success) {
        let platformName = '';
        if (success === 'facebook') platformName = 'Facebook/Instagram';
        if (success === 'linkedin') platformName = 'LinkedIn';
        if (success === 'google_business') platformName = 'Google Business'; // <-- AÑADE ESTO
        if (success === 'youtube') platformName = 'YouTube'; // <-- AÑADE ESTO

        
        toast.success(`¡Cuenta de ${platformName} conectada exitosamente!`);
        fetchSession();
        router.replace('/provider/dashboard/marketing');
    }
    if (error) {
        toast.error("No se pudo conectar la cuenta.");
        router.replace('/provider/dashboard/marketing');
    }
  }, [searchParams, router, fetchSession]);

   // Cargar los servicios del proveedor para el selector
  useEffect(() => {
    axios.get('/api/provider/services', { withCredentials: true })
      .then(res => setServices(res.data));
  }, []);

  const handleConnectFacebook = async () => {
    try {
      // 1. Pedimos la URL de autorización a nuestro backend
      const { data } = await axios.get('/api/auth/social/facebook', { withCredentials: true });
      // 2. Redirigimos al usuario a la página de consentimiento de Meta
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error("No se pudo iniciar la conexión.");
    }
  };

    const handleConnectLinkedIn = async () => {
    try {
      const { data } = await axios.get('/api/auth/social/linkedin', { withCredentials: true });
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error("No se pudo iniciar la conexión con LinkedIn.");
    }
  };

  const handleConnectGoogleBusiness = async () => {
    try {
      const { data } = await axios.get('/api/google/business/auth', { withCredentials: true });
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error("No se pudo iniciar la conexión con Google Business.");
    }
  };

  const handleConnectYouTube = async () => {
    try {
      const { data } = await axios.get('/api/google/youtube/auth', { withCredentials: true });
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error("No se pudo iniciar la conexión con YouTube.");
    }
  };

  const isFacebookConnected = user?.socialConnections?.some(c => c.platform === 'facebook');
    const isLinkedInConnected = user?.socialConnections?.some(c => c.platform === 'linkedin');
     const isGoogleBusinessConnected = user?.socialConnections?.some(c => c.platform === 'google_business');
     const isYouTubeConnected = user?.socialConnections?.some(c => c.platform === 'youtube');



  // --- LÓGICA DE GALERÍA (NUEVA) ---
  const fetchGallery = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/ai/gallery', { withCredentials: true });
      setGallery(data);
    } catch (error) {
      console.error("Error fetching content gallery:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    axios.get('/api/provider/services', { withCredentials: true }).then(res => setServices(res.data));
    fetchGallery();
    const interval = setInterval(fetchGallery, 15000); // Polling para actualizar estado de videos
    return () => clearInterval(interval);
  }, [fetchGallery]);
  
  // --- FUNCIONES DE GENERACIÓN ACTUALIZADAS ---
  const handleGenerateImagePost = async () => {
    if (!selectedServiceId) return toast.warn("Selecciona un servicio.");
    setIsGeneratingPost(true);
    try {
      await axios.post('/api/ai/generate-image-post', { serviceId: parseInt(selectedServiceId) }, { withCredentials: true });
      toast.success("Tu post se está generando y aparecerá en la galería.");
      fetchGallery(); // Recarga la galería
    } catch (error) {
      toast.error("No se pudo generar el post.");
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return toast.warn("Escribe una idea para tu video.");
    setIsGeneratingVideo(true);
    try {
      await axios.post('/api/ai/generate-video', { prompt: videoPrompt }, { withCredentials: true });
      toast.success("Tu video se está generando. Aparecerá en la galería en unos momentos.");
      setVideoPrompt('');
      fetchGallery(); // Recarga la galería
    } catch (error) {
      toast.error("No se pudo iniciar la generación del video.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

 const handleSchedulePost = async () => {
    // --- INICIO DE LA CORRECCIÓN ---
    if (!generatedContent || !publishAt || !selectedConnectionId) {
      toast.warn("Por favor, genera contenido, selecciona una red social y una fecha para programar.");
      return;
    }
    // --- FIN DE LA CORRECCIÓN ---
    
    setIsScheduling(true);
    try {
      await axios.post('/api/social/schedule-post', {
        socialConnectionId: parseInt(selectedConnectionId),
        content: generatedContent.postText,
        imageUrl: generatedContent.imageUrl,
        publishAt: new Date(publishAt).toISOString(),
      }, { withCredentials: true });

      toast.success("¡Publicación programada exitosamente!");
      setGeneratedContent(null);
      setPublishAt('');
      setSelectedConnectionId('');
    } catch (error) {
      toast.error("No se pudo programar la publicación.");
    } finally {
      setIsScheduling(false);
    }
  };


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Centro de Marketing</h1>
      <p className="text-gray-400">Conecta redes, genera contenido con IA y programa tus publicaciones desde un solo lugar.</p>

      {/* Tarjeta de Conexiones Sociales */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle>Conexiones Sociales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {/* Facebook / Instagram */}
            <div className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center text-white"><Facebook size={20}/></div>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white"><Instagram size={20}/></div>
                </div>
                <p className="font-medium text-white">Facebook & Instagram</p>
                </div>
                {isFacebookConnected ? (<div className="flex items-center gap-2 text-green-400"><CheckCircle size={20}/>Conectado</div>) : (<Button onClick={handleConnectFacebook}><LinkIcon className="w-4 h-4 mr-2"/>Conectar</Button>)}
            </div>
            {/* LinkedIn */}
            <div className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0A66C2] rounded-full flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></div>
                <p className="font-medium text-white">LinkedIn</p>
                </div>
                {isLinkedInConnected ? (<div className="flex items-center gap-2 text-green-400"><CheckCircle size={20}/>Conectado</div>) : (<Button onClick={handleConnectLinkedIn}><LinkIcon className="w-4 h-4 mr-2"/>Conectar</Button>)}
            </div>
            {/* Google Business Profile */}
            <div className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35 11.1H12.18V13.83H18.69c1.8-.8 3-3.9 1-6.6-1.5-2-4.1-2.8-6.5-2.2-2.3.6-4 2.5-4.8 4.8-1.5 4.1 1.2 8.3 5.3 8.3 1.1 0 2.2-.3 3.1-.8l-1.6-1.6c-.6.3-1.3.5-2. .5-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2c2.2 0 3.9 1.5 4.2 3.5h-4.2v2.73h6.17c.1-.6.1-1.2.1-1.8z"/></svg></div>
                <p className="font-medium text-white">Google Business</p>
                </div>
                {isGoogleBusinessConnected ? (<div className="flex items-center gap-2 text-green-400"><CheckCircle size={20}/>Conectado</div>) : (<Button onClick={handleConnectGoogleBusiness}><LinkIcon className="w-4 h-4 mr-2"/>Conectar</Button>)}
            </div>
            {/* --- AÑADE ESTA NUEVA TARJETA --- */}
  <div className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[#FF0000] rounded-full flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
      </div>
      <div>
        <p className="font-medium text-white">YouTube</p>
        <p className="text-sm text-gray-400">Publica videos y Shorts.</p>
      </div>
    </div>
    {isYouTubeConnected ? (
      <div className="flex items-center gap-2 text-green-400 font-semibold">
        <CheckCircle className="w-5 h-5"/>
        <span>Conectado</span>
      </div>
    ) : (
      <Button onClick={handleConnectYouTube}>
        <LinkIcon className="w-4 h-4 mr-2"/>
        Conectar
      </Button>
    )}
  </div>
        </CardContent>
      </Card>

      {/* Tarjeta de Generadores de IA */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="text-purple-400"/> Estudio de Contenido (Gemini)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Generador de Post con Imagen */}
          <div className="space-y-3 p-4 bg-gray-900/30 rounded-lg">
            <h3 className="font-semibold text-white">1. Generar Post con Imagen</h3>
            <Label>Elige un servicio para promocionar</Label>
            <Select onValueChange={setSelectedServiceId} value={selectedServiceId}>
              <SelectTrigger><SelectValue placeholder="Selecciona un servicio..." /></SelectTrigger>
              <SelectContent>{services.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={handleGenerateImagePost} disabled={isGeneratingPost || !selectedServiceId} className="w-full">
              {isGeneratingPost ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="w-4 h-4 mr-2"/>}
              Generar Post
            </Button>
          </div>
          {/* Generador de Video */}
          <div className="space-y-3 p-4 bg-gray-900/30 rounded-lg">
            <h3 className="font-semibold text-white">2. Generar Video Corto</h3>
            <Label>Describe la idea para tu video</Label>
            <Textarea
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="Ej: Un video cinematográfico de un masaje relajante..."
            />
            <Button onClick={handleGenerateVideo} disabled={isGeneratingVideo} className="w-full">
              {isGeneratingVideo ? <Loader2 className="animate-spin mr-2"/> : <Video className="w-4 h-4 mr-2"/>}
              Generar Video
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta de Galería de Contenido */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle>Galería de Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
          ) : gallery.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {gallery.map(item => (
                <div key={item.id} className="relative aspect-square bg-gray-700 rounded-lg overflow-hidden group">
  {(() => {
    // Caso 1: El trabajo se completó exitosamente
    if (item.status === 'completed') {
      // Si es una imagen y tiene URL, muestra el componente Image
      if (item.contentType === 'social_post_image' && item.generatedImageUrl) {
        return (
          <Image 
            src={item.generatedImageUrl} 
            alt={item.prompt || 'Contenido de imagen'}
            fill
            className="object-cover"
          />
        );
      // Si es un video y tiene URL, muestra un placeholder de video
      } else if (item.contentType === 'social_post_video' && item.generatedVideoUrl) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black">
            <Video className="w-10 h-10 text-purple-400" />
            <span className="text-xs mt-2 text-gray-300">Video Listo</span>
          </div>
        );
      }
    }
    // Caso 2: El trabajo está en proceso
    if (item.status === 'processing') {
      return <div className="flex flex-col items-center justify-center h-full text-xs text-gray-300"><Loader2 className="animate-spin mb-2"/><span>Procesando...</span></div>;
    }
    // Caso 3: El trabajo falló
    if (item.status === 'failed') {
      return <div className="flex items-center justify-center h-full bg-red-500/20 text-red-400">Falló</div>;
    }
    // Fallback por si no coincide ningún estado
    return null; 
  })()}
  
  {/* Overlay con acciones (se mantiene igual) */}
  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
    {item.status === 'completed' && (
      <Button size="sm">Programar</Button>
    )}
  </div>
</div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Tu contenido generado por IA aparecerá aquí.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}