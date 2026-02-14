"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  CalendarClock, 
  Instagram, 
  Facebook, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Sparkles,
  Clock,
  Send,
  Twitter,
  Linkedin
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
 * ImageScheduleModal Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. MINIMIZAR ERRORES
 *    - Validación visual de campos
 *    - Mensajes de error claros
 *    - Disabled states informativos
 *    - Confirmación antes de enviar
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Loading states detallados
 *    - Success animation
 *    - Error handling visual
 *    - Preview del contenido
 * 
 * 3. AFFORDANCE
 *    - Iconos por plataforma
 *    - Colores distintivos
 *    - Estados hover claros
 *    - CTAs prominentes
 * 
 * 4. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Preview de imagen
 *    - Texto visible
 *    - Plataforma con icono
 *    - Fecha formateada
 * 
 * 5. CREDIBILIDAD
 *    - Confirmación de datos
 *    - Preview antes de enviar
 *    - Contador de caracteres
 *    - Timezone visible
 * 
 * 6. MINIMIZAR CARGA COGNITIVA
 *    - Campos organizados lógicamente
 *    - Una decisión a la vez
 *    - Defaults inteligentes
 */

// Tipos
export interface GeneratedContent {
  id: string;
  generatedText: string;
  generatedImageUrl?: string;
  prompt?: string;
}

export interface SocialConnection {
  id: number;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  username?: string;
}

interface ImageScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  content: GeneratedContent | null;
  connections: SocialConnection[];
}

export const ImageScheduleModal: React.FC<ImageScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  onScheduled, 
  content, 
  connections 
}) => {
  const [publishAt, setPublishAt] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [schedulingStep, setSchedulingStep] = useState<'idle' | 'uploading' | 'success'>('idle');
  
  const imageConnections = connections.filter(c => 
    ['instagram', 'facebook', 'linkedin', 'twitter'].includes(c.platform)
  );

  // Reset al abrir - MINIMIZAR ERRORES
  useEffect(() => {
    if (isOpen) {
      setPublishAt('');
      setSelectedConnectionId('');
      setValidationError(null);
      setSchedulingStep('idle');
      setShowPreview(false);
    }
  }, [isOpen]);

  // Validación en tiempo real - FEEDBACK INMEDIATO
  useEffect(() => {
    if (!publishAt || !selectedConnectionId) {
      setValidationError(null);
      return;
    }

    const selectedDate = new Date(publishAt);
    const now = new Date();

    if (selectedDate <= now) {
      setValidationError('La fecha debe ser futura');
    } else if (selectedDate.getTime() - now.getTime() < 5 * 60 * 1000) {
      setValidationError('Programa con al menos 5 minutos de anticipación');
    } else {
      setValidationError(null);
    }
  }, [publishAt, selectedConnectionId]);

  // Helper para iconos de plataforma - RECONOCIMIENTO
  const getPlatformIcon = (platform: string) => {
    const icons = {
      instagram: <Instagram className="w-4 h-4 text-pink-500" />,
      facebook: <Facebook className="w-4 h-4 text-blue-500" />,
      twitter: <Twitter className="w-4 h-4 text-sky-500" />,
      linkedin: <Linkedin className="w-4 h-4 text-blue-600" />
    };
    return icons[platform as keyof typeof icons] || <ImageIcon className="w-4 h-4" />;
  };

  // Helper para color de plataforma - PRIMING
  const getPlatformColor = (platform: string) => {
    const colors = {
      instagram: 'text-pink-500',
      facebook: 'text-blue-500',
      twitter: 'text-sky-500',
      linkedin: 'text-blue-600'
    };
    return colors[platform as keyof typeof colors] || 'text-gray-400';
  };

  // Handler de submit - FEEDBACK INMEDIATO
  const handleSubmit = async () => {
    if (!content || !selectedConnectionId || !publishAt) {
      toast.warn("Completa todos los campos requeridos");
      return;
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    setIsScheduling(true);
    setSchedulingStep('uploading');

    try {
      await axios.post('/api/social/schedule-post', {
        socialConnectionId: parseInt(selectedConnectionId),
        content: content.generatedText,
        imageUrl: content.generatedImageUrl,
        publishAt: new Date(publishAt).toISOString(),
      }, { withCredentials: true });
      
      setSchedulingStep('success');
      toast.success("¡Publicación programada exitosamente! 🎉", {
        icon: <span>"✨"</span>
      });

      // Esperar animación de éxito
      setTimeout(() => {
        onScheduled();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setSchedulingStep('idle');
      
      const errorMessage = error?.response?.data?.message || 
                          "No se pudo programar la publicación";
      toast.error(errorMessage);
    } finally {
      setTimeout(() => setIsScheduling(false), 1500);
    }
  };

  // Obtener conexión seleccionada
  const selectedConnection = imageConnections.find(
    c => c.id.toString() === selectedConnectionId
  );

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
                className="p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20 shadow-lg"
              >
                <CalendarClock className="w-6 h-6 text-pink-400" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-black text-white mb-1">
                  Programar Publicación
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-base">
                  Configura cuándo y dónde se publicará tu contenido
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
            
          {/* Preview Section - RECONOCIMIENTO */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Preview del Contenido
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
                  className="overflow-hidden"
                >
                  <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800 space-y-3">
                    {content.generatedImageUrl && (
                      <div className="relative rounded-lg overflow-hidden">
                        <img 
                          src={content.generatedImageUrl} 
                          alt="Preview" 
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}
                    <p className="text-sm text-gray-300 italic">
                      {content.generatedText}
                    </p>
                    {content.generatedText && (
                      <Badge variant="outline" className="bg-gray-800/50 text-gray-400 border-gray-700">
                        {content.generatedText.length} caracteres
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Copy para referencia */}
            {!showPreview && (
              <Textarea 
                value={content.generatedText || ''} 
                readOnly 
                className="bg-gray-950/50 border-gray-700 min-h-[100px] text-gray-400 resize-none focus:border-purple-500"
              />
            )}
          </motion.div>

          {/* Platform Selection - AFFORDANCE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Plataforma de Publicación
            </Label>
            
            {imageConnections.length > 0 ? (
              <Select onValueChange={setSelectedConnectionId} value={selectedConnectionId}>
                <SelectTrigger className={cn(
                  "bg-gray-950/50 border-gray-700 h-12 transition-all",
                  selectedConnectionId && "border-pink-500/50 bg-pink-500/5"
                )}>
                  <SelectValue placeholder="Selecciona una plataforma" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  {imageConnections.map(c => (
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
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-400 mb-1">
                    No hay cuentas conectadas
                  </p>
                  <p className="text-xs text-amber-300/80">
                    Conecta al menos una red social para programar publicaciones
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Date/Time Selection - MINIMIZAR ERRORES */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Fecha y Hora de Publicación
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              <Input 
                type="datetime-local" 
                value={publishAt} 
                onChange={e => setPublishAt(e.target.value)} 
                className={cn(
                  "bg-gray-950/50 border-gray-700 pl-11 h-12 transition-all",
                  "focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20",
                  publishAt ? !validationError ? "border-emerald-500/50 bg-emerald-500/5" : "" : "",
                  validationError ? "border-red-500/50 bg-red-500/5" : ""
                )}
              />
            </div>

            {/* Validation Error - FEEDBACK INMEDIATO */}
            <AnimatePresence>
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timezone info - CREDIBILIDAD */}
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Zona horaria: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </motion.div>

          {/* Summary Card - RECONOCIMIENTO */}
          {selectedConnection && publishAt && !validationError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-white">
                    Resumen de Publicación
                  </p>
                  <div className="space-y-1 text-xs text-gray-400">
                    <p className="flex items-center gap-2">
                      {getPlatformIcon(selectedConnection.platform)}
                      <span className="capitalize">{selectedConnection.platform}</span>
                      {selectedConnection.username && (
                        <span className="text-gray-500">@{selectedConnection.username}</span>
                      )}
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
            className="flex-1 sm:flex-none border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleSubmit} 
            disabled={
              isScheduling || 
              !selectedConnectionId || 
              !publishAt || 
              !!validationError ||
              imageConnections.length === 0
            }
            className={cn(
              "flex-1 sm:flex-none min-w-[160px] font-bold transition-all duration-300",
              schedulingStep === 'success' 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-lg hover:shadow-xl"
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
                  Programar Publicación
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};