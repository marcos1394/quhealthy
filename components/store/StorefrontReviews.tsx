"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Star, CheckCircle2, MessageCircle } from "lucide-react";

import { useProviderReviews } from "@/hooks/useProviderReviews";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface StorefrontReviewsProps {
  providerId: number;
}

export const StorefrontReviews: React.FC<StorefrontReviewsProps> = ({
  providerId,
}) => {
  const t = useTranslations("StorefrontReviews");
  const { reviewsResponse, isLoading } = useProviderReviews(providerId, 0, 6);

  if (isLoading) {
    return (
      <div className="py-10 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center min-h-[160px] font-sans">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  const reviews = reviewsResponse?.content || [];

  if (reviews.length === 0) return null;

  return (
    <div className="py-10 border-t border-gray-100 dark:border-gray-800 font-sans transition-colors select-none space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-500 shrink-0 shadow-2xs">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" strokeWidth={1.5} />
        </div>

        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          {t("title")}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex flex-col space-y-3.5 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0 shadow-2xs">
                  U
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    {t("verified_user")}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-gray-400">
                    <span>
                      {(() => {
                        try {
                          const rawDate: any = review.createdAt;
                          let dateObj: Date;
                          if (Array.isArray(rawDate)) {
                            dateObj = new Date(
                              rawDate[0],
                              rawDate[1] - 1,
                              rawDate[2],
                              rawDate[3] || 0,
                              rawDate[4] || 0
                            );
                          } else {
                            dateObj = new Date(rawDate);
                          }
                          if (isNaN(dateObj.getTime())) return t("recent");
                          return format(dateObj, "MMMM yyyy", { locale: es });
                        } catch {
                          return t("recent");
                        }
                      })()}
                    </span>

                    {review.isVerified && (
                      <>
                        <span>•</span>
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2 py-0 shadow-2xs">
                          <CheckCircle2
                            className="w-3 h-3 mr-1"
                            strokeWidth={2.5}
                          />
                          <span>{t("authentic")}</span>
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-gray-200 dark:text-gray-800"
                    }`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
              &quot;{review.comment}&quot;
            </p>

            {review.providerResponse && (
              <div className="mt-2 p-3.5 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex gap-3 shadow-2xs">
                <MessageCircle
                  className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("provider_response_title")}
                  </p>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                    {review.providerResponse}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {reviewsResponse && reviewsResponse.totalElements > 6 && (
        <div className="pt-2">
          <button
            type="button"
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] h-10 px-6 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            {t("show_all_btn", { count: reviewsResponse.totalElements })}
          </button>
        </div>
      )}
    </div>
  );
};