"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, UploadCloud, X, Loader2, CheckCircle2, ScanFace, Camera, ArrowLeft, AlertCircle, FileCheck, Sparkles, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useKycOnboarding } from "@/hooks/useKycOnboarding";
import { KycDocumentType, KycVerificationStatus } from "@/types/onboarding";
import { useTranslations } from "next-intl";
import { handleApiError } from '@/lib/handleApiError';
import { QhSpinner } from '@/components/ui/QhSpinner';

type UiDocType = "ine" | "passport" | "acta";

export default function KycPage() {
  const router = useRouter();
  const t = useTranslations("OnboardingKyc");
  const { documents, uploadingState, uploadDocument, isKycComplete, isLoading: isInitialLoading, personType } = useKycOnboarding();

  const [activeTab, setActiveTab] = useState<UiDocType>("ine");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeCaptureType, setActiveCaptureType] = useState<KycDocumentType | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ineFrontInput = useRef<HTMLInputElement>(null);
  const ineBackInput = useRef<HTMLInputElement>(null);
  const passportInput = useRef<HTMLInputElement>(null);
  const selfieInput = useRef<HTMLInputElement>(null);
  const actaInput = useRef<HTMLInputElement>(null);

  const startCamera = async (docType: KycDocumentType) => {
    setActiveCaptureType(docType); setIsCameraOpen(true);
    try {
      const isSelfie = docType === "SELFIE";
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: isSelfie ? "user" : "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } });
      streamRef.current = mediaStream;
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (e) { handleApiError(e); setIsCameraOpen(false); }
  };

  const stopCamera = () => { if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; } setIsCameraOpen(false); setActiveCaptureType(null); };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !activeCaptureType) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (ctx) {
      if (activeCaptureType === "SELFIE") { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
      ctx.drawImage(v, 0, 0, c.width, c.height);
      c.toBlob(blob => { if (blob) { const f = new File([blob], `${activeCaptureType}_capture.jpg`, { type: "image/jpeg" }); handleUpload(f, activeCaptureType); stopCamera(); } }, "image/jpeg", 0.9);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: KycDocumentType) => { const f = e.target.files?.[0]; if (f) handleUpload(f, type); };
  const handleUpload = async (file: File, type: KycDocumentType) => { if (file.size > 10 * 1024 * 1024) { toast.warning("Max 10MB."); return; } await uploadDocument(file, type); };

  const getStatusBadge = (status?: KycVerificationStatus) => {
    switch (status) {
      case "APPROVED": return <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0 font-medium"><CheckCircle2 className="w-3 h-3 mr-1" />{t("approved")}</Badge>;
      case "REJECTED": return <Badge className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-0 font-medium"><AlertCircle className="w-3 h-3 mr-1" />{t("rejected")}</Badge>;
      case "PROCESSING": return <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0 font-medium animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin" />{t("verifying")}</Badge>;
      default: return <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 font-medium">{t("pending")}</Badge>;
    }
  };

  const UploadZone = ({ type, label, description, inputRef }: { type: KycDocumentType; label: string; description?: string; inputRef: React.RefObject<HTMLInputElement | null> }) => {
    const docData = documents[type];
    const isUp = uploadingState[type];
    const isApproved = docData?.verificationStatus === "APPROVED";
    const isRejected = docData?.verificationStatus === "REJECTED";
    const isProcessing = docData?.verificationStatus === "PROCESSING";

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={cn("relative group rounded-xl border transition-all p-4 flex flex-col gap-3",
          isApproved ? "border-medical-200 dark:border-medical-500/20 bg-medical-50/30 dark:bg-medical-500/5" : "",
          isRejected ? "border-red-200 dark:border-red-500/20 bg-red-50/30 dark:bg-red-500/5" : "",
          isProcessing ? "border-blue-200 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5 animate-pulse" : "",
          !isApproved && !isRejected && !isProcessing ? "border-dashed border-slate-300 dark:border-slate-700 hover:border-medical-500 dark:hover:border-medical-500 hover:bg-medical-50/30 dark:hover:bg-medical-500/5" : ""
        )}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Label className={cn("font-medium text-sm block mb-0.5", isApproved ? "text-medical-600 dark:text-medical-400" : "", isRejected ? "text-red-600 dark:text-red-400" : "", !isApproved && !isRejected ? "text-slate-700 dark:text-slate-300" : "")}>{label}</Label>
            {description && <p className="text-xs text-slate-500 dark:text-slate-400 font-light">{description}</p>}
          </div>
          {getStatusBadge(docData?.verificationStatus)}
        </div>
        <AnimatePresence>
          {isRejected && docData?.rejectionReason && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-500/20 flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div><p className="text-xs font-medium text-red-700 dark:text-red-400 mb-0.5">{t("rejection_reason")}</p><p className="text-xs text-red-600/80 dark:text-red-300/80 font-light">{docData.rejectionReason}</p></div>
            </motion.div>
          )}
        </AnimatePresence>
        {docData?.fileUrl ? (
          <div className="relative h-40 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group/preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={docData.fileUrl} alt="Preview" className="w-full h-full object-contain" />
            {!isApproved && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center p-3 opacity-0 group-hover/preview:opacity-100 transition-all duration-300">
                <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-lg text-xs"><UploadCloud className="w-3 h-3 mr-1" />{t("change_image")}</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2 h-32">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => !isUp && inputRef.current?.click()}
              className="flex-1 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-medical-50/50 dark:hover:bg-medical-500/5 hover:border-medical-500 dark:hover:border-medical-500 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group/upload">
              {isUp ? <><Loader2 className="w-6 h-6 animate-spin text-medical-600 dark:text-medical-400" /><span className="text-xs text-medical-600 dark:text-medical-400 font-medium">{t("uploading")}</span></> :
                <><UploadCloud className="w-6 h-6 text-slate-400 group-hover/upload:text-medical-600 dark:group-hover/upload:text-medical-400 transition-colors" /><div className="text-center"><span className="text-xs text-slate-600 dark:text-slate-300 font-medium block">{t("upload_image")}</span><span className="text-[10px] text-slate-500 font-light">{t("file_hint")}</span></div></>}
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => !isUp && startCamera(type)}
              className="w-28 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-500/5 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group/camera">
              <Camera className="w-6 h-6 text-slate-400 group-hover/camera:text-blue-600 dark:group-hover/camera:text-blue-400 transition-colors" />
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{t("camera")}</span>
            </motion.div>
          </div>
        )}
        <input type="file" ref={inputRef} className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={e => handleFileChange(e, type)} />
      </motion.div>
    );
  };

  const handleFinishStep = () => { if (isKycComplete()) { toast.success(t("success_toast")); router.push("/onboarding"); router.refresh(); } else toast.warn(t("pending_toast")); };

  const calculateProgress = () => {
    let completed = 0;
    let total = personType === 'MORAL' ? 3 : 2;
    const isIdApproved = (documents["INE_FRONT"]?.verificationStatus === "APPROVED" && documents["INE_BACK"]?.verificationStatus === "APPROVED") || documents["PASSPORT"]?.verificationStatus === "APPROVED";
    if (isIdApproved) completed++;
    if (documents["SELFIE"]?.verificationStatus === "APPROVED") completed++;
    if (personType === 'MORAL' && documents["ACTA_CONSTITUTIVA"]?.verificationStatus === "APPROVED") completed++;
    return (completed / total) * 100;
  };

  if (isInitialLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 transition-colors">
      <QhSpinner size="lg" label={t("loading")} />
    </div>
  );

  const isIdentityApproved = (documents["INE_FRONT"]?.verificationStatus === "APPROVED" && documents["INE_BACK"]?.verificationStatus === "APPROVED") || documents["PASSPORT"]?.verificationStatus === "APPROVED";
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 md:p-8 transition-colors duration-300">
      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-2xl aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-slate-800">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className={cn("border-4 border-white/60", activeCaptureType === "SELFIE" ? "w-64 h-80 rounded-full" : "w-96 h-60 rounded-2xl")} />
                <div className="mt-5 bg-black/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20">
                  <p className="text-white text-sm font-medium flex items-center gap-2"><Info className="w-4 h-4" />{activeCaptureType === "SELFIE" ? t("camera_selfie_hint") : t("camera_doc_hint")}</p>
                </div>
              </div>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6">
                <Button variant="ghost" size="lg" onClick={stopCamera} className="rounded-full w-12 h-12 bg-slate-800/80 backdrop-blur-sm text-white hover:bg-slate-700 border border-slate-700"><X className="w-5 h-5" /></Button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={capturePhoto} className="w-18 h-18 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm flex items-center justify-center"><div className="w-14 h-14 rounded-full bg-white" /></motion.button>
                <div className="w-12" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-3" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 w-4 h-4" />{t("back")}
          </Button>
          <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0 px-3 py-1.5">
            <Sparkles className="w-3 h-3 mr-1.5" />{t("badge")}
          </Badge>
        </div>

        {/* Title & Progress */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-full px-5 py-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{t("ai_badge")}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white tracking-tight">{t("title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">{t("desc")}</p>
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500 font-light">{t("progress")}</span><span className="font-medium text-medical-600 dark:text-medical-400">{Math.round(progress)}%</span></div>
            <Progress value={progress} className="h-2 bg-slate-200 dark:bg-slate-800" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Documents */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl"><ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                    <div><CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">{t("id_title")}</CardTitle><CardDescription className="mt-0.5 font-light">{t("id_desc")}</CardDescription></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  <Tabs value={activeTab} onValueChange={v => setActiveTab(v as UiDocType)} className="w-full">
                    <TabsList className={cn("grid w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-11 p-1 rounded-lg", personType === 'MORAL' ? "grid-cols-3" : "grid-cols-2")}>
                      <TabsTrigger value="ine" disabled={isIdentityApproved} className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white h-9 rounded-md font-medium text-sm">{t("ine_tab")}</TabsTrigger>
                      <TabsTrigger value="passport" disabled={isIdentityApproved} className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white h-9 rounded-md font-medium text-sm">{t("passport_tab")}</TabsTrigger>
                      {personType === 'MORAL' && (
                        <TabsTrigger value="acta" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white h-9 rounded-md font-medium text-sm">Acta Const.</TabsTrigger>
                      )}
                    </TabsList>
                  </Tabs>
                  {activeTab === "ine" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UploadZone type="INE_FRONT" label={t("ine_front")} description={t("ine_front_desc")} inputRef={ineFrontInput} />
                      <UploadZone type="INE_BACK" label={t("ine_back")} description={t("ine_back_desc")} inputRef={ineBackInput} />
                    </div>
                  )}
                  {activeTab === "passport" && <UploadZone type="PASSPORT" label={t("passport_label")} description={t("passport_desc")} inputRef={passportInput} />}
                  {activeTab === "acta" && personType === 'MORAL' && (
                    <UploadZone type="ACTA_CONSTITUTIVA" label="Acta Constitutiva" description="Documento constitutivo de la empresa" inputRef={actaInput} />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Selfie */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className={cn("border-slate-200 dark:border-slate-800 transition-all", isIdentityApproved ? "bg-white dark:bg-slate-900 shadow-sm" : "bg-slate-100/50 dark:bg-slate-900/40 opacity-60 cursor-not-allowed")}>
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl", isIdentityApproved ? "bg-medical-50 dark:bg-medical-500/10" : "bg-slate-200 dark:bg-slate-800")}>
                      <ScanFace className={cn("w-5 h-5", isIdentityApproved ? "text-medical-600 dark:text-medical-400" : "text-slate-400 dark:text-slate-600")} />
                    </div>
                    <div><CardTitle className="text-lg text-slate-900 dark:text-white font-semibold">{t("selfie_title")}</CardTitle><CardDescription className="mt-0.5 font-light">{t("selfie_desc")}</CardDescription></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  {isIdentityApproved ? (
                    <UploadZone type="SELFIE" label={t("selfie_label")} description={t("selfie_hint")} inputRef={selfieInput} />
                  ) : (
                    <div className="p-5 rounded-xl border border-dashed border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 flex gap-3 items-start">
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-500/10 rounded-lg flex-shrink-0"><AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400" /></div>
                      <div><p className="text-amber-700 dark:text-amber-400 font-medium text-sm mb-0.5">{t("step_locked")}</p><p className="text-xs text-amber-600/80 dark:text-amber-300/80 font-light">{t("step_locked_desc")}</p></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT: Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-5">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm sticky top-8">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-slate-900 dark:text-white text-base font-semibold flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-medical-600 dark:text-medical-400" />{t("status_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                <div className="space-y-3">
                  {[{ done: isIdentityApproved, icon: ShieldCheck, label: t("identification") }, { done: documents["SELFIE"]?.verificationStatus === "APPROVED", icon: ScanFace, label: t("proof_of_life") }, ...(personType === 'MORAL' ? [{ done: documents["ACTA_CONSTITUTIVA"]?.verificationStatus === "APPROVED", icon: FileCheck, label: "Acta Constitutiva" }] : [])].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border", item.done ? "bg-medical-600 dark:bg-medical-500 border-medical-500 dark:border-medical-400" : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700")}>
                          {item.done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <item.icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                        </div>
                        <span className={cn("text-sm font-medium", item.done ? "text-medical-600 dark:text-medical-400" : "text-slate-500 dark:text-slate-400")}>{item.label}</span>
                      </div>
                      {item.done && <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0 text-[10px]">OK</Badge>}
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <Button className={cn("w-full h-11 font-semibold shadow-none rounded-xl", isKycComplete() ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100" : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed")} disabled={!isKycComplete()} onClick={handleFinishStep}>
                    {isKycComplete() ? <><CheckCircle2 className="w-4 h-4 mr-2" />{t("confirm_continue")}</> : t("complete_docs")}
                  </Button>
                  {!isKycComplete() && <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-light">{t("complete_docs_hint")}</p>}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-0.5">{t("data_protected_title")}</p>
                    <p>{t("data_protected_desc")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}