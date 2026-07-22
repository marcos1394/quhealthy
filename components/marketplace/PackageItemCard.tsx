"use client";
/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, Sparkles, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { UI_Package } from "@/types/catalog";
import { UI_Service } from "@/types/catalog";
import { GalleryUploadManager } from "@/components/ui/gallery/GalleryUploadManager";
import { BeforeAfterUploader } from "@/components/ui/gallery/BeforeAfterUploader";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface PackageItemCardProps {
  pkg: UI_Package;
  availableServices: UI_Service[];
  onEdit: (pkg: UI_Package) => void;
  onDelete: (id: number) => void;
}

export function PackageItemCard({
  pkg,
  availableServices,
  onEdit,
  onDelete,
}: PackageItemCardProps) {
  const t = useTranslations("Marketplace.packages");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Helpers de cálculo
  const realVal = (pkg.packageItems || []).reduce((sum, item) => {
    const s = availableServices.find((srv) => srv.id === item.id);
    return sum + (s ? s.price * item.quantity : 0);
  }, 0);

  const savingsAmt = Math.max(0, realVal - pkg.price);
  const savingsPerc =
    realVal > 0 ? Math.round((savingsAmt / realVal) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 rounded-none transition-colors hover:border-black dark:hover:border-white"
    >
      {/* --- CABECERA (DATOS Y COMANDOS) --- */}
      <div className="p-6 border-b border-black/10 dark:border-white/10 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
              {pkg.name}
            </h3>
            {savingsAmt > 0 && (
              <span className="border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                {savingsPerc}% AHORRO
              </span>
            )}
          </div>

          {/* Controles de Acción */}
          <div className="flex border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] shrink-0">
            <button
              onClick={() => onEdit(pkg)}
              className="w-10 h-10 flex items-center justify-center border-r border-black/20 dark:border-white/20 text-gray-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              title={t("edit_btn", { defaultValue: "EDITAR PAQUETE" })}
            >
              <Edit2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/10 transition-colors"
              title={t("delete_btn", { defaultValue: "ELIMINAR PAQUETE" })}
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 line-clamp-2 leading-relaxed">
          {pkg.description || "PAQUETE PERSONALIZADO DE SERVICIOS CLÍNICOS."}
        </p>
      </div>

      {/* --- INVENTARIO DE SERVICIOS (CHIPS TÉCNICOS) --- */}
      <div className="p-6 flex-1 flex flex-col bg-white dark:bg-[#0a0a0a]">
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">
          CONTENIDO DEL ENSAMBLE
        </span>
        <div className="flex flex-wrap gap-2 content-start">
          {(pkg.packageItems || []).map((item) => {
            const s = availableServices.find(
              (service) => service.id === item.id,
            );
            return s && item.quantity > 0 ? (
              <span
                key={item.id}
                className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 px-2.5 py-1.5 flex items-center gap-1.5"
              >
                <div className="w-4 h-4 flex items-center justify-center bg-gray-200 dark:bg-[#1a1a1a] rounded-sm text-[8px] font-bold">
                  {item.quantity}x
                </div>
                {s.name}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {/* --- BOTÓN PARA TOGGLE DE GALERÍAS --- */}
      <div className="p-4 border-t border-black/10 dark:border-white/10 flex justify-center bg-gray-50/50 dark:bg-[#080808]">
        <button
          onClick={() => setIsGalleryOpen(!isGalleryOpen)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:text-gray-500 transition-colors"
        >
          <Camera className="w-4 h-4" strokeWidth={1.5} />
          {isGalleryOpen ? "OCULTAR GALERÍAS" : "GESTIONAR GALERÍAS (OPCIONAL)"}
        </button>
      </div>

      {/* --- GALERÍAS DEL PAQUETE (TOGGLEABLE) --- */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-black/10 dark:border-white/10 bg-gray-50/50 dark:bg-[#080808]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
                  <Camera
                    className="w-4 h-4 text-black dark:text-white"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                    Galería del Paquete
                  </h3>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                    Muestra resultados integrales
                  </p>
                </div>
              </div>

              <div className="space-y-12">
                <GalleryUploadManager
                  galleryType="SERVICE_WORK"
                  catalogItemId={pkg.id}
                  title="Fotos del Resultado"
                  description="Añade fotos sobre los resultados que incluye este paquete."
                  maxImages={5}
                />

                <div className="border-t border-black/10 dark:border-white/10 pt-8">
                  <BeforeAfterUploader catalogItemId={pkg.id} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOTALES (FOOTER DE PRECIOS) --- */}
      <div className="p-6 bg-gray-50 dark:bg-[#050505] border-t border-black/10 dark:border-white/10 flex items-end justify-between shrink-0">
        <div className="flex flex-col">
          {savingsAmt > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-gray-400 line-through font-mono font-bold tracking-widest">
                ${realVal}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                BENEFICIO: ${savingsAmt}
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-semibold tracking-tight text-black dark:text-white leading-none">
              ${pkg.price}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
              MXN
            </span>
          </div>
        </div>

        <span className="text-[9px] font-bold uppercase tracking-widest border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] px-2 py-1 text-gray-600 dark:text-gray-400">
          {(pkg.packageItems || []).reduce((acc, i) => acc + i.quantity, 0)}{" "}
          {(pkg.packageItems || []).reduce((acc, i) => acc + i.quantity, 0) ===
          1
            ? "ITEM"
            : "ITEMS"}
        </span>
      </div>

      {/* Brutalist Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none p-0 overflow-hidden shadow-2xl sm:max-w-md [&>button]:hidden">
          <div className="p-6 md:p-8 border-b border-black/20 dark:border-white/20">
            <AlertDialogHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-red-500 flex items-center justify-center bg-red-50 dark:bg-red-900/10 shrink-0">
                  <Trash2 className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                </div>
                <AlertDialogTitle className="text-sm font-bold uppercase tracking-widest text-black dark:text-white leading-none mt-1">
                  {t("delete_confirm_title", {
                    defaultValue: "ANULAR PAQUETE",
                  })}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs text-gray-500 uppercase tracking-widest leading-relaxed text-left font-semibold">
                {t("delete_confirm_message", {
                  defaultValue:
                    "¿Confirma la eliminación permanente de este paquete? Esta acción no se puede deshacer.",
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="p-0 bg-gray-50 dark:bg-[#050505] flex flex-row sm:flex-row gap-0 sm:space-x-0 border-none">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 h-14 border-r border-black/20 dark:border-white/20 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              CANCELAR
            </button>
            <button
              onClick={() => {
                onDelete(pkg.id);
                setIsDeleteModalOpen(false);
              }}
              className="flex-1 h-14 text-[9px] font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              SÍ, ELIMINAR
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
