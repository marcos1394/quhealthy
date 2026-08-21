"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState } from "react";
import { ShieldCheck, UploadCloud, FileText, CheckCircle2, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FoundationLegalTaxPayload, FoundationDocument } from "@/types/foundation";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface Step2LegalTaxProps {
  initialData?: Partial<FoundationLegalTaxPayload>;
  documents?: FoundationDocument[];
  onSave: (data: FoundationLegalTaxPayload) => Promise<void>;
  onUploadDoc: (docType: string, file: File) => Promise<void>;
  onDeleteDoc: (docId: number) => Promise<void>;
  onBack: () => void;
  onSkip?: () => void;
  isLoading?: boolean;
}

const REQUIRED_DOCS = [
  { type: "TAX_STATUS_CERTIFICATE", label: "Constancia de Situación Fiscal (SAT)", desc: "Emitida en los últimos 3 meses." },
  { type: "CONSTITUTIVE_ACT", label: "Acta Constitutiva Protocolizada", desc: "Primeras páginas y objeto social." },
  { type: "POWER_OF_ATTORNEY", label: "Poder Notarial del Representante", desc: "Documento que acredite facultades." },
  { type: "LEGAL_REP_ID", label: "Identificación Oficial del Representante (INE/Pasaporte)", desc: "Vigente por ambos lados." },
  { type: "PROOF_OF_ADDRESS", label: "Comprobante de Domicilio Institucional", desc: "Luz, agua o teléfono reciente." },
  { type: "DONATARY_AUTHORIZATION", label: "Oficio de Donataria Autorizada (Opcional)", desc: "Publicación en DOF o constancia SAT." },
];

export const Step2LegalTax: React.FC<Step2LegalTaxProps> = ({
  initialData,
  documents = [],
  onSave,
  onUploadDoc,
  onDeleteDoc,
  onBack,
  onSkip,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FoundationLegalTaxPayload>({
    rfc: initialData?.rfc || "",
    isAuthorizedDonatary: initialData?.isAuthorizedDonatary || false,
    cluniNumber: initialData?.cluniNumber || "",
    legalRepName: initialData?.legalRepName || "",
    legalRepCurp: initialData?.legalRepCurp || "",
  });

  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const handleFileChange = async (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingType(docType);
      await onUploadDoc(docType, file);
    } finally {
      setUploadingType(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const getDoc = (type: string) => documents.find((d) => d.documentType === type);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto font-sans">
      {/* ── CARD 1: DATOS FISCALES & REPRESENTACIÓN ─────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              1. Registro Fiscal & Representante Legal
            </h2>
            <p className="text-xs text-gray-500">Datos para facturación, deducción de donativos y verificación legal (opcional para explorar).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              RFC de Persona Moral
            </label>
            <Input
              placeholder="Ej. AAL041120XXX"
              value={formData.rfc}
              onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Número CLUNI (Indesol / Bienestar)
            </label>
            <Input
              placeholder="Ej. CLU-1234567890"
              value={formData.cluniNumber}
              onChange={(e) => setFormData({ ...formData, cluniNumber: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Nombre Completo del Representante Legal
            </label>
            <Input
              placeholder="Ej. Lic. Fernando Sánchez Ruiz"
              value={formData.legalRepName}
              onChange={(e) => setFormData({ ...formData, legalRepName: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              CURP del Representante Legal
            </label>
            <Input
              placeholder="Ej. SARF800512HDFRR02"
              value={formData.legalRepCurp}
              onChange={(e) => setFormData({ ...formData, legalRepCurp: e.target.value.toUpperCase() })}
              className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <label className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAuthorizedDonatary}
                onChange={(e) => setFormData({ ...formData, isAuthorizedDonatary: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
              />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  ¿La institución es Donataria Autorizada ante el SAT?
                </p>
                <p className="text-[11px] text-gray-500">
                  Habilita la emisión de recibos deducibles de impuestos (CFDI) para donantes.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ── CARD 2: DOCUMENTOS INSTITUCIONALES (KYB) ──────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                2. Expediente Institucional Digital (GCP Cloud Storage)
              </h2>
              <p className="text-xs text-gray-500">
                Puedes adjuntar tus archivos en PDF o JPG ahora, o subirlos más adelante desde tu panel institucional.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {REQUIRED_DOCS.map((docDef) => {
            const uploaded = getDoc(docDef.type);
            const isUploadingThis = uploadingType === docDef.type;

            return (
              <div
                key={docDef.type}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-gray-300 gap-3"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {docDef.label}
                    </h4>
                    {uploaded && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/40">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Cargado</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">{docDef.desc}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {uploaded ? (
                    <button
                      type="button"
                      onClick={() => onDeleteDoc(uploaded.id)}
                      className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  ) : (
                    <label className="h-9 px-4 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer transition-all shadow-xs">
                      {isUploadingThis ? (
                        <QhSpinner size="sm" className="text-emerald-600" />
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>Subir Archivo (PDF/JPG)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        disabled={isUploadingThis}
                        onChange={(e) => handleFileChange(docDef.type, e)}
                      />
                    </label>
                  )}
                </div>
              </div>
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
          <span>Volver a Identidad</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="h-12 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <span>Omitir por ahora</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
          >
            {isLoading ? (
              <QhSpinner size="sm" className="text-white" />
            ) : (
              <>
                <span>Continuar a Equipo Operativo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
