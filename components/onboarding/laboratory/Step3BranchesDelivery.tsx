"use client";

import React, { useState } from "react";
import {
  MapPin,
  ArrowRight,
  Clock,
  Phone,
  Building,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SaveLaboratoryBranchPayload } from "@/types/laboratory";

interface Step3BranchesDeliveryProps {
  initialData?: Partial<SaveLaboratoryBranchPayload>;
  onSave: (data: SaveLaboratoryBranchPayload) => Promise<void>;
  onSkip: () => Promise<void>;
  isLoading?: boolean;
}

export const Step3BranchesDelivery: React.FC<Step3BranchesDeliveryProps> = ({
  initialData,
  onSave,
  onSkip,
  isLoading = false,
}) => {
  const [branchName, setBranchName] = useState(
    initialData?.branchName || "Sede Principal Matriz"
  );
  const [street, setStreet] = useState(initialData?.street || "");
  const [exteriorNumber, setExteriorNumber] = useState(
    initialData?.exteriorNumber || ""
  );
  const [interiorNumber, setInteriorNumber] = useState(
    initialData?.interiorNumber || ""
  );
  const [neighborhood, setNeighborhood] = useState(
    initialData?.neighborhood || ""
  );
  const [city, setCity] = useState(initialData?.city || "Ciudad de México");
  const [state, setState] = useState(initialData?.state || "CDMX");
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [fastingHoursInfo, setFastingHoursInfo] = useState(
    initialData?.fastingHoursInfo || "Lunes a Sábado de 07:00 a 11:00 hrs (Toma en ayunas)"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      branchName: branchName || "Sede Principal Matriz",
      street,
      exteriorNumber,
      interiorNumber,
      neighborhood,
      city,
      state,
      postalCode,
      phone,
      fastingHoursInfo,
      isMainBranch: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Encabezado del Paso */}
      <div className="space-y-1 text-left">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Paso 3 de 5 • Sedes Físicas & Atención a Pacientes
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Ubicación de tu Sede Matriz o Centro de Flebotomía
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Esta dirección se mostrará en el mapa de QuHealthy para que los pacientes y médicos ubiquen tu sucursal.
        </p>
      </div>

      {/* Formulario de Ubicación */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm text-left">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Identificación de la Sucursal
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Nombre de la Sede o Sucursal *
            </label>
            <Input
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="Ej. Sede Matriz Insurgentes Sur"
              className="h-11 rounded-xl text-xs"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Calle o Avenida *
            </label>
            <Input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Ej. Av. Insurgentes Sur"
              className="h-11 rounded-xl text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Número Exterior *
            </label>
            <Input
              value={exteriorNumber}
              onChange={(e) => setExteriorNumber(e.target.value)}
              placeholder="1234"
              className="h-11 rounded-xl text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Número Interior / Piso
            </label>
            <Input
              value={interiorNumber}
              onChange={(e) => setInteriorNumber(e.target.value)}
              placeholder="Piso 2, Consultorio 204"
              className="h-11 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Colonia *
            </label>
            <Input
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Ej. Del Valle Sur"
              className="h-11 rounded-xl text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Código Postal *
            </label>
            <Input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="03100"
              maxLength={5}
              className="h-11 rounded-xl text-xs font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Municipio / Alcaldía *
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Benito Juárez"
              className="h-11 rounded-xl text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Estado *
            </label>
            <Input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Ciudad de México"
              className="h-11 rounded-xl text-xs"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Teléfono Directo de la Sucursal
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="55 9876 5432"
              className="h-11 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* Horarios de Toma y Ayuno */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm text-left">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Horarios de Toma en Ayunas
          </h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Indicaciones de Horario para el Paciente
          </label>
          <Input
            value={fastingHoursInfo}
            onChange={(e) => setFastingHoursInfo(e.target.value)}
            placeholder="Ej. Lunes a Viernes de 07:00 a 11:00 hrs | Sábados de 08:00 a 12:00 hrs"
            className="h-11 rounded-xl text-xs"
          />
          <p className="text-[10px] text-gray-400">
            Este horario orienta al paciente para acudir con el ayuno necesario (habitualmente de 8 a 12 horas).
          </p>
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
