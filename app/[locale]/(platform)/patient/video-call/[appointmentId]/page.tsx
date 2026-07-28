"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, ShieldCheck } from "lucide-react";

import { useSessionStore } from "@/stores/SessionStore";
import { useTeleconsultationStore } from "@/stores/TeleconsultationStore";
import { useTeleconsultation } from "@/hooks/useTeleconsultation";

import { ConsultationLayout } from "@/components/teleconsultation/ConsultationLayout";
import { DeviceSetup } from "@/components/teleconsultation/DeviceSetup";
import { WaitingRoom } from "@/components/teleconsultation/WaitingRoom";
import { ConsultationRoom } from "@/components/teleconsultation/ConsultationRoom";
import { CallFinished } from "@/components/teleconsultation/CallFinished";
import { AiConsentModal } from "@/components/teleconsultation/AiConsentModal";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";

export default function VideoCallPage() {
  const t = useTranslations("PatientTeleconsultation");
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useSessionStore();

  const rawId = params.appointmentId;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId || "";

  const { startSetup, submitAiConsent, joinCall, cleanup, media } =
    useTeleconsultation(appointmentId, "PATIENT");
  const { state } = useTeleconsultationStore();

  useEffect(() => {
    if (!isLoading && user && state === "IDLE") {
      startSetup();
    }
  }, [isLoading, user, state, startSetup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleJoin = async () => {
    await joinCall(appointmentId);
  };

  // ── ESTADO: CARGANDO / VERIFICANDO ACCESO ──────────────────────────────
  if (
    isLoading ||
    state === "IDLE" ||
    state === "CHECKING_ACCESS" ||
    !appointmentId
  ) {
    return (
      <ConsultationLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <QhSpinner size="lg" />
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
            {t("loading_preparing")}
          </p>
        </div>
      </ConsultationLayout>
    );
  }

  // ── ESTADO: ERROR DE CONEXIÓN / ACCESO DENEGADO ─────────────────────────
  if (state === "FAILED") {
    return (
      <ConsultationLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 mb-6 flex items-center justify-center border border-rose-100 dark:border-rose-900/40 shadow-sm">
            <AlertCircle className="w-8 h-8" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            {t("failed_title")}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            {t("failed_desc")}
          </p>
          <Button
            onClick={() => router.push("/patient/dashboard")}
            className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 text-xs font-bold transition-all shadow-sm border-0"
          >
            {t("btn_back_dashboard")}
          </Button>
        </div>
      </ConsultationLayout>
    );
  }

  // ── ESTADOS DE LA SALA DE CONSULTA ─────────────────────────────────────
  return (
    <ConsultationLayout>
      {state === "AI_CONSENT" && (
        <AiConsentModal onSubmit={submitAiConsent} />
      )}

      {state === "DEVICE_SETUP" && (
        <DeviceSetup media={media} onJoin={handleJoin} isLoading={false} />
      )}

      {(state === "JOINING" || state === "WAITING") && <WaitingRoom />}

      {(state === "CONNECTING" ||
        state === "RECONNECTING" ||
        state === "CONNECTED") && <ConsultationRoom />}

      {state === "COMPLETED" && <CallFinished />}
    </ConsultationLayout>
  );
}