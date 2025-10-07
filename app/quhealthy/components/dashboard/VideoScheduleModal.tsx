/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2, CalendarClock } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { GeneratedContent, SocialConnection } from '@/app/quhealthy/types/marketplace';

interface VideoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  content: GeneratedContent | null;
  connections: SocialConnection[];
}

export const VideoScheduleModal: React.FC<VideoScheduleModalProps> = ({ isOpen, onClose, onScheduled, content, connections }) => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [publishAt, setPublishAt] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');

  // Filtramos para mostrar solo las plataformas de video
  const videoConnections = connections.filter(c => c.platform === 'youtube' || c.platform === 'tiktok');

  useEffect(() => {
    if (content) {
      setTitle(`Video sobre: ${content.prompt}` || '');
    }
  }, [content]);

  const handleSubmit = async () => {
    if (!content || !selectedConnectionId || !publishAt) {
      return toast.warn("Por favor, completa todos los campos para programar.");
    }
    setIsScheduling(true);
    try {
      await axios.post('/api/social/schedule-post', {
        socialConnectionId: parseInt(selectedConnectionId),
        content: content.generatedText,
        videoUrl: content.generatedVideoUrl,
        title,
        tags: tags.split(',').map(t => t.trim()),
        privacyStatus,
        publishAt: new Date(publishAt).toISOString(),
      }, { withCredentials: true });
      toast.success("¡Video programado exitosamente!");
      onScheduled();
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
            <h2 className="text-xl font-bold text-white">Programar Video</h2>
            <Button variant="ghost" size="default" onClick={onClose}><X/></Button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label htmlFor="title">Título del Video</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tags">Tags (separados por coma)</Label>
              <Input id="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="salud, bienestar, etc."/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform-video">Publicar en</Label>
                <Select onValueChange={setSelectedConnectionId} value={selectedConnectionId}>
                  <SelectTrigger id="platform-video"><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                  <SelectContent>
                    {videoConnections.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.platform.charAt(0).toUpperCase() + c.platform.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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
            </div>
            <div>
              <Label htmlFor="publishAt">Fecha y Hora de Publicación</Label>
              <Input id="publishAt" type="datetime-local" value={publishAt} onChange={e => setPublishAt(e.target.value)} />
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