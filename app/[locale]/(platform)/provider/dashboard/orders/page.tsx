"use client";

/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-autofocus */
/* eslint-disable react-doctor/js-combine-iterations */

import React, { useState, useEffect, useReducer, useCallback } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-toastify";
import {
  Package,
  Truck,
  CheckCircle2,
  Loader2,
  MapPin,
  XCircle,
  Printer,
  Clock,
  CreditCard,
  Ban,
  ShoppingBag,
  Eye,
  Mail,
  ExternalLink,
  Copy,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { useProviderOrders } from "@/hooks/useProviderOrders";
import { storageService } from "@/services/storage.service";
import { OrderResponseDto, OrderStatus, PaymentStatus } from "@/types/order";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Status mapping helpers ───────────────────────────────────────────────────
function getOrderStatus(raw: string): OrderStatus | null {
  const map: Record<string, OrderStatus> = {
    PENDING_PAYMENT: "PENDING_PAYMENT",
    PROCESSING: "PROCESSING",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
  };
  return map[raw?.toUpperCase?.()] ?? null;
}

function getPaymentStatus(raw: string): PaymentStatus | null {
  const map: Record<string, PaymentStatus> = {
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    REFUNDED: "REFUNDED",
  };
  return map[raw?.toUpperCase?.()] ?? null;
}

// ── Carriers ──────────────────────────────────────────────────────────────────
const CARRIERS = [
  { value: "DHL", label: "DHL Express" },
  { value: "FEDEX", label: "FedEx" },
  { value: "ESTAFETA", label: "Estafeta" },
  { value: "REDPACK", label: "Redpack" },
  { value: "UBER_FLASH", label: "Uber Flash (Local)" },
  { value: "IN_HOUSE", label: "Flota Interna" },
  { value: "OTHER", label: "Externo / Otro" },
];

// ── Subcomponent: Order Card (Ficha de Despacho) ──────────────────────────────
function OrderCard({
  order,
  onShip,
  onCancel,
  onDeliver,
  onSlip,
  onView,
  onDeliverWithPin,
}: {
  order: OrderResponseDto;
  i: number;
  onShip: () => void;
  onCancel: () => void;
  onDeliver: (id: number) => void;
  onSlip: (id: number) => void;
  onView: () => void;
  onReject: () => void;
  onDeliverWithPin: (order: OrderResponseDto) => void;
}) {
  const t = useTranslations("ProviderOrders");
  const status = getOrderStatus(order.orderStatus);
  const pStatus = getPaymentStatus(order.paymentStatus);

  const isProcessing = status === "PROCESSING";
  const isShipped = status === "SHIPPED";

  const statusConfigs: Record<
    OrderStatus,
    { label: string; icon: React.ElementType; className: string }
  > = {
    PENDING_PAYMENT: {
      label: t("status.pending_payment"),
      icon: Clock,
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-400",
    },
    PROCESSING: {
      label: t("status.processing"),
      icon: Package,
      className:
        "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-400",
    },
    SHIPPED: {
      label: t("status.shipped"),
      icon: Truck,
      className:
        "border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/40 dark:text-indigo-400",
    },
    DELIVERED: {
      label: t("status.delivered"),
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400",
    },
    CANCELLED: {
      label: t("status.cancelled"),
      icon: Ban,
      className:
        "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400",
    },
  };

  const paymentConfigs: Record<
    PaymentStatus,
    { label: string; className: string }
  > = {
    PENDING: {
      label: t("payment_status.pending"),
      className:
        "border-gray-200 bg-gray-50 text-gray-600 dark:bg-gray-800/60 dark:border-gray-800 dark:text-gray-400",
    },
    COMPLETED: {
      label: t("payment_status.completed"),
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400",
    },
    FAILED: {
      label: t("payment_status.failed"),
      className:
        "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400",
    },
    REFUNDED: {
      label: t("payment_status.refunded"),
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-400",
    },
  };

  const osCfg = status ? statusConfigs[status] : null;
  const psCfg = pStatus ? paymentConfigs[pStatus] : null;
  const OsIcon = osCfg?.icon ?? Package;

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Header Técnico */}
      <div className="flex flex-col md:flex-row md:items-start justify-between p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono font-bold text-base text-gray-900 dark:text-white leading-none">
              DOC-{order.id.toString().padStart(4, "0")}
            </span>
            {osCfg && (
              <span
                className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-sm border",
                  osCfg.className
                )}
              >
                <OsIcon className="w-3.5 h-3.5" strokeWidth={2} />
                {osCfg.label}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2">
            {format(new Date(order.createdAt + "Z"), "dd MMM yyyy · HH:mm", {
              locale: es,
            })}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" strokeWidth={2} />
            <span className="text-xl font-mono font-bold tracking-tight text-gray-900 dark:text-white leading-none">
              ${order.totalAmount}{" "}
              <span className="text-xs font-sans text-gray-400 ml-0.5">
                {order.currency}
              </span>
            </span>
          </div>
          {psCfg && (
            <span
              className={cn(
                "px-2.5 py-0.5 text-[10px] font-bold rounded-full border shadow-sm",
                psCfg.className
              )}
            >
              {psCfg.label}
            </span>
          )}
        </div>
      </div>

      {/* Datos de Entrega */}
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
        <p className="font-bold text-sm text-gray-900 dark:text-white mb-0.5">
          {order.consumerName}
        </p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
          {order.consumerEmail}
        </p>

        {order.shippingAddress && (
          <div className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800">
            <MapPin
              className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
              strokeWidth={2}
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
              {order.shippingAddress}
            </span>
          </div>
        )}

        {order.trackingNumber && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {t("card.tracking_label")}
            </span>
            <span className="font-mono text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0a0a0a] px-3 py-1 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              {order.trackingNumber}
            </span>
          </div>
        )}
      </div>

      {/* Partidas de Despacho */}
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          {t("card.items_title")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {order.items
            .filter((it) => !it.isDigital)
            .map((item, idx) => (
              <span
                key={idx}
                className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold">
                  {item.quantity}
                </span>
                {item.itemName}
              </span>
            ))}
          {order.items.filter((it) => !it.isDigital).length === 0 && (
            <span className="text-xs font-medium text-gray-400 italic">
              {t("card.digital_delivery")}
            </span>
          )}
        </div>
      </div>

      {/* Comandos Inferiores */}
      <div className="flex flex-col sm:flex-row bg-gray-50/50 dark:bg-[#050505] p-4 gap-2.5">
        <Button
          variant="outline"
          className="flex-1 h-10 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
          onClick={onView}
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
          <span>{t("card.btn_details")}</span>
        </Button>

        {(isProcessing || isShipped) && (
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
            onClick={() => onSlip(order.id)}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
            <span>{t("card.btn_print_slip")}</span>
          </Button>
        )}

        {isProcessing && (
          <>
            {order.prescriptionUrls && !order.prescriptionApproved ? (
              <Button
                variant="outline"
                className="flex-1 h-10 rounded-xl border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-sm"
                onClick={onView}
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                <span>{t("card.btn_verify_prescription")}</span>
              </Button>
            ) : order.shippingAddress === "PICKUP" ? (
              <Button
                onClick={() => onDeliverWithPin(order)}
                className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold border-0 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                <span>{t("card.btn_deliver_pin")}</span>
              </Button>
            ) : (
              <Button
                onClick={onShip}
                className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold border-0 shadow-sm transition-all"
              >
                <Truck className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                <span>{t("card.btn_mark_shipped")}</span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-10 rounded-xl border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white text-xs font-bold shadow-sm transition-all"
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
              <span>{t("card.btn_cancel")}</span>
            </Button>
          </>
        )}

        {isShipped && (
          <Button
            onClick={() => onDeliver(order.id)}
            className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold border-0 shadow-sm transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
            <span>{t("card.btn_confirm_delivery")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Subcomponent: Prescription Viewer ─────────────────────────────────────────
function PrescriptionViewer({
  prescriptionUrls,
}: {
  prescriptionUrls?: string;
}) {
  const t = useTranslations("ProviderOrders");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!prescriptionUrls) return null;

  const handleView = async (itemId: string, fileKey: string) => {
    setLoadingId(itemId);
    try {
      const signedUrl = await storageService.getReadUrl(fileKey);
      window.open(signedUrl, "_blank");
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.doc_view_error"));
    } finally {
      setLoadingId(null);
    }
  };

  try {
    const urls = JSON.parse(prescriptionUrls) as Record<string, string>;
    const entries = Object.entries(urls);
    if (entries.length === 0) return null;

    return (
      <div className="p-6 md:p-8 bg-amber-50/40 dark:bg-amber-950/10 border-b border-gray-100 dark:border-gray-800 flex flex-col space-y-3">
        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" strokeWidth={2} />
          <span>{t("prescriptions.title")}</span>
        </h4>
        <div className="flex flex-col gap-2.5">
          {entries.map(([itemId, fileKey]) => (
            <Button
              key={itemId}
              variant="outline"
              disabled={loadingId === itemId}
              onClick={() => handleView(itemId, fileKey)}
              className="h-12 px-4 flex items-center justify-between rounded-xl border-amber-200 dark:border-amber-900/40 bg-white dark:bg-[#0a0a0a] text-amber-800 dark:text-amber-300 text-xs font-bold shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                {loadingId === itemId ? (
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                ) : (
                  <FileText className="w-4 h-4" strokeWidth={2} />
                )}
                <span>{t("prescriptions.item_ref", { id: itemId })}</span>
              </div>
              <span className="text-[11px] opacity-70">
                {loadingId === itemId
                  ? t("prescriptions.opening")
                  : t("prescriptions.btn_view")}
              </span>
            </Button>
          ))}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

// ── State Reducer Interface ───────────────────────────────────────────────────
interface State {
  selectedOrder: OrderResponseDto | null;
  orderToCancel: OrderResponseDto | null;
  orderToView: OrderResponseDto | null;
  orderToReject: OrderResponseDto | null;
  orderToDeliverWithPin: OrderResponseDto | null;
  trackingNumber: string;
  shippingCarrier: string;
  rejectionReasonInput: string;
  deliveryPinInput: string;
  evidenceUrl: string;
  isUploading: boolean;
}

type Action =
  | { type: "SET_SELECTEDORDER"; payload: OrderResponseDto | null }
  | { type: "SET_ORDERTOCANCEL"; payload: OrderResponseDto | null }
  | { type: "SET_ORDERTOVIEW"; payload: OrderResponseDto | null }
  | { type: "SET_ORDERTOREJECT"; payload: OrderResponseDto | null }
  | { type: "SET_ORDERTODELIVERWITHPIN"; payload: OrderResponseDto | null }
  | { type: "SET_TRACKINGNUMBER"; payload: string }
  | { type: "SET_SHIPPINGCARRIER"; payload: string }
  | { type: "SET_REJECTIONREASONINPUT"; payload: string }
  | { type: "SET_DELIVERYPININPUT"; payload: string }
  | { type: "SET_EVIDENCEURL"; payload: string }
  | { type: "SET_ISUPLOADING"; payload: boolean };

const initialState: State = {
  selectedOrder: null,
  orderToCancel: null,
  orderToView: null,
  orderToReject: null,
  orderToDeliverWithPin: null,
  trackingNumber: "",
  shippingCarrier: "DHL",
  rejectionReasonInput: "Receta médica inválida o ilegible",
  deliveryPinInput: "",
  evidenceUrl: "",
  isUploading: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SELECTEDORDER":
      return { ...state, selectedOrder: action.payload };
    case "SET_ORDERTOCANCEL":
      return { ...state, orderToCancel: action.payload };
    case "SET_ORDERTOVIEW":
      return { ...state, orderToView: action.payload };
    case "SET_ORDERTOREJECT":
      return { ...state, orderToReject: action.payload };
    case "SET_ORDERTODELIVERWITHPIN":
      return { ...state, orderToDeliverWithPin: action.payload };
    case "SET_TRACKINGNUMBER":
      return { ...state, trackingNumber: action.payload };
    case "SET_SHIPPINGCARRIER":
      return { ...state, shippingCarrier: action.payload };
    case "SET_REJECTIONREASONINPUT":
      return { ...state, rejectionReasonInput: action.payload };
    case "SET_DELIVERYPININPUT":
      return { ...state, deliveryPinInput: action.payload };
    case "SET_EVIDENCEURL":
      return { ...state, evidenceUrl: action.payload };
    case "SET_ISUPLOADING":
      return { ...state, isUploading: action.payload };
    default:
      return state;
  }
}

// ── Main Page Component ──────────────────────────────────────────────────────
export default function ProviderOrdersPage() {
  const t = useTranslations("ProviderOrders");
  const {
    orders,
    isLoading,
    isSubmitting,
    fetchOrders,
    shipOrder,
    markAsDelivered,
    deliverWithPin,
    cancelOrder,
    downloadSlip,
    rejectOrder,
    approvePrescription,
  } = useProviderOrders();

  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    selectedOrder,
    orderToCancel,
    orderToView,
    orderToReject,
    orderToDeliverWithPin,
    trackingNumber,
    shippingCarrier,
    rejectionReasonInput,
    deliveryPinInput,
    evidenceUrl,
    isUploading,
  } = state;

  useEffect(() => {
    fetchOrders(t("toasts.fetch_error"));
  }, [fetchOrders, t]);

  const handleShipSubmit = async () => {
    if (!selectedOrder || trackingNumber.trim().length < 5) return;
    const ok = await shipOrder(
      selectedOrder.id,
      trackingNumber.trim(),
      t("toasts.ship_success"),
      t("toasts.ship_error"),
      shippingCarrier,
      evidenceUrl
    );
    if (ok) {
      dispatch({ type: "SET_SELECTEDORDER", payload: null });
      dispatch({ type: "SET_TRACKINGNUMBER", payload: "" });
      dispatch({ type: "SET_SHIPPINGCARRIER", payload: "DHL" });
      dispatch({ type: "SET_EVIDENCEURL", payload: "" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch({ type: "SET_ISUPLOADING", payload: true });
    try {
      const uploadedUrl = URL.createObjectURL(file);
      dispatch({ type: "SET_EVIDENCEURL", payload: uploadedUrl });
      toast.success(t("toasts.evidence_success"));
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.evidence_error"));
    } finally {
      dispatch({ type: "SET_ISUPLOADING", payload: false });
    }
  };

  const handleCopyAddress = useCallback((addr: string) => {
    navigator.clipboard
      .writeText(addr)
      .then(() => toast.success(t("toasts.address_copied")))
      .catch(() => toast.error(t("toasts.doc_view_error")));
  }, [t]);

  const processingCount = orders.filter(
    (o) => getOrderStatus(o.orderStatus) === "PROCESSING"
  ).length;

  const shippedCount = orders.filter(
    (o) => getOrderStatus(o.orderStatus) === "SHIPPED"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <ShoppingBag className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>

          {!isLoading && orders.length > 0 && (
            <div className="flex flex-wrap gap-2.5 shrink-0">
              {processingCount > 0 && (
                <span className="flex items-center gap-2 h-10 px-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-400 text-xs font-bold shadow-sm">
                  <Package className="w-4 h-4" strokeWidth={2} />
                  <span>{t("processing_count", { count: processingCount })}</span>
                </span>
              )}
              {shippedCount > 0 && (
                <span className="flex items-center gap-2 h-10 px-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/40 dark:text-indigo-400 text-xs font-bold shadow-sm">
                  <Truck className="w-4 h-4" strokeWidth={2} />
                  <span>{t("shipped_count", { count: shippedCount })}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── LISTA DE PEDIDOS ─────────────────────────────────────────── */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm gap-3">
            <QhSpinner size="lg" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
              {t("loading")}
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
              <ShoppingBag className="w-7 h-7" strokeWidth={2} />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
              {t("empty_state")}
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              {t("empty_desc")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order, i) => (
              <OrderCard
                key={order.id}
                order={order}
                i={i}
                onShip={() =>
                  dispatch({ type: "SET_SELECTEDORDER", payload: order })
                }
                onCancel={() =>
                  dispatch({ type: "SET_ORDERTOCANCEL", payload: order })
                }
                onDeliver={(id) =>
                  markAsDelivered(
                    id,
                    t("toasts.delivery_success"),
                    t("toasts.delivery_error")
                  )
                }
                onDeliverWithPin={(ord) =>
                  dispatch({
                    type: "SET_ORDERTODELIVERWITHPIN",
                    payload: ord,
                  })
                }
                onSlip={(id) =>
                  downloadSlip(
                    id,
                    t("toasts.slip_success"),
                    t("toasts.slip_error")
                  )
                }
                onView={() =>
                  dispatch({ type: "SET_ORDERTOVIEW", payload: order })
                }
                onReject={() =>
                  dispatch({ type: "SET_ORDERTOREJECT", payload: order })
                }
              />
            ))}
          </div>
        )}

        {/* ── MODAL: Asignar Número de Guía ───────────────────────────────── */}
        <Dialog
          open={!!selectedOrder}
          onOpenChange={(open) => {
            if (!open) {
              dispatch({ type: "SET_SELECTEDORDER", payload: null });
              dispatch({ type: "SET_EVIDENCEURL", payload: "" });
            }
          }}
        >
          <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Truck className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    {t("modal_ship.category")}
                  </p>
                  <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {t("modal_ship.title")}
                  </DialogTitle>
                </div>
              </div>
            </div>

            <div className="flex flex-col bg-white dark:bg-[#0a0a0a] p-6 md:p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                {selectedOrder &&
                  t("modal_ship.doc_info", {
                    id: selectedOrder.id.toString().padStart(4, "0"),
                    name: selectedOrder.consumerName,
                  })}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Transportista */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal_ship.carrier_label")}
                  </label>
                  <select
                    value={shippingCarrier}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_SHIPPINGCARRIER",
                        payload: e.target.value,
                      })
                    }
                    className="w-full h-11 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm cursor-pointer"
                  >
                    {CARRIERS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Número de Guía */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex justify-between">
                    <span>{t("modal_ship.tracking_label")}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_TRACKINGNUMBER",
                        payload: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder={t("modal_ship.tracking_placeholder")}
                    className="w-full h-11 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all shadow-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleShipSubmit()}
                  />
                </div>
              </div>

              {/* Evidencia Fotográfica */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("modal_ship.evidence_label")}
                </label>

                {!evidenceUrl ? (
                  <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-[#050505] p-6 text-center hover:bg-gray-100/50 dark:hover:bg-[#111]/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="evidence-upload"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="evidence-upload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <QhSpinner size="sm" />
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                            <Package className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {t("modal_ship.evidence_upload_prompt")}
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-[#050505] p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shrink-0">
                        <img
                          src={evidenceUrl}
                          alt="Evidencia"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white block">
                          {t("modal_ship.evidence_uploaded")}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({ type: "SET_EVIDENCEURL", payload: "" })
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all shrink-0"
                    >
                      <XCircle className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() =>
                  dispatch({ type: "SET_SELECTEDORDER", payload: null })
                }
                className="h-11 px-6 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold"
              >
                {t("modal_ship.btn_cancel")}
              </Button>
              <Button
                onClick={handleShipSubmit}
                disabled={isSubmitting || trackingNumber.trim().length < 5}
                className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm border-0 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <QhSpinner size="sm" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                )}
                <span>{t("modal_ship.btn_confirm")}</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── MODAL: Confirmar Anulación ─────────────────────────────────── */}
        <Dialog
          open={!!orderToCancel}
          onOpenChange={(open) =>
            !open && dispatch({ type: "SET_ORDERTOCANCEL", payload: null })
          }
        >
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-sm">
                  <XCircle className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    {t("modal_cancel.category")}
                  </p>
                  <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {t("modal_cancel.title")}
                  </DialogTitle>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] space-y-4">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                {orderToCancel &&
                  t("modal_cancel.description", {
                    id: orderToCancel.id.toString().padStart(4, "0"),
                    name: orderToCancel.consumerName,
                  })}
              </p>

              <div className="p-4 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  {t("modal_cancel.refund_notice_title")}
                </p>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {orderToCancel &&
                    t("modal_cancel.refund_notice_desc", {
                      amount: orderToCancel.totalAmount,
                      currency: orderToCancel.currency,
                    })}
                </p>
              </div>

              <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                {t("modal_cancel.warning")}
              </p>
            </div>

            <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() =>
                  dispatch({ type: "SET_ORDERTOCANCEL", payload: null })
                }
                disabled={isSubmitting}
                className="h-11 px-6 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold"
              >
                {t("modal_cancel.btn_keep")}
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={async () => {
                  if (orderToCancel) {
                    const ok = await cancelOrder(
                      orderToCancel.id,
                      t("toasts.cancel_success"),
                      t("toasts.cancel_error")
                    );
                    if (ok)
                      dispatch({
                        type: "SET_ORDERTOCANCEL",
                        payload: null,
                      });
                  }
                }}
                className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm border-0 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <QhSpinner size="sm" />
                ) : (
                  <XCircle className="w-4 h-4" strokeWidth={2} />
                )}
                <span>{t("modal_cancel.btn_refund")}</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── MODAL: PIN de Recolección ──────────────────────────────────── */}
        <Dialog
          open={!!orderToDeliverWithPin}
          onOpenChange={(open) => {
            if (!open) {
              dispatch({
                type: "SET_ORDERTODELIVERWITHPIN",
                payload: null,
              });
              dispatch({ type: "SET_DELIVERYPININPUT", payload: "" });
            }
          }}
        >
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    {t("modal_pin.category")}
                  </p>
                  <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {t("modal_pin.title")}
                  </DialogTitle>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] space-y-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {orderToDeliverWithPin &&
                  t("modal_pin.description", {
                    id: orderToDeliverWithPin.id.toString().padStart(4, "0"),
                  })}
              </p>

              <input
                type="text"
                className="w-full h-14 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] px-4 text-2xl font-mono font-bold uppercase tracking-[0.2em] text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
                placeholder={t("modal_pin.placeholder")}
                value={deliveryPinInput}
                onChange={(e) =>
                  dispatch({
                    type: "SET_DELIVERYPININPUT",
                    payload: e.target.value.toUpperCase(),
                  })
                }
                disabled={isSubmitting}
                maxLength={6}
              />
            </div>

            <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  dispatch({
                    type: "SET_ORDERTODELIVERWITHPIN",
                    payload: null,
                  });
                  dispatch({ type: "SET_DELIVERYPININPUT", payload: "" });
                }}
                className="h-11 px-6 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold"
              >
                {t("modal_pin.btn_cancel")}
              </Button>
              <Button
                onClick={async () => {
                  if (
                    orderToDeliverWithPin &&
                    deliveryPinInput.length >= 6
                  ) {
                    const ok = await deliverWithPin(
                      orderToDeliverWithPin.id,
                      deliveryPinInput,
                      t("toasts.pin_success"),
                      t("toasts.pin_error")
                    );
                    if (ok) {
                      dispatch({
                        type: "SET_ORDERTODELIVERWITHPIN",
                        payload: null,
                      });
                      dispatch({ type: "SET_DELIVERYPININPUT", payload: "" });
                    }
                  }
                }}
                disabled={isSubmitting || deliveryPinInput.length < 6}
                className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm border-0 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <QhSpinner size="sm" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                )}
                <span>{t("modal_pin.btn_validate")}</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── MODAL: Detalles del Pedido ──────────────────────────────────── */}
        <Dialog
          open={!!orderToView}
          onOpenChange={(open) =>
            !open && dispatch({ type: "SET_ORDERTOVIEW", payload: null })
          }
        >
          <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Eye className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    {t("modal_details.category")}
                  </p>
                  <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-mono">
                    DOC-{orderToView?.id.toString().padStart(4, "0")}
                  </DialogTitle>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-white dark:bg-[#0a0a0a]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 md:p-8">
                {/* Paciente / Comprador */}
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505]/40 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("modal_details.recipient_title")}
                  </h4>
                  <div>
                    <p className="font-bold text-xs text-gray-900 dark:text-white mb-0.5">
                      {orderToView?.consumerName}
                    </p>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
                      {orderToView?.consumerEmail}
                    </p>
                  </div>
                  <a
                    href={`mailto:${orderToView?.consumerEmail}?subject=Sobre tu pedido #${orderToView?.id} en QuHealthy`}
                    className="h-9 px-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold flex items-center justify-center gap-2 w-full shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{t("modal_details.btn_contact")}</span>
                  </a>
                </div>

                {/* Coordenadas de Entrega */}
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505]/40 space-y-3 flex flex-col justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("modal_details.address_title")}
                  </h4>
                  {orderToView?.shippingAddress ? (
                    <>
                      <div className="flex items-start gap-2">
                        <MapPin
                          className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
                          strokeWidth={2}
                        />
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                          {orderToView.shippingAddress}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleCopyAddress(orderToView.shippingAddress || "")
                          }
                          className="flex-1 h-8 rounded-xl border-gray-200 dark:border-gray-800 text-[10px] font-bold shadow-sm"
                        >
                          <Copy className="w-3 h-3 mr-1" strokeWidth={2} />
                          <span>{t("modal_details.btn_copy_address")}</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                orderToView.shippingAddress || ""
                              )}`,
                              "_blank"
                            )
                          }
                          className="flex-1 h-8 rounded-xl border-gray-200 dark:border-gray-800 text-[10px] font-bold shadow-sm"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" strokeWidth={2} />
                          <span>{t("modal_details.btn_maps")}</span>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center">
                      <p className="text-xs font-medium text-gray-400 italic">
                        {t("modal_details.digital_product")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Visor de Recetas */}
              <PrescriptionViewer
                prescriptionUrls={orderToView?.prescriptionUrls}
              />
            </div>

            <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex w-full sm:w-auto gap-2 flex-col sm:flex-row">
                {orderToView?.prescriptionUrls &&
                  !orderToView?.prescriptionApproved && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          dispatch({
                            type: "SET_ORDERTOREJECT",
                            payload: orderToView,
                          });
                          dispatch({
                            type: "SET_ORDERTOVIEW",
                            payload: null,
                          });
                        }}
                        className="h-11 px-5 rounded-xl border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-sm"
                      >
                        <ShieldAlert
                          className="w-4 h-4 mr-1.5"
                          strokeWidth={2}
                        />
                        <span>{t("modal_details.btn_deny_prescription")}</span>
                      </Button>

                      <Button
                        onClick={async () => {
                          if (!orderToView) return;
                          const ok = await approvePrescription(
                            orderToView.id,
                            t("toasts.approve_success"),
                            t("toasts.approve_error")
                          );
                          if (ok) {
                            dispatch({
                              type: "SET_ORDERTOVIEW",
                              payload: {
                                ...orderToView,
                                prescriptionApproved: true,
                              },
                            });
                          }
                        }}
                        disabled={isSubmitting}
                        className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm border-0 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <QhSpinner size="sm" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                        )}
                        <span>{t("modal_details.btn_approve_prescription")}</span>
                      </Button>
                    </>
                  )}
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  dispatch({ type: "SET_ORDERTOVIEW", payload: null })
                }
                className="h-11 px-6 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold w-full sm:w-auto"
              >
                {t("modal_details.btn_close")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── MODAL: Rechazar por Receta Inválida ────────────────────────── */}
        <Dialog
          open={!!orderToReject}
          onOpenChange={(open) =>
            !open && dispatch({ type: "SET_ORDERTOREJECT", payload: null })
          }
        >
          <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldAlert className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    {t("modal_reject.category")}
                  </p>
                  <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {t("modal_reject.title")}
                  </DialogTitle>
                </div>
              </div>
            </div>

            <div className="flex flex-col bg-white dark:bg-[#0a0a0a] p-6 md:p-8 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                {orderToReject &&
                  t("modal_reject.description", {
                    id: orderToReject.id.toString().padStart(4, "0"),
                  })}
              </p>

              <div className="p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-relaxed">
                  {orderToReject &&
                    t("modal_reject.refund_notice", {
                      amount: orderToReject.totalAmount,
                      currency: orderToReject.currency,
                    })}
                </p>
              </div>

              <PrescriptionViewer
                prescriptionUrls={orderToReject?.prescriptionUrls}
              />

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  {t("modal_reject.reason_label")}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={rejectionReasonInput}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_REJECTIONREASONINPUT",
                      payload: e.target.value,
                    })
                  }
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-sm cursor-pointer"
                >
                  <option value="Receta médica inválida o ilegible">
                    {t("modal_reject.reasons.invalid_doc")}
                  </option>
                  <option value="Receta vencida">
                    {t("modal_reject.reasons.expired")}
                  </option>
                  <option value="Medicamento no coincide con receta">
                    {t("modal_reject.reasons.mismatch")}
                  </option>
                  <option value="Dosis o presentación incorrecta">
                    {t("modal_reject.reasons.dosage_error")}
                  </option>
                  <option value="Faltan datos obligatorios (cédula, firma, fecha)">
                    {t("modal_reject.reasons.missing_data")}
                  </option>
                  <option value="OTHER">
                    {t("modal_reject.reasons.other")}
                  </option>
                </select>

                {rejectionReasonInput === "OTHER" && (
                  <input
                    type="text"
                    placeholder={t("modal_reject.other_placeholder")}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_REJECTIONREASONINPUT",
                        payload: e.target.value,
                      })
                    }
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-sm placeholder:font-normal placeholder:text-gray-400"
                  />
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() =>
                  dispatch({ type: "SET_ORDERTOREJECT", payload: null })
                }
                disabled={isSubmitting}
                className="h-11 px-6 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold"
              >
                {t("modal_reject.btn_cancel")}
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={async () => {
                  if (orderToReject) {
                    const finalReason =
                      rejectionReasonInput === "OTHER"
                        ? "Denegación por dictamen médico"
                        : rejectionReasonInput;
                    const ok = await rejectOrder(
                      orderToReject.id,
                      finalReason,
                      t("toasts.reject_success"),
                      t("toasts.reject_error")
                    );
                    if (ok) {
                      dispatch({
                        type: "SET_ORDERTOREJECT",
                        payload: null,
                      });
                      dispatch({
                        type: "SET_REJECTIONREASONINPUT",
                        payload: "Receta médica inválida o ilegible",
                      });
                    }
                  }
                }}
                className="h-11 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm border-0 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <QhSpinner size="sm" />
                ) : (
                  <ShieldAlert className="w-4 h-4" strokeWidth={2} />
                )}
                <span>{t("modal_reject.btn_confirm_rejection")}</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}