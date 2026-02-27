"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Check, Loader2, User, Clock, Calendar, Activity, CheckCircle2, XCircle, Timer, Phone, MessageSquare, Star, Zap, X, Video, Heart, Sparkles, Award } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompletionModal } from "@/components/dashboard/CompletionModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useProviderAppointments } from "@/hooks/useProviderAppointments";
import { appointmentService } from "@/services/appointment.service";
import { ProviderAppointment } from "@/types/appointments";
import { useTranslations } from "next-intl";

export default function ProviderAppointmentsPage() {
  const router = useRouter();
  const { appointments, setAppointments, isLoading, refetch } = useProviderAppointments();
  const t = useTranslations('DashboardAppointments');

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ProviderAppointment | null>(null);
  const [cancelModalState, setCancelModalState] = useState<{ isOpen: boolean; appointment: ProviderAppointment | null }>({ isOpen: false, appointment: null });
  const [isCanceling, setIsCanceling] = useState(false);

  const handleOpenCancelModal = (appointment: ProviderAppointment) => setCancelModalState({ isOpen: true, appointment });

  const handleConfirmCancel = async () => {
    if (!cancelModalState.appointment) return;
    setIsCanceling(true);
    try {
      await appointmentService.cancelAppointment(cancelModalState.appointment.id, "Canceled by doctor from agenda");
      toast.success("Appointment canceled successfully.");
      setAppointments(prev => prev.map(a => a.id === cancelModalState.appointment?.id ? { ...a, status: "canceled_by_provider" } : a));
      setCancelModalState({ isOpen: false, appointment: null });
    } catch (error) { console.error(error); toast.error("Could not cancel appointment. Try again."); }
    finally { setIsCanceling(false); }
  };

  const handleOpenCompletionModal = (appointment: ProviderAppointment) => { setSelectedAppointment(appointment); setIsCompleteModalOpen(true); };

  const getStatusBadgeStyle = (status: ProviderAppointment["status"]) => {
    switch (status) {
      case "completed": return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0";
      case "confirmed": return "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0";
      case "canceled_by_consumer":
      case "canceled_by_provider": return "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-0";
      default: return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0";
    }
  };

  const getStatusIcon = (status: ProviderAppointment["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "confirmed": return <Check className="w-3.5 h-3.5" />;
      case "pending": return <Timer className="w-3.5 h-3.5" />;
      default: return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusText = (status: ProviderAppointment["status"]) => {
    switch (status) {
      case "completed": return t('card.completed');
      case "confirmed": return t('card.confirmed');
      case "pending": return t('card.pending');
      case "canceled_by_consumer": return t('card.cancelled') + " (Client)";
      case "canceled_by_provider": return t('card.cancelled') + " (You)";
      default: return status;
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === "pending").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
    canceled: appointments.filter(a => a.status.includes("canceled")).length
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-medical-600 dark:text-medical-400 mb-3" />
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
        <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold rounded-xl shadow-none">
          <Zap className="w-4 h-4 mr-2" />{t('quick_actions.new_appointment')}
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-slate-900 dark:text-white", icon: Activity, bg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700" },
          { label: t('card.pending'), value: stats.pending, color: "text-amber-600 dark:text-amber-400", icon: Timer, bg: "bg-amber-50 dark:bg-amber-500/5", border: "border-amber-200 dark:border-amber-500/20" },
          { label: t('card.confirmed'), value: stats.confirmed, color: "text-blue-600 dark:text-blue-400", icon: CheckCircle2, bg: "bg-blue-50 dark:bg-blue-500/5", border: "border-blue-200 dark:border-blue-500/20" },
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

      {/* Appointments List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {appointments.length > 0 ? (
            appointments.map((appt, index) => {
              const appointmentDate = new Date(appt.startTime);
              const isToday = appointmentDate.toDateString() === new Date().toDateString();
              const isCompletable = new Date() >= new Date(appt.startTime);
              const isPast = new Date() > new Date(appt.endTime);

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
                      {appt.service.serviceDeliveryType === "video_call" && (appt.status === "confirmed" || appt.status === "pending") && (
                        <Button size="sm" onClick={() => router.push(`/video-call/${appt.id}`)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-none text-xs h-7">
                          <Video className="w-3.5 h-3.5 mr-1.5" />Join
                        </Button>
                      )}
                      {appt.status === "confirmed" && !isPast && (
                        <Button size="sm" variant="ghost" onClick={() => handleOpenCancelModal(appt)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-xs h-7">
                          <X className="w-3.5 h-3.5" /><span className="hidden sm:inline ml-1">Cancel</span>
                        </Button>
                      )}
                      {appt.status === "confirmed" && (
                        <Button size="sm" onClick={() => handleOpenCompletionModal(appt)} disabled={!isCompletable}
                          className={`rounded-lg shadow-none text-xs h-7 ${isCompletable ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                            }`}
                          title={!isCompletable ? "You can complete when the appointment time arrives" : "Finish service"}>
                          <Check className="w-3.5 h-3.5 mr-1" />Complete
                        </Button>
                      )}
                    </div>
                  </div>
                  {["confirmed", "pending"].includes(appt.status) && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex gap-5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <button className="hover:text-medical-600 dark:hover:text-medical-400 flex items-center gap-1.5 transition-colors">
                        <Phone className="w-3 h-3" />Call
                      </button>
                      <button className="hover:text-medical-600 dark:hover:text-medical-400 flex items-center gap-1.5 transition-colors">
                        <MessageSquare className="w-3 h-3" />WhatsApp
                      </button>
                      <button className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors">
                        <Star className="w-3 h-3" />View History
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
      </div>

      {/* Modals */}
      <CompletionModal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} appointment={selectedAppointment}
        onComplete={() => { refetch(); setIsCompleteModalOpen(false); }} />
      <ConfirmationModal isOpen={cancelModalState.isOpen} onClose={() => setCancelModalState({ isOpen: false, appointment: null })}
        onConfirm={handleConfirmCancel} title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? The patient will be notified and a refund will be processed if applicable. This action is irreversible."
        isLoading={isCanceling} variant="destructive" />
    </div>
  );
}