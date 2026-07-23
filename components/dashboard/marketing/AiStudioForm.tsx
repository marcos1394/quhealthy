"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect, useReducer } from 'react';
import { useTranslations } from 'next-intl';
import {
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Loader2, 
  FileText,
  Clock, 
  Tag, 
  Copy, 
  Check, 
  RotateCcw, 
  Download, 
  Trash2, 
  CalendarPlus, 
  Save,
  Wand2
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { useSocial } from '@/hooks/useSocial';
import { SocialPlatform, AiTone } from '@/types/social';
import ScheduleModal from '@/components/dashboard/marketing/ScheduleModal';
import { useSessionStore } from '@/stores/SessionStore';
import { QhSpinner } from '@/components/ui/QhSpinner';

// ── Componente de Imagen Seguro ─────────────────────────────────────────────
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

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface CatalogItemOption {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  price?: number;
  itemType?: string; 
}

interface AiStudioFormProps {
  catalogItems: CatalogItemOption[];
  onGenerationSuccess: () => void;
}

interface State {
  selectedService: CatalogItemOption | null;
  textTone: AiTone;
  imagePrompt: string;
  imagePlatform: SocialPlatform;
  imageStyle: string;
  imageLighting: string;
  imageAspectRatio: string;
  videoPrompt: string;
  videoPlatform: SocialPlatform;
  videoTone: AiTone;
  videoAspectRatio: 'LANDSCAPE' | 'PORTRAIT' | 'SQUARE';
  videoBaseImageUrl: string;
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
  isGeneratingVideo: boolean;
  generatedText: string;
  generatedImageUrl: string;
  generatedImageCaption: string;
  generatedVideoUrl: string;
  videoStatus: string;
  activeTab: string;
  copied: boolean;
  scheduleModalOpen: boolean;
  schedulePrefill: any;
}

type Action =
  | { type: 'SET_SELECTEDSERVICE'; payload: any }
  | { type: 'SET_TEXTTONE'; payload: any }
  | { type: 'SET_IMAGEPROMPT'; payload: any }
  | { type: 'SET_IMAGEPLATFORM'; payload: any }
  | { type: 'SET_IMAGESTYLE'; payload: any }
  | { type: 'SET_IMAGELIGHTING'; payload: any }
  | { type: 'SET_IMAGEASPECTRATIO'; payload: any }
  | { type: 'SET_VIDEOPROMPT'; payload: any }
  | { type: 'SET_VIDEOPLATFORM'; payload: any }
  | { type: 'SET_VIDEOTONE'; payload: any }
  | { type: 'SET_VIDEOASPECTRATIO'; payload: any }
  | { type: 'SET_VIDEOBASEIMAGEURL'; payload: any }
  | { type: 'SET_ISGENERATINGTEXT'; payload: any }
  | { type: 'SET_ISGENERATINGIMAGE'; payload: any }
  | { type: 'SET_ISGENERATINGVIDEO'; payload: any }
  | { type: 'SET_GENERATEDTEXT'; payload: any }
  | { type: 'SET_GENERATEDIMAGEURL'; payload: any }
  | { type: 'SET_GENERATEDIMAGECAPTION'; payload: any }
  | { type: 'SET_GENERATEDVIDEOURL'; payload: any }
  | { type: 'SET_VIDEOSTATUS'; payload: any }
  | { type: 'SET_ACTIVETAB'; payload: any }
  | { type: 'SET_COPIED'; payload: any }
  | { type: 'SET_SCHEDULEMODALOPEN'; payload: any }
  | { type: 'SET_SCHEDULEPREFILL'; payload: any };

function studioReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SELECTEDSERVICE': return { ...state, selectedService: action.payload };
    case 'SET_TEXTTONE': return { ...state, textTone: action.payload };
    case 'SET_IMAGEPROMPT': return { ...state, imagePrompt: action.payload };
    case 'SET_IMAGEPLATFORM': return { ...state, imagePlatform: action.payload };
    case 'SET_IMAGESTYLE': return { ...state, imageStyle: action.payload };
    case 'SET_IMAGELIGHTING': return { ...state, imageLighting: action.payload };
    case 'SET_IMAGEASPECTRATIO': return { ...state, imageAspectRatio: action.payload };
    case 'SET_VIDEOPROMPT': return { ...state, videoPrompt: action.payload };
    case 'SET_VIDEOPLATFORM': return { ...state, videoPlatform: action.payload };
    case 'SET_VIDEOTONE': return { ...state, videoTone: action.payload };
    case 'SET_VIDEOASPECTRATIO': return { ...state, videoAspectRatio: action.payload };
    case 'SET_VIDEOBASEIMAGEURL': return { ...state, videoBaseImageUrl: action.payload };
    case 'SET_ISGENERATINGTEXT': return { ...state, isGeneratingText: action.payload };
    case 'SET_ISGENERATINGIMAGE': return { ...state, isGeneratingImage: action.payload };
    case 'SET_ISGENERATINGVIDEO': return { ...state, isGeneratingVideo: action.payload };
    case 'SET_GENERATEDTEXT': return { ...state, generatedText: action.payload };
    case 'SET_GENERATEDIMAGEURL': return { ...state, generatedImageUrl: action.payload };
    case 'SET_GENERATEDIMAGECAPTION': return { ...state, generatedImageCaption: action.payload };
    case 'SET_GENERATEDVIDEOURL': return { ...state, generatedVideoUrl: action.payload };
    case 'SET_VIDEOSTATUS': return { ...state, videoStatus: action.payload };
    case 'SET_ACTIVETAB': return { ...state, activeTab: action.payload };
    case 'SET_COPIED': return { ...state, copied: action.payload };
    case 'SET_SCHEDULEMODALOPEN': return { ...state, scheduleModalOpen: action.payload };
    case 'SET_SCHEDULEPREFILL': return { ...state, schedulePrefill: action.payload };
    default: return state;
  }
}

// ── Componente Principal ────────────────────────────────────────────────────────

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

  const [state, dispatch] = useReducer(studioReducer, {
    selectedService: null,
    textTone: 'professional',
    imagePrompt: '',
    imagePlatform: 'INSTAGRAM',
    imageStyle: 'Fotorrealismo Clínico',
    imageLighting: 'Luz Natural',
    imageAspectRatio: 'SQUARE',
    videoPrompt: '',
    videoPlatform: 'INSTAGRAM',
    videoTone: 'educational',
    videoAspectRatio: 'LANDSCAPE',
    videoBaseImageUrl: '',
    isGeneratingText: false,
    isGeneratingImage: false,
    isGeneratingVideo: false,
    generatedText: '',
    generatedImageUrl: '',
    generatedImageCaption: '',
    generatedVideoUrl: '',
    videoStatus: '',
    activeTab: 'text',
    copied: false,
    scheduleModalOpen: false,
    schedulePrefill: undefined,
  });

  const {
    selectedService,
    textTone,
    imagePrompt,
    imagePlatform,
    imageStyle,
    imageLighting,
    imageAspectRatio,
    videoPrompt,
    videoPlatform,
    videoTone,
    videoAspectRatio,
    videoBaseImageUrl,
    isGeneratingText,
    isGeneratingImage,
    isGeneratingVideo,
    generatedText,
    generatedImageUrl,
    generatedImageCaption,
    generatedVideoUrl,
    videoStatus,
    activeTab,
    copied,
    scheduleModalOpen,
    schedulePrefill,
  } = state;

  useEffect(() => {
    if (sseVideoUrl) {
      dispatch({ type: 'SET_GENERATEDVIDEOURL', payload: sseVideoUrl });
      dispatch({ type: 'SET_VIDEOSTATUS', payload: '' });
      dispatch({ type: 'SET_ISGENERATINGVIDEO', payload: false });
      clearSseVideoUrl();
      toast.success(t('video_ready', { defaultValue: 'Renderizado de video completado.' }), { theme: "colored" });
    }
  }, [sseVideoUrl, clearSseVideoUrl, t]);

  const tones: { value: AiTone; label: string; emoji: string }[] = [
    { value: 'professional', label: t('tone_professional', { defaultValue: 'Profesional' }), emoji: '👔' },
    { value: 'friendly', label: t('tone_friendly', { defaultValue: 'Amigable' }), emoji: '😊' },
    { value: 'educational', label: t('tone_educational', { defaultValue: 'Educativo' }), emoji: '📚' },
    { value: 'promotional', label: t('tone_promotional', { defaultValue: 'Comercial' }), emoji: '🔥' },
  ];

  const handleGenerateText = async () => {
    if (!selectedService) return toast.warn(t('warn_select_service', { defaultValue: 'Requiere selección de servicio.' }));
    dispatch({ type: 'SET_ISGENERATINGTEXT', payload: true });
    dispatch({ type: 'SET_GENERATEDTEXT', payload: '' });
    try {
      const itemTypeLabel = selectedService.itemType?.toLowerCase() || 'servicio';
      const response = await generateTextApi({
        topic: `Crear un copy publicitario para redes sociales sobre el ${itemTypeLabel} "${selectedService.name}". Descripción: ${selectedService.description || selectedService.name}. Categoría: ${selectedService.category || 'General'}. Precio: $${selectedService.price || 'No especificado'} MXN.`,
        tone: textTone,
        targetAudience: 'Pacientes potenciales buscando servicios de salud y bienestar',
        platform: 'FACEBOOK',
        businessName: user ? `${user.firstName} ${user.lastName}` : undefined,
      });
      if (response?.generatedText) {
        dispatch({ type: 'SET_GENERATEDTEXT', payload: response.generatedText });
        toast.success(t('generate_text_success', { defaultValue: 'Texto generado exitosamente.' }), { theme: "colored" });
        onGenerationSuccess();
      }
    } catch {
      // Manejado por el hook
    } finally {
      dispatch({ type: 'SET_ISGENERATINGTEXT', payload: false });
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedService) return toast.warn(t('warn_select_service', { defaultValue: 'Requiere selección de servicio.' }));
    dispatch({ type: 'SET_ISGENERATINGIMAGE', payload: true });
    dispatch({ type: 'SET_GENERATEDIMAGEURL', payload: '' });
    dispatch({ type: 'SET_GENERATEDIMAGECAPTION', payload: '' });
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
      if (response?.imageUrl) dispatch({ type: 'SET_GENERATEDIMAGEURL', payload: response.imageUrl });
      if (response?.generatedText) dispatch({ type: 'SET_GENERATEDIMAGECAPTION', payload: response.generatedText });
      toast.success(t('generate_success', { defaultValue: 'Imagen generada exitosamente.' }), { theme: "colored" });
      dispatch({ type: 'SET_IMAGEPROMPT', payload: '' });
      onGenerationSuccess();
    } catch {
      // Silencioso
    } finally {
      dispatch({ type: 'SET_ISGENERATINGIMAGE', payload: false });
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return toast.warn(t('warn_empty_prompt', { defaultValue: 'Requiere prompt de entrada.' }));
    dispatch({ type: 'SET_ISGENERATINGVIDEO', payload: true });
    dispatch({ type: 'SET_VIDEOSTATUS', payload: '' });
    try {
      const response = await generateVideoApi({
        topic: videoPrompt,
        tone: videoTone,
        targetAudience: 'Pacientes buscando servicios de salud y bienestar',
        platform: videoPlatform,
        imageUrl: videoBaseImageUrl || undefined,
        aspectRatio: videoAspectRatio,
      });
      if (response?.message) dispatch({ type: 'SET_VIDEOSTATUS', payload: response.message });
      toast.success(t('generate_video_success', { defaultValue: 'Proceso de renderizado iniciado.' }), { theme: "colored" });
      dispatch({ type: 'SET_VIDEOPROMPT', payload: '' });
      onGenerationSuccess();
    } catch {
      dispatch({ type: 'SET_ISGENERATINGVIDEO', payload: false });
    }
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      dispatch({ type: 'SET_COPIED', payload: true });
      toast.success(t('copied_to_clipboard', { defaultValue: 'Copiado al portapapeles.' }), { theme: "colored" });
      setTimeout(() => dispatch({ type: 'SET_COPIED', payload: false }), 2000);
    } catch { }
  };

  const handleCopyAndScheduleText = () => {
    dispatch({ 
      type: 'SET_SCHEDULEPREFILL', 
      payload: { content: generatedText, generatedByAi: true } 
    });
    dispatch({ type: 'SET_SCHEDULEMODALOPEN', payload: true });
  };

  const handleScheduleImage = () => {
    dispatch({ 
      type: 'SET_SCHEDULEPREFILL', 
      payload: {
        content: generatedImageCaption || '',
        mediaUrls: [generatedImageUrl],
        mediaType: 'image',
        generatedByAi: true,
      } 
    });
    dispatch({ type: 'SET_SCHEDULEMODALOPEN', payload: true });
  };

  const handleScheduleVideo = () => {
    dispatch({ 
      type: 'SET_SCHEDULEPREFILL', 
      payload: {
        content: videoPrompt || `Video generado con IA — ${selectedService?.name ?? ''}`,
        mediaUrls: [generatedVideoUrl],
        mediaType: 'video',
        generatedByAi: true,
      } 
    });
    dispatch({ type: 'SET_SCHEDULEMODALOPEN', payload: true });
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
      toast.success(t('saved_to_gallery', { defaultValue: 'Guardado en repositorio local.' }), { theme: "colored" });
      onGenerationSuccess();
    } catch { }
  };

  return (
    <>
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-colors font-sans">

        {/* --- HEADER ESTUDIO --- */}
        <div className="flex items-center justify-between p-6 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Motor de Inteligencia Artificial</p>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                {t('ai_studio_title', { defaultValue: 'Estudio Generativo' })}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-6 p-6 bg-gray-50/30 dark:bg-[#050505]/30">

          {/* ── PASO 1: SELECTOR DE SERVICIO ─────────────────────────────── */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <label className="text-xs font-bold text-gray-900 dark:text-white">
                {t('step_select_service', { defaultValue: 'Selección de concepto base' })}
              </label>
            </div>

            {catalogItems.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-[#050505] rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-500">
                  {t('no_services', { defaultValue: 'No hay elementos configurados en el catálogo.' })}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto custom-scrollbar p-1">
                {catalogItems.map((item) => {
                  const isSelected = selectedService?.id === item.id && selectedService?.itemType === item.itemType;
                  return (
                    <button
                      key={`${item.itemType}-${item.id}`}
                      type="button"
                      onClick={() => dispatch({ type: 'SET_SELECTEDSERVICE', payload: item })}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border text-left transition-all shadow-sm group relative",
                        isSelected 
                          ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/50 text-gray-900 dark:text-white" 
                          : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 hover:border-emerald-200 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 shrink-0 overflow-hidden">
                        <SafeImage
                          src={item.imageUrl || ''}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          fallback={<div className="w-full h-full flex items-center justify-center"><Tag className="w-4 h-4 text-gray-400" strokeWidth={2} /></div>}
                        />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-xs font-bold truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.category && (
                            <span className="text-[10px] font-semibold text-gray-500 truncate">
                              {item.category}
                            </span>
                          )}
                          {item.price != null && (
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ${item.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3" strokeWidth={2.5} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── PASO 2: TABS DE CONTENIDO ─────────────────────────────────── */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <label className="text-xs font-bold text-gray-900 dark:text-white">
                {t('step_choose_content', { defaultValue: 'Configuración de salida y formato' })}
              </label>
            </div>

            <Tabs value={activeTab} onValueChange={(val) => dispatch({ type: 'SET_ACTIVETAB', payload: val })} className="w-full flex flex-col">
              
              <TabsList className="flex items-center bg-gray-100 dark:bg-gray-800/50 p-1 rounded-2xl shrink-0 h-auto w-full">
                <TabsTrigger 
                  value="text" 
                  className="flex-1 h-9 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm text-gray-500 flex items-center justify-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5" strokeWidth={2} /> 
                  <span>{t('tab_text', { defaultValue: 'Copywriting' })}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="image" 
                  className="flex-1 h-9 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm text-gray-500 flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-3.5 h-3.5" strokeWidth={2} /> 
                  <span>{t('tab_image', { defaultValue: 'Imagen IA' })}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="video" 
                  className="flex-1 h-9 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm text-gray-500 flex items-center justify-center gap-2"
                >
                  <Video className="w-3.5 h-3.5" strokeWidth={2} /> 
                  <span>{t('tab_video', { defaultValue: 'Video Animado' })}</span>
                </TabsTrigger>
              </TabsList>

              {/* ────────── TAB: TEXTO ────────── */}
              <TabsContent value="text" className="m-0 pt-4 outline-none flex flex-col space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {t('tone_label', { defaultValue: 'Tono comunicacional' })}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-gray-50 dark:bg-[#050505] p-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
                      {tones.map((tone) => (
                        <button
                          key={tone.value}
                          type="button"
                          onClick={() => dispatch({ type: 'SET_TEXTTONE', payload: tone.value })}
                          className={cn(
                            "h-9 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                            textTone === tone.value 
                              ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm" 
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          )}
                        >
                          <span>{tone.emoji}</span> 
                          <span>{tone.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateText}
                    disabled={isGeneratingText || !selectedService}
                    className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isGeneratingText ? (
                      <><QhSpinner size="sm" className="text-current" /> Sintetizando...</>
                    ) : (
                      <><Wand2 className="w-4 h-4" strokeWidth={2} /> {t('generate_text_btn', { defaultValue: 'Generar Copy' })}</>
                    )}
                  </button>
                </div>

                {/* Resultado Texto */}
                {generatedText && (
                  <div className="bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-3 mt-2 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-gray-800">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        Resultado Generado
                      </span>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button"
                          onClick={() => handleCopyText(generatedText)} 
                          className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copiado' : 'Copiar'}</span>
                        </button>
                        <button 
                          type="button"
                          onClick={handleGenerateText} 
                          disabled={isGeneratingText} 
                          className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> 
                          <span>Regenerar</span>
                        </button>
                      </div>
                    </div>
                    
                    <Textarea
                      value={generatedText}
                      onChange={(e) => dispatch({ type: 'SET_GENERATEDTEXT', payload: e.target.value })}
                      className="w-full min-h-[140px] p-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                    />

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSaveDraft('text')}
                        className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        <span>{t('save_to_gallery', { defaultValue: 'Guardar en Galería' })}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyAndScheduleText}
                        className="flex-1 h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <CalendarPlus className="w-4 h-4" strokeWidth={2} />
                        <span>{t('copy_and_use', { defaultValue: 'Programar Publicación' })}</span>
                      </button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ────────── TAB: IMAGEN ────────── */}
              <TabsContent value="image" className="m-0 pt-4 outline-none flex flex-col space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Parámetros */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">FORMATO</label>
                        <Select value={imageAspectRatio} onValueChange={(val: any) => dispatch({ type: 'SET_IMAGEASPECTRATIO', payload: val })}>
                          <SelectTrigger className="w-full h-10 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl">
                            <SelectItem value="SQUARE" className="text-xs font-semibold">1:1 Cuadrado</SelectItem>
                            <SelectItem value="PORTRAIT" className="text-xs font-semibold">9:16 Vertical</SelectItem>
                            <SelectItem value="LANDSCAPE" className="text-xs font-semibold">16:9 Horizontal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">PLATAFORMA</label>
                        <Select value={imagePlatform} onValueChange={(val: any) => dispatch({ type: 'SET_IMAGEPLATFORM', payload: val })}>
                          <SelectTrigger className="w-full h-10 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl">
                            <SelectItem value="FACEBOOK" className="text-xs font-semibold">Facebook</SelectItem>
                            <SelectItem value="INSTAGRAM" className="text-xs font-semibold">Instagram</SelectItem>
                            <SelectItem value="LINKEDIN" className="text-xs font-semibold">LinkedIn</SelectItem>
                            <SelectItem value="GOOGLE_BUSINESS" className="text-xs font-semibold">Google Business</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">ESTILO VISUAL</label>
                        <Select value={imageStyle} onValueChange={(val) => dispatch({ type: 'SET_IMAGESTYLE', payload: val })}>
                          <SelectTrigger className="w-full h-10 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl">
                            <SelectItem value="Fotorrealismo Clínico" className="text-xs font-semibold">Fotorrealismo</SelectItem>
                            <SelectItem value="Estilo de Vida / Wellness" className="text-xs font-semibold">Estilo de Vida</SelectItem>
                            <SelectItem value="Ilustración Digital" className="text-xs font-semibold">Ilustración</SelectItem>
                            <SelectItem value="Render 3D Suave" className="text-xs font-semibold">Render 3D</SelectItem>
                            <SelectItem value="Minimalista" className="text-xs font-semibold">Minimalista</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">ILUMINACIÓN</label>
                        <Select value={imageLighting} onValueChange={(val) => dispatch({ type: 'SET_IMAGELIGHTING', payload: val })}>
                          <SelectTrigger className="w-full h-10 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl">
                            <SelectItem value="Luz Natural" className="text-xs font-semibold">Luz Natural</SelectItem>
                            <SelectItem value="Luz de Estudio" className="text-xs font-semibold">Luz de Estudio</SelectItem>
                            <SelectItem value="Cinemática" className="text-xs font-semibold">Cinemática</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Prompt & Acción */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {t('image_prompt_label', { defaultValue: 'Instrucción Adicional (Opcional)' })}
                      </label>
                      <Textarea
                        value={imagePrompt}
                        onChange={(e) => dispatch({ type: 'SET_IMAGEPROMPT', payload: e.target.value })}
                        disabled={isGeneratingImage}
                        placeholder="Describa detalles visuales específicos..."
                        className="w-full h-20 p-3 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !selectedService}
                      className="w-full h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {isGeneratingImage ? (
                        <><QhSpinner size="sm" className="text-current" /> Sintetizando Imagen...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" strokeWidth={2} /> {t('generate_image_btn', { defaultValue: 'Generar Imagen IA' })}</>
                      )}
                    </button>
                  </div>

                </div>

                {/* Resultado Imagen */}
                {generatedImageUrl && (
                  <div className="bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm mt-2">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-gray-800">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        Activo Visual Generado
                      </span>
                      <button 
                        type="button"
                        onClick={handleGenerateImage} 
                        disabled={isGeneratingImage} 
                        className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Regenerar</span>
                      </button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-5 items-center">
                      <div className="w-full max-w-xs rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm shrink-0">
                        <img src={generatedImageUrl} alt="Generated" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                      </div>
                      
                      {generatedImageCaption && (
                        <div className="flex-1 w-full space-y-2">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {t('result_caption', { defaultValue: 'Copy Sugerido' })}
                          </label>
                          <Textarea
                            value={generatedImageCaption}
                            onChange={(e) => dispatch({ type: 'SET_GENERATEDIMAGECAPTION', payload: e.target.value })}
                            className="w-full h-32 p-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm resize-none"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-800">
                      <a
                        href={generatedImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} /> 
                        <span>Descargar</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleSaveDraft('image')}
                        className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} /> 
                        <span>Guardar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleScheduleImage}
                        className="h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" strokeWidth={2} /> 
                        <span>Programar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const itemTypeLabel = selectedService?.itemType?.toLowerCase() || 'servicio';
                          dispatch({ type: 'SET_VIDEOBASEIMAGEURL', payload: generatedImageUrl });
                          dispatch({ 
                            type: 'SET_VIDEOPROMPT', 
                            payload: `Crear un video promocional animado basado en la imagen generada del ${itemTypeLabel} "${selectedService?.name ?? ''}". Animación suave y profesional.` 
                          });
                          dispatch({ type: 'SET_ACTIVETAB', payload: 'video' });
                        }}
                        className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} /> 
                        <span>Animar</span>
                      </button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ────────── TAB: VIDEO ────────── */}
              <TabsContent value="video" className="m-0 pt-4 outline-none flex flex-col space-y-4">
                
                {videoBaseImageUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/40">
                    <img src={videoBaseImageUrl} alt="Base" className="w-10 h-10 rounded-xl object-cover border border-emerald-200 dark:border-emerald-800" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Imagen Fuente Activa</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Conversión Image-to-Video</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => dispatch({ type: 'SET_VIDEOBASEIMAGEURL', payload: '' })} 
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">PLATAFORMA</label>
                    <div className="flex bg-gray-50 dark:bg-[#050505] p-1 rounded-xl border border-gray-200 dark:border-gray-800">
                      {(['INSTAGRAM', 'FACEBOOK', 'TIKTOK'] as SocialPlatform[]).map((p) => (
                        <button 
                          key={p} 
                          type="button" 
                          onClick={() => dispatch({ type: 'SET_VIDEOPLATFORM', payload: p })}
                          className={cn(
                            "flex-1 h-8 rounded-lg text-[10px] font-bold transition-all",
                            videoPlatform === p 
                              ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm" 
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          )}
                        >
                          {p.charAt(0) + p.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">TONO</label>
                    <div className="flex bg-gray-50 dark:bg-[#050505] p-1 rounded-xl border border-gray-200 dark:border-gray-800">
                      {tones.map((tone) => (
                        <button 
                          key={tone.value} 
                          type="button" 
                          onClick={() => dispatch({ type: 'SET_VIDEOTONE', payload: tone.value })}
                          className={cn(
                            "flex-1 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                            videoTone === tone.value 
                              ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm" 
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          )}
                        >
                          {tone.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">ASPECT RATIO</label>
                    <div className="flex bg-gray-50 dark:bg-[#050505] p-1 rounded-xl border border-gray-200 dark:border-gray-800">
                      {(['LANDSCAPE', 'PORTRAIT', 'SQUARE'] as const).map((a) => (
                        <button 
                          key={a} 
                          type="button" 
                          onClick={() => dispatch({ type: 'SET_VIDEOASPECTRATIO', payload: a })}
                          className={cn(
                            "flex-1 h-8 rounded-lg text-[10px] font-bold transition-all",
                            videoAspectRatio === a 
                              ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm" 
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          )}
                        >
                          {{ LANDSCAPE: '16:9', PORTRAIT: '9:16', SQUARE: '1:1' }[a]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {t('video_prompt_label', { defaultValue: 'Prompt de Animación' })}
                  </label>
                  <Textarea
                    value={videoPrompt}
                    onChange={(e) => dispatch({ type: 'SET_VIDEOPROMPT', payload: e.target.value })}
                    disabled={isGeneratingVideo}
                    placeholder="Instrucciones de movimiento, ángulo de cámara o narrativa..."
                    className="w-full h-20 p-3 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo || !videoPrompt.trim()}
                  className="w-full h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isGeneratingVideo ? (
                    <><QhSpinner size="sm" className="text-current" /> Renderizando Video...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" strokeWidth={2} /> {t('generate_video_btn', { defaultValue: 'Iniciar Render de Video' })}</>
                  )}
                </button>
                
                {videoStatus && !generatedVideoUrl && (
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/30 flex items-start gap-3">
                    <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0 mt-0.5" strokeWidth={2} />
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                        {t('video_in_progress', { defaultValue: 'Proceso en segundo plano' })}
                      </p>
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{videoStatus}</p>
                    </div>
                  </div>
                )}

                {/* Resultado Video */}
                {generatedVideoUrl && (
                  <div className="bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm mt-2">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-gray-800">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        Video Renderizado
                      </span>
                    </div>
                    
                    <div className="flex justify-center bg-black rounded-2xl overflow-hidden shadow-md">
                      <video src={generatedVideoUrl} controls autoPlay className="max-w-full max-h-[350px]" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = generatedVideoUrl;
                          a.download = 'quhealthy-video.mp4';
                          a.target = '_blank';
                          a.click();
                        }}
                        className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} /> 
                        <span>Descargar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveDraft('video')}
                        className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} /> 
                        <span>Guardar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleScheduleVideo}
                        className="h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" strokeWidth={2} /> 
                        <span>Programar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'SET_GENERATEDVIDEOURL', payload: '' })}
                        className="h-10 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> 
                        <span>Descartar</span>
                      </button>
                    </div>
                  </div>
                )}
              </TabsContent>

            </Tabs>
          </div>

        </div>
      </div>

      {/* ── ScheduleModal ─────────────────────────────────────────────────── */}
      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => {
          dispatch({ type: 'SET_SCHEDULEMODALOPEN', payload: false });
          dispatch({ type: 'SET_SCHEDULEPREFILL', payload: undefined });
        }}
        onScheduled={() => {
          dispatch({ type: 'SET_SCHEDULEMODALOPEN', payload: false });
          dispatch({ type: 'SET_SCHEDULEPREFILL', payload: undefined });
          onGenerationSuccess();
        }}
        prefill={schedulePrefill}
      />
    </>
  );
}