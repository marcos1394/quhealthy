"use client";

import React, { useState } from "react";
import {
  Building2,
  ArrowRight,
  FlaskConical,
  Scan,
  Syringe,
  Microscope,
  Truck,
  Check,
  Building,
  Clock,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LaboratoryType, SaveLaboratoryIdentityPayload } from "@/types/laboratory";
import { cn } from "@/lib/utils";

interface Step1IdentityProps {
  initialData?: Partial<SaveLaboratoryIdentityPayload>;
  onSave: (data: SaveLaboratoryIdentityPayload) => Promise<void>;
  onSkip: () => Promise<void>;
  isLoading?: boolean;
}

const LAB_TYPES: {
  value: LaboratoryType;
  title: string;
  description: string;
  icon: any;
}[] = [
  {
    value: "CLINICAL_ROUTINE",
    title: "Laboratorio Clínico General",
    description: "Química sanguínea, hematología, inmunología, hormonas y cultivos de rutina.",
    icon: FlaskConical,
  },
  {
    value: "IMAGING_DIAGNOSTICS",
    title: "Gabinete de Imagenología",
    description: "Rayos X, Ultrasonido, Mastografía, Resonancia Magnética y TAC.",
    icon: Scan,
  },
  {
    value: "SAMPLING_POINT",
    title: "Puesto de Toma de Muestras",
    description: "Flebotomía y recepción de muestras periférica con envío a laboratorio central.",
    icon: Syringe,
  },
  {
    value: "PATHOLOGY_CITOLOGY",
    title: "Patología & Citología",
    description: "Biopsias, Papanicolaou, estudios histopatológicos e inmunohistoquímica.",
    icon: Microscope,
  },
];

export const Step1Identity: React.FC<Step1IdentityProps> = ({
  initialData,
  onSave,
  onSkip,
  isLoading = false,
}) => {
  const [legalName, setLegalName] = useState(initialData?.legalName || "");
  const [brandName, setBrandName] = useState(initialData?.brandName || "");
  const [rfc, setRfc] = useState(initialData?.rfc || "");
  const [laboratoryType, setLaboratoryType] = useState<LaboratoryType>(
    initialData?.laboratoryType || "CLINICAL_ROUTINE"
  );
  const [website, setWebsite] = useState(initialData?.website || "");
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail || "");
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [allowsHomeSampling, setAllowsHomeSampling] = useState(
    initialData?.allowsHomeSampling || false
  );
  const [homeSamplingRadiusKm, setHomeSamplingRadiusKm] = useState(
    initialData?.homeSamplingRadiusKm || 15
  );
  const [homeSamplingFee, setHomeSamplingFee] = useState(
    initialData?.homeSamplingFee || 150
  );
  const [allowsCorporateCheckups, setAllowsCorporateCheckups] = useState(
    initialData?.allowsCorporateCheckups ?? true
  );
  const [allowsUrgentAnalysis, setAllowsUrgentAnalysis] = useState(
    initialData?.allowsUrgentAnalysis || false
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      legalName: legalName || brandName || "Laboratorio Clínico",
      brandName: brandName || legalName,
      rfc: rfc.trim().toUpperCase(),
      laboratoryType,
      website,
      contactEmail,
      contactPhone,
      description,
      allowsHomeSampling,
      homeSamplingRadiusKm: allowsHomeSampling ? Number(homeSamplingRadiusKm) : undefined,
      homeSamplingFee: allowsHomeSampling ? Number(homeSamplingFee) : undefined,
      allowsCorporateCheckups,
      allowsUrgentAnalysis,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Encabezado del Paso */}
      <div className="space-y-1 text-left">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Paso 1 de 5 • Identidad & Modelo de Servicio
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Cuéntanos sobre tu laboratorio o gabinete de diagnóstico
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Configura la identidad legal y las modalidades de atención a pacientes y empresas.
        </p>
      </div>

      {/* Selector de Tipo de Laboratorio */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
          Tipo de Establecimiento Sanitario
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LAB_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = laboratoryType === type.value;
            return (
              <div
                key={type.value}
                role="button"
                tabIndex={0}
                onClick={() => setLaboratoryType(type.value)}
                onKeyDown={(e) => e.key === "Enter" && setLaboratoryType(type.value)}
                className={cn(
                  "p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3.5",
                  isSelected
                    ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-500/60 dark:border-blue-800 shadow-sm"
                    : "bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm",
                    isSelected
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className={cn("text-xs font-bold leading-tight", isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>
                    {type.title}
                  </p>
                  <p className="text-[11px] text-gray-400 leading-snug">{type.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Datos Generales */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Datos Generales & Contacto
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Nombre Comercial de la Marca *
            </label>
            <Input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ej. Laboratorios Diagnostiq / Gabinete Santa María"
              className="h-11 rounded-xl text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Razón Social (SAT) *
            </label>
            <Input
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Ej. Análisis Clínicos Integrales S.A. de C.V."
              className="h-11 rounded-xl text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              RFC de la Empresa o Persona Física
            </label>
            <Input
              value={rfc}
              onChange={(e) => setRfc(e.target.value.toUpperCase())}
              placeholder="ACI200415XYZ"
              maxLength={13}
              className="h-11 rounded-xl text-xs font-mono uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Teléfono / WhatsApp de Atención a Pacientes
            </label>
            <Input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Ej. 55 1234 5678"
              className="h-11 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Correo Electrónico Oficial de Resultados
            </label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="resultados@laboratoriosantafe.com"
              className="h-11 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Breve Descripción de tu Laboratorio
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Menciona tus áreas de especialidad, certificaciones o convenios médicos..."
              className="rounded-xl text-xs resize-none"
            />
          </div>
        </div>
      </div>

      {/* Modalidades de Servicio */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Modalidades de Atención
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 dark:bg-[#121212] border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Toma de Muestra a Domicilio</p>
                <p className="text-[11px] text-gray-400">Servicio de flebotomía en casa u oficina del paciente.</p>
              </div>
            </div>
            <Switch
              checked={allowsHomeSampling}
              onCheckedChange={setAllowsHomeSampling}
            />
          </div>

          {allowsHomeSampling && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-blue-500/40">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                  Radio de cobertura desde la sucursal (km)
                </label>
                <Input
                  type="number"
                  value={homeSamplingRadiusKm}
                  onChange={(e) => setHomeSamplingRadiusKm(Number(e.target.value))}
                  className="h-10 rounded-xl text-xs"
                  min={1}
                  max={100}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                  Costo del servicio a domicilio (MXN)
                </label>
                <Input
                  type="number"
                  value={homeSamplingFee}
                  onChange={(e) => setHomeSamplingFee(Number(e.target.value))}
                  className="h-10 rounded-xl text-xs"
                  min={0}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 dark:bg-[#121212] border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Check-ups para Empresas & Jornadas</p>
                <p className="text-[11px] text-gray-400">Atención a nóminas, perfiles de ingreso y salud ocupacional.</p>
              </div>
            </div>
            <Switch
              checked={allowsCorporateCheckups}
              onCheckedChange={setAllowsCorporateCheckups}
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción No Bloqueantes */}
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
