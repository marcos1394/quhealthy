"use client";

import React, { useState, useEffect } from "react";
import { CourseModule, CourseLesson } from "@/types/catalog";
import { CourseCurriculumService } from "@/services/course-curriculum.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Plus, Trash2, Video, FileText, ChevronDown, ChevronRight, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface Props {
  catalogItemId: number;
}

export function CourseCurriculumBuilder({ catalogItemId }: Props) {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [uploadingLessons, setUploadingLessons] = useState<Record<number, boolean>>({});
  const [deleteState, setDeleteState] = useState<{ type: 'module' | 'lesson' | null; moduleId?: number; lessonId?: number }>({ type: null });

  useEffect(() => {
    loadCurriculum();
  }, [catalogItemId]);

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      const data = await CourseCurriculumService.getCurriculum(catalogItemId);
      setModules(data.modules || []);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar el plan de estudios.");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleAddModule = async () => {
    try {
      const newModule = await CourseCurriculumService.createModule(catalogItemId, {
        title: "Nuevo Módulo",
        orderIndex: modules.length,
      });
      setModules([...modules, { ...newModule, lessons: [] }]);
      setExpandedModules(prev => ({ ...prev, [newModule.id!]: true }));
      toast.success("Módulo agregado.");
    } catch (error) {
      toast.error("Error al crear módulo.");
    }
  };

  const handleDeleteModule = (moduleId: number) => {
    setDeleteState({ type: 'module', moduleId });
  };

  const confirmDeleteModule = async (moduleId: number) => {
    try {
      await CourseCurriculumService.deleteModule(catalogItemId, moduleId);
      setModules(modules.filter(m => m.id !== moduleId));
      toast.success("Módulo eliminado.");
    } catch (error) {
      toast.error("Error al eliminar módulo.");
    }
  };

  const handleUpdateModule = async (moduleId: number, title: string) => {
    try {
      const updated = await CourseCurriculumService.updateModule(catalogItemId, moduleId, { title });
      setModules(modules.map(m => m.id === moduleId ? { ...m, title: updated.title } : m));
    } catch (error) {
      toast.error("Error al actualizar módulo.");
    }
  };

  const handleAddLesson = async (moduleId: number) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    try {
      const newLesson = await CourseCurriculumService.createLesson(catalogItemId, moduleId, {
        title: "Nueva Lección",
        orderIndex: mod.lessons.length,
      });
      setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m));
      toast.success("Lección agregada.");
    } catch (error) {
      toast.error("Error al agregar lección.");
    }
  };

  const handleUpdateLesson = async (moduleId: number, lessonId: number, updates: Partial<CourseLesson>) => {
    try {
      const updated = await CourseCurriculumService.updateLesson(catalogItemId, moduleId, lessonId, updates);
      setModules(modules.map(m => m.id === moduleId ? {
        ...m,
        lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updated } : l)
      } : m));
    } catch (error) {
      toast.error("Error al actualizar lección.");
    }
  };

  const handleDeleteLesson = (moduleId: number, lessonId: number) => {
    setDeleteState({ type: 'lesson', moduleId, lessonId });
  };

  const confirmDeleteLesson = async (moduleId: number, lessonId: number) => {
    try {
      await CourseCurriculumService.deleteLesson(catalogItemId, moduleId, lessonId);
      setModules(modules.map(m => m.id === moduleId ? {
        ...m,
        lessons: m.lessons.filter(l => l.id !== lessonId)
      } : m));
      toast.success("Lección eliminada.");
    } catch (error) {
      toast.error("Error al eliminar lección.");
    }
  };

  const extractThumbnail = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      
      video.onloadeddata = () => {
        // Seek to 1 second or half the video, whichever is smaller
        video.currentTime = Math.min(1, video.duration / 2);
      };
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
          } else {
            reject(new Error("No se pudo generar miniatura"));
          }
          URL.revokeObjectURL(video.src);
        }, 'image/jpeg', 0.8);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error("Error al cargar video para miniatura"));
      };
    });
  };

  const handleVideoUpload = async (moduleId: number, lessonId: number, file: File) => {
    try {
      setUploadingLessons(prev => ({ ...prev, [lessonId]: true }));
      const { uploadUrl, publicUrl, requiredContentType } = await CourseCurriculumService.generateVideoUploadUrl(catalogItemId, file);
      
      // Upload to GCS
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": requiredContentType }
      });

      // Update lesson with new video URL
      await handleUpdateLesson(moduleId, lessonId, { videoUrl: publicUrl });
      toast.success("Video subido exitosamente.");

      // Generar y subir miniatura automáticamente
      try {
        const thumbnailFile = await extractThumbnail(file);
        const thumbRes = await CourseCurriculumService.generateVideoUploadUrl(catalogItemId, thumbnailFile);
        await axios.put(thumbRes.uploadUrl, thumbnailFile, {
          headers: { "Content-Type": thumbRes.requiredContentType }
        });
        await handleUpdateLesson(moduleId, lessonId, { thumbnailUrl: thumbRes.publicUrl });
      } catch (err) {
        console.warn("No se pudo extraer/subir la miniatura automáticamente", err);
      }

    } catch (error) {
      console.error(error);
      toast.error("Error al subir el video.");
    } finally {
      setUploadingLessons(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  if (loading) return <div className="text-sm p-4 animate-pulse">Cargando currículo...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Plan de Estudios</h3>
        <Button onClick={handleAddModule} variant="outline" className="h-8 rounded-none text-xs font-bold uppercase tracking-widest">
          <Plus className="w-3 h-3 mr-2" /> Agregar Módulo
        </Button>
      </div>

      <div className="space-y-3">
        {modules.map((mod, mIndex) => (
          <div key={mod.id} className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
            <div className="flex items-center p-3 gap-3">
              <button onClick={() => toggleModule(mod.id!)} className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                {expandedModules[mod.id!] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400">M{mIndex + 1}</span>
                <Input 
                  value={mod.title}
                  onChange={(e) => setModules(modules.map(m => m.id === mod.id ? { ...m, title: e.target.value } : m))}
                  onBlur={(e) => handleUpdateModule(mod.id!, e.target.value)}
                  className="h-8 text-sm font-semibold bg-transparent border-transparent hover:border-gray-300 dark:hover:border-gray-700 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white px-2 rounded-none"
                />
              </div>
              <Button onClick={() => handleDeleteModule(mod.id!)} variant="ghost" className="h-8 w-8 p-0 text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <AnimatePresence>
              {expandedModules[mod.id!] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                >
                  <div className="p-4 pl-10 space-y-3">
                    {mod.lessons.map((lesson, lIndex) => (
                      <div key={lesson.id} className="flex flex-col sm:flex-row gap-4 p-3 border border-gray-100 dark:border-gray-900 items-start sm:items-center">
                        <div className="flex-1 flex flex-col gap-2 w-full">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-400">{mIndex + 1}.{lIndex + 1}</span>
                            <Input 
                              value={lesson.title}
                              onChange={(e) => setModules(modules.map(m => m.id === mod.id ? { ...m, lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, title: e.target.value } : l) } : m))}
                              onBlur={(e) => handleUpdateLesson(mod.id!, lesson.id!, { title: e.target.value })}
                              className="h-8 text-sm bg-transparent border-transparent hover:border-gray-200 dark:hover:border-gray-800 px-1 rounded-none flex-1"
                            />
                            <Button onClick={() => handleDeleteLesson(mod.id!, lesson.id!)} variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-3 pl-6 mt-2">
                            {lesson.videoUrl ? (
                              <div className="flex flex-col gap-2">
                                <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                                  <Video className="w-3 h-3" /> Ver Video Completo
                                </a>
                                <video 
                                  src={lesson.videoUrl} 
                                  poster={lesson.thumbnailUrl}
                                  controls 
                                  controlsList="nodownload"
                                  className="w-48 h-28 bg-black rounded object-contain border border-gray-200 dark:border-gray-800" 
                                />
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                <Video className="w-3 h-3" /> Sin video
                              </span>
                            )}
                            
                            <div className="flex flex-col justify-start gap-2 h-full pt-6">
                              <label className={`cursor-pointer text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 px-2 py-1 border transition-colors ${uploadingLessons[lesson.id!] ? 'text-gray-400 border-gray-200 dark:border-gray-800' : 'text-black dark:text-white border-black dark:border-white hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
                                <UploadCloud className="w-3 h-3" />
                                {uploadingLessons[lesson.id!] ? 'Subiendo...' : 'Subir MP4'}
                                <input 
                                  type="file" 
                                  accept="video/mp4" 
                                  className="hidden" 
                                  disabled={uploadingLessons[lesson.id!]}
                                  onChange={(e) => e.target.files?.[0] && handleVideoUpload(mod.id!, lesson.id!, e.target.files[0])}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button onClick={() => handleAddLesson(mod.id!)} variant="ghost" className="h-8 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white mt-2 px-2">
                      <Plus className="w-3 h-3 mr-1" /> Agregar Lección
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {modules.length === 0 && (
          <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 text-xs">
            Comienza agregando el primer módulo para estructurar tu curso.
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteState.type !== null}
        onClose={() => setDeleteState({ type: null })}
        onConfirm={() => {
          if (deleteState.type === 'module' && deleteState.moduleId !== undefined) {
             confirmDeleteModule(deleteState.moduleId);
          } else if (deleteState.type === 'lesson' && deleteState.moduleId !== undefined && deleteState.lessonId !== undefined) {
             confirmDeleteLesson(deleteState.moduleId, deleteState.lessonId);
          }
          setDeleteState({ type: null });
        }}
        title={deleteState.type === 'module' ? "Eliminar Módulo" : "Eliminar Lección"}
        message={deleteState.type === 'module' 
          ? "¿Estás seguro de eliminar este módulo y todas sus lecciones? Esta acción no se puede deshacer." 
          : "¿Estás seguro de eliminar esta lección? Esta acción no se puede deshacer."}
      />
    </div>
  );
}
