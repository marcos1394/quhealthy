// Ubicación: app/[locale]/(platform)/patient/dashboard/orders/page.tsx
"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Truck, CheckCircle2, Clock,
  MapPin, AlertCircle, Check, ExternalLink, FileText,
  ShoppingBag, RefreshCw, Sparkles, PackageCheck, ReceiptText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { useConsumerOrders } from "@/hooks/useConsumerOrders";

// ── Status config ─────────────────────────────────────────────────────────────
type StatusKey = 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;

const STATUS_CONFIG: Record<string, { label: string; color: string; accent: string; icon: React.ElementType }> = {
  PENDING_PAYMENT: {
    label: 'Pago pendiente',
    color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
    accent: 'bg-amber-500',
    icon: Clock
  },
  PENDING_PRESCRIPTION_REVIEW: {
    label: 'Revisión de receta',
    color: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-700/40 dark:text-slate-200 dark:ring-slate-600',
    accent: 'bg-slate-500',
    icon: FileText
  },
  PROCESSING: {
    label: 'Preparando',
    color: 'bg-medical-50 text-medical-700 ring-1 ring-medical-200 dark:bg-medical-500/10 dark:text-medical-300 dark:ring-medical-500/20',
    accent: 'bg-medical-500',
    icon: Package
  },
  SHIPPED: {
    label: 'En camino',
    color: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20',
    accent: 'bg-teal-500',
    icon: Truck
  },
  DELIVERED: {
    label: 'Entregado',
    color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
    accent: 'bg-emerald-500',
    icon: CheckCircle2
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20',
    accent: 'bg-rose-500',
    icon: AlertCircle
  },
};

function getStatusConfig(status: StatusKey) {
  return STATUS_CONFIG[status?.toUpperCase()] ?? {
    label: status,
    color: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    accent: 'bg-slate-400',
    icon: Package
  };
}

function formatDate(dateString: string) {
  return new Date(dateString + 'Z').toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatCurrency(amount: number) {
  return amount.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PatientOrdersPage() {
  const { orders, isLoading, isUpdating, fetchOrders, handleMarkAsDelivered } = useConsumerOrders();

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const activeOrders = orders.filter(order => !['DELIVERED', 'CANCELLED'].includes(order.orderStatus)).length;
  const shippedOrders = orders.filter(order => order.orderStatus === 'SHIPPED').length;
  const deliveredOrders = orders.filter(order => order.orderStatus === 'DELIVERED').length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <QhSpinner size="lg" />
        <p className="mt-4 font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Buscando tus paquetes...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8 font-sans">

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <ShoppingBag className="h-7 w-7 text-slate-800 dark:text-slate-100" />
            </div>
            <div className="max-w-2xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-medical-100 bg-medical-50 px-3 py-1 text-xs font-semibold text-medical-700 dark:border-medical-500/20 dark:bg-medical-500/10 dark:text-medical-300">
                <Sparkles className="h-3.5 w-3.5" />
                Seguimiento de farmacia y tienda
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Mis Pedidos
              </h1>
              <p className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400">
                Rastrea tus compras, revisa la logística y confirma tus entregas desde un solo lugar.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchOrders()}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-medical-200 hover:bg-medical-50 hover:text-medical-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-medical-500/30 dark:hover:bg-medical-500/10 dark:hover:text-medical-300"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {orders.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">En proceso</p>
                <Package className="h-5 w-5 text-medical-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{activeOrders}</p>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 shadow-sm dark:border-teal-500/20 dark:bg-teal-500/10">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">En camino</p>
                <Truck className="h-5 w-5 text-teal-600 dark:text-teal-300" />
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{shippedOrders}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Entregados</p>
                <PackageCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{deliveredOrders}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-12"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <Truck className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-950 dark:text-white">Aún no tienes pedidos</h2>
          <p className="mx-auto max-w-md text-slate-500 dark:text-slate-400">
            Cuando compres productos físicos en las tiendas de tus especialistas, aparecerán aquí para que los puedas rastrear.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-5">
          <AnimatePresence>
            {orders.map((order, index) => {
              const statusCfg = getStatusConfig(order.orderStatus);
              const StatusIcon = statusCfg.icon;
              const isShipped   = order.orderStatus === 'SHIPPED';
              const isDelivered = order.orderStatus === 'DELIVERED';
              const itemCount = order.items?.reduce((total, item) => total + item.quantity, 0) || 0;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-black/20"
                >
                  {/* Card header */}
                  <div className="relative border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-medical-50/70 p-5 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-medical-500/10 sm:px-6">
                    <div className={cn("absolute left-0 top-0 h-full w-1.5", statusCfg.accent)} />
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800">
                          <StatusIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Pedido #{order.id}</h2>
                            <Badge className={cn("border-none px-3 py-1.5", statusCfg.color)}>
                              <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                              {statusCfg.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(order.createdAt)}
                            {order.providerName && (
                              <span className="font-medium text-slate-600 dark:text-slate-300"> · {order.providerName}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
                        <div className="rounded-2xl bg-white/80 p-3 text-right shadow-sm ring-1 ring-slate-100 dark:bg-slate-950/50 dark:ring-slate-800">
                          <p className="text-[11px] font-bold uppercase text-slate-400">Artículos</p>
                          <p className="text-lg font-bold text-slate-950 dark:text-white">{itemCount}</p>
                        </div>
                        <div className="rounded-2xl bg-white/80 p-3 text-right shadow-sm ring-1 ring-slate-100 dark:bg-slate-950/50 dark:ring-slate-800">
                          <p className="text-[11px] font-bold uppercase text-slate-400">Total</p>
                          <p className="text-lg font-bold text-medical-600 dark:text-medical-400">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">

                    {/* Left: items + total */}
                    <div className="space-y-5">
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                          <ReceiptText className="h-4 w-4" />
                          Artículos del pedido
                        </h4>
                        <ul className="space-y-2">
                          {order.items?.map(item => (
                            <li key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/50">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                                  {item.quantity} unidad{item.quantity === 1 ? '' : 'es'} · {item.isDigital ? 'Digital' : 'Físico'}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="font-bold text-slate-950 dark:text-white">{formatCurrency(item.unitPrice * item.quantity)}</p>
                                <p className="text-xs text-slate-400">{formatCurrency(item.unitPrice)} c/u</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right: logistics + CTA */}
                    <div className="space-y-4">
                      {order.shippingAddress ? (
                        order.shippingAddress === 'PICKUP' ? (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                              <MapPin className="h-4 w-4" /> Entrega en clínica
                            </h4>
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
                              <p className="font-bold text-medical-600 dark:text-medical-400">Recoger en sucursal</p>
                              {order.pickupTime && (
                                <p className="mt-2 flex items-start gap-2 text-slate-500 dark:text-slate-400">
                                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                  Pasarás el {new Date(order.pickupTime).toLocaleString('es-MX', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                              <MapPin className="h-4 w-4" /> Dirección de entrega
                            </h4>
                            <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
                              {order.shippingAddress}
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                            Entrega en consultorio o compra digital.
                          </p>
                        </div>
                      )}

                      {/* 🚀 LOGÍSTICA: BOTONES DE RASTREO Y CIERRE DE CICLO */}
                      {isShipped && (
                        <div className="space-y-4 rounded-3xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-500/20 dark:bg-teal-500/10">
                          <div>
                            <h4 className="mb-1 flex items-center font-bold text-teal-800 dark:text-teal-300">
                              <Truck className="mr-2 h-5 w-5" /> Tu paquete está en camino
                            </h4>
                            <p className="text-sm leading-6 text-teal-700 dark:text-teal-300/80">
                              {order.shippingCarrier && (
                                <>Enviado vía <span className="font-bold uppercase">{order.shippingCarrier.replace('_', ' ')}</span>{' '}</>
                              )}
                              {order.trackingNumber && `• Guía: ${order.trackingNumber}`}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            {/* Botón: Rastrear en web oficial */}
                            {order.trackingUrl && (
                              <Button
                                variant="outline"
                                className="h-11 flex-1 border-teal-200 bg-white text-teal-700 hover:border-teal-300 hover:bg-teal-100 dark:border-teal-500/30 dark:bg-slate-950 dark:text-teal-300 dark:hover:bg-teal-500/20"
                                onClick={() => window.open(order.trackingUrl, '_blank')}
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Rastrear Paquete
                              </Button>
                            )}

                            {/* Botón: Confirmar recepción */}
                            <Button
                              onClick={() => handleMarkAsDelivered(order.id)}
                              disabled={isUpdating === order.id}
                              className="h-11 flex-1 bg-slate-950 font-bold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                            >
                              {isUpdating === order.id ? (
                                <QhSpinner size="sm" className="mr-2" />
                              ) : (
                                <Check className="mr-2 h-4 w-4" />
                              )}
                              Ya lo recibí
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Estado entregado */}
                      {isDelivered && (
                        <div className="flex items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-emerald-800 dark:text-emerald-300">Entrega confirmada</h4>
                            <p className="text-xs leading-5 text-emerald-700 dark:text-emerald-300/80">
                              {order.shippingCarrier
                                ? `Entregado vía ${order.shippingCarrier.replace('_', ' ')}. Disfruta tus productos.`
                                : 'Disfruta tus productos QuHealthy.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 🚩 Estado cancelado / rechazado */}
                      {order.orderStatus === 'CANCELLED' && (
                        <div className="space-y-3 rounded-3xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-500/20 dark:bg-rose-500/10">
                          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400">
                            <AlertCircle className="h-5 w-5" />
                            <h4 className="font-bold">Pedido cancelado</h4>
                          </div>
                          {order.rejectionReason && (
                            <div className="rounded-2xl border border-rose-100 bg-white/60 p-3 dark:border-rose-900/30 dark:bg-black/20">
                              <p className="mb-1 text-xs font-bold uppercase text-rose-900 dark:text-rose-300">Razón del especialista:</p>
                              <p className="text-sm italic leading-relaxed text-slate-700 dark:text-rose-200/80">
                                "{order.rejectionReason}"
                              </p>
                            </div>
                          )}
                          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                            Tu dinero ha sido reembolsado automáticamente a tu método de pago original. Si tienes dudas, contacta a tu especialista.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
