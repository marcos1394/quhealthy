"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Star, Clock, CheckCircle2, AlertCircle, MessageCircleReply } from "lucide-react";

import { Review } from "@/types/reviews";
import { cn } from "@/lib/utils";

interface ReviewHistoryCardProps {
  review: Review;
}

export function ReviewHistoryCard({ review }: ReviewHistoryCardProps) {
  const t = useTranslations("PatientReviewsDashboard");

  const statusConfig = {
    APPROVED: {
      color:
        "border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" strokeWidth={2} />,
      label: t("status_approved"),
    },
    PENDING: {
      color:
        "border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
      icon: <Clock className="w-3.5 h-3.5 mr-1" strokeWidth={2} />,
      label: t("status_pending"),
    },
    REJECTED: {
      color:
        "border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30",
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1" strokeWidth={2} />,
      label: t("status_rejected"),
    },
  };

  const currentStatus =
    statusConfig[review.moderationStatus] || statusConfig.PENDING;

  const formattedDate = new Date(review.createdAt).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }
  );

  return (
    <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group hover:border-emerald-500/30 transition-all rounded-3xl shadow-2xs hover:shadow-md font-sans select-none overflow-hidden">
      {/* ── CABECERA DE LA TARJETA ──────────────────────────────────── */}
      <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/40 shadow-2xs">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-3.5 h-3.5",
                  star <= review.rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-300 dark:text-gray-700 fill-transparent"
                )}
                strokeWidth={1.5}
              />
            ))}
          </div>

          <span className="text-xs font-mono font-medium text-gray-400">
            {formattedDate}
          </span>
        </div>

        <span
          className={cn(
            "px-3 py-0.5 text-[11px] font-bold flex items-center w-fit rounded-full border shadow-2xs",
            currentStatus.color
          )}
        >
          {currentStatus.icon}
          <span>{currentStatus.label}</span>
        </span>
      </div>

      {/* ── CONTENIDO Y RESPUESTA DEL ESPECIALISTA ──────────────────── */}
      <div className="p-6 md:p-8 space-y-4">
        <p className="text-xs sm:text-sm font-medium leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap">
          {review.comment || (
            <span className="text-xs font-medium text-gray-400 italic">
              {t("no_comment")}
            </span>
          )}
        </p>

        {/* Respuesta del Proveedor */}
        {review.providerResponse && (
          <div className="mt-6 border-l-2 border-emerald-500 pl-4 py-3 bg-gray-50/60 dark:bg-[#050505] rounded-r-2xl space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <MessageCircleReply className="w-4 h-4" strokeWidth={2} />
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {t("provider_reply")}
              </span>
            </div>

            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
              {review.providerResponse}
            </p>
          </div>
        )}

        {/* Aviso de Rechazo */}
        {review.moderationStatus === "REJECTED" && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-relaxed">
              {t("rejected_notice")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}