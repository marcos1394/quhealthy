"use client";

/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  Check,
  ExternalLink,
  FileText,
  ShoppingBag,
  RefreshCw,
  Sparkles,
  PackageCheck,
  ReceiptText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { useConsumerOrders } from "@/hooks/useConsumerOrders";

type StatusKey =
  | "PENDING_PAYMENT"
  | "PENDING_PRESCRIPTION_REVIEW"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | string;

export default function PatientOrdersPage() {
  const t = useTranslations("PatientOrders");
  const locale = useLocale();
  const { orders, isLoading, isUpdating, fetchOrders, handleMarkAsDelivered } =
    useConsumerOrders();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const activeOrders = orders.filter(
    (order) => !["DELIVERED", "CANCELLED"].includes(order.orderStatus)
  ).length;
  const shippedOrders = orders.filter(
    (order) => order.orderStatus === "SHIPPED"
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "DELIVERED"
  ).length;

  const getStatusConfig = (status: StatusKey) => {
    switch (status?.toUpperCase()) {
      case "PENDING_PAYMENT":
        return {
          label: t("status_pending_payment"),
          color:
            "border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-400",
          icon: Clock,
        };
      case "PENDING_PRESCRIPTION_REVIEW":
        return {
          label: t("status_pending_prescription_review"),
          color:
            "border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-900/40 dark:text-indigo-400",
          icon: FileText,
        };
      case "PROCESSING":
        return {
          label: t("status_processing"),
          color:
            "border-gray-200 text-gray-700 bg-gray-50 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300",
          icon: Package,
        };
      case "SHIPPED":
        return {
          label: t("status_shipped"),
          color:
            "border-teal-200 text-teal-700 bg-teal-50 dark:bg-teal-950/30 dark:border-teal-900/40 dark:text-teal-400",
          icon: Truck,
        };
      case "DELIVERED":
        return {
          label: t("status_delivered"),
          color:
            "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400",
          icon: CheckCircle2,
        };
      case "CANCELLED":
        return {
          label: t("status_cancelled"),
          color:
            "border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400",
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          color:
            "border-gray-200 text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400",
          icon: Package,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + "Z").toLocaleDateString(
      locale === "en" ? "en-US" : "es-MX",
      {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }
    );
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(locale === "en" ? "en-US" : "es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505]">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 lg:px-12 space-y-10">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-8">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-teal-600 dark:text-teal-400 shadow-sm">
                <ShoppingBag className="h-7 w-7" strokeWidth={2} />
              </div>
              <div className="max-w-2xl">
                <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 text-teal-700 dark:text-teal-300 px-3 py-1 text-xs font-bold shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>{t("badge_purchases")}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1.5">
                  {t("title")}
                </h1>
                <p className="text-xs sm:text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <Button
              onClick={() => fetchOrders()}
              disabled={isLoading}
              variant="outline"
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-11 px-5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-sm disabled:opacity-50 shrink-0 flex items-center gap-2"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 text-emerald-600 dark:text-emerald-400",
                  isLoading && "animate-spin"
                )}
                strokeWidth={2}
              />
              <span>{t("btn_sync")}</span>
            </Button>
          </div>

          {/* ── ESTADÍSTICAS ───────────────────────────────────────────── */}
          {orders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("stat_in_progress")}
                  </p>
                  <Package className="h-5 w-5 text-gray-400" strokeWidth={2} />
                </div>
                <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-mono">
                  {activeOrders}
                </p>
              </div>

              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("stat_in_transit")}
                  </p>
                  <Truck className="h-5 w-5 text-teal-500" strokeWidth={2} />
                </div>
                <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-mono">
                  {shippedOrders}
                </p>
              </div>

              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("stat_delivered")}
                  </p>
                  <PackageCheck
                    className="h-5 w-5 text-emerald-500"
                    strokeWidth={2}
                  />
                </div>
                <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-mono">
                  {deliveredOrders}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── ESTADO VACÍO ────────────────────────────────────────────── */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 text-center shadow-sm"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-teal-600 dark:text-teal-400 shadow-sm">
              <Truck className="h-8 w-8" strokeWidth={2} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              {t("empty_title")}
            </h2>
            <p className="mx-auto max-w-md text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("empty_desc")}
            </p>
          </motion.div>
        ) : (
          /* ── LISTADO DE ÓRDENES ──────────────────────────────────────── */
          <div className="space-y-8">
            <AnimatePresence>
              {orders.map((order, index) => {
                const statusCfg = getStatusConfig(order.orderStatus);
                const StatusIcon = statusCfg.icon;
                const isShipped = order.orderStatus === "SHIPPED";
                const isDelivered = order.orderStatus === "DELIVERED";
                const itemCount =
                  order.items?.reduce(
                    (total, item) => total + item.quantity,
                    0
                  ) || 0;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                  >
                    {/* Header de la Orden */}
                    <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col md:flex-row md:items-center justify-between">
                      <div className="p-6 sm:p-8 flex items-start gap-4 sm:gap-5">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0">
                          <StatusIcon
                            className="h-6 w-6 text-gray-600 dark:text-gray-300"
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-3 mb-1.5">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-none">
                              {t("order_number", { id: order.id })}
                            </h2>
                            <span
                              className={cn(
                                "border px-3 py-0.5 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm",
                                statusCfg.color
                              )}
                            >
                              <StatusIcon className="h-3.5 w-3.5" strokeWidth={2} />
                              <span>{statusCfg.label}</span>
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                            {order.providerName && (
                              <span className="text-gray-700 dark:text-gray-300 ml-2 font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-[11px]">
                                {order.providerName}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 self-stretch">
                        <div className="p-6 sm:p-8 border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center flex-1 md:flex-none">
                          <p className="text-xs font-bold text-gray-400 mb-1">
                            {t("units")}
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight font-mono">
                            {itemCount}
                          </p>
                        </div>
                        <div className="p-6 sm:p-8 flex flex-col justify-center flex-1 md:flex-none">
                          <p className="text-xs font-bold text-gray-400 mb-1">
                            {t("total_currency")}
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight font-mono">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cuerpo de la Orden */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-0">
                      
                      {/* Izquierda: Lista de Ítems */}
                      <div className="p-6 sm:p-8 border-b lg:border-b-0 border-gray-100 dark:border-gray-800">
                        <h4 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                          <ReceiptText className="h-4 w-4" strokeWidth={2} />
                          <span>{t("purchase_details")}</span>
                        </h4>
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-b border-gray-100 dark:border-gray-800">
                          {order.items?.map((item) => (
                            <li
                              key={item.id}
                              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-[#111] transition-colors rounded-xl px-2 -mx-2"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                                  {item.name}
                                </p>
                                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                  {t("item_qty", { qty: item.quantity })} •{" "}
                                  {t("item_type", {
                                    type: item.isDigital
                                      ? t("type_digital")
                                      : t("type_physical"),
                                  })}
                                </p>
                              </div>
                              <div className="shrink-0 sm:text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                                <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm font-mono">
                                  {formatCurrency(
                                    item.unitPrice * item.quantity
                                  )}
                                </p>
                                <p className="text-[10px] font-semibold text-gray-400 mt-0.5 font-mono">
                                  {formatCurrency(item.unitPrice)} {t("each")}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Derecha: Módulo de Logística */}
                      <div className="p-6 sm:p-8 bg-gray-50/50 dark:bg-[#050505] flex flex-col gap-6 lg:border-l border-gray-100 dark:border-gray-800 h-full">
                        
                        {/* Dirección / Método de Entrega */}
                        <div className="space-y-4">
                          {order.shippingAddress ? (
                            order.shippingAddress === "PICKUP" ? (
                              <div className="grid grid-cols-1 gap-4">
                                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4 shadow-sm flex flex-col justify-center">
                                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                                    <MapPin className="h-4 w-4 text-emerald-500" strokeWidth={2} />
                                    <span>{t("logistics_insitu")}</span>
                                  </h4>
                                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-1">
                                    {t("clinic_pickup")}
                                  </p>
                                  {order.pickupTime && (
                                    <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                                      <span>
                                        {t("appointment", {
                                          date: new Date(
                                            order.pickupTime
                                          ).toLocaleString(
                                            locale === "en" ? "en-US" : "es-MX",
                                            {
                                              year: "numeric",
                                              month: "short",
                                              day: "2-digit",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            }
                                          ),
                                        })}
                                      </span>
                                    </p>
                                  )}
                                </div>

                                {order.deliveryPin && (
                                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-sm flex flex-col justify-center">
                                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                                      <Sparkles className="h-4 w-4" strokeWidth={2} />
                                      <span>{t("pickup_pin")}</span>
                                    </h4>
                                    <p className="text-2xl font-bold tracking-widest text-emerald-600 dark:text-emerald-400 font-mono mb-1">
                                      {order.deliveryPin}
                                    </p>
                                    <p className="text-[10px] leading-tight font-semibold text-emerald-800/70 dark:text-emerald-400/70">
                                      {t("pickup_pin_hint")}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4 shadow-sm">
                                <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                                  <MapPin className="h-4 w-4 text-emerald-500" strokeWidth={2} />
                                  <span>{t("delivery_address")}</span>
                                </h4>
                                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                                  {(() => {
                                    try {
                                      const parsed = JSON.parse(order.shippingAddress);
                                      return `${parsed.street}, ${parsed.colony}, ${parsed.city}, ${parsed.state} ${parsed.zip}`;
                                    } catch (e) {
                                      return order.shippingAddress;
                                    }
                                  })()}
                                </p>
                              </div>
                            )
                          ) : (
                            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-sm">
                              <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                                {t("no_address_warning")}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* CTA de Rastreo (SHIPPED) */}
                        {isShipped && (
                          <div className="rounded-2xl border border-teal-200 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/20 p-5 space-y-4 shadow-sm">
                            <div>
                              <h4 className="mb-1 flex items-center text-xs font-bold text-teal-800 dark:text-teal-300">
                                <Truck className="mr-2 h-4 w-4" strokeWidth={2} />
                                <span>{t("transit_authorized")}</span>
                              </h4>
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                                {order.shippingCarrier && (
                                  <>
                                    {t("carrier", {
                                      carrier: order.shippingCarrier.replace(
                                        "_",
                                        " "
                                      ),
                                    })}
                                    <br />
                                  </>
                                )}
                                {order.trackingNumber && (
                                  <>
                                    {t("tracking_id", {
                                      tracking: order.trackingNumber,
                                    })}
                                  </>
                                )}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2.5">
                              {order.trackingUrl && (
                                <Button
                                  variant="outline"
                                  className="rounded-xl border border-teal-200 dark:border-teal-900/40 text-teal-800 dark:text-teal-300 bg-white dark:bg-[#0a0a0a] hover:bg-teal-50 dark:hover:bg-teal-950/30 w-full h-10 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                                  onClick={() =>
                                    window.open(order.trackingUrl, "_blank")
                                  }
                                >
                                  <ExternalLink className="h-4 w-4" strokeWidth={2} />
                                  <span>{t("btn_tracking_portal")}</span>
                                </Button>
                              )}

                              <Button
                                onClick={() => handleMarkAsDelivered(order.id)}
                                disabled={isUpdating === order.id}
                                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 w-full h-10 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 border-0 disabled:opacity-50"
                              >
                                {isUpdating === order.id ? (
                                  <QhSpinner size="sm" />
                                ) : (
                                  <Check className="h-4 w-4" strokeWidth={2.5} />
                                )}
                                <span>{t("btn_confirm_delivery")}</span>
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Entregado (DELIVERED) */}
                        {isDelivered && (
                          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-sm">
                            <h4 className="flex items-center text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                              <CheckCircle2 className="mr-2 h-4 w-4" strokeWidth={2} />
                              <span>{t("delivery_confirmed")}</span>
                            </h4>
                            <p className="text-xs font-medium text-emerald-900/80 dark:text-emerald-300/80">
                              {order.shippingCarrier
                                ? t("completed_via_carrier", {
                                    carrier: order.shippingCarrier.replace(
                                      "_",
                                      " "
                                    ),
                                  })
                                : t("completed_successfully")}
                            </p>
                          </div>
                        )}

                        {/* Cancelado (CANCELLED) */}
                        {order.orderStatus === "CANCELLED" && (
                          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-4 space-y-3 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                              <AlertCircle className="h-4 w-4" strokeWidth={2} />
                              <span>{t("cancellation_executed")}</span>
                            </div>

                            {order.rejectionReason && (
                              <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] p-3">
                                <p className="mb-0.5 text-[10px] font-bold text-rose-800 dark:text-rose-400">
                                  {t("issuer_decision")}
                                </p>
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  "{order.rejectionReason}"
                                </p>
                              </div>
                            )}
                            <p className="text-[11px] font-medium text-rose-800/80 dark:text-rose-400/80 leading-relaxed">
                              {t("refund_processed")}
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
    </div>
  );
}