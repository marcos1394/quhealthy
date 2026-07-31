"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, Calendar, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTeleconsultationStore } from "@/stores/TeleconsultationStore";

export const CallFinished: React.FC = () => {
  const t = useTranslations("CallFinished");
  const { role } = useTeleconsultationStore();
  const isPatient = role === "PATIENT";
  const [rating, setRating] = useState(0);

  return (
    <div className="w-full max-w-md mx-auto p-6 text-center font-sans select-none">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6">
        
        {/* Icono de Éxito */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shadow-2xs">
          <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {isPatient ? t("patient_desc") : t("provider_desc")}
          </p>
        </div>

        {/* Sección de Calificación para Pacientes */}
        {isPatient && (
          <div className="bg-gray-50/60 dark:bg-[#050505] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("rating_title")}
            </h3>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 dark:text-gray-700 fill-transparent"
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botones de Navegación */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            type="button"
            onClick={() =>
              (window.location.href = isPatient
                ? "/patient/dashboard"
                : "/provider/dashboard")
            }
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer"
          >
            {t("btn_home")}
          </Button>

          {isPatient && (
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-2"
              onClick={() => (window.location.href = "/patient/appointments")}
            >
              <Calendar className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_schedule")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};