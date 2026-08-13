"use client";

/* eslint-disable react-doctor/prefer-useReducer */

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import { Calendar, Plus } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Hooks & Types
import { useAppointments } from "@/hooks/useAppointment";
import { AppointmentResponse } from "@/types/appointments";

// Modular Components
import { AppointmentStats } from "@/components/appointments/AppointmentStats";
import {
  AppointmentFilters,
  TabValue,
  SortValue,
} from "@/components/appointments/AppointmentFilters";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { AppointmentEmptyState } from "@/components/appointments/AppointmentEmptyState";

export default function ConsumerAppointmentsPage() {
  const router = useRouter();
  const t = useTranslations("PatientAppointments");

  // 🚀 HOOK PRINCIPAL: Extrae la data real de Spring Boot
  const { appointments, isLoading, fetchAppointments, cancelAppointment } =
    useAppointments();

  // Estados locales de la UI
  const [activeTab, setActiveTab] = useState<TabValue>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("date");
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelModalState, setCancelModalState] = useState<{
    isOpen: boolean;
    appointment: AppointmentResponse | null;
  }>({
    isOpen: false,
    appointment: null,
  });

  // Al cargar la página, traemos los datos
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // 🧮 CÁLCULO DE ESTADÍSTICAS (Memorizado para rendimiento)
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: appointments.length,
      upcoming: appointments.filter(
        (a) =>
          a.status === "SCHEDULED" ||
          a.status === "PENDING_PAYMENT" ||
          a.status === "IN_PROGRESS" ||
          (new Date(a.endTime || a.startTime) >= now && a.status !== "COMPLETED" && a.status !== "CANCELED_BY_CONSUMER" && a.status !== "CANCELED_BY_PROVIDER" && a.status !== "NO_SHOW")
      ).length,
      completed: appointments.filter((a) => a.status === "COMPLETED").length,
      cancelled: appointments.filter(
        (a) =>
          a.status === "CANCELED_BY_CONSUMER" ||
          a.status === "CANCELED_BY_PROVIDER" ||
          a.status === "NO_SHOW"
      ).length,
    };
  }, [appointments]);

  // 🔍 FILTRADO Y ORDENAMIENTO (Memorizado)
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];
    const now = new Date();

    // 1. Filtrar por Pestaña Activa
    if (activeTab === "upcoming") {
      filtered = filtered.filter(
        (a) =>
          a.status === "SCHEDULED" ||
          a.status === "PENDING_PAYMENT" ||
          a.status === "IN_PROGRESS" ||
          (new Date(a.endTime || a.startTime) >= now && a.status !== "COMPLETED" && a.status !== "CANCELED_BY_CONSUMER" && a.status !== "CANCELED_BY_PROVIDER" && a.status !== "NO_SHOW")
      );
    } else if (activeTab === "past") {
      filtered = filtered.filter(
        (a) =>
          a.status === "COMPLETED" ||
          (new Date(a.endTime || a.startTime) < now &&
            a.status !== "CANCELED_BY_CONSUMER" &&
            a.status !== "CANCELED_BY_PROVIDER" &&
            a.status !== "NO_SHOW")
      );
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter(
        (a) =>
          a.status === "CANCELED_BY_CONSUMER" ||
          a.status === "CANCELED_BY_PROVIDER" ||
          a.status === "NO_SHOW"
      );
    }

    // 2. Filtrar por Búsqueda (Texto)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.providerNameSnapshot?.toLowerCase().includes(query) ||
          a.serviceName?.toLowerCase().includes(query) ||
          a.providerSpecialty?.toLowerCase().includes(query)
      );
    }

    // 3. Ordenar
    if (sortBy === "date") {
      filtered.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    } else {
      filtered.sort((a, b) =>
        (a.providerNameSnapshot || "").localeCompare(
          b.providerNameSnapshot || ""
        )
      );
    }

    return filtered;
  }, [appointments, activeTab, searchQuery, sortBy]);

  // ❌ MANEJADOR DE CANCELACIÓN
  const handleCancelAppointment = async () => {
    if (!cancelModalState.appointment) return;
    setIsCanceling(true);

    const success = await cancelAppointment(
      cancelModalState.appointment.id,
      t("cancel_reason_default")
    );

    if (success) {
      setCancelModalState({ isOpen: false, appointment: null });
    }
    setIsCanceling(false);
  };

  // --- ESTADO 1: CARGANDO ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  // --- ESTADO 2: PÁGINA PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 lg:px-12 space-y-10">
        
        {/* --- CABECERA HOMOLOGADA --- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <Calendar className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/discover")}
            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-12 px-6 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>{t("btn_new")}</span>
          </Button>
        </div>

        {/* --- COMPONENTE DE ESTADÍSTICAS --- */}
        <AppointmentStats stats={stats} />

        {/* --- COMPONENTE DE FILTROS --- */}
        <AppointmentFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* --- LISTA DE CITAS O ESTADO VACÍO --- */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt, index) => (
                <AppointmentCard
                  key={appt.id}
                  appt={appt}
                  index={index}
                  onRequestCancel={(appointment) =>
                    setCancelModalState({ isOpen: true, appointment })
                  }
                />
              ))
            ) : (
              <AppointmentEmptyState
                activeTab={activeTab}
                searchQuery={searchQuery}
              />
            )}
          </AnimatePresence>
        </div>

        {/* --- MODAL DE CANCELACIÓN --- */}
        <ConfirmationModal
          isOpen={cancelModalState.isOpen}
          onClose={() =>
            setCancelModalState({ isOpen: false, appointment: null })
          }
          onConfirm={handleCancelAppointment}
          title={t("modal_title")}
          message={t("modal_message", {
            service: cancelModalState.appointment?.serviceName || "",
            provider:
              cancelModalState.appointment?.providerNameSnapshot || "",
          })}
          isLoading={isCanceling}
          variant="destructive"
        />
      </div>
    </div>
  );
}