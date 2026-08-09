"use client";

import React from "react";
import { BrainCircuit, AlertTriangle, Activity, CalendarDays } from "lucide-react";
import { CyclePredictionDto, CycleAiInsightDto } from "@/services/womensHealth.service";

interface CycleInsightsWidgetProps {
  prediction: CyclePredictionDto | null;
  insights: CycleAiInsightDto | null;
}

export function CycleInsightsWidget({ prediction, insights }: CycleInsightsWidgetProps) {
  return (
    <div className="bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-[#0a0a0a] rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/30 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Análisis de tu Ciclo</h2>
      </div>

      <div className="flex-1 space-y-6">
        {/* KPI Section */}
        {prediction && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-[#111111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Activity className="w-3 h-3"/> Ciclo</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{prediction.averageCycleLength} <span className="text-sm font-normal text-gray-500">días</span></span>
              <span className="text-xs text-gray-400">Promedio general</span>
            </div>
            <div className="bg-white dark:bg-[#111111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><CalendarDays className="w-3 h-3"/> Periodo</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{prediction.averagePeriodLength} <span className="text-sm font-normal text-gray-500">días</span></span>
              <span className="text-xs text-gray-400">Sangrado promedio</span>
            </div>
          </div>
        )}

        {/* AI Insights Section */}
        {insights ? (
          <div className="space-y-4">
            {insights.requiresMedicalAttention && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  La IA ha detectado patrones que podrían requerir evaluación médica.
                </p>
              </div>
            )}
            
            {insights.detectedPatterns?.length > 0 && (
              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                <h3 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-3">
                  Lo que hemos observado
                </h3>
                <ul className="space-y-2">
                  {insights.detectedPatterns.map((pattern, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-indigo-500 mt-1">•</span> {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.recommendations?.length > 0 && (
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-3">
                  Recomendaciones
                </h3>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(!insights.detectedPatterns?.length && !insights.recommendations?.length) && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {insights.summary}
              </p>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gemini AI necesita más historial para generar un análisis avanzado de tus métricas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
