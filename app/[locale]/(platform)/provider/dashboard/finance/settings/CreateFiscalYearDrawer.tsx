"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Save, Calendar, Info, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { financeService } from "@/services/finance.service";

interface CreateFiscalYearForm {
  year: number;
}

interface CreateFiscalYearDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateFiscalYearDrawer({
  open,
  onOpenChange,
  onSuccess,
}: CreateFiscalYearDrawerProps) {
  const t = useTranslations("CreateFiscalYearDrawer");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFiscalYearForm>({
    defaultValues: {
      year: new Date().getFullYear(),
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: CreateFiscalYearForm) => {
    setIsSubmitting(true);
    try {
      await financeService.createBudgetPeriod(Number(data.year));
      toast.success(t("toasts.success", { year: data.year }));
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      const apiMessage = error?.response?.data?.message;
      toast.error(apiMessage || t("toasts.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border-l border-gray-100 dark:border-gray-800 p-0 overflow-y-auto sm:rounded-l-3xl shadow-2xl flex flex-col h-full font-sans text-gray-900 dark:text-white">
        
        {/* ── HEADER SHEET ────────────────────────────────────────────── */}
        <SheetHeader className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shrink-0 rounded-tl-3xl text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <Calendar className="w-6 h-6" strokeWidth={2} />
            </div>
            <SheetClose className="w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="w-4 h-4" strokeWidth={2} />
            </SheetClose>
          </div>
          <SheetTitle className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            {t("title")}
          </SheetTitle>
          <SheetDescription className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            {t("subtitle")}
          </SheetDescription>
        </SheetHeader>

        {/* ── FORMULARIO PRINCIPAL ─────────────────────────────────────── */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Banner Informativo SAT */}
          <div className="p-4 sm:p-5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>{t("sat_note_title")}</span>
            </p>
            <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-2 font-medium leading-relaxed">
              {t("sat_note_text")}
            </p>
          </div>

          <form
            id="create-fiscal-year-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Campo Año */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("label_year")}
              </Label>
              <Input
                type="number"
                {...register("year", { required: true, min: 2000, max: 2100 })}
                className="w-full h-11 px-3 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm font-mono text-xs font-bold bg-white dark:bg-[#0a0a0a]"
                placeholder={t("placeholder_year")}
              />
              {errors.year && (
                <span className="text-[10px] text-rose-500 font-bold block mt-1">
                  {t("error_invalid_year")}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* ── FOOTER BOTÓN ────────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shrink-0 rounded-bl-3xl">
          <Button
            type="submit"
            form="create-fiscal-year-form"
            disabled={isSubmitting}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 rounded-xl shadow-sm transition-all border-0 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <QhSpinner size="sm" />
                <span>{t("btn_saving")}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_save")}</span>
              </>
            )}
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}