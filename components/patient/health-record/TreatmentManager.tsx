"use client";

import React from "react";
import { Pill, Syringe, Activity, Clock, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { TreatmentDto } from "@/services/treatment.service";
export type { TreatmentDto };

export function TreatmentManager({ treatments, onAddManual }: { treatments: TreatmentDto[], onAddManual: () => void }) {
  const activeTreatments = treatments.filter(t => t.status === 'ACTIVE');

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Pill className="w-6 h-6 text-emerald-500" />
            Gestor de Tratamientos
          </h2>
          <p className="text-sm text-gray-500 mt-1">Mi pastillero y terapias activas</p>
        </div>
        <Button onClick={onAddManual} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Añadir Manual
        </Button>
      </div>

      {activeTreatments.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <Activity className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Sin tratamientos activos</h3>
          <p className="text-xs text-gray-500 mt-1">Tus medicamentos recetados o ingresados manualmente aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTreatments.map(t => (
            <div key={t.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${t.category === 'ONCOLOGY' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-600'}`}>
                  {t.route.toLowerCase().includes('intravenosa') ? <Syringe className="w-6 h-6" /> : <Pill className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {t.name}
                    {t.category === 'ONCOLOGY' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold tracking-wide">
                        ONCOLOGÍA
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 mt-0.5">{t.dosage} • {t.frequency}</p>
                  
                  {t.diagnosisName && (
                     <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1.5 font-medium bg-indigo-50 dark:bg-indigo-900/30 inline-block px-2 py-0.5 rounded-md">
                       Para: {t.diagnosisName} {t.cie10Code && `(${t.cie10Code})`}
                     </p>
                  )}

                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Inicio: {t.startDate} {t.prescriber ? `• Dr. ${t.prescriber}` : '• Manual'}
                  </p>
                  
                  {t.totalDoses && t.totalDoses > 0 ? (
                     <div className="mt-3 max-w-[200px]">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">
                           <span>Progreso</span>
                           <span>{t.dosesTaken || 0} / {t.totalDoses} dosis</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                           <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((t.dosesTaken || 0) / t.totalDoses) * 100)}%` }}></div>
                        </div>
                     </div>
                  ) : null}
                </div>
              </div>
              <div className="text-right">
                {t.nextDoseTime ? (
                  <>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Próxima Dosis</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{new Date(t.nextDoseTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <Button variant="outline" size="sm" className="mt-2 h-7 text-xs rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Marcar
                    </Button>
                  </>
                ) : (
                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100 font-medium">Al día</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
