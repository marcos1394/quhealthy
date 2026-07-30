"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { NutritionAnalysis } from "@/types/nutrition";
import { nutritionService } from "@/services/nutrition.service";

interface FoodAnalyzerProps {
  onComplete: (analysis: NutritionAnalysis) => void;
}

export default function FoodAnalyzer({ onComplete }: FoodAnalyzerProps) {
  const t = useTranslations("Nutrition.FoodAnalyzer");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeFood = async (file: File) => {
    setIsAnalyzing(true);

    try {
      const result = await nutritionService.analyzeFood(file);
      toast.success(t("toast_success"));
      onComplete(result);
    } catch (error) {
      console.error(error);
      toast.error(t("toast_error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Previsualización de imagen
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Iniciar análisis
    await analyzeFood(file);
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xs border border-gray-100 dark:border-gray-800 p-6 md:p-8 flex flex-col items-center justify-center min-h-[380px] font-sans transition-colors select-none">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
        disabled={isAnalyzing}
      />

      {!previewUrl ? (
        <div className="text-center max-w-md flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-2xs">
            <Camera className="w-8 h-8" strokeWidth={2} />
          </div>

          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-1.5">
            {t("title")}
          </h2>

          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            {t("subtitle")}
          </p>

          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer flex items-center gap-2"
          >
            <Camera className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_take_photo")}</span>
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-lg text-center flex flex-col items-center">
          <div className="relative rounded-3xl overflow-hidden mb-5 aspect-video w-full bg-gray-50 dark:bg-[#050505] flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-2xs">
            <img
              src={previewUrl}
              alt="Comida"
              className="object-cover w-full h-full"
            />

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 p-4">
                <QhSpinner size="lg" className="text-emerald-400" />
                <p className="font-bold text-sm sm:text-base tracking-tight">
                  {t("analyzing_title")}
                </p>
                <p className="text-xs font-medium text-gray-300">
                  {t("analyzing_subtitle")}
                </p>
              </div>
            )}
          </div>

          {!isAnalyzing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              {t("btn_try_again")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}