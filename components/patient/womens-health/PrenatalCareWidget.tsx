"use client";

import React from "react";
import { PregnancyProfileDto } from "@/services/womensHealth.service";
import { Stethoscope, Pill, Syringe, CalendarCheck } from "lucide-react";

interface PrenatalCareWidgetProps {
  pregnancy: PregnancyProfileDto;
}

export function PrenatalCareWidget({ pregnancy }: PrenatalCareWidgetProps) {
  const { currentGestationalWeek } = pregnancy;

  const getRecommendations = () => {
    if (currentGestationalWeek < 14) {
      return [
        { icon: Pill, text: "Tomar ácido fólico diario", accentClass: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
        { icon: Stethoscope, text: "Agendar primer ultrasonido", accentClass: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
        { icon: Syringe, text: "Laboratorios de 1er trimestre", accentClass: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400" },
      ];
    } else if (currentGestationalWeek < 28) {
      return [
        { icon: Stethoscope, text: "Ultrasonido estructural (Sem. 20-24)", accentClass: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
        { icon: Syringe, text: "Prueba tolerancia glucosa (Sem. 24-28)", accentClass: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400" },
      ];
    } else {
      return [
        { icon: CalendarCheck, text: "Consultas quincenales / semanales", accentClass: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
        { icon: Syringe, text: "Vacuna Tdap (3er trimestre)", accentClass: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400" },
        { icon: Stethoscope, text: "Monitoreo de movimientos fetales", accentClass: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
      ];
    }
  };

  const recommendations = getRecommendations();

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-base">Cuidado Prenatal</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Recomendaciones para la semana {currentGestationalWeek}</p>

      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className={`w-8 h-8 ${rec.accentClass} rounded-lg flex items-center justify-center shrink-0`}>
              <rec.icon className="w-4 h-4" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{rec.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button className="w-full text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
          Ver citas próximas →
        </button>
      </div>
    </div>
  );
}
