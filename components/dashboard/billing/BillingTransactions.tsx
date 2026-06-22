"use client"
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */;

import React from "react";
import { ReceiptText, CheckCircle2, XCircle, ArrowRightLeft, CalendarDays, CreditCard, ChevronLeft, ChevronRight, Download, FileDown, ExternalLink, FileText as FileTextIcon, Printer } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { es } from "date-fns/locale";
import { useBillingHistory } from "@/hooks/useBillingHistory";
import { useTranslations } from "next-intl";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function BillingTransactions() {
  const { transactions, isLoading, page, totalPages, fetchPage } = useBillingHistory();
  const [selectedTx, setSelectedTx] = React.useState<any>(null);
  const t = useTranslations('DashboardBilling');

  const exportToCSV = () => { toast.success("EXTRACCIÓN CSV EN CURSO..."); };
  const exportToPDF = () => { toast.success("EXTRACCIÓN PDF EN CURSO..."); };

  const getStatusBadge = (status: string) => {
    // Etiqueta Técnica Blueprint
    const baseClass = "border px-2 py-1 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap inline-flex items-center gap-1.5 rounded-none";
    
    switch (status) {
      case "SUCCEEDED": 
        return <span className={cn(baseClass, "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400")}><CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />{t('table.settled', { defaultValue: 'LIQUIDADO' })}</span>;
      case "FAILED": 
        return <span className={cn(baseClass, "border-red-500/30 bg-red-50/50 dark:bg-red-900/10 text-red-700 dark:text-red-400 line-through")}><XCircle className="w-3 h-3" strokeWidth={1.5} />{t('table.failed', { defaultValue: 'FALLIDO' })}</span>;
      case "REFUNDED": 
        return <span className={cn(baseClass, "border-gray-500/30 bg-gray-50/50 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400")}><ArrowRightLeft className="w-3 h-3" strokeWidth={1.5} />{t('table.refunded', { defaultValue: 'REEMBOLSADO' })}</span>;
      default: 
        return <span className={cn(baseClass, "border-gray-500/30 bg-gray-50/50 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400")}>{status}</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "APPOINTMENT_PAYMENT") return "PAGO POR CONSULTA";
    if (type === "SUBSCRIPTION_CHARGE") return "SUSCRIPCIÓN QUHEALTHY";
    return type.replace(/_/g, ' ');
  };

  return (
    <>
      {/* SECCIÓN 2: HISTORIAL TRANSACCIONAL */}
      <section>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-4 border-b border-black/20 dark:border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <ReceiptText className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold uppercase tracking-tight text-black dark:text-white leading-none mb-1">
            {t('transactions_title', { defaultValue: 'HISTÓRICO DE TRANSACCIONES' })}
              </h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
            REGISTRO INMUTABLE DE COBROS Y PAGOS
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <button type="button" 
              onClick={exportToCSV} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-black dark:border-white bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none"
            >
              <Download className="w-4 h-4" strokeWidth={1.5} /> EXTRAER CSV
            </button>
            <button type="button" 
              onClick={exportToPDF} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none border-0"
            >
              <FileDown className="w-4 h-4" strokeWidth={1.5} /> EXTRAER PDF
            </button>
          </div>
        </div>

        {/* TABLA DE DATOS (HOJA DE BALANCE TÉCNICA) */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white overflow-hidden flex flex-col transition-colors rounded-none">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 bg-gray-50 dark:bg-[#050505]">
              <QhSpinner size="lg" className="text-black dark:text-white" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
            {t('loading', { defaultValue: 'AUDITANDO REGISTROS FINANCIEROS...' })}
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-[#050505]">
              <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6">
            <ReceiptText className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
              </div>
              <h4 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
            CERO REGISTROS
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 max-w-sm leading-relaxed">
            {t('empty.description', { defaultValue: 'AÚN NO EXISTE ACTIVIDAD FINANCIERA REGISTRADA EN EL SISTEMA.' })}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[800px]">
            <thead className="bg-white dark:bg-[#0a0a0a] text-[9px] font-bold uppercase tracking-widest text-gray-500 border-b border-black dark:border-white">
              <tr>
                <th className="px-6 py-5 whitespace-nowrap">{t('table.date', { defaultValue: 'FECHA' })}</th>
                <th className="px-6 py-5 whitespace-nowrap">{t('table.service', { defaultValue: 'CONCEPTO' })}</th>
                <th className="px-6 py-5 whitespace-nowrap">{t('table.status', { defaultValue: 'ESTADO' })}</th>
                <th className="px-6 py-5 text-right whitespace-nowrap">{t('table.amount', { defaultValue: 'IMPORTE' })}</th>
                <th className="px-6 py-5 text-center whitespace-nowrap">RECIBO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10 bg-white dark:bg-[#0a0a0a]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 group hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">
                  <div className="w-6 h-6 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors">
                    <CalendarDays className="w-3 h-3 text-gray-500 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                  </div>
                  {format(new Date(tx.date), "dd MMM yyyy", { locale: es })}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-9 mt-1.5 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
                  {format(new Date(tx.date), "HH:mm")} HRS
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-400 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">
                    {getTypeLabel(tx.type)}
                  </span>
                    </div>
                    {tx.appointmentId && (
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1.5 ml-7 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
                    ID REF: #{tx.appointmentId}
                  </p>
                    )}
                  </td>
                  <td className="px-6 py-6">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-end justify-end gap-1.5">
                  <span className="text-xl font-semibold tracking-tight text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors leading-none">
                    {tx.amount.toLocaleString("es-MX", { style: "currency", currency: tx.currency })}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-0.5 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
                    {tx.currency}
                  </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex justify-center gap-0">
                  <button type="button" 
                    aria-label="Visualizar Recibo Interno" 
                    onClick={() => setSelectedTx(tx)} 
                    className="w-10 h-10 flex items-center justify-center border border-black/20 dark:border-white/20 bg-white text-black dark:bg-[#0a0a0a] dark:text-white group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black transition-colors rounded-none"
                  >
                    <FileTextIcon className="w-4 h-4 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                  </button>
                  {tx.receiptUrl && (
                    <a 
                      href={tx.receiptUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      title="Recibo Oficial de Stripe"
                      className="w-10 h-10 flex items-center justify-center border-y border-r border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black transition-colors rounded-none"
                    >
                      <ExternalLink className="w-4 h-4 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                    </a>
                  )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
              </table>

              {/* PAGINACIÓN MATEMÁTICA */}
              {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 dark:bg-[#050505] border-t border-black dark:border-white gap-4">
              <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center">
                ÍNDICE 
                <span className="px-3 py-1 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white mx-2 tabular-nums">
                  {page + 1}
                </span> 
                DE 
                <span className="px-3 py-1 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white mx-2 tabular-nums">
                  {totalPages}
                </span>
              </div>
              <div className="flex gap-0 border border-black/20 dark:border-white/20">
                <button type="button" 
                  onClick={() => fetchPage(page - 1)} 
                  disabled={page === 0}
                  className="h-10 px-6 border-r border-black/20 dark:border-white/20 bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 transition-colors rounded-none text-[9px] font-bold uppercase tracking-widest flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  {t('pagination.previous', { defaultValue: 'ANTERIOR' })}
                </button>
                <button type="button" 
                  onClick={() => fetchPage(page + 1)} 
                  disabled={page >= totalPages - 1}
                  className="h-10 px-6 bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 transition-colors rounded-none text-[9px] font-bold uppercase tracking-widest flex items-center"
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
      {/* MODAL / COMPROBANTE TÉCNICO ESTRICTO */}
      <Dialog open={!!selectedTx} onOpenChange={(o) => !o && setSelectedTx(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none">
          
          <div className="bg-white dark:bg-[#0a0a0a] border-b border-black dark:border-white p-6 md:p-8 flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                <ReceiptText className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                  Comprobante Interno
                </p>
                <DialogTitle className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                  DOC-{selectedTx?.id?.substring(0, 8).toUpperCase() || '0001'}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <CalendarDays className="w-3 h-3 text-gray-400" strokeWidth={1.5} />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    {selectedTx && format(new Date(selectedTx.date), "dd MMM yyyy", { locale: es })}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-2 shrink-0">
              {selectedTx && getStatusBadge(selectedTx.status)}
            </div>
          </div>

          {selectedTx && (
            <div className="p-0 bg-white dark:bg-[#0a0a0a]">
              
              <div className="grid grid-cols-2 gap-0 border-b border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
                <div className="border-r border-black/10 dark:border-white/10 p-6 md:p-8">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                    REMITENTE
                  </p>
                  <p className="text-sm font-semibold text-black dark:text-white uppercase tracking-widest">
                    PACIENTE
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-2">
                    REF: #{selectedTx.appointmentId || "N/A"}
                  </p>
                </div>
                <div className="p-6 md:p-8 text-right">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                    RECEPTOR
                  </p>
                  <p className="text-sm font-semibold text-black dark:text-white uppercase tracking-widest">
                    QUHEALTHY SERVICES
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-2">
                    DIVISA: {selectedTx.currency}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0a0a0a]">
                <table className="w-full text-left">
                  <thead className="bg-white dark:bg-[#0a0a0a] border-b border-black/10 dark:border-white/10">
                    <tr>
                      <th className="px-6 md:px-8 py-4 text-[9px] uppercase font-bold tracking-widest text-gray-500">DESCRIPCIÓN OPERATIVA</th>
                      <th className="px-6 md:px-8 py-4 text-right text-[9px] uppercase font-bold tracking-widest text-gray-500">IMPORTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black dark:border-white">
                      <td className="px-6 md:px-8 py-8 text-[10px] uppercase tracking-widest font-bold text-black dark:text-white">
                        {getTypeLabel(selectedTx.type)}
                      </td>
                      <td className="px-6 md:px-8 py-8 text-right font-semibold text-2xl tracking-tight text-black dark:text-white">
                        {selectedTx.amount.toLocaleString("es-MX", { style: "currency", currency: selectedTx.currency })}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-[#050505]">
                    <tr>
                      <td className="px-6 md:px-8 py-6 text-right font-bold text-gray-500 uppercase tracking-widest text-[10px]">TOTAL LIQUIDADO</td>
                      <td className="px-6 md:px-8 py-6 text-right font-semibold tracking-tight text-black dark:text-white text-3xl">
                        {selectedTx.amount.toLocaleString("es-MX", { style: "currency", currency: selectedTx.currency })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 border-t border-black dark:border-white flex flex-col sm:flex-row justify-end gap-4 shrink-0">
            <button type="button" 
              className="w-full sm:w-auto h-14 flex items-center justify-center px-8 border border-black dark:border-white bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] uppercase tracking-widest font-bold transition-colors rounded-none" 
              onClick={() => toast.success("EJECUTANDO PROTOCOLO DE IMPRESIÓN...")}
            >
              <Printer className="w-4 h-4 mr-3" strokeWidth={1.5} /> IMPRIMIR
            </button>
            <button type="button" 
              className="w-full sm:w-auto h-14 flex items-center justify-center px-8 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] uppercase tracking-widest font-bold transition-colors rounded-none border-0" 
              onClick={() => toast.success("EXTRAYENDO DOCUMENTO PDF...")}
            >
              <FileDown className="w-4 h-4 mr-3" strokeWidth={1.5} /> EXTRAER PDF
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
