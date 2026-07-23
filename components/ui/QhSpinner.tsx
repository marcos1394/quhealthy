'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface QhSpinnerProps {
  /** sm = 16px, md = 32px, lg = 48px */
  size?: 'sm' | 'md' | 'lg';
  /** Texto opcional que se muestra debajo del spinner */
  label?: string;
  /** Clases CSS adicionales */
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

const strokeWidths = {
  sm: 3.5,
  md: 3,
  lg: 2.5,
};

const gapSizes = {
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-3.5",
};

/**
 * QhSpinner — Componente de Carga Ecosistema QuHealthy
 *
 * Anillo de carga circular y fluido con acento esmeralda e indicador suave.
 */
export function QhSpinner({ size = 'md', label, className = '' }: QhSpinnerProps) {
  const dim = sizeClasses[size];
  const strokeWidth = strokeWidths[size];
  const gap = gapSizes[size];

  return (
    <div className={cn("inline-flex flex-col items-center justify-center font-sans", gap, className)}>
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          className={cn("animate-spin text-emerald-600 dark:text-emerald-400", dim)}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          {/* Anillo de Fondo (Track) */}
          <circle
            className="opacity-15 text-gray-400 dark:text-gray-600"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          {/* Arco Activo Giratorio */}
          <path
            className="opacity-95"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>

      {/* Label de Texto */}
      {label && (
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-normal text-center animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}