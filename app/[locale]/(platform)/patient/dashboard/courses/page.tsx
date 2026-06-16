"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
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
  ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePurchasedCourses } from "@/hooks/usePurchasedCourses";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";

export default function MyCoursesPage() {
  const { courses, isLoading, fetchCourses } = usePurchasedCourses();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const coursesWithContent = courses.filter(course => Boolean(course.details.contentUrl)).length;
  const latestCourse = courses[0];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <GraduationCap className="h-7 w-7 text-slate-800 dark:text-slate-100" />
            </div>
            <div className="max-w-2xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-medical-100 bg-medical-50 px-3 py-1 text-xs font-semibold text-medical-700 dark:border-medical-500/20 dark:bg-medical-500/10 dark:text-medical-300">
                <Sparkles className="h-3.5 w-3.5" />
                Biblioteca digital QuHealthy
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Mis Cursos
              </h1>
              <p className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400">
                Accede a tus contenidos adquiridos, retoma el aprendizaje y consulta tus recursos digitales cuando los necesites.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchCourses()}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-medical-200 hover:bg-medical-50 hover:text-medical-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-medical-500/30 dark:hover:bg-medical-500/10 dark:hover:text-medical-300"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {!isLoading && courses.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Cursos adquiridos</p>
                <Library className="h-5 w-5 text-medical-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{courses.length}</p>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 shadow-sm dark:border-teal-500/20 dark:bg-teal-500/10">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Disponibles ahora</p>
                <Video className="h-5 w-5 text-teal-600 dark:text-teal-300" />
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{coursesWithContent}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Última compra</p>
                <CalendarCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
              <p className="mt-2 truncate text-lg font-bold text-slate-950 dark:text-white">
                {latestCourse ? format(new Date(latestCourse.access.purchasedAt), "d MMM yyyy", { locale: es }) : "Sin datos"}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((skeleton) => (
            <div key={skeleton} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="aspect-video animate-pulse bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-4 p-5">
                <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="h-6 w-4/5 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="h-12 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-12"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-950 dark:text-white">
            No tienes cursos aún
          </h3>
          <p className="mx-auto mb-6 max-w-md text-slate-500 dark:text-slate-400">
            Explora el catálogo de nuestros especialistas para encontrar contenido diseñado para ti.
          </p>
          <Button
            variant="outline"
            className="h-11 rounded-2xl"
            onClick={() => window.location.href = '/patient/discover'}
          >
            Explorar Catálogo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={`${course.access.orderId}-${course.details.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-black/20"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                {course.details.imageUrl ? (
                  <Image 
                    src={course.details.imageUrl} 
                    alt={course.details.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-medical-50 dark:from-slate-900 dark:via-slate-900 dark:to-medical-500/10">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-medical-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                      <PlayCircle className="h-8 w-8" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                <div className="absolute left-4 top-4">
                  <Badge className="border-none bg-white/90 px-3 py-1.5 text-slate-800 shadow-sm backdrop-blur dark:bg-slate-950/80 dark:text-slate-100">
                    <BookOpen className="mr-1.5 h-3.5 w-3.5 text-medical-500" />
                    Curso digital
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:bg-slate-950/80 dark:text-slate-200">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {format(new Date(course.access.purchasedAt), "d MMM yyyy", { locale: es })}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-slate-900 opacity-0 shadow-sm backdrop-blur transition-all group-hover:opacity-100 dark:bg-slate-950/80 dark:text-white">
                    <PlayCircle className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="flex min-h-[250px] flex-col p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Badge className="border-none bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    Orden #{course.access.orderId}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-medical-600 dark:text-medical-400">
                    <Video className="h-3.5 w-3.5" />
                    {course.details.contentUrl ? "Disponible" : "Próximamente"}
                  </span>
                </div>

                <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-slate-950 dark:text-white">
                  {course.details.name}
                </h3>
                
                <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {course.details.description}
                </p>

                <Button 
                  className="mt-auto h-12 w-full rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  onClick={() => {
                    if (course.details.contentUrl) {
                      window.open(course.details.contentUrl, '_blank');
                    } else {
                      toast.info("El contenido de este curso estará disponible pronto.");
                    }
                  }}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Ver Curso
                  <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-60" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
