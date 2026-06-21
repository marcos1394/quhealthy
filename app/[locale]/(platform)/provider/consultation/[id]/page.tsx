"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, User, Stethoscope, Pill, CheckCircle, Save, Mic } from "lucide-react";

import { useConsultation } from "@/hooks/useConsultation";
import { appointmentService } from "@/services/appointment.service"; 
import { QhSpinner } from '@/components/ui/QhSpinner'; 

// Importaremos los pasos
import { PatientProfileStep } from "@/components/consultation/PatientProfileStep";
import { ClinicalEvaluationStep } from "@/components/consultation/ClinicalEvaluationStep";
import { TreatmentCheckoutStep } from "@/components/consultation/TreatmentCheckoutStep";
import { ConsultationSuccessStep } from "@/components/consultation/ConsultationSuccessStep"; 

// Modal de Caja
import { CashCheckoutModal } from "@/components/consultation/CashCheckoutModal";
import { cashRegisterService } from "@/services/cash-register.service";
import { DenominationMap } from "@/types/cash-register";

type PipelineStep = 'profile' | 'evaluation' | 'treatment' | 'success';

export default function ConsultationRoomPage() {
  const t = useTranslations('EHR');
  const params = useParams();
  const router = useRouter();
  
  const appointmentId = Number(params.id);
  
  const [currentStep, setCurrentStep] = useState<PipelineStep>('profile');
  const [consumerId, setConsumerId] = useState<number | null>(null);
  const [patientDirectoryId, setPatientDirectoryId] = useState<number | null>(null);
  const [isOfflinePatient, setIsOfflinePatient] = useState(false);
  const [patientName, setPatientName] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>('in_person');
  const [loadingAppointment, setLoadingAppointment] = useState(true); 

  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [showCashModal, setShowCashModal] = useState(false);
  const [registerDenominations, setRegisterDenominations] = useState<DenominationMap | null>(null);

  const {
    patientProfile, vaultDocuments, vaultAccessDenied, isLoading, isSubmitting,
    soapNotes, setSoapNotes, prescription, loadPatientRecord, updateSoapNote, 
    addPrescriptionItem, removePrescriptionItem, completeConsultation, processAudioWithAi
  } = useConsultation(appointmentId, consumerId || 0);

  const [newRx, setNewRx] = useState<{
    medicationName: string; dosage: string; frequency: string; duration: string; instructions: string; price: string | number;
    frequencyEnum?: string; durationDays?: number | string; catalogItemId?: number; quantity?: number;
  }>({ 
    medicationName: '', dosage: '', frequency: '', duration: '', instructions: '', price: '', frequencyEnum: '', durationDays: '', quantity: 1 
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsTranscribing(true);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    } 
    else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64AudioString = reader.result as string;
            const base64Data = base64AudioString.split(',')[1];

            try {
              console.log("Enviando audio real a Gemini...");
              
              await processAudioWithAi(base64Data);
              
              setIsTranscribing(false);
              toast.success(t('ai_scribe_success') || "SÍNTESIS CLÍNICA COMPLETADA."); 

            } catch (error) {
              console.error("Error al procesar el audio con IA", error);
              setIsTranscribing(false);
              toast.error("FALLO EN EL PROCESAMIENTO DE AUDIO. REINTENTE.");
            }
          };
        };

        mediaRecorder.start();
        setIsRecording(true);

      } catch (error) {
        console.error("Error accediendo al micrófono:", error);
        toast.error("ACCESO AL MICRÓFONO DENEGADO POR EL SISTEMA.");
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
        durationDays: newRx.durationDays ? Number(newRx.durationDays) : undefined,
        instructions: newRx.instructions,
        catalogItemId: newRx.catalogItemId,
        price: Number(newRx.price) || 0,
        quantity: newRx.quantity || 1
      });
      setNewRx({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '', price: '', frequencyEnum: '', durationDays: '', quantity: 1 });
    }
  };

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const appointment = await appointmentService.getAppointmentById(appointmentId);
        
        if (appointment.consumerId) {
          setConsumerId(appointment.consumerId);
          setIsOfflinePatient(false);
        } else {
          setIsOfflinePatient(true);
          setPatientDirectoryId(appointment.patientDirectoryId ?? null); 
          setPatientName(appointment.consumerNameSnapshot || appointment.consumer?.name || t('patient_directory_placeholder'));
        }
        
        setAppointmentType(appointment.type?.toLowerCase() || 'in_person');
        
        setTotalPrice(appointment.totalPrice || 0);
        setPaymentMethod(appointment.paymentMethod || 'CASH');
        setPaymentStatus(appointment.paymentStatus || 'PENDING');
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
          setRegisterDenominations(register.currentDenominations || register.initialDenominations);
        }
      } catch { /* Ignorar si falla o no hay caja abierta */ }
    };
    fetchRegisterDenoms();
  }, []);

  useEffect(() => {
    if (consumerId && !isOfflinePatient) {
      loadPatientRecord(t('toast_load_error'));
    } 
    else if (isOfflinePatient && patientDirectoryId) {
      loadPatientRecord(t('toast_load_error'), patientDirectoryId, patientName);
    }
  }, [consumerId, isOfflinePatient, patientDirectoryId, patientName, loadPatientRecord, t]);

  const getGrandTotal = () => {
    const productsTotal = prescription.reduce((sum, item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const price = Number((item as any).price) || 0; 
      const qty = item.quantity || 1;
      return sum + (price * qty);
    }, 0);
    
    return totalPrice + productsTotal;
  };

  const handleCompleteClick = () => {
    const finalAmount = getGrandTotal();

    if (finalAmount > 0 && paymentMethod === 'CASH' && paymentStatus !== 'SETTLED') {
      setShowCashModal(true);
    } else {
      executeClinicalCompletion();
    }
  };

  const executeClinicalCompletion = async () => {
    const success = await completeConsultation(t('toast_success'), t('toast_error'));
    if (success) {
      setCurrentStep('success'); 
    }
  };

  if (loadingAppointment || (isLoading && !isOfflinePatient)) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-[#0a0a0a] transition-colors">
        <QhSpinner size="lg" className="text-black dark:text-white" />
        <p className="mt-6 text-[10px] uppercase tracking-widest font-bold text-gray-500 animate-pulse">
          {t('loading_environment', { defaultValue: 'DESPLEGANDO ENTORNO CLÍNICO...' })}
        </p>
      </div>
    );
  }

  const displayFullName = isOfflinePatient ? patientName : (patientProfile?.fullName || patientName || t('patient_placeholder'));

  if (currentStep === 'success') {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-[#0a0a0a] overflow-hidden transition-colors">
        <ConsultationSuccessStep 
          appointmentId={appointmentId}
          patientPhone={patientProfile?.phone}
          onClose={() => router.push('/provider/dashboard/appointments')}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#0a0a0a] overflow-hidden relative transition-colors duration-300">
      
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

      <header className="bg-white dark:bg-[#0a0a0a] border-b border-black dark:border-white px-6 md:px-10 py-8 flex flex-col gap-8 z-10 shrink-0">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()} 
              className="border border-black dark:border-white w-14 h-14 flex justify-center items-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shrink-0 rounded-none"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight text-black dark:text-white flex items-center gap-3">
                {t('consultation_in_progress', { defaultValue: 'AUDITORÍA CLÍNICA EN CURSO' })}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {displayFullName} • {t('appointment_id', { id: appointmentId })}
                </p>
                {isOfflinePatient && (
                  <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] uppercase font-bold tracking-widest">
                    {t('local_catalog', { defaultValue: 'CENSO LOCAL' })}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="hidden sm:flex border border-black dark:border-white bg-transparent text-black dark:text-white px-8 h-14 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors items-center gap-3 rounded-none">
              <Save className="w-4 h-4" strokeWidth={1.5} /> {t('save_draft', { defaultValue: 'GUARDAR BORRADOR' })}
            </button>
            {currentStep === 'treatment' && (
              <button 
                onClick={handleCompleteClick} 
                disabled={isSubmitting} 
                className="flex-1 md:flex-none bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white px-8 h-14 text-[10px] uppercase font-bold tracking-widest shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] flex justify-center items-center gap-3 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:shadow-none rounded-none"
              >
                <CheckCircle className="w-4 h-4" strokeWidth={1.5} /> {t('finish_and_charge', { defaultValue: 'FINALIZAR Y COBRAR' })}
              </button>
            )}
          </div>
        </div>

        {/* NAVEGADOR DE PASOS TIPO BLUEPRINT */}
        <div className="flex items-center w-full max-w-4xl border border-black dark:border-white bg-gray-50 dark:bg-[#050505] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
          <button 
            onClick={() => setCurrentStep('profile')}
            className={`flex-1 h-14 border-r border-black dark:border-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-colors rounded-none ${currentStep === 'profile' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111] hover:text-black dark:hover:text-white'}`}
          >
            <User className="w-4 h-4 shrink-0" strokeWidth={1.5} /> <span className="hidden sm:inline">{t('step_clinical_context', { defaultValue: 'CONTEXTO CLÍNICO' })}</span>
          </button>
          <button 
            onClick={() => setCurrentStep('evaluation')}
            className={`flex-1 h-14 border-r border-black dark:border-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-colors rounded-none ${currentStep === 'evaluation' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111] hover:text-black dark:hover:text-white'}`}
          >
            <Stethoscope className="w-4 h-4 shrink-0" strokeWidth={1.5} /> <span className="hidden sm:inline">{t('step_evaluation', { defaultValue: 'EVALUACIÓN' })}</span>
          </button>
          <button 
            onClick={() => setCurrentStep('treatment')}
            className={`flex-1 h-14 text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-colors rounded-none ${currentStep === 'treatment' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111] hover:text-black dark:hover:text-white'}`}
          >
            <Pill className="w-4 h-4 shrink-0" strokeWidth={1.5} /> <span className="hidden sm:inline">{t('step_prescription', { defaultValue: 'PLAN DE ACCIÓN' })}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative bg-white dark:bg-[#0a0a0a] p-6 md:p-10">
        <div className="max-w-6xl mx-auto h-full">
          
          {currentStep === 'profile' && (
            <PatientProfileStep 
              patientProfile={patientProfile}
              vaultDocuments={vaultDocuments}
              vaultAccessDenied={vaultAccessDenied}
              consumerId={consumerId}
              isOfflinePatient={isOfflinePatient}
              displayFullName={displayFullName}
              patientDirectoryId={patientDirectoryId} 
              onNext={() => setCurrentStep('evaluation')}
            />
          )}

          {currentStep === 'evaluation' && (
             <ClinicalEvaluationStep 
                soapNotes={soapNotes}
                updateSoapNote={updateSoapNote}
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                handleToggleRecording={handleToggleRecording}
                appointmentType={appointmentType}
                onBack={() => setCurrentStep('profile')}
                onNext={() => setCurrentStep('treatment')}
             />
          )}

          {currentStep === 'treatment' && (
             <TreatmentCheckoutStep 
                prescription={prescription}
                newRx={newRx}
                setNewRx={setNewRx}
                handleAddRx={handleAddRx}
                removePrescriptionItem={removePrescriptionItem}
                onBack={() => setCurrentStep('evaluation')}
             />
          )}

        </div>
      </main>
    </div>
  );
}