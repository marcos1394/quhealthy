"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import FoodAnalyzer from '@/components/nutrition/FoodAnalyzer';
import AnalysisResult from '@/components/nutrition/AnalysisResult';
import { NutritionAnalysis } from '@/types/nutrition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { nutritionService } from '@/services/nutrition.service';

export default function NutritionDashboard() {
  const t = useTranslations('Nutrition');
  const [activeTab, setActiveTab] = useState('analyze');
  const [currentAnalysis, setCurrentAnalysis] = useState<NutritionAnalysis | null>(null);
  const [history, setHistory] = useState<NutritionAnalysis[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'history' && history.length === 0) {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await nutritionService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Error loading history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAnalysisComplete = (analysis: NutritionAnalysis) => {
    setCurrentAnalysis(analysis);
    setHistory((prev) => [analysis, ...prev]); // Add to beginning of history
    setActiveTab('result');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-quhealthy-green">
            Nutricionista IA
          </h1>
          <p className="text-gray-500 mt-2">
            Captura tu comida y obtén un desglose nutricional al instante con Gemini Flash.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-100 rounded-full p-1 border border-gray-200">
          <TabsTrigger 
            value="analyze" 
            className="rounded-full font-bold uppercase text-[10px] tracking-wider data-[state=active]:bg-white data-[state=active]:text-quhealthy-green data-[state=active]:shadow-sm"
          >
            Analizar Comida
          </TabsTrigger>
          <TabsTrigger 
            value="result" 
            disabled={!currentAnalysis}
            className="rounded-full font-bold uppercase text-[10px] tracking-wider data-[state=active]:bg-white data-[state=active]:text-quhealthy-green data-[state=active]:shadow-sm"
          >
            Resultado
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="rounded-full font-bold uppercase text-[10px] tracking-wider data-[state=active]:bg-white data-[state=active]:text-quhealthy-green data-[state=active]:shadow-sm"
          >
            Historial
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quhealthy-green"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
                <h3 className="font-bold text-lg mb-2">Historial Nutricional</h3>
                <p className="text-sm">Tus análisis previos aparecerán aquí.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Tus Análisis Anteriores</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      className="border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setCurrentAnalysis(item);
                        setActiveTab('result');
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <img src={item.imageUrl} alt="Food" className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-gray-900">{new Date(item.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.totals?.calories || 0} kcal • {item.totals?.protein || 0}g proteína</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-black text-quhealthy-green">{item.healthScore}</span>
                        <span className="text-[10px] font-bold text-gray-400 block -mt-1">SCORE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
