"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Plus,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Tag,
  Info,
  Check,
  Server,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ServiceItemCard } from "./ServiceItemCard";
import { ServiceTemplates } from "./ServiceTemplates";
import { UI_Service, ServiceDeliveryType } from "@/types/catalog";

interface ServicesManagerProps {
  services: UI_Service[];
  onAdd: () => void;
  onUpdate: (id: number, updates: Partial<UI_Service>) => void;
  onDelete: (id: number) => void;
  onSave: (service: UI_Service) => void;
  onDuplicate?: (service: UI_Service) => void;
  onImageUpload?: (id: number, file: File) => void;
  canAdd?: boolean;
  currentUsage?: number;
  maxLimit?: number | null;
}

export function ServicesManager({
  services,
  onAdd,
  onUpdate,
  onDelete,
  onSave,
  onDuplicate,
  onImageUpload,
  canAdd = true,
  currentUsage,
  maxLimit,
}: ServicesManagerProps) {
  const t = useTranslations("Marketplace.services");
  const [showTemplates, setShowTemplates] = useState(false);

  const hasUnsavedChanges = services.some(
    (s) => s.isNew || s.hasUnsavedChanges
  );

  const handleApplyTemplate = (template: {
    name: string;
    duration: number;
    price: number;
    type: ServiceDeliveryType;
  }) => {
    if (!canAdd) {
      toast.warning(t("limit_reached_msg"));
      return;
    }

    onAdd();
    setTimeout(() => {
      const newService = services[0];
      if (newService) {
        onUpdate(newService.id, {
          name: template.name,
          duration: template.duration,
          price: template.price,
          serviceDeliveryType: template.type,
          hasUnsavedChanges: true,
        });
      }
    }, 50);

    setShowTemplates(false);
    toast.success(t("template_applied", { name: template.name }));
  };

  const formattedMaxLimit =
    maxLimit === null || maxLimit === undefined ? "∞" : maxLimit;

  return (
    <div className="flex flex-col min-h-screen font-sans transition-colors select-none p-6 md:p-8">
      {/* ── CABECERA PRINCIPAL ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xs gap-6 shrink-0 mb-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
            <Server className="w-7 h-7" strokeWidth={2} />
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
                {services.length > 0 && (
                  <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{t("service_count", { count: services.length })}</span>
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

        {/* Botones de Comando */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            disabled={!canAdd}
            className="flex-1 md:flex-none h-11 px-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span className="hidden sm:inline">{t("templates")}</span>
          </button>

          <button
            type="button"
            onClick={onAdd}
            disabled={!canAdd}
            className="flex-1 md:flex-none h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>{!canAdd ? t("limit_reached_btn") : t("new_service")}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── PANEL DESPLEGABLE DE PLANTILLAS RÁPIDAS ─────────────────── */}
        <AnimatePresence>
          {showTemplates && canAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <ServiceTemplates
                onApply={handleApplyTemplate}
                onClose={() => setShowTemplates(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ALERTA DE LÍMITE DE CAPACIDAD ────────────────────────────── */}
        <AnimatePresence>
          {!canAdd && (
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

        {/* ── ALERTA DE CAMBIOS PENDIENTES SIN GUARDAR ─────────────────── */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="p-5 rounded-3xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-2xs flex gap-3.5">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={2} />
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300">
                    {t("unsaved_changes")}
                  </p>
                  <p className="text-xs font-medium text-amber-800/80 dark:text-amber-400 leading-relaxed">
                    {t("unsaved_desc")}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LISTADO DE TARJETAS DE SERVICIOS ─────────────────────────── */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {services.map((service, index) => (
              <ServiceItemCard
                key={service.id}
                service={service as any}
                index={index}
                onUpdate={onUpdate}
                onSave={onSave}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onImageUpload={onImageUpload}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* ── ESTADO VACÍO ────────────────────────────────────────────── */}
        {services.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs p-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-2xs">
              <Server className="w-8 h-8" strokeWidth={2} />
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-1">
              {t("empty_title")}
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
              {t("empty_desc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <button
                type="button"
                onClick={() => setShowTemplates(true)}
                disabled={!canAdd}
                className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("use_templates")}</span>
              </button>

              <button
                type="button"
                onClick={onAdd}
                disabled={!canAdd}
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>{!canAdd ? t("limit_reached_btn") : t("create_first")}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── CONSEJO DE OPTIMIZACIÓN DE CATÁLOGO ─────────────────────── */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] mt-8 flex flex-col md:flex-row gap-6 shadow-2xs items-start md:items-center"
          >
            <div className="flex items-center gap-3 md:w-1/3 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-4 md:pb-0 md:pr-6 w-full">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <TrendingUp className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("tip_title")}
                </p>
                <p className="text-[11px] font-medium text-gray-400">
                  {t("tip_subtitle")}
                </p>
              </div>
            </div>

            <ul className="md:w-2/3 space-y-2.5">
              <li className="flex items-start gap-2.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                </div>
                <span>{t("tip_1")}</span>
              </li>

              <li className="flex items-start gap-2.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                </div>
                <span>{t("tip_2")}</span>
              </li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}