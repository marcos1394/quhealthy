"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Tag, TrendingUp, Sparkles, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";
import { PackageItemCard } from "./PackageItemCard";
import { PackageEditorDialog } from "./PackageEditorDialog";
import { UI_Package, UI_Service } from "@/types/catalog";

interface PackagesManagerProps {
  packages: UI_Package[];
  availableServices: UI_Service[];
  onAdd?: () => void;
  onSave: (pkg: UI_Package) => Promise<boolean> | void | boolean;
  onDelete: (id: number) => void;
  onImageUpload?: (id: number, file: File) => void;
  canAdd?: boolean;
  currentUsage?: number;
  maxLimit?: number | null;
}

export function PackagesManager({
  packages,
  availableServices,
  onAdd,
  onSave,
  onDelete,
  onImageUpload,
  canAdd = true,
  currentUsage,
  maxLimit,
}: PackagesManagerProps) {
  const t = useTranslations("Marketplace.packages");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<UI_Package | null>(null);

  const handleOpenDialog = (pkg?: UI_Package) => {
    if (!pkg && !canAdd) {
      toast.warning(t("limit_reached_msg"));
      return;
    }

    if (pkg) {
      setEditingPackage(pkg);
    } else {
      if (onAdd) onAdd();

      setEditingPackage({
        id: -Date.now(),
        name: "",
        description: "",
        category: "",
        price: 0,
        packageItems: [],
        isNew: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveWrapper = async (pkg: UI_Package) => {
    const success = await onSave(pkg);
    if (success !== false) {
      setIsDialogOpen(false);
    }
  };

  const formattedMaxLimit = maxLimit === null || maxLimit === undefined ? "∞" : maxLimit;

  return (
    <div className="flex flex-col min-h-screen font-sans transition-colors select-none p-6 md:p-8">
      {/* ── CABECERA PRINCIPAL ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xs gap-6 shrink-0 mb-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
            <Package className="w-7 h-7" strokeWidth={2} />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t("manager_tag")}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("manager_title")}
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
                {packages.length > 0 && (
                  <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{t("active_count", { count: packages.length })}</span>
                  </span>
                )}

                {typeof currentUsage === "number" && (
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs border",
                      canAdd
                        ? "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
                        : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
                    )}
                  >
                    {t("usage_label", {
                      current: currentUsage,
                      max: formattedMaxLimit,
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleOpenDialog()}
          disabled={!canAdd}
          className="w-full md:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>{!canAdd ? t("limit_reached_btn") : t("create_package")}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* ── ALERTA DE LÍMITE DE CAPACIDAD ────────────────────────────── */}
        <AnimatePresence>
          {!canAdd && packages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="p-5 rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 shadow-2xs flex gap-3.5">
                <Info className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" strokeWidth={2} />
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-300">
                    {t("limit_alert_title")}
                  </p>
                  <p className="text-xs font-medium text-rose-700/90 dark:text-rose-400 leading-relaxed">
                    {t("limit_alert_desc")}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ESTADO VACÍO ────────────────────────────────────────────── */}
        {packages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs p-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-2xs">
              <Tag className="w-8 h-8" strokeWidth={2} />
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-1">
              {t("empty_title")}
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
              {t("empty_desc")}
            </p>
            <button
              type="button"
              onClick={() => handleOpenDialog()}
              disabled={!canAdd}
              className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>{!canAdd ? t("limit_reached_btn") : t("create_first")}</span>
            </button>
          </motion.div>
        ) : (
          /* ── MATRIZ DE PAQUETES ─────────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {packages.map((pkg) => (
                <PackageItemCard
                  key={pkg.id}
                  pkg={pkg}
                  availableServices={availableServices}
                  onEdit={handleOpenDialog}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── TARJETA DE CONSEJO DE ESTRATEGIA COMERCIAL ────────────────── */}
        {packages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] mt-8 flex flex-col md:flex-row gap-6 shadow-2xs items-start md:items-center"
          >
            <div className="flex items-center gap-3 md:w-1/3 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-4 md:pb-0 md:pr-6 w-full">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <TrendingUp className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                {t("tip_title")}
              </p>
            </div>

            <div className="md:w-2/3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("tip_desc")}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── DIÁLOGO EDITOR DE PAQUETES ──────────────────────────────── */}
        <PackageEditorDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          initialData={editingPackage}
          availableServices={availableServices}
          onSave={handleSaveWrapper}
          onImageUpload={onImageUpload}
        />
      </div>
    </div>
  );
}