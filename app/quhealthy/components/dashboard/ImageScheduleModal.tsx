/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2, CalendarClock } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { GeneratedContent, SocialConnection } from '@/app/quhealthy/types/marketplace';

interface ImageScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void; // Para recargar la galería
  content: GeneratedContent | null;
  connections: SocialConnection[];
}

export const ImageScheduleModal: React.FC<ImageScheduleModalProps> = ({ isOpen, onClose, onScheduled, content, connections }) => {
  const [publishAt, setPublishAt] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  
  useEffect(() => {
    // Reset state when modal opens
    if(isOpen) {
        setPublishAt('');
        setSelectedConnectionId('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!content || !selectedConnectionId || !publishAt) {
      return toast.warn("Por favor, selecciona una plataforma y una fecha.");
    }
    setIsScheduling(true);
    try {
      await axios.post('/api/social/schedule-post', {
        socialConnectionId: parseInt(selectedConnectionId),
        content: content.generatedText,
        imageUrl: content.generatedImageUrl,
        publishAt: new Date(publishAt).toISOString(),
      }, { withCredentials: true });
      toast.success("¡Publicación programada exitosamente!");
      onScheduled();
      onClose();
    } catch (error) {
      toast.error("No se pudo programar la publicación.");
    } finally {
      setIsScheduling(false);
    }
  };

  if (!isOpen || !content) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Programar Publicación</h2>
            <Button variant="ghost" size="default" onClick={onClose}><X/></Button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <Label>Contenido</Label>
              <Textarea value={content.generatedText || ''} readOnly rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">Publicar en</Label>
                <Select onValueChange={setSelectedConnectionId} value={selectedConnectionId}>
                  <SelectTrigger id="platform"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                  <SelectContent>
                    {connections.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.platform.charAt(0).toUpperCase() + c.platform.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="publishAt">Fecha y Hora</Label>
                <Input id="publishAt" type="datetime-local" value={publishAt} onChange={e => setPublishAt(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="p-6 flex justify-end border-t border-gray-700">
            <Button onClick={handleSubmit} disabled={isScheduling}>
              {isScheduling ? <Loader2 className="animate-spin mr-2"/> : <CalendarClock className="w-4 h-4 mr-2"/>}
              Programar
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};