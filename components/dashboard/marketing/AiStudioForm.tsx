"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
 Sparkles, Video, Image as ImageIcon, Loader2, FileText,
 ChevronRight, Clock, Tag, Copy, Check, RotateCcw, Download, Trash2, CalendarPlus, Save
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
import { CardContent } from '@/components/ui/card';

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
 itemType?: string; 
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

 const [{ selectedService, textTone, imagePrompt, imagePlatform, imageStyle, imageLighting, imageAspectRatio, videoPrompt, videoPlatform, videoTone, videoAspectRatio, videoBaseImageUrl, isGeneratingText, isGeneratingImage, isGeneratingVideo, generatedText, generatedImageUrl, generatedImageCaption, generatedVideoUrl, videoStatus, activeTab, copied, scheduleModalOpen, schedulePrefill }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_SELECTEDSERVICE': return { ...state, selectedService: typeof action.payload === 'function' ? action.payload(state.selectedService) : action.payload };
 case 'SET_TEXTTONE': return { ...state, textTone: typeof action.payload === 'function' ? action.payload(state.textTone) : action.payload };
 case 'SET_IMAGEPROMPT': return { ...state, imagePrompt: typeof action.payload === 'function' ? action.payload(state.imagePrompt) : action.payload };
 case 'SET_IMAGEPLATFORM': return { ...state, imagePlatform: typeof action.payload === 'function' ? action.payload(state.imagePlatform) : action.payload };
 case 'SET_IMAGESTYLE': return { ...state, imageStyle: typeof action.payload === 'function' ? action.payload(state.imageStyle) : action.payload };
 case 'SET_IMAGELIGHTING': return { ...state, imageLighting: typeof action.payload === 'function' ? action.payload(state.imageLighting) : action.payload };
 case 'SET_IMAGEASPECTRATIO': return { ...state, imageAspectRatio: typeof action.payload === 'function' ? action.payload(state.imageAspectRatio) : action.payload };
 case 'SET_VIDEOPROMPT': return { ...state, videoPrompt: typeof action.payload === 'function' ? action.payload(state.videoPrompt) : action.payload };
 case 'SET_VIDEOPLATFORM': return { ...state, videoPlatform: typeof action.payload === 'function' ? action.payload(state.videoPlatform) : action.payload };
 case 'SET_VIDEOTONE': return { ...state, videoTone: typeof action.payload === 'function' ? action.payload(state.videoTone) : action.payload };
 case 'SET_VIDEOASPECTRATIO': return { ...state, videoAspectRatio: typeof action.payload === 'function' ? action.payload(state.videoAspectRatio) : action.payload };
 case 'SET_VIDEOBASEIMAGEURL': return { ...state, videoBaseImageUrl: typeof action.payload === 'function' ? action.payload(state.videoBaseImageUrl) : action.payload };
 case 'SET_ISGENERATINGTEXT': return { ...state, isGeneratingText: typeof action.payload === 'function' ? action.payload(state.isGeneratingText) : action.payload };
 case 'SET_ISGENERATINGIMAGE': return { ...state, isGeneratingImage: typeof action.payload === 'function' ? action.payload(state.isGeneratingImage) : action.payload };
 case 'SET_ISGENERATINGVIDEO': return { ...state, isGeneratingVideo: typeof action.payload === 'function' ? action.payload(state.isGeneratingVideo) : action.payload };
 case 'SET_GENERATEDTEXT': return { ...state, generatedText: typeof action.payload === 'function' ? action.payload(state.generatedText) : action.payload };
 case 'SET_GENERATEDIMAGEURL': return { ...state, generatedImageUrl: typeof action.payload === 'function' ? action.payload(state.generatedImageUrl) : action.payload };
 case 'SET_GENERATEDIMAGECAPTION': return { ...state, generatedImageCaption: typeof action.payload === 'function' ? action.payload(state.generatedImageCaption) : action.payload };
 case 'SET_GENERATEDVIDEOURL': return { ...state, generatedVideoUrl: typeof action.payload === 'function' ? action.payload(state.generatedVideoUrl) : action.payload };
 case 'SET_VIDEOSTATUS': return { ...state, videoStatus: typeof action.payload === 'function' ? action.payload(state.videoStatus) : action.payload };
 case 'SET_ACTIVETAB': return { ...state, activeTab: typeof action.payload === 'function' ? action.payload(state.activeTab) : action.payload };
 case 'SET_COPIED': return { ...state, copied: typeof action.payload === 'function' ? action.payload(state.copied) : action.payload };
 case 'SET_SCHEDULEMODALOPEN': return { ...state, scheduleModalOpen: typeof action.payload === 'function' ? action.payload(state.scheduleModalOpen) : action.payload };
 case 'SET_SCHEDULEPREFILL': return { ...state, schedulePrefill: typeof action.payload === 'function' ? action.payload(state.schedulePrefill) : action.payload };
 default: return state;
 }
 },
 {
 selectedService: null, textTone: 'professional', imagePrompt: '', imagePlatform: 'INSTAGRAM', imageStyle: 'Fotorrealismo Clínico', imageLighting: 'Luz Natural', imageAspectRatio: 'SQUARE', videoPrompt: '', videoPlatform: 'INSTAGRAM', videoTone: 'educational', videoAspectRatio: 'LANDSCAPE', videoBaseImageUrl: '', isGeneratingText: false, isGeneratingImage: false, isGeneratingVideo: false, generatedText: '', generatedImageUrl: '', generatedImageCaption: '', generatedVideoUrl: '', videoStatus: '', activeTab: 'text', copied: false, scheduleModalOpen: false, schedulePrefill: undefined
 }
 );

 const setSelectedService = (val: any) => dispatch({ type: 'SET_SELECTEDSERVICE', payload: val });
 const setTextTone = (val: any) => dispatch({ type: 'SET_TEXTTONE', payload: val });
 const setImagePrompt = (val: any) => dispatch({ type: 'SET_IMAGEPROMPT', payload: val });
 const setImagePlatform = (val: any) => dispatch({ type: 'SET_IMAGEPLATFORM', payload: val });
 const setImageStyle = (val: any) => dispatch({ type: 'SET_IMAGESTYLE', payload: val });
 const setImageLighting = (val: any) => dispatch({ type: 'SET_IMAGELIGHTING', payload: val });
 const setImageAspectRatio = (val: any) => dispatch({ type: 'SET_IMAGEASPECTRATIO', payload: val });
 const setVideoPrompt = (val: any) => dispatch({ type: 'SET_VIDEOPROMPT', payload: val });
 const setVideoPlatform = (val: any) => dispatch({ type: 'SET_VIDEOPLATFORM', payload: val });
 const setVideoTone = (val: any) => dispatch({ type: 'SET_VIDEOTONE', payload: val });
 const setVideoAspectRatio = (val: any) => dispatch({ type: 'SET_VIDEOASPECTRATIO', payload: val });
 const setVideoBaseImageUrl = (val: any) => dispatch({ type: 'SET_VIDEOBASEIMAGEURL', payload: val });
 const setIsGeneratingText = (val: any) => dispatch({ type: 'SET_ISGENERATINGTEXT', payload: val });
 const setIsGeneratingImage = (val: any) => dispatch({ type: 'SET_ISGENERATINGIMAGE', payload: val });
 const setIsGeneratingVideo = (val: any) => dispatch({ type: 'SET_ISGENERATINGVIDEO', payload: val });
 const setGeneratedText = (val: any) => dispatch({ type: 'SET_GENERATEDTEXT', payload: val });
 const setGeneratedImageUrl = (val: any) => dispatch({ type: 'SET_GENERATEDIMAGEURL', payload: val });
 const setGeneratedImageCaption = (val: any) => dispatch({ type: 'SET_GENERATEDIMAGECAPTION', payload: val });
 const setGeneratedVideoUrl = (val: any) => dispatch({ type: 'SET_GENERATEDVIDEOURL', payload: val });
 const setVideoStatus = (val: any) => dispatch({ type: 'SET_VIDEOSTATUS', payload: val });
 const setActiveTab = (val: any) => dispatch({ type: 'SET_ACTIVETAB', payload: val });
 const setCopied = (val: any) => dispatch({ type: 'SET_COPIED', payload: val });
 const setScheduleModalOpen = (val: any) => dispatch({ type: 'SET_SCHEDULEMODALOPEN', payload: val });
 const setSchedulePrefill = (val: any) => dispatch({ type: 'SET_SCHEDULEPREFILL', payload: val });





























 useEffect(() => {
 if (sseVideoUrl) {
 setGeneratedVideoUrl(sseVideoUrl);
 setVideoStatus('');
 setIsGeneratingVideo(false);
 clearSseVideoUrl();
 toast.success(t('video_ready', { defaultValue: 'RENDERIZADO DE VIDEO COMPLETADO.' }));
 }
 }, [sseVideoUrl, clearSseVideoUrl, t]);

 const tones: { value: AiTone; label: string; emoji: string }[] = [
 { value: 'professional', label: t('tone_professional', { defaultValue: 'PROFESIONAL' }), emoji: '👔' },
 { value: 'friendly', label: t('tone_friendly', { defaultValue: 'AMIGABLE' }), emoji: '😊' },
 { value: 'educational', label: t('tone_educational', { defaultValue: 'EDUCATIVO' }), emoji: '📚' },
 { value: 'promotional', label: t('tone_promotional', { defaultValue: 'COMERCIAL' }), emoji: '🔥' },
 ];

 const handleGenerateText = async () => {
 if (!selectedService) return toast.warn(t('warn_select_service', { defaultValue: 'REQUIERE SELECCIÓN DE SERVICIO.' }));
 setIsGeneratingText(true);
 setGeneratedText('');
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
 setGeneratedText(response.generatedText);
 toast.success(t('generate_text_success', { defaultValue: 'TEXTO GENERADO.' }));
 onGenerationSuccess();
 }
 } catch {
 // handleError en el hook
 } finally {
 setIsGeneratingText(false);
 }
 };

 const handleGenerateImage = async () => {
 if (!selectedService) return toast.warn(t('warn_select_service', { defaultValue: 'REQUIERE SELECCIÓN DE SERVICIO.' }));
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
 if (response?.imageUrl) setGeneratedImageUrl(response.imageUrl);
 if (response?.generatedText) setGeneratedImageCaption(response.generatedText);
 toast.success(t('generate_success', { defaultValue: 'IMAGEN GENERADA.' }));
 setImagePrompt('');
 onGenerationSuccess();
 } catch {
 // silencioso
 } finally {
 setIsGeneratingImage(false);
 }
 };

 const handleGenerateVideo = async () => {
 if (!videoPrompt.trim()) return toast.warn(t('warn_empty_prompt', { defaultValue: 'REQUIERE PROMPT DE ENTRADA.' }));
 setIsGeneratingVideo(true);
 setVideoStatus('');
 try {
 const response = await generateVideoApi({
 topic: videoPrompt,
 tone: videoTone,
 targetAudience: 'Pacientes buscando servicios de salud y bienestar',
 platform: videoPlatform,
 imageUrl: videoBaseImageUrl || undefined,
 aspectRatio: videoAspectRatio,
 });
 if (response?.message) setVideoStatus(response.message);
 toast.success(t('generate_video_success', { defaultValue: 'PROCESO DE RENDERIZADO INICIADO.' }));
 setVideoPrompt('');
 onGenerationSuccess();
 } catch {
 setIsGeneratingVideo(false);
 }
 };

 const handleCopyText = async (text: string) => {
 try {
 await navigator.clipboard.writeText(text);
 setCopied(true);
 toast.success(t('copied_to_clipboard', { defaultValue: 'COPIADO AL PORTAPAPELES.' }));
 setTimeout(() => setCopied(false), 2000);
 } catch { }
 };

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
 toast.success(t('saved_to_gallery', { defaultValue: 'GUARDADO EN REPOSITORIO LOCAL.' }));
 onGenerationSuccess();
 } catch { }
 };

 return (
 <>
 <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-none transition-colors">

 {/* HEADER ARQUITECTÓNICO */}
 <div className="flex items-start md:items-center justify-between p-6 md:p-8 border-b border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
 <Sparkles className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
 Motor de Inteligencia Artificial
 </p>
 <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
 {t('ai_studio_title', { defaultValue: 'ESTUDIO GENERATIVO' })}
 </h2>
 </div>
 </div>
 </div>

 <div className="flex flex-col">

 {/* ── PASO 1: Selector de servicio ─────────────────────────────── */}
 <div className="border-b border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex flex-col">
 <div className="p-6 border-b border-black/10 dark:border-white/10">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
 <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20 text-black dark:text-white">1</span>
 {t('step_select_service', { defaultValue: 'SELECCIÓN DE CONCEPTO BASE' })}
 </label>
 </div>

 {catalogItems.length === 0 ? (
 <div className="p-12 text-center bg-white dark:bg-[#0a0a0a] border-b border-black/10 dark:border-white/10">
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 {t('no_services', { defaultValue: 'NO HAY ELEMENTOS EN EL CATÁLOGO.' })}
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 bg-white dark:bg-[#0a0a0a] max-h-[300px] overflow-y-auto custom-scrollbar border-b border-black/10 dark:border-white/10">
 {catalogItems.map((item) => {
 const isSelected = selectedService?.id === item.id && selectedService?.itemType === item.itemType;
 return (
 <button
 key={`${item.itemType}-${item.id}`}
 type="button"
 onClick={() => setSelectedService(item)}
 className={cn(
 "flex items-start gap-4 p-5 border-r border-b border-black/10 dark:border-white/10 text-left transition-colors relative group rounded-none",
 isSelected 
 ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" 
 : "bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111]"
 )}
 >
 <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] shrink-0 overflow-hidden">
 <SafeImage
 src={item.imageUrl || ''}
 alt={item.name}
 className="w-full h-full object-cover"
 fallback={<div className="w-full h-full flex items-center justify-center"><Tag className={cn("w-4 h-4", isSelected ? "text-white dark:text-black" : "text-gray-400")} strokeWidth={1.5} /></div>}
 />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-xs font-semibold uppercase tracking-widest truncate mb-1">
 {item.name}
 </p>
 <div className="flex flex-wrap items-center gap-2">
 {item.category && (
 <span className={cn(
 "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 border",
 isSelected ? "border-white/30 dark:border-black/30 bg-transparent" : "border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]"
 )}>
 {item.category}
 </span>
 )}
 {item.price != null && (
 <span className={cn("text-[9px] font-bold uppercase tracking-widest", isSelected ? "text-white dark:text-black" : "text-gray-500")}>
 ${item.price.toLocaleString()}
 </span>
 )}
 </div>
 </div>
 {isSelected && (
 <div className="absolute right-4 top-1/2 -translate-y-1/2">
 <Check className="w-4 h-4 text-white dark:text-black" strokeWidth={2} />
 </div>
 )}
 </button>
 );
 })}
 </div>
 )}
 </div>

 {/* ── PASO 2: Tabs de contenido ─────────────────────────────────── */}
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
 <div className="p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
 <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20 text-black dark:text-white">2</span>
 {t('step_choose_content', { defaultValue: 'CONFIGURACIÓN DE SALIDA' })}
 </label>
 </div>

 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
 
 <TabsList className="flex flex-row w-full bg-gray-50 dark:bg-[#050505] border-b border-black/20 dark:border-white/20 p-0 h-auto rounded-none">
 <TabsTrigger value="text" className="flex-1 rounded-none border-0 border-r border-black/20 dark:border-white/20 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 py-4 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
 <FileText className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('tab_text', { defaultValue: 'COPYWRITING' })}
 </TabsTrigger>
 <TabsTrigger value="image" className="flex-1 rounded-none border-0 border-r border-black/20 dark:border-white/20 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 py-4 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
 <ImageIcon className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('tab_image', { defaultValue: 'IMAGEN' })}
 </TabsTrigger>
 <TabsTrigger value="video" className="flex-1 rounded-none border-0 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 py-4 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
 <Video className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('tab_video', { defaultValue: 'VIDEO' })}
 </TabsTrigger>
 </TabsList>

 {/* ────────── TAB: TEXTO ────────── */}
 <TabsContent value="text" className="m-0 p-0 border-0 outline-none flex flex-col bg-white dark:bg-[#0a0a0a]">
 
 {/* Configuración */}
 <div className="flex flex-col md:flex-row border-b border-black/10 dark:border-white/10">
 <div className="p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">
 {t('tone_label', { defaultValue: 'TONO COMUNICACIONAL' })}
 </label>
 <div className="grid grid-cols-2 gap-0 border border-black/20 dark:border-white/20">
 {tones.map((tone) => (
 <button
 key={tone.value}
 onClick={() => setTextTone(tone.value)}
 className={cn(
 "h-12 border-b border-r border-black/10 dark:border-white/10 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded-none",
 textTone === tone.value 
 ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" 
 : "bg-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111]"
 )}
 >
 <span>{tone.emoji}</span> {tone.label}
 </button>
 ))}
 </div>
 </div>
 
 <div className="p-6 md:p-8 flex-1 flex flex-col justify-end gap-4 bg-gray-50 dark:bg-[#050505]">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
 <FileText className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">PROCESO</p>
 <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white">GENERACIÓN LINGÜÍSTICA</p>
 </div>
 </div>
 <button
 onClick={handleGenerateText}
 disabled={isGeneratingText || !selectedService}
 className="w-full h-12 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none disabled:opacity-50"
 >
 {isGeneratingText ? <><QhSpinner size="sm" className="text-current" /> PROCESANDO...</> : <><Sparkles className="w-4 h-4" strokeWidth={1.5} /> {t('generate_text_btn', { defaultValue: 'EJECUTAR GENERACIÓN' })}</>}
 </button>
 </div>
 </div>

 {/* Resultado Texto */}
 {generatedText && (
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
 <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 RESULTADO GENERADO
 </span>
 <div className="flex items-center gap-4">
 <button onClick={() => handleCopyText(generatedText)} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors">
 {copied ? <Check className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
 {copied ? 'COPIADO' : 'COPIAR'}
 </button>
 <button onClick={handleGenerateText} disabled={isGeneratingText} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors">
 <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} /> REGENERAR
 </button>
 </div>
 </div>
 
 <Textarea
 value={generatedText}
 onChange={(e) => setGeneratedText(e.target.value)}
 className="w-full min-h-[200px] p-6 bg-transparent border-0 text-xs font-semibold text-black dark:text-white focus:outline-none focus:ring-0 resize-y uppercase rounded-none"
 />

 <div className="p-6 border-t border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex flex-col sm:flex-row gap-4">
 <button
 onClick={() => handleSaveDraft('text')}
 className="flex-1 h-12 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-white dark:hover:bg-[#111] transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none"
 >
 <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
 {t('save_to_gallery', { defaultValue: 'ALMACENAR EN REPOSITORIO' })}
 </button>
 <button
 onClick={handleCopyAndScheduleText}
 className="flex-1 h-12 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none"
 >
 <CalendarPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
 {t('copy_and_use', { defaultValue: 'PROGRAMAR DISTRIBUCIÓN' })}
 </button>
 </div>
 </div>
 )}
 </TabsContent>

 {/* ────────── TAB: IMAGEN ────────── */}
 <TabsContent value="image" className="m-0 p-0 border-0 outline-none flex flex-col bg-white dark:bg-[#0a0a0a]">
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10">
 
 {/* Controles Imagen */}
 <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col gap-6">
 <div className="grid grid-cols-2 gap-0 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
 <div className="p-4 border-r border-b border-black/10 dark:border-white/10">
 <label className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">FORMATO</label>
 <Select value={imageAspectRatio} onValueChange={(val: any) => setImageAspectRatio(val)}>
 <SelectTrigger className="h-8 border-0 bg-transparent text-[9px] font-bold uppercase tracking-widest text-black dark:text-white focus:ring-0 p-0 rounded-none">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none">
 <SelectItem value="SQUARE" className="text-[9px] font-bold uppercase tracking-widest rounded-none">1:1 CUADRADO</SelectItem>
 <SelectItem value="PORTRAIT" className="text-[9px] font-bold uppercase tracking-widest rounded-none">9:16 VERTICAL</SelectItem>
 <SelectItem value="LANDSCAPE" className="text-[9px] font-bold uppercase tracking-widest rounded-none">16:9 HORIZONTAL</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="p-4 border-b border-black/10 dark:border-white/10">
 <label className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">PLATAFORMA</label>
 <Select value={imagePlatform} onValueChange={(val: any) => setImagePlatform(val)}>
 <SelectTrigger className="h-8 border-0 bg-transparent text-[9px] font-bold uppercase tracking-widest text-black dark:text-white focus:ring-0 p-0 rounded-none">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none">
 <SelectItem value="FACEBOOK" className="text-[9px] font-bold uppercase tracking-widest rounded-none">FACEBOOK</SelectItem>
 <SelectItem value="INSTAGRAM" className="text-[9px] font-bold uppercase tracking-widest rounded-none">INSTAGRAM</SelectItem>
 <SelectItem value="LINKEDIN" className="text-[9px] font-bold uppercase tracking-widest rounded-none">LINKEDIN</SelectItem>
 <SelectItem value="GOOGLE_BUSINESS" className="text-[9px] font-bold uppercase tracking-widest rounded-none">GOOGLE BUSINESS</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="p-4 border-r border-black/10 dark:border-white/10">
 <label className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">ESTILO VISUAL</label>
 <Select value={imageStyle} onValueChange={setImageStyle}>
 <SelectTrigger className="h-8 border-0 bg-transparent text-[9px] font-bold uppercase tracking-widest text-black dark:text-white focus:ring-0 p-0 rounded-none">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none">
 <SelectItem value="Fotorrealismo Clínico" className="text-[9px] font-bold uppercase tracking-widest rounded-none">FOTORREALISMO</SelectItem>
 <SelectItem value="Estilo de Vida / Wellness" className="text-[9px] font-bold uppercase tracking-widest rounded-none">ESTILO DE VIDA</SelectItem>
 <SelectItem value="Ilustración Digital" className="text-[9px] font-bold uppercase tracking-widest rounded-none">ILUSTRACIÓN</SelectItem>
 <SelectItem value="Render 3D Suave" className="text-[9px] font-bold uppercase tracking-widest rounded-none">RENDER 3D</SelectItem>
 <SelectItem value="Minimalista" className="text-[9px] font-bold uppercase tracking-widest rounded-none">MINIMALISTA</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="p-4">
 <label className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">ILUMINACIÓN</label>
 <Select value={imageLighting} onValueChange={setImageLighting}>
 <SelectTrigger className="h-8 border-0 bg-transparent text-[9px] font-bold uppercase tracking-widest text-black dark:text-white focus:ring-0 p-0 rounded-none">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none">
 <SelectItem value="Luz Natural" className="text-[9px] font-bold uppercase tracking-widest rounded-none">LUZ NATURAL</SelectItem>
 <SelectItem value="Luz de Estudio" className="text-[9px] font-bold uppercase tracking-widest rounded-none">LUZ DE ESTUDIO</SelectItem>
 <SelectItem value="Cinemática" className="text-[9px] font-bold uppercase tracking-widest rounded-none">CINEMÁTICA</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="flex flex-col">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3">
 {t('image_prompt_label', { defaultValue: 'PROMPT ADICIONAL (OPCIONAL)' })}
 </label>
 <Textarea
 value={imagePrompt}
 onChange={(e) => setImagePrompt(e.target.value)}
 disabled={isGeneratingImage}
 placeholder="INSTRUCCIONES ESPECÍFICAS..."
 className="w-full p-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-400 min-h-[80px] resize-none"
 />
 </div>
 </div>

 {/* Acción Imagen */}
 <div className="p-6 md:p-8 flex flex-col justify-end gap-4 bg-gray-50 dark:bg-[#050505]">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
 <ImageIcon className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">PROCESO</p>
 <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white">RENDERIZADO VISUAL</p>
 </div>
 </div>
 <button
 onClick={handleGenerateImage}
 disabled={isGeneratingImage || !selectedService}
 className="w-full h-12 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none disabled:opacity-50"
 >
 {isGeneratingImage ? <><QhSpinner size="sm" className="text-current" /> SINTETIZANDO...</> : <><Sparkles className="w-4 h-4" strokeWidth={1.5} /> {t('generate_image_btn', { defaultValue: 'EJECUTAR RENDERIZADO' })}</>}
 </button>
 </div>

 </div>

 {/* Resultado Imagen */}
 {generatedImageUrl && (
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
 <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 ACTIVO GENERADO
 </span>
 <button onClick={handleGenerateImage} disabled={isGeneratingImage} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors">
 <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} /> REGENERAR
 </button>
 </div>
 
 <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
 <div className="w-full max-w-sm border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] p-2">
 <img src={generatedImageUrl} alt="Generated" className="w-full h-auto" referrerPolicy="no-referrer" />
 </div>
 
 {generatedImageCaption && (
 <div className="flex-1 flex flex-col">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3">
 {t('result_caption', { defaultValue: 'COPY SUGERIDO' })}
 </label>
 <Textarea
 value={generatedImageCaption}
 onChange={(e) => setGeneratedImageCaption(e.target.value)}
 className="flex-1 w-full p-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none min-h-[150px] resize-none"
 />
 <button onClick={() => handleCopyText(generatedImageCaption)} className="mt-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors">
 {copied ? <Check className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
 {copied ? 'COPIADO' : 'COPIAR TEXTO'}
 </button>
 </div>
 )}
 </div>

 <div className="p-6 border-t border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-black/20 dark:border-white/20">
 <a
 href={generatedImageUrl}
 target="_blank"
 rel="noopener noreferrer"
 download
 className="h-12 border-r border-b lg:border-b-0 border-black/20 dark:border-white/20 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-white dark:hover:bg-[#111] transition-colors"
 >
 <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> DESCARGAR
 </a>
 <button
 onClick={() => handleSaveDraft('image')}
 className="h-12 border-r border-b lg:border-b-0 border-black/20 dark:border-white/20 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-white dark:hover:bg-[#111] transition-colors"
 >
 <Save className="w-3.5 h-3.5" strokeWidth={1.5} /> ALMACENAR
 </button>
 <button
 onClick={handleScheduleImage}
 className="h-12 border-r border-black/20 dark:border-white/20 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white bg-black dark:text-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
 >
 <CalendarPlus className="w-3.5 h-3.5" strokeWidth={1.5} /> PROGRAMAR
 </button>
 <button
 onClick={() => {
 const itemTypeLabel = selectedService?.itemType?.toLowerCase() || 'servicio';
 setVideoBaseImageUrl(generatedImageUrl);
 setVideoPrompt(`Crear un video promocional animado basado en la imagen generada del ${itemTypeLabel} "${selectedService?.name ?? ''}". Animación suave y profesional.`);
 setActiveTab('video');
 }}
 className="h-12 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-white dark:hover:bg-[#111] transition-colors"
 >
 <Video className="w-3.5 h-3.5" strokeWidth={1.5} /> ANIMAR
 </button>
 </div>
 </div>
 )}
 </TabsContent>

 {/* ────────── TAB: VIDEO ────────── */}
 <TabsContent value="video" className="m-0 p-0 border-0 outline-none flex flex-col bg-white dark:bg-[#0a0a0a]">
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10">
 
 {/* Controles Video */}
 <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col gap-6">
 
 {videoBaseImageUrl && (
 <div className="flex items-center gap-4 p-4 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
 <img src={videoBaseImageUrl} alt="Base" className="w-12 h-12 object-cover border border-black/20 dark:border-white/20 bg-white" referrerPolicy="no-referrer" />
 <div className="flex-1 min-w-0">
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">IMAGEN FUENTE ACTIVA</p>
 <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white truncate">CONVERSIÓN I2V</p>
 </div>
 <button onClick={() => setVideoBaseImageUrl('')} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
 <Trash2 className="w-4 h-4" strokeWidth={1.5} />
 </button>
 </div>
 )}

 <div className="grid grid-cols-1 gap-0 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
 <div className="p-4 border-b border-black/10 dark:border-white/10">
 <label className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">PLATAFORMA</label>
 <div className="flex gap-0 border border-black/20 dark:border-white/20">
 {(['INSTAGRAM', 'FACEBOOK', 'TIKTOK'] as SocialPlatform[]).map((p) => (
 <button key={p} type="button" onClick={() => setVideoPlatform(p)}
 className={cn(
 "flex-1 h-8 text-[8px] font-bold uppercase tracking-widest border-r border-black/20 dark:border-white/20 transition-colors last:border-0",
 videoPlatform === p ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent text-gray-500 hover:bg-white dark:hover:bg-[#111]"
 )}
 >{p}</button>
 ))}
 </div>
 </div>
 <div className="p-4 border-b border-black/10 dark:border-white/10">
 <label className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">TONO</label>
 <div className="flex gap-0 border border-black/20 dark:border-white/20">
 {tones.map((tone) => (
 <button key={tone.value} type="button" onClick={() => setVideoTone(tone.value)}
 className={cn(
 "flex-1 h-8 text-[8px] font-bold uppercase tracking-widest border-r border-black/20 dark:border-white/20 transition-colors last:border-0",
 videoTone === tone.value ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent text-gray-500 hover:bg-white dark:hover:bg-[#111]"
 )}
 >{tone.emoji}</button>
 ))}
 </div>
 </div>
 <div className="p-4">
 <label className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">FORMATO (ASPECT RATIO)</label>
 <div className="flex gap-0 border border-black/20 dark:border-white/20">
 {(['LANDSCAPE', 'PORTRAIT', 'SQUARE'] as const).map((a) => (
 <button key={a} type="button" onClick={() => setVideoAspectRatio(a)}
 className={cn(
 "flex-1 h-8 text-[8px] font-bold uppercase tracking-widest border-r border-black/20 dark:border-white/20 transition-colors last:border-0",
 videoAspectRatio === a ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent text-gray-500 hover:bg-white dark:hover:bg-[#111]"
 )}
 >{{ LANDSCAPE: '16:9', PORTRAIT: '9:16', SQUARE: '1:1' }[a]}</button>
 ))}
 </div>
 </div>
 </div>

 <div className="flex flex-col">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3">
 {t('video_prompt_label', { defaultValue: 'PROMPT DE ANIMACIÓN' })}
 </label>
 <Textarea
 value={videoPrompt}
 onChange={(e) => setVideoPrompt(e.target.value)}
 disabled={isGeneratingVideo}
 placeholder="INSTRUCCIONES DE MOVIMIENTO..."
 className="w-full p-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-400 min-h-[80px] resize-none"
 />
 </div>
 </div>

 {/* Acción Video */}
 <div className="p-6 md:p-8 flex flex-col justify-end gap-4 bg-gray-50 dark:bg-[#050505]">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
 <Video className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">PROCESO</p>
 <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white">SÍNTESIS DE MOVIMIENTO</p>
 </div>
 </div>
 <button
 onClick={handleGenerateVideo}
 disabled={isGeneratingVideo || !videoPrompt.trim()}
 className="w-full h-12 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none disabled:opacity-50"
 >
 {isGeneratingVideo ? <><QhSpinner size="sm" className="text-current" /> RENDERIZANDO...</> : <><Sparkles className="w-4 h-4" strokeWidth={1.5} /> {t('generate_video_btn', { defaultValue: 'INICIAR RENDER' })}</>}
 </button>
 
 {videoStatus && !generatedVideoUrl && (
 <div className="mt-4 p-4 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-start gap-3">
 <Loader2 className="w-4 h-4 text-black dark:text-white animate-spin shrink-0 mt-0.5" strokeWidth={1.5} />
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">{t('video_in_progress', { defaultValue: 'PROCESO EN SEGUNDO PLANO' })}</p>
 <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white leading-relaxed">{videoStatus}</p>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Resultado Video */}
 {generatedVideoUrl && (
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
 <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 VIDEO COMPLETADO
 </span>
 </div>
 
 <div className="p-6 md:p-8 flex justify-center bg-black">
 <video src={generatedVideoUrl} controls autoPlay className="max-w-full max-h-[400px] border border-white/20" />
 </div>

 <div className="p-6 border-t border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-black/20 dark:border-white/20">
 <button
 onClick={() => {
 const a = document.createElement('a');
 a.href = generatedVideoUrl;
 a.download = 'quhealthy-video.mp4';
 a.target = '_blank';
 a.click();
 }}
 className="h-12 border-r border-b lg:border-b-0 border-black/20 dark:border-white/20 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-white dark:hover:bg-[#111] transition-colors"
 >
 <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> DESCARGAR
 </button>
 <button
 onClick={() => handleSaveDraft('video')}
 className="h-12 border-r border-b lg:border-b-0 border-black/20 dark:border-white/20 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-white dark:hover:bg-[#111] transition-colors"
 >
 <Save className="w-3.5 h-3.5" strokeWidth={1.5} /> ALMACENAR
 </button>
 <button
 onClick={handleScheduleVideo}
 className="h-12 border-r border-b sm:border-b-0 border-black/20 dark:border-white/20 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white bg-black dark:text-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
 >
 <CalendarPlus className="w-3.5 h-3.5" strokeWidth={1.5} /> PROGRAMAR
 </button>
 <button
 onClick={() => setGeneratedVideoUrl('')}
 className="h-12 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
 >
 <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> DESCARTAR
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