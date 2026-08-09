"use client";

import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Activity, ShieldAlert, FileText, Droplet, Brain } from "lucide-react";
import { womensHealthService, CyclePredictionDto, MenstrualCycleLog, CycleAiInsightDto, MenstrualSymptomLog } from "@/services/womensHealth.service";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface Props {
  consumerId: number;
}

export function WomensHealthProviderPanel({ consumerId }: Props) {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [prediction, setPrediction] = useState<CyclePredictionDto | null>(null);
  const [cycles, setCycles] = useState<MenstrualCycleLog[]>([]);
  const [symptoms, setSymptoms] = useState<MenstrualSymptomLog[]>([]);
  const [insights, setInsights] = useState<CycleAiInsightDto | null>(null);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const consent = await womensHealthService.checkConsent(consumerId);
        setHasConsent(consent);

        if (consent) {
          const [predData, cycleLogs, aiData, symptomLogs] = await Promise.all([
            womensHealthService.getPrediction(consumerId),
            womensHealthService.getCycleLogs(consumerId),
            womensHealthService.getAiInsights(consumerId),
            // Obtener síntomas de los últimos 30 días para no sobrecargar
            womensHealthService.getSymptomLogs(
              consumerId, 
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              new Date().toISOString().split('T')[0]
            )
          ]);
          setPrediction(predData);
          setCycles(cycleLogs);
          setInsights(aiData);
          setSymptoms(symptomLogs);
        }
      } catch (error) {
        console.error("Error fetching womens health for provider:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviderData();
  }, [consumerId]);

  if (loading) {
    return <div className="flex justify-center p-6"><QhSpinner /></div>;
  }

  if (hasConsent === false) {
    return (
      <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center">
        <ShieldAlert className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <h4 className="text-gray-900 dark:text-white font-medium mb-1">Acceso Restringido</h4>
        <p className="text-sm text-gray-500">
          La paciente no ha otorgado el consentimiento expreso para compartir su historial de salud reproductiva y ciclo menstrual.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Predicción actual */}
        {prediction && (
          <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl p-5">
            <h4 className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4" /> Estado Actual
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Próximo Periodo:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {format(parseISO(prediction.nextPeriodStartDate), "d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Ventana Fértil:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {format(parseISO(prediction.fertileWindowStart), "d 'de' MMM", { locale: es })} - {format(parseISO(prediction.fertileWindowEnd), "d 'de' MMM", { locale: es })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights para el médico */}
        {insights && (
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-5">
            <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4" /> IA Insights (Gemini)
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {insights.aiSummary}
            </p>
            {insights.identifiedPatterns.length > 0 && (
              <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400 list-disc list-inside">
                {insights.identifiedPatterns.slice(0, 2).map((pattern, i) => (
                  <li key={i}>{pattern}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Historial de Ciclos */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-gray-50 dark:bg-[#111111] p-3 border-b border-gray-200 dark:border-gray-800">
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Droplet className="w-4 h-4 text-pink-500" />
            Últimos Ciclos Registrados
          </h4>
        </div>
        {cycles.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">No hay ciclos registrados</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-4 py-2 font-medium">Inicio</th>
                <th className="px-4 py-2 font-medium">Fin</th>
                <th className="px-4 py-2 font-medium">Intensidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#0a0a0a]">
              {cycles.slice(0, 3).map((cycle, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                    {format(parseISO(cycle.startDate), "dd/MM/yy")}
                  </td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                    {cycle.endDate ? format(parseISO(cycle.endDate), "dd/MM/yy") : 'Actual'}
                  </td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                    <span className="capitalize">{cycle.intensity.toLowerCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Historial de Síntomas Recientes */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-gray-50 dark:bg-[#111111] p-3 border-b border-gray-200 dark:border-gray-800">
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-500" />
            Síntomas (Últimos 30 días)
          </h4>
        </div>
        {symptoms.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">No se registraron síntomas recientemente</div>
        ) : (
          <div className="p-4 space-y-3 bg-white dark:bg-[#0a0a0a]">
            {symptoms.slice(0, 4).map((sym, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {format(parseISO(sym.logDate), "dd/MM/yyyy")}
                  <span className="text-gray-500 ml-2 font-normal">Dolor: {sym.painLevel}/10</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sym.symptoms.map(s => (
                    <span key={s} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
