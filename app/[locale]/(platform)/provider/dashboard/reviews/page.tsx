"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Star, MessageSquare, Send, Reply, Award } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import axios from "axios";

// ShadCN UI & Custom UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useSessionStore } from "@/stores/SessionStore";
import { handleApiError } from "@/lib/handleApiError";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ReviewAuthor {
  name: string;
  image?: string;
}

export interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  providerResponse?: string;
  author: ReviewAuthor;
}

// ── Componente Principal ──────────────────────────────────────────────────────

export default function ProviderReviewsPage() {
  const t = useTranslations("DashboardReviews");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;

  const { user } = useSessionStore();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [responseTexts, setResponseTexts] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  // ── Carga de Reseñas desde API de Producción ────────────────────────────────

  const fetchReviews = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await axios.get<ReviewItem[]>(
        `/api/reviews/provider/${user.id}`,
        { withCredentials: true }
      );
      setReviews(response.data || []);
    } catch (error) {
      console.error("Error al obtener reseñas:", error);
      handleApiError(error, t("error_loading"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Manejadores de Respuesta ────────────────────────────────────────────────

  const handleResponseChange = (reviewId: number, text: string) => {
    setResponseTexts((prev) => ({ ...prev, [reviewId]: text }));
  };

  const handleResponseSubmit = async (reviewId: number) => {
    const responseText = responseTexts[reviewId];
    if (!responseText || responseText.trim() === "") {
      toast.warn(t("warn_empty"));
      return;
    }

    setSubmittingId(reviewId);
    try {
      await axios.post(
        `/api/reviews/${reviewId}/respond`,
        { response: responseText.trim() },
        { withCredentials: true }
      );

      // Actualización optimista del estado local
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, providerResponse: responseText.trim() } : r
        )
      );

      setResponseTexts((prev) => {
        const copy = { ...prev };
        delete copy[reviewId];
        return copy;
      });

      toast.success(t("publish_success"));
    } catch (error) {
      console.error("Error al publicar la respuesta:", error);
      handleApiError(error, t("error_publish"));
    } finally {
      setSubmittingId(null);
    }
  };

  // ── Estado de Carga ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  // CÁLCULO DE PROMEDIO
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8 max-w-5xl mx-auto"
      >
        {/* ── HEADER PRINCIPAL ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
              <Star className="w-7 h-7 fill-amber-400" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ── METRICAS / STATS RÁPIDOS ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm flex items-center justify-between transition-all">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t("avg_rating")}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-gray-900 dark:text-white">
                  {avgRating}
                </span>
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(Number(avgRating))
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200 dark:text-gray-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-500">
              <Star className="w-6 h-6 fill-amber-400" strokeWidth={1.5} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm flex items-center justify-between transition-all">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t("total_reviews")}
              </p>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-gray-900 dark:text-white">
                {reviews.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Award className="w-6 h-6" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* ── LISTADO DE RESEÑAS ─────────────────────────────────────────── */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card
                key={review.id}
                className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm transition-all hover:border-emerald-100 dark:hover:border-emerald-900/40"
              >
                <CardContent className="p-6 md:p-8 space-y-6">
                  {/* Header de la reseña */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-11 h-11 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <AvatarImage src={review.author?.image} alt={review.author?.name} />
                        <AvatarFallback className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                          {(review.author?.name || "P").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">
                          {review.author?.name || "Paciente"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-200 dark:text-gray-800"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-medium text-gray-400">
                            • {format(new Date(review.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comentario del Paciente */}
                  <div className="space-y-4">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 italic leading-relaxed bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                      "{review.comment}"
                    </p>

                    {/* Área de Respuesta del Profesional */}
                    <div>
                      {review.providerResponse ? (
                        <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 space-y-1.5">
                          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <Reply className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {t("your_response")}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed pl-5">
                            {review.providerResponse}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 bg-gray-50/30 dark:bg-[#050505]/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                          <Textarea
                            placeholder={t("response_placeholder")}
                            className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white min-h-[90px] focus:ring-2 focus:ring-emerald-500/20 shadow-sm rounded-xl resize-y text-xs font-medium placeholder:font-normal placeholder:text-gray-400 leading-relaxed"
                            value={responseTexts[review.id] || ""}
                            onChange={(e) => handleResponseChange(review.id, e.target.value)}
                          />
                          <div className="flex justify-end">
                            <Button
                              onClick={() => handleResponseSubmit(review.id)}
                              disabled={submittingId === review.id}
                              className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all border-0 disabled:opacity-50"
                            >
                              {submittingId === review.id ? (
                                <QhSpinner size="sm" />
                              ) : (
                                <Send className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                              )}
                              <span>{t("publish_response")}</span>
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
          /* Estado Vacío */
          <div className="flex flex-col items-center justify-center text-center p-16 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
              <MessageSquare className="w-7 h-7" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
              {t("empty_title")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              {t("empty_desc")}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}