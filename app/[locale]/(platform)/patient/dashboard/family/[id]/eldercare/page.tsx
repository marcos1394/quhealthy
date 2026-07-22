"use client";
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  HeartHandshake,
  ChevronLeft,
  Activity,
  Thermometer,
  HeartPulse,
  Pill,
  CalendarClock,
  PhoneCall,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFamily } from "@/hooks/useFamily";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
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
import { Trash2, Edit2, Timer } from "lucide-react";

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
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
    const timer = setInterval(calculateTimeLeft, 60000); // update every minute

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <span
      className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-full ${isOverdue ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"}`}
    >
      <Timer className="w-3.5 h-3.5" strokeWidth={2} />
      {isOverdue ? `Retraso de ${timeLeft}` : `Faltan ${timeLeft}`}
    </span>
  );
};

export default function EldercarePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
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
    null,
  );

  const handleMetricClick = (metricKey: string) => {
    setSelectedMetric(metricKey);
    setIsModalOpen(true);
  };

  const handleSaveVital = async (
    metricKey: string,
    value: number,
    secondaryValue?: number,
    measuredAt?: string,
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
      toast.success("Signo vital registrado");
      const data = await eldercareService.getDashboard(member.id);
      setDashboardData(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar signo vital");
    }
  };

  const handleSaveMedication = async (
    data: AddMedicationRequest,
    taskId?: number,
  ) => {
    try {
      if (taskId) {
        await eldercareService.updateMedication(member.id, taskId, data);
        toast.success("Medicamento actualizado");
      } else {
        await eldercareService.addMedication(member.id, data);
        toast.success("Medicamento añadido");
      }
      const dashboardData = await eldercareService.getDashboard(member.id);
      setDashboardData(dashboardData);
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar medicamento");
    }
  };

  const handleDeleteMedication = async (taskId: number) => {
    try {
      await eldercareService.deleteMedication(member.id, taskId);
      toast.success("Medicamento eliminado");
      const dashboardData = await eldercareService.getDashboard(member.id);
      setDashboardData(dashboardData);
      setMedicationToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar medicamento");
    }
  };

  const handleTakeMedication = async (taskId: number) => {
    try {
      await eldercareService.takeMedication(member.id, taskId);
      toast.success("Dosis registrada correctamente");
      const dashboardData = await eldercareService.getDashboard(member.id);
      setDashboardData(dashboardData);
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar dosis");
    }
  };

  const baseMetrics = [
    {
      metricKey: "BLOOD_PRESSURE",
      title: "Presión Arterial",
      icon: "heart.fill",
      subtitle: "Normal: 120/80",
      recommendedFrequency: "Diario",
    },
    {
      metricKey: "HEART_RATE",
      title: "Frecuencia Cardíaca",
      icon: "heart.fill",
      subtitle: "Normal: 60-100",
      recommendedFrequency: "Diario",
    },
    {
      metricKey: "GLUCOSE",
      title: "Glucosa",
      icon: "drop.fill",
      subtitle: "Normal: 70-100",
      recommendedFrequency: "Semanal",
    },
    {
      metricKey: "SPO2",
      title: "Oxigenación",
      icon: "drop.fill",
      subtitle: "Normal: >95%",
      recommendedFrequency: "Diario",
    },
    {
      metricKey: "TEMPERATURE",
      title: "Temperatura",
      icon: "thermometer",
      subtitle: "Normal: 36.5°C",
      recommendedFrequency: "Diario",
    },
    {
      metricKey: "WEIGHT",
      title: "Peso Corporal",
      icon: "scalemass",
      subtitle: "Monitoreo de cambios",
      recommendedFrequency: "Mensual",
    },
  ];

  const mappedMetrics: HealthMetricDto[] = baseMetrics.map((base) => {
    const vital = dashboardData?.recentVitals?.find(
      (v) => v.type === base.metricKey,
    );
    let value = "";
    let lastUpdated = "";
    if (vital) {
      if (vital.type === "BLOOD_PRESSURE") {
        value = `${vital.value}/${vital.secondaryValue}`;
      } else {
        value = `${vital.value} ${vital.unit || ""}`.trim();
      }
      lastUpdated = new Date(vital.measuredAt).toLocaleDateString();
    }

    return {
      ...base,
      value,
      lastUpdated,
      color: "#000000",
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
            toast.error("Error al cargar datos clínicos");
            setIsLoadingData(false);
          });
      } else {
        toast.error("Familiar no encontrado");
        router.push("/patient/dashboard/family");
      }
    }
  }, [isLoading, family, params.id, router]);

  const handleRequestCare = () => {
    toast.info(
      "Redirigiendo a solicitud de servicios de enfermería a domicilio...",
    );
    router.push("/patient/dashboard/appointments/book?service=nursing");
  };

  if (isLoading || !member || isLoadingData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-white dark:bg-[#0a0a0a]">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
          Cargando perfil de salud...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans pb-32 text-black dark:text-white selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12">
        {/* Header Back & Info */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.back()}
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-[#0a0a0a] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm shrink-0"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
                  <HeartHandshake className="w-6 h-6" strokeWidth={2} />
                </div>
                Cuidado y Bienestar
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Monitoreo de salud y rutinas de{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {member.firstName} {member.lastName}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Hero CTA */}
        <div className="border border-gray-100 dark:border-gray-800 bg-emerald-900 dark:bg-emerald-950 text-white rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-lg">
          <div className="p-8 md:p-12 flex-1 flex flex-col justify-center">
            <span className="bg-emerald-800/50 border border-emerald-700/50 px-3 py-1 rounded-full text-xs font-bold mb-6 inline-flex items-center gap-2 w-fit">
              <Activity className="w-4 h-4" strokeWidth={2} />
              Asistencia en Casa
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight leading-tight">
              Atención profesional en la comodidad de su hogar
            </h2>
            <p className="text-sm font-medium text-emerald-100/80 mb-8 max-w-xl leading-relaxed">
              Solicite cuidadores, enfermeros o terapeutas físicos certificados
              para brindar atención clínica a sus seres queridos con monitoreo
              constante.
            </p>
            <Button
              onClick={handleRequestCare}
              className="rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 h-12 px-8 text-sm font-bold transition-all flex items-center w-fit shadow-sm border-0"
            >
              Solicitar Asistencia
              <ArrowRight className="w-4 h-4 ml-3" strokeWidth={2} />
            </Button>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-emerald-800/30 p-8 md:w-64 flex flex-col items-center justify-center text-center bg-black/10">
            <PhoneCall
              className="w-12 h-12 mb-4 text-emerald-200"
              strokeWidth={1.5}
            />
            <div className="text-sm font-bold text-white mb-1">
              Asistencia 24/7
            </div>
            <div className="text-xs font-medium text-emerald-200/70">
              Cobertura Integral
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Signos Vitales */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-3xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 dark:border-gray-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/50 dark:bg-gray-900/10 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-900/20">
                  <HeartPulse className="w-4 h-4" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                    Signos Vitales
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    Haz clic en una métrica para registrar un nuevo valor
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

          {/* Medicación Activa */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-3xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/10">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20">
                  <Pill className="w-4 h-4" strokeWidth={2} />
                </div>
                Tratamiento Actual
              </h3>
              <Button
                variant="outline"
                onClick={() => {
                  setMedicationToEdit(null);
                  setIsMedModalOpen(true);
                }}
                className="rounded-xl border border-gray-200 dark:border-gray-700 h-9 px-4 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-2" strokeWidth={2} /> Añadir
              </Button>
            </div>

            <div className="p-6 grid grid-cols-1 gap-4">
              {dashboardData?.activeMedications?.length === 0 && (
                <div className="text-center p-8 bg-gray-50/50 dark:bg-gray-900/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-500">
                    Sin medicación activa
                  </p>
                </div>
              )}
              {dashboardData?.activeMedications?.map((med) => (
                <div
                  key={med.id}
                  className="border border-gray-100 dark:border-gray-800 p-6 rounded-2xl hover:border-quhealthy-green/30 dark:hover:border-quhealthy-green/30 transition-all shadow-sm hover:shadow-md group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                      <h4 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                        {med.medicationName}
                      </h4>
                      <p className="text-xs font-bold text-gray-500">
                        {med.dosage}
                      </p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-fit border border-indigo-100 dark:border-indigo-800/50">
                      <CalendarClock
                        className="w-4 h-4"
                        strokeWidth={2}
                      />
                      {FREQUENCY_OPTIONS.find(
                        (opt) => opt.value === med.frequency,
                      )?.label || med.frequency}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-gray-500">
                        Progreso
                      </span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {med.adherenceCount || 0} / {med.totalExpected || "-"}{" "}
                        dosis
                      </span>
                    </div>
                    {med.nextDueTime && (
                      <div className="flex justify-between items-center bg-gray-50/80 dark:bg-gray-900/30 p-3 mt-1 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-500 mb-0.5">
                            Próxima toma
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {new Date(med.nextDueTime).toLocaleString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "numeric",
                              month: "short",
                            })}
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
                      className="w-full mt-3 rounded-xl bg-quhealthy-green hover:bg-emerald-700 text-white text-sm font-bold h-10 shadow-sm border-0"
                    >
                      Registrar Toma
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-5 border-t border-gray-100 dark:border-gray-800 pt-4 px-1">
                    {med.isManual ? (
                      <p className="text-xs font-bold text-indigo-500">
                        Agregado por la familia
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-gray-500">
                        Indicado por el especialista
                      </p>
                    )}
                    {med.isManual && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setMedicationToEdit(med);
                            setIsMedModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMedicationToDelete(med.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {medicationToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 w-full max-w-sm rounded-3xl shadow-xl relative p-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
              Eliminar Medicamento
            </h2>
            <p className="text-sm font-medium text-gray-500 mb-6">
              ¿Estás seguro de que deseas eliminar este medicamento? Esta acción
              no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setMedicationToDelete(null)}
                className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-bold shadow-sm"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleDeleteMedication(medicationToDelete)}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold border-0 shadow-sm"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
