"use client";

import React, { useState } from "react";
import { PregnancyProfileDto, womensHealthService } from "@/services/womensHealth.service";
import { Footprints, Waves } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

interface FetalMonitoringWidgetProps {
  pregnancy: PregnancyProfileDto;
}

export function FetalMonitoringWidget({ pregnancy }: FetalMonitoringWidgetProps) {
  const [movements, setMovements] = useState("");
  const [contractions, setContractions] = useState("");
  const [frequency, setFrequency] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMovements = async () => {
    if (!movements) return;
    setIsSaving(true);
    try {
      await womensHealthService.logPregnancyVitals(pregnancy.consumerId, {
        pregnancyProfileId: pregnancy.id,
        logDate: format(new Date(), "yyyy-MM-dd"),
        fetalMovementsCount: parseInt(movements, 10)
      });
      toast.success("Movimientos registrados");
      setMovements("");
    } catch (e) {
      toast.error("Error al registrar movimientos");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContractions = async () => {
    if (!contractions) return;
    setIsSaving(true);
    try {
      await womensHealthService.logPregnancyVitals(pregnancy.consumerId, {
        pregnancyProfileId: pregnancy.id,
        logDate: format(new Date(), "yyyy-MM-dd"),
        contractionsCount: parseInt(contractions, 10),
        contractionsFrequencyMins: frequency ? parseInt(frequency, 10) : undefined
      });
      toast.success("Contracciones registradas");
      setContractions("");
      setFrequency("");
    } catch (e) {
      toast.error("Error al registrar contracciones");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
      <h3 className="font-bold text-gray-900 dark:text-white mb-6">Monitoreo Fetal y Uterino</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Movimientos Fetales</p>
              <p className="text-xs text-gray-500">Conteo diario</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input 
              type="number" 
              placeholder="Cantidad" 
              value={movements}
              onChange={(e) => setMovements(e.target.value)}
              className="flex-1 min-w-[100px] bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
              disabled={!movements || isSaving}
              onClick={handleSaveMovements}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Contracciones</p>
              <p className="text-xs text-gray-500">Frecuencia y cantidad</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input 
              type="number" 
              placeholder="Cant." 
              value={contractions}
              onChange={(e) => setContractions(e.target.value)}
              className="flex-1 min-w-[70px] bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input 
              type="number" 
              placeholder="Minutos" 
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="flex-[2] min-w-[100px] bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button 
              disabled={!contractions || isSaving}
              onClick={handleSaveContractions}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
