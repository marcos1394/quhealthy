"use client";
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-autofocus */
/* eslint-disable react-doctor/js-combine-iterations */

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-toastify";
import {
 Package, Truck, CheckCircle2, Loader2, MapPin, XCircle,
 Printer, Clock, CreditCard, Ban, ShoppingBag, Eye, Mail,
 ExternalLink, Copy, FileText, AlertTriangle, ShieldAlert,
 Sparkles
} from "lucide-react";

import { useProviderOrders } from "@/hooks/useProviderOrders";
import { storageService } from "@/services/storage.service";
import { OrderResponseDto, OrderStatus, PaymentStatus } from "@/types/order";
import {
 Dialog, DialogContent, DialogDescription, DialogTitle,
} from "@/components/ui/dialog";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

// ── Status configs ────────────────────────────────────────────────────────────
const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; className: string }> = {
 PENDING_PAYMENT: { label: "Pago Pendiente", icon: Clock, className: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10 dark:border-yellow-900/30 dark:text-yellow-400" },
 PROCESSING: { label: "En Proceso", icon: Package, className: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:border-blue-900/30 dark:text-blue-400" },
 SHIPPED: { label: "En Tránsito", icon: Truck, className: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/10 dark:border-indigo-900/30 dark:text-indigo-400" },
 DELIVERED: { label: "Entregado", icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400" },
 CANCELLED: { label: "Anulado", icon: Ban, className: "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400" },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
 PENDING: { label: "Pendiente", className: "border-gray-200 bg-gray-50 text-gray-600 dark:bg-[#111] dark:border-gray-800 dark:text-gray-400" },
 COMPLETED: { label: "Liquidado", className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400" },
 FAILED: { label: "Fallido", className: "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400" },
 REFUNDED: { label: "Reembolsado", className: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-400" },
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

// ── Carriers ──────────────────────────────────────────────────────────────────
const CARRIERS = [
 { value: 'DHL', label: 'DHL Express' },
 { value: 'FEDEX', label: 'FedEx' },
 { value: 'ESTAFETA', label: 'Estafeta' },
 { value: 'REDPACK', label: 'Redpack' },
 { value: 'UBER_FLASH', label: 'Uber Flash (Local)' },
 { value: 'IN_HOUSE', label: 'Flota Interna' },
 { value: 'OTHER', label: 'Externo / Otro' },
];

// ── Order Card (Ficha de Despacho) ─────────────────────────────
function OrderCard({
  order, i,
  onShip, onCancel, onDeliver, onSlip, onView, onReject, onDeliverWithPin
}: {
  order: OrderResponseDto; i: number;
  onShip: () => void; onCancel: () => void;
  onDeliver: (id: number) => void; onSlip: (id: number) => void;
  onView: () => void; onReject: () => void;
  onDeliverWithPin: (order: OrderResponseDto) => void;
}) {
 const status = getOrderStatus(order.orderStatus);
 const pStatus = getPaymentStatus(order.paymentStatus);
 const isProcessing = status === "PROCESSING";
 const isShipped = status === "SHIPPED";
 const osCfg = status ? ORDER_STATUS_CONFIG[status] : null;
 const psCfg = pStatus ? PAYMENT_STATUS_CONFIG[pStatus] : null;
 const OsIcon = osCfg?.icon ?? Package;

 return (
 <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
 
 {/* Row 1: Header Técnico */}
 <div className="flex flex-col md:flex-row md:items-start justify-between p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 gap-4">
 <div>
 <div className="flex items-center gap-3 mb-1">
 <span className="font-bold text-lg text-gray-900 dark:text-white leading-none">
 DOC-{order.id.toString().padStart(4, '0')}
 </span>
 {osCfg && (
 <span className={cn("px-2.5 py-0.5 text-xs font-bold rounded-full flex items-center gap-1.5", osCfg.className)}>
 <OsIcon className="w-3.5 h-3.5" strokeWidth={2} />{osCfg.label}
 </span>
 )}
 </div>
 <p className="text-sm font-semibold text-gray-500 mt-2">
 {format(new Date(order.createdAt + "Z"), "dd MMM yyyy · HH:mm", { locale: es })}
 </p>
 </div>
 
 <div className="flex flex-col items-start md:items-end gap-2">
 <div className="flex items-center gap-2">
 <CreditCard className="w-5 h-5 text-gray-400" strokeWidth={2} />
 <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">
 ${order.totalAmount} <span className="text-sm font-bold text-gray-400 ml-1">{order.currency}</span>
 </span>
 </div>
 {psCfg && (
 <span className={cn("px-2.5 py-0.5 text-xs font-bold rounded-md border", psCfg.className)}>
 Pago {psCfg.label}
 </span>
 )}
 </div>
 </div>

 {/* Row 2: Datos de Entrega */}
 <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <p className="font-bold text-base text-gray-900 dark:text-white mb-1">{order.consumerName}</p>
 <p className="text-sm font-semibold text-gray-500 mb-5">{order.consumerEmail}</p>
 
 {order.shippingAddress && (
 <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#050505] rounded-xl border border-gray-100 dark:border-gray-800">
 <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">
 {order.shippingAddress}
 </span>
 </div>
 )}

 {order.trackingNumber && (
 <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-[#111] rounded-xl border border-gray-100 dark:border-gray-800 gap-2">
 <span className="text-xs font-semibold text-gray-500">Número de Guía</span>
 <span className="font-mono text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0a0a0a] px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700">
 {order.trackingNumber}
 </span>
 </div>
 )}
 </div>

 {/* Row 3: Items */}
 <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <h4 className="text-xs font-semibold text-gray-500 mb-4">Partidas de Despacho</h4>
 <div className="flex flex-wrap gap-2">
 {order.items.filter(it => !it.isDigital).map((item, idx) => (
 <span key={idx} className="bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
 <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-md text-xs font-bold">
 {item.quantity}
 </span> 
 {item.itemName}
 </span>
 ))}
 {order.items.filter(it => !it.isDigital).length === 0 && (
 <span className="text-sm font-semibold text-gray-400 italic">Despacho Digital (Sin envío físico)</span>
 )}
 </div>
 </div>

 {/* Row 4: Comandos Inferiores */}
 <div className="flex flex-col sm:flex-row bg-gray-50/50 dark:bg-[#050505] p-4 gap-3">
 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm"
 onClick={onView}
 >
 <Eye className="w-4 h-4" strokeWidth={2} /> Detalles
 </button>

 {(isProcessing || isShipped) && (
 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm"
 onClick={() => onSlip(order.id)}
 >
 <Printer className="w-4 h-4" strokeWidth={2} /> Imprimir Hoja
 </button>
 )}

 {isProcessing && (
 <>
 {order.prescriptionUrls && !order.prescriptionApproved ? (
 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors text-xs font-bold shadow-sm"
 onClick={onView}
 >
 <AlertTriangle className="w-4 h-4" strokeWidth={2} /> Verificar Receta
 </button>
 ) : order.shippingAddress === 'PICKUP' ? (
 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold border-0 shadow-sm"
 onClick={() => onDeliverWithPin(order)}
 >
 <Sparkles className="w-4 h-4" strokeWidth={2} /> Entregar (PIN)
 </button>
 ) : (
 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold border-0 shadow-sm"
 onClick={onShip}
 >
 <Truck className="w-4 h-4" strokeWidth={2} /> Marcar Enviado
 </button>
 )}

 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20 transition-colors text-xs font-bold shadow-sm"
 onClick={onCancel}
 >
 <XCircle className="w-4 h-4" strokeWidth={2} /> Anular
 </button>
 </>
 )}

 {isShipped && (
 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold border-0 shadow-sm"
 onClick={() => onDeliver(order.id)}
 >
 <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> Confirmar Entrega
 </button>
 )}
 </div>
 </div>
 );
}

// ── Prescription viewer helper ────────────────────────────────────────────────
function PrescriptionViewer({ prescriptionUrls }: { prescriptionUrls?: string }) {
 const [loadingId, setLoadingId] = useState<string | null>(null);

 if (!prescriptionUrls) return null;

 const handleView = async (itemId: string, fileKey: string) => {
 setLoadingId(itemId);
 try {
 const signedUrl = await storageService.getReadUrl(fileKey);
 window.open(signedUrl, '_blank');
 } catch (error) {
 toast.error("Error al visualizar documento", { theme: "colored" });
 } finally {
 setLoadingId(null);
 }
 };

 try {
 const urls = JSON.parse(prescriptionUrls) as Record<string, string>;
 const entries = Object.entries(urls);
 if (entries.length === 0) return null;
 return (
 <div className="p-6 md:p-8 bg-amber-50/50 dark:bg-amber-900/5 border-b border-gray-100 dark:border-gray-800 flex flex-col">
 <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2">
 <AlertTriangle className="w-4 h-4" strokeWidth={2} /> Documentos Clínicos Adjuntos
 </h4>
 <div className="flex flex-col gap-3">
 {entries.map(([itemId, fileKey]) => (
 <button key={itemId} 
 className="h-14 px-6 flex items-center justify-between rounded-xl border border-amber-200 bg-white dark:bg-[#0a0a0a] dark:border-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors text-sm font-bold shadow-sm disabled:opacity-50"
 onClick={() => handleView(itemId, fileKey)}
 disabled={loadingId === itemId}
 >
 <div className="flex items-center gap-3">
 {loadingId === itemId ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : <FileText className="w-4 h-4" strokeWidth={2} />}
 <span>Referencia Ítem #{itemId}</span>
 </div>
 <span className="opacity-60 text-xs">{loadingId === itemId ? "Abriendo..." : "Visualizar"}</span>
 </button>
 ))}
 </div>
 </div>
 );
 } catch { return null; }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProviderOrdersPage() {
 const t = useTranslations("ProviderOrders");
 const {
 orders, isLoading, isSubmitting,
 fetchOrders, shipOrder, markAsDelivered, deliverWithPin, cancelOrder, downloadSlip, rejectOrder, approvePrescription,
 } = useProviderOrders();

 const [{ selectedOrder, orderToCancel, orderToView, orderToReject, orderToDeliverWithPin, trackingNumber, shippingCarrier, rejectionReasonInput, deliveryPinInput, evidenceUrl, isUploading }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_SELECTEDORDER': return { ...state, selectedOrder: typeof action.payload === 'function' ? action.payload(state.selectedOrder) : action.payload };
 case 'SET_ORDERTOCANCEL': return { ...state, orderToCancel: typeof action.payload === 'function' ? action.payload(state.orderToCancel) : action.payload };
 case 'SET_ORDERTOVIEW': return { ...state, orderToView: typeof action.payload === 'function' ? action.payload(state.orderToView) : action.payload };
 case 'SET_ORDERTOREJECT': return { ...state, orderToReject: typeof action.payload === 'function' ? action.payload(state.orderToReject) : action.payload };
 case 'SET_ORDERTODELIVERWITHPIN': return { ...state, orderToDeliverWithPin: typeof action.payload === 'function' ? action.payload(state.orderToDeliverWithPin) : action.payload };
 case 'SET_TRACKINGNUMBER': return { ...state, trackingNumber: typeof action.payload === 'function' ? action.payload(state.trackingNumber) : action.payload };
 case 'SET_SHIPPINGCARRIER': return { ...state, shippingCarrier: typeof action.payload === 'function' ? action.payload(state.shippingCarrier) : action.payload };
 case 'SET_REJECTIONREASONINPUT': return { ...state, rejectionReasonInput: typeof action.payload === 'function' ? action.payload(state.rejectionReasonInput) : action.payload };
 case 'SET_DELIVERYPININPUT': return { ...state, deliveryPinInput: typeof action.payload === 'function' ? action.payload(state.deliveryPinInput) : action.payload };
 case 'SET_EVIDENCEURL': return { ...state, evidenceUrl: typeof action.payload === 'function' ? action.payload(state.evidenceUrl) : action.payload };
 case 'SET_ISUPLOADING': return { ...state, isUploading: typeof action.payload === 'function' ? action.payload(state.isUploading) : action.payload };
 default: return state;
 }
 },
 {
 selectedOrder: null, orderToCancel: null, orderToView: null, orderToReject: null, orderToDeliverWithPin: null, trackingNumber: "", shippingCarrier: "DHL", rejectionReasonInput: "RECETA MÉDICA INVÁLIDA O ILEGIBLE", deliveryPinInput: "", evidenceUrl: "", isUploading: false
 }
 );

 const setSelectedOrder = (val: any) => dispatch({ type: 'SET_SELECTEDORDER', payload: val });
 const setOrderToCancel = (val: any) => dispatch({ type: 'SET_ORDERTOCANCEL', payload: val });
 const setOrderToView = (val: any) => dispatch({ type: 'SET_ORDERTOVIEW', payload: val });
 const setOrderToReject = (val: any) => dispatch({ type: 'SET_ORDERTOREJECT', payload: val });
 const setOrderToDeliverWithPin = (val: any) => dispatch({ type: 'SET_ORDERTODELIVERWITHPIN', payload: val });
 const setTrackingNumber = (val: any) => dispatch({ type: 'SET_TRACKINGNUMBER', payload: val });
 const setShippingCarrier = (val: any) => dispatch({ type: 'SET_SHIPPINGCARRIER', payload: val });
 const setRejectionReasonInput = (val: any) => dispatch({ type: 'SET_REJECTIONREASONINPUT', payload: val });
 const setDeliveryPinInput = (val: any) => dispatch({ type: 'SET_DELIVERYPININPUT', payload: val });
 const setEvidenceUrl = (val: any) => dispatch({ type: 'SET_EVIDENCEURL', payload: val });
 const setIsUploading = (val: any) => dispatch({ type: 'SET_ISUPLOADING', payload: val });

 useEffect(() => { fetchOrders("Error en recuperación de datos"); }, [fetchOrders]);

 const handleShipSubmit = async () => {
 if (!selectedOrder || trackingNumber.trim().length < 5) return;
 const ok = await shipOrder(
 selectedOrder.id,
 trackingNumber.trim(),
 "Actualización logística confirmada",
 "Error en actualización logística",
 shippingCarrier,
 evidenceUrl
 );
 if (ok) { 
 setSelectedOrder(null); 
 setTrackingNumber(""); 
 setShippingCarrier("DHL");
 setEvidenceUrl(""); 
 }
 };

 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setIsUploading(true);
 try {
 const uploadedUrl = URL.createObjectURL(file); 
 setEvidenceUrl(uploadedUrl);
 toast.success("Evidencia adjuntada al registro");
 } catch (error) {
 toast.error("Error al subir archivo");
 } finally {
 setIsUploading(false);
 }
 };

 const processingCount = orders.filter(o => getOrderStatus(o.orderStatus) === "PROCESSING").length;
 const shippedCount = orders.filter(o => getOrderStatus(o.orderStatus) === "SHIPPED").length;

 return (
 <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-8 px-6 md:px-10 pb-16 transition-colors duration-500">
 <div className="max-w-7xl mx-auto space-y-8">

 {/* --- HEADER --- */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
 <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">
 Comercio Digital
 </p>
 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
 {t("title", { defaultValue: 'Recepción de Pedidos' })}
 </h1>
 </div>
 </div>
 {!isLoading && orders.length > 0 && (
 <div className="flex flex-wrap gap-3 shrink-0">
 {processingCount > 0 && (
 <span className="flex items-center gap-2 h-10 px-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:border-blue-900/30 dark:text-blue-400 text-sm font-bold shadow-sm">
 <Package className="w-4 h-4" strokeWidth={2} /> {processingCount} En Proceso
 </span>
 )}
 {shippedCount > 0 && (
 <span className="flex items-center gap-2 h-10 px-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/10 dark:border-indigo-900/30 dark:text-indigo-400 text-sm font-bold shadow-sm">
 <Truck className="w-4 h-4" strokeWidth={2} /> {shippedCount} En Tránsito
 </span>
 )}
 </div>
 )}
 </div>

 {/* Orders list */}
 {isLoading ? (
 <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
 <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
 <p className="text-sm font-semibold text-gray-500 mt-6 animate-pulse">
 {t("loading", { defaultValue: 'Sincronizando libro de pedidos...' })}
 </p>
 </div>
 ) : orders.length === 0 ? (
 <div className="py-24 flex flex-col items-center justify-center text-center bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
 <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-[#111] flex items-center justify-center mb-6">
 <ShoppingBag className="w-6 h-6 text-gray-400" strokeWidth={2} />
 </div>
 <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
 {t("empty_state", { defaultValue: 'No hay pedidos pendientes' })}
 </p>
 <p className="text-sm font-medium text-gray-500 max-w-xs leading-relaxed">
 Su fila de despacho se encuentra vacía.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-6">
 {orders.map((order, i) => (
 <OrderCard
 key={order.id} order={order} i={i}
 onShip={() => setSelectedOrder(order)}
 onCancel={() => setOrderToCancel(order)}
 onDeliver={(id) => markAsDelivered(id, "Entrega confirmada", "Error en confirmación")}
 onDeliverWithPin={(order) => setOrderToDeliverWithPin(order)}
 onSlip={(id) => downloadSlip(id, "Hoja de despacho extraída", "Error en extracción")}
 onView={() => setOrderToView(order)}
 onReject={() => setOrderToReject(order)}
 />
 ))}
 </div>
 )}

 {/* ── MODAL: Agregar Número de Guía ─────────────────────────────────── */}
 <Dialog open={!!selectedOrder} onOpenChange={(open) => {
 if (!open) {
 setSelectedOrder(null);
 setEvidenceUrl("");
 }
 }}>
 <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
 
 <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
 <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">
 Control Logístico
 </p>
 <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
 {t("modal_title", { defaultValue: 'Asignación de Guía' })}
 </DialogTitle>
 </div>
 </div>
 </div>

 <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505]/50 overflow-y-auto max-h-[70vh] custom-scrollbar">
 
 <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed mb-6 bg-gray-50 dark:bg-[#111] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
 {selectedOrder && `Documento DOC-${selectedOrder.id.toString().padStart(4, '0')} • Destinatario: ${selectedOrder.consumerName}`}
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Selector de Paquetería */}
 <div className="flex flex-col">
 <label className="text-xs font-semibold text-gray-500 mb-2">Transportista</label>
 <select
 value={shippingCarrier}
 onChange={(e) => setShippingCarrier(e.target.value)}
 className="w-full h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors cursor-pointer"
 >
 {CARRIERS.map(c => (
 <option key={c.value} value={c.value}>{c.label}</option>
 ))}
 </select>
 </div>

 {/* Número de Guía */}
 <div className="flex flex-col">
 <label className="text-xs font-semibold text-gray-500 mb-2 flex justify-between">
 <span>{t("modal_input_label", { defaultValue: 'Número de Rastreo' })}</span> <span className="text-red-500">*</span>
 </label>
 <input
 value={trackingNumber}
 onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
 placeholder="Ej. 1Z9999999999999999"
 className="w-full h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-700 text-sm font-mono font-bold text-gray-900 dark:text-white uppercase focus:outline-none focus:ring-0 focus:border-emerald-500 rounded-xl transition-colors placeholder:text-gray-400 placeholder:font-sans placeholder:normal-case"
 autoFocus
 onKeyDown={(e) => e.key === "Enter" && handleShipSubmit()}
 />
 </div>
 </div>
 </div>

 {/* Evidencia Fotográfica */}
 <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <label className="text-xs font-semibold text-gray-500 mb-4 block">
 Prueba visual de empaque (Opcional)
 </label>
 
 {!evidenceUrl ? (
 <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#050505] p-6 text-center hover:bg-gray-100 dark:hover:bg-[#111] transition-colors">
 <input 
 type="file" 
 accept="image/*" 
 className="hidden" 
 id="evidence-upload" 
 onChange={handleFileUpload}
 disabled={isUploading}
 />
 <label htmlFor="evidence-upload" className="cursor-pointer flex flex-col items-center justify-center gap-3">
 {isUploading ? (
 <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
 ) : (
 <>
 <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 shadow-sm">
 <Package className="w-5 h-5" strokeWidth={2} />
 </div>
 <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Seleccionar archivo de imagen</span>
 </>
 )}
 </label>
 </div>
 ) : (
 <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#050505] p-4 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-lg overflow-hidden bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 shrink-0">
 <img src={evidenceUrl} alt="Evidencia" className="w-full h-full object-cover" />
 </div>
 <div>
 <span className="text-sm font-bold text-gray-900 dark:text-white block mb-1">
 Archivo Cargado
 </span>
 <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
 <CheckCircle2 className="w-3 h-3" strokeWidth={2} /> Verificado
 </span>
 </div>
 </div>
 <button onClick={() => setEvidenceUrl("")} className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 transition-colors shrink-0">
 <XCircle className="w-4 h-4" strokeWidth={2} />
 </button>
 </div>
 )}
 </div>
 </div>

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-col sm:flex-row justify-end gap-4 shrink-0 border-t border-gray-100 dark:border-gray-800">
 <button 
 onClick={() => setSelectedOrder(null)}
 className="h-12 px-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-bold w-full sm:w-auto shadow-sm"
 >
 {t("btn_cancel", { defaultValue: 'Cancelar' })}
 </button>
 <button 
 className="h-12 px-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 w-full sm:w-auto disabled:opacity-50 shadow-sm"
 onClick={handleShipSubmit} disabled={isSubmitting || trackingNumber.trim().length < 5}
 >
 {isSubmitting ? <QhSpinner size="sm" className="text-current" /> : <CheckCircle2 className="w-4 h-4" strokeWidth={2} />}
 {t("btn_confirm", { defaultValue: 'Confirmar Inserción' })}
 </button>
 </div>
 </DialogContent>
 </Dialog>

 {/* ── MODAL: Confirmar Cancelación ──────────────────────────────────── */}
 <Dialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
 <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
 
 <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
 <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">
 Alerta de Sistema
 </p>
 <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
 Anulación de Orden
 </DialogTitle>
 </div>
 </div>
 </div>

 <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505]/50 flex flex-col gap-4">
 <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
 Se procederá a anular el documento DOC-{orderToCancel?.id.toString().padStart(4, '0')} a nombre de {orderToCancel?.consumerName}.
 </p>
 <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30">
 <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2">
 Implicaciones Financieras:
 </p>
 <p className="text-sm font-bold text-gray-900 dark:text-white">
 Se ordenará un reverso por valor de ${orderToCancel?.totalAmount} {orderToCancel?.currency}
 </p>
 </div>
 <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-2">
 Esta operación es irreversible en la base de datos.
 </p>
 </div>

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
 <button 
 onClick={() => setOrderToCancel(null)} disabled={isSubmitting}
 className="h-12 px-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-bold w-full sm:w-auto shadow-sm"
 >
 Cancelar
 </button>
 <button 
 disabled={isSubmitting}
 onClick={async () => {
 if (orderToCancel) {
 const ok = await cancelOrder(orderToCancel.id, "Orden anulada. Reembolso emitido.", "Fallo en anulación.");
 if (ok) setOrderToCancel(null);
 }
 }}
 className="h-12 px-8 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 w-full sm:w-auto disabled:opacity-50 shadow-sm"
 >
 {isSubmitting ? <QhSpinner size="sm" className="text-current" /> : <XCircle className="w-4 h-4" strokeWidth={2} />}
 Confirmar Reembolso
 </button>
 </div>
 </DialogContent>
 </Dialog>

 {/* ── MODAL: Ingreso de PIN de Recolección ────────────────────────────── */}
 <Dialog open={!!orderToDeliverWithPin} onOpenChange={(open) => {
 if (!open) {
 setOrderToDeliverWithPin(null);
 setDeliveryPinInput("");
 }
 }}>
 <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
 
 <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
 <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">
 Validación Logística
 </p>
 <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
 Recolección en Sitio
 </DialogTitle>
 </div>
 </div>
 </div>

 <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-gray-50/50 dark:bg-[#050505]/50">
 <div className="mb-2">
 <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
 Ingreso de PIN de Seguridad
 </p>
 <p className="text-sm text-gray-500 leading-relaxed mb-6">
 Solicite al paciente el código de 6 caracteres asociado a la orden DOC-{orderToDeliverWithPin?.id?.toString().padStart(4, '0')}.
 </p>
 
 <input 
 type="text" 
 className="w-full h-16 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] px-6 text-2xl font-bold uppercase tracking-[0.2em] text-center text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
 placeholder="EJ: A1B2C3"
 value={deliveryPinInput}
 onChange={(e) => setDeliveryPinInput(e.target.value.toUpperCase())}
 disabled={isSubmitting}
 maxLength={6}
 />
 </div>
 </div>

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-col sm:flex-row justify-end gap-4 shrink-0 border-t border-gray-100 dark:border-gray-800">
 <button 
 onClick={() => {
 setOrderToDeliverWithPin(null);
 setDeliveryPinInput("");
 }}
 className="h-12 px-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-bold w-full sm:w-auto shadow-sm"
 >
 Cancelar
 </button>
 <button 
 className="h-12 px-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 w-full sm:w-auto disabled:opacity-50 shadow-sm"
 onClick={async () => {
 if (orderToDeliverWithPin && deliveryPinInput.length >= 6) {
 const ok = await deliverWithPin(
 orderToDeliverWithPin.id, 
 deliveryPinInput, 
 "Orden entregada satisfactoriamente", 
 "PIN inválido o error de sistema"
 );
 if (ok) {
 setOrderToDeliverWithPin(null);
 setDeliveryPinInput("");
 }
 }
 }}
 disabled={isSubmitting || deliveryPinInput.length < 6}
 >
 {isSubmitting ? <QhSpinner size="sm" className="text-current" /> : <CheckCircle2 className="w-4 h-4" strokeWidth={2} />}
 Validar y Entregar
 </button>
 </div>
 </DialogContent>
 </Dialog>

 {/* ── MODAL: Ver Detalles del Pedido ────────────────────────────────── */}
 <Dialog open={!!orderToView} onOpenChange={(open) => !open && setOrderToView(null)}>
 <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
 
 <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0">
 <Eye className="w-6 h-6 text-gray-500" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">
 Auditoría de Documento
 </p>
 <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
 DOC-{orderToView?.id.toString().padStart(4, '0')}
 </DialogTitle>
 </div>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-gray-50/50 dark:bg-[#050505]/50">
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 
 {/* Contacto */}
 <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col">
 <h4 className="text-xs font-semibold text-gray-500 mb-4">Entidad Receptora</h4>
 <div className="bg-gray-50 dark:bg-[#050505] rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-4">
 <div>
 <p className="font-bold text-base text-gray-900 dark:text-white mb-1">{orderToView?.consumerName}</p>
 <p className="text-sm font-semibold text-gray-500 truncate">{orderToView?.consumerEmail}</p>
 </div>
 <a
 href={`mailto:${orderToView?.consumerEmail}?subject=Sobre tu pedido #${orderToView?.id} en QuHealthy`}
 className="h-10 px-4 rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold flex items-center justify-center gap-2 w-full shadow-sm"
 >
 <Mail className="w-4 h-4" strokeWidth={2} /> Enlazar Comunicación
 </a>
 </div>
 </div>

 {/* Destino */}
 <div className="p-6 md:p-8 flex flex-col">
 <h4 className="text-xs font-semibold text-gray-500 mb-4">Coordenadas Físicas</h4>
 <div className="bg-gray-50 dark:bg-[#050505] rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-4 h-full">
 {orderToView?.shippingAddress ? (
 <>
 <div className="flex items-start gap-3 mb-2 flex-1">
 <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" strokeWidth={2} />
 <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
 {orderToView.shippingAddress}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <button 
 className="flex-1 h-10 rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
 onClick={() => {
 navigator.clipboard.writeText(orderToView.shippingAddress || "");
 toast.success("Dirección copiada");
 }}
 >
 <Copy className="w-4 h-4" strokeWidth={2} /> Copiar
 </button>
 <button 
 className="flex-1 h-10 rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
 onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(orderToView.shippingAddress || "")}`, "_blank")}
 >
 <ExternalLink className="w-4 h-4" strokeWidth={2} /> Maps
 </button>
 </div>
 </>
 ) : (
 <div className="flex items-center justify-center h-full text-center">
 <p className="text-sm font-semibold text-gray-500 italic">
 Entrega Lógica (Producto Digital)
 </p>
 </div>
 )}
 </div>
 </div>

 </div>

 {/* Recetas */}
 <PrescriptionViewer prescriptionUrls={orderToView?.prescriptionUrls} />
 </div>

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
 
 <div className="flex w-full sm:w-auto gap-4 flex-col sm:flex-row">
 {orderToView?.prescriptionUrls && !orderToView?.prescriptionApproved && (
 <>
 <button 
 className="h-12 px-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm"
 onClick={() => {
 setOrderToReject(orderToView); 
 setOrderToView(null); 
 }}
 >
 <ShieldAlert className="w-4 h-4" strokeWidth={2} /> Denegar
 </button>
 
 <button 
 className="h-12 px-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 w-full sm:w-auto disabled:opacity-50 shadow-sm"
 disabled={isSubmitting}
 onClick={async () => {
 if (!orderToView) return;
 const ok = await approvePrescription(
 orderToView.id, 
 "Certificación clínica aprobada.", 
 "Error en flujo de certificación."
 );
 if (ok) {
 setOrderToView({ ...orderToView, prescriptionApproved: true });
 }
 }}
 >
 {isSubmitting ? <QhSpinner size="sm" className="text-current" /> : <CheckCircle2 className="w-4 h-4" strokeWidth={2} />}
 Certificar
 </button>
 </>
 )}
 </div>
 
 <button 
 className="h-12 px-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-bold w-full sm:w-auto shadow-sm"
 onClick={() => setOrderToView(null)}
 >
 Cerrar Visor
 </button>
 </div>
 </DialogContent>
 </Dialog>

 {/* ── MODAL: Rechazar por Receta Inválida ──────────────────────────────── */}
 <Dialog open={!!orderToReject} onOpenChange={(open) => !open && setOrderToReject(null)}>
 <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
 
 <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
 <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">
 Política Clínica
 </p>
 <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
 Denegación de Orden
 </DialogTitle>
 </div>
 </div>
 </div>

 <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505]/50 overflow-y-auto max-h-[70vh] custom-scrollbar">
 <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
 Se bloqueará el documento DOC-{orderToReject?.id.toString().padStart(4, '0')} por falta de conformidad médica.
 </p>
 <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30">
 <p className="text-sm font-bold text-amber-800 dark:text-amber-400 leading-relaxed">
 Se ordenará restauración de inventario y devolución de fondos (${orderToReject?.totalAmount} {orderToReject?.currency}) al paciente.
 </p>
 </div>
 </div>

 <PrescriptionViewer prescriptionUrls={orderToReject?.prescriptionUrls} />

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a]">
 <label className="text-xs font-semibold text-gray-500 mb-3 block">
 Código de Rechazo Técnico <span className="text-red-500">*</span>
 </label>
 <select
 value={rejectionReasonInput}
 onChange={(e) => setRejectionReasonInput(e.target.value)}
 className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-amber-500 transition-colors mb-4 cursor-pointer"
 >
 <option value="Receta médica inválida o ilegible">Documento inválido o ilegible</option>
 <option value="Receta vencida">Fecha de emisión vencida</option>
 <option value="Medicamento no coincide con receta">Divergencia entre producto y receta</option>
 <option value="Dosis o presentación incorrecta">Error de dosificación</option>
 <option value="Faltan datos obligatorios (cédula, firma, fecha)">Ausencia de firma o cédula</option>
 <option value="OTHER">Especificación libre (Otro)</option>
 </select>

 {rejectionReasonInput === 'OTHER' && (
 <input
 placeholder="Ingresar detalle específico..."
 onChange={(e) => setRejectionReasonInput(e.target.value)}
 className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-amber-500 transition-colors placeholder:text-gray-400"
 />
 )}
 </div>
 </div>

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
 <button 
 onClick={() => setOrderToReject(null)} disabled={isSubmitting}
 className="h-12 px-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-bold w-full sm:w-auto shadow-sm"
 >
 Cancelar
 </button>
 <button
 className="h-12 px-8 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 w-full sm:w-auto disabled:opacity-50 shadow-sm"
 disabled={isSubmitting}
 onClick={async () => {
 if (orderToReject) {
 const finalReason = rejectionReasonInput === 'OTHER' ? 'Denegación por dictamen médico' : rejectionReasonInput;
 const ok = await rejectOrder(
 orderToReject.id,
 finalReason,
 "Documento anulado. Fondos liberados.",
 "Error en sistema de reembolso."
 );
 if (ok) {
 setOrderToReject(null);
 setRejectionReasonInput("Receta médica inválida o ilegible");
 }
 }
 }}
 >
 {isSubmitting ? <QhSpinner size="sm" className="text-current" /> : <ShieldAlert className="w-4 h-4" strokeWidth={2} />}
 Confirmar Denegación
 </button>
 </div>
 </DialogContent>
 </Dialog>
 </div>
 </div>
 );
}