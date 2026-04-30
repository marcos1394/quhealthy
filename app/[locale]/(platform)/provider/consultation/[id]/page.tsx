"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  Stethoscope, User, Activity, FileText, Pill, Plus, 
  Trash2, Save, History, FileCheck, AlertTriangle, ShieldAlert, 
  ShoppingBag, ArrowLeft, Mic, Square, Sparkles, CheckCircle, Video
} from "lucide-react";

import { useConsultation } from "@/hooks/useConsultation";
import { appointmentService } from "@/services/appointment.service"; 
import { QhSpinner } from '@/components/ui/QhSpinner'; // 🚀 SPINNER OFICIAL IMPORTADO

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConsultationRoomPage() {
  const t = useTranslations('EHR');
  const params = useParams();
  const router = useRouter();
  
  const appointmentId = Number(params.id);
  const [consumerId, setConsumerId] = useState<number | null>(null);
  const [isOfflinePatient, setIsOfflinePatient] = useState(false); // 🚀 ESTADO PARA PACIENTES SIN CUENTA
  const [patientName, setPatientName] = useState<string>("Paciente"); // 🚀 NOMBRE DE RESPALDO
  const [appointmentType, setAppointmentType] = useState<string>('in_person');
  const [loadingAppointment, setLoadingAppointment] = useState(true); 

  const {
    patientProfile, vaultDocuments, isLoading, isSubmitting,
    soapNotes, setSoapNotes, prescription, loadPatientRecord, updateSoapNote, 
    addPrescriptionItem, removePrescriptionItem, completeConsultation
  } = useConsultation(appointmentId, consumerId || 0);

  const [newRx, setNewRx] = useState({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' });

  // 🚀 ESTADOS DEL COPILOTO IA
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // 1. OBTENER CITA
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const appointment = await appointmentService.getAppointmentById(appointmentId);
        
        // 🚀 FIX PACIENTES OFFLINE: Validamos si tiene cuenta o no
        if (appointment.consumerId) {
          setConsumerId(appointment.consumerId);
          setIsOfflinePatient(false);
        } else {
          setIsOfflinePatient(true);
          // Si es offline, tomamos el nombre del snapshot de la cita
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

  // 2. CARGAR EXPEDIENTE (Solo si tiene cuenta)
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
    const success = await completeConsultation(t('toast_success'), t('toast_error'));
    if (success) {
      router.push('/dashboard/appointments'); // Redirigir de vuelta al Kanban
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

  // 🚀 FIX DE SPINNER Y PANTALLA DE CARGA
  // Ahora no nos bloqueamos si el consumerId es nulo (paciente offline)
  if (loadingAppointment || (isLoading && !isOfflinePatient)) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
        <QhSpinner size="lg" />
        <p className="mt-4 text-slate-500 font-medium">Preparando entorno clínico...</p>
      </div>
    );
  }

  // Variables dinámicas para la UI (Dependiendo si es Offline o App)
  const displayFullName = isOfflinePatient ? patientName : (patientProfile?.fullName || patientName);
  const displayInitial = displayFullName.charAt(0).toUpperCase();

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      
      {/* 🟦 HEADER DE LA CONSULTA */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-medical-600" /> {t('title_consultation')}
            </h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
              Cita #{appointmentId} • {displayFullName}
              {isOfflinePatient && <Badge variant="secondary" className="text-[10px] h-4">Offline</Badge>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isRecording && (
             <Badge variant="destructive" className="animate-pulse shadow-sm">
               <Mic className="w-3 h-3 mr-1" /> Escuchando...
             </Badge>
          )}
          <Button variant="outline" className="text-slate-600 border-slate-300 h-9">
            <Save className="w-4 h-4 mr-2" /> Guardar Borrador
          </Button>
          <Button 
            onClick={handleComplete} 
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 shadow-none"
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Finalizar y Cobrar
          </Button>
        </div>
      </header>

      {/* 🚀 ESPACIO DE TRABAJO (3 COLUMNAS) */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* 🟩 COLUMNA IZQUIERDA: Contexto del Paciente */}
        <aside className="w-1/4 min-w-[280px] max-w-[350px] bg-white border-r border-slate-200 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center uppercase tracking-wider">
            <User className="w-4 h-4 mr-2 text-slate-500" /> {t('patient_profile')}
          </h2>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-medical-100 rounded-full mx-auto flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-medical-700">{displayInitial}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{displayFullName}</h3>
            {!isOfflinePatient ? (
              <p className="text-sm text-slate-500 mt-1">{patientProfile?.gender} • {patientProfile?.bloodType || 'Sangre N/D'}</p>
            ) : (
              <p className="text-sm text-amber-600 mt-1 font-medium flex items-center justify-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Paciente no registrado en App
              </p>
            )}
          </div>

          {!isOfflinePatient && (
            <>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('qu_score')}</p>
                <div className="text-3xl font-black text-medical-600 leading-none mb-2">{patientProfile?.quScore || '--'}</div>
                <Badge variant="outline" className="border-medical-200 text-medical-700">{patientProfile?.quScoreBand || 'Sin calcular'}</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> {t('allergies')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patientProfile?.allergies?.length ? patientProfile.allergies.map(a => <Badge key={a} variant="secondary" className="bg-red-50 text-red-700">{a}</Badge>) : <span className="text-xs text-slate-400">{t('no_data')}</span>}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2"><ShieldAlert className="w-3.5 h-3.5 text-blue-500" /> {t('conditions')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patientProfile?.chronicConditions?.length ? patientProfile.chronicConditions.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>) : <span className="text-xs text-slate-400">{t('no_data')}</span>}
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* 🟨 COLUMNA CENTRAL: Bóveda / Video / Receta */}
        <section className="flex-1 bg-slate-50/50 p-4 flex flex-col min-w-0 border-r border-slate-200">
          <Tabs defaultValue="prescription" className="flex-1 flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-slate-100">
              <TabsTrigger value="vault"><History className="w-4 h-4 mr-2"/> {t('tab_history')}</TabsTrigger>
              <TabsTrigger value="prescription"><Pill className="w-4 h-4 mr-2"/> {t('tab_prescription')}</TabsTrigger>
              {appointmentType === 'video_call' && (
                <TabsTrigger value="video" className="text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"><Video className="w-4 h-4 mr-2"/> Cámara</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="vault" className="flex-1 overflow-y-auto custom-scrollbar m-0">
              {isOfflinePatient ? (
                <div className="h-full flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-slate-100/50">
                  <div className="text-center">
                    <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">Bóveda no disponible</p>
                    <p className="text-sm">El paciente necesita crear una cuenta para guardar documentos.</p>
                  </div>
                </div>
              ) : vaultDocuments.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">{t('vault_empty')}</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {vaultDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center p-3 bg-white border border-slate-200 rounded-xl hover:border-medical-300 transition-colors cursor-pointer shadow-sm">
                      <FileCheck className="w-6 h-6 text-medical-500 mr-3 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">{doc.fileName}</p>
                        <p className="text-xs text-slate-500">{doc.documentType} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prescription" className="flex-1 overflow-y-auto custom-scrollbar m-0 space-y-4">
              <div className="bg-white p-4 rounded-xl border border-medical-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-slate-900">{t('rx_title')}</h3>
                  <Button variant="outline" size="sm" className="h-7 text-xs border-medical-300 text-medical-700"><ShoppingBag className="w-3.5 h-3.5 mr-1" /> Vincular Producto</Button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input placeholder={t('rx_medication')} value={newRx.medicationName} onChange={e => setNewRx({...newRx, medicationName: e.target.value})} className="h-8 text-sm" />
                  <Input placeholder={t('rx_dosage')} value={newRx.dosage} onChange={e => setNewRx({...newRx, dosage: e.target.value})} className="h-8 text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <Input placeholder={t('rx_frequency')} value={newRx.frequency} onChange={e => setNewRx({...newRx, frequency: e.target.value})} className="h-8 text-sm" />
                  <Input placeholder={t('rx_duration')} value={newRx.duration} onChange={e => setNewRx({...newRx, duration: e.target.value})} className="h-8 text-sm" />
                  <Input placeholder={t('rx_instructions')} value={newRx.instructions} onChange={e => setNewRx({...newRx, instructions: e.target.value})} className="h-8 text-sm" />
                </div>
                <Button onClick={handleAddRx} disabled={!newRx.medicationName || !newRx.dosage} className="w-full h-8 text-xs bg-slate-900 text-white"><Plus className="w-3.5 h-3.5 mr-1" /> {t('rx_add_item')}</Button>
              </div>

              <div className="space-y-2">
                {prescription.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{item.medicationName} <span className="text-medical-600 font-medium">{item.dosage}</span></h4>
                      <p className="text-xs text-slate-600 mt-0.5">Tomar {item.frequency} durante {item.duration}.</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removePrescriptionItem(item.id)} className="h-6 w-6 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {appointmentType === 'video_call' && (
              <TabsContent value="video" className="flex-1 m-0">
                <div className="h-full bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-inner overflow-hidden">
                   <div className="text-center text-slate-500">
                     <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                     <p className="text-sm">Sala de Videollamada</p>
                   </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </section>

        {/* 🟪 COLUMNA DERECHA: Documentación SOAP y Copiloto IA */}
        <aside className="w-[450px] bg-white p-4 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-0">
          <Tabs defaultValue="soap" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100">
              <TabsTrigger value="soap"><FileText className="w-4 h-4 mr-2"/> Notas SOAP</TabsTrigger>
              <TabsTrigger value="copilot" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                <Sparkles className="w-4 h-4 mr-2"/> Copiloto IA
              </TabsTrigger>
            </TabsList>

            {/* NOTAS SOAP MANUALES */}
            <TabsContent value="soap" className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar m-0 pb-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">S - {t('soap_subjective')}</label>
                <Textarea value={soapNotes.subjective} onChange={(e) => updateSoapNote('subjective', e.target.value)} placeholder="Motivo de consulta..." className="text-sm h-24 resize-none bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">O - {t('soap_objective')}</label>
                <Textarea value={soapNotes.objective} onChange={(e) => updateSoapNote('objective', e.target.value)} placeholder="Exploración física..." className="text-sm h-24 resize-none bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">A - {t('soap_assessment')}</label>
                <Textarea value={soapNotes.assessment} onChange={(e) => updateSoapNote('assessment', e.target.value)} placeholder="Diagnóstico..." className="text-sm h-20 resize-none bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">P - {t('soap_plan')}</label>
                <Textarea value={soapNotes.plan} onChange={(e) => updateSoapNote('plan', e.target.value)} placeholder="Tratamiento..." className="text-sm h-24 resize-none bg-slate-50" />
              </div>
            </TabsContent>

            {/* COPILOTO IA */}
            <TabsContent value="copilot" className="flex-1 flex flex-col justify-center items-center m-0 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-center p-6 space-y-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900">Escriba Médico Inteligente</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Graba la conversación con tu paciente. La IA estructurará automáticamente la nota SOAP y extraerá el diagnóstico.
                </p>
                
                <Button 
                  size="lg" 
                  onClick={handleToggleRecording}
                  disabled={isTranscribing}
                  className={`w-full rounded-full mt-4 h-12 shadow-md ${isRecording ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  variant={isRecording ? 'outline' : 'default'}
                >
                  {isTranscribing ? (
                     <><QhSpinner size="sm" className="mr-2 text-indigo-600"/> Procesando audio...</>
                  ) : isRecording ? (
                    <><Square className="w-5 h-5 mr-2 fill-current" /> Detener Grabación</>
                  ) : (
                    <><Mic className="w-5 h-5 mr-2" /> Iniciar Escucha</>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </main>
    </div>
  );
}