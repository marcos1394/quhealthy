/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-autofocus */
// app/[locale]/(platform)/provider/dashboard/orders/page.tsx
"use client";
/* eslint-disable react-doctor/js-combine-iterations */

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-toastify";
import {
 Package, Truck, CheckCircle2, Loader2, MapPin, XCircle,
 Printer, Clock, CreditCard, Ban, ShoppingBag, Eye, Mail,
 ExternalLink, Copy, FileText, AlertTriangle, ShieldAlert
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
 PENDING_PAYMENT: { label: "PAGO PENDIENTE", icon: Clock, className: "border-yellow-500/30 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10 dark:text-yellow-400" },
 PROCESSING: { label: "EN PROCESO", icon: Package, className: "border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400" },
 SHIPPED: { label: "EN TRÁNSITO", icon: Truck, className: "border-indigo-500/30 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/10 dark:text-indigo-400" },
 DELIVERED: { label: "ENTREGADO", icon: CheckCircle2, className: "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400" },
 CANCELLED: { label: "ANULADO", icon: Ban, className: "border-red-500/30 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400" },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
 PENDING: { label: "PENDIENTE", className: "border-gray-500/30 bg-gray-50 text-gray-600 dark:bg-[#111] dark:text-gray-400" },
 COMPLETED: { label: "LIQUIDADO", className: "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400" },
 FAILED: { label: "FALLIDO", className: "border-red-500/30 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400" },
 REFUNDED: { label: "REEMBOLSADO", className: "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400" },
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
 { value: 'DHL', label: 'DHL EXPRESS' },
 { value: 'FEDEX', label: 'FEDEX' },
 { value: 'ESTAFETA', label: 'ESTAFETA' },
 { value: 'REDPACK', label: 'REDPACK' },
 { value: 'UBER_FLASH', label: 'UBER FLASH (LOCAL)' },
 { value: 'IN_HOUSE', label: 'FLOTA INTERNA' },
 { value: 'OTHER', label: 'EXTERNO / OTRO' },
];

// ── Order Card (Ficha de Despacho) ─────────────────────────────
function OrderCard({
 order, i,
 onShip, onCancel, onDeliver, onSlip, onView, onReject,
}: {
 order: OrderResponseDto; i: number;
 onShip: () => void; onCancel: () => void;
 onDeliver: (id: number) => void; onSlip: (id: number) => void;
 onView: () => void; onReject: () => void;
}) {
 const status = getOrderStatus(order.orderStatus);
 const pStatus = getPaymentStatus(order.paymentStatus);
 const isProcessing = status === "PROCESSING";
 const isShipped = status === "SHIPPED";
 const osCfg = status ? ORDER_STATUS_CONFIG[status] : null;
 const psCfg = pStatus ? PAYMENT_STATUS_CONFIG[pStatus] : null;
 const OsIcon = osCfg?.icon ?? Package;

 return (
 <div className="bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 flex flex-col transition-colors rounded-none hover:border-black dark:hover:border-white">
 
 {/* Row 1: Header Técnico */}
 <div className="flex flex-col md:flex-row md:items-start justify-between p-6 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10 gap-4">
 <div>
 <div className="flex items-center gap-3 mb-1">
 <span className="font-semibold text-lg text-black dark:text-white uppercase tracking-tight">DOC-{order.id.toString().padStart(4, '0')}</span>
 {osCfg && (
 <span className={cn("px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border flex items-center gap-1.5", osCfg.className)}>
 <OsIcon className="w-3 h-3" strokeWidth={1.5} />{osCfg.label}
 </span>
 )}
 </div>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 {format(new Date(order.createdAt + "Z"), "dd MMM yyyy · HH:mm", { locale: es })}
 </p>
 </div>
 
 <div className="flex flex-col items-start md:items-end gap-2">
 <div className="flex items-center gap-2">
 <CreditCard className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
 <span className="text-xl font-semibold tracking-tight text-black dark:text-white">
 ${order.totalAmount} <span className="text-xs font-bold text-gray-400 ml-1">{order.currency}</span>
 </span>
 </div>
 {psCfg && (
 <span className={cn("px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border", psCfg.className)}>
 PAGO {psCfg.label}
 </span>
 )}
 </div>
 </div>

 {/* Row 2: Datos de Entrega */}
 <div className="p-6 border-b border-black/10 dark:border-white/10">
 <p className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white mb-1">{order.consumerName}</p>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">{order.consumerEmail}</p>
 
 {order.shippingAddress && (
 <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10">
 <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" strokeWidth={1.5} />
 <span className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white leading-relaxed">{order.shippingAddress}</span>
 </div>
 )}

 {order.trackingNumber && (
 <div className="mt-4 flex items-center justify-between p-4 bg-black text-white dark:bg-white dark:text-black">
 <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">NÚMERO DE GUÍA</span>
 <span className="font-mono text-sm font-bold tracking-widest">{order.trackingNumber}</span>
 </div>
 )}
 </div>

 {/* Row 3: Items */}
 <div className="p-6 border-b border-black/10 dark:border-white/10">
 <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3">PARTIDAS DE DESPACHO</h4>
 <div className="flex flex-wrap gap-2">
 {order.items.filter(it => !it.isDigital).map((item, idx) => (
 <span key={idx} className="border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
 <span className="bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5">{item.quantity}</span> 
 {item.itemName}
 </span>
 ))}
 {order.items.filter(it => !it.isDigital).length === 0 && (
 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">DESPACHO DIGITAL (SIN ENVÍO FÍSICO)</span>
 )}
 </div>
 </div>

 {/* Row 4: Comandos Inferiores */}
 <div className="flex flex-col sm:flex-row bg-gray-50 dark:bg-[#050505]">
 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 border-r border-b sm:border-b-0 border-black/10 dark:border-white/10 bg-transparent text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#111] hover:text-black dark:hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none"
 onClick={onView}
 >
 <Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> AUDITAR DETALLES
 </button>

 {(isProcessing || isShipped) && (
 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 border-r border-b sm:border-b-0 border-black/10 dark:border-white/10 bg-transparent text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#111] hover:text-black dark:hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none"
 onClick={() => onSlip(order.id)}
 >
 <Printer className="w-3.5 h-3.5" strokeWidth={1.5} /> IMPRIMIR HOJA
 </button>
 )}

 {isProcessing && (
 <>
 {order.prescriptionUrls && !order.prescriptionApproved ? (
 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 border-r border-b sm:border-b-0 border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none"
 onClick={onView}
 >
 <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} /> VERIFICAR RECETA
 </button>
 ) : (
 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 border-r border-b sm:border-b-0 border-black/20 dark:border-white/20 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none"
 onClick={onShip}
 >
 <Truck className="w-3.5 h-3.5" strokeWidth={1.5} /> MARCAR ENVIADO
 </button>
 )}

 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 border-black/10 dark:border-white/10 bg-transparent text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/10 transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none"
 onClick={onCancel}
 >
 <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> ANULAR ORDEN
 </button>
 </>
 )}

 {isShipped && (
 <button 
 className="flex-1 h-12 flex items-center justify-center gap-2 border-black/20 dark:border-white/20 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none"
 onClick={() => onDeliver(order.id)}
 >
 <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} /> CONFIRMAR ENTREGA
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
 toast.error("ERROR EN DESENCRIPTADO DE DOCUMENTO", { theme: "colored" });
 } finally {
 setLoadingId(null);
 }
 };

 try {
 const urls = JSON.parse(prescriptionUrls) as Record<string, string>;
 const entries = Object.entries(urls);
 if (entries.length === 0) return null;
 return (
 <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-500/30 flex flex-col">
 <h4 className="text-[9px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2">
 <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} /> DOCUMENTOS CLÍNICOS ADJUNTOS
 </h4>
 <div className="flex flex-col gap-2">
 {entries.map(([itemId, fileKey]) => (
 <button key={itemId} 
 className="h-12 px-6 flex items-center justify-between border border-amber-500/30 bg-white dark:bg-[#0a0a0a] text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none disabled:opacity-50"
 onClick={() => handleView(itemId, fileKey)}
 disabled={loadingId === itemId}
 >
 <div className="flex items-center gap-2">
 {loadingId === itemId ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} /> : <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />}
 <span>REFERENCIA ÍTEM #{itemId}</span>
 </div>
 <span className="opacity-60">{loadingId === itemId ? "DESCIFRANDO..." : "VISUALIZAR"}</span>
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
 fetchOrders, shipOrder, markAsDelivered, cancelOrder, downloadSlip, rejectOrder, approvePrescription,
 } = useProviderOrders();

 const [{ selectedOrder, orderToCancel, orderToView, orderToReject, trackingNumber, shippingCarrier, rejectionReasonInput, evidenceUrl, isUploading }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_SELECTEDORDER': return { ...state, selectedOrder: typeof action.payload === 'function' ? action.payload(state.selectedOrder) : action.payload };
 case 'SET_ORDERTOCANCEL': return { ...state, orderToCancel: typeof action.payload === 'function' ? action.payload(state.orderToCancel) : action.payload };
 case 'SET_ORDERTOVIEW': return { ...state, orderToView: typeof action.payload === 'function' ? action.payload(state.orderToView) : action.payload };
 case 'SET_ORDERTOREJECT': return { ...state, orderToReject: typeof action.payload === 'function' ? action.payload(state.orderToReject) : action.payload };
 case 'SET_TRACKINGNUMBER': return { ...state, trackingNumber: typeof action.payload === 'function' ? action.payload(state.trackingNumber) : action.payload };
 case 'SET_SHIPPINGCARRIER': return { ...state, shippingCarrier: typeof action.payload === 'function' ? action.payload(state.shippingCarrier) : action.payload };
 case 'SET_REJECTIONREASONINPUT': return { ...state, rejectionReasonInput: typeof action.payload === 'function' ? action.payload(state.rejectionReasonInput) : action.payload };
 case 'SET_EVIDENCEURL': return { ...state, evidenceUrl: typeof action.payload === 'function' ? action.payload(state.evidenceUrl) : action.payload };
 case 'SET_ISUPLOADING': return { ...state, isUploading: typeof action.payload === 'function' ? action.payload(state.isUploading) : action.payload };
 default: return state;
 }
 },
 {
 selectedOrder: null, orderToCancel: null, orderToView: null, orderToReject: null, trackingNumber: "", shippingCarrier: "DHL", rejectionReasonInput: "RECETA MÉDICA INVÁLIDA O ILEGIBLE", evidenceUrl: "", isUploading: false
 }
 );

 const setSelectedOrder = (val: any) => dispatch({ type: 'SET_SELECTEDORDER', payload: val });
 const setOrderToCancel = (val: any) => dispatch({ type: 'SET_ORDERTOCANCEL', payload: val });
 const setOrderToView = (val: any) => dispatch({ type: 'SET_ORDERTOVIEW', payload: val });
 const setOrderToReject = (val: any) => dispatch({ type: 'SET_ORDERTOREJECT', payload: val });
 const setTrackingNumber = (val: any) => dispatch({ type: 'SET_TRACKINGNUMBER', payload: val });
 const setShippingCarrier = (val: any) => dispatch({ type: 'SET_SHIPPINGCARRIER', payload: val });
 const setRejectionReasonInput = (val: any) => dispatch({ type: 'SET_REJECTIONREASONINPUT', payload: val });
 const setEvidenceUrl = (val: any) => dispatch({ type: 'SET_EVIDENCEURL', payload: val });
 const setIsUploading = (val: any) => dispatch({ type: 'SET_ISUPLOADING', payload: val });











 useEffect(() => { fetchOrders("ERROR EN RECUPERACIÓN DE DATOS"); }, [fetchOrders]);

 const handleShipSubmit = async () => {
 if (!selectedOrder || trackingNumber.trim().length < 5) return;
 const ok = await shipOrder(
 selectedOrder.id,
 trackingNumber.trim(),
 "ACTUALIZACIÓN LOGÍSTICA CONFIRMADA",
 "ERROR EN ACTUALIZACIÓN LOGÍSTICA",
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
 toast.success("EVIDENCIA ADJUNTADA AL REGISTRO", { theme: "colored" });
 } catch (error) {
 toast.error("ERROR EN SUBIDA DE ARCHIVO", { theme: "colored" });
 } finally {
 setIsUploading(false);
 }
 };

 const processingCount = orders.filter(o => getOrderStatus(o.orderStatus) === "PROCESSING").length;
 const shippedCount = orders.filter(o => getOrderStatus(o.orderStatus) === "SHIPPED").length;

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-8 transition-colors duration-500 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
 <div className="max-w-7xl mx-auto space-y-8">

 {/* --- HEADER ARQUITECTÓNICO --- */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
 <div className="flex items-start gap-5">
 <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
 <ShoppingBag className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
 Comercio Digital
 </p>
 <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
 {t("title", { defaultValue: 'RECEPCIÓN DE PEDIDOS' })}
 </h1>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 {t("subtitle", { defaultValue: 'CENTRO DE DESPACHO Y LOGÍSTICA DE E-COMMERCE.' })}
 </p>
 </div>
 </div>
 {!isLoading && orders.length > 0 && (
 <div className="flex flex-wrap gap-2 shrink-0">
 {processingCount > 0 && (
 <span className="flex items-center gap-2 h-10 px-4 border border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400 text-[9px] font-bold uppercase tracking-widest">
 <Package className="w-3.5 h-3.5" strokeWidth={1.5} /> {processingCount} EN PROCESO
 </span>
 )}
 {shippedCount > 0 && (
 <span className="flex items-center gap-2 h-10 px-4 border border-indigo-500/30 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/10 dark:text-indigo-400 text-[9px] font-bold uppercase tracking-widest">
 <Truck className="w-3.5 h-3.5" strokeWidth={1.5} /> {shippedCount} EN TRÁNSITO
 </span>
 )}
 </div>
 )}
 </div>

 {/* Orders list */}
 {isLoading ? (
 <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20">
 <QhSpinner size="lg" className="text-black dark:text-white" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
 {t("loading", { defaultValue: 'SINCRONIZANDO LIBRO DE PEDIDOS...' })}
 </p>
 </div>
 ) : orders.length === 0 ? (
 <div className="py-24 flex flex-col items-center justify-center text-center bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20">
 <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
 <ShoppingBag className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
 </div>
 <p className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
 {t("empty_state", { defaultValue: 'NO HAY PEDIDOS PENDIENTES' })}
 </p>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs leading-relaxed">
 SU FILA DE DESPACHO SE ENCUENTRA VACÍA.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-6">
 {orders.map((order, i) => (
 <OrderCard
 key={order.id} order={order} i={i}
 onShip={() => setSelectedOrder(order)}
 onCancel={() => setOrderToCancel(order)}
 onDeliver={(id) => markAsDelivered(id, "ENTREGA CONFIRMADA", "ERROR EN CONFIRMACIÓN")}
 onSlip={(id) => downloadSlip(id, "HOJA DE DESPACHO EXTRAÍDA", "ERROR EN EXTRACCIÓN")}
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
 <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 rounded-none shadow-2xl flex flex-col overflow-hidden">
 
 <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
 <Truck className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
 Control Logístico
 </p>
 <DialogTitle className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
 {t("modal_title", { defaultValue: 'ASIGNACIÓN DE GUÍA' })}
 </DialogTitle>
 </div>
 </div>
 </div>

 <div className="flex flex-col bg-gray-50 dark:bg-[#050505]">
 
 <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed mb-6">
 {selectedOrder && `DOCUMENTO DOC-${selectedOrder.id.toString().padStart(4, '0')} • DESTINATARIO: ${selectedOrder.consumerName}`}
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-black/20 dark:border-white/20">
 
 {/* Selector de Paquetería */}
 <div className="p-4 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
 <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-2">TRANSPORTISTA</label>
 <select
 value={shippingCarrier}
 onChange={(e) => setShippingCarrier(e.target.value)}
 className="w-full h-10 px-0 bg-transparent border-0 text-[10px] font-bold text-black dark:text-white uppercase tracking-widest focus:ring-0 rounded-none cursor-pointer"
 >
 {CARRIERS.map(c => (
 <option key={c.value} value={c.value}>{c.label}</option>
 ))}
 </select>
 </div>

 {/* Número de Guía */}
 <div className="p-4 flex flex-col justify-center bg-gray-50 dark:bg-[#050505]">
 <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex justify-between">
 {t("modal_input_label", { defaultValue: 'NÚMERO DE RASTREO' })} <span className="text-red-500">*</span>
 </label>
 <input
 value={trackingNumber}
 onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
 placeholder="EJ. 1Z9999999999999999"
 className="w-full h-10 px-0 bg-transparent border-0 text-xs font-mono font-bold text-black dark:text-white uppercase tracking-widest focus:ring-0 placeholder:text-gray-400"
 autoFocus
 onKeyDown={(e) => e.key === "Enter" && handleShipSubmit()}
 />
 </div>
 </div>
 </div>

 {/* Evidencia Fotográfica */}
 <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-4 block flex justify-between">
 <span>PRUEBA VISUAL DE EMPAQUE (OPCIONAL)</span>
 </label>
 
 {!evidenceUrl ? (
 <div className="border border-dashed border-black/30 dark:border-white/30 bg-gray-50 dark:bg-[#050505] p-6 text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
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
 <QhSpinner size="sm" className="text-black dark:text-white" />
 ) : (
 <>
 <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center text-black dark:text-white">
 <Package className="w-4 h-4" strokeWidth={1.5} />
 </div>
 <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">SELECCIONAR ARCHIVO DE IMAGEN</span>
 </>
 )}
 </label>
 </div>
 ) : (
 <div className="border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] p-4 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 border border-black/20 dark:border-white/20 overflow-hidden bg-white dark:bg-[#0a0a0a]">
 <img src={evidenceUrl} alt="Evidencia" className="w-full h-full object-cover" />
 </div>
 <div>
 <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white block mb-1">
 ARCHIVO CARGADO
 </span>
 <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
 <CheckCircle2 className="w-3 h-3" strokeWidth={2} /> VERIFICADO
 </span>
 </div>
 </div>
 <button onClick={() => setEvidenceUrl("")} className="w-10 h-10 flex items-center justify-center bg-transparent text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors">
 <XCircle className="w-4 h-4" strokeWidth={1.5} />
 </button>
 </div>
 )}
 </div>
 </div>

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-col sm:flex-row justify-end gap-4 shrink-0">
 <button 
 onClick={() => setSelectedOrder(null)}
 className="h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none w-full sm:w-auto"
 >
 {t("btn_cancel", { defaultValue: 'ANULAR' })}
 </button>
 <button 
 className="h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none w-full sm:w-auto disabled:opacity-50"
 onClick={handleShipSubmit} disabled={isSubmitting || trackingNumber.trim().length < 5}
 >
 {isSubmitting ? <QhSpinner size="sm" className="text-current" /> : <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />}
 {t("btn_confirm", { defaultValue: 'CONFIRMAR INSERCIÓN' })}
 </button>
 </div>
 </DialogContent>
 </Dialog>

 {/* ── MODAL: Confirmar Cancelación ──────────────────────────────────── */}
 <Dialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
 <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-red-500 p-0 rounded-none shadow-2xl flex flex-col overflow-hidden">
 
 <div className="p-6 md:p-8 bg-red-500 text-white flex items-center gap-4 shrink-0">
 <XCircle className="w-6 h-6" strokeWidth={1.5} />
 <DialogTitle className="text-xl font-semibold uppercase tracking-tight leading-none">
 ALERTA DE SISTEMA: ANULACIÓN
 </DialogTitle>
 </div>

 <div className="p-6 md:p-8 bg-gray-50 dark:bg-[#050505] flex flex-col gap-4">
 <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white leading-relaxed">
 LA ACCIÓN ANULARÁ EL DOCUMENTO DOC-{orderToCancel?.id.toString().padStart(4, '0')} DE {orderToCancel?.consumerName}.
 </p>
 <div className="p-4 border border-red-500/30 bg-red-50 dark:bg-red-900/10">
 <p className="text-[10px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400">
 IMPLICACIONES FINANCIERAS:
 </p>
 <p className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mt-2">
 SE ORDENARÁ UN REVERSO POR VALOR DE ${orderToCancel?.totalAmount} {orderToCancel?.currency}
 </p>
 </div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-red-500 mt-2">
 ESTA OPERACIÓN ES IRREVERSIBLE EN LA BASE DE DATOS.
 </p>
 </div>

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
 <button 
 onClick={() => setOrderToCancel(null)} disabled={isSubmitting}
 className="h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none w-full sm:w-auto"
 >
 ABORTAR ANULACIÓN
 </button>
 <button 
 disabled={isSubmitting}
 onClick={async () => {
 if (orderToCancel) {
 const ok = await cancelOrder(orderToCancel.id, "ORDEN ANULADA. REEMBOLSO EMITIDO.", "FALLO DE CONEXIÓN BANCARIA.");
 if (ok) setOrderToCancel(null);
 }
 }}
 className="h-14 px-8 bg-red-600 text-white hover:bg-red-700 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none w-full sm:w-auto disabled:opacity-50"
 >
 {isSubmitting ? <QhSpinner size="sm" className="text-current" /> : <XCircle className="w-4 h-4" strokeWidth={1.5} />}
 CONFIRMAR REEMBOLSO
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
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 rounded-none shadow-2xl flex flex-col overflow-hidden">
        
        <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Validación Logística
              </p>
              <DialogTitle className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                RECOLECCIÓN EN SITIO
              </DialogTitle>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-gray-50 dark:bg-[#050505]">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mb-2">
              INGRESO DE PIN DE SEGURIDAD
            </p>
            <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
              Solicite al paciente el código de 6 caracteres asociado a la orden DOC-{orderToDeliverWithPin?.id?.toString().padStart(4, '0')}.
            </p>
            
            <input 
              type="text" 
              className="w-full h-14 border border-black/20 dark:border-white/20 bg-white dark:bg-black px-6 text-2xl font-bold uppercase tracking-widest text-center text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              placeholder="Ej: A1B2C3"
              value={deliveryPinInput}
              onChange={(e) => setDeliveryPinInput(e.target.value.toUpperCase())}
              disabled={isSubmitting}
              maxLength={6}
            />
          </div>
        </div>

        <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-col sm:flex-row justify-end gap-4 shrink-0 border-t border-black/20 dark:border-white/20">
          <button 
            onClick={() => {
              setOrderToDeliverWithPin(null);
              setDeliveryPinInput("");
            }}
            className="h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none w-full sm:w-auto"
          >
            CANCELAR
          </button>
          <button 
            className="h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none w-full sm:w-auto disabled:opacity-50"
            onClick={async () => {
              if (orderToDeliverWithPin && deliveryPinInput.length >= 6) {
                const ok = await deliverWithPin(
                  orderToDeliverWithPin.id, 
                  deliveryPinInput, 
                  "ORDEN ENTREGADA SATISFACTORIAMENTE", 
                  "PIN INVÁLIDO O ERROR DE SISTEMA"
                );
                if (ok) {
                  setOrderToDeliverWithPin(null);
                  setDeliveryPinInput("");
                }
              }
            }}
            disabled={isSubmitting || deliveryPinInput.length < 6}
          >
            {isSubmitting ? <QhSpinner size="sm" className="text-current" /> : <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />}
            VALIDAR Y ENTREGAR
          </button>
        </div>
      </DialogContent>
    </Dialog>

 {/* ── MODAL: Ver Detalles del Pedido ────────────────────────────────── */}
 <Dialog open={!!orderToView} onOpenChange={(open) => !open && setOrderToView(null)}>
 <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 rounded-none shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
 
 <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
 <Eye className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
 Auditoría de Documento
 </p>
 <DialogTitle className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
 DETALLE DOC-{orderToView?.id.toString().padStart(4, '0')}
 </DialogTitle>
 </div>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-gray-50 dark:bg-[#050505]">
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
 
 {/* Contacto */}
 <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col">
 <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-4">ENTIDAD RECEPTORA</h4>
 <div className="bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 p-5 flex flex-col gap-4">
 <div>
 <p className="font-semibold text-sm text-black dark:text-white uppercase tracking-widest mb-1">{orderToView?.consumerName}</p>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate">{orderToView?.consumerEmail}</p>
 </div>
 <a
 href={`mailto:${orderToView?.consumerEmail}?subject=Sobre tu pedido #${orderToView?.id} en QuHealthy`}
 className="h-10 px-4 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none w-full"
 >
 <Mail className="w-3.5 h-3.5" strokeWidth={1.5} /> ENLAZAR COMUNICACIÓN
 </a>
 </div>
 </div>

 {/* Destino */}
 <div className="p-6 md:p-8 flex flex-col">
 <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-4">COORDENADAS FÍSICAS</h4>
 <div className="bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 p-5 flex flex-col gap-4 h-full">
 {orderToView?.shippingAddress ? (
 <>
 <div className="flex items-start gap-3 mb-2 flex-1">
 <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" strokeWidth={1.5} />
 <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white leading-relaxed">
 {orderToView.shippingAddress}
 </p>
 </div>
 <div className="flex items-center gap-0 border border-black/20 dark:border-white/20">
 <button 
 className="flex-1 h-10 border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none"
 onClick={() => {
 navigator.clipboard.writeText(orderToView.shippingAddress || "");
 toast.success("DIRECCIÓN COPIADA", { theme: "colored" });
 }}
 >
 <Copy className="w-3.5 h-3.5" strokeWidth={1.5} /> EXTR.
 </button>
 <button 
 className="flex-1 h-10 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none"
 onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(orderToView.shippingAddress || "")}`, "_blank")}
 >
 <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} /> MAPS
 </button>
 </div>
 </>
 ) : (
 <div className="flex items-center justify-center h-full text-center">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 ENTREGA LÓGICA (PRODUCTO DIGITAL)
 </p>
 </div>
 )}
 </div>
 </div>

 </div>

 {/* Recetas */}
 <PrescriptionViewer prescriptionUrls={orderToView?.prescriptionUrls} />
 </div>

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-black/20 dark:border-white/20 shrink-0">
 
 <div className="flex w-full sm:w-auto gap-4">
 {orderToView?.prescriptionUrls && !orderToView?.prescriptionApproved && (
 <>
 <button 
 className="h-14 px-6 border border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none w-full sm:w-auto"
 onClick={() => {
 setOrderToReject(orderToView); 
 setOrderToView(null); 
 }}
 >
 <ShieldAlert className="w-4 h-4" strokeWidth={1.5} /> DENEGAR
 </button>
 
 <button 
 className="h-14 px-8 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none w-full sm:w-auto disabled:opacity-50"
 disabled={isSubmitting}
 onClick={async () => {
 if (!orderToView) return;
 const ok = await approvePrescription(
 orderToView.id, 
 "CERTIFICACIÓN CLÍNICA APROBADA.", 
 "ERROR EN FLUJO DE CERTIFICACIÓN."
 );
 if (ok) {
 setOrderToView({ ...orderToView, prescriptionApproved: true });
 }
 }}
 >
 {isSubmitting ? <QhSpinner size="sm" className="text-current" /> : <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />}
 CERTIFICAR
 </button>
 </>
 )}
 </div>
 
 <button 
 className="h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none w-full sm:w-auto"
 onClick={() => setOrderToView(null)}
 >
 CERRAR VISOR
 </button>
 </div>
 </DialogContent>
 </Dialog>

 {/* ── MODAL: Rechazar por Receta Inválida ──────────────────────────────── */}
 <Dialog open={!!orderToReject} onOpenChange={(open) => !open && setOrderToReject(null)}>
 <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0a0a0a] border border-amber-500 p-0 rounded-none shadow-2xl flex flex-col overflow-hidden">
 
 <div className="p-6 md:p-8 bg-amber-500 text-white flex items-center gap-4 shrink-0">
 <ShieldAlert className="w-6 h-6" strokeWidth={1.5} />
 <DialogTitle className="text-xl font-semibold uppercase tracking-tight leading-none">
 DENEGACIÓN POR POLÍTICA CLÍNICA
 </DialogTitle>
 </div>

 <div className="flex flex-col bg-gray-50 dark:bg-[#050505]">
 <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
 <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white leading-relaxed">
 BLOQUEO DEL DOCUMENTO DOC-{orderToReject?.id.toString().padStart(4, '0')} REQUERIDO POR FALTA DE CONFORMIDAD MÉDICA.
 </p>
 <div className="mt-4 p-4 border border-amber-500/30 bg-amber-50 dark:bg-amber-900/10">
 <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 leading-relaxed">
 SE ORDENARÁ RESTAURACIÓN DE INVENTARIO Y DEVOLUCIÓN DE FONDOS (${orderToReject?.totalAmount} {orderToReject?.currency}) AL PACIENTE.
 </p>
 </div>
 </div>

 <PrescriptionViewer prescriptionUrls={orderToReject?.prescriptionUrls} />

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a]">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">
 CÓDIGO DE RECHAZO TÉCNICO <span className="text-red-500">*</span>
 </label>
 <select
 value={rejectionReasonInput}
 onChange={(e) => setRejectionReasonInput(e.target.value)}
 className="w-full h-14 px-4 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:ring-0 focus:border-amber-500 transition-colors rounded-none mb-4 cursor-pointer"
 >
 <option value="RECETA MÉDICA INVÁLIDA O ILEGIBLE">DOCUMENTO INVÁLIDO O ILEGIBLE</option>
 <option value="RECETA VENCIDA">FECHA DE EMISIÓN VENCIDA</option>
 <option value="MEDICAMENTO NO COINCIDE CON RECETA">DIVERGENCIA ENTRE PRODUCTO Y RECETA</option>
 <option value="DOSIS O PRESENTACIÓN INCORRECTA">ERROR DE DOSIFICACIÓN</option>
 <option value="FALTAN DATOS OBLIGATORIOS (CÉDULA, FIRMA, FECHA)">AUSENCIA DE FIRMA O CÉDULA</option>
 <option value="OTHER">ESPECIFICACIÓN LIBRE (OTRO)</option>
 </select>

 {rejectionReasonInput === 'OTHER' && (
 <input
 placeholder="INGRESAR DETALLE ESPECÍFICO..."
 onChange={(e) => setRejectionReasonInput(e.target.value.toUpperCase())}
 className="w-full h-14 px-4 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:ring-0 focus:border-amber-500 transition-colors rounded-none placeholder:text-gray-400"
 />
 )}
 </div>
 </div>

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
 <button 
 onClick={() => setOrderToReject(null)} disabled={isSubmitting}
 className="h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none w-full sm:w-auto"
 >
 ABORTAR ACCIÓN
 </button>
 <button
 className="h-14 px-8 bg-amber-600 text-white hover:bg-amber-700 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none w-full sm:w-auto disabled:opacity-50"
 disabled={isSubmitting}
 onClick={async () => {
 if (orderToReject) {
 const finalReason = rejectionReasonInput === 'OTHER' ? 'DENEGACIÓN POR DICTAMEN MÉDICO' : rejectionReasonInput;
 const ok = await rejectOrder(
 orderToReject.id,
 finalReason,
 "DOCUMENTO ANULADO. FONDOS LIBERADOS.",
 "ERROR EN SISTEMA DE REEMBOLSO."
 );
 if (ok) {
 setOrderToReject(null);
 setRejectionReasonInput("RECETA MÉDICA INVÁLIDA O ILEGIBLE");
 }
 }
 }}
 >
 {isSubmitting ? <QhSpinner size="sm" className="text-current" /> : <ShieldAlert className="w-4 h-4" strokeWidth={1.5} />}
 CONFIRMAR DENEGACIÓN
 </button>
 </div>
 </DialogContent>
 </Dialog>
 </div>
 </div>
 );
}