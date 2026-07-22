"use client";
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/no-giant-component */

import React, { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical,
  UploadCloud,
  Video,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  Copy,
  Save,
  Trash2,
  Camera,
  Globe,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GalleryUploadManager } from "@/components/ui/gallery/GalleryUploadManager";
import { BeforeAfterUploader } from "@/components/ui/gallery/BeforeAfterUploader";
import { cn } from "@/lib/utils";
import { UI_Service, CancellationPolicy } from "@/types/catalog";

interface ServiceItemCardProps {
  service: UI_Service;
  index: number;
  onUpdate: (id: number, updates: Partial<UI_Service>) => void;
  onSave: (service: UI_Service) => void;
  onDelete: (id: number) => void;
  onDuplicate?: (service: UI_Service) => void;
  onImageUpload?: (id: number, file: File) => void;
}

export function ServiceItemCard({
  service,
  index,
  onUpdate,
  onSave,
  onDelete,
  onDuplicate,
  onImageUpload,
}: ServiceItemCardProps) {
  const t = useTranslations("Marketplace.services");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(service.id, file);
    }
  };

  // Validaciones
  const isValid =
    service.name &&
    service.category &&
    (service.requiresEvaluation || service.price > 0) &&
    service.duration > 0;

  const getPriceWarning = (price: number) => {
    if (price < 200)
      return {
        level: "low",
        message: t("price_warning_low", {
          defaultValue: "Precio inusualmente bajo",
        }),
      };
    if (price > 5000)
      return {
        level: "high",
        message: t("price_warning_high", {
          defaultValue: "Precio sobre el promedio",
        }),
      };
    return null;
  };

  const priceWarning = getPriceWarning(service.price);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col border transition-colors rounded-3xl overflow-hidden shadow-sm",
        service.isNew || service.hasUnsavedChanges
          ? "border-amber-200 dark:border-amber-900/30 bg-white dark:bg-[#0a0a0a] ring-1 ring-amber-500/20"
          : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-200 dark:hover:border-emerald-900/30",
      )}
    >
      {/* --- CABECERA DE LA TARJETA (BARRA DE CONTROL) --- */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50">
        <div className="flex items-center gap-4">
          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <GripVertical className="w-5 h-5" strokeWidth={2} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full text-gray-700 dark:text-gray-300 shadow-sm">
              S-{(index + 1).toString().padStart(3, "0")}
            </span>

            {(service.isNew || service.hasUnsavedChanges) && (
              <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                {t("unsaved_changes", { defaultValue: "Sin guardar" })}
              </span>
            )}
            {!isValid && (
              <span className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border border-red-100 dark:border-red-900/50">
                {t("incomplete", { defaultValue: "Datos incompletos" })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- MATRIZ DEL FORMULARIO PRINCIPAL --- */}
      <div className="flex flex-col md:flex-row">
        {/* Celda: Subida de Imagen */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 w-full md:w-72 bg-gray-50/30 dark:bg-black/20">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">
            {t("image_label", { defaultValue: "Portada del Servicio" })}
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "w-full h-48 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer group relative rounded-2xl shadow-sm",
              service.imageUrl
                ? "border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#050505]"
                : "border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10",
              isDragging &&
                "border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 scale-[1.02]",
            )}
          >
            {service.imageUrl ? (
              <>
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:opacity-60 transition-opacity duration-300 mix-blend-multiply dark:mix-blend-screen"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <span className="text-sm font-semibold text-white bg-black/60 px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Cambiar foto
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#0a0a0a] flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:border-emerald-500 transition-colors mb-3 shadow-sm">
                  <UploadCloud
                    className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors"
                    strokeWidth={2}
                  />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-1 group-hover:text-emerald-600 transition-colors">
                  Subir imagen
                </span>
                <span className="text-xs text-gray-500 font-medium text-center px-4 leading-relaxed">
                  Arrastra o haz clic<br />(JPG, PNG, WEBP)
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onImageUpload) {
                onImageUpload(service.id, file);
              }
              e.target.value = "";
            }}
          />
        </div>

        {/* Celda: Inputs Centrales */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row border-b border-gray-100 dark:border-gray-800">
            <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                {t("name_label", { defaultValue: "Nombre del Servicio" })}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                value={service.name}
                onChange={(e) =>
                  onUpdate(service.id, {
                    name: e.target.value,
                    hasUnsavedChanges: true,
                  })
                }
                placeholder="Ej. Consulta Dermatológica"
                className={cn(
                  "w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors placeholder:text-gray-400 placeholder:font-normal",
                  !service.name && "border-red-300 dark:border-red-900/50",
                )}
              />
            </div>

            <div className="flex-1 p-6">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                {t("category_label", { defaultValue: "Clasificación / Especialidad" })}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                value={service.category || ""}
                onChange={(e) =>
                  onUpdate(service.id, {
                    category: e.target.value,
                    hasUnsavedChanges: true,
                  })
                }
                placeholder="Ej. Dermatología"
                className={cn(
                  "w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors placeholder:text-gray-400 placeholder:font-normal",
                  !service.category && "border-red-300 dark:border-red-900/50",
                )}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row border-b border-gray-100 dark:border-gray-800">
            <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>
                  {t("price_label", { defaultValue: "Valor Comercial" })}{" "}
                  <span className="text-red-500">*</span>
                </span>
                {priceWarning && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle
                          className={cn(
                            "w-4 h-4",
                            priceWarning.level === "low"
                              ? "text-amber-500"
                              : "text-blue-500",
                          )}
                          strokeWidth={2}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-semibold rounded-xl border-none shadow-lg px-3 py-2">
                        {priceWarning.message}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={service.requiresEvaluation ? 0 : service.price || ""}
                  onChange={(e) =>
                    onUpdate(service.id, {
                      price: Number(e.target.value),
                      hasUnsavedChanges: true,
                    })
                  }
                  disabled={service.requiresEvaluation}
                  className={cn(
                    "w-full h-12 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors",
                    !service.requiresEvaluation &&
                      (!service.price || service.price <= 0) &&
                      "border-red-300 dark:border-red-900/50",
                    service.requiresEvaluation &&
                      "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#111]",
                  )}
                />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`req-eval-${service.id}`}
                  checked={!!service.requiresEvaluation}
                  onChange={(e) =>
                    onUpdate(service.id, {
                      requiresEvaluation: e.target.checked,
                      price: e.target.checked ? 0 : service.price,
                      hasUnsavedChanges: true,
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-[#050505] cursor-pointer"
                />
                <label
                  htmlFor={`req-eval-${service.id}`}
                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                >
                  {t("requires_evaluation", {
                    defaultValue: "Requiere valoración / Precio a convenir",
                  })}
                </label>
              </div>
            </div>

            <div className="flex-1 p-6">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                {t("duration_label", { defaultValue: "Tiempo Estimado" })}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={service.duration || ""}
                  onChange={(e) =>
                    onUpdate(service.id, {
                      duration: Number(e.target.value),
                      hasUnsavedChanges: true,
                    })
                  }
                  className={cn(
                    "w-full h-12 pl-9 pr-12 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors",
                    (!service.duration || service.duration <= 0) &&
                      "border-red-300 dark:border-red-900/50",
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">
                  MIN
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
              {t("desc_label", { defaultValue: "Descripción para el paciente" })}
            </label>
            <textarea
              value={service.description}
              onChange={(e) =>
                onUpdate(service.id, {
                  description: e.target.value.slice(0, 300),
                  hasUnsavedChanges: true,
                })
              }
              placeholder={t("desc_placeholder", {
                defaultValue: "Explica brevemente qué incluye y los beneficios...",
              })}
              rows={3}
              maxLength={300}
              className="w-full min-h-[80px] p-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors resize-y placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>
        </div>
      </div>

      {/* --- CONFIGURACIONES AVANZADAS (FOOTER MATRIZ) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50">
        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
            {t("delivery_type", { defaultValue: "Modalidad" })}
          </label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] shadow-sm">
            <button
              onClick={() =>
                onUpdate(service.id, {
                  serviceDeliveryType: "in_person",
                  hasUnsavedChanges: true,
                })
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-10 border-r border-gray-200 dark:border-gray-700 text-xs font-bold transition-colors",
                service.serviceDeliveryType === "in_person"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111]",
              )}
            >
              <MapPin className="w-3.5 h-3.5" strokeWidth={2} /> Presencial
            </button>
            <button
              onClick={() =>
                onUpdate(service.id, {
                  serviceDeliveryType: "hybrid",
                  hasUnsavedChanges: true,
                })
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-10 border-r border-gray-200 dark:border-gray-700 text-xs font-bold transition-colors",
                service.serviceDeliveryType === "hybrid"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111]",
              )}
            >
              <Globe className="w-3.5 h-3.5" strokeWidth={2} /> Híbrido
            </button>
            <button
              onClick={() =>
                onUpdate(service.id, {
                  serviceDeliveryType: "video_call",
                  hasUnsavedChanges: true,
                })
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-10 text-xs font-bold transition-colors",
                service.serviceDeliveryType === "video_call"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111]",
              )}
            >
              <Video className="w-3.5 h-3.5" strokeWidth={2} /> Remoto
            </button>
          </div>
        </div>

        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
            {t("cancellation", { defaultValue: "Reglas de Anulación" })}
          </label>
          <Select
            value={service.cancellationPolicy}
            onValueChange={(val) =>
              onUpdate(service.id, {
                cancellationPolicy: val as CancellationPolicy,
                hasUnsavedChanges: true,
              })
            }
          >
            <SelectTrigger className="w-full h-10 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:ring-0 focus:border-emerald-500 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg">
              <SelectItem value="flexible" className="text-sm font-medium rounded-lg">
                Flexible
              </SelectItem>
              <SelectItem value="moderate" className="text-sm font-medium rounded-lg">
                Moderada
              </SelectItem>
              <SelectItem value="strict" className="text-sm font-medium rounded-lg">
                Estricta
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-6 flex flex-col justify-center relative">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
            {t("follow_up", { defaultValue: "Días de Seguimiento" })}
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0"
              value={service.followUpPeriodDays || ""}
              onChange={(e) =>
                onUpdate(service.id, {
                  followUpPeriodDays: parseInt(e.target.value) || undefined,
                  hasUnsavedChanges: true,
                })
              }
              className="w-full h-10 pl-4 pr-12 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors shadow-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">
              DÍAS
            </span>
          </div>
        </div>
      </div>

      {/* --- GALERÍAS DEL SERVICIO (Sólo si ya está guardado) --- */}
      {!service.isNew && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0 shadow-sm">
              <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Galería del Servicio
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Muestra resultados, técnicas o tu espacio de trabajo.
              </p>
            </div>
          </div>

          <div className="space-y-12">
            <GalleryUploadManager
              galleryType="SERVICE_WORK"
              catalogItemId={service.id}
              title="Fotos del Procedimiento"
              description="Añade fotos o videos cortos sobre cómo realizas este servicio."
              maxImages={5}
            />

            <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
              <BeforeAfterUploader catalogItemId={service.id} />
            </div>
          </div>
        </div>
      )}

      {/* --- ACCIONES PRINCIPALES (FOOTER) --- */}
      <div className="flex flex-col sm:flex-row border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50 p-4 gap-4">
        <div className="flex gap-4 flex-1">
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(service)}
              className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-semibold shadow-sm"
            >
              <Copy className="w-4 h-4" strokeWidth={2} />
              <span>{t("duplicate", { defaultValue: "Duplicar" })}</span>
            </button>
          )}

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/30 bg-white dark:bg-[#0a0a0a] text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-semibold shadow-sm"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
            <span>{t("delete", { defaultValue: "Eliminar" })}</span>
          </button>
        </div>

        <button
          onClick={() => onSave(service)}
          disabled={!isValid || (!service.hasUnsavedChanges && !service.isNew)}
          className="flex-1 sm:flex-auto sm:w-1/3 h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" strokeWidth={2} />
          {t("save", { defaultValue: "Guardar Servicio" })}
        </button>
      </div>

      {/* Soft Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-0 overflow-hidden shadow-2xl sm:max-w-md [&>button]:hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
            <AlertDialogHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/30">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={2} />
                </div>
                <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {t("delete_confirm_title", {
                    defaultValue: "Eliminar Servicio",
                  })}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-sm text-gray-500 font-medium leading-relaxed text-left">
                {t("delete_confirm_message", {
                  defaultValue:
                    "¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer y se borrarán sus imágenes.",
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="p-6 bg-gray-50 dark:bg-[#050505] flex flex-row gap-3 sm:space-x-0 border-none">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors shadow-sm"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onDelete(service.id);
                setIsDeleteModalOpen(false);
              }}
              className="flex-1 h-12 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
            >
              Sí, eliminar
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
