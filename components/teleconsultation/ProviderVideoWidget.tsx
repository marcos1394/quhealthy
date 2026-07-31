"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle } from "lucide-react";

import { useTeleconsultation } from "@/hooks/useTeleconsultation";
import { useTeleconsultationStore } from "@/stores/TeleconsultationStore";
import { DeviceSetup } from "@/components/teleconsultation/DeviceSetup";
import { WaitingRoom } from "@/components/teleconsultation/WaitingRoom";
import { ConsultationRoom } from "@/components/teleconsultation/ConsultationRoom";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";

interface ProviderVideoWidgetProps {
  appointmentId: number;
  onClosePanel?: () => void;
}

export const ProviderVideoWidget: React.FC<ProviderVideoWidgetProps> = ({
  appointmentId,
  onClosePanel,
}) => {
  const t = useTranslations("ProviderVideoWidget");
  const { startSetup, joinCall, cleanup, endCall, media } = useTeleconsultation(
    appointmentId.toString(),
    "PROVIDER"
  );
  const { state } = useTeleconsultationStore();

  useEffect(() => {
    if (state === "IDLE") {
      startSetup();
    }
  }, [state, startSetup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleJoin = async () => {
    await joinCall(appointmentId.toString());
  };

  if (state === "IDLE" || state === "CHECKING_ACCESS") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans select-none space-y-3">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-bold text-gray-400 animate-pulse">
          {t("starting_call")}
        </p>
      </div>
    );
  }

  if (state === "FAILED") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-[#0a0a0a] font-sans select-none space-y-4">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-2xs">
          <AlertCircle className="w-7 h-7" strokeWidth={2} />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {t("connection_error_title")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            {t("connection_error_desc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-white dark:bg-[#0a0a0a] font-sans">
      {state === "DEVICE_SETUP" && (
        <DeviceSetup media={media} onJoin={handleJoin} isLoading={false} />
      )}

      {(state === "JOINING" || state === "WAITING") && <WaitingRoom />}

      {(state === "CONNECTING" ||
        state === "RECONNECTING" ||
        state === "CONNECTED") && <ConsultationRoom onHangup={endCall} />}

      {state === "COMPLETED" && (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-[#0a0a0a] font-sans select-none space-y-4">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
            <CheckCircle className="w-7 h-7" strokeWidth={2} />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {t("finished_title")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              {t("finished_desc")}
            </p>
          </div>

          {onClosePanel && (
            <Button
              type="button"
              onClick={onClosePanel}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer h-10 px-5"
            >
              {t("btn_close_panel")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};