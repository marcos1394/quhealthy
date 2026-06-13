"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, PlayCircle, Clock, ExternalLink } from "lucide-react";
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-medical-600 dark:text-medical-400" />
            Mis Cursos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Accede al contenido digital que has adquirido
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((skeleton) => (
            <div key={skeleton} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 h-[300px] animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No tienes cursos aún
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            Explora el catálogo de nuestros especialistas para encontrar contenido diseñado para ti.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/patient/discover'}>
            Explorar Catálogo
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
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="aspect-video relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {course.details.imageUrl ? (
                  <Image 
                    src={course.details.imageUrl} 
                    alt={course.details.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-white" />
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-medical-50 text-medical-700 dark:bg-medical-900/30 dark:text-medical-400">
                    Curso Digital
                  </Badge>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Adquirido el {format(new Date(course.access.purchasedAt), "d MMM", { locale: es })}
                  </span>
                </div>

                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">
                  {course.details.name}
                </h3>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-10">
                  {course.details.description}
                </p>

                <Button 
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                  onClick={() => {
                    if (course.details.contentUrl) {
                      window.open(course.details.contentUrl, '_blank');
                    } else {
                      toast.info("El contenido de este curso estará disponible pronto.");
                    }
                  }}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Ver Curso
                  <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
