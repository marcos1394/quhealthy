"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable @next/next/no-img-element */

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
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

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
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
        message: t("price_warning_low"),
      };
    if (price > 5000)
      return {
        level: "high",
        message: t("price_warning_high"),
      };
    return null;
  };

  const priceWarning = getPriceWarning(service.price);
  const formattedCode = (index + 1).toString().padStart(3, "0");

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex flex-col border transition-all rounded-3xl overflow-hidden shadow-2xs font-sans select-none",
        service.isNew || service.hasUnsavedChanges
          ? "border-amber-300 dark:border-amber-800/80 bg-white dark:bg-[#0a0a0a] ring-1 ring-amber-500/20"
          : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-500/30"
      )}
    >
      {/* ── CABECERA DE LA TARJETA (BARRA DE CONTROL) ────────────────── */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505]">
        <div className="flex items-center gap-3">
          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <GripVertical className="w-4 h-4" strokeWidth={2} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold font-mono bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 px-3 py-0.5 rounded-full text-gray-700 dark:text-gray-300 shadow-2xs">
              {t("service_code", { code: formattedCode })}
            </span>

            {(service.isNew || service.hasUnsavedChanges) && (
              <span className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                <span>{t("unsaved_changes")}</span>
              </span>
            )}

            {!isValid && (
              <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                <span>{t("incomplete")}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── MATRIZ DE CONFIGURACIÓN PRINCIPAL ───────────────────────── */}
      <div className="flex flex-col md:flex-row">
        {/* Celda: Subida de Imagen */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 w-full md:w-72 bg-gray-50/40 dark:bg-[#050505]">
          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block mb-3">
            {t("image_label")}
          </label>

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "w-full h-48 flex flex-col items-center justify-center overflow-hidden transition-all duration-200 cursor-pointer group relative rounded-2xl shadow-2xs",
              service.imageUrl
                ? "border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                : "border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-500/50 hover:bg-emerald-50/20",
              isDragging && "border-emerald-500 bg-emerald-50/30 scale-[1.01]"
            )}
          >
            {service.imageUrl ? (
              <>
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/60 backdrop-blur-2xs">
                  <span className="text-xs font-bold text-white bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-2xs">
                    <Camera className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{t("change_photo")}</span>
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center p-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shadow-2xs">
                  <UploadCloud className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {t("upload_photo")}
                </span>
                <span className="text-[11px] font-medium text-gray-400 leading-relaxed whitespace-pre-line">
                  {t("drag_drop_hint")}
                </span>
              </div>
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

        {/* Celda: Campos Principales */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row border-b border-gray-100 dark:border-gray-800">
            {/* Nombre */}
            <div className="flex-1 p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("name_label")} <span className="text-rose-500">*</span>
              </label>
              <input
                value={service.name}
                onChange={(e) =>
                  onUpdate(service.id, {
                    name: e.target.value,
                    hasUnsavedChanges: true,
                  })
                }
                placeholder={t("name_placeholder")}
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal",
                  !service.name && "border-rose-200 dark:border-rose-900/50"
                )}
              />
            </div>

            {/* Categoría */}
            <div className="flex-1 p-5 sm:p-6 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("category_label")} <span className="text-rose-500">*</span>
              </label>
              <input
                value={service.category || ""}
                onChange={(e) =>
                  onUpdate(service.id, {
                    category: e.target.value,
                    hasUnsavedChanges: true,
                  })
                }
                placeholder={t("category_placeholder")}
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal",
                  !service.category && "border-rose-200 dark:border-rose-900/50"
                )}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row border-b border-gray-100 dark:border-gray-800">
            {/* Precio & Check Valoración */}
            <div className="flex-1 p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("price_label")} <span className="text-rose-500">*</span>
                </label>

                {priceWarning && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="cursor-help">
                          <AlertCircle
                            className={cn(
                              "w-4 h-4",
                              priceWarning.level === "low"
                                ? "text-amber-500"
                                : "text-sky-500"
                            )}
                            strokeWidth={2}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-white dark:bg-[#0a0a0a] dark:text-white text-xs font-semibold rounded-xl border border-gray-800 shadow-xl px-3 py-1.5">
                        {priceWarning.message}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <div className="relative">
                <DollarSign
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
                    "w-full h-11 pl-9 pr-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs",
                    !service.requiresEvaluation &&
                      (!service.price || service.price <= 0) &&
                      "border-rose-200 dark:border-rose-900/50",
                    service.requiresEvaluation &&
                      "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#111]"
                  )}
                />
              </div>

              <div className="pt-1 flex items-center gap-2">
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
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500 dark:bg-[#0a0a0a] cursor-pointer"
                />
                <label
                  htmlFor={`req-eval-${service.id}`}
                  className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                >
                  {t("requires_evaluation")}
                </label>
              </div>
            </div>

            {/* Duración */}
            <div className="flex-1 p-5 sm:p-6 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("duration_label")} <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <Clock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
                    "w-full h-11 pl-9 pr-12 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs",
                    (!service.duration || service.duration <= 0) &&
                      "border-rose-200 dark:border-rose-900/50"
                  )}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold font-mono text-gray-400 uppercase pointer-events-none">
                  {t("minutes_unit")}
                </span>
              </div>
            </div>
          </div>

          {/* Descripción Corta */}
          <div className="p-5 sm:p-6 space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
              {t("desc_label")}
            </label>
            <textarea
              value={service.description}
              onChange={(e) =>
                onUpdate(service.id, {
                  description: e.target.value.slice(0, 300),
                  hasUnsavedChanges: true,
                })
              }
              placeholder={t("desc_placeholder")}
              rows={3}
              maxLength={300}
              className="w-full min-h-[80px] p-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y placeholder:text-gray-400 placeholder:font-normal shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* ── MODALIDAD, CANCELACIÓN Y SEGUIMIENTO ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505]">
        {/* Modalidad */}
        <div className="p-5 sm:p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center space-y-2">
          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
            {t("delivery_type")}
          </label>

          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs">
            <button
              type="button"
              onClick={() =>
                onUpdate(service.id, {
                  serviceDeliveryType: "in_person",
                  hasUnsavedChanges: true,
                })
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-9 border-r border-gray-200 dark:border-gray-800 text-xs font-bold transition-all cursor-pointer",
                service.serviceDeliveryType === "in_person"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#111]"
              )}
            >
              <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t("delivery_in_person")}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdate(service.id, {
                  serviceDeliveryType: "hybrid",
                  hasUnsavedChanges: true,
                })
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-9 border-r border-gray-200 dark:border-gray-800 text-xs font-bold transition-all cursor-pointer",
                service.serviceDeliveryType === "hybrid"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#111]"
              )}
            >
              <Globe className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t("delivery_hybrid")}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdate(service.id, {
                  serviceDeliveryType: "video_call",
                  hasUnsavedChanges: true,
                })
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-9 text-xs font-bold transition-all cursor-pointer",
                service.serviceDeliveryType === "video_call"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#111]"
              )}
            >
              <Video className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t("delivery_remote")}</span>
            </button>
          </div>
        </div>

        {/* Reglas de Cancelación */}
        <div className="p-5 sm:p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center space-y-2">
          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
            {t("cancellation")}
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
            <SelectTrigger className="w-full h-9 px-3.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans text-xs">
              <SelectItem value="flexible" className="rounded-xl font-medium">
                {t("policy_flexible")}
              </SelectItem>
              <SelectItem value="moderate" className="rounded-xl font-medium">
                {t("policy_moderate")}
              </SelectItem>
              <SelectItem value="strict" className="rounded-xl font-medium">
                {t("policy_strict")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Días de Seguimiento */}
        <div className="p-5 sm:p-6 flex flex-col justify-center space-y-2">
          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
            {t("follow_up")}
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
              className="w-full h-9 pl-3.5 pr-12 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold font-mono text-gray-400 pointer-events-none">
              {t("days_unit")}
            </span>
          </div>
        </div>
      </div>

      {/* ── GALERÍAS DEL SERVICIO (Sólo si ya está guardado) ────────────── */}
      {!service.isNew && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-white dark:bg-[#0a0a0a] space-y-8">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-gray-50 dark:bg-[#050505] text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
              <Camera className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                {t("gallery_title")}
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("gallery_subtitle")}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <GalleryUploadManager
              galleryType="SERVICE_WORK"
              catalogItemId={service.id}
              title={t("procedure_photos_title")}
              description={t("procedure_photos_desc")}
              maxImages={5}
            />

            <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
              <BeforeAfterUploader catalogItemId={service.id} />
            </div>
          </div>
        </div>
      )}

      {/* ── ACCIONES PRINCIPALES (FOOTER DE COMANDOS) ────────────────── */}
      <div className="flex flex-col sm:flex-row border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] p-4 sm:p-5 gap-3">
        <div className="flex gap-2.5 flex-1">
          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(service)}
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs cursor-pointer"
            >
              <Copy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("duplicate")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-xs font-bold shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
            <span>{t("delete")}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSave(service)}
          disabled={!isValid || (!service.hasUnsavedChanges && !service.isNew)}
          className="flex-1 sm:flex-none sm:min-w-[200px] h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" strokeWidth={2} />
          <span>{t("save")}</span>
        </button>
      </div>

      {/* ── MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ───────────────────── */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-0 overflow-hidden shadow-2xl sm:max-w-md [&>button]:hidden font-sans">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
            <AlertDialogHeader className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-2xs">
                  <Trash2 className="w-6 h-6" strokeWidth={2} />
                </div>
                <AlertDialogTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("delete_confirm_title")}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed text-left">
                {t("delete_confirm_message")}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <AlertDialogFooter className="p-5 bg-gray-50/60 dark:bg-[#050505] flex flex-row gap-3 sm:space-x-0 border-none justify-end">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-2xs cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(service.id);
                setIsDeleteModalOpen(false);
              }}
              className="flex-1 h-11 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-xs cursor-pointer border-0"
            >
              {t("confirm_delete")}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}