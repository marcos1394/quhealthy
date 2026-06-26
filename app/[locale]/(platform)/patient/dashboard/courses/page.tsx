"use client";

import React, { useEffect } from "react";
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
  AlertCircle
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

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const coursesWithContent = courses.filter(course => Boolean(course.details.contentUrl)).length;
  const latestCourse = courses[0];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
      <div className="mx-auto w-full max-w-7xl space-y-12 p-6 md:p-12 pb-24">
        
        {/* --- HEADER --- */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-8">
            <div className="flex items-start gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
                <GraduationCap className="h-6 w-6 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                  <Sparkles className="h-3 w-3" strokeWidth={2} />
                  Biblioteca Digital
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white uppercase mb-2">
                  Mis Cursos Adquiridos
                </h1>
                <p className="text-xs font-light leading-relaxed text-gray-500">
                  Accede a tus contenidos, retoma el aprendizaje y consulta tus recursos digitales cuando los necesites.
                </p>
              </div>
            </div>

            <Button
              onClick={() => fetchCourses()}
              disabled={isLoading}
              variant="outline"
              className="rounded-none border border-black dark:border-white h-12 px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 mr-2", isLoading && "animate-spin")} strokeWidth={2} />
              Sincronizar
            </Button>
          </div>

          {/* --- ESTADÍSTICAS (BLUEPRINT GRID) --- */}
          {!isLoading && courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
              <div className="group relative z-0 hover:z-10 border-b border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between transition-all duration-300 hover:bg-black dark:hover:bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] cursor-pointer">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400">Volumen Total</p>
                  <Library className="h-4 w-4 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                </div>
                <p className="text-3xl font-semibold text-black dark:text-white group-hover:text-white dark:group-hover:text-black tracking-tight">{courses.length}</p>
              </div>
              <div className="group relative z-0 hover:z-10 border-b border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between transition-all duration-300 hover:bg-black dark:hover:bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] cursor-pointer">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400">Disponibles Ahora</p>
                  <Video className="h-4 w-4 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                </div>
                <p className="text-3xl font-semibold text-black dark:text-white group-hover:text-white dark:group-hover:text-black tracking-tight">{coursesWithContent}</p>
              </div>
              <div className="group relative z-0 hover:z-10 border-b border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between transition-all duration-300 hover:bg-black dark:hover:bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] cursor-pointer">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400">Última Transacción</p>
                  <CalendarCheck className="h-4 w-4 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black truncate">
                  {latestCourse ? format(new Date(latestCourse.access.purchasedAt), "dd MMM yyyy", { locale: es }) : "N/A"}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* --- CONTENIDO --- */}
        {isLoading ? (
          /* SKELETONS ARQUITECTÓNICOS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                <div className="aspect-video animate-pulse bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800" />
                <div className="p-6 space-y-6">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 animate-pulse bg-gray-200 dark:bg-gray-800" />
                    <div className="h-4 w-16 animate-pulse bg-gray-200 dark:bg-gray-800" />
                  </div>
                  <div className="h-6 w-full animate-pulse bg-gray-200 dark:bg-gray-800" />
                  <div className="space-y-2">
                    <div className="h-2 w-full animate-pulse bg-gray-100 dark:bg-gray-900" />
                    <div className="h-2 w-4/5 animate-pulse bg-gray-100 dark:bg-gray-900" />
                  </div>
                  <div className="h-12 w-full animate-pulse bg-gray-200 dark:bg-gray-800 mt-8" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          /* EMPTY STATE */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] p-12 text-center flex flex-col items-center justify-center py-24"
          >
            <div className="flex h-16 w-16 items-center justify-center border border-gray-300 dark:border-gray-700 bg-white dark:bg-black mb-6">
              <BookOpen className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
              Acervo Vacío
            </h3>
            <p className="mx-auto mb-8 max-w-md text-xs font-light leading-relaxed text-gray-500">
              Explora el catálogo de nuestros especialistas para encontrar contenido en video, guías y programas diseñados para ti.
            </p>
            <Button
              className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest border-0 transition-colors"
              onClick={() => window.location.href = '/discover'}
            >
              Explorar Catálogo
              <ArrowRight className="ml-3 h-4 w-4" strokeWidth={2} />
            </Button>
          </motion.div>
        ) : (
          /* GRID DE CURSOS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {courses.map((course, index) => (
                <motion.div
                  key={`${course.access.orderId}-${course.details.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative z-0 hover:z-10 flex flex-col border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-all duration-300 hover:bg-black dark:hover:bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] cursor-pointer"
                >
                  {/* IMAGEN DEL CURSO */}
                  <div className="aspect-video relative overflow-hidden bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    {course.details.imageUrl ? (
                      <Image 
                        src={course.details.imageUrl} 
                        alt={course.details.name}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center border border-gray-300 dark:border-gray-700 bg-white dark:bg-black group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-300">
                          <PlayCircle className="h-5 w-5 text-gray-400 group-hover:text-white dark:group-hover:text-black transition-colors duration-300" strokeWidth={1.5} />
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay superior */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white text-black border border-black dark:bg-black dark:text-white dark:border-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm group-hover:bg-black group-hover:text-white group-hover:border-white dark:group-hover:bg-white dark:group-hover:text-black dark:group-hover:border-black transition-colors duration-300">
                        <BookOpen className="h-3 w-3" strokeWidth={2} />
                        Digital
                      </span>
                    </div>

                    {/* Overlay inferior */}
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-black/80 text-white backdrop-blur-sm border border-white/20 px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 group-hover:bg-white/90 group-hover:text-black group-hover:border-black/20 dark:group-hover:bg-black/90 dark:group-hover:text-white transition-colors duration-300">
                        <Clock className="h-3 w-3" strokeWidth={2} />
                        Adquirido: {format(new Date(course.access.purchasedAt), "dd MMM yyyy", { locale: es })}
                      </span>
                    </div>
                  </div>

                  {/* CONTENIDO DEL CURSO */}
                  <div className="flex flex-1 flex-col p-6 group-hover:bg-transparent transition-colors duration-300">
                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 transition-colors duration-300 group-hover:border-gray-800 dark:group-hover:border-gray-200">
                      <span className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:bg-black group-hover:text-gray-400 dark:group-hover:bg-white dark:group-hover:text-gray-600 transition-colors duration-300">
                        Orden #{course.access.orderId}
                      </span>
                      <span className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border transition-colors duration-300",
                        course.details.contentUrl 
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900 group-hover:bg-green-900 group-hover:text-green-300 group-hover:border-green-700" 
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900 group-hover:bg-red-900 group-hover:text-red-300 group-hover:border-red-700"
                      )}>
                        {course.details.contentUrl ? (
                          <>
                            <Video className="h-3 w-3" strokeWidth={2} />
                            Disponible
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3" strokeWidth={2} />
                            Próximamente
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="mb-2 text-lg font-bold tracking-tight text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300 line-clamp-2">
                      {course.details.name}
                    </h3>
                    <p className="mb-6 text-xs font-light leading-relaxed text-gray-500 group-hover:text-gray-400 transition-colors duration-300 line-clamp-2 flex-1">
                      {course.details.description}
                    </p>

                    <Button 
                      className={cn(
                        "mt-auto h-12 w-full rounded-none text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between px-6 border border-black dark:border-white group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white",
                        course.details.contentUrl 
                          ? "bg-black text-white dark:bg-white dark:text-black" 
                          : "bg-gray-100 text-gray-400 dark:bg-[#050505] cursor-not-allowed group-hover:bg-gray-200 dark:group-hover:bg-gray-800"
                      )}
                      onClick={() => {
                        if (course.details.contentUrl) {
                          window.open(course.details.contentUrl, '_blank');
                        } else {
                          toast.info("El contenido fuente aún no ha sido enlazado por el proveedor.");
                        }
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4" strokeWidth={2} />
                        Ver Recurso
                      </span>
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
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