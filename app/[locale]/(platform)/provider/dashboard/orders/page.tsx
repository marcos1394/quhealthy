// app/[locale]/(platform)/provider/dashboard/orders/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Package, Truck, CheckCircle2, Loader2, MapPin, XCircle,
  Printer, Clock, CreditCard, Ban, ShoppingBag, Eye, Mail,
  ExternalLink, Copy
} from "lucide-react";

import { useProviderOrders } from "@/hooks/useProviderOrders";
import { OrderResponseDto, OrderStatus, PaymentStatus } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Separator } from "@/components/ui/separator";

// ── Status configs ────────────────────────────────────────────────────────────
const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; className: string }> = {
  PENDING_PAYMENT: { label: "Pago Pendiente", icon: Clock,         className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30" },
  PROCESSING:      { label: "En Proceso",     icon: Package,       className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30" },
  SHIPPED:         { label: "Enviado",         icon: Truck,         className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30" },
  DELIVERED:       { label: "Entregado",       icon: CheckCircle2,  className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30" },
  CANCELLED:       { label: "Cancelado",       icon: Ban,           className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30" },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING:   { label: "Pendiente",   className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  COMPLETED: { label: "Pagado",      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
  FAILED:    { label: "Fallido",     className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
  REFUNDED:  { label: "Reembolsado", className: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
};

function getOrderStatus(raw: string): OrderStatus | null {
  const map: Record<string, OrderStatus> = {
    PENDING_PAYMENT: "PENDING_PAYMENT", PROCESSING: "PROCESSING",
    SHIPPED: "SHIPPED", DELIVERED: "DELIVERED", CANCELLED: "CANCELLED",
  };
  return map[raw?.toUpperCase?.()] ?? null;
}

function getPaymentStatus(raw: string): PaymentStatus | null {
  const map: Record<string, PaymentStatus> = {
    PENDING: "PENDING", COMPLETED: "COMPLETED", FAILED: "FAILED", REFUNDED: "REFUNDED",
  };
  return map[raw?.toUpperCase?.()] ?? null;
}

// ── Order Card (mobile-first, replaces table row) ─────────────────────────────
function OrderCard({
  order, i,
  onShip, onCancel, onDeliver, onSlip, onView,
}: {
  order: OrderResponseDto; i: number;
  onShip: () => void; onCancel: () => void;
  onDeliver: (id: number) => void; onSlip: (id: number) => void;
  onView: () => void;
}) {
  const status  = getOrderStatus(order.orderStatus);
  const pStatus = getPaymentStatus(order.paymentStatus);
  const isProcessing = status === "PROCESSING";
  const isShipped    = status === "SHIPPED";
  const osCfg  = status  ? ORDER_STATUS_CONFIG[status]   : null;
  const psCfg  = pStatus ? PAYMENT_STATUS_CONFIG[pStatus] : null;
  const OsIcon = osCfg?.icon ?? Package;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Row 1: order id + amount + status badges */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <span className="font-black text-slate-900 dark:text-white text-lg">#{order.id}</span>
          <div className="text-xs text-slate-400 mt-0.5">
            {format(new Date(order.createdAt + "Z"), "d MMM yyyy · HH:mm", { locale: es })}
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700">
            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              ${order.totalAmount} <span className="font-normal text-slate-400 text-xs">{order.currency}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {osCfg && (
            <Badge className={`text-xs font-semibold border px-2 py-1 flex items-center gap-1.5 ${osCfg.className}`}>
              <OsIcon className="w-3 h-3 shrink-0" />{osCfg.label}
            </Badge>
          )}
          {psCfg && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${psCfg.className}`}>
              {psCfg.label}
            </span>
          )}
          {order.trackingNumber && (
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md">
              <span className="text-[10px] text-slate-400 block">Guía</span>
              <strong>{order.trackingNumber}</strong>
            </div>
          )}
        </div>
      </div>

      <Separator className="dark:bg-slate-800 my-3" />

      {/* Row 2: patient info */}
      <div className="mb-3">
        <p className="font-bold text-slate-900 dark:text-white text-sm">{order.consumerName}</p>
        <p className="text-xs text-slate-400 truncate">{order.consumerEmail}</p>
        {order.shippingAddress && (
          <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 p-2 rounded-lg mt-2">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-medical-500" />
            <span className="line-clamp-2">{order.shippingAddress}</span>
          </div>
        )}
      </div>

      {/* Row 3: items */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {order.items.filter(it => !it.isDigital).map((item, idx) => (
          <span key={idx} className="inline-flex items-center gap-1.5 bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-400 border border-medical-100 dark:border-medical-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">
            ×{item.quantity} {item.itemName}
          </span>
        ))}
        {order.items.filter(it => !it.isDigital).length === 0 && (
          <span className="text-xs text-slate-400 italic">Solo digitales</span>
        )}
      </div>

      {/* Row 4: actions — horizontal wrap */}
      <div className="flex flex-wrap gap-2">
        {/* Ver detalles — always visible */}
        <Button size="sm" variant="ghost"
          className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={onView}
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" /> Ver Detalles
        </Button>

        {isProcessing && (
          <>
            <Button size="sm"
              className="bg-medical-600 hover:bg-medical-700 text-white dark:bg-medical-500 dark:hover:bg-medical-600"
              onClick={onShip}
            >
              <Truck className="w-3.5 h-3.5 mr-1.5" /> Enviar
            </Button>
            <Button size="sm" variant="ghost"
              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={onCancel}
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancelar
            </Button>
          </>
        )}

        {isShipped && (
          <Button size="sm" variant="outline"
            className="border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
            onClick={() => onDeliver(order.id)}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Marcar Entregado
          </Button>
        )}

        {(isProcessing || isShipped) && (
          <Button size="sm" variant="outline"
            className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            onClick={() => onSlip(order.id)}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Imprimir
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProviderOrdersPage() {
  const t = useTranslations("ProviderOrders");
  const {
    orders, isLoading, isSubmitting,
    fetchOrders, shipOrder, markAsDelivered, cancelOrder, downloadSlip,
  } = useProviderOrders();

  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [orderToCancel,  setOrderToCancel]  = useState<OrderResponseDto | null>(null);
  const [orderToView,    setOrderToView]    = useState<OrderResponseDto | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => { fetchOrders(t("toast_load_error")); }, [fetchOrders, t]);

  const handleShipSubmit = async () => {
    if (!selectedOrder || trackingNumber.trim().length < 5) return;
    const ok = await shipOrder(selectedOrder.id, trackingNumber.trim(), t("toast_ship_success"), t("toast_ship_error"));
    if (ok) { setSelectedOrder(null); setTrackingNumber(""); }
  };

  const processingCount = orders.filter(o => getOrderStatus(o.orderStatus) === "PROCESSING").length;
  const shippedCount    = orders.filter(o => getOrderStatus(o.orderStatus) === "SHIPPED").length;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 font-sans">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
            <ShoppingBag className="w-7 h-7 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t("title")}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t("subtitle")}</p>
          </div>
        </div>
        {!isLoading && orders.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {processingCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30">
                <Package className="w-3 h-3" />{processingCount} En Proceso
              </span>
            )}
            {shippedCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30">
                <Truck className="w-3 h-3" />{shippedCount} Enviados
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Orders list */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <QhSpinner size="lg" />
          <p className="text-sm text-slate-400">{t("loading")}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
          <ShoppingBag className="w-12 h-12 opacity-25" />
          <p className="font-medium">{t("empty_state")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <OrderCard
              key={order.id} order={order} i={i}
              onShip={() => setSelectedOrder(order)}
              onCancel={() => setOrderToCancel(order)}
              onDeliver={(id) => markAsDelivered(id, t("toast_deliver_success"), t("toast_deliver_error"))}
              onSlip={(id) => downloadSlip(id, "Hoja de empaque descargada", "Error al descargar")}
              onView={() => setOrderToView(order)}
            />
          ))}
        </div>
      )}

      {/* ── MODAL: Agregar Número de Guía ─────────────────────────────────── */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-medical-500" />{t("modal_title")}
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
              className="font-mono"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleShipSubmit()}
            />
            <p className="text-xs text-slate-400 mt-2">Mínimo 5 caracteres.</p>
          </div>
          <Separator className="dark:bg-slate-800" />
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>{t("btn_cancel")}</Button>
            <Button className="bg-medical-600 text-white hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600"
              onClick={handleShipSubmit} disabled={isSubmitting || trackingNumber.trim().length < 5}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              {t("btn_confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: Confirmar Cancelación ──────────────────────────────────── */}
      <Dialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/50">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Confirmar Cancelación
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300 pt-1 space-y-2">
              <span className="block">
                Vas a cancelar la Orden <strong className="text-slate-900 dark:text-white">#{orderToCancel?.id}</strong> de{" "}
                <strong className="text-slate-900 dark:text-white">{orderToCancel?.consumerName}</strong>.
              </span>
              <span className="block">
                Se devolverán{" "}
                <strong className="text-red-600 dark:text-red-400">${orderToCancel?.totalAmount} {orderToCancel?.currency}</strong>{" "}
                a la tarjeta del paciente.
              </span>
              <strong className="block text-red-500 text-sm">Esta acción no se puede deshacer.</strong>
            </DialogDescription>
          </DialogHeader>
          <Separator className="dark:bg-slate-800" />
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setOrderToCancel(null)} disabled={isSubmitting}>Mantener Pedido</Button>
            <Button variant="destructive" disabled={isSubmitting}
              onClick={async () => {
                if (orderToCancel) {
                  const ok = await cancelOrder(orderToCancel.id, "Orden cancelada y dinero reembolsado.", "No se pudo procesar el reembolso.");
                  if (ok) setOrderToCancel(null);
                }
              }}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sí, Reembolsar Dinero
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: Ver Detalles del Pedido ────────────────────────────────── */}
      <Dialog open={!!orderToView} onOpenChange={(open) => !open && setOrderToView(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-medical-500" />
              Detalles del Pedido #{orderToView?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Información de Contacto */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Información de Contacto</h4>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white text-lg">{orderToView?.consumerName}</p>
                <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                  <span className="text-slate-600 dark:text-slate-400 text-sm truncate">{orderToView?.consumerEmail}</span>
                  <a
                    href={`mailto:${orderToView?.consumerEmail}?subject=Sobre tu pedido #${orderToView?.id} en QuHealthy`}
                    className="flex items-center gap-1 text-xs font-bold text-medical-600 dark:text-medical-400 hover:underline bg-medical-50 dark:bg-medical-500/10 px-2 py-1 rounded-md shrink-0"
                  >
                    <Mail className="w-3 h-3" /> Contactar
                  </a>
                </div>
              </div>
            </div>

            {/* Destino de Entrega */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Destino de Entrega</h4>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {orderToView?.shippingAddress ? (
                  <>
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {orderToView.shippingAddress}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(orderToView.shippingAddress || "");
                          toast.success("Dirección copiada al portapapeles", { theme: "colored" });
                        }}
                      >
                        <Copy className="w-3 h-3 mr-1.5" /> Copiar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(orderToView.shippingAddress || "")}`, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3 mr-1.5" /> Ver en Maps
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium text-center py-2">
                    Sin dirección (Entrega Digital)
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setOrderToView(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}