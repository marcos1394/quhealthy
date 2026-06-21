"use client";

import React, { Suspense } from "react";
import StripeConnectCard from "@/components/dashboard/billing/StripeConnectCard";
import { Building2, ReceiptText, Sparkles, ExternalLink, CheckCircle2, XCircle, ArrowRightLeft, CalendarDays, CreditCard, ChevronLeft, ChevronRight, Download, FileDown, FileText as FileTextIcon, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { es } from "date-fns/locale";
import { useBillingHistory } from "@/hooks/useBillingHistory";
import { useTranslations } from "next-intl";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from "@/lib/utils";

function StripeConnectCardSkeleton() {
  return (
    <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-6 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] animate-pulse">
      <div className="flex items-start gap-5">
        <div className="h-14 w-14 border border-black dark:border-white bg-gray-100 dark:bg-gray-800 shrink-0" />
        <div className="space-y-4 flex-1 mt-2">
          <div className="h-4 w-48 bg-black dark:bg-white" />
          <div className="h-2 w-full max-w-md bg-gray-200 dark:bg-gray-800" />
          <div className="h-2 w-3/4 max-w-sm bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

export default function BillingSettingsPage() {
  const { transactions, isLoading, page, totalPages, fetchPage } = useBillingHistory();
  const [selectedTx, setSelectedTx] = React.useState<any>(null);
  const t = useTranslations('DashboardBilling');

  const exportToCSV = () => { toast.success("EXTRACCIÓN CSV EN CURSO..."); };
  const exportToPDF = () => { toast.success("EXTRACCIÓN PDF EN CURSO..."); };

  const getStatusBadge = (status: string) => {
    const baseClass = "border border-black dark:border-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap inline-flex items-center gap-1.5";
    switch (status) {
      case "SUCCEEDED": return <span className={cn(baseClass, "bg-black text-white dark:bg-white dark:text-black")}><CheckCircle2 className="w-3 h-3" strokeWidth={2} />{t('table.settled', { defaultValue: 'LIQUIDADO' })}</span>;
      case "FAILED": return <span className={cn(baseClass, "bg-white text-black dark:bg-[#0a0a0a] dark:text-white line-through")}><XCircle className="w-3 h-3" strokeWidth={2} />{t('table.failed', { defaultValue: 'FALLIDO' })}</span>;
      case "REFUNDED": return <span className={cn(baseClass, "bg-gray-100 text-gray-500 dark:bg-[#111]")}><ArrowRightLeft className="w-3 h-3" strokeWidth={2} />{t('table.refunded', { defaultValue: 'REEMBOLSADO' })}</span>;
      default: return <span className={cn(baseClass, "bg-white text-black dark:bg-[#0a0a0a] dark:text-white")}>{status}</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "APPOINTMENT_PAYMENT") return "PAGO POR CONSULTA";
    if (type === "SUBSCRIPTION_CHARGE") return "SUSCRIPCIÓN QUHEALTHY";
    return type.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-12 pb-16 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      
      <div className="max-w-6xl mx-auto space-y-12 px-6 md:px-10">
        
        {/* CABECERA ARQUITECTÓNICA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black dark:border-white">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black dark:text-white mb-2">
                {t('title', { defaultValue: 'TESORERÍA Y PAGOS' })}
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {t('subtitle', { defaultValue: 'AUDITORÍA FINANCIERA, FACTURACIÓN Y CONTROL DE PASARELA.' })}
              </p>
            </div>
          </div>
          <div>
            <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] flex items-center gap-2 w-fit">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} /> OPERATIVA FINANCIERA
            </span>
          </div>
        </div>

        <div className="space-y-16">
          
          {/* SECCIÓN 1: STRIPE CONNECT */}
          <section>
            <div className="mb-6 flex items-center gap-4 pb-4 border-b border-black dark:border-white">
              <div className="w-10 h-10 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white">
                  {t('stripe_section', { defaultValue: 'MOTOR DE PAGOS EXTERNO' })}
                </h2>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                  VINCULACIÓN BANCARIA PARA FLUJO DE CAPITAL
                </p>
              </div>
            </div>
            <Suspense fallback={<StripeConnectCardSkeleton />}>
              <StripeConnectCard />
            </Suspense>
          </section>

          {/* SECCIÓN 2: HISTORIAL TRANSACCIONAL */}
          <section>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-4 border-b border-black dark:border-white">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                  <ReceiptText className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white">
                    {t('transactions_title', { defaultValue: 'HISTÓRICO DE TRANSACCIONES' })}
                  </h2>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    REGISTRO INMUTABLE DE COBROS Y PAGOS
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <button 
                  onClick={exportToCSV} 
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <Download className="w-4 h-4" strokeWidth={1.5} /> EXTRAER CSV
                </button>
                <button 
                  onClick={exportToPDF} 
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <FileDown className="w-4 h-4" strokeWidth={1.5} /> EXTRAER PDF
                </button>
              </div>
            </div>

            {/* TABLA DE DATOS */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] overflow-hidden flex flex-col transition-colors">
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-gray-50 dark:bg-[#050505]">
                  <QhSpinner size="lg" className="text-black dark:text-white" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
                    {t('loading', { defaultValue: 'AUDITANDO REGISTROS...' })}
                  </p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-20 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-[#050505]">
                  <div className="w-16 h-16 border border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center mb-6">
                    <ReceiptText className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">
                    CERO REGISTROS
                  </h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 max-w-sm leading-relaxed">
                    {t('empty.description', { defaultValue: 'AÚN NO EXISTE ACTIVIDAD FINANCIERA REGISTRADA EN EL SISTEMA.' })}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-[#050505] text-[9px] font-bold uppercase tracking-widest text-gray-500 border-b border-black dark:border-white">
                      <tr>
                        <th className="px-6 py-5 whitespace-nowrap">{t('table.date', { defaultValue: 'FECHA' })}</th>
                        <th className="px-6 py-5 whitespace-nowrap">{t('table.service', { defaultValue: 'CONCEPTO' })}</th>
                        <th className="px-6 py-5 whitespace-nowrap">{t('table.status', { defaultValue: 'ESTADO' })}</th>
                        <th className="px-6 py-5 text-right whitespace-nowrap">{t('table.amount', { defaultValue: 'IMPORTE' })}</th>
                        <th className="px-6 py-5 text-center whitespace-nowrap">RECIBO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#0a0a0a]">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group">
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                              <CalendarDays className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                              {format(new Date(tx.date), "dd MMM yyyy", { locale: es })}
                            </div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-7 mt-1.5">
                              {format(new Date(tx.date), "HH:mm")} HRS
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                                {getTypeLabel(tx.type)}
                              </span>
                            </div>
                            {tx.appointmentId && (
                              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1.5 ml-7">
                                ID REF: #{tx.appointmentId}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-6">
                            {getStatusBadge(tx.status)}
                          </td>
                          <td className="px-6 py-6 text-right">
                            <div className="flex items-end justify-end gap-1.5">
                              <span className="text-xl font-black tracking-tighter text-black dark:text-white leading-none">
                                {tx.amount.toLocaleString("es-MX", { style: "currency", currency: tx.currency })}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
                                {tx.currency}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex justify-center gap-3">
                              <button 
                                aria-label="Visualizar Recibo Interno" 
                                onClick={() => setSelectedTx(tx)} 
                                className="w-10 h-10 flex items-center justify-center border border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none"
                              >
                                <FileTextIcon className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                              {tx.receiptUrl && (
                                <a 
                                  href={tx.receiptUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  title="Recibo Oficial de Stripe"
                                  className="w-10 h-10 flex items-center justify-center border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors rounded-none"
                                >
                                  <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* PAGINACIÓN TÉCNICA */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 dark:bg-[#050505] border-t border-black dark:border-white gap-4">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center">
                        ÍNDICE 
                        <span className="px-3 py-1 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white mx-2 tabular-nums">
                          {page + 1}
                        </span> 
                        DE 
                        <span className="px-3 py-1 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white mx-2 tabular-nums">
                          {totalPages}
                        </span>
                      </div>
                      <div className="flex gap-0 border border-black dark:border-white">
                        <button 
                          onClick={() => fetchPage(page - 1)} 
                          disabled={page === 0}
                          className="h-10 px-6 border-r border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-[#0a0a0a] disabled:hover:text-black dark:disabled:hover:text-white transition-colors rounded-none text-[9px] font-bold uppercase tracking-widest flex items-center"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          {t('pagination.previous', { defaultValue: 'ANTERIOR' })}
                        </button>
                        <button 
                          onClick={() => fetchPage(page + 1)} 
                          disabled={page >= totalPages - 1}
                          className="h-10 px-6 bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-[#0a0a0a] disabled:hover:text-black dark:disabled:hover:text-white transition-colors rounded-none text-[9px] font-bold uppercase tracking-widest flex items-center"
                        >
                          {t('pagination.next', { defaultValue: 'SIGUIENTE' })}
                          <ChevronRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* MODAL / COMPROBANTE TÉCNICO */}
      <Dialog open={!!selectedTx} onOpenChange={(o) => !o && setSelectedTx(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
          
          <div className="bg-gray-50 dark:bg-[#050505] border-b border-black dark:border-white p-6 md:p-8 flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                <ReceiptText className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <DialogTitle className="text-xl md:text-2xl font-bold uppercase tracking-tight text-black dark:text-white">
                  DOC-{selectedTx?.id?.substring(0, 8).toUpperCase() || '0001'}
                </DialogTitle>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1.5">
                  {selectedTx && format(new Date(selectedTx.date), "dd MMM yyyy", { locale: es })}
                </p>
              </div>
            </div>
            <div className="mt-2 shrink-0">
              {selectedTx && getStatusBadge(selectedTx.status)}
            </div>
          </div>

          {selectedTx && (
            <div className="p-6 md:p-8 space-y-8 bg-white dark:bg-[#0a0a0a]">
              
              <div className="grid grid-cols-2 gap-8 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] p-6">
                <div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-300 dark:border-gray-700 pb-1.5">
                    REMITENTE
                  </p>
                  <p className="text-sm font-bold text-black dark:text-white uppercase tracking-widest">
                    PACIENTE
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1.5">
                    REF: #{selectedTx.appointmentId || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-300 dark:border-gray-700 pb-1.5">
                    RECEPTOR
                  </p>
                  <p className="text-sm font-bold text-black dark:text-white uppercase tracking-widest">
                    QUHEALTHY SERVICES
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1.5">
                    DIVISA: {selectedTx.currency}
                  </p>
                </div>
              </div>

              <div className="border border-black dark:border-white overflow-hidden bg-white dark:bg-[#0a0a0a]">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-[#050505] border-b border-black dark:border-white">
                    <tr>
                      <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-gray-500">DESCRIPCIÓN OPERATIVA</th>
                      <th className="px-6 py-4 text-right text-[9px] uppercase font-bold tracking-widest text-gray-500">IMPORTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black dark:border-white">
                      <td className="px-6 py-8 text-[10px] uppercase tracking-widest font-bold text-black dark:text-white">
                        {getTypeLabel(selectedTx.type)}
                      </td>
                      <td className="px-6 py-8 text-right font-black text-2xl tracking-tighter text-black dark:text-white">
                        {selectedTx.amount.toLocaleString("es-MX", { style: "currency", currency: selectedTx.currency })}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-[#050505]">
                    <tr>
                      <td className="px-6 py-6 text-right font-bold text-gray-500 uppercase tracking-widest text-[10px]">TOTAL LIQUIDADO</td>
                      <td className="px-6 py-6 text-right font-black tracking-tighter text-black dark:text-white text-3xl">
                        {selectedTx.amount.toLocaleString("es-MX", { style: "currency", currency: selectedTx.currency })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-[#050505] p-6 border-t border-black dark:border-white flex flex-col sm:flex-row justify-end gap-4">
            <button 
              className="w-full sm:w-auto h-12 flex items-center justify-center px-8 border border-black dark:border-white bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] uppercase tracking-widest font-bold transition-colors rounded-none" 
              onClick={() => toast.success("EJECUTANDO PROTOCOLO DE IMPRESIÓN...")}
            >
              <Printer className="w-4 h-4 mr-2" strokeWidth={1.5} /> IMPRIMIR
            </button>
            <button 
              className="w-full sm:w-auto h-12 flex items-center justify-center px-8 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border border-black dark:border-white text-[10px] uppercase tracking-widest font-bold transition-colors rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]" 
              onClick={() => toast.success("EXTRAYENDO DOCUMENTO PDF...")}
            >
              <FileDown className="w-4 h-4 mr-2" strokeWidth={1.5} /> EXTRAER PDF
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}