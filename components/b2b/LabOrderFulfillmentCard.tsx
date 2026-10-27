"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  FlaskConical,
  ArrowRight,
  Download,
  AlertCircle,
  Building2,
  User,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type B2BLabOrderStatus = "ORDERED" | "SAMPLE_COLLECTED" | "RESULTS_READY";

export interface B2BLabOrder {
  id: string | number;
  folio: string;
  patientName: string;
  referringPhysician: string;
  studyName: string;
  serviceType?: "BRANCH_SAMPLE" | "HOME_PHLEBOTOMY";
  status: B2BLabOrderStatus;
  createdAt: string;
  sampleCollectedAt?: string;
  resultsReadyAt?: string;
  resultsPdfUrl?: string;
}

interface LabOrderFulfillmentProps {
  order: B2BLabOrder;
  onUpdateStatus?: (orderId: string | number, nextStatus: B2BLabOrderStatus) => Promise<void> | void;
  isReadOnly?: boolean;
}

export function LabOrderFulfillmentCard({
  order,
  onUpdateStatus,
  isReadOnly = false,
}: LabOrderFulfillmentProps) {
  const [currentStatus, setCurrentStatus] = useState<B2BLabOrderStatus>(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBadge = (status: B2BLabOrderStatus) => {
    switch (status) {
      case "ORDERED":
        return {
          label: "ORDERED",
          displayLabel: "Orden Recibida",
          style: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
          icon: Clock,
        };
      case "SAMPLE_COLLECTED":
        return {
          label: "SAMPLE_COLLECTED",
          displayLabel: "Muestra Recolectada",
          style: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
          icon: FlaskConical,
        };
      case "RESULTS_READY":
        return {
          label: "RESULTS_READY",
          displayLabel: "Resultados Listos",
          style: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
          icon: CheckCircle2,
        };
    }
  };

  const badgeInfo = getStatusBadge(currentStatus);
  const BadgeIcon = badgeInfo.icon;

  const handleAdvanceStatus = async () => {
    let nextStatus: B2BLabOrderStatus | null = null;
    if (currentStatus === "ORDERED") nextStatus = "SAMPLE_COLLECTED";
    else if (currentStatus === "SAMPLE_COLLECTED") nextStatus = "RESULTS_READY";

    if (!nextStatus) return;

    try {
      setIsUpdating(true);
      if (onUpdateStatus) {
        await onUpdateStatus(order.id, nextStatus);
      }
      setCurrentStatus(nextStatus);
    } catch (e) {
      console.error("Error al actualizar estado de orden B2B:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      data-testid={`b2b-lab-order-card-${order.id}`}
      className="bg-white dark:bg-[#121212] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Folio: {order.folio}
              </span>
              <span className="text-[10px] text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {order.serviceType === "HOME_PHLEBOTOMY" ? "Toma a Domicilio" : "Toma en Sucursal"}
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {order.studyName}
            </h4>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            data-testid="b2b-lab-order-status-badge"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeInfo.style}`}
          >
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badgeInfo.label}</span>
          </span>
        </div>
      </div>

      {/* Grid de Actores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-800">
          <User className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase">
              Paciente
            </p>
            <p className="font-bold text-slate-800 dark:text-zinc-200 truncate">
              {order.patientName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-800">
          <Stethoscope className="w-4 h-4 text-indigo-500" />
          <div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase">
              Médico Referente
            </p>
            <p className="font-bold text-slate-800 dark:text-zinc-200 truncate">
              {order.referringPhysician}
            </p>
          </div>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-2">
          <span className={currentStatus !== "ORDERED" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-900 dark:text-white font-bold"}>
            1. Emitida
          </span>
          <span className={currentStatus === "SAMPLE_COLLECTED" ? "text-amber-600 dark:text-amber-400 font-bold" : currentStatus === "RESULTS_READY" ? "text-indigo-600 dark:text-indigo-400 font-bold" : ""}>
            2. Muestra Tomada
          </span>
          <span className={currentStatus === "RESULTS_READY" ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
            3. Resultados Listos
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              currentStatus === "ORDERED"
                ? "w-1/3 bg-blue-500"
                : currentStatus === "SAMPLE_COLLECTED"
                ? "w-2/3 bg-amber-500"
                : "w-full bg-emerald-500"
            }`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-zinc-800/80">
        <span className="text-[11px] text-slate-400">
          Registrada: {new Date(order.createdAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {currentStatus === "RESULTS_READY" && order.resultsPdfUrl && (
            <a
              href={order.resultsPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="download-results-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Resultados
            </a>
          )}

          {!isReadOnly && currentStatus !== "RESULTS_READY" && (
            <Button
              type="button"
              data-testid="advance-order-status-btn"
              onClick={handleAdvanceStatus}
              disabled={isUpdating}
              className="w-full sm:w-auto h-9 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            >
              {currentStatus === "ORDERED"
                ? "Marcar Muestra Recolectada"
                : "Liberar Resultados QFB"}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
