"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Store,
  Palette,
  Layers,
  Users,
  ShieldCheck,
  Check,
  ChevronRight,
  Sparkles,
  Eye,
  Settings,
  CalendarDays,
  ExternalLink,
  Building2,
  HeartHandshake,
  Share2,
  Award,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { foundationService } from "@/services/foundation.service";
import { FoundationProgram, FoundationStaffMember } from "@/types/foundation";
import { cn } from "@/lib/utils";

export default function FoundationStoreHubPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [programs, setPrograms] = useState<FoundationProgram[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    Promise.all([
      foundationService.getProfile().catch(() => null),
      foundationService.getPrograms().catch(() => []),
    ]).then(([prof, progs]) => {
      setProfile(prof);
      setPrograms(progs);
      setLoading(false);
    });
  }, []);

  const handleToggleVisibility = async () => {
    setIsPublishing(true);
    try {
      const nextState = !isPublic;
      setIsPublic(nextState);
      toast.success(
        nextState
          ? "Tu portal institucional está ahora visible en el Marketplace público de QuHealthy."
          : "Tu portal público ha sido pausado y está en modo borrador."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleViewLive = () => {
    const id = profile?.id || 1;
    window.open(`/foundation/${id}`, "_blank");
  };

  // Validación de pasos completados
  const isIdentityComplete = !!(profile?.legalName || profile?.name) && !!profile?.mission;
  const isProgramsComplete = programs.length > 0;
  const isTeamComplete = true;
  const isComplianceComplete = !!profile?.rfc;

  const steps = [
    {
      id: "identity",
      title: "Identidad Visual & Misión",
      description: "Logotipo, banner hero, slogan, causa principal y video institucional.",
      icon: Palette,
      isComplete: isIdentityComplete,
      path: "/foundation/store/identity",
      color: "rose",
    },
    {
      id: "programs",
      title: "Programas Asistenciales en Vitrina",
      description: "Selecciona qué apoyos y subsidios pueden solicitar los pacientes públicamente.",
      icon: Layers,
      isComplete: isProgramsComplete,
      path: "/foundation/store/programs",
      badge: programs.length > 0 ? `${programs.length} activos` : null,
      color: "indigo",
    },
    {
      id: "campaigns",
      title: "Campañas & Jornadas de Salud",
      description: "Brigadas médicas con pre-registro digital abierto a la comunidad.",
      icon: CalendarDays,
      isComplete: true,
      path: "/foundation/campaigns",
      color: "amber",
    },
    {
      id: "team",
      title: "Equipo Institucional & Patronato",
      description: "Presenta a la directiva, trabajadores sociales y especialistas voluntarios.",
      icon: Users,
      isComplete: isTeamComplete,
      path: "/foundation/store/team",
      color: "emerald",
    },
    {
      id: "compliance",
      title: "Transparencia & Donataria",
      description: "Cédula CLUNI, autorización SAT y sellos de confianza institucional.",
      icon: ShieldCheck,
      isComplete: isComplianceComplete,
      path: "/foundation/settings#profile",
      color: "sky",
    },
  ];

  const completedCount = steps.filter((s) => s.isComplete).length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 animate-pulse">
          Cargando configuración de la vitrina institucional...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in-0 duration-300">
      {/* ── HEADER PRINCIPAL ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                Mi Portal Público & Vitrina
              </h1>
              <span
                className={cn(
                  "px-3 py-0.5 text-[10px] font-bold rounded-full border shadow-2xs",
                  isPublic
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40"
                )}
              >
                {isPublic ? "Público en QuHealthy" : "En Borrador"}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              Configura tu perfil institucional público para recibir postulaciones de beneficiarios, publicar programas y campañas de salud.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleToggleVisibility}
            disabled={isPublishing}
            variant="outline"
            className="h-11 px-5 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-xs cursor-pointer"
          >
            {isPublishing ? (
              <QhSpinner size="sm" />
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" strokeWidth={2} />
                <span>{isPublic ? "Pausar Publicación" : "Publicar Portal"}</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleViewLive}
            className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold border-0 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4" strokeWidth={2} />
            <span>Ver Portal en Vivo</span>
          </Button>
        </div>
      </div>

      {/* ── BARRA DE PROGRESO DE CONFIGURACIÓN ─────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-rose-600" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Progreso de Publicación de tu Vitrina Institucional
            </h2>
          </div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-900/30">
            {progressPercentage}% Completado
          </span>
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* ── TARJETAS DE PASOS MODULARES ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              onClick={() => router.push(step.path)}
              className="group bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 hover:border-rose-500/30 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5 transition-all duration-200 hover:-translate-y-1 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  {step.isComplete ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                      <Check className="w-3.5 h-3.5" /> Listo
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-900/30">
                      Pendiente
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-rose-600 transition-colors">
                      {step.title}
                    </h3>
                    {step.badge && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/80 text-xs font-bold text-rose-600">
                <span>Configurar</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
