"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  ExternalLink,
  FileText,
  ReceiptText,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

type StatusKey =
  | "PENDING_PAYMENT"
  | "PENDING_PRESCRIPTION_REVIEW"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | string;

interface OrderCardProps {
  order: any;
  index: number;
  isUpdating: number | null;
  onMarkAsDelivered: (id: number) => void;
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  const str = String(dateString);
  const hasTimezone = /(Z|[+-]\d{2}(:\d{2})?)$/.test(str);
  const date = new Date(hasTimezone ? str : `${str}Z`);

  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatCurrency(amount: number) {
  return (amount || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  });
}

export function OrderCard({
  order,
  index,
  isUpdating,
  onMarkAsDelivered,
}: OrderCardProps) {
  const t = useTranslations("OrderCard");

  const statusConfigs = useMemo<
    Record<
      string,
      { labelKey: string; color: string; icon: React.ElementType }
    >
  >(
    () => ({
      PENDING_PAYMENT: {
        labelKey: "status_pending_payment",
        color:
          "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
        icon: Clock,
      },
      PENDING_PRESCRIPTION_REVIEW: {
        labelKey: "status_pending_prescription_review",
        color:
          "bg-sky-50 text-sky-800 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200 dark:border-sky-900/40",
        icon: FileText,
      },
      PROCESSING: {
        labelKey: "status_processing",
        color:
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700",
        icon: Package,
      },
      SHIPPED: {
        labelKey: "status_shipped",
        color:
          "bg-sky-50 text-sky-800 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200 dark:border-sky-900/40",
        icon: Truck,
      },
      DELIVERED: {
        labelKey: "status_delivered",
        color:
          "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40",
        icon: CheckCircle2,
      },
      CANCELLED: {
        labelKey: "status_cancelled",
        color:
          "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40",
        icon: AlertCircle,
      },
    }),
    []
  );

  const statusKey = (order.orderStatus || "").toUpperCase();
  const statusCfg = statusConfigs[statusKey] || {
    labelKey: "status_processing",
    color:
      "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    icon: Package,
  };

  const StatusIcon = statusCfg.icon;
  const isShipped = statusKey === "SHIPPED";
  const isDelivered = statusKey === "DELIVERED";
  const isCancelled = statusKey === "CANCELLED";

  const itemCount =
    order.items?.reduce(
      (total: number, item: any) => total + item.quantity,
      0
    ) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
      className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xs font-sans transition-all overflow-hidden select-none"
    >
      {/* ── CABECERA DE ORDEN ────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex flex-col md:flex-row md:items-center justify-between">
        <div className="p-6 md:p-8 flex items-start gap-4 sm:gap-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <StatusIcon className="h-6 w-6" strokeWidth={2} />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("order_number", { id: order.id })}
              </h2>

              <span
                className={cn(
                  "border px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-2xs",
                  statusCfg.color
                )}
              >
                <StatusIcon className="h-3.5 w-3.5" strokeWidth={2} />
                <span>{t(statusCfg.labelKey)}</span>
              </span>
            </div>

            <p className="text-xs font-semibold text-gray-400">
              {formatDate(order.createdAt)}
              {order.providerName && (
                <span className="text-gray-700 dark:text-gray-300 ml-2 font-bold">
                  [{order.providerName}]
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 shrink-0">
          <div className="p-5 md:p-8 border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center flex-1 md:flex-none">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
              {t("units")}
            </p>
            <p className="text-base sm:text-lg font-mono font-bold text-gray-900 dark:text-white">
              {itemCount}
            </p>
          </div>

          <div className="p-5 md:p-8 flex flex-col justify-center flex-1 md:flex-none">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
              {t("total")}
            </p>
            <p className="text-base sm:text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* ── CUERPO DE DETALLES Y LOGÍSTICA ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-0">
        {/* Izquierda: Lista de Ítems */}
        <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              {t("acquisition_detail")}
            </h4>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-b border-gray-100 dark:border-gray-800">
            {order.items?.map((item: any) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors rounded-xl px-2 -mx-2"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] font-semibold text-gray-400 font-mono">
                    {t("qty", { qty: item.quantity })} •{" "}
                    {item.isDigital ? t("type_digital") : t("type_physical")}
                  </p>
                </div>

                <div className="shrink-0 sm:text-right flex sm:flex-col justify-between sm:justify-center items-baseline sm:items-end">
                  <p className="font-mono font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                  <p className="text-[10px] font-mono font-semibold text-gray-400">
                    {formatCurrency(item.unitPrice)} {t("unit_price")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Derecha: Módulo de Logística */}
        <div className="p-6 md:p-8 bg-gray-50/40 dark:bg-[#050505] flex flex-col justify-between space-y-6">
          {/* Dirección / Método de Entrega */}
          <div className="space-y-3">
            {order.shippingAddress ? (
              order.shippingAddress === "PICKUP" ? (
                <div className="border-l-2 border-emerald-500 pl-3.5 space-y-1">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <span>{t("pickup_title")}</span>
                  </h4>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {t("pickup_desc")}
                  </p>
                  {order.pickupTime && (
                    <p className="text-[11px] font-mono font-bold text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                      <span>
                        {t("pickup_appointment", {
                          date: formatDate(order.pickupTime),
                        })}
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="border-l-2 border-emerald-500 pl-3.5 space-y-1">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <span>{t("delivery_title")}</span>
                  </h4>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                    {order.shippingAddress}
                  </p>
                </div>
              )
            ) : (
              <div className="border-l-2 border-amber-400 pl-3.5">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                  {t("no_address")}
                </p>
              </div>
            )}
          </div>

          {/* CTA de Rastreo (SHIPPED) */}
          {isShipped && (
            <div className="border-l-2 border-sky-500 pl-3.5 space-y-4 pt-2">
              <div className="space-y-1">
                <h4 className="flex items-center text-xs font-bold text-sky-800 dark:text-sky-300">
                  <Truck className="mr-1.5 h-4 w-4 text-sky-600 dark:text-sky-400" strokeWidth={2} />
                  <span>{t("shipped_title")}</span>
                </h4>
                <div className="text-xs font-mono font-semibold text-gray-600 dark:text-gray-400 space-y-0.5">
                  {order.shippingCarrier && (
                    <p>
                      {t("carrier")}{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {order.shippingCarrier.replace("_", " ")}
                      </span>
                    </p>
                  )}
                  {order.trackingNumber && (
                    <p>
                      {t("tracking_id")}{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {order.trackingNumber}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {order.trackingUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-sky-200 dark:border-sky-900/40 bg-white dark:bg-[#0a0a0a] text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 w-full h-10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    onClick={() => window.open(order.trackingUrl, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                    <span>{t("btn_tracking")}</span>
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={() => onMarkAsDelivered(order.id)}
                  disabled={isUpdating === order.id}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white w-full h-10 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 border-0 cursor-pointer disabled:opacity-50"
                >
                  {isUpdating === order.id ? (
                    <>
                      <QhSpinner size="sm" className="text-white mr-1" />
                      <span>{t("btn_confirming")}</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" strokeWidth={2} />
                      <span>{t("btn_confirm_delivered")}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Entregado (DELIVERED) */}
          {isDelivered && (
            <div className="border-l-2 border-emerald-500 pl-3.5 space-y-1">
              <h4 className="flex items-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("delivered_title")}</span>
              </h4>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                {order.shippingCarrier
                  ? t("delivered_desc_carrier", {
                      carrier: order.shippingCarrier.replace("_", " "),
                    })
                  : t("delivered_desc_generic")}
              </p>
            </div>
          )}

          {/* Cancelado (CANCELLED) */}
          {isCancelled && (
            <div className="border-l-2 border-rose-500 pl-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" strokeWidth={2} />
                <h4>{t("cancelled_title")}</h4>
              </div>

              {order.rejectionReason && (
                <div className="border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-3 rounded-xl space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    {t("rejection_reason_title")}
                  </p>
                  <p className="text-xs font-medium italic text-rose-700/90 dark:text-rose-400">
                    "{order.rejectionReason}"
                  </p>
                </div>
              )}

              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {t("reconciliation_note")}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}