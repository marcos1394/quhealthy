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
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle, AlertCircle, Zap, Loader2, Trash2, Video, MapPin, Plus } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointment";
import { useOperatingHours } from "@/hooks/useOperatingHours";
import { CalendarEvent } from "@/types/appointments";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { NewAppointmentModal } from "@/components/dashboard/NewAppointmentModal";
import { useLocale, useTranslations } from "next-intl";

export const CalendarView: React.FC = () => {
  const { fetchCalendarEvents, reschedule, cancel, isLoading } = useAppointments();
  const { fetchSchedules } = useOperatingHours();
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

  const [slotMinTime, setSlotMinTime] = useState("07:00:00");
  const [slotMaxTime, setSlotMaxTime] = useState("22:00:00");
  const [fcBusinessHours, setFcBusinessHours] = useState<any[]>([{
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    startTime: "08:00",
    endTime: "20:00",
  }]);

  const loadEvents = useCallback(async (start?: string, end?: string) => { 
    // Fallback if FullCalendar hasn't passed dates yet
    const s = start || new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
    const e = end || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0];
    const data = await fetchCalendarEvents(s, e); 
    setEvents(data); 
  }, [fetchCalendarEvents]);

  // Se llama al inicializar o al recargar
  useEffect(() => { loadEvents(); }, [loadEvents]);

  useEffect(() => {
    const loadHours = async () => {
      const schedules = await fetchSchedules(1);
      const activeDays = schedules.filter(s => s.isActive);
      if (activeDays.length > 0) {
        let minTime = "23:59";
        let maxTime = "00:00";
        const newFcBusinessHours = activeDays.map(s => {
          if (s.openTime < minTime) minTime = s.openTime;
          if (s.closeTime > maxTime) maxTime = s.closeTime;
          return {
            daysOfWeek: [s.dayOfWeek],
            startTime: s.openTime,
            endTime: s.closeTime
          };
        });
        setSlotMinTime(`${minTime}:00`);
        setSlotMaxTime(`${maxTime}:00`);
        setFcBusinessHours(newFcBusinessHours);
      }
    };
    loadHours();
  }, [fetchSchedules]);

  const handleEventDrop = async (info: any) => {
    const success = await reschedule(Number(info.event.id), info.event.start.toISOString());
    if (!success) info.revert(); else loadEvents();
  };

  const handleCancelAppointment = async () => {
    if (!selectedEvent) return;
    setIsCancelling(true);
    const success = await cancel(Number(selectedEvent.id), "ANULADO POR EL OPERADOR");
    if (success) { setSelectedEvent(null); loadEvents(); }
    setIsCancelling(false);
  };

  // PALETA TÉCNICA (Muted Jewel Tones)
  const getStatusTheme = (status?: string) => {
    const themes: Record<string, { bg: string; border: string; text: string; label: string }> = {
      confirmed: { bg: "#166534", border: "#14532d", text: "#ffffff", label: t("confirmed", { defaultValue: 'CONFIRMADO' }) },
      pending: { bg: "#b45309", border: "#78350f", text: "#ffffff", label: t("pending", { defaultValue: 'PENDIENTE' }) },
      cancelled: { bg: "#991b1b", border: "#7f1d1d", text: "#ffffff", label: t("cancelled", { defaultValue: 'ANULADO' }) },
      completed: { bg: "#1e3a8a", border: "#1e3a8a", text: "#ffffff", label: t("completed", { defaultValue: 'COMPLETADO' }) }
    };
    return themes[status || ""] || { bg: "#3f3f46", border: "#27272a", text: "#ffffff", label: t("no_status", { defaultValue: 'SIN ESTADO' }) };
  };

  const getStatusIcon = (status?: string) => {
    const icons: Record<string, React.ReactNode> = {
      confirmed: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />, 
      pending: <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />,
      cancelled: <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />, 
      completed: <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />
    };
    return icons[status || ""] || <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />;
  };

  const stats = {
    confirmed: events.filter(e => e.extendedProps?.status === "confirmed").length,
    pending: events.filter(e => e.extendedProps?.status === "pending").length,
  };

  const processedEvents = events.map(ev => {
    const theme = getStatusTheme(ev.extendedProps?.status);
    return { 
      ...ev, 
      backgroundColor: theme.bg, 
      borderColor: theme.border, 
      textColor: theme.text, 
      display: "block",
      className: "editorial-calendar-event" 
    };
  });

  return (
    <div className="flex-1 w-full flex flex-col space-y-6">
      
      {/* PANEL DE CONTROL SUPERIOR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] transition-colors rounded-none">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 border border-[#14532d] bg-[#166534] text-white px-4 py-2 text-[9px] font-bold uppercase tracking-widest rounded-none">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            {stats.confirmed} {t("confirmed", { defaultValue: 'CONFIRMADOS' })}
          </div>
          <div className="flex items-center gap-2 border border-[#78350f] bg-[#b45309] text-white px-4 py-2 text-[9px] font-bold uppercase tracking-widest rounded-none">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
            {stats.pending} {t("pending", { defaultValue: 'PENDIENTES' })}
          </div>
        </div>

        <button 
          onClick={() => {
            setSelectedDateSlot(new Date());
            setIsNewApptModalOpen(true);
          }}
          className="flex items-center gap-3 bg-transparent text-black dark:text-white border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors px-6 h-12 text-[10px] font-bold uppercase tracking-widest w-full sm:w-auto justify-center rounded-none"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} /> AGENDAR TURNO
        </button>
      </div>

      {/* CONTENEDOR DEL CALENDARIO */}
      <div className="relative w-full bg-white dark:bg-[#0a0a0a] border border-black dark:border-white flex flex-col transition-colors rounded-none">
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center z-50 transition-colors">
              <div className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white border border-black dark:border-white px-10 py-8 flex flex-col items-center gap-5 rounded-none">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" strokeWidth={1.5} />
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Sincronizando Agenda...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-2 md:p-6 w-full calendar-container overflow-x-auto custom-scrollbar">
          <div className="min-w-[600px] md:min-w-0">
            <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={currentView}
            headerToolbar={{ 
              left: "prev,next today", 
              center: "title", 
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek" 
            }}
            locale={fullCalendarLocale}
            buttonText={{
              today: t("buttons.today", { defaultValue: 'HOY' }),
              month: t("buttons.month", { defaultValue: 'MES' }),
              week: t("buttons.week", { defaultValue: 'SEMANA' }),
              day: t("buttons.day", { defaultValue: 'DÍA' }),
              list: t("buttons.list", { defaultValue: 'LISTA' })
            }}
            height="auto"
            allDaySlot={false} 
            slotMinTime={slotMinTime} 
            slotMaxTime={slotMaxTime}
            expandRows={true} 
            stickyHeaderDates={true} 
            nowIndicator={true}
            scrollTime={new Date().toTimeString().substring(0,8)}
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
              const ev = events.find(e => String(e.id) === String(info.event.id)); 
              if (ev) setSelectedEvent(ev); 
            }}
            viewDidMount={(info) => setCurrentView(info.view.type as any)}
            windowResize={(info) => {
              if (window.innerWidth < 768 && info.view.type === "timeGridWeek") {
                info.view.calendar.changeView("timeGridDay");
              }
            }}
            eventMouseEnter={(info) => setHoveredEvent(String(info.event.id))}
            eventMouseLeave={() => setHoveredEvent(null)}
            datesSet={(dateInfo) => {
              // Call loadEvents specifically with the view's current start/end dates
              // Convert to YYYY-MM-DD
              const startStr = dateInfo.start.toISOString().split('T')[0];
              const endStr = dateInfo.end.toISOString().split('T')[0];
              loadEvents(startStr, endStr);
            }}
            eventContent={(eventInfo) => {
              const theme = getStatusTheme(eventInfo.event.extendedProps?.status);
              const isHovered = hoveredEvent === String(eventInfo.event.id);
              
              if (eventInfo.view.type === "dayGridMonth") {
                return (
                  <div 
                    className="flex flex-col gap-0.5 overflow-hidden px-1.5 py-1 w-full rounded-none"
                    style={{ backgroundColor: theme.bg, color: theme.text, borderLeft: `3px solid ${theme.border}` }}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-widest truncate leading-tight opacity-90">
                      {eventInfo.timeText}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest truncate leading-tight">
                      {eventInfo.event.title}
                    </span>
                  </div>
                );
              }
              
              return (
                <div className={cn(
                  "flex flex-col h-full px-2 py-1.5 overflow-hidden transition-all duration-200 border rounded-none", 
                  isHovered ? "opacity-100 ring-1 ring-inset ring-current" : "opacity-90"
                )}
                  style={{ 
                    borderColor: theme.border, 
                    backgroundColor: theme.bg, 
                    color: theme.text 
                  }}>
                  <div className="flex items-center justify-between mb-1 border-b border-inherit pb-1 opacity-70">
                    <span className="text-[9px] font-bold uppercase tracking-widest font-mono">{eventInfo.timeText}</span>
                    {getStatusIcon(eventInfo.event.extendedProps?.status)}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest leading-tight truncate mt-1">
                    {eventInfo.event.title}
                  </div>
                  {eventInfo.event.extendedProps?.clientName && (
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest mt-auto pt-2 opacity-70">
                      <User className="w-3 h-3 shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{eventInfo.event.extendedProps.clientName}</span>
                    </div>
                  )}
                </div>
              );
            }}
          />
          </div>
        </div>

        {/* MOTOR CSS BLUEPRINT PARA FULLCALENDAR */}
        <style jsx global>{`
          .calendar-container {
            --fc-page-bg-color: transparent;
            --fc-neutral-bg-color: #f9fafb;
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
            --fc-neutral-bg-color: #050505;
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
          .fc-theme-standard .fc-scrollgrid { border: 1px solid var(--fc-border-color) !important; border-radius: 0 !important; }
          .fc-theme-standard td, .fc-theme-standard th { border-color: var(--fc-border-color) !important; border-width: 1px !important; }
          .fc-scrollgrid-section-header > th { border: 1px solid var(--fc-border-color) !important; }
          .fc-col-header-cell-cushion { padding: 12px 8px !important; font-size: 9px; font-weight: 700; color: var(--fc-neutral-text-color); text-transform: uppercase; letter-spacing: 0.1em; }
          .fc-day-today .fc-col-header-cell-cushion { color: var(--fc-button-bg-color); background-color: var(--fc-neutral-text-color); padding: 4px 8px !important; margin: 8px 0; }
          .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 600 !important; letter-spacing: -0.02em !important; text-transform: uppercase; color: var(--fc-neutral-text-color); }
          .fc .fc-button-primary { border-radius: 0 !important; font-weight: 700 !important; font-size: 9px !important; text-transform: uppercase !important; letter-spacing: 0.1em !important; transition: all 0.2s ease; border-width: 1px !important; padding: 0.5rem 1rem !important; box-shadow: none !important; }
          .fc .fc-button-primary:hover { color: var(--fc-button-bg-color) !important; background-color: var(--fc-button-hover-bg-color) !important; }
          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active { background-color: var(--fc-neutral-text-color) !important; color: var(--fc-button-bg-color) !important; border-color: var(--fc-neutral-text-color) !important; box-shadow: none !important; }
          .fc .fc-button-primary:focus { box-shadow: none !important; }
          .editorial-calendar-event { border-radius: 0 !important; margin: 1px !important; cursor: pointer; box-shadow: none !important; }
          .fc .fc-timegrid-slot { height: 3rem; }
          .fc .fc-timegrid-slot-label-cushion { font-family: monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.05em; color: var(--fc-neutral-text-color); padding: 8px !important; opacity: 0.7; }
          .fc .fc-daygrid-day.fc-day-today,
          .fc .fc-timegrid-col.fc-day-today { background: var(--fc-neutral-bg-color) !important; }
          .fc-timegrid-now-indicator-line { border-width: 1px; border-style: dashed; border-color: var(--fc-now-indicator-color); opacity: 0.5; }
          .fc-timegrid-now-indicator-arrow { display: none; }
          .fc-header-toolbar { flex-wrap: wrap; gap: 12px; }
          @media (max-width: 640px) {
            .fc-toolbar-chunk { width: 100%; display: flex; justify-content: center; }
            .fc-toolbar-chunk:first-child { justify-content: flex-start; }
            .fc-toolbar-chunk:last-child { justify-content: flex-start; margin-top: 8px; }
          }
        `}</style>
      </div>

      {/* LEYENDA (Footer Estricto) */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-2">
        {["confirmed", "pending", "completed", "cancelled"].map(status => {
          const theme = getStatusTheme(status);
          return (
            <div key={status} className="flex items-center gap-2">
              <div className="w-3 h-3 border border-black dark:border-white" style={{ backgroundColor: theme.bg }} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{theme.label}</span>
            </div>
          );
        })}
      </div>

      {/* DIÁLOGO DEL EXPEDIENTE (Blueprint Grid) */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white text-black dark:text-white sm:max-w-2xl rounded-none p-0 overflow-hidden transition-colors">
          {selectedEvent && (
            <div className="flex flex-col">
              {/* Header Modal */}
              <div className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 border-b border-black/20 dark:border-white/20 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                    {t("event_detail.booking_id", { defaultValue: 'ID OPERACIÓN' })}: #{selectedEvent.id}
                  </p>
                  <DialogTitle className="font-semibold text-xl md:text-2xl uppercase tracking-tight text-black dark:text-white leading-none">
                    {selectedEvent.title}
                  </DialogTitle>
                </div>
                <div className="hidden sm:flex w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] items-center justify-center shrink-0">
                  <CalendarIcon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                </div>
              </div>

              {/* Body Modal: Matriz Matemática */}
              <div className="flex flex-col bg-gray-50 dark:bg-[#050505]">
                
                {/* Fila 1: Paciente y Estado */}
                <div className="flex flex-col sm:flex-row border-b border-black/10 dark:border-white/10">
                  <div className="flex-1 p-6 md:p-8 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex items-start gap-4">
                    <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">
                        {t("event_detail.patient", { defaultValue: 'PACIENTE ASIGNADO' })}
                      </p>
                      <p className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
                        {selectedEvent.extendedProps?.clientName || t("event_detail.new_patient", { defaultValue: 'USUARIO EXTERNO' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-col justify-center items-start sm:items-end gap-3">
                     <span className="border border-black dark:border-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-none" style={{ backgroundColor: getStatusTheme(selectedEvent.extendedProps?.status).bg, color: getStatusTheme(selectedEvent.extendedProps?.status).text }}>
                      {getStatusTheme(selectedEvent.extendedProps?.status).label}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {new Date(selectedEvent.start).toLocaleString(locale === "es" ? "es-MX" : "en-US", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>

                {/* Fila 2: Detalles Técnicos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10">
                  <div className="bg-white dark:bg-[#0a0a0a] p-6 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10">
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">1</span>
                      {t("event_detail.modality", { defaultValue: 'CANAL DE ATENCIÓN' })}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mt-3">
                      {selectedEvent.extendedProps?.modality === "ONLINE" ? <Video className="w-4 h-4" strokeWidth={1.5} /> : <MapPin className="w-4 h-4" strokeWidth={1.5} />}
                      <span>{selectedEvent.extendedProps?.modality === "ONLINE" ? t("event_detail.online", { defaultValue: 'SALA VIRTUAL' }) : t("event_detail.in_office", { defaultValue: 'INSTALACIÓN FÍSICA' })}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-[#0a0a0a] p-6">
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">2</span>
                      {t("event_detail.payment", { defaultValue: 'ESTADO FINANCIERO' })}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mt-3">
                      {selectedEvent.extendedProps?.paymentStatus === "SETTLED" ? t("event_detail.paid", { defaultValue: 'LIQUIDADO' }) : t("event_detail.payment_pending", { defaultValue: 'PENDIENTE DE COBRO' })}
                    </p>
                  </div>
                </div>

                {/* Notas Adjuntas (Opcional) */}
                {selectedEvent.extendedProps?.notes && (
                  <div className="bg-gray-50 dark:bg-[#050505] p-6 md:p-8">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-3 border-b border-black/10 dark:border-white/10 pb-2">
                      {t("event_detail.notes", { defaultValue: 'OBSERVACIONES CLÍNICAS' })}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 uppercase font-semibold tracking-widest leading-relaxed">
                      {selectedEvent.extendedProps.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Modal: Botones Sólidos */}
              <div className="bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 p-6 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
                {(selectedEvent.extendedProps?.status === "confirmed" || selectedEvent.extendedProps?.status === "pending") && (
                  <button onClick={handleCancelAppointment} disabled={isCancelling}
                    className="w-full sm:w-auto h-12 px-8 flex items-center justify-center border border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest disabled:opacity-50 rounded-none bg-transparent">
                    {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" strokeWidth={1.5} /> : <Trash2 className="w-4 h-4 mr-2" strokeWidth={1.5} />}
                    {t("event_detail.cancel_appointment", { defaultValue: 'ANULAR CITA' })}
                  </button>
                )}
                <button onClick={() => setSelectedEvent(null)}
                  className="w-full sm:w-auto h-12 px-10 bg-black text-white dark:bg-white dark:text-black text-[10px] uppercase font-bold tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors border-0 rounded-none">
                  {t("event_detail.close", { defaultValue: 'CERRAR EXPEDIENTE' })}
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
          onSuccess={loadEvents}
        />
      )}
    </div>
  );
};