/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Loader2, 
  CheckCircle2,
  X,
  AlertCircle,
  Info,
  Calendar,
  User,
  Sparkles,
  Mail,
  Star,
  Clock,
  FileText
} from 'lucide-react';

// ShadCN UI Components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * CompletionModal Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. CREDIBILIDAD Y TRANSPARENCIA
 *    - Preview de lo que sucederá
 *    - "Paciente no verá esto" claro
 *    - Solicitud de review explicada
 *    - Sin sorpresas
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Loading states
 *    - Success animation
 *    - Progress indication
 *    - Visual confirmation
 * 
 * 3. MINIMIZAR ERRORES
 *    - Confirmación requerida
 *    - Preview de acción
 *    - Cancelar visible
 *    - Validación clara
 * 
 * 4. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Resumen de cita visible
 *    - Iconos descriptivos
 *    - Labels claros
 *    - Info contextual
 * 
 * 5. AFFORDANCE
 *    - CTA destacado
 *    - Estados hover claros
 *    - Disabled states
 *    - Visual hierarchy
 * 
 * 6. PRIMING
 *    - Verde = completado (positivo)
 *    - Success icon prominente
 *    - "Confirmar" en lugar de "Aceptar"
 *    - Lenguaje positivo
 */

// Tipos
interface Appointment {
  id: number;
  consumer?: { name: string; email?: string };
  service?: { name: string; duration?: string };
  date?: string;
  time?: string;
}

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  appointment: Appointment | null;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ 
  appointment, 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completionStep, setCompletionStep] = useState<'idle' | 'processing' | 'success'>('idle');
  const [charCount, setCharCount] = useState(0);

  // Reset al abrir - MINIMIZAR ERRORES
  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setCharCount(0);
      setCompletionStep('idle');
    }
  }, [isOpen]);

  // Update char count - FEEDBACK INMEDIATO
  useEffect(() => {
    setCharCount(notes.length);
  }, [notes]);

  const handleSubmit = async () => {
    if (!appointment) return;

    setIsLoading(true);
    setCompletionStep('processing');

    try {
      // Simulación de API (reemplazar con llamada real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      // await axios.put(`/api/appointments/${appointment.id}/complete`, { notes });

      setCompletionStep('success');
      toast.success("¡Cita completada exitosamente! 🎉", {
        icon: <span>"✅"</span>
      });

      // Esperar animación de éxito
      setTimeout(() => {
        onComplete();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setCompletionStep('idle');
      toast.error(error?.response?.data?.message || "Error al completar la cita");
    } finally {
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header - JERARQUÍA VISUAL */}
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="p-3 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20 shadow-lg"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </motion.div>
              
              <div className="flex-1">
                <DialogTitle className="text-2xl font-black text-white mb-1">
                  Completar Cita
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-base">
                  Confirma que el servicio fue realizado exitosamente
                </DialogDescription>
              </div>
            </div>

            {!isLoading && (
              <Button
                variant="ghost"
                size="default"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Appointment Summary - RECONOCIMIENTO */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-950/80 to-gray-900/50 p-5 rounded-2xl border border-gray-800 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Resumen de la Cita
              </p>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Por Completar
              </Badge>
            </div>

            <div className="space-y-3">
              {/* Patient Info */}
              {appointment.consumer && (
                <div className="flex items-center gap-3 bg-gray-950/50 p-3 rounded-lg">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <User className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Paciente</p>
                    <p className="text-sm font-semibold text-white">
                      {appointment.consumer.name}
                    </p>
                    {appointment.consumer.email && (
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {appointment.consumer.email}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Service Info */}
              {appointment.service && (
                <div className="flex items-center gap-3 bg-gray-950/50 p-3 rounded-lg">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Servicio</p>
                    <p className="text-sm font-semibold text-white">
                      {appointment.service.name}
                    </p>
                    {appointment.service.duration && (
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {appointment.service.duration}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Date/Time Info */}
              {(appointment.date || appointment.time) && (
                <div className="flex items-center gap-3 bg-gray-950/50 p-3 rounded-lg">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Fecha y Hora</p>
                    <p className="text-sm font-semibold text-white">
                      {appointment.date} {appointment.time && `• ${appointment.time}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* What Will Happen - CREDIBILIDAD */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold text-blue-400">
                  ¿Qué sucederá al completar?
                </p>
                <ul className="space-y-1.5 text-xs text-blue-300/80">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>La cita se marcará como completada en tu calendario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Mail className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>Se enviará un email automático al paciente solicitando calificación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>El paciente podrá dejarte una reseña de 1 a 5 estrellas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>Tus notas privadas se guardarán en el historial</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <Separator className="bg-gray-800" />

          {/* Notes Section - AFFORDANCE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <label htmlFor="notes" className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                Notas Privadas (Opcional)
              </label>
              <span className={cn(
                "text-xs font-medium",
                charCount > 500 ? "text-red-400" : "text-gray-500"
              )}>
                {charCount}/500
              </span>
            </div>

            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              placeholder="Ej: Paciente mostró mejoría notable. Se recomendó seguimiento en 15 días. Continuar con tratamiento actual."
              className={cn(
                "bg-gray-950/50 border-gray-700 min-h-[120px] resize-none transition-all",
                "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
                charCount > 500 ? "border-red-500/50 bg-red-500/5" : "" 
              )}
              disabled={isLoading}
            />

            {/* Privacy indicator */}
            <div className="flex items-start gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-purple-300">
                <span className="font-semibold">Privado:</span> Estas notas son solo para ti. 
                El paciente no tendrá acceso a esta información.
              </p>
            </div>
          </motion.div>
        </div>

        <Separator className="bg-gray-800" />

        {/* Footer - JERARQUÍA CLARA */}
        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancelar
          </Button>

          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className={cn(
              "flex-1 sm:flex-none min-w-[200px] h-12 font-bold shadow-xl transition-all duration-300",
              completionStep === 'success'
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500"
            )}
          >
            <AnimatePresence mode="wait">
              {completionStep === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </motion.div>
              )}
              {completionStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  ¡Completado!
                </motion.div>
              )}
              {completionStep === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmar y Finalizar
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};