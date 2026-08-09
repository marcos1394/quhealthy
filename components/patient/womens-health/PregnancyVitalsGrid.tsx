"use client";

import React, { useState } from "react";
import { PregnancyProfileDto, womensHealthService } from "@/services/womensHealth.service";
import { Weight, Activity, Droplet } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

interface PregnancyVitalsGridProps {
  pregnancy: PregnancyProfileDto;
}

export function PregnancyVitalsGrid({ pregnancy }: PregnancyVitalsGridProps) {
  const [weight, setWeight] = useState("");
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [glucose, setGlucose] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (type: "weight" | "bp" | "glucose") => {
    setIsSaving(true);
    try {
      const payload: any = {
        pregnancyProfileId: pregnancy.id,
        logDate: format(new Date(), "yyyy-MM-dd"),
      };

      if (type === "weight" && weight) payload.weightKg = parseFloat(weight);
      if (type === "bp" && bpSys && bpDia) {
        payload.bloodPressureSystolic = parseInt(bpSys, 10);
        payload.bloodPressureDiastolic = parseInt(bpDia, 10);
      }
      if (type === "glucose" && glucose) payload.glucoseLevel = parseInt(glucose, 10);

      await womensHealthService.logPregnancyVitals(pregnancy.consumerId, payload);
      toast.success("Vítales guardados");

      if (type === "weight") setWeight("");
      if (type === "bp") { setBpSys(""); setBpDia(""); }
      if (type === "glucose") setGlucose("");

    } catch (e) {
      toast.error("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-3">
          <Weight className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Peso Materno</h3>
        <div className="flex w-full items-center gap-2 mt-auto">
          <input 
            type="number" 
            placeholder="kg" 
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            disabled={!weight || isSaving}
            onClick={() => handleSave("weight")}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Presión Arterial</h3>
        <div className="flex w-full items-center gap-1 mt-auto">
          <input 
            type="number" 
            placeholder="Sys" 
            value={bpSys}
            onChange={(e) => setBpSys(e.target.value)}
            className="w-16 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-center"
          />
          <span className="text-gray-400">/</span>
          <input 
            type="number" 
            placeholder="Dia" 
            value={bpDia}
            onChange={(e) => setBpDia(e.target.value)}
            className="w-16 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-center"
          />
          <button 
            disabled={!bpSys || !bpDia || isSaving}
            onClick={() => handleSave("bp")}
            className="ml-auto bg-red-600 hover:bg-red-700 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mb-3">
          <Droplet className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Glucosa</h3>
        <div className="flex w-full items-center gap-2 mt-auto">
          <input 
            type="number" 
            placeholder="mg/dL" 
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button 
            disabled={!glucose || isSaving}
            onClick={() => handleSave("glucose")}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
