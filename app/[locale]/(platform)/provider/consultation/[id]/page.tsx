"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, User, Stethoscope, Pill, CheckCircle, Save, Video, VideoOff, ChevronRight, Activity } from "lucide-react";

import { useConsultation } from "@/hooks/useConsultation";
import { appointmentService } from "@/services/appointment.service"; 
import { QhSpinner } from '@/components/ui/QhSpinner'; 

// Pasos
import { PatientProfileStep } from "@/components/consultation/PatientProfileStep";
import { ClinicalEvaluationStep } from "@/components/consultation/ClinicalEvaluationStep";
import { TreatmentCheckoutStep } from "@/components/consultation/TreatmentCheckoutStep";
import { ConsultationSuccessStep } from "@/components/consultation/ConsultationSuccessStep"; 
import { SportsMedicalEvaluationStep } from "@/components/consultation/SportsMedicalEvaluationStep";

// Modal de Caja
import { CashCheckoutModal } from "@/components/consultation/CashCheckoutModal";
import { cashRegisterService } from "@/services/cash-register.service";
import { DenominationMap } from "@/types/cash-register";

// Widget de Teleconsulta
import { ProviderVideoWidget } from "@/components/teleconsultation/ProviderVideoWidget";

type PipelineStep = 'profile' | 'evaluation' | 'sports' | 'treatment' | 'success';

export default function ConsultationRoomPage() {
 const t = useTranslations('EHR');
 const params = useParams();
 const router = useRouter();
 
 const appointmentId = Number(params.id);
 
 const [{ currentStep, consumerId, patientDirectoryId, isOfflinePatient, patientName, appointmentType, loadingAppointment, totalPrice, paymentMethod, paymentStatus, showCashModal, registerDenominations, newRx, isRecording, isTranscribing, isVideoCollapsed }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_CURRENTSTEP': return { ...state, currentStep: typeof action.payload === 'function' ? action.payload(state.currentStep) : action.payload };
 case 'SET_CONSUMERID': return { ...state, consumerId: typeof action.payload === 'function' ? action.payload(state.consumerId) : action.payload };
 case 'SET_PATIENTDIRECTORYID': return { ...state, patientDirectoryId: typeof action.payload === 'function' ? action.payload(state.patientDirectoryId) : action.payload };
 case 'SET_ISOFFLINEPATIENT': return { ...state, isOfflinePatient: typeof action.payload === 'function' ? action.payload(state.isOfflinePatient) : action.payload };
 case 'SET_PATIENTNAME': return { ...state, patientName: typeof action.payload === 'function' ? action.payload(state.patientName) : action.payload };
 case 'SET_APPOINTMENTTYPE': return { ...state, appointmentType: typeof action.payload === 'function' ? action.payload(state.appointmentType) : action.payload };
 case 'SET_LOADINGAPPOINTMENT': return { ...state, loadingAppointment: typeof action.payload === 'function' ? action.payload(state.loadingAppointment) : action.payload };
 case 'SET_TOTALPRICE': return { ...state, totalPrice: typeof action.payload === 'function' ? action.payload(state.totalPrice) : action.payload };
 case 'SET_PAYMENTMETHOD': return { ...state, paymentMethod: typeof action.payload === 'function' ? action.payload(state.paymentMethod) : action.payload };
 case 'SET_PAYMENTSTATUS': return { ...state, paymentStatus: typeof action.payload === 'function' ? action.payload(state.paymentStatus) : action.payload };
 case 'SET_SHOWCASHMODAL': return { ...state, showCashModal: typeof action.payload === 'function' ? action.payload(state.showCashModal) : action.payload };
 case 'SET_REGISTERDENOMINATIONS': return { ...state, registerDenominations: typeof action.payload === 'function' ? action.payload(state.registerDenominations) : action.payload };
 case 'SET_NEWRX': return { ...state, newRx: typeof action.payload === 'function' ? action.payload(state.newRx) : action.payload };
 case 'SET_ISRECORDING': return { ...state, isRecording: typeof action.payload === 'function' ? action.payload(state.isRecording) : action.payload };
 case 'SET_ISTRANSCRIBING': return { ...state, isTranscribing: typeof action.payload === 'function' ? action.payload(state.isTranscribing) : action.payload };
 case 'SET_ISVIDEOCOLLAPSED': return { ...state, isVideoCollapsed: typeof action.payload === 'function' ? action.payload(state.isVideoCollapsed) : action.payload };
 default: return state;
 }
 },
 {
 currentStep: 'profile', consumerId: null, patientDirectoryId: null, isOfflinePatient: false, patientName: "", appointmentType: 'in_person', loadingAppointment: true, totalPrice: 0, paymentMethod: '', paymentStatus: '', showCashModal: false, registerDenominations: null, newRx: { 
 medicationName: '', dosage: '', frequency: '', duration: '', instructions: '', price: '', frequencyEnum: '', durationDays: '', quantity: 1 
 }, isRecording: false, isTranscribing: false, isVideoCollapsed: false
 }
 );

 const setCurrentStep = (val: any) => dispatch({ type: 'SET_CURRENTSTEP', payload: val });
 const setConsumerId = (val: any) => dispatch({ type: 'SET_CONSUMERID', payload: val });
 const setPatientDirectoryId = (val: any) => dispatch({ type: 'SET_PATIENTDIRECTORYID', payload: val });
 const setIsOfflinePatient = (val: any) => dispatch({ type: 'SET_ISOFFLINEPATIENT', payload: val });
 const setPatientName = (val: any) => dispatch({ type: 'SET_PATIENTNAME', payload: val });
 const setAppointmentType = (val: any) => dispatch({ type: 'SET_APPOINTMENTTYPE', payload: val });
 const setLoadingAppointment = (val: any) => dispatch({ type: 'SET_LOADINGAPPOINTMENT', payload: val });
 const setTotalPrice = (val: any) => dispatch({ type: 'SET_TOTALPRICE', payload: val });
 const setPaymentMethod = (val: any) => dispatch({ type: 'SET_PAYMENTMETHOD', payload: val });
 const setPaymentStatus = (val: any) => dispatch({ type: 'SET_PAYMENTSTATUS', payload: val });
 const setShowCashModal = (val: any) => dispatch({ type: 'SET_SHOWCASHMODAL', payload: val });
 const setRegisterDenominations = (val: any) => dispatch({ type: 'SET_REGISTERDENOMINATIONS', payload: val });
 const setNewRx = (val: any) => dispatch({ type: 'SET_NEWRX', payload: val });
 const setIsRecording = (val: any) => dispatch({ type: 'SET_ISRECORDING', payload: val });
 const setIsTranscribing = (val: any) => dispatch({ type: 'SET_ISTRANSCRIBING', payload: val });
 const setIsVideoCollapsed = (val: any) => dispatch({ type: 'SET_ISVIDEOCOLLAPSED', payload: val });






 







 const {
 patientProfile, vaultDocuments, vaultAccessDenied, isLoading, isSubmitting,
 soapNotes, setSoapNotes, prescription, loadPatientRecord, updateSoapNote, 
 addDiagnosis, removeDiagnosis, diagnoses,
 addVitalSign, removeVitalSign, vitalSigns,
 addPrescriptionItem, removePrescriptionItem, completeConsultation, processAudioWithAi
 } = useConsultation(appointmentId, consumerId || 0);


 


 
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
 <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#050505] transition-colors selection:bg-gray-200 dark:selection:bg-white/20">
 <QhSpinner size="lg" />
 <p className="mt-6 text-[10px] uppercase tracking-widest font-bold text-gray-500 animate-pulse">
 {t('loading_environment', { defaultValue: 'DESPLEGANDO ENTORNO CLÍNICO...' })}
 </p>
 </div>
 );
 }

 const displayFullName = isOfflinePatient ? patientName : (patientProfile?.fullName || patientName || t('patient_placeholder'));

 if (currentStep === 'success') {
 return (
 <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#050505] overflow-hidden transition-colors selection:bg-gray-200 dark:selection:bg-white/20">
 <ConsultationSuccessStep 
 appointmentId={appointmentId}
 patientPhone={patientProfile?.phone}
 onClose={() => router.push('/provider/dashboard/appointments')}
 />
 </div>
 );
 }

 return (
 <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#050505] relative transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
 
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

 {/* HEADER TÉCNICO (Comprimido) */}
 <header className="bg-white dark:bg-[#0a0a0a] border-b border-black dark:border-white px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 shrink-0">
 
 <div className="flex items-center gap-4">
 <button 
 onClick={() => router.back()} 
 className="border border-black dark:border-white w-10 h-10 flex justify-center items-center text-black dark:text-white bg-gray-50 dark:bg-[#050505] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shrink-0 rounded-none"
 >
 <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
 </button>
 <div>
 <h1 className="text-sm md:text-base font-semibold tracking-tight uppercase text-black dark:text-white flex items-center gap-2">
 {t('consultation_in_progress', { defaultValue: 'AUDITORÍA CLÍNICA' })}
 </h1>
 <div className="flex items-center gap-2 mt-1">
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 {displayFullName} <span className="mx-1 text-gray-300 dark:text-gray-700">|</span> ID: {appointmentId}
 </p>
 {isOfflinePatient && (
 <span className="bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 text-[8px] uppercase font-bold tracking-widest">
 {t('local_catalog', { defaultValue: 'LOCAL' })}
 </span>
 )}
 </div>
 </div>
 </div>

 {/* BREADCRUMBS COMPACTOS */}
 <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 p-1">
 <button 
 onClick={() => setCurrentStep('profile')}
 className={`px-3 h-8 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors rounded-none ${currentStep === 'profile' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
 >
 <User className="w-3.5 h-3.5" strokeWidth={1.5} /> <span className="hidden sm:inline">{t('step_clinical_context', { defaultValue: 'CONTEXTO' })}</span>
 </button>
 <ChevronRight className="w-3 h-3 text-gray-400" />
 <button 
 onClick={() => setCurrentStep('evaluation')}
 className={`px-3 h-8 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors rounded-none ${currentStep === 'evaluation' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
 >
 <Stethoscope className="w-3.5 h-3.5" strokeWidth={1.5} /> <span className="hidden sm:inline">{t('step_evaluation', { defaultValue: 'EVALUACIÓN' })}</span>
 </button>
 <ChevronRight className="w-3 h-3 text-gray-400" />
 <button 
 onClick={() => setCurrentStep('sports')}
 className={`px-3 h-8 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors rounded-none ${currentStep === 'sports' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
 >
 <Activity className="w-3.5 h-3.5" strokeWidth={1.5} /> <span className="hidden sm:inline">DEPORTIVA</span>
 </button>
 <ChevronRight className="w-3 h-3 text-gray-400" />
 <button 
 onClick={() => setCurrentStep('treatment')}
 className={`px-3 h-8 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors rounded-none ${currentStep === 'treatment' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
 >
 <Pill className="w-3.5 h-3.5" strokeWidth={1.5} /> <span className="hidden sm:inline">{t('step_prescription', { defaultValue: 'PLAN' })}</span>
 </button>
 </div>
 
 <div className="flex items-center gap-3 w-full md:w-auto">
 {appointmentType === 'online' && (
 <button 
 onClick={() => setIsVideoCollapsed(!isVideoCollapsed)}
 className={`border w-10 h-10 flex items-center justify-center transition-colors rounded-none ${isVideoCollapsed ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-black dark:border-white text-black dark:text-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
 title={isVideoCollapsed ? "Mostrar Video" : "Ocultar Video"}
 >
 {isVideoCollapsed ? <VideoOff className="w-4 h-4" strokeWidth={1.5} /> : <Video className="w-4 h-4" strokeWidth={1.5} />}
 </button>
 )}
 <button className="hidden sm:flex border border-black dark:border-white bg-transparent text-black dark:text-white px-4 h-10 text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors items-center gap-2 rounded-none">
 <Save className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('save_draft', { defaultValue: 'GUARDAR' })}
 </button>
 {currentStep === 'treatment' && (
 <button 
 onClick={handleCompleteClick} 
 disabled={isSubmitting} 
 className="flex-1 md:flex-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border border-transparent transition-colors h-10 px-6 text-[9px] uppercase font-bold tracking-widest flex justify-center items-center gap-2 disabled:opacity-50 rounded-none"
 >
 <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('finish_and_charge', { defaultValue: 'FINALIZAR' })}
 </button>
 )}
 </div>
 </header>

 {/* MAIN MESA DE TRABAJO TÉCNICA */}
 <main className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-gray-50 dark:bg-[#050505] transition-colors selection:bg-gray-200 dark:selection:bg-white/20">
 
 {/* === SECCIÓN VIDEOLLAMADA (Solo ONLINE) === */}
 {appointmentType === 'online' && (
 <div 
 style={{ width: isVideoCollapsed ? '0px' : '35%', minWidth: isVideoCollapsed ? '0px' : '300px' }}
 className={`h-[45vh] lg:h-auto border-b lg:border-b-0 border-black dark:border-white shrink-0 bg-white dark:bg-[#050505] transition-all duration-300 ease-in-out relative ${isVideoCollapsed ? 'overflow-hidden opacity-0 border-r-0' : 'lg:border-r opacity-100'} resize-x overflow-auto`}
 >
 <div className="w-full h-full min-w-[300px]">
 <ProviderVideoWidget appointmentId={appointmentId} />
 </div>
 </div>
 )}

 {/* === SECCIÓN EHR === */}
 <div className="flex-1 h-full overflow-y-auto overflow-x-hidden relative p-4 md:p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-[#050505] dark:[&::-webkit-scrollbar-thumb]:bg-gray-800">
 <div className="max-w-5xl mx-auto pb-12">
 
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
 diagnoses={diagnoses}
 addDiagnosis={addDiagnosis}
 removeDiagnosis={removeDiagnosis}
 vitalSigns={vitalSigns}
 addVitalSign={addVitalSign}
 removeVitalSign={removeVitalSign}
 isRecording={isRecording}
 isTranscribing={isTranscribing}
 handleToggleRecording={handleToggleRecording}
 appointmentType={appointmentType}
 onBack={() => setCurrentStep('profile')}
 onNext={() => setCurrentStep('sports')}
 />
 )}

 {currentStep === 'sports' && (
 <SportsMedicalEvaluationStep
 appointmentId={appointmentId}
 consumerId={consumerId || 0}
 onBack={() => setCurrentStep('evaluation')}
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
 onBack={() => setCurrentStep('sports')}
 />
 )}

 </div>
 </div>
 </main>
 </div>
 );
}