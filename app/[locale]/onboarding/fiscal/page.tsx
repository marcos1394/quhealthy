"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, UploadCloud, X, Loader2, CheckCircle2, ArrowLeft, Building2, User, Landmark, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useFiscalOnboarding } from "@/hooks/useFiscalOnboarding";
import { useTranslations } from "next-intl";

export default function FiscalPage() {
    const router = useRouter();
    const t = useTranslations("OnboardingFiscal");
    const { fiscalData, personType, regimes, isLoading, isSaving, isUploading, saveFiscalInfo, uploadDocument } = useFiscalOnboarding();

    const [formData, setFormData] = useState({ rfc: "", legalName: "", fiscalRegime: "" });
    const [validationError, setValidationError] = useState("");
    const csfInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (fiscalData) {
            setFormData({
                rfc: fiscalData.rfc || "",
                legalName: fiscalData.legalName || "",
                fiscalRegime: fiscalData.fiscalRegime || ""
            });
        }
    }, [fiscalData]);

    const validateRFC = (rfc: string, pType: string) => {
        const rfcRegexFisica = /^([A-ZÑ&]{4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
        const rfcRegexMoral = /^([A-ZÑ&]{3}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
        if (pType === 'FISICA') return rfcRegexFisica.test(rfc);
        return rfcRegexMoral.test(rfc);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValidationError("");
        const { name, value } = e.target;
        // RFC siempre en mayúsculas
        const finalValue = name === 'rfc' ? value.toUpperCase() : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleRegimeChange = (value: string) => {
        setFormData(prev => ({ ...prev, fiscalRegime: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadDocument(file, 'TAX_CERTIFICATE');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateRFC(formData.rfc, personType)) {
            setValidationError(personType === 'FISICA' ? "RFC de persona física inválido (13 caracteres)." : "RFC de persona moral inválido (12 caracteres).");
            return;
        }

        const success = await saveFiscalInfo({
            personType: personType as any,
            rfc: formData.rfc,
            legalName: formData.legalName,
            fiscalRegime: formData.fiscalRegime
        });

        if (success) {
            router.push("/onboarding");
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 transition-colors">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="w-10 h-10 text-medical-600 dark:text-medical-400" />
            </motion.div>
            <p className="text-slate-500 dark:text-slate-400 animate-pulse font-light">Cargando datos fiscales...</p>
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
                        Paso final. Requerido para emitir comprobantes a tus pacientes y verificar tu identidad tributaria.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Upload Zone */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm sticky top-8">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5">
                                <CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">Constancia Fiscal</CardTitle>
                                <CardDescription className="font-light">Sube tu CSF (PDF o IMAGEN) para autocompletar.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div onClick={() => !isUploading && csfInputRef.current?.click()} className={cn("h-48 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group", isUploading ? "border-slate-300 opacity-70 cursor-not-allowed" : "border-slate-300 dark:border-slate-700 hover:border-medical-500 dark:hover:border-medical-500 hover:bg-medical-50/50 dark:hover:bg-medical-500/5")}>
                                    {isUploading ? (
                                        <Loader2 className="w-8 h-8 text-medical-600 animate-spin mb-3" />
                                    ) : (
                                        <div className="p-4 rounded-xl transition-colors mb-3 bg-slate-100 dark:bg-slate-800 group-hover:bg-medical-50 dark:group-hover:bg-medical-500/10">
                                            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors" />
                                        </div>
                                    )}
                                    <p className="text-slate-600 dark:text-slate-300 font-medium text-sm text-center px-4">
                                        {isUploading ? "Analizando documento..." : "Haz clic para subir"}
                                    </p>
                                </div>
                                <input type="file" ref={csfInputRef} className="hidden" accept=".pdf,image/png,image/jpeg" onChange={handleFileChange} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Zone */}
                    <div className="lg:col-span-3">
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">Tus Datos</CardTitle>
                                    <CardDescription className="font-light">Verifica que estén correctos.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 flex items-center gap-1.5 py-1">
                                        {personType === 'FISICA' ? <User className="w-3.5 h-3.5 text-medical-600" /> : <Building2 className="w-3.5 h-3.5 text-medical-600" />}
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{personType === 'FISICA' ? 'Física' : 'Moral'}</span>
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-5">
                                {validationError && (
                                    <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 p-3">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription className="text-sm font-medium ml-2">{validationError}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-medium">Nombre Completo o Razón Social</Label>
                                        <Input name="legalName" value={formData.legalName} onChange={handleChange} placeholder="Ej: Juan Pérez o Clínica S.A." className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 h-11" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-medium">RFC</Label>
                                            <Input name="rfc" value={formData.rfc} onChange={handleChange} maxLength={13} placeholder={personType === 'FISICA' ? "XXXX000000XXX (13)" : "XXX000000XXX (12)"} className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 h-11 uppercase" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-medium">Régimen Fiscal</Label>
                                        <Select value={formData.fiscalRegime} onValueChange={handleRegimeChange}>
                                            <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 h-11 w-full">
                                                <SelectValue placeholder="Selecciona tu régimen fiscal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {regimes.map(r => (
                                                    <SelectItem value={r.key} key={r.key}>{r.satCode} - {r.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button onClick={handleSubmit} disabled={isSaving || !formData.rfc || !formData.legalName || !formData.fiscalRegime} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold h-12 shadow-none rounded-xl mt-4">
                                    {isSaving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Guardando...</> : <><CheckCircle2 className="w-5 h-5 mr-2" />Completar y Guardar</>}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
