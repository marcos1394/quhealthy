"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  Building2,
  Mail,
  Receipt,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
  Phone,
  MapPin,
  Award,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { posService } from "@/services/pos.service";
import { cfdiService } from "@/services/cfdi.service";
import { PosReceipt } from "@/types/pos";
import {
  CfdiRecordResponse,
  SAT_REGIMES,
  SAT_CFDI_USES,
} from "@/types/cfdi";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { toast } from "sonner";

function FacturacionContent() {
  const searchParams = useSearchParams();
  const urlTicket = searchParams.get("ticket") || "";
  const urlToken = searchParams.get("token") || "";

  // Búsqueda del ticket
  const [ticketFolio, setTicketFolio] = useState(urlTicket);
  const [invoiceToken, setInvoiceToken] = useState(urlToken);
  const [receipt, setReceipt] = useState<PosReceipt | null>(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);

  // Formulario Fiscal del Paciente
  const [patientRfc, setPatientRfc] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientZipCode, setPatientZipCode] = useState("");
  const [patientRegime, setPatientRegime] = useState("605");
  const [cfdiUsage, setCfdiUsage] = useState("D01");
  const [patientEmail, setPatientEmail] = useState("");

  // Estado de timbrado
  const [isStamping, setIsStamping] = useState(false);
  const [stampedCfdi, setStampedCfdi] = useState<CfdiRecordResponse | null>(null);

  // Auto-cargar ticket si viene en la URL
  useEffect(() => {
    if (urlToken) {
      handleLookupTicket(urlToken);
    }
  }, [urlToken]);

  const handleLookupTicket = async (tokenToUse?: string) => {
    const token = tokenToUse || invoiceToken;
    if (!token.trim()) {
      toast.error("Ingresa el código de seguridad o token del ticket");
      return;
    }

    try {
      setIsLoadingTicket(true);
      const res = await posService.getReceiptByToken(token.trim());
      setReceipt(res);
      setTicketFolio(res.folio);
      setInvoiceToken(res.invoiceToken);

      // Precargar datos si el ticket ya los tenía
      if (res.patientName) setPatientName(res.patientName);
      if (res.patientEmail) setPatientEmail(res.patientEmail);
      if (res.patientRfc) setPatientRfc(res.patientRfc);
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "No se encontró el ticket o el token es inválido.");
    } finally {
      setIsLoadingTicket(false);
    }
  };

  const handleIssueInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientRfc.trim() || patientRfc.length < 12) {
      toast.error("El RFC debe tener entre 12 y 13 caracteres.");
      return;
    }

    if (!patientName.trim()) {
      toast.error("Ingresa el Nombre o Razón Social como aparece en tu Constancia de Situación Fiscal.");
      return;
    }

    if (!patientZipCode.trim() || patientZipCode.length !== 5) {
      toast.error("El Código Postal fiscal debe ser de 5 dígitos.");
      return;
    }

    if (!receipt) {
      toast.error("No hay ticket seleccionado.");
      return;
    }

    try {
      setIsStamping(true);
      const res = await cfdiService.issueSelfServiceInvoice({
        ticketFolio: receipt.folio,
        invoiceToken: receipt.invoiceToken,
        patientRfc: patientRfc.toUpperCase().trim(),
        patientName: patientName.toUpperCase().trim(),
        patientRegime,
        patientZipCode: patientZipCode.trim(),
        cfdiUsage,
        patientEmail: patientEmail.trim() || undefined,
      });

      setStampedCfdi(res);
      toast.success("¡Tu factura fiscal CFDI 4.0 ha sido emitida y timbrada con éxito!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "Error al timbrar la factura ante el SAT.");
    } finally {
      setIsStamping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] text-gray-900 dark:text-white font-sans py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* ── HEADER PERSONALIZADO CON LA MARCA DEL MÉDICO / CLÍNICA ───────── */}
        {receipt ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#0c0c0c] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-5">
              {receipt.doctorLogoUrl ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white shadow-sm shrink-0 relative">
                  <Image
                    src={receipt.doctorLogoUrl}
                    alt={receipt.doctorName || "Logo Médico"}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-8 h-8" strokeWidth={1.75} />
                </div>
              )}

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Portal Oficial de Autofacturación</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  {receipt.doctorName || "Consultorio Médico"}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {receipt.doctorSpecialty && (
                    <span>{receipt.doctorSpecialty}</span>
                  )}
                  {receipt.doctorLicense && (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-gray-600 dark:text-gray-300">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Céd. Prof: {receipt.doctorLicense}
                    </span>
                  )}
                </div>
                {receipt.doctorAddress && (
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-sm">{receipt.doctorAddress}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
              <Link href={`/market`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs h-9 px-3.5 gap-1.5 font-bold border-gray-200 dark:border-gray-700 hover:border-emerald-500"
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tienda & Servicios</span>
                </Button>
              </Link>
              {receipt.doctorPhone && (
                <a
                  href={`https://wa.me/${receipt.doctorPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Ayuda: {receipt.doctorPhone}</span>
                </a>
              )}
            </div>
          </motion.div>
        ) : (
          /* Header Genérico si aún no busca el ticket */
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Portal de Autofacturación SAT CFDI 4.0</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              Genera tu Factura Electrónica
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Ingresa los datos de tu ticket de consulta o compra para timbrar tu comprobante fiscal con deducción autorizada por el SAT.
            </p>
          </div>
        )}

        {/* ── PASO 1: BÚSQUEDA O CONFIRMACIÓN DEL TICKET ─────────────────────── */}
        {!receipt && (
          <div className="bg-white dark:bg-[#0e0e0e] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Paso 1: Localizar tu Ticket</h3>
                <p className="text-xs text-gray-400">
                  Ingresa el Folio y el Token de seguridad impreso en tu ticket o mensaje de WhatsApp.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  Folio del Ticket (Ej. TK-2026-00001)
                </label>
                <Input
                  value={ticketFolio}
                  onChange={(e) => setTicketFolio(e.target.value)}
                  placeholder="TK-2026-00001"
                  className="rounded-xl h-11 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  Token de Seguridad del Ticket
                </label>
                <Input
                  value={invoiceToken}
                  onChange={(e) => setInvoiceToken(e.target.value)}
                  placeholder="Código de 16 o 32 dígitos"
                  className="rounded-xl h-11 text-xs font-mono"
                />
              </div>
            </div>

            <Button
              onClick={() => handleLookupTicket()}
              disabled={isLoadingTicket || !invoiceToken}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              {isLoadingTicket ? (
                <QhSpinner size="sm" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Buscar y Cargar Ticket</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* ── PASO 2: TICKET ENCONTRADO & FORMULARIO FISCAL ──────────────────── */}
        {receipt && !stampedCfdi && (
          <div className="space-y-6">
            {/* Resumen del Ticket */}
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-300">
                  Ticket Localizado: {receipt.folio}
                </span>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                  {receipt.items?.[0]?.description || "Honorarios por Consulta Médica"}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Fecha: {new Date(receipt.createdAt).toLocaleString("es-MX", { dateStyle: "long" })} • Conceptos: {receipt.items?.length || 1}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">Total Pagado</span>
                <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                  ${receipt.totalAmount.toFixed(2)} MXN
                </span>
              </div>
            </div>

            {/* Formulario Fiscal */}
            <form onSubmit={handleIssueInvoice} className="bg-white dark:bg-[#0e0e0e] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Paso 2: Datos Fiscales del Receptor (SAT CFDI 4.0)</h3>
                  <p className="text-xs text-gray-400">
                    Captura los datos exactamente como aparecen en tu Constancia de Situación Fiscal (CSF).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    RFC del Paciente o Contribuyente *
                  </label>
                  <Input
                    value={patientRfc}
                    onChange={(e) => setPatientRfc(e.target.value.toUpperCase())}
                    placeholder="Ej. PEJU800101XYZ"
                    className="rounded-xl h-11 text-xs font-mono font-bold uppercase"
                    maxLength={13}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Código Postal Fiscal (5 dígitos) *
                  </label>
                  <Input
                    value={patientZipCode}
                    onChange={(e) => setPatientZipCode(e.target.value)}
                    placeholder="06700"
                    className="rounded-xl h-11 text-xs font-mono font-bold"
                    maxLength={5}
                    required
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Nombre o Razón Social (Sin Régimen Societario) *
                  </label>
                  <Input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value.toUpperCase())}
                    placeholder="JUAN PEREZ HERNANDEZ"
                    className="rounded-xl h-11 text-xs font-bold uppercase"
                    required
                  />
                  <p className="text-[10px] text-gray-400">
                    Debe coincidir exactamente con el SAT en mayúsculas (sin S.A. de C.V. si es empresa).
                  </p>
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Régimen Fiscal *
                  </label>
                  <Select value={patientRegime} onValueChange={setPatientRegime}>
                    <SelectTrigger className="rounded-xl h-11 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl text-xs max-h-56">
                      {SAT_REGIMES.map((reg) => (
                        <SelectItem key={reg.code} value={reg.code}>
                          {reg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Uso de CFDI *
                  </label>
                  <Select value={cfdiUsage} onValueChange={setCfdiUsage}>
                    <SelectTrigger className="rounded-xl h-11 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl text-xs max-h-56">
                      {SAT_CFDI_USES.map((use) => (
                        <SelectItem key={use.code} value={use.code}>
                          {use.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    💡 La clave D01 te permite deducir estos honorarios en tu declaración anual del SAT.
                  </p>
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Correo Electrónico para envío de XML y PDF
                  </label>
                  <Input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="tu-correo@ejemplo.com"
                    className="rounded-xl h-11 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isStamping}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm gap-2 cursor-pointer shadow-lg shadow-emerald-600/25 border-0"
                >
                  {isStamping ? (
                    <>
                      <QhSpinner size="sm" />
                      <span>Timbrando Factura con el SAT...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Emitir y Timbrar CFDI 4.0 Ahora (${receipt.totalAmount.toFixed(2)} MXN)</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── PASO 3: FACTURA TIMBRADA EXITOSAMENTE ─────────────────────────── */}
        {stampedCfdi && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#0e0e0e] rounded-3xl border border-emerald-200 dark:border-emerald-900/50 p-6 sm:p-8 shadow-xl text-center space-y-6"
          >
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                ¡Factura Fiscal CFDI 4.0 Timbrada con Éxito!
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tu comprobante cuenta con sello digital y folio fiscal oficial ante el SAT.
              </p>
              <div className="pt-2">
                <span className="inline-block px-3.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 font-mono text-xs font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                  UUID: {stampedCfdi.uuidSat}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#141414] border border-gray-100 dark:border-gray-800 max-w-md mx-auto text-xs space-y-2 text-left">
              <div className="flex justify-between text-gray-500">
                <span>Emisor:</span>
                <span className="font-bold text-gray-900 dark:text-white">{receipt?.doctorName || "Consultorio QuHealthy"}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Receptor:</span>
                <span className="font-bold text-gray-900 dark:text-white">{stampedCfdi.patientName}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>RFC:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{stampedCfdi.patientRfc}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Total Facturado:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                  ${stampedCfdi.totalAmount.toFixed(2)} MXN
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {stampedCfdi.xmlUrl && (
                <a
                  href={stampedCfdi.xmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`CFDI-${stampedCfdi.uuidSat}.xml`}
                >
                  <Button variant="outline" className="rounded-xl text-xs h-10 px-4 gap-2 border-gray-300 dark:border-gray-700 font-bold">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Descargar XML (SAT)</span>
                  </Button>
                </a>
              )}

              {stampedCfdi.pdfUrl && (
                <a
                  href={stampedCfdi.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`CFDI-${stampedCfdi.uuidSat}.pdf`}
                >
                  <Button className="rounded-xl text-xs h-10 px-5 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 cursor-pointer border-0">
                    <Download className="w-4 h-4" />
                    <span>Descargar Factura PDF</span>
                  </Button>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function FacturacionPublicPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><QhSpinner size="lg" /></div>}>
      <FacturacionContent />
    </Suspense>
  );
}
