"use client";

import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Activity, Droplet, CalendarRange } from "lucide-react";
import { womensHealthService, MenstrualCycleLog } from "@/services/womensHealth.service";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface Props {
  consumerId: number;
}

export function CycleHistoryTable({ consumerId }: Props) {
  const [cycles, setCycles] = useState<MenstrualCycleLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await womensHealthService.getCycleLogs(consumerId);
        setCycles(data.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
      } catch (error) {
        console.error("Error fetching cycle history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [consumerId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800">
        <QhSpinner />
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 text-center">
        <CalendarRange className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-gray-900 dark:text-white font-semibold">Sin historial</h3>
        <p className="text-gray-500 text-sm">Aún no has registrado ningún ciclo.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f0f]">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-pink-500" />
          Historial de Ciclos
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-[#121212] border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 font-medium">Fecha de Inicio</th>
              <th className="px-6 py-4 font-medium">Fecha de Fin</th>
              <th className="px-6 py-4 font-medium">Intensidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {cycles.map((cycle, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-[#111111] transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                  {format(parseISO(cycle.startDate), "d 'de' MMMM, yyyy", { locale: es })}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {cycle.endDate 
                    ? format(parseISO(cycle.endDate), "d 'de' MMMM, yyyy", { locale: es })
                    : <span className="text-pink-500 text-xs bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-full">Actual</span>
                  }
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <Droplet className={`w-4 h-4 ${
                      cycle.intensity === 'HEAVY' ? 'text-red-500 fill-red-500' :
                      cycle.intensity === 'MEDIUM' ? 'text-pink-500 fill-pink-500' :
                      cycle.intensity === 'LIGHT' ? 'text-pink-300 fill-pink-300' : 'text-gray-400'
                    }`} />
                    <span className="capitalize">{cycle.intensity?.toLowerCase() || "-"}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
