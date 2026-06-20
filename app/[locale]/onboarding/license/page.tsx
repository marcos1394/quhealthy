/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, UploadCloud, X, Loader2, CheckCircle2, FileText, Clock, AlertTriangle, BookOpen, ArrowLeft, Store, Sparkles, Shield, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLicenseOnboarding } from "@/hooks/useLicenseOnboarding";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function LicensePage() {
  const router = useRouter();
  const t = useTranslations("OnboardingLicense");
  const { license, sector, isLoading: pageLoading, isUploading, uploadLicense } = useLicenseOnboarding();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = {
    isSalud: sector === 'HEALTH',
    title: sector === 'HEALTH' ? t("health_title") : t("beauty_title"),
    icon: sector === 'HEALTH' ? GraduationCap : Store,
    description: sector === 'HEALTH' ? t("health_desc") : t("beauty_desc"),
    infoText: sector === 'HEALTH' ? t("health_info") : t("beauty_info"),
    buttonText: sector === 'HEALTH' ? t("health_button") : t("beauty_button"),
    successTitle: sector === 'HEALTH' ? t("health_success") : t("beauty_success"),
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > 10 * 1024 * 1024) return;
    if (!selectedFile.type.startsWith("image/")) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const removeFile = () => { setFile(null); setPreview(null); if (inputRef.current) inputRef.current.value = ""; };
  const handleSubmit = async () => { if (!file) return; await uploadLicense(file); };
  const handleSkip = () => { if (!config.isSalud) { toast.info(t("skip")); router.push("/onboarding"); } };

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------------------------
  if (pageLoading) return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 transition-colors">
      <QhSpinner size="lg" label="Validando Credenciales..." />
    </div>
  );

  // ---------------------------------------------------------------------------
  // APPROVED STATE (Architectural Grid)
  // ---------------------------------------------------------------------------
  if (license?.verificationStatus === "APPROVED") {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center pt-24 pb-12 px-6 md:pt-32 md:pb-24 md:px-12 transition-colors selection:bg-gray-200 dark:selection:bg-white/20">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl my-auto">
          <div className="border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
            <div className="p-10 md:p-16 text-center border-b border-gray-200 dark:border-gray-800">
              <div className="w-20 h-20 mx-auto border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black mb-8">
                <Check className="w-8 h-8 text-black dark:text-white" strokeWidth={2} />
              </div>
              <h2 className="text-3xl font-semibold mb-4 text-black dark:text-white tracking-tight">{config.successTitle}</h2>
              <p className="text-gray-500 dark:text-gray-400 font-light text-lg">{t("approved_desc")}</p>
            </div>
            
            <div className="p-8 md:p-12">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-6">Datos Extraídos (Validación Oficial)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6">
                  <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2">{t("license_number")}</p>
                  <p className="text-sm text-black dark:text-white font-mono">{license.extractedData?.licenseNumber || '—'}</p>
                </div>
                {license.extractedData?.careerName && (
                  <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6">
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2">{t("specialty")}</p>
                    <p className="text-xs text-black dark:text-white font-bold">{license.extractedData.careerName}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 md:p-12 border-t border-gray-200 dark:border-gray-800">
              <Button 
                onClick={() => router.push("/onboarding")} 
                className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-14 text-[10px] font-bold uppercase tracking-widest transition-colors border-0"
              >
                {t("continue_onboarding")} <ArrowLeft className="w-4 h-4 ml-3 rotate-180" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // PENDING / PROCESSING STATE
  // ---------------------------------------------------------------------------
  if (license?.verificationStatus === "PENDING" || license?.verificationStatus === "PROCESSING") return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center pt-24 pb-12 px-6 md:pt-32 md:pb-24 md:px-12 transition-colors selection:bg-gray-200 dark:selection:bg-white/20">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl my-auto">
        <div className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-10 md:p-16 text-center">
          <div className="w-20 h-20 mx-auto border border-blue-500 flex items-center justify-center bg-blue-50/10 mb-8">
            <Clock className="w-8 h-8 text-blue-500 animate-pulse" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white tracking-tight">{t("pending_title")}</h2>
          <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-10 max-w-sm mx-auto">
            {config.isSalud ? t("pending_desc_health") : t("pending_desc_beauty")}
          </p>
          <Button 
            variant="outline" 
            onClick={() => router.push("/onboarding")} 
            className="w-full rounded-none border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            {t("back_onboarding")}
          </Button>
        </div>
      </motion.div>
    </div>
  );

  const IconComponent = config.icon;

  // ---------------------------------------------------------------------------
  // MAIN UPLOAD FORM
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center pt-24 pb-12 px-6 md:pt-32 md:pb-24 md:px-12 transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl relative z-10 space-y-8 my-auto">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
          <Button variant="ghost" className="rounded-none hover:bg-gray-50 dark:hover:bg-gray-900 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500" onClick={() => router.back()}>
            <ArrowLeft className="mr-3 h-4 w-4" />{t("back")}
          </Button>
          {!config.isSalud && (
            <div className="border border-gray-300 dark:border-gray-700 px-3 py-1 bg-gray-50 dark:bg-[#050505]">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Info className="w-3 h-3" /> {t("optional_step")}
              </span>
            </div>
          )}
        </div>

        <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          
          {/* Form Header */}
          <div className="border-b border-gray-200 dark:border-gray-800 p-8 md:p-12 bg-gray-50 dark:bg-[#050505] text-center">
            <div className="w-16 h-16 mx-auto border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black mb-6">
              <IconComponent className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-semibold text-black dark:text-white tracking-tight mb-3">{config.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-light max-w-md mx-auto">{config.description}</p>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            
            {/* Rejection Alert (Margin Note) */}
            <AnimatePresence>
              {license?.verificationStatus === "REJECTED" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="border-l-2 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/10 mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {t("rejected_title")}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 font-light leading-relaxed">
                      {license.rejectionReason || t("rejected_desc")}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Section */}
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white block">{t("file_label")}</Label>
              
              {preview ? (
                <div className="relative group h-80 w-full border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#050505] p-2 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button onClick={removeFile} className="rounded-none bg-white text-black hover:bg-gray-200 h-12 px-6 text-[10px] font-bold uppercase tracking-widest">
                      <X className="w-4 h-4 mr-2" /> {t("change_image")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => inputRef.current?.click()} 
                  className="h-80 w-full border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white hover:bg-gray-100 dark:hover:bg-[#0a0a0a] flex flex-col items-center justify-center cursor-pointer transition-colors group"
                >
                  <div className="w-14 h-14 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-black mb-6 group-hover:border-black dark:group-hover:border-white transition-colors">
                    <UploadCloud className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-2">{t("click_upload")}</p>
                  <p className="text-[9px] uppercase tracking-widest text-gray-500 font-light">{t("file_hint")}</p>
                </div>
              )}
              <input type="file" ref={inputRef} className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
            </div>

            {/* Architectural Info Box */}
            <div className="border-l-2 border-black dark:border-white pl-5 py-2 bg-gray-50 dark:bg-[#050505]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-2">
                <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} /> Validación
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                {config.infoText}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
              {!config.isSalud && (
                <Button variant="outline" className="sm:flex-1 h-14 rounded-none border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] font-bold uppercase tracking-widest transition-colors" onClick={handleSkip}>
                  {t("skip")}
                </Button>
              )}
              <Button 
                className={cn("h-14 rounded-none text-[10px] font-bold uppercase tracking-widest transition-colors border-0", !config.isSalud ? "sm:flex-1" : "w-full", "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200")} 
                onClick={handleSubmit} 
                disabled={isUploading || !file}
              >
                {isUploading ? <><Loader2 className="w-4 h-4 animate-spin mr-3" />{t("analyzing")}</> : <><FileText className="w-4 h-4 mr-3" />{config.buttonText}</>}
              </Button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-3">
          <Shield className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{t("security_footer")}</span>
        </div>

      </motion.div>
    </div>
  );
}