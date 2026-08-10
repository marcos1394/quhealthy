"use client";

/* eslint-disable react-doctor/js-hoist-intl */

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  ShoppingBag,
  Truck,
  ReceiptText,
  Package,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useBookingStore } from "@/hooks/useBookingStore";
import { paymentService } from "@/services/payment.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import Script from "next/script";

import { BackgroundEffects } from "@/components/booking/success/SuccessEffects";

interface ReceiptItemDto {
  quantity: number;
  name: string;
  type: string;
}

interface UnifiedReceiptResponse {
  transactionId: string;
  date: string;
  totalPaid: number;
  currency: string;
  paymentMethod: string;
  customerName: string;
  shippingAddress?: string;
  pickupTime?: string;
  items: ReceiptItemDto[];
}

export default function HybridSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const t = useTranslations("PatientHybridSuccess");
  const locale = useLocale();
  const dateLocale = locale === "en" ? enUS : es;

  const clearCart = useBookingStore((state) => state.clearCart);

  const [receipt, setReceipt] = useState<UnifiedReceiptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    clearCart();

    const fetchReceipt = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await paymentService.getUnifiedReceipt(sessionId);
        setReceipt(data);
      } catch (error) {
        console.error("Error al obtener el recibo unificado:", error);
        toast.error(t("error_toast"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipt();
  }, [sessionId, clearCart, t]);

  // ==========================================
  // 🚦 ESTADOS DE CARGA Y ERROR
  // ==========================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="w-16 h-16 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-6 shadow-sm">
          <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          {t("not_found_title")}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
          {t("not_found_desc")} <br />
          <span className="text-[11px] font-mono text-gray-400 mt-2 block break-all bg-gray-100 dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-800">
            {t("session_id_label")} {sessionId || "N/A"}
          </span>
        </p>
        <Button
          onClick={() => router.push("/patient/dashboard")}
          className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-12 px-8 text-xs sm:text-sm font-bold shadow-sm transition-colors"
        >
          {t("return_to_dashboard")}
        </Button>
      </div>
    );
  }

  // ==========================================
  // ✨ RENDERIZADO PRINCIPAL
  // ==========================================

  const formattedTotal = new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", {
    style: "currency",
    currency: receipt.currency || "MXN",
  }).format(receipt.totalPaid || 0);

  const rawDate = parseInt(receipt.date, 10);
  const dateObj = isNaN(rawDate) ? new Date() : new Date(rawDate * 1000);

  const formattedDate = format(
    dateObj,
    locale === "en" ? "dd MMM yyyy, HH:mm 'hrs'" : "dd MMM yyyy, HH:mm 'HRS'",
    { locale: dateLocale }
  );

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "SERVICE":
        return t("item_type_service");
      case "PRODUCT":
        return t("item_type_product");
      case "DIGITAL":
        return t("item_type_digital");
      default:
        return t("item_type_other");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white relative overflow-hidden py-12 px-6 sm:px-12 lg:px-24 pb-32 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      {receipt && (
        <>
          <Script id="gcr-init-hybrid" strategy="afterInteractive">
            {`
              window.renderOptIn = function() {
                // Calcular fecha de entrega dinámicamente
                var hasPhysicalProduct = ${receipt.items.some(i => i.type === 'PRODUCT')};
                var isDelivery = ${!!receipt.shippingAddress};
                var pickupTimeStr = "${receipt.pickupTime || ''}";
                var deliveryDate = new Date();
                
                // Si es un producto físico y se enviará a domicilio, sumamos 5 días.
                // Si es Pick Up en sitio, usamos la fecha seleccionada o sumamos 2 días por defecto.
                if (hasPhysicalProduct && isDelivery) {
                  deliveryDate.setDate(deliveryDate.getDate() + 5);
                } else if (hasPhysicalProduct && !isDelivery) {
                  if (pickupTimeStr) {
                    deliveryDate = new Date(pickupTimeStr);
                  } else {
                    deliveryDate.setDate(deliveryDate.getDate() + 2); // 2 días para pick up por defecto
                  }
                }
                
                var formattedDate = deliveryDate.toISOString().split('T')[0];

                window.gapi.load('surveyoptin', function() {
                  window.gapi.surveyoptin.render({
                    "merchant_id": 5836869157,
                    "order_id": "${receipt.transactionId}",
                    "email": "${receipt.customerName || ''}",
                    "delivery_country": "MX",
                    "estimated_delivery_date": formattedDate
                  });
                });
              }
            `}
          </Script>
          <Script src="https://apis.google.com/js/platform.js?onload=renderOptIn" strategy="afterInteractive" />
        </>
      )}

      <BackgroundEffects />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header de Éxito */}
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="w-8 h-8" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
              {t("payment_success_title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              {t("payment_success_desc")}
            </p>
          </div>

          {/* Tarjeta del Recibo */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            
            {/* Header del Ticket */}
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  {t("purchase_folio")}
                </p>
                <p className="text-xs font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-[#050505] border border-gray-200 dark:border-gray-800 px-3 py-1 rounded-lg w-fit shadow-sm">
                  {receipt.transactionId
                    .replace("cs_test_", "***")
                    .substring(0, 18)}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  {t("date_and_time")}
                </p>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {formattedDate}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {/* Dirección de envío (Si aplica) */}
              {receipt.shippingAddress && (
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/30 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Truck className="w-4 h-4" strokeWidth={2} />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t("shipping_address")}
                    </h3>
                  </div>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                    {receipt.shippingAddress}
                  </p>
                </div>
              )}

              {/* Lista de Items */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <Package className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                  {t("purchase_summary")}
                </h3>

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {receipt.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-4 hover:bg-gray-50/50 dark:hover:bg-[#111]/30 transition-colors -mx-2 px-2 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shrink-0">
                          {item.quantity}x
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                            {getItemTypeLabel(item.type)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Footer */}
            <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/30 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("total_paid")}
              </span>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {formattedTotal}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push("/patient/dashboard/orders")}
              variant="outline"
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] h-12 px-6 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <ReceiptText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("view_orders")}</span>
            </Button>

            <Button
              onClick={() => router.push("/patient/dashboard")}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-12 px-8 text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>{t("go_home")}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}