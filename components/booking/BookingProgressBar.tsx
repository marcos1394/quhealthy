"use client";

import React from "react";
import { Check, Calendar, User, CreditCard, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BookingProgressBarProps {
  currentStep: number;
  hasLocationOrStaff: boolean;
  requiresScheduling: boolean;
  safeColor?: string;
  labels?: {
    locationStaff?: string;
    dateTime?: string;
    patient?: string;
    payment?: string;
  };
}

export const BookingProgressBar: React.FC<BookingProgressBarProps> = ({
  currentStep,
  hasLocationOrStaff,
  requiresScheduling,
  safeColor = "#059669",
  labels,
}) => {
  const steps = [];

  if (hasLocationOrStaff) {
    steps.push({
      id: "location_staff",
      label: labels?.locationStaff || "Sede y Especialista",
      icon: Building2,
    });
  }

  if (requiresScheduling) {
    steps.push({
      id: "datetime",
      label: labels?.dateTime || "Fecha y Hora",
      icon: Calendar,
    });
  }

  steps.push({
    id: "patient",
    label: labels?.patient || "Paciente",
    icon: User,
  });

  steps.push({
    id: "payment",
    label: labels?.payment || "Confirmación y Pago",
    icon: CreditCard,
  });

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 py-3 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Conector */}
              {idx > 0 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 sm:mx-4 transition-colors duration-300",
                    isCompleted
                      ? "bg-emerald-500 dark:bg-emerald-400"
                      : "bg-gray-200 dark:bg-gray-800"
                  )}
                  style={isCompleted ? { backgroundColor: safeColor } : undefined}
                />
              )}

              {/* Paso */}
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-2xs",
                    isCompleted
                      ? "text-white"
                      : isActive
                      ? "text-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0a0a0a]"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
                  )}
                  style={
                    isCompleted || isActive
                      ? ({ backgroundColor: safeColor, "--tw-ring-color": safeColor } as React.CSSProperties)
                      : undefined
                  }
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold hidden md:inline-block transition-colors",
                    isActive
                      ? "text-gray-900 dark:text-white font-bold"
                      : isCompleted
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
