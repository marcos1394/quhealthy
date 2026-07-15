"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/SessionStore";
import { useTeleconsultationStore } from "@/stores/TeleconsultationStore";
import { useTeleconsultation } from "@/hooks/useTeleconsultation";
import { ConsultationLayout } from "@/components/teleconsultation/ConsultationLayout";
import { DeviceSetup } from "@/components/teleconsultation/DeviceSetup";
import { WaitingRoom } from "@/components/teleconsultation/WaitingRoom";
import { ConsultationRoom } from "@/components/teleconsultation/ConsultationRoom";
import { CallFinished } from "@/components/teleconsultation/CallFinished";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoCallPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useSessionStore();

  const rawId = params.appointmentId;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId || "";

  const { startSetup, joinCall, cleanup, media } = useTeleconsultation(
    appointmentId,
    "PATIENT",
  );
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

  if (
    isLoading ||
    state === "IDLE" ||
    state === "CHECKING_ACCESS" ||
    !appointmentId
  ) {
    return (
      <ConsultationLayout>
        <div className="flex flex-col items-center justify-center">
          <QhSpinner size="lg" />
          <p className="text-slate-600 mt-4 animate-pulse">
            Preparando entorno seguro...
          </p>
        </div>
      </ConsultationLayout>
    );
  }

  if (state === "FAILED") {
    return (
      <ConsultationLayout>
        <div className="flex flex-col items-center justify-center p-6 text-center text-slate-900">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Conexión Fallida</h2>
          <p className="text-slate-600 max-w-sm mx-auto mb-8">
            No pudimos establecer conexión con la sala. Verifica tu internet o
            si tienes permisos suficientes.
          </p>
          <Button onClick={() => router.push("/patient/dashboard")}>
            Volver al Panel
          </Button>
        </div>
      </ConsultationLayout>
    );
  }

  return (
    <ConsultationLayout>
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
