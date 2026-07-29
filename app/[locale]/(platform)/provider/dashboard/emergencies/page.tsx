"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, UserPlus, Activity } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useSessionStore } from "@/stores/SessionStore";
import {
  emergencyService,
  EmergencyQueueItem,
} from "@/services/emergency.service";

import { TriageMonitor } from "@/components/emergencies/TriageMonitor";
import { EmergencyConsole } from "@/components/emergencies/EmergencyConsole";
import { RegisterEmergencyModal } from "@/components/emergencies/RegisterEmergencyModal";

export default function EmergenciesPage() {
  const t = useTranslations("Emergencies");
  const { user } = useSessionStore();
  const [queue, setQueue] = useState<EmergencyQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] =
    useState<EmergencyQueueItem | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const fetchQueue = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await emergencyService.getEmergencyQueue(user.id);
      setQueue(data);
    } catch (error) {
      console.error(error);
      toast.error(t("toast_load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    fetchQueue();
    // Auto-actualización de la cola cada 30 segundos
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handlePatientSelect = (emergency: EmergencyQueueItem) => {
    setSelectedEmergency(emergency);
    setIsConsoleOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-rose-100 dark:selection:bg-rose-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 shadow-sm flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 px-3 py-1 text-xs font-bold shadow-sm">
                <span>{t("subtitle")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("title")}
              </h1>
            </div>
          </div>

          <Button
            onClick={() => setIsRegisterModalOpen(true)}
            className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 h-11 px-5 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_register")}</span>
          </Button>
        </div>

        {/* ── MONITOR CENTRAL SENSADO / TRIAGE ─────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden min-h-[600px] min-w-0">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center justify-between shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" strokeWidth={2} />
              <span>{t("monitor_title")}</span>
            </h2>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0a0a0a] px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm">
              {t("waiting_patients", { count: queue.length })}
            </span>
          </div>

          <div className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 overflow-x-auto">
            <TriageMonitor
              queue={queue}
              onPatientSelect={handlePatientSelect}
            />
          </div>
        </div>

      </div>

      {/* ── MODALES Y CONSOLA DE URGENCIAS ────────────────────────────── */}
      <RegisterEmergencyModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          setIsRegisterModalOpen(false);
          fetchQueue();
          toast.success(t("toast_register_success"));
        }}
      />

      {selectedEmergency && (
        <EmergencyConsole
          isOpen={isConsoleOpen}
          onClose={() => setIsConsoleOpen(false)}
          emergency={selectedEmergency}
          onUpdate={fetchQueue}
        />
      )}
    </div>
  );
}