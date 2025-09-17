/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Loader2, Clock, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'react-toastify';

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
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

  const isFormValid = formData.startDate && formData.startTime && formData.endDate && formData.endTime && formData.title;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 rounded-3xl border border-purple-500/20 w-full max-w-lg shadow-2xl overflow-hidden"
        >
          {/* Decorative gradient line */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>
          
          {/* Header */}
          <div className="p-8 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Crear Evento
                  </h2>
                  <p className="text-slate-400 mt-1">Bloquea tiempo en tu agenda</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-xl p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Title Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <label className="flex items-center text-sm font-medium text-slate-300">
                <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                Título del Evento
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Describe tu evento..."
                className="w-full p-4 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-slate-400"
              />
            </motion.div>

            {/* Date and Time Grid */}
            <div className="grid grid-cols-1 gap-6">
              {/* Start DateTime */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-gradient-to-r from-green-500/10 to-transparent rounded-2xl border border-green-500/20"
              >
                <h3 className="flex items-center text-sm font-medium text-green-300 mb-4">
                  <Clock className="w-4 h-4 mr-2" />
                  Fecha y Hora de Inicio
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium">Fecha</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium">Hora</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                  </div>
                </div>
              </motion.div>

              {/* End DateTime */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-gradient-to-r from-red-500/10 to-transparent rounded-2xl border border-red-500/20"
              >
                <h3 className="flex items-center text-sm font-medium text-red-300 mb-4">
                  <Clock className="w-4 h-4 mr-2" />
                  Fecha y Hora de Fin
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium">Fecha</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium">Hora</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20"
            >
              <p className="text-sm text-blue-300">
                💡 <strong>Tip:</strong> Este evento bloqueará el tiempo seleccionado en tu agenda, evitando que se programen citas durante este período.
              </p>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-700/50 bg-slate-800/30">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-400">
                {isFormValid ? (
                  <span className="flex items-center text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Listo para crear
                  </span>
                ) : (
                  <span>Complete todos los campos</span>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="border-slate-600/50 hover:border-slate-500 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all px-6 py-3 rounded-xl"
                >
                  Cancelar
                </Button>
                
                <Button 
                  onClick={handleSave} 
                  disabled={loading || !isFormValid}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all px-8 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Plus className="w-5 h-5" />
                      <span>Crear Evento</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};