"use client";

import React, { useEffect, useState } from "react";
import { CourseCurriculumService } from "@/services/course-curriculum.service";
import { CourseModule } from "@/types/catalog";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, PlayCircle, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
 catalogItemId: number;
}

export function CourseCurriculumView({ catalogItemId }: Props) {
 const [modules, setModules] = useState<CourseModule[]>([]);
 const [loading, setLoading] = useState(true);
 const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

 useEffect(() => {
 const loadCurriculum = async () => {
 try {
 setLoading(true);
 const data = await CourseCurriculumService.getCurriculum(catalogItemId);
 setModules(data.modules || []);
 if (data.modules && data.modules.length > 0) {
 setExpandedModules({ [data.modules[0].id]: true });
 }
 } catch (error) {
 console.error("Error loading curriculum:", error);
 } finally {
 setLoading(false);
 }
 };
 loadCurriculum();
 }, [catalogItemId]);

 const toggleModule = (moduleId: number) => {
 setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
 };

 if (loading) {
 return (
 <div className="py-12 text-center text-sm font-medium text-gray-400 animate-pulse bg-gray-50 dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800">
 Cargando plan de estudios...
 </div>
 );
 }

 if (modules.length === 0) {
 return null; // Si no hay currículo construido, no mostramos esta sección
 }

 const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

 return (
 <div className="space-y-6 mt-10 pt-10 border-t border-gray-100 dark:border-gray-800">
 <div className="flex items-end justify-between">
 <div>
 <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1.5">
 <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" strokeWidth={2} /> Plan de Estudios
 </h3>
 <p className="text-sm font-medium text-gray-500">
 {modules.length} Módulos • {totalLessons} Lecciones
 </p>
 </div>
 </div>

 <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
 {modules.map((mod, index) => (
 <div key={mod.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
 <button 
 onClick={() => toggleModule(mod.id!)}
 className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-left"
 >
 <div className="flex flex-col gap-1 pr-4">
 <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Módulo {index + 1}</span>
 <span className="text-base font-semibold text-gray-900 dark:text-white">{mod.title}</span>
 </div>
 <div className="flex items-center gap-4 text-gray-400">
 <span className="text-xs font-medium hidden sm:inline-block">
 {mod.lessons.length} Lecciones
 </span>
 {expandedModules[mod.id!] ? (
 <ChevronDown className="w-5 h-5 shrink-0 text-gray-500" />
 ) : (
 <ChevronRight className="w-5 h-5 shrink-0 text-gray-400" />
 )}
 </div>
 </button>
 
 <AnimatePresence>
 {expandedModules[mod.id!] && (
 <motion.div 
 initial={{ height: 0 }} 
 animate={{ height: "auto" }} 
 exit={{ height: 0 }}
 className="overflow-hidden bg-gray-50/50 dark:bg-[#050505]"
 >
 <div className="py-2">
 {mod.lessons.map((lesson, lIndex) => (
 <div
 key={lesson.id}
 className={cn(
 "w-full flex items-center justify-between p-4 px-6 text-left hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors border-t border-dashed border-gray-100 dark:border-gray-800 first:border-0",
 lesson.isFreePreview ? "cursor-pointer" : "opacity-90"
 )}
 onClick={() => {
 if (lesson.isFreePreview) {
 // En un futuro podríamos abrir un modal con la vista previa del video
 alert("¡Esta lección es de vista previa! Próximamente abriremos un reproductor mini.");
 }
 }}
 >
 <div className="flex items-start gap-4">
 <PlayCircle className={cn(
 "w-5 h-5 shrink-0 mt-0.5",
 lesson.isFreePreview ? "text-teal-500" : "text-gray-300 dark:text-gray-700"
 )} strokeWidth={2} />
 <div className="flex flex-col gap-1">
 <span className={cn(
 "text-sm",
 lesson.isFreePreview ? "font-semibold text-gray-900 dark:text-white" : "font-medium text-gray-600 dark:text-gray-400"
 )}>
 {index + 1}.{lIndex + 1} {lesson.title}
 </span>
 {lesson.description && (
 <p className="text-xs text-gray-500 line-clamp-1">{lesson.description}</p>
 )}
 </div>
 </div>
 <div className="flex items-center gap-4 shrink-0 pl-4">
 {lesson.isFreePreview && (
 <span className="hidden sm:inline-flex bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-100 dark:border-teal-800 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
 Vista Previa
 </span>
 )}
 {lesson.durationMinutes && (
 <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
 <Clock className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} /> {lesson.durationMinutes} min
 </span>
 )}
 </div>
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 ))}
 </div>
 </div>
 );
}
