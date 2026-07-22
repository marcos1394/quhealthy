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
import { Edit2, Trash2, Sparkles, Camera } from "lucide-react";
import { useTranslations } from "next-intl";

import { UI_Package } from "@/types/catalog";
import { UI_Service } from "@/types/catalog";
import { GalleryUploadManager } from "@/components/ui/gallery/GalleryUploadManager";
import { BeforeAfterUploader } from "@/components/ui/gallery/BeforeAfterUploader";
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
      className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl transition-colors hover:border-emerald-200 dark:hover:border-emerald-900/30 overflow-hidden shadow-sm"
    >
      {/* --- CABECERA (DATOS Y COMANDOS) --- */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4 bg-gray-50/50 dark:bg-[#050505]/50">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
              {pkg.name}
            </h3>
            {savingsAmt > 0 && (
              <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 w-fit shadow-sm">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                {savingsPerc}% de ahorro
              </span>
            )}
          </div>

          {/* Controles de Acción */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEdit(pkg)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#111] dark:hover:text-white transition-colors shadow-sm"
              title={t("edit_btn", { defaultValue: "Editar Paquete" })}
            >
              <Edit2 className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/10 transition-colors shadow-sm"
              title={t("delete_btn", { defaultValue: "Eliminar Paquete" })}
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        <p className="text-sm font-medium text-gray-500 line-clamp-2 leading-relaxed">
          {pkg.description || "Paquete personalizado de servicios clínicos."}
        </p>
      </div>

      {/* --- INVENTARIO DE SERVICIOS (CHIPS TÉCNICOS) --- */}
      <div className="p-6 flex-1 flex flex-col bg-white dark:bg-[#0a0a0a]">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
          Contenido del Paquete
        </span>
        <div className="flex flex-wrap gap-2 content-start">
          {(pkg.packageItems || []).map((item) => {
            const s = availableServices.find(
              (service) => service.id === item.id,
            );
            return s && item.quantity > 0 ? (
              <span
                key={item.id}
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm"
              >
                <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                  {item.quantity}x
                </div>
                {s.name}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {/* --- BOTÓN PARA TOGGLE DE GALERÍAS --- */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-center bg-gray-50/50 dark:bg-[#050505]/50">
        <button
          onClick={() => setIsGalleryOpen(!isGalleryOpen)}
          className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl shadow-sm"
        >
          <Camera className="w-4 h-4" strokeWidth={2} />
          {isGalleryOpen ? "Ocultar Galerías" : "Gestionar Galerías (Opcional)"}
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
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0 shadow-sm">
                  <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Galería del Paquete
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Muestra resultados integrales y transformaciones.
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

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                  <BeforeAfterUploader catalogItemId={pkg.id} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOTALES (FOOTER DE PRECIOS) --- */}
      <div className="p-6 bg-gray-50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex items-end justify-between shrink-0">
        <div className="flex flex-col">
          {savingsAmt > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400 line-through font-mono font-medium">
                ${realVal}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Ahorras ${savingsAmt}
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
              ${pkg.price}
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase">
              MXN
            </span>
          </div>
        </div>

        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl shadow-sm">
          {(pkg.packageItems || []).reduce((acc, i) => acc + i.quantity, 0)}{" "}
          {(pkg.packageItems || []).reduce((acc, i) => acc + i.quantity, 0) ===
          1
            ? "Servicio"
            : "Servicios"}
        </span>
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
                    defaultValue: "Eliminar Paquete",
                  })}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-sm text-gray-500 font-medium leading-relaxed text-left">
                {t("delete_confirm_message", {
                  defaultValue:
                    "¿Estás seguro de que deseas eliminar este paquete? Esta acción no se puede deshacer.",
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
                onDelete(pkg.id);
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
