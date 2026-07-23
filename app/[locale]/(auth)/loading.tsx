import React from "react";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function AuthLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-50/80 dark:bg-[#050505]/80 backdrop-blur-md transition-all duration-300 selection:bg-emerald-100 dark:selection:bg-emerald-950/30 font-sans">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center space-y-4 max-w-xs w-full mx-4 text-center">
        
        {/* Contenedor del Spinner */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shadow-sm">
          <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* Mensajes de Estado */}
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white animate-pulse">
            Verificando Credenciales
          </h3>
          <p className="text-[11px] font-medium text-gray-400">
            Accediendo al sistema de forma segura...
          </p>
        </div>

        {/* Marca */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 w-full">
          <span className="text-xs font-bold tracking-tight text-gray-900 dark:text-white">
            QuHealthy<span className="text-emerald-600 dark:text-emerald-400">.</span>
          </span>
        </div>

      </div>
    </div>
  );
}