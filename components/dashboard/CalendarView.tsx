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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
      confirmed: { bg: "#000", border: "#000", text: "#fff", label: t("confirmed") },
      pending: { bg: "#fff", border: "#000", text: "#000", label: t("pending") },
      cancelled: { bg: "#fff", border: "#000", text: "#000", label: t("cancelled") },
      completed: { bg: "#000", border: "#000", text: "#fff", label: t("completed") }
    };
    return themes[status || ""] || { bg: "#fff", border: "#000", text: "#000", label: t("no_status") };
  };

  const getStatusIcon = (status?: string) => {
    const icons: Record<string, React.ReactNode> = {
      confirmed: <CheckCircle2 className="w-3 h-3" strokeWidth={2} />, 
      pending: <Clock className="w-3 h-3" strokeWidth={2} />,
      cancelled: <XCircle className="w-3 h-3" strokeWidth={2} />, 
      completed: <Zap className="w-3 h-3" strokeWidth={2} />
    };
    return icons[status || ""] || <AlertCircle className="w-3 h-3" strokeWidth={2} />;
  };

  const getModalityTheme = (modality?: string) => {
    if (modality === "ONLINE") {
      return {
        label: t("event_detail.online"),
        className: "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
      };
    }
    return {
      label: t("event_detail.in_office"),
      className: "bg-white text-black dark:bg-black dark:text-white border-black dark:border-white"
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
    <div className="h-full w-full flex flex-col space-y-4">
      {/* Quick Stats */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 pt-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-black dark:border-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black">
            <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={2} />{stats.confirmed} {t("confirmed")}
          </div>
          <div className="flex items-center gap-1 border border-black dark:border-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-white text-black dark:bg-black dark:text-white">
            <Clock className="w-3 h-3 mr-1" strokeWidth={2} />{stats.pending} {t("pending")}
          </div>
        </div>
      </motion.div>

      {/* Calendar Container */}
      <div className="relative flex-1 bg-white dark:bg-[#0a0a0a] rounded-none border border-black dark:border-white overflow-hidden flex flex-col transition-colors shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-black border border-black dark:border-white p-4 rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-black dark:text-white animate-spin" strokeWidth={2} />
                <p className="text-[10px] uppercase tracking-widest font-bold text-black dark:text-white">{t("syncing")}</p>
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
                    <div className="w-1.5 h-1.5 rounded-none shrink-0" style={{ backgroundColor: theme.text }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest truncate" style={{ color: theme.text }}>{eventInfo.timeText} {eventInfo.event.title}</span>
                  </div>
                );
              }
              return (
                <div className={cn("flex flex-col h-full px-2 py-1 overflow-hidden transition-all duration-200", isHovered ? "opacity-100" : "opacity-90")}
                  style={{ borderLeft: `4px solid ${theme.text}`, backgroundColor: theme.bg, color: theme.text }}>
                  <div className="flex items-center justify-between mb-0.5 border-b border-inherit pb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider">{eventInfo.timeText}</span>
                    {getStatusIcon(eventInfo.event.extendedProps?.status)}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest leading-tight truncate mt-1">{eventInfo.event.title}</div>
                  {eventInfo.event.extendedProps?.modality && (
                    <span className={cn("w-fit text-[8px] uppercase tracking-widest leading-none px-1 py-0.5 border font-bold mt-1", getModalityTheme(eventInfo.event.extendedProps.modality).className)}>
                      {getModalityTheme(eventInfo.event.extendedProps.modality).label}
                    </span>
                  )}
                  {eventInfo.event.extendedProps?.clientName && (
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest mt-1">
                      <User className="w-2.5 h-2.5 shrink-0" strokeWidth={2} /><span className="truncate">{eventInfo.event.extendedProps.clientName}</span>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* Calendar CSS — Editorial Healthtech theme */}
        <style jsx global>{`
          .calendar-container {
            --fc-page-bg-color: transparent;
            --fc-neutral-bg-color: #f5f5f5;
            --fc-neutral-text-color: #000;
            --fc-border-color: #000;
            --fc-button-text-color: #000;
            --fc-button-bg-color: #fff;
            --fc-button-border-color: #000;
            --fc-button-hover-bg-color: #000;
            --fc-button-hover-border-color: #000;
            --fc-button-active-bg-color: #000;
            --fc-button-active-border-color: #000;
            --fc-now-indicator-color: #000;
          }
          .dark .calendar-container {
            --fc-neutral-bg-color: #111;
            --fc-neutral-text-color: #fff;
            --fc-border-color: #fff;
            --fc-button-text-color: #fff;
            --fc-button-bg-color: #0a0a0a;
            --fc-button-border-color: #fff;
            --fc-button-hover-bg-color: #fff;
            --fc-button-hover-border-color: #fff;
            --fc-button-active-bg-color: #fff;
            --fc-button-active-border-color: #fff;
            --fc-now-indicator-color: #fff;
          }
          .fc-theme-standard .fc-scrollgrid { border: none !important; }
          .fc-theme-standard td, .fc-theme-standard th { border-color: var(--fc-border-color) !important; border-width: 1px !important; }
          .fc-scrollgrid-section-header > th { border-top: none !important; border-left: none !important; border-right: none !important; border-bottom: 2px solid var(--fc-border-color) !important; }
          .fc-col-header-cell-cushion { padding: 12px 4px !important; font-size: 10px; font-weight: 700; color: var(--fc-neutral-text-color); text-transform: uppercase; letter-spacing: 0.1em; }
          .fc-day-today .fc-col-header-cell-cushion { color: var(--fc-button-bg-color); background-color: var(--fc-neutral-text-color); padding: 4px 8px !important; margin: 8px 0; }
          .fc .fc-toolbar-title { font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; font-style: italic; font-size: 1.5rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--fc-neutral-text-color); }
          .fc .fc-button-primary { border-radius: 0 !important; font-weight: 700 !important; font-size: 10px !important; text-transform: uppercase !important; letter-spacing: 0.1em !important; transition: all 0.2s ease; border-width: 1px !important; }
          .fc .fc-button-primary:hover { color: var(--fc-button-bg-color) !important; }
          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active { background-color: var(--fc-neutral-text-color) !important; color: var(--fc-button-bg-color) !important; border-color: var(--fc-neutral-text-color) !important; }
          .editorial-calendar-event { border: 1px solid var(--fc-border-color) !important; border-radius: 0 !important; box-shadow: 2px 2px 0 0 var(--fc-border-color); margin: 1px 2px !important; }
          .fc .fc-timegrid-slot { height: 3rem; }
          .fc .fc-timegrid-slot-label-cushion { font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: var(--fc-neutral-text-color); }
          .fc .fc-daygrid-day.fc-day-today,
          .fc .fc-timegrid-col.fc-day-today { background: var(--fc-neutral-bg-color) !important; }
          .fc-timegrid-now-indicator-line { border-width: 2px; border-style: dashed; }
          .fc-timegrid-now-indicator-arrow { border-width: 6px; border-color: var(--fc-now-indicator-color) transparent transparent transparent; }
        `}</style>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
        {[{ status: "confirmed" }, { status: "pending" }, { status: "completed" }].map(item => {
          const theme = getStatusTheme(item.status);
          return (
            <div key={item.status} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-none border border-black dark:border-white" style={{ backgroundColor: theme.bg }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{theme.label}</span>
            </div>
          );
        })}
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white text-black dark:text-white sm:max-w-md rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] p-8 overflow-hidden transition-colors">
          {selectedEvent && (
            <>
              <div className="absolute top-0 left-0 right-0 h-2 bg-black dark:bg-white" />
              <DialogHeader className="pt-2 border-b border-black dark:border-white pb-6 mb-4">
                <DialogTitle className="font-serif text-2xl font-bold uppercase text-black dark:text-white">{selectedEvent.title}</DialogTitle>
                <DialogDescription className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-2 flex items-center gap-2">
                  <CalendarIcon className="w-3 h-3" strokeWidth={2} />{t("event_detail.booking_id")}: #{selectedEvent.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-white dark:bg-[#0a0a0a] rounded-none p-4 border border-black dark:border-white space-y-4 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-none bg-black dark:bg-white flex items-center justify-center border border-black dark:border-white shrink-0">
                      <User className="w-4 h-4 text-white dark:text-black" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t("event_detail.patient")}</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-black dark:text-white mt-1">{selectedEvent.extendedProps?.clientName || t("event_detail.new_patient")}</p>
                    </div>
                  </div>
                  <div className="border-t border-black dark:border-white pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-black dark:text-white" strokeWidth={2} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                        {new Date(selectedEvent.start).toLocaleString(locale === "es" ? "es-MX" : "en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="border border-black dark:border-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: getStatusTheme(selectedEvent.extendedProps?.status).bg, color: getStatusTheme(selectedEvent.extendedProps?.status).text }}>
                      {getStatusTheme(selectedEvent.extendedProps?.status).label}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-none p-4 border border-black dark:border-white">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t("event_detail.modality")}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mt-2">
                      {selectedEvent.extendedProps?.modality === "ONLINE" ? <Video className="w-4 h-4" strokeWidth={2} /> : <MapPin className="w-4 h-4" strokeWidth={2} />}
                      <span>{selectedEvent.extendedProps?.modality === "ONLINE" ? t("event_detail.online") : t("event_detail.in_office")}</span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-none p-4 border border-black dark:border-white">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t("event_detail.payment")}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mt-2">
                      {selectedEvent.extendedProps?.paymentStatus === "SETTLED" ? t("event_detail.paid") : t("event_detail.payment_pending")}
                    </p>
                  </div>
                </div>
                {selectedEvent.extendedProps?.notes && (
                  <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none p-4">
                    <p className="text-[10px] text-black dark:text-white font-bold uppercase tracking-widest mb-2">{t("event_detail.notes")}</p>
                    <p className="text-xs text-gray-500 uppercase font-light">{selectedEvent.extendedProps.notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-4 w-full pt-6 mt-6 border-t border-black dark:border-white">
                {(selectedEvent.extendedProps?.status === "confirmed" || selectedEvent.extendedProps?.status === "pending") ? (
                  <button onClick={handleCancelAppointment} disabled={isCancelling}
                    className="w-full sm:w-auto h-12 px-6 flex items-center justify-center border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[10px] uppercase font-bold tracking-widest disabled:opacity-50">
                    {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" strokeWidth={2} /> : <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />}
                    {t("event_detail.cancel_appointment")}
                  </button>
                ) : <div className="flex-1" />}
                <button onClick={() => setSelectedEvent(null)}
                  className="w-full sm:w-auto h-12 px-8 bg-black text-white dark:bg-white dark:text-black text-[10px] uppercase font-bold tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
                  {t("event_detail.close")}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {!isLoading && events.length === 0 && (
        <div className="rounded-none border-2 border-dashed border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-12 text-center">
          <CalendarIcon className="w-10 h-10 mx-auto text-black dark:text-white mb-4" strokeWidth={1} />
          <p className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
            {t("empty_title")}
          </p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mt-2">
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