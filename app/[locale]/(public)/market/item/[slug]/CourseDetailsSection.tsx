"use client";

import React from "react";
import {
  BookOpen,
  Award,
  Clock,
  Globe,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  BarChart,
  Video,
  FileText,
  UserCheck,
} from "lucide-react";
import { CatalogItemDTO } from "@/types/catalog";
import { CourseCurriculumView } from "@/components/store/CourseCurriculumView";

interface CourseDetailsSectionProps {
  item: CatalogItemDTO;
  providerName?: string;
}

export function CourseDetailsSection({ item, providerName }: CourseDetailsSectionProps) {
  const passingScore = item.minimumPassingScore || 80;
  const hasCert = item.hasCertificate !== false;

  return (
    <div className="space-y-8 font-sans select-none">
      {/* ── 1. LO QUE INCLUYE ESTE CURSO / HIGHLIGHTS ─────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
              Beneficios y Características del Curso
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Todo lo que recibirás al inscribirte hoy
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#141414] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-gray-900 dark:text-white block">
                Acceso 100% en Línea
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                Estudia a tu propio ritmo, disponible 24/7 de por vida.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#141414] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-gray-900 dark:text-white block">
                {hasCert ? "Certificado Digital" : "Constancia de Participación"}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                {hasCert
                  ? "Con folio único y verificación QR de autenticidad."
                  : "Acreditación al completar todas las lecciones."}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#141414] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <BarChart className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-gray-900 dark:text-white block">
                Evaluaciones Prácticas
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                Calificación mínima para acreditar: {passingScore}%.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#141414] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-gray-900 dark:text-white block">
                Video en Alta Definición
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                Clases explicadas paso a paso por especialistas de la salud.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#141414] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-gray-900 dark:text-white block">
                Recursos Descargables
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                Guías clínicas, recetarios y materiales complementarios en PDF.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#141414] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-gray-900 dark:text-white block">
                Instructor Verificado
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                Respaldado por {providerName || "especialistas médicos certificados"}.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. PLAN DE ESTUDIOS INTERACTIVO (CURRICULUM) ─────────────── */}
      <CourseCurriculumView catalogItemId={item.id || 0} />
    </div>
  );
}
