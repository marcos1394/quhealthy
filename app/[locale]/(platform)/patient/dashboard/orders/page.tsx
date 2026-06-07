// Ubicación: app/[locale]/(platform)/patient/dashboard/orders/page.tsx
"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Truck, CheckCircle2, Clock,
  MapPin, AlertCircle, Check, ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { useConsumerOrders } from "@/hooks/useConsumerOrders";

// ── Status config ─────────────────────────────────────────────────────────────
type StatusKey = 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING_PAYMENT: { label: 'Pago Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', icon: Clock },
  PROCESSING:      { label: 'Preparando',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',   icon: Package },
  SHIPPED:         { label: 'En Camino',       color: 'bg-medical-100 text-medical-700 dark:bg-medical-500/20 dark:text-medical-400', icon: Truck },
  DELIVERED:       { label: 'Entregado',       color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', icon: CheckCircle2 },
  CANCELLED:       { label: 'Cancelado',       color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',  icon: AlertCircle },
};

function getStatusConfig(status: StatusKey) {
  return STATUS_CONFIG[status?.toUpperCase()] ?? { label: status, color: 'bg-slate-100 text-slate-700', icon: Package };
}

function formatDate(dateString: string) {
  return new Date(dateString + 'Z').toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PatientOrdersPage() {
  const { orders, isLoading, isUpdating, fetchOrders, handleMarkAsDelivered } = useConsumerOrders();

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-100 dark:border-medical-500/20">
            <Package className="w-8 h-8 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mis Pedidos</h1>
            <p className="text-slate-500 dark:text-zinc-400">Rastrea tus envíos físicos y confirma tus entregas.</p>
          </div>
        </div>
      </motion.div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm"
        >
          <Truck className="w-16 h-16 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aún no tienes pedidos</h2>
          <p className="text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Cuando compres productos físicos en las tiendas de tus especialistas, aparecerán aquí para que los puedas rastrear.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {orders.map((order, index) => {
              const statusCfg = getStatusConfig(order.orderStatus);
              const StatusIcon = statusCfg.icon;
              const isShipped   = order.orderStatus === 'SHIPPED';
              const isDelivered = order.orderStatus === 'DELIVERED';

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Card header */}
                  <div className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 p-5 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Pedido #{order.id}
                        {order.providerName && (
                          <span className="ml-2 normal-case font-medium text-slate-400">· {order.providerName}</span>
                        )}
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">{formatDate(order.createdAt)}</span>
                    </div>
                    <Badge className={cn("px-3 py-1.5 flex items-center gap-1.5 border-none", statusCfg.color)}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="font-bold">{statusCfg.label}</span>
                    </Badge>
                  </div>

                  {/* Card body */}
                  <div className="p-5 sm:p-8 flex flex-col md:flex-row gap-8">

                    {/* Left: items + total */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Artículos</h4>
                        <ul className="space-y-3">
                          {order.items?.map(item => (
                            <li key={item.id} className="flex justify-between items-center text-sm">
                              <span className="text-slate-700 dark:text-zinc-300 font-medium">
                                <span className="text-medical-600 dark:text-medical-400 mr-2">{item.quantity}×</span>
                                {item.name}
                              </span>
                              <span className="text-slate-500 dark:text-zinc-500">${item.unitPrice}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                        <span className="font-bold text-slate-900 dark:text-white">Total Pagado:</span>
                        <span className="text-xl font-black text-medical-600 dark:text-medical-400">
                          ${order.totalAmount}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px bg-slate-200 dark:bg-white/10" />

                    {/* Right: logistics + CTA */}
                    <div className="flex-1 space-y-6">
                      {order.shippingAddress ? (
                        order.shippingAddress === 'PICKUP' ? (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> Entrega en Clínica
                            </h4>
                            <div className="text-sm text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                              <p className="font-medium text-medical-600 dark:text-medical-400">Recoger en Sucursal</p>
                              {order.pickupTime && (
                                <p className="mt-1 text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  Pasarás el {new Date(order.pickupTime).toLocaleString('es-MX', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> Dirección de Entrega
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                              {order.shippingAddress}
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                            Entrega en consultorio o compra digital.
                          </p>
                        </div>
                      )}

                      {/* 🚀 LOGÍSTICA: BOTONES DE RASTREO Y CIERRE DE CICLO */}
                      {isShipped && (
                        <div className="bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20 rounded-2xl p-5 space-y-4">
                          <div>
                            <h4 className="font-bold text-medical-800 dark:text-medical-300 mb-1 flex items-center">
                              <Truck className="w-5 h-5 mr-2" /> ¡Tu paquete está en camino!
                            </h4>
                            <p className="text-sm text-medical-600 dark:text-medical-400/80">
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
                                className="flex-1 bg-white dark:bg-[#18181b] border-medical-200 dark:border-medical-500/30 text-medical-700 dark:text-medical-400 hover:bg-medical-100 dark:hover:bg-medical-500/20"
                                onClick={() => window.open(order.trackingUrl, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Rastrear Paquete
                              </Button>
                            )}

                            {/* Botón: Confirmar recepción */}
                            <Button
                              onClick={() => handleMarkAsDelivered(order.id)}
                              disabled={isUpdating === order.id}
                              className="flex-1 font-bold bg-medical-600 hover:bg-medical-700 text-white shadow-md"
                            >
                              {isUpdating === order.id ? (
                                <QhSpinner size="sm" className="mr-2" />
                              ) : (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              Ya lo recibí
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Estado entregado */}
                      {isDelivered && (
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
                          <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-full flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-emerald-800 dark:text-emerald-300">¡Entrega Confirmada!</h4>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400/80">
                              {order.shippingCarrier
                                ? `Entregado vía ${order.shippingCarrier.replace('_', ' ')}. Disfruta tus productos.`
                                : 'Disfruta tus productos QuHealthy.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 🚩 Estado cancelado / rechazado */}
                      {order.orderStatus === 'CANCELLED' && (
                        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400">
                            <AlertCircle className="w-5 h-5" />
                            <h4 className="font-bold">Pedido Cancelado</h4>
                          </div>
                          {order.rejectionReason && (
                            <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
                              <p className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-tight mb-1">Razón del especialista:</p>
                              <p className="text-sm text-slate-700 dark:text-rose-200/80 leading-relaxed italic">
                                "{order.rejectionReason}"
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-slate-500 dark:text-zinc-500">
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
