"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, CalendarClock, Instagram, Facebook, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

// Tipos
export interface GeneratedContent {
  id: string;
  generatedText: string;
  generatedImageUrl?: string;
  prompt?: string;
}

export interface SocialConnection {
  id: number;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  username?: string;
}

interface ImageScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  content: GeneratedContent | null;
  connections: SocialConnection[];
}

export const ImageScheduleModal: React.FC<ImageScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  onScheduled, 
  content, 
  connections 
}) => {
  const [publishAt, setPublishAt] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  
  // Filtramos plataformas de imagen/texto
  const imageConnections = connections.filter(c => ['instagram', 'facebook', 'linkedin', 'twitter'].includes(c.platform));

  useEffect(() => {
    if(isOpen) {
        setPublishAt('');
        setSelectedConnectionId('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!content || !selectedConnectionId || !publishAt) {
      toast.warn("Selecciona plataforma y fecha.");
      return;
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
      console.error(error);
      toast.error("Error al programar.");
    } finally {
      setIsScheduling(false);
    }
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[500px]">
        
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
                <ImageIcon className="w-5 h-5 text-pink-500" />
            </div>
            <div>
                <DialogTitle className="text-xl font-bold">Programar Post</DialogTitle>
                <DialogDescription className="text-gray-400">
                    Prepara tu imagen para ser publicada automáticamente.
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-5 py-4">
            
            {/* Contenido (Solo lectura para referencia) */}
            <div className="space-y-2">
                <Label className="text-gray-300">Copy Generado</Label>
                <Textarea 
                    value={content.generatedText || ''} 
                    readOnly 
                    className="bg-gray-950 border-gray-700 min-h-[80px] text-gray-400 resize-none"
                />
            </div>

            {/* Plataforma */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-gray-300">Publicar en</Label>
                    <Select onValueChange={setSelectedConnectionId} value={selectedConnectionId}>
                        <SelectTrigger className="bg-gray-950 border-gray-700">
                            <SelectValue placeholder="Plataforma" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800">
                            {imageConnections.length > 0 ? (
                                imageConnections.map(c => (
                                    <SelectItem key={c.id} value={c.id.toString()}>
                                        <div className="flex items-center gap-2 capitalize">
                                            {c.platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-500"/>}
                                            {c.platform === 'facebook' && <Facebook className="w-4 h-4 text-blue-500"/>}
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

                {/* Fecha */}
                <div className="space-y-2">
                    <Label className="text-gray-300">Fecha y Hora</Label>
                    <div className="relative">
                        <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input 
                            type="datetime-local" 
                            value={publishAt} 
                            onChange={e => setPublishAt(e.target.value)} 
                            className="bg-gray-950 border-gray-700 pl-10 focus:border-pink-500"
                        />
                    </div>
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
            className="bg-pink-600 hover:bg-pink-700 text-white min-w-[140px]"
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