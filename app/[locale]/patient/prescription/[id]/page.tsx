"use client";

import React, { use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, FileText, Download, ShieldCheck, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { usePublicPrescription } from "@/hooks/usePublicPrescription";

// Next.js 15+ requiere desempaquetar 'params' con React.use()
export default function PublicPrescriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const appointmentId = Number(unwrappedParams.id);
  const t = useTranslations("PublicPrescription");

  const { pin, setPin, isLoading, error, pdfUrl, verifyPinAndLoadPdf } =
    usePublicPrescription(appointmentId);

  // Manejador para forzar la descarga en dispositivos móviles/escritorio
  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `Receta_Medica_${appointmentId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center p-4 selection:bg-emerald-100 dark:selection:bg-emerald-950/30 font-sans transition-colors duration-500">
      <AnimatePresence mode="wait">
        {/* 🚀 ESTADO 1: Bóveda de Seguridad (Solicitando PIN) */}
        {!pdfUrl ? (
          <motion.div
            key="lock-vault"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 sm:p-10 space-y-6">
              {/* Icono Principal */}
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
                <Lock className="w-7 h-7" strokeWidth={2} />
              </div>

              {/* Títulos */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("protected_title")}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("protected_desc")}
                </p>
              </div>

              {/* Formulario de Verificación PIN */}
              <form onSubmit={verifyPinAndLoadPdf} className="space-y-6">
                <div className="space-y-3">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    autoFocus
                    placeholder={t("pin_placeholder")}
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPin(val);
                    }}
                    className="h-16 text-center text-3xl tracking-[0.5em] font-bold font-mono bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-300 dark:placeholder:text-gray-700 placeholder:font-normal placeholder:tracking-normal"
                  />

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs font-semibold text-red-600 dark:text-red-400 text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || pin.length !== 4}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <QhSpinner size="sm" className="text-white" />
                      <span>{t("btn_verifying")}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                      <span>{t("btn_unlock")}</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Footer Informativo */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("footer_backed_by")}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* 🚀 ESTADO 2: Receta Desbloqueada (Visor PDF) */
          <motion.div
            key="pdf-visor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-5xl h-[90vh] flex flex-col bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            {/* Header Flotante del Visor */}
            <div className="h-16 border-b border-gray-100 dark:border-gray-800 px-6 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-[#050505]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                  <FileText className="w-5 h-5" strokeWidth={2} />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("unlocked_header")}
                </h2>
              </div>

              <Button
                onClick={handleDownload}
                variant="outline"
                className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_download")}</span>
              </Button>
            </div>

            {/* Contenedor Iframe */}
            <div className="flex-1 w-full bg-gray-100 dark:bg-[#050505]">
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-0"
                title={t("iframe_title")}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}