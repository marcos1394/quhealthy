"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState } from "react";
import { Building2, Globe, Mail, Phone, MapPin, Sparkles, ArrowRight, HeartPulse } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FoundationIdentityPayload, OrganizationType } from "@/types/foundation";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface Step1IdentityProps {
  initialData?: Partial<FoundationIdentityPayload>;
  onSave: (data: FoundationIdentityPayload) => Promise<void>;
  isLoading?: boolean;
}

const HEALTH_CAUSES = [
  { id: "RENAL_TRANSPLANT", label: "Salud Renal & Donación / Trasplante de Órganos", icon: "🫀" },
  { id: "VISUAL_HEALTH", label: "Salud Visual (Córneas, Cataratas, Estrabismo)", icon: "👁️" },
  { id: "ONCOLOGY", label: "Oncología Pediátrica y Adultos", icon: "🎗️" },
  { id: "CARDIOLOGY", label: "Cardiopatías y Salud Cardiovascular", icon: "❤️" },
  { id: "MATERNAL_CHILD", label: "Salud Materno-Infantil & Nutrición", icon: "👶" },
  { id: "MENTAL_HEALTH", label: "Salud Mental y Apoyo Psicosocial", icon: "🧠" },
  { id: "RARE_DISEASES", label: "Enfermedades Raras y Genéticas", icon: "🧬" },
  { id: "GENERAL_HEALTH", label: "Medicina General y Asistencia Comunitaria", icon: "🏥" },
];

export const Step1Identity: React.FC<Step1IdentityProps> = ({
  initialData,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FoundationIdentityPayload>({
    legalName: initialData?.legalName || "",
    brandName: initialData?.brandName || "",
    organizationType: initialData?.organizationType || "IAP",
    mission: initialData?.mission || "",
    vision: initialData?.vision || "",
    description: initialData?.description || "",
    websiteUrl: initialData?.websiteUrl || "",
    contactEmail: initialData?.contactEmail || "",
    contactPhone: initialData?.contactPhone || "",
    addressStreet: initialData?.addressStreet || "",
    addressNumber: initialData?.addressNumber || "",
    addressNeighborhood: initialData?.addressNeighborhood || "",
    addressCity: initialData?.addressCity || "",
    addressState: initialData?.addressState || "",
    addressPostalCode: initialData?.addressPostalCode || "",
    primaryCauses: initialData?.primaryCauses || ["RENAL_TRANSPLANT"],
  });

  const toggleCause = (causeId: string) => {
    setFormData((prev) => {
      const current = prev.primaryCauses || [];
      if (current.includes(causeId)) {
        return { ...prev, primaryCauses: current.filter((c) => c !== causeId) };
      } else {
        return { ...prev, primaryCauses: [...current, causeId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.legalName.trim()) return;
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto font-sans">
      {/* ── CARD 1: IDENTIDAD BÁSICA ─────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              1. Identidad Institucional & Razón Social
            </h2>
            <p className="text-xs text-gray-500">Datos públicos y figura jurídica de la organización.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Razón Social Oficial <span className="text-red-500">*</span>
            </label>
            <Input
              required
              placeholder="Ej. Asociación ALE, I.A.P. o Fundación Pro Salud A.C."
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Nombre Comercial o Público
            </label>
            <Input
              placeholder="Ej. Fundación ALE"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Tipo de Organización <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.organizationType}
              onValueChange={(val: OrganizationType) => setFormData({ ...formData, organizationType: val })}
            >
              <SelectTrigger className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="IAP">I.A.P. (Institución de Asistencia Privada)</SelectItem>
                <SelectItem value="AC">A.C. (Asociación Civil)</SelectItem>
                <SelectItem value="IBP">I.B.P. (Institución de Beneficencia Privada)</SelectItem>
                <SelectItem value="ABP">A.B.P. (Asociación de Beneficencia Privada)</SelectItem>
                <SelectItem value="FOUNDATION">Fundación / Patronato Independiente</SelectItem>
                <SelectItem value="OTHER">Otra Figura Social</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Misión Institucional
            </label>
            <Textarea
              rows={3}
              placeholder="Describe el propósito y la causa principal de la fundación..."
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 text-xs"
            />
          </div>
        </div>
      </div>

      {/* ── CARD 2: ÁREAS DE ENFOQUE SOCIAL & MÉDICO ─────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              2. Áreas de Enfoque en Salud
            </h2>
            <p className="text-xs text-gray-500">Selecciona las causas y programas médicos que atiende tu organización.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HEALTH_CAUSES.map((cause) => {
            const isSelected = (formData.primaryCauses || []).includes(cause.id);
            return (
              <div
                key={cause.id}
                role="button"
                tabIndex={0}
                onClick={() => toggleCause(cause.id)}
                onKeyDown={(e) => e.key === "Enter" && toggleCause(cause.id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#0a0a0a]"
                }`}
              >
                <span className="text-xl">{cause.icon}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white flex-1">{cause.label}</span>
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                  isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-gray-300"
                }`}>
                  {isSelected && <span className="text-[10px]">✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CARD 3: SEDE & CONTACTO ──────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              3. Sede Operativa & Contacto
            </h2>
            <p className="text-xs text-gray-500">Ubicación física para atención y medios de comunicación oficial.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Calle</label>
            <Input
              placeholder="Av. Paseo de las Palmas"
              value={formData.addressStreet}
              onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Número Ext / Int</label>
            <Input
              placeholder="735 Int. 402"
              value={formData.addressNumber}
              onChange={(e) => setFormData({ ...formData, addressNumber: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Colonia</label>
            <Input
              placeholder="Lomas de Chapultepec"
              value={formData.addressNeighborhood}
              onChange={(e) => setFormData({ ...formData, addressNeighborhood: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Ciudad / Municipio</label>
            <Input
              placeholder="Miguel Hidalgo / CDMX"
              value={formData.addressCity}
              onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Código Postal</label>
            <Input
              placeholder="11000"
              value={formData.addressPostalCode}
              onChange={(e) => setFormData({ ...formData, addressPostalCode: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Correo Electrónico Institucional</label>
            <Input
              type="email"
              placeholder="contacto@fundacion.org"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Teléfono de Atención</label>
            <Input
              placeholder="55 1234 5678"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Sitio Web Oficial</label>
            <Input
              placeholder="https://fundacionale.org"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* ── BOTÓN DE ACCIÓN ─────────────────────────────────────────── */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading || !formData.legalName.trim()}
          className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
        >
          {isLoading ? (
            <QhSpinner size="sm" className="text-white" />
          ) : (
            <>
              <span>Continuar a Validación Legal & Fiscal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
