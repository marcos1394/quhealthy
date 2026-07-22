"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */;

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
        <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl shadow-sm transition-colors">
            <div className="flex items-start gap-5 animate-pulse">
                <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-[#111] shrink-0" />
                <div className="space-y-4 flex-1 mt-2">
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-2 w-full max-w-md bg-gray-100 dark:bg-[#111] rounded" />
                    <div className="h-2 w-3/4 max-w-sm bg-gray-100 dark:bg-[#111] rounded" />
                </div>
            </div>
        </div>
    );
}

export default function BillingSettingsPage() {
    const { transactions, isLoading, page, totalPages, fetchPage } = useBillingHistory();
    const [selectedTx, setSelectedTx] = React.useState<any>(null);
    const t = useTranslations('DashboardBilling');

    const exportToCSV = () => { toast.success("Extracción CSV en curso...", { theme: "colored" }); };
    const exportToPDF = () => { toast.success("Extracción PDF en curso...", { theme: "colored" }); };

    const getStatusBadge = (status: string) => {
        const baseClass = "px-2.5 py-1 text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 rounded-full border shadow-sm";
        
        switch (status) {
            case "SUCCEEDED": 
                return <span className={cn(baseClass, "bg-emerald-100 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50")}><CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />{t('table.settled', { defaultValue: 'Liquidado' })}</span>;
            case "FAILED": 
                return <span className={cn(baseClass, "bg-red-100 text-red-700 border-red-200/50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50")}><XCircle className="w-3.5 h-3.5" strokeWidth={2} />{t('table.failed', { defaultValue: 'Fallido' })}</span>;
            case "REFUNDED": 
                return <span className={cn(baseClass, "bg-gray-100 text-gray-700 border-gray-200 dark:bg-[#111] dark:text-gray-300 dark:border-gray-800")}><ArrowRightLeft className="w-3.5 h-3.5" strokeWidth={2} />{t('table.refunded', { defaultValue: 'Reembolsado' })}</span>;
            default: 
                return <span className={cn(baseClass, "bg-gray-100 text-gray-700 border-gray-200 dark:bg-[#111] dark:text-gray-300 dark:border-gray-800")}>{status}</span>;
        }
    };

    const getTypeLabel = (type: string) => {
        if (type === "APPOINTMENT_PAYMENT") return "Pago por consulta";
        if (type === "SUBSCRIPTION_CHARGE") return "Suscripción Quhealthy";
        return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="space-y-12 pb-16 font-sans selection:bg-emerald-200 dark:selection:bg-emerald-900/50 transition-colors duration-300 bg-gray-50/50 dark:bg-[#050505] min-h-screen pt-8">
            
            <div className="max-w-6xl mx-auto space-y-12 px-6 md:px-10">
                
                {/* CABECERA */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 shadow-sm">
                            <Building2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                        <div>
                            <span className="px-3 py-1 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400 shadow-sm mb-2 inline-block">
                                Auditoría Contable
                            </span>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-none">
                                {t('title', { defaultValue: 'Tesorería y Pagos' })}
                            </h1>
                            <p className="text-sm font-medium text-gray-500">
                                {t('subtitle', { defaultValue: 'Auditoría financiera, facturación y control de pasarela.' })}
                            </p>
                        </div>
                    </div>
                    <div>
                        <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 px-4 py-2 text-xs font-bold rounded-full flex items-center gap-2 w-fit shadow-sm">
                            <Sparkles className="w-4 h-4" strokeWidth={2} /> Operativa Financiera
                        </span>
                    </div>
                </div>

                <div className="space-y-12">
                    
                    {/* SECCIÓN 1: STRIPE CONNECT */}
                    <section>
                        <div className="mb-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 shadow-sm">
                                <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={2} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">
                                    {t('stripe_section', { defaultValue: 'Motor de Pagos Externo' })}
                                </h2>
                                <p className="text-sm font-medium text-gray-500">
                                    Vinculación bancaria para flujo de capital
                                </p>
                            </div>
                        </div>
                        <Suspense fallback={<StripeConnectCardSkeleton />}>
                            <StripeConnectCard />
                        </Suspense>
                    </section>

                    {/* SECCIÓN 2: HISTORIAL TRANSACCIONAL */}
                    <section>
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 shadow-sm">
                                    <ReceiptText className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={2} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">
                                        {t('transactions_title', { defaultValue: 'Histórico de Transacciones' })}
                                    </h2>
                                    <p className="text-sm font-medium text-gray-500">
                                        Registro inmutable de cobros y pagos
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={exportToCSV} 
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 h-10 px-5 text-sm font-bold transition-colors rounded-xl shadow-sm"
                                >
                                    <Download className="w-4 h-4" strokeWidth={2} /> Extraer CSV
                                </button>
                                <button 
                                    onClick={exportToPDF} 
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-5 text-sm font-bold transition-colors rounded-xl shadow-sm"
                                >
                                    <FileDown className="w-4 h-4" strokeWidth={2} /> Extraer PDF
                                </button>
                            </div>
                        </div>

                        {/* TABLA DE DATOS */}
                        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col transition-colors rounded-3xl shadow-sm">
                            
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center p-20 bg-gray-50/50 dark:bg-[#050505]">
                                    <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
                                    <p className="text-sm font-semibold text-gray-500 mt-6 animate-pulse">
                                        {t('loading', { defaultValue: 'Auditando registros financieros...' })}
                                    </p>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="p-20 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-[#050505]">
                                    <div className="w-16 h-16 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6 shadow-sm">
                                        <ReceiptText className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                                    </div>
                                    <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                                        Cero Registros
                                    </h4>
                                    <p className="text-sm font-medium text-gray-500 max-w-sm leading-relaxed">
                                        {t('empty.description', { defaultValue: 'Aún no existe actividad financiera registrada en el sistema.' })}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left min-w-[800px]">
                                        <thead className="bg-gray-50/50 dark:bg-[#111]/50 text-xs font-bold text-gray-500 border-b border-gray-100 dark:border-gray-800">
                                            <tr>
                                                <th className="px-6 py-4 whitespace-nowrap uppercase">{t('table.date', { defaultValue: 'Fecha' })}</th>
                                                <th className="px-6 py-4 whitespace-nowrap uppercase">{t('table.service', { defaultValue: 'Concepto' })}</th>
                                                <th className="px-6 py-4 whitespace-nowrap uppercase">{t('table.status', { defaultValue: 'Estado' })}</th>
                                                <th className="px-6 py-4 text-right whitespace-nowrap uppercase">{t('table.amount', { defaultValue: 'Importe' })}</th>
                                                <th className="px-6 py-4 text-center whitespace-nowrap uppercase">Recibo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#0a0a0a]">
                                            {transactions.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors cursor-pointer group">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-900 dark:text-white">
                                                            <div className="w-8 h-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-[#0a0a0a] transition-colors shadow-sm">
                                                                <CalendarDays className="w-4 h-4 text-gray-500" strokeWidth={2} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span>{format(new Date(tx.date), "dd MMM yyyy", { locale: es })}</span>
                                                                <span className="text-xs font-medium text-gray-500 mt-0.5">
                                                                    {format(new Date(tx.date), "HH:mm")} hrs
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <CreditCard className="w-5 h-5 text-gray-400" strokeWidth={2} />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                    {getTypeLabel(tx.type)}
                                                                </span>
                                                                {tx.appointmentId && (
                                                                    <span className="text-xs font-medium text-gray-500 mt-0.5">
                                                                        ID Ref: #{tx.appointmentId}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {getStatusBadge(tx.status)}
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                                                {tx.amount.toLocaleString("es-MX", { style: "currency", currency: tx.currency })}
                                                            </span>
                                                            <span className="text-xs font-bold text-gray-500 mt-1 uppercase">
                                                                {tx.currency}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex justify-center gap-2">
                                                            <button 
                                                                aria-label="Visualizar Recibo Interno" 
                                                                onClick={() => setSelectedTx(tx)} 
                                                                className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-800 bg-white text-gray-600 dark:bg-[#0a0a0a] dark:text-gray-400 hover:bg-gray-50 hover:text-emerald-600 dark:hover:bg-[#111] dark:hover:text-emerald-400 transition-colors shadow-sm"
                                                            >
                                                                <FileTextIcon className="w-4 h-4" strokeWidth={2} />
                                                            </button>
                                                            {tx.receiptUrl && (
                                                                <a 
                                                                    href={tx.receiptUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    title="Recibo Oficial de Stripe"
                                                                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-800 bg-gray-50 text-gray-600 dark:bg-[#111] dark:text-gray-400 hover:bg-white hover:text-emerald-600 dark:hover:bg-[#0a0a0a] dark:hover:text-emerald-400 transition-colors shadow-sm"
                                                                >
                                                                    <ExternalLink className="w-4 h-4" strokeWidth={2} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            
                            {/* PAGINACIÓN */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-[#111]/30 border-t border-gray-100 dark:border-gray-800 gap-4">
                                    <div className="text-sm font-semibold text-gray-500 flex items-center">
                                        Página 
                                        <span className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white mx-2 tabular-nums shadow-sm">
                                            {page + 1}
                                        </span> 
                                        de 
                                        <span className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white mx-2 tabular-nums shadow-sm">
                                            {totalPages}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => fetchPage(page - 1)} 
                                            disabled={page === 0}
                                            className="h-10 px-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white text-gray-700 dark:bg-[#0a0a0a] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold flex items-center shadow-sm"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1.5" strokeWidth={2} />
                                            {t('pagination.previous', { defaultValue: 'Anterior' })}
                                        </button>
                                        <button 
                                            onClick={() => fetchPage(page + 1)} 
                                            disabled={page >= totalPages - 1}
                                            className="h-10 px-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white text-gray-700 dark:bg-[#0a0a0a] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold flex items-center shadow-sm"
                                        >
                                            {t('pagination.next', { defaultValue: 'Siguiente' })}
                                            <ChevronRight className="w-4 h-4 ml-1.5" strokeWidth={2} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* MODAL / COMPROBANTE TÉCNICO ESTRICTO */}
            <Dialog open={!!selectedTx} onOpenChange={(o) => !o && setSelectedTx(null)}>
                <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl">
                    
                    <div className="bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 p-8 flex items-start justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0 shadow-sm">
                                <ReceiptText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">
                                    Comprobante Interno
                                </p>
                                <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                                    DOC-{selectedTx?.id?.substring(0, 8).toUpperCase() || '0001'}
                                </DialogTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <CalendarDays className="w-4 h-4 text-gray-400" strokeWidth={2} />
                                    <p className="text-sm font-medium text-gray-500">
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
                            
                            <div className="grid grid-cols-2 gap-0 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/50">
                                <div className="border-r border-gray-100 dark:border-gray-800 p-8">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                                        Remitente
                                    </p>
                                    <p className="text-base font-bold text-gray-900 dark:text-white">
                                        Paciente
                                    </p>
                                    <p className="text-sm font-medium text-gray-500 mt-1">
                                        Ref: #{selectedTx.appointmentId || "N/A"}
                                    </p>
                                </div>
                                <div className="p-8 text-right">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                                        Receptor
                                    </p>
                                    <p className="text-base font-bold text-gray-900 dark:text-white">
                                        Quhealthy Services
                                    </p>
                                    <p className="text-sm font-medium text-gray-500 mt-1">
                                        Divisa: {selectedTx.currency}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#0a0a0a] p-8">
                                <div className="flex justify-between items-center pb-6 border-b border-gray-100 dark:border-gray-800">
                                    <p className="text-xs uppercase font-bold tracking-widest text-gray-500">Descripción Operativa</p>
                                    <p className="text-xs uppercase font-bold tracking-widest text-gray-500">Importe</p>
                                </div>
                                <div className="flex justify-between items-center py-6 border-b border-gray-100 dark:border-gray-800">
                                    <p className="text-base font-bold text-gray-900 dark:text-white">
                                        {getTypeLabel(selectedTx.type)}
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {selectedTx.amount.toLocaleString("es-MX", { style: "currency", currency: selectedTx.currency })}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center pt-6">
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Liquidado</p>
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {selectedTx.amount.toLocaleString("es-MX", { style: "currency", currency: selectedTx.currency })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50/50 dark:bg-[#111]/30 p-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                        <button 
                            className="w-full sm:w-auto h-12 flex items-center justify-center px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white text-gray-700 dark:bg-[#0a0a0a] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] text-sm font-bold transition-colors shadow-sm" 
                            onClick={() => toast.success("Ejecutando protocolo de impresión...", { theme: "colored" })}
                        >
                            <Printer className="w-4 h-4 mr-2" strokeWidth={2} /> Imprimir
                        </button>
                        <button 
                            className="w-full sm:w-auto h-12 flex items-center justify-center px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-bold transition-colors shadow-sm" 
                            onClick={() => toast.success("Extrayendo documento PDF...", { theme: "colored" })}
                        >
                            <FileDown className="w-4 h-4 mr-2" strokeWidth={2} /> Extraer PDF
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}