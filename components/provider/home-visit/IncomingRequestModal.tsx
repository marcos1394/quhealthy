"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
  Stethoscope,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { homeVisitService } from "@/services/homeVisit.service";

export interface IncomingHomeVisitRequest {
  appointmentId: number;
  serviceName: string;
  patientName: string;
  patientAddress: string;
  distanceKm: number;
  totalEarnings: number;
  symptoms?: string;
  timeoutSeconds?: number;
}

interface IncomingRequestModalProps {
  request: IncomingHomeVisitRequest | null;
  onAccept: (appointmentId: number) => void;
  onDecline: () => void;
}

export const IncomingRequestModal: React.FC<IncomingRequestModalProps> = ({
  request,
  onAccept,
  onDecline,
}) => {
  const [timeLeft, setTimeLeft] = useState(request?.timeoutSeconds || 45);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!request) return;
    setTimeLeft(request.timeoutSeconds || 45);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [request]);

  if (!request) return null;

  const handleAccept = async () => {
    try {
      setAccepting(true);
      await homeVisitService.acceptHomeVisit(request.appointmentId);
      toast.success("¡Solicitud aceptada! Navegación GPS hacia el paciente habilitada");
      onAccept(request.appointmentId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "La solicitud ya fue tomada por otro médico o expiró");
      onDecline();
    } finally {
      setAccepting(false);
    }
  };

  const progressPercent = (timeLeft / (request.timeoutSeconds || 45)) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          className="w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xl border-2 border-emerald-500 overflow-hidden"
        >
          {/* Barra de Tiempo Regresivo */}
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="p-6 space-y-6">
            {/* Header Alerta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center animate-bounce shadow-lg shadow-emerald-600/30">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    Nueva Solicitud On-Demand
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                    {request.serviceName || "Consulta a Domicilio"}
                  </h3>
                </div>
              </div>

              {/* Contador Circular */}
              <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center font-mono font-bold text-base text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
                {timeLeft}s
              </div>
            </div>

            {/* Datos Clave: Tarifa y Distancia */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">
                  Ganancia Estimada
                </span>
                <span className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${request.totalEarnings} MXN
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-center">
                <span className="text-[11px] font-semibold text-gray-500 block">
                  Distancia de Traslado
                </span>
                <span className="text-2xl font-mono font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                  <Navigation className="w-5 h-5 text-emerald-600" />
                  {request.distanceKm} km
                </span>
              </div>
            </div>

            {/* Dirección y Síntomas */}
            <div className="space-y-3 bg-gray-50 dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                  {request.patientAddress}
                </p>
              </div>

              {request.symptoms && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Motivo: </span>
                  {request.symptoms}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onDecline}
                className="flex-1 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer transition-all"
              >
                Rechazar
              </button>

              <button
                type="button"
                onClick={handleAccept}
                disabled={accepting}
                className="flex-2 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{accepting ? "Aceptando..." : "Aceptar Visita"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
