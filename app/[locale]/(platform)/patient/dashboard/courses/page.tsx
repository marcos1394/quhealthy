"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  PlayCircle,
  Clock,
  GraduationCap,
  RefreshCw,
  Sparkles,
  Library,
  Video,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePurchasedCourses } from "@/hooks/usePurchasedCourses";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function MyCoursesPage() {
  const { courses, isLoading, fetchCourses } = usePurchasedCourses();
  const router = useRouter();
  const t = useTranslations("PatientCourses");
  const locale = useLocale();
  const dateLocale = locale === "en" ? enUS : es;

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const coursesWithContent = courses.filter((course) =>
    Boolean(course.details.contentUrl)
  ).length;
  const latestCourse = courses[0];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      <div className="mx-auto w-full max-w-7xl space-y-10 p-6 md:p-12 pb-24">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-8">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <GraduationCap
                  className="h-7 w-7"
                  strokeWidth={2}
                />
              </div>
              <div className="max-w-2xl">
                <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>{t("badge_digital_library")}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1.5">
                  {t("title")}
                </h1>
                <p className="text-xs sm:text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <Button
              onClick={() => fetchCourses()}
              disabled={isLoading}
              variant="outline"
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-11 px-5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-sm disabled:opacity-50 shrink-0 flex items-center gap-2"
            >
              <RefreshCw
                className={cn("h-4 w-4 text-emerald-600 dark:text-emerald-400", isLoading && "animate-spin")}
                strokeWidth={2}
              />
              <span>{t("btn_refresh")}</span>
            </Button>
          </div>

          {/* ── ESTADÍSTICAS ───────────────────────────────────────────── */}
          {!isLoading && courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("stat_total_courses")}
                  </p>
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-2">
                    <Library
                      className="h-4 w-4 text-blue-600 dark:text-blue-400"
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight font-mono">
                  {courses.length}
                </p>
              </div>
              
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("stat_available_now")}
                  </p>
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-2">
                    <Video
                      className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight font-mono">
                  {coursesWithContent}
                </p>
              </div>
              
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("stat_last_purchase")}
                  </p>
                  <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 p-2">
                    <CalendarCheck
                      className="h-4 w-4 text-purple-600 dark:text-purple-400"
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate capitalize">
                  {latestCourse
                    ? format(
                        new Date(latestCourse.access.purchasedAt),
                        "dd MMM yyyy",
                        { locale: dateLocale }
                      )
                    : t("not_available")}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── CONTENIDO ───────────────────────────────────────────────── */}
        {isLoading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((skeleton) => (
              <div
                key={skeleton}
                className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden"
              >
                <div className="aspect-video animate-pulse bg-gray-100 dark:bg-gray-900" />
                <div className="p-6 space-y-5">
                  <div className="flex justify-between">
                    <div className="h-5 w-20 rounded-full animate-pulse bg-gray-200 dark:bg-gray-800" />
                    <div className="h-5 w-24 rounded-full animate-pulse bg-gray-200 dark:bg-gray-800" />
                  </div>
                  <div className="h-6 w-3/4 rounded-lg animate-pulse bg-gray-200 dark:bg-gray-800" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded-md animate-pulse bg-gray-100 dark:bg-gray-900" />
                    <div className="h-3 w-4/5 rounded-md animate-pulse bg-gray-100 dark:bg-gray-900" />
                  </div>
                  <div className="h-11 w-full rounded-xl animate-pulse bg-gray-200 dark:bg-gray-800 mt-6" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          /* Estado Vacío */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-12 text-center flex flex-col items-center justify-center py-20 shadow-sm"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm mb-6">
              <BookOpen className="h-8 w-8" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("empty_title")}
            </h3>
            <p className="mx-auto mb-8 max-w-md text-xs sm:text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
              {t("empty_desc")}
            </p>
            <Button
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-12 px-8 text-xs font-bold shadow-sm transition-all border-0 flex items-center gap-2"
              onClick={() => router.push("/discover")}
            >
              <span>{t("btn_explore")}</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Button>
          </motion.div>
        ) : (
          /* Grid de Cursos Adquiridos */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence>
              {courses.map((course, index) => (
                <motion.div
                  key={`${course.access.orderId}-${course.details.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex flex-col rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Portada / Imagen */}
                  <div className="aspect-video relative overflow-hidden bg-gray-50 dark:bg-gray-900">
                    {course.details.imageUrl ? (
                      <Image
                        src={course.details.imageUrl}
                        alt={course.details.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-sm transition-transform duration-300 group-hover:scale-110">
                          <PlayCircle
                            className="h-7 w-7 text-emerald-600 dark:text-emerald-400"
                            strokeWidth={2}
                          />
                        </div>
                      </div>
                    )}

                    {/* Overlay superior */}
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-white/90 dark:bg-black/90 px-3 py-1 text-[11px] font-bold text-gray-800 dark:text-gray-200 shadow-sm flex items-center gap-1.5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800">
                        <BookOpen className="h-3.5 w-3.5 text-blue-500" strokeWidth={2} />
                        <span>{t("badge_digital")}</span>
                      </span>
                    </div>

                    {/* Overlay inferior */}
                    <div className="absolute bottom-4 left-4">
                      <span className="rounded-full bg-black/75 text-white px-3 py-1 text-[11px] font-semibold shadow-sm flex items-center gap-1.5 backdrop-blur-md">
                        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                        <span>
                          {t("purchased_at", {
                            date: format(
                              new Date(course.access.purchasedAt),
                              "dd MMM yyyy",
                              { locale: dateLocale }
                            ),
                          })}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Contenido de la Tarjeta */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 dark:bg-gray-800/60 px-3 py-1 text-[11px] font-bold text-gray-600 dark:text-gray-300 font-mono">
                        {t("folio_number", { id: course.access.orderId })}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                        <Video className="h-3.5 w-3.5" strokeWidth={2} />
                        <span>{t("badge_active_access")}</span>
                      </span>
                    </div>

                    <h3 className="mb-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white line-clamp-2">
                      {course.details.name}
                    </h3>
                    <p className="mb-6 text-xs font-medium leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">
                      {course.details.description}
                    </p>

                    <Button
                      className="mt-auto h-12 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 border-0"
                      onClick={() => {
                        router.push(
                          `/patient/dashboard/courses/${course.details.id}`
                        );
                      }}
                    >
                      <PlayCircle className="h-4 w-4" strokeWidth={2} />
                      <span>{t("btn_access_course")}</span>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}