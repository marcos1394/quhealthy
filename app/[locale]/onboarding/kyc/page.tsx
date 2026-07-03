"use client"
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, UploadCloud, X, Loader2, CheckCircle2, ScanFace, Camera, ArrowLeft, Lock, AlertCircle, FileCheck, Sparkles, Shield, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const handleUpload = async (file: File, type: KycDocumentType) => { if (file.size > 20 * 1024 * 1024) { toast.warning("Max 10MB."); return; } await uploadDocument(file, type); };

  // Strict Badges
  const getStatusBadge = (status?: KycVerificationStatus) => {
    switch (status) {
      case "APPROVED": return <span className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"><Check className="w-3 h-3" />{t("approved")}</span>;
      case "REJECTED": return <span className="bg-red-500 text-white border border-red-500 px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"><AlertCircle className="w-3 h-3" />{t("rejected")}</span>;
      case "PROCESSING": return <span className="bg-blue-500 text-white border border-blue-500 px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 animate-pulse"><Loader2 className="w-3 h-3 animate-spin" />{t("verifying")}</span>;
      default: return <span className="bg-gray-100 dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-800 px-2 py-1 text-[9px] font-bold uppercase tracking-widest">{t("pending")}</span>;
    }
  };

  const renderUploadZone = ({ type, label, description, inputRef }: { type: KycDocumentType; label: string; description?: string; inputRef: React.RefObject<HTMLInputElement | null> }) => {
    const docData = documents[type];
    const isUp = uploadingState[type];
    const isApproved = docData?.verificationStatus === "APPROVED";
    const isRejected = docData?.verificationStatus === "REJECTED";
    const isProcessing = docData?.verificationStatus === "PROCESSING";

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={cn("relative group border p-6 flex flex-col gap-4 transition-colors",
          isApproved ? "border-black dark:border-white bg-gray-50 dark:bg-[#050505]" : "",
          isRejected ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "",
          isProcessing ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "",
          !isApproved && !isRejected && !isProcessing ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]" : ""
        )}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white block mb-1">{label}</Label>
            {description && <p className="text-[9px] uppercase tracking-widest text-gray-500 font-light">{description}</p>}
          </div>
          <div>{getStatusBadge(docData?.verificationStatus)}</div>
        </div>
        
        <AnimatePresence>
          {isRejected && docData?.rejectionReason && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-l-2 border-red-500 pl-3 py-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-0.5">{t("rejection_reason")}</p>
              <p className="text-xs text-red-600 dark:text-red-400 font-light">{docData.rejectionReason}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {docData?.fileUrl ? (
          <div className="relative h-48 w-full bg-gray-100 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 group/preview flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={docData.fileUrl} alt="Preview" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen" />
            {!isApproved && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all duration-300">
                <Button size="sm" onClick={() => inputRef.current?.click()} className="rounded-none bg-white text-black hover:bg-gray-200 h-10 px-6 text-[10px] font-bold uppercase tracking-widest">
                  <UploadCloud className="w-3 h-3 mr-2" /> {t("change_image")}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 h-auto sm:h-36">
            <button type="button" onClick={() => !isUp && inputRef.current?.click()}
              className="flex-1 border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] hover:bg-gray-100 dark:hover:bg-[#0a0a0a] hover:border-black dark:hover:border-white flex flex-col items-center justify-center gap-3 transition-colors group/upload p-6">
              {isUp ? (
                <><Loader2 className="w-5 h-5 animate-spin text-black dark:text-white" /><span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{t("uploading")}</span></>
              ) : (
                <><UploadCloud className="w-6 h-6 text-gray-400 group-hover/upload:text-black dark:group-hover/upload:text-white transition-colors" strokeWidth={1.5} />
                <div className="text-center"><span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 block mb-1">{t("upload_image")}</span><span className="text-[9px] uppercase tracking-widest text-gray-400 font-light">{t("file_hint")}</span></div></>
              )}
            </button>
            <button type="button" onClick={() => !isUp && startCamera(type)}
              className="sm:w-32 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white flex flex-col items-center justify-center gap-3 transition-colors p-6 sm:p-0">
              <Camera className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t("camera")}</span>
            </button>
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      <QhSpinner size="lg" label={t("loading")} />
    </div>
  );

  const isIdentityApproved = (documents["INE_FRONT"]?.verificationStatus === "APPROVED" && documents["INE_BACK"]?.verificationStatus === "APPROVED") || documents["PASSPORT"]?.verificationStatus === "APPROVED";
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white pt-8 pb-20 px-6 md:px-12 selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      
      {/* Camera Modal (Architectural Framing) */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 md:p-12">
            <div className="relative w-full max-w-5xl aspect-video bg-black border border-gray-800">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale" /> {/* Grayscale gives security cam vibe, remove if needed */}
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay Grid */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity }}
                  className={cn("border border-white/60 relative", activeCaptureType === "SELFIE" ? "w-64 h-80" : "w-96 h-60")}>
                  {/* Crosshairs */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-red-500" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-red-500" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-red-500" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-red-500" />
                </motion.div>
                <div className="mt-8 bg-black border border-white px-4 py-2">
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><ScanFace className="w-4 h-4" />{activeCaptureType === "SELFIE" ? t("camera_selfie_hint") : t("camera_doc_hint")}</p>
                </div>
              </div>
              
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-12 z-10">
                <Button variant="ghost" onClick={stopCamera} className="rounded-none bg-black text-white hover:bg-white hover:text-black border border-white h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors">
                  Cancelar
                </Button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={capturePhoto} className="w-16 h-16 rounded-none border border-white bg-black hover:bg-white hover:text-black transition-colors flex items-center justify-center group">
                  <Camera className="w-6 h-6 text-white group-hover:text-black" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
          <Button variant="ghost" className="rounded-none hover:bg-gray-50 dark:hover:bg-gray-900 px-4 text-[10px] font-bold uppercase tracking-widest" onClick={() => router.back()}>
            <ArrowLeft className="mr-3 w-4 h-4" />{t("back")}
          </Button>
          <div className="border border-black dark:border-white px-4 py-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} /> KYC Validation
            </span>
          </div>
        </div>

        {/* Title & Progress */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold text-black dark:text-white tracking-tight">{t("title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl font-light leading-relaxed">{t("desc")}</p>
          
          <div className="max-w-xl pt-4">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t("progress")}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800 relative">
              <motion.div className="absolute top-0 left-0 h-full bg-black dark:bg-white" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT: Documents */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
              <div className="border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
                    <FileCheck className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">{t("id_title")}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-light mt-1">{t("id_desc")}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Flat Tabs */}
                <Tabs value={activeTab} onValueChange={v => setActiveTab(v as UiDocType)} className="w-full">
                  <TabsList className="flex w-full bg-transparent border-b border-gray-200 dark:border-gray-800 rounded-none h-12 p-0 space-x-6">
                    <TabsTrigger value="ine" disabled={isIdentityApproved} className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-transparent data-[state=active]:bg-transparent text-[10px] font-bold uppercase tracking-widest text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white shadow-none px-0 h-full">
                      {t("ine_tab")}
                    </TabsTrigger>
                    <TabsTrigger value="passport" disabled={isIdentityApproved} className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-transparent data-[state=active]:bg-transparent text-[10px] font-bold uppercase tracking-widest text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white shadow-none px-0 h-full">
                      {t("passport_tab")}
                    </TabsTrigger>
                    {personType === 'MORAL' && (
                      <TabsTrigger value="acta" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-transparent data-[state=active]:bg-transparent text-[10px] font-bold uppercase tracking-widest text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white shadow-none px-0 h-full">
                        Acta Const.
                      </TabsTrigger>
                    )}
                  </TabsList>
                </Tabs>

                {activeTab === "ine" && (
                  <div className="grid grid-cols-1 gap-6">
                    {renderUploadZone({ type: "INE_FRONT", label: t("ine_front"), description: t("ine_front_desc"), inputRef: ineFrontInput })}
                    {renderUploadZone({ type: "INE_BACK", label: t("ine_back"), description: t("ine_back_desc"), inputRef: ineBackInput })}
                  </div>
                )}
                {activeTab === "passport" && renderUploadZone({ type: "PASSPORT", label: t("passport_label"), description: t("passport_desc"), inputRef: passportInput })}
                {activeTab === "acta" && personType === 'MORAL' && (
                  renderUploadZone({ type: "ACTA_CONSTITUTIVA", label: "Acta Constitutiva", description: "Documento constitutivo de la empresa", inputRef: actaInput })
                )}
              </div>
            </motion.div>

            {/* Selfie */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cn("border border-gray-200 dark:border-gray-800 transition-all", isIdentityApproved ? "bg-white dark:bg-[#0a0a0a]" : "bg-gray-50 dark:bg-[#050505] opacity-50")}>
              <div className="border-b border-gray-200 dark:border-gray-800 p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-black shrink-0">
                    <ScanFace className={cn("w-5 h-5", isIdentityApproved ? "text-black dark:text-white" : "text-gray-400")} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">{t("selfie_title")}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-light mt-1">{t("selfie_desc")}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8">
                {isIdentityApproved ? (
                  renderUploadZone({ type: "SELFIE", label: t("selfie_label"), description: t("selfie_hint"), inputRef: selfieInput })
                ) : (
                  <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-4 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-1"><Lock className="w-3 h-3" /> {t("step_locked")}</p>
                    <p className="text-xs text-gray-400 font-light">{t("step_locked_desc")}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Summary (Sticky Panel) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:sticky lg:top-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
            <div className="border-b border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-[#050505]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                <ShieldCheck className="w-4 h-4" /> {t("status_title")}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {[{ done: isIdentityApproved, icon: ShieldCheck, label: t("identification") }, { done: documents["SELFIE"]?.verificationStatus === "APPROVED", icon: ScanFace, label: t("proof_of_life") }, ...(personType === 'MORAL' ? [{ done: documents["ACTA_CONSTITUTIVA"]?.verificationStatus === "APPROVED", icon: FileCheck, label: "Acta Const." }] : [])].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-8 h-8 border flex items-center justify-center shrink-0", item.done ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black" : "border-gray-300 dark:border-gray-700 text-gray-400")}>
                        {item.done ? <Check className="w-4 h-4" strokeWidth={2} /> : <item.icon className="w-4 h-4" strokeWidth={1.5} />}
                      </div>
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", item.done ? "text-black dark:text-white" : "text-gray-500")}>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button 
                  onClick={handleFinishStep} 
                  disabled={!isKycComplete()}
                  className={cn("w-full h-14 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all", isKycComplete() ? "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200" : "bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-800")} 
                >
                  {isKycComplete() ? <><CheckCircle2 className="w-4 h-4 mr-3" /> {t("confirm_continue")}</> : t("complete_docs")}
                </Button>
                {!isKycComplete() && <p className="text-[9px] text-center text-gray-500 uppercase tracking-widest mt-4 font-light">{t("complete_docs_hint")}</p>}
              </div>

              {/* Data Protection Note */}
              <div className="border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#050505]">
                <p className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-2"><Shield className="w-3 h-3" /> {t("data_protected_title")}</p>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed">{t("data_protected_desc")}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}