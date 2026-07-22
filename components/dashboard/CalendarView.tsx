/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";
import enLocale from "@fullcalendar/core/locales/en-gb";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Loader2,
  Trash2,
  Video,
  MapPin,
  Plus,
} from "lucide-react";
import { useAppointments } from "@/hooks/useAppointment";
import { useOperatingHours } from "@/hooks/useOperatingHours";
import { CalendarEvent } from "@/types/appointments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { NewAppointmentModal } from "@/components/dashboard/NewAppointmentModal";
import { useLocale, useTranslations } from "next-intl";

// 🚀 FASE 2.3: Agregamos Interface para Props
interface CalendarViewProps {
  locationId: number;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ locationId }) => {
  const { fetchCalendarEvents, reschedule, cancel, isLoading } =
    useAppointments();
  const { fetchSchedules } = useOperatingHours();
  const t = useTranslations("DashboardCalendarView");
  const locale = useLocale();
  const fullCalendarLocale = locale === "es" ? esLocale : enLocale;
  const [
    {
      events,
      currentView,
      hoveredEvent,
      selectedEvent,
      isCancelling,
      isNewApptModalOpen,
      selectedDateSlot,
      slotMinTime,
      slotMaxTime,
      fcBusinessHours,
    },
    dispatch,
  ] = React.useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case "SET_EVENTS":
          return {
            ...state,
            events:
              typeof action.payload === "function"
                ? action.payload(state.events)
                : action.payload,
          };
        case "SET_CURRENTVIEW":
          return {
            ...state,
            currentView:
              typeof action.payload === "function"
                ? action.payload(state.currentView)
                : action.payload,
          };
        case "SET_HOVEREDEVENT":
          return {
            ...state,
            hoveredEvent:
              typeof action.payload === "function"
                ? action.payload(state.hoveredEvent)
                : action.payload,
          };
        case "SET_SELECTEDEVENT":
          return {
            ...state,
            selectedEvent:
              typeof action.payload === "function"
                ? action.payload(state.selectedEvent)
                : action.payload,
          };
        case "SET_ISCANCELLING":
          return {
            ...state,
            isCancelling:
              typeof action.payload === "function"
                ? action.payload(state.isCancelling)
                : action.payload,
          };
        case "SET_ISNEWAPPTMODALOPEN":
          return {
            ...state,
            isNewApptModalOpen:
              typeof action.payload === "function"
                ? action.payload(state.isNewApptModalOpen)
                : action.payload,
          };
        case "SET_SELECTEDDATESLOT":
          return {
            ...state,
            selectedDateSlot:
              typeof action.payload === "function"
                ? action.payload(state.selectedDateSlot)
                : action.payload,
          };
        case "SET_SLOTMINTIME":
          return {
            ...state,
            slotMinTime:
              typeof action.payload === "function"
                ? action.payload(state.slotMinTime)
                : action.payload,
          };
        case "SET_SLOTMAXTIME":
          return {
            ...state,
            slotMaxTime:
              typeof action.payload === "function"
                ? action.payload(state.slotMaxTime)
                : action.payload,
          };
        case "SET_FCBUSINESSHOURS":
          return {
            ...state,
            fcBusinessHours:
              typeof action.payload === "function"
                ? action.payload(state.fcBusinessHours)
                : action.payload,
          };
        default:
          return state;
      }
    },
    {
      events: [],
      currentView: "timeGridWeek",
      hoveredEvent: null,
      selectedEvent: null,
      isCancelling: false,
      isNewApptModalOpen: false,
      selectedDateSlot: null,
      slotMinTime: "07:00:00",
      slotMaxTime: "22:00:00",
      fcBusinessHours: [
        {
          daysOfWeek: [1, 2, 3, 4, 5, 6],
          startTime: "08:00",
          endTime: "20:00",
        },
      ],
    },
  );

  const setEvents = (val: any) =>
    dispatch({ type: "SET_EVENTS", payload: val });
  const setCurrentView = (val: any) =>
    dispatch({ type: "SET_CURRENTVIEW", payload: val });
  const setHoveredEvent = (val: any) =>
    dispatch({ type: "SET_HOVEREDEVENT", payload: val });
  const setSelectedEvent = (val: any) =>
    dispatch({ type: "SET_SELECTEDEVENT", payload: val });
  const setIsCancelling = (val: any) =>
    dispatch({ type: "SET_ISCANCELLING", payload: val });
  const setIsNewApptModalOpen = (val: any) =>
    dispatch({ type: "SET_ISNEWAPPTMODALOPEN", payload: val });
  const setSelectedDateSlot = (val: any) =>
    dispatch({ type: "SET_SELECTEDDATESLOT", payload: val });
  const setSlotMinTime = (val: any) =>
    dispatch({ type: "SET_SLOTMINTIME", payload: val });
  const setSlotMaxTime = (val: any) =>
    dispatch({ type: "SET_SLOTMAXTIME", payload: val });
  const setFcBusinessHours = (val: any) =>
    dispatch({ type: "SET_FCBUSINESSHOURS", payload: val });

  // 🚀 ACTUALIZADO: Pasamos el locationId al hook (Asumiendo que lo modificaste para aceptarlo)
  const loadEvents = useCallback(
    async (start?: string, end?: string) => {
      if (!locationId) return; // Salvaguarda
      const s =
        start ||
        new Date(new Date().setDate(new Date().getDate() - 7))
          .toISOString()
          .split("T")[0];
      const e =
        end ||
        new Date(new Date().setDate(new Date().getDate() + 30))
          .toISOString()
          .split("T")[0];

      const data = await fetchCalendarEvents(s, e, locationId);
      setEvents(data);
    },
    [fetchCalendarEvents, locationId],
  );

  // Se llama al inicializar o al recargar
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // 🚀 ACTUALIZADO: Quitamos el "1" duro y usamos el locationId de las props
  useEffect(() => {
    const loadHours = async () => {
      if (!locationId) return;
      const schedules = await fetchSchedules(locationId);
      const activeDays = schedules.filter((s) => s.isActive);
      if (activeDays.length > 0) {
        let minTime = "23:59";
        let maxTime = "00:00";
        const newFcBusinessHours = activeDays.map((s) => {
          if (s.openTime < minTime) minTime = s.openTime;
          if (s.closeTime > maxTime) maxTime = s.closeTime;
          return {
            daysOfWeek: [s.dayOfWeek],
            startTime: s.openTime,
            endTime: s.closeTime,
          };
        });
        setSlotMinTime(`${minTime}:00`);
        setSlotMaxTime(`${maxTime}:00`);
        setFcBusinessHours(newFcBusinessHours);
      }
    };
    loadHours();
  }, [fetchSchedules, locationId]);

  const handleEventDrop = async (info: any) => {
    const success = await reschedule(
      Number(info.event.id),
      info.event.start.toISOString(),
    );
    if (!success) info.revert();
    else loadEvents();
  };

  const handleCancelAppointment = async () => {
    if (!selectedEvent) return;
    setIsCancelling(true);
    const success = await cancel(
      Number(selectedEvent.id),
      "ANULADO POR EL OPERADOR",
    );
    if (success) {
      setSelectedEvent(null);
      loadEvents();
    }
    setIsCancelling(false);
  };

  // PALETA TÉCNICA (Muted Jewel Tones)
  const getStatusTheme = (status?: string) => {
    const themes: Record<
      string,
      { bg: string; border: string; text: string; label: string }
    > = {
      confirmed: {
        bg: "#166534",
        border: "#14532d",
        text: "#ffffff",
        label: t("confirmed", { defaultValue: "CONFIRMADO" }),
      },
      pending: {
        bg: "#b45309",
        border: "#78350f",
        text: "#ffffff",
        label: t("pending", { defaultValue: "PENDIENTE" }),
      },
      cancelled: {
        bg: "#991b1b",
        border: "#7f1d1d",
        text: "#ffffff",
        label: t("cancelled", { defaultValue: "ANULADO" }),
      },
      completed: {
        bg: "#1e3a8a",
        border: "#1e3a8a",
        text: "#ffffff",
        label: t("completed", { defaultValue: "COMPLETADO" }),
      },
    };
    return (
      themes[status || ""] || {
        bg: "#3f3f46",
        border: "#27272a",
        text: "#ffffff",
        label: t("no_status", { defaultValue: "SIN ESTADO" }),
      }
    );
  };

  const getStatusIcon = (status?: string) => {
    const icons: Record<string, React.ReactNode> = {
      confirmed: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />,
      pending: <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />,
      cancelled: <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />,
      completed: <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />,
    };
    return (
      icons[status || ""] || (
        <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
      )
    );
  };

  const stats = {
    confirmed: events.filter(
      (e: any) => e.extendedProps?.status === "confirmed",
    ).length,
    pending: events.filter((e: any) => e.extendedProps?.status === "pending")
      .length,
  };

  const processedEvents = events.map((ev: any) => {
    const theme = getStatusTheme(ev.extendedProps?.status);
    return {
      ...ev,
      backgroundColor: theme.bg,
      borderColor: theme.border,
      textColor: theme.text,
      display: "block",
      className: "editorial-calendar-event",
    };
  });

  return (
    <div className="flex-1 w-full flex flex-col space-y-6">
      {/* PANEL DE CONTROL SUPERIOR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-colors rounded-3xl shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 px-4 py-2 text-xs font-semibold rounded-xl">
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            {stats.confirmed} {t("confirmed", { defaultValue: "Confirmados" })}
          </div>
          <div className="flex items-center gap-2 border border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400 px-4 py-2 text-xs font-semibold rounded-xl">
            <Clock className="w-4 h-4" strokeWidth={2} />
            {stats.pending} {t("pending", { defaultValue: "Pendientes" })}
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedDateSlot(new Date());
            setIsNewApptModalOpen(true);
          }}
          className="flex items-center gap-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors px-6 h-12 text-sm font-semibold w-full sm:w-auto justify-center rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2} /> Agendar Turno
        </button>
      </div>

      {/* CONTENEDOR DEL CALENDARIO */}
      <div className="relative w-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col transition-colors rounded-3xl shadow-sm overflow-hidden">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-center z-50 transition-colors"
            >
              <div className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white border border-gray-100 dark:border-gray-800 shadow-xl px-10 py-8 flex flex-col items-center gap-5 rounded-3xl">
                <Loader2
                  className="w-8 h-8 animate-spin text-emerald-600"
                  strokeWidth={2}
                />
                <p className="text-sm font-semibold text-gray-500">
                  Sincronizando Agenda...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-2 md:p-6 w-full calendar-container overflow-x-auto custom-scrollbar">
          <div className="min-w-[600px] md:min-w-0">
            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
              ]}
              initialView={currentView}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
              }}
              locale={fullCalendarLocale}
              buttonText={{
                today: t("buttons.today", { defaultValue: "HOY" }),
                month: t("buttons.month", { defaultValue: "MES" }),
                week: t("buttons.week", { defaultValue: "SEMANA" }),
                day: t("buttons.day", { defaultValue: "DÍA" }),
                list: t("buttons.list", { defaultValue: "LISTA" }),
              }}
              height="auto"
              allDaySlot={false}
              slotMinTime={slotMinTime}
              slotMaxTime={slotMaxTime}
              expandRows={true}
              stickyHeaderDates={true}
              nowIndicator={true}
              scrollTime={new Date().toTimeString().substring(0, 8)}
              events={processedEvents as any}
              editable={true}
              droppable={true}
              selectable={true}
              dayMaxEvents={4}
              businessHours={fcBusinessHours}
              selectConstraint="businessHours"
              dateClick={(info) => {
                setSelectedDateSlot(info.date);
                setIsNewApptModalOpen(true);
              }}
              eventDrop={handleEventDrop}
              eventClick={(info) => {
                const ev = events.find(
                  (e: any) => String(e.id) === String(info.event.id),
                );
                if (ev) setSelectedEvent(ev);
              }}
              viewDidMount={(info) => setCurrentView(info.view.type as any)}
              windowResize={(info) => {
                if (
                  window.innerWidth < 768 &&
                  info.view.type === "timeGridWeek"
                ) {
                  info.view.calendar.changeView("timeGridDay");
                }
              }}
              eventMouseEnter={(info) => setHoveredEvent(String(info.event.id))}
              eventMouseLeave={() => setHoveredEvent(null)}
              datesSet={(dateInfo) => {
                // Call loadEvents specifically with the view's current start/end dates
                // Convert to YYYY-MM-DD
                const startStr = dateInfo.start.toISOString().split("T")[0];
                const endStr = dateInfo.end.toISOString().split("T")[0];
                loadEvents(startStr, endStr);
              }}
              eventContent={(eventInfo) => {
                const theme = getStatusTheme(
                  eventInfo.event.extendedProps?.status,
                );
                const isHovered = hoveredEvent === String(eventInfo.event.id);

                if (eventInfo.view.type === "dayGridMonth") {
                  return (
                    <div
                      className="flex flex-col gap-0.5 overflow-hidden px-2 py-1.5 w-full rounded-xl shadow-sm mx-1 mb-1"
                      style={{
                        backgroundColor: theme.bg,
                        color: theme.text,
                      }}
                    >
                      <span className="text-[10px] font-semibold truncate leading-tight opacity-90">
                        {eventInfo.timeText}
                      </span>
                      <span className="text-xs font-bold truncate leading-tight">
                        {eventInfo.event.title}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    className={cn(
                      "flex flex-col h-full px-3 py-2 overflow-hidden transition-all duration-200 border rounded-xl shadow-sm",
                      isHovered
                        ? "opacity-100 ring-2 ring-emerald-500/50"
                        : "opacity-90",
                    )}
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.bg,
                      color: theme.text,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1 opacity-80">
                      <span className="text-xs font-medium">
                        {eventInfo.timeText}
                      </span>
                      {getStatusIcon(eventInfo.event.extendedProps?.status)}
                    </div>
                    <div className="text-sm font-bold leading-tight truncate mt-1">
                      {eventInfo.event.title}
                    </div>
                    {eventInfo.event.extendedProps?.clientName && (
                      <div className="flex items-center gap-2 text-xs font-semibold mt-auto pt-2 opacity-80">
                        <User className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                        <span className="truncate">
                          {eventInfo.event.extendedProps.clientName}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* CSS PARA FULLCALENDAR (SOFT HEALTH) */}
        <style jsx global>{`
          .calendar-container {
            --fc-page-bg-color: transparent;
            --fc-neutral-bg-color: #f9fafb;
            --fc-neutral-text-color: #374151;
            --fc-border-color: #f3f4f6;
            --fc-button-text-color: #374151;
            --fc-button-bg-color: #ffffff;
            --fc-button-border-color: #e5e7eb;
            --fc-button-hover-bg-color: #f9fafb;
            --fc-button-hover-border-color: #d1d5db;
            --fc-button-active-bg-color: #f3f4f6;
            --fc-button-active-border-color: #d1d5db;
            --fc-now-indicator-color: #059669;
          }
          .dark .calendar-container {
            --fc-neutral-bg-color: #0a0a0a;
            --fc-neutral-text-color: #e5e7eb;
            --fc-border-color: #1f2937;
            --fc-button-text-color: #e5e7eb;
            --fc-button-bg-color: #111111;
            --fc-button-border-color: #374151;
            --fc-button-hover-bg-color: #1f2937;
            --fc-button-hover-border-color: #4b5563;
            --fc-button-active-bg-color: #374151;
            --fc-button-active-border-color: #4b5563;
            --fc-now-indicator-color: #10b981;
          }
          .fc-theme-standard .fc-scrollgrid {
            border: 1px solid var(--fc-border-color) !important;
            border-radius: 1rem !important;
            overflow: hidden;
          }
          .fc-theme-standard td,
          .fc-theme-standard th {
            border-color: var(--fc-border-color) !important;
            border-width: 1px !important;
          }
          .fc-scrollgrid-section-header > th {
            border-bottom: 1px solid var(--fc-border-color) !important;
          }
          .fc-col-header-cell-cushion {
            padding: 12px 8px !important;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--fc-neutral-text-color);
            text-transform: capitalize;
          }
          .fc-day-today .fc-col-header-cell-cushion {
            color: var(--fc-button-bg-color);
            background-color: var(--fc-neutral-text-color);
            border-radius: 0.5rem;
            padding: 4px 12px !important;
            margin: 8px 0;
          }
          .fc .fc-toolbar-title {
            font-size: 1.25rem;
            font-weight: 700 !important;
            letter-spacing: -0.01em !important;
            color: var(--fc-neutral-text-color);
            text-transform: capitalize;
          }
          .fc .fc-button-primary {
            border-radius: 0.75rem !important;
            font-weight: 600 !important;
            font-size: 0.875rem !important;
            text-transform: capitalize !important;
            transition: all 0.2s ease;
            border-width: 1px !important;
            padding: 0.5rem 1rem !important;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
          }
          .fc .fc-button-primary:hover {
            color: var(--fc-button-text-color) !important;
            background-color: var(--fc-button-hover-bg-color) !important;
            border-color: var(--fc-button-hover-border-color) !important;
          }
          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active {
            background-color: var(--fc-button-active-bg-color) !important;
            color: var(--fc-button-text-color) !important;
            border-color: var(--fc-button-active-border-color) !important;
            box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05) !important;
          }
          .fc .fc-button-primary:focus {
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
          }
          .editorial-calendar-event {
            border-radius: 0.75rem !important;
            margin: 2px !important;
            cursor: pointer;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
            border-width: 1px !important;
          }
          .fc .fc-timegrid-slot {
            height: 3.5rem;
          }
          .fc .fc-timegrid-slot-label-cushion {
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--fc-neutral-text-color);
            padding: 8px !important;
            opacity: 0.6;
          }
          .fc .fc-daygrid-day.fc-day-today,
          .fc .fc-timegrid-col.fc-day-today {
            background: var(--fc-neutral-bg-color) !important;
          }
          .fc-timegrid-now-indicator-line {
            border-width: 2px;
            border-color: var(--fc-now-indicator-color);
            opacity: 0.5;
          }
          .fc-timegrid-now-indicator-arrow {
            display: none;
          }
          .fc-header-toolbar {
            flex-wrap: wrap;
            gap: 12px;
          }
          @media (max-width: 640px) {
            .fc-toolbar-chunk {
              width: 100%;
              display: flex;
              justify-content: center;
            }
            .fc-toolbar-chunk:first-child {
              justify-content: flex-start;
            }
            .fc-toolbar-chunk:last-child {
              justify-content: flex-start;
              margin-top: 8px;
            }
          }
        `}</style>
      </div>

      {/* LEYENDA (Soft Health) */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-2">
        {["confirmed", "pending", "completed", "cancelled"].map((status) => {
          const theme = getStatusTheme(status);
          return (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: theme.bg }}
              />
              <span className="text-xs font-semibold text-gray-500">
                {theme.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* DIÁLOGO DEL EXPEDIENTE (Soft Health) */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white sm:max-w-2xl rounded-3xl p-0 overflow-hidden shadow-2xl transition-colors">
          {selectedEvent && (
            <div className="flex flex-col">
              {/* Header Modal */}
              <div className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    {t("event_detail.booking_id", {
                      defaultValue: "ID OPERACIÓN",
                    })}
                    : #{selectedEvent.id}
                  </p>
                  <DialogTitle className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white leading-none">
                    {selectedEvent.title}
                  </DialogTitle>
                </div>
                <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 items-center justify-center shrink-0">
                  <CalendarIcon
                    className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                    strokeWidth={2}
                  />
                </div>
              </div>

              {/* Body Modal: Soft Blocks */}
              <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505]/50 p-6 md:p-8 gap-6">
                {/* Paciente y Estado */}
                <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50">
                      <User
                        className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        {t("event_detail.patient", {
                          defaultValue: "PACIENTE ASIGNADO",
                        })}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {selectedEvent.extendedProps?.clientName ||
                          t("event_detail.new_patient", {
                            defaultValue: "USUARIO EXTERNO",
                          })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-3">
                    <span
                      className="px-4 py-1.5 text-xs font-bold rounded-full shadow-sm"
                      style={{
                        backgroundColor: getStatusTheme(
                          selectedEvent.extendedProps?.status,
                        ).bg,
                        color: getStatusTheme(
                          selectedEvent.extendedProps?.status,
                        ).text,
                      }}
                    >
                      {
                        getStatusTheme(selectedEvent.extendedProps?.status)
                          .label
                      }
                    </span>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <Clock className="w-4 h-4" strokeWidth={2} />
                      {new Date(selectedEvent.start).toLocaleString(
                        locale === "es" ? "es-MX" : "en-US",
                        {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalles Técnicos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      {t("event_detail.modality", {
                        defaultValue: "CANAL DE ATENCIÓN",
                      })}
                    </p>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-900 dark:text-white mt-1">
                      {selectedEvent.extendedProps?.modality === "ONLINE" ? (
                        <Video className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      ) : (
                        <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      )}
                      <span>
                        {selectedEvent.extendedProps?.modality === "ONLINE"
                          ? t("event_detail.online", {
                              defaultValue: "SALA VIRTUAL",
                            })
                          : t("event_detail.in_office", {
                              defaultValue: "INSTALACIÓN FÍSICA",
                            })}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      {t("event_detail.payment", {
                        defaultValue: "ESTADO FINANCIERO",
                      })}
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-2">
                      {selectedEvent.extendedProps?.paymentStatus === "SETTLED"
                        ? t("event_detail.paid", { defaultValue: "LIQUIDADO" })
                        : t("event_detail.payment_pending", {
                            defaultValue: "PENDIENTE DE COBRO",
                          })}
                    </p>
                  </div>
                </div>

                {/* Notas Adjuntas (Opcional) */}
                {selectedEvent.extendedProps?.notes && (
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                      {t("event_detail.notes", {
                        defaultValue: "OBSERVACIONES CLÍNICAS",
                      })}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                      {selectedEvent.extendedProps.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Modal: Botones */}
              <div className="bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 p-6 md:p-8 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                {(selectedEvent.extendedProps?.status === "confirmed" ||
                  selectedEvent.extendedProps?.status === "pending") && (
                  <button
                    onClick={handleCancelAppointment}
                    disabled={isCancelling}
                    className="w-full sm:w-auto h-12 px-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 transition-colors text-sm font-bold disabled:opacity-50 rounded-xl"
                  >
                    {isCancelling ? (
                      <Loader2
                        className="w-4 h-4 animate-spin mr-2"
                        strokeWidth={2}
                      />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />
                    )}
                    {t("event_detail.cancel_appointment", {
                      defaultValue: "ANULAR CITA",
                    })}
                  </button>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-full sm:w-auto h-12 px-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#111] transition-colors rounded-xl shadow-sm"
                >
                  {t("event_detail.close", {
                    defaultValue: "CERRAR EXPEDIENTE",
                  })}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL NUEVA CITA */}
      {isNewApptModalOpen && (
        <NewAppointmentModal
          isOpen={isNewApptModalOpen}
          onClose={() => {
            setIsNewApptModalOpen(false);
            setSelectedDateSlot(null);
          }}
          initialDate={selectedDateSlot}
          // 🚀 FASE 1.2 Frontend: Pasamos el locationId para que el modal sepa en qué sede agendar
          locationId={locationId}
          onSuccess={loadEvents}
        />
      )}
    </div>
  );
};
