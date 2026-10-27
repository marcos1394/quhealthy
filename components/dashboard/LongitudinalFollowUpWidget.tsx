"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Activity,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LongitudinalPlanItem {
  id: string;
  timeframe: "7_DAYS" | "30_DAYS" | "90_DAYS" | "180_DAYS";
  label: string;
  actionTitle: string;
  description: string;
  status: "PENDING" | "COMPLETED" | "SCHEDULED";
  category: "MEDICATION_ADHERENCE" | "LAB_TEST" | "CHECKUP" | "LIFESTYLE";
}

interface LongitudinalFollowUpWidgetProps {
  currentScore?: number;
  deltaScore?: number;
  patientName?: string;
  lastConsultationDate?: string;
  plans?: LongitudinalPlanItem[];
  onScheduleCheckup?: (timeframe: string) => void;
}

const DEFAULT_PLANS: LongitudinalPlanItem[] = [
  {
    id: "plan-7d",
    timeframe: "7_DAYS",
    label: "7 Días Post-Consulta",
    actionTitle: "Revisión de Tolerancia al Tratamiento",
    description: "Confirmación de adherencia farmacológica inicial y ausencia de efectos adversos.",
    status: "COMPLETED",
    category: "MEDICATION_ADHERENCE",
  },
  {
    id: "plan-30d",
    timeframe: "30_DAYS",
    label: "30 Días",
    actionTitle: "Estudios de Laboratorio de Control",
    description: "Química sanguínea y perfil lipídico para validar respuesta terapéutica.",
    status: "PENDING",
    category: "LAB_TEST",
  },
  {
    id: "plan-90d",
    timeframe: "90_DAYS",
    label: "3 Meses",
    actionTitle: "Consulta de Seguimiento y Ajuste",
    description: "Evaluación integral de métricas clínicas y recalculación de HealthScore.",
    status: "SCHEDULED",
    category: "CHECKUP",
  },
  {
    id: "plan-180d",
    timeframe: "180_DAYS",
    label: "6 Meses",
    actionTitle: "Check-up Semestral Preventivo",
    description: "Monitoreo longitudinal para prevención de comorbilidades crónicas.",
    status: "PENDING",
    category: "CHECKUP",
  },
];

export const LongitudinalFollowUpWidget: React.FC<LongitudinalFollowUpWidgetProps> = ({
  currentScore = 78,
  deltaScore = +6,
  patientName,
  lastConsultationDate = "Reciente",
  plans = DEFAULT_PLANS,
  onScheduleCheckup,
}) => {
  return (
    <div
      data-testid="longitudinal-followup-panel"
      className="w-full rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200/80 dark:border-gray-800 p-6 sm:p-7 shadow-xs font-sans space-y-6"
    >
      {/* ── CABECERA Y METRICAS LONGITUDINALES ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Activity className="w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Health OS Pulso · Seguimiento Longitudinal
              </span>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/30">
                NOM-004 / NOM-024
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight mt-0.5">
              Plan de Cuidados Continuos & Evolución
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {patientName ? `Paciente: ${patientName} · ` : ""}Última consulta: {lastConsultationDate}
            </p>
          </div>
        </div>

        {/* Delta de HealthScore */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#050505] p-3 rounded-2xl border border-gray-100 dark:border-gray-800 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Evolución</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              Score Actual: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{currentScore}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{deltaScore > 0 ? `+${deltaScore}` : deltaScore} pts</span>
          </div>
        </div>
      </div>

      {/* ── LÍNEA DE TIEMPO DE CUIDADOS 7/30/90/180 DÍAS ── */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Hitos de Adherencia y Estudios de Control
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {plans.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] space-y-2 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                  {item.label}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : item.status === "SCHEDULED"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                  }`}
                >
                  {item.status === "COMPLETED"
                    ? "Completado"
                    : item.status === "SCHEDULED"
                    ? "Agendado"
                    : "Pendiente"}
                </span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">{item.actionTitle}</h5>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.status === "PENDING" && onScheduleCheckup && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onScheduleCheckup(item.timeframe)}
                  className="w-full text-[11px] h-8 rounded-xl font-bold mt-1 border-gray-200 dark:border-gray-700"
                >
                  <CalendarCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Agendar Recordatorio
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
