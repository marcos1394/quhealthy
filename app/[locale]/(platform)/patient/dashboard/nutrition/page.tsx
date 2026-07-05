"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import FoodAnalyzer from '@/components/nutrition/FoodAnalyzer';
import AnalysisResult from '@/components/nutrition/AnalysisResult';
import { NutritionAnalysis, NutritionProfile, NutritionProfileRequest } from '@/types/nutrition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { nutritionService } from '@/services/nutrition.service';
import NutritionOnboarding from '@/components/nutrition/NutritionOnboarding';
import NutritionProgress from '@/components/nutrition/NutritionProgress';

export default function NutritionDashboard() {
  const t = useTranslations('Nutrition');
  const [activeTab, setActiveTab] = useState('analyze');
  const [currentAnalysis, setCurrentAnalysis] = useState<NutritionAnalysis | null>(null);
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
        nutritionService.getHistory()
      ]);
      setProfile(profData);
      setHistory(histData);
      if (profData?.targetCalories) {
        setActiveTab('progress');
      }
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleProfileSubmit = async (data: NutritionProfileRequest) => {
    setIsSavingProfile(true);
    try {
      const updatedProfile = await nutritionService.updateProfile(data);
      setProfile(updatedProfile);
      setActiveTab('progress');
    } catch (error) {
      console.error("Error saving profile", error);
    } finally {
      setIsSavingProfile(false);
    }
  };



  const handleAnalysisComplete = (analysis: NutritionAnalysis) => {
    setCurrentAnalysis(analysis);
    setHistory((prev) => [analysis, ...prev]); // Add to beginning of history
    setActiveTab('result');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-16">
      {/* HEADER HOMOLOGADO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight">
            QuHealthy Food Vision
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
            Captura tu comida y obtén un desglose nutricional al instante.
          </p>
        </div>
      </div>

      {isLoadingProfile ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quhealthy-green"></div>
        </div>
      ) : !profile || !profile.targetCalories ? (
        <NutritionOnboarding 
          initialData={profile || undefined} 
          onSubmit={handleProfileSubmit} 
          isLoading={isSavingProfile} 
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-gray-100 dark:bg-gray-900 rounded-full p-1 border border-gray-200 dark:border-gray-800">
            <TabsTrigger 
              value="progress" 
              className="rounded-full font-bold uppercase text-[10px] tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-quhealthy-green data-[state=active]:shadow-sm"
            >
              Progreso
            </TabsTrigger>
            <TabsTrigger 
              value="analyze" 
              className="rounded-full font-bold uppercase text-[10px] tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-quhealthy-green data-[state=active]:shadow-sm"
            >
              Analizar Comida
            </TabsTrigger>
          <TabsTrigger 
            value="result" 
            disabled={!currentAnalysis}
            className="rounded-full font-bold uppercase text-[10px] tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-quhealthy-green data-[state=active]:shadow-sm"
          >
            Resultado
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="rounded-full font-bold uppercase text-[10px] tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-quhealthy-green data-[state=active]:shadow-sm"
          >
            Historial
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="progress" className="mt-0">
            <NutritionProgress profile={profile} history={history} />
          </TabsContent>

          <TabsContent value="analyze" className="mt-0">
            <FoodAnalyzer onComplete={handleAnalysisComplete} />
          </TabsContent>

          <TabsContent value="result" className="mt-0">
            {currentAnalysis && (
              <AnalysisResult analysis={currentAnalysis} />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            {isLoadingHistory ? (
              <div className="bg-white dark:bg-[#050505] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quhealthy-green"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white dark:bg-[#050505] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center text-gray-400 dark:text-gray-500">
                <h3 className="font-bold text-lg mb-2 text-black dark:text-white">Historial Nutricional</h3>
                <p className="text-sm">Tus análisis previos aparecerán aquí.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#050505] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Tus Análisis Anteriores</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#0a0a0a] transition-colors cursor-pointer"
                      onClick={() => {
                        setCurrentAnalysis(item);
                        setActiveTab('result');
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <img src={nutritionService.getImageUrl(item)} alt="Food" className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{new Date(item.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.totals?.calories || 0} kcal • {item.totals?.protein || 0}g proteína</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-black text-quhealthy-green">{item.healthScore}</span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block -mt-1">SCORE</span>
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
