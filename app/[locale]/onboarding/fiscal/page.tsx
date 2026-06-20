"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Loader2, CheckCircle2, ArrowLeft, Building2, User, Landmark, Shield, AlertTriangle, KeyRound, FileKey, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFiscalOnboarding } from "@/hooks/useFiscalOnboarding";
import { onboardingService } from "@/services/onboarding.service";
import { useTranslations } from "next-intl";
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function FiscalPage() {
    const router = useRouter();
    const t = useTranslations("OnboardingFiscal");
    const { taxCertificate, actaConstitutiva, csdCertificate, csdKey, personType, isLoading, isUploading, uploadDocument } = useFiscalOnboarding();

    const csfInputRef = useRef<HTMLInputElement>(null);
    const actaInputRef = useRef<HTMLInputElement>(null);
    const csdCerInputRef = useRef<HTMLInputElement>(null);
    const csdKeyInputRef = useRef<HTMLInputElement>(null);

    const handleCsfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadDocument(file, 'TAX_CERTIFICATE');
    };

    const handleActaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadDocument(file, 'ACTA_CONSTITUTIVA');
    };

    const handleCsdCerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadDocument(file, 'CSD_CERTIFICATE');
    };

    const handleCsdKeyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadDocument(file, 'CSD_KEY');
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
        taxCertificate?.verificationStatus === 'APPROVED' &&
        csdCertificate?.verificationStatus === 'APPROVED' &&
        csdKey?.verificationStatus === 'APPROVED' &&
        (personType === 'FISICA' || actaConstitutiva?.verificationStatus === 'APPROVED');

    // ---------------------------------------------------------------------------
    // LOADING STATE
    // ---------------------------------------------------------------------------
    if (isLoading) return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 transition-colors">
            <QhSpinner size="lg" label="Sincronizando Sistema Fiscal..." />
        </div>
    );

    // ---------------------------------------------------------------------------
    // SUCCESS (ALL DONE) STATE
    // ---------------------------------------------------------------------------
    if (allDone) return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-6 transition-colors selection:bg-gray-200 dark:selection:bg-white/20">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
                <div className="border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
                    <div className="p-10 md:p-16 text-center border-b border-gray-200 dark:border-gray-800">
                        <div className="w-20 h-20 mx-auto border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black mb-8">
                            <Check className="w-8 h-8 text-black dark:text-white" strokeWidth={2} />
                        </div>
                        <h2 className="text-3xl font-semibold mb-4 text-black dark:text-white tracking-tight">Expediente Fiscal Validado</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-light text-lg">Tus documentos fiscales y certificados CSD fueron aprobados correctamente.</p>
                    </div>

                    {/* Extracted Fiscal Data (Architectural Grid) */}
                    {taxCertificate?.extractedData && (
                        <div className="p-8 md:p-12">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-6">Datos Extraídos (SAT)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                                {taxCertificate.extractedData.rfc && (
                                    <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2">RFC</p>
                                        <p className="text-sm text-black dark:text-white font-mono">{taxCertificate.extractedData.rfc}</p>
                                    </div>
                                )}
                                {taxCertificate.extractedData.nombre_o_razon_social && (
                                    <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2">Razón Social</p>
                                        <p className="text-xs text-black dark:text-white font-bold">{taxCertificate.extractedData.nombre_o_razon_social}</p>
                                    </div>
                                )}
                                {taxCertificate.extractedData.regimen_fiscal && (
                                    <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2">Régimen Fiscal</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 font-light">{taxCertificate.extractedData.regimen_fiscal}</p>
                                    </div>
                                )}
                                {taxCertificate.extractedData.domicilio_fiscal && (
                                    <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2">Domicilio Fiscal</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 font-light">{taxCertificate.extractedData.domicilio_fiscal}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="p-8 md:p-12 border-t border-gray-200 dark:border-gray-800">
                        <Button 
                            onClick={handleContinue} 
                            className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-14 text-[10px] font-bold uppercase tracking-widest transition-colors border-0"
                        >
                            Completar Configuración <ArrowLeft className="w-4 h-4 ml-3 rotate-180" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );

    // ---------------------------------------------------------------------------
    // MAIN FISCAL ONBOARDING COMPONENT
    // ---------------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white pt-8 pb-24 px-6 md:px-12 transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
            <div className="max-w-4xl mx-auto relative z-10 space-y-12">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
                    <Button variant="ghost" className="rounded-none hover:bg-gray-50 dark:hover:bg-gray-900 px-4 text-[10px] font-bold uppercase tracking-widest" onClick={() => router.back()}>
                        <ArrowLeft className="mr-3 w-4 h-4" />{t("back") || "Atrás"}
                    </Button>
                    <div className="border border-black dark:border-white px-4 py-1.5 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Entorno Seguro</span>
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Datos Fiscales</h1>
                        <div className="border border-gray-200 dark:border-gray-800 px-4 py-2 bg-gray-50 dark:bg-[#050505] flex items-center gap-3">
                            {personType === 'FISICA' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                            <span className="text-[10px] font-bold uppercase tracking-widest">{personType === 'FISICA' ? 'Persona Física' : 'Persona Moral'}</span>
                        </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-2xl">
                        Sube tus documentos fiscales oficiales para habilitar la facturación y verificar tu identidad tributaria en la plataforma.
                    </p>
                </motion.div>

                <div className="space-y-8">
                    {/* Constancia Fiscal (CSF) */}
                    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                        <div className="border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
                                    <Landmark className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Constancia de Situación Fiscal</h3>
                                    <p className="text-[10px] text-gray-500 font-light mt-1">Archivo oficial emitido por el SAT (PDF o Imagen).</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 md:p-8">
                            {taxCertificate?.verificationStatus === 'APPROVED' ? (
                                <div className="space-y-6">
                                    <div className="border border-black dark:border-white p-4 flex items-center gap-4 bg-gray-50 dark:bg-[#050505]">
                                        <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Constancia fiscal validada</span>
                                    </div>
                                    {taxCertificate.extractedData?.rfc && (
                                        <div className="border-l-2 border-gray-200 dark:border-gray-800 pl-6 space-y-4 py-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">RFC</span>
                                                <span className="text-sm font-bold font-mono text-black dark:text-white">{taxCertificate.extractedData.rfc}</span>
                                            </div>
                                            {taxCertificate.extractedData.regimen_fiscal && (
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Régimen</span>
                                                    <span className="text-xs text-gray-600 dark:text-gray-300 font-light sm:text-right">{taxCertificate.extractedData.regimen_fiscal}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : taxCertificate?.verificationStatus === 'REJECTED' ? (
                                <div className="space-y-6">
                                    <div className="border-l-2 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/10">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-2 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Rechazado</p>
                                        <p className="text-xs text-red-700 dark:text-red-300 font-light">{taxCertificate.rejectionReason || "Documento rechazado, intenta de nuevo."}</p>
                                    </div>
                                    <UploadZone isUploading={isUploading} inputRef={csfInputRef} onChange={handleCsfUpload} label="Haz clic para subir CSF" />
                                </div>
                            ) : (
                                <UploadZone isUploading={isUploading} inputRef={csfInputRef} onChange={handleCsfUpload} label="Haz clic para subir CSF" />
                            )}
                        </div>
                    </div>

                    {/* Acta Constitutiva (Solo Persona Moral) */}
                    {personType === 'MORAL' && (
                        <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                            <div className="border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
                                        <Building2 className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Acta Constitutiva</h3>
                                        <p className="text-[10px] text-gray-500 font-light mt-1">Requerida exclusivamente para personas morales.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                {actaConstitutiva?.verificationStatus === 'APPROVED' ? (
                                    <div className="border border-black dark:border-white p-4 flex items-center gap-4 bg-gray-50 dark:bg-[#050505]">
                                        <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Acta constitutiva validada</span>
                                    </div>
                                ) : actaConstitutiva?.verificationStatus === 'REJECTED' ? (
                                    <div className="space-y-6">
                                        <div className="border-l-2 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/10">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-2 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Rechazado</p>
                                            <p className="text-xs text-red-700 dark:text-red-300 font-light">{actaConstitutiva.rejectionReason || "Documento rechazado, intenta de nuevo."}</p>
                                        </div>
                                        <UploadZone isUploading={isUploading} inputRef={actaInputRef} onChange={handleActaUpload} label="Haz clic para subir Acta" />
                                    </div>
                                ) : (
                                    <UploadZone isUploading={isUploading} inputRef={actaInputRef} onChange={handleActaUpload} label="Haz clic para subir Acta" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* CSD — Certificado de Sello Digital (.cer) */}
                    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                        <div className="border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#0a0a0a] shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Certificado de Sello Digital (.cer)</h3>
                                    <p className="text-[10px] text-gray-500 font-light mt-1">Archivo público para firmar facturas electrónicas (CFDI).</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 md:p-8">
                            {csdCertificate?.verificationStatus === 'APPROVED' ? (
                                <div className="space-y-6">
                                    <div className="border border-black dark:border-white p-4 flex items-center gap-4 bg-gray-50 dark:bg-[#050505]">
                                        <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Certificado CSD Validado</span>
                                    </div>
                                    {csdCertificate.extractedData && (
                                        <div className="border-l-2 border-gray-200 dark:border-gray-800 pl-6 space-y-4 py-2">
                                            {csdCertificate.extractedData.rfc && (
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">RFC</span>
                                                    <span className="text-sm font-bold font-mono text-black dark:text-white">{csdCertificate.extractedData.rfc}</span>
                                                </div>
                                            )}
                                            {csdCertificate.extractedData.serial_number && (
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">No. Serie</span>
                                                    <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">{csdCertificate.extractedData.serial_number}</span>
                                                </div>
                                            )}
                                            {csdCertificate.extractedData.valid_to && (
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Vigente hasta</span>
                                                    <span className="text-xs text-gray-600 dark:text-gray-300 font-light">{csdCertificate.extractedData.valid_to}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : csdCertificate?.verificationStatus === 'REJECTED' ? (
                                <div className="space-y-6">
                                    <div className="border-l-2 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/10">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-2 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Rechazado</p>
                                        <p className="text-xs text-red-700 dark:text-red-300 font-light">{csdCertificate.rejectionReason || "Archivo rechazado, intenta de nuevo."}</p>
                                    </div>
                                    <CsdUploadZone isUploading={isUploading} inputRef={csdCerInputRef} onChange={handleCsdCerUpload} accept=".cer" label="Subir archivo .cer" />
                                </div>
                            ) : (
                                <CsdUploadZone isUploading={isUploading} inputRef={csdCerInputRef} onChange={handleCsdCerUpload} accept=".cer" label="Subir archivo .cer" />
                            )}
                        </div>
                    </div>

                    {/* CSD — Llave Privada (.key) */}
                    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                        <div className="border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#0a0a0a] shrink-0">
                                    <KeyRound className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Llave Privada (.key)</h3>
                                    <p className="text-[10px] text-gray-500 font-light mt-1">Archivo de seguridad para la validación del sello digital.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 md:p-8">
                            {csdKey?.verificationStatus === 'APPROVED' ? (
                                <div className="border border-black dark:border-white p-4 flex items-center gap-4 bg-gray-50 dark:bg-[#050505]">
                                    <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Llave privada validada y encriptada</span>
                                </div>
                            ) : csdKey?.verificationStatus === 'REJECTED' ? (
                                <div className="space-y-6">
                                    <div className="border-l-2 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/10">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-2 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Rechazado</p>
                                        <p className="text-xs text-red-700 dark:text-red-300 font-light">{csdKey.rejectionReason || "Archivo rechazado, intenta de nuevo."}</p>
                                    </div>
                                    <CsdUploadZone isUploading={isUploading} inputRef={csdKeyInputRef} onChange={handleCsdKeyUpload} accept=".key" label="Subir archivo .key" />
                                </div>
                            ) : (
                                <CsdUploadZone isUploading={isUploading} inputRef={csdKeyInputRef} onChange={handleCsdKeyUpload} accept=".key" label="Subir archivo .key" />
                            )}
                        </div>
                    </div>

                    {/* Security Footer (Architectural Note) */}
                    <div className="border-l-2 border-black dark:border-white pl-6 py-4 bg-gray-50 dark:bg-[#050505]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-2 flex items-center gap-2">
                            <FileKey className="w-4 h-4" strokeWidth={1.5} /> Archivos CSD Seguros
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-3xl">
                            Tu llave privada (.key) y certificado (.cer) se almacenan de forma cifrada en bóvedas de alta seguridad y solo serán utilizados para la emisión automatizada de facturas CFDI a través del PAC contratado.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// ARCHITECTURAL DROPZONES
// ---------------------------------------------------------------------------

function UploadZone({ isUploading, inputRef, onChange, label }: {
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
                    "h-48 w-full border border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors group",
                    isUploading
                        ? "border-gray-300 dark:border-gray-700 opacity-70 cursor-not-allowed bg-gray-50 dark:bg-[#050505]"
                        : "border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white hover:bg-gray-100 dark:hover:bg-[#0a0a0a]"
                )}
            >
                {isUploading ? (
                    <QhSpinner size="md" />
                ) : (
                    <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-black mb-4 group-hover:border-black dark:group-hover:border-white transition-colors">
                        <UploadCloud className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                    </div>
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white text-center">
                    {isUploading ? "Analizando archivo..." : label}
                </p>
            </div>
            <input type="file" ref={inputRef} className="hidden" accept=".pdf,image/png,image/jpeg" onChange={onChange} />
        </>
    );
}

function CsdUploadZone({ isUploading, inputRef, onChange, accept, label }: {
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
                    "h-32 w-full border border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors group",
                    isUploading
                        ? "border-gray-300 dark:border-gray-700 opacity-70 cursor-not-allowed bg-gray-50 dark:bg-[#050505]"
                        : "border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white hover:bg-gray-100 dark:hover:bg-[#0a0a0a]"
                )}
            >
                {isUploading ? (
                    <QhSpinner size="sm" />
                ) : (
                    <div className="w-10 h-10 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-black mb-3 group-hover:border-black dark:group-hover:border-white transition-colors">
                        <UploadCloud className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                    </div>
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white text-center">
                    {isUploading ? "Validando archivo..." : label}
                </p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-light mt-1.5">{accept} • Máx 1MB</p>
            </div>
            <input type="file" ref={inputRef} className="hidden" accept={accept} onChange={onChange} />
        </>
    );
}