"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Loader2, 
  Plus, 
  Sparkles, 
  Clock, 
  AlertCircle,
  X,
  Coffee,
  Utensils,
  Plane,
  Sun,
  Moon,
  Info,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * TimeBlockModal Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. MINIMIZAR CARGA COGNITIVA
 *    - Templates predefinidos (Almuerzo, Break, Vacaciones)
 *    - Auto-cálculo de duración
 *    - Defaults inteligentes
 *    - Quick actions
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Validación en tiempo real
 *    - Preview de duración
 *    - Estados visuales claros
 *    - Error messages inline
 * 
 * 3. MINIMIZAR ERRORES
 *    - Validación de fechas
 *    - End time auto-adjust
 *    - Warnings visibles
 *    - Confirmación clara
 * 
 * 4. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos por tipo de bloqueo
 *    - Colores distintivos
 *    - Labels claros
 *    - Templates visuales
 * 
 * 5. AFFORDANCE
 *    - Templates clickeables
 *    - Estados disabled claros
 *    - Hover effects
 *    - Visual hierarchy
 * 
 * 6. CREDIBILIDAD
 *    - Duración calculada visible
 *    - Impacto explicado
 *    - Preview claro
 *    - Sin sorpresas
 */

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  initialDate?: Date;
}

// Templates predefinidos - MINIMIZAR CARGA COGNITIVA
const blockTemplates = [
  {
    id: 'lunch',
    title: 'Almuerzo',
    icon: Utensils,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    duration: 60, // minutos
  },
  {
    id: 'break',
    title: 'Descanso',
    icon: Coffee,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    duration: 30,
  },
  {
    id: 'vacation',
    title: 'Vacaciones',
    icon: Plane,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    duration: 480, // 8 horas
  },
  {
    id: 'morning',
    title: 'Rutina Matutina',
    icon: Sun,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    duration: 120, // 2 horas
  }
];

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({ 
  isOpen, 
  onClose, 
  onSaveSuccess,
  initialDate 
}) => {
  const [formData, setFormData] = useState({
    title: 'Tiempo Bloqueado',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [savingStep, setSavingStep] = useState<'idle' | 'saving' | 'success'>('idle');
  const [validationError, setValidationError] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Prellenar o resetear - DEFAULTS INTELIGENTES
  useEffect(() => {
    if (isOpen) {
      const today = initialDate || new Date();
      const dateString = today.toISOString().split('T')[0];
      
      setFormData({
        title: 'Tiempo Personal',
        startDate: dateString,
        startTime: '12:00',
        endDate: dateString,
        endTime: '13:00',
      });
      
      setSavingStep('idle');
      setValidationError('');
      setSelectedTemplate(null);
    }
  }, [isOpen, initialDate]);

  // Calcular duración automáticamente - FEEDBACK INMEDIATO
  useEffect(() => {
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      setDuration(diffMins);

      // Validación - MINIMIZAR ERRORES
      if (diffMins <= 0) {
        setValidationError('La hora de fin debe ser posterior al inicio');
      } else if (diffMins > 1440) { // > 24 horas
        setValidationError('El bloqueo no puede exceder 24 horas en un día');
      } else {
        setValidationError('');
      }
    }
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Aplicar template - SATISFICING
  const applyTemplate = (templateId: string) => {
    const template = blockTemplates.find(t => t.id === templateId);
    if (!template) return;

    const now = new Date(formData.startDate || new Date().toISOString().split('T')[0]);
    const startTime = '12:00'; // Default start
    const [hours, minutes] = startTime.split(':').map(Number);
    
    const start = new Date(now);
    start.setHours(hours, minutes);
    
    const end = new Date(start.getTime() + template.duration * 60000);
    
    setFormData(prev => ({
      ...prev,
      title: template.title,
      startTime,
      endTime: `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
    }));
    
    setSelectedTemplate(templateId);
    toast.success(`Plantilla "${template.title}" aplicada`);
  };

  const handleSave = async () => {
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setSavingStep('saving');

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      const payload = {
        title: formData.title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        type: 'BLOCK'
      };
      
      await axios.post('/api/calendar/time-blocks', payload, { withCredentials: true });
      
      setSavingStep('success');
      toast.success("¡Tiempo bloqueado exitosamente! 🎉");

      setTimeout(() => {
        onSaveSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setSavingStep('idle');
      toast.error(error?.response?.data?.message || "No se pudo crear el bloqueo");
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const isFormValid = formData.startDate && formData.startTime && formData.endDate && formData.endTime && formData.title && !validationError;

  // Helper para formatear duración - CREDIBILIDAD
  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        
        {/* Header - JERARQUÍA VISUAL */}
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 shadow-lg"
              >
                <Calendar className="w-6 h-6 text-purple-400" />
              </motion.div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-black text-white mb-1">
                  Bloquear Horario
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-base">
                  Reserva tiempo para asuntos personales, comidas o descansos
                </DialogDescription>
              </div>
            </div>

            {!loading && (
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
          
          {/* Templates - SATISFICING */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Plantillas Rápidas
              </p>
              <Info className="w-4 h-4 text-gray-600" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {blockTemplates.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate === template.id;
                
                return (
                  <motion.button
                    key={template.id}
                    onClick={() => applyTemplate(template.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                      isSelected
                        ? cn("bg-gray-900", template.borderColor, template.bgColor, "ring-2 ring-purple-500")
                        : "bg-gray-900/50 border-gray-800 hover:border-purple-500/30"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected ? template.bgColor : "bg-gray-800"
                    )}>
                      <Icon className={cn("w-4 h-4", isSelected ? template.color : "text-gray-500")} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-white">{template.title}</p>
                      <p className="text-xs text-gray-500">{formatDuration(template.duration)}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Título - AFFORDANCE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label className="flex items-center text-sm font-bold text-gray-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              Título del Evento
            </Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ej: Almuerzo, Vacaciones, Reunión Personal..."
              className={cn(
                "bg-gray-950 border-gray-700 h-12 text-base transition-all",
                "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              )}
              disabled={loading}
            />
          </motion.div>

          {/* Date/Time Grid - JERARQUÍA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {/* Inicio */}
            <div className="space-y-3 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4" /> Inicio
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  Desde
                </Badge>
              </div>
              <div className="space-y-2">
                <Input 
                  type="date" 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleInputChange}
                  className="bg-gray-950 border-gray-700 h-10 text-sm focus:border-emerald-500"
                  disabled={loading}
                />
                <Input 
                  type="time" 
                  name="startTime" 
                  value={formData.startTime} 
                  onChange={handleInputChange}
                  className="bg-gray-950 border-gray-700 h-10 text-sm focus:border-emerald-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Fin */}
            <div className="space-y-3 p-4 bg-red-500/5 rounded-xl border border-red-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4" /> Fin
                </div>
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                  Hasta
                </Badge>
              </div>
              <div className="space-y-2">
                <Input 
                  type="date" 
                  name="endDate" 
                  value={formData.endDate} 
                  onChange={handleInputChange}
                  className="bg-gray-950 border-gray-700 h-10 text-sm focus:border-red-500"
                  disabled={loading}
                />
                <Input 
                  type="time" 
                  name="endTime" 
                  value={formData.endTime} 
                  onChange={handleInputChange}
                  className="bg-gray-950 border-gray-700 h-10 text-sm focus:border-red-500"
                  disabled={loading}
                />
              </div>
            </div>
          </motion.div>

          {/* Duration Preview - FEEDBACK INMEDIATO */}
          {duration > 0 && !validationError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Duración Total</p>
                  <p className="text-xs text-gray-400">Tiempo que se bloqueará</p>
                </div>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-lg px-4 py-2">
                {formatDuration(duration)}
              </Badge>
            </motion.div>
          )}

          {/* Error Message - MINIMIZAR ERRORES */}
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-400">Error de Validación</p>
                <p className="text-xs text-red-300/80 mt-1">{validationError}</p>
              </div>
            </motion.div>
          )}

          {/* Impact Info - CREDIBILIDAD */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold text-blue-400">
                  ¿Qué sucederá al bloquear este tiempo?
                </p>
                <ul className="space-y-1.5 text-xs text-blue-300/80">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>Este horario quedará marcado como no disponible en tu calendario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>Los pacientes no podrán agendar citas en este intervalo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>Aparecerá en tu calendario con el título que defines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>Puedes editarlo o eliminarlo en cualquier momento</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        <Separator className="bg-gray-800" />

        {/* Footer */}
        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-none border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleSave} 
            disabled={loading || !isFormValid}
            className={cn(
              "flex-1 sm:flex-none min-w-[180px] h-12 font-bold shadow-xl transition-all duration-300",
              savingStep === 'success'
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            )}
          >
            <AnimatePresence mode="wait">
              {savingStep === 'saving' && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando Bloqueo...
                </motion.div>
              )}
              {savingStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  ¡Creado!
                </motion.div>
              )}
              {savingStep === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Crear Bloqueo
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};