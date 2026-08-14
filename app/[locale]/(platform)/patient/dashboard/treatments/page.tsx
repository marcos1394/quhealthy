"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { TreatmentManager, TreatmentDto } from "@/components/patient/health-record/TreatmentManager";
import { treatmentService } from "@/services/treatment.service";
import { diagnosisService, PatientDiagnosisDto } from "@/services/diagnosis.service";
import axiosInstance from '@/lib/axios';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Camera, AlertTriangle, Sparkles, Upload, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useModuleStore } from "@/stores/useModuleStore";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function TreatmentsPage() {
  const { activeModules } = useModuleStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", dosage: "", category: "GENERAL", frequency: "", endDate: "", route: "Oral", reason: "",
    startDate: new Date().toISOString().split('T')[0], patientActiveProblemId: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [warningData, setWarningData] = useState<string | null>(null);

  const [treatments, setTreatments] = useState<TreatmentDto[]>([]);
  const [diagnoses, setDiagnoses] = useState<PatientDiagnosisDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  useEffect(() => {
    async function load() {
      try {
        const [treatmentsData, diagnosesData] = await Promise.all([
          treatmentService.getMyTreatments(),
          diagnosisService.getMyDiagnoses()
        ]);
        setTreatments(treatmentsData);
        setDiagnoses(diagnosesData);
      } catch (err) {
        console.error("Failed to fetch treatments:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await axiosInstance.post("/api/appointments/treatments/ai/analyze-image", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data) {
        const data = res.data;
        setFormData(prev => ({ ...prev, name: data.name || prev.name, dosage: data.dosage || prev.dosage, route: data.route || prev.route, reason: data.reason || prev.reason }));
        toast.success("Información extraída con éxito");
      }
    } catch (err) {
      toast.error("Error al analizar la imagen");
    } finally {
      setIsScanning(false);
    }
  };

  const saveTreatment = async () => {
    setIsSubmitting(true);
    try {
      const newTreatment = await treatmentService.addManualTreatment({
        name: formData.name,
        dosage: formData.dosage,
        category: formData.category,
        frequency: formData.frequency || "Indicado por el médico",
        route: formData.route || "Oral",
        endDate: formData.endDate || undefined,
        reason: formData.reason || undefined,
        startDate: formData.startDate,
        patientActiveProblemId: formData.patientActiveProblemId && formData.patientActiveProblemId !== "none" ? parseInt(formData.patientActiveProblemId) : undefined
      });
      setTreatments(prev => [...prev, newTreatment]);
      setShowAddModal(false);
      setWarningData(null);
      setFormData({ name: "", dosage: "", category: "GENERAL", frequency: "", endDate: "", route: "Oral", reason: "", startDate: new Date().toISOString().split('T')[0], patientActiveProblemId: "" });
      toast.success("Tratamiento guardado exitosamente");
    } catch (error) {
      console.error("Error adding treatment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddManual = async () => {
    if (!formData.name || !formData.dosage) return;
    setIsSubmitting(true);
    try {
      // Validar contraindicaciones con IA
      try {
        const contraindicationRes = await axiosInstance.post("/api/appointments/treatments/ai/check-contraindications", {
          newMedication: formData.name,
          currentMedications: treatments.map(t => t.name),
          activeConditions: activeModules
        });
        if (contraindicationRes.data) {
          const warning = contraindicationRes.data;
          if (warning.hasRisk) {
            setWarningData(warning.warningMessage);
            setIsSubmitting(false);
            return;
          }
        }
      } catch (e) {
        console.error("Error checking contraindications", e);
      }

      await saveTreatment();
    } catch (error) {
      console.error("Error", error);
    }
  };

  const [activeTab, setActiveTab] = useState<"treatments" | "diagnoses">("treatments");
  const [icdQuery, setIcdQuery] = useState("");
  const [icdResults, setIcdResults] = useState<any[]>([]);
  const [isSearchingIcd, setIsSearchingIcd] = useState(false);
  const [isAddingDiagnosis, setIsAddingDiagnosis] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (icdQuery.trim().length > 2) {
        setIsSearchingIcd(true);
        try {
          const { consumerProfileService } = await import("@/services/consumerProfile.service");
          const data = await consumerProfileService.searchIcd10(icdQuery, 10);
          setIcdResults(data.content || data || []);
        } catch (error) {
          console.error("Error fetching ICD10", error);
        } finally {
          setIsSearchingIcd(false);
        }
      } else {
        setIcdResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [icdQuery]);

  const handleAddDiagnosis = async (cie10Code: string, description: string) => {
    setIsAddingDiagnosis(true);
    try {
      const newDiag = await diagnosisService.addManualDiagnosis({ cie10Code, diagnosis: description });
      setDiagnoses(prev => [...prev, newDiag]);
      setIcdQuery("");
      setIcdResults([]);
      toast.success("Diagnóstico agregado exitosamente");
    } catch (e) {
      toast.error("Error al agregar diagnóstico");
    } finally {
      setIsAddingDiagnosis(false);
    }
  };

  const handleDeleteTreatment = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Tratamiento",
      message: "¿Seguro que deseas eliminar este tratamiento?",
      onConfirm: async () => {
        try {
          await treatmentService.deleteManualTreatment(id);
          setTreatments(prev => prev.filter(t => t.id !== id));
          toast.success("Tratamiento eliminado");
        } catch (e) {
          toast.error("Error al eliminar tratamiento");
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleResolveDiagnosis = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Resolver Diagnóstico",
      message: "¿Marcar este diagnóstico como resuelto y enviarlo al historial?",
      onConfirm: async () => {
        try {
          await diagnosisService.updateDiagnosisStatus(id, "RESUELTO");
          setDiagnoses(prev => prev.map(d => d.id === id ? { ...d, status: "RESUELTO" } : d));
          toast.success("Diagnóstico marcado como resuelto");
        } catch (e) {
          toast.error("Error al actualizar diagnóstico");
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeleteDiagnosis = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Diagnóstico",
      message: "¿Seguro que deseas eliminar este registro (por error de captura)?",
      onConfirm: async () => {
        try {
          await diagnosisService.deleteDiagnosis(id);
          setDiagnoses(prev => prev.filter(d => d.id !== id));
          toast.success("Registro eliminado exitosamente");
        } catch (e) {
          toast.error("Error al eliminar diagnóstico");
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Salud Integral</h1>
        <p className="text-gray-500 mt-2">
          Control centralizado de tus diagnósticos y medicamentos.
        </p>
      </div>

      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => setActiveTab("treatments")}
          className={`pb-3 px-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === "treatments" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"}`}
        >
          Tratamientos y Dosis
        </button>
        <button 
          onClick={() => setActiveTab("diagnoses")}
          className={`pb-3 px-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === "diagnoses" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"}`}
        >
          Mis Diagnósticos
        </button>
      </div>

      {activeTab === "treatments" && (
        <div className="space-y-6">
          {treatments.filter(t => t.status === 'ACTIVE' || !t.status).length > 0 && (
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adherencia General</h2>
                <p className="text-sm text-gray-500 mt-1">Tu nivel de cumplimiento actual en todos tus tratamientos.</p>
              </div>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-gray-100 dark:text-gray-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500" strokeDasharray={`${Math.max(1, Math.min(100, Math.round((treatments.reduce((acc, t) => acc + (t.dosesTaken || 0), 0) / Math.max(1, treatments.reduce((acc, t) => acc + (t.totalDoses || 1), 0))) * 100)))}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {Math.max(0, Math.min(100, Math.round((treatments.reduce((acc, t) => acc + (t.dosesTaken || 0), 0) / Math.max(1, treatments.reduce((acc, t) => acc + (t.totalDoses || 1), 0))) * 100)))}%
                  </span>
                </div>
              </div>
            </div>
          )}
          <TreatmentManager 
            treatments={treatments} 
            onAddManual={() => setShowAddModal(true)} 
            onDelete={handleDeleteTreatment}
          />
        </div>
      )}

      {activeTab === "diagnoses" && (
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-indigo-500" />
                Diagnósticos Activos
              </h2>
              <p className="text-sm text-gray-500 mt-1">Enfermedades y condiciones detectadas o agregadas</p>
            </div>
          </div>

          <div className="space-y-3">
            {diagnoses.filter(d => d.status !== 'RESUELTO').length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl text-center">No tienes diagnósticos activos registrados.</p>
            ) : (
              diagnoses.filter(d => d.status !== 'RESUELTO').map(d => (
                <div key={d.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{d.diagnosis}</h4>
                    <p className="text-xs text-gray-500 mt-1">CIE-10: {d.cie10Code || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {d.status || 'ACTIVO'}
                    </span>
                    <button onClick={() => handleResolveDiagnosis(d.id)} className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1 rounded-full font-medium transition-colors">
                      Marcar Resuelto
                    </button>
                    <button onClick={() => handleDeleteDiagnosis(d.id)} className="text-gray-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Historial Médico (Resueltos)</h3>
             <div className="space-y-3 opacity-60">
                {diagnoses.filter(d => d.status === 'RESUELTO').length === 0 ? (
                  <p className="text-sm text-gray-500">No hay padecimientos en el historial.</p>
                ) : (
                  diagnoses.filter(d => d.status === 'RESUELTO').map(d => (
                    <div key={d.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold line-through text-gray-700 dark:text-gray-300">{d.diagnosis}</h4>
                        <p className="text-xs text-gray-500 mt-1">CIE-10: {d.cie10Code || "N/A"}</p>
                      </div>
                      <span className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        RESUELTO
                      </span>
                    </div>
                  ))
                )}
             </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold mb-3">Añadir Diagnóstico Manual</h3>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o código CIE-10..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                value={icdQuery}
                onChange={e => setIcdQuery(e.target.value)}
              />
              {isSearchingIcd && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="w-4 h-4 block border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                </div>
              )}
              {icdResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                  {icdResults.map((r, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleAddDiagnosis(r.code, r.name || r.description)}
                      disabled={isAddingDiagnosis}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                    >
                      <p className="text-sm font-medium">{r.name || r.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.code}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold mb-4">Añadir Tratamiento Manual</h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-sm text-gray-500">Ingresa los detalles del medicamento.</p>
              <div>
                <input type="file" id="ai-scan-cam" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                <input type="file" id="ai-scan-file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div className="flex gap-2">
                  <label htmlFor="ai-scan-cam" className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-200 transition-colors">
                    {isScanning ? <Sparkles className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    {isScanning ? "..." : "Cámara"}
                  </label>
                  <label htmlFor="ai-scan-file" className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200 transition-colors">
                    <Upload className="w-4 h-4" />
                    Archivo
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Medicamento / Terapia</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3" 
                  placeholder="Ej. Trastuzumab o Losartán" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Para qué sirve (Indicación)</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3" 
                  placeholder="Ej. Hipertensión" 
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dosis</label>
                  <input 
                    type="text" 
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3" 
                    placeholder="Ej. 500mg" 
                    value={formData.dosage}
                    onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger className="w-full h-[50px] rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="ONCOLOGY">Oncología (Quimio, Inmuno...)</SelectItem>
                      <SelectItem value="CARDIOLOGY">Cardiología</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Periodicidad (Frecuencia)</label>
                  <input 
                    type="text" 
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3" 
                    placeholder="Ej. Cada 8 horas" 
                    value={formData.frequency}
                    onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Diagnóstico Asociado</label>
                  <Select value={formData.patientActiveProblemId} onValueChange={(val) => setFormData({ ...formData, patientActiveProblemId: val })}>
                    <SelectTrigger className="w-full h-[50px] rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <SelectValue placeholder="Opcional..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">Sin especificar</SelectItem>
                      {diagnoses.map(d => (
                        <SelectItem key={d.id} value={d.id.toString()}>{d.diagnosis}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de Inicio</label>
                  <DatePicker 
                    value={formData.startDate ? new Date(formData.startDate + "T00:00:00") : undefined} 
                    onChange={date => setFormData({ ...formData, startDate: date ? date.toISOString().split('T')[0] : "" })} 
                    placeholder="Seleccionar fecha"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de Término</label>
                  <DatePicker 
                    value={formData.endDate ? new Date(formData.endDate + "T00:00:00") : undefined} 
                    onChange={date => setFormData({ ...formData, endDate: date ? date.toISOString().split('T')[0] : "" })} 
                    placeholder="Seleccionar fecha"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button onClick={handleAddManual} disabled={isSubmitting || !formData.name || !formData.dosage} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                {isSubmitting ? "Guardando..." : "Guardar Tratamiento"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {warningData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 w-full max-w-md border border-rose-100 dark:border-rose-900/30 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4 text-rose-600 dark:text-rose-500">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold">Riesgo Detectado</h3>
            </div>
            
            <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200 p-4 rounded-2xl text-sm leading-relaxed mb-6">
              {warningData}
            </div>
            
            <p className="text-gray-500 text-sm mb-6 text-center">
              ¿Estás seguro que deseas guardar este medicamento a pesar de la advertencia?
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="ghost" className="w-full h-11 rounded-xl" onClick={() => setWarningData(null)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white" onClick={saveTreatment} disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Bajo mi riesgo"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
}
