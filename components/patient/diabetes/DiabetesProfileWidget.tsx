import React from "react";
import { DiabetesProfileDto, DiabetesType } from "@/services/diabetes.service";
import { Syringe, Calendar, Target, Activity } from "lucide-react";

export function DiabetesProfileWidget({ profile }: { profile: DiabetesProfileDto }) {
  const getTypeName = (type: DiabetesType) => {
    switch (type) {
      case DiabetesType.TYPE_1: return "Diabetes Tipo 1";
      case DiabetesType.TYPE_2: return "Diabetes Tipo 2";
      case DiabetesType.GESTATIONAL: return "Diabetes Gestacional";
      case DiabetesType.PREDIABETES: return "Prediabetes";
      case DiabetesType.MODY: return "Diabetes tipo MODY";
      default: return type;
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Perfil Diabetológico</h2>
        </div>
        {profile.insulinDependent && (
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Syringe className="w-3 h-3" /> Insulino-dependiente
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
          <p className="text-xs text-gray-500 mb-1">Diagnóstico Principal</p>
          <p className="font-semibold text-gray-900 dark:text-white">{getTypeName(profile.diabetesType)}</p>
          <p className="text-xs text-gray-400 mt-1">CIE-10: {profile.cie10Code}</p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
          <p className="text-xs text-gray-500 mb-1">Fecha Diagnóstico</p>
          <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
            <Calendar className="w-4 h-4 text-gray-400" />
            {profile.diagnosisDate ? new Date(profile.diagnosisDate).toLocaleDateString() : "No registrada"}
          </div>
        </div>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mb-1 flex items-center gap-1">
            <Target className="w-3 h-3" /> Meta HbA1c
          </p>
          <div className="flex items-end gap-2">
            <p className="font-bold text-2xl text-emerald-700 dark:text-emerald-400">
              {profile.targetHba1c ? `${profile.targetHba1c}%` : "N/A"}
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
          <p className="text-xs text-blue-600 dark:text-blue-500 mb-1">Última HbA1c</p>
          <div className="flex items-end gap-2">
            <p className="font-bold text-2xl text-blue-700 dark:text-blue-400">
              {profile.lastHba1c ? `${profile.lastHba1c}%` : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Metas de Glucosa (mg/dL)</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Ayuno</span>
              <span className="font-medium text-gray-900 dark:text-white">&lt; {profile.targetFastingGlucose || 130}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[60%] rounded-full" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Postprandial (2h)</span>
              <span className="font-medium text-gray-900 dark:text-white">&lt; {profile.targetPostprandialGlucose || 180}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[80%] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
