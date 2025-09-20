/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// 1. Definimos la 'forma' de la cita que el modal necesita
interface Appointment {
  id: number;
  // Puedes añadir más campos si los necesitas mostrar en el modal, ej: consumer: { name: string }
}

// 2. Definimos las props que el componente espera recibir
interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  appointment: Appointment | null;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ appointment, isOpen, onClose, onComplete }) => {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Limpiamos las notas cada vez que se abre el modal con una nueva cita
  useEffect(() => {
    if (isOpen) {
      setNotes('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!appointment) return;
    setIsLoading(true);
    try {
      await axios.put(`/api/appointments/${appointment.id}/complete`, 
        { notes }, 
        { withCredentials: true }
      );
      toast.success("Cita completada exitosamente.");
      onComplete(); // Llama a la función para recargar las citas en la página principal
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo completar la cita.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg"
        >
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <CheckCircle className="text-green-400" />
              Completar Cita
            </h2>
            <Button variant="ghost" size="default" onClick={onClose} className="text-gray-400 hover:text-white">
              <X />
            </Button>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-400 mb-4">
              Añade notas privadas para tu registro (no serán visibles para el cliente). Al confirmar, se enviará una solicitud de reseña al cliente.
            </p>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: El paciente respondió bien al tratamiento, agendar seguimiento en 2 semanas..."
              className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
              rows={5}
            />
          </div>
          <div className="p-6 flex justify-end gap-3 border-t border-gray-700 bg-gray-800/50">
            <Button variant="outline" onClick={onClose} className="border-gray-600 hover:bg-gray-700">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading 
                ? <Loader2 className="animate-spin" /> 
                : "Confirmar y Enviar Solicitud de Reseña"
              }
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};