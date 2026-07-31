"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Star, MessageSquareHeart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  entityType?: "SERVICE" | "PRODUCT" | "PACKAGE" | "ORDER";
  rating: number;
  setRating: (rating: number) => void;
  comment: string;
  setComment: (comment: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewForm({
  entityType = "SERVICE",
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
  isSubmitting,
}: ReviewFormProps) {
  const t = useTranslations("PatientReviews");
  const [hoverRating, setHoverRating] = useState(0);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xs font-sans transition-colors select-none overflow-hidden"
    >
      {/* ── CABECERA DEL FORMULARIO ─────────────────────────────────── */}
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
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

      {/* ── SECCIÓN PRINCIPAL: PUNTUACIÓN Y COMENTARIO ──────────────── */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Calificación por Estrellas */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
            {t("label_rating")}
          </label>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 cursor-pointer transition-transform duration-150 p-1 hover:scale-110",
                  (hoverRating || rating) >= star
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200 dark:text-gray-800 fill-transparent hover:text-amber-200 dark:hover:text-amber-900/40"
                )}
                strokeWidth={1.5}
              />
            ))}
          </div>
        </div>

        {/* Comentario de Texto */}
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
      </div>

      {/* ── PIE DE ACCIONES Y NOTA ───────────────────────────────────── */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex flex-col items-center gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
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