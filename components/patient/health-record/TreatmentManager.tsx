"use client";

import React from "react";
import { Pill, Syringe, Activity, Clock, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TreatmentDto {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  category: "ONCOLOGY" | "GENERAL" | "CARDIOLOGY" | "OTHER";
  startDate: string;
  endDate?: string;
  prescriber: string;
  status: "ACTIVE" | "COMPLETED" | "DISCONTINUED";
  nextDoseTime?: string;
}

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
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {t.name}
                    {t.category === 'ONCOLOGY' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold tracking-wide">
                        ONCOLOGÍA
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 mt-0.5">{t.dosage} • {t.frequency}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Recetado por: {t.prescriber || 'Manual'}
                  </p>
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
