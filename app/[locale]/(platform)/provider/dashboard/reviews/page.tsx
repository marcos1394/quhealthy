/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, Star, MessageSquare, Send, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSessionStore } from '@/stores/SessionStore';

// Tipos
interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  providerResponse?: string;
  author: {
    name: string;
    image?: string;
  };
}

// Mock Data
const mockReviews: ReviewItem[] = [
  {
    id: 1,
    rating: 5,
    comment: "Excelente servicio, el doctor fue muy amable y profesional. Resolvió todas mis dudas.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: { name: "Sofía Martínez", image: "https://randomuser.me/api/portraits/women/44.jpg" },
    providerResponse: "¡Muchas gracias Sofía! Me alegra haber podido ayudarte."
  },
  {
    id: 2,
    rating: 4,
    comment: "La atención fue buena pero tuve que esperar 15 minutos extra.",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    author: { name: "Jorge Pérez" }
  },
  {
    id: 3,
    rating: 5,
    comment: "Instalaciones impecables y trato de primera.",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    author: { name: "Elena Gómez", image: "https://randomuser.me/api/portraits/women/68.jpg" }
  }
];

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [responseTexts, setResponseTexts] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  
  const { user } = useSessionStore();

  const fetchReviews = useCallback(async () => {
    // if (!user) return; // Comentado para permitir ver mock en dev
    setIsLoading(true);
    try {
      // Simulación
      await new Promise(r => setTimeout(r, 600));
      setReviews(mockReviews);
      
      // Producción:
      // const { data } = await axios.get(`/api/reviews/provider/${user.id}`);
      // setReviews(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar reseñas.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleResponseChange = (reviewId: number, text: string) => {
    setResponseTexts(prev => ({ ...prev, [reviewId]: text }));
  };

  const handleResponseSubmit = async (reviewId: number) => {
    const response = responseTexts[reviewId];
    if (!response || response.trim() === '') {
      toast.warn("Escribe una respuesta primero.");
      return;
    }
    
    setSubmittingId(reviewId);
    try {
      // Simulación
      await new Promise(r => setTimeout(r, 1000));
      
      // Actualización optimista
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, providerResponse: response } : r));
      toast.success("Respuesta publicada.");
      
      // Producción:
      // await axios.post(`/api/reviews/${reviewId}/respond`, { response }, { withCredentials: true });
      // fetchReviews(); 
    } catch (error) {
      toast.error("No se pudo enviar la respuesta.");
    } finally {
      setSubmittingId(null);
    }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            <p className="text-gray-400">Cargando opiniones...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl mx-auto">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Star className="w-8 h-8 text-yellow-400 fill-current" />
                    Gestión de Reseñas
                </h1>
                <p className="text-gray-400 mt-1">
                    Gestiona tu reputación y responde a tus pacientes.
                </p>
            </div>

            {/* Stats Rápidos (Opcional) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold text-white">4.8</p>
                    <p className="text-xs text-gray-500 uppercase font-bold">Calificación Promedio</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold text-white">{reviews.length}</p>
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Reseñas</p>
                </div>
            </div>

            {/* Lista de Reseñas */}
            {reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <Card key={review.id} className="bg-gray-900 border-gray-800 overflow-hidden">
                            <CardContent className="p-6">
                                
                                {/* Header Reseña */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={review.author.image} />
                                            <AvatarFallback className="bg-purple-900 text-purple-200">
                                                {review.author.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-white">{review.author.name}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-700'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500">• {format(new Date(review.createdAt), "d MMM yyyy", { locale: es })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <p className="text-gray-300 italic pl-14 leading-relaxed mb-6">
                                    &quot;{review.comment}&quot;
                                </p>

                                {/* Área de Respuesta */}
                                <div className="pl-14">
                                    {review.providerResponse ? (
                                        <div className="bg-gray-950/50 rounded-lg p-4 border-l-2 border-purple-500">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Reply className="w-4 h-4 text-purple-400" />
                                                <span className="text-xs font-bold text-purple-400 uppercase">Tu Respuesta</span>
                                            </div>
                                            <p className="text-sm text-gray-400">{review.providerResponse}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Textarea 
                                                placeholder="Escribe una respuesta agradeciendo o aclarando..." 
                                                className="bg-gray-950 border-gray-700 text-white min-h-[80px] focus:border-purple-500"
                                                value={responseTexts[review.id] || ''}
                                                onChange={(e) => handleResponseChange(review.id, e.target.value)}
                                            />
                                            <div className="flex justify-end">
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleResponseSubmit(review.id)}
                                                    disabled={submittingId === review.id}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                                >
                                                    {submittingId === review.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                                    Publicar Respuesta
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-dashed border-gray-800">
                    <MessageSquare className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">Aún no hay reseñas</h3>
                    <p className="text-gray-400 mt-2">Invita a tus pacientes a calificar tu servicio después de su cita.</p>
                </div>
            )}

        </motion.div>
    </div>
  );
}