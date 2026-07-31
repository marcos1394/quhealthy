"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  PlayCircle,
  BookOpen,
  Clock,
} from "lucide-react";

import { CourseCurriculumService } from "@/services/course-curriculum.service";
import { CourseModule } from "@/types/catalog";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  catalogItemId: number;
}

export function CourseCurriculumView({ catalogItemId }: Props) {
  const t = useTranslations("CourseCurriculum");
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        setLoading(true);
        const data = await CourseCurriculumService.getCurriculum(catalogItemId);
        setModules(data.modules || []);
        if (data.modules && data.modules.length > 0) {
          setExpandedModules({ [data.modules[0].id]: true });
        }
      } catch (error) {
        console.error("Error al cargar plan de estudios:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCurriculum();
  }, [catalogItemId]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xs flex items-center justify-center min-h-[160px] gap-3 font-sans select-none">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-semibold text-gray-400">
          {t("loading")}
        </span>
      </div>
    );
  }

  if (modules.length === 0) {
    return null;
  }

  const totalLessons = modules.reduce(
    (acc, mod) => acc + (mod.lessons?.length || 0),
    0
  );

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-6">
      {/* ── ENCABEZADO ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <BookOpen className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("title")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("summary", {
                modules: modules.length,
                lessons: totalLessons,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ── MÓDULOS DEL PLAN DE ESTUDIOS ────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
        {modules.map((mod, index) => (
          <div key={mod.id} className="transition-colors">
            <button
              type="button"
              onClick={() => toggleModule(mod.id!)}
              className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50/60 dark:hover:bg-[#050505] transition-colors text-left cursor-pointer"
            >
              <div className="flex flex-col gap-0.5 pr-4">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {t("module_label", { index: index + 1 })}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  {mod.title}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-400 shrink-0">
                <span className="text-xs font-medium text-gray-400 hidden sm:inline-block">
                  {t("lessons_count", { count: mod.lessons?.length || 0 })}
                </span>

                {expandedModules[mod.id!] ? (
                  <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
                )}
              </div>
            </button>

            {/* Lecciones desplegables */}
            <AnimatePresence>
              {expandedModules[mod.id!] && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden bg-gray-50/40 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800"
                >
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {mod.lessons.map((lesson, lIndex) => (
                      <div
                        key={lesson.id}
                        className={cn(
                          "w-full flex items-center justify-between p-3.5 px-5 sm:px-6 text-left transition-colors",
                          lesson.isFreePreview
                            ? "cursor-pointer hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20"
                            : "hover:bg-gray-100/40 dark:hover:bg-gray-800/30"
                        )}
                        onClick={() => {
                          if (lesson.isFreePreview) {
                            alert(t("preview_alert"));
                          }
                        }}
                      >
                        <div className="flex items-start gap-3 min-w-0 pr-3">
                          <PlayCircle
                            className={cn(
                              "w-4 h-4 shrink-0 mt-0.5",
                              lesson.isFreePreview
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-gray-300 dark:text-gray-700"
                            )}
                            strokeWidth={2}
                          />

                          <div className="space-y-0.5 min-w-0">
                            <span
                              className={cn(
                                "text-xs block truncate",
                                lesson.isFreePreview
                                  ? "font-bold text-gray-900 dark:text-white"
                                  : "font-medium text-gray-600 dark:text-gray-400"
                              )}
                            >
                              {index + 1}.{lIndex + 1} {lesson.title}
                            </span>

                            {lesson.description && (
                              <p className="text-[11px] font-medium text-gray-400 line-clamp-1 leading-relaxed">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {lesson.isFreePreview && (
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                              {t("preview_badge")}
                            </Badge>
                          )}

                          {lesson.durationMinutes && (
                            <span className="text-xs font-mono font-medium text-gray-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                              <span>
                                {t("duration", { minutes: lesson.durationMinutes })}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}