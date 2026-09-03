"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  FileSpreadsheet,
  Award,
  Sparkles,
  PhoneCall
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LaboratoryOnboardingStatusResponse,
  ReadinessTier
} from "@/types/laboratory";
import { cn } from "@/lib/utils";

interface Step5SummaryActivationProps {
  status: LaboratoryOnboardingStatusResponse | null;
  onFinish: () => void;
  isLoading?: boolean;
}

export const Step5SummaryActivation: React.FC<Step5SummaryActivationProps> = ({
  status,
  onFinish,
  isLoading = false,
}) => {
  useEffect(() => {
    // Disparar confetti de bienvenida
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#2563eb", "#3b82f6", "#10b981", "#6366f1"],
      });
    } catch {
      // Confetti opcional si falla en SSR
    }
  }, []);

  const readinessTier = status?.readinessTier || "TIER_BRONZE";
  const percentage = status?.completionPercentage || 0;

  const tierConfig: Record<
    ReadinessTier,
    { badge: string; label: string; desc: string; color: string; border: string; bg: string }
  > = {
    TIER_BRONZE: {
      badge: "🥉 Nivel Bronce",
      label: "Perfil Inicial Activo",
      desc: "Tienes acceso para explorar todas las herramientas administrativas del panel. Podrás completar los datos regulatorios en cualquier momento.",
      color: "text-amber-700 dark:text-amber-400",
      border: "border-amber-300 dark:border-amber-800",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    TIER_SILVER: {
      badge: "🥈 Nivel Plata",
      label: "Operativo Local",
      desc: "Tu sede y catálogo de estudios están listos. Los pacientes y médicos de tu zona pueden consultar tu ubicación y disponibilidad de pruebas.",
      color: "text-slate-700 dark:text-slate-300",
      border: "border-slate-300 dark:border-slate-700",
      bg: "bg-slate-50 dark:bg-slate-900/30",
    },
    TIER_GOLD: {
      badge: "🥇 Nivel Oro",
      label: "Acreditado QuHealthy",
      desc: "Aviso de funcionamiento COFEPRIS y Responsable Sanitario verificados. Tu laboratorio está habilitado para convenios corporativos y marketplace.",
      color: "text-blue-700 dark:text-blue-400",
      border: "border-blue-300 dark:border-blue-800",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
  };

  const currentTier = tierConfig[readinessTier] || tierConfig.TIER_BRONZE;

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-6 text-left">
      {/* Encabezado */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-7 h-7" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Paso 5 de 5 • Registro Finalizado
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          ¡Bienvenido a la Red de Diagnóstico QuHealthy!
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Hemos configurado el expediente digital de tu laboratorio. A continuación verás el estado de tus fases y el nivel alcanzado.
        </p>
      </div>

      {/* Tarjeta de Nivel de Madurez (Readiness Tier) */}
      <div
        className={cn(
          "p-6 rounded-3xl border transition-all shadow-sm space-y-3",
          currentTier.bg,
          currentTier.border
        )}
      >
        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white dark:bg-black/40 border", currentTier.border, currentTier.color)}>
            {currentTier.badge}
          </span>
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {percentage}% de expediente
          </div>
        </div>
        <div>
          <h3 className={cn("text-base font-bold", currentTier.color)}>
            {currentTier.label}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
            {currentTier.desc}
          </p>
        </div>
      </div>

      {/* Auditoría de lo Completado vs Omitido */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Estado del Expediente por Fase
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Fase 1 */}
          <div className="p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Identidad & Modelo</p>
                <p className="text-[10px] text-gray-400">Datos generales y sucursal</p>
              </div>
            </div>
            {status?.identityCompleted ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Listo
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                Omitido
              </span>
            )}
          </div>

          {/* Fase 2 */}
          <div className="p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Sanitario & COFEPRIS</p>
                <p className="text-[10px] text-gray-400">NOM-007 y Cédula</p>
              </div>
            </div>
            {status?.sanitaryCompleted ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Listo
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                Omitido
              </span>
            )}
          </div>

          {/* Fase 3 */}
          <div className="p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Sede Matriz</p>
                <p className="text-[10px] text-gray-400">Dirección y horarios de ayuno</p>
              </div>
            </div>
            {status?.branchesConfigured ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Listo
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                Omitido
              </span>
            )}
          </div>

          {/* Fase 4 */}
          <div className="p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Catálogo de Estudios</p>
                <p className="text-[10px] text-gray-400">Pruebas, tiempos y precios</p>
              </div>
            </div>
            {status?.catalogConfigured ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Listo
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                Omitido
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nota de Acompañamiento Comercial */}
      <div className="p-5 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <PhoneCall className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
            Acompañamiento Comercial QuHealthy
          </p>
          <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
            Nuestro equipo de alianzas clínicas te contactará para apoyarte en la integración de tu LIS, carga masiva de paquetes o convenios con médicos de la red.
          </p>
        </div>
      </div>

      {/* Botón Principal de Acceso al Panel */}
      <div className="pt-2 text-center">
        <Button
          onClick={onFinish}
          disabled={isLoading}
          className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>Ir a mi Panel de Laboratorio</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
