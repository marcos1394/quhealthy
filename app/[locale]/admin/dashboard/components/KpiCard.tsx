import React from "react";
import {
  LucideIcon,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  FlaskConical,
} from "lucide-react";
import { SignalQuality } from "@/types/admin-signal";

interface KpiCardProps {
  title: string;
  value: string | number | null;
  subtext?: string;
  changePercent?: number;
  changePeriod?: string;
  icon: LucideIcon;
  variant?: "blue" | "emerald" | "purple" | "orange" | "rose" | "indigo" | "slate";
  quality?: SignalQuality;
  source?: string;
  owner?: string;
  asOf?: string;
  period?: string;
  isFilterable?: boolean;
  explanation?: string;
}

const colorMap = {
  blue: {
    border: "border-l-blue-500",
    iconBg: "bg-blue-50 text-blue-600",
    badge: "text-blue-700 bg-blue-50",
  },
  emerald: {
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600",
    badge: "text-emerald-700 bg-emerald-50",
  },
  purple: {
    border: "border-l-purple-500",
    iconBg: "bg-purple-50 text-purple-600",
    badge: "text-purple-700 bg-purple-50",
  },
  orange: {
    border: "border-l-orange-500",
    iconBg: "bg-orange-50 text-orange-600",
    badge: "text-orange-700 bg-orange-50",
  },
  rose: {
    border: "border-l-rose-500",
    iconBg: "bg-rose-50 text-rose-600",
    badge: "text-rose-700 bg-rose-50",
  },
  indigo: {
    border: "border-l-indigo-500",
    iconBg: "bg-indigo-50 text-indigo-600",
    badge: "text-indigo-700 bg-indigo-50",
  },
  slate: {
    border: "border-l-slate-400",
    iconBg: "bg-slate-100 text-slate-700",
    badge: "text-slate-700 bg-slate-100",
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtext,
  changePercent,
  changePeriod = "vs mes anterior",
  icon: Icon,
  variant = "slate",
  quality,
  source,
  owner,
  asOf,
  period,
  isFilterable = true,
  explanation,
}) => {
  const colors = colorMap[variant];

  // Renderizado del badge de calidad (ADMIN-TRUST-01)
  const renderQualityBadge = () => {
    if (!quality) return null;

    switch (quality) {
      case "CERTIFIED":
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
            title={`Dato certificado conciliado. Fuente: ${source || "Oficial"} · Dueño: ${owner || "Corporativo"}`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
            Certificado
          </span>
        );
      case "PROVISIONAL":
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
            title={`Dato provisional / estimado. ${explanation || "Modelo teórico no conciliado"}`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" aria-hidden="true" />
            Estimado
          </span>
        );
      case "UNAVAILABLE":
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
            title={`Dato no disponible. ${explanation || "La fuente no proveyó datos para el corte"}`}
          >
            <HelpCircle className="w-3 h-3 text-slate-500" aria-hidden="true" />
            No disponible
          </span>
        );
      case "ERROR":
        return (
          <span
            role="alert"
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200"
            title={`Fallo de consulta. ${explanation || "La fuente arrojó un error"}`}
          >
            <XCircle className="w-3 h-3 text-rose-600" aria-hidden="true" />
            Error de fuente
          </span>
        );
      case "SIMULATED":
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200"
            title="Dato simulado / test fixture"
          >
            <FlaskConical className="w-3 h-3 text-purple-600" aria-hidden="true" />
            Simulado
          </span>
        );
    }
  };

  // Valor a mostrar según estado de calidad (erradicando fallbacks a cero falso)
  const displayValue = () => {
    if (quality === "ERROR") {
      return (
        <span className="text-xl font-bold text-rose-600 flex items-center gap-1.5">
          <XCircle className="w-5 h-5 text-rose-500 shrink-0" aria-hidden="true" />
          Error de consulta
        </span>
      );
    }
    if (quality === "UNAVAILABLE") {
      return (
        <span className="text-xl font-bold text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
          No disponible
        </span>
      );
    }
    return value !== null && value !== undefined ? value : "—";
  };

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${colors.border} flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </span>
          <div className={`p-2 rounded-xl shrink-0 ${colors.iconBg}`}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

        <div className="mt-2.5">
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {displayValue()}
          </h3>
        </div>
      </div>

      <div className="mt-4 pt-2.5 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
          {changePercent !== undefined && quality !== "ERROR" && quality !== "UNAVAILABLE" ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`font-semibold px-2 py-0.5 rounded-full ${
                  changePercent >= 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`}
              </span>
              <span className="text-slate-400">{changePeriod}</span>
            </div>
          ) : subtext ? (
            <span className="text-slate-500 font-medium text-[11px] truncate">
              {subtext}
            </span>
          ) : (
            <span />
          )}

          {/* Badge de Veracidad */}
          {renderQualityBadge()}
        </div>

        {/* Linaje de señal: Fuente, Corte y Filtro de período */}
        {(source || !isFilterable) && (
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            {source && (
              <span className="truncate max-w-[180px]" title={`Fuente: ${source}${owner ? ` · Dueño: ${owner}` : ''}`}>
                Fuente: {source}
              </span>
            )}
            {!isFilterable && (
              <span
                className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium ml-auto"
                title="Esta métrica representa un snapshot actual en tiempo real y no varía con el selector de rango temporal"
              >
                En vivo
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
