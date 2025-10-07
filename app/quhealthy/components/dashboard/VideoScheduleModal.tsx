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
import { GeneratedContent } from '@/app/quhealthy/types/marketplace'; // Asumiendo que has movido la interfaz aquí


// Definimos los tipos para las props del modal
interface SocialConnection {
  id: number;
  platform: string;
}

interface VideoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: GeneratedContent | null;
  connection: SocialConnection | undefined;
}

export const VideoScheduleModal: React.FC<VideoScheduleModalProps> = ({ isOpen, onClose, content, connection }) => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [publishAt, setPublishAt] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Llenamos el formulario cuando el contenido cambia
  useEffect(() => {
    if (content) {
      // Podemos usar Gemini para sugerir un título a partir del prompt
      setTitle(`Video sobre: ${content.prompt}` || '');
    }
  }, [content]);

  const handleSubmit = async () => {
    if (!content || !connection) return toast.error("Faltan datos para programar.");
    setIsScheduling(true);
    try {
      await axios.post('/api/social/schedule-post', {
        socialConnectionId: connection.id,
        content: content.generatedText, // Descripción del video
        videoUrl: content.generatedVideoUrl,
        title,
        tags: tags.split(',').map(t => t.trim()),
        privacyStatus,
        publishAt: new Date(publishAt).toISOString(),
      }, { withCredentials: true });
      toast.success("¡Video programado para YouTube exitosamente!");
      onClose();
    } catch (error) {
      toast.error("No se pudo programar el video.");
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
            <h2 className="text-xl font-bold text-white">Programar Video en YouTube</h2>
            <Button variant="ghost" size="default" onClick={onClose}><X/></Button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label htmlFor="title">Título del Video</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" value={content.generatedText || ''} readOnly rows={4} />
            </div>
            <div>
              <Label htmlFor="tags">Tags (separados por coma)</Label>
              <Input id="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="salud, bienestar, nutrición"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="privacy">Visibilidad</Label>
                <Select onValueChange={setPrivacyStatus} value={privacyStatus}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                    <SelectItem value="unlisted">No listado</SelectItem>
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
              Programar Video
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};