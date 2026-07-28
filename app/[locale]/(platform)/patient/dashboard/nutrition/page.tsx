"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Sparkles,
  Camera,
  Utensils,
  History as HistoryIcon,
  Activity,
} from "lucide-react";

import FoodAnalyzer from "@/components/nutrition/FoodAnalyzer";
import AnalysisResult from "@/components/nutrition/AnalysisResult";
import {
  NutritionAnalysis,
  NutritionProfile,
  NutritionProfileRequest,
} from "@/types/nutrition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { nutritionService } from "@/services/nutrition.service";
import NutritionOnboarding from "@/components/nutrition/NutritionOnboarding";
import NutritionProgress from "@/components/nutrition/NutritionProgress";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function NutritionDashboard() {
  const t = useTranslations("Nutrition");
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState("analyze");
  const [currentAnalysis, setCurrentAnalysis] =
    useState<NutritionAnalysis | null>(null);
  const [history, setHistory] = useState<NutritionAnalysis[]>([]);
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    loadProfileAndHistory();
  }, []);

  const loadProfileAndHistory = async () => {
    setIsLoadingProfile(true);
    try {
      const [profData, histData] = await Promise.all([
        nutritionService.getProfile(),
        nutritionService.getHistory(),
      ]);
      setProfile(profData);
      setHistory(histData);
      if (profData?.targetCalories) {
        setActiveTab("progress");
      }
    } catch (error) {
      console.error("Error loading nutrition data:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleProfileSubmit = async (data: NutritionProfileRequest) => {
    setIsSavingProfile(true);
    try {
      const updatedProfile = await nutritionService.updateProfile(data);
      setProfile(updatedProfile);
      setActiveTab("progress");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAnalysisComplete = (analysis: NutritionAnalysis) => {
    setCurrentAnalysis(analysis);
    setHistory((prev) => [analysis, ...prev]);
    setActiveTab("result");
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const str = String(dateStr);
    const hasTimezone = /(Z|[+-]\d{2}(:\d{2})?)$/.test(str);
    return new Date(hasTimezone ? str : `${str}Z`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 lg:px-12 space-y-8">
        
        {/* ── HEADER HOMOLOGADO ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <Utensils className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-0.5 text-xs font-bold shadow-sm">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                <span>Food Vision AI</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ── ESTADO CARGANDO PERFIL ──────────────────────────────────── */}
        {isLoadingProfile ? (
          <div className="flex flex-col justify-center items-center min-h-[50vh] bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-12 shadow-sm">
            <QhSpinner size="lg" />
            <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
              {t("loading")}
            </p>
          </div>
        ) : !profile || !profile.targetCalories ? (
          /* ── ONBOARDING ───────────────────────────────────────────── */
          <NutritionOnboarding
            initialData={profile || undefined}
            onSubmit={handleProfileSubmit}
            isLoading={isSavingProfile}
          />
        ) : (
          /* ── DASHBOARD CON PESTAÑAS ────────────────────────────────── */
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full space-y-8"
          >
            <TabsList className="flex w-full max-w-2xl overflow-x-auto no-scrollbar bg-white dark:bg-[#0a0a0a] rounded-2xl p-1.5 border border-gray-100 dark:border-gray-800 shadow-sm gap-1">
              <TabsTrigger
                value="progress"
                className="flex-1 shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs transition-all data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-200 dark:data-[state=active]:border-emerald-900/40 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Activity className="w-3.5 h-3.5 mr-2 inline-block" strokeWidth={2} />
                {t("tab_progress")}
              </TabsTrigger>
              <TabsTrigger
                value="analyze"
                className="flex-1 shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs transition-all data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-200 dark:data-[state=active]:border-emerald-900/40 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Camera className="w-3.5 h-3.5 mr-2 inline-block" strokeWidth={2} />
                {t("tab_analyze")}
              </TabsTrigger>
              <TabsTrigger
                value="result"
                disabled={!currentAnalysis}
                className="flex-1 shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs transition-all data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-200 dark:data-[state=active]:border-emerald-900/40 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-40"
              >
                <Utensils className="w-3.5 h-3.5 mr-2 inline-block" strokeWidth={2} />
                {t("tab_result")}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex-1 shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs transition-all data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-200 dark:data-[state=active]:border-emerald-900/40 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <HistoryIcon className="w-3.5 h-3.5 mr-2 inline-block" strokeWidth={2} />
                {t("tab_history")}
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="progress" className="mt-0 outline-none">
                <NutritionProgress profile={profile} history={history} />
              </TabsContent>

              <TabsContent value="analyze" className="mt-0 outline-none">
                <FoodAnalyzer onComplete={handleAnalysisComplete} />
              </TabsContent>

              <TabsContent value="result" className="mt-0 outline-none">
                {currentAnalysis && (
                  <AnalysisResult analysis={currentAnalysis} />
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0 outline-none">
                {isLoadingHistory ? (
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 flex justify-center items-center h-[300px]">
                    <QhSpinner size="lg" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center text-gray-500 dark:text-gray-400 space-y-2">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">
                      {t("history_empty_title")}
                    </h3>
                    <p className="text-xs font-medium">
                      {t("history_empty_desc")}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 space-y-6">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                      {t("history_title")}
                    </h3>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:bg-gray-50/50 dark:hover:bg-[#111] transition-all cursor-pointer shadow-sm group"
                          onClick={() => {
                            setCurrentAnalysis(item);
                            setActiveTab("result");
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={nutritionService.getImageUrl(item)}
                              alt="Food"
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-gray-800"
                            />
                            <div>
                              <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                                {parseDate(item.createdAt).toLocaleDateString(
                                  locale === "en" ? "en-US" : "es-MX",
                                  {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                                {t("summary_format", {
                                  calories: item.totals?.calories || 0,
                                  protein: item.totals?.protein || 0,
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-center bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-4 py-2 rounded-xl shrink-0">
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                              {item.healthScore}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700/60 dark:text-emerald-400/60 block -mt-1 tracking-wider">
                              {t("score_label")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}

      </div>
    </div>
  );
}