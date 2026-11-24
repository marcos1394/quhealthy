"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[QuHealthy GlobalError]", error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen flex items-center justify-center p-6 bg-gray-50 text-gray-900 font-sans">
        <div className="max-w-md w-full rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm space-y-4">
          <h1 className="text-xl font-bold tracking-tight">
            Error inesperado en QuHealthy
          </h1>
          <p className="text-sm text-gray-600">
            No pudimos cargar la aplicación correctamente. Por favor intenta recargar la página.
          </p>
          {error?.digest && (
            <p className="text-xs font-mono text-gray-400">Ref: {error.digest}</p>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="h-10 px-5 rounded-xl bg-emerald-600 text-white text-sm font-semibold cursor-pointer"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="h-10 px-5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold inline-flex items-center cursor-pointer"
            >
              Inicio
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
