"use client";

import React from "react";
import { NutritionAnalysis } from "@/types/nutrition";
import { AlertTriangle, Flame, Activity, Droplet, Wheat } from "lucide-react";

interface AnalysisResultProps {
  analysis: NutritionAnalysis;
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  const { totals, detectedFoods, recommendations, healthScore } = analysis;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <div className="bg-white dark:bg-[#050505] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center justify-center">
          <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-4">
            Health Score
          </h3>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 36 36"
            >
              <path
                className="text-gray-100 dark:text-gray-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${getScoreColor(healthScore)} transition-all duration-1000 ease-out`}
                strokeDasharray={`${healthScore}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-gray-900 dark:text-white">
                {healthScore}
              </span>
              <span className="text-[10px] font-bold text-gray-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Macros Summary */}
        <div className="bg-white dark:bg-[#050505] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:col-span-2">
          <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-4">
            Resumen Nutricional
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MacroCard
              icon={<Flame className="w-5 h-5 text-orange-500" />}
              label="Calorías"
              value={`${totals?.calories ?? 0} kcal`}
            />
            <MacroCard
              icon={<Activity className="w-5 h-5 text-blue-500" />}
              label="Proteínas"
              value={`${totals?.protein ?? 0}g`}
            />
            <MacroCard
              icon={<Wheat className="w-5 h-5 text-yellow-600" />}
              label="Carbs"
              value={`${totals?.carbs ?? 0}g`}
            />
            <MacroCard
              icon={<Droplet className="w-5 h-5 text-yellow-400" />}
              label="Grasas"
              value={`${totals?.fats ?? 0}g`}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                Fibra
              </p>
              <p className="font-bold text-sm text-gray-700 dark:text-gray-300">
                {totals?.fiber ?? 0}g
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                Azúcares
              </p>
              <p className="font-bold text-sm text-gray-700 dark:text-gray-300">
                {totals?.sugars ?? 0}g
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                Sodio
              </p>
              <p className="font-bold text-sm text-gray-700 dark:text-gray-300">
                {totals?.sodium ?? 0}mg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alimentos Detectados */}
      <div className="bg-white dark:bg-[#050505] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4">
          Alimentos Identificados
        </h3>

        <div className="space-y-3">
          {detectedFoods && detectedFoods.length > 0 ? (
            detectedFoods.map((food, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl flex items-center justify-between border ${!food.is_confident ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/10" : "border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"}`}
              >
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white capitalize">
                    {food.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Porción est:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {food.estimated_portion}
                    </span>
                    {food.preparation_method &&
                      ` • Prep: ${food.preparation_method}`}
                  </p>
                </div>
                {!food.is_confident && (
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-md">
                    <AlertTriangle className="w-3 h-3" />
                    Baja Confianza
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">
              No se identificaron alimentos con claridad.
            </p>
          )}
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-quhealthy-green/5 dark:bg-quhealthy-green/10 rounded-2xl p-6 border border-quhealthy-green/20">
        <h3 className="text-quhealthy-green font-bold text-lg mb-4">
          Recomendaciones del Nutricionista
        </h3>
        <ul className="space-y-3">
          {recommendations && recommendations.length > 0 ? (
            recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="flex gap-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="text-quhealthy-green font-bold flex-shrink-0">
                  •
                </span>
                {rec}
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-700 dark:text-gray-300">
              No hay recomendaciones disponibles para este análisis.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function MacroCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4 flex flex-col items-center justify-center text-center">
      <div className="mb-2">{icon}</div>
      <p className="text-xl font-black text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}
