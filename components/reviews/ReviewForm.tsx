"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Star,
  MessageSquareHeart,
  Clock,
  HeartHandshake,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserCheck,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  entityType?: "SERVICE" | "PRODUCT" | "PACKAGE" | "ORDER";
  rating: number;
  setRating: (rating: number) => void;
  ratingPunctuality?: number;
  setRatingPunctuality?: (rating: number) => void;
  ratingCommunication?: number;
  setRatingCommunication?: (rating: number) => void;
  ratingKnowledge?: number;
  setRatingKnowledge?: (rating: number) => void;
  ratingFacilities?: number;
  setRatingFacilities?: (rating: number) => void;
  isAnonymous?: boolean;
  setIsAnonymous?: (isAnonymous: boolean) => void;
  comment: string;
  setComment: (comment: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewForm({
  entityType = "SERVICE",
  rating,
  setRating,
  ratingPunctuality = 0,
  setRatingPunctuality,
  ratingCommunication = 0,
  setRatingCommunication,
  ratingKnowledge = 0,
  setRatingKnowledge,
  ratingFacilities = 0,
  setRatingFacilities,
  isAnonymous = false,
  setIsAnonymous,
  comment,
  setComment,
  onSubmit,
  isSubmitting,
}: ReviewFormProps) {
  const t = useTranslations("PatientReviews");
  const [hoverRating, setHoverRating] = useState(0);
  const [showSubRatings, setShowSubRatings] = useState(false);

  const getTitle = () => {
    switch (entityType) {
      case "PRODUCT":
        return t("title_product");
      case "PACKAGE":
        return t("title_package");
      case "ORDER":
        return t("title_order");
      default:
        return t("title_service");
    }
  };

  const getEmotionLabel = (val: number) => {
    switch (val) {
      case 1:
        return t("rating_1");
      case 2:
        return t("rating_2");
      case 3:
        return t("rating_3");
      case 4:
        return t("rating_4");
      case 5:
        return t("rating_5");
      default:
        return "";
    }
  };

  const currentDisplayRating = hoverRating || rating;

  const quickTags = [
    { key: "tag_punctual", text: t("tag_punctual") },
    { key: "tag_clear_explanation", text: t("tag_clear_explanation") },
    { key: "tag_empathic", text: t("tag_empathic") },
    { key: "tag_clean_facilities", text: t("tag_clean_facilities") },
    { key: "tag_recommended", text: t("tag_recommended") },
  ];

  const handleTagClick = (tagText: string) => {
    if (comment.includes(tagText)) {
      // Remover si ya está
      const regex = new RegExp(`\\s*•?\\s*${tagText}\\.?`, "g");
      setComment(comment.replace(regex, "").trim());
    } else {
      // Agregar
      const newComment = comment.trim()
        ? `${comment.trim()} • ${tagText}.`
        : `${tagText}.`;
      setComment(newComment);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xs font-sans transition-colors overflow-hidden"
    >
      {/* ── CABECERA DEL FORMULARIO ─────────────────────────────────── */}
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/80 via-emerald-50/20 to-transparent dark:from-[#080808] dark:to-[#040404] flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
          <MessageSquareHeart className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2} />
        </div>

        <div className="space-y-0.5">
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {getTitle()}
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* ── SECCIÓN PRINCIPAL: PUNTUACIÓN GENERAL ────────────────────── */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_rating")}
            </label>
            {currentDisplayRating > 0 && (
              <span className="text-xs font-extrabold text-amber-500 animate-in fade-in">
                {getEmotionLabel(currentDisplayRating)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={cn(
                  "w-9 h-9 sm:w-11 sm:h-11 cursor-pointer transition-transform duration-150 p-1 hover:scale-115",
                  currentDisplayRating >= star
                    ? "text-amber-400 fill-amber-400 drop-shadow-2xs"
                    : "text-gray-200 dark:text-gray-800 fill-transparent hover:text-amber-200 dark:hover:text-amber-900/40"
                )}
                strokeWidth={1.5}
              />
            ))}
          </div>
        </div>

        {/* ── SUB-RATINGS COLAPSABLES (OPCIONAL) ───────────────────────── */}
        {setRatingPunctuality && (
          <div className="border border-gray-100 dark:border-gray-800/80 rounded-2xl p-4 bg-gray-50/50 dark:bg-[#050505] space-y-3">
            <button
              type="button"
              onClick={() => setShowSubRatings(!showSubRatings)}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t("sub_ratings_title")}</span>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  {t("sub_ratings_desc")}
                </p>
              </div>
              {showSubRatings ? (
                <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              )}
            </button>

            {showSubRatings && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3 animate-in fade-in">
                {/* Puntualidad */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t("sub_punctuality")}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        onClick={() => setRatingPunctuality?.(s)}
                        className={cn(
                          "w-5 h-5 cursor-pointer transition-transform hover:scale-110",
                          ratingPunctuality >= s
                            ? "fill-amber-400 text-amber-400"
                            : "fill-transparent text-gray-200 dark:text-gray-700"
                        )}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                </div>

                {/* Atención / Empatía */}
                {setRatingCommunication && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-teal-500" />
                      <span>{t("sub_communication")}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          onClick={() => setRatingCommunication?.(s)}
                          className={cn(
                            "w-5 h-5 cursor-pointer transition-transform hover:scale-110",
                            ratingCommunication >= s
                              ? "fill-amber-400 text-amber-400"
                              : "fill-transparent text-gray-200 dark:text-gray-700"
                          )}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Conocimiento Médico */}
                {setRatingKnowledge && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{t("sub_knowledge")}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          onClick={() => setRatingKnowledge?.(s)}
                          className={cn(
                            "w-5 h-5 cursor-pointer transition-transform hover:scale-110",
                            ratingKnowledge >= s
                              ? "fill-amber-400 text-amber-400"
                              : "fill-transparent text-gray-200 dark:text-gray-700"
                          )}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Instalaciones */}
                {setRatingFacilities && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t("sub_facilities")}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          onClick={() => setRatingFacilities?.(s)}
                          className={cn(
                            "w-5 h-5 cursor-pointer transition-transform hover:scale-110",
                            ratingFacilities >= s
                              ? "fill-amber-400 text-amber-400"
                              : "fill-transparent text-gray-200 dark:text-gray-700"
                          )}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CHIPS DE TAGS RÁPIDOS ────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("quick_tags_title")}
          </p>
          <div className="flex flex-wrap gap-2">
            {quickTags.map((tag) => {
              const isSelected = comment.includes(tag.text);
              return (
                <button
                  key={tag.key}
                  type="button"
                  onClick={() => handleTagClick(tag.text)}
                  className={cn(
                    "h-7 px-3 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs",
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  {tag.text}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── COMENTARIO DE TEXTO ───────────────────────────────────────── */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <label className="flex items-baseline gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
            <span>{t("label_comment")}</span>
            <span className="text-[11px] font-medium text-gray-400">
              ({t("optional")})
            </span>
          </label>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal resize-none"
            placeholder={t("comment_placeholder")}
          />
        </div>

        {/* ── TOGGLE DE ANONIMATO ─────────────────────────────────────── */}
        {setIsAnonymous && (
          <div className="pt-2 flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
            <div className="space-y-0.5">
              <label
                htmlFor="anon-toggle"
                className="text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer flex items-center gap-1.5"
              >
                {isAnonymous ? (
                  <EyeOff className="w-3.5 h-3.5 text-indigo-500" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span>{t("anonymous_toggle")}</span>
              </label>
              <p className="text-[11px] text-gray-400 font-medium">
                {t("anonymous_desc")}
              </p>
            </div>

            <input
              id="anon-toggle"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* ── PIE DE ACCIONES Y NOTA ───────────────────────────────────── */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex flex-col items-center gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <QhSpinner size="sm" className="text-white" />
              <span>{t("btn_submitting")}</span>
            </>
          ) : (
            <span>{t("btn_submit")}</span>
          )}
        </Button>

        <p className="text-[11px] font-medium text-gray-400 text-center leading-relaxed max-w-sm">
          {t("privacy_notice")}
        </p>
      </div>
    </form>
  );
}