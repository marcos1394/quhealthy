"use client";

import React from 'react';
import { NutritionAnalysis } from '@/types/nutrition';
import { AlertTriangle, Flame, Activity, Droplet, Wheat } from 'lucide-react';

interface AnalysisResultProps {
  analysis: NutritionAnalysis;
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  const { totals, detectedFoods, recommendations, healthScore } = analysis;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Health Score Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
          <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-4">Health Score</h3>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-100"
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
              <span className="text-3xl font-black text-gray-900">{healthScore}</span>
              <span className="text-[10px] font-bold text-gray-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Macros Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:col-span-2">
          <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-4">Resumen Nutricional</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MacroCard icon={<Flame className="w-5 h-5 text-orange-500" />} label="Calorías" value={`${totals.calories} kcal`} />
            <MacroCard icon={<Activity className="w-5 h-5 text-blue-500" />} label="Proteínas" value={`${totals.protein}g`} />
            <MacroCard icon={<Wheat className="w-5 h-5 text-yellow-600" />} label="Carbs" value={`${totals.carbs}g`} />
            <MacroCard icon={<Droplet className="w-5 h-5 text-yellow-400" />} label="Grasas" value={`${totals.fats}g`} />
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Fibra</p>
              <p className="font-bold text-sm text-gray-700">{totals.fiber}g</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Azúcares</p>
              <p className="font-bold text-sm text-gray-700">{totals.sugars}g</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Sodio</p>
              <p className="font-bold text-sm text-gray-700">{totals.sodium}mg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alimentos Detectados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Alimentos Identificados</h3>
        
        <div className="space-y-3">
          {detectedFoods.map((food, idx) => (
            <div key={idx} className={`p-4 rounded-xl flex items-center justify-between border ${!food.is_confident ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100 bg-gray-50'}`}>
              <div>
                <h4 className="font-bold text-gray-900 capitalize">{food.name}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Porción est: <span className="font-medium text-gray-700">{food.estimated_portion}</span>
                  {food.preparation_method && ` • Prep: ${food.preparation_method}`}
                </p>
              </div>
              
              {!food.is_confident && (
                <div className="flex items-center text-yellow-600 bg-yellow-100 px-3 py-1.5 rounded-full">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Baja Confianza</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recomendaciones */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-quhealthy-green/5 rounded-2xl border border-quhealthy-green/20 p-6">
          <h3 className="text-quhealthy-green font-bold text-lg mb-4">Sugerencias de IA</h3>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-700">
                <span className="text-quhealthy-green mr-2 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MacroCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
      <div className="mb-2">{icon}</div>
      <p className="text-xl font-black text-gray-900">{value}</p>
      <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mt-1">{label}</p>
    </div>
  );
}
