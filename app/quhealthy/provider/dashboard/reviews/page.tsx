/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, Star, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useSessionStore } from '@/stores/SessionStore';
import { ReviewItem } from '@/app/quhealthy/types/marketplace';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [responseTexts, setResponseTexts] = useState<Record<number, string>>({});
  
  const { user } = useSessionStore();

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/reviews/provider/${user.id}`);
      setReviews(data);
    } catch (error) {
      toast.error("No se pudieron cargar las reseñas.");
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
      toast.warn("La respuesta no puede estar vacía.");
      return;
    }
    try {
      await axios.post(`/api/reviews/${reviewId}/respond`, { response }, { withCredentials: true });
      toast.success("Respuesta enviada exitosamente.");
      fetchReviews(); // Recargamos para ver la respuesta
    } catch (error) {
      toast.error("No se pudo enviar la respuesta.");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Gestión de Reseñas</h1>
      
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map(review => (
            <Card key={review.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                {/* Detalles de la Reseña del Cliente */}
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-white">{review.author.name}</p>
                  <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />)}</div>
                </div>
                <p className="text-sm text-gray-400 mb-4">{formatInTimeZone(new Date(review.createdAt), 'UTC', "d 'de' MMMM, yyyy", { locale: es })}</p>
                <blockquote className="text-gray-300 italic border-l-2 border-gray-600 pl-4 mb-4">{`"${review.comment}"`}</blockquote>
                
                {/* Sección de Respuesta del Proveedor */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  {review.providerResponse ? (
                    <div>
                      <p className="text-sm font-semibold text-purple-300">Tu Respuesta:</p>
                      <p className="text-gray-300 text-sm mt-1">{review.providerResponse}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Escribe tu respuesta pública aquí..."
                        className="bg-gray-700 border-gray-600"
                        value={responseTexts[review.id] || ''}
                        onChange={(e) => handleResponseChange(review.id, e.target.value)}
                      />
                      <Button size="sm" onClick={() => handleResponseSubmit(review.id)}>
                        <Send className="w-4 h-4 mr-2"/>
                        Responder
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/30 rounded-2xl">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white">Aún no tienes reseñas</h3>
          <p className="text-gray-400 mt-2">Cuando los clientes dejen su opinión, las verás aquí.</p>
        </div>
      )}
    </motion.div>
  );
}