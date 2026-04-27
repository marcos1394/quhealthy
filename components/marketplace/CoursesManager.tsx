"use client";

import React, { useRef } from "react";
import { Plus, Trash2, Save, FileVideo, GraduationCap, Tag, Link2, Info, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UI_Course } from "@/types/catalog";
import { cn } from "@/lib/utils";

interface CoursesManagerProps {
  courses: UI_Course[];
  onAdd: () => void;
  onUpdate: (id: number, updates: Partial<UI_Course>) => void;
  onSave: (course: UI_Course) => void;
  onDelete: (id: number) => void;
  onImageUpload: (id: number, file: File) => void;
  // 🚀 Nuevas props de negocio para límites de plan
  canAdd?: boolean;
  currentUsage?: number;
  maxLimit?: number;
}

export function CoursesManager({
  courses, 
  onAdd, 
  onUpdate, 
  onSave, 
  onDelete, 
  onImageUpload,
  canAdd = true, // Default a true por seguridad
  currentUsage,
  maxLimit
}: CoursesManagerProps) {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const t = useTranslations('Marketplace.courses'); // 🚀 Alineado al estándar
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
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden">
      
      {/* --- CABECERA (HEADER) --- */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 bg-white dark:bg-slate-900 gap-4">
        <div className="space-y-3">
          <CardTitle className="flex items-center gap-4 text-slate-900 dark:text-white text-2xl">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl border border-emerald-200 dark:border-emerald-500/30"
            >
              <GraduationCap className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
            {t('title', { defaultValue: 'Cursos / Productos Digitales' })}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3 text-base">
            {t('description', { defaultValue: 'Vende acceso a cursos, e-books o videos exclusivos.' })}
            
            {/* 🚀 Indicador de ítems activos */}
            {courses.length > 0 && (
              <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 shadow-sm font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                {courses.length} {courses.length === 1 ? t('course_single', { defaultValue: 'Curso' }) : t('course_plural', { defaultValue: 'Cursos' })}
              </Badge>
            )}

            {/* 🚀 Indicador de Límite de Plan (Contrato de Consumo) */}
            {typeof currentUsage === 'number' && typeof maxLimit === 'number' && (
              <Badge variant="outline" className={cn(
                "font-medium shadow-sm",
                canAdd 
                  ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" 
                  : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
              )}>
                {currentUsage} / {maxLimit} {t('usage_limit', { defaultValue: 'usados' })}
              </Badge>
            )}
          </CardDescription>
        </div>

        {/* 🚀 Botón protegido por regla de negocio */}
        <Button 
          onClick={handleAddWrapper} 
          disabled={!canAdd}
          className={cn(
            "shadow-md transition-all rounded-xl h-11 font-bold",
            canAdd 
              ? "bg-medical-600 hover:bg-medical-700 text-white hover:shadow-lg" 
              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
          )}
        >
          <Plus className="w-4 h-4 mr-2" /> 
          {!canAdd ? t('limit_reached_btn', { defaultValue: 'Límite Lleno' }) : t('btn_add', { defaultValue: 'Nuevo Curso' })}
        </Button>
      </CardHeader>

      <CardContent className="space-y-8 pt-8 p-6 md:p-8 bg-slate-50/30 dark:bg-slate-900/50">
        
        {/* --- ALERTA DE LÍMITE (Feedback UX) --- */}
        <AnimatePresence>
          {!canAdd && courses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-3xl p-5 flex items-center gap-4 shadow-sm"
            >
              <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-xl">
                <Info className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-800 dark:text-red-300 font-bold mb-1">
                  {t('limit_alert_title', { defaultValue: 'Has llenado tu capacidad' })}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300/80">
                  {t('limit_alert_desc', { defaultValue: 'Archiva o elimina cursos antiguos para liberar espacio, o actualiza tu plan en la sección de facturación.' })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- ESTADO VACÍO --- */}
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30"
          >
            <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl mb-6 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
              <GraduationCap className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mb-2">{t('empty_state', { defaultValue: 'No tienes cursos' })}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center leading-relaxed">
              {t('empty_desc', { defaultValue: 'Sube un e-book o un video pregrabado para monetizar tu conocimiento.' })}
            </p>
            <Button 
              onClick={handleAddWrapper}
              disabled={!canAdd}
              className="bg-medical-600 hover:bg-medical-700 text-white rounded-xl h-12 font-bold px-8 shadow-lg shadow-medical-500/20 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:shadow-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              {!canAdd ? t('limit_reached_btn') : t('create_first', { defaultValue: 'Crear mi primer curso' })}
            </Button>
          </motion.div>
        ) : (
          /* --- LISTA DE CURSOS --- */
          <AnimatePresence mode="popLayout">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                layout
              >
                <Card className={cn(
                  "border transition-all duration-300 shadow-sm rounded-3xl overflow-hidden group",
                  course.isNew 
                    ? "border-emerald-300 dark:border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-900/10 shadow-lg shadow-emerald-500/10" 
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl",
                  course.hasUnsavedChanges && !course.isNew ? "border-amber-300 dark:border-amber-500/50 bg-amber-50/30 dark:bg-amber-900/10" : ""
                )}>
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-8">

                      {/* 📸 Imagen de Portada */}
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden relative cursor-pointer group/image transition-all hover:border-emerald-500"
                          onClick={() => fileInputRefs.current[course.id]?.click()}
                        >
                          {course.imageUrl ? (
                            <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover group-hover/image:opacity-50 transition-opacity" />
                          ) : (
                            <FileVideo className="w-8 h-8 text-slate-400 dark:text-slate-600 group-hover/image:scale-110 transition-transform" />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs font-bold px-2 text-center">{t('change_cover', { defaultValue: 'Cambiar Portada' })}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
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

                      {/* 📝 Formulario */}
                      <div className="flex-1 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('label_title', { defaultValue: 'Título del Curso / E-book' })}</label>
                            <Input 
                              value={course.name} 
                              onChange={e => onUpdate(course.id, { name: e.target.value })} 
                              placeholder={t('placeholder_title', { defaultValue: 'Ej: Guía de Nutrición...' })} 
                              className={cn(
                                "h-11 font-bold text-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white transition-all",
                                "focus-visible:ring-emerald-500 focus-visible:border-emerald-500",
                                !course.name ? "border-red-300 dark:border-red-500/50" : ""
                              )} 
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('label_price', { defaultValue: 'Precio' })}</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold">$</span>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  value={course.price || ''} 
                                  onChange={e => onUpdate(course.id, { price: parseFloat(e.target.value) || 0 })} 
                                  className="h-11 pl-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus-visible:ring-emerald-500" 
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center"><Tag className="w-3 h-3 mr-1" /> {t('label_category', { defaultValue: 'Categoría' })}</label>
                              <Input 
                                value={course.category} 
                                onChange={e => onUpdate(course.id, { category: e.target.value })} 
                                placeholder={t('placeholder_category', { defaultValue: 'Cursos' })} 
                                className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus-visible:ring-emerald-500" 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('label_desc', { defaultValue: 'Descripción Corta' })}</label>
                          <Input 
                            value={course.description} 
                            onChange={e => onUpdate(course.id, { description: e.target.value })} 
                            placeholder={t('placeholder_desc', { defaultValue: '¿Qué aprenderá el paciente?' })} 
                            className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus-visible:ring-emerald-500" 
                          />
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 space-y-2">
                          <label className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center">
                            <Link2 className="w-4 h-4 mr-1" /> {t('label_url', { defaultValue: 'URL del Contenido (Privado)' })}
                          </label>
                          <Input
                            type="url"
                            value={course.contentUrl || ''}
                            onChange={e => onUpdate(course.id, { contentUrl: e.target.value })}
                            placeholder={t('placeholder_url', { defaultValue: 'https://youtube.com/... o enlace de Drive' })}
                            className="h-11 bg-white dark:bg-slate-950 border-emerald-200 dark:border-emerald-800/50 focus-visible:ring-emerald-500 text-slate-900 dark:text-white"
                          />
                          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium pt-1">
                            {t('url_warning', { defaultValue: '⚠️ Este enlace solo será visible para el paciente DESPUÉS de haber pagado el curso.' })}
                          </p>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                          <Button 
                            variant="ghost" 
                            onClick={() => onDelete(course.id)} 
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-11 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> {tGlobal('delete', { defaultValue: 'Eliminar' })}
                          </Button>
                          <Button
                            onClick={() => onSave(course)}
                            disabled={!course.hasUnsavedChanges && !course.isNew}
                            className={cn(
                              "rounded-xl h-11 font-bold shadow-sm transition-all px-6",
                              course.hasUnsavedChanges || course.isNew 
                                ? "bg-medical-600 hover:bg-medical-700 text-white shadow-md" 
                                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                            )}
                          >
                            <Save className="w-4 h-4 mr-2" /> 
                            {course.isNew ? tGlobal('save_new', { defaultValue: 'Guardar' }) : tGlobal('save_changes', { defaultValue: 'Guardar Cambios' })}
                          </Button>
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}