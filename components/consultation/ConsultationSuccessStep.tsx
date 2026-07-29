"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Printer, MessageCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";

import { appointmentService } from "@/services/appointment.service";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface ConsultationSuccessStepProps {
  appointmentId: number;
  patientPhone?: string;
  doctorName?: string;
  clinicName?: string;
  onClose: () => void;
}

export const ConsultationSuccessStep: React.FC<ConsultationSuccessStepProps> = ({
  appointmentId,
  patientPhone,
  doctorName = "ESPECIALISTA ASIGNADO",
  clinicName = "QUHEALTHY",
  onClose,
}) => {
  const t = useTranslations("EHR");
  const params = useParams();
  const currentLocale = (params?.locale as string) || "es";
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintPdf = async () => {
    try {
      setIsPrinting(true);
      const pdfBlob = await appointmentService.downloadPrescriptionPdf(
        appointmentId
      );

      const fileURL = URL.createObjectURL(pdfBlob);
      window.open(fileURL, "_blank");

      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      toast.error(t("error_download_pdf"));
    } finally {
      setIsPrinting(false);
    }
  };

  const handleWhatsAppShare = () => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString(
      currentLocale === "es" ? "es-MX" : "en-US",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
    const timeFormatted = now.toLocaleTimeString(
      currentLocale === "es" ? "es-MX" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    const patientPortalUrl = `https://www.quhealthy.org/${currentLocale}/patient/prescription/${appointmentId}`;

    const greeting = t("wa_greeting", { doctorName, clinicName });
    const body = t("wa_body");
    const labelDate = t("wa_date");
    const labelTime = t("wa_time");
    const labelLink = t("wa_link");
    const security = t("wa_security_note");
    const products = t("wa_products_note");
    const closing = t("wa_closing");

    const message =
      `${greeting}\n\n` +
      `📄 ${body}\n\n` +
      `🗓️ ${labelDate}: ${dateFormatted}\n` +
      `⏰ ${labelTime}: ${timeFormatted}\n\n` +
      `🔗 ${labelLink}: ${patientPortalUrl}\n\n` +
      `🔐 ${security}\n\n` +
      `${products}\n\n` +
      `${closing}`;

    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = patientPhone ? patientPhone.replace(/\D/g, "") : "";

    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    window.open(waUrl, "_blank");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-300 py-12 px-4 font-sans transition-colors">
      {/* ── CONTENEDOR PRINCIPAL SOFT HEALTH TECH ─────────────────────── */}
      <div className="max-w-md w-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden transition-colors">
        {/* CABECERA Y ÉXITO */}
        <div className="p-8 sm:p-10 flex flex-col items-center text-center bg-white dark:bg-[#0a0a0a] space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
            <CheckCircle2 className="w-8 h-8" strokeWidth={2} />
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
            {t("protocol_completed")}
          </span>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t("consultation_finished")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
              {t("consultation_finished_desc")}
            </p>
          </div>
        </div>

        {/* PANEL DE ACCIONES */}
        <div className="p-6 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 space-y-3">
          {/* WhatsApp Action */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full h-12 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer border-0"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={2} />
            <span>{t("send_by_whatsapp")}</span>
          </button>

          {/* Imprimir / Descargar PDF */}
          <button
            type="button"
            onClick={handlePrintPdf}
            disabled={isPrinting}
            className="w-full h-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            {isPrinting ? (
              <>
                <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                <span>{t("generating_pdf")}</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("print_prescription_pdf")}</span>
              </>
            )}
          </button>

          {/* Retornar al Panel */}
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-0 mt-2"
          >
            <span>{t("back_to_home")}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};