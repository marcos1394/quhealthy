"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, CalendarClock, Youtube, Video } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

// Tipos (Localizados para independencia o importar de types/marketing)
export interface GeneratedContent {
  id: string;
  prompt: string;
  generatedText: string;
  generatedVideoUrl?: string;
}

export interface SocialConnection {
  id: number;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook';
  username?: string;
}

interface VideoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  content: GeneratedContent | null;
  connections: SocialConnection[];
}

export const VideoScheduleModal: React.FC<VideoScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  onScheduled, 
  content, 
  connections 
}) => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [publishAt, setPublishAt] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Filtramos para mostrar solo plataformas de video
  const videoConnections = connections.filter(c => c.platform === 'youtube' || c.platform === 'tiktok');

  useEffect(() => {
    if (content) {
      setTitle(content.prompt ? `Video: ${content.prompt}` : '');
    }
  }, [content]);

  const handleSubmit = async () => {
    if (!content || !selectedConnectionId || !publishAt) {
      toast.warn("Por favor, completa los campos requeridos.");
      return;
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
      console.error(error);
      toast.error("Error al programar el video.");
    } finally {
      setIsScheduling(false);
    }
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[550px]">
        
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <Youtube className="w-5 h-5 text-red-500" />
            </div>
            <div>
                <DialogTitle className="text-xl font-bold">Programar Publicación de Video</DialogTitle>
                <DialogDescription className="text-gray-400">
                    Configura los detalles para publicar tu contenido generado.
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-5 py-4">
            
            {/* Título */}
            <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Título del Video</Label>
                <Input 
                    id="title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="bg-gray-950 border-gray-700 focus:border-red-500"
                    placeholder="Escribe un título atractivo..."
                />
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <Label htmlFor="tags" className="text-gray-300">Etiquetas (separadas por comas)</Label>
                <Input 
                    id="tags" 
                    value={tags} 
                    onChange={e => setTags(e.target.value)} 
                    placeholder="salud, bienestar, nutrición..."
                    className="bg-gray-950 border-gray-700 focus:border-red-500"
                />
            </div>

            {/* Plataforma y Privacidad */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-gray-300">Plataforma</Label>
                    <Select onValueChange={setSelectedConnectionId} value={selectedConnectionId}>
                        <SelectTrigger className="bg-gray-950 border-gray-700">
                            <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800">
                            {videoConnections.length > 0 ? (
                                videoConnections.map(c => (
                                    <SelectItem key={c.id} value={c.id.toString()}>
                                        <div className="flex items-center gap-2 capitalize">
                                            {c.platform === 'youtube' && <Youtube className="w-4 h-4 text-red-500"/>}
                                            {c.platform === 'tiktok' && <Video className="w-4 h-4 text-cyan-400"/>}
                                            {c.platform}
                                        </div>
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-xs text-gray-500 text-center">No hay cuentas conectadas</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-300">Visibilidad</Label>
                    <Select onValueChange={setPrivacyStatus} value={privacyStatus}>
                        <SelectTrigger className="bg-gray-950 border-gray-700">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800">
                            <SelectItem value="public">Público</SelectItem>
                            <SelectItem value="private">Privado</SelectItem>
                            <SelectItem value="unlisted">No listado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Fecha de Publicación */}
            <div className="space-y-2">
                <Label htmlFor="publishAt" className="text-gray-300">Fecha y Hora de Publicación</Label>
                <div className="relative">
                    <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                        id="publishAt" 
                        type="datetime-local" 
                        value={publishAt} 
                        onChange={e => setPublishAt(e.target.value)} 
                        className="bg-gray-950 border-gray-700 pl-10 focus:border-red-500"
                    />
                </div>
            </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isScheduling || !selectedConnectionId || !publishAt}
            className="bg-red-600 hover:bg-red-700 text-white min-w-[140px]"
          >
            {isScheduling ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Programando...
                </>
            ) : (
                <>
                    <CalendarClock className="mr-2 h-4 w-4" /> Programar
                </>
            )}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};