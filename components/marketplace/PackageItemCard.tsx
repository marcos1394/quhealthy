"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Trash2,
  Sparkles,
  Camera,
  BriefcaseMedical,
  ShoppingBag,
  GraduationCap,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  UI_Package,
  UI_Service,
  UI_Product,
  UI_Course,
} from "@/types/catalog";
import { GalleryUploadManager } from "@/components/ui/gallery/GalleryUploadManager";
import { BeforeAfterUploader } from "@/components/ui/gallery/BeforeAfterUploader";
import { cn } from "@/lib/utils";

interface PackageItemCardProps {
  pkg: UI_Package;
  availableServices?: UI_Service[];
  availableProducts?: UI_Product[];
  availableCourses?: UI_Course[];
  onEdit: (pkg: UI_Package) => void;
  onDelete: (id: number) => void;
}

export function PackageItemCard({
  pkg,
  availableServices = [],
  availableProducts = [],
  availableCourses = [],
  onEdit,
  onDelete,
}: PackageItemCardProps) {
  const t = useTranslations("Marketplace.packages");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Lista unificada para resolver precios y nombres reales de todos los tipos de items
  const allAvailableItems = useMemo(() => {
    const list: { id: number; name: string; price: number; type: string }[] = [];
    (availableServices || []).forEach((s) =>
      list.push({ id: s.id, name: s.name, price: s.price, type: "SERVICE" })
    );
    (availableProducts || []).forEach((p) =>
      list.push({ id: p.id, name: p.name, price: p.price, type: "PRODUCT" })
    );
    (availableCourses || []).forEach((c) =>
      list.push({ id: c.id, name: c.name, price: c.price, type: "COURSE" })
    );
    return list;
  }, [availableServices, availableProducts, availableCourses]);

  // Helpers de cálculo de valor real y ahorro
  const realVal = (pkg.packageItems || []).reduce((sum, item) => {
    const matched = allAvailableItems.find((it) => it.id === item.id);
    const unitPrice = matched ? matched.price : item.price || 0;
    return sum + unitPrice * item.quantity;
  }, 0);

  const savingsAmt = Math.max(0, realVal - pkg.price);
  const savingsPerc =
    realVal > 0 ? Math.round((savingsAmt / realVal) * 100) : 0;

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

      {/* ── INVENTARIO DE ELEMENTOS (CHIPS COMBINADOS) ─────────────────────────── */}
      <div className="p-6 flex-1 flex flex-col bg-white dark:bg-[#0a0a0a] space-y-3">
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-tight">
          {t("package_content")}
        </span>

        <div className="flex flex-wrap gap-2 content-start">
          {(pkg.packageItems || []).map((item) => {
            const matched = allAvailableItems.find((it) => it.id === item.id);
            const name = matched?.name || item.name;
            const type = item.type || matched?.type || "SERVICE";
            if (item.quantity <= 0) return null;

            const TypeIcon =
              type === "PRODUCT"
                ? ShoppingBag
                : type === "COURSE"
                ? GraduationCap
                : BriefcaseMedical;

            const chipColor =
              type === "PRODUCT"
                ? "bg-sky-50/70 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/50"
                : type === "COURSE"
                ? "bg-purple-50/70 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/50"
                : "bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50";

            return (
              <span
                key={item.id}
                className={cn(
                  "text-xs font-semibold border rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-2xs",
                  chipColor
                )}
              >
                <span className="flex items-center justify-center bg-black/5 dark:bg-white/10 rounded-lg px-2 py-0.5 text-[10px] font-bold font-mono">
                  {item.quantity}x
                </span>
                <TypeIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate max-w-[180px]">{name}</span>
              </span>
            );
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
                {/* 1. Módulo: Fotos de Resultados Clínicos */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("result_photos_title")}
                  </h4>
                  <GalleryUploadManager
                    galleryType="SERVICE_WORK"
                    catalogItemId={pkg.id}
                    title={t("result_photos_title")}
                    description={t("gallery_subtitle")}
                    maxImages={5}
                  />
                </div>

                {/* 2. Módulo: Casos Antes / Después */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("before_after_title")}
                  </h4>
                  <BeforeAfterUploader catalogItemId={pkg.id} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER DE PRECIOS ────────────────────────────────────────── */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-[#050505] flex items-center justify-between">
        <div className="flex flex-col space-y-0.5">
          <span className="text-[11px] font-bold text-gray-400">
            {t("real_value")}
          </span>
          <span className="text-xs font-mono font-bold text-gray-400 line-through">
            ${realVal}
          </span>
        </div>

        <div className="flex flex-col items-end space-y-0.5">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {t("manual_price")}
          </span>
          <span className="text-lg sm:text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            ${pkg.price}
          </span>
        </div>
      </div>

      {/* ── MODAL DE ELIMINACIÓN ─────────────────────────────────────── */}
      <AlertDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      >
        <AlertDialogContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 max-w-md shadow-2xl font-sans select-none">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("delete_confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("delete_confirm_desc", { name: pkg.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-row gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="h-10 px-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs cursor-pointer"
            >
              {t("cancel")}
            </button>

            <button
              type="button"
              onClick={() => {
                onDelete(pkg.id);
                setIsDeleteModalOpen(false);
              }}
              className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer"
            >
              {t("delete_btn")}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
