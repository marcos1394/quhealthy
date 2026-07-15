"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { CourseCurriculumService } from "@/services/course-curriculum.service";
import {
  ConsumerCourseService,
  CatalogItemResponse,
} from "@/services/consumer-course.service";
import {
  CourseProgressService,
  CourseProgressDto,
} from "@/services/course-progress.service";
import { CourseModule, CourseLesson } from "@/types/catalog";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  AlertCircle,
  Save,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { EnterpriseVideoPlayer } from "@/components/ui/EnterpriseVideoPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.courseId);

  const [courseDetails, setCourseDetails] =
    useState<CatalogItemResponse | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<
    Record<number, boolean>
  >({});
  const [isMounted, setIsMounted] = useState(false);

  // LMS Progress State
  const [progressMap, setProgressMap] = useState<
    Record<number, CourseProgressDto>
  >({});
  const [personalNotes, setPersonalNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingCompletion, setSavingCompletion] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!courseId) return;

    const loadCourseData = async () => {
      try {
        setLoading(true);
        // 1. Fetch details
        const detailsList = await ConsumerCourseService.getCourseDetailsBatch([
          courseId,
        ]);
        if (detailsList.length > 0) setCourseDetails(detailsList[0]);

        // 2. Fetch Curriculum & Progress
        const [curriculum, progressList] = await Promise.all([
          CourseCurriculumService.getCurriculum(courseId),
          CourseProgressService.getCourseProgress(courseId),
        ]);

        const fetchedModules = curriculum.modules || [];
        setModules(fetchedModules);

        // Map progress by lesson ID
        const pMap: Record<number, CourseProgressDto> = {};
        progressList.forEach((p) => {
          pMap[p.lessonId] = p;
        });
        setProgressMap(pMap);

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

  // Sync personal notes when active lesson changes
  useEffect(() => {
    if (activeLesson) {
      setPersonalNotes(progressMap[activeLesson.id!]?.personalNotes || "");
    }
  }, [activeLesson, progressMap]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const allLessons = useMemo(
    () => modules.flatMap((m) => m.lessons),
    [modules],
  );
  const currentIndex = activeLesson
    ? allLessons.findIndex((l) => l.id === activeLesson.id)
    : -1;

  const goToNextLesson = () => {
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setActiveLesson(nextLesson);
      setExpandedModules((prev) => ({ ...prev, [nextLesson.moduleId!]: true }));
    }
  };

  const goToPrevLesson = () => {
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      setActiveLesson(prevLesson);
      setExpandedModules((prev) => ({ ...prev, [prevLesson.moduleId!]: true }));
    }
  };

  const handleSaveNotes = async () => {
    if (!activeLesson) return;
    setSavingNotes(true);
    const updated = await CourseProgressService.saveNotes(
      courseId,
      activeLesson.id!,
      personalNotes,
    );
    if (updated) {
      setProgressMap((prev) => ({ ...prev, [activeLesson.id!]: updated }));
    }
    setSavingNotes(false);
  };

  const handleToggleComplete = async () => {
    if (!activeLesson) return;
    setSavingCompletion(true);
    const updated = await CourseProgressService.toggleCompletion(
      courseId,
      activeLesson.id!,
    );
    if (updated) {
      setProgressMap((prev) => ({ ...prev, [activeLesson.id!]: updated }));
    }
    setSavingCompletion(false);
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
          <h2 className="text-lg font-bold uppercase tracking-widest">
            Curso no encontrado
          </h2>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="rounded-none"
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#050505] p-6 md:p-12">
        <Button
          onClick={() => router.push("/patient/dashboard/courses")}
          variant="ghost"
          className="w-fit mb-8 rounded-none"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Mis Cursos
        </Button>
        <div className="max-w-2xl mx-auto w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 text-center space-y-6">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto" />
          <h1 className="text-2xl font-bold uppercase tracking-widest">
            {courseDetails.name}
          </h1>
          <p className="text-sm text-gray-500">
            Este material se encuentra alojado en una plataforma externa.
          </p>
          {courseDetails.contentUrl ? (
            <Button
              className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 w-full h-12 uppercase font-bold tracking-widest"
              onClick={() => window.open(courseDetails.contentUrl, "_blank")}
            >
              Acceder al Contenido
            </Button>
          ) : (
            <div className="bg-amber-50 text-amber-800 p-4 border border-amber-200">
              El especialista aún no ha habilitado el acceso a este material.
            </div>
          )}
        </div>
      </div>
    );
  }

  const isCurrentLessonCompleted =
    progressMap[activeLesson?.id || 0]?.isCompleted;

  // Calcular progreso general
  const totalLessons = allLessons.length;
  const completedCount = Object.values(progressMap).filter(
    (p) => p.isCompleted,
  ).length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-white dark:bg-[#0a0a0a] overflow-hidden">
      {/* AREA DE VIDEO E INFORMACION (Izquierda) */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#050505] border-r border-gray-200 dark:border-gray-800 relative h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-between z-10 shrink-0">
          <Button
            onClick={() => router.push("/patient/dashboard/courses")}
            variant="ghost"
            className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-3 h-3 mr-2" /> Mis Cursos
          </Button>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate max-w-[200px] md:max-w-md">
            {courseDetails.name}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <div className="w-full flex flex-col">
              <div className="w-full bg-black aspect-video relative flex items-center justify-center shrink-0">
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Video en preparación
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-10 max-w-5xl mx-auto w-full flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold uppercase tracking-tight">
                      {activeLesson.title}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Módulo{" "}
                        {
                          modules.find((m) => m.id === activeLesson.moduleId)
                            ?.title
                        }
                      </span>
                      {isCurrentLessonCompleted && (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-widest">
                          <Check className="w-3 h-3" /> Completada
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleToggleComplete}
                    disabled={savingCompletion}
                    variant={isCurrentLessonCompleted ? "outline" : "default"}
                    className={cn(
                      "rounded-none font-bold uppercase tracking-widest text-xs shrink-0",
                      isCurrentLessonCompleted
                        ? "border-green-600 text-green-700 hover:bg-green-50"
                        : "bg-black text-white hover:bg-gray-800",
                    )}
                  >
                    {savingCompletion ? (
                      <QhSpinner size="sm" className="mr-2" />
                    ) : isCurrentLessonCompleted ? (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    ) : null}
                    {isCurrentLessonCompleted
                      ? "Desmarcar"
                      : "Completar Lección"}
                  </Button>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b border-gray-200 dark:border-gray-800 bg-transparent h-auto p-0 mb-6">
                    <TabsTrigger
                      value="overview"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent px-4 py-3 font-bold uppercase tracking-widest text-[11px]"
                    >
                      Descripción
                    </TabsTrigger>
                    <TabsTrigger
                      value="notes"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent px-4 py-3 font-bold uppercase tracking-widest text-[11px]"
                    >
                      Mis Apuntes
                    </TabsTrigger>
                    <TabsTrigger
                      value="evaluation"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent px-4 py-3 font-bold uppercase tracking-widest text-[11px] text-amber-600 dark:text-amber-500"
                    >
                      Evaluación & Certificado
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="outline-none">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                      {activeLesson.description ||
                        "Sin descripción proporcionada para esta lección."}
                    </p>
                  </TabsContent>

                  <TabsContent value="notes" className="outline-none space-y-4">
                    <div className="max-w-3xl">
                      <p className="text-xs text-gray-500 mb-4">
                        Escribe apuntes privados sobre esta lección. Solo tú
                        podrás verlos.
                      </p>
                      <Textarea
                        value={personalNotes}
                        onChange={(e) => setPersonalNotes(e.target.value)}
                        placeholder="Escribe tus notas aquí..."
                        className="min-h-[200px] resize-y rounded-none border-gray-300 focus-visible:ring-black dark:focus-visible:ring-white"
                      />
                      <div className="flex justify-end mt-4">
                        <Button
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="rounded-none bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-widest text-[10px]"
                        >
                          {savingNotes ? (
                            <QhSpinner size="sm" className="mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Guardar Notas
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="evaluation"
                    className="outline-none space-y-6"
                  >
                    <div className="max-w-3xl border border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-[#050505]">
                      <h3 className="text-lg font-bold uppercase tracking-widest mb-2">
                        Evaluación del Módulo
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Para obtener tu constancia, debes aprobar la evaluación
                        y subir la evidencia de aprendizaje requerida.
                      </p>

                      <div className="space-y-4 mb-6">
                        <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            Paso 1: Cuestionario
                          </p>
                          <Button
                            variant="outline"
                            className="w-full rounded-none font-bold text-xs uppercase tracking-widest"
                          >
                            Iniciar Cuestionario
                          </Button>
                        </div>

                        <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            Paso 2: Subir Proyecto
                          </p>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                            <p className="text-sm text-gray-500">
                              Arrastra tus archivos aquí o haz clic para subir
                            </p>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">
                              Formatos permitidos: PDF, JPG, PNG (Max 5MB)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="text-xs text-gray-500">
                          Estado:{" "}
                          <span className="font-bold text-amber-600">
                            Pendiente
                          </span>
                        </div>
                        <Button className="rounded-none bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-widest text-[10px]">
                          Obtener Certificado
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-800 mt-12 mb-8">
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
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              <span>Progreso del Curso</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-black dark:bg-white h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {modules.map((mod, index) => {
            // Check if all lessons in module are completed
            const isModuleCompleted =
              mod.lessons.length > 0 &&
              mod.lessons.every((l) => progressMap[l.id!]?.isCompleted);

            return (
              <div
                key={mod.id}
                className="border-b border-gray-100 dark:border-gray-900 last:border-0"
              >
                <button
                  onClick={() => toggleModule(mod.id!)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-left"
                >
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      Módulo {index + 1}
                      {isModuleCompleted && (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      )}
                    </span>
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
                        const isCompleted =
                          progressMap[lesson.id!]?.isCompleted;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={cn(
                              "w-full flex items-start p-4 border-l-2 transition-all text-left group",
                              isActive
                                ? "border-black dark:border-white bg-white dark:bg-[#0a0a0a]"
                                : "border-transparent hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#111]",
                            )}
                          >
                            <div className="mr-3 mt-0.5">
                              {isActive ? (
                                <PlayCircle className="w-4 h-4 text-black dark:text-white" />
                              ) : isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-gray-400" />
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span
                                className={cn(
                                  "text-xs font-semibold leading-tight",
                                  isActive
                                    ? "text-black dark:text-white"
                                    : "text-gray-600 dark:text-gray-400",
                                )}
                              >
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
