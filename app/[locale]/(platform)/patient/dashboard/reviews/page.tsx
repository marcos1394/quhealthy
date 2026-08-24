"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  MessageSquareHeart,
  StarHalf,
  Clock,
  Calendar,
  User,
  Star,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { toast } from "react-toastify";

import { useMyReviews } from "@/hooks/useMyReviews";
import { ReviewHistoryCard } from "@/components/reviews/ReviewHistoryCard";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { appointmentService } from "@/services/appointment.service";
import { reviewService } from "@/services/review.service";
import { AppointmentResponse } from "@/types/appointments";
import { cn } from "@/lib/utils";

export default function PatientReviewsDashboard() {
  const t = useTranslations("PatientReviewsDashboard");
  const tForm = useTranslations("PatientReviews");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;

  const { reviews, isLoading: isReviewsLoading, refetch: refetchReviews } = useMyReviews();

  const [activeTab, setActiveTab] = useState<"HISTORY" | "PENDING">("HISTORY");
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState<boolean>(true);

  // Modal de Calificación Directa
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingPunctuality, setRatingPunctuality] = useState(0);
  const [ratingCommunication, setRatingCommunication] = useState(0);
  const [ratingKnowledge, setRatingKnowledge] = useState(0);
  const [ratingFacilities, setRatingFacilities] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Cargar citas del paciente ──────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setIsLoadingAppointments(true);
    try {
      const data = await appointmentService.getMyAppointments(0, 100);
      setAppointments(data.content || []);
    } catch (err) {
      console.error("Error al cargar citas para reseñas:", err);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // ── Identificar citas completadas pendientes de calificar ───────────────
  const pendingAppointments = useMemo(() => {
    const completed = appointments.filter((app) => app.status === "COMPLETED");
    return completed.filter(
      (app) => !reviews.some((rev) => rev.appointmentId === app.id)
    );
  }, [appointments, reviews]);

  // ── Abrir modal de reseña para una cita ─────────────────────────────────
  const handleOpenReviewModal = (appointment: AppointmentResponse) => {
    setSelectedAppointment(appointment);
    setRating(5);
    setRatingPunctuality(5);
    setRatingCommunication(5);
    setRatingKnowledge(5);
    setRatingFacilities(5);
    setIsAnonymous(false);
    setComment("");
  };

  const handleCloseReviewModal = () => {
    setSelectedAppointment(null);
    setRating(0);
    setComment("");
  };

  // ── Enviar reseña desde el Dashboard ────────────────────────────────────
  const handleSubmitReview = async () => {
    if (!selectedAppointment) return;
    if (rating === 0) {
      toast.error(tForm("toast_rating_required"));
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.createReview({
        providerId: selectedAppointment.providerId,
        appointmentId: selectedAppointment.id,
        serviceId: selectedAppointment.serviceId,
        rating,
        ratingPunctuality: ratingPunctuality > 0 ? ratingPunctuality : undefined,
        ratingCommunication: ratingCommunication > 0 ? ratingCommunication : undefined,
        ratingKnowledge: ratingKnowledge > 0 ? ratingKnowledge : undefined,
        ratingFacilities: ratingFacilities > 0 ? ratingFacilities : undefined,
        isAnonymous,
        comment: comment.trim(),
      });

      toast.success(tForm("toast_success"));
      handleCloseReviewModal();
      await Promise.all([refetchReviews(), fetchAppointments()]);
      setActiveTab("HISTORY");
    } catch (err) {
      console.error("Error enviando reseña desde dashboard:", err);
      toast.error(tForm("toast_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isReviewsLoading || isLoadingAppointments;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-5xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 shadow-2xs flex items-center justify-center shrink-0">
            <MessageSquareHeart className="w-7 h-7" strokeWidth={2} />
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

        {/* ── SELECTOR DE PESTAÑAS ──────────────────────────────────────── */}
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800 gap-2 no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={cn(
              "px-5 h-11 text-xs font-bold transition-all whitespace-nowrap rounded-2xl border flex items-center gap-2 cursor-pointer",
              activeTab === "HISTORY"
                ? "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-2xs"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a]"
            )}
          >
            <span>{t("tab_history")}</span>
            <Badge className="ml-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] px-2 py-0">
              {reviews.length}
            </Badge>
          </button>
          
          <button
            onClick={() => setActiveTab("PENDING")}
            className={cn(
              "px-5 h-11 text-xs font-bold transition-all whitespace-nowrap rounded-2xl border flex items-center gap-2 cursor-pointer",
              activeTab === "PENDING"
                ? "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-2xs"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a]"
            )}
          >
            <span>{t("tab_pending")}</span>
            {pendingAppointments.length > 0 && (
              <Badge className="ml-1 bg-emerald-600 text-white text-[10px] px-2 py-0">
                {pendingAppointments.length}
              </Badge>
            )}
          </button>
        </div>

        {/* ── CONTENIDO DINÁMICO ────────────────────────────────────────── */}
        {activeTab === "HISTORY" && (
          <div className="space-y-5">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewHistoryCard key={review.id} review={review} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 text-center shadow-2xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 shadow-2xs flex items-center justify-center mb-6">
                  <StarHalf className="w-8 h-8" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t("empty_history_title")}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                  {t("empty_history_desc")}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "PENDING" && (
          <div className="space-y-5">
            {pendingAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAppointments.map((app) => {
                  let formattedDate = "";
                  try {
                    formattedDate = format(new Date(app.startTime), "dd MMMM yyyy, HH:mm 'hrs'", {
                      locale: dateLocale,
                    });
                  } catch {
                    formattedDate = app.startTime;
                  }

                  return (
                    <div
                      key={app.id}
                      className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            <span>Consulta Concluida</span>
                          </Badge>
                          <span className="text-[11px] font-medium text-gray-400">
                            ID: #{app.id}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          {app.serviceName || (app as any).service?.name || "Consulta Médica"}
                        </h3>

                        {(app.provider?.name || (app as any).providerName) && (
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{app.provider?.name || (app as any).providerName}</span>
                          </p>
                        )}

                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{t("completed_on", { date: formattedDate })}</span>
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleOpenReviewModal(app)}
                        className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span>{t("btn_leave_review")}</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 text-center shadow-2xs">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-2xs flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t("pending_empty_title")}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
                  {t("pending_empty_desc")}
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── MODAL PARA CALIFICAR CITA ─────────────────────────────────── */}
      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && handleCloseReviewModal()}>
        <DialogContent className="max-w-2xl p-0 bg-transparent border-0 shadow-none overflow-hidden">
          {selectedAppointment && (
            <ReviewForm
              entityType="SERVICE"
              rating={rating}
              setRating={setRating}
              ratingPunctuality={ratingPunctuality}
              setRatingPunctuality={setRatingPunctuality}
              ratingCommunication={ratingCommunication}
              setRatingCommunication={setRatingCommunication}
              ratingKnowledge={ratingKnowledge}
              setRatingKnowledge={setRatingKnowledge}
              ratingFacilities={ratingFacilities}
              setRatingFacilities={setRatingFacilities}
              isAnonymous={isAnonymous}
              setIsAnonymous={setIsAnonymous}
              comment={comment}
              setComment={setComment}
              onSubmit={handleSubmitReview}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}