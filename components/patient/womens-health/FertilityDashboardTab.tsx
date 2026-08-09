"use client";

import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Brain, CalendarHeart, Sparkles, UserPlus, Thermometer, TestTube2, Heart } from "lucide-react";
import { womensHealthService, FertilityAiInsightDto, FertilityLog } from "@/services/womensHealth.service";
import { LogFertilityModal } from "./LogFertilityModal";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useRouter } from "next/navigation";

interface Props {
  consumerId: number;
}

export function FertilityDashboardTab({ consumerId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logs, setLogs] = useState<FertilityLog[]>([]);
  const [insights, setInsights] = useState<FertilityAiInsightDto | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [history, ai] = await Promise.all([
        womensHealthService.getFertilityLogs(consumerId),
        womensHealthService.getFertilityInsights(consumerId)
      ]);
      setLogs(history);
      setInsights(ai);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [consumerId]);

  if (loading) {
    return <div className="py-20 flex justify-center"><QhSpinner /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Encabezado / CTA Principal */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-900/10 p-6 md:p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <CalendarHeart className="w-6 h-6 text-indigo-500" /> Seguimiento de Fertilidad
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Registra tu temperatura basal, pruebas de ovulación (LH) y moco cervical para encontrar tu ventana de máxima fertilidad.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" /> Registrar Parámetros
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* IA Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-500/10 rounded-bl-full -z-0" />
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4 relative z-10">
              <Brain className="w-5 h-5 text-purple-500" /> Análisis IA de Fertilidad
            </h3>

            {insights ? (
              <div className="space-y-4 relative z-10">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  {insights.aiSummary}
                </p>
                
                {insights.identifiedPatterns.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/30">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 text-sm mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Observaciones Clave
                    </h4>
                    <ul className="text-xs space-y-1.5 text-gray-600 dark:text-gray-400">
                      {insights.identifiedPatterns.map((p, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-purple-400">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.recommendGynecologist && (
                  <div className="mt-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30">
                    <h4 className="font-semibold text-rose-800 dark:text-rose-300 text-sm mb-2">
                      Sugerencia Médica
                    </h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {insights.recommendationReason}
                    </p>
                    <button
                      onClick={() => router.push(`/${es}/patient/directory?specialty=Ginecología`)}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" /> Buscar Especialista en Fertilidad
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                No hay suficientes datos para generar recomendaciones.
              </div>
            )}
          </div>
        </div>

        {/* Historial Reciente */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Últimos Registros</h3>
          
          {logs.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-6">
              Aún no has registrado métricas de fertilidad.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 5).map((log, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-gray-50/50 dark:bg-[#111111] border border-gray-100 dark:border-gray-800 text-xs">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {format(parseISO(log.logDate), "d 'de' MMMM", { locale: es })}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                    {log.basalTemperature && (
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-orange-500" /> {log.basalTemperature} °C
                      </div>
                    )}
                    {log.ovulationTestResult && (
                      <div className="flex items-center gap-1.5">
                        <TestTube2 className="w-3.5 h-3.5 text-purple-500" /> LH: {log.ovulationTestResult}
                      </div>
                    )}
                    {log.intercourse && (
                      <div className="flex items-center gap-1.5 text-pink-500">
                        <Heart className="w-3.5 h-3.5 fill-pink-500" /> Íntima
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <LogFertilityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        consumerId={consumerId}
        onSuccess={fetchData}
      />
    </div>
  );
}
