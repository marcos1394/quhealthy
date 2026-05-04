"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
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
import { ConsultationSuccessStep } from "@/components/consultation/ConsultationSuccessStep"; // 🚀 NUEVO

// 🚀 NUEVO: Importamos el Modal de Caja
import { CashCheckoutModal } from "@/components/consultation/CashCheckoutModal";

// 🚀 Añadimos 'success' al final del pipeline
type PipelineStep = 'profile' | 'evaluation' | 'treatment' | 'success';

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

  // 🚀 NUEVOS ESTADOS FINANCIEROS
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [showCashModal, setShowCashModal] = useState(false);

  const {
    patientProfile, vaultDocuments, isLoading, isSubmitting,
    soapNotes, setSoapNotes, prescription, loadPatientRecord, updateSoapNote, 
    addPrescriptionItem, removePrescriptionItem, completeConsultation, processAudioWithAi
  } = useConsultation(appointmentId, consumerId || 0);

  // 🚀 CAMBIO 1: Agregamos 'price' al estado inicial
  const [newRx, setNewRx] = useState({ 
    medicationName: '', dosage: '', frequency: '', duration: '', instructions: '', price: '' 
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  // Referencias para manejar el micrófono sin causar re-renders innecesarios
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 🎙️ FUNCIÓN PARA INICIAR/DETENER GRABACIÓN BATCH
  const handleToggleRecording = async () => {
    // SI ESTÁ GRABANDO -> DETENEMOS Y PROCESAMOS
    if (isRecording) {
      setIsRecording(false);
      setIsTranscribing(true);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        
        // Apagamos el micrófono para que desaparezca el icono rojo del navegador
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    } 
    // SI NO ESTÁ GRABANDO -> INICIAMOS
    else {
      try {
        // 1. Pedimos permiso para usar el micrófono
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 2. Configuramos el grabador
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        // 3. Vamos guardando los pedacitos de audio en memoria
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        // 4. Qué hacer cuando se detiene la grabación (Aquí ocurre la magia Batch)
        mediaRecorder.onstop = async () => {
          // Unimos todos los pedazos en un solo archivo de audio webm
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Lo convertimos a Base64 para poder mandarlo por JSON a Spring Boot
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64AudioString = reader.result as string;
            
            // Limpiamos el string para quitar el prefijo (ej. "data:audio/webm;base64,")
            const base64Data = base64AudioString.split(',')[1];

            try {
              // 🚀 AQUÍ ESTÁ LA CONEXIÓN REAL
              console.log("Enviando audio real a Gemini...");
              
              await processAudioWithAi(base64Data);
              
              setIsTranscribing(false);
              toast.success(t('ai_scribe_success') || "¡Notas clínicas generadas exitosamente!"); 

            } catch (error) {
              console.error("Error al procesar el audio con IA", error);
              setIsTranscribing(false);
              toast.error("Hubo un error procesando el audio. Intenta de nuevo.");
            }
          };
        };

        // 5. ¡A grabar!
        mediaRecorder.start();
        setIsRecording(true);

      } catch (error) {
        console.error("Error accediendo al micrófono:", error);
        toast.error("Por favor, permite el acceso al micrófono en tu navegador.");
      }
    }
  };

  // 🚀 CAMBIO 2: Pasamos el precio al hook y aflojamos la regla de "dosage"
  const handleAddRx = () => {
    if (newRx.medicationName) { // Quitamos la restricción de dosage aquí también
      addPrescriptionItem({
        medicationName: newRx.medicationName,
        dosage: newRx.dosage,
        frequency: newRx.frequency,
        duration: newRx.duration,
        instructions: newRx.instructions,
        price: Number(newRx.price) || 0 // 🚀 INYECTAMOS EL PRECIO A LA RECETA FINAL
      });
      // Limpiamos todo incluyendo el precio
      setNewRx({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '', price: '' });
    }
  };

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
          setPatientDirectoryId(appointment.patientDirectoryId ?? null); 
          // 🚀 FIX: Leemos el Snapshot porque el consumer es nulo
          setPatientName(appointment.consumerNameSnapshot || appointment.consumer?.name || t('patient_directory_placeholder'));
        }
        
        setAppointmentType(appointment.type?.toLowerCase() || 'in_person');
        
        // 🚀 NUEVO: Guardamos los datos financieros
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
  }, [appointmentId]);

  // 2. CARGAR EXPEDIENTE (App u Offline)
  useEffect(() => {
    // Si tiene cuenta en la app
    if (consumerId && !isOfflinePatient) {
      loadPatientRecord(t('toast_load_error'));
    } 
    // 🚀 NUEVO: Si es paciente offline, le pasamos ID y Nombre
    else if (isOfflinePatient && patientDirectoryId) {
      loadPatientRecord(t('toast_load_error'), patientDirectoryId, patientName);
    }
  }, [consumerId, isOfflinePatient, patientDirectoryId, patientName, loadPatientRecord, t]);

  // 🚀 NUEVO: Calculamos el Gran Total (Consulta + Productos)
  const getGrandTotal = () => {
    // Sumamos el precio de cada item en la receta (si no tiene precio, suma 0)
    const productsTotal = prescription.reduce((sum, item) => {
      // Usamos item.price o asume 0 si no existe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return sum + (Number((item as any).price) || 0); 
    }, 0);
    
    return totalPrice + productsTotal; // totalPrice es el costo base de la consulta
  };

  // 🚀 INTERCEPTOR ACTUALIZADO
  const handleCompleteClick = () => {
    const finalAmount = getGrandTotal();

    // Validamos usando el Gran Total en lugar del totalPrice estático
    if (finalAmount > 0 && paymentMethod === 'CASH' && paymentStatus !== 'SETTLED') {
      setShowCashModal(true);
    } else {
      executeClinicalCompletion();
    }
  };

  // 🚀 COMPLETAR CLÍNICA (El guardado final de SOAP/PDF)
  const executeClinicalCompletion = async () => {
    const success = await completeConsultation(t('toast_success'), t('toast_error'));
    if (success) {
      setCurrentStep('success'); 
    }
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

  // 🚀 NUEVO: Si la consulta terminó, renderizamos la vista de éxito a pantalla completa
  if (currentStep === 'success') {
    return (
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <ConsultationSuccessStep 
          appointmentId={appointmentId}
          patientPhone={patientProfile?.phone} // O la propiedad donde guardes el teléfono en tu BD
          onClose={() => router.push('/provider/dashboard/appointments')} // Volver al dashboard al terminar
        />
      </div>
    );
  }

  // 🚀 RETURN NORMAL DEL PIPELINE (Se mantiene igual que el tuyo)
  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      
      {/* 🚀 NUEVO: Renderizamos el Modal de Caja (Flota encima de todo) */}
      <CashCheckoutModal 
        isOpen={showCashModal}
        onClose={() => setShowCashModal(false)}
        onSuccess={() => {
          setShowCashModal(false);
          // Si el cobro fue exitoso, forzamos el guardado del expediente
          executeClinicalCompletion();
        }}
        appointmentId={appointmentId}
        totalAmount={getGrandTotal()} // 🚀 AQUÍ inyectamos el total dinámico
        patientName={displayFullName}
      />

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
            {/* 🚀 CAMBIO: Ahora llama a handleCompleteClick */}
            {currentStep === 'treatment' && (
              <Button onClick={handleCompleteClick} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white h-10 px-6">
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