"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React from "react";
import { motion } from "framer-motion";
import { X, FileText, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export default function TermsModal({
  isOpen,
  onClose,
  onAccept,
}: TermsModalProps) {
  const t = useTranslations("TermsModal");

  const keyPoints: string[] = [
    t("key_points.0"),
    t("key_points.1"),
    t("key_points.2"),
    t("key_points.3"),
  ];

  const sec6List: string[] = [
    t("sec6_list.0"),
    t("sec6_list.1"),
    t("sec6_list.2"),
    t("sec6_list.3"),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
        {/* --- HEADER --- */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                <FileText
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
              </div>
              <div>
                <DialogTitle className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {t("title")}
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-gray-500 mt-0.5">
                  QuHealthy Platform • {t("last_updated")}
                </DialogDescription>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
            </button>
          </div>

          {/* Tarjeta de Puntos Clave */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <Shield
                  className="w-4 h-4 text-emerald-700 dark:text-emerald-400"
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1.5">
                  {t("summary_title")}
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400/90">
                  {keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                        strokeWidth={2}
                      />
                      <span className="leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </DialogHeader>

        {/* --- CONTENIDO SCROLLABLE --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/40 dark:bg-[#050505] custom-scrollbar">
          {/* Sección 1 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("sec1_title")}
              </h3>
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              {t("sec1_p1")}
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              {t("sec1_p2")}
            </p>
          </section>

          {/* Sección 2 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("sec2_title")}
              </h3>
            </div>
            <div className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec2_1_label")}
                </strong>{" "}
                {t("sec2_1_desc")}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec2_2_label")}
                </strong>{" "}
                {t("sec2_2_desc")}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec2_3_label")}
                </strong>{" "}
                {t("sec2_3_desc")}
              </p>
            </div>
          </section>

          {/* Sección 3 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("sec3_title")}
              </h3>
            </div>
            <div className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec3_1_label")}
                </strong>{" "}
                {t("sec3_1_desc")}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec3_2_label")}
                </strong>{" "}
                {t("sec3_2_desc")}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec3_3_label")}
                </strong>{" "}
                {t("sec3_3_desc")}
              </p>
            </div>
          </section>

          {/* Sección 4 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("sec4_title")}
              </h3>
            </div>
            <div className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec4_1_label")}
                </strong>{" "}
                {t("sec4_1_desc")}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec4_2_label")}
                </strong>{" "}
                {t("sec4_2_desc")}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec4_3_label")}
                </strong>{" "}
                {t("sec4_3_desc")}
              </p>
            </div>
          </section>

          {/* Sección 5 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                5
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("sec5_title")}
              </h3>
            </div>
            <div className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec5_1_label")}
                </strong>{" "}
                {t("sec5_1_desc")}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec5_2_label")}
                </strong>{" "}
                {t("sec5_2_desc")}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec5_3_label")}
                </strong>{" "}
                {t("sec5_3_desc")}
              </p>
            </div>
          </section>

          {/* Sección 6 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                6
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("sec6_title")}
              </h3>
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              {t("sec6_intro")}
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs font-medium text-gray-600 dark:text-gray-300 pl-12">
              {sec6List.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Sección 7 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                7
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("sec7_title")}
              </h3>
            </div>
            <div className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec7_1_label")}
                </strong>{" "}
                {t("sec7_1_desc")}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  {t("sec7_2_label")}
                </strong>{" "}
                {t("sec7_2_desc")}
              </p>
            </div>
          </section>

          {/* Sección 8 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                8
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("sec8_title")}
              </h3>
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              {t("sec8_text")}
            </p>
          </section>

          {/* Sección 9 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                9
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("sec9_title")}
              </h3>
            </div>
            <div className="bg-gray-50 dark:bg-[#050505] rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 space-y-1 text-xs font-semibold text-gray-700 dark:text-gray-300 ml-8">
              <p>
                <span className="text-gray-400">{t("sec9_email_label")}</span>{" "}
                legal@quhealthy.org
              </p>
              <p>
                <span className="text-gray-400">{t("sec9_phone_label")}</span>{" "}
                +52 55 1234 5678
              </p>
              <p>
                <span className="text-gray-400">{t("sec9_address_label")}</span>{" "}
                {t("sec9_address_val")}
              </p>
            </div>
          </section>

          {/* Aviso Importante */}
          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle
              className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <div className="text-xs font-medium text-amber-800 dark:text-amber-300 space-y-0.5">
              <p className="font-bold text-amber-900 dark:text-amber-200">
                {t("notice_title")}
              </p>
              <p>{t("notice_text")}</p>
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm"
          >
            {t("btn_close")}
          </button>

          <button
            type="button"
            onClick={onAccept ? onAccept : onClose}
            className="h-11 px-7 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_accept")}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}