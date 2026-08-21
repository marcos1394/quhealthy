"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  HeartHandshake,
  ShieldCheck,
  Award,
  Layers,
  Users,
  MapPin,
  ChevronRight,
  ExternalLink,
  Sparkles,
  CalendarDays,
} from "lucide-react";

import { FoundationPublicStorefront } from "@/types/foundation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FoundationCardProps {
  foundation: FoundationPublicStorefront & { distanceKm?: number; lat?: number; lng?: number };
  isSelected?: boolean;
  isGrid?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
}

export const FoundationCard: React.FC<FoundationCardProps> = ({
  foundation,
  isSelected = false,
  isGrid = false,
  onClick,
  onHover,
  onLeave,
}) => {
  const router = useRouter();

  const title = foundation.brandName || foundation.legalName;
  const programsCount = foundation.programs?.length || foundation.totalActiveProgramsCount || 0;
  const campaignsCount = foundation.campaigns?.length || 0;

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/foundation/${foundation.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "group relative bg-white dark:bg-[#0a0a0a] border rounded-3xl p-5 md:p-6 shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-0.5",
        isSelected
          ? "border-rose-500 ring-2 ring-rose-500/20 shadow-md"
          : "border-gray-100 dark:border-gray-800 hover:border-rose-500/40"
      )}
    >
      {/* ── ENCABEZADO INSTITUCIONAL ─────────────────────────────────── */}
      <div className="flex items-start gap-4">
        {foundation.logoUrl ? (
          <div className="w-14 h-14 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-[#050505] shrink-0 shadow-2xs">
            <img
              src={foundation.logoUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs shadow-rose-500/20">
            {title.substring(0, 2).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200/80 dark:border-rose-900/40 uppercase tracking-wider">
              {foundation.organizationType || "OSC"}
            </span>

            {foundation.isAuthorizedDonatary && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-900/40">
                <ShieldCheck className="w-3 h-3 text-indigo-600" /> Donataria SAT
              </span>
            )}

            {foundation.cluniNumber && (
              <span className="text-[10px] font-mono font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800/60 px-2 py-0.5 rounded-full border border-gray-200/80 dark:border-gray-800">
                CLUNI: {foundation.cluniNumber}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-rose-600 transition-colors">
            {title}
          </h3>

          {foundation.legalName && foundation.brandName && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate font-medium">
              {foundation.legalName}
            </p>
          )}
        </div>
      </div>

      {/* ── MISIÓN / ALCANCE ─────────────────────────────────────────── */}
      {foundation.mission && (
        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
          {foundation.mission}
        </p>
      )}

      {/* ── CAUSAS DE SALUD ─────────────────────────────────────────── */}
      {foundation.primaryCauses && foundation.primaryCauses.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {foundation.primaryCauses.slice(0, 3).map((cause, idx) => (
            <span
              key={idx}
              className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-lg"
            >
              {cause}
            </span>
          ))}
          {foundation.primaryCauses.length > 3 && (
            <span className="text-[10px] font-semibold text-gray-400 self-center">
              +{foundation.primaryCauses.length - 3} más
            </span>
          )}
        </div>
      )}

      {/* ── IMPACTO Y BENEFICIOS DISPONIBLES ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/80 text-xs">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
          <Layers className="w-4 h-4 shrink-0" />
          <span>{programsCount} {programsCount === 1 ? "Programa activo" : "Programas activos"}</span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium justify-end">
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="truncate">
            {foundation.addressCity || "Culiacán"}, {foundation.addressState || "Sinaloa"}
          </span>
          {foundation.distanceKm !== undefined && (
            <span className="text-gray-400 font-mono text-[11px]">
              • {foundation.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>
      </div>

      {/* ── BOTÓN DE ACCIÓN CIUDADANA ─────────────────────────────────── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/foundation/${foundation.id}`);
          }}
          className="w-full h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
        >
          <span>Ver Programas & Solicitar Apoyo</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
