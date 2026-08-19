"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { CheckCircle2, Building2, ShieldCheck, HeartHandshake, Users, ArrowRight, Sparkles } from "lucide-react";
import { FoundationProfile, FoundationProgram, FoundationStaffMember } from "@/types/foundation";
import { useRouter } from "next/navigation";

interface Step5SuccessProps {
  profile?: FoundationProfile;
  program?: FoundationProgram;
  teamMembers?: FoundationStaffMember[];
  onFinish: () => void;
  isLoading?: boolean;
}

export const Step5Success: React.FC<Step5SuccessProps> = ({
  profile,
  program,
  teamMembers = [],
  onFinish,
  isLoading = false,
}) => {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto font-sans space-y-8 text-center pb-12">
      {/* ── ICONO Y HEADER DE ÉXITO ─────────────────────────────────── */}
      <div className="flex flex-col items-center space-y-3 pt-4">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
          <CheckCircle2 className="w-10 h-10" strokeWidth={2.5} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-[11px] font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Onboarding Institucional Completado</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          ¡Bienvenida, {profile?.brandName || profile?.legalName || "Fundación"}!
        </h1>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
          Tu expediente institucional ha sido registrado con éxito en QuHealthy. Nuestro equipo de Compliance revisará tus documentos legales en menos de 24 horas.
        </p>
      </div>

      {/* ── RESUMEN DE ACTIVACIÓN ────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 text-left shadow-sm space-y-6">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3">
          Resumen de Configuración Inicial
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
              <Building2 className="w-4 h-4" />
              <span>Institución</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{profile?.legalName}</p>
            <p className="text-[11px] text-gray-400 font-mono">RFC: {profile?.rfc || "En verificación"}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
              <HeartHandshake className="w-4 h-4" />
              <span>Primer Programa Asistencial</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{program?.name || "Programa Activo"}</p>
            <p className="text-[11px] text-gray-400">Meta: {program?.targetBeneficiariesCount || 50} beneficiarios</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
              <Users className="w-4 h-4" />
              <span>Equipo Registrado</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{teamMembers.length} Colaboradores invitados</p>
            <p className="text-[11px] text-gray-400">Trabajadores sociales y coordinadores</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Estatus de Verificación</span>
            </div>
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
              En Revisión de Compliance
            </span>
            <p className="text-[11px] text-gray-400 pt-0.5">Puedes operar tus programas de inmediato</p>
          </div>
        </div>
      </div>

      {/* ── BOTÓN DE ENTRADA AL DASHBOARD ────────────────────────────── */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onFinish}
          disabled={isLoading}
          className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer border-0"
        >
          <span>Ir a mi Panel de Control Institucional</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
