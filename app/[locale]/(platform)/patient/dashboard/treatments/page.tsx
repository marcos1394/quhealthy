"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { TreatmentManager, TreatmentDto } from "@/components/patient/health-record/TreatmentManager";
import { treatmentService } from "@/services/treatment.service";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Camera, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useModuleStore } from "@/stores/useModuleStore";

export default function TreatmentsPage() {
  const { activeModules } = useModuleStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", dosage: "", category: "GENERAL", frequency: "", endDate: "", route: "Oral", reason: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [treatments, setTreatments] = useState<TreatmentDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await treatmentService.getMyTreatments();
        setTreatments(data);
      } catch (err) {
        console.error("Failed to fetch treatments:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddManual = async () => {
    if (!formData.name || !formData.dosage) return;
    setIsSubmitting(true);
    try {
      // Validar contraindicaciones con IA
      try {
        const contraindicationRes = await fetch("/api/appointments/treatments/ai/check-contraindications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newMedication: formData.name,
            currentMedications: treatments.map(t => t.name),
            activeConditions: activeModules
          })
        });
        if (contraindicationRes.ok) {
          const warningData = await contraindicationRes.json();
          if (warningData.hasRisk) {
            const proceed = window.confirm(`⚠️ Riesgo Detectado por IA:\n\n${warningData.warningMessage}\n\n¿Estás seguro que deseas guardar este medicamento?`);
            if (!proceed) {
              setIsSubmitting(false);
              return;
            }
          }
        }
      } catch (e) {
        console.error("Error checking contraindications", e);
      }

      const newTreatment = await treatmentService.addManualTreatment({
        name: formData.name,
        dosage: formData.dosage,
        category: formData.category,
        frequency: formData.frequency || "Indicado por el médico",
        route: formData.route || "Oral",
        endDate: formData.endDate || undefined,
        reason: formData.reason || undefined,
        startDate: new Date().toISOString().split('T')[0],
      });
      setTreatments(prev => [...prev, newTreatment]);
      setShowAddModal(false);
      setFormData({ name: "", dosage: "", category: "GENERAL", frequency: "", endDate: "", route: "Oral", reason: "" });
      toast.success("Tratamiento guardado exitosamente");
    } catch (error) {
      console.error("Error adding treatment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestor de Tratamientos</h1>
        <p className="text-gray-500 mt-2">
          Control centralizado de todos tus medicamentos, dosis y terapias (incluyendo tratamientos oncológicos o especializados).
        </p>
      </div>

      <TreatmentManager 
        treatments={treatments} 
        onAddManual={() => setShowAddModal(true)} 
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 w-full max-w-lg border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold mb-4">Añadir Tratamiento Manual</h3>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">Ingresa los detalles del medicamento.</p>
              <div>
                <input type="file" id="ai-scan" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsScanning(true);
                  try {
                    const fd = new FormData();
                    fd.append("image", file);
                    const res = await fetch("/api/appointments/treatments/ai/analyze-image", { method: "POST", body: fd });
                    if (res.ok) {
                      const data = await res.json();
                      setFormData(prev => ({ ...prev, name: data.name || prev.name, dosage: data.dosage || prev.dosage, route: data.route || prev.route, reason: data.reason || prev.reason }));
                      toast.success("Información extraída con éxito");
                    }
                  } catch (err) {
                    toast.error("Error al analizar la imagen");
                  } finally {
                    setIsScanning(false);
                  }
                }} />
                <label htmlFor="ai-scan" className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-200 transition-colors">
                  {isScanning ? <Sparkles className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  {isScanning ? "Escaneando..." : "Escanear con IA"}
                </label>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium mb-1">Fecha de Término</label>
                  <input 
                    type="date" 
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3" 
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
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
    </div>
  );
}
