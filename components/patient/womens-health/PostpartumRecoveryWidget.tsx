"use client";

import React from "react";
import { HeartPulse, Smile, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PostpartumRecoveryWidget({ logs, onAddLog }: { logs: any[], onAddLog: () => void }) {
  // Get latest log
  const latestLog = logs && logs.length > 0 ? logs[0] : null;

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-xl flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recuperación</h3>
            <p className="text-sm text-gray-500">Estado físico y emocional</p>
          </div>
        </div>
        <Button onClick={onAddLog} variant="outline" className="text-xs h-8">
          Actualizar Estado
        </Button>
      </div>

      {latestLog ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Smile className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado Emocional</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">{latestLog.emotionalStateScore}/10</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nivel de Dolor</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">{latestLog.painLevel}/10</span>
          </div>
          
          {latestLog.emotionalStateScore <= 4 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-xl flex items-start gap-2 mt-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Monitoreo de Ánimo</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Hemos notado que tu estado de ánimo ha estado bajo. Es muy normal en el postparto (baby blues), pero si persiste, habla con tu médico.</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">Aún no has registrado tu estado de recuperación.</p>
        </div>
      )}
    </div>
  );
}

// Temporary internal component for Activity icon
function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2" />
    </svg>
  )
}
