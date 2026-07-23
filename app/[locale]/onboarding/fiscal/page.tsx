"use client";

/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/no-giant-component */

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UploadCloud,
  CheckCircle2,
  ArrowLeft,
  Building2,
  User,
  Landmark,
  Shield,
  AlertTriangle,
  KeyRound,
  FileKey,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFiscalOnboarding } from "@/hooks/useFiscalOnboarding";
import { onboardingService } from "@/services/onboarding.service";
import { useTranslations } from "next-intl";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function FiscalPage() {
  const router = useRouter();
  const t = useTranslations("OnboardingFiscal");
  const {
    taxCertificate,
    actaConstitutiva,
    csdCertificate,
    csdKey,
    personType,
    isLoading,
    isUploading,
    uploadDocument,
  } = useFiscalOnboarding();

  const csfInputRef = useRef<HTMLInputElement>(null);
  const actaInputRef = useRef<HTMLInputElement>(null);
  const csdCerInputRef = useRef<HTMLInputElement>(null);
  const csdKeyInputRef = useRef<HTMLInputElement>(null);

  const handleCsfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDocument(file, "TAX_CERTIFICATE");
  };

  const handleActaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDocument(file, "ACTA_CONSTITUTIVA");
  };

  const handleCsdCerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDocument(file, "CSD_CERTIFICATE");
  };

  const handleCsdKeyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDocument(file, "CSD_KEY");
  };

  const handleContinue = async () => {
    try {
      await onboardingService.finalizeOnboarding();
    } catch (error) {
      console.error("Error sincronizando estados finales", error);
    } finally {
      router.push("/onboarding");
    }
  };

  const allDone =
    taxCertificate?.verificationStatus === "APPROVED" &&
    csdCertificate?.verificationStatus === "APPROVED" &&
    csdKey?.verificationStatus === "APPROVED" &&
    (personType === "FISICA" ||
      actaConstitutiva?.verificationStatus === "APPROVED");

  // ── ESTADO: CARGANDO ───────────────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center gap-3 transition-colors font-sans">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400 animate-pulse">
          Sincronizando sistema y expediente fiscal...
        </p>
      </div>
    );

  // ── ESTADO: ÉXITO (TODOS LOS DOCUMENTOS VALIDADOS) ─────────────────────────
  if (allDone)
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex items-center justify-center p-6 transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
            
            {/* Success Banner */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
                <Check className="w-8 h-8" strokeWidth={2.5} />
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Validación Fiscal Completa</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight pt-2">
                  Expediente Fiscal Verificado
                </h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-md mx-auto leading-relaxed">
                  Tus documentos fiscales y certificados de sello digital (CSD) fueron aprobados con éxito.
                </p>
              </div>
            </div>

            {/* Extracted Fiscal Data */}
            {taxCertificate?.extractedData && (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Datos Fiscales Extraídos (SAT)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {taxCertificate.extractedData.rfc && (
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">RFC</span>
                      <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {taxCertificate.extractedData.rfc}
                      </p>
                    </div>
                  )}

                  {taxCertificate.extractedData.nombre_o_razon_social && (
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Razón Social</span>
                      <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                        {taxCertificate.extractedData.nombre_o_razon_social}
                      </p>
                    </div>
                  )}

                  {taxCertificate.extractedData.regimen_fiscal && (
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Régimen Fiscal</span>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 line-clamp-1">
                        {taxCertificate.extractedData.regimen_fiscal}
                      </p>
                    </div>
                  )}

                  {taxCertificate.extractedData.domicilio_fiscal && (
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Domicilio Fiscal</span>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 line-clamp-1">
                        {taxCertificate.extractedData.domicilio_fiscal}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Final Action Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleContinue}
                className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
              >
                <span>Completar Configuración</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    );

  // ── ESTADO PRINCIPAL: FORMULARIO DE CARGA DE DOCUMENTOS ───────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white pt-28 pb-20 px-6 md:px-12 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header / Nav */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("back", { defaultValue: "Volver" })}</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
            <Shield className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Entorno Cifrado CSD</span>
          </div>
        </div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              Configuración <span className="text-emerald-600 dark:text-emerald-400">Fiscal</span>
            </h1>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-sm text-xs font-bold text-gray-700 dark:text-gray-300 self-start sm:self-auto">
              {personType === "FISICA" ? (
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>{personType === "FISICA" ? "Persona Física" : "Persona Moral"}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            Proporciona tus archivos fiscales oficiales emitidos por el SAT para habilitar la facturación automatizada de tus consultas y validar tu identidad tributaria.
          </p>
        </motion.div>

        {/* CARDS DE DOCUMENTOS */}
        <div className="space-y-6">
          
          {/* 1. Constancia de Situación Fiscal (CSF) */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                <Landmark className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Constancia de Situación Fiscal (CSF)
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  Documento oficial emitido por el SAT en formato PDF o Imagen.
                </p>
              </div>
            </div>

            <div>
              {taxCertificate?.verificationStatus === "APPROVED" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      Constancia de Situación Fiscal Validada
                    </span>
                  </div>

                  {taxCertificate.extractedData?.rfc && (
                    <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-400 uppercase">RFC Registrado</span>
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {taxCertificate.extractedData.rfc}
                        </span>
                      </div>
                      {taxCertificate.extractedData.regimen_fiscal && (
                        <div className="flex justify-between items-center text-xs border-t border-gray-100 dark:border-gray-800 pt-2">
                          <span className="font-bold text-gray-400 uppercase">Régimen</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {taxCertificate.extractedData.regimen_fiscal}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : taxCertificate?.verificationStatus === "REJECTED" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Documento Rechazado
                    </p>
                    <p className="text-xs font-medium text-red-700 dark:text-red-300">
                      {taxCertificate.rejectionReason || "No pudimos validar tu constancia. Por favor reintenta con un archivo legible."}
                    </p>
                  </div>

                  <UploadZone
                    isUploading={isUploading}
                    inputRef={csfInputRef}
                    onChange={handleCsfUpload}
                    label="Subir nueva Constancia (PDF o Imagen)"
                  />
                </div>
              ) : (
                <UploadZone
                  isUploading={isUploading}
                  inputRef={csfInputRef}
                  onChange={handleCsfUpload}
                  label="Haz clic para seleccionar tu Constancia de Situación Fiscal"
                />
              )}
            </div>
          </div>

          {/* 2. Acta Constitutiva (Solo Persona Moral) */}
          {personType === "MORAL" && (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                  <Building2 className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Acta Constitutiva
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    Documento notarial requerido exclusivamente para personas morales.
                  </p>
                </div>
              </div>

              <div>
                {actaConstitutiva?.verificationStatus === "APPROVED" ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      Acta Constitutiva Validada
                    </span>
                  </div>
                ) : actaConstitutiva?.verificationStatus === "REJECTED" ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1">
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Documento Rechazado
                      </p>
                      <p className="text-xs font-medium text-red-700 dark:text-red-300">
                        {actaConstitutiva.rejectionReason || "Por favor sube un documento notarial legible."}
                      </p>
                    </div>

                    <UploadZone
                      isUploading={isUploading}
                      inputRef={actaInputRef}
                      onChange={handleActaUpload}
                      label="Subir Acta Constitutiva (PDF)"
                    />
                  </div>
                ) : (
                  <UploadZone
                    isUploading={isUploading}
                    inputRef={actaInputRef}
                    onChange={handleActaUpload}
                    label="Haz clic para seleccionar tu Acta Constitutiva"
                  />
                )}
              </div>
            </div>
          )}

          {/* 3. CSD - Certificado de Sello Digital (.cer) */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Certificado de Sello Digital (.cer)
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  Archivo público necesario para timbrar facturas electrónicas (CFDI).
                </p>
              </div>
            </div>

            <div>
              {csdCertificate?.verificationStatus === "APPROVED" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      Certificado CSD Validado
                    </span>
                  </div>

                  {csdCertificate.extractedData && (
                    <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-2 text-xs font-medium">
                      {csdCertificate.extractedData.serial_number && (
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-400 uppercase">No. Serie</span>
                          <span className="font-mono text-gray-900 dark:text-white">{csdCertificate.extractedData.serial_number}</span>
                        </div>
                      )}
                      {csdCertificate.extractedData.valid_to && (
                        <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-2">
                          <span className="font-bold text-gray-400 uppercase">Vigente Hasta</span>
                          <span className="text-gray-700 dark:text-gray-300">{csdCertificate.extractedData.valid_to}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : csdCertificate?.verificationStatus === "REJECTED" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Archivo Rechazado
                    </p>
                    <p className="text-xs font-medium text-red-700 dark:text-red-300">
                      {csdCertificate.rejectionReason || "Asegúrate de subir el archivo .cer correspondiente a tu CSD."}
                    </p>
                  </div>

                  <CsdUploadZone
                    isUploading={isUploading}
                    inputRef={csdCerInputRef}
                    onChange={handleCsdCerUpload}
                    accept=".cer"
                    label="Subir Certificado .cer"
                  />
                </div>
              ) : (
                <CsdUploadZone
                  isUploading={isUploading}
                  inputRef={csdCerInputRef}
                  onChange={handleCsdCerUpload}
                  accept=".cer"
                  label="Seleccionar archivo .cer"
                />
              )}
            </div>
          </div>

          {/* 4. CSD - Llave Privada (.key) */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                <KeyRound className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Llave Privada (.key)
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  Archivo de clave privada para la generación cifrada de sellos fiscales.
                </p>
              </div>
            </div>

            <div>
              {csdKey?.verificationStatus === "APPROVED" ? (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    Llave Privada Validada y Encriptada
                  </span>
                </div>
              ) : csdKey?.verificationStatus === "REJECTED" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Archivo Rechazado
                    </p>
                    <p className="text-xs font-medium text-red-700 dark:text-red-300">
                      {csdKey.rejectionReason || "Por favor verifica que la llave privada corresponda al certificado CSD."}
                    </p>
                  </div>

                  <CsdUploadZone
                    isUploading={isUploading}
                    inputRef={csdKeyInputRef}
                    onChange={handleCsdKeyUpload}
                    accept=".key"
                    label="Subir Llave Privada .key"
                  />
                </div>
              ) : (
                <CsdUploadZone
                  isUploading={isUploading}
                  inputRef={csdKeyInputRef}
                  onChange={handleCsdKeyUpload}
                  accept=".key"
                  label="Seleccionar archivo .key"
                />
              )}
            </div>
          </div>

          {/* Bóveda de Seguridad Informativa */}
          <div className="bg-gray-900 dark:bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <FileKey className="w-4 h-4" />
              <span>Bóveda Cifrada de Alta Seguridad</span>
            </div>
            <p className="text-xs font-medium text-gray-300 leading-relaxed">
              Tus llaves y certificados digitales se almacenan cifrados con algoritmos AES-256 en servidores protegidos. Solo se emplean para la generación automatizada de comprobantes fiscales (CFDI) a través del PAC autorizado.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

// ── COMPONENTES DE CARGA (DROPZONES) ─────────────────────────────────────────

function UploadZone({
  isUploading,
  inputRef,
  onChange,
  label,
}: {
  isUploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}) {
  return (
    <>
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        className={cn(
          "h-44 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all",
          isUploading
            ? "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] opacity-60 cursor-not-allowed"
            : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10"
        )}
      >
        {isUploading ? (
          <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400 mb-2" />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-3">
            <UploadCloud className="w-6 h-6" strokeWidth={2} />
          </div>
        )}

        <p className="text-xs font-bold text-gray-900 dark:text-white">
          {isUploading ? "Analizando y procesando documento..." : label}
        </p>
        <p className="text-[11px] font-medium text-gray-400 mt-1">
          Soporta formatos PDF, PNG o JPEG (Máximo 10MB)
        </p>
      </div>

      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept=".pdf,image/png,image/jpeg"
        onChange={onChange}
      />
    </>
  );
}

function CsdUploadZone({
  isUploading,
  inputRef,
  onChange,
  accept,
  label,
}: {
  isUploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept: string;
  label: string;
}) {
  return (
    <>
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        className={cn(
          "h-32 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all",
          isUploading
            ? "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] opacity-60 cursor-not-allowed"
            : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10"
        )}
      >
        {isUploading ? (
          <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400 mb-1" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-2">
            <UploadCloud className="w-5 h-5" strokeWidth={2} />
          </div>
        )}

        <p className="text-xs font-bold text-gray-900 dark:text-white">
          {isUploading ? "Validando CSD..." : label}
        </p>
        <p className="text-[10px] font-semibold font-mono text-gray-400 mt-0.5">
          {accept} • Archivo CSD Máx 2MB
        </p>
      </div>

      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={accept}
        onChange={onChange}
      />
    </>
  );
}