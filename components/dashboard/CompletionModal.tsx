/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Loader2, CheckCircle2 } from 'lucide-react';

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

// Tipos
interface Appointment {
  id: number;
  consumer?: { name: string }; // Opcional: mostrar nombre del paciente
  service?: { name: string };  // Opcional: mostrar servicio
}

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  appointment: Appointment | null;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ appointment, isOpen, onClose, onComplete }) => {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setNotes('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!appointment) return;
    setIsLoading(true);
    try {
      // Simulación de API para demo (reemplazar con llamada real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await axios.put(`/api/appointments/${appointment.id}/complete`, { notes });
      
      toast.success("Cita completada y solicitud de reseña enviada.");
      onComplete();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error("Error al completar la cita.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[500px]">
        
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="text-emerald-500 h-6 w-6" />
            Completar Cita
          </DialogTitle>
          <DialogDescription className="text-gray-400 pt-2">
            Confirmas que el servicio fue realizado. Se enviará automáticamente una solicitud de calificación al paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gray-300">
                Notas Privadas (Opcional)
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Paciente mostró mejoría. Se recomendó seguimiento en 15 días."
              className="bg-gray-950 border-gray-700 min-h-[100px] resize-none focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500">
                Estas notas son solo para ti, el paciente no las verá.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                </>
            ) : (
                "Confirmar y Finalizar"
            )}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};