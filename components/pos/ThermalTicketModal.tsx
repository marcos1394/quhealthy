"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  X,
  Copy,
  ExternalLink,
  MessageCircle,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { PosReceipt } from "@/types/pos";
import { generateThermalTicketPdf } from "@/lib/pdf/thermalTicketPdf";
import { toast } from "sonner";

interface ThermalTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PosReceipt | null;
  doctorProfile?: {
    displayName?: string;
    license?: string;
    specialty?: string;
    address?: string;
    phone?: string;
    logoUrl?: string;
  };
}

export function ThermalTicketModal({
  isOpen,
  onClose,
  receipt,
  doctorProfile,
}: ThermalTicketModalProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !receipt) return null;

  const qrUrl =
    receipt.invoiceQrUrl ||
    `https://www.quhealthy.org/es/facturacion?ticket=${receipt.folio}&token=${receipt.invoiceToken}`;

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateThermalTicketPdf(receipt, {
        doctorName: doctorProfile?.displayName,
        doctorLicense: doctorProfile?.license,
        doctorSpecialty: doctorProfile?.specialty,
        doctorAddress: doctorProfile?.address,
        doctorPhone: doctorProfile?.phone,
        logoUrl: doctorProfile?.logoUrl,
        autoPrint: false,
      });
      toast.success("Ticket descargado correctamente en PDF.");
    } catch (e) {
      console.error(e);
      toast.error("Error al generar PDF del ticket.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateThermalTicketPdf(receipt, {
        doctorName: doctorProfile?.displayName,
        doctorLicense: doctorProfile?.license,
        doctorSpecialty: doctorProfile?.specialty,
        doctorAddress: doctorProfile?.address,
        doctorPhone: doctorProfile?.phone,
        logoUrl: doctorProfile?.logoUrl,
        autoPrint: true,
      });
    } catch (e) {
      console.error(e);
      toast.error("Error al enviar a imprimir.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    toast.success("Enlace de autofacturación copiado.");
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hola ${receipt.patientName}, aquí está tu comprobante de pago de tu consulta en QuHealthy.\n\nFolio: ${receipt.folio}\nTotal: $${receipt.totalAmount.toFixed(2)} MXN\n\nPuedes generar tu factura fiscal CFDI 4.0 aquí:\n${qrUrl}`
    );
    const phone = receipt.patientPhone?.replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-lg bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8"
        >
          {/* Header Modal */}
          <div className="p-4 sm:p-5 bg-emerald-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                  ¡Cobro Exitoso & Ticket Generado!
                </h3>
                <p className="text-[11px] text-emerald-100 font-mono">
                  Folio: {receipt.folio}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Ticket Térmico Simulado en Pantalla */}
          <div className="p-6 bg-gray-100/70 dark:bg-[#070707] flex justify-center">
            <div className="w-full max-w-[340px] bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md font-mono text-[11px] text-gray-800 dark:text-gray-200 space-y-3 relative">
              {/* Encabezado Consultorio */}
              <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-gray-300 dark:border-gray-700">
                {doctorProfile?.logoUrl && (
                  <div className="w-10 h-10 mx-auto mb-1 rounded-xl bg-gray-50 dark:bg-gray-800 p-0.5 flex items-center justify-center overflow-hidden">
                    <img
                      src={doctorProfile.logoUrl}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <h4 className="font-black text-xs text-gray-900 dark:text-white uppercase tracking-tight">
                  {doctorProfile?.displayName ||
                    receipt.doctorName ||
                    "Consultorio QuHealthy"}
                </h4>
                {(doctorProfile?.license || receipt.doctorLicense) && (
                  <p className="text-[10px] text-gray-500">
                    Cédula SEP: {doctorProfile?.license || receipt.doctorLicense}
                  </p>
                )}
                {(doctorProfile?.specialty || receipt.doctorSpecialty) && (
                  <p className="text-[10px] text-gray-500 uppercase">
                    {doctorProfile?.specialty || receipt.doctorSpecialty}
                  </p>
                )}
                {(doctorProfile?.address || receipt.doctorAddress) && (
                  <p className="text-[9px] text-gray-400">
                    {doctorProfile?.address || receipt.doctorAddress}
                  </p>
                )}
              </div>

              {/* Datos de la Venta */}
              <div className="space-y-0.5 text-[10px] text-gray-600 dark:text-gray-400 pb-2 border-b border-dashed border-gray-300 dark:border-gray-700">
                <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                  <span>TICKET DE PAGO:</span>
                  <span>{receipt.folio}</span>
                </div>
                <div className="flex justify-between">
                  <span>FECHA:</span>
                  <span>
                    {new Date(receipt.createdAt).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                {receipt.staffName && (
                  <div className="flex justify-between">
                    <span>ATENDIÓ:</span>
                    <span>{receipt.staffName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>PACIENTE:</span>
                  <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                    {receipt.patientName}
                  </span>
                </div>
              </div>

              {/* Desglose de Partidas */}
              <div className="space-y-1 pb-2 border-b border-dashed border-gray-300 dark:border-gray-700">
                <div className="grid grid-cols-12 font-bold text-[10px] text-gray-400 uppercase">
                  <span className="col-span-2">Cant</span>
                  <span className="col-span-7">Concepto</span>
                  <span className="col-span-3 text-right">Total</span>
                </div>
                {receipt.items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 text-[10px]">
                    <span className="col-span-2">{it.quantity}x</span>
                    <span className="col-span-7 truncate">{it.description}</span>
                    <span className="col-span-3 text-right font-bold">
                      ${(it.quantity * it.unitPrice).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales y Split Payments */}
              <div className="space-y-1 pb-2 border-b border-dashed border-gray-300 dark:border-gray-700 text-[10px]">
                <div className="flex justify-between text-gray-500">
                  <span>SUBTOTAL:</span>
                  <span>${receipt.subtotalAmount.toFixed(2)}</span>
                </div>
                {receipt.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>DESCUENTO:</span>
                    <span>-${receipt.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-xs text-gray-900 dark:text-white pt-1">
                  <span>TOTAL:</span>
                  <span>${receipt.totalAmount.toFixed(2)} MXN</span>
                </div>

                {/* Formas de pago */}
                <div className="pt-1.5 space-y-0.5">
                  <span className="text-[9px] font-bold uppercase text-gray-400 block">
                    Formas de Pago:
                  </span>
                  {receipt.payments.map((p, idx) => (
                    <div key={idx} className="flex justify-between text-[9px]">
                      <span>
                        •{" "}
                        {p.method === "CASH"
                          ? "Efectivo"
                          : p.method === "CARD_TERMINAL"
                          ? "Tarjeta Terminal"
                          : p.method === "SPEI_TRANSFER"
                          ? "SPEI"
                          : p.method}
                        :
                      </span>
                      <span className="font-bold">${p.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  {receipt.changeAmount && receipt.changeAmount > 0 ? (
                    <div className="flex justify-between text-[9px] text-emerald-600 font-bold">
                      <span>• Cambio devuelto:</span>
                      <span>${receipt.changeAmount.toFixed(2)}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* QR Autofacturación */}
              <div className="text-center space-y-1.5 pt-1">
                <span className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400 block">
                  Autofacturación SAT CFDI 4.0
                </span>
                <div className="p-2 bg-white rounded-xl inline-block border border-gray-200 shadow-2xs">
                  <QRCodeSVG value={qrUrl} size={90} />
                </div>
                <p className="text-[8px] text-gray-400">
                  Escanea para timbrar tu factura fiscal
                </p>
                <p className="text-[8px] text-gray-400 font-sans">
                  ¡Gracias por su preferencia!
                </p>
              </div>
            </div>
          </div>

          {/* Acciones del Modal */}
          <div className="p-4 sm:p-5 bg-white dark:bg-[#0f0f0f] border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="rounded-xl text-xs h-9 px-3 gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar QR Link</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsAppShare}
                className="rounded-xl text-xs h-9 px-3 gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="rounded-xl text-xs h-9 px-3 gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF (80mm)</span>
              </Button>

              <Button
                size="sm"
                onClick={handlePrint}
                disabled={isGeneratingPdf}
                className="rounded-xl text-xs h-9 px-4 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
