"use client";
/* eslint-disable react-doctor/click-events-have-key-events */

import React, { useRef } from "react";
import {
  Plus,
  Trash2,
  Save,
  FileVideo,
  GraduationCap,
  Tag,
  Link2,
  Info,
  Sparkles,
  Award,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UI_Course } from "@/types/catalog";
import { cn } from "@/lib/utils";
import { CourseCurriculumBuilder } from "./CourseCurriculumBuilder";

interface CoursesManagerProps {
  courses: UI_Course[];
  onAdd: () => void;
  onUpdate: (id: number, updates: Partial<UI_Course>) => void;
  onSave: (course: UI_Course) => void;
  onDelete: (id: number) => void;
  onImageUpload: (id: number, file: File) => void;
  canAdd?: boolean;
  currentUsage?: number;
  maxLimit?: number | null;
}

export function CoursesManager({
  courses,
  onAdd,
  onUpdate,
  onSave,
  onDelete,
  onImageUpload,
  canAdd = true,
  currentUsage,
  maxLimit,
}: CoursesManagerProps) {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const t = useTranslations("Marketplace.courses");
  const tGlobal = useTranslations("StoreCatalog.actions");

  const handleAddWrapper = () => {
    // 🛡️ Validación de Negocio
    if (!canAdd) {
      toast.warning(
        t("limit_reached_msg", {
          defaultValue: "Has alcanzado el límite de cursos de tu plan.",
        }),
      );
      return;
    }
    onAdd();
  };

  return (
    <div className="flex flex-col bg-transparent p-6 md:p-8">
      {/* --- CABECERA (HEADER) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm gap-6 shrink-0 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <GraduationCap
              className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
              strokeWidth={2}
            />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              {t("title", { defaultValue: "Cursos / Productos Digitales" })}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                Catálogo de Cursos
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                {courses.length > 0 && (
                  <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                    {courses.length}{" "}
                    {courses.length === 1
                      ? t("course_single", { defaultValue: "Registro Activo" })
                      : t("course_plural", { defaultValue: "Registros Activos" })}
                  </span>
                )}

                {typeof currentUsage === "number" &&
                  typeof maxLimit === "number" && (
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5",
                        canAdd
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      )}
                    >
                      Consumo: {currentUsage} / {maxLimit}
                    </span>
                  )}
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleAddWrapper}
          disabled={!canAdd}
          className="w-full md:w-auto h-12 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 disabled:opacity-50 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
          {!canAdd
            ? t("limit_reached_btn", { defaultValue: "Límite Agotado" })
            : t("btn_add", { defaultValue: "Nuevo Curso" })}
        </Button>
      </div>

      <div className="space-y-8">
        {/* --- ALERTA DE LÍMITE --- */}
        <AnimatePresence>
          {!canAdd && courses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-red-200 dark:border-red-900/30 p-4 bg-red-50/50 dark:bg-red-900/10 mb-8 flex gap-3">
                <Info className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">
                    {t("limit_alert_title", {
                      defaultValue: "Capacidad Máxima Alcanzada",
                    })}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {t("limit_alert_desc", {
                      defaultValue:
                        "Archiva o elimina cursos antiguos para liberar espacio en tu cuenta.",
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- ESTADO VACÍO --- */}
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-gray-100 dark:border-gray-800 border-dashed bg-white dark:bg-[#0a0a0a] shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-6">
              <GraduationCap
                className="w-8 h-8 text-emerald-500"
                strokeWidth={2}
              />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("empty_state", { defaultValue: "Sin Material Educativo" })}
            </p>
            <p className="text-sm font-medium text-gray-500 mb-8 max-w-sm text-center leading-relaxed">
              {t("empty_desc", {
                defaultValue:
                  "Sube e-books, videos pregrabados o programas educativos para tus pacientes.",
              })}
            </p>
            <Button
              onClick={handleAddWrapper}
              disabled={!canAdd}
              className="h-12 px-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 disabled:opacity-50 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
              {!canAdd
                ? t("limit_reached_btn")
                : t("create_first", { defaultValue: "Registrar Primer Curso" })}
            </Button>
          </motion.div>
        ) : (
          /* --- LISTA DE CURSOS --- */
          <AnimatePresence mode="popLayout">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
                className={cn(
                  "border bg-white dark:bg-[#0a0a0a] transition-colors rounded-3xl shadow-sm overflow-hidden",
                  course.isNew || course.hasUnsavedChanges
                    ? "border-amber-200 dark:border-amber-900/30 ring-1 ring-amber-500/20"
                    : "border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-900/30",
                )}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* 📸 Zona Lateral: Portada del Curso */}
                  <div className="lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50 p-6 md:p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-500">
                          ID: {course.id < 0 ? "NUEVO" : course.id}
                        </span>
                        {(course.isNew || course.hasUnsavedChanges) && (
                          <span className="text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-full">
                            Modificado
                          </span>
                        )}
                      </div>

                      <div
                        className="w-full aspect-square rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-black overflow-hidden relative cursor-pointer group hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors mt-4 shadow-sm"
                        onClick={() =>
                          fileInputRefs.current[course.id]?.click()
                        }
                      >
                        {course.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.imageUrl}
                            alt={course.name}
                            className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-screen"
                          />
                        ) : (
                          <FileVideo
                            className="w-10 h-10 text-gray-300"
                            strokeWidth={1.5}
                          />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-sm font-semibold text-white bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                            {t("change_cover", { defaultValue: "Actualizar" })}
                          </span>
                        </div>
                      </div>

                      <span className="block text-center text-xs text-gray-400 font-semibold mt-2">
                        {t("photo_label", { defaultValue: "Portada" })}
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => {
                          fileInputRefs.current[course.id] = el;
                        }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            onImageUpload(course.id, e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* 📝 Zona Principal: Formulario */}
                  <div className="flex-1 p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          {t("label_title", {
                            defaultValue: "Título del Programa / E-book",
                          })}
                        </label>
                        <Input
                          value={course.name}
                          onChange={(e) =>
                            onUpdate(course.id, { name: e.target.value })
                          }
                          placeholder={t("placeholder_title", {
                            defaultValue: "Ej: Guía de Nutrición...",
                          })}
                          className={cn(
                            "rounded-xl bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors",
                            !course.name ? "border-red-200" : "",
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            {t("label_price", { defaultValue: "Precio" })}
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                              $
                            </span>
                            <Input
                              type="number"
                              min="0"
                              value={course.price || ""}
                              onChange={(e) =>
                                onUpdate(course.id, {
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="rounded-xl bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 pl-8 text-sm focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <Tag className="w-3 h-3" strokeWidth={2} />{" "}
                            {t("label_category", { defaultValue: "Categoría" })}
                          </label>
                          <Input
                            value={course.category}
                            onChange={(e) =>
                              onUpdate(course.id, { category: e.target.value })
                            }
                            placeholder={t("placeholder_category", {
                              defaultValue: "Cursos",
                            })}
                            className="rounded-xl bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        {t("label_desc", {
                          defaultValue: "Descripción y Temario",
                        })}
                      </label>
                      <Input
                        value={course.description}
                        onChange={(e) =>
                          onUpdate(course.id, { description: e.target.value })
                        }
                        placeholder={t("placeholder_desc", {
                          defaultValue: "¿Qué aprenderá el paciente?",
                        })}
                        className="rounded-xl bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors"
                      />
                    </div>

                    {/* URL Segura (Legacy) */}
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/30 p-5 bg-amber-50/50 dark:bg-amber-900/10 space-y-3 mt-4">
                      <label className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                        <Link2 className="w-4 h-4" strokeWidth={2} />{" "}
                        Enlace Externo (Legacy)
                      </label>
                      <Input
                        type="url"
                        value={course.contentUrl || ""}
                        onChange={(e) =>
                          onUpdate(course.id, { contentUrl: e.target.value })
                        }
                        placeholder="https://youtube.com/privado"
                        className="rounded-xl bg-white dark:bg-[#0a0a0a] border-amber-200 dark:border-amber-800/50 h-12 text-sm focus-visible:ring-0 focus-visible:border-amber-500 transition-colors"
                      />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-500">
                        ⚠️ Úsalo solo si tu curso no está hospedado aquí.
                      </p>
                    </div>

                    {/* 🏆 EVALUACIÓN Y CERTIFICACIÓN */}
                    <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-500" /> Evaluación y Certificación
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Minimum Passing Score */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Aprobación Mínima (%)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={course.minimumPassingScore || ""}
                            onChange={(e) =>
                              onUpdate(course.id, {
                                minimumPassingScore:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="Ej: 80"
                            className="rounded-xl bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors"
                          />
                          <p className="text-[10px] text-gray-400 font-medium">
                            Si es 0, no hay evaluación estricta.
                          </p>
                        </div>

                        {/* Emisión de constancia */}
                        <div className="space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer mt-1">
                            <input
                              type="checkbox"
                              checked={course.hasCertificate || false}
                              onChange={(e) =>
                                onUpdate(course.id, {
                                  hasCertificate: e.target.checked,
                                })
                              }
                              className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-700 dark:bg-[#0a0a0a]"
                            />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Emitir constancia al aprobar
                            </span>
                          </label>

                          {course.hasCertificate && (
                            <div className="space-y-2 pl-8 border-l-2 border-emerald-100 dark:border-emerald-900/30">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                Color de plantilla (Hex)
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  value={
                                    course.certificateTemplateColor || "#000000"
                                  }
                                  onChange={(e) =>
                                    onUpdate(course.id, {
                                      certificateTemplateColor: e.target.value,
                                    })
                                  }
                                  className="w-12 h-12 p-1 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                                />
                                <Input
                                  type="text"
                                  value={
                                    course.certificateTemplateColor || "#000000"
                                  }
                                  onChange={(e) =>
                                    onUpdate(course.id, {
                                      certificateTemplateColor: e.target.value,
                                    })
                                  }
                                  className="flex-1 rounded-xl bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm uppercase focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 🎓 BUILDER DE CURRÍCULO (LMS) */}
                    {!course.isNew && course.id > 0 && (
                      <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                        <CourseCurriculumBuilder catalogItemId={course.id} />
                      </div>
                    )}

                    {course.isNew && (
                      <div className="rounded-xl border border-blue-200 dark:border-blue-900/30 p-4 bg-blue-50 dark:bg-blue-900/10 mt-4 text-center">
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                          Guarda el curso primero para construir el plan de estudios (módulos y lecciones).
                        </p>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        variant="ghost"
                        onClick={() => onDelete(course.id)}
                        className="w-full sm:w-auto rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors h-12 px-6 text-sm font-semibold"
                      >
                        <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />{" "}
                        {tGlobal("delete", { defaultValue: "Purgar" })}
                      </Button>
                      <Button
                        onClick={() => onSave(course)}
                        disabled={!course.hasUnsavedChanges && !course.isNew}
                        className={cn(
                          "w-full sm:w-auto rounded-xl h-12 px-8 text-sm font-bold transition-colors border-0 shadow-sm",
                          course.hasUnsavedChanges || course.isNew
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed",
                        )}
                      >
                        <Save className="w-4 h-4 mr-2" strokeWidth={2} />
                        {course.isNew
                          ? tGlobal("save_new", { defaultValue: "Confirmar" })
                          : tGlobal("save_changes", {
                              defaultValue: "Sincronizar",
                            })}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
