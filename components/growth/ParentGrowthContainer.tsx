"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import ParentGrowthView from "./ParentGrowthView";
import { growthService } from "@/services/growth.service";
import {
  GrowthMeasurementRequest,
  GrowthMeasurementResponse,
  WhoGrowthStandard,
} from "@/types/growth";
import { QhSpinner } from "@/components/ui/QhSpinner";
import GrowthMeasurementForm from "./GrowthMeasurementForm";
import ParentGrowthHistory from "./ParentGrowthHistory";

interface ParentGrowthContainerProps {
  dependentId: number;
  sex: "MALE" | "FEMALE";
}

export function ParentGrowthContainer({
  dependentId,
  sex,
}: ParentGrowthContainerProps) {
  const t = useTranslations("Growth.ParentContainer");

  const [latestMeasurement, setLatestMeasurement] =
    useState<GrowthMeasurementResponse | null>(null);
  const [history, setHistory] = useState<GrowthMeasurementResponse[]>([]);
  const [standards, setStandards] = useState<WhoGrowthStandard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const [historyData, stdRes] = await Promise.all([
        growthService.getConsumerHistory(dependentId),
        growthService.getStandards(),
      ]);
      setStandards(stdRes);
      if (historyData && historyData.length > 0) {
        setLatestMeasurement(historyData[0]);
        setHistory(historyData);
      } else {
        setLatestMeasurement(null);
        setHistory([]);
      }
    } catch (error) {
      console.error("Error fetching growth history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dependentId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = async (request: GrowthMeasurementRequest) => {
    setIsSubmitting(true);
    try {
      await growthService.recordMeasurementConsumer(dependentId, request);
      toast.success(t("success_saving"));
      fetchHistory();
    } catch (error) {
      console.error(error);
      toast.error(t("error_saving"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-gray-100 dark:border-gray-800 rounded-3xl bg-white dark:bg-[#0a0a0a] shadow-2xs font-sans space-y-3">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 font-sans transition-colors">
      {/* Formulario de Medición */}
      <GrowthMeasurementForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Resumen de Última Medición */}
      <ParentGrowthView latestMeasurement={latestMeasurement} />

      {/* Histórico Clínico de Crecimiento */}
      {history.length > 0 && (
        <ParentGrowthHistory
          history={history}
          standards={standards}
          sex={sex}
        />
      )}
    </div>
  );
}