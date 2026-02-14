"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  CalendarClock, 
  Youtube, 
  Video,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Globe,
  Sparkles,
  Clock,
  Send,
  Tag,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * VideoScheduleModal Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. MINIMIZAR ERRORES
 *    - Validación de título (requerido, longitud)
 *    - Validación de fecha futura
 *    - Campos requeridos marcados
 *    - Límites de caracteres visibles
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Contador de caracteres en tiempo real
 *    - Validación visual de campos
 *    - 3 estados de scheduling
 *    - Success animation
 * 
 * 3. AFFORDANCE
 *    - Iconos por privacidad
 *    - Colores por plataforma
 *    - Preview video cuando aplica
 *    - Estados disabled claros
 * 
 * 4. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos descriptivos
 *    - Labels claros
 *    - Placeholder examples
 *    - Summary antes de enviar
 * 
 * 5. CREDIBILIDAD
 *    - Preview del video
 *    - Timezone visible
 *    - Límites de plataforma
 *    - Confirmación de datos
 * 
 * 6. MINIMIZAR CARGA COGNITIVA
 *    - Campos organizados lógicamente
 *    - Defaults inteligentes
 *    - Ayuda contextual
 */

// Tipos
export interface GeneratedContent {
  id: string;
  prompt: string;
  generatedText: string;
  generatedVideoUrl?: string;
}

export interface SocialConnection {
  id: number;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook';
  username?: string;
}

interface VideoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  content: GeneratedContent | null;
  connections: SocialConnection[];
}

export const VideoScheduleModal: React.FC<VideoScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  onScheduled, 
  content, 
  connections 
}) => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [publishAt, setPublishAt] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [schedulingStep, setSchedulingStep] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const videoConnections = connections.filter(c => 
    c.platform === 'youtube' || c.platform === 'tiktok'
  );

  // Límites por plataforma - MINIMIZAR ERRORES
  const platformLimits = {
    youtube: { title: 100, description: 5000, tags: 500 },
    tiktok: { title: 150, description: 2200, tags: 100 }
  };

  const selectedConnection = videoConnections.find(
    c => c.id.toString() === selectedConnectionId
  );

  const currentLimit = selectedConnection 
    ? platformLimits[selectedConnection.platform as keyof typeof platformLimits]
    : platformLimits.youtube;

  // Auto-fill title - SATISFICING
  useEffect(() => {
    if (content && !title) {
      const autoTitle = content.prompt 
        ? `${content.prompt.substring(0, 50)}${content.prompt.length > 50 ? '...' : ''}`
        : 'Video generado con IA';
      setTitle(autoTitle);
    }
  }, [content]);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setPublishAt('');
      setSelectedConnectionId('');
      setPrivacyStatus('public');
      setValidationErrors({});
      setSchedulingStep('idle');
      setShowPreview(false);
    }
  }, [isOpen]);

  // Validación en tiempo real - FEEDBACK INMEDIATO
  useEffect(() => {
    const errors: Record<string, string> = {};

    if (title && title.length > currentLimit.title) {
      errors.title = `Máximo ${currentLimit.title} caracteres`;
    }

    if (tags && tags.length > currentLimit.tags) {
      errors.tags = `Máximo ${currentLimit.tags} caracteres`;
    }

    if (publishAt) {
      const selectedDate = new Date(publishAt);
      const now = new Date();
      if (selectedDate <= now) {
        errors.date = 'La fecha debe ser futura';
      } else if (selectedDate.getTime() - now.getTime() < 5 * 60 * 1000) {
        errors.date = 'Mínimo 5 minutos de anticipación';
      }
    }

    setValidationErrors(errors);
  }, [title, tags, publishAt, currentLimit]);

  // Helper para iconos de privacidad - RECONOCIMIENTO
  const getPrivacyIcon = (status: string) => {
    const icons = {
      public: <Globe className="w-4 h-4 text-emerald-400" />,
      private: <Lock className="w-4 h-4 text-red-400" />,
      unlisted: <EyeOff className="w-4 h-4 text-amber-400" />
    };
    return icons[status as keyof typeof icons] || <Globe className="w-4 h-4" />;
  };

  // Helper para iconos de plataforma - RECONOCIMIENTO
  const getPlatformIcon = (platform: string) => {
    const icons = {
      youtube: <Youtube className="w-4 h-4 text-red-500" />,
      tiktok: <Video className="w-4 h-4 text-cyan-400" />
    };
    return icons[platform as keyof typeof icons] || <Video className="w-4 h-4" />;
  };

  // Validación final antes de submit
  const canSubmit = () => {
    return (
      title.trim() &&
      selectedConnectionId &&
      publishAt &&
      Object.keys(validationErrors).length === 0 &&
      videoConnections.length > 0
    );
  };

  const handleSubmit = async () => {
    if (!content || !canSubmit()) {
      toast.warn("Completa todos los campos requeridos");
      return;
    }
    
    setIsScheduling(true);
    setSchedulingStep('uploading');

    try {
      await axios.post('/api/social/schedule-post', {
        socialConnectionId: parseInt(selectedConnectionId),
        content: content.generatedText,
        videoUrl: content.generatedVideoUrl,
        title,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        privacyStatus,
        publishAt: new Date(publishAt).toISOString(),
      }, { withCredentials: true });
      
      setSchedulingStep('success');
      toast.success("¡Video programado exitosamente! 🎉", {
        icon: <span>"🎬"</span>
      });

      setTimeout(() => {
        onScheduled();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setSchedulingStep('idle');
      
      const errorMessage = error?.response?.data?.message || 
                          "No se pudo programar el video";
      toast.error(errorMessage);
    } finally {
      setTimeout(() => setIsScheduling(false), 1500);
    }
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header - JERARQUÍA VISUAL */}
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="p-3 bg-gradient-to-br from-red-500/10 to-purple-500/10 rounded-xl border border-red-500/20 shadow-lg"
              >
                <Youtube className="w-6 h-6 text-red-400" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-black text-white mb-1">
                  Programar Video
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-base">
                  Configura los detalles de tu publicación de video
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="default"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
            
          {/* Video Preview - RECONOCIMIENTO */}
          {content.generatedVideoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Preview del Video
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-purple-400 hover:text-purple-300 h-7"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Ocultar' : 'Ver preview'}
                </Button>
              </div>

              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden rounded-xl"
                  >
                    <video 
                      src={content.generatedVideoUrl}
                      controls
                      className="w-full rounded-xl border border-gray-800"
                      style={{ maxHeight: '300px' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Title - MINIMIZAR ERRORES */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Título del Video <span className="text-red-400">*</span>
              </Label>
              <span className={cn(
                "text-xs font-medium",
                title.length > currentLimit.title * 0.9 
                  ? "text-red-400" 
                  : "text-gray-500"
              )}>
                {title.length}/{currentLimit.title}
              </span>
            </div>
            <Input 
              id="title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className={cn(
                "bg-gray-950/50 border-gray-700 h-12 transition-all",
                "focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
                title ? !validationErrors.title ? "border-emerald-500/50 bg-emerald-500/5" : "" : "",
                validationErrors.title && "border-red-500/50 bg-red-500/5"
              )}
              placeholder="Ej: Beneficios del ejercicio cardiovascular..."
              maxLength={currentLimit.title}
            />
            {validationErrors.title && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.title}
              </p>
            )}
          </motion.div>

          {/* Tags - AFFORDANCE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label htmlFor="tags" className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                Etiquetas
              </Label>
              <span className={cn(
                "text-xs font-medium",
                tags.length > currentLimit.tags * 0.9 
                  ? "text-red-400" 
                  : "text-gray-500"
              )}>
                {tags.length}/{currentLimit.tags}
              </span>
            </div>
            <Input 
              id="tags" 
              value={tags} 
              onChange={e => setTags(e.target.value)} 
              placeholder="salud, bienestar, ejercicio, nutrición..."
              className={cn(
                "bg-gray-950/50 border-gray-700 h-12 transition-all",
                "focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
                validationErrors.tags && "border-red-500/50 bg-red-500/5"
              )}
              maxLength={currentLimit.tags}
            />
            {validationErrors.tags && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.tags}
              </p>
            )}
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Separa con comas. Máximo 15 etiquetas recomendadas
            </p>
          </motion.div>

          {/* Platform & Privacy - RECONOCIMIENTO */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Platform */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Plataforma <span className="text-red-400">*</span>
              </Label>
              
              {videoConnections.length > 0 ? (
                <Select onValueChange={setSelectedConnectionId} value={selectedConnectionId}>
                  <SelectTrigger className={cn(
                    "bg-gray-950/50 border-gray-700 h-12 transition-all",
                    selectedConnectionId && "border-red-500/50 bg-red-500/5"
                  )}>
                    <SelectValue placeholder="Seleccionar plataforma" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    {videoConnections.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(c.platform)}
                          <div className="flex flex-col">
                            <span className="font-semibold capitalize">{c.platform}</span>
                            {c.username && (
                              <span className="text-xs text-gray-500">@{c.username}</span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-400">
                      No hay cuentas conectadas
                    </p>
                    <p className="text-xs text-amber-300/80 mt-1">
                      Conecta YouTube o TikTok primero
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Visibilidad
              </Label>
              <Select onValueChange={setPrivacyStatus} value={privacyStatus}>
                <SelectTrigger className="bg-gray-950/50 border-gray-700 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold">Público</div>
                        <div className="text-xs text-gray-500">Visible para todos</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="unlisted">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-semibold">No listado</div>
                        <div className="text-xs text-gray-500">Solo con enlace</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-400" />
                      <div>
                        <div className="font-semibold">Privado</div>
                        <div className="text-xs text-gray-500">Solo tú</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Date/Time - VALIDACIÓN */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Label htmlFor="publishAt" className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Fecha y Hora de Publicación <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              <Input 
                id="publishAt" 
                type="datetime-local" 
                value={publishAt} 
                onChange={e => setPublishAt(e.target.value)} 
                className={cn(
                  "bg-gray-950/50 border-gray-700 pl-11 h-12 transition-all",
                  "focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
                  publishAt ? !validationErrors.date ? "border-emerald-500/50 bg-emerald-500/5" : "" : "",
                  validationErrors.date && "border-red-500/50 bg-red-500/5"
                )}
              />
            </div>
            {validationErrors.date && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.date}
              </p>
            )}
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Zona horaria: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </motion.div>

          {/* Summary Card - CREDIBILIDAD */}
          {canSubmit() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-red-500/10 to-purple-500/10 p-4 rounded-xl border border-red-500/20"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-white">
                    Resumen de Publicación
                  </p>
                  <div className="space-y-1 text-xs text-gray-400">
                    <p className="flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      {title}
                    </p>
                    <p className="flex items-center gap-2">
                      {getPlatformIcon(selectedConnection!.platform)}
                      <span className="capitalize">{selectedConnection!.platform}</span>
                      {selectedConnection!.username && (
                        <span className="text-gray-500">@{selectedConnection!.username}</span>
                      )}
                    </p>
                    <p className="flex items-center gap-2">
                      {getPrivacyIcon(privacyStatus)}
                      <span className="capitalize">{privacyStatus === 'public' ? 'Público' : privacyStatus === 'private' ? 'Privado' : 'No listado'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarClock className="w-3 h-3" />
                      {new Date(publishAt).toLocaleString('es-MX', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer - AFFORDANCE */}
        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isScheduling}
            className="flex-1 sm:flex-none border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit() || isScheduling}
            className={cn(
              "flex-1 sm:flex-none min-w-[160px] font-bold transition-all duration-300",
              schedulingStep === 'success' 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 shadow-lg hover:shadow-xl"
            )}
          >
            <AnimatePresence mode="wait">
              {schedulingStep === 'uploading' && (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Programando...
                </motion.div>
              )}
              {schedulingStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  ¡Programado!
                </motion.div>
              )}
              {schedulingStep === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Programar Video
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};