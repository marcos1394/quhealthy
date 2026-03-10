"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Sparkles, Video, Image as ImageIcon, Loader2, FileText,
  ChevronRight, Clock, Tag, Copy, Check, Send, RotateCcw, Download, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useSocial } from '@/hooks/useSocial';
import { SocialPlatform } from '@/types/social';
import { handleApiError } from '@/lib/handleApiError';

// Interfaz extended para los servicios del catálogo
interface ServiceOption {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  price?: number;
}

interface AiStudioFormProps {
  services: ServiceOption[];
  onGenerationSuccess: () => void;
}

export function AiStudioForm({ services, onGenerationSuccess }: AiStudioFormProps) {
  const t = useTranslations('DashboardMarketing');
  const { generateText: generateTextApi, generateImage: generateImageApi, generateVideo: generateVideoApi, sseVideoUrl, clearSseVideoUrl } = useSocial();

  // Servicio seleccionado
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);

  // Prompts personalizados
  const [textTone, setTextTone] = useState<string>('PROFESSIONAL');
  const [imagePrompt, setImagePrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoPlatform, setVideoPlatform] = useState<string>('INSTAGRAM');
  const [videoTone, setVideoTone] = useState<string>('EDUCATIONAL');
  const [videoAspectRatio, setVideoAspectRatio] = useState<string>('LANDSCAPE');
  const [videoBaseImageUrl, setVideoBaseImageUrl] = useState<string>('');

  // Estados de carga
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // ==========================================
  // RESULTADOS GENERADOS POR LA IA
  // ==========================================
  const [generatedText, setGeneratedText] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [generatedImageCaption, setGeneratedImageCaption] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('text');
  const [videoStatus, setVideoStatus] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // 🎬 Cuando el backend empuja VIDEO_READY por SSE, mostramos el video
  useEffect(() => {
    if (sseVideoUrl) {
      setGeneratedVideoUrl(sseVideoUrl);
      setVideoStatus('');
      setIsGeneratingVideo(false);
      clearSseVideoUrl();
      toast.success(t('video_ready') || '¡Tu video está listo!');
    }
  }, [sseVideoUrl, clearSseVideoUrl, t]);

  const handleSelectService = (service: ServiceOption) => {
    setSelectedService(service);
  };

  // --- HANDLER: Generar Texto ---
  const handleGenerateText = async () => {
    if (!selectedService) {
      return toast.warn(t('warn_select_service') || "Por favor, selecciona un servicio.");
    }
    setIsGeneratingText(true);
    setGeneratedText('');
    try {
      const response = await generateTextApi({
        topic: `Crear un copy publicitario para redes sociales sobre el servicio "${selectedService.name}". Descripción del servicio: ${selectedService.description || selectedService.name}. Categoría: ${selectedService.category || 'General'}. Precio: $${selectedService.price || 'No especificado'} MXN.`,
        tone: textTone,
        targetAudience: 'Pacientes potenciales buscando servicios de salud y bienestar',
        platform: 'FACEBOOK' as SocialPlatform,
      });
      if (response?.generatedText) {
        setGeneratedText(response.generatedText);
        toast.success(t('generate_text_success') || "¡Texto generado exitosamente!");
        onGenerationSuccess();
      }
    } catch (error) {
      return;
    } finally {
      setIsGeneratingText(false);
    }
  };

  // --- HANDLER: Generar Imagen ---
  const handleGenerateImage = async () => {
    if (!selectedService) {
      return toast.warn(t('warn_select_service') || "Por favor, selecciona un servicio.");
    }
    setIsGeneratingImage(true);
    setGeneratedImageUrl('');
    setGeneratedImageCaption('');
    try {
      const topic = imagePrompt.trim()
        ? `${imagePrompt}. Servicio: ${selectedService.name}. ${selectedService.description || ''}`
        : `Crear una imagen promocional profesional para el servicio "${selectedService.name}". ${selectedService.description || ''}. Categoría: ${selectedService.category || 'Salud'}.`;

      const response = await generateImageApi({
        topic,
        tone: 'PROFESSIONAL',
        targetAudience: 'Pacientes potenciales de la clínica',
        platform: 'FACEBOOK' as SocialPlatform,
      });
      if (response?.imageUrl) {
        setGeneratedImageUrl(response.imageUrl);
      }
      if (response?.generatedText) {
        setGeneratedImageCaption(response.generatedText);
      }
      toast.success(t('generate_success') || "¡Imagen generada con éxito!");
      setImagePrompt('');
      onGenerationSuccess();
    } catch (error) {
      return;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- HANDLER: Generar Video ---
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      return toast.warn(t('warn_empty_prompt') || "Describe la idea de tu video.");
    }
    setIsGeneratingVideo(true);
    setVideoStatus('');
    try {
      const response = await generateVideoApi({
        topic: videoPrompt,
        tone: videoTone,
        targetAudience: 'Pacientes buscando servicios de salud y bienestar',
        platform: videoPlatform as SocialPlatform,
        imageUrl: videoBaseImageUrl || undefined,
        aspectRatio: videoAspectRatio as 'LANDSCAPE' | 'PORTRAIT' | 'SQUARE',
      });
      if (response?.status) {
        setVideoStatus(response.message || response.status);
      }
      toast.success(t('generate_video_success') || "¡Video en proceso de generación!");
      setVideoPrompt('');
      onGenerationSuccess();
    } catch (error) {
      return;
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t('copied_to_clipboard') || '¡Copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      return;
    }
  };

  const tones = [
    { value: 'PROFESSIONAL', label: t('tone_professional') || 'Profesional', emoji: '👔' },
    { value: 'FRIENDLY', label: t('tone_friendly') || 'Cercano', emoji: '😊' },
    { value: 'EDUCATIONAL', label: t('tone_educational') || 'Educativo', emoji: '📚' },
    { value: 'PROMOTIONAL', label: t('tone_promotional') || 'Promocional', emoji: '🔥' },
  ];

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-40 bg-medical-500/5 rounded-full blur-3xl pointer-events-none" />

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-lg font-bold">
          <Sparkles className="w-5 h-5 text-medical-500" />
          {t('ai_studio_title') || 'Estudio Creativo IA'}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          {t('ai_studio_desc') || 'Genera textos, imágenes y videos profesionales para tus redes sociales.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">

        {/* ==========================================
            PASO 1: Seleccionar servicio del catálogo
           ========================================== */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-medical-100 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 text-[11px] font-bold">1</span>
            {t('step_select_service') || 'Selecciona el servicio a promocionar'}
          </Label>

          {services.length === 0 ? (
            <div className="p-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center text-slate-400 dark:text-slate-500 text-sm">
              {t('no_services') || 'No tienes servicios en tu catálogo. Agrega uno desde tu Marketplace.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.map(service => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleSelectService(service)}
                    className={`relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200 group ${isSelected
                      ? 'border-medical-500 bg-medical-50/50 dark:bg-medical-950/20 dark:border-medical-500/60 ring-1 ring-medical-500/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/60'
                      }`}
                  >
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <Tag className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? 'text-medical-700 dark:text-medical-300' : 'text-slate-900 dark:text-white'}`}>
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">{service.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        {service.category && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                            {service.category}
                          </Badge>
                        )}
                        {service.price != null && (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">${service.price.toLocaleString()} MXN</span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-medical-500 flex items-center justify-center">
                        <ChevronRight className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ==========================================
            PASO 2: Elegir qué generar (Tabs internos)
           ========================================== */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-medical-100 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 text-[11px] font-bold">2</span>
            {t('step_choose_content') || 'Elige el tipo de contenido'}
          </Label>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-100 dark:bg-slate-800 w-full h-10 rounded-lg">
              <TabsTrigger value="text" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md text-xs gap-1.5">
                <FileText className="w-3.5 h-3.5" /> {t('tab_text') || 'Texto / Copy'}
              </TabsTrigger>
              <TabsTrigger value="image" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md text-xs gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> {t('tab_image') || 'Imagen'}
              </TabsTrigger>
              <TabsTrigger value="video" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md text-xs gap-1.5">
                <Video className="w-3.5 h-3.5" /> {t('tab_video') || 'Video'}
              </TabsTrigger>
            </TabsList>

            {/* ──────────── TAB: TEXTO ──────────── */}
            <TabsContent value="text" className="mt-4 border-none outline-none space-y-4">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{t('text_generator_title') || 'Generar Copy para Redes'}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('text_generator_desc') || 'La IA creará un texto persuasivo basado en tu servicio seleccionado.'}</p>
                  </div>
                </div>

                {/* Tono */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('tone_label') || 'Tono del mensaje'}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {tones.map(tone => (
                      <button
                        key={tone.value}
                        type="button"
                        onClick={() => setTextTone(tone.value)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${textTone === tone.value
                          ? 'border-medical-500 bg-medical-50 text-medical-700 dark:bg-medical-950/30 dark:text-medical-300 dark:border-medical-500/60'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                      >
                        <span className="mr-1">{tone.emoji}</span> {tone.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview servicio */}
                {selectedService && (
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    {selectedService.imageUrl ? (
                      <img src={selectedService.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Tag className="w-4 h-4 text-slate-400" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{selectedService.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{selectedService.category} • ${selectedService.price?.toLocaleString() || '—'} MXN</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-[10px]">
                      {tones.find(t => t.value === textTone)?.label}
                    </Badge>
                  </div>
                )}

                <Button onClick={handleGenerateText} disabled={isGeneratingText || !selectedService} className="w-full h-11 bg-medical-600 hover:bg-medical-700 text-white shadow-sm">
                  {isGeneratingText ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {isGeneratingText ? (t('generating') || 'Generando texto...') : (t('generate_text_btn') || 'Generar Texto con IA')}
                </Button>
              </div>

              {/* ✨ RESULTADO DEL TEXTO GENERADO */}
              {generatedText && (
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800/40 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('result_title') || 'Copy Generado por IA'}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('result_editable') || 'Puedes editarlo antes de publicar'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyText(generatedText)}
                        className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 h-8 px-2.5"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                        {copied ? (t('copied') || 'Copiado') : (t('copy_btn') || 'Copiar')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateText}
                        disabled={isGeneratingText}
                        className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 h-8 px-2.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        {t('regenerate_btn') || 'Regenerar'}
                      </Button>
                    </div>
                  </div>

                  <Textarea
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                    className="min-h-[280px] bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800/30 text-slate-800 dark:text-slate-200 text-sm leading-relaxed resize-y focus:ring-blue-500/20 focus:border-blue-500"
                  />

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleCopyText(generatedText)}
                      className="flex-1 h-10 bg-medical-600 hover:bg-medical-700 text-white shadow-sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {t('copy_and_use') || 'Copiar y Usar'}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ──────────── TAB: IMAGEN ──────────── */}
            <TabsContent value="image" className="mt-4 border-none outline-none space-y-4">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{t('image_generator_title') || 'Generar Imagen Profesional'}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('image_generator_desc') || 'La IA generará una imagen optimizada para redes sociales.'}</p>
                  </div>
                </div>

                {selectedService && (
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    {selectedService.imageUrl ? (
                      <img src={selectedService.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Tag className="w-4 h-4 text-slate-400" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{selectedService.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{selectedService.description}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('image_prompt_label') || 'Instrucciones adicionales (opcional)'}</Label>
                  <Textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    disabled={isGeneratingImage}
                    placeholder={t('image_prompt_placeholder') || 'Ej: Estilo minimalista, colores cálidos, incluir texto con el precio...'}
                    className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[80px] resize-none text-sm focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <Button onClick={handleGenerateImage} disabled={isGeneratingImage || !selectedService} className="w-full h-11">
                  {isGeneratingImage ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                  {isGeneratingImage ? (t('generating') || 'Generando imagen...') : (t('generate_image_btn') || 'Generar Imagen con IA')}
                </Button>
              </div>

              {/* ✨ RESULTADO DE IMAGEN GENERADA */}
              {generatedImageUrl && (
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/40 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                        <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('result_image_title') || 'Imagen Generada'}</h4>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleGenerateImage} disabled={isGeneratingImage} className="text-xs text-slate-500 hover:text-emerald-600 h-8 px-2.5">
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> {t('regenerate_btn') || 'Regenerar'}
                    </Button>
                  </div>

                  {/* Imagen generada */}
                  <div className="relative group rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-800/40 shadow-md">
                    <img src={generatedImageUrl} alt="Generated" className="w-full rounded-xl" referrerPolicy="no-referrer" />
                  </div>

                  {/* Acciones */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={generatedImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {t('download_image') || 'Descargar Imagen'}
                    </a>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setVideoBaseImageUrl(generatedImageUrl);
                        setVideoPrompt(`Crear un video promocional animado basado en la imagen generada del servicio "${selectedService?.name || ''}". Animación suave y profesional.`);
                        setActiveTab('video');
                      }}
                      className="h-10 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {t('generate_video_from_image') || 'Generar Video con esta Imagen'}
                    </Button>
                  </div>

                  {generatedImageCaption && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('result_caption') || 'Caption sugerido'}</Label>
                      <Textarea
                        value={generatedImageCaption}
                        onChange={(e) => setGeneratedImageCaption(e.target.value)}
                        className="min-h-[100px] bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/30 text-sm leading-relaxed resize-y"
                      />
                      <Button variant="ghost" size="sm" onClick={() => handleCopyText(generatedImageCaption)} className="text-xs text-slate-500 hover:text-emerald-600 h-8">
                        <Copy className="w-3.5 h-3.5 mr-1" /> {t('copy_caption') || 'Copiar caption'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ──────────── TAB: VIDEO ──────────── */}
            <TabsContent value="video" className="mt-4 border-none outline-none space-y-4">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                    <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{t('video_generator_title') || 'Generador de Video'}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('video_generator_desc') || 'Convierte una idea en un video con calidad profesional.'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                  <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-400">{t('video_processing_note') || 'Los videos se procesan de forma asíncrona. Recibirás una notificación cuando esté listo.'}</p>
                </div>

                {/* Imagen base (Image-to-Video) */}
                {videoBaseImageUrl && (
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-200 dark:border-indigo-800/40">
                    <img src={videoBaseImageUrl} alt="Base" className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{t('video_base_image') || 'Imagen base para el video'}</p>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400">{t('video_image_to_video') || 'Se animará esta imagen con IA'}</p>
                    </div>
                    <button type="button" onClick={() => setVideoBaseImageUrl('')} className="text-xs text-slate-400 hover:text-red-500 p-1" title="Quitar imagen">✕</button>
                  </div>
                )}

                {/* Prompt del video */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('video_prompt_label') || 'Describe tu idea de video'}</Label>
                  <Textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    disabled={isGeneratingVideo}
                    placeholder={t('video_placeholder') || 'Ej: Un médico explicando los beneficios de tomar agua, con animaciones suaves...'}
                    className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[100px] resize-none text-sm focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Selectores: Plataforma, Tono, Aspecto */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Plataforma */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('video_platform') || 'Plataforma'}</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { value: 'INSTAGRAM', label: 'Instagram' },
                        { value: 'FACEBOOK', label: 'Facebook' },
                        { value: 'TIKTOK', label: 'TikTok' },
                      ].map(p => (
                        <button key={p.value} type="button" onClick={() => setVideoPlatform(p.value)}
                          className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-all ${videoPlatform === p.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-500/60'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                        >{p.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Tono */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('tone_label') || 'Tono'}</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { value: 'PROFESSIONAL', label: '👔' },
                        { value: 'FRIENDLY', label: '😊' },
                        { value: 'EDUCATIONAL', label: '📚' },
                        { value: 'PROMOTIONAL', label: '🔥' },
                      ].map(t => (
                        <button key={t.value} type="button" onClick={() => setVideoTone(t.value)}
                          className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-all ${videoTone === t.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-500/60'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                        >{t.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('video_aspect_ratio') || 'Formato'}</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { value: 'LANDSCAPE', label: '16:9' },
                        { value: 'PORTRAIT', label: '9:16' },
                        { value: 'SQUARE', label: '1:1' },
                      ].map(a => (
                        <button key={a.value} type="button" onClick={() => setVideoAspectRatio(a.value)}
                          className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-all ${videoAspectRatio === a.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-500/60'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                        >{a.label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={handleGenerateVideo} disabled={isGeneratingVideo || !videoPrompt.trim()} className="w-full h-11 bg-medical-600 hover:bg-medical-700 text-white shadow-sm">
                  {isGeneratingVideo ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Video className="w-4 h-4 mr-2" />}
                  {isGeneratingVideo ? (t('generating') || 'Procesando video...') : (t('generate_video_btn') || 'Generar Video con IA')}
                </Button>
              </div>

              {/* ✨ ESTADO DEL VIDEO: En proceso */}
              {videoStatus && !generatedVideoUrl && (
                <div className="p-4 bg-gradient-to-br from-medical-50 to-medical-100/50 dark:from-medical-950/20 dark:to-medical-900/10 rounded-xl border border-medical-200 dark:border-medical-800/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-medical-100 dark:bg-medical-500/20 rounded-lg animate-pulse">
                      <Video className="w-5 h-5 text-medical-600 dark:text-medical-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('video_in_progress') || 'Video en proceso'}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{videoStatus}</p>
                      <p className="text-[10px] text-medical-600 dark:text-medical-400 mt-1 font-medium">{t('video_sse_hint') || 'El video aparecerá aquí automáticamente cuando esté listo...'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 🎬 VIDEO RENDERIZADO: Reproductor */}
              {generatedVideoUrl && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black">
                    <video
                      src={generatedVideoUrl}
                      controls
                      autoPlay
                      className="w-full aspect-video object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = generatedVideoUrl;
                        a.download = 'quhealthy-video.mp4';
                        a.target = '_blank';
                        a.click();
                      }}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('download_video') || 'Descargar Video'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setGeneratedVideoUrl('')}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {t('discard') || 'Descartar'}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

      </CardContent>
    </Card>
  );
}