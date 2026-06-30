"use client"
/* eslint-disable react-doctor/click-events-have-key-events */;

import React, { useRef } from "react";
import { Plus, Trash2, Save, FileVideo, GraduationCap, Tag, Link2, Info, Sparkles, Award } from "lucide-react";
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
  maxLimit
}: CoursesManagerProps) {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const t = useTranslations('Marketplace.courses'); 
  const tGlobal = useTranslations('StoreCatalog.actions');

  const handleAddWrapper = () => {
    // 🛡️ Validación de Negocio
    if (!canAdd) {
      toast.warning(t('limit_reached_msg', { defaultValue: 'Has alcanzado el límite de cursos de tu plan.' }));
      return;
    }
    onAdd();
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
      
      {/* --- CABECERA (HEADER) --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505] gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
            <GraduationCap className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
              {t('title', { defaultValue: 'Cursos / Productos Digitales' })}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {courses.length > 0 && (
                <span className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" strokeWidth={2} />
                  {courses.length} {courses.length === 1 ? t('course_single', { defaultValue: 'Registro Activo' }) : t('course_plural', { defaultValue: 'Registros Activos' })}
                </span>
              )}

              {typeof currentUsage === 'number' && typeof maxLimit === 'number' && (
                <span className={cn(
                  "border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1",
                  canAdd 
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" 
                    : "border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                )}>
                  Consumo: {currentUsage} / {maxLimit}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button 
          onClick={handleAddWrapper} 
          disabled={!canAdd}
          className="w-full sm:w-auto rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors h-10 px-6 disabled:opacity-50 disabled:cursor-not-allowed border-0"
        >
          <Plus className="w-4 h-4 mr-2" strokeWidth={2} /> 
          {!canAdd ? t('limit_reached_btn', { defaultValue: 'Límite Agotado' }) : t('btn_add', { defaultValue: 'Nuevo Curso' })}
        </Button>
      </div>

      <div className="p-6 md:p-8 space-y-8 bg-gray-50/50 dark:bg-[#050505]/50">
        
        {/* --- ALERTA DE LÍMITE (Margin Note) --- */}
        <AnimatePresence>
          {!canAdd && courses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-l-2 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/10 mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-2 mb-1">
                  <Info className="w-3.5 h-3.5" /> {t('limit_alert_title', { defaultValue: 'Capacidad Máxima Alcanzada' })}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 font-light">
                  {t('limit_alert_desc', { defaultValue: 'Archiva o elimina cursos antiguos para liberar espacio en tu cuenta.' })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- ESTADO VACÍO (Blueprint Empty State) --- */}
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-400 dark:border-gray-600 bg-white dark:bg-[#0a0a0a]"
          >
            <div className="w-16 h-16 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-[#050505] mb-6">
              <GraduationCap className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
              {t('empty_state', { defaultValue: 'Sin Material Educativo' })}
            </p>
            <p className="text-xs text-gray-500 font-light mb-8 max-w-sm text-center leading-relaxed">
              {t('empty_desc', { defaultValue: 'Sube e-books, videos pregrabados o programas educativos para tus pacientes.' })}
            </p>
            <Button 
              onClick={handleAddWrapper}
              disabled={!canAdd}
              className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors h-12 px-8 disabled:opacity-50 border-0"
            >
              <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
              {!canAdd ? t('limit_reached_btn') : t('create_first', { defaultValue: 'Registrar Primer Curso' })}
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
                  "border transition-colors bg-white dark:bg-[#0a0a0a]",
                  course.isNew || course.hasUnsavedChanges 
                    ? "border-black dark:border-white ring-1 ring-black dark:ring-white" 
                    : "border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white"
                )}
              >
                <div className="flex flex-col lg:flex-row">

                  {/* 📸 Zona Lateral: Portada del Curso */}
                  <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-6 md:p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400">ID: {course.id < 0 ? 'NUEVO' : course.id}</span>
                        {(course.isNew || course.hasUnsavedChanges) && (
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black px-2 py-1">
                            Modificado
                          </span>
                        )}
                      </div>

                      <div
                        className="w-full aspect-square border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-black overflow-hidden relative cursor-pointer group hover:border-black dark:hover:border-white transition-colors mt-4"
                        onClick={() => fileInputRefs.current[course.id]?.click()}
                      >
                        {course.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-screen" />
                        ) : (
                          <FileVideo className="w-8 h-8 text-gray-400" strokeWidth={1} />
                        )}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white border border-white px-2 py-1">
                            {t('change_cover', { defaultValue: 'Actualizar' })}
                          </span>
                        </div>
                      </div>

                      <span className="block text-center text-[9px] text-gray-500 uppercase tracking-widest font-bold mt-2">
                        {t('photo_label', { defaultValue: 'Portada' })}
                      </span>
                      
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={el => { fileInputRefs.current[course.id] = el; }}
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
                        <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                          {t('label_title', { defaultValue: 'Título del Programa / E-book' })}
                        </label>
                        <Input 
                          value={course.name} 
                          onChange={e => onUpdate(course.id, { name: e.target.value })} 
                          placeholder={t('placeholder_title', { defaultValue: 'Ej: Guía de Nutrición...' })} 
                          className={cn(
                            "rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors",
                            !course.name ? "border-red-500" : ""
                          )} 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                            {t('label_price', { defaultValue: 'Precio' })}
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                            <Input 
                              type="number" 
                              min="0" 
                              value={course.price || ''} 
                              onChange={e => onUpdate(course.id, { price: parseFloat(e.target.value) || 0 })} 
                              className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 pl-8 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                            <Tag className="w-3 h-3" strokeWidth={2} /> {t('label_category', { defaultValue: 'Categoría' })}
                          </label>
                          <Input 
                            value={course.category} 
                            onChange={e => onUpdate(course.id, { category: e.target.value })} 
                            placeholder={t('placeholder_category', { defaultValue: 'Cursos' })} 
                            className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                        {t('label_desc', { defaultValue: 'Descripción y Temario' })}
                      </label>
                      <Input 
                        value={course.description} 
                        onChange={e => onUpdate(course.id, { description: e.target.value })} 
                        placeholder={t('placeholder_desc', { defaultValue: '¿Qué aprenderá el paciente?' })} 
                        className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
                      />
                    </div>

                    {/* URL Segura (Legacy) */}
                    <div className="border-l-2 border-amber-500 pl-4 py-3 bg-amber-50 dark:bg-amber-900/10 space-y-3 mt-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400 flex items-center gap-2">
                        <Link2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Enlace Externo (Legacy)
                      </label>
                      <Input
                        type="url"
                        value={course.contentUrl || ''}
                        onChange={e => onUpdate(course.id, { contentUrl: e.target.value })}
                        placeholder="https://youtube.com/privado"
                        className="rounded-none bg-white dark:bg-[#0a0a0a] border-amber-200 dark:border-amber-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-amber-500 transition-colors"
                      />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-500">
                        ⚠️ Úsalo solo si tu curso no está hospedado aquí.
                      </p>
                    </div>

                    {/* 🏆 EVALUACIÓN Y CERTIFICACIÓN */}
                    <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800 space-y-6">
                      <h3 className="text-[12px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                        <Award className="w-4 h-4" /> Evaluación y Certificación
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Minimum Passing Score */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                            Aprobación Mínima (%)
                          </label>
                          <Input 
                            type="number"
                            min="0"
                            max="100"
                            value={course.minimumPassingScore || ''} 
                            onChange={e => onUpdate(course.id, { minimumPassingScore: parseFloat(e.target.value) || 0 })} 
                            placeholder="Ej: 80" 
                            className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
                          />
                          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                            Si es 0, no hay evaluación estricta.
                          </p>
                        </div>

                        {/* Emisión de constancia */}
                        <div className="space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={course.hasCertificate || false}
                              onChange={e => onUpdate(course.id, { hasCertificate: e.target.checked })}
                              className="w-4 h-4 rounded-none border-gray-300 text-black focus:ring-black dark:border-gray-700 dark:bg-black dark:checked:bg-white"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                              Emitir constancia al aprobar
                            </span>
                          </label>

                          {course.hasCertificate && (
                            <div className="space-y-2 pl-7 border-l-2 border-gray-200 dark:border-gray-800">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                Color de plantilla (Hex)
                              </label>
                              <div className="flex gap-2">
                                <Input 
                                  type="color"
                                  value={course.certificateTemplateColor || '#000000'}
                                  onChange={e => onUpdate(course.id, { certificateTemplateColor: e.target.value })}
                                  className="w-12 h-12 p-1 rounded-none border-gray-200 dark:border-gray-800 bg-white dark:bg-black"
                                />
                                <Input 
                                  type="text"
                                  value={course.certificateTemplateColor || '#000000'}
                                  onChange={e => onUpdate(course.id, { certificateTemplateColor: e.target.value })}
                                  className="flex-1 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm uppercase"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 🎓 BUILDER DE CURRÍCULO (LMS) */}
                    {!course.isNew && course.id > 0 && (
                      <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
                        <CourseCurriculumBuilder catalogItemId={course.id} />
                      </div>
                    )}
                    
                    {course.isNew && (
                      <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-900/10 p-3 mt-4 text-center border-l-2 border-blue-500">
                        Guarda el curso primero para construir el plan de estudios (módulos y lecciones).
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                      <Button 
                        variant="ghost" 
                        onClick={() => onDelete(course.id)} 
                        className="rounded-none border border-transparent text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-900/50 transition-colors h-12 px-6 text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} /> {tGlobal('delete', { defaultValue: 'Purgar' })}
                      </Button>
                      <Button
                        onClick={() => onSave(course)}
                        disabled={!course.hasUnsavedChanges && !course.isNew}
                        className={cn(
                          "rounded-none h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0",
                          course.hasUnsavedChanges || course.isNew 
                            ? "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200" 
                            : "bg-gray-100 text-gray-400 dark:bg-gray-900 cursor-not-allowed"
                        )}
                      >
                        <Save className="w-4 h-4 mr-2" strokeWidth={2} /> 
                        {course.isNew ? tGlobal('save_new', { defaultValue: 'Confirmar' }) : tGlobal('save_changes', { defaultValue: 'Sincronizar' })}
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