"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { BaseWidget } from "@quhealthy/health-os-contract";

import {
  DoctorCardWidget,
  DoctorGalleryWidget,
  CalendarWidget,
  AppointmentWidget,
  PaymentWidget,
  VaultDocumentWidget,
  ServiceGalleryWidget,
  AppointmentListWidget,
  WalletWidget,
  OrderWidget,
  BookingCheckoutWidget,
  DependentWidget,
  VaccinationWidget,
  GrowthWidget,
  EldercareWidget,
} from "../widgets";
import { useActionEngine } from "@/hooks/useActionEngine";

interface Props {
  widgets: BaseWidget[];
}

// Mapa de componentes para reemplazo limpio del switch-case
const WIDGET_MAP: Record<
  string,
  React.ComponentType<{ widget: any; onAction: any }>
> = {
  DoctorCardWidget,
  DoctorGalleryWidget,
  CalendarWidget,
  AppointmentWidget,
  PaymentWidget,
  VaultDocumentWidget,
  ServiceGalleryWidget,
  AppointmentListWidget,
  WalletWidget,
  OrderWidget,
  BookingCheckoutWidget,
  DependentWidget,
  VaccinationWidget,
  GrowthWidget,
  EldercareWidget,
};

export const WidgetRenderer: React.FC<Props> = ({ widgets }) => {
  const t = useTranslations("WidgetRenderer");
  const { dispatchAction } = useActionEngine();

  if (!widgets || widgets.length === 0) return null;

  return (
    <div className="flex flex-col gap-3.5 w-full max-w-full min-w-0 my-2 font-sans">
      {widgets.map((widget, index) => {
        const WidgetComponent = WIDGET_MAP[widget.type];

        return (
          <motion.div
            key={widget.id || index}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.35,
              delay: index * 0.05,
              ease: "easeOut",
            }}
            className="w-full max-w-full min-w-0 overflow-hidden"
          >
            {WidgetComponent ? (
              <WidgetComponent
                widget={widget as any}
                onAction={dispatchAction}
              />
            ) : (
              /* Estado de Fallback para módulos no reconocidos */
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 flex items-start gap-3 text-xs font-semibold shadow-2xs font-sans w-full max-w-md min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
                  <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="font-bold">{t("unsupported_module")}</p>
                  <p className="text-[11px] font-medium text-amber-700/80 dark:text-amber-400/80">
                    {t("unrecognized_type")}{" "}
                    <code className="font-mono bg-amber-100/50 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md break-all">
                      {widget.type}
                    </code>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};