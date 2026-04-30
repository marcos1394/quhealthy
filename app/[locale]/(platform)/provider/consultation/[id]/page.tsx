"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Activity } from "lucide-react";

import { useConsultation } from "@/hooks/useConsultation";
import { appointmentService } from "@/services/appointment.service"; 
import { QhSpinner } from '@/components/ui/QhSpinner'; 

// Importaremos los componentes que crearemos a continuación
import { WorkspaceHeader } from "@/components/consultation/WorkspaceHeader";
import { PatientContextPanel } from "@/components/consultation/PatientContextPanel";
import { ClinicalAssetsPanel } from "@/components/consultation/ClinicalAssetsPanel";
import { DocumentationPanel } from "@/components/consultation/DocumentationPanel";

export default function ConsultationRoomPage() {
  const t = useTranslations('EHR');
  const params = useParams();
  const router = useRouter();
  
  const appointmentId = Number(params.id);
  const [consumerId, setConsumerId] = useState<number | null>(null);
  const [isOfflinePatient, setIsOfflinePatient] = useState(false);
  const [patientName, setPatientName] = useState<string>("Paciente");
  const [appointmentType, setAppointmentType] = useState<string>('in_person');
  const [loadingAppointment, setLoadingAppointment] = useState(true); 

  const {
    patientProfile, vaultDocuments, isLoading, isSubmitting,
    soapNotes, setSoapNotes, prescription, loadPatientRecord, updateSoapNote, 
    addPrescriptionItem, removePrescriptionItem, completeConsultation
  } = useConsultation(appointmentId, consumerId || 0);

  const [newRx, setNewRx] = useState({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' });

  // Estados del Copiloto IA
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const appointment = await appointmentService.getAppointmentById(appointmentId);
        if (appointment.consumerId) {
          setConsumerId(appointment.consumerId);
          setIsOfflinePatient(false);
        } else {
          setIsOfflinePatient(true);
          setPatientName(appointment.consumer?.name || "Paciente de Directorio");
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
    if (consumerId && !isOfflinePatient) {
      loadPatientRecord(t('toast_load_error'));
    }
  }, [consumerId, isOfflinePatient, loadPatientRecord, t]);

  const handleAddRx = () => {
    if (!newRx.medicationName || !newRx.dosage) return;
    addPrescriptionItem(newRx);
    setNewRx({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' });
  };

  const handleComplete = async () => {
    // Aquí es donde en el futuro inyectaremos el modal de Check-Out si debe dinero
    const success = await completeConsultation(t('toast_success'), t('toast_error'));
    if (success) {
      router.push('/dashboard/appointments'); 
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsTranscribing(true);
      setTimeout(() => {
        setIsTranscribing(false);
        if (setSoapNotes) {
          setSoapNotes({
            ...soapNotes,
            subjective: 'El paciente refiere dolor de cabeza leve y fatiga desde hace 3 días.',
            objective: 'Presión arterial 120/80 mmHg. Temperatura 37.1°C.',
            assessment: 'Cefalea tensional probable.',
            plan: 'Paracetamol 500mg cada 8 horas. Descanso.'
          });
        }
      }, 2000);
    } else {
      setIsRecording(true);
    }
  };

  if (loadingAppointment || (isLoading && !isOfflinePatient)) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
        <QhSpinner size="lg" />
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">{t('loading') || 'Preparando entorno clínico...'}</p>
      </div>
    );
  }

  const displayFullName = isOfflinePatient ? patientName : (patientProfile?.fullName || patientName);

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      <WorkspaceHeader 
        appointmentId={appointmentId}
        displayFullName={displayFullName}
        isOfflinePatient={isOfflinePatient}
        isRecording={isRecording}
        isSubmitting={isSubmitting}
        onComplete={handleComplete}
        onBack={() => router.back()}
      />

      {/* 🚀 RESPONSIVE: Columna en móvil, Filas en Desktop */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        <PatientContextPanel 
          patientProfile={patientProfile}
          isOfflinePatient={isOfflinePatient}
          displayFullName={displayFullName}
        />

        <ClinicalAssetsPanel 
          vaultDocuments={vaultDocuments}
          prescription={prescription}
          newRx={newRx}
          setNewRx={setNewRx}
          handleAddRx={handleAddRx}
          removePrescriptionItem={removePrescriptionItem}
          appointmentType={appointmentType}
          isOfflinePatient={isOfflinePatient}
        />

        <DocumentationPanel 
          soapNotes={soapNotes}
          updateSoapNote={updateSoapNote}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          handleToggleRecording={handleToggleRecording}
        />

      </main>
    </div>
  );
}