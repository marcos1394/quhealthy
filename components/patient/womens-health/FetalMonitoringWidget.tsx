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

  const inputClass =
    "bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  const handleSaveMovements = async () => {
    if (!movements) return;
    setIsSaving(true);
    try {
      await womensHealthService.logPregnancyVitals(pregnancy.consumerId, {
        pregnancyProfileId: pregnancy.id,
        logDate: format(new Date(), "yyyy-MM-dd"),
        fetalMovementsCount: parseInt(movements, 10),
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
        contractionsFrequencyMins: frequency ? parseInt(frequency, 10) : undefined,
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
      <h3 className="font-bold text-gray-900 dark:text-white mb-5 text-base">Monitoreo Fetal y Uterino</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Movimientos Fetales */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Movimientos Fetales</p>
              <p className="text-xs text-gray-500">Conteo diario</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              placeholder="Cantidad"
              value={movements}
              onChange={(e) => setMovements(e.target.value)}
              className={`flex-1 min-w-[100px] ${inputClass}`}
            />
            <button
              disabled={!movements || isSaving}
              onClick={handleSaveMovements}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
            >
              Guardar
            </button>
          </div>
        </div>

        {/* Contracciones */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl flex items-center justify-center shrink-0">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Contracciones</p>
              <p className="text-xs text-gray-500">Frecuencia y cantidad</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              placeholder="Cant."
              value={contractions}
              onChange={(e) => setContractions(e.target.value)}
              className={`flex-1 min-w-[70px] ${inputClass}`}
            />
            <input
              type="number"
              placeholder="Minutos"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className={`flex-[2] min-w-[100px] ${inputClass}`}
            />
            <button
              disabled={!contractions || isSaving}
              onClick={handleSaveContractions}
              className="w-full sm:w-auto bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
