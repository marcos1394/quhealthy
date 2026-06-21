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
    <div className="rounded-none border-2 border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-6 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] animate-pulse">
      <div className="flex items-center space-x-5">
        <div className="h-12 w-12 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-3 flex-1">
          <div className="h-4 w-52 bg-black dark:bg-white" />
          <div className="h-3 w-80 bg-gray-300 dark:bg-gray-700" />
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
      case "SUCCEEDED": return <Badge className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"><CheckCircle2 className="w-3 h-3 mr-1.5" strokeWidth={2} />{t('table.settled')}</Badge>;
      case "FAILED": return <Badge className="bg-white text-black dark:bg-[#0a0a0a] dark:text-white border-2 border-black dark:border-white rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest line-through"><XCircle className="w-3 h-3 mr-1.5" strokeWidth={2} />{t('table.failed')}</Badge>;
      case "REFUNDED": return <Badge className="bg-white text-gray-500 dark:bg-[#0a0a0a] border-2 border-gray-300 dark:border-gray-700 rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"><ArrowRightLeft className="w-3 h-3 mr-1.5" strokeWidth={2} />{t('table.refunded')}</Badge>;
      default: return <Badge className="bg-white text-black dark:bg-[#0a0a0a] dark:text-white border-2 border-black dark:border-white rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "APPOINTMENT_PAYMENT") return "Appointment Payment";
    if (type === "SUBSCRIPTION_CHARGE") return "QuHealthy Subscription";
    return type;
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="max-w-6xl mx-auto space-y-10 px-4 md:px-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-black dark:border-white">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold uppercase tracking-wide text-black dark:text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 md:w-10 md:h-10" strokeWidth={2} />
              {t('title')}
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mt-2">
              {t('subtitle')}
            </p>
          </div>
          <div>
            <Badge className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white rounded-none px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
              <Sparkles className="w-3 h-3 mr-2" strokeWidth={2} />Financial Management
            </Badge>
          </div>
        </div>

        <div className="space-y-12">
          {/* Section 1: Stripe Connect */}
          <section>
            <div className="mb-6 flex items-center gap-3 pb-3 border-b-2 border-black dark:border-white">
              <div className="p-1.5 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"><Building2 className="h-4 w-4" strokeWidth={2} /></div>
              <div>
                <h2 className="text-lg font-serif font-bold uppercase tracking-widest text-black dark:text-white">{t('stripe_section')}</h2>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Link your bank account to receive payments</p>
              </div>
            </div>
            <Suspense fallback={<StripeConnectCardSkeleton />}><StripeConnectCard /></Suspense>
          </section>

          {/* Section 2: Transaction History */}
          <section>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b-2 border-black dark:border-white">
              <div className="flex items-center gap-3">
                <div className="p-1.5 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"><ReceiptText className="h-4 w-4" strokeWidth={2} /></div>
                <div>
                  <h2 className="text-lg font-serif font-bold uppercase tracking-widest text-black dark:text-white">{t('transactions_title')}</h2>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">View payments made by your patients</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={exportToCSV} className="h-10 border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] uppercase font-bold tracking-widest transition-colors">
                  <Download className="w-3.5 h-3.5 mr-2" strokeWidth={2} /> Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportToPDF} className="h-10 border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] uppercase font-bold tracking-widest transition-colors">
                  <FileDown className="w-3.5 h-3.5 mr-2" strokeWidth={2} /> Export PDF
                </Button>
              </div>
            </div>

            <Card className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] overflow-hidden">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-20">
                    <QhSpinner size="md" />
                    <p className="text-[10px] uppercase tracking-widest font-bold text-black dark:text-white mt-6 animate-pulse">{t('loading')}</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-20 text-center border-2 border-dashed border-black dark:border-white m-6">
                    <div className="mx-auto max-w-sm space-y-4">
                      <div className="mx-auto w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center bg-black text-white dark:bg-white dark:text-black">
                        <ReceiptText className="w-6 h-6" strokeWidth={2} />
                      </div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
                        {t('empty.description')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-[#111] text-[10px] uppercase tracking-widest font-bold text-black dark:text-white border-b-2 border-black dark:border-white">
                        <tr>
                          <th className="px-6 py-4">{t('table.date')}</th>
                          <th className="px-6 py-4">{t('table.service')}</th>
                          <th className="px-6 py-4">{t('table.status')}</th>
                          <th className="px-6 py-4 text-right">{t('table.amount')}</th>
                          <th className="px-6 py-4 text-center">RECEIPT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-black dark:divide-white">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group">
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-black dark:text-white font-bold text-[10px] uppercase tracking-widest">
                                <CalendarDays className="w-3.5 h-3.5" strokeWidth={2} />
                                {format(new Date(tx.date), "dd MMM yyyy", { locale: es })}
                              </div>
                              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-5.5 mt-1">{format(new Date(tx.date), "hh:mm a")}</div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-3.5 h-3.5 text-black dark:text-white" strokeWidth={2} />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-black dark:text-white">{getTypeLabel(tx.type)}</span>
                              </div>
                              {tx.appointmentId && <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mt-1 ml-5.5">APPT #{tx.appointmentId}</p>}
                            </td>
                            <td className="px-6 py-5">{getStatusBadge(tx.status)}</td>
                            <td className="px-6 py-5 text-right">
                              <span className="text-xl font-serif font-bold text-black dark:text-white">
                                {tx.amount.toLocaleString("es-MX", { style: "currency", currency: tx.currency })}
                              </span>
                              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-2">{tx.currency}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <div className="flex justify-center gap-2">
                                <button aria-label="View Invoice" onClick={() => setSelectedTx(tx)} className="inline-flex items-center justify-center p-2 border-2 border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
                                  <FileTextIcon className="w-4 h-4" strokeWidth={2} />
                                </button>
                                {tx.receiptUrl && (
                                  <a href={tx.receiptUrl} target="_blank" rel="noopener noreferrer" title="View Stripe receipt"
                                    className="inline-flex items-center justify-center p-2 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
                                    <ExternalLink className="w-4 h-4" strokeWidth={2} />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-[#111] border-t-2 border-black dark:border-white">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-black dark:text-white">
                          PAGE <span className="px-2 py-1 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] mx-1">{page + 1}</span> OF <span className="px-2 py-1 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] mx-1">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => fetchPage(page - 1)} disabled={page === 0}
                            className="border-2 border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50 rounded-none h-10 text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
                            <ChevronLeft className="w-4 h-4 mr-2" strokeWidth={2} />{t('pagination.previous')}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => fetchPage(page + 1)} disabled={page >= totalPages - 1}
                            className="border-2 border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50 rounded-none h-10 text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
                            {t('pagination.next')}<ChevronRight className="w-4 h-4 ml-2" strokeWidth={2} />
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
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
          <div className="bg-gray-50 dark:bg-[#111] border-b-2 border-black dark:border-white p-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex-shrink-0 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
                <ReceiptText className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-serif font-bold tracking-widest uppercase text-black dark:text-white">INV-{selectedTx?.id?.substring(0, 8).toUpperCase() || '0001'}</DialogTitle>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{selectedTx && format(new Date(selectedTx.date), "PPP", { locale: es })}</p>
              </div>
            </div>
            <div className="mt-2">
              {selectedTx && getStatusBadge(selectedTx.status)}
            </div>
          </div>

          {selectedTx && (
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8 bg-white dark:bg-[#0a0a0a] p-6 border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b-2 border-black dark:border-white inline-block pb-1">BILLED TO</p>
                  <p className="text-sm font-bold text-black dark:text-white uppercase tracking-widest">PATIENT</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">APPT #{selectedTx.appointmentId || "N/A"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b-2 border-black dark:border-white inline-block pb-1">PROVIDER</p>
                  <p className="text-sm font-bold text-black dark:text-white uppercase tracking-widest">QUHEALTHY SERVICES</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{selectedTx.currency}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-[#111] border-b-2 border-black dark:border-white">
                    <tr>
                      <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">DESCRIPTION</th>
                      <th className="px-6 py-4 text-right text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b-2 border-black dark:border-white">
                      <td className="px-6 py-6 text-[10px] uppercase tracking-widest font-bold text-black dark:text-white">{getTypeLabel(selectedTx.type)}</td>
                      <td className="px-6 py-6 text-right font-serif text-lg font-bold text-black dark:text-white">{selectedTx.amount.toLocaleString("es-MX", { style: "currency", currency: selectedTx.currency })}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-[#111]">
                    <tr>
                      <td className="px-6 py-4 text-right font-bold text-black dark:text-white uppercase tracking-widest text-[10px]">TOTAL</td>
                      <td className="px-6 py-4 text-right font-serif font-bold text-black dark:text-white text-3xl">{selectedTx.amount.toLocaleString("es-MX", { style: "currency", currency: selectedTx.currency })}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#0a0a0a] p-6 border-t-2 border-black dark:border-white flex justify-end gap-4">
            <Button variant="outline" className="h-12 px-6 border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] uppercase tracking-widest font-bold transition-colors" onClick={() => toast.success("Printing invoice...")}>
              <Printer className="w-4 h-4 mr-2" strokeWidth={2} /> PRINT
            </Button>
            <Button className="h-12 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] text-[10px] uppercase tracking-widest font-bold transition-colors" onClick={() => toast.success("Downloading invoice as PDF...")}>
              <FileDown className="w-4 h-4 mr-2" strokeWidth={2} /> DOWNLOAD PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}