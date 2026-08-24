"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Star,
  MessageSquare,
  Send,
  Reply,
  Award,
  ShieldCheck,
  Clock,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  Filter,
  Sparkle,
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";

// ShadCN UI & Custom UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useSessionStore } from "@/stores/SessionStore";
import { handleApiError } from "@/lib/handleApiError";
import { reviewService } from "@/services/review.service";
import { Review, ProviderReviewStats } from "@/types/reviews";
import { cn } from "@/lib/utils";

export default function ProviderReviewsPage() {
  const t = useTranslations("DashboardReviews");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;

  const { user } = useSessionStore();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ProviderReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responseTexts, setResponseTexts] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<"ALL" | "UNANSWERED" | 5 | "VERIFIED">("ALL");

  // ── Carga de Reseñas y Métricas ──────────────────────────────────────────
  const fetchReviewsAndStats = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [reviewsData, statsData] = await Promise.allSettled([
        reviewService.getProviderReviews(user.id, 0, 100),
        reviewService.getProviderStats(user.id),
      ]);

      if (reviewsData.status === "fulfilled") {
        setReviews(reviewsData.value?.content || []);
      }
      if (statsData.status === "fulfilled") {
        setStats(statsData.value);
      }
    } catch (error) {
      console.error("Error al obtener reseñas del doctor:", error);
      handleApiError(error, t("error_loading"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    fetchReviewsAndStats();
  }, [fetchReviewsAndStats]);

  // ── Manejadores de Respuesta ────────────────────────────────────────────
  const handleResponseChange = (reviewId: number, text: string) => {
    setResponseTexts((prev) => ({ ...prev, [reviewId]: text }));
  };

  const handleQuickReply = (reviewId: number, templateText: string) => {
    setResponseTexts((prev) => ({ ...prev, [reviewId]: templateText }));
  };

  const handleResponseSubmit = async (reviewId: number) => {
    const responseText = responseTexts[reviewId];
    if (!responseText || responseText.trim() === "") {
      toast.warn(t("warn_empty"));
      return;
    }

    setSubmittingId(reviewId);
    try {
      const updatedReview = await reviewService.replyToReview(reviewId, {
        responseText: responseText.trim(),
      });

      // Actualización optimista del estado local
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                providerResponse: responseText.trim(),
                responseAt: updatedReview.responseAt || new Date().toISOString(),
              }
            : r
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

  // ── Métricas calculadas ──────────────────────────────────────────────────
  const answeredCount = useMemo(
    () => reviews.filter((r) => r.providerResponse && r.providerResponse.trim().length > 0).length,
    [reviews]
  );
  const unansweredCount = reviews.length - answeredCount;
  const responseRate = reviews.length > 0 ? Math.round((answeredCount / reviews.length) * 100) : 100;

  const avgScore = stats?.averageRating || (
    reviews.length > 0
      ? Math.round((reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length) * 10) / 10
      : 5.0
  );

  // ── Reseñas filtradas ────────────────────────────────────────────────────
  const filteredReviews = useMemo(() => {
    let list = [...reviews];
    if (filterMode === "UNANSWERED") {
      list = list.filter((r) => !r.providerResponse || r.providerResponse.trim().length === 0);
    } else if (filterMode === "VERIFIED") {
      list = list.filter((r) => r.isVerified);
    } else if (filterMode === 5) {
      list = list.filter((r) => Math.round(r.rating) === 5);
    }
    return list;
  }, [reviews, filterMode]);

  // ── Estado de Carga ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 gap-3">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  const quickReplies = [
    t("quick_reply_1"),
    t("quick_reply_2"),
    t("quick_reply_3"),
  ];

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
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-amber-500 flex items-center justify-center shrink-0 shadow-xs">
              <Star className="w-7 h-7 fill-amber-400 text-amber-400" strokeWidth={1.5} />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Calificación Promedio */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("avg_rating")}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white">
                  {avgScore.toFixed(1)}
                </span>
                <div className="flex gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "w-3.5 h-3.5",
                        s <= Math.round(avgScore)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200 dark:text-gray-800"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-500">
              <Star className="w-5 h-5 fill-amber-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* Total de Opiniones */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("total_reviews")}
              </p>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white">
                {reviews.length}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>

          {/* Tasa de Respuesta */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("response_rate")}
              </p>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white">
                {responseRate}%
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Reply className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>

          {/* Sin Responder */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("unanswered_count")}
              </p>
              <span className={cn(
                "text-2xl sm:text-3xl font-bold font-mono",
                unansweredCount > 0 ? "text-amber-500 dark:text-amber-400" : "text-gray-900 dark:text-white"
              )}>
                {unansweredCount}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* ── BARRA DE FILTROS ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className={cn(
                "h-8 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                filterMode === "ALL"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {t("filter_all")} ({reviews.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterMode("UNANSWERED")}
              className={cn(
                "h-8 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer",
                filterMode === "UNANSWERED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <span>{t("filter_unanswered")}</span>
              {unansweredCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unansweredCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFilterMode(5)}
              className={cn(
                "h-8 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer",
                filterMode === 5
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <span>5</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={() => setFilterMode("VERIFIED")}
              className={cn(
                "h-8 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                filterMode === "VERIFIED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {t("filter_verified")}
            </button>
          </div>
        </div>

        {/* ── LISTADO DE RESEÑAS ─────────────────────────────────────────── */}
        {filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const authorName = review.consumerName || "Paciente";
              let formattedDate = "";
              try {
                const rawDate: any = review.createdAt;
                const d = Array.isArray(rawDate)
                  ? new Date(rawDate[0], rawDate[1] - 1, rawDate[2], rawDate[3] || 0, rawDate[4] || 0)
                  : new Date(rawDate);
                formattedDate = format(d, "dd MMM yyyy", { locale: dateLocale });
              } catch {
                formattedDate = "Reciente";
              }

              return (
                <Card
                  key={review.id}
                  className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800/80 rounded-3xl overflow-hidden shadow-2xs transition-all hover:border-emerald-100 dark:hover:border-emerald-900/40"
                >
                  <CardContent className="p-6 md:p-8 space-y-5">
                    {/* Header de la reseña */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-11 h-11 border border-gray-100 dark:border-gray-800 shadow-2xs">
                          <AvatarImage src={review.consumerAvatarUrl} alt={authorName} />
                          <AvatarFallback className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                            {authorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-gray-900 dark:text-white">
                              {authorName}
                            </p>
                            {review.isVerified && (
                              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2 py-0">
                                <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={2.5} />
                                <span>Verificada</span>
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={cn(
                                    "w-3.5 h-3.5",
                                    s <= (review.rating || 5)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-200 dark:text-gray-800"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-medium text-gray-400">
                              • {formattedDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comentario del Paciente */}
                    <div className="space-y-4">
                      {review.comment ? (
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 italic leading-relaxed bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                          &quot;{review.comment}&quot;
                        </p>
                      ) : (
                        <p className="text-xs font-medium text-gray-400 italic">
                          Calificación sin comentario escrito.
                        </p>
                      )}

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
                          <div className="space-y-3 bg-gray-50/40 dark:bg-[#050505]/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                            {/* Plantillas de Respuesta Rápida */}
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Sparkle className="w-3 h-3 text-amber-500" />
                                <span>Respuestas Rápidas Sugeridas:</span>
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {quickReplies.map((qText, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleQuickReply(review.id, qText)}
                                    className="text-[11px] font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-2xs text-left"
                                  >
                                    &quot;{qText.slice(0, 38)}...&quot;
                                  </button>
                                ))}
                              </div>
                            </div>

                            <Textarea
                              placeholder={t("response_placeholder")}
                              className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white min-h-[85px] focus:ring-2 focus:ring-emerald-500/20 shadow-2xs rounded-xl resize-y text-xs font-medium placeholder:font-normal placeholder:text-gray-400 leading-relaxed"
                              value={responseTexts[review.id] || ""}
                              onChange={(e) => handleResponseChange(review.id, e.target.value)}
                            />

                            <div className="flex justify-end">
                              <Button
                                onClick={() => handleResponseSubmit(review.id)}
                                disabled={submittingId === review.id}
                                className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all border-0 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                              >
                                {submittingId === review.id ? (
                                  <QhSpinner size="sm" className="text-white" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" strokeWidth={2} />
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
              );
            })}
          </div>
        ) : (
          /* Estado Vacío */
          <div className="flex flex-col items-center justify-center text-center p-16 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xs gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-2xs">
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