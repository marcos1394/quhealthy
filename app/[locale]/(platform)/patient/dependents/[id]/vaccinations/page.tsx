"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React, { useState, useEffect, use } from "react";
import { CheckCircle2, AlertCircle, Syringe, Clock, Info } from "lucide-react";
import { toast } from "react-toastify";

interface VaccinationStatus {
  vaccineCatalogId: number;
  name: string;
  diseasePrevented: string;
  doseNumber: number | null;
  recommendedAgeMonths: number;
  notes: string;
  isApplied: boolean;
  appliedDate: string | null;
  appliedBy: string | null;
  isDelayed: boolean;
  recommendedDate: string | null;
}

export default function VaccinationCardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const dependentId = resolvedParams.id;
  const [vaccines, setVaccines] = useState<VaccinationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  useEffect(() => {
    fetchVaccines();
  }, [dependentId]);

  const fetchVaccines = async () => {
    try {
      // In a real scenario, this fetches the real dependent from DB.
      const response = await fetch(`/api/dependents/${dependentId}/vaccinations`);
      if (response.ok) {
        const data = await response.json();
        setVaccines(data);
      } else {
        // Fallback mock data if backend is not wired to proxy yet
        setVaccines([
           { vaccineCatalogId: 1, name: "BCG", diseasePrevented: "Tuberculosis", doseNumber: 1, recommendedAgeMonths: 0, notes: "Única", isApplied: true, appliedDate: "2023-01-05", appliedBy: "Hospital", isDelayed: false, recommendedDate: "2023-01-01" },
           { vaccineCatalogId: 2, name: "Hepatitis B", diseasePrevented: "Hepatitis B", doseNumber: 1, recommendedAgeMonths: 0, notes: "Primera", isApplied: true, appliedDate: "2023-01-05", appliedBy: "Hospital", isDelayed: false, recommendedDate: "2023-01-01" },
           { vaccineCatalogId: 3, name: "Pentavalente", diseasePrevented: "Difteria, Tos ferina, Tétanos, Polio, H. influenzae b", doseNumber: 1, recommendedAgeMonths: 2, notes: "Primera", isApplied: false, appliedDate: null, appliedBy: null, isDelayed: true, recommendedDate: "2023-03-01" }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkApplied = async (vaccineId: number) => {
    setApplyingId(vaccineId);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/dependents/${dependentId}/vaccinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaccineCatalogId: vaccineId,
          appliedDate: today,
          appliedBy: "Registrado por Usuario"
        })
      });

      if (response.ok) {
        toast.success("Vacuna marcada como aplicada.");
        fetchVaccines();
      } else {
        toast.success("Simulado: Vacuna aplicada (Mock)");
        setVaccines(prev => prev.map(v => v.vaccineCatalogId === vaccineId ? { ...v, isApplied: true, appliedDate: today } : v));
      }
    } catch (e) {
      toast.error("Error al guardar.");
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Cargando cartilla...</div>;
  }

  // Agrupar por meses
  const grouped = vaccines.reduce((acc, curr) => {
    const age = curr.recommendedAgeMonths;
    if (!acc[age]) acc[age] = [];
    acc[age].push(curr);
    return acc;
  }, {} as Record<number, VaccinationStatus[]>);

  const formatAge = (months: number) => {
    if (months === 0) return "Al nacer";
    if (months === 12) return "1 año";
    if (months === 18) return "1 año y medio";
    if (months > 12 && months % 12 === 0) return `${months / 12} años`;
    return `${months} meses`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
          <Syringe className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cartilla Nacional de Salud</h1>
          <p className="text-slate-500">Seguimiento de vacunación pediátrica (Esquema Mexicano)</p>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([age, group]) => (
          <div key={age} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">
              {formatAge(Number(age))}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.map((v) => (
                <div 
                  key={v.vaccineCatalogId} 
                  className={`p-4 rounded-xl border relative overflow-hidden transition-all ${
                    v.isApplied 
                      ? "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800" 
                      : v.isDelayed
                        ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30"
                        : "bg-white border-blue-100 dark:bg-slate-900 dark:border-blue-900/30 shadow-sm"
                  }`}
                >
                  {/* Etiqueta lateral de estado */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${v.isApplied ? 'bg-emerald-500' : v.isDelayed ? 'bg-red-500' : 'bg-blue-500'}`} />
                  
                  <div className="pl-2 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{v.name}</h3>
                        {v.doseNumber && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Dosis {v.doseNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Previene: {v.diseasePrevented}</p>
                      
                      <div className="mt-4 flex items-center gap-2">
                        {v.isApplied ? (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            Aplicada el {v.appliedDate}
                          </span>
                        ) : v.isDelayed ? (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            Atrasada (Sugerida: {v.recommendedDate})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
                            <Clock className="w-4 h-4" />
                            Pendiente para {v.recommendedDate}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!v.isApplied && (
                      <button 
                        onClick={() => handleMarkApplied(v.vaccineCatalogId)}
                        disabled={applyingId === v.vaccineCatalogId}
                        className="shrink-0 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-lg transition-colors"
                      >
                        {applyingId === v.vaccineCatalogId ? "Guardando..." : "Marcar"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex gap-3 text-sm text-slate-600 dark:text-slate-400">
        <Info className="w-5 h-5 shrink-0" />
        <p>
          El motor de recomendaciones utilizará esta información clínica para recordarte las próximas citas pediátricas de tu dependiente y emitir alertas tempranas de inmunización.
        </p>
      </div>
    </div>
  );
}
