/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'react-toastify';

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void; // Para recargar los eventos del calendario
}

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({ isOpen, onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    title: 'Tiempo Bloqueado',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Combinamos fecha y hora para el formato ISO que necesita el backend
      const startTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endTime = new Date(`${formData.endDate}T${formData.endTime}`);

      if (endTime <= startTime) {
        toast.error("La fecha de fin debe ser posterior a la fecha de inicio.");
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };
      
      await axios.post('/api/calendar/time-blocks', payload, { withCredentials: true });
      
      toast.success("Tiempo bloqueado exitosamente.");
      onSaveSuccess();
      onClose();
    } catch (error) {
      toast.error("No se pudo crear el bloqueo de tiempo.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center"><Calendar className="mr-3 text-purple-400"/>Bloquear Tiempo</h2>
              <Button variant="ghost" size="default" onClick={onClose}><X className="text-gray-400"/></Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Título del Evento</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="mt-1 w-full p-2 bg-gray-700 rounded-lg border border-gray-600"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Fecha de Inicio</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="mt-1 w-full p-2 bg-gray-700 rounded-lg border border-gray-600"/>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Hora de Inicio</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="mt-1 w-full p-2 bg-gray-700 rounded-lg border border-gray-600"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Fecha de Fin</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="mt-1 w-full p-2 bg-gray-700 rounded-lg border border-gray-600"/>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Hora de Fin</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="mt-1 w-full p-2 bg-gray-700 rounded-lg border border-gray-600"/>
              </div>
            </div>
          </div>
          <div className="p-6 flex justify-end gap-3 border-t border-gray-700">
            <Button variant="outline" onClick={onClose} className="border-gray-600">Cancelar</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? <Loader2 className="animate-spin" /> : 'Crear Bloqueo'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};