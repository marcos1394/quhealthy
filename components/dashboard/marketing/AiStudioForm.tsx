"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Sparkles, Video, Image as ImageIcon, Loader2, FileText,
  ChevronRight, Clock, Tag, Copy, Check, RotateCcw, Download, Trash2, CalendarPlus, Save
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useSocial } from '@/hooks/useSocial';
import { SocialPlatform, AiTone } from '@/types/social';
import ScheduleModal from '@/components/dashboard/marketing/ScheduleModal';
import { useSessionStore } from '@/stores/SessionStore';

// ── Fallback Image Component ───────────────────────────────────────────────────
const SafeImage = ({ src, alt, className, fallback }: { src: string, alt: string, className?: string, fallback: React.ReactNode }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <>{fallback}</>;
  }
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface CatalogItemOption {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  price?: number;
  itemType?: string; // service, product, course, package
}

interface AiStudioFormProps {
  catalogItems: CatalogItemOption[];
  onGenerationSuccess: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AiStudioForm({ catalogItems, onGenerationSuccess }: AiStudioFormProps) {
  const t = useTranslations('DashboardMarketing');
  const {
    generateText: generateTextApi,
    generateImage: generateImageApi,
    generateVideo: generateVideoApi,
    saveDraft,
    sseVideoUrl,
    clearSseVideoUrl,
  } = useSocial();

  const { user } = useSessionStore();

  // ── Servicio seleccionado ───────────────────────────────────────────────────
  const [selectedService, setSelectedService] = useState<CatalogItemOption | null>(null);

  // ── Configuración de generación ────────────────────────────────────────────
  // ✅ CORREGIDO: minúsculas — alineado con AiTone del tipo y el backend
  const [textTone, setTextTone]               = useState<AiTone>('professional');
  const [imagePrompt, setImagePrompt]         = useState('');
  const [imagePlatform, setImagePlatform]     = useState<SocialPlatform>('INSTAGRAM');
  const [imageStyle, setImageStyle]           = useState('Fotorrealismo Clínico');
  const [imageLighting, setImageLighting]     = useState('Luz Natural');
  const [imageAspectRatio, setImageAspectRatio] = useState<'SQUARE' | 'PORTRAIT' | 'LANDSCAPE'>('SQUARE');
  const [videoPrompt, setVideoPrompt]         = useState('');
  const [videoPlatform, setVideoPlatform]     = useState<SocialPlatform>('INSTAGRAM');
  const [videoTone, setVideoTone]             = useState<AiTone>('educational');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'LANDSCAPE' | 'PORTRAIT' | 'SQUARE'>('LANDSCAPE');
  const [videoBaseImageUrl, setVideoBaseImageUrl] = useState('');

  // ── Estados de carga ───────────────────────────────────────────────────────
  const [isGeneratingText, setIsGeneratingText]   = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // ── Resultados ─────────────────────────────────────────────────────────────
  const [generatedText, setGeneratedText]               = useState('');
  const [generatedImageUrl, setGeneratedImageUrl]       = useState('');
  const [generatedImageCaption, setGeneratedImageCaption] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl]       = useState('');
  const [videoStatus, setVideoStatus]                   = useState('');
  const [activeTab, setActiveTab]                       = useState('text');
  const [copied, setCopied]                             = useState(false);

  // ── ScheduleModal ──────────────────────────────────────────────────────────
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulePrefill, setSchedulePrefill] = useState<{
    content: string;
    mediaUrls?: string[];
    mediaType?: 'image' | 'video';
    generatedByAi: boolean;
  } | undefined>(undefined);

  // ── SSE: Video listo ───────────────────────────────────────────────────────
  useEffect(() => {
    if (sseVideoUrl) {
      setGeneratedVideoUrl(sseVideoUrl);
      setVideoStatus('');
      setIsGeneratingVideo(false);
      clearSseVideoUrl();
      toast.success(t('video_ready'));
    }
  }, [sseVideoUrl, clearSseVideoUrl, t]);

  // ── Tones config ───────────────────────────────────────────────────────────
  const tones: { value: AiTone; label: string; emoji: string }[] = [
    { value: 'professional', label: t('tone_professional'), emoji: '👔' },
    { value: 'friendly',     label: t('tone_friendly'),     emoji: '😊' },
    { value: 'educational',  label: t('tone_educational'),  emoji: '📚' },
    { value: 'promotional',  label: t('tone_promotional'),  emoji: '🔥' },
  ];

  // =================================================================
  // HANDLERS DE GENERACIÓN
  // =================================================================

  const handleGenerateText = async () => {
    if (!selectedService) return toast.warn(t('warn_select_service'));
    setIsGeneratingText(true);
    setGeneratedText('');
    try {
      const itemTypeLabel = selectedService.itemType?.toLowerCase() || 'servicio';
      const response = await generateTextApi({
        topic: `Crear un copy publicitario para redes sociales sobre el ${itemTypeLabel} "${selectedService.name}". Descripción: ${selectedService.description || selectedService.name}. Categoría: ${selectedService.category || 'General'}. Precio: $${selectedService.price || 'No especificado'} MXN.`,
        tone: textTone,                        // ✅ minúsculas
        targetAudience: 'Pacientes potenciales buscando servicios de salud y bienestar',
        platform: 'FACEBOOK',
        businessName: user ? `${user.firstName} ${user.lastName}` : undefined,
      });
      if (response?.generatedText) {
        setGeneratedText(response.generatedText);
        toast.success(t('generate_text_success'));
        onGenerationSuccess();
      }
    } catch {
      // handleError en el hook ya setea el error y lanza
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedService) return toast.warn(t('warn_select_service'));
    setIsGeneratingImage(true);
    setGeneratedImageUrl('');
    setGeneratedImageCaption('');
    try {
      const itemTypeLabel = selectedService.itemType?.toLowerCase() || 'servicio';
      const topic = imagePrompt.trim()
        ? `${imagePrompt}. ${selectedService.itemType}: ${selectedService.name}. ${selectedService.description || ''}`
        : `Crear una imagen promocional profesional para el ${itemTypeLabel} "${selectedService.name}". ${selectedService.description || ''}. Categoría: ${selectedService.category || 'Salud'}.`;

      const response = await generateImageApi({
        topic,
        tone: 'professional',
        targetAudience: 'Pacientes potenciales de la clínica',
        platform: imagePlatform,
        imageStyle,
        lighting: imageLighting,
        aspectRatio: imageAspectRatio,
      });
      if (response?.imageUrl)      setGeneratedImageUrl(response.imageUrl);
      if (response?.generatedText) setGeneratedImageCaption(response.generatedText);
      toast.success(t('generate_success'));
      setImagePrompt('');
      onGenerationSuccess();
    } catch {
      // silencioso — el hook maneja el error
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return toast.warn(t('warn_empty_prompt'));
    setIsGeneratingVideo(true);
    setVideoStatus('');
    try {
      const response = await generateVideoApi({
        topic: videoPrompt,
        tone: videoTone,                       // ✅ minúsculas
        targetAudience: 'Pacientes buscando servicios de salud y bienestar',
        platform: videoPlatform,
        imageUrl: videoBaseImageUrl || undefined,
        aspectRatio: videoAspectRatio,
      });
      // El backend responde 202 — el video llega por SSE
      if (response?.message) setVideoStatus(response.message);
      toast.success(t('generate_video_success'));
      setVideoPrompt('');
      onGenerationSuccess();
    } catch {
      setIsGeneratingVideo(false);
    }
    // No ponemos finally aquí — isGeneratingVideo se apaga cuando llega el SSE
  };

  // ── Helpers de UI ──────────────────────────────────────────────────────────

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t('copied_to_clipboard'));
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silencioso */ }
  };

  /**
   * ✅ NUEVO: "Copiar y Usar" abre el ScheduleModal con el texto prefilled
   * en lugar de solo copiar al portapapeles.
   */
  const handleCopyAndScheduleText = () => {
    setSchedulePrefill({
      content: generatedText,
      generatedByAi: true,
    });
    setScheduleModalOpen(true);
  };

  const handleScheduleImage = () => {
    setSchedulePrefill({
      content: generatedImageCaption || '',
      mediaUrls: [generatedImageUrl],
      mediaType: 'image',
      generatedByAi: true,
    });
    setScheduleModalOpen(true);
  };

  const handleScheduleVideo = () => {
    setSchedulePrefill({
      content: videoPrompt || `Video generado con IA — ${selectedService?.name ?? ''}`,
      mediaUrls: [generatedVideoUrl],
      mediaType: 'video',
      generatedByAi: true,
    });
    setScheduleModalOpen(true);
  };

  const handleSaveDraft = async (type: 'text' | 'image' | 'video') => {
    let content = '';
    let mediaUrls: string[] = [];
    
    if (type === 'text') {
      content = generatedText;
    } else if (type === 'image') {
      content = generatedImageCaption || 'Imagen generada con IA';
      mediaUrls = [generatedImageUrl];
    } else if (type === 'video') {
      content = videoPrompt || `Video generado con IA — ${selectedService?.name ?? ''}`;
      mediaUrls = [generatedVideoUrl];
    }

    try {
      await saveDraft({ content, mediaUrls, generatedByAi: true });
      toast.success(t('saved_to_gallery') || 'Guardado en la galería');
      onGenerationSuccess();
    } catch {
      // El hook ya maneja el error visualmente
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-40 bg-slate-500/5 dark:bg-slate-500/10 rounded-full blur-3xl pointer-events-none" />

        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-lg font-bold">
            <Sparkles className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            {t('ai_studio_title')}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            {t('ai_studio_desc')}
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">

          {/* ── PASO 1: Selector de servicio ─────────────────────────────── */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">1</span>
              {t('step_select_service')} ({t('tab_product_course_package') || 'Servicios, Productos, Cursos y Paquetes'})
            </Label>

            {catalogItems.length === 0 ? (
              <div className="p-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center text-slate-400 dark:text-slate-500 text-sm">
                {t('no_services')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {catalogItems.map((item) => {
                  const isSelected = selectedService?.id === item.id && selectedService?.itemType === item.itemType;
                  return (
                    <button
                      key={`${item.itemType}-${item.id}`}
                      type="button"
                      onClick={() => setSelectedService(item)}
                      className={`relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 dark:border-slate-500 ring-1 ring-slate-400/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <SafeImage
                        src={item.imageUrl || ''}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
                        fallback={
                          <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <Tag className="w-5 h-5 text-slate-400" />
                          </div>
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          {item.category && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                              {item.category}
                            </Badge>
                          )}
                          {item.price != null && (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              ${item.price.toLocaleString()} MXN
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                          <ChevronRight className="w-3 h-3 text-white dark:text-slate-900" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── PASO 2: Tabs de contenido ─────────────────────────────────── */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">2</span>
              {t('step_choose_content')}
            </Label>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-100 dark:bg-slate-800 w-full h-10 rounded-lg">
                <TabsTrigger value="text" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md text-xs gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> {t('tab_text')}
                </TabsTrigger>
                <TabsTrigger value="image" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md text-xs gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> {t('tab_image')}
                </TabsTrigger>
                <TabsTrigger value="video" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md text-xs gap-1.5">
                  <Video className="w-3.5 h-3.5" /> {t('tab_video')}
                </TabsTrigger>
              </TabsList>

              {/* ────────── TAB: TEXTO ────────── */}
              <TabsContent value="text" className="mt-4 border-none outline-none space-y-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{t('text_generator_title')}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('text_generator_desc')}</p>
                    </div>
                  </div>

                  {/* Selector de tono */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('tone_label')}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {tones.map((tone) => (
                        <button
                          key={tone.value}
                          type="button"
                          onClick={() => setTextTone(tone.value)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                            textTone === tone.value
                              ? 'border-slate-800 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white dark:border-slate-400'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="mr-1">{tone.emoji}</span> {tone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview del servicio seleccionado */}
                  {selectedService && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <SafeImage
                        src={selectedService.imageUrl || ''}
                        alt={selectedService.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        fallback={
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          </div>
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{selectedService.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{selectedService.category} • ${selectedService.price?.toLocaleString() ?? '—'} MXN</p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0 text-[10px]">
                        {tones.find((to) => to.value === textTone)?.label}
                      </Badge>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateText}
                    disabled={isGeneratingText || !selectedService}
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm"
                  >
                    {isGeneratingText ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {isGeneratingText ? t('generating') : t('generate_text_btn')}
                  </Button>
                </div>

                {/* Resultado de texto */}
                {generatedText && (
                  <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/40 dark:to-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-800/40 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <Sparkles className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('result_title')}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('result_editable')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => handleCopyText(generatedText)} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white h-8 px-2.5">
                          {copied ? <Check className="w-3.5 h-3.5 mr-1 text-slate-900 dark:text-white" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                          {copied ? t('copied') : t('copy_btn')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleGenerateText} disabled={isGeneratingText} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white h-8 px-2.5">
                          <RotateCcw className="w-3.5 h-3.5 mr-1" /> {t('regenerate_btn')}
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      value={generatedText}
                      onChange={(e) => setGeneratedText(e.target.value)}
                      className="min-h-[280px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm leading-relaxed resize-y focus:ring-slate-400/20 focus:border-slate-400"
                    />

                    {/* ✅ "Copiar y Usar" abre ScheduleModal con prefill */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        onClick={() => handleSaveDraft('text')}
                        variant="outline"
                        className="w-full sm:flex-1 h-10 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {t('save_to_gallery') || 'Guardar en Galería'}
                      </Button>
                      <Button
                        onClick={handleCopyAndScheduleText}
                        className="w-full sm:flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm"
                      >
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        {t('copy_and_use')}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ────────── TAB: IMAGEN ────────── */}
              <TabsContent value="image" className="mt-4 border-none outline-none space-y-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <ImageIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{t('image_generator_title')}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('image_generator_desc')}</p>
                    </div>
                  </div>

                  {selectedService && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <SafeImage
                        src={selectedService.imageUrl || ''}
                        alt={selectedService.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        fallback={
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          </div>
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{selectedService.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{selectedService.description}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Formato</Label>
                      <Select value={imageAspectRatio} onValueChange={(val: any) => setImageAspectRatio(val)}>
                        <SelectTrigger className="h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SQUARE">1:1 Cuadrado</SelectItem>
                          <SelectItem value="PORTRAIT">9:16 Vertical</SelectItem>
                          <SelectItem value="LANDSCAPE">16:9 Horizontal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Plataforma</Label>
                      <Select value={imagePlatform} onValueChange={(val: any) => setImagePlatform(val)}>
                        <SelectTrigger className="h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FACEBOOK">Facebook</SelectItem>
                          <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                          <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                          <SelectItem value="GOOGLE_BUSINESS">Google Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Estilo Visual</Label>
                      <Select value={imageStyle} onValueChange={setImageStyle}>
                        <SelectTrigger className="h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fotorrealismo Clínico">📸 Fotorrealismo Clínico</SelectItem>
                          <SelectItem value="Estilo de Vida / Wellness">🌿 Estilo de Vida / Wellness</SelectItem>
                          <SelectItem value="Ilustración Digital">🎨 Ilustración Digital</SelectItem>
                          <SelectItem value="Render 3D Suave">🧊 Render 3D Suave</SelectItem>
                          <SelectItem value="Minimalista">⚪ Minimalista</SelectItem>
                          <SelectItem value="Acuarela">🖌️ Acuarela</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Iluminación</Label>
                      <Select value={imageLighting} onValueChange={setImageLighting}>
                        <SelectTrigger className="h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Luz Natural">☀️ Luz Natural</SelectItem>
                          <SelectItem value="Luz de Estudio">💡 Luz de Estudio</SelectItem>
                          <SelectItem value="Cinemática">🎬 Cinemática</SelectItem>
                          <SelectItem value="Minimalista Brillante">✨ Minimalista Brillante</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('image_prompt_label')}</Label>
                    <Textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      disabled={isGeneratingImage}
                      placeholder={t('image_prompt_placeholder')}
                      className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[80px] resize-none text-sm focus:ring-slate-400/20 focus:border-slate-400"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !selectedService}
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm"
                  >
                    {isGeneratingImage ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                    {isGeneratingImage ? t('generating') : t('generate_image_btn')}
                  </Button>
                </div>

                {generatedImageUrl && (
                  <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/40 dark:to-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-800/40 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <ImageIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('result_image_title')}</h4>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleGenerateImage} disabled={isGeneratingImage} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white h-8 px-2.5">
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> {t('regenerate_btn')}
                      </Button>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
                      <img src={generatedImageUrl} alt="Generated" className="w-full rounded-xl" referrerPolicy="no-referrer" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Descargar */}
                      <a
                        href={generatedImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-medium shadow-sm transition-colors"
                      >
                        <Download className="w-4 h-4" /> {t('download_image')}
                      </a>

                      {/* Guardar en galeria */}
                      <Button
                        variant="outline"
                        onClick={() => handleSaveDraft('image')}
                        className="h-10 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Save className="w-4 h-4 mr-2" /> {t('save_to_gallery') || 'Guardar'}
                      </Button>

                      {/* ✅ Programar imagen */}
                      <Button
                        onClick={handleScheduleImage}
                        className="h-10 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm"
                      >
                        <CalendarPlus className="w-4 h-4 mr-2" /> {t('schedule_btn')}
                      </Button>

                      {/* Generar video desde imagen */}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const itemTypeLabel = selectedService?.itemType?.toLowerCase() || 'servicio';
                          setVideoBaseImageUrl(generatedImageUrl);
                          setVideoPrompt(`Crear un video promocional animado basado en la imagen generada del ${itemTypeLabel} "${selectedService?.name ?? ''}". Animación suave y profesional.`);
                          setActiveTab('video');
                        }}
                        className="h-10 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Video className="w-4 h-4 mr-2" /> {t('generate_video_from_image')}
                      </Button>
                    </div>

                    {generatedImageCaption && (
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('result_caption')}</Label>
                        <Textarea
                          value={generatedImageCaption}
                          onChange={(e) => setGeneratedImageCaption(e.target.value)}
                          className="min-h-[100px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm leading-relaxed resize-y"
                        />
                        <Button variant="ghost" size="sm" onClick={() => handleCopyText(generatedImageCaption)} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white h-8">
                          <Copy className="w-3.5 h-3.5 mr-1" /> {t('copy_caption')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* ────────── TAB: VIDEO ────────── */}
              <TabsContent value="video" className="mt-4 border-none outline-none space-y-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Video className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{t('video_generator_title')}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('video_generator_desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <p className="text-[11px] text-slate-700 dark:text-slate-300">{t('video_processing_note')}</p>
                  </div>

                  {/* Imagen base (image-to-video) */}
                  {videoBaseImageUrl && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <img src={videoBaseImageUrl} alt="Base" className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{t('video_base_image')}</p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400">{t('video_image_to_video')}</p>
                      </div>
                      <button type="button" onClick={() => setVideoBaseImageUrl('')} className="text-xs text-slate-400 hover:text-red-500 p-1">✕</button>
                    </div>
                  )}

                  {/* Prompt */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('video_prompt_label')}</Label>
                    <Textarea
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      disabled={isGeneratingVideo}
                      placeholder={t('video_placeholder')}
                      className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[100px] resize-none text-sm focus:ring-slate-400/20 focus:border-slate-400"
                    />
                  </div>

                  {/* Selectores */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Plataforma */}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('video_platform')}</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['INSTAGRAM', 'FACEBOOK', 'TIKTOK'] as SocialPlatform[]).map((p) => (
                          <button key={p} type="button" onClick={() => setVideoPlatform(p)}
                            className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-all ${
                              videoPlatform === p
                                ? 'border-slate-800 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white dark:border-slate-400 shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >{p.charAt(0) + p.slice(1).toLowerCase()}</button>
                        ))}
                      </div>
                    </div>

                    {/* Tono */}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('tone_label')}</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {tones.map((tone) => (
                          <button key={tone.value} type="button" onClick={() => setVideoTone(tone.value)}
                            className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-all ${
                              videoTone === tone.value
                                ? 'border-slate-800 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white dark:border-slate-400 shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >{tone.emoji}</button>
                        ))}
                      </div>
                    </div>

                    {/* Aspect ratio */}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('video_aspect_ratio')}</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['LANDSCAPE', 'PORTRAIT', 'SQUARE'] as const).map((a) => (
                          <button key={a} type="button" onClick={() => setVideoAspectRatio(a)}
                            className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-all ${
                              videoAspectRatio === a
                                ? 'border-slate-800 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white dark:border-slate-400 shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >{{ LANDSCAPE: '16:9', PORTRAIT: '9:16', SQUARE: '1:1' }[a]}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo || !videoPrompt.trim()}
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm"
                  >
                    {isGeneratingVideo ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Video className="w-4 h-4 mr-2" />}
                    {isGeneratingVideo ? t('generating') : t('generate_video_btn')}
                  </Button>
                </div>

                {/* Estado: procesando */}
                {videoStatus && !generatedVideoUrl && (
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950/20 dark:to-slate-900/10 rounded-xl border border-slate-200 dark:border-slate-800/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse">
                        <Video className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('video_in_progress')}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{videoStatus}</p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-medium">{t('video_sse_hint')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video listo */}
                {generatedVideoUrl && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black">
                      <video src={generatedVideoUrl} controls autoPlay className="w-full aspect-video object-contain" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        const a = document.createElement('a');
                        a.href = generatedVideoUrl;
                        a.download = 'quhealthy-video.mp4';
                        a.target = '_blank';
                        a.click();
                      }} className="flex-1">
                        <Download className="w-4 h-4 mr-2" /> {t('download_video')}
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => handleSaveDraft('video')} className="flex-1 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Save className="w-4 h-4 mr-2" /> {t('save_to_gallery') || 'Guardar'}
                      </Button>

                      {/* ✅ Programar video */}
                      <Button size="sm" onClick={handleScheduleVideo} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm">
                        <CalendarPlus className="w-4 h-4 mr-2" /> {t('schedule_video_btn')}
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => setGeneratedVideoUrl('')}>
                        <Trash2 className="w-4 h-4 mr-1" /> {t('discard')}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* ── ScheduleModal ─────────────────────────────────────────────────── */}
      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setSchedulePrefill(undefined);
        }}
        onScheduled={() => {
          setScheduleModalOpen(false);
          setSchedulePrefill(undefined);
          onGenerationSuccess();
        }}
        prefill={schedulePrefill}
      />
    </>
  );
}