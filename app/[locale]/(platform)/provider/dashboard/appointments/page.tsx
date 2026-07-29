"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-gray-on-colored-background */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/js-combine-iterations */

import React, { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Check,
  User,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Timer,
  PlayCircle,
  UserCheck,
  Filter,
  MapPin,
  Search,
  Zap,
  Video,
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

import { useProviderLocations } from "@/hooks/useProviderLocations";
import {
  useProviderAppointments,
  saveApptTime,
} from "@/hooks/useProviderAppointments";
import { appointmentService } from "@/services/appointment.service";
import { ProviderAppointment } from "@/types/appointments";
import { handleApiError } from "@/lib/handleApiError";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/stores/SessionStore";

import { CompletionModal } from "@/components/dashboard/CompletionModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { NewAppointmentModal } from "@/components/dashboard/NewAppointmentModal";
import { KanbanCard } from "@/components/dashboard/KanbanCard";

export default function ProviderAppointmentsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("DashboardAppointments");
  const { appointments, setAppointments, isLoading, refetch } =
    useProviderAppointments();

  // Hook de ubicaciones/sedes
  const { locations, fetchLocations, isLoading: isLoadingLocations } =
    useProviderLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Autoseleccionar la sede principal por defecto
  useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      const mainLoc = locations.find((l) => l.isMain) || locations[0];
      setSelectedLocationId(mainLoc.id);
    }
  }, [locations, selectedLocationId]);

  const [state, dispatch] = useReducer(
    (prevState: any, action: any) => {
      switch (action.type) {
        case "SET_ISCOMPLETEMODALOPEN":
          return {
            ...prevState,
            isCompleteModalOpen:
              typeof action.payload === "function"
                ? action.payload(prevState.isCompleteModalOpen)
                : action.payload,
          };
        case "SET_ISNEWAPPOINTMENTMODALOPEN":
          return {
            ...prevState,
            isNewAppointmentModalOpen:
              typeof action.payload === "function"
                ? action.payload(prevState.isNewAppointmentModalOpen)
                : action.payload,
          };
        case "SET_SELECTEDAPPOINTMENT":
          return {
            ...prevState,
            selectedAppointment:
              typeof action.payload === "function"
                ? action.payload(prevState.selectedAppointment)
                : action.payload,
          };
        case "SET_CANCELMODALSTATE":
          return {
            ...prevState,
            cancelModalState:
              typeof action.payload === "function"
                ? action.payload(prevState.cancelModalState)
                : action.payload,
          };
        case "SET_ISCANCELING":
          return {
            ...prevState,
            isCanceling:
              typeof action.payload === "function"
                ? action.payload(prevState.isCanceling)
                : action.payload,
          };
        case "SET_DATEFILTER":
          return {
            ...prevState,
            dateFilter:
              typeof action.payload === "function"
                ? action.payload(prevState.dateFilter)
                : action.payload,
          };
        case "SET_DRAGGEDAPPTID":
          return {
            ...prevState,
            draggedApptId:
              typeof action.payload === "function"
                ? action.payload(prevState.draggedApptId)
                : action.payload,
          };
        default:
          return prevState;
      }
    },
    {
      isCompleteModalOpen: false,
      isNewAppointmentModalOpen: false,
      selectedAppointment: null,
      cancelModalState: { isOpen: false, appointment: null },
      isCanceling: false,
      dateFilter: "ALL",
      draggedApptId: null,
    }
  );

  const {
    isCompleteModalOpen,
    isNewAppointmentModalOpen,
    selectedAppointment,
    cancelModalState,
    isCanceling,
    dateFilter,
    draggedApptId,
  } = state;

  const setIsCompleteModalOpen = (val: any) =>
    dispatch({ type: "SET_ISCOMPLETEMODALOPEN", payload: val });
  const setIsNewAppointmentModalOpen = (val: any) =>
    dispatch({ type: "SET_ISNEWAPPOINTMENTMODALOPEN", payload: val });
  const setSelectedAppointment = (val: any) =>
    dispatch({ type: "SET_SELECTEDAPPOINTMENT", payload: val });
  const setCancelModalState = (val: any) =>
    dispatch({ type: "SET_CANCELMODALSTATE", payload: val });
  const setIsCanceling = (val: any) =>
    dispatch({ type: "SET_ISCANCELING", payload: val });
  const setDateFilter = (val: any) =>
    dispatch({ type: "SET_DATEFILTER", payload: val });
  const setDraggedApptId = (val: any) =>
    dispatch({ type: "SET_DRAGGEDAPPTID", payload: val });

  const normalizeStatus = (status: string) => {
    if (!status) return "SCHEDULED";
    const s = status.toUpperCase();
    if (s === "CONFIRMED") return "SCHEDULED";
    if (s === "PENDING") return "SCHEDULED";
    return s;
  };

  const handleOpenCancelModal = (appointment: ProviderAppointment) =>
    setCancelModalState({ isOpen: true, appointment });

  const handleConfirmCancel = async () => {
    if (!cancelModalState.appointment) return;
    setIsCanceling(true);
    try {
      await appointmentService.cancelAppointment(
        cancelModalState.appointment.id,
        "Cancelada desde agenda"
      );
      toast.success(t("toast_cancelled_success"));
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === cancelModalState.appointment?.id
            ? { ...a, status: "CANCELED_BY_PROVIDER" }
            : a
        )
      );
      setCancelModalState({ isOpen: false, appointment: null });
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleUpdateStatus = async (
    appointmentId: string | number,
    newStatus: string
  ) => {
    const nowLocalIso = new Date().toISOString();

    setAppointments((prev) =>
      prev.map((appt) => {
        if (appt.id === appointmentId) {
          const updatedAppt = { ...appt, status: newStatus as any };

          if (newStatus === "WAITING_ROOM" && !appt.arrivedAt) {
            updatedAppt.arrivedAt = nowLocalIso;
            saveApptTime(appt.id, "arrivedAt", nowLocalIso);
          }
          if (newStatus === "IN_PROGRESS" && !appt.startedAt) {
            updatedAppt.startedAt = nowLocalIso;
            saveApptTime(appt.id, "startedAt", nowLocalIso);
          }
          if (newStatus === "COMPLETED" && !appt.completedAt) {
            updatedAppt.completedAt = nowLocalIso;
            saveApptTime(appt.id, "completedAt", nowLocalIso);
          }

          return updatedAppt;
        }
        return appt;
      })
    );

    try {
      await appointmentService.updateStatus(appointmentId, newStatus);
      toast.success(
        t("toast_status_updated", { status: getStatusText(newStatus) })
      );
    } catch (error) {
      handleApiError(error);
      refetch();
    }
  };

  const handleOpenCompletionModal = (appointment: ProviderAppointment) => {
    setSelectedAppointment(appointment);
    setIsCompleteModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, id: number | string) => {
    setDraggedApptId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedApptId) {
      const idToMove = draggedApptId;
      setDraggedApptId(null);

      await handleUpdateStatus(idToMove, newStatus);

      if (
        newStatus === "IN_PROGRESS" &&
        useSessionStore.getState().role === "ROLE_PROVIDER"
      ) {
        router.push(`/provider/consultation/${idToMove}`);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const formatLocalTime = (dateString: string, formatStr: string) => {
    try {
      const date = new Date(dateString);
      const dateLocale = locale === "en" ? enUS : es;
      return format(date, formatStr, { locale: dateLocale });
    } catch (e) {
      return "--:--";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (normalizeStatus(status)) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40";
      case "SCHEDULED":
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
      case "WAITING_ROOM":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40 animate-pulse";
      case "PENDING_PAYMENT":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/40";
      case "CANCELED_BY_CONSUMER":
      case "CANCELED_BY_PROVIDER":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40 line-through opacity-80";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (normalizeStatus(status)) {
      case "COMPLETED":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "SCHEDULED":
        return <CalendarIcon className="w-3.5 h-3.5" />;
      case "WAITING_ROOM":
        return <UserCheck className="w-3.5 h-3.5" />;
      case "IN_PROGRESS":
        return <PlayCircle className="w-3.5 h-3.5" />;
      case "PENDING_PAYMENT":
        return <Timer className="w-3.5 h-3.5" />;
      default:
        return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (normalizeStatus(status)) {
      case "COMPLETED":
        return t("card.completed");
      case "SCHEDULED":
        return t("card.scheduled");
      case "WAITING_ROOM":
        return t("card.waiting_room");
      case "IN_PROGRESS":
        return t("card.in_progress");
      case "PENDING_PAYMENT":
        return t("card.pending_payment");
      case "CANCELED_BY_CONSUMER":
        return t("card.cancelled_by_patient");
      case "CANCELED_BY_PROVIDER":
        return t("card.cancelled_by_you");
      default:
        return status;
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (
      selectedLocationId &&
      appt.locationId &&
      appt.locationId !== selectedLocationId
    )
      return false;

    if (dateFilter === "ALL") return true;
    const apptDate = new Date(appt.startTime).toDateString();
    const today = new Date().toDateString();
    if (dateFilter === "TODAY") return apptDate === today;
    if (dateFilter === "UPCOMING") return new Date(appt.endTime) >= new Date();
    return true;
  });

  const todayCompletedAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.startTime).toDateString();
    const today = new Date().toDateString();
    return apptDate === today && normalizeStatus(appt.status) === "COMPLETED";
  });

  const getDiffMinutes = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return null;
    try {
      const cleanStart = startStr.replace(/\.\d+/, "");
      const cleanEnd = endStr.replace(/\.\d+/, "");
      const s = new Date(cleanStart).getTime();
      const e = new Date(cleanEnd).getTime();
      if (isNaN(s) || isNaN(e)) return null;
      const diff = Math.floor((e - s) / 60000);
      return diff > 0 ? diff : 0;
    } catch {
      return null;
    }
  };

  const waitTimes = todayCompletedAppointments
    .map((a) => getDiffMinutes(a.arrivedAt, a.startedAt))
    .filter((v) => v !== null) as number[];
  const avgWaitTime = waitTimes.length
    ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
    : 0;

  const consultationTimes = todayCompletedAppointments
    .map((a) => getDiffMinutes(a.startedAt, a.completedAt))
    .filter((v) => v !== null) as number[];
  const avgConsultationTime = consultationTimes.length
    ? Math.round(
        consultationTimes.reduce((a, b) => a + b, 0) / consultationTimes.length
      )
    : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <CalendarIcon className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* SELECTOR DE SEDE */}
            <div className="w-full sm:w-64">
              <Select
                value={selectedLocationId?.toString()}
                onValueChange={(val) => setSelectedLocationId(Number(val))}
                disabled={isLoadingLocations || locations.length === 0}
              >
                <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm font-bold text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                    <SelectValue placeholder="Seleccionar Sede" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg z-50">
                  {locations.map((loc) => (
                    <SelectItem
                      key={loc.id}
                      value={loc.id.toString()}
                      className="text-xs font-bold cursor-pointer rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                    >
                      {loc.name} {loc.isMain ? "(Principal)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => setIsNewAppointmentModalOpen(true)}
              className="w-full sm:w-auto rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-6 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2 shrink-0"
            >
              <Zap className="w-4 h-4" strokeWidth={2} />
              <span>{t("quick_actions.new_appointment")}</span>
            </Button>
          </div>
        </div>

        {/* ── MÉTRICAS DEL DÍA ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Timer className="w-4.5 h-4.5" strokeWidth={2} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {t("avg_wait_today")}
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {avgWaitTime} <span className="text-sm font-medium text-gray-400">min</span>
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <PlayCircle className="w-4.5 h-4.5" strokeWidth={2} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {t("avg_consultation_today")}
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {avgConsultationTime} <span className="text-sm font-medium text-gray-400">min</span>
            </p>
          </div>
        </div>

        {/* ── SISTEMA DE PESTAÑAS Y FILTROS ────────────────────────────── */}
        <Tabs defaultValue="list" className="w-full space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <TabsList className="bg-gray-100/70 dark:bg-gray-800/40 p-1 rounded-2xl h-auto flex">
              <TabsTrigger
                value="list"
                className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:shadow-sm px-5 py-2 text-xs font-bold transition-all text-gray-500 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                {t("view_mode.list")}
              </TabsTrigger>
              <TabsTrigger
                value="kanban"
                className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:shadow-sm px-5 py-2 text-xs font-bold transition-all text-gray-500 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                {t("view_mode.kanban")}
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:shadow-sm px-5 py-2 text-xs font-bold transition-all text-gray-500 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                {t("view_mode.calendar")}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-1.5 bg-gray-100/70 dark:bg-gray-800/40 p-1 rounded-2xl">
              <div className="px-2.5 text-gray-400">
                <Filter className="w-4 h-4" strokeWidth={2} />
              </div>
              <button
                onClick={() => setDateFilter("ALL")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                  dateFilter === "ALL"
                    ? "bg-white dark:bg-[#0a0a0a] shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {t("tabs.all")}
              </button>
              <button
                onClick={() => setDateFilter("TODAY")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                  dateFilter === "TODAY"
                    ? "bg-white dark:bg-[#0a0a0a] shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {t("tabs.today")}
              </button>
              <button
                onClick={() => setDateFilter("UPCOMING")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                  dateFilter === "UPCOMING"
                    ? "bg-white dark:bg-[#0a0a0a] shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {t("tabs.upcoming")}
              </button>
            </div>
          </div>

          {/* VISTA DE LISTA */}
          <TabsContent value="list" className="m-0 focus-visible:outline-none">
            <AnimatePresence mode="popLayout">
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appt) => {
                    const currentStatus = normalizeStatus(appt.status);

                    return (
                      <motion.div
                        key={appt.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start md:items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                            {appt.service?.serviceDeliveryType === "video_call" ? (
                              <Video className="w-5 h-5" strokeWidth={2} />
                            ) : (
                              <User className="w-5 h-5" strokeWidth={2} />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                                {appt.service?.name || t("medical_appointment")}
                              </h3>
                              <span
                                className={cn(
                                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 shadow-sm",
                                  getStatusBadgeStyle(appt.status)
                                )}
                              >
                                {getStatusIcon(appt.status)} {getStatusText(appt.status)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <span className="font-semibold text-gray-400">{t("card.patient")}:</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {appt.consumer?.name || "---"}
                                </span>
                              </span>
                              <span className="flex items-center gap-1.5 font-medium">
                                <Clock className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                                {formatLocalTime(appt.startTime, "dd MMM yyyy, HH:mm")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800/60">
                          {["SCHEDULED", "WAITING_ROOM", "PENDING_PAYMENT"].includes(currentStatus) && (
                            <Button
                              variant="outline"
                              onClick={() => handleOpenCancelModal(appt)}
                              className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all h-9 px-3.5"
                            >
                              <XCircle className="w-4 h-4 mr-1.5" strokeWidth={2} />
                              <span>{t("actions.cancel")}</span>
                            </Button>
                          )}

                          {currentStatus === "SCHEDULED" && (
                            <Button
                              variant="outline"
                              onClick={() => handleUpdateStatus(appt.id, "WAITING_ROOM")}
                              className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-gray-800 dark:text-gray-200 text-xs font-bold transition-all h-9 px-3.5"
                            >
                              <UserCheck className="w-4 h-4 mr-1.5" strokeWidth={2} />
                              <span>{t("actions.arrived")}</span>
                            </Button>
                          )}

                          {["SCHEDULED", "WAITING_ROOM"].includes(currentStatus) && (
                            <Button
                              onClick={() => handleUpdateStatus(appt.id, "IN_PROGRESS")}
                              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-bold transition-all h-9 px-4 border-0"
                            >
                              <PlayCircle className="w-4 h-4 mr-1.5" strokeWidth={2} />
                              <span>{t("actions.start")}</span>
                            </Button>
                          )}

                          {currentStatus === "IN_PROGRESS" && (
                            <Button
                              onClick={() => handleOpenCompletionModal(appt)}
                              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold transition-all h-9 px-4 border-0"
                            >
                              <Check className="w-4 h-4 mr-1.5" strokeWidth={2} />
                              <span>{t("actions.finish")}</span>
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                    <CalendarIcon className="w-8 h-8" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {t("empty.title")}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 max-w-sm leading-relaxed">
                    {t("no_appointments_filter")}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* VISTA KANBAN */}
          <TabsContent
            value="kanban"
            className="m-0 focus-visible:outline-none overflow-x-auto bg-gray-50/50 dark:bg-[#050505] rounded-3xl border border-gray-100 dark:border-gray-800 p-4 min-h-[70vh]"
          >
            <div className="flex gap-4 min-w-[1200px] h-full">
              {[
                { id: "SCHEDULED", title: t("kanban_columns.scheduled") },
                { id: "WAITING_ROOM", title: t("kanban_columns.waiting_room") },
                { id: "IN_PROGRESS", title: t("kanban_columns.in_progress") },
                { id: "COMPLETED", title: t("kanban_columns.completed") },
              ].map((column) => (
                <div
                  key={column.id}
                  onDrop={(e) => handleDrop(e, column.id)}
                  onDragOver={handleDragOver}
                  className="flex-1 min-w-[300px] flex flex-col bg-white dark:bg-[#0a0a0a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                  <div className="p-4 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      {column.title}
                    </h3>
                    <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                      {
                        filteredAppointments.filter(
                          (a) => normalizeStatus(a.status) === column.id
                        ).length
                      }
                    </span>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto space-y-3">
                    {filteredAppointments
                      .filter((appt) => normalizeStatus(appt.status) === column.id)
                      .map((appt) => (
                        <KanbanCard
                          key={appt.id}
                          appt={appt}
                          columnId={column.id}
                          onDragStart={handleDragStart}
                          onOpenCompletionModal={handleOpenCompletionModal}
                        />
                      ))}

                    {filteredAppointments.filter(
                      (appt) => normalizeStatus(appt.status) === column.id
                    ).length === 0 && (
                      <div className="h-32 mt-4 mx-2 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-transparent">
                        <Search className="w-5 h-5 text-gray-300 dark:text-gray-700 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("drag_here")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* VISTA CALENDARIO */}
          <TabsContent
            value="calendar"
            className="m-0 focus-visible:outline-none bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 min-h-[70vh]"
          >
            {selectedLocationId ? (
              <CalendarView
                key={`calendar-${selectedLocationId}`}
                locationId={selectedLocationId}
              />
            ) : (
              <div className="h-full flex items-center justify-center py-20">
                <QhSpinner size="lg" />
              </div>
            )}
          </TabsContent>
        </Tabs>

      </div>

      {/* MODALES */}
      <CompletionModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        appointment={selectedAppointment}
        onComplete={() => {
          refetch();
          setIsCompleteModalOpen(false);
        }}
      />

      <ConfirmationModal
        isOpen={cancelModalState.isOpen}
        onClose={() =>
          setCancelModalState({ isOpen: false, appointment: null })
        }
        onConfirm={handleConfirmCancel}
        title="Anular Cita"
        message="Esta acción cancelará el registro de forma irreversible."
        isLoading={isCanceling}
        variant="destructive"
      />

      {selectedLocationId && (
        <NewAppointmentModal
          isOpen={isNewAppointmentModalOpen}
          onClose={() => setIsNewAppointmentModalOpen(false)}
          locationId={selectedLocationId}
          onCreated={refetch}
        />
      )}
    </div>
  );
}