"use client";

import React from "react";
import { Building2, ShieldCheck, Users, HeartHandshake, CheckCircle2 } from "lucide-react";

interface FoundationOnboardingHeaderProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { step: 1, title: "Identidad", icon: Building2, subtitle: "Datos y Causa" },
  { step: 2, title: "Legal & Fiscal", icon: ShieldCheck, subtitle: "KYB & Documentos" },
  { step: 3, title: "Equipo", icon: Users, subtitle: "Colaboradores" },
  { step: 4, title: "Primer Programa", icon: HeartHandshake, subtitle: "Causa y Apoyos" },
  { step: 5, title: "Verificación", icon: CheckCircle2, subtitle: "Activación" },
];

export const FoundationOnboardingHeader: React.FC<FoundationOnboardingHeaderProps> = ({
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 py-6 px-4 sm:px-8 transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Building2 className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Registro Institucional
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Onboarding de Fundación / Institución Social
              </h1>
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span>Paso {currentStep} de 5</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {Math.round((currentStep / 5) * 100)}% Completado
            </span>
          </div>
        </div>

        {/* Stepper Bar */}
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {STEPS.map((item) => {
            const Icon = item.icon;
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div
                key={item.step}
                role="button"
                tabIndex={0}
                onClick={() => onStepClick && onStepClick(item.step)}
                onKeyDown={(e) => e.key === "Enter" && onStepClick && onStepClick(item.step)}
                className={`flex flex-col items-center text-center p-2 rounded-xl transition-all cursor-pointer select-none ${
                  isCurrent
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                    : isDone
                    ? "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111]"
                    : "text-gray-400 opacity-60 pointer-events-none"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 transition-all text-xs font-bold ${
                    isCurrent
                      ? "bg-emerald-600 text-white shadow-xs"
                      : isDone
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <p className="text-[11px] font-bold truncate w-full">{item.title}</p>
                <p className="hidden md:block text-[9px] text-gray-400 truncate">{item.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
