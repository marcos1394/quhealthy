// app/[locale]/(platform)/provider/dashboard/orders/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Truck, CheckCircle2, Loader2, MapPin, XCircle,
  Printer, Clock, CreditCard, Ban, ShoppingBag, ChevronRight
} from "lucide-react";

import { useProviderOrders } from "@/hooks/useProviderOrders";
import { OrderResponseDto, OrderStatus, PaymentStatus } from "@/types/order";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Separator } from "@/components/ui/separator";

// ─────────────────────────────────────────────
// STATUS CONFIG: colores + label + icono
// ─────────────────────────────────────────────
const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; className: string }> = {
  PENDING_PAYMENT: {
    label: "Pago Pendiente",
    icon: Clock,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30",
  },
  PROCESSING: {
    label: "En Proceso",
    icon: Package,
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  },
  SHIPPED: {
    label: "Enviado",
    icon: Truck,
    className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30",
  },
  DELIVERED: {
    label: "Entregado",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  },
  CANCELLED: {
    label: "Cancelado",
    icon: Ban,
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
  },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING:   { label: "Pendiente",  className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  COMPLETED: { label: "Pagado",     className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
  FAILED:    { label: "Fallido",    className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
  REFUNDED:  { label: "Reembolsado",className: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
};

// ─────────────────────────────────────────────
// HELPER: normaliza el status (comparación directa de strings)
// ─────────────────────────────────────────────
function getOrderStatus(raw: string): OrderStatus | null {
  const upper = raw?.toUpperCase?.();
  const map: Record<string, OrderStatus> = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
  };
  return map[upper] ?? null;
}

function getPaymentStatus(raw: string): PaymentStatus | null {
  const upper = raw?.toUpperCase?.();
  const map: Record<string, PaymentStatus> = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
  };
  return map[upper] ?? null;
}

export default function ProviderOrdersPage() {
  const t = useTranslations("ProviderOrders");
  const {
    orders, isLoading, isSubmitting,
    fetchOrders, shipOrder, markAsDelivered, cancelOrder, downloadSlip,
  } = useProviderOrders();

  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [orderToCancel, setOrderToCancel]   = useState<OrderResponseDto | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    fetchOrders(t("toast_load_error"));
  }, [fetchOrders, t]);

  const handleShipSubmit = async () => {
    if (!selectedOrder || trackingNumber.trim().length < 5) return;
    const success = await shipOrder(
      selectedOrder.id,
      trackingNumber.trim(),
      t("toast_ship_success"),
      t("toast_ship_error")
    );
    if (success) { setSelectedOrder(null); setTrackingNumber(""); }
  };

  // ── Badge renders ──────────────────────────────────────────────────────────
  const renderOrderBadge = (raw: string) => {
    const status = getOrderStatus(raw);
    if (!status) return <Badge variant="outline" className="text-xs">{raw}</Badge>;
    const cfg = ORDER_STATUS_CONFIG[status];
    const Icon = cfg.icon;
    return (
      <Badge className={`text-xs font-semibold border px-2 py-1 flex items-center gap-1.5 w-fit ${cfg.className}`}>
        <Icon className="w-3 h-3 shrink-0" />
        {cfg.label}
      </Badge>
    );
  };

  const renderPaymentBadge = (raw: string) => {
    const status = getPaymentStatus(raw);
    if (!status) return <Badge variant="outline" className="text-xs">{raw}</Badge>;
    const cfg = PAYMENT_STATUS_CONFIG[status];
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.className}`}>
        {cfg.label}
      </span>
    );
  };

  // ── Action buttons logic ───────────────────────────────────────────────────
  const renderActions = (order: OrderResponseDto) => {
    // Usamos comparación directa con el mapa de strings para máxima compatibilidad
    const status = getOrderStatus(order.orderStatus);
    const isProcessing = status === 'PROCESSING';
    const isShipped = status === 'SHIPPED';

    return (
      <div className="flex flex-col gap-2 min-w-[148px]">
        {isProcessing && (
          <>
            <Button
              size="sm"
              className="w-full justify-start bg-medical-600 hover:bg-medical-700 text-white dark:bg-medical-500 dark:hover:bg-medical-600 shadow-sm"
              onClick={() => setSelectedOrder(order)}
            >
              <Truck className="w-3.5 h-3.5 mr-2 shrink-0" />
              {t("btn_ship")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => setOrderToCancel(order)}
            >
              <XCircle className="w-3.5 h-3.5 mr-2 shrink-0" />
              Cancelar
            </Button>
          </>
        )}

        {isShipped && (
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
            onClick={() => markAsDelivered(order.id, t("toast_deliver_success"), t("toast_deliver_error"))}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-2 shrink-0" />
            {t("btn_deliver")}
          </Button>
        )}

        {(isProcessing || isShipped) && (
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => downloadSlip(order.id, "Hoja de empaque descargada", "Error al descargar la hoja")}
          >
            <Printer className="w-3.5 h-3.5 mr-2 shrink-0" />
            Imprimir Hoja
          </Button>
        )}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
            <ShoppingBag className="w-7 h-7 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t("subtitle")}</p>
          </div>
        </div>

        {/* Summary pills */}
        {!isLoading && orders.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {(["PROCESSING", "SHIPPED"] as OrderStatus[]).map((s) => {
              const count = orders.filter(o => getOrderStatus(o.orderStatus) === s).length;
              if (!count) return null;
              const cfg = ORDER_STATUS_CONFIG[s];
              const Icon = cfg.icon;
              return (
                <span key={s} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.className}`}>
                  <Icon className="w-3 h-3" />{count} {cfg.label}
                </span>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Table card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider">{t("col_order")}</th>
                    <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider">{t("col_patient")}</th>
                    <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider">{t("col_items")}</th>
                    <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider">{t("col_status")}</th>
                    <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider text-right">{t("col_actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <QhSpinner size="md" />
                          <p className="text-sm text-slate-400">{t("loading")}</p>
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
                          <ShoppingBag className="w-10 h-10 opacity-30" />
                          <p className="text-sm font-medium">{t("empty_state")}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, i) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* 1. Pedido */}
                        <td className="px-5 py-4 align-top">
                          <span className="font-bold text-slate-900 dark:text-white text-base">
                            #{order.id}
                          </span>
                          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {format(new Date(order.createdAt + "Z"), "d MMM yyyy · HH:mm", { locale: es })}
                          </div>
                          <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                              ${order.totalAmount} <span className="font-normal text-slate-400 text-xs">{order.currency}</span>
                            </span>
                          </div>
                        </td>

                        {/* 2. Paciente */}
                        <td className="px-5 py-4 align-top max-w-[220px]">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{order.consumerName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate mb-2">{order.consumerEmail}</p>
                          {order.shippingAddress && (
                            <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 p-2 rounded-lg">
                              <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-medical-500" />
                              <span className="line-clamp-2 leading-relaxed" title={order.shippingAddress}>
                                {order.shippingAddress}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* 3. Artículos */}
                        <td className="px-5 py-4 align-top">
                          <ul className="space-y-1.5">
                            {order.items.filter(i => !i.isDigital).map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-xs">
                                <span className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-400 border border-medical-100 dark:border-medical-500/20 px-1.5 py-0.5 rounded-md font-bold text-[10px] shrink-0">
                                  ×{item.quantity}
                                </span>
                                <span className="text-slate-700 dark:text-slate-300 leading-tight">{item.itemName}</span>
                              </li>
                            ))}
                            {order.items.filter(i => !i.isDigital).length === 0 && (
                              <li className="text-xs text-slate-400 italic">Solo productos digitales</li>
                            )}
                          </ul>
                        </td>

                        {/* 4. Estado */}
                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-col gap-2">
                            {renderOrderBadge(order.orderStatus)}
                            {renderPaymentBadge(order.paymentStatus)}
                            {order.trackingNumber && (
                              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md mt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Guía</span>
                                <strong className="text-slate-700 dark:text-slate-300">{order.trackingNumber}</strong>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 5. Acciones */}
                        <td className="px-5 py-4 align-top text-right">
                          {renderActions(order)}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── MODAL: Agregar Número de Guía ──────────────────────────────── */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-medical-500" />
              {t("modal_title")}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {selectedOrder && t("modal_desc", { id: selectedOrder.id, name: selectedOrder.consumerName })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
              {t("modal_input_label")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={t("modal_placeholder")}
              className="font-mono bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-medical-500"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleShipSubmit()}
            />
            <p className="text-xs text-slate-400 mt-2">Mínimo 5 caracteres.</p>
          </div>

          <Separator className="dark:bg-slate-800" />

          <DialogFooter className="sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedOrder(null)}
              className="border-slate-200 dark:border-slate-700"
            >
              {t("btn_cancel")}
            </Button>
            <Button
              type="button"
              className="bg-medical-600 text-white hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600"
              onClick={handleShipSubmit}
              disabled={isSubmitting || trackingNumber.trim().length < 5}
            >
              {isSubmitting
                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                : <CheckCircle2 className="w-4 h-4 mr-2" />
              }
              {t("btn_confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: Confirmar Cancelación y Reembolso ────────────────────── */}
      <Dialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/50">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Confirmar Cancelación
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300 pt-1 space-y-2">
              <span className="block">
                Vas a cancelar la Orden <strong className="text-slate-900 dark:text-white">#{orderToCancel?.id}</strong> de{" "}
                <strong className="text-slate-900 dark:text-white">{orderToCancel?.consumerName}</strong>.
              </span>
              <span className="block">
                Se devolverán{" "}
                <strong className="text-red-600 dark:text-red-400">
                  ${orderToCancel?.totalAmount} {orderToCancel?.currency}
                </strong>{" "}
                a la tarjeta del paciente.
              </span>
              <span className="block font-semibold text-red-500 text-sm">
                Esta acción no se puede deshacer.
              </span>
            </DialogDescription>
          </DialogHeader>

          <Separator className="dark:bg-slate-800" />

          <DialogFooter className="sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOrderToCancel(null)}
              disabled={isSubmitting}
              className="border-slate-200 dark:border-slate-700"
            >
              Mantener Pedido
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting}
              onClick={async () => {
                if (orderToCancel) {
                  const success = await cancelOrder(
                    orderToCancel.id,
                    "Orden cancelada y dinero reembolsado al paciente.",
                    "No se pudo procesar el reembolso."
                  );
                  if (success) setOrderToCancel(null);
                }
              }}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sí, Reembolsar Dinero
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}