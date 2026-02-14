"use client";

import React, { useState } from "react";
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
  ArrowRight
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

/**
 * PublicInfoSection Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. FEEDBACK INMEDIATO
 *    - Character counter visual con colores
 *    - Preview tips en tiempo real
 *    - Validación de URL
 *    - Progress bar
 * 
 * 2. PRIMING
 *    - Stats de conversión (+40%)
 *    - Ejemplos específicos
 *    - Badges de valor
 *    - Success cases
 * 
 * 3. FEATURE GATING SUAVE
 *    - Premium badge visible pero no agresivo
 *    - Beneficios claros
 *    - Upgrade CTA atractivo
 *    - Value proposition clara
 * 
 * 4. CREDIBILIDAD
 *    - Stats específicos
 *    - Preview visible
 *    - Ejemplos reales
 *    - Sin exageraciones
 * 
 * 5. MINIMIZAR ERRORES
 *    - Character limits claros
 *    - URL validation
 *    - Writing tips
 *    - Format guidance
 * 
 * 6. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Placeholder examples
 *    - Writing tips inline
 *    - Visual counter
 *    - Clear labels
 */

// Interfaz de datos
export interface PublicInfoSettings {
  description: string;
  videoUrl?: string;
}

interface PublicInfoSectionProps {
  settings: PublicInfoSettings;
  onChange: (key: keyof PublicInfoSettings, value: string) => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

export function PublicInfoSection({ 
  settings, 
  onChange, 
  isPremium = false,
  onUpgrade 
}: PublicInfoSectionProps) {
  const [showPreviewTips, setShowPreviewTips] = useState(false);
  const [videoUrlError, setVideoUrlError] = useState<string>('');

  const charCount = settings.description.length;
  const charLimit = 500;
  const charPercent = (charCount / charLimit) * 100;

  // Helper para validar URL de video - MINIMIZAR ERRORES
  const validateVideoUrl = (url: string) => {
    if (!url) {
      setVideoUrlError('');
      return;
    }

    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = url.includes('vimeo.com');
    
    if (!isYoutube && !isVimeo) {
      setVideoUrlError('Por favor usa un enlace de YouTube o Vimeo');
    } else {
      setVideoUrlError('');
    }
  };

  // Helper para color de contador - FEEDBACK VISUAL
  const getCharCountColor = () => {
    if (charPercent >= 90) return 'text-red-400';
    if (charPercent >= 75) return 'text-amber-400';
    return 'text-gray-500';
  };

  const getProgressColor = () => {
    if (charPercent >= 90) return 'bg-red-500';
    if (charPercent >= 75) return 'bg-amber-500';
    if (charPercent >= 50) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  // Writing quality score - FEEDBACK INMEDIATO
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
    <Card className="bg-gray-900 border-gray-800 shadow-xl">
      
      {/* Header */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20"
            >
              <FileText className="w-5 h-5 text-blue-400" />
            </motion.div>
            <div>
              <CardTitle className="text-xl font-black text-white mb-1">
                Sobre Mí
              </CardTitle>
              <CardDescription className="text-gray-400">
                Conecta emocionalmente con tus pacientes
              </CardDescription>
            </div>
          </div>

          {/* Preview Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreviewTips(!showPreviewTips)}
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreviewTips ? 'Ocultar' : 'Ver'} Tips
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-2">
        
        {/* Writing Tips - RECONOCIMIENTO */}
        <AnimatePresence>
          {showPreviewTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-400 mb-2">
                    💡 Consejos para una bio efectiva:
                  </p>
                  <ul className="space-y-1.5 text-xs text-blue-300/80">
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
            <Label className="text-gray-300 font-bold text-sm uppercase tracking-wider">
              Biografía / Descripción
            </Label>
            <div className="flex items-center gap-3">
              {/* Quality Score */}
              {charCount > 50 && (
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs",
                    qualityScore >= 75 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    qualityScore >= 50 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
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

          {/* Progress Bar - FEEDBACK VISUAL */}
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
              "bg-gray-950 border-gray-700 resize-none leading-relaxed transition-all",
              "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              charPercent >= 90 ? "border-red-500/50 focus:border-red-500":""
            )}
          />

          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <p>
              Esta información aparecerá en la parte superior de tu perfil público y en búsquedas.
            </p>
          </div>
        </div>

        {/* Video de Bienvenida - FEATURE GATING */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "rounded-2xl border transition-all duration-300",
            isPremium 
              ? "bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 shadow-lg shadow-purple-500/5" 
              : "bg-gray-950/50 border-gray-800"
          )}
        >
          <div className="p-5 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isPremium ? "bg-purple-500/10" : "bg-gray-800"
                )}>
                  <Video className={cn(
                    "w-5 h-5",
                    isPremium ? "text-purple-400" : "text-gray-500"
                  )} />
                </div>
                <div>
                  <Label className={cn(
                    "font-bold text-sm",
                    isPremium ? "text-white" : "text-gray-400"
                  )}>
                    Video de Bienvenida
                  </Label>
                  {isPremium && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Aumenta conversión hasta 40%
                    </p>
                  )}
                </div>
              </div>

              {!isPremium ? (
                <Badge className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-500 border-yellow-500/20 px-3 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Activo
                </Badge>
              )}
            </div>

            {/* Input */}
            <div className="space-y-2">
              <Input 
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={settings.videoUrl || ''}
                onChange={(e) => {
                  onChange('videoUrl', e.target.value);
                  validateVideoUrl(e.target.value);
                }}
                disabled={!isPremium}
                className={cn(
                  "h-11 transition-all",
                  isPremium 
                    ? "bg-gray-900 border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white" 
                    : "bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed"
                )}
              />

              {/* URL Error */}
              {videoUrlError && isPremium && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  {videoUrlError}
                </div>
              )}
            </div>

            {/* Info/Upgrade Section */}
            {isPremium ? (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-300/80">
                    <p className="font-semibold text-purple-400 mb-1">
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
              <div className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-400 mb-2">
                      Aumenta tu conversión con video
                    </p>
                    <ul className="space-y-1.5 text-xs text-yellow-300/80">
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
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold shadow-xl"
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

        {/* Success Examples - CREDIBILIDAD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-400 mb-2">
                📈 Impacto de un perfil completo:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-emerald-500/5 rounded-lg p-2 text-center">
                  <p className="text-2xl font-black text-emerald-400">+65%</p>
                  <p className="text-emerald-300/80">Más vistas</p>
                </div>
                <div className="bg-emerald-500/5 rounded-lg p-2 text-center">
                  <p className="text-2xl font-black text-emerald-400">+40%</p>
                  <p className="text-emerald-300/80">Más citas</p>
                </div>
                <div className="bg-emerald-500/5 rounded-lg p-2 text-center">
                  <p className="text-2xl font-black text-emerald-400">+85%</p>
                  <p className="text-emerald-300/80">Confianza</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </CardContent>
    </Card>
  );
}