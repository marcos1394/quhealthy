"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  PlayCircle,
  Clock,
  ExternalLink,
  GraduationCap,
  RefreshCw,
  Sparkles,
  Library,
  Video,
  CalendarCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { usePurchasedCourses } from "@/hooks/usePurchasedCourses";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function MyCoursesPage() {
  const { courses, isLoading, fetchCourses } = usePurchasedCourses();
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const coursesWithContent = courses.filter((course) =>
    Boolean(course.details.contentUrl),
  ).length;
  const latestCourse = courses[0];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
      <div className="mx-auto w-full max-w-7xl space-y-12 p-6 md:p-12 pb-24">
        {/* --- HEADER --- */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-8">
            <div className="flex items-start gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-quhealthy-green dark:text-teal-400">
                <GraduationCap
                  className="h-7 w-7"
                  strokeWidth={2}
                />
              </div>
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-3 py-1 text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  Biblioteca Digital
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                  Mis Cursos
                </h1>
                <p className="text-sm font-medium leading-relaxed text-gray-500">
                  Accede a tus contenidos, retoma el aprendizaje y consulta tus
                  recursos digitales cuando los necesites.
                </p>
              </div>
            </div>

            <Button
              onClick={() => fetchCourses()}
              disabled={isLoading}
              variant="outline"
              className="rounded-xl border border-gray-200 dark:border-gray-800 h-11 px-6 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shadow-sm disabled:opacity-50 shrink-0"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2 text-gray-500", isLoading && "animate-spin")}
                strokeWidth={2}
              />
              Actualizar
            </Button>
          </div>

          {/* --- ESTADÍSTICAS (SOFT HEALTH) --- */}
          {!isLoading && courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-sm font-semibold text-gray-500">
                    Cursos Totales
                  </p>
                  <div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-2">
                    <Library
                      className="h-4 w-4 text-blue-600 dark:text-blue-400"
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {courses.length}
                </p>
              </div>
              
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-sm font-semibold text-gray-500">
                    Disponibles Ahora
                  </p>
                  <div className="rounded-full bg-emerald-50 dark:bg-emerald-900/20 p-2">
                    <Video
                      className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {coursesWithContent}
                </p>
              </div>
              
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-sm font-semibold text-gray-500">
                    Última Compra
                  </p>
                  <div className="rounded-full bg-purple-50 dark:bg-purple-900/20 p-2">
                    <CalendarCheck
                      className="h-4 w-4 text-purple-600 dark:text-purple-400"
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                  {latestCourse
                    ? format(
                        new Date(latestCourse.access.purchasedAt),
                        "dd MMM yyyy",
                        { locale: es },
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* --- CONTENIDO --- */}
        {isLoading ? (
          /* SKELETONS SOFT HEALTH */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((skeleton) => (
              <div
                key={skeleton}
                className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden"
              >
                <div className="aspect-video animate-pulse bg-gray-100 dark:bg-gray-900" />
                <div className="p-6 space-y-6">
                  <div className="flex justify-between">
                    <div className="h-6 w-24 rounded-full animate-pulse bg-gray-200 dark:bg-gray-800" />
                    <div className="h-6 w-20 rounded-full animate-pulse bg-gray-200 dark:bg-gray-800" />
                  </div>
                  <div className="h-6 w-3/4 rounded-md animate-pulse bg-gray-200 dark:bg-gray-800" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded-md animate-pulse bg-gray-100 dark:bg-gray-900" />
                    <div className="h-3 w-4/5 rounded-md animate-pulse bg-gray-100 dark:bg-gray-900" />
                  </div>
                  <div className="h-12 w-full rounded-xl animate-pulse bg-gray-200 dark:bg-gray-800 mt-8" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] p-12 text-center flex flex-col items-center justify-center py-24"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-black shadow-sm mb-6">
              <BookOpen className="h-6 w-6 text-gray-400" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Tu biblioteca está vacía
            </h3>
            <p className="mx-auto mb-8 max-w-md text-sm font-medium leading-relaxed text-gray-500">
              Explora el catálogo de nuestros especialistas para encontrar
              contenido en video, guías y programas diseñados para ti.
            </p>
            <Button
              className="rounded-xl bg-quhealthy-green text-white hover:bg-emerald-700 h-12 px-8 text-sm font-bold shadow-sm transition-all border-0"
              onClick={() => (window.location.href = "/discover")}
            >
              Explorar Catálogo
              <ArrowRight className="ml-3 h-4 w-4" strokeWidth={2} />
            </Button>
          </motion.div>
        ) : (
          /* GRID DE CURSOS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence>
              {courses.map((course, index) => (
                <motion.div
                  key={`${course.access.orderId}-${course.details.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex flex-col rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* IMAGEN DEL CURSO */}
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
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-sm transition-transform duration-300 group-hover:scale-110">
                          <PlayCircle
                            className="h-6 w-6 text-gray-400 dark:text-gray-500"
                            strokeWidth={2}
                          />
                        </div>
                      </div>
                    )}

                    {/* Overlay superior */}
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-white/95 dark:bg-black/95 px-3 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-1.5 backdrop-blur-sm">
                        <BookOpen className="h-3.5 w-3.5 text-blue-500" strokeWidth={2} />
                        Digital
                      </span>
                    </div>

                    {/* Overlay inferior */}
                    <div className="absolute bottom-4 left-4">
                      <span className="rounded-full bg-black/80 text-white px-3 py-1 text-xs font-semibold shadow-sm flex items-center gap-1.5 backdrop-blur-md">
                        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                        Adquirido:{" "}
                        {format(
                          new Date(course.access.purchasedAt),
                          "dd MMM yyyy",
                          { locale: es },
                        )}
                      </span>
                    </div>
                  </div>

                  {/* CONTENIDO DEL CURSO */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Folio #{course.access.orderId}
                      </span>
                      <span
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                          "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
                        )}
                      >
                        <Video className="h-3.5 w-3.5" strokeWidth={2} />
                        Acceso Activo
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-2">
                      {course.details.name}
                    </h3>
                    <p className="mb-8 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">
                      {course.details.description}
                    </p>

                    <Button
                      className={cn(
                        "mt-auto h-12 w-full rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm",
                        "bg-quhealthy-green text-white hover:bg-emerald-700 hover:shadow-md border-0",
                      )}
                      onClick={() => {
                        router.push(
                          `/patient/dashboard/courses/${course.details.id}`,
                        );
                      }}
                    >
                      <PlayCircle className="h-5 w-5" strokeWidth={2} />
                      Acceder al Curso
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
