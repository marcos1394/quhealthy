"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, User, Stethoscope, Pill, CheckCircle, Save, Mic } from "lucide-react";

import { useConsultation } from "@/hooks/useConsultation";
import { appointmentService } from "@/services/appointment.service"; 
import { QhSpinner } from '@/components/ui/QhSpinner'; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Importaremos los pasos (crearemos el primero abajo)
import { PatientProfileStep } from "@/components/consultation/PatientProfileStep";
import { ClinicalEvaluationStep } from "@/components/consultation/ClinicalEvaluationStep";
import { TreatmentCheckoutStep } from "@/components/consultation/TreatmentCheckoutStep";

type PipelineStep = 'profile' | 'evaluation' | 'treatment';

export default function ConsultationRoomPage() {
  const t = useTranslations('EHR');
  const params = useParams();
  const router = useRouter();
  
  const appointmentId = Number(params.id);
  
  // 🚀 ESTADOS DE LA CITA Y PACIENTE
  const [currentStep, setCurrentStep] = useState<PipelineStep>('profile');
  const [consumerId, setConsumerId] = useState<number | null>(null);
  const [patientDirectoryId, setPatientDirectoryId] = useState<number | null>(null); // 🚀 NUEVO: Para pacientes Offline
  const [isOfflinePatient, setIsOfflinePatient] = useState(false);
  const [patientName, setPatientName] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>('in_person');
  const [loadingAppointment, setLoadingAppointment] = useState(true); 

  const {
    patientProfile, vaultDocuments, isLoading, isSubmitting,
    soapNotes, setSoapNotes, prescription, loadPatientRecord, updateSoapNote, 
    addPrescriptionItem, removePrescriptionItem, completeConsultation
  } = useConsultation(appointmentId, consumerId || 0);

  const [newRx, setNewRx] = useState({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' });
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const appointment = await appointmentService.getAppointmentById(appointmentId);
        
        // 🚀 LÓGICA MEJORADA PARA PACIENTES
        if (appointment.consumerId) {
          setConsumerId(appointment.consumerId);
          setIsOfflinePatient(false);
        } else {
          setIsOfflinePatient(true);
          setPatientDirectoryId(appointment.patientDirectoryId); // ID del catálogo local
          setPatientName(appointment.consumer?.name || t('patient_directory_placeholder'));
        }
        
        setAppointmentType(appointment.type?.toLowerCase() || 'in_person');
      } catch (error) {
        console.error("Error al obtener la cita", error);
      } finally {
        setLoadingAppointment(false);
      }
    };

    if (appointmentId) fetchAppointmentDetails();
  }, [appointmentId]);

  useEffect(() => {
    // Si tiene cuenta en la app, cargamos su expediente global
    if (consumerId && !isOfflinePatient) {
      loadPatientRecord(t('toast_load_error'));
    }
  }, [consumerId, isOfflinePatient, loadPatientRecord, t]);

  const handleComplete = async () => {
    const success = await completeConsultation(t('toast_success'), t('toast_error'));
    if (success) router.push('/dashboard/appointments'); 
  };

  if (loadingAppointment || (isLoading && !isOfflinePatient)) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
        <QhSpinner size="lg" />
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">{t('loading_environment')}</p>
      </div>
    );
  }

  const displayFullName = isOfflinePatient ? patientName : (patientProfile?.fullName || patientName || t('patient_placeholder'));

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* 🚀 HEADER Y PIPELINE (STEPPER) */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col gap-4 shadow-sm z-10 shrink-0">
        
        {/* Fila Superior: Info y Botones de Acción Global */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-500 hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {t('consultation_in_progress')}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                {displayFullName} • {t('appointment_id', { id: appointmentId })}
                {isOfflinePatient && <Badge variant="secondary" className="text-[10px] h-4 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">{t('local_catalog')}</Badge>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-slate-600 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 h-10 hidden md:flex">
              <Save className="w-4 h-4 mr-2" /> {t('save_draft')}
            </Button>
            {/* El botón final solo se habilita en el último paso */}
            {currentStep === 'treatment' && (
              <Button onClick={handleComplete} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white h-10 px-6">
                <CheckCircle className="w-4 h-4 mr-2" /> {t('finish_and_charge')}
              </Button>
            )}
          </div>
        </div>

        {/* 🚀 Fila Inferior: BARRA DE NAVEGACIÓN DEL PIPELINE */}
        <div className="flex items-center w-full max-w-3xl mx-auto bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
          <Button 
            variant={currentStep === 'profile' ? 'default' : 'ghost'} 
            onClick={() => setCurrentStep('profile')}
            className={`flex-1 rounded-lg h-10 ${currentStep === 'profile' ? 'bg-white dark:bg-slate-700 text-medical-600 dark:text-medical-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 dark:hover:text-slate-300'}`}
          >
            <User className="w-4 h-4 mr-2" /> {t('step_clinical_context')}
          </Button>
          <Button 
            variant={currentStep === 'evaluation' ? 'default' : 'ghost'} 
            onClick={() => setCurrentStep('evaluation')}
            className={`flex-1 rounded-lg h-10 ${currentStep === 'evaluation' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 dark:hover:text-slate-300'}`}
          >
            <Stethoscope className="w-4 h-4 mr-2" /> {t('step_evaluation')}
          </Button>
          <Button 
            variant={currentStep === 'treatment' ? 'default' : 'ghost'} 
            onClick={() => setCurrentStep('treatment')}
            className={`flex-1 rounded-lg h-10 ${currentStep === 'treatment' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 dark:hover:text-slate-300'}`}
          >
            <Pill className="w-4 h-4 mr-2" /> {t('step_prescription')}
          </Button>
        </div>
      </header>

      {/* 🚀 ÁREA DE TRABAJO (Cambia según el Step activo) */}
      <main className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-950 p-6">
        <div className="max-w-6xl mx-auto h-full">
          
          {currentStep === 'profile' && (
            <PatientProfileStep 
              patientProfile={patientProfile}
              vaultDocuments={vaultDocuments}
              isOfflinePatient={isOfflinePatient}
              displayFullName={displayFullName}
              patientDirectoryId={patientDirectoryId} // Pasamos el ID del directorio
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