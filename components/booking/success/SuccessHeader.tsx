"use client";

import React from "react";
import { Check, Mail } from "lucide-react";

interface Props {
  t: any;
  email?: string;
}

export function SuccessHeader({ t, email }: Props) {
  return (
    <div className="bg-white dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm mb-12">
      <div className="p-8 md:p-12 text-center flex flex-col items-center">
        {/* Sello de Aprobación */}
        <div className="w-20 h-20 rounded-full bg-quhealthy-green/10 dark:bg-emerald-900/30 flex items-center justify-center mb-8">
          <Check className="w-10 h-10 text-quhealthy-green dark:text-emerald-400" strokeWidth={3} />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t("title", { defaultValue: "Confirmación de Operación" })}
        </h1>

        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
          {t("subtitle", {
            defaultValue:
              "Su reserva y liquidación han sido procesadas exitosamente en la red.",
          })}
        </p>

        {email && (
          <div className="inline-flex items-center gap-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5">
            <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Comprobante emitido a: {email}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
