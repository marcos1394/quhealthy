"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Check, Loader2, User, Clock, Calendar, Activity, CheckCircle2, XCircle, Timer, Phone, MessageSquare, Star, Zap, X, Video, Heart, Sparkles, Award, PlayCircle, UserCheck } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompletionModal } from "@/components/dashboard/CompletionModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { NewAppointmentModal } from "@/components/dashboard/NewAppointmentModal";
import { useProviderAppointments } from "@/hooks/useProviderAppointments";
import { appointmentService } from "@/services/appointment.service";
import { ProviderAppointment } from "@/types/appointments";
import { useTranslations } from "next-intl";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { handleApiError } from '@/lib/handleApiError';

export default function ProviderAppointmentsPage() {
  const router = useRouter();
  const { appointments, setAppointments, isLoading, refetch } = useProviderAppointments();
  const t = useTranslations('DashboardAppointments');

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ProviderAppointment | null>(null);
  const [cancelModalState, setCancelModalState] = useState<{ isOpen: boolean; appointment: ProviderAppointment | null }>({ isOpen: false, appointment: null });
  const [isCanceling, setIsCanceling] = useState(false);

  const handleOpenCancelModal = (appointment: ProviderAppointment) => setCancelModalState({ isOpen: true, appointment });

  const handleConfirmCancel = async () => {
    if (!cancelModalState.appointment) return;
    setIsCanceling(true);
    try {
      await appointmentService.cancelAppointment(cancelModalState.appointment.id, "Canceled by doctor from agenda");
      toast.success(t('toast_cancelled_success'));
      setAppointments(prev => prev.map(a => a.id === cancelModalState.appointment?.id ? { ...a, status: "CANCELED_BY_PROVIDER" } : a));
      setCancelModalState({ isOpen: false, appointment: null });
    } catch (error) { console.error(error); handleApiError(error); }
    finally { setIsCanceling(false); }
  };

  const handleUpdateStatus = async (appointmentId: string | number, newStatus: string) => {
    try {
      await appointmentService.updateStatus(appointmentId, newStatus);
      toast.success(t('toast_status_updated', { status: newStatus }));
      refetch();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleOpenCompletionModal = (appointment: ProviderAppointment) => { setSelectedAppointment(appointment); setIsCompleteModalOpen(true); };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED": return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0";
      case "SCHEDULED": return "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0";
      case "WAITING_ROOM": return "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 border-0";
      case "IN_PROGRESS": return "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-0 animate-pulse";
      case "CANCELED_BY_CONSUMER":
      case "CANCELED_BY_PROVIDER": return "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-0";
      default: return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED": return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "SCHEDULED": return <Calendar className="w-3.5 h-3.5" />;
      case "WAITING_ROOM": return <UserCheck className="w-3.5 h-3.5" />;
      case "IN_PROGRESS": return <PlayCircle className="w-3.5 h-3.5" />;
      case "PENDING_PAYMENT": return <Timer className="w-3.5 h-3.5" />;
      default: return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED": return t('card.completed');
      case "SCHEDULED": return t('card.scheduled');
      case "WAITING_ROOM": return t('card.waiting_room');
      case "IN_PROGRESS": return t('card.in_progress');
      case "PENDING_PAYMENT": return t('card.pending_payment');
      case "CANCELED_BY_CONSUMER": return t('card.cancelled_by_patient');
      case "CANCELED_BY_PROVIDER": return t('card.cancelled_by_you');
      default: return status;
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status.toUpperCase() === "PENDING_PAYMENT").length,
    confirmed: appointments.filter(a => ["SCHEDULED", "WAITING_ROOM", "IN_PROGRESS"].includes(a.status.toUpperCase())).length,
    completed: appointments.filter(a => a.status.toUpperCase() === "COMPLETED").length,
    canceled: appointments.filter(a => a.status.toUpperCase().includes("CANCELED")).length
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <QhSpinner size="md" />
        <p className="text-slate-500 dark:text-slate-400 animate-pulse font-light">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-medical-600 dark:text-medical-400" />{t('title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-light">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsNewAppointmentModalOpen(true)}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold rounded-xl shadow-none"
          >
            <Zap className="w-4 h-4 mr-2" />{t('quick_actions.new_appointment')}
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-slate-900 dark:text-white", icon: Activity, bg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700" },
          { label: t('card.pending_payment'), value: stats.pending, color: "text-amber-600 dark:text-amber-400", icon: Timer, bg: "bg-amber-50 dark:bg-amber-500/5", border: "border-amber-200 dark:border-amber-500/20" },
          { label: t('card.scheduled'), value: stats.confirmed, color: "text-blue-600 dark:text-blue-400", icon: CheckCircle2, bg: "bg-blue-50 dark:bg-blue-500/5", border: "border-blue-200 dark:border-blue-500/20" },
          { label: t('card.completed'), value: stats.completed, color: "text-emerald-600 dark:text-emerald-400", icon: Award, bg: "bg-emerald-50 dark:bg-emerald-500/5", border: "border-emerald-200 dark:border-emerald-500/20" },
          { label: t('card.cancelled'), value: stats.canceled, color: "text-red-600 dark:text-red-400", icon: XCircle, bg: "bg-red-50 dark:bg-red-500/5", border: "border-red-200 dark:border-red-500/20" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`${stat.bg} border ${stat.border} rounded-xl p-3.5 flex flex-col items-center justify-center text-center transition-colors`}>
            <stat.icon className={`w-4 h-4 mb-1.5 ${stat.color}`} />
            <span className={`text-xl font-semibold ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Views</h2>
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <TabsTrigger value="list" className="rounded-lg text-sm px-4 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-medical-600 dark:data-[state=active]:text-medical-400 data-[state=active]:shadow-sm transition-all">
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-lg text-sm px-4 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-medical-600 dark:data-[state=active]:text-medical-400 data-[state=active]:shadow-sm transition-all">
              Calendar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="space-y-3 m-0">
          <AnimatePresence mode="popLayout">
            {appointments.length > 0 ? (
              appointments.map((appt, index) => {
                const appointmentDate = new Date(appt.startTime);
                const isToday = appointmentDate.toDateString() === new Date().toDateString();
                const currentStatus = appt.status.toUpperCase();

                return (
                  <motion.div key={appt.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ delay: index * 0.03 }}
                    className={`group relative bg-white dark:bg-slate-900 border rounded-xl p-5 transition-all ${isToday ? "border-medical-200 dark:border-medical-500/30 bg-medical-50/30 dark:bg-medical-500/5" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}>
                    {isToday && (
                      <div className="absolute top-0 right-0 bg-medical-600 dark:bg-medical-500 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-bl-xl rounded-tr-xl flex items-center gap-1 z-10">
                        <Sparkles className="w-2.5 h-2.5" />TODAY
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-0">
                      <div className="flex items-start gap-3.5 w-full md:w-auto">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                          <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors truncate">
                            {appt.service.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                            <span className="text-slate-900 dark:text-white font-medium">{appt.consumer.name}</span>
                            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                            <span className="flex items-center gap-1 text-medical-600 dark:text-medical-400">
                              <Clock className="w-3 h-3" />
                              {formatInTimeZone(new Date(appt.startTime), "UTC", "d MMM, HH:mm", { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                        <Badge className={`${getStatusBadgeStyle(appt.status)} px-2.5 py-1 h-7`}>
                          <span className="flex items-center gap-1">{getStatusIcon(appt.status)}{getStatusText(appt.status)}</span>
                        </Badge>
                        {appt.service.serviceDeliveryType === "video_call" && ["SCHEDULED", "WAITING_ROOM", "IN_PROGRESS"].includes(currentStatus) && (
                          <Button size="sm" onClick={() => router.push(`/video-call/${appt.id}`)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-none text-xs h-7">
                            <Video className="w-3.5 h-3.5 mr-1.5" />{t('actions.enter')}
                          </Button>
                        )}
                        {["SCHEDULED", "PENDING_PAYMENT"].includes(currentStatus) && (
                          <Button size="sm" variant="outline" onClick={() => toast.info(t('toast_reschedule_pending'))}
                            className="text-slate-600 dark:text-slate-300 rounded-lg text-xs h-7">
                            <Clock className="w-3.5 h-3.5 mr-1" />{t('actions.reschedule')}
                          </Button>
                        )}
                        {["SCHEDULED", "WAITING_ROOM", "PENDING_PAYMENT"].includes(currentStatus) && (
                          <Button size="sm" variant="ghost" onClick={() => handleOpenCancelModal(appt)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-xs h-7">
                            <X className="w-3.5 h-3.5" /><span className="hidden sm:inline ml-1">{t('actions.cancel')}</span>
                          </Button>
                        )}
                        {currentStatus === "SCHEDULED" && (
                          <Button size="sm" onClick={() => handleUpdateStatus(appt.id, "WAITING_ROOM")}
                            className="bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-300 rounded-lg shadow-none text-xs h-7">
                            <UserCheck className="w-3.5 h-3.5 mr-1" />{t('actions.arrived')}
                          </Button>
                        )}
                        {["SCHEDULED", "WAITING_ROOM"].includes(currentStatus) && (
                          <Button size="sm" onClick={() => handleUpdateStatus(appt.id, "IN_PROGRESS")}
                            className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-none text-xs h-7">
                            <PlayCircle className="w-3.5 h-3.5 mr-1" />{t('actions.start')}
                          </Button>
                        )}
                        {currentStatus === "IN_PROGRESS" && (
                          <Button size="sm" onClick={() => handleOpenCompletionModal(appt)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-none text-xs h-7">
                            <Check className="w-3.5 h-3.5 mr-1" />{t('actions.finish')}
                          </Button>
                        )}
                      </div>
                    </div>
                    {["SCHEDULED", "WAITING_ROOM", "IN_PROGRESS", "PENDING_PAYMENT"].includes(currentStatus) && (
                      <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex gap-5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <button className="hover:text-medical-600 dark:hover:text-medical-400 flex items-center gap-1.5 transition-colors">
                          <Phone className="w-3 h-3" />{t('actions.call')}
                        </button>
                        <button className="hover:text-medical-600 dark:hover:text-medical-400 flex items-center gap-1.5 transition-colors">
                          <MessageSquare className="w-3 h-3" />WhatsApp
                        </button>
                        <button className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors">
                          <Star className="w-3 h-3" />{t('actions.view_history')}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-14 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/30">
                <div className="bg-slate-100 dark:bg-slate-800 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-7 h-7 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1.5">No scheduled appointments</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm font-light">Your calendar is free. Share your profile to start receiving patients.</p>
                <Button variant="link" className="mt-3 text-medical-600 dark:text-medical-400 text-sm">Copy profile link</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="calendar" className="m-0 h-[600px]">
          <CalendarView />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CompletionModal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} appointment={selectedAppointment}
        onComplete={() => { refetch(); setIsCompleteModalOpen(false); }} />
      <ConfirmationModal isOpen={cancelModalState.isOpen} onClose={() => setCancelModalState({ isOpen: false, appointment: null })}
        onConfirm={handleConfirmCancel} title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? The patient will be notified and a refund will be processed if applicable. This action is irreversible."
        isLoading={isCanceling} variant="destructive" />
      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={() => setIsNewAppointmentModalOpen(false)}
        onCreated={refetch}
      />
    </div>
  );
}
