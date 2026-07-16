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
      className={`text-[10px] font-bold flex items-center gap-1 ${isOverdue ? "text-red-500" : "text-blue-500"}`}
    >
      <Timer className="w-3 h-3" />
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
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.back()}
              className="w-14 h-14 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shrink-0"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight uppercase flex items-center gap-3 mb-1">
                <HeartHandshake className="w-8 h-8" strokeWidth={1.5} />
                Cuidado y Bienestar
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Monitoreo de salud y rutinas de...{" "}
                <span className="text-black dark:text-white">
                  {member.firstName} {member.lastName}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Hero CTA (Blueprint Block) */}
        <div className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex flex-col md:flex-row">
          <div className="p-8 md:p-12 flex-1">
            <span className="border border-white/30 dark:border-black/30 px-3 py-1 text-[9px] font-bold uppercase tracking-widest mb-6 inline-flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" strokeWidth={2} />
              Asistencia en Casa
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight leading-tight">
              Atención profesional en la comodidad de su hogar
            </h2>
            <p className="text-xs font-light text-gray-400 dark:text-gray-600 mb-8 max-w-xl leading-relaxed">
              Solicite cuidadores, enfermeros o terapeutas físicos certificados
              para brindar atención clínica a sus seres queridos con monitoreo
              constante.
            </p>
            <Button
              onClick={handleRequestCare}
              className="rounded-none bg-white text-black dark:bg-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center border-0"
            >
              Solicitar Asistencia
              <ArrowRight className="w-4 h-4 ml-3" strokeWidth={2} />
            </Button>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-white/20 dark:border-black/20 p-8 md:w-64 flex flex-col items-center justify-center text-center bg-white/5 dark:bg-black/5">
            <PhoneCall
              className="w-10 h-10 mb-4 opacity-80"
              strokeWidth={1.5}
            />
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2">
              Asistencia 24/7
            </div>
            <div className="text-[9px] font-light uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Cobertura Integral
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Signos Vitales */}
          <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col">
            <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 dark:bg-[#050505] gap-4">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-1">
                  <HeartPulse className="w-4 h-4" strokeWidth={1.5} />
                  Signos Vitales
                </h3>
                <p className="text-[9px] uppercase tracking-widest text-gray-500">
                  Haz clic en una métrica para registrar un nuevo valor
                </p>
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
          <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col">
            <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                <Pill className="w-4 h-4" strokeWidth={1.5} />
                Tratamiento Actual
              </h3>
              <Button
                variant="outline"
                onClick={() => {
                  setMedicationToEdit(null);
                  setIsMedModalOpen(true);
                }}
                className="rounded-none border border-black dark:border-white h-8 px-4 text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                <Plus className="w-3 h-3 mr-2" strokeWidth={2} /> Añadir
              </Button>
            </div>

            <div className="p-6 grid grid-cols-1 gap-4">
              {dashboardData?.activeMedications?.length === 0 && (
                <div className="text-center p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Sin medicación activa
                  </p>
                </div>
              )}
              {dashboardData?.activeMedications?.map((med) => (
                <div
                  key={med.id}
                  className="border border-gray-200 dark:border-gray-800 p-6 hover:border-black dark:hover:border-white transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold tracking-tight text-black dark:text-white uppercase mb-1">
                        {med.medicationName}
                      </h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        {med.dosage}
                      </p>
                    </div>
                    <div className="border border-black dark:border-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 w-fit">
                      <CalendarClock
                        className="w-3.5 h-3.5"
                        strokeWidth={1.5}
                      />
                      {FREQUENCY_OPTIONS.find(
                        (opt) => opt.value === med.frequency,
                      )?.label || med.frequency}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Progreso
                      </span>
                      <span className="text-[10px] font-bold text-black dark:text-white">
                        {med.adherenceCount || 0} / {med.totalExpected || "-"}{" "}
                        dosis
                      </span>
                    </div>
                    {med.nextDueTime && (
                      <div className="flex justify-between items-center bg-gray-50 dark:bg-[#050505] p-2 mt-1 border border-gray-100 dark:border-gray-900">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                            Próxima toma
                          </span>
                          <span className="text-[10px] font-bold text-black dark:text-white">
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
                      className="w-full mt-2 rounded-none bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black uppercase tracking-widest text-[9px] font-bold h-8"
                    >
                      Registrar Toma
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-4 border-t border-gray-100 dark:border-gray-900 pt-4">
                    {med.isManual ? (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-blue-500">
                        Agregado por la familia
                      </p>
                    ) : (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
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
                          className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMedicationToDelete(med.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white w-full max-w-sm shadow-2xl relative p-6">
            <h2 className="text-xl font-bold tracking-tight text-black dark:text-white mb-2">
              Eliminar Medicamento
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              ¿Estás seguro de que deseas eliminar este medicamento? Esta acción
              no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setMedicationToDelete(null)}
                className="rounded-none border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 uppercase tracking-widest text-[10px] font-bold"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleDeleteMedication(medicationToDelete)}
                className="rounded-none bg-red-600 hover:bg-red-700 text-white uppercase tracking-widest text-[10px] font-bold border-0"
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
