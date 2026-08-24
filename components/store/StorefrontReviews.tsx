"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Star,
  CheckCircle2,
  MessageCircle,
  Clock,
  HeartHandshake,
  Sparkles,
  Award,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";

import { useProviderReviews } from "@/hooks/useProviderReviews";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Review } from "@/types/reviews";
import { cn } from "@/lib/utils";

interface StorefrontReviewsProps {
  providerId: number;
}

export const StorefrontReviews: React.FC<StorefrontReviewsProps> = ({
  providerId,
}) => {
  const t = useTranslations("StorefrontReviews");
  const { reviewsResponse, stats, isLoading } = useProviderReviews(providerId, 0, 50);

  const [selectedFilter, setSelectedFilter] = useState<"ALL" | 5 | 4 | 3 | 2 | 1 | "VERIFIED" | "COMMENTS">("ALL");
  const [sortBy, setSortBy] = useState<"RECENT" | "HIGHEST" | "LOWEST">("RECENT");
  const [visibleCount, setVisibleCount] = useState(6);

  const allReviews: Review[] = useMemo(() => reviewsResponse?.content || [], [reviewsResponse]);

  // Cálculo de promedio general y conteo
  const totalReviews = stats?.totalReviews || allReviews.length;
  const averageRating = stats?.averageRating || (
    allReviews.length > 0
      ? Math.round((allReviews.reduce((acc, r) => acc + (r.rating || 5), 0) / allReviews.length) * 10) / 10
      : 5.0
  );

  // Distribución de estrellas
  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
      counts[rounded] = (counts[rounded] || 0) + 1;
    });
    return counts;
  }, [allReviews]);

  // Sub-calificaciones (de stats o calculadas)
  const subRatings = useMemo(() => {
    if (stats?.avgPunctuality || stats?.avgCommunication || stats?.avgKnowledge || stats?.avgFacilities) {
      return {
        punctuality: stats.avgPunctuality || averageRating,
        communication: stats.avgCommunication || averageRating,
        knowledge: stats.avgKnowledge || averageRating,
        facilities: stats.avgFacilities || averageRating,
      };
    }
    const withPunctuality = allReviews.filter((r) => r.ratingPunctuality);
    if (withPunctuality.length > 0) {
      const avg = (field: keyof Review) =>
        Math.round(
          (allReviews.reduce((acc, r) => acc + ((r[field] as number) || r.rating || 5), 0) /
            allReviews.length) *
            10
        ) / 10;
      return {
        punctuality: avg("ratingPunctuality"),
        communication: avg("ratingCommunication"),
        knowledge: avg("ratingKnowledge"),
        facilities: avg("ratingFacilities"),
      };
    }
    return null;
  }, [stats, allReviews, averageRating]);

  // Filtrado y ordenamiento de reseñas
  const filteredReviews = useMemo(() => {
    let list = [...allReviews];

    if (selectedFilter === "VERIFIED") {
      list = list.filter((r) => r.isVerified);
    } else if (selectedFilter === "COMMENTS") {
      list = list.filter((r) => r.comment && r.comment.trim().length > 0);
    } else if (typeof selectedFilter === "number") {
      list = list.filter((r) => Math.round(r.rating) === selectedFilter);
    }

    if (sortBy === "HIGHEST") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "LOWEST") {
      list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    } else {
      // RECENT (por fecha)
      list.sort((a, b) => {
        const dateA = new Date(Array.isArray(a.createdAt) ? a.createdAt[0] : a.createdAt).getTime();
        const dateB = new Date(Array.isArray(b.createdAt) ? b.createdAt[0] : b.createdAt).getTime();
        return dateB - dateA;
      });
    }

    return list;
  }, [allReviews, selectedFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="py-12 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center min-h-[180px] font-sans">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  // Generador de color de avatar para reseñas
  const getAvatarGradient = (id: number) => {
    const gradients = [
      "from-emerald-500 to-teal-600",
      "from-teal-500 to-cyan-600",
      "from-indigo-500 to-blue-600",
      "from-violet-500 to-purple-600",
      "from-amber-500 to-orange-600",
    ];
    return gradients[id % gradients.length];
  };

  const getInitials = (name?: string) => {
    if (!name || name === "Usuario Verificado" || name === "Paciente Verificado") return "PV";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="py-12 border-t border-gray-100 dark:border-gray-800 font-sans transition-colors space-y-8">
      {/* ── CABECERA DE LA SECCIÓN ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center text-amber-500 shrink-0 shadow-2xs">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t("title")}
            </h2>
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 pl-13">
            {t("subtitle")}
          </p>
        </div>

        <Badge className="self-start sm:self-auto bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 rounded-full px-3 py-1 text-[11px] font-bold shadow-2xs flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
          <span>{t("verified_badge")}</span>
        </Badge>
      </div>

      {/* ── SCORECARD / RESUMEN DE REPUTACIÓN ───────────────────────── */}
      {totalReviews > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-gray-50/80 to-emerald-50/20 dark:from-[#0a0a0a] dark:to-[#050505] border border-gray-100 dark:border-gray-800/80 shadow-2xs">
          {/* Calificación Global */}
          <div className="lg:col-span-4 flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-2 lg:border-r lg:border-gray-200/60 dark:lg:border-gray-800/80 lg:pr-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-gray-400">/ 5.0</span>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "w-4 h-4",
                    s <= Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 dark:fill-gray-800 text-gray-200 dark:text-gray-800"
                  )}
                  strokeWidth={1.5}
                />
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              {t("total_reviews", { count: totalReviews })}
            </p>
          </div>

          {/* Barras de Distribución de Estrellas */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-2 px-0 lg:px-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
              const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              const isSelected = selectedFilter === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedFilter(isSelected ? "ALL" : (star as any))}
                  className={cn(
                    "w-full flex items-center gap-2.5 text-left group p-1 rounded-xl transition-all cursor-pointer",
                    isSelected ? "bg-emerald-50/80 dark:bg-emerald-950/30" : "hover:bg-gray-100/50 dark:hover:bg-gray-900/40"
                  )}
                >
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 w-6 shrink-0 flex items-center gap-0.5">
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                  </span>

                  <div className="flex-1 h-2 rounded-full bg-gray-200/80 dark:bg-gray-800 overflow-hidden relative">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isSelected
                          ? "bg-emerald-500"
                          : "bg-amber-400 group-hover:bg-amber-500"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-mono font-medium text-gray-400 w-8 text-right shrink-0">
                    {percentage}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-Ratings Clínicas */}
          {subRatings && (
            <div className="lg:col-span-3 flex flex-col justify-center space-y-2.5 lg:border-l lg:border-gray-200/60 dark:lg:border-gray-800/80 lg:pl-6">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("sub_punctuality")}</span>
                </span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">
                  {subRatings.punctuality.toFixed(1)}★
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{t("sub_communication")}</span>
                </span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">
                  {subRatings.communication.toFixed(1)}★
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{t("sub_knowledge")}</span>
                </span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">
                  {subRatings.knowledge.toFixed(1)}★
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t("sub_facilities")}</span>
                </span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">
                  {subRatings.facilities.toFixed(1)}★
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State con Garantía de Confianza */
        <div className="p-8 rounded-3xl bg-gray-50/70 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xs">
            <ShieldCheck className="w-6 h-6" strokeWidth={2} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
            {t("empty_title")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            {t("empty_desc")}
          </p>
        </div>
      )}

      {/* ── BARRA DE FILTROS Y ORDENAMIENTO ─────────────────────────── */}
      {totalReviews > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Pills de Filtro */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedFilter("ALL")}
              className={cn(
                "h-8 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                selectedFilter === "ALL"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {t("filter_all")}
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter(5)}
              className={cn(
                "h-8 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer",
                selectedFilter === 5
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <span>5</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter(4)}
              className={cn(
                "h-8 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer",
                selectedFilter === 4
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <span>4</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter("COMMENTS")}
              className={cn(
                "h-8 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                selectedFilter === "COMMENTS"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {t("filter_with_comments")}
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter("VERIFIED")}
              className={cn(
                "h-8 px-3.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                selectedFilter === "VERIFIED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {t("filter_verified")}
            </button>
          </div>

          {/* Selector de Orden */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
            >
              <option value="RECENT">{t("sort_recent")}</option>
              <option value="HIGHEST">{t("sort_highest")}</option>
              <option value="LOWEST">{t("sort_lowest")}</option>
            </select>
          </div>
        </div>
      )}

      {/* ── GRID DE OPINIONES ───────────────────────────────────────── */}
      {filteredReviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReviews.slice(0, visibleCount).map((review) => {
            const authorName = review.consumerName || t("verified_user");
            const initials = getInitials(authorName);
            const gradient = getAvatarGradient(review.id);

            // Formato de fecha
            let formattedDate = t("recent");
            try {
              const rawDate: any = review.createdAt;
              const d = Array.isArray(rawDate)
                ? new Date(rawDate[0], rawDate[1] - 1, rawDate[2], rawDate[3] || 0, rawDate[4] || 0)
                : new Date(rawDate);
              if (!isNaN(d.getTime())) {
                formattedDate = format(d, "MMMM yyyy", { locale: es });
              }
            } catch {
              formattedDate = t("recent");
            }

            return (
              <div
                key={review.id}
                className="flex flex-col justify-between space-y-4 p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-[#0a0a0a] shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="space-y-3.5">
                  {/* Autor y Estrellas */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-2xl bg-gradient-to-br text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs",
                          gradient
                        )}
                      >
                        {initials}
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                          {authorName}
                        </p>

                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                          <span>{formattedDate}</span>
                          {review.isVerified && (
                            <>
                              <span>•</span>
                              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2 py-0 shadow-2xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={2.5} />
                                <span>{t("authentic")}</span>
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "w-3.5 h-3.5",
                            s <= (review.rating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 dark:fill-gray-800 text-gray-200 dark:text-gray-800"
                          )}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Servicio o producto reseñado */}
                  {review.serviceName && (
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {review.serviceName}
                    </p>
                  )}

                  {/* Comentario de texto */}
                  {review.comment ? (
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                      &quot;{review.comment}&quot;
                    </p>
                  ) : null}
                </div>

                {/* Respuesta del Proveedor */}
                {review.providerResponse && (
                  <div className="mt-2 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex gap-3 shadow-2xs">
                    <MessageCircle
                      className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2.2}
                    />
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        {t("provider_response_title")}
                      </p>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                        {review.providerResponse}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── BOTÓN MOSTRAR MÁS / MENOS ───────────────────────────────── */}
      {filteredReviews.length > 6 && (
        <div className="flex justify-center pt-2">
          {visibleCount < filteredReviews.length ? (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] h-11 px-7 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>{t("show_all_btn", { count: filteredReviews.length })}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setVisibleCount(6)}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] h-11 px-7 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>{t("show_less_btn")}</span>
              <ChevronUp className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};