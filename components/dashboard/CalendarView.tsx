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
    const success = await cancel(Number(selectedEvent.id), "ANULADO POR EL OPERADOR");
    if (success) { setSelectedEvent(null); loadEvents(); }
    setIsCancelling(false);
  };

  // PALETA TÉCNICA (UX Amigable pero Brutalista)
  const getStatusTheme = (status?: string) => {
    const themes: Record<string, { bg: string; border: string; text: string; label: string }> = {
      confirmed: { bg: "#000", border: "#000", text: "#fff", label: t("confirmed", { defaultValue: 'CONFIRMADO' }) },
      pending: { bg: "#fff", border: "#000", text: "#000", label: t("pending", { defaultValue: 'PENDIENTE' }) },
      cancelled: { bg: "#fff", border: "#ef4444", text: "#ef4444", label: t("cancelled", { defaultValue: 'ANULADO' }) },
      completed: { bg: "#f3f4f6", border: "#000", text: "#000", label: t("completed", { defaultValue: 'COMPLETADO' }) }
    };
    return themes[status || ""] || { bg: "#fff", border: "#000", text: "#000", label: t("no_status", { defaultValue: 'SIN ESTADO' }) };
  };

  const getStatusIcon = (status?: string) => {
    const icons: Record<string, React.ReactNode> = {
      confirmed: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />, 
      pending: <Clock className="w-3.5 h-3.5" strokeWidth={2} />,
      cancelled: <XCircle className="w-3.5 h-3.5" strokeWidth={2} />, 
      completed: <Zap className="w-3.5 h-3.5" strokeWidth={2} />
    };
    return icons[status || ""] || <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />;
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
    <div className="h-full w-full flex flex-col space-y-6">
      
      {/* PANEL DE CONTROL SUPERIOR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] transition-colors">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            {stats.confirmed} {t("confirmed", { defaultValue: 'CONFIRMADOS' })}
          </div>
          <div className="flex items-center gap-2 border border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
            <Clock className="w-4 h-4" strokeWidth={2} />
            {stats.pending} {t("pending", { defaultValue: 'PENDIENTES' })}
          </div>
        </div>

        <button 
          onClick={() => {
            setSelectedDateSlot(new Date());
            setIsNewApptModalOpen(true);
          }}
          className="flex items-center gap-2 bg-transparent text-black dark:text-white border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors px-6 h-12 text-[10px] font-bold uppercase tracking-widest w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" strokeWidth={2} /> AGENDAR TURNO
        </button>
      </div>

      {/* CONTENEDOR DEL CALENDARIO */}
      <div className="relative flex-1 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col transition-colors min-h-[600px]">
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm flex items-center justify-center z-50 transition-colors">
              <div className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white px-8 py-6 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin" strokeWidth={1.5} />
                <p className="text-[10px] uppercase tracking-widest font-bold">Sincronizando Agenda...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 md:p-6 flex-1 calendar-container">
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
            height="100%" 
            allDaySlot={false} 
            slotMinTime="07:00:00" 
            slotMaxTime="22:00:00"
            expandRows={true} 
            stickyHeaderDates={true} 
            nowIndicator={true}
            events={processedEvents as any} 
            editable={true} 
            droppable={true} 
            selectable={true} 
            dayMaxEvents={4}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6],
              startTime: "08:00",
              endTime: "20:00",
            }}
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
            eventMouseEnter={(info) => setHoveredEvent(String(info.event.id))}
            eventMouseLeave={() => setHoveredEvent(null)}
            eventContent={(eventInfo) => {
              const theme = getStatusTheme(eventInfo.event.extendedProps?.status);
              const isHovered = hoveredEvent === String(eventInfo.event.id);
              
              if (eventInfo.view.type === "dayGridMonth") {
                return (
                  <div className="flex items-center gap-2 overflow-hidden px-1 py-0.5">
                    <div className="w-2 h-2 shrink-0 border border-inherit" style={{ backgroundColor: theme.text === '#fff' ? '#000' : 'transparent' }} />
                    <span className="text-[9px] font-bold uppercase tracking-widest truncate" style={{ color: theme.text }}>
                      {eventInfo.timeText} {eventInfo.event.title}
                    </span>
                  </div>
                );
              }
              
              return (
                <div className={cn(
                  "flex flex-col h-full px-2 py-1.5 overflow-hidden transition-all duration-200 border", 
                  isHovered ? "opacity-100 shadow-[2px_2px_0_0_currentColor]" : "opacity-95"
                )}
                  style={{ 
                    borderColor: theme.border, 
                    backgroundColor: theme.bg, 
                    color: theme.text 
                  }}>
                  <div className="flex items-center justify-between mb-1 border-b border-inherit pb-1 opacity-80">
                    <span className="text-[10px] font-bold uppercase tracking-widest font-mono">{eventInfo.timeText}</span>
                    {getStatusIcon(eventInfo.event.extendedProps?.status)}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-wider leading-tight truncate mt-1">
                    {eventInfo.event.title}
                  </div>
                  {eventInfo.event.extendedProps?.clientName && (
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest mt-auto pt-2 opacity-80">
                      <User className="w-3 h-3 shrink-0" strokeWidth={2} />
                      <span className="truncate">{eventInfo.event.extendedProps.clientName}</span>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* MOTOR CSS NEO-BRUTALISTA PARA FULLCALENDAR */}
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
            --fc-now-indicator-color: #ef4444;
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
          }
          .fc-theme-standard .fc-scrollgrid { border: 1px solid var(--fc-border-color) !important; }
          .fc-theme-standard td, .fc-theme-standard th { border-color: var(--fc-border-color) !important; border-width: 1px !important; }
          .fc-scrollgrid-section-header > th { border: 1px solid var(--fc-border-color) !important; }
          .fc-col-header-cell-cushion { padding: 16px 8px !important; font-size: 10px; font-weight: 800; color: var(--fc-neutral-text-color); text-transform: uppercase; letter-spacing: 0.1em; }
          .fc-day-today .fc-col-header-cell-cushion { color: var(--fc-button-bg-color); background-color: var(--fc-neutral-text-color); padding: 6px 12px !important; margin: 10px 0; }
          .fc .fc-toolbar-title { font-size: 1.5rem; font-weight: 900 !important; letter-spacing: -0.05em !important; text-transform: uppercase; color: var(--fc-neutral-text-color); }
          .fc .fc-button-primary { border-radius: 0 !important; font-weight: 700 !important; font-size: 10px !important; text-transform: uppercase !important; letter-spacing: 0.1em !important; transition: all 0.2s ease; border-width: 1px !important; padding: 0.75rem 1.5rem !important; }
          .fc .fc-button-primary:hover { color: var(--fc-button-bg-color) !important; }
          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active { background-color: var(--fc-neutral-text-color) !important; color: var(--fc-button-bg-color) !important; border-color: var(--fc-neutral-text-color) !important; }
          .editorial-calendar-event { border-radius: 0 !important; margin: 1px !important; cursor: pointer; }
          .fc .fc-timegrid-slot { height: 3.5rem; }
          .fc .fc-timegrid-slot-label-cushion { font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--fc-neutral-text-color); padding: 8px !important; }
          .fc .fc-daygrid-day.fc-day-today,
          .fc .fc-timegrid-col.fc-day-today { background: var(--fc-neutral-bg-color) !important; }
          .fc-timegrid-now-indicator-line { border-width: 2px; border-style: solid; border-color: var(--fc-now-indicator-color); }
          .fc-timegrid-now-indicator-arrow { display: none; }
        `}</style>
      </div>

      {/* LEYENDA (Footer) */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-2">
        {["confirmed", "pending", "completed", "cancelled"].map(status => {
          const theme = getStatusTheme(status);
          return (
            <div key={status} className="flex items-center gap-2">
              <div className="w-4 h-4 border border-black dark:border-white" style={{ backgroundColor: theme.bg }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{theme.label}</span>
            </div>
          );
        })}
      </div>

      {/* DIÁLOGO DEL EXPEDIENTE (Evento) */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white text-black dark:text-white sm:max-w-xl rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] p-0 overflow-hidden transition-colors">
          {selectedEvent && (
            <>
              {/* Header Modal */}
              <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-black dark:border-white">
                <DialogTitle className="font-black text-2xl uppercase tracking-tighter text-black dark:text-white mb-2">
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" strokeWidth={1.5} />
                  {t("event_detail.booking_id", { defaultValue: 'ID OPERACIÓN' })}: #{selectedEvent.id}
                </DialogDescription>
              </div>

              {/* Body Modal */}
              <div className="p-6 space-y-6">
                
                {/* Paciente y Estado */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-6 flex flex-col sm:flex-row justify-between gap-6 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 border border-black dark:border-white bg-black dark:bg-white flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-white dark:text-black" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                        {t("event_detail.patient", { defaultValue: 'PACIENTE ASIGNADO' })}
                      </p>
                      <p className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
                        {selectedEvent.extendedProps?.clientName || t("event_detail.new_patient", { defaultValue: 'USUARIO EXTERNO' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                     <span className="border border-black dark:border-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest" style={{ backgroundColor: getStatusTheme(selectedEvent.extendedProps?.status).bg, color: getStatusTheme(selectedEvent.extendedProps?.status).text }}>
                      {getStatusTheme(selectedEvent.extendedProps?.status).label}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                      {new Date(selectedEvent.start).toLocaleString(locale === "es" ? "es-MX" : "en-US", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>

                {/* Detalles Técnicos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-[#050505] p-5 border border-black dark:border-white">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-3">
                      {t("event_detail.modality", { defaultValue: 'CANAL DE ATENCIÓN' })}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      {selectedEvent.extendedProps?.modality === "ONLINE" ? <Video className="w-5 h-5" strokeWidth={1.5} /> : <MapPin className="w-5 h-5" strokeWidth={1.5} />}
                      <span>{selectedEvent.extendedProps?.modality === "ONLINE" ? t("event_detail.online", { defaultValue: 'SALA VIRTUAL' }) : t("event_detail.in_office", { defaultValue: 'INSTALACIÓN FÍSICA' })}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-[#050505] p-5 border border-black dark:border-white">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-3">
                      {t("event_detail.payment", { defaultValue: 'ESTADO FINANCIERO' })}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      {selectedEvent.extendedProps?.paymentStatus === "SETTLED" ? t("event_detail.paid", { defaultValue: 'LIQUIDADO' }) : t("event_detail.payment_pending", { defaultValue: 'PENDIENTE DE COBRO' })}
                    </p>
                  </div>
                </div>

                {/* Notas Adjuntas */}
                {selectedEvent.extendedProps?.notes && (
                  <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-5">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">
                      {t("event_detail.notes", { defaultValue: 'OBSERVACIONES CLÍNICAS' })}
                    </p>
                    <p className="text-[10px] text-black dark:text-white uppercase font-bold tracking-widest leading-relaxed">
                      {selectedEvent.extendedProps.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <DialogFooter className="bg-gray-50 dark:bg-[#050505] border-t border-black dark:border-white p-6 flex flex-col sm:flex-row gap-4">
                {(selectedEvent.extendedProps?.status === "confirmed" || selectedEvent.extendedProps?.status === "pending") ? (
                  <button onClick={handleCancelAppointment} disabled={isCancelling}
                    className="w-full sm:w-auto h-12 px-6 flex items-center justify-center border border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest disabled:opacity-50 rounded-none bg-transparent">
                    {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" strokeWidth={2} /> : <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />}
                    {t("event_detail.cancel_appointment", { defaultValue: 'ANULAR CITA' })}
                  </button>
                ) : <div className="flex-1" />}
                <button onClick={() => setSelectedEvent(null)}
                  className="w-full sm:w-auto h-12 px-8 bg-black text-white dark:bg-white dark:text-black text-[10px] uppercase font-bold tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] border border-black dark:border-white rounded-none">
                  {t("event_detail.close", { defaultValue: 'CERRAR EXPEDIENTE' })}
                </button>
              </DialogFooter>
            </>
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