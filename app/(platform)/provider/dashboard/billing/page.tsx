"use client";

import React, { Suspense } from "react";
import StripeConnectCard from "@/components/dashboard/billing/StripeConnectCard";
import { 
  Building2, 
  ReceiptText, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  ArrowRightLeft,
  CalendarDays,
  CreditCard,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// 🚀 IMPORTAMOS TU NUEVO HOOK
import { useBillingHistory } from "@/hooks/useBillingHistory";

/* ⚠️ ATENCIÓN: Mueve esto a tu app/provider/billing/layout.tsx 
  export const metadata = {
    title: "Facturación y Pagos | QuHealthy",
    description: "Configura tu cuenta para recibir pagos y administra tus recibos.",
  };
*/

// Componente de carga para el Suspense de Stripe
function StripeConnectCardSkeleton() {
  return (
    <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8 shadow-xl animate-pulse">
      <div className="flex items-center space-x-6">
        <div className="h-16 w-16 rounded-2xl bg-gray-800" />
        <div className="space-y-3 flex-1">
          <div className="h-5 w-64 rounded-lg bg-gray-800" />
          <div className="h-4 w-96 rounded-lg bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

export default function BillingSettingsPage() {
  // 🚀 Conectamos el Backend
  const { transactions, isLoading, page, totalPages, fetchPage } = useBillingHistory();

  // Helpers visuales para la tabla
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Completado</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Fallido</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20"><ArrowRightLeft className="w-3 h-3 mr-1" /> Reembolsado</Badge>;
      default:
        return <Badge className="bg-gray-800 text-gray-400">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === 'APPOINTMENT_PAYMENT') return 'Pago de Consulta';
    if (type === 'SUBSCRIPTION_CHARGE') return 'Suscripción QuHealthy';
    return type;
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header de la Página */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/20">
              <Building2 className="w-10 h-10 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Facturación y Pagos
              </h1>
              <Badge className="mt-2 bg-purple-500/10 text-purple-400 border-purple-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Gestión Financiera
              </Badge>
            </div>
          </div>
          <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
            Administra cómo recibes el dinero de tus consultas y mantén al día tu información financiera
          </p>
        </div>

        <div className="space-y-10">
          
          {/* ==========================================
              SECCIÓN 1: Cuenta Conectada (Stripe) 
              ========================================== */}
          <section>
            <div className="mb-6 flex items-center gap-3 pb-4 border-b border-gray-800/50">
              <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Building2 className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">
                  Datos de Depósito
                </h2>
                <p className="text-sm text-gray-500">
                  Vincula tu cuenta bancaria para recibir pagos
                </p>
              </div>
            </div>
            
            <Suspense fallback={<StripeConnectCardSkeleton />}>
              <StripeConnectCard />
            </Suspense>
          </section>

          {/* ==========================================
              SECCIÓN 2: Historial Financiero Real 
              ========================================== */}
          <section>
            <div className="mb-6 flex items-center gap-3 pb-4 border-b border-gray-800/50">
              <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <ReceiptText className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">
                  Historial de Ingresos
                </h2>
                <p className="text-sm text-gray-500">
                  Consulta los pagos realizados por tus pacientes
                </p>
              </div>
            </div>
            
            <Card className="bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                {isLoading ? (
                  // ESTADO 1: CARGANDO
                  <div className="flex flex-col items-center justify-center p-16">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                    <p className="text-gray-400">Sincronizando con la bóveda de pagos...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  // ESTADO 2: VACÍO (El placeholder original que me mostraste)
                  <div className="p-16 text-center bg-gradient-to-br from-gray-900/50 to-gray-900/30">
                    <div className="mx-auto max-w-md space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center border border-gray-700">
                        <ReceiptText className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-base font-semibold text-gray-400 leading-relaxed">
                        Una vez que comiences a recibir citas pagadas, tus recibos y transferencias aparecerán aquí
                      </p>
                    </div>
                  </div>
                ) : (
                  // ESTADO 3: CON DATOS (Tabla Premium)
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                      <thead className="bg-gray-950/50 text-xs uppercase text-gray-500 border-b border-gray-800">
                        <tr>
                          <th className="px-6 py-4 font-bold">Fecha</th>
                          <th className="px-6 py-4 font-bold">Concepto</th>
                          <th className="px-6 py-4 font-bold">Estado</th>
                          <th className="px-6 py-4 font-bold text-right">Monto</th>
                          <th className="px-6 py-4 font-bold text-center">Recibo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-white font-medium">
                                <CalendarDays className="w-4 h-4 text-gray-500" />
                                {format(new Date(tx.date), "dd MMM yyyy", { locale: es })}
                              </div>
                              <div className="text-xs text-gray-500 ml-6 mt-0.5">
                                {format(new Date(tx.date), "hh:mm a")}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-purple-400" />
                                <span className="text-white font-medium">{getTypeLabel(tx.type)}</span>
                              </div>
                              {tx.appointmentId && (
                                <p className="text-xs text-gray-500 mt-1">Cita #{tx.appointmentId}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(tx.status)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-base font-bold text-white">
                                {tx.amount.toLocaleString('es-MX', { style: 'currency', currency: tx.currency })}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">{tx.currency}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {tx.receiptUrl ? (
                                <a 
                                  href={tx.receiptUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-purple-600 transition-colors"
                                  title="Ver factura de Stripe"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              ) : (
                                <span className="text-xs text-gray-600">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Controles de Paginación */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-6 py-4 bg-gray-950/30 border-t border-gray-800">
                        <p className="text-sm text-gray-500">
                          Página <span className="font-bold text-white">{page + 1}</span> de <span className="font-bold text-white">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-gray-700 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                            onClick={() => fetchPage(page - 1)}
                            disabled={page === 0}
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-gray-700 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                            onClick={() => fetchPage(page + 1)}
                            disabled={page >= totalPages - 1}
                          >
                            Siguiente <ChevronRight className="w-4 h-4 ml-1" />
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