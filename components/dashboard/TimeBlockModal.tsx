"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, Plus, Sparkles, Clock, AlertCircle } from 'lucide-react';
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

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  initialDate?: Date; // Opcional: prellenar fecha si se abrió desde el calendario
}

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

  // Efecto para prellenar o resetear datos al abrir
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
    }
  }, [isOpen, initialDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      if (endDateTime <= startDateTime) {
        toast.error("La hora de fin debe ser posterior al inicio.");
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        type: 'BLOCK' // Tipo de evento para diferenciar de citas
      };
      
      // Simulación o llamada real
      await axios.post('/api/calendar/time-blocks', payload, { withCredentials: true });
      
      toast.success("Tiempo bloqueado en la agenda.");
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo crear el bloqueo.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.startDate && formData.startTime && formData.endDate && formData.endTime && formData.title;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[500px]">
        
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
                <DialogTitle className="text-xl font-bold">Bloquear Horario</DialogTitle>
                <DialogDescription className="text-gray-400">
                    Reserva tiempo para asuntos personales, comidas o descansos.
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
            
            {/* Título */}
            <div className="space-y-2">
                <Label className="flex items-center text-sm font-medium text-gray-300">
                    <Sparkles className="w-3 h-3 mr-2 text-yellow-400" />
                    Título del Evento
                </Label>
                <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ej: Almuerzo, Vacaciones..."
                    className="bg-gray-950 border-gray-700 h-11 focus:border-purple-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Inicio */}
                <div className="space-y-3 p-3 bg-gray-950/50 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        <Clock className="w-3 h-3" /> Inicio
                    </div>
                    <div className="space-y-2">
                        <Input 
                            type="date" 
                            name="startDate" 
                            value={formData.startDate} 
                            onChange={handleInputChange}
                            className="bg-gray-900 border-gray-700 h-9 text-sm"
                        />
                        <Input 
                            type="time" 
                            name="startTime" 
                            value={formData.startTime} 
                            onChange={handleInputChange}
                            className="bg-gray-900 border-gray-700 h-9 text-sm"
                        />
                    </div>
                </div>

                {/* Fin */}
                <div className="space-y-3 p-3 bg-gray-950/50 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider">
                        <Clock className="w-3 h-3" /> Fin
                    </div>
                    <div className="space-y-2">
                        <Input 
                            type="date" 
                            name="endDate" 
                            value={formData.endDate} 
                            onChange={handleInputChange}
                            className="bg-gray-900 border-gray-700 h-9 text-sm"
                        />
                        <Input 
                            type="time" 
                            name="endTime" 
                            value={formData.endTime} 
                            onChange={handleInputChange}
                            className="bg-gray-900 border-gray-700 h-9 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Tip */}
            <div className="flex gap-3 p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-xs text-blue-300">
                    Este evento bloqueará tu disponibilidad en el calendario público. Los pacientes no podrán agendar citas en este intervalo.
                </p>
            </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || !isFormValid}
            className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
          >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...
                </>
            ) : (
                <>
                    <Plus className="mr-2 h-4 w-4" /> Crear Bloqueo
                </>
            )}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};