"use client";

import React from "react";
import { Milk, Clock, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BreastfeedingTrackerWidget({ logs, onAddLog }: { logs: any[], onAddLog: () => void }) {
  const latestLog = logs && logs.length > 0 ? logs[0] : null;

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center">
            <Milk className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lactancia</h3>
            <p className="text-sm text-gray-500">Toma más reciente</p>
          </div>
        </div>
        <Button onClick={onAddLog} variant="outline" className="text-xs h-8">
          + Registrar
        </Button>
      </div>

      {latestLog && latestLog.breastfeedingDurationMins ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Clock className="w-5 h-5 text-gray-400 mb-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{latestLog.breastfeedingDurationMins}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Minutos</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <RotateCw className="w-5 h-5 text-gray-400 mb-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{latestLog.breastfeedingFrequency || 0}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Tomas / Día</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 mb-4">No hay registros recientes de lactancia.</p>
          <Button onClick={onAddLog} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            Comenzar a registrar
          </Button>
        </div>
      )}
    </div>
  );
}
