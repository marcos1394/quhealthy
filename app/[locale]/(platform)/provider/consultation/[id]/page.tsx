"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  Stethoscope, User, Activity, FileText, Pill, Plus, 
  Trash2, Save, History, FileCheck, AlertTriangle, ShieldAlert, ShoppingBag
} from "lucide-react";

import { useConsultation } from "@/hooks/useConsultation";

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
  
  // En un caso real, el consumerId vendría de la cita. Aquí lo mockeamos para el ejemplo.
  const appointmentId = Number(params.id);
  const consumerId = 1; // Deberías obtener esto del detalle de la cita
  
  const {
    patientProfile, vaultDocuments, isLoading, isSubmitting,
    soapNotes, prescription, loadPatientRecord, updateSoapNote,
    addPrescriptionItem, removePrescriptionItem, completeConsultation
  } = useConsultation(appointmentId, consumerId);

  // Estado local para el formulario de nuevo medicamento
  const [newRx, setNewRx] = useState({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' });

  useEffect(() => {
    loadPatientRecord(t('toast_load_error'));
  }, [loadPatientRecord, t]);

  const handleAddRx = () => {
    if (!newRx.medicationName || !newRx.dosage) return;
    addPrescriptionItem(newRx);
    setNewRx({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }); // Reset
  };

  const handleComplete = async () => {
    const success = await completeConsultation(t('toast_success'), t('toast_error'));
    if (success) {
      router.push('/provider/dashboard'); // Redirigir al dashboard al terminar
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Activity className="w-12 h-12 animate-spin text-medical-500" /></div>;
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto h-[calc(100vh-80px)] flex flex-col">
      
      {/* 🟦 HEADER DE LA CONSULTA */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-8 h-8 text-medical-600 dark:text-medical-500" />
            {t('title_consultation')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Cita #{appointmentId}</p>
        </div>
        <Button 
          onClick={handleComplete} 
          disabled={isSubmitting}
          className="bg-medical-600 hover:bg-medical-700 text-white h-12 px-6 rounded-xl font-bold shadow-md shadow-medical-500/20"
        >
          <Save className="w-5 h-5 mr-2" />
          {t('btn_end_consultation')}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* 🟩 COLUMNA IZQUIERDA: PERFIL DEL PACIENTE */}
        <div className="xl:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-slate-500" />
                {t('patient_profile')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {/* Info Básica */}
              <div className="text-center">
                <div className="w-20 h-20 bg-medical-100 dark:bg-medical-900/50 rounded-full mx-auto flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-medical-700 dark:text-medical-400">
                    {patientProfile?.fullName?.charAt(0) || 'P'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{patientProfile?.fullName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {patientProfile?.gender} • {patientProfile?.bloodType || 'Sangre N/D'}
                </p>
              </div>

              {/* QuScore */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('qu_score')}</p>
                <div className="text-3xl font-black text-medical-600 dark:text-medical-400 leading-none mb-2">
                  {patientProfile?.quScore || '--'}
                </div>
                <Badge variant="outline" className="border-medical-200 text-medical-700 dark:border-medical-500/30 dark:text-medical-400">
                  {patientProfile?.quScoreBand || 'Sin calcular'}
                </Badge>
              </div>

              {/* Alergias y Condiciones */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> {t('allergies')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {patientProfile?.allergies?.length ? (
                      patientProfile.allergies.map(a => <Badge key={a} variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100">{a}</Badge>)
                    ) : <span className="text-sm text-slate-400">{t('no_data')}</span>}
                  </div>
                </div>
                <Separator className="dark:bg-slate-800" />
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-4 h-4 text-blue-500" /> {t('conditions')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {patientProfile?.chronicConditions?.length ? (
                      patientProfile.chronicConditions.map(c => <Badge key={c} variant="outline">{c}</Badge>)
                    ) : <span className="text-sm text-slate-400">{t('no_data')}</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🟪 COLUMNA DERECHA: PESTAÑAS (HISTORIAL, SOAP, RECETA) */}
        <div className="xl:col-span-3 flex flex-col min-h-0">
          <Tabs defaultValue="soap" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              <TabsTrigger value="history" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"><History className="w-4 h-4 mr-2"/> {t('tab_history')}</TabsTrigger>
              <TabsTrigger value="soap" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"><FileText className="w-4 h-4 mr-2"/> {t('tab_soap')}</TabsTrigger>
              <TabsTrigger value="prescription" className="rounded-lg py-2.5 data-[state=active]:bg-medical-50 dark:data-[state=active]:bg-medical-900/20 data-[state=active]:text-medical-700 dark:data-[state=active]:text-medical-400 data-[state=active]:shadow-sm"><Pill className="w-4 h-4 mr-2"/> {t('tab_prescription')}</TabsTrigger>
            </TabsList>

            {/* TAB 1: BÓVEDA DE SALUD */}
            <TabsContent value="history" className="flex-1 overflow-y-auto pr-2 custom-scrollbar outline-none">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle>{t('vault_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {vaultDocuments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">{t('vault_empty')}</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vaultDocuments.map(doc => (
                        <div key={doc.id} className="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <FileCheck className="w-8 h-8 text-medical-500 mr-4 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{doc.fileName}</p>
                            <p className="text-xs text-slate-500">{doc.documentType} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: NOTAS SOAP */}
            <TabsContent value="soap" className="flex-1 overflow-y-auto pr-2 custom-scrollbar outline-none space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300">S - {t('soap_subjective')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Textarea className="border-0 focus-visible:ring-0 rounded-none h-40 resize-none p-4" placeholder="El paciente refiere dolor en..." value={soapNotes.subjective} onChange={(e) => updateSoapNote('subjective', e.target.value)} />
                  </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300">O - {t('soap_objective')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Textarea className="border-0 focus-visible:ring-0 rounded-none h-40 resize-none p-4" placeholder="TA: 120/80, FC: 75. A la exploración física..." value={soapNotes.objective} onChange={(e) => updateSoapNote('objective', e.target.value)} />
                  </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300">A - {t('soap_assessment')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Textarea className="border-0 focus-visible:ring-0 rounded-none h-40 resize-none p-4" placeholder="Diagnóstico presuntivo..." value={soapNotes.assessment} onChange={(e) => updateSoapNote('assessment', e.target.value)} />
                  </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300">P - {t('soap_plan')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Textarea className="border-0 focus-visible:ring-0 rounded-none h-40 resize-none p-4" placeholder="Se indica tratamiento con..." value={soapNotes.plan} onChange={(e) => updateSoapNote('plan', e.target.value)} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 3: RECETA DIGITAL (EL PUENTE AL E-COMMERCE) */}
            <TabsContent value="prescription" className="flex-1 overflow-y-auto pr-2 custom-scrollbar outline-none space-y-6">
              
              {/* Formulario para agregar medicamento */}
              <Card className="border-medical-200 dark:border-medical-900/50 shadow-sm bg-medical-50/30 dark:bg-medical-900/10">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('rx_title')}</h3>
                    
                    {/* 🚀 EL SECRETO DEL E-COMMERCE HÍBRIDO */}
                    <Button variant="outline" size="sm" className="border-medical-300 text-medical-700 hover:bg-medical-100 dark:border-medical-700 dark:text-medical-400">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {t('link_store_product')}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <Input placeholder={t('rx_medication')} value={newRx.medicationName} onChange={e => setNewRx({...newRx, medicationName: e.target.value})} className="bg-white dark:bg-slate-900" />
                    </div>
                    <Input placeholder={t('rx_dosage')} value={newRx.dosage} onChange={e => setNewRx({...newRx, dosage: e.target.value})} className="bg-white dark:bg-slate-900" />
                    <Input placeholder={t('rx_frequency')} value={newRx.frequency} onChange={e => setNewRx({...newRx, frequency: e.target.value})} className="bg-white dark:bg-slate-900" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input placeholder={t('rx_duration')} value={newRx.duration} onChange={e => setNewRx({...newRx, duration: e.target.value})} className="bg-white dark:bg-slate-900 md:col-span-1" />
                    <Input placeholder={t('rx_instructions')} value={newRx.instructions} onChange={e => setNewRx({...newRx, instructions: e.target.value})} className="bg-white dark:bg-slate-900 md:col-span-2" />
                    <Button onClick={handleAddRx} disabled={!newRx.medicationName || !newRx.dosage} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 w-full">
                      <Plus className="w-4 h-4 mr-2" /> {t('rx_add_item')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Medicamentos en la Receta */}
              <div className="space-y-3">
                {prescription.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Pill className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    {t('rx_empty')}
                  </div>
                ) : (
                  prescription.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                          {item.medicationName} <span className="text-medical-600 dark:text-medical-400 font-medium text-base ml-1">{item.dosage}</span>
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Tomar {item.frequency} durante {item.duration}.
                        </p>
                        {item.instructions && <p className="text-xs text-slate-500 mt-1 italic">Nota: {item.instructions}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removePrescriptionItem(item.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}