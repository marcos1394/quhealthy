"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { FileCheck2, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface VaccinationModalsProps {
  isManualMarkModalOpen: boolean;
  setIsManualMarkModalOpen: (open: boolean) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  simulatingAction: number | null;
  confirmManualMark: () => void;
}

export function VaccinationModals({
  isManualMarkModalOpen,
  setIsManualMarkModalOpen,
  selectedDate,
  setSelectedDate,
  simulatingAction,
  confirmManualMark,
}: VaccinationModalsProps) {
  const t = useTranslations("VaccinationModals");
  const todayDate = useMemo(() => new Date(), []);
  const minDate = useMemo(() => new Date("1900-01-01"), []);

  return (
    <Dialog
      open={isManualMarkModalOpen}
      onOpenChange={setIsManualMarkModalOpen}
    >
      <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans transition-colors [&>button]:hidden">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <DialogHeader className="p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between shrink-0 space-y-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
              <FileCheck2 className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("audit_title")}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("audit_desc")}
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsManualMarkModalOpen(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </DialogHeader>

        {/* ── CUERPO ─────────────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 space-y-4 bg-white dark:bg-[#0a0a0a]">
          <div className="space-y-1.5 flex flex-col">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("record_date_label")}
            </label>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              disabled={(date) => date > todayDate || date < minDate}
              placeholder={t("select_date_placeholder")}
              className="w-full h-11 text-xs font-mono font-bold rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shadow-2xs"
              popoverClassName="z-[60] bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-2"
            />
          </div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <DialogFooter className="p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsManualMarkModalOpen(false)}
            className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs cursor-pointer"
          >
            {t("cancel")}
          </Button>

          <Button
            type="button"
            onClick={confirmManualMark}
            disabled={!selectedDate || simulatingAction !== null}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {simulatingAction !== null ? (
              <>
                <QhSpinner size="sm" className="text-white" />
                <span>{t("syncing")}</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4" strokeWidth={2} />
                <span>{t("sync")}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}