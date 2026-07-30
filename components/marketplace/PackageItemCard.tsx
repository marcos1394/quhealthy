"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, Sparkles, Camera } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { UI_Package, UI_Service } from "@/types/catalog";
import { GalleryUploadManager } from "@/components/ui/gallery/GalleryUploadManager";
import { BeforeAfterUploader } from "@/components/ui/gallery/BeforeAfterUploader";

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

  // Helpers de cálculo de valor real y ahorro
  const realVal = (pkg.packageItems || []).reduce((sum, item) => {
    const s = availableServices.find((srv) => srv.id === item.id);
    return sum + (s ? s.price * item.quantity : 0);
  }, 0);

  const savingsAmt = Math.max(0, realVal - pkg.price);
  const savingsPerc =
    realVal > 0 ? Math.round((savingsAmt / realVal) * 100) : 0;

  const totalServicesCount = (pkg.packageItems || []).reduce(
    (acc, i) => acc + i.quantity,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl transition-all hover:border-emerald-500/30 overflow-hidden shadow-2xs font-sans select-none"
    >
      {/* ── CABECERA DE DATOS Y ACCIONES ────────────────────────────── */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-3 bg-gray-50/60 dark:bg-[#050505]">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight truncate">
              {pkg.name}
            </h3>

            {savingsAmt > 0 && (
              <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 text-[11px] font-bold rounded-full flex items-center gap-1.5 w-fit shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{t("savings_percent", { percent: savingsPerc })}</span>
              </span>
            )}
          </div>

          {/* Controles de Acción */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(pkg)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-2xs cursor-pointer"
              title={t("edit_btn")}
            >
              <Edit2 className="w-4 h-4" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shadow-2xs cursor-pointer"
              title={t("delete_btn")}
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {pkg.description || t("default_desc")}
        </p>
      </div>

      {/* ── INVENTARIO DE SERVICIOS (CHIPS) ─────────────────────────── */}
      <div className="p-6 flex-1 flex flex-col bg-white dark:bg-[#0a0a0a] space-y-3">
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-tight">
          {t("package_content")}
        </span>

        <div className="flex flex-wrap gap-2 content-start">
          {(pkg.packageItems || []).map((item) => {
            const s = availableServices.find(
              (service) => service.id === item.id
            );
            return s && item.quantity > 0 ? (
              <span
                key={item.id}
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-2xs"
              >
                <span className="flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg px-2 py-0.5 text-[10px] font-bold font-mono text-gray-800 dark:text-gray-200">
                  {item.quantity}x
                </span>
                <span>{s.name}</span>
              </span>
            ) : null;
          })}
        </div>
      </div>

      {/* ── BOTÓN TOGGLE DE GALERÍAS ─────────────────────────────────── */}
      <div className="p-3.5 border-t border-gray-100 dark:border-gray-800 flex justify-center bg-gray-50/40 dark:bg-[#050505]">
        <button
          type="button"
          onClick={() => setIsGalleryOpen(!isGalleryOpen)}
          className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl shadow-2xs cursor-pointer"
        >
          <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>
            {isGalleryOpen ? t("hide_galleries") : t("manage_galleries")}
          </span>
        </button>
      </div>

      {/* ── GALERÍAS DEL PAQUETE (ACORDEÓN) ─────────────────────────── */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-8">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
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
                  catalogItemId={pkg.id}
                  title={t("result_photos_title")}
                  description={t("result_photos_desc")}
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

      {/* ── FOOTER DE PRECIOS Y TOTALES ──────────────────────────────── */}
      <div className="p-6 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex items-end justify-between shrink-0">
        <div className="flex flex-col space-y-0.5">
          {savingsAmt > 0 && (
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono font-semibold text-gray-400 line-through">
                ${realVal}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {t("savings_amount", { amount: savingsAmt })}
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-black text-gray-900 dark:text-white tracking-tight leading-none">
              ${pkg.price}
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase">
              MXN
            </span>
          </div>
        </div>

        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl shadow-2xs font-mono">
          {t("services_count", { count: totalServicesCount })}
        </span>
      </div>

      {/* ── MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ───────────────────── */}
      <AlertDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      >
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
                onDelete(pkg.id);
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