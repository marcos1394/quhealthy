/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, UploadCloud, X, Loader2, CheckCircle2, FileText, Clock, AlertTriangle, BookOpen, ArrowLeft, Store, Sparkles, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLicenseOnboarding } from "@/hooks/useLicenseOnboarding";
import { useOnboardingChecklist } from "@/hooks/useOnboardingChecklist";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { handleApiError } from '@/lib/handleApiError';
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

  if (pageLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 transition-colors">
      <QhSpinner size="lg" label={t("loading")} />
    </div>
  );

  if (license?.verificationStatus === "APPROVED") {
    const IconComponent = config.icon;
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-medical-200 dark:border-medical-500/20 shadow-sm">
            <CardContent className="pt-10 pb-8 text-center space-y-6">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5 }} className="mx-auto bg-medical-50 dark:bg-medical-500/10 p-5 rounded-xl w-fit border border-medical-200 dark:border-medical-500/20">
                <CheckCircle2 className="w-16 h-16 text-medical-600 dark:text-medical-400" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-medium mb-2 text-slate-900 dark:text-white">{config.successTitle}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-light">{t("approved_desc")}</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-5 text-left border border-slate-200 dark:border-slate-700 space-y-3">
                <div><p className="text-xs text-slate-500 uppercase font-medium tracking-wider mb-1">{t("license_number")}</p><p className="text-slate-900 dark:text-white font-semibold text-lg">{license.extractedData?.licenseNumber || '—'}</p></div>
                {license.extractedData?.careerName && <div><p className="text-xs text-slate-500 uppercase font-medium tracking-wider mb-1">{t("specialty")}</p><p className="text-slate-900 dark:text-white font-medium">{license.extractedData.careerName}</p></div>}
              </div>
              <Button onClick={() => router.push("/onboarding")} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold h-12 shadow-none rounded-xl">
                <CheckCircle2 className="w-5 h-5 mr-2" />{t("continue_onboarding")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (license?.verificationStatus === "PENDING" || license?.verificationStatus === "PROCESSING") return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-10 pb-8 text-center space-y-6">
            <div className="mx-auto bg-amber-50 dark:bg-amber-500/10 p-5 rounded-xl w-fit border border-amber-200 dark:border-amber-500/20">
              <Clock className="w-14 h-14 text-amber-500 dark:text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-medium mb-2 text-slate-900 dark:text-white">{t("pending_title")}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-light">{config.isSalud ? t("pending_desc_health") : t("pending_desc_beauty")}</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/onboarding")} className="w-full border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-11 rounded-xl">
              {t("back_onboarding")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-8 transition-colors duration-300">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl relative z-10 space-y-5">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white pl-0 hover:bg-transparent" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />{t("back")}
          </Button>
          {!config.isSalud && (
            <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0">
              <Info className="w-3 h-3 mr-1" />{t("optional_step")}
            </Badge>
          )}
        </div>

        <AnimatePresence>
          {license?.verificationStatus === "REJECTED" && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-semibold text-base">{t("rejected_title")}</AlertTitle>
                <AlertDescription className="text-sm leading-relaxed mt-1">{license.rejectionReason || t("rejected_desc")}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="text-center pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="mx-auto p-4 rounded-xl w-fit mb-3 bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20">
              <IconComponent className="w-10 h-10 text-medical-600 dark:text-medical-400" />
            </div>
            <CardTitle className="text-2xl font-medium text-slate-900 dark:text-white mb-1">{config.title}</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 font-light max-w-sm mx-auto">{config.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6 p-6">
            <div className="space-y-3">
              <Label className="text-slate-700 dark:text-slate-300 font-medium text-sm">{t("file_label")}</Label>
              {preview ? (
                <div className="relative group h-72 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button variant="destructive" onClick={removeFile} className="shadow-lg rounded-xl"><X className="w-4 h-4 mr-2" />{t("change_image")}</Button>
                  </div>
                </div>
              ) : (
                <div onClick={() => inputRef.current?.click()} className="h-72 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group border-slate-300 dark:border-slate-700 hover:border-medical-500 dark:hover:border-medical-500 hover:bg-medical-50/50 dark:hover:bg-medical-500/5">
                  <div className="p-4 rounded-xl transition-colors mb-3 bg-slate-100 dark:bg-slate-800 group-hover:bg-medical-50 dark:group-hover:bg-medical-500/10">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white text-base">{t("click_upload")}</p>
                  <p className="text-xs text-slate-500 mt-1.5 font-light">{t("file_hint")}</p>
                </div>
              )}
              <input type="file" ref={inputRef} className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
            </div>

            <div className="border rounded-xl p-4 flex gap-3 text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <BookOpen className="w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400 mt-0.5" />
              <p className="leading-relaxed text-slate-600 dark:text-slate-400 font-light">{config.infoText}</p>
            </div>

            <div className="flex gap-3 pt-1">
              {!config.isSalud && (
                <Button variant="outline" className="flex-1 h-12 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl" onClick={handleSkip}>
                  {t("skip")}
                </Button>
              )}
              <Button className={cn("h-12 text-base font-semibold shadow-none rounded-xl", !config.isSalud ? "flex-1" : "w-full", "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100")} onClick={handleSubmit} disabled={isUploading || !file}>
                {isUploading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />{t("analyzing")}</> : <><FileText className="w-5 h-5 mr-2" />{config.buttonText}</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield className="w-3 h-3" /><span>{t("security_footer")}</span>
        </div>
      </motion.div>
    </div>
  );
}