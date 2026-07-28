"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  HeartHandshake,
  ChevronLeft,
  Activity,
  HeartPulse,
  Pill,
  CalendarClock,
  PhoneCall,
  Plus,
  ArrowRight,
  Trash2,
  Edit2,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFamily } from "@/hooks/useFamily";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { toast } from "react-toastify";
import {
  eldercareService,
  EldercareDashboardDto,
  MedicationTaskDto,
  AddMedicationRequest,
} from "@/services/eldercare.service";
import {
  HealthMetricsCarousel,
  HealthMetricDto,
} from "@/components/dashboard/HealthMetricsCarousel";
import { HealthMetricInputModal } from "@/components/dashboard/HealthMetricInputModal";
import {
  MedicationInputModal,
  FREQUENCY_OPTIONS,
} from "@/components/dashboard/MedicationInputModal";
import { cn } from "@/lib/utils";

// ── COMPONENTE: CONTADOR REGRESIVO INTERNACIONALIZADO ───────────────────────
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const t = useTranslations("PatientEldercare");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      setIsOverdue(diff < 0);

      const absDiff = Math.abs(diff);
      const hours = Math.floor(absDiff / (1000 * 60 * 60));
      const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <span
      className={cn(
        "text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-sm transition-colors",
        isOverdue
          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
      )}
    >
      <Timer className="w-3.5 h-3.5" strokeWidth={2} />
      <span>
        {isOverdue
          ? t("timer_overdue", { time: timeLeft })
          : t("timer_remaining", { time: timeLeft })}
      </span>
    </span>
  );
};

// ── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function EldercarePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("PatientEldercare");
  const locale = useLocale();

  const { family, isLoading } = useFamily();
  const [member, setMember] = useState<any>(null);
  const [dashboardData, setDashboardData] =
    useState<EldercareDashboardDto | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [selectedMetric, setSelectedMetric] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] =
    useState<MedicationTaskDto | null>(null);
  const [medicationToDelete, setMedicationToDelete] = useState<number | null>(
    null
  );

  const handleMetricClick = (metricKey: string) => {
    setSelectedMetric(metricKey);
    setIsModalOpen(true);
  };

  const handleSaveVital = async (
    metricKey: string,
    value: number,
    secondaryValue?: number,
    measuredAt?: string
  ) => {
    try {
      await eldercareService.addVitalSign(member.id, {
        type: metricKey as any,
        value: value.toString(),
        secondaryValue: secondaryValue ? secondaryValue.toString() : undefined,
        unit:
          metricKey === "TEMPERATURE"
            ? "°C"
            : metricKey === "WEIGHT"
              ? "kg"
              : "",
        measuredAt: measuredAt,
        source: "MANUAL",
      });
      toast.success(t("vital_saved_toast"));
      const data = await eldercareService.getDashboard(member.id);
      setDashboardData(data);
    } catch (error) {
      console.error(error);
      toast.error(t("vital_save_error"));
    }
  };

  const handleSaveMedication = async (
    data: AddMedicationRequest,
    taskId?: number
  ) => {
    try {
      if (taskId) {
        await eldercareService.updateMedication(member.id, taskId, data);
        toast.success(t("med_updated_toast"));
      } else {
        await eldercareService.addMedication(member.id, data);
        toast.success(t("med_added_toast"));
      }
      const dataDashboard = await eldercareService.getDashboard(member.id);
      setDashboardData(dataDashboard);
    } catch (error) {
      console.error(error);
      toast.error(t("med_save_error"));
    }
  };

  const handleDeleteMedication = async (taskId: number) => {
    try {
      await eldercareService.deleteMedication(member.id, taskId);
      toast.success(t("med_deleted_toast"));
      const dataDashboard = await eldercareService.getDashboard(member.id);
      setDashboardData(dataDashboard);
      setMedicationToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error(t("med_delete_error"));
    }
  };

  const handleTakeMedication = async (taskId: number) => {
    try {
      await eldercareService.takeMedication(member.id, taskId);
      toast.success(t("med_taken_toast"));
      const dataDashboard = await eldercareService.getDashboard(member.id);
      setDashboardData(dataDashboard);
    } catch (error) {
      console.error(error);
      toast.error(t("med_take_error"));
    }
  };

  const baseMetrics = [
    {
      metricKey: "BLOOD_PRESSURE",
      title: t("metric_blood_pressure"),
      icon: "heart.fill",
      subtitle: t("metric_blood_pressure_sub"),
      recommendedFrequency: t("freq_daily"),
    },
    {
      metricKey: "HEART_RATE",
      title: t("metric_heart_rate"),
      icon: "heart.fill",
      subtitle: t("metric_heart_rate_sub"),
      recommendedFrequency: t("freq_daily"),
    },
    {
      metricKey: "GLUCOSE",
      title: t("metric_glucose"),
      icon: "drop.fill",
      subtitle: t("metric_glucose_sub"),
      recommendedFrequency: t("freq_weekly"),
    },
    {
      metricKey: "SPO2",
      title: t("metric_spo2"),
      icon: "drop.fill",
      subtitle: t("metric_spo2_sub"),
      recommendedFrequency: t("freq_daily"),
    },
    {
      metricKey: "TEMPERATURE",
      title: t("metric_temperature"),
      icon: "thermometer",
      subtitle: t("metric_temperature_sub"),
      recommendedFrequency: t("freq_daily"),
    },
    {
      metricKey: "WEIGHT",
      title: t("metric_weight"),
      icon: "scalemass",
      subtitle: t("metric_weight_sub"),
      recommendedFrequency: t("freq_monthly"),
    },
  ];

  const mappedMetrics: HealthMetricDto[] = baseMetrics.map((base) => {
    const vital = dashboardData?.recentVitals?.find(
      (v) => v.type === base.metricKey
    );
    let value = "";
    let lastUpdated = "";
    if (vital) {
      if (vital.type === "BLOOD_PRESSURE") {
        value = `${vital.value}/${vital.secondaryValue}`;
      } else {
        value = `${vital.value} ${vital.unit || ""}`.trim();
      }
      lastUpdated = new Date(vital.measuredAt).toLocaleDateString(
        locale === "en" ? "en-US" : "es-MX"
      );
    }

    return {
      ...base,
      value,
      lastUpdated,
      color: "#059669",
    };
  });

  useEffect(() => {
    if (!isLoading && family) {
      const found = family.find((f) => f.id === Number(params.id));
      if (found) {
        setMember(found);
        eldercareService
          .getDashboard(found.id)
          .then((data) => {
            setDashboardData(data);
            setIsLoadingData(false);
          })
          .catch((err) => {
            console.error(err);
            toast.error(t("load_error"));
            setIsLoadingData(false);
          });
      } else {
        toast.error(t("member_not_found"));
        router.push("/patient/dashboard/family");
      }
    }
  }, [isLoading, family, params.id, router, t]);

  const handleRequestCare = () => {
    toast.info(t("request_care_toast"));
    router.push("/patient/dashboard/appointments/book?service=nursing");
  };

  if (isLoading || !member || isLoadingData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505]">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans pb-32 text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-12 space-y-10">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-gray-100 dark:border-gray-800 pb-8">
          <button
            onClick={() => router.back()}
            aria-label={t("cancel")}
            className="w-12 h-12 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-sm shrink-0"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shadow-sm shrink-0">
                <HeartHandshake className="w-5 h-5" strokeWidth={2} />
              </div>
              <span>{t("header_title")}</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
              {t("header_subtitle", {
                name: `${member.firstName} ${member.lastName}`,
              })}
            </p>
          </div>
        </div>

        {/* ── HERO BANNER (SOLICITAR ASISTENCIA) ───────────────────────── */}
        <div className="border border-emerald-800/20 bg-gradient-to-br from-emerald-900 via-emerald-950 to-gray-950 text-white rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl relative">
          <div className="p-8 sm:p-12 flex-1 flex flex-col justify-center relative z-10">
            <span className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-bold mb-5 inline-flex items-center gap-2 w-fit shadow-sm">
              <Activity className="w-4 h-4 text-emerald-400" strokeWidth={2} />
              <span>{t("hero_badge")}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 tracking-tight leading-snug">
              {t("hero_title")}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-emerald-100/80 mb-8 max-w-xl leading-relaxed">
              {t("hero_desc")}
            </p>
            <Button
              onClick={handleRequestCare}
              className="rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 h-12 px-7 text-xs font-bold transition-all flex items-center gap-2 w-fit shadow-md border-0"
            >
              <span>{t("hero_btn")}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Button>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-emerald-800/30 p-8 md:w-64 flex flex-col items-center justify-center text-center bg-black/20 backdrop-blur-sm">
            <PhoneCall
              className="w-10 h-10 mb-3 text-emerald-300"
              strokeWidth={1.5}
            />
            <div className="text-xs sm:text-sm font-bold text-white mb-0.5">
              {t("hero_support_title")}
            </div>
            <div className="text-[11px] font-medium text-emerald-200/70">
              {t("hero_support_desc")}
            </div>
          </div>
        </div>

        {/* ── GRID DE MONITOREO Y MEDICATION ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tarjeta: Signos Vitales */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-3xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 dark:border-gray-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/50 dark:bg-[#111]/30 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                  <HeartPulse className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("vitals_title")}
                  </h3>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                    {t("vitals_subtitle")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6">
              <HealthMetricsCarousel
                metrics={mappedMetrics}
                isLoading={isLoadingData}
                onMetricClick={handleMetricClick}
              />
            </div>
          </div>

          {/* Tarjeta: Medicación Activa */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-3xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between bg-gray-50/50 dark:bg-[#111]/30">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                  <Pill className="w-5 h-5" strokeWidth={2} />
                </div>
                <span>{t("meds_title")}</span>
              </h3>
              <Button
                variant="outline"
                onClick={() => {
                  setMedicationToEdit(null);
                  setIsMedModalOpen(true);
                }}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 h-9 px-4 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                <span>{t("meds_add_btn")}</span>
              </Button>
            </div>

            <div className="p-6 grid grid-cols-1 gap-4">
              {dashboardData?.activeMedications?.length === 0 && (
                <div className="text-center p-8 bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("meds_empty")}
                  </p>
                </div>
              )}
              {dashboardData?.activeMedications?.map((med) => (
                <div
                  key={med.id}
                  className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all shadow-sm group bg-white dark:bg-[#0a0a0a]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-base font-bold tracking-tight text-gray-900 dark:text-white mb-0.5">
                        {med.medicationName}
                      </h4>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {med.dosage}
                      </p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
                      <CalendarClock className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>
                        {FREQUENCY_OPTIONS.find(
                          (opt) => opt.value === med.frequency
                        )?.label || med.frequency}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {t("meds_progress")}
                      </span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                        {t("meds_doses", {
                          count: med.adherenceCount || 0,
                          total: med.totalExpected || "-",
                        })}
                      </span>
                    </div>

                    {med.nextDueTime && (
                      <div className="flex justify-between items-center bg-gray-50/80 dark:bg-[#050505] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-gray-400 mb-0.5">
                            {t("meds_next_due")}
                          </span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {new Date(med.nextDueTime).toLocaleString(
                              locale === "en" ? "en-US" : "es-MX",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "numeric",
                                month: "short",
                              }
                            )}
                          </span>
                        </div>
                        <CountdownTimer targetDate={med.nextDueTime} />
                      </div>
                    )}

                    <Button
                      onClick={() => handleTakeMedication(med.id)}
                      disabled={
                        med.totalExpected !== undefined &&
                        med.adherenceCount !== undefined &&
                        med.adherenceCount >= med.totalExpected
                      }
                      className="w-full mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold h-10 shadow-sm border-0 transition-colors"
                    >
                      {t("meds_take_btn")}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-4 border-t border-gray-100 dark:border-gray-800 pt-3 px-1">
                    <p className="text-[11px] font-bold text-gray-400">
                      {med.isManual
                        ? t("meds_added_by_family")
                        : t("meds_prescribed")}
                    </p>

                    {med.isManual && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setMedicationToEdit(med);
                            setIsMedModalOpen(true);
                          }}
                          aria-label="Editar medicamento"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setMedicationToDelete(med.id)}
                          aria-label="Eliminar medicamento"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <HealthMetricInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        metricKey={selectedMetric}
        onSave={handleSaveVital}
      />

      <MedicationInputModal
        isOpen={isMedModalOpen}
        onClose={() => setIsMedModalOpen(false)}
        medicationToEdit={medicationToEdit}
        onSave={handleSaveMedication}
      />

      {/* ── MODAL CONFIRMACIÓN DE ELIMINACIÓN ───────────────────────────── */}
      {medicationToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 w-full max-w-sm rounded-3xl shadow-xl relative p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("delete_modal_title")}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("delete_modal_desc")}
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setMedicationToDelete(null)}
                className="rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm h-10 px-4"
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={() => handleDeleteMedication(medicationToDelete)}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold border-0 shadow-sm h-10 px-4"
              >
                {t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}