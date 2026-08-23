"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Building2,
  ReceiptText,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  XCircle,
  CalendarDays,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Printer,
  ShieldCheck,
  Key,
  Lock,
  Plus,
  Ban,
  Upload,
  RefreshCcw,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useBillingHistory } from "@/hooks/useBillingHistory";
import StripeConnectCard from "@/components/dashboard/billing/StripeConnectCard";
import { cfdiService } from "@/services/cfdi.service";
import {
  FiscalProfile,
  UploadCsdPayload,
  CfdiRecordResponse,
  DirectInvoicePayload,
  SAT_REGIMES,
  SAT_CFDI_USES,
} from "@/types/cfdi";
import { cn } from "@/lib/utils";

export default function BillingSettingsPage() {
  const t = useTranslations("DashboardBilling");
  const locale = useLocale();

  // Pestañas
  const [activeTab, setActiveTab] = useState<"invoices" | "global" | "fiscal_setup" | "stripe">("invoices");

  // Facturas Emitidas
  const [invoices, setInvoices] = useState<CfdiRecordResponse[]>([]);
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(false);
  const [invoicePage, setInvoicePage] = useState(0);
  const [totalInvoicePages, setTotalInvoicePages] = useState(1);

  // Perfil Fiscal & Sellos CSD
  const [fiscalProfile, setFiscalProfile] = useState<FiscalProfile | null>(null);
  const [isFiscalLoading, setIsFiscalLoading] = useState(false);
  const [isSavingFiscal, setIsSavingFiscal] = useState(false);

  const [rfc, setRfc] = useState("");
  const [legalName, setLegalName] = useState("");
  const [fiscalRegime, setFiscalRegime] = useState("612");
  const [zipCode, setZipCode] = useState("");
  const [cerBase64, setCerBase64] = useState("");
  const [keyBase64, setKeyBase64] = useState("");
  const [csdPassword, setCsdPassword] = useState("");
  const [cerFileName, setCerFileName] = useState("");
  const [keyFileName, setKeyFileName] = useState("");

  // Modal Emisión Directa
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [directRfc, setDirectRfc] = useState("");
  const [directName, setDirectName] = useState("");
  const [directZip, setDirectZip] = useState("");
  const [directRegime, setDirectRegime] = useState("605");
  const [directUse, setDirectUse] = useState("D01");
  const [directConcept, setDirectConcept] = useState("Honorarios por Servicios Médicos");
  const [directAmount, setDirectAmount] = useState("");
  const [isIssuingDirect, setIsIssuingDirect] = useState(false);

  // Modal Cancelación
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedInvoiceToCancel, setSelectedInvoiceToCancel] = useState<CfdiRecordResponse | null>(null);
  const [cancelReason, setCancelReason] = useState<"01" | "02" | "03" | "04">("02");
  const [replacementUuid, setReplacementUuid] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);

  // Cargar Perfil Fiscal
  const fetchFiscalProfile = useCallback(async () => {
    try {
      setIsFiscalLoading(true);
      const data = await cfdiService.getFiscalProfile();
      setFiscalProfile(data);
      if (data.rfc) setRfc(data.rfc);
      if (data.legalName) setLegalName(data.legalName);
      if (data.fiscalRegime) setFiscalRegime(data.fiscalRegime);
      if (data.zipCode) setZipCode(data.zipCode);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFiscalLoading(false);
    }
  }, []);

  // Cargar Facturas Emitidas
  const fetchInvoices = useCallback(async () => {
    try {
      setIsInvoicesLoading(true);
      const res = await cfdiService.getInvoices(invoicePage, 20);
      setInvoices(res.content || []);
      setTotalInvoicePages(Math.ceil((res.totalElements || 0) / 20) || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsInvoicesLoading(false);
    }
  }, [invoicePage]);

  useEffect(() => {
    fetchFiscalProfile();
    fetchInvoices();
  }, [fetchFiscalProfile, fetchInvoices]);

  // Manejadores de Archivos CSD (.cer y .key)
  const handleCerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCerFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setCerBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleKeyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setKeyFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setKeyBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFiscalSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfc.trim() || rfc.length < 12) {
      toast.error("El RFC debe tener entre 12 y 13 caracteres.");
      return;
    }
    if (!legalName.trim()) {
      toast.error("Ingresa la Razón Social o Nombre fiscal.");
      return;
    }
    if (!zipCode.trim() || zipCode.length !== 5) {
      toast.error("El Código Postal debe ser de 5 dígitos.");
      return;
    }

    try {
      setIsSavingFiscal(true);
      const payload: UploadCsdPayload = {
        rfc: rfc.toUpperCase().trim(),
        legalName: legalName.trim(),
        fiscalRegime,
        zipCode: zipCode.trim(),
        certificateBase64: cerBase64 || "CERT_CONFIGURED",
        privateKeyBase64: keyBase64 || "KEY_CONFIGURED",
        privateKeyPassword: csdPassword || "PWD_CONFIGURED",
      };

      const updated = await cfdiService.saveFiscalProfile(payload);
      setFiscalProfile(updated);
      toast.success("Configuración fiscal y sellos CSD actualizados correctamente.");
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "Error al actualizar configuración fiscal.");
    } finally {
      setIsSavingFiscal(false);
    }
  };

  // Emisión Directa
  const handleIssueDirectInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directRfc.trim() || directRfc.length < 12) {
      toast.error("RFC del paciente no válido.");
      return;
    }
    if (!directName.trim()) {
      toast.error("Ingresa el nombre del paciente.");
      return;
    }
    const amt = parseFloat(directAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("El importe debe ser mayor a $0.");
      return;
    }

    try {
      setIsIssuingDirect(true);
      const payload: DirectInvoicePayload = {
        patientRfc: directRfc.toUpperCase().trim(),
        patientName: directName.toUpperCase().trim(),
        patientRegime: directRegime,
        patientZipCode: directZip.trim() || "06700",
        cfdiUsage: directUse,
        paymentMethod: "PUE",
        paymentForm: "04",
        items: [
          {
            description: directConcept,
            quantity: 1,
            unitPrice: amt,
            subtotal: amt,
            isTaxExempt: true,
          },
        ],
        totalAmount: amt,
      };

      await cfdiService.issueDirectInvoice(payload);
      toast.success("¡Factura CFDI 4.0 emitida con éxito!");
      setIsDirectModalOpen(false);
      fetchInvoices();
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "Error al emitir CFDI.");
    } finally {
      setIsIssuingDirect(false);
    }
  };

  // Cancelar CFDI
  const handleConfirmCancel = async () => {
    if (!selectedInvoiceToCancel) return;
    try {
      setIsCanceling(true);
      await cfdiService.cancelCfdi(selectedInvoiceToCancel.uuidSat, {
        cancellationReason: cancelReason,
        replacementUuid: cancelReason === "01" ? replacementUuid.trim() : undefined,
      });
      toast.success("Factura cancelada ante el SAT.");
      setIsCancelModalOpen(false);
      setSelectedInvoiceToCancel(null);
      fetchInvoices();
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "Error al cancelar factura.");
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white transition-colors pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Header Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ReceiptText className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Facturación SAT CFDI 4.0 & Finanzas
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  SAT 4.0
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Administración de CFDI, sellos digitales CSD, autofacturación y dispersiones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setIsDirectModalOpen(true)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs h-11 px-5 shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Factura Manual</span>
            </Button>
          </div>
        </div>

        {/* Barra de Pestañas */}
        <div className="flex bg-gray-100/70 dark:bg-gray-800/40 p-1.5 rounded-2xl w-fit shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab("invoices")}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
              activeTab === "invoices"
                ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Facturas Emitidas (CFDI)</span>
          </button>

          <button
            onClick={() => setActiveTab("fiscal_setup")}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
              activeTab === "fiscal_setup"
                ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Key className="w-4 h-4" />
            <span>Configuración Fiscal & CSD</span>
          </button>

          <button
            onClick={() => setActiveTab("stripe")}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
              activeTab === "stripe"
                ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pasarela Stripe Connect</span>
          </button>
        </div>

        {/* ── PESTAÑA 1: FACTURAS EMITIDAS ──────────────────────────────────── */}
        {activeTab === "invoices" && (
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden space-y-4">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Historial de CFDI 4.0 Timbrados
                </h3>
                <p className="text-xs text-gray-400">
                  Comprobantes fiscales generados por citas, POS y autofacturación de pacientes.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchInvoices}
                className="rounded-xl h-9 px-3 text-xs gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Actualizar</span>
              </Button>
            </div>

            {isInvoicesLoading ? (
              <div className="p-12 flex justify-center"><QhSpinner size="lg" /></div>
            ) : invoices.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">
                Aún no tienes facturas emitidas en el periodo.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/70 dark:bg-[#121212] text-gray-400 font-bold uppercase text-[10px] border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="p-4 pl-6">Fecha</th>
                      <th className="p-4">Folio Fiscal (UUID)</th>
                      <th className="p-4">Receptor / RFC</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Estatus</th>
                      <th className="p-4 pr-6 text-right">Comprobantes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-[#141414] transition-colors">
                        <td className="p-4 pl-6 font-mono text-gray-500">
                          {new Date(inv.createdAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="p-4 font-mono font-bold text-gray-800 dark:text-gray-200">
                          {inv.uuidSat ? `${inv.uuidSat.substring(0, 18)}...` : "PENDIENTE"}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900 dark:text-white truncate max-w-[180px]">
                            {inv.patientName}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">{inv.patientRfc}</span>
                        </td>
                        <td className="p-4 font-mono font-black text-emerald-600 dark:text-emerald-400">
                          ${inv.totalAmount.toFixed(2)} MXN
                        </td>
                        <td className="p-4">
                          {inv.status === "GENERATED" ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Timbrado
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              Cancelado
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right space-x-1.5">
                          {inv.xmlUrl && (
                            <a href={inv.xmlUrl} target="_blank" rel="noopener noreferrer" download>
                              <Button variant="outline" size="sm" className="h-8 px-2 rounded-lg text-[11px]">
                                XML
                              </Button>
                            </a>
                          )}
                          {inv.pdfUrl && (
                            <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                              <Button variant="outline" size="sm" className="h-8 px-2 rounded-lg text-[11px]">
                                PDF
                              </Button>
                            </a>
                          )}
                          {inv.status === "GENERATED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoiceToCancel(inv);
                                setIsCancelModalOpen(true);
                              }}
                              className="h-8 px-2 rounded-lg text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PESTAÑA 2: CONFIGURACIÓN FISCAL & SELLOS CSD ─────────────────── */}
        {activeTab === "fiscal_setup" && (
          <form onSubmit={handleSaveFiscalSetup} className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Identidad Fiscal & Sellos Digitales (CSD)
                </h3>
                <p className="text-xs text-gray-400">
                  Configura tus certificados de sello digital del SAT para emitir facturas con tu propio RFC.
                </p>
              </div>

              {fiscalProfile?.isCsdConfigured ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sellos CSD Activos</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Sellos Pendientes</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">RFC del Emisor *</label>
                <Input
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value.toUpperCase())}
                  placeholder="XAXX010101000"
                  className="rounded-xl h-11 text-xs font-mono font-bold uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Código Postal / Lugar Expedición *</label>
                <Input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="06700"
                  className="rounded-xl h-11 text-xs font-mono font-bold"
                  maxLength={5}
                  required
                />
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Razón Social o Nombre Fiscal *</label>
                <Input
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value.toUpperCase())}
                  placeholder="DR. JUAN PEREZ LOPEZ"
                  className="rounded-xl h-11 text-xs font-bold uppercase"
                  required
                />
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Régimen Fiscal Emisor *</label>
                <Select value={fiscalRegime} onValueChange={setFiscalRegime}>
                  <SelectTrigger className="rounded-xl h-11 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl text-xs">
                    {SAT_REGIMES.map((reg) => (
                      <SelectItem key={reg.code} value={reg.code}>
                        {reg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subida de CSD */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                <span>Cargar Archivos de Certificado de Sello Digital (.cer y .key)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#121212] text-center space-y-2">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                  <span className="text-xs font-bold block text-gray-700 dark:text-gray-300">
                    {cerFileName || "Seleccionar archivo .cer"}
                  </span>
                  <input
                    type="file"
                    accept=".cer"
                    onChange={handleCerFileChange}
                    className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#121212] text-center space-y-2">
                  <Key className="w-6 h-6 text-gray-400 mx-auto" />
                  <span className="text-xs font-bold block text-gray-700 dark:text-gray-300">
                    {keyFileName || "Seleccionar archivo .key"}
                  </span>
                  <input
                    type="file"
                    accept=".key"
                    onChange={handleKeyFileChange}
                    className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 cursor-pointer"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Contraseña de la Llave Privada (.key) *</label>
                  <Input
                    type="password"
                    value={csdPassword}
                    onChange={(e) => setCsdPassword(e.target.value)}
                    placeholder="Contraseña del CSD"
                    className="rounded-xl h-11 text-xs"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSavingFiscal}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-11 px-6 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              {isSavingFiscal ? <QhSpinner size="sm" /> : <span>Guardar y Validar Sellos en SAT</span>}
            </Button>
          </form>
        )}

        {/* ── PESTAÑA 3: PASARELA STRIPE CONNECT ─────────────────────────────── */}
        {activeTab === "stripe" && (
          <div className="space-y-6">
            <StripeConnectCard />
          </div>
        )}

        {/* ── MODAL EMISIÓN DIRECTA ─────────────────────────────────────────── */}
        <Dialog open={isDirectModalOpen} onOpenChange={setIsDirectModalOpen}>
          <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8">
            <DialogTitle className="text-base font-black text-gray-900 dark:text-white mb-2">
              Emitir Factura Manual CFDI 4.0
            </DialogTitle>

            <form onSubmit={handleIssueDirectInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">RFC Receptor *</label>
                  <Input
                    value={directRfc}
                    onChange={(e) => setDirectRfc(e.target.value.toUpperCase())}
                    placeholder="XAXX010101000"
                    className="rounded-xl h-9 text-xs font-mono uppercase"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Código Postal *</label>
                  <Input
                    value={directZip}
                    onChange={(e) => setDirectZip(e.target.value)}
                    placeholder="06700"
                    className="rounded-xl h-9 text-xs font-mono"
                    maxLength={5}
                    required
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-gray-600">Nombre / Razón Social *</label>
                  <Input
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value.toUpperCase())}
                    placeholder="PACIENTE O EMPRESA"
                    className="rounded-xl h-9 text-xs uppercase"
                    required
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-gray-600">Concepto del Servicio *</label>
                  <Input
                    value={directConcept}
                    onChange={(e) => setDirectConcept(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                    required
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-gray-600">Total a Facturar (MXN) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={directAmount}
                    onChange={(e) => setDirectAmount(e.target.value)}
                    placeholder="1500.00"
                    className="rounded-xl h-9 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={() => setIsDirectModalOpen(false)} className="rounded-xl text-xs h-9">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isIssuingDirect} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-5">
                  {isIssuingDirect ? <QhSpinner size="sm" /> : <span>Timbrar CFDI 4.0</span>}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── MODAL CANCELACIÓN SAT ─────────────────────────────────────────── */}
        <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-white mb-2">
              Cancelar Factura ante el SAT
            </DialogTitle>
            <p className="text-xs text-gray-400 mb-4 font-mono">
              UUID: {selectedInvoiceToCancel?.uuidSat}
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-600">Motivo de Cancelación (SAT) *</label>
                <Select value={cancelReason} onValueChange={(val) => setCancelReason(val as any)}>
                  <SelectTrigger className="rounded-xl h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl text-xs">
                    <SelectItem value="01">01 - Comprobante emitido con errores con relación</SelectItem>
                    <SelectItem value="02">02 - Comprobante emitido con errores sin relación</SelectItem>
                    <SelectItem value="03">03 - No se llevó a cabo la operación</SelectItem>
                    <SelectItem value="04">04 - Operación nominativa relacionada en la factura global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {cancelReason === "01" && (
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">UUID Sustituto *</label>
                  <Input
                    value={replacementUuid}
                    onChange={(e) => setReplacementUuid(e.target.value)}
                    placeholder="Folio fiscal del nuevo CFDI"
                    className="rounded-xl h-9 text-xs font-mono"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)} className="rounded-xl text-xs h-9">
                Cancelar
              </Button>
              <Button onClick={handleConfirmCancel} disabled={isCanceling} className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-9 px-4">
                {isCanceling ? <QhSpinner size="sm" /> : <span>Confirmar Cancelación</span>}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}