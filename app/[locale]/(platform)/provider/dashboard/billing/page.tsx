"use client";

import React, { Suspense } from "react";
import StripeConnectCard from "@/components/dashboard/billing/StripeConnectCard";
import { Building2, ReceiptText, Sparkles, ExternalLink, CheckCircle2, XCircle, ArrowRightLeft, CalendarDays, CreditCard, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useBillingHistory } from "@/hooks/useBillingHistory";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCEEDED": return <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"><CheckCircle2 className="w-2.5 h-2.5 mr-1" />Completed</Badge>;
      case "FAILED": return <Badge className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-0"><XCircle className="w-2.5 h-2.5 mr-1" />Failed</Badge>;
      case "REFUNDED": return <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0"><ArrowRightLeft className="w-2.5 h-2.5 mr-1" />Refunded</Badge>;
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
              <h1 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white tracking-tight">Billing & Payments</h1>
              <Badge className="mt-1 bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0">
                <Sparkles className="w-2.5 h-2.5 mr-1" />Financial Management
              </Badge>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl font-light leading-relaxed">
            Manage how you receive money from your consultations and keep your financial information up to date
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1: Stripe Connect */}
          <section>
            <div className="mb-4 flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-1.5 bg-medical-50 dark:bg-medical-500/10 rounded-lg"><Building2 className="h-4 w-4 text-medical-600 dark:text-medical-400" /></div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Deposit Details</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">Link your bank account to receive payments</p>
              </div>
            </div>
            <Suspense fallback={<StripeConnectCardSkeleton />}><StripeConnectCard /></Suspense>
          </section>

          {/* Section 2: Transaction History */}
          <section>
            <div className="mb-4 flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg"><ReceiptText className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Income History</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">View payments made by your patients</p>
              </div>
            </div>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-14">
                    <Loader2 className="w-7 h-7 animate-spin text-medical-600 dark:text-medical-400 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-light">Syncing payment vault...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-14 text-center">
                    <div className="mx-auto max-w-sm space-y-3">
                      <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <ReceiptText className="w-6 h-6 text-slate-400 dark:text-slate-600" />
                      </div>
                      <p className="text-sm font-light text-slate-500 dark:text-slate-400 leading-relaxed">
                        Once you start receiving paid appointments, your receipts and transfers will appear here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-5 py-3 font-medium tracking-wider">Date</th>
                          <th className="px-5 py-3 font-medium tracking-wider">Concept</th>
                          <th className="px-5 py-3 font-medium tracking-wider">Status</th>
                          <th className="px-5 py-3 font-medium tracking-wider text-right">Amount</th>
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
                              {tx.receiptUrl ? (
                                <a href={tx.receiptUrl} target="_blank" rel="noopener noreferrer" title="View Stripe receipt"
                                  className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-medical-600 dark:hover:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-500/10 transition-colors">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : <span className="text-xs text-slate-300 dark:text-slate-600">-</span>}
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
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" />Previous
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => fetchPage(page + 1)} disabled={page >= totalPages - 1}
                            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 rounded-lg text-xs h-7">
                            Next<ChevronRight className="w-3.5 h-3.5 ml-1" />
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
    </div>
  );
}