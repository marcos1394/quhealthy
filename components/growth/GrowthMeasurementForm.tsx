"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { PlusCircle, CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-toastify";

import { QhSpinner } from "@/components/ui/QhSpinner";
import { GrowthMeasurementRequest } from "@/types/growth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GrowthMeasurementFormProps {
  onSubmit: (request: GrowthMeasurementRequest) => Promise<void>;
  isSubmitting: boolean;
}

export default function GrowthMeasurementForm({
  onSubmit,
  isSubmitting,
}: GrowthMeasurementFormProps) {
  const t = useTranslations("GrowthMeasurementForm");

  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState("");
  const [measurementDate, setMeasurementDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg && !heightCm && !headCircumferenceCm) {
      toast.warn(t("warn_empty"));
      return;
    }

    const request: GrowthMeasurementRequest = {
      measurementDate,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      headCircumferenceCm: headCircumferenceCm
        ? parseFloat(headCircumferenceCm)
        : undefined,
    };

    try {
      await onSubmit(request);
      setWeightKg("");
      setHeightCm("");
      setHeadCircumferenceCm("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs font-sans transition-colors">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-5">
        {t("form_title")}
      </h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
      >
        {/* Fecha de Medición */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {t("label_date")}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-11 w-full justify-start rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs cursor-pointer",
                  !measurementDate
                    ? "text-gray-400"
                    : "text-gray-900 dark:text-white font-semibold"
                )}
              >
                <CalendarIcon className="mr-2.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                {measurementDate ? (
                  <span className="font-mono">
                    {format(
                      new Date(`${measurementDate}T12:00:00`),
                      "dd MMM yyyy",
                      { locale: es }
                    )}
                  </span>
                ) : (
                  <span>{t("select_date_placeholder")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="z-[100] w-auto rounded-2xl border border-gray-100 dark:border-gray-800 p-2 bg-white dark:bg-[#0a0a0a] shadow-xl font-sans"
              align="start"
            >
              <CalendarUI
                mode="single"
                selected={
                  measurementDate
                    ? new Date(`${measurementDate}T12:00:00`)
                    : undefined
                }
                onSelect={(date) =>
                  setMeasurementDate(date ? format(date, "yyyy-MM-dd") : "")
                }
                disabled={(date) =>
                  date > new Date() || date < new Date("2000-01-01")
                }
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Peso (kg) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {t("label_weight")}
          </label>
          <input
            type="number"
            step="0.01"
            placeholder={t("placeholder_weight")}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="h-11 px-3.5 border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
          />
        </div>

        {/* Talla (cm) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {t("label_height")}
          </label>
          <input
            type="number"
            step="0.1"
            placeholder={t("placeholder_height")}
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="h-11 px-3.5 border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
          />
        </div>

        {/* Perímetro Cefálico (cm) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {t("label_head")}
          </label>
          <input
            type="number"
            step="0.1"
            placeholder={t("placeholder_head")}
            value={headCircumferenceCm}
            onChange={(e) => setHeadCircumferenceCm(e.target.value)}
            className="h-11 px-3.5 border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
          />
        </div>

        {/* Botón de Submit */}
        <div className="flex flex-col gap-1.5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 border-0 shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <QhSpinner size="sm" className="text-white" />
            ) : (
              <>
                <PlusCircle className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_submit")}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}