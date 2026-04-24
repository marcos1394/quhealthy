"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadCloud, Loader2, CheckCircle2, ArrowLeft, Building2, User, Landmark, Shield, AlertTriangle, KeyRound, FileKey, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
            // Self-healing: Forzamos la sincronización final
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

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 transition-colors">
            <QhSpinner size="lg" label="Cargando datos fiscales..." />
        </div>
    );

    if (allDone) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-medical-200 dark:border-medical-500/20 shadow-sm">
                    <CardContent className="pt-10 pb-8 text-center space-y-6">
                        <div className="mx-auto bg-medical-50 dark:bg-medical-500/10 p-5 rounded-xl w-fit border border-medical-200 dark:border-medical-500/20">
                            <CheckCircle2 className="w-16 h-16 text-medical-600 dark:text-medical-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-medium mb-2 text-slate-900 dark:text-white">Datos fiscales verificados</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-light">Tus documentos fiscales fueron aprobados correctamente.</p>
                        </div>

                        {/* Extracted Fiscal Data */}
                        {taxCertificate?.extractedData && (
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-5 text-left border border-slate-200 dark:border-slate-700 space-y-3">
                                {taxCertificate.extractedData.rfc && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium tracking-wider mb-1">RFC</p>
                                        <p className="text-slate-900 dark:text-white font-semibold text-lg">{taxCertificate.extractedData.rfc}</p>
                                    </div>
                                )}
                                {taxCertificate.extractedData.nombre_o_razon_social && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium tracking-wider mb-1">Nombre / Razón Social</p>
                                        <p className="text-slate-900 dark:text-white font-medium">{taxCertificate.extractedData.nombre_o_razon_social}</p>
                                    </div>
                                )}
                                {taxCertificate.extractedData.regimen_fiscal && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium tracking-wider mb-1">Régimen Fiscal</p>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm font-light">{taxCertificate.extractedData.regimen_fiscal}</p>
                                    </div>
                                )}
                                {taxCertificate.extractedData.domicilio_fiscal && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium tracking-wider mb-1">Domicilio Fiscal</p>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm font-light">{taxCertificate.extractedData.domicilio_fiscal}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <Button onClick={handleContinue} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold h-12 shadow-none rounded-xl">
                            <CheckCircle2 className="w-5 h-5 mr-2" />Continuar Onboarding
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-3xl w-full mx-auto relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-3" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 w-4 h-4" />{t("back") || "Volver"}
                    </Button>
                    <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0 px-3 py-1.5">
                        <Shield className="w-3 h-3 mr-1.5" />Seguro
                    </Badge>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-full px-5 py-2">
                        <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Datos Fiscales y Facturación</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white tracking-tight">Información Fiscal</h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Sube tus documentos fiscales para verificar tu identidad tributaria.
                    </p>
                </motion.div>

                <div className="flex items-center gap-2 justify-center">
                    <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 flex items-center gap-1.5 py-1">
                        {personType === 'FISICA' ? <User className="w-3.5 h-3.5 text-medical-600" /> : <Building2 className="w-3.5 h-3.5 text-medical-600" />}
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{personType === 'FISICA' ? 'Persona Física' : 'Persona Moral'}</span>
                    </Badge>
                </div>

                {/* Constancia Fiscal */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5">
                        <CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">Constancia de Situación Fiscal</CardTitle>
                        <CardDescription className="font-light">Sube tu CSF del SAT (PDF o Imagen).</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {taxCertificate?.verificationStatus === 'APPROVED' ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">Constancia fiscal verificada</span>
                                </div>
                                {taxCertificate.extractedData?.rfc && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">RFC</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{taxCertificate.extractedData.rfc}</span>
                                        </div>
                                        {taxCertificate.extractedData.regimen_fiscal && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">Régimen</span>
                                                <span className="text-xs text-slate-600 dark:text-slate-400 font-light text-right max-w-[60%]">{taxCertificate.extractedData.regimen_fiscal}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : taxCertificate?.verificationStatus === 'REJECTED' ? (
                            <div className="space-y-4">
                                <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 p-3">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-sm font-medium ml-2">{taxCertificate.rejectionReason || "Documento rechazado, intenta de nuevo."}</AlertDescription>
                                </Alert>
                                <UploadZone isUploading={isUploading} inputRef={csfInputRef} onChange={handleCsfUpload} />
                            </div>
                        ) : (
                            <UploadZone isUploading={isUploading} inputRef={csfInputRef} onChange={handleCsfUpload} />
                        )}
                    </CardContent>
                </Card>

                {/* Acta Constitutiva (solo Persona Moral) */}
                {personType === 'MORAL' && (
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5">
                            <CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">Acta Constitutiva</CardTitle>
                            <CardDescription className="font-light">Requerida para personas morales.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {actaConstitutiva?.verificationStatus === 'APPROVED' ? (
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">Acta constitutiva verificada</span>
                                </div>
                            ) : actaConstitutiva?.verificationStatus === 'REJECTED' ? (
                                <div className="space-y-4">
                                    <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 p-3">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription className="text-sm font-medium ml-2">{actaConstitutiva.rejectionReason || "Documento rechazado, intenta de nuevo."}</AlertDescription>
                                    </Alert>
                                    <UploadZone isUploading={isUploading} inputRef={actaInputRef} onChange={handleActaUpload} />
                                </div>
                            ) : (
                                <UploadZone isUploading={isUploading} inputRef={actaInputRef} onChange={handleActaUpload} />
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* CSD — Certificado de Sello Digital (.cer) */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">Certificado de Sello Digital (.cer)</CardTitle>
                                <CardDescription className="font-light">Archivo .cer emitido por el SAT para firmar facturas electrónicas (CFDI).</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-3">
                        {csdCertificate?.verificationStatus === 'APPROVED' ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">Certificado CSD verificado</span>
                                </div>
                                {csdCertificate.extractedData && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                                        {csdCertificate.extractedData.rfc && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">RFC</span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{csdCertificate.extractedData.rfc}</span>
                                            </div>
                                        )}
                                        {csdCertificate.extractedData.serial_number && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">No. Serie</span>
                                                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">{csdCertificate.extractedData.serial_number}</span>
                                            </div>
                                        )}
                                        {csdCertificate.extractedData.valid_to && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">Vigente hasta</span>
                                                <span className="text-xs text-slate-600 dark:text-slate-400">{csdCertificate.extractedData.valid_to}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : csdCertificate?.verificationStatus === 'REJECTED' ? (
                            <div className="space-y-4">
                                <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 p-3">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-sm font-medium ml-2">{csdCertificate.rejectionReason || "Archivo rechazado, intenta de nuevo."}</AlertDescription>
                                </Alert>
                                <CsdUploadZone isUploading={isUploading} inputRef={csdCerInputRef} onChange={handleCsdCerUpload} accept=".cer" label="Selecciona tu archivo .cer" />
                            </div>
                        ) : (
                            <CsdUploadZone isUploading={isUploading} inputRef={csdCerInputRef} onChange={handleCsdCerUpload} accept=".cer" label="Selecciona tu archivo .cer" />
                        )}
                    </CardContent>
                </Card>

                {/* CSD — Llave Privada (.key) */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                                <KeyRound className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">Llave Privada (.key)</CardTitle>
                                <CardDescription className="font-light">Archivo .key del SAT. Se almacena de forma segura y cifrada.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-3">
                        {csdKey?.verificationStatus === 'APPROVED' ? (
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-700 dark:text-emerald-300 font-medium">Llave privada recibida</span>
                            </div>
                        ) : csdKey?.verificationStatus === 'REJECTED' ? (
                            <div className="space-y-4">
                                <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 p-3">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-sm font-medium ml-2">{csdKey.rejectionReason || "Archivo rechazado, intenta de nuevo."}</AlertDescription>
                                </Alert>
                                <CsdUploadZone isUploading={isUploading} inputRef={csdKeyInputRef} onChange={handleCsdKeyUpload} accept=".key" label="Selecciona tu archivo .key" />
                            </div>
                        ) : (
                            <CsdUploadZone isUploading={isUploading} inputRef={csdKeyInputRef} onChange={handleCsdKeyUpload} accept=".key" label="Selecciona tu archivo .key" />
                        )}
                    </CardContent>
                </Card>

                {/* Security Footer */}
                <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-start gap-3">
                    <FileKey className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                        <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Archivos CSD seguros</p>
                        <p>Tu llave privada (.key) y certificado (.cer) se almacenan de forma cifrada y solo serán utilizados para la emisión automatizada de facturas CFDI a través del PAC contratado.</p>
                    </div>
                </div>

                <Button onClick={() => router.push("/onboarding")} variant="outline" className="w-full border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-11 rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-2" />Volver al Onboarding
                </Button>
            </div>
        </div>
    );
}

/** Componente reutilizable para zona de carga */
function UploadZone({ isUploading, inputRef, onChange }: {
    isUploading: boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <>
            <div
                onClick={() => !isUploading && inputRef.current?.click()}
                className={cn(
                    "h-48 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group",
                    isUploading
                        ? "border-slate-300 opacity-70 cursor-not-allowed"
                        : "border-slate-300 dark:border-slate-700 hover:border-medical-500 dark:hover:border-medical-500 hover:bg-medical-50/50 dark:hover:bg-medical-500/5"
                )}
            >
                {isUploading ? (
                    <QhSpinner size="md" />
                ) : (
                    <div className="p-4 rounded-xl transition-colors mb-3 bg-slate-100 dark:bg-slate-800 group-hover:bg-medical-50 dark:group-hover:bg-medical-500/10">
                        <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors" />
                    </div>
                )}
                <p className="text-slate-600 dark:text-slate-300 font-medium text-sm text-center px-4">
                    {isUploading ? "Analizando documento..." : "Haz clic para subir"}
                </p>
            </div>
            <input type="file" ref={inputRef} className="hidden" accept=".pdf,image/png,image/jpeg" onChange={onChange} />
        </>
    );
}

/** Componente reutilizable para zona de carga de archivos CSD (.cer/.key) */
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
                    "h-32 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group",
                    isUploading
                        ? "border-slate-300 opacity-70 cursor-not-allowed"
                        : "border-slate-300 dark:border-slate-700 hover:border-medical-500 dark:hover:border-medical-500 hover:bg-medical-50/50 dark:hover:bg-medical-500/5"
                )}
            >
                {isUploading ? (
                    <QhSpinner size="sm" />
                ) : (
                    <div className="p-3 rounded-xl transition-colors mb-2 bg-slate-100 dark:bg-slate-800 group-hover:bg-medical-50 dark:group-hover:bg-medical-500/10">
                        <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors" />
                    </div>
                )}
                <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                    {isUploading ? "Validando archivo..." : label}
                </p>
                <p className="text-xs text-slate-400 mt-1">{accept} • Máx 1MB</p>
            </div>
            <input type="file" ref={inputRef} className="hidden" accept={accept} onChange={onChange} />
        </>
    );
}
