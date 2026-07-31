"use client";

import React, { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Clock, Shield, Bell } from "lucide-react";

import { useTeleconsultationStore } from "@/stores/TeleconsultationStore";
import { useTeleconsultationTimer } from "@/hooks/useTeleconsultationTimer";
import { Badge } from "@/components/ui/badge";

export const WaitingRoom: React.FC = () => {
  const t = useTranslations("WaitingRoom");
  const { localStream, role } = useTeleconsultationStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { formattedTime } = useTeleconsultationTimer();

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const isPatient = role === "PATIENT";

  return (
    <div className="w-full h-full flex items-center justify-center relative bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans select-none transition-colors p-6">
      <div className="z-10 w-full max-w-4xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Información y Estado */}
        <div className="w-full md:w-1/2 flex flex-col gap-5 text-center md:text-left">
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-xs font-bold px-3 py-1 shadow-2xs w-fit mx-auto md:mx-0 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{t("secure_connection")}</span>
          </Badge>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {isPatient ? t("patient_waiting_title") : t("provider_waiting_title")}
            </h1>

            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {isPatient ? t("patient_waiting_desc") : t("provider_waiting_desc")}
            </p>
          </div>

          <div className="bg-gray-50/60 dark:bg-[#050505] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                <Clock className="w-6 h-6" strokeWidth={2} />
              </div>

              <div className="text-left space-y-0.5">
                <p className="text-xs font-bold text-gray-400">
                  {t("time_remaining")}
                </p>
                <p className="text-2xl font-mono font-black text-gray-900 dark:text-white tracking-tight">
                  {formattedTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
              <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              <p>{t("auto_notice")}</p>
            </div>
          </div>
        </div>

        {/* Vista Previa de Cámara Local */}
        <div className="w-full md:w-1/2 max-w-sm">
          <div className="bg-gray-900 rounded-3xl overflow-hidden aspect-[3/4] relative border-2 border-gray-100 dark:border-gray-800 shadow-xl">
            {localStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-400">
                {t("camera_off")}
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 text-center">
              <Badge className="bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-full text-xs font-bold px-3 py-1 shadow-2xs">
                {t("local_video_label")}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};