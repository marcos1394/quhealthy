"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  ArrowRight,
  Plus,
  Trash2,
  Clock,
  FlaskConical,
  DollarSign,
  AlertCircle,
  Recycle,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LaboratoryStudyItem,
  SaveLaboratoryCatalogPayload,
  LaboratoryStudyCategory
} from "@/types/laboratory";
import { cn } from "@/lib/utils";

interface Step4CatalogPricingProps {
  initialData?: Partial<SaveLaboratoryCatalogPayload>;
  onSave: (data: SaveLaboratoryCatalogPayload) => Promise<void>;
  onSkip: () => Promise<void>;
  isLoading?: boolean;
}

const DEFAULT_MEXICAN_STUDIES: (LaboratoryStudyItem & { isSelected: boolean })[] = [
  {
    studyCode: "BH_01",
    studyName: "Biometría Hemática Completa (Citometría Hemática)",
    category: "HEMATOLOGY",
    patientPreparation: "Ayuno de 8 horas. No requiere suspensión de medicamentos salvo indicación médica.",
    basePrice: 180,
    turnaroundHours: 12,
    sampleType: "Sangre total con EDTA",
    isActive: true,
    isSelected: true,
  },
  {
    studyCode: "QS_06",
    studyName: "Química Sanguínea 6 Elementos (Glucosa, Urea, Creatinina, Ác. Úrico, Colesterol, Triglicéridos)",
    category: "CLINICAL_CHEMISTRY",
    patientPreparation: "Ayuno estricto de 10 a 12 horas. Evitar alcohol 24 hrs antes.",
    basePrice: 350,
    turnaroundHours: 12,
    sampleType: "Suero sanguíneo",
    isActive: true,
    isSelected: true,
  },
  {
    studyCode: "EGO_01",
    studyName: "Examen General de Orina (EGO)",
    category: "URINALYSIS",
    patientPreparation: "Primera orina de la mañana. Chorro medio con previo aseo genital.",
    basePrice: 120,
    turnaroundHours: 8,
    sampleType: "Orina espontánea",
    isActive: true,
    isSelected: true,
  },
  {
    studyCode: "QS_24",
    studyName: "Química Sanguínea 24 Elementos (Perfil Metabólico Integral)",
    category: "CLINICAL_CHEMISTRY",
    patientPreparation: "Ayuno estricto de 12 horas. No realizar ejercicio extenuante previo.",
    basePrice: 750,
    turnaroundHours: 24,
    sampleType: "Suero sanguíneo",
    isActive: true,
    isSelected: true,
  },
  {
    studyCode: "PERF_LIP",
    studyName: "Perfil Lipídico Completo (Colesterol Total, HDL, LDL, VLDL, Triglicéridos)",
    category: "CLINICAL_CHEMISTRY",
    patientPreparation: "Ayuno estricto de 12 horas. Cena ligera y sin grasas el día anterior.",
    basePrice: 380,
    turnaroundHours: 12,
    sampleType: "Suero sanguíneo",
    isActive: true,
    isSelected: true,
  },
  {
    studyCode: "PERF_TIR",
    studyName: "Perfil Tiroideo Completo (TSH, T3 Total, T4 Total, T3 Libre, T4 Libre)",
    category: "HORMONES",
    patientPreparation: "Ayuno de 8 horas. Tomar muestra preferentemente antes de las 10:00 hrs.",
    basePrice: 650,
    turnaroundHours: 24,
    sampleType: "Suero sanguíneo",
    isActive: true,
    isSelected: true,
  },
  {
    studyCode: "HBA1C",
    studyName: "Hemoglobina Glucosilada Fracción A1c (HbA1c)",
    category: "CLINICAL_CHEMISTRY",
    patientPreparation: "No requiere ayuno estricto (ayuno de 4 hrs recomendado).",
    basePrice: 280,
    turnaroundHours: 12,
    sampleType: "Sangre total con EDTA",
    isActive: true,
    isSelected: true,
  },
  {
    studyCode: "HCG_CUAL",
    studyName: "Prueba Inmunológica de Embarazo (Fracción Beta hCG Cualitativa)",
    category: "IMMUNOLOGY",
    patientPreparation: "Ayuno de 4 horas o muestra aleatoria en suero.",
    basePrice: 220,
    turnaroundHours: 6,
    sampleType: "Suero sanguíneo",
    isActive: true,
    isSelected: false,
  },
  {
    studyCode: "PERF_HEP",
    studyName: "Perfil Hepático Completo (Bilirrubinas, TGO, TGP, FA, GGT, Proteínas Totales)",
    category: "CLINICAL_CHEMISTRY",
    patientPreparation: "Ayuno de 8 a 10 horas.",
    basePrice: 480,
    turnaroundHours: 24,
    sampleType: "Suero sanguíneo",
    isActive: true,
    isSelected: false,
  },
];

export const Step4CatalogPricing: React.FC<Step4CatalogPricingProps> = ({
  initialData,
  onSave,
  onSkip,
  isLoading = false,
}) => {
  const [studies, setStudies] = useState<(LaboratoryStudyItem & { isSelected: boolean })[]>(() => {
    if (initialData?.studies && initialData.studies.length > 0) {
      return initialData.studies.map((s) => ({ ...s, isSelected: true }));
    }
    return DEFAULT_MEXICAN_STUDIES;
  });

  const [rpbiCompany, setRpbiCompany] = useState(
    initialData?.rpbiCompany || ""
  );
  const [rpbiContractNumber, setRpbiContractNumber] = useState(
    initialData?.rpbiContractNumber || ""
  );

  const toggleStudySelection = (index: number) => {
    setStudies((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const updateStudyPrice = (index: number, price: number) => {
    setStudies((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, basePrice: price } : item
      )
    );
  };

  const updateStudyTurnaround = (index: number, hours: number) => {
    setStudies((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, turnaroundHours: hours } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStudies = studies
      .filter((s) => s.isSelected)
      .map(({ isSelected, ...rest }) => rest);

    onSave({
      studies: selectedStudies,
      rpbiCompany,
      rpbiContractNumber,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Encabezado del Paso */}
      <div className="space-y-1 text-left">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Paso 4 de 5 • Catálogo Inicial & Precios al Público
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Configura tus estudios más solicitados
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Hemos precargado las pruebas clínicas más comunes en México. Selecciona las que ofreces y ajusta sus precios en MXN.
        </p>
      </div>

      {/* Selector de Estudios */}
      <div className="space-y-3 text-left">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Estudios Seleccionados ({studies.filter((s) => s.isSelected).length} activos)
          </label>
          <span className="text-[11px] text-gray-400">
            (Precios exentos de IVA conforme a Ley del IVA Art. 15 Fracc. XIV)
          </span>
        </div>

        <div className="space-y-2.5">
          {studies.map((study, idx) => {
            return (
              <div
                key={study.studyCode}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                  study.isSelected
                    ? "bg-white dark:bg-[#0d0d0d] border-blue-500/40 shadow-xs"
                    : "bg-gray-50/50 dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={study.isSelected}
                    onCheckedChange={() => toggleStudySelection(idx)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {study.studyName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                        {study.sampleType}
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Clock className="w-3 h-3" />
                        Entrega: {study.turnaroundHours} hrs
                      </span>
                      <span>• {study.patientPreparation}</span>
                    </div>
                  </div>
                </div>

                {study.isSelected && (
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-xs text-gray-400 font-bold">$</span>
                      <Input
                        type="number"
                        value={study.basePrice}
                        onChange={(e) => updateStudyPrice(idx, Number(e.target.value))}
                        className="h-9 w-24 pl-6 pr-2 rounded-xl text-xs font-bold"
                        min={0}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">MXN</span>

                    <select
                      value={study.turnaroundHours}
                      onChange={(e) => updateStudyTurnaround(idx, Number(e.target.value))}
                      className="h-9 px-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-[11px] text-gray-700 dark:text-gray-300"
                    >
                      <option value={4} className="bg-white dark:bg-[#111]">4 hrs (Urgente)</option>
                      <option value={8} className="bg-white dark:bg-[#111]">8 hrs (Mismo día)</option>
                      <option value={12} className="bg-white dark:bg-[#111]">12 hrs</option>
                      <option value={24} className="bg-white dark:bg-[#111]">24 hrs</option>
                      <option value={48} className="bg-white dark:bg-[#111]">48 hrs</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Manejo de RPBI (NOM-087-SEMARNAT-SSA1-2002) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm text-left">
        <div className="flex items-center gap-2">
          <Recycle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Recolección de RPBI (NOM-087 - Opcional en esta etapa)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Empresa Autorizada de Recolección de Residuos
            </label>
            <Input
              value={rpbiCompany}
              onChange={(e) => setRpbiCompany(e.target.value)}
              placeholder="Ej. Stericycle / Medam / Ecolsur"
              className="h-11 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Número de Contrato o Manifiesto
            </label>
            <Input
              value={rpbiContractNumber}
              onChange={(e) => setRpbiContractNumber(e.target.value)}
              placeholder="Ej. RPBI-2024-9841"
              className="h-11 rounded-xl text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          disabled={isLoading}
          className="w-full sm:w-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs font-semibold cursor-pointer"
        >
          Omitir por ahora y completar después
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>Guardar y Continuar</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};
