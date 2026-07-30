"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { growthService } from "@/services/growth.service";
import {
  GrowthMeasurementRequest,
  GrowthMeasurementResponse,
  WhoGrowthStandard,
} from "@/types/growth";
import MedicalGrowthChart from "./MedicalGrowthChart";
import { QhSpinner } from "@/components/ui/QhSpinner";
import GrowthMeasurementForm from "./GrowthMeasurementForm";
import { cn } from "@/lib/utils";

interface MedicalGrowthContainerProps {
  dependentId: number;
  sex: "MALE" | "FEMALE";
}

export function MedicalGrowthContainer({
  dependentId,
  sex,
}: MedicalGrowthContainerProps) {
  const t = useTranslations("Growth.MedicalContainer");

  const [history, setHistory] = useState<GrowthMeasurementResponse[]>([]);
  const [standards, setStandards] = useState<WhoGrowthStandard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeIndicator, setActiveIndicator] = useState<
    "WEIGHT_FOR_AGE" | "LENGTH_FOR_AGE" | "HEAD_CIRCUMFERENCE_FOR_AGE"
  >("WEIGHT_FOR_AGE");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [histRes, stdRes] = await Promise.all([
        growthService.getPatientHistoryProvider(dependentId),
        growthService.getStandards(),
      ]);
      setHistory(histRes);
      setStandards(stdRes);
    } catch (error) {
      console.error("Error fetching pediatric growth data", error);
      toast.error(t("error_loading"));
    } finally {
      setIsLoading(false);
    }
  }, [dependentId, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (request: GrowthMeasurementRequest) => {
    setIsSubmitting(true);
    try {
      await growthService.recordMeasurementProvider(request);
      toast.success(t("success_saving"));
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(t("error_saving"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs font-sans space-y-4">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {t("loading_charts")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans transition-colors">
      {/* Formulario de Registro */}
      <GrowthMeasurementForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Visualizador de Gráficas y Filtros */}
      <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs space-y-6">
        {/* Píldoras de Selección de Indicador */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setActiveIndicator("WEIGHT_FOR_AGE")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap shadow-2xs",
              activeIndicator === "WEIGHT_FOR_AGE"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-[#111] hover:border-emerald-500/30"
            )}
          >
            {t("weight_for_age")}
          </button>

          <button
            type="button"
            onClick={() => setActiveIndicator("LENGTH_FOR_AGE")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap shadow-2xs",
              activeIndicator === "LENGTH_FOR_AGE"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-[#111] hover:border-emerald-500/30"
            )}
          >
            {t("length_for_age")}
          </button>

          <button
            type="button"
            onClick={() => setActiveIndicator("HEAD_CIRCUMFERENCE_FOR_AGE")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap shadow-2xs",
              activeIndicator === "HEAD_CIRCUMFERENCE_FOR_AGE"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-[#111] hover:border-emerald-500/30"
            )}
          >
            {t("head_circumference_for_age")}
          </button>
        </div>

        {/* Componente Gráfico */}
        {standards.length > 0 ? (
          <MedicalGrowthChart
            measurements={history}
            standards={standards}
            sex={sex}
            indicator={activeIndicator}
          />
        ) : (
          <div className="p-12 text-center text-gray-400 text-xs font-medium bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800">
            {t("no_standards")}
          </div>
        )}
      </div>
    </div>
  );
}