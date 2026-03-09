"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, Video, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { useSocial } from '@/hooks/useSocial';
import { SocialPlatform } from '@/types/social';

// Interfaz para la prop de servicios (viene de tu catálogo)
interface ServiceOption {
  id: number;
  name: string;
}

interface AiStudioFormProps {
  services: ServiceOption[];
  onGenerationSuccess: () => void; // Callback para recargar la galería
}

export function AiStudioForm({ services, onGenerationSuccess }: AiStudioFormProps) {
  const t = useTranslations('DashboardMarketing');
  const { generateImage: generateImageApi, generateVideo: generateVideoApi } = useSocial();

  // Estados locales para los formularios
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [videoPrompt, setVideoPrompt] = useState('');

  // Separamos los estados de carga para UX fluida
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // --- HANDLER: Generar Imagen + Texto (Gemini) ---
  const handleGenerateImagePost = async () => {
    if (!selectedServiceId) {
      return toast.warn(t('warn_select_service') || "Por favor, selecciona un servicio.");
    }

    const selectedService = services.find(s => s.id.toString() === selectedServiceId);
    setIsGeneratingImage(true);

    try {
      // 🚀 Llamada real al backend usando el hook
      await generateImageApi({
        topic: `Promocionar el servicio médico de: ${selectedService?.name}`,
        tone: 'PROFESSIONAL',
        targetAudience: 'Pacientes potenciales de la clínica',
        platform: 'FACEBOOK' as SocialPlatform,
      });

      toast.success(t('generate_success') || "¡Contenido generado con éxito!");
      setSelectedServiceId('');
      onGenerationSuccess(); // Avisamos a la galería que hay nuevo contenido
    } catch (error) {
      toast.error(t('generate_error') || "Error al generar el contenido con IA.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- HANDLER: Generar Video (Veo) ---
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      return toast.warn(t('warn_empty_prompt') || "Describe la idea de tu video.");
    }

    setIsGeneratingVideo(true);

    try {
      // 🚀 Llamada real al backend para video
      await generateVideoApi({
        topic: videoPrompt,
        tone: 'EDUCATIONAL',
        targetAudience: 'Pacientes buscando información de salud',
        platform: 'INSTAGRAM' as SocialPlatform,
      });

      toast.success(t('generate_video_success') || "¡Video en proceso de generación!");
      setVideoPrompt('');
      onGenerationSuccess();
    } catch (error) {
      toast.error(t('generate_error') || "Error al procesar el video.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      {/* Efecto visual de fondo */}
      <div className="absolute top-0 right-0 p-40 bg-medical-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-lg font-bold">
          <Sparkles className="w-5 h-5 text-medical-500" />
          {t('ai_studio_title') || 'Estudio de IA'}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          {t('ai_studio_desc') || 'Genera posts y videos automáticos para tus redes sociales.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">

        {/* BLOQUE 1: Generador de Imagen (Gemini) */}
        <div className="flex flex-col space-y-5 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
              <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t('image_generator_title') || 'Post con Imagen'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('image_generator_desc') || 'Crea una imagen y copy para tus servicios.'}
              </p>
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <Label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Servicio a promocionar</Label>
            <Select onValueChange={setSelectedServiceId} value={selectedServiceId} disabled={isGeneratingImage}>
              <SelectTrigger className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-11 focus:ring-medical-500/20 focus:border-medical-500">
                <SelectValue placeholder="Selecciona un servicio..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                {services.map(s => (
                  <SelectItem key={s.id} value={s.id.toString()} className="focus:bg-slate-100 dark:focus:bg-slate-800">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerateImagePost}
            disabled={isGeneratingImage || !selectedServiceId}
            className="w-full h-11 bg-medical-600 hover:bg-medical-700 text-white shadow-sm transition-all"
          >
            {isGeneratingImage ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {isGeneratingImage ? (t('generating') || 'Generando...') : (t('generate_btn') || 'Generar Post')}
          </Button>
        </div>

        {/* BLOQUE 2: Generador de Video (Veo) */}
        <div className="flex flex-col space-y-5 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
              <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t('video_generator_title') || 'Generador de Video'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('video_generator_desc') || 'Convierte texto en video con calidad profesional.'}
              </p>
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <Label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Idea o tema del video</Label>
            <Textarea
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              disabled={isGeneratingVideo}
              placeholder={t('video_placeholder') || 'Ej: Un médico explicando los beneficios de tomar agua...'}
              className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[90px] resize-none focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <Button
            onClick={handleGenerateVideo}
            disabled={isGeneratingVideo || !videoPrompt.trim()}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            {isGeneratingVideo ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Video className="w-4 h-4 mr-2" />}
            {isGeneratingVideo ? (t('generating') || 'Procesando Video...') : (t('generate_btn') || 'Generar Video')}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}