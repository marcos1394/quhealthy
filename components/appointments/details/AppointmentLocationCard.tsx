"use client";

import React from "react";
import { MapPin, Video, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

export function AppointmentLocationCard({
  isOnline,
  meetLink,
  locationAddress,
}: {
  isOnline: boolean;
  meetLink?: string;
  locationAddress?: string;
}) {
  const t = useTranslations("AppointmentDetails.location");

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden space-y-6 p-6 sm:p-8 font-sans">
      <div className="pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
          <MapPin className="w-5 h-5" strokeWidth={2} />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          {isOnline ? (
            <Video className="w-6 h-6" strokeWidth={2} />
          ) : (
            <MapPin className="w-6 h-6" strokeWidth={2} />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {t("modality_label")}: {isOnline ? t("online") : t("presencial")}
          </p>

          {isOnline ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 leading-relaxed">
                {t("online_desc")}
              </p>
              {meetLink ? (
                <a
                  href={meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <Video className="w-4 h-4" strokeWidth={2} />
                  <span>{t("start_call")}</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Clock className="w-4 h-4" strokeWidth={2} />
                  <span>{t("link_generating")}</span>
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
              {locationAddress || t("no_address")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}