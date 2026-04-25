"use client";

import React, { useRef } from "react";
import { Plus, Trash2, Save, FileVideo, GraduationCap, Tag, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UI_Course } from "@/types/catalog";
import { cn } from "@/lib/utils";

interface CoursesManagerProps {
  courses: UI_Course[];
  onAdd: () => void;
  onUpdate: (id: number, updates: Partial<UI_Course>) => void;
  onSave: (course: UI_Course) => void;
  onDelete: (id: number) => void;
  onImageUpload: (id: number, file: File) => void;
}

export function CoursesManager({
  courses, onAdd, onUpdate, onSave, onDelete, onImageUpload
}: CoursesManagerProps) {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const t = useTranslations('StoreCatalog.courses');
  const tGlobal = useTranslations('StoreCatalog.actions');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-500" /> {t('title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <Button onClick={onAdd} className="bg-medical-600 hover:bg-medical-700 text-white rounded-xl shadow-sm whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" /> {t('btn_add')}
        </Button>
      </div>

      <div className="space-y-4">
        {courses.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{t('empty_state')}</p>
          </div>
        )}

        {courses.map((course) => (
          <Card key={course.id} className={cn(
            "border transition-all duration-300 shadow-sm",
            course.isNew ? "border-emerald-300 dark:border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-900/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
            course.hasUnsavedChanges && !course.isNew ? "border-amber-300 dark:border-amber-500/50" : ""
          )}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">

                {/* 📸 Imagen de Portada del Curso */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 overflow-hidden relative group cursor-pointer"
                    onClick={() => fileInputRefs.current[course.id]?.click()}
                  >
                    {course.imageUrl ? (
                      <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    ) : (
                      <FileVideo className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-bold px-2 text-center">{t('change_cover')}</span>
                    </div>
                  </div>
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
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('label_title')}</label>
                      <Input value={course.name} onChange={e => onUpdate(course.id, { name: e.target.value })} placeholder={t('placeholder_title')} className="font-bold border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('label_price')}</label>
                        <Input type="number" min="0" value={course.price} onChange={e => onUpdate(course.id, { price: parseFloat(e.target.value) || 0 })} className="border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center"><Tag className="w-3 h-3 mr-1" /> {t('label_category')}</label>
                        <Input value={course.category} onChange={e => onUpdate(course.id, { category: e.target.value })} placeholder={t('placeholder_category')} className="border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('label_desc')}</label>
                    <Input value={course.description} onChange={e => onUpdate(course.id, { description: e.target.value })} placeholder={t('placeholder_desc')} className="border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500" />
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-800/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 space-y-2">
                    <label className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center">
                      <Link2 className="w-3 h-3 mr-1" /> {t('label_url')}
                    </label>
                    <Input
                      type="url"
                      value={course.contentUrl}
                      onChange={e => onUpdate(course.id, { contentUrl: e.target.value })}
                      placeholder={t('placeholder_url')}
                      className="bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/50 focus-visible:ring-emerald-500"
                    />
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{t('url_warning')}</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={() => onDelete(course.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                      <Trash2 className="w-4 h-4 mr-2" /> {tGlobal('delete')}
                    </Button>
                    <Button
                      onClick={() => onSave(course)}
                      disabled={!course.hasUnsavedChanges && !course.isNew}
                      className={cn(
                        "rounded-xl shadow-sm transition-all",
                        course.hasUnsavedChanges || course.isNew ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      )}
                    >
                      <Save className="w-4 h-4 mr-2" /> {course.isNew ? tGlobal('save_new') : tGlobal('save_changes')}
                    </Button>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}