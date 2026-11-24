"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[QuHealthy ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-6 bg-gray-50 dark:bg-[#050505]">
      <div className="max-w-md w-full rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 text-center shadow-sm space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-7 h-7" strokeWidth={2} />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Algo salió mal / Something went wrong
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Ocurrió un error inesperado al renderizar esta vista. Puedes reintentar sin perder tu sesión.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-gray-400 pt-1">
              Ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>
          <Link
            href="/"
            className="h-10 px-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ir al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
