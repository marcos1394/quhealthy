"use client";

import React from "react";
import { Baby, Activity, Syringe, Calendar } from "lucide-react";

export function BabyCareIntegrationWidget({ babyProfile, latestBabyWeight, nextVaccine }: any) {
  if (!babyProfile) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center h-48">
        <p className="text-gray-500 text-sm">No hay información del bebé registrada aún.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-xl flex items-center justify-center">
          <Baby className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Desarrollo de {babyProfile.firstName || 'Tu Bebé'}</h3>
          <p className="text-sm text-gray-500">Resumen pediátrico</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Growth/Weight */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Último Peso Registrado</p>
            {latestBabyWeight ? (
              <>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {latestBabyWeight.weightKg} kg
                </p>
                <p className="text-xs text-gray-500 mt-1">Registrado el {new Date(latestBabyWeight.measurementDate).toLocaleDateString()}</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Sin registros</p>
            )}
          </div>
        </div>

        {/* Vaccines */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Syringe className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Próxima Vacuna</p>
            {nextVaccine ? (
              <>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {nextVaccine.vaccineName}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Sugerida a los {nextVaccine.recommendedAgeMonths} meses
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Al día</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
