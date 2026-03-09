"use client";

import React, { Suspense } from "react";
import StripeConnectCard from "@/components/dashboard/billing/StripeConnectCard";
import { Building2, ReceiptText, Sparkles, ExternalLink, CheckCircle2, XCircle, ArrowRightLeft, CalendarDays, CreditCard, Loader2, ChevronLeft, ChevronRight, Download, FileDown, FileText as FileTextIcon, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { es } from "date-fns/locale";
import { useBillingHistory } from "@/hooks/useBillingHistory";
import { useTranslations } from "next-intl";
import { QhSpinner } from '@/components/ui/QhSpinner';

function StripeConnectCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 animate-pulse transition-colors">
      <div className="flex items-center space-x-5">
        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="space-y-2.5 flex-1">
          <div className="h-4 w-52 rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 w-80 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

export default function BillingSettingsPage() {
  const { transactions, isLoading, page, totalPages, fetchPage } = useBillingHistory();
  const [selectedTx, setSelectedTx] = React.useState<any>(null);
  const t = useTranslations('DashboardBilling');

  const exportToCSV = () => { toast.success("Exporting transactions to CSV..."); };
  const exportToPDF = () => { toast.success("Exporting transactions to PDF..."); };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCEEDED": return <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"><CheckCircle2 className="w-2.5 h-2.5 mr-1" />{t('table.settled')}</Badge>;
      case "FAILED": return <Badge className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-0"><XCircle className="w-2.5 h-2.5 mr-1" />{t('table.failed')}</Badge>;
      case "REFUNDED": return <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0"><ArrowRightLeft className="w-2.5 h-2.5 mr-1" />{t('table.refunded')}</Badge>;
      default: return <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-0">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "APPOINTMENT_PAYMENT") return "Appointment Payment";
    if (type === "SUBSCRIPTION_CHARGE") return "QuHealthy Subscription";
    return type;
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-200 dark:border-medical-500/20">
              <Building2 className="w-7 h-7 text-medical-600 dark:text-medical-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
              <Badge className="mt-1 bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0">
                <Sparkles className="w-2.5 h-2.5 mr-1" />Financial Management
              </Badge>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl font-light leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1: Stripe Connect */}
          <section>
            <div className="mb-4 flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-1.5 bg-medical-50 dark:bg-medical-500/10 rounded-lg"><Building2 className="h-4 w-4 text-medical-600 dark:text-medical-400" /></div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('stripe_section')}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">Link your bank account to receive payments</p>
              </div>
            </div>
            <Suspense fallback={<StripeConnectCardSkeleton />}><StripeConnectCard /></Suspense>
          </section>

          {/* Section 2: Transaction History */}
          <section>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg"><ReceiptText className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('transactions_title')}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">View payments made by your patients</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV} className="text-xs h-8 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportToPDF} className="text-xs h-8 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                  <FileDown className="w-3.5 h-3.5 mr-1.5" /> Export PDF
                </Button>
              </div>
            </div>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-14">
                    <QhSpinner size="md" />
                    <p className="text-slate-500 dark:text-slate-400 font-light">{t('loading')}</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-14 text-center">
                    <div className="mx-auto max-w-sm space-y-3">
                      <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <ReceiptText className="w-6 h-6 text-slate-400 dark:text-slate-600" />
                      </div>
                      <p className="text-sm font-light text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t('empty.description')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-5 py-3 font-medium tracking-wider">{t('table.date')}</th>
                          <th className="px-5 py-3 font-medium tracking-wider">{t('table.service')}</th>
                          <th className="px-5 py-3 font-medium tracking-wider">{t('table.status')}</th>
                          <th className="px-5 py-3 font-medium tracking-wider text-right">{t('table.amount')}</th>
                          <th className="px-5 py-3 font-medium tracking-wider text-center">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-medium text-sm">
                                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                                {format(new Date(tx.date), "dd MMM yyyy", { locale: es })}
                              </div>
                              <div className="text-[10px] text-slate-400 ml-5 mt-0.5">{format(new Date(tx.date), "hh:mm a")}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-medical-600 dark:text-medical-400" />
                                <span className="text-slate-900 dark:text-white font-medium">{getTypeLabel(tx.type)}</span>
                              </div>
                              {tx.appointmentId && <p className="text-[10px] text-slate-400 mt-0.5 ml-5">Appt #{tx.appointmentId}</p>}
                            </td>
                            <td className="px-5 py-3.5">{getStatusBadge(tx.status)}</td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {tx.amount.toLocaleString("es-MX", { style: "currency", currency: tx.currency })}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1">{tx.currency}</span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <div className="flex justify-center gap-1.5">
                                <button aria-label="View Invoice" onClick={() => setSelectedTx(tx)} className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                                  <FileTextIcon className="w-3.5 h-3.5" />
                                </button>
                                {tx.receiptUrl && (
                                  <a href={tx.receiptUrl} target="_blank" rel="noopener noreferrer" title="View Stripe receipt"
                                    className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-medical-600 dark:hover:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-500/10 transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                          Page <span className="font-semibold text-slate-900 dark:text-white">{page + 1}</span> of <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
                        </p>
                        <div className="flex gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => fetchPage(page - 1)} disabled={page === 0}
                            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 rounded-lg text-xs h-7">
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" />{t('pagination.previous')}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => fetchPage(page + 1)} disabled={page >= totalPages - 1}
                            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 rounded-lg text-xs h-7">
                            {t('pagination.next')}<ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Invoice Modal */}
      <Dialog open={!!selectedTx} onOpenChange={(o) => !o && setSelectedTx(null)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-medical-600 rounded-xl shadow-sm text-white flex-shrink-0">
                <ReceiptText className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Invoice #INV-{selectedTx?.id?.substring(0, 8).toUpperCase() || '0001'}</DialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-light mt-0.5">{selectedTx && format(new Date(selectedTx.date), "PPP", { locale: es })}</p>
              </div>
            </div>
            {selectedTx && getStatusBadge(selectedTx.status)}
          </div>

          {selectedTx && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Billed To</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Patient</p>
                  <p className="text-xs text-slate-500 font-light">Associated with Appt #{selectedTx.appointmentId || "N/A"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Provider</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">QuHealthy Services</p>
                  <p className="text-xs text-slate-500 font-light">{selectedTx.currency}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr><th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Description</th><th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Amount</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800"><td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-medium">{getTypeLabel(selectedTx.type)}</td><td className="px-4 py-4 text-right text-slate-700 dark:text-slate-300 font-medium">{selectedTx.amount.toLocaleString("es-MX", { style: "currency", currency: selectedTx.currency })}</td></tr>
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800">
                    <tr><td className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-wider text-xs">Total</td><td className="px-4 py-3 text-right font-black text-medical-600 dark:text-medical-400 text-lg">{selectedTx.amount.toLocaleString("es-MX", { style: "currency", currency: selectedTx.currency })}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <div className="bg-slate-100 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => toast.success("Printing invoice...")}>
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button className="bg-medical-600 hover:bg-medical-700 text-white shadow-md shadow-medical-500/20" onClick={() => toast.success("Downloading invoice as PDF...")}>
              <FileDown className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}