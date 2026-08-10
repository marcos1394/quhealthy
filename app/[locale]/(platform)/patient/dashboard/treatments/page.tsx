"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { TreatmentManager, TreatmentDto } from "@/components/patient/health-record/TreatmentManager";
import { Button } from "@/components/ui/button";

export default function TreatmentsPage() {
  // const t = useTranslations("Patient.Treatments"); // Ignoring translations for the prototype
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data for initial layout testing, soon to be fetched from appointment_service
  const [treatments, setTreatments] = useState<TreatmentDto[]>([
    {
      id: 1,
      name: "Paracetamol",
      dosage: "500mg",
      frequency: "Cada 8 horas",
      route: "Oral",
      category: "GENERAL",
      startDate: "2026-08-01",
      prescriber: "Dr. Ana Ruiz",
      status: "ACTIVE",
      nextDoseTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 2,
      name: "Ciclofosfamida",
      dosage: "600 mg/m2",
      frequency: "Cada 21 días (Ciclo 1)",
      route: "Intravenosa",
      category: "ONCOLOGY",
      startDate: "2026-08-05",
      prescriber: "Centro Médico ABC",
      status: "ACTIVE",
      nextDoseTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    }
  ]);

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
            <p className="text-sm text-gray-500 mb-6">Ingresa los detalles del medicamento o terapia que estás recibiendo de forma externa a QuHealthy.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Medicamento / Terapia</label>
                <input type="text" className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3" placeholder="Ej. Trastuzumab o Losartán" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dosis</label>
                  <input type="text" className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3" placeholder="Ej. 500mg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                    <option value="GENERAL">General</option>
                    <option value="ONCOLOGY">Oncología (Quimio, Inmuno...)</option>
                    <option value="CARDIOLOGY">Cardiología</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancelar</Button>
              <Button onClick={() => setShowAddModal(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Guardar Tratamiento</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
