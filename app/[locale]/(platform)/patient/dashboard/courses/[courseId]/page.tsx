"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { CourseCurriculumService } from "@/services/course-curriculum.service";
import { ConsumerCourseService, CatalogItemResponse } from "@/services/consumer-course.service";
import { CourseModule, CourseLesson } from "@/types/catalog";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  PlayCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { EnterpriseVideoPlayer } from "@/components/ui/EnterpriseVideoPlayer";
import { cn } from "@/lib/utils";

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.courseId);

  const [courseDetails, setCourseDetails] = useState<CatalogItemResponse | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!courseId) return;

    const loadCourseData = async () => {
      try {
        setLoading(true);
        // 1. Fetch details
        const detailsList = await ConsumerCourseService.getCourseDetailsBatch([courseId]);
        if (detailsList.length > 0) setCourseDetails(detailsList[0]);

        // 2. Fetch Curriculum
        const curriculum = await CourseCurriculumService.getCurriculum(courseId);
        const fetchedModules = curriculum.modules || [];
        setModules(fetchedModules);

        // Auto-expand first module and select first lesson
        if (fetchedModules.length > 0) {
          setExpandedModules({ [fetchedModules[0].id!]: true });
          if (fetchedModules[0].lessons.length > 0) {
            setActiveLesson(fetchedModules[0].lessons[0]);
          }
        }
      } catch (error) {
        console.error("Error loading course:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const allLessons = useMemo(() => modules.flatMap(m => m.lessons), [modules]);
  const currentIndex = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : -1;

  const goToNextLesson = () => {
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setActiveLesson(nextLesson);
      setExpandedModules(prev => ({ ...prev, [nextLesson.moduleId!]: true }));
    }
  };

  const goToPrevLesson = () => {
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      setActiveLesson(prevLesson);
      setExpandedModules(prev => ({ ...prev, [prevLesson.moduleId!]: true }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <QhSpinner size="lg" />
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <h2 className="text-lg font-bold uppercase tracking-widest">Curso no encontrado</h2>
          <Button onClick={() => router.back()} variant="outline" className="rounded-none">Volver</Button>
        </div>
      </div>
    );
  }

  // Si no hay currículo construido, mostramos fallback legacy (solo el link)
  if (modules.length === 0) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#050505] p-6 md:p-12">
        <Button onClick={() => router.push('/patient/dashboard/courses')} variant="ghost" className="w-fit mb-8 rounded-none">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Mis Cursos
        </Button>
        <div className="max-w-2xl mx-auto w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 text-center space-y-6">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto" />
          <h1 className="text-2xl font-bold uppercase tracking-widest">{courseDetails.name}</h1>
          <p className="text-sm text-gray-500">Este curso se imparte de manera externa o mediante un enlace unificado.</p>
          {courseDetails.contentUrl ? (
            <Button 
              className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 w-full h-12 uppercase font-bold tracking-widest"
              onClick={() => window.open(courseDetails.contentUrl, '_blank')}
            >
              Ir al Material del Curso
            </Button>
          ) : (
            <div className="bg-amber-50 text-amber-800 p-4 border border-amber-200">
              El contenido aún no ha sido enlazado por el proveedor.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-white dark:bg-[#0a0a0a] overflow-hidden">
      {/* AREA DE VIDEO (Izquierda) */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#050505] border-r border-gray-200 dark:border-gray-800 relative h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-between z-10 shrink-0">
          <Button onClick={() => router.push('/patient/dashboard/courses')} variant="ghost" className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3 mr-2" /> Mis Cursos
          </Button>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate max-w-[200px] md:max-w-md">
            {courseDetails.name}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <div className="w-full flex flex-col">
              <div className="w-full bg-black aspect-video relative flex items-center justify-center">
                {activeLesson.videoUrl && isMounted ? (
                  <div className="absolute inset-0 w-full h-full">
                    <EnterpriseVideoPlayer
                      url={activeLesson.videoUrl}
                      poster={courseDetails.imageUrl}
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <PlayCircle className="w-12 h-12 text-gray-700 mx-auto" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Video no disponible</p>
                  </div>
                )}
              </div>
              <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
                <h1 className="text-2xl font-bold uppercase tracking-tight">{activeLesson.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {activeLesson.description || "Sin descripción proporcionada para esta lección."}
                </p>
                
                <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-800 mt-8">
                  <Button 
                    onClick={goToPrevLesson} 
                    disabled={currentIndex <= 0}
                    variant="outline" 
                    className="rounded-none font-bold uppercase tracking-widest text-[10px]"
                  >
                    Anterior
                  </Button>
                  <Button 
                    onClick={goToNextLesson} 
                    disabled={currentIndex === allLessons.length - 1}
                    className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-bold uppercase tracking-widest text-[10px]"
                  >
                    Siguiente Lección
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm">
              Selecciona una lección del temario para comenzar.
            </div>
          )}
        </div>
      </div>

      {/* SIDEBAR TEMARIO (Derecha) */}
      <div className="w-full md:w-80 lg:w-[400px] flex flex-col h-full bg-white dark:bg-[#0a0a0a] shrink-0 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Temario del Curso
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">
            {modules.length} Módulos • {allLessons.length} Lecciones
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {modules.map((mod, index) => (
            <div key={mod.id} className="border-b border-gray-100 dark:border-gray-900 last:border-0">
              <button 
                onClick={() => toggleModule(mod.id!)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-left"
              >
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Módulo {index + 1}</span>
                  <span className="text-xs font-bold">{mod.title}</span>
                </div>
                {expandedModules[mod.id!] ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedModules[mod.id!] && (
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: "auto" }} 
                    exit={{ height: 0 }}
                    className="overflow-hidden bg-gray-50 dark:bg-[#050505]"
                  >
                    {mod.lessons.map((lesson, lIndex) => {
                      const isActive = activeLesson?.id === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={cn(
                            "w-full flex items-start p-4 border-l-2 transition-all text-left",
                            isActive 
                              ? "border-black dark:border-white bg-white dark:bg-[#0a0a0a]" 
                              : "border-transparent hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#111]"
                          )}
                        >
                          <div className="mr-3 mt-0.5">
                            {isActive ? (
                              <PlayCircle className="w-4 h-4 text-black dark:text-white" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-gray-300 dark:text-gray-700" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className={cn(
                              "text-xs font-semibold leading-tight",
                              isActive ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-400"
                            )}>
                              {index + 1}.{lIndex + 1} {lesson.title}
                            </span>
                            {lesson.durationMinutes && (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                {lesson.durationMinutes} min
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
