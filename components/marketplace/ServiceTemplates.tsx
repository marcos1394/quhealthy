"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Video, MapPin, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ServiceDeliveryType } from "@/types/catalog";

interface ServiceTemplatesProps {
  onApply: (template: {
    name: string;
    duration: number;
    price: number;
    type: ServiceDeliveryType;
  }) => void;
  onClose: () => void;
}

export function ServiceTemplates({ onApply, onClose }: ServiceTemplatesProps) {
  const t = useTranslations("Marketplace.services");

  const serviceTemplates = useMemo(
    () => [
      {
        name: t("template_general_consultation"),
        duration: 30,
        price: 500,
        type: "in_person" as ServiceDeliveryType,
      },
      {
        name: t("template_followup_consultation"),
        duration: 20,
        price: 350,
        type: "video_call" as ServiceDeliveryType,
      },
      {
        name: t("template_initial_assessment"),
        duration: 45,
        price: 700,
        type: "in_person" as ServiceDeliveryType,
      },
      {
        name: t("template_teleconsultation"),
        duration: 25,
        price: 400,
        type: "video_call" as ServiceDeliveryType,
      },
    ],
    [t]
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xs font-sans select-none"
    >
      {/* ── CABECERA DEL PANEL DE PLANTILLAS ──────────────────────────── */}
      <div className="flex items-center justify-between p-5 md:p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Info className="w-5 h-5" strokeWidth={2} />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              {t("quick_templates")}
            </p>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("quick_templates_desc")}
            </p>
          </div>
        </div>

        {/* Botón de Cierre */}
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500 cursor-pointer shadow-2xs shrink-0"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* ── GRID DE PLANTILLAS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:p-5 bg-white dark:bg-[#0a0a0a]">
        {serviceTemplates.map((template, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onApply(template)}
            className="flex flex-col text-left border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505] hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 hover:border-emerald-500/40 transition-all rounded-2xl p-4 cursor-pointer group shadow-2xs justify-between space-y-4"
          >
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shadow-2xs">
                  {template.type === "video_call" ? (
                    <Video className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    <MapPin className="w-4 h-4" strokeWidth={2} />
                  )}
                </div>

                <span
                  className={cn(
                    "text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs font-mono",
                    template.type === "video_call"
                      ? "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/40"
                      : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
                  )}
                >
                  {template.type === "video_call"
                    ? t("template_remote")
                    : t("template_local")}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-900 dark:group-hover:text-emerald-300 transition-colors leading-tight">
                {template.name}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-200/60 dark:border-gray-800/80 flex items-center justify-between w-full">
              <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                ${template.price} MXN
              </span>
              <span className="text-[10px] font-bold font-mono text-gray-400">
                {template.duration} MIN
              </span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}