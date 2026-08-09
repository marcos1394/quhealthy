"use client";

import React, { useState } from "react";
import { PregnancyProfileDto, womensHealthService } from "@/services/womensHealth.service";
import { Weight, Activity, Droplet } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

interface PregnancyVitalsGridProps {
  pregnancy: PregnancyProfileDto;
}

interface VitalCardProps {
  icon: React.ElementType;
  label: string;
  accentClass: string; // for icon bg/text
  children: React.ReactNode;
}

function VitalCard({ icon: Icon, label, accentClass, children }: VitalCardProps) {
  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accentClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
      </div>
      {children}
    </div>
  );
}

export function PregnancyVitalsGrid({ pregnancy }: PregnancyVitalsGridProps) {
  const [weight, setWeight] = useState("");
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [glucose, setGlucose] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const inputClass =
    "flex-1 min-w-[70px] bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  const saveBtn = (color: string) =>
    `w-full sm:w-auto ${color} text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed`;

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
      toast.success("Registro guardado correctamente");

      if (type === "weight") setWeight("");
      if (type === "bp") { setBpSys(""); setBpDia(""); }
      if (type === "glucose") setGlucose("");
    } catch (e) {
      toast.error("Error al guardar el registro");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <VitalCard icon={Weight} label="Peso Materno" accentClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={inputClass}
          />
          <button
            disabled={!weight || isSaving}
            onClick={() => handleSave("weight")}
            className={saveBtn("bg-emerald-600 hover:bg-emerald-700")}
          >
            Guardar
          </button>
        </div>
      </VitalCard>

      <VitalCard icon={Activity} label="Presión Arterial" accentClass="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            type="number"
            placeholder="Sys"
            value={bpSys}
            onChange={(e) => setBpSys(e.target.value)}
            className={`${inputClass} text-center`}
          />
          <span className="text-gray-400 font-semibold">/</span>
          <input
            type="number"
            placeholder="Dia"
            value={bpDia}
            onChange={(e) => setBpDia(e.target.value)}
            className={`${inputClass} text-center`}
          />
          <button
            disabled={!bpSys || !bpDia || isSaving}
            onClick={() => handleSave("bp")}
            className={`${saveBtn("bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500")} w-full`}
          >
            Guardar
          </button>
        </div>
      </VitalCard>

      <VitalCard icon={Droplet} label="Glucosa" accentClass="bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400">
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            placeholder="mg/dL"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            className={inputClass}
          />
          <button
            disabled={!glucose || isSaving}
            onClick={() => handleSave("glucose")}
            className={saveBtn("bg-pink-600 hover:bg-pink-700")}
          >
            Guardar
          </button>
        </div>
      </VitalCard>
    </div>
  );
}
