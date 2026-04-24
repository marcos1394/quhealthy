"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Crown,
  Video,
  Sparkles,
  Info,
  TrendingUp,
  Eye,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  UploadCloud,
  RefreshCw,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "react-toastify";
import { handleApiError } from '@/lib/handleApiError';

export interface PublicInfoSettings {
  description: string;
  videoUrl?: string;
}

interface PublicInfoSectionProps {
  settings: PublicInfoSettings;
  onChange: (key: keyof PublicInfoSettings, value: string) => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
  onVideoUpload?: (file: File) => Promise<void>;
  onVideoDelete?: () => void;
}

export function PublicInfoSection({
  settings,
  onChange,
  isPremium = false,
  onUpgrade,
  onVideoDelete,
  onVideoUpload
}: PublicInfoSectionProps) {
  const [showPreviewTips, setShowPreviewTips] = useState(false);
  const [videoUrlError, setVideoUrlError] = useState<string>('');

  const charCount = settings.description.length;
  const charLimit = 500;
  const charPercent = (charCount / charLimit) * 100;
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      return;
    }

    setIsUploadingVideo(true);
    if (onVideoUpload) {
      await onVideoUpload(file);
    }
    setIsUploadingVideo(false);
    e.target.value = '';
  };

  // Helper para color de contador
  const getCharCountColor = () => {
    if (charPercent >= 90) return 'text-red-500 dark:text-red-400';
    if (charPercent >= 75) return 'text-amber-500 dark:text-amber-400';
    return 'text-slate-500';
  };

  const getProgressColor = () => {
    if (charPercent >= 90) return 'bg-red-500';
    if (charPercent >= 75) return 'bg-amber-500';
    if (charPercent >= 50) return 'bg-medical-500';
    return 'bg-emerald-500';
  };

  // Writing quality score
  const getQualityScore = () => {
    let score = 0;
    const desc = settings.description;

    if (desc.length > 100) score += 25;
    if (desc.length > 200) score += 25;
    if (desc.includes('.') || desc.includes('!')) score += 25;
    if (desc.split(' ').length > 30) score += 25;

    return score;
  };

  const qualityScore = getQualityScore();

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">

      {/* Header */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-2 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20"
            >
              <FileText className="w-5 h-5 text-medical-600 dark:text-medical-400" />
            </motion.div>
            <div>
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white mb-1">
                Sobre Mí
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Conecta emocionalmente con tus pacientes
              </CardDescription>
            </div>
          </div>

          {/* Preview Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreviewTips(!showPreviewTips)}
            className="border-medical-200 dark:border-medical-500/30 text-medical-600 dark:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-500/10"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreviewTips ? 'Ocultar' : 'Ver'} Tips
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">

        {/* Writing Tips */}
        <AnimatePresence>
          {showPreviewTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-medical-50 dark:bg-medical-500/10 border border-medical-100 dark:border-medical-500/20 rounded-xl p-4 overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-medical-600 dark:text-medical-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-medical-700 dark:text-medical-400 mb-2">
                    💡 Consejos para una bio efectiva:
                  </p>
                  <ul className="space-y-1.5 text-xs text-medical-600 dark:text-medical-300/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>Comienza con tu especialidad principal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>Menciona años de experiencia y certificaciones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>Habla de tu enfoque o filosofía de atención</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>Usa un tono cercano y profesional</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Descripción Pública */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wider">
              Biografía / Descripción
            </Label>
            <div className="flex items-center gap-3">
              {/* Quality Score */}
              {charCount > 50 && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    qualityScore >= 75 ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" :
                      qualityScore >= 50 ? "bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-100 dark:border-medical-500/20" :
                        "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                  )}
                >
                  {qualityScore >= 75 ? '✓ Completa' :
                    qualityScore >= 50 ? 'Buena' :
                      'Básica'}
                </Badge>
              )}

              {/* Character Counter */}
              <span className={cn(
                "text-xs font-bold",
                getCharCountColor()
              )}>
                {charCount}/{charLimit}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress
            value={charPercent}
            className={cn("h-1", getProgressColor())}
          />

          <Textarea
            placeholder="Ejemplo: Hola, soy el Dr. Marcos López, médico cirujano con 10 años de experiencia en medicina general y preventiva. Me apasiona brindar atención integral y personalizada, escuchando las necesidades de cada paciente para ofrecer el mejor tratamiento posible..."
            rows={6}
            value={settings.description}
            onChange={(e) => onChange('description', e.target.value)}
            maxLength={charLimit}
            className={cn(
              "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 resize-none leading-relaxed transition-all text-slate-900 dark:text-white",
              "focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20",
              charPercent >= 90 ? "border-red-500/50 focus:border-red-500" : ""
            )}
          />

          <div className="flex items-start gap-2 text-xs text-slate-500">
            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <p>
              Esta información aparecerá en la parte superior de tu perfil público y en búsquedas.
            </p>
          </div>
        </div>

        {/* Video de Bienvenida */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "rounded-2xl border transition-all duration-300",
            isPremium
              ? "bg-medical-50 dark:bg-medical-500/5 border-medical-100 dark:border-medical-500/20 shadow-sm"
              : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
          )}
        >
          <div className="p-5 space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isPremium ? "bg-medical-100 dark:bg-medical-500/10" : "bg-slate-100 dark:bg-slate-800"
                )}>
                  <Video className={cn(
                    "w-5 h-5",
                    isPremium ? "text-medical-600 dark:text-medical-400" : "text-slate-400 dark:text-slate-500"
                  )} />
                </div>
                <div>
                  <Label className={cn(
                    "font-bold text-sm",
                    isPremium ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                  )}>
                    Video de Bienvenida
                  </Label>
                  {isPremium && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Aumenta conversión hasta 40%
                    </p>
                  )}
                </div>
              </div>

              {!isPremium ? (
                <Badge className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20 px-3 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              ) : (
                <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Activo
                </Badge>
              )}
            </div>

            {/* Video Upload UI */}
            <div className="space-y-2">
              {settings.videoUrl ? (
                <div className="relative group rounded-xl overflow-hidden bg-black aspect-video border border-slate-200 dark:border-slate-800">
                  <video src={settings.videoUrl} controls className="w-full h-full object-contain" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onVideoDelete && onVideoDelete()}
                      className="bg-red-500/80 hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => isPremium && videoInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                    isPremium
                      ? "border-medical-200 dark:border-medical-500/30 hover:bg-medical-50 dark:hover:bg-medical-500/10 hover:border-medical-400 dark:hover:border-medical-500 cursor-pointer bg-white dark:bg-slate-900"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 cursor-not-allowed opacity-50"
                  )}
                >
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    {isUploadingVideo ? (
                      <RefreshCw className="w-8 h-8 text-medical-600 dark:text-medical-400 animate-spin" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                    Sube tu Video de Bienvenida
                  </p>
                  <p className="text-xs text-slate-500 mt-1">MP4 o WebM • Máx 20MB</p>
                </div>
              )}

              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                disabled={!isPremium}
                onChange={handleVideoFileChange}
              />
            </div>

            {/* Info/Upgrade Section */}
            {isPremium ? (
              <div className="bg-medical-50 dark:bg-medical-500/10 border border-medical-100 dark:border-medical-500/20 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-medical-600 dark:text-medical-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-medical-600 dark:text-medical-300/80">
                    <p className="font-semibold text-medical-700 dark:text-medical-400 mb-1">
                      Plataformas compatibles:
                    </p>
                    <p>
                      YouTube, Vimeo. Los perfiles con video tienen <strong>40% más conversión</strong> y
                      generan mayor confianza en los pacientes.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-500/5 dark:to-orange-500/5 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                      Aumenta tu conversión con video
                    </p>
                    <ul className="space-y-1.5 text-xs text-yellow-600 dark:text-yellow-300/80">
                      <li className="flex items-start gap-2">
                        <Zap className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span><strong>+40% más conversión</strong> en reservas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>Los pacientes prefieren ver a su médico antes de agendar</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>Transmite confianza y profesionalismo</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {onUpgrade && (
                  <Button
                    onClick={onUpgrade}
                    className="w-full"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Actualizar a Premium
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Success Examples */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                📈 Impacto de un perfil completo:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-emerald-100/50 dark:bg-emerald-500/5 rounded-lg p-2 text-center">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">+65%</p>
                  <p className="text-emerald-600 dark:text-emerald-300/80">Más vistas</p>
                </div>
                <div className="bg-emerald-100/50 dark:bg-emerald-500/5 rounded-lg p-2 text-center">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">+40%</p>
                  <p className="text-emerald-600 dark:text-emerald-300/80">Más citas</p>
                </div>
                <div className="bg-emerald-100/50 dark:bg-emerald-500/5 rounded-lg p-2 text-center">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">+85%</p>
                  <p className="text-emerald-600 dark:text-emerald-300/80">Confianza</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </CardContent>
    </Card>
  );
}