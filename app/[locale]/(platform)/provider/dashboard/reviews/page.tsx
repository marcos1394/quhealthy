/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, Star, MessageSquare, Send, Reply, Award } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations("DashboardReviews");
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
      toast.error(t("error_loading"));
    } finally {
      setIsLoading(false);
    }
  }, [t, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleResponseChange = (reviewId: number, text: string) => {
    setResponseTexts(prev => ({ ...prev, [reviewId]: text }));
  };

  const handleResponseSubmit = async (reviewId: number) => {
    const response = responseTexts[reviewId];
    if (!response || response.trim() === '') {
      toast.warn(t("warn_empty"));
      return;
    }

    setSubmittingId(reviewId);
    try {
      // Simulación
      await new Promise(r => setTimeout(r, 1000));

      // Actualización optimista
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, providerResponse: response } : r));
      toast.success(t("publish_success"));

      // Producción:
      // await axios.post(`/api/reviews/${reviewId}/respond`, { response }, { withCredentials: true });
      // fetchReviews(); 
    } catch (error) {
      toast.error(t("error_publish"));
    } finally {
      setSubmittingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] bg-slate-50 dark:bg-slate-950 transition-colors">
        <Loader2 className="w-8 h-8 animate-spin text-medical-600 dark:text-medical-400 mb-3" />
        <p className="text-slate-500 dark:text-slate-400 font-light">{t("loading")}</p>
      </div>
    );
  }

  // Calculo de promedio
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors">

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-200 dark:border-medical-500/20 shadow-sm">
              <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t("title")}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-center shadow-sm transition-colors">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{avgRating}</p>
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{t("avg_rating")}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-center shadow-sm transition-colors">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{reviews.length}</p>
              <Award className="w-5 h-5 text-medical-500" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{t("total_reviews")}</p>
          </div>
        </div>

        {/* Lista de Reseñas */}
        {reviews.length > 0 ? (
          <div className="space-y-5">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors hover:border-medical-200 dark:hover:border-medical-800/50">
                <CardContent className="p-6 md:p-8">

                  {/* Header Reseña */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                        <AvatarImage src={review.author.image} />
                        <AvatarFallback className="bg-gradient-to-br from-medical-500 to-emerald-500 text-white font-semibold">
                          {review.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white tracking-tight">{review.author.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">• {format(new Date(review.createdAt), "d MMM yyyy", { locale: es })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="pl-0 md:pl-16 relative">
                    <MessageSquare className="absolute top-0 left-8 md:left-4 w-5 h-5 text-slate-200 dark:text-slate-800 -rotate-12 hidden md:block" />
                    <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed mb-6 font-medium text-[15px]">
                      "{review.comment}"
                    </p>

                    {/* Área de Respuesta */}
                    <div className="mt-4">
                      {review.providerResponse ? (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border-l-4 border-medical-500 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <Reply className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                            <span className="text-[11px] font-bold text-medical-600 dark:text-medical-400 uppercase tracking-widest">{t("your_response")}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed">{review.providerResponse}</p>
                        </div>
                      ) : (
                        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                          <Textarea
                            placeholder={t("response_placeholder")}
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[80px] focus:border-medical-500 focus-visible:ring-1 focus-visible:ring-medical-500/50 shadow-sm transition-all rounded-xl resize-none text-sm placeholder:font-light"
                            value={responseTexts[review.id] || ''}
                            onChange={(e) => handleResponseChange(review.id, e.target.value)}
                          />
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleResponseSubmit(review.id)}
                              disabled={submittingId === review.id}
                              className="bg-medical-600 hover:bg-medical-700 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-medical-500/20 transition-all"
                            >
                              {submittingId === review.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-3.5 h-3.5 mr-2" />}
                              {t("publish_response")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-full inline-block mb-4 border border-slate-100 dark:border-slate-700">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t("empty_title")}</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-light max-w-sm mx-auto">{t("empty_desc")}</p>
          </div>
        )}

      </motion.div>
    </div>
  );
}