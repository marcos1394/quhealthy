/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle, AlertCircle, Zap, Loader2, Trash2, Video, MapPin } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointment";
import { CalendarEvent } from "@/types/appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { NewAppointmentModal } from "@/components/dashboard/NewAppointmentModal";
import { useLocale, useTranslations } from "next-intl";

export const CalendarView: React.FC = () => {
  const { fetchAppointments, reschedule, cancel, isLoading } = useAppointments();
  const t = useTranslations("DashboardCalendarView");
  const locale = useLocale();
  const fullCalendarLocale = locale === "es" ? esLocale : enLocale;
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek">("timeGridWeek");
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isNewApptModalOpen, setIsNewApptModalOpen] = useState(false);
  const [selectedDateSlot, setSelectedDateSlot] = useState<Date | null>(null);

  const loadEvents = useCallback(async () => { const data = await fetchAppointments(); setEvents(data); }, [fetchAppointments]);
  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleEventDrop = async (info: any) => {
    const success = await reschedule(Number(info.event.id), info.event.start.toISOString());
    if (!success) info.revert(); else loadEvents();
  };

  const handleCancelAppointment = async () => {
    if (!selectedEvent) return;
    setIsCancelling(true);
    const success = await cancel(Number(selectedEvent.id), "Canceled by provider");
    if (success) { setSelectedEvent(null); loadEvents(); }
    setIsCancelling(false);
  };

  const getStatusTheme = (status?: string) => {
    const themes: Record<string, { bg: string; border: string; text: string; label: string }> = {
      confirmed: { bg: "rgba(16, 185, 129, 0.14)", border: "#10b981", text: "#047857", label: t("confirmed") },
      pending: { bg: "rgba(245, 158, 11, 0.14)", border: "#f59e0b", text: "#b45309", label: t("pending") },
      cancelled: { bg: "rgba(239, 68, 68, 0.14)", border: "#ef4444", text: "#dc2626", label: t("cancelled") },
      completed: { bg: "rgba(14, 165, 233, 0.14)", border: "#0ea5e9", text: "#0369a1", label: t("completed") }
    };
    return themes[status || ""] || { bg: "rgba(107, 114, 128, 0.12)", border: "#6b7280", text: "#4b5563", label: t("no_status") };
  };

  const getStatusIcon = (status?: string) => {
    const icons: Record<string, React.ReactNode> = {
      confirmed: <CheckCircle2 className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />, completed: <Zap className="w-3 h-3" />
    };
    return icons[status || ""] || <AlertCircle className="w-3 h-3" />;
  };

  const getModalityTheme = (modality?: string) => {
    if (modality === "ONLINE") {
      return {
        label: t("event_detail.online"),
        className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30"
      };
    }
    return {
      label: t("event_detail.in_office"),
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30"
    };
  };

  const stats = {
    confirmed: events.filter(e => e.extendedProps?.status === "confirmed").length,
    pending: events.filter(e => e.extendedProps?.status === "pending").length,
  };

  const processedEvents = events.map(ev => {
    const theme = getStatusTheme(ev.extendedProps?.status);
    return { ...ev, backgroundColor: theme.bg, borderColor: theme.border, textColor: theme.text, className: "editorial-calendar-event" };
  });

  return (
    <div className="h-full w-full flex flex-col space-y-3">
      {/* Quick Stats */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 pt-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3 mr-1" />{stats.confirmed} {t("confirmed")}
          </Badge>
          <Badge variant="outline" className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 px-2.5 py-0.5 text-xs font-medium">
            <Clock className="w-3 h-3 mr-1" />{stats.pending} {t("pending")}
          </Badge>
        </div>
      </motion.div>

      {/* Calendar Container */}
      <div className="relative flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/60 dark:bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-lg flex items-center gap-2.5">
                <Loader2 className="w-5 h-5 text-medical-600 dark:text-medical-400 animate-spin" />
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t("syncing")}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-3 flex-1 calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={currentView}
            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek" }}
            locale={fullCalendarLocale}
            buttonText={{
              today: t("buttons.today"),
              month: t("buttons.month"),
              week: t("buttons.week"),
              day: t("buttons.day"),
              list: t("buttons.list")
            }}
            height="100%" allDaySlot={false} slotMinTime="07:00:00" slotMaxTime="22:00:00"
            expandRows={true} stickyHeaderDates={true} nowIndicator={true}
            events={processedEvents as any} editable={true} droppable={true} selectable={true} dayMaxEvents={4}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: "09:00",
              endTime: "18:00",
            }}
            selectConstraint="businessHours"
            dateClick={(info) => {
              setSelectedDateSlot(info.date);
              setIsNewApptModalOpen(true);
            }}
            eventDrop={handleEventDrop}
            eventClick={(info) => { const ev = events.find(e => String(e.id) === String(info.event.id)); if (ev) setSelectedEvent(ev); }}
            viewDidMount={(info) => setCurrentView(info.view.type as any)}
            eventMouseEnter={(info) => setHoveredEvent(String(info.event.id))}
            eventMouseLeave={() => setHoveredEvent(null)}
            eventContent={(eventInfo) => {
              const theme = getStatusTheme(eventInfo.event.extendedProps?.status);
              const isHovered = hoveredEvent === String(eventInfo.event.id);
              if (eventInfo.view.type === "dayGridMonth") {
                return (
                  <div className="flex items-center gap-1.5 overflow-hidden px-1">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: theme.border }} />
                    <span className="text-xs font-medium truncate" style={{ color: theme.text }}>{eventInfo.timeText} {eventInfo.event.title}</span>
                  </div>
                );
              }
              return (
                <div className={cn("flex flex-col h-full px-2 py-1 overflow-hidden transition-all duration-200", isHovered ? "opacity-100" : "opacity-90")}
                  style={{ borderLeft: `3px solid ${theme.border}` }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: theme.text }}>{eventInfo.timeText}</span>
                    {getStatusIcon(eventInfo.event.extendedProps?.status)}
                  </div>
                  <div className="text-xs font-semibold leading-tight truncate text-slate-900 dark:text-white mb-0.5">{eventInfo.event.title}</div>
                  {eventInfo.event.extendedProps?.modality && (
                    <span className={cn("w-fit text-[9px] leading-none px-1.5 py-0.5 rounded-md border font-semibold mb-0.5", getModalityTheme(eventInfo.event.extendedProps.modality).className)}>
                      {getModalityTheme(eventInfo.event.extendedProps.modality).label}
                    </span>
                  )}
                  {eventInfo.event.extendedProps?.clientName && (
                    <div className="flex items-center gap-1 text-[10px] font-medium" style={{ color: theme.text }}>
                      <User className="w-2.5 h-2.5 shrink-0" /><span className="truncate">{eventInfo.event.extendedProps.clientName}</span>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* Calendar CSS — Editorial Healthtech theme with dark/light support */}
        <style jsx global>{`
          .calendar-container {
            --fc-page-bg-color: transparent;
            --fc-neutral-bg-color: rgba(240, 249, 255, 0.65);
            --fc-neutral-text-color: #64748b;
            --fc-border-color: rgba(226, 232, 240, 0.75);
            --fc-button-text-color: #0f172a;
            --fc-button-bg-color: rgba(248, 250, 252, 0.95);
            --fc-button-border-color: rgba(226, 232, 240, 0.9);
            --fc-button-hover-bg-color: rgba(240, 249, 255, 1);
            --fc-button-hover-border-color: rgba(125, 211, 252, 0.45);
            --fc-button-active-bg-color: rgba(14, 165, 233, 0.12);
            --fc-button-active-border-color: rgba(14, 165, 233, 0.4);
            --fc-now-indicator-color: #0ea5e9;
          }
          .dark .calendar-container {
            --fc-neutral-bg-color: rgba(15, 23, 42, 0.6);
            --fc-neutral-text-color: #94a3b8;
            --fc-border-color: rgba(51, 65, 85, 0.7);
            --fc-button-text-color: #e2e8f0;
            --fc-button-bg-color: rgba(30, 41, 59, 0.72);
            --fc-button-border-color: rgba(71, 85, 105, 0.6);
            --fc-button-hover-bg-color: rgba(51, 65, 85, 0.8);
            --fc-button-hover-border-color: rgba(56, 189, 248, 0.4);
            --fc-button-active-bg-color: rgba(14, 165, 233, 0.15);
            --fc-button-active-border-color: rgba(14, 165, 233, 0.4);
          }
          .fc-theme-standard .fc-scrollgrid { border: none !important; }
          .fc-theme-standard td, .fc-theme-standard th { border-color: var(--fc-border-color); }
          .fc-scrollgrid-section-header > th { border-top: none !important; border-left: none !important; border-right: none !important; }
          .fc-col-header-cell-cushion { padding: 10px 4px !important; font-size: 0.8rem; font-weight: 500; color: var(--fc-neutral-text-color); text-transform: uppercase; letter-spacing: 0.05em; }
          .fc-day-today .fc-col-header-cell-cushion { color: #0ea5e9; font-weight: 700; }
          .fc .fc-toolbar-title { font-size: 1.15rem; font-weight: 600; letter-spacing: -0.02em; }
          .dark .fc .fc-toolbar-title { color: white; }
          .fc .fc-toolbar-title { color: #0f172a; }
          .fc .fc-button-primary { border-radius: 8px; font-weight: 500; text-transform: capitalize; transition: all 0.2s ease; }
          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active { background-color: rgba(14, 165, 233, 0.1) !important; color: #0ea5e9 !important; border-color: rgba(14, 165, 233, 0.3) !important; }
          .editorial-calendar-event { border: none !important; border-radius: 6px !important; box-shadow: 0 1px 2px rgba(0,0,0,0.06); margin: 1px 2px !important; }
          .fc .fc-timegrid-slot { height: 2.6rem; }
          .fc .fc-timegrid-slot-label-cushion { font-size: 0.72rem; color: #64748b; }
          .dark .fc .fc-timegrid-slot-label-cushion { color: #94a3b8; }
          .fc .fc-daygrid-day.fc-day-today,
          .fc .fc-timegrid-col.fc-day-today { background: rgba(14, 165, 233, 0.07) !important; }
          .dark .fc .fc-daygrid-day.fc-day-today,
          .dark .fc .fc-timegrid-col.fc-day-today { background: rgba(14, 165, 233, 0.12) !important; }
          .fc-timegrid-now-indicator-line { border-width: 2px; }
          .fc-timegrid-now-indicator-arrow { border-width: 5px; border-color: var(--fc-now-indicator-color) transparent transparent transparent; }
        `}</style>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
        {[{ status: "confirmed" }, { status: "pending" }, { status: "completed" }].map(item => {
          const theme = getStatusTheme(item.status);
          return (
            <div key={item.status} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.border }} />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{theme.label}</span>
            </div>
          );
        })}
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-md rounded-xl overflow-hidden transition-colors">
          {selectedEvent && (
            <>
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: getStatusTheme(selectedEvent.extendedProps?.status).border }} />
              <DialogHeader className="pt-3">
                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">{selectedEvent.title}</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm font-light flex items-center gap-1.5 mt-0.5">
                  <CalendarIcon className="w-3 h-3" />{t("event_detail.booking_id")}: #{selectedEvent.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium uppercase">{t("event_detail.patient")}</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedEvent.extendedProps?.clientName || t("event_detail.new_patient")}</p>
                    </div>
                  </div>
                  <Separator className="bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {new Date(selectedEvent.start).toLocaleString(locale === "es" ? "es-MX" : "en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <Badge variant="outline" style={{ backgroundColor: getStatusTheme(selectedEvent.extendedProps?.status).bg, color: getStatusTheme(selectedEvent.extendedProps?.status).border, borderColor: getStatusTheme(selectedEvent.extendedProps?.status).border }} className="border-opacity-30 px-2 py-0.5 text-xs">
                      {getStatusTheme(selectedEvent.extendedProps?.status).label}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700">
                    <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">{t("event_detail.modality")}</p>
                    <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                      {selectedEvent.extendedProps?.modality === "ONLINE" ? <Video className="w-3.5 h-3.5 text-blue-500" /> : <MapPin className="w-3.5 h-3.5 text-emerald-500" />}
                      <span className="font-medium">{selectedEvent.extendedProps?.modality === "ONLINE" ? t("event_detail.online") : t("event_detail.in_office")}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700">
                    <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">{t("event_detail.payment")}</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                      {selectedEvent.extendedProps?.paymentStatus === "SETTLED" ? t("event_detail.paid") : t("event_detail.payment_pending")}
                    </p>
                  </div>
                </div>
                {selectedEvent.extendedProps?.notes && (
                  <div className="bg-medical-50 dark:bg-medical-500/5 border border-medical-200 dark:border-medical-500/20 rounded-xl p-3">
                    <p className="text-[10px] text-medical-600 dark:text-medical-400 font-medium uppercase tracking-wider mb-1">{t("event_detail.notes")}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-light">{selectedEvent.extendedProps.notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-2 sm:justify-between w-full pt-1">
                {(selectedEvent.extendedProps?.status === "confirmed" || selectedEvent.extendedProps?.status === "pending") ? (
                  <Button variant="ghost" onClick={handleCancelAppointment} disabled={isCancelling}
                    className="w-full sm:w-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-sm">
                    {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}{t("event_detail.cancel_appointment")}
                  </Button>
                ) : <div />}
                <Button onClick={() => setSelectedEvent(null)}
                  className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold rounded-xl shadow-none text-sm">
                  {t("event_detail.close")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {!isLoading && events.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 p-8 text-center">
          <CalendarIcon className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t("empty_title")}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t("empty_description")}
          </p>
        </div>
      )}

      {isNewApptModalOpen && (
        <NewAppointmentModal
          isOpen={isNewApptModalOpen}
          onClose={() => {
            setIsNewApptModalOpen(false);
            setSelectedDateSlot(null);
          }}
          initialDate={selectedDateSlot}
          onSuccess={loadEvents}
        />
      )}
    </div>
  );
};