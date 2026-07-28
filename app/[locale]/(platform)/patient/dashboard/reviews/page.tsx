"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquareHeart, StarHalf, Clock } from "lucide-react";

import { useMyReviews } from "@/hooks/useMyReviews";
import { ReviewHistoryCard } from "@/components/reviews/ReviewHistoryCard";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

export default function PatientReviewsDashboard() {
  const t = useTranslations("PatientReviewsDashboard");
  const { reviews, isLoading } = useMyReviews();

  // Pestañas (Historial / Pendientes)
  const [activeTab, setActiveTab] = useState<"HISTORY" | "PENDING">("HISTORY");

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-5xl mx-auto px-6 py-10 sm:py-12 space-y-10">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 shadow-sm flex items-center justify-center shrink-0">
            <MessageSquareHeart className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* ── SELECTOR DE PESTAÑAS ──────────────────────────────────────── */}
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800 gap-2 no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={cn(
              "px-5 h-11 text-xs font-bold transition-all whitespace-nowrap rounded-xl border flex items-center gap-2",
              activeTab === "HISTORY"
                ? "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a]"
            )}
          >
            <span>{t("tab_history")}</span>
          </button>
          
          <button
            onClick={() => setActiveTab("PENDING")}
            className={cn(
              "px-5 h-11 text-xs font-bold transition-all whitespace-nowrap rounded-xl border flex items-center gap-2",
              activeTab === "PENDING"
                ? "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a]"
            )}
          >
            <span>{t("tab_pending")}</span>
          </button>
        </div>

        {/* ── CONTENIDO DINÁMICO ────────────────────────────────────────── */}
        {activeTab === "HISTORY" && (
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewHistoryCard key={review.id} review={review} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 shadow-sm flex items-center justify-center mb-6">
                  <StarHalf className="w-8 h-8" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t("empty_history_title")}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                  {t("empty_history_desc")}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "PENDING" && (
          <div className="flex flex-col items-center justify-center py-20 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center mb-6">
              <Clock className="w-8 h-8" strokeWidth={2} />
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
              {t("pending_integration")}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}