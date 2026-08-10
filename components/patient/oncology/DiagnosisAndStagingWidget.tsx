"use client";

import React from "react";
import { Stethoscope, Activity, FileText } from "lucide-react";

import { OncologyProfileDto } from "@/services/oncology.service";
export type { OncologyProfileDto };

export function DiagnosisAndStagingWidget({ profile }: { profile?: OncologyProfileDto | null }) {
  if (!profile) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center h-32">
        <p className="text-gray-500 text-sm">No hay un diagnóstico oncológico activo.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Diagnóstico Principal</h3>
            <p className="text-sm text-gray-500">Expediente Centralizado (CIE-10)</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-semibold text-xs rounded-lg border border-indigo-100 dark:border-indigo-800">
            {profile.status}
          </span>
          <p className="text-xs text-gray-500 mt-2">Diagnóstico: {new Date(profile.diagnosisDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-4 mb-6 border border-indigo-100/50 dark:border-indigo-900/20">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {profile.cie10Description}
        </h4>
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          Código CIE-10: {profile.cie10Code}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estadificación (TNM)</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-gray-400">Tumor (T)</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.stagingT}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Nódulo (N)</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.stagingN}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Metástasis (M)</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.stagingM}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-rose-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estadio Clínico</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Estadio {profile.overallStage}</p>
          </div>
          <div className="text-right">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Línea de Tx</p>
             <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{profile.treatmentLine}ª Línea</p>
          </div>
        </div>
      </div>
    </div>
  );
}
