"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ArrowRight,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Award,
  CheckCircle2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SaveLaboratorySanitaryPayload,
  SanitaryProfession,
  LaboratoryDocumentType
} from "@/types/laboratory";

interface Step2SanitaryLegalProps {
  initialData?: Partial<SaveLaboratorySanitaryPayload>;
  onSave: (data: SaveLaboratorySanitaryPayload, file?: File) => Promise<void>;
  onSkip: () => Promise<void>;
  isLoading?: boolean;
}

const PROFESSIONS: { value: SanitaryProfession; label: string }[] = [
  { value: "QFB", label: "Químico Farmacobiólogo (Q.F.B.)" },
  { value: "CLINICAL_CHEMIST", label: "Químico Clínico" },
  { value: "PATHOLOGIST_MD", label: "Médico Patólogo Clínico" },
  { value: "BIOLOGIST", label: "Biólogo / Químico Bacteriólogo" },
  { value: "OTHER", label: "Otra Licenciatura del Área Médica" },
];

export const Step2SanitaryLegal: React.FC<Step2SanitaryLegalProps> = ({
  initialData,
  onSave,
  onSkip,
  isLoading = false,
}) => {
  const [responsibleFullName, setResponsibleFullName] = useState(
    initialData?.responsibleFullName || ""
  );
  const [professionalLicense, setProfessionalLicense] = useState(
    initialData?.professionalLicense || ""
  );
  const [profession, setProfession] = useState<SanitaryProfession>(
    initialData?.profession || "QFB"
  );
  const [specialtyLicense, setSpecialtyLicense] = useState(
    initialData?.specialtyLicense || ""
  );
  const [cofeprisNoticeNumber, setCofeprisNoticeNumber] = useState(
    initialData?.cofeprisNoticeNumber || ""
  );
  const [scianCode, setScianCode] = useState(initialData?.scianCode || "621511");
  const [sanitaryLicenseNumber, setSanitaryLicenseNumber] = useState(
    initialData?.sanitaryLicenseNumber || ""
  );

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        responsibleFullName,
        professionalLicense,
        profession,
        specialtyLicense,
        cofeprisNoticeNumber,
        scianCode,
        sanitaryLicenseNumber,
      },
      file || undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Encabezado del Paso */}
      <div className="space-y-1 text-left">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Paso 2 de 5 • Regulación Sanitaria COFEPRIS (NOM-007-SSA3-2011)
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Responsable Sanitario y Aviso de Funcionamiento
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          En México, la operación de laboratorios clínicos está respaldada por un Responsable Sanitario con cédula profesional registrada.
        </p>
      </div>

      {/* Banner de Ayuda No Bloqueante */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left flex items-start gap-3 text-amber-900 dark:text-amber-300 text-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">¿No tienes estos documentos a la mano?</p>
          <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed text-[11px]">
            No te preocupes. Puedes pulsar <strong>"Omitir por ahora"</strong> al fondo y continuar configurando tus sucursales y catálogo. Podrás subir tu Aviso COFEPRIS en cualquier momento antes de activar la venta directa al público.
          </p>
        </div>
      </div>

      {/* Datos del Responsable Sanitario */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm text-left">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Responsable Sanitario Autorizado
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Nombre Completo del Responsable Sanitario
            </label>
            <Input
              value={responsibleFullName}
              onChange={(e) => setResponsibleFullName(e.target.value)}
              placeholder="Ej. Q.F.B. María Elena González Torres"
              className="h-11 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Cédula Profesional Federal *
            </label>
            <Input
              value={professionalLicense}
              onChange={(e) => setProfessionalLicense(e.target.value)}
              placeholder="Ej. 12345678"
              className="h-11 rounded-xl text-xs font-mono"
            />
            <p className="text-[10px] text-gray-400">Registrada ante la Dirección General de Profesiones (SEP).</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Profesión / Título de Grado
            </label>
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value as SanitaryProfession)}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROFESSIONS.map((p) => (
                <option key={p.value} value={p.value} className="bg-white dark:bg-[#111]">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Cédula de Especialidad (Opcional - Médicos Patólogos / Imagenólogos)
            </label>
            <Input
              value={specialtyLicense}
              onChange={(e) => setSpecialtyLicense(e.target.value)}
              placeholder="Ej. AEC-89201"
              className="h-11 rounded-xl text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Aviso de Funcionamiento COFEPRIS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm text-left">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Aviso de Funcionamiento ante COFEPRIS
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Número de Folio / Entrada COFEPRIS
            </label>
            <Input
              value={cofeprisNoticeNumber}
              onChange={(e) => setCofeprisNoticeNumber(e.target.value)}
              placeholder="Ej. 243300506X0123"
              className="h-11 rounded-xl text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Clave SCIAN de Actividad Económica
            </label>
            <Input
              value={scianCode}
              onChange={(e) => setScianCode(e.target.value)}
              placeholder="621511 (Laboratorios médicos privados)"
              className="h-11 rounded-xl text-xs font-mono bg-gray-50/50 dark:bg-gray-900/30"
            />
          </div>

          {/* Carga de Archivo Digital */}
          <div className="sm:col-span-2 pt-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
              Subir Acuse de Aviso de Funcionamiento (PDF o Imagen - Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-all cursor-pointer relative bg-gray-50/30 dark:bg-gray-950/20">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                  {file ? <FileCheck2 className="w-5 h-5 text-emerald-600" /> : <UploadCloud className="w-5 h-5" />}
                </div>
                {file ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{file.name}</p>
                    <p className="text-[10px] text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • Listo para guardar</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Haz clic para seleccionar o arrastra tu archivo aquí
                    </p>
                    <p className="text-[10px] text-gray-400">Formatos permitidos: PDF, JPG, PNG (Hasta 10 MB)</p>
                  </div>
                )}
              </div>
            </div>
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
