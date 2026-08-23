"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calculator,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  Clock,
  Printer,
  Download,
  Building2,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  XCircle,
  Loader2,
  PenTool,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PatientClinicalBudgetDTO } from "@/types/clinical-budget";
import { clinicalBudgetService } from "@/services/clinical-budget.service";
import { generateClinicalBudgetPdf, formatDoctorDisplayName } from "@/lib/pdf/clinicalBudgetPdf";
import { toast } from "sonner";

export default function PublicPatientBudgetPage() {
  const params = useParams();
  const folio = params?.folio as string;

  const [budget, setBudget] = useState<PatientClinicalBudgetDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Canvas de firma digital
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    async function loadBudget() {
      if (!folio) return;
      try {
        setIsLoading(true);
        const data = await clinicalBudgetService.getPublicBudget(folio);
        setBudget(data);
      } catch (err) {
        console.error("Error loading budget:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBudget();
  }, [folio]);

  // Ajustar resolución interna del canvas al abrir el modal de firma
  useEffect(() => {
    if (isSigning && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#059669";
        ctx.lineWidth = 2.5;
      }
    }
  }, [isSigning]);

  // Dibujo en Canvas de Firma con escalado de coordenadas exactas
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasSignature(false);
  };

  const handleAcceptBudget = async () => {
    if (!hasSignature) {
      toast.error("Por favor estampa tu firma digital en el recuadro antes de confirmar.");
      return;
    }

    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL("image/png") : "";

    try {
      setIsSubmitting(true);
      const updated = await clinicalBudgetService.acceptPublicBudget(folio, {
        signatureBase64OrUrl: signatureDataUrl,
      });
      setBudget(updated);
      setIsSigning(false);
      toast.success("¡Presupuesto aceptado con éxito! Tu especialista ha sido notificado.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "No se pudo aceptar el presupuesto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectBudget = async () => {
    const reason = prompt("Por favor indícanos el motivo del rechazo o cambio que requieres:");
    if (!reason) return;

    try {
      setIsSubmitting(true);
      const updated = await clinicalBudgetService.rejectPublicBudget(folio, reason);
      setBudget(updated);
      toast.success("Presupuesto marcado como rechazado.");
    } catch (err) {
      toast.error("Error al registrar el rechazo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!budget) return;
    try {
      setIsGeneratingPdf(true);
      await generateClinicalBudgetPdf(budget);
      toast.success("PDF descargado correctamente.");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("No se pudo generar el archivo PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center p-6 pt-32">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-500">Cargando presupuesto médico seguro...</p>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center p-6 pt-32">
        <div className="max-w-md w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center space-y-4 shadow-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Presupuesto no encontrado</h2>
          <p className="text-xs text-gray-500">
            El folio especificado no existe o ha sido eliminado. Por favor contacta a tu especialista.
          </p>
          <Button asChild className="rounded-xl bg-emerald-600">
            <Link href="/">Ir a QuHealthy</Link>
          </Button>
        </div>
      </div>
    );
  }

  const doctorFormatted = formatDoctorDisplayName(budget.doctorName);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#070707] pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ── BARRA SUPERIOR DE ACCIONES ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 font-black text-lg">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-sm">
              Q
            </span>
            <span>QuHealthy Clinical Engine</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="rounded-xl gap-1.5 text-xs font-bold bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800 cursor-pointer shadow-2xs"
            >
              {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Descargar PDF Oficial</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="rounded-xl gap-1.5 text-xs font-bold bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </Button>
          </div>
        </div>

        {/* ── FICHA PRINCIPAL DEL PRESUPUESTO ────────────────────────── */}
        <div
          className="rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/90 dark:border-gray-800 p-6 sm:p-10 shadow-xl space-y-8 overflow-hidden"
          style={{ borderTop: "10px solid #059669" }}
        >
          
          {/* Cabecera del Documento */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-start gap-4">
              {budget.doctorLogoUrl ? (
                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden p-1 shrink-0 shadow-xs">
                  <img
                    src={budget.doctorLogoUrl}
                    alt="Logo del Consultorio"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-xs shrink-0">
                  Q
                </div>
              )}

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold">
                  <FileText className="w-3 h-3" />
                  <span>COTIZACIÓN CLÍNICA & QUIRÚRGICA OFICIAL</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                  {budget.procedureName}
                </h1>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{doctorFormatted} {budget.doctorSpecialty ? `• ${budget.doctorSpecialty}` : ""}</span>
                  </p>
                  {budget.doctorLicense && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cédula Profesional SEP: {budget.doctorLicense}</span>
                    </p>
                  )}
                  {budget.doctorAddress && (
                    <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{budget.doctorAddress}</span>
                    </p>
                  )}
                  {budget.diagnosisCie10 && (
                    <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 pt-0.5">
                      Diagnóstico CIE-10: {budget.diagnosisCie10}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#141414] border border-gray-200/80 dark:border-gray-800 space-y-1 text-right shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Folio Oficial
              </span>
              <span className="font-mono font-black text-base text-gray-900 dark:text-white block">
                {budget.folio}
              </span>
              <span className="text-[10px] text-gray-400 block">
                Vigencia: {budget.validUntil}
              </span>
              {(budget.doctorPhone || budget.doctorEmail) && (
                <div className="text-[10px] text-gray-400 pt-1.5 border-t border-gray-200/60 dark:border-gray-800 space-y-0.5">
                  {budget.doctorPhone && <div className="flex items-center justify-end gap-1"><Phone className="w-3 h-3" /><span>{budget.doctorPhone}</span></div>}
                  {budget.doctorEmail && <div className="flex items-center justify-end gap-1"><Mail className="w-3 h-3" /><span>{budget.doctorEmail}</span></div>}
                </div>
              )}
            </div>
          </div>

          {/* Datos del Paciente y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-gray-50/60 dark:bg-[#111] border border-gray-100 dark:border-gray-800 text-xs">
            <div>
              <span className="text-gray-400 font-bold uppercase text-[10px] block">Paciente</span>
              <span className="font-extrabold text-gray-900 dark:text-white text-sm">{budget.patientName}</span>
              {(budget.patientPhone || budget.patientEmail) && (
                <span className="text-[10px] text-gray-400 block">{budget.patientPhone || budget.patientEmail}</span>
              )}
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase text-[10px] block">Fecha de Emisión</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {new Date(budget.createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase text-[10px] block">Estado</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {budget.status === "ACCEPTED" ? "✓ ACEPTADO Y FIRMADO" : budget.status === "EXPIRED" ? "⚠️ VENCIDO" : "PENDIENTE DE ACEPTACIÓN"}
              </span>
            </div>
          </div>

          {/* ── TABLA DE CONCEPTOS DESGLOSADOS ─────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Desglose Detallado de Conceptos Médicos & Quirúrgicos
            </h3>

            <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-[#141414] text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-3.5">Concepto</th>
                    <th className="p-3.5 text-center">Cant.</th>
                    <th className="p-3.5 text-right">P. Unitario</th>
                    <th className="p-3.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                  {budget.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/40">
                      <td className="p-3.5 font-medium">
                        <span className="font-bold block text-gray-900 dark:text-white">{it.description}</span>
                        <span className="text-[10px] text-gray-400 uppercase">
                          {it.itemType.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono">{it.quantity}</td>
                      <td className="p-3.5 text-right font-mono">
                        ${it.unitPrice.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                        ${(it.subtotal ?? (it.quantity * it.unitPrice)).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── INDICACIONES CLÍNICAS & RESUMEN FINANCIERO ───────────────── */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-2 sm:max-w-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Indicaciones Clínicas y Términos
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                {budget.clinicalNotes || "No se especificaron indicaciones previas adicionales."}
              </p>
            </div>

            <div className="w-full sm:w-80 space-y-2.5 p-5 rounded-2xl bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 text-xs shrink-0">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal Bruto:</span>
                <span className="font-mono font-bold">
                  ${(budget.subtotalAmount || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
              {budget.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Descuento Comercial:</span>
                  <span className="font-mono">
                    -${budget.discountAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>IVA (Art. 15 Fracc. XIV LIVA):</span>
                <span className="font-mono font-bold text-emerald-600">EXENTO (0%)</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-baseline">
                <span className="font-black uppercase tracking-wider text-gray-900 dark:text-white">Total a Pagar:</span>
                <span className="text-2xl font-black font-mono text-emerald-600">
                  ${budget.totalAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>
          </div>

          {/* ── ACCIONES DE ACEPTACIÓN / FIRMA DIGITAL ──────────────────── */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            {budget.status === "ACCEPTED" ? (
              <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-base font-black text-emerald-900 dark:text-emerald-200">
                  Cotización Aceptada y Firmada Digitalmente
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
                  Aceptado el {budget.acceptedAt ? new Date(budget.acceptedAt).toLocaleString("es-MX") : "recientemente"}. Guarda este comprobante para tu procedimiento.
                </p>
                {budget.patientSignatureUrl && (
                  <div className="pt-2 flex justify-center">
                    <img
                      src={budget.patientSignatureUrl}
                      alt="Firma del Paciente"
                      className="h-14 object-contain mix-blend-multiply dark:mix-blend-normal bg-white p-2 rounded-xl border border-emerald-200"
                    />
                  </div>
                )}
              </div>
            ) : budget.status === "EXPIRED" ? (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Esta cotización ha expirado ({budget.validUntil})
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Comunícate con tu especialista para solicitar una actualización de fechas o costos.
                </p>
              </div>
            ) : isSigning ? (
              /* Canvas para dibujar firma digital con 100% de área útil */
              <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                    <PenTool className="w-4 h-4" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      Lienzo de Firma Digital del Paciente
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs font-bold text-gray-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpiar Firma</span>
                  </button>
                </div>

                <div className="w-full bg-white dark:bg-[#141414] rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 h-44 relative flex items-center justify-center overflow-hidden touch-none cursor-crosshair shadow-inner">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full block"
                  />
                  {!hasSignature && (
                    <span className="absolute pointer-events-none text-xs text-gray-300 dark:text-gray-600 font-bold select-none">
                      Dibuja tu firma aquí en cualquier parte del recuadro
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsSigning(false)}
                    disabled={isSubmitting}
                    className="rounded-xl text-xs cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAcceptBudget}
                    disabled={isSubmitting || !hasSignature}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Confirmar y Aceptar Presupuesto</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">
                    ¿Deseas aceptar esta cotización médica?
                  </h4>
                  <p className="text-xs text-gray-500">
                    Al aceptar, confirmas los honorarios e indicaciones detalladas para tu atención.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={handleRejectBudget}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
                  >
                    Rechazar
                  </Button>

                  <Button
                    onClick={() => setIsSigning(true)}
                    className="flex-1 sm:flex-initial rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Aceptar y Firmar Cotización</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Seguridad */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Documento Clínico Cifrado AES-256</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Exención Fiscal Art. 15 Fracc. XIV LIVA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
