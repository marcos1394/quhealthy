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
        { icon: Pill, text: "Tomar ácido fólico diario", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
        { icon: Stethoscope, text: "Agendar primer ultrasonido", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
        { icon: Syringe, text: "Laboratorios de 1er trimestre", color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
      ];
    } else if (currentGestationalWeek < 28) {
      return [
        { icon: Stethoscope, text: "Ultrasonido estructural (Semana 20-24)", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
        { icon: Syringe, text: "Prueba de tolerancia a la glucosa (Semana 24-28)", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
      ];
    } else {
      return [
        { icon: CalendarCheck, text: "Consultas quincenales/semanales", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
        { icon: Syringe, text: "Vacuna Tdap", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
        { icon: Stethoscope, text: "Monitoreo de movimientos fetales", color: "text-pink-500", bg: "bg-pink-100 dark:bg-pink-900/30" },
      ];
    }
  };

  const recommendations = getRecommendations();

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Cuidado Prenatal</h3>
      
      <div className="space-y-4">
        {recommendations.map((rec, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className={`w-10 h-10 ${rec.bg} ${rec.color} rounded-xl flex items-center justify-center shrink-0`}>
              <rec.icon className="w-5 h-5" />
            </div>
            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
              {rec.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button className="w-full text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          Ver citas próximas
        </button>
      </div>
    </div>
  );
}
