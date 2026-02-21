// components/provider/schedule/TimeBlockModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Loader2, Plus, Sparkles, Clock, AlertCircle,
  X, Coffee, Utensils, Plane, Sun, Info, CheckCircle2, Zap
} from 'lucide-react';
import { toast } from 'react-toastify';

// 🚀 IMPORTAMOS TU INSTANCIA DE AXIOS

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTimeBlock } from '@/hooks/useTimeBlock';

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  initialDate?: Date;
}

// Templates predefinidos
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
  isOpen, onClose, onSaveSuccess, initialDate 
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
  const { createBlock, isCreating } = useTimeBlock();
  // Prellenar al abrir
  useEffect(() => {
    if (isOpen) {
      const today = initialDate || new Date();
      // Ajuste de zona horaria para evitar que dé el día anterior
      const offset = today.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(today.getTime() - offset)).toISOString().split('T')[0];
      
      setFormData({
        title: 'Tiempo Personal',
        startDate: localISOTime,
        startTime: '12:00',
        endDate: localISOTime,
        endTime: '13:00',
      });
      
      setSavingStep('idle');
      setValidationError('');
      setSelectedTemplate(null);
    }
  }, [isOpen, initialDate]);

  // Calcular duración y validar
  useEffect(() => {
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      setDuration(diffMins);

      if (diffMins <= 0) {
        setValidationError('La hora de fin debe ser posterior al inicio');
      } else {
        setValidationError('');
      }
    }
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyTemplate = (templateId: string) => {
    const template = blockTemplates.find(t => t.id === templateId);
    if (!template) return;

    const startStr = formData.startDate || new Date().toISOString().split('T')[0];
    const startTimeStr = '12:00'; 
    const [hours, minutes] = startTimeStr.split(':').map(Number);
    
    const startObj = new Date(`${startStr}T00:00:00`);
    startObj.setHours(hours, minutes);
    
    const endObj = new Date(startObj.getTime() + template.duration * 60000);
    
    setFormData({
      title: template.title,
      startDate: startStr,
      startTime: startTimeStr,
      endDate: endObj.toISOString().split('T')[0],
      endTime: `${String(endObj.getHours()).padStart(2, '0')}:${String(endObj.getMinutes()).padStart(2, '0')}`
    });
    
    setSelectedTemplate(templateId);
    toast.success(`Plantilla "${template.title}" aplicada`);
  };

  const handleSave = async () => {
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSavingStep('saving'); // Controlamos la animación del botón

    // Formato ISO exacto
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

    // 🚀 USAMOS EL HOOK
    const success = await createBlock({
      startDateTime,
      endDateTime,
      reason: formData.title // Mapeamos el título a la propiedad reason de Java
    });

    if (success) {
      setSavingStep('success');
      toast.success("¡Tiempo bloqueado exitosamente! 🎉");
      setTimeout(() => {
        onSaveSuccess();
        onClose();
      }, 1500);
    } else {
      setSavingStep('idle');
    }
  };

  const isFormValid = formData.startDate && formData.startTime && formData.endDate && formData.endTime && formData.title && !validationError;

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="bg-gray-950 border-gray-800 text-white sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
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
              <div className="flex-1 text-left">
                <DialogTitle className="text-2xl font-black text-white mb-1">
                  Bloquear Horario
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-base">
                  Reserva tiempo para asuntos personales, comidas o descansos
                </DialogDescription>
              </div>
            </div>

            {!loading && (
              <Button variant="ghost" size="default" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Templates */}
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
                      isSelected ? cn("bg-gray-900", template.borderColor, template.bgColor, "ring-2 ring-purple-500") : "bg-gray-900/50 border-gray-800 hover:border-purple-500/30"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", isSelected ? template.bgColor : "bg-gray-800")}>
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

          {/* Title Input */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
            <Label className="flex items-center text-sm font-bold text-gray-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" /> Título del Evento
            </Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ej: Almuerzo, Vacaciones..."
              className="bg-gray-900 border-gray-700 h-12 text-base transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              disabled={loading}
            />
          </motion.div>

          {/* Date/Time Pickers */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid sm:grid-cols-2 gap-4">
            
            {/* Start */}
            <div className="space-y-3 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4" /> Inicio
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Desde</Badge>
              </div>
              <div className="space-y-2 flex flex-col">
                <Input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="bg-gray-900 border-gray-700 h-10 text-sm focus:border-emerald-500" disabled={loading} style={{ colorScheme: 'dark' }} />
                <Input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="bg-gray-900 border-gray-700 h-10 text-sm focus:border-emerald-500" disabled={loading} style={{ colorScheme: 'dark' }} />
              </div>
            </div>

            {/* End */}
            <div className="space-y-3 p-4 bg-red-500/5 rounded-xl border border-red-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4" /> Fin
                </div>
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Hasta</Badge>
              </div>
              <div className="space-y-2 flex flex-col">
                <Input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="bg-gray-900 border-gray-700 h-10 text-sm focus:border-red-500" disabled={loading} style={{ colorScheme: 'dark' }} />
                <Input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="bg-gray-900 border-gray-700 h-10 text-sm focus:border-red-500" disabled={loading} style={{ colorScheme: 'dark' }} />
              </div>
            </div>
          </motion.div>

          {/* Validation Error */}
          {validationError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-red-400">Error de Validación</p>
                <p className="text-xs text-red-300/80 mt-1">{validationError}</p>
              </div>
            </motion.div>
          )}
        </div>

        <Separator className="bg-gray-800" />

        {/* Footer */}
        <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 sm:flex-none border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Cancelar
          </Button>
          
          <Button 
            onClick={handleSave} 
            disabled={loading || !isFormValid}
            className={cn(
              "flex-1 sm:flex-none min-w-[180px] h-10 font-bold shadow-xl transition-all duration-300",
              savingStep === 'success' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            )}
          >
            <AnimatePresence mode="wait">
              {savingStep === 'saving' && (
                <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                </motion.div>
              )}
              {savingStep === 'success' && (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> ¡Creado!
                </motion.div>
              )}
              {savingStep === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Bloquear Tiempo
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};