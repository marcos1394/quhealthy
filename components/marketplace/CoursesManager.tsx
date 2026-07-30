"use client";

/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/button-has-type */

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
    if (!canAdd) {
      toast.warning(t("limit_reached_msg"));
      return;
    }
    onAdd();
  };

  return (
    <div className="flex flex-col bg-transparent font-sans transition-colors select-none">
      {/* ── CABECERA PRINCIPAL ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xs gap-6 shrink-0 mb-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
            <GraduationCap className="w-7 h-7" strokeWidth={2} />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t("title")}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("catalog_title")}
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
                {courses.length > 0 && (
                  <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>
                      {courses.length}{" "}
                      {courses.length === 1
                        ? t("course_single")
                        : t("course_plural")}
                    </span>
                  </span>
                )}

                {typeof currentUsage === "number" &&
                  typeof maxLimit === "number" && (
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs border",
                        canAdd
                          ? "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
                          : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
                      )}
                    >
                      {t("usage", { current: currentUsage, max: maxLimit })}
                    </span>
                  )}
              </div>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleAddWrapper}
          disabled={!canAdd}
          className="w-full md:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>{!canAdd ? t("limit_reached_btn") : t("btn_add")}</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* ── ALERTA DE LÍMITE ALCANZADO ────────────────────────────────── */}
        <AnimatePresence>
          {!canAdd && courses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="rounded-3xl border border-rose-200 dark:border-rose-900/40 p-5 bg-rose-50/60 dark:bg-rose-950/20 flex gap-3.5 shadow-2xs">
                <Info className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" strokeWidth={2} />
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-300">
                    {t("limit_alert_title")}
                  </p>
                  <p className="text-xs font-medium text-rose-700/90 dark:text-rose-400 leading-relaxed">
                    {t("limit_alert_desc")}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ESTADO VACÍO ────────────────────────────────────────────── */}
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs p-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-2xs">
              <GraduationCap className="w-8 h-8" strokeWidth={2} />
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-1">
              {t("empty_state")}
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
              {t("empty_desc")}
            </p>
            <Button
              type="button"
              onClick={handleAddWrapper}
              disabled={!canAdd}
              className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>{!canAdd ? t("limit_reached_btn") : t("create_first")}</span>
            </Button>
          </motion.div>
        ) : (
          /* ── LISTADO DE CURSOS ───────────────────────────────────────── */
          <AnimatePresence mode="popLayout">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
                className={cn(
                  "border bg-white dark:bg-[#0a0a0a] transition-all rounded-3xl shadow-2xs overflow-hidden",
                  course.isNew || course.hasUnsavedChanges
                    ? "border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-500/20"
                    : "border-gray-100 dark:border-gray-800 hover:border-emerald-500/30"
                )}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* 📸 Portada Lateral */}
                  <div className="lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] p-6 md:p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold font-mono text-gray-400">
                          {t("id_label", {
                            id: course.id < 0 ? t("id_new") : course.id,
                          })}
                        </span>
                        {(course.isNew || course.hasUnsavedChanges) && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 px-2.5 py-0.5 rounded-full shadow-2xs">
                            {t("modified_badge")}
                          </span>
                        )}
                      </div>

                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          fileInputRefs.current[course.id]?.click()
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            fileInputRefs.current[course.id]?.click();
                          }
                        }}
                        className="w-full aspect-square rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-[#0a0a0a] overflow-hidden relative cursor-pointer group hover:border-emerald-500 transition-colors shadow-2xs"
                      >
                        {course.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.imageUrl}
                            alt={course.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 p-4 text-center">
                            <FileVideo
                              className="w-8 h-8 text-gray-300 dark:text-gray-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                              strokeWidth={1.5}
                            />
                            <span className="text-xs font-semibold text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {t("upload_image_hint")}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-2xs">
                          <span className="text-xs font-bold text-white bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-2xs">
                            {t("change_cover")}
                          </span>
                        </div>
                      </div>

                      <span className="block text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {t("photo_label")}
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

                  {/* 📝 Formulario de Configuración */}
                  <div className="flex-1 p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Título */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                          {t("label_title")}
                        </label>
                        <Input
                          value={course.name}
                          onChange={(e) =>
                            onUpdate(course.id, { name: e.target.value })
                          }
                          placeholder={t("placeholder_title")}
                          className={cn(
                            "rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs",
                            !course.name
                              ? "border-rose-200 dark:border-rose-900/50"
                              : ""
                          )}
                        />
                      </div>

                      {/* Precio & Categoría */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                            {t("label_price")}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
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
                              className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 pl-7 text-xs font-mono font-bold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                            <span>{t("label_category")}</span>
                          </label>
                          <Input
                            value={course.category}
                            onChange={(e) =>
                              onUpdate(course.id, { category: e.target.value })
                            }
                            placeholder={t("placeholder_category")}
                            className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                        {t("label_desc")}
                      </label>
                      <Input
                        value={course.description}
                        onChange={(e) =>
                          onUpdate(course.id, { description: e.target.value })
                        }
                        placeholder={t("placeholder_desc")}
                        className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                      />
                    </div>

                    {/* Enlace Externo (Legacy) */}
                    <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 p-4 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                      <label className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                        <Link2 className="w-4 h-4" strokeWidth={2} />
                        <span>{t("legacy_link_label")}</span>
                      </label>
                      <Input
                        type="url"
                        value={course.contentUrl || ""}
                        onChange={(e) =>
                          onUpdate(course.id, { contentUrl: e.target.value })
                        }
                        placeholder={t("legacy_link_placeholder")}
                        className="rounded-xl bg-white dark:bg-[#0a0a0a] border-amber-200 dark:border-amber-800/50 h-10 text-xs font-mono font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all shadow-2xs"
                      />
                      <p className="text-[11px] font-semibold text-amber-700/80 dark:text-amber-400">
                        {t("legacy_link_warn")}
                      </p>
                    </div>

                    {/* 🏆 EVALUACIÓN Y CERTIFICACIÓN */}
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                        <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        <span>{t("eval_title")}</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Puntaje mínimo */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                            {t("label_passing_score")}
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
                            placeholder={t("placeholder_passing_score")}
                            className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-mono font-bold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                          />
                          <p className="text-[11px] font-medium text-gray-400">
                            {t("passing_score_hint")}
                          </p>
                        </div>

                        {/* Emisión de Constancia */}
                        <div className="space-y-3">
                          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={course.hasCertificate || false}
                              onChange={(e) =>
                                onUpdate(course.id, {
                                  hasCertificate: e.target.checked,
                                })
                              }
                              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-700 dark:bg-[#0a0a0a]"
                            />
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                              {t("label_has_certificate")}
                            </span>
                          </label>

                          {course.hasCertificate && (
                            <div className="space-y-1.5 pl-6 border-l-2 border-emerald-500/40">
                              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                                {t("label_cert_color")}
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  value={
                                    course.certificateTemplateColor || "#059669"
                                  }
                                  onChange={(e) =>
                                    onUpdate(course.id, {
                                      certificateTemplateColor: e.target.value,
                                    })
                                  }
                                  className="w-11 h-11 p-1 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={
                                    course.certificateTemplateColor || "#059669"
                                  }
                                  onChange={(e) =>
                                    onUpdate(course.id, {
                                      certificateTemplateColor: e.target.value,
                                    })
                                  }
                                  className="flex-1 rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-mono uppercase font-bold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 🎓 BUILDER DE CURRÍCULO LMS */}
                    {!course.isNew && course.id > 0 && (
                      <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                        <CourseCurriculumBuilder catalogItemId={course.id} />
                      </div>
                    )}

                    {course.isNew && (
                      <div className="rounded-2xl border border-sky-200/80 dark:border-sky-900/40 p-4 bg-sky-50/40 dark:bg-sky-950/20 text-center">
                        <p className="text-xs font-bold text-sky-800 dark:text-sky-300">
                          {t("new_course_lms_hint")}
                        </p>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onDelete(course.id)}
                        className="w-full sm:w-auto h-11 px-6 rounded-xl border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-xs font-bold shadow-2xs cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />
                        <span>{tGlobal("delete")}</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={() => onSave(course)}
                        disabled={!course.hasUnsavedChanges && !course.isNew}
                        className={cn(
                          "w-full sm:w-auto h-11 px-8 rounded-xl text-xs font-bold transition-all border-0 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                          course.hasUnsavedChanges || course.isNew
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        )}
                      >
                        <Save className="w-4 h-4 mr-2" strokeWidth={2} />
                        <span>
                          {course.isNew
                            ? tGlobal("save_new")
                            : tGlobal("save_changes")}
                        </span>
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