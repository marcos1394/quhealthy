"use client";

import React from "react";
import { MessageSquare, RotateCcw, XCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

export function AppointmentActionsCard({
  status,
  paymentStatus,
  handleStartChat,
  isStartingChat,
  isConfirmed,
  onConfirmAttendance,
  isConfirming,
}: {
  status: string;
  paymentStatus: string;
  handleStartChat: () => void;
  isStartingChat: boolean;
  isConfirmed?: boolean;
  onConfirmAttendance?: () => void;
  isConfirming?: boolean;
}) {
  const t = useTranslations("AppointmentDetails.actions");

  return (
    <div className="space-y-4 font-sans">
      {status === "SCHEDULED" && (
        <div className="mb-2">
          {isConfirmed ? (
            <div
              data-testid="attendance-confirmed-badge"
              className="w-full h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 px-4 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Asistencia Confirmada</span>
            </div>
          ) : (
            <Button
              type="button"
              data-testid="confirm-attendance-btn"
              onClick={onConfirmAttendance}
              disabled={isConfirming}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 px-4 disabled:opacity-50"
            >
              {isConfirming ? (
                <QhSpinner size="sm" className="text-white" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Confirmar Asistencia</span>
            </Button>
          )}
        </div>
      )}

      {(status === "SCHEDULED" || status === "COMPLETED") &&
        paymentStatus === "SETTLED" && (
          <Button
            type="button"
            onClick={handleStartChat}
            disabled={isStartingChat}
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-between px-6 disabled:opacity-50"
          >
            <span>{t("msg_provider")}</span>
            {isStartingChat ? (
              <QhSpinner size="sm" className="text-white" />
            ) : (
              <MessageSquare className="w-4 h-4" strokeWidth={2} />
            )}
          </Button>
        )}

      {status === "SCHEDULED" && (
        <div className="flex flex-col gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-colors flex items-center justify-start gap-2.5 px-4 shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{t("reschedule")}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-bold transition-colors flex items-center justify-start gap-2.5 px-4 shadow-sm"
          >
            <XCircle className="w-4 h-4 text-red-500" strokeWidth={2} />
            <span>{t("cancel")}</span>
          </Button>
        </div>
      )}
    </div>
  );
}