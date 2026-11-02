"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useReducer } from "react";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  FileText,
  Tag,
  Copy,
  Check,
  RotateCcw,
  Download,
  Trash2,
  CalendarPlus,
  Save,
  Wand2,
  Type,
  Upload,
  X,
  Volume2,
} from "lucide-react";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useSocial } from "@/hooks/useSocial";
import { SocialPlatform, AiTone, VideoAudioStyle } from "@/types/social";
import ScheduleModal from "@/components/dashboard/marketing/ScheduleModal";
import { useSessionStore } from "@/stores/SessionStore";
import { QhSpinner } from "@/components/ui/QhSpinner";

// ── COMPONENTE DE IMAGEN SEGURO ──────────────────────────────────────────────
const SafeImage = ({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <>{fallback}</>;
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

// ── TIPOS Y ESTADO DE REDUCER ───────────────────────────────────────────────

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
  imageResolution: "1K" | "2K" | "4K";
  imageOverlayText: string;
  imageBadgeText: string;
  imageReferenceBase64: string;
  imageReferenceMimeType: string;
  imageReferencePreview: string;
  imageSessionId: string;
  imageRefinementPrompt: string;
  isRefiningImage: boolean;
  videoPrompt: string;
  videoPlatform: SocialPlatform;
  videoTone: AiTone;
  videoAspectRatio: "LANDSCAPE" | "PORTRAIT" | "SQUARE";
  videoBaseImageUrl: string;
  videoResolution: "720p" | "1080p" | "4k";
  videoAudioStyle: VideoAudioStyle;
  videoIncludeAudio: boolean;
  videoMode: "STANDARD" | "CLINICAL_EVOLUTION";
  clinicalSpecialty: string;
  clinicalTopic: string;
  treatmentDuration: string;
  doctorBranding: string;
  watermarkText: string;
  beforeLabel: string;
  afterLabel: string;
  initialImageBase64: string;
  initialImagePreview: string;
  initialImageMimeType: string;
  finalImageBase64: string;
  finalImagePreview: string;
  finalImageMimeType: string;
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
  | { type: "SET_SELECTEDSERVICE"; payload: any }
  | { type: "SET_TEXTTONE"; payload: any }
  | { type: "SET_IMAGEPROMPT"; payload: any }
  | { type: "SET_IMAGEPLATFORM"; payload: any }
  | { type: "SET_IMAGESTYLE"; payload: any }
  | { type: "SET_IMAGELIGHTING"; payload: any }
  | { type: "SET_IMAGEASPECTRATIO"; payload: any }
  | { type: "SET_IMAGERESOLUTION"; payload: "1K" | "2K" | "4K" }
  | { type: "SET_IMAGEOVERLAYTEXT"; payload: string }
  | { type: "SET_IMAGEBADGETEXT"; payload: string }
  | {
      type: "SET_IMAGEREFERENCE";
      payload: { base64: string; mimeType: string; preview: string } | null;
    }
  | { type: "SET_IMAGESESSIONID"; payload: string }
  | { type: "SET_IMAGEREFINEMENTPROMPT"; payload: string }
  | { type: "SET_ISREFININGIMAGE"; payload: boolean }
  | { type: "SET_VIDEOPROMPT"; payload: any }
  | { type: "SET_VIDEOPLATFORM"; payload: any }
  | { type: "SET_VIDEOTONE"; payload: any }
  | { type: "SET_VIDEOASPECTRATIO"; payload: any }
  | { type: "SET_VIDEOBASEIMAGEURL"; payload: any }
  | { type: "SET_VIDEORESOLUTION"; payload: "720p" | "1080p" | "4k" }
  | { type: "SET_VIDEOAUDIOSTYLE"; payload: VideoAudioStyle }
  | { type: "SET_VIDEOINCLUDEAUDIO"; payload: boolean }
  | { type: "SET_VIDEOMODE"; payload: "STANDARD" | "CLINICAL_EVOLUTION" }
  | { type: "SET_CLINICALSPECIALTY"; payload: string }
  | { type: "SET_CLINICALTOPIC"; payload: string }
  | { type: "SET_TREATMENTDURATION"; payload: string }
  | { type: "SET_DOCTORBRANDING"; payload: string }
  | { type: "SET_WATERMARKTEXT"; payload: string }
  | { type: "SET_BEFORELABEL"; payload: string }
  | { type: "SET_AFTERLABEL"; payload: string }
  | {
      type: "SET_INITIALIMAGE";
      payload: { base64: string; mimeType: string; preview: string } | null;
    }
  | {
      type: "SET_FINALIMAGE";
      payload: { base64: string; mimeType: string; preview: string } | null;
    }
  | { type: "SET_ISGENERATINGTEXT"; payload: any }
  | { type: "SET_ISGENERATINGIMAGE"; payload: any }
  | { type: "SET_ISGENERATINGVIDEO"; payload: any }
  | { type: "SET_GENERATEDTEXT"; payload: any }
  | { type: "SET_GENERATEDIMAGEURL"; payload: any }
  | { type: "SET_GENERATEDIMAGECAPTION"; payload: any }
  | { type: "SET_GENERATEDVIDEOURL"; payload: any }
  | { type: "SET_VIDEOSTATUS"; payload: any }
  | { type: "SET_ACTIVETAB"; payload: any }
  | { type: "SET_COPIED"; payload: any }
  | { type: "SET_SCHEDULEMODALOPEN"; payload: any }
  | { type: "SET_SCHEDULEPREFILL"; payload: any };

function studioReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SELECTEDSERVICE":
      return { ...state, selectedService: action.payload };
    case "SET_TEXTTONE":
      return { ...state, textTone: action.payload };
    case "SET_IMAGEPROMPT":
      return { ...state, imagePrompt: action.payload };
    case "SET_IMAGEPLATFORM":
      return { ...state, imagePlatform: action.payload };
    case "SET_IMAGESTYLE":
      return { ...state, imageStyle: action.payload };
    case "SET_IMAGELIGHTING":
      return { ...state, imageLighting: action.payload };
    case "SET_IMAGEASPECTRATIO":
      return { ...state, imageAspectRatio: action.payload };
    case "SET_IMAGERESOLUTION":
      return { ...state, imageResolution: action.payload };
    case "SET_IMAGEOVERLAYTEXT":
      return { ...state, imageOverlayText: action.payload };
    case "SET_IMAGEBADGETEXT":
      return { ...state, imageBadgeText: action.payload };
    case "SET_IMAGEREFERENCE":
      if (!action.payload) {
        return {
          ...state,
          imageReferenceBase64: "",
          imageReferenceMimeType: "",
          imageReferencePreview: "",
        };
      }
      return {
        ...state,
        imageReferenceBase64: action.payload.base64,
        imageReferenceMimeType: action.payload.mimeType,
        imageReferencePreview: action.payload.preview,
      };
    case "SET_IMAGESESSIONID":
      return { ...state, imageSessionId: action.payload };
    case "SET_IMAGEREFINEMENTPROMPT":
      return { ...state, imageRefinementPrompt: action.payload };
    case "SET_ISREFININGIMAGE":
      return { ...state, isRefiningImage: action.payload };
    case "SET_VIDEOPROMPT":
      return { ...state, videoPrompt: action.payload };
    case "SET_VIDEOPLATFORM":
      return { ...state, videoPlatform: action.payload };
    case "SET_VIDEOTONE":
      return { ...state, videoTone: action.payload };
    case "SET_VIDEOASPECTRATIO":
      return { ...state, videoAspectRatio: action.payload };
    case "SET_VIDEOBASEIMAGEURL":
      return { ...state, videoBaseImageUrl: action.payload };
    case "SET_VIDEORESOLUTION":
      return { ...state, videoResolution: action.payload };
    case "SET_VIDEOAUDIOSTYLE":
      return { ...state, videoAudioStyle: action.payload };
    case "SET_VIDEOINCLUDEAUDIO":
      return { ...state, videoIncludeAudio: action.payload };
    case "SET_VIDEOMODE":
      return { ...state, videoMode: action.payload };
    case "SET_CLINICALSPECIALTY":
      return { ...state, clinicalSpecialty: action.payload };
    case "SET_CLINICALTOPIC":
      return { ...state, clinicalTopic: action.payload };
    case "SET_TREATMENTDURATION":
      return { ...state, treatmentDuration: action.payload };
    case "SET_DOCTORBRANDING":
      return { ...state, doctorBranding: action.payload };
    case "SET_WATERMARKTEXT":
      return { ...state, watermarkText: action.payload };
    case "SET_BEFORELABEL":
      return { ...state, beforeLabel: action.payload };
    case "SET_AFTERLABEL":
      return { ...state, afterLabel: action.payload };
    case "SET_INITIALIMAGE":
      if (!action.payload) {
        return {
          ...state,
          initialImageBase64: "",
          initialImagePreview: "",
          initialImageMimeType: "",
        };
      }
      return {
        ...state,
        initialImageBase64: action.payload.base64,
        initialImagePreview: action.payload.preview,
        initialImageMimeType: action.payload.mimeType,
      };
    case "SET_FINALIMAGE":
      if (!action.payload) {
        return {
          ...state,
          finalImageBase64: "",
          finalImagePreview: "",
          finalImageMimeType: "",
        };
      }
      return {
        ...state,
        finalImageBase64: action.payload.base64,
        finalImagePreview: action.payload.preview,
        finalImageMimeType: action.payload.mimeType,
      };
    case "SET_ISGENERATINGTEXT":
      return { ...state, isGeneratingText: action.payload };
    case "SET_ISGENERATINGIMAGE":
      return { ...state, isGeneratingImage: action.payload };
    case "SET_ISGENERATINGVIDEO":
      return { ...state, isGeneratingVideo: action.payload };
    case "SET_GENERATEDTEXT":
      return { ...state, generatedText: action.payload };
    case "SET_GENERATEDIMAGEURL":
      return { ...state, generatedImageUrl: action.payload };
    case "SET_GENERATEDIMAGECAPTION":
      return { ...state, generatedImageCaption: action.payload };
    case "SET_GENERATEDVIDEOURL":
      return { ...state, generatedVideoUrl: action.payload };
    case "SET_VIDEOSTATUS":
      return { ...state, videoStatus: action.payload };
    case "SET_ACTIVETAB":
      return { ...state, activeTab: action.payload };
    case "SET_COPIED":
      return { ...state, copied: action.payload };
    case "SET_SCHEDULEMODALOPEN":
      return { ...state, scheduleModalOpen: action.payload };
    case "SET_SCHEDULEPREFILL":
      return { ...state, schedulePrefill: action.payload };
    default:
      return state;
  }
}

// ── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────

export function AiStudioForm({
  catalogItems,
  onGenerationSuccess,
}: AiStudioFormProps) {
  const t = useTranslations("DashboardMarketing");
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
    textTone: "professional",
    imagePrompt: "",
    imagePlatform: "INSTAGRAM",
    imageStyle: "Fotorrealismo Clínico",
    imageLighting: "Luz Natural",
    imageAspectRatio: "SQUARE",
    imageResolution: "1K",
    imageOverlayText: "",
    imageBadgeText: "",
    imageReferenceBase64: "",
    imageReferenceMimeType: "",
    imageReferencePreview: "",
    imageSessionId: "",
    imageRefinementPrompt: "",
    isRefiningImage: false,
    videoPrompt: "",
    videoPlatform: "INSTAGRAM",
    videoTone: "educational",
    videoAspectRatio: "LANDSCAPE",
    videoBaseImageUrl: "",
    videoResolution: "720p",
    videoAudioStyle: "CALM",
    videoIncludeAudio: true,
    videoMode: "STANDARD",
    clinicalSpecialty: "ORTHODONTICS",
    clinicalTopic: "",
    treatmentDuration: "12 Meses",
    doctorBranding: "",
    watermarkText: "Caso Clínico Real • QuHealthy",
    beforeLabel: "Antes",
    afterLabel: "Después",
    initialImageBase64: "",
    initialImagePreview: "",
    initialImageMimeType: "",
    finalImageBase64: "",
    finalImagePreview: "",
    finalImageMimeType: "",
    isGeneratingText: false,
    isGeneratingImage: false,
    isGeneratingVideo: false,
    generatedText: "",
    generatedImageUrl: "",
    generatedImageCaption: "",
    generatedVideoUrl: "",
    videoStatus: "",
    activeTab: "text",
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
    imageResolution,
    imageOverlayText,
    imageBadgeText,
    imageReferenceBase64,
    imageReferenceMimeType,
    imageReferencePreview,
    imageSessionId,
    imageRefinementPrompt,
    isRefiningImage,
    videoPrompt,
    videoPlatform,
    videoTone,
    videoAspectRatio,
    videoBaseImageUrl,
    videoResolution,
    videoAudioStyle,
    videoIncludeAudio,
    videoMode,
    clinicalSpecialty,
    clinicalTopic,
    treatmentDuration,
    doctorBranding,
    watermarkText,
    beforeLabel,
    afterLabel,
    initialImageBase64,
    initialImagePreview,
    initialImageMimeType,
    finalImageBase64,
    finalImagePreview,
    finalImageMimeType,
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
      dispatch({ type: "SET_GENERATEDVIDEOURL", payload: sseVideoUrl });
      dispatch({ type: "SET_VIDEOSTATUS", payload: "" });
      dispatch({ type: "SET_ISGENERATINGVIDEO", payload: false });
      clearSseVideoUrl();
      toast.success(t("video_ready"));
    }
  }, [sseVideoUrl, clearSseVideoUrl, t]);

  const tones: { value: AiTone; label: string; emoji: string }[] = [
    { value: "professional", label: t("tone_professional"), emoji: "💼" },
    { value: "friendly", label: t("tone_friendly"), emoji: "😊" },
    { value: "educational", label: t("tone_educational"), emoji: "📚" },
    { value: "promotional", label: t("tone_promotional"), emoji: "🔥" },
  ];

  const audioOptions: { value: VideoAudioStyle; labelKey: string }[] = [
    { value: "CALM", labelKey: "video_audio_calm" },
    { value: "CLINICAL", labelKey: "video_audio_clinical" },
    { value: "UPBEAT", labelKey: "video_audio_upbeat" },
    { value: "NATURE", labelKey: "video_audio_nature" },
    { value: "NONE", labelKey: "video_audio_none" },
  ];

  const videoResolutions: { value: "720p" | "1080p" | "4k"; labelKey: string }[] = [
    { value: "720p", labelKey: "video_resolution_720p" },
    { value: "1080p", labelKey: "video_resolution_1080p" },
    { value: "4k", labelKey: "video_resolution_4k" },
  ];

  const handleGenerateText = async () => {
    if (!selectedService) return toast.warn(t("warn_select_service"));
    dispatch({ type: "SET_ISGENERATINGTEXT", payload: true });
    dispatch({ type: "SET_GENERATEDTEXT", payload: "" });
    try {
      const itemTypeLabel =
        selectedService.itemType?.toLowerCase() || "servicio";
      const response = await generateTextApi({
        topic: `Crear un copy publicitario para redes sociales sobre el ${itemTypeLabel} "${selectedService.name}". Descripción: ${selectedService.description || selectedService.name}. Categoría: ${selectedService.category || "General"}. Precio: $${selectedService.price || "No especificado"} MXN.`,
        tone: textTone,
        targetAudience:
          "Pacientes potenciales buscando servicios de salud y bienestar",
        platform: "FACEBOOK",
        businessName: user ? `${user.firstName} ${user.lastName}` : undefined,
      });
      if (response?.generatedText) {
        dispatch({
          type: "SET_GENERATEDTEXT",
          payload: response.generatedText,
        });
        toast.success(t("generate_text_success"));
        onGenerationSuccess();
      }
    } catch {
      // Manejado por el hook
    } finally {
      dispatch({ type: "SET_ISGENERATINGTEXT", payload: false });
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen de referencia no debe superar 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      dispatch({
        type: "SET_IMAGEREFERENCE",
        payload: {
          base64: result,
          mimeType: file.type,
          preview: result,
        },
      });
      toast.success("Logotipo / imagen de referencia cargada.");
    };
    reader.readAsDataURL(file);
  };

  const initialImageInputRef = React.useRef<HTMLInputElement | null>(null);
  const finalImageInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleInitialImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("La imagen inicial no debe superar 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      dispatch({
        type: "SET_INITIALIMAGE",
        payload: {
          base64: result,
          mimeType: file.type,
          preview: result,
        },
      });
      toast.success("Fotografía inicial ('Antes') cargada con éxito.");
    };
    reader.readAsDataURL(file);
  };

  const handleFinalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("La imagen de resultado no debe superar 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      dispatch({
        type: "SET_FINALIMAGE",
        payload: {
          base64: result,
          mimeType: file.type,
          preview: result,
        },
      });
      toast.success("Fotografía de resultado ('Después') cargada con éxito.");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateImage = async () => {
    if (!selectedService) return toast.warn(t("warn_select_service"));
    dispatch({ type: "SET_ISGENERATINGIMAGE", payload: true });
    dispatch({ type: "SET_GENERATEDIMAGEURL", payload: "" });
    dispatch({ type: "SET_GENERATEDIMAGECAPTION", payload: "" });
    dispatch({ type: "SET_IMAGESESSIONID", payload: "" });
    dispatch({ type: "SET_IMAGEREFINEMENTPROMPT", payload: "" });
    try {
      const itemTypeLabel =
        selectedService.itemType?.toLowerCase() || "servicio";
      const topic = imagePrompt.trim()
        ? `${imagePrompt}. ${selectedService.itemType}: ${selectedService.name}. ${selectedService.description || ""}`
        : `Crear una imagen promocional profesional para el ${itemTypeLabel} "${selectedService.name}". ${selectedService.description || ""}. Categoría: ${selectedService.category || "Salud"}.`;

      const response = await generateImageApi({
        topic,
        tone: "professional",
        targetAudience: "Pacientes potenciales de la clínica",
        platform: imagePlatform,
        imageStyle,
        lighting: imageLighting,
        aspectRatio: imageAspectRatio,
        resolution: imageResolution,
        overlayText: imageOverlayText.trim() || undefined,
        badgeText: imageBadgeText.trim() || undefined,
        referenceImageBase64: imageReferenceBase64 || undefined,
        referenceImageMimeType: imageReferenceMimeType || undefined,
      });
      if (response?.imageUrl)
        dispatch({
          type: "SET_GENERATEDIMAGEURL",
          payload: response.imageUrl,
        });
      if (response?.sessionId)
        dispatch({
          type: "SET_IMAGESESSIONID",
          payload: response.sessionId,
        });
      if (response?.generatedText)
        dispatch({
          type: "SET_GENERATEDIMAGECAPTION",
          payload: response.generatedText,
        });
      toast.success(t("generate_success"));
      dispatch({ type: "SET_IMAGEPROMPT", payload: "" });
      dispatch({ type: "SET_IMAGEREFINEMENTPROMPT", payload: "" });
      onGenerationSuccess();
    } catch {
      // Silencioso
    } finally {
      dispatch({ type: "SET_ISGENERATINGIMAGE", payload: false });
    }
  };

  const handleRefineImage = async () => {
    if (!imageRefinementPrompt.trim()) {
      return toast.warn(t("refinement_placeholder"));
    }
    if (!generatedImageUrl) {
      return toast.warn(t("warn_select_service"));
    }

    dispatch({ type: "SET_ISREFININGIMAGE", payload: true });
    try {
      const topic = imagePrompt.trim() || (selectedService?.name ? `Promoción para ${selectedService.name}` : "Creativo médico");
      const response = await generateImageApi({
        topic,
        refinementPrompt: imageRefinementPrompt.trim(),
        previousImageUrl: generatedImageUrl,
        sessionId: imageSessionId || undefined,
        isRefinement: true,
        tone: "professional",
        targetAudience: "Pacientes potenciales de la clínica",
        platform: imagePlatform,
        imageStyle,
        lighting: imageLighting,
        aspectRatio: imageAspectRatio,
        resolution: imageResolution,
        overlayText: imageOverlayText.trim() || undefined,
        badgeText: imageBadgeText.trim() || undefined,
        referenceImageBase64: imageReferenceBase64 || undefined,
        referenceImageMimeType: imageReferenceMimeType || undefined,
      });

      if (response?.imageUrl) {
        dispatch({
          type: "SET_GENERATEDIMAGEURL",
          payload: response.imageUrl,
        });
      }
      if (response?.sessionId) {
        dispatch({
          type: "SET_IMAGESESSIONID",
          payload: response.sessionId,
        });
      }
      if (response?.generatedText) {
        dispatch({
          type: "SET_GENERATEDIMAGECAPTION",
          payload: response.generatedText,
        });
      }
      dispatch({ type: "SET_IMAGEREFINEMENTPROMPT", payload: "" });
      toast.success(t("refinement_success"));
      onGenerationSuccess();
    } catch {
      // Silencioso
    } finally {
      dispatch({ type: "SET_ISREFININGIMAGE", payload: false });
    }
  };

  const handleGenerateVideo = async () => {
    if (videoMode === "CLINICAL_EVOLUTION") {
      if (!initialImageBase64 && !finalImageBase64) {
        return toast.warn("Por favor carga al menos la fotografía inicial ('Antes') o final ('Después') del caso clínico.");
      }
      const topicText =
        clinicalTopic.trim() ||
        videoPrompt.trim() ||
        (selectedService?.name ? `Evolución clínica de ${selectedService.name}` : "Evolución y transformación de caso clínico");

      dispatch({ type: "SET_ISGENERATINGVIDEO", payload: true });
      dispatch({ type: "SET_VIDEOSTATUS", payload: "" });
      try {
        const response = await generateVideoApi({
          topic: topicText,
          tone: videoTone,
          targetAudience: "Pacientes buscando tratamientos médicos de alta especialidad",
          platform: videoPlatform,
          aspectRatio: videoAspectRatio,
          resolution: videoResolution,
          includeAudio: videoIncludeAudio,
          audioStyle: videoAudioStyle,
          isClinicalEvolution: true,
          initialImageBase64: initialImageBase64 || undefined,
          initialImageMimeType: initialImageMimeType || undefined,
          finalImageBase64: finalImageBase64 || undefined,
          finalImageMimeType: finalImageMimeType || undefined,
          clinicalSpecialty,
          doctorBranding: doctorBranding.trim() || (user ? `${user.firstName} ${user.lastName}` : undefined),
          watermarkText: watermarkText.trim() || "Caso Clínico Real • QuHealthy",
          treatmentDuration: treatmentDuration.trim() || undefined,
          beforeLabel: beforeLabel.trim() || "Antes",
          afterLabel: afterLabel.trim() || "Después",
        });
        if (response?.message)
          dispatch({ type: "SET_VIDEOSTATUS", payload: response.message });
        toast.success("Generación de video de evolución clínica iniciada (Omni Flash)");
        onGenerationSuccess();
      } catch {
        dispatch({ type: "SET_ISGENERATINGVIDEO", payload: false });
      }
      return;
    }

    if (!videoPrompt.trim()) return toast.warn(t("warn_empty_prompt"));
    dispatch({ type: "SET_ISGENERATINGVIDEO", payload: true });
    dispatch({ type: "SET_VIDEOSTATUS", payload: "" });
    try {
      const response = await generateVideoApi({
        topic: videoPrompt,
        tone: videoTone,
        targetAudience: "Pacientes buscando servicios de salud y bienestar",
        platform: videoPlatform,
        imageUrl: videoBaseImageUrl || undefined,
        aspectRatio: videoAspectRatio,
        resolution: videoResolution,
        includeAudio: videoIncludeAudio,
        audioStyle: videoAudioStyle,
      });
      if (response?.message)
        dispatch({ type: "SET_VIDEOSTATUS", payload: response.message });
      toast.success(t("generate_video_success"));
      dispatch({ type: "SET_VIDEOPROMPT", payload: "" });
      onGenerationSuccess();
    } catch {
      dispatch({ type: "SET_ISGENERATINGVIDEO", payload: false });
    }
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      dispatch({ type: "SET_COPIED", payload: true });
      toast.success(t("copied_to_clipboard"));
      setTimeout(() => dispatch({ type: "SET_COPIED", payload: false }), 2000);
    } catch {
      /* noop */
    }
  };

  const handleCopyAndScheduleText = () => {
    dispatch({
      type: "SET_SCHEDULEPREFILL",
      payload: { content: generatedText, generatedByAi: true },
    });
    dispatch({ type: "SET_SCHEDULEMODALOPEN", payload: true });
  };

  const handleScheduleImage = () => {
    dispatch({
      type: "SET_SCHEDULEPREFILL",
      payload: {
        content: generatedImageCaption || "",
        mediaUrls: [generatedImageUrl],
        mediaType: "image",
        generatedByAi: true,
      },
    });
    dispatch({ type: "SET_SCHEDULEMODALOPEN", payload: true });
  };

  const handleScheduleVideo = () => {
    dispatch({
      type: "SET_SCHEDULEPREFILL",
      payload: {
        content:
          videoPrompt ||
          `Video generado con IA — ${selectedService?.name ?? ""}`,
        mediaUrls: [generatedVideoUrl],
        mediaType: "video",
        generatedByAi: true,
      },
    });
    dispatch({ type: "SET_SCHEDULEMODALOPEN", payload: true });
  };

  const handleSaveDraft = async (type: "text" | "image" | "video") => {
    let content = "";
    let mediaUrls: string[] = [];

    if (type === "text") {
      content = generatedText;
    } else if (type === "image") {
      content = generatedImageCaption || "Imagen generada con IA";
      mediaUrls = [generatedImageUrl];
    } else if (type === "video") {
      content =
        videoPrompt ||
        `Video generado con IA — ${selectedService?.name ?? ""}`;
      mediaUrls = [generatedVideoUrl];
    }

    try {
      await saveDraft({ content, mediaUrls, generatedByAi: true });
      toast.success(t("saved_to_gallery"));
      onGenerationSuccess();
    } catch {
      /* noop */
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-colors font-sans">
        {/* ── HEADER DE ESTUDIO ───────────────────────────────────────── */}
        <div className="flex items-center justify-between p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 shadow-xs text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Motor de Inteligencia Artificial
              </p>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("ai_studio_title")}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-6 p-6 bg-white dark:bg-[#0a0a0a]">
          {/* ── PASO 1: SELECTOR DE SERVICIO ─────────────────────────────── */}
          <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                1
              </span>
              <label className="text-xs font-bold text-gray-900 dark:text-white">
                {t("step_select_service")}
              </label>
            </div>

            {catalogItems.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0a0a0a] rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-400">
                  {t("no_services")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto custom-scrollbar p-1">
                {catalogItems.map((item) => {
                  const isSelected =
                    selectedService?.id === item.id &&
                    selectedService?.itemType === item.itemType;
                  return (
                    <button
                      key={`${item.itemType}-${item.id}`}
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "SET_SELECTEDSERVICE",
                          payload: item,
                        })
                      }
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border text-left transition-all shadow-2xs group relative cursor-pointer select-none",
                        isSelected
                          ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500/40 text-gray-900 dark:text-white"
                          : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 hover:border-emerald-500/30 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 shrink-0 overflow-hidden">
                        <SafeImage
                          src={item.imageUrl || ""}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          fallback={
                            <div className="w-full h-full flex items-center justify-center">
                              <Tag
                                className="w-4 h-4 text-gray-400"
                                strokeWidth={2}
                              />
                            </div>
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0 pr-4 space-y-0.5">
                        <p className="text-xs font-bold truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2">
                          {item.category && (
                            <span className="text-[10px] font-semibold text-gray-400 truncate">
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
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
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
          <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                2
              </span>
              <label className="text-xs font-bold text-gray-900 dark:text-white">
                {t("step_choose_content")}
              </label>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(val) =>
                dispatch({ type: "SET_ACTIVETAB", payload: val })
              }
              className="w-full flex flex-col"
            >
              <TabsList className="flex items-center bg-white dark:bg-[#0a0a0a] p-1 rounded-2xl shrink-0 h-auto w-full border border-gray-200 dark:border-gray-800 shadow-2xs">
                <TabsTrigger
                  value="text"
                  className="flex-1 h-9 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-gray-500 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{t("tab_text")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  className="flex-1 h-9 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-gray-500 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{t("tab_image")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="flex-1 h-9 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-gray-500 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{t("tab_video")}</span>
                </TabsTrigger>
              </TabsList>

              {/* ────────── TAB: TEXTO ────────── */}
              <TabsContent
                value="text"
                className="m-0 pt-4 outline-none flex flex-col space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("tone_label")}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-white dark:bg-[#0a0a0a] p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xs">
                      {tones.map((tone) => (
                        <button
                          key={tone.value}
                          type="button"
                          onClick={() =>
                            dispatch({
                              type: "SET_TEXTTONE",
                              payload: tone.value,
                            })
                          }
                          className={cn(
                            "h-9 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                            textTone === tone.value
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs"
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
                    className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
                  >
                    {isGeneratingText ? (
                      <>
                        <QhSpinner size="sm" className="text-white" />
                        <span>Sintetizando...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" strokeWidth={2} />
                        <span>{t("generate_text_btn")}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Resultado Texto */}
                {generatedText && (
                  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 space-y-3 mt-2 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        Resultado Generado
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleCopyText(generatedText)}
                          className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {copied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copied ? "Copiado" : "Copiar"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerateText}
                          disabled={isGeneratingText}
                          className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Regenerar</span>
                        </button>
                      </div>
                    </div>

                    <Textarea
                      value={generatedText}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_GENERATEDTEXT",
                          payload: e.target.value,
                        })
                      }
                      className="w-full min-h-[140px] p-3.5 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs leading-relaxed"
                    />

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSaveDraft("text")}
                        className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        <span>{t("save_to_gallery")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyAndScheduleText}
                        className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0"
                      >
                        <CalendarPlus className="w-4 h-4" strokeWidth={2} />
                        <span>{t("copy_and_use")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ────────── TAB: IMAGEN ────────── */}
              <TabsContent
                value="image"
                className="m-0 pt-4 outline-none flex flex-col space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Parámetros */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase text-gray-500">
                          FORMATO
                        </label>
                        <Select
                          value={imageAspectRatio}
                          onValueChange={(val: any) =>
                            dispatch({
                              type: "SET_IMAGEASPECTRATIO",
                              payload: val,
                            })
                          }
                        >
                          <SelectTrigger className="w-full h-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-2xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                            <SelectItem value="SQUARE" className="text-xs font-semibold">
                              1:1 Cuadrado
                            </SelectItem>
                            <SelectItem value="PORTRAIT" className="text-xs font-semibold">
                              9:16 Vertical
                            </SelectItem>
                            <SelectItem value="LANDSCAPE" className="text-xs font-semibold">
                              16:9 Horizontal
                            </SelectItem>
                            <SelectItem value="STANDARD_LANDSCAPE" className="text-xs font-semibold">
                              4:3 Clásico
                            </SelectItem>
                            <SelectItem value="STANDARD_PORTRAIT" className="text-xs font-semibold">
                              3:4 Póster
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase text-gray-500">
                          {t("resolution_label")}
                        </label>
                        <Select
                          value={imageResolution}
                          onValueChange={(val: any) =>
                            dispatch({
                              type: "SET_IMAGERESOLUTION",
                              payload: val,
                            })
                          }
                        >
                          <SelectTrigger className="w-full h-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-2xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                            <SelectItem value="1K" className="text-xs font-semibold">
                              1K (1024px)
                            </SelectItem>
                            <SelectItem value="2K" className="text-xs font-semibold">
                              2K (2048px HD)
                            </SelectItem>
                            <SelectItem value="4K" className="text-xs font-semibold">
                              4K (4096px Ultra HD)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase text-gray-500">
                          ESTILO VISUAL
                        </label>
                        <Select
                          value={imageStyle}
                          onValueChange={(val) =>
                            dispatch({ type: "SET_IMAGESTYLE", payload: val })
                          }
                        >
                          <SelectTrigger className="w-full h-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-2xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                            <SelectItem value="Fotorrealismo Clínico" className="text-xs font-semibold">
                              Fotorrealismo
                            </SelectItem>
                            <SelectItem value="Estilo de Vida / Wellness" className="text-xs font-semibold">
                              Estilo de Vida
                            </SelectItem>
                            <SelectItem value="Ilustración Digital" className="text-xs font-semibold">
                              Ilustración
                            </SelectItem>
                            <SelectItem value="Render 3D Suave" className="text-xs font-semibold">
                              Render 3D
                            </SelectItem>
                            <SelectItem value="Minimalista" className="text-xs font-semibold">
                              Minimalista
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase text-gray-500">
                          ILUMINACIÓN
                        </label>
                        <Select
                          value={imageLighting}
                          onValueChange={(val) =>
                            dispatch({
                              type: "SET_IMAGELIGHTING",
                              payload: val,
                            })
                          }
                        >
                          <SelectTrigger className="w-full h-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-2xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                            <SelectItem value="Luz Natural" className="text-xs font-semibold">
                              Luz Natural
                            </SelectItem>
                            <SelectItem value="Luz de Estudio" className="text-xs font-semibold">
                              Luz de Estudio
                            </SelectItem>
                            <SelectItem value="Cinemática" className="text-xs font-semibold">
                              Cinemática
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-gray-500">
                        PLATAFORMA
                      </label>
                      <Select
                        value={imagePlatform}
                        onValueChange={(val: any) =>
                          dispatch({
                            type: "SET_IMAGEPLATFORM",
                            payload: val,
                          })
                        }
                      >
                        <SelectTrigger className="w-full h-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-2xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                          <SelectItem value="FACEBOOK" className="text-xs font-semibold">
                            Facebook
                          </SelectItem>
                          <SelectItem value="INSTAGRAM" className="text-xs font-semibold">
                            Instagram
                          </SelectItem>
                          <SelectItem value="LINKEDIN" className="text-xs font-semibold">
                            LinkedIn
                          </SelectItem>
                          <SelectItem value="GOOGLE_BUSINESS" className="text-xs font-semibold">
                            Google Business
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Prompt & Acción */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                        {t("image_prompt_label")}
                      </label>
                      <Textarea
                        value={imagePrompt}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_IMAGEPROMPT",
                            payload: e.target.value,
                          })
                        }
                        disabled={isGeneratingImage}
                        placeholder="Describa detalles visuales específicos..."
                        className="w-full h-24 p-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-2xs resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !selectedService}
                      className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
                    >
                      {isGeneratingImage ? (
                        <>
                          <QhSpinner size="sm" className="text-white" />
                          <span>Sintetizando Imagen...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" strokeWidth={2} />
                          <span>{t("generate_image_btn")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ── SECCIÓN TIPOGRAFÍA Y MARCA NANO BANANA 2.1 ── */}
                <div className="p-4 bg-gray-50/80 dark:bg-[#080808] border border-gray-200 dark:border-gray-800 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("brand_section_title")}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Nano Banana 2.1
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-gray-500">
                        {t("overlay_text_label")}
                      </label>
                      <Input
                        value={imageOverlayText}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_IMAGEOVERLAYTEXT",
                            payload: e.target.value,
                          })
                        }
                        placeholder={t("overlay_text_placeholder")}
                        className="h-10 text-xs bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-gray-500">
                        {t("badge_text_label")}
                      </label>
                      <Input
                        value={imageBadgeText}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_IMAGEBADGETEXT",
                            payload: e.target.value,
                          })
                        }
                        placeholder={t("badge_text_placeholder")}
                        className="h-10 text-xs bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1.5">
                      {t("brand_reference_label")}
                    </label>
                    {imageReferencePreview ? (
                      <div className="flex items-center gap-3 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
                        <SafeImage
                          src={imageReferencePreview}
                          alt="Brand reference"
                          className="w-10 h-10 rounded-lg object-cover border border-emerald-300 dark:border-emerald-700 shrink-0"
                          fallback={null}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            Imagen de marca cargada
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {imageReferenceMimeType}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => dispatch({ type: "SET_IMAGEREFERENCE", payload: null })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title={t("brand_reference_remove")}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
                        <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{t("brand_reference_upload_btn")}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleReferenceUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Resultado Imagen */}
                {generatedImageUrl && (
                  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-xs mt-2">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          Activo Visual Generado
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          Nano Banana 2.1 • {imageResolution}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage}
                        className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Regenerar</span>
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-5 items-center">
                      <div className="w-full max-w-xs rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] shadow-2xs shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={generatedImageUrl}
                          alt="Generated"
                          className="w-full h-auto object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {generatedImageCaption && (
                        <div className="flex-1 w-full space-y-1.5">
                          <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                            {t("result_caption")}
                          </label>
                          <Textarea
                            value={generatedImageCaption}
                            onChange={(e) =>
                              dispatch({
                                type: "SET_GENERATEDIMAGECAPTION",
                                payload: e.target.value,
                              })
                            }
                            className="w-full h-32 p-3.5 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs resize-none"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <a
                        href={generatedImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        <span>Descargar</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleSaveDraft("image")}
                        className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        <span>Guardar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleScheduleImage}
                        className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer border-0"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Programar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const itemTypeLabel =
                            selectedService?.itemType?.toLowerCase() ||
                            "servicio";
                          dispatch({
                            type: "SET_VIDEOBASEIMAGEURL",
                            payload: generatedImageUrl,
                          });
                          dispatch({
                            type: "SET_VIDEOPROMPT",
                            payload: `Crear un video promocional animado basado en la imagen generada del ${itemTypeLabel} "${selectedService?.name ?? ""}". Animación suave y profesional.`,
                          });
                          dispatch({ type: "SET_ACTIVETAB", payload: "video" });
                        }}
                        className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        <span>Animar</span>
                      </button>
                    </div>

                    {/* ── SECCIÓN DE EDICIÓN CONVERSACIONAL ITERATIVA (NANO BANANA 2.1) ── */}
                    <div className="p-4 bg-gray-50/80 dark:bg-[#080808] border border-gray-200 dark:border-gray-800 rounded-2xl space-y-3 shadow-2xs mt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wand2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {t("refinement_title")}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {t("refinement_badge")}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={imageRefinementPrompt}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_IMAGEREFINEMENTPROMPT",
                              payload: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleRefineImage();
                            }
                          }}
                          disabled={isRefiningImage}
                          placeholder={t("refinement_placeholder")}
                          className="flex-1 h-10 text-xs bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={handleRefineImage}
                          disabled={isRefiningImage || !imageRefinementPrompt.trim()}
                          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0 shrink-0"
                        >
                          {isRefiningImage ? (
                            <>
                              <QhSpinner size="sm" className="text-white" />
                              <span>{t("refinement_in_progress")}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                              <span>{t("refinement_btn")}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ────────── TAB: VIDEO ────────── */}
              <TabsContent
                value="video"
                className="m-0 pt-4 outline-none flex flex-col space-y-4"
              >
                {/* ── SELECTOR DE MODO DE VIDEO ─────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 p-1 bg-gray-50 dark:bg-[#050505] rounded-2xl border border-gray-200 dark:border-gray-800 gap-1">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SET_VIDEOMODE", payload: "STANDARD" })}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                      videoMode === "STANDARD"
                        ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-2xs border border-gray-200 dark:border-gray-800"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video Cinemático</span>
                  </button>

                  <button
                    type="button"
                    data-testid="mode-clinical-evolution-btn"
                    onClick={() => dispatch({ type: "SET_VIDEOMODE", payload: "CLINICAL_EVOLUTION" })}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                      videoMode === "CLINICAL_EVOLUTION"
                        ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-2xs border border-gray-200 dark:border-gray-800"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Evolución y Casos Clínicos (Antes / Después)</span>
                  </button>
                </div>

                {/* ── MODO 2: CASOS CLÍNICOS (ANTES / DESPUÉS CON OMNI FLASH + NANO BANANA) ── */}
                {videoMode === "CLINICAL_EVOLUTION" ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-blue-50/40 dark:from-[#0a1512] dark:via-[#081a17] dark:to-[#07131a] border border-emerald-200/80 dark:border-emerald-900/50 space-y-1 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          <Sparkles className="w-3.5 h-3.5" />
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                          Evolución Clínica Continua • Interpolación First & Last Frame
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed pl-5">
                        Sube las fotos inicial y final del tratamiento. <strong>Gemini Omni Flash</strong> genera la transición fotorrealista continua, y <strong>Nano Banana 2.1</strong> integra el sello tipográfico del especialista.
                      </p>
                    </div>

                    {/* Inputs de Carga de Imágenes (Antes / Después) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* FOTO INICIAL ("ANTES") */}
                      <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                            1. Fotografía Inicial ("Antes")
                          </label>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                            Primer Fotograma
                          </span>
                        </div>

                        <input
                          ref={initialImageInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleInitialImageUpload}
                        />

                        {initialImagePreview ? (
                          <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] group">
                            <img
                              src={initialImagePreview}
                              alt="Antes"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => initialImageInputRef.current?.click()}
                                className="p-2 rounded-xl bg-white text-gray-900 text-xs font-bold shadow-md hover:bg-gray-100 cursor-pointer"
                              >
                                Cambiar
                              </button>
                              <button
                                type="button"
                                onClick={() => dispatch({ type: "SET_INITIALIMAGE", payload: null })}
                                className="p-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            data-testid="upload-initial-image-btn"
                            onClick={() => initialImageInputRef.current?.click()}
                            className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer p-4"
                          >
                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-emerald-600" />
                            <div className="text-center">
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                                Cargar Foto Inicial ("Antes")
                              </span>
                              <span className="text-[10px] text-gray-400">PNG, JPG hasta 8MB</span>
                            </div>
                          </button>
                        )}
                      </div>

                      {/* FOTO FINAL ("DESPUÉS") */}
                      <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                            2. Fotografía Final ("Después")
                          </label>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                            Último Fotograma
                          </span>
                        </div>

                        <input
                          ref={finalImageInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleFinalImageUpload}
                        />

                        {finalImagePreview ? (
                          <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] group">
                            <img
                              src={finalImagePreview}
                              alt="Después"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => finalImageInputRef.current?.click()}
                                className="p-2 rounded-xl bg-white text-gray-900 text-xs font-bold shadow-md hover:bg-gray-100 cursor-pointer"
                              >
                                Cambiar
                              </button>
                              <button
                                type="button"
                                onClick={() => dispatch({ type: "SET_FINALIMAGE", payload: null })}
                                className="p-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            data-testid="upload-final-image-btn"
                            onClick={() => finalImageInputRef.current?.click()}
                            className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer p-4"
                          >
                            <Sparkles className="w-6 h-6 text-gray-400 group-hover:text-emerald-600" />
                            <div className="text-center">
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                                Cargar Foto Final ("Después")
                              </span>
                              <span className="text-[10px] text-gray-400">PNG, JPG hasta 8MB</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Datos Clínicos y Especialidad */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase text-gray-500">
                          Especialidad Médica
                        </label>
                        <Select
                          value={clinicalSpecialty}
                          onValueChange={(val) => dispatch({ type: "SET_CLINICALSPECIALTY", payload: val })}
                        >
                          <SelectTrigger className="w-full h-10 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-semibold">
                            <SelectValue placeholder="Selecciona especialidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ORTHODONTICS">🦷 Ortodoncia & Alineadores</SelectItem>
                            <SelectItem value="AESTHETICS">💉 Medicina Estética & Botox</SelectItem>
                            <SelectItem value="DERMATOLOGY">🔬 Dermatología & Láser</SelectItem>
                            <SelectItem value="BARIATRIC">⚖️ Cirugía Bariátrica & Pérdida de Peso</SelectItem>
                            <SelectItem value="PLASTIC_SURGERY">🩺 Cirugía Plástica & Reconstructiva</SelectItem>
                            <SelectItem value="DENTISTRY">😁 Implantología Dental & Sonrisa</SelectItem>
                            <SelectItem value="GENERAL">🏥 Caso Clínico General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase text-gray-500">
                          Periodo o Duración del Tratamiento
                        </label>
                        <Input
                          value={treatmentDuration}
                          onChange={(e) => dispatch({ type: "SET_TREATMENTDURATION", payload: e.target.value })}
                          placeholder="ej. 12 Meses, 6 Sesiones, 90 Días"
                          className="h-10 text-xs rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Descripción del Caso */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                        Procedimiento o Descripción del Caso Clínico
                      </label>
                      <Textarea
                        value={clinicalTopic}
                        onChange={(e) => dispatch({ type: "SET_CLINICALTOPIC", payload: e.target.value })}
                        placeholder="ej. Alineación maxilar completa y cierre de diastema con alineadores invisibles. Corrección de mordida profunda..."
                        className="w-full h-20 p-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 shadow-2xs resize-none"
                      />
                    </div>

                    {/* Marca y Tipografía Médica (Nano Banana 2.1) */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 space-y-3 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <h5 className="text-[11px] font-bold uppercase text-gray-700 dark:text-gray-300">
                          Sello y Marca Médica (Nano Banana 2.1)
                        </h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase text-gray-500">
                            Especialista / Clínica
                          </label>
                          <Input
                            value={doctorBranding}
                            onChange={(e) => dispatch({ type: "SET_DOCTORBRANDING", payload: e.target.value })}
                            placeholder={user ? `${user.firstName} ${user.lastName}` : "Dra. Sofía Mendoza • Ortodoncia"}
                            className="h-9 text-xs rounded-xl bg-white dark:bg-[#0a0a0a]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase text-gray-500">
                            Distintivo de Verificación
                          </label>
                          <Input
                            value={watermarkText}
                            onChange={(e) => dispatch({ type: "SET_WATERMARKTEXT", payload: e.target.value })}
                            placeholder="Caso Clínico Real • QuHealthy"
                            className="h-9 text-xs rounded-xl bg-white dark:bg-[#0a0a0a]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── MODO 1: ESTÁNDAR TEXT-TO-VIDEO ── */
                  <>
                    {videoBaseImageUrl && (
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-900/40 shadow-2xs">
                        <img
                          src={videoBaseImageUrl}
                          alt="Base"
                          className="w-10 h-10 rounded-xl object-cover border border-emerald-200 dark:border-emerald-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                            Imagen Fuente Activa
                          </p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            Conversión Image-to-Video
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch({
                              type: "SET_VIDEOBASEIMAGEURL",
                              payload: "",
                            })
                          }
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                        {t("video_prompt_label")}
                      </label>
                      <Textarea
                        value={videoPrompt}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_VIDEOPROMPT",
                            payload: e.target.value,
                          })
                        }
                        disabled={isGeneratingVideo}
                        placeholder="Instrucciones de movimiento, ángulo de cámara o narrativa..."
                        className="w-full h-20 p-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-2xs resize-none"
                      />
                    </div>
                  </>
                )}

                {/* ── CONTROLES COMPARTIDOS: PLATAFORMA, TONO, RATIO, RESOLUCIÓN, AUDIO ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-gray-500">
                      PLATAFORMA
                    </label>
                    <div className="flex bg-white dark:bg-[#0a0a0a] p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
                      {(
                        ["INSTAGRAM", "FACEBOOK", "TIKTOK"] as SocialPlatform[]
                      ).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() =>
                            dispatch({
                              type: "SET_VIDEOPLATFORM",
                              payload: p,
                            })
                          }
                          className={cn(
                            "flex-1 h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                            videoPlatform === p
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-2xs border border-emerald-200 dark:border-emerald-900/40"
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          )}
                        >
                          {p.charAt(0) + p.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-gray-500">
                      TONO
                    </label>
                    <div className="flex bg-white dark:bg-[#0a0a0a] p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
                      {tones.map((tone) => (
                        <button
                          key={tone.value}
                          type="button"
                          onClick={() =>
                            dispatch({
                              type: "SET_VIDEOTONE",
                              payload: tone.value,
                            })
                          }
                          className={cn(
                            "flex-1 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer",
                            videoTone === tone.value
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-2xs border border-emerald-200 dark:border-emerald-900/40"
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          )}
                        >
                          {tone.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-gray-500">
                      ASPECT RATIO
                    </label>
                    <div className="flex bg-white dark:bg-[#0a0a0a] p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
                      {(["LANDSCAPE", "PORTRAIT", "SQUARE"] as const).map(
                        (a) => (
                          <button
                            key={a}
                            type="button"
                            onClick={() =>
                              dispatch({
                                type: "SET_VIDEOASPECTRATIO",
                                payload: a,
                              })
                            }
                            className={cn(
                              "flex-1 h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                              videoAspectRatio === a
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-2xs border border-emerald-200 dark:border-emerald-900/40"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                          >
                            {
                              { LANDSCAPE: "16:9", PORTRAIT: "9:16", SQUARE: "1:1" }[
                                a
                              ]
                            }
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-gray-500">
                      {t("video_resolution_label")}
                    </label>
                    <div className="flex bg-white dark:bg-[#0a0a0a] p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
                      {videoResolutions.map((res) => (
                        <button
                          key={res.value}
                          type="button"
                          onClick={() =>
                            dispatch({
                              type: "SET_VIDEORESOLUTION",
                              payload: res.value,
                            })
                          }
                          className={cn(
                            "flex-1 h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                            videoResolution === res.value
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-2xs border border-emerald-200 dark:border-emerald-900/40"
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          )}
                        >
                          {res.value.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1.5">
                        <Volume2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{t("video_audio_label")}</span>
                      </label>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Omni Flash
                      </span>
                    </div>
                    <div className="flex bg-white dark:bg-[#0a0a0a] p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs overflow-x-auto gap-1">
                      {audioOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            dispatch({
                              type: "SET_VIDEOAUDIOSTYLE",
                              payload: opt.value,
                            });
                            dispatch({
                              type: "SET_VIDEOINCLUDEAUDIO",
                              payload: opt.value !== "NONE",
                            });
                          }}
                          className={cn(
                            "flex-1 h-8 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer whitespace-nowrap",
                            videoAudioStyle === opt.value
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-2xs border border-emerald-200 dark:border-emerald-900/40"
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          )}
                        >
                          {t(opt.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateVideo}
                  disabled={
                    isGeneratingVideo ||
                    (videoMode === "CLINICAL_EVOLUTION"
                      ? !initialImageBase64 && !finalImageBase64
                      : !videoPrompt.trim())
                  }
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
                >
                  {isGeneratingVideo ? (
                    <>
                      <QhSpinner size="sm" className="text-white" />
                      <span>
                        {videoMode === "CLINICAL_EVOLUTION"
                          ? "Renderizando Evolución Clínica..."
                          : "Renderizando Video..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" strokeWidth={2} />
                      <span>
                        {videoMode === "CLINICAL_EVOLUTION"
                          ? "Renderizar Evolución Clínica (Omni Flash)"
                          : t("generate_video_btn")}
                      </span>
                    </>
                  )}
                </button>

                {videoStatus && !generatedVideoUrl && (
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/40 flex items-start gap-3 shadow-2xs">
                    <QhSpinner size="sm" className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                        {t("video_in_progress")}
                      </p>
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        {videoStatus}
                      </p>
                    </div>
                  </div>
                )}

                {/* Resultado Video */}
                {generatedVideoUrl && (
                  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-xs mt-2">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          Video Renderizado
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {t("video_omni_badge")} • {videoResolution}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center bg-gray-900 rounded-2xl overflow-hidden shadow-2xs">
                      <video
                        src={generatedVideoUrl}
                        controls
                        autoPlay
                        className="max-w-full max-h-[350px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = generatedVideoUrl;
                          a.download = "quhealthy-video.mp4";
                          a.target = "_blank";
                          a.click();
                        }}
                        className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        <span>Descargar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveDraft("video")}
                        className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        <span>Guardar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleScheduleVideo}
                        className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer border-0"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Programar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: "SET_GENERATEDVIDEOURL",
                            payload: "",
                          })
                        }
                        className="h-10 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
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
          dispatch({ type: "SET_SCHEDULEMODALOPEN", payload: false });
          dispatch({ type: "SET_SCHEDULEPREFILL", payload: undefined });
        }}
        onScheduled={() => {
          dispatch({ type: "SET_SCHEDULEMODALOPEN", payload: false });
          dispatch({ type: "SET_SCHEDULEPREFILL", payload: undefined });
          onGenerationSuccess();
        }}
        prefill={schedulePrefill}
      />
    </>
  );
}