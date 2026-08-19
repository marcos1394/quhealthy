"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useRef, useReducer } from "react";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  User,
  Stethoscope,
  Pill,
  CheckCircle2,
  Save,
  ChevronRight,
  Activity,
  Monitor,
  Columns,
  FileText,
} from "lucide-react";

import { useConsultation } from "@/hooks/useConsultation";
import { appointmentService } from "@/services/appointment.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";

// Pasos de Consulta
import { PatientProfileStep } from "@/components/consultation/PatientProfileStep";
import { ClinicalEvaluationStep } from "@/components/consultation/ClinicalEvaluationStep";
import { TreatmentCheckoutStep } from "@/components/consultation/TreatmentCheckoutStep";
import { ConsultationSuccessStep } from "@/components/consultation/ConsultationSuccessStep";
import { PatientBackgroundPanel } from "@/components/consultation/PatientBackgroundPanel";
import { WomensHealthProviderPanel } from "@/components/consultation/WomensHealthProviderPanel";

// Modal de Caja
import { CashCheckoutModal } from "@/components/consultation/CashCheckoutModal";
import { cashRegisterService } from "@/services/cash-register.service";

// Widget de Teleconsulta
import { ProviderVideoWidget } from "@/components/teleconsultation/ProviderVideoWidget";

export default function ConsultationRoomPage() {
  const t = useTranslations("EHR");
  const params = useParams();
  const router = useRouter();

  const appointmentId = Number(params?.id);

  const [state, dispatch] = useReducer(
    (prevState: any, action: any) => {
      switch (action.type) {
        case "SET_CURRENTSTEP":
          return {
            ...prevState,
            currentStep:
              typeof action.payload === "function"
                ? action.payload(prevState.currentStep)
                : action.payload,
          };
        case "SET_CONSUMERID":
          return {
            ...prevState,
            consumerId:
              typeof action.payload === "function"
                ? action.payload(prevState.consumerId)
                : action.payload,
          };
        case "SET_PATIENTDIRECTORYID":
          return {
            ...prevState,
            patientDirectoryId:
              typeof action.payload === "function"
                ? action.payload(prevState.patientDirectoryId)
                : action.payload,
          };
        case "SET_ISOFFLINEPATIENT":
          return {
            ...prevState,
            isOfflinePatient:
              typeof action.payload === "function"
                ? action.payload(prevState.isOfflinePatient)
                : action.payload,
          };
        case "SET_PATIENTNAME":
          return {
            ...prevState,
            patientName:
              typeof action.payload === "function"
                ? action.payload(prevState.patientName)
                : action.payload,
          };
        case "SET_APPOINTMENTTYPE":
          return {
            ...prevState,
            appointmentType:
              typeof action.payload === "function"
                ? action.payload(prevState.appointmentType)
                : action.payload,
          };
        case "SET_LOADINGAPPOINTMENT":
          return {
            ...prevState,
            loadingAppointment:
              typeof action.payload === "function"
                ? action.payload(prevState.loadingAppointment)
                : action.payload,
          };
        case "SET_TOTALPRICE":
          return {
            ...prevState,
            totalPrice:
              typeof action.payload === "function"
                ? action.payload(prevState.totalPrice)
                : action.payload,
          };
        case "SET_PAYMENTMETHOD":
          return {
            ...prevState,
            paymentMethod:
              typeof action.payload === "function"
                ? action.payload(prevState.paymentMethod)
                : action.payload,
          };
        case "SET_PAYMENTSTATUS":
          return {
            ...prevState,
            paymentStatus:
              typeof action.payload === "function"
                ? action.payload(prevState.paymentStatus)
                : action.payload,
          };
        case "SET_SHOWCASHMODAL":
          return {
            ...prevState,
            showCashModal:
              typeof action.payload === "function"
                ? action.payload(prevState.showCashModal)
                : action.payload,
          };
        case "SET_REGISTERDENOMINATIONS":
          return {
            ...prevState,
            registerDenominations:
              typeof action.payload === "function"
                ? action.payload(prevState.registerDenominations)
                : action.payload,
          };
        case "SET_NEWRX":
          return {
            ...prevState,
            newRx:
              typeof action.payload === "function"
                ? action.payload(prevState.newRx)
                : action.payload,
          };
        case "SET_ISRECORDING":
          return {
            ...prevState,
            isRecording:
              typeof action.payload === "function"
                ? action.payload(prevState.isRecording)
                : action.payload,
          };
        case "SET_ISTRANSCRIBING":
          return {
            ...prevState,
            isTranscribing:
              typeof action.payload === "function"
                ? action.payload(prevState.isTranscribing)
                : action.payload,
          };
        case "SET_VIEWMODE":
          return {
            ...prevState,
            viewMode:
              typeof action.payload === "function"
                ? action.payload(prevState.viewMode)
                : action.payload,
          };
        case "SET_SERVICEID":
          return {
            ...prevState,
            serviceId:
              typeof action.payload === "function"
                ? action.payload(prevState.serviceId)
                : action.payload,
          };
        default:
          return prevState;
      }
    },
    {
      currentStep: "profile",
      consumerId: null,
      patientDirectoryId: null,
      isOfflinePatient: false,
      patientName: "",
      appointmentType: "in_person",
      loadingAppointment: true,
      totalPrice: 0,
      paymentMethod: "",
      paymentStatus: "",
      showCashModal: false,
      registerDenominations: null,
      newRx: {
        medicationName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        price: "",
        frequencyEnum: "",
        durationDays: "",
        quantity: 1,
        administrationRoute: "",
      },
      isRecording: false,
      isTranscribing: false,
      viewMode: "split",
      serviceId: null,
    }
  );

  const {
    currentStep,
    consumerId,
    patientDirectoryId,
    isOfflinePatient,
    patientName,
    appointmentType,
    loadingAppointment,
    totalPrice,
    paymentMethod,
    paymentStatus,
    showCashModal,
    registerDenominations,
    newRx,
    isRecording,
    isTranscribing,
    viewMode,
    serviceId,
  } = state;

  const setCurrentStep = (val: any) =>
    dispatch({ type: "SET_CURRENTSTEP", payload: val });
  const setConsumerId = (val: any) =>
    dispatch({ type: "SET_CONSUMERID", payload: val });
  const setPatientDirectoryId = (val: any) =>
    dispatch({ type: "SET_PATIENTDIRECTORYID", payload: val });
  const setIsOfflinePatient = (val: any) =>
    dispatch({ type: "SET_ISOFFLINEPATIENT", payload: val });
  const setPatientName = (val: any) =>
    dispatch({ type: "SET_PATIENTNAME", payload: val });
  const setAppointmentType = (val: any) =>
    dispatch({ type: "SET_APPOINTMENTTYPE", payload: val });
  const setLoadingAppointment = (val: any) =>
    dispatch({ type: "SET_LOADINGAPPOINTMENT", payload: val });
  const setTotalPrice = (val: any) =>
    dispatch({ type: "SET_TOTALPRICE", payload: val });
  const setPaymentMethod = (val: any) =>
    dispatch({ type: "SET_PAYMENTMETHOD", payload: val });
  const setPaymentStatus = (val: any) =>
    dispatch({ type: "SET_PAYMENTSTATUS", payload: val });
  const setShowCashModal = (val: any) =>
    dispatch({ type: "SET_SHOWCASHMODAL", payload: val });
  const setRegisterDenominations = (val: any) =>
    dispatch({ type: "SET_REGISTERDENOMINATIONS", payload: val });
  const setNewRx = (val: any) =>
    dispatch({ type: "SET_NEWRX", payload: val });
  const setIsRecording = (val: any) =>
    dispatch({ type: "SET_ISRECORDING", payload: val });
  const setIsTranscribing = (val: any) =>
    dispatch({ type: "SET_ISTRANSCRIBING", payload: val });
  const setViewMode = (val: any) =>
    dispatch({ type: "SET_VIEWMODE", payload: val });
  const setServiceId = (val: any) =>
    dispatch({ type: "SET_SERVICEID", payload: val });

  const [paymentHandlingMode, setPaymentHandlingMode] = React.useState<"COLLECT_NOW" | "DELEGATE_TO_STAFF">("COLLECT_NOW");

  const {
    patientProfile,
    vaultDocuments,
    vaultAccessDenied,
    isLoading,
    isSubmitting,
    soapNotes,
    prescription,
    inConsultationServices,
    addInConsultationService,
    removeInConsultationService,
    updateInConsultationServiceQty,
    loadPatientRecord,
    updateSoapNote,
    addDiagnosis,
    removeDiagnosis,
    diagnoses,
    addVitalSign,
    removeVitalSign,
    vitalSigns,
    addPrescriptionItem,
    removePrescriptionItem,
    completeConsultation,
    processAudioWithAi,
    syncAiSoapNote,
    attachedTemplates,
    setAttachedTemplates,
    attachedTemplatesData,
    setAttachedTemplatesData,
  } = useConsultation(appointmentId, consumerId || 0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleToggleRecording = async (templateSchema?: string) => {
    if (isRecording) {
      setIsRecording(false);
      setIsTranscribing(true);

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64AudioString = reader.result as string;
            const base64Data = base64AudioString.split(",")[1];

            try {
              await processAudioWithAi(base64Data, templateSchema);
              setIsTranscribing(false);
              toast.success(t("ai_scribe_success"));
            } catch (error) {
              console.error("Error al procesar el audio con IA", error);
              setIsTranscribing(false);
              toast.error(t("toast_error"));
            }
          };
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accediendo al micrófono:", error);
        toast.error(t("toast_error"));
      }
    }
  };

  const handleAddRx = () => {
    if (newRx.medicationName) {
      addPrescriptionItem({
        medicationName: newRx.medicationName,
        dosage: newRx.dosage,
        frequency: newRx.frequency,
        duration: newRx.duration,
        frequencyEnum: newRx.frequencyEnum || undefined,
        durationDays: newRx.durationDays
          ? Number(newRx.durationDays)
          : undefined,
        instructions: newRx.instructions,
        administrationRoute: newRx.administrationRoute,
        catalogItemId: newRx.catalogItemId,
        price: Number(newRx.price) || 0,
        quantity: newRx.quantity || 1,
      });
      setNewRx({
        medicationName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        administrationRoute: "",
        price: "",
        frequencyEnum: "",
        durationDays: "",
        quantity: 1,
      });
    }
  };

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const appointment =
          await appointmentService.getAppointmentById(appointmentId);

        if (appointment.consumerId) {
          setConsumerId(appointment.consumerId);
          setIsOfflinePatient(false);
          setPatientDirectoryId(appointment.patientDirectoryId ?? null);
        } else {
          setIsOfflinePatient(true);
          setPatientDirectoryId(appointment.patientDirectoryId ?? null);
          setPatientName(
            appointment.consumerNameSnapshot ||
              appointment.consumer?.name ||
              t("patient_directory_placeholder")
          );
        }

        setServiceId(appointment.serviceId);
        setAppointmentType(appointment.type?.toLowerCase() || "in_person");
        setTotalPrice(appointment.totalPrice || 0);
        setPaymentMethod(appointment.paymentMethod || "CASH");
        setPaymentStatus(appointment.paymentStatus || "PENDING");
      } catch (error) {
        console.error("Error al obtener la cita", error);
      } finally {
        setLoadingAppointment(false);
      }
    };

    if (appointmentId) fetchAppointmentDetails();
  }, [appointmentId, t]);

  useEffect(() => {
    const fetchRegisterDenoms = async () => {
      try {
        const register = await cashRegisterService.getCurrentRegister();
        if (register?.initialDenominations) {
          setRegisterDenominations(
            register.currentDenominations || register.initialDenominations
          );
        }
      } catch {
        /* Ignorar si falla o no hay caja abierta */
      }
    };
    fetchRegisterDenoms();
  }, []);

  useEffect(() => {
    if (consumerId && !isOfflinePatient) {
      loadPatientRecord(t("toast_load_error"));
    } else if (isOfflinePatient && patientDirectoryId) {
      loadPatientRecord(
        t("toast_load_error"),
        patientDirectoryId,
        patientName
      );
    }
  }, [
    consumerId,
    isOfflinePatient,
    patientDirectoryId,
    patientName,
    loadPatientRecord,
    t,
  ]);

  const getGrandTotal = () => {
    const proceduresTotal = inConsultationServices.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    const productsTotal = prescription.reduce((sum, item) => {
      const price = Number((item as any).price) || 0;
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);
    return totalPrice + proceduresTotal + productsTotal;
  };

  const handleCompleteClick = () => {
    const finalAmount = getGrandTotal();
    if (
      paymentHandlingMode === "COLLECT_NOW" &&
      finalAmount > 0 &&
      paymentMethod === "CASH" &&
      paymentStatus !== "SETTLED"
    ) {
      setShowCashModal(true);
    } else {
      executeClinicalCompletion();
    }
  };

  const executeClinicalCompletion = async () => {
    const success = await completeConsultation(
      t("toast_success"),
      t("toast_error"),
      paymentHandlingMode
    );
    if (success) {
      setCurrentStep("success");
    }
  };

  if (loadingAppointment || (isLoading && !isOfflinePatient)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading_environment")}
        </p>
      </div>
    );
  }

  const displayFullName = isOfflinePatient
    ? patientName
    : patientProfile?.fullName || patientName || t("patient_placeholder");

  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <ConsultationSuccessStep
          appointmentId={appointmentId}
          patientPhone={patientProfile?.phone}
          onClose={() => router.push("/provider/dashboard/appointments")}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 overflow-hidden">
      
      {/* Modal de Pago en Efectivo */}
      <CashCheckoutModal
        isOpen={showCashModal}
        onClose={() => setShowCashModal(false)}
        onSuccess={() => {
          setShowCashModal(false);
          executeClinicalCompletion();
        }}
        appointmentId={appointmentId}
        totalAmount={getGrandTotal()}
        patientName={displayFullName}
        registerDenominations={registerDenominations}
      />

      {/* ── HEADER CLÍNICO ────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-9 h-9 p-0 rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-300 shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </Button>

          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>{t("consultation_in_progress")}</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {displayFullName} •{" "}
                <span className="font-mono">{t("appointment_id", { id: appointmentId })}</span>
              </p>
              {isOfflinePatient && (
                <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {t("local_catalog")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── NAVEGACIÓN PASOS (BREADCRUMBS) ────────────────────────── */}
        <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 p-1.5 rounded-2xl shadow-sm">
          <button
            onClick={() => setCurrentStep("profile")}
            className={`px-3.5 h-8 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentStep === "profile"
                ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-gray-800"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">{t("step_clinical_context")}</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700" />

          <button
            onClick={() => setCurrentStep("background")}
            className={`px-3.5 h-8 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentStep === "background"
                ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-gray-800"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">{t("step_background")}</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700" />

          <button
            onClick={() => setCurrentStep("evaluation")}
            className={`px-3.5 h-8 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentStep === "evaluation"
                ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-gray-800"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">{t("step_evaluation")}</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700" />

          <button
            onClick={() => setCurrentStep("treatment")}
            className={`px-3.5 h-8 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentStep === "treatment"
                ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-gray-800"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Pill className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">{t("step_prescription")}</span>
          </button>
        </div>

        {/* ── CONTROLES VISTA & ACCIONES ───────────────────────────── */}
        <div className="flex items-center gap-3">
          {appointmentType === "online" && (
            <div className="flex bg-gray-50 dark:bg-[#050505] p-1 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <button
                onClick={() => setViewMode("split")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === "split"
                    ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title="Vista Dividida"
              >
                <Columns className="w-4 h-4" strokeWidth={2} />
              </button>
              <button
                onClick={() => setViewMode("video")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === "video"
                    ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title="Solo Video"
              >
                <Monitor className="w-4 h-4" strokeWidth={2} />
              </button>
              <button
                onClick={() => setViewMode("ehr")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === "ehr"
                    ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title="Solo Formulario"
              >
                <FileText className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}

          <Button
            variant="outline"
            className="hidden sm:flex rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-300 text-xs font-bold transition-all h-10 px-4 shadow-sm items-center gap-2"
          >
            <Save className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{t("save_draft")}</span>
          </Button>

          {currentStep === "treatment" && (
            <Button
              onClick={handleCompleteClick}
              disabled={isSubmitting}
              className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-10 px-6 text-xs font-bold transition-all shadow-sm border-0 flex items-center gap-2 rounded-xl"
            >
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              <span>{t("finish_and_charge")}</span>
            </Button>
          )}
        </div>
      </header>

      {/* ── ÁREA DE TRABAJO PRINCIPAL ─────────────────────────────────── */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-gray-50/50 dark:bg-[#050505]">
        
        {/* PANEL VIDEOLLAMADA (SOLO TELECONSULTA) */}
        {appointmentType === "online" && (
          <div
            style={{
              width: viewMode === "ehr" ? "0px" : viewMode === "video" ? "100%" : "35%",
              minWidth: viewMode === "ehr" ? "0px" : "300px",
            }}
            className={`h-[45vh] lg:h-auto border-b lg:border-b-0 border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-[#0a0a0a] transition-all duration-300 ease-in-out relative ${
              viewMode === "ehr" ? "overflow-hidden opacity-0 border-r-0" : "lg:border-r opacity-100"
            }`}
          >
            <div className="w-full h-full min-w-[300px]">
              <ProviderVideoWidget
                appointmentId={appointmentId}
                onClosePanel={() => setViewMode("ehr")}
              />
            </div>
          </div>
        )}

        {/* PANEL FORMULARIO CLINICO (EHR) */}
        <div
          className={`flex-1 h-full overflow-y-auto overflow-x-hidden relative p-6 sm:p-8 ${
            viewMode === "video" ? "hidden" : "block"
          }`}
        >
          <div className="max-w-5xl mx-auto pb-16">
            {currentStep === "profile" && (
              <PatientProfileStep
                patientProfile={patientProfile}
                vaultDocuments={vaultDocuments}
                vaultAccessDenied={vaultAccessDenied}
                consumerId={consumerId}
                isOfflinePatient={isOfflinePatient}
                displayFullName={displayFullName}
                patientDirectoryId={patientDirectoryId}
                onNext={() => setCurrentStep("background")}
              />
            )}

            {currentStep === "background" && (
              <div className="h-[75vh]">
                <PatientBackgroundPanel
                  patientDirectoryId={patientDirectoryId}
                  consumerId={consumerId}
                  mode="PROVIDER"
                />
                
                {consumerId && (
                  <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                      Salud Femenina y Reproductiva
                    </h3>
                    <WomensHealthProviderPanel consumerId={consumerId} />
                  </div>
                )}
              </div>
            )}

            {currentStep === "evaluation" && (
              <ClinicalEvaluationStep
                soapNotes={soapNotes}
                updateSoapNote={updateSoapNote}
                diagnoses={diagnoses}
                addDiagnosis={addDiagnosis}
                removeDiagnosis={removeDiagnosis}
                vitalSigns={vitalSigns}
                addVitalSign={addVitalSign}
                removeVitalSign={removeVitalSign}
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                handleToggleRecording={handleToggleRecording}
                syncAiSoapNote={syncAiSoapNote}
                appointmentType={appointmentType}
                serviceId={serviceId}
                attachedTemplates={attachedTemplates}
                setAttachedTemplates={setAttachedTemplates}
                attachedTemplatesData={attachedTemplatesData}
                setAttachedTemplatesData={setAttachedTemplatesData}
                onBack={() => setCurrentStep("background")}
                onNext={() => setCurrentStep("treatment")}
              />
            )}

            {currentStep === "treatment" && (
              <TreatmentCheckoutStep
                prescription={prescription}
                newRx={newRx}
                setNewRx={setNewRx}
                handleAddRx={handleAddRx}
                removePrescriptionItem={removePrescriptionItem}
                inConsultationServices={inConsultationServices}
                addInConsultationService={addInConsultationService}
                removeInConsultationService={removeInConsultationService}
                updateInConsultationServiceQty={updateInConsultationServiceQty}
                basePrice={totalPrice}
                paymentHandlingMode={paymentHandlingMode}
                setPaymentHandlingMode={setPaymentHandlingMode}
                onBack={() => setCurrentStep("evaluation")}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}