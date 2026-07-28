"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("PatientCoursePlayer");
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
        // 1. Cargar detalles del curso
        const detailsList = await ConsumerCourseService.getCourseDetailsBatch([
          courseId,
        ]);
        if (detailsList.length > 0) setCourseDetails(detailsList[0]);

        // 2. Cargar Temario y Progreso
        const [curriculum, progressList] = await Promise.all([
          CourseCurriculumService.getCurriculum(courseId),
          CourseProgressService.getCourseProgress(courseId),
        ]);

        const fetchedModules = curriculum.modules || [];
        setModules(fetchedModules);

        // Mapear progreso por ID de lección
        const pMap: Record<number, CourseProgressDto> = {};
        progressList.forEach((p) => {
          pMap[p.lessonId] = p;
        });
        setProgressMap(pMap);

        // Auto-expandir primer módulo y seleccionar primera lección
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

  // Sincronizar apuntes personales cuando cambia la lección activa
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
    [modules]
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
      personalNotes
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
      activeLesson.id!
    );
    if (updated) {
      setProgressMap((prev) => ({ ...prev, [activeLesson.id!]: updated }));
    }
    setSavingCompletion(false);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50/50 dark:bg-[#050505]">
        <QhSpinner size="lg" />
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50/50 dark:bg-[#050505]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" strokeWidth={1.5} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("not_found_title")}
          </h2>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="rounded-xl border-gray-200 dark:border-gray-800 font-semibold shadow-sm"
          >
            {t("back_button")}
          </Button>
        </div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-50/50 dark:bg-[#050505] p-6 md:p-12 font-sans">
        <Button
          onClick={() => router.push("/patient/dashboard/courses")}
          variant="ghost"
          className="w-fit mb-8 rounded-xl font-bold text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} />
          {t("back_to_courses")}
        </Button>

        <div className="max-w-2xl mx-auto w-full rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
            <BookOpen className="w-8 h-8" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {courseDetails.name}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("external_content_desc")}
          </p>
          {courseDetails.contentUrl ? (
            <Button
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 w-full h-12 font-bold text-xs shadow-sm transition-colors"
              onClick={() => window.open(courseDetails.contentUrl, "_blank")}
            >
              {t("access_content")}
            </Button>
          ) : (
            <div className="rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 p-5 border border-amber-200 dark:border-amber-900/30 font-medium text-xs">
              {t("content_not_enabled")}
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
    (p) => p.isCompleted
  ).length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 overflow-hidden">
      
      {/* ── ÁREA DE VIDEO E INFORMACIÓN (Izquierda) ────────────────────── */}
      <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-[#050505] border-r border-gray-100 dark:border-gray-800/80 relative h-full">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800/80 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
          <Button
            onClick={() => router.push("/patient/dashboard/courses")}
            variant="ghost"
            className="h-9 px-3 rounded-lg font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#111]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} />
            {t("my_courses")}
          </Button>
          <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-md">
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
                  <div className="text-center space-y-3">
                    <PlayCircle className="w-12 h-12 text-gray-700 mx-auto" strokeWidth={1.5} />
                    <p className="text-xs font-semibold text-gray-400">
                      {t("video_preparing")}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-10 max-w-5xl mx-auto w-full flex-1 space-y-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {activeLesson.title}
                    </h1>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
                        {t("module_tag", {
                          title:
                            modules.find((m) => m.id === activeLesson.moduleId)
                              ?.title || "",
                        })}
                      </span>
                      {isCurrentLessonCompleted && (
                        <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                          {t("completed")}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleToggleComplete}
                    disabled={savingCompletion}
                    variant={isCurrentLessonCompleted ? "outline" : "default"}
                    className={cn(
                      "rounded-xl font-bold text-xs shrink-0 h-11 px-6 shadow-sm transition-all flex items-center justify-center gap-2",
                      isCurrentLessonCompleted
                        ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50/50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 border-0"
                    )}
                  >
                    {savingCompletion ? (
                      <QhSpinner size="sm" />
                    ) : isCurrentLessonCompleted ? (
                      <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                    ) : null}
                    <span>
                      {isCurrentLessonCompleted
                        ? t("unmark")
                        : t("complete_lesson")}
                    </span>
                  </Button>
                </div>

                {/* Pestañas de Lección */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b border-gray-100 dark:border-gray-800/80 bg-transparent h-auto p-0 mb-8 gap-6">
                    <TabsTrigger
                      value="overview"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 dark:data-[state=active]:border-emerald-400 dark:data-[state=active]:text-emerald-400 data-[state=active]:bg-transparent px-2 py-3 font-bold text-xs text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      {t("tab_overview")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="notes"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 dark:data-[state=active]:border-emerald-400 dark:data-[state=active]:text-emerald-400 data-[state=active]:bg-transparent px-2 py-3 font-bold text-xs text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      {t("tab_notes")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="evaluation"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 dark:data-[state=active]:border-emerald-400 dark:data-[state=active]:text-emerald-400 data-[state=active]:bg-transparent px-2 py-3 font-bold text-xs text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      {t("tab_evaluation")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="outline-none">
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl font-medium">
                      {activeLesson.description || t("no_description")}
                    </p>
                  </TabsContent>

                  <TabsContent value="notes" className="outline-none space-y-4">
                    <div className="max-w-3xl space-y-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {t("notes_hint")}
                      </p>
                      <Textarea
                        value={personalNotes}
                        onChange={(e) => setPersonalNotes(e.target.value)}
                        placeholder={t("notes_placeholder")}
                        className="min-h-[200px] resize-y rounded-2xl border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium bg-white dark:bg-[#0a0a0a] shadow-sm"
                      />
                      <div className="flex justify-end pt-2">
                        <Button
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 font-bold text-xs shadow-sm h-11 px-6 border-0 flex items-center gap-2"
                        >
                          {savingNotes ? (
                            <QhSpinner size="sm" />
                          ) : (
                            <Save className="w-4 h-4" strokeWidth={2} />
                          )}
                          <span>{savingNotes ? t("saving_notes") : t("save_notes")}</span>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="evaluation" className="outline-none space-y-6">
                    <div className="max-w-3xl rounded-3xl border border-gray-100 dark:border-gray-800 p-8 bg-white dark:bg-[#0a0a0a] shadow-sm">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                        {t("evaluation_title")}
                      </h3>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        {t("evaluation_desc")}
                      </p>

                      <div className="space-y-4 mb-8">
                        <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                              {t("step_1_title")}
                            </p>
                            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                              {t("step_1_desc")}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="rounded-xl font-bold text-xs border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 shadow-sm shrink-0"
                          >
                            {t("start_quiz")}
                          </Button>
                        </div>

                        <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                          <p className="text-xs font-bold text-gray-900 dark:text-white mb-3">
                            {t("step_2_title")}
                          </p>
                          <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-8 text-center cursor-pointer hover:bg-gray-100/50 dark:hover:bg-[#111] transition-colors">
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                              {t("upload_drop_hint")}
                            </p>
                            <p className="text-[11px] font-medium text-gray-400 mt-1">
                              {t("upload_formats_hint")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-xs font-bold text-gray-500 flex items-center gap-2">
                          <span>{t("status_label")}</span>
                          <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-3 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 shadow-sm">
                            {t("status_pending")}
                          </span>
                        </div>
                        <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 font-bold text-xs shadow-sm border-0 px-6 h-11">
                          {t("get_certificate")}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Navegación entre lecciones */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-100 dark:border-gray-800 mt-12 mb-8">
                  <Button
                    onClick={goToPrevLesson}
                    disabled={currentIndex <= 0}
                    variant="outline"
                    className="w-full sm:w-auto rounded-xl font-bold text-xs border-gray-200 dark:border-gray-800 h-11 px-6 shadow-sm"
                  >
                    {t("btn_prev")}
                  </Button>
                  <Button
                    onClick={goToNextLesson}
                    disabled={currentIndex === allLessons.length - 1}
                    className="w-full sm:w-auto rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 font-bold text-xs h-11 px-6 shadow-sm border-0"
                  >
                    {t("btn_next")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 text-xs font-medium p-6 text-center">
              {t("select_lesson_hint")}
            </div>
          )}
        </div>
      </div>

      {/* ── SIDEBAR TEMARIO (Derecha) ─────────────────────────────────── */}
      <div className="w-full md:w-80 lg:w-[380px] flex flex-col h-full bg-white dark:bg-[#0a0a0a] shrink-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800/80 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 shrink-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{t("syllabus_title")}</span>
          </h2>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
              <span>{t("course_progress")}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden p-0.5 border border-gray-200/50 dark:border-gray-800">
              <div
                className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {modules.map((mod, index) => {
            const isModuleCompleted =
              mod.lessons.length > 0 &&
              mod.lessons.every((l) => progressMap[l.id!]?.isCompleted);

            return (
              <div
                key={mod.id}
                className="border-b border-gray-100 dark:border-gray-800/60 last:border-0"
              >
                <button
                  onClick={() => toggleModule(mod.id!)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50/80 dark:hover:bg-[#111] transition-colors text-left"
                >
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span>{t("module_prefix", { number: index + 1 })}</span>
                      {isModuleCompleted && (
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                      )}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                      {mod.title}
                    </span>
                  </div>
                  {expandedModules[mod.id!] ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
                  )}
                </button>

                <AnimatePresence>
                  {expandedModules[mod.id!] && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-gray-50/40 dark:bg-[#050505]"
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
                              "w-full flex items-start p-4 border-l-4 transition-all text-left group",
                              isActive
                                ? "border-emerald-500 bg-emerald-50/60 dark:border-emerald-400 dark:bg-emerald-950/20"
                                : "border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-[#0a0a0a]"
                            )}
                          >
                            <div className="mr-3 mt-0.5 shrink-0">
                              {isActive ? (
                                <PlayCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                              ) : isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-gray-400" strokeWidth={2} />
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span
                                className={cn(
                                  "text-xs font-semibold leading-relaxed",
                                  isActive
                                    ? "text-emerald-950 dark:text-emerald-300 font-bold"
                                    : "text-gray-600 dark:text-gray-400"
                                )}
                              >
                                {index + 1}.{lIndex + 1} {lesson.title}
                              </span>
                              {lesson.durationMinutes && (
                                <span className="text-[10px] font-bold text-gray-400">
                                  {t("minutes_short", { min: lesson.durationMinutes })}
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