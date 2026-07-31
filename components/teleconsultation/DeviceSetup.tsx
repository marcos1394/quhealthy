"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Video, Mic, AlertCircle } from "lucide-react";

import { useTeleconsultationStore } from "@/stores/TeleconsultationStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface DeviceSetupProps {
  media: any;
  onJoin: () => void;
  isLoading?: boolean;
}

export const DeviceSetup: React.FC<DeviceSetupProps> = ({
  media,
  onJoin,
  isLoading,
}) => {
  const t = useTranslations("DeviceSetup");
  const { systemChecks, localStream, preferredLanguage, setPreferredLanguage } =
    useTeleconsultationStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!localStream && !media.isInitializing && !media.error) {
      media.requestPermissions();
    }
  }, [localStream, media]);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const allChecksPassed =
    systemChecks.camera && systemChecks.mic && systemChecks.internet;

  return (
    <div className="relative w-full h-full bg-gray-900 flex flex-col overflow-hidden font-sans select-none">
      {/* ── VISTA PREVIA DE CÁMARA ─────────────────────────────────── */}
      <div className="absolute inset-0 z-0 bg-gray-900 flex items-center justify-center overflow-hidden">
        {localStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-3">
            {media.isInitializing ? (
              <QhSpinner size="lg" className="text-emerald-400" />
            ) : (
              <div className="w-16 h-16 rounded-3xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 shadow-2xs">
                <Video className="w-8 h-8 opacity-60" strokeWidth={2} />
              </div>
            )}

            <p className="text-xs font-bold text-gray-300">
              {media.error
                ? t("camera_not_accessible")
                : t("requesting_permissions")}
            </p>

            {media.error && (
              <Button
                type="button"
                onClick={() => media.requestPermissions()}
                variant="outline"
                className="mt-2 rounded-xl border-gray-700 bg-gray-800 text-white text-xs font-bold hover:bg-gray-700 cursor-pointer shadow-2xs"
              >
                {t("btn_retry")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── BANDERAS DE ESTADO DE SISTEMA (TOP RIGHT) ──────────────── */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 pointer-events-none">
        <Badge
          className={
            systemChecks.camera
              ? "bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold px-3 py-1 rounded-full shadow-2xs"
              : "bg-rose-600 text-white border-0 text-xs font-bold px-3 py-1 rounded-full shadow-2xs"
          }
        >
          <Video className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
          <span>{systemChecks.camera ? t("cam_ok") : t("cam_error")}</span>
        </Badge>

        <Badge
          className={
            systemChecks.mic
              ? "bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold px-3 py-1 rounded-full shadow-2xs"
              : "bg-rose-600 text-white border-0 text-xs font-bold px-3 py-1 rounded-full shadow-2xs"
          }
        >
          <Mic className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
          <span>{systemChecks.mic ? t("mic_ok") : t("mic_error")}</span>
        </Badge>

        <Badge
          className={
            systemChecks.internet
              ? "bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold px-3 py-1 rounded-full shadow-2xs"
              : "bg-amber-500 text-white border-0 text-xs font-bold px-3 py-1 rounded-full shadow-2xs"
          }
        >
          <AlertCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
          <span>{systemChecks.internet ? t("net_ok") : t("net_error")}</span>
        </Badge>
      </div>

      {/* ── PANEL INFERIOR Y BOTÓN DE INGRESO ───────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex flex-col items-center bg-gradient-to-t from-black/80 via-black/50 to-transparent space-y-4">
        {/* Selector de Idioma de Traducción */}
        <div className="w-full sm:w-auto min-w-[240px] space-y-1">
          <label className="text-[11px] font-bold text-gray-300 text-center block">
            {t("subtitle_language")}
          </label>

          <select
            className="w-full bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white outline-none shadow-2xs cursor-pointer"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
          >
            <option value="es">{t("lang_es")}</option>
            <option value="en">{t("lang_en")}</option>
          </select>
        </div>

        {/* Botón Ingresar */}
        <Button
          type="button"
          className="w-full sm:w-auto min-w-[240px] h-12 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-lg border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          onClick={onJoin}
          disabled={!allChecksPassed || isLoading}
        >
          {isLoading ? (
            <>
              <QhSpinner size="sm" className="text-white" />
              <span>{t("btn_joining")}</span>
            </>
          ) : (
            <span>{t("btn_join")}</span>
          )}
        </Button>
      </div>
    </div>
  );
};