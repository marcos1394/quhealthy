"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState } from "react";
import { HeartHandshake, Pill, Stethoscope, Microscope, Hospital, DollarSign, Brain, FileCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FoundationProgramPayload } from "@/types/foundation";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface Step4ProgramSetupProps {
  initialData?: Partial<FoundationProgramPayload>;
  onSave: (data: FoundationProgramPayload) => Promise<void>;
  onBack: () => void;
  onSkip?: () => void;
  isLoading?: boolean;
}

const SUPPORT_TYPES = [
  { id: "MEDICATION", label: "Medicamentos de Especialidad", desc: "Inmunosupresores, quimioterapias, fármacos de alto costo.", icon: Pill },
  { id: "CONSULTATION", label: "Consultas con Médicos Aliados", desc: "Interconsultas presenciales o por telemedicina.", icon: Stethoscope },
  { id: "LABS", label: "Estudios de Laboratorio & Gabinete", desc: "Tipificación HLA, serologías, biopsias, ultrasonidos.", icon: Microscope },
  { id: "SURGERY", label: "Cirugías & Procedimientos", desc: "Cataratas, trasplantes de córnea, fístulas arteriovenosas.", icon: Hospital },
  { id: "FINANCIAL", label: "Apoyo Económico / Viáticos", desc: "Transporte para citas y tratamientos foráneos.", icon: DollarSign },
  { id: "PSYCHOSOCIAL", label: "Acompañamiento Psicológico & Nutrición", desc: "Soporte integral al paciente y su cuidador.", icon: Brain },
];

const REQUIRED_DOCS_LIST = [
  { id: "SOCIOECONOMIC_STUDY", label: "Estudio Socioeconómico Institucional" },
  { id: "MEDICAL_SUMMARY", label: "Dictamen o Resumen Médico Oficial" },
  { id: "PRESCRIPTION", label: "Receta Médica Vigente emitida por hospital público" },
  { id: "CURP", label: "CURP del Paciente / Beneficiario" },
  { id: "OFFICIAL_ID", label: "Identificación Oficial (INE / Acta de Nacimiento si es menor)" },
  { id: "PROOF_OF_ADDRESS", label: "Comprobante de Domicilio" },
  { id: "INCOME_PROOF", label: "Comprobante de Ingresos o Carta Bajo Protesta" },
];

export const Step4ProgramSetup: React.FC<Step4ProgramSetupProps> = ({
  initialData,
  onSave,
  onBack,
  onSkip,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FoundationProgramPayload>({
    name: initialData?.name || "Programa de Apoyo y Acompañamiento a Pacientes",
    description: initialData?.description || "",
    cause: initialData?.cause || "SALUD_RENAL",
    supportTypes: initialData?.supportTypes || ["MEDICATION", "CONSULTATION", "LABS"],
    requiredDocuments: initialData?.requiredDocuments || [
      "SOCIOECONOMIC_STUDY",
      "MEDICAL_SUMMARY",
      "PRESCRIPTION",
      "CURP",
      "OFFICIAL_ID",
    ],
    targetBeneficiariesCount: initialData?.targetBeneficiariesCount || 50,
    allocatedBudget: initialData?.allocatedBudget || 100000,
  });

  const toggleSupportType = (id: string) => {
    setFormData((prev) => {
      const current = prev.supportTypes || [];
      return {
        ...prev,
        supportTypes: current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      };
    });
  };

  const toggleDoc = (id: string) => {
    setFormData((prev) => {
      const current = prev.requiredDocuments || [];
      return {
        ...prev,
        requiredDocuments: current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto font-sans">
      {/* ── CARD 1: DATOS DEL PROGRAMA ────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              1. Configuración de tu Primer Programa Asistencial
            </h2>
            <p className="text-xs text-gray-500">
              Define la causa, los tipos de apoyos y los requisitos para los beneficiarios (opcional para explorar).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Nombre del Programa Asistencial <span className="text-red-500">*</span>
            </label>
            <Input
              required
              placeholder="Ej. Programa de Medicamentos Inmunosupresores y Apoyo a Trasplante Renal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Descripción y Objetivos del Programa
            </label>
            <Textarea
              rows={3}
              placeholder="Explica a quién va dirigido este programa y qué problemática resuelve..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Meta de Beneficiarios Estimados
            </label>
            <Input
              type="number"
              min="1"
              placeholder="50"
              value={formData.targetBeneficiariesCount || ""}
              onChange={(e) => setFormData({ ...formData, targetBeneficiariesCount: parseInt(e.target.value) || 0 })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Presupuesto Asignado ($ MXN)
            </label>
            <Input
              type="number"
              min="0"
              placeholder="100000"
              value={formData.allocatedBudget || ""}
              onChange={(e) => setFormData({ ...formData, allocatedBudget: parseFloat(e.target.value) || 0 })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono"
            />
          </div>
        </div>
      </div>

      {/* ── CARD 2: TIPOS DE APOYO OFRECIDOS ──────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              2. Modalidades de Apoyo y Cobertura
            </h2>
            <p className="text-xs text-gray-500">
              Selecciona qué tipo de beneficios o subsidios gestiona este programa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {SUPPORT_TYPES.map((type) => {
            const isChecked = (formData.supportTypes || []).includes(type.id);
            const Icon = type.icon;

            return (
              <div
                key={type.id}
                role="button"
                tabIndex={0}
                onClick={() => toggleSupportType(type.id)}
                onKeyDown={(e) => e.key === "Enter" && toggleSupportType(type.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                  isChecked
                    ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#0a0a0a]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isChecked
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">{type.label}</h4>
                  <p className="text-[11px] text-gray-500 leading-tight">{type.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CARD 3: REQUISITOS DOCUMENTALES DEL BENEFICIARIO ───────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              3. Documentos Requeridos al Paciente / Solicitante
            </h2>
            <p className="text-xs text-gray-500">
              Expediente que el equipo de trabajo social solicitará para dictaminar el caso.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {REQUIRED_DOCS_LIST.map((doc) => {
            const isChecked = (formData.requiredDocuments || []).includes(doc.id);
            return (
              <label
                key={doc.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                  isChecked
                    ? "border-purple-300 dark:border-purple-900/50 bg-purple-50/20 dark:bg-purple-950/20 font-bold text-gray-900 dark:text-white"
                    : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleDoc(doc.id)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs">{doc.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── BOTONES DE NAVEGACIÓN ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto h-12 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Equipo</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="h-12 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <span>Omitir y Finalizar</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
          >
            {isLoading ? (
              <QhSpinner size="sm" className="text-white" />
            ) : (
              <>
                <span>Guardar & Ir a Resumen de Activación</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
