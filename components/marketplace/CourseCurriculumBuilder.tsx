"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Plus,
  Trash2,
  Video,
  FileText,
  ChevronDown,
  ChevronRight,
  UploadCloud,
  Layers,
} from "lucide-react";

import { CourseModule, CourseLesson } from "@/types/catalog";
import { CourseCurriculumService } from "@/services/course-curriculum.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface Props {
  catalogItemId: number;
}

export function CourseCurriculumBuilder({ catalogItemId }: Props) {
  const t = useTranslations("CourseCurriculumBuilder");

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<
    Record<number, boolean>
  >({});
  const [uploadingLessons, setUploadingLessons] = useState<
    Record<number, boolean>
  >({});
  const [deleteState, setDeleteState] = useState<{
    type: "module" | "lesson" | null;
    moduleId?: number;
    lessonId?: number;
  }>({ type: null });

  const loadCurriculum = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CourseCurriculumService.getCurriculum(catalogItemId);
      setModules(data.modules || []);
    } catch (error) {
      console.error(error);
      toast.error(t("toast_load_error"));
    } finally {
      setLoading(false);
    }
  }, [catalogItemId, t]);

  useEffect(() => {
    loadCurriculum();
  }, [loadCurriculum]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleAddModule = async () => {
    try {
      const newModule = await CourseCurriculumService.createModule(
        catalogItemId,
        {
          title: t("default_module_title"),
          orderIndex: modules.length,
        }
      );
      setModules([...modules, { ...newModule, lessons: [] }]);
      setExpandedModules((prev) => ({ ...prev, [newModule.id!]: true }));
      toast.success(t("toast_module_added"));
    } catch {
      toast.error(t("toast_module_add_error"));
    }
  };

  const handleDeleteModule = (moduleId: number) => {
    setDeleteState({ type: "module", moduleId });
  };

  const confirmDeleteModule = async (moduleId: number) => {
    try {
      await CourseCurriculumService.deleteModule(catalogItemId, moduleId);
      setModules(modules.filter((m) => m.id !== moduleId));
      toast.success(t("toast_module_deleted"));
    } catch {
      toast.error(t("toast_module_delete_error"));
    }
  };

  const handleUpdateModule = async (moduleId: number, title: string) => {
    try {
      const updated = await CourseCurriculumService.updateModule(
        catalogItemId,
        moduleId,
        { title }
      );
      setModules(
        modules.map((m) =>
          m.id === moduleId ? { ...m, title: updated.title } : m
        )
      );
    } catch {
      toast.error(t("toast_module_update_error"));
    }
  };

  const handleAddLesson = async (moduleId: number) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    try {
      const newLesson = await CourseCurriculumService.createLesson(
        catalogItemId,
        moduleId,
        {
          title: t("default_lesson_title"),
          orderIndex: mod.lessons.length,
        }
      );
      setModules(
        modules.map((m) =>
          m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
        )
      );
      toast.success(t("toast_lesson_added"));
    } catch {
      toast.error(t("toast_lesson_add_error"));
    }
  };

  const handleUpdateLesson = async (
    moduleId: number,
    lessonId: number,
    updates: Partial<CourseLesson>
  ) => {
    try {
      const updated = await CourseCurriculumService.updateLesson(
        catalogItemId,
        moduleId,
        lessonId,
        updates
      );
      setModules(
        modules.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                lessons: m.lessons.map((l) =>
                  l.id === lessonId ? { ...l, ...updated } : l
                ),
              }
            : m
        )
      );
    } catch {
      toast.error(t("toast_lesson_update_error"));
    }
  };

  const handleDeleteLesson = (moduleId: number, lessonId: number) => {
    setDeleteState({ type: "lesson", moduleId, lessonId });
  };

  const confirmDeleteLesson = async (moduleId: number, lessonId: number) => {
    try {
      await CourseCurriculumService.deleteLesson(
        catalogItemId,
        moduleId,
        lessonId
      );
      setModules(
        modules.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                lessons: m.lessons.filter((l) => l.id !== lessonId),
              }
            : m
        )
      );
      toast.success(t("toast_lesson_deleted"));
    } catch {
      toast.error(t("toast_lesson_delete_error"));
    }
  };

  const extractThumbnail = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);

      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(
                new File([blob], "thumbnail.jpg", { type: "image/jpeg" })
              );
            } else {
              reject(new Error("No se pudo generar miniatura"));
            }
            URL.revokeObjectURL(video.src);
          },
          "image/jpeg",
          0.8
        );
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error("Error al cargar video para miniatura"));
      };
    });
  };

  const handleVideoUpload = async (
    moduleId: number,
    lessonId: number,
    file: File
  ) => {
    try {
      setUploadingLessons((prev) => ({ ...prev, [lessonId]: true }));
      const { uploadUrl, publicUrl, requiredContentType } =
        await CourseCurriculumService.generateVideoUploadUrl(
          catalogItemId,
          file
        );

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": requiredContentType },
      });

      await handleUpdateLesson(moduleId, lessonId, { videoUrl: publicUrl });
      toast.success(t("toast_video_success"));

      try {
        const thumbnailFile = await extractThumbnail(file);
        const thumbRes = await CourseCurriculumService.generateVideoUploadUrl(
          catalogItemId,
          thumbnailFile
        );
        await axios.put(thumbRes.uploadUrl, thumbnailFile, {
          headers: { "Content-Type": thumbRes.requiredContentType },
        });
        await handleUpdateLesson(moduleId, lessonId, {
          thumbnailUrl: thumbRes.publicUrl,
        });
      } catch (err) {
        console.warn("No se pudo extraer/subir la miniatura automáticamente", err);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("toast_video_error"));
    } finally {
      setUploadingLessons((prev) => ({ ...prev, [lessonId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs font-sans space-x-3">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {t("loading")}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans transition-colors select-none">
      {/* ── HEADER SUPERIOR ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
            <Layers className="w-5 h-5" strokeWidth={2} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {t("curriculum_title")}
          </h3>
        </div>

        <Button
          type="button"
          onClick={handleAddModule}
          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer border-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>{t("add_module")}</span>
        </Button>
      </div>

      {/* ── LISTADO DE MÓDULOS Y LECCIONES ────────────────────────────── */}
      <div className="space-y-4">
        {modules.map((mod, mIndex) => (
          <div
            key={mod.id}
            className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xs transition-all"
          >
            {/* Header Módulo */}
            <div className="flex items-center p-4 sm:p-5 gap-3 bg-gray-50/60 dark:bg-[#050505]">
              <button
                type="button"
                onClick={() => toggleModule(mod.id!)}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs shrink-0"
              >
                {expandedModules[mod.id!] ? (
                  <ChevronDown className="w-4 h-4" strokeWidth={2} />
                ) : (
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                )}
              </button>

              <div className="flex-1 flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/40 shadow-2xs shrink-0">
                  {t("module_badge", { number: mIndex + 1 })}
                </span>
                <Input
                  value={mod.title}
                  onChange={(e) =>
                    setModules(
                      modules.map((m) =>
                        m.id === mod.id ? { ...m, title: e.target.value } : m
                      )
                    )
                  }
                  onBlur={(e) => handleUpdateModule(mod.id!, e.target.value)}
                  className="h-10 text-xs sm:text-sm font-bold bg-transparent border-transparent hover:border-gray-200 dark:hover:border-gray-800 focus:bg-white dark:focus:bg-[#0a0a0a] focus:border-emerald-500 rounded-xl px-3 text-gray-900 dark:text-white transition-all"
                />
              </div>

              <button
                type="button"
                onClick={() => handleDeleteModule(mod.id!)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Acordeón de Lecciones */}
            <AnimatePresence>
              {expandedModules[mod.id!] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                >
                  <div className="p-4 sm:p-6 space-y-3.5">
                    {mod.lessons.map((lesson, lIndex) => (
                      <div
                        key={lesson.id}
                        className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex flex-col gap-4 shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                          <span className="font-mono text-xs font-bold text-gray-400">
                            {t("lesson_number", {
                              mIndex: mIndex + 1,
                              lIndex: lIndex + 1,
                            })}
                          </span>
                          <Input
                            value={lesson.title}
                            onChange={(e) =>
                              setModules(
                                modules.map((m) =>
                                  m.id === mod.id
                                    ? {
                                        ...m,
                                        lessons: m.lessons.map((l) =>
                                          l.id === lesson.id
                                            ? { ...l, title: e.target.value }
                                            : l
                                        ),
                                      }
                                    : m
                                )
                              )
                            }
                            onBlur={(e) =>
                              handleUpdateLesson(mod.id!, lesson.id!, {
                                title: e.target.value,
                              })
                            }
                            className="h-9 text-xs sm:text-sm font-semibold bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl px-3 flex-1 text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteLesson(mod.id!, lesson.id!)
                            }
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={2} />
                          </button>
                        </div>

                        {/* Player / Carga de Video */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                          {lesson.videoUrl ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <video
                                src={lesson.videoUrl}
                                poster={lesson.thumbnailUrl}
                                controls
                                controlsList="nodownload"
                                className="w-48 h-28 bg-black rounded-2xl object-cover border border-gray-200 dark:border-gray-800 shadow-2xs"
                              />
                              <a
                                href={lesson.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 hover:underline"
                              >
                                <Video className="w-3.5 h-3.5" strokeWidth={2} />
                                <span>{t("watch_video")}</span>
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                              <Video className="w-4 h-4 text-gray-300 dark:text-gray-600" strokeWidth={2} />
                              <span>{t("no_video")}</span>
                            </div>
                          )}

                          {/* Botón de Carga MP4 */}
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-2xs transition-all">
                            {uploadingLessons[lesson.id!] ? (
                              <>
                                <QhSpinner size="sm" className="text-current" />
                                <span>{t("uploading")}</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                                <span>{t("upload_mp4")}</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="video/mp4"
                              className="hidden"
                              disabled={uploadingLessons[lesson.id!]}
                              onChange={(e) =>
                                e.target.files?.[0] &&
                                handleVideoUpload(
                                  mod.id!,
                                  lesson.id!,
                                  e.target.files[0]
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      onClick={() => handleAddLesson(mod.id!)}
                      variant="outline"
                      className="h-10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500/50 bg-transparent rounded-xl w-full justify-center transition-all cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                      <span>{t("add_lesson")}</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Estado Vacío */}
        {modules.length === 0 && (
          <div className="text-center p-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-gray-400 text-xs font-medium bg-gray-50/50 dark:bg-[#050505]">
            {t("empty_modules")}
          </div>
        )}
      </div>

      {/* Modal de Confirmación para Eliminaciones */}
      <ConfirmationModal
        isOpen={deleteState.type !== null}
        onClose={() => setDeleteState({ type: null })}
        onConfirm={() => {
          if (
            deleteState.type === "module" &&
            deleteState.moduleId !== undefined
          ) {
            confirmDeleteModule(deleteState.moduleId);
          } else if (
            deleteState.type === "lesson" &&
            deleteState.moduleId !== undefined &&
            deleteState.lessonId !== undefined
          ) {
            confirmDeleteLesson(deleteState.moduleId, deleteState.lessonId);
          }
          setDeleteState({ type: null });
        }}
        title={
          deleteState.type === "module"
            ? t("confirm_delete_module_title")
            : t("confirm_delete_lesson_title")
        }
        message={
          deleteState.type === "module"
            ? t("confirm_delete_module_msg")
            : t("confirm_delete_lesson_msg")
        }
      />
    </div>
  );
}