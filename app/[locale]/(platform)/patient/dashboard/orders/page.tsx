"use client"
/* eslint-disable react-doctor/no-giant-component */;

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Package, Truck, CheckCircle2, Clock,
 MapPin, AlertCircle, Check, ExternalLink, FileText,
 ShoppingBag, RefreshCw, Sparkles, PackageCheck, ReceiptText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { useConsumerOrders } from "@/hooks/useConsumerOrders";

// ── Status config (Estricto / High Contrast) ───────────────────────────────────
type StatusKey = 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;

const STATUS_CONFIG: Record<string, { label: string; color: string; accent: string; icon: React.ElementType }> = {
 PENDING_PAYMENT: {
 label: 'PAGO PENDIENTE',
 color: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/10 dark:text-amber-400',
 accent: 'border-amber-500',
 icon: Clock
 },
 PENDING_PRESCRIPTION_REVIEW: {
 label: 'REVISIÓN DE RECETA',
 color: 'border-gray-500 text-gray-600 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400',
 accent: 'border-gray-500',
 icon: FileText
 },
 PROCESSING: {
 label: 'PREPARANDO',
 color: 'border-black text-black bg-gray-100 dark:border-white dark:text-white dark:bg-[#111]',
 accent: 'border-black dark:border-white',
 icon: Package
 },
 SHIPPED: {
 label: 'EN TRÁNSITO',
 color: 'border-teal-500 text-teal-600 bg-teal-50 dark:bg-teal-900/10 dark:text-teal-400',
 accent: 'border-teal-500',
 icon: Truck
 },
 DELIVERED: {
 label: 'ENTREGADO',
 color: 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 dark:text-emerald-400',
 accent: 'border-emerald-500',
 icon: CheckCircle2
 },
 CANCELLED: {
 label: 'ANULADO',
 color: 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400',
 accent: 'border-red-500',
 icon: AlertCircle
 },
};

function getStatusConfig(status: StatusKey) {
 return STATUS_CONFIG[status?.toUpperCase()] ?? {
 label: status,
 color: 'border-gray-300 text-gray-500 bg-transparent',
 accent: 'border-gray-300',
 icon: Package
 };
}

function formatDate(dateString: string) {
 return new Date(dateString + 'Z').toLocaleDateString('es-MX', {
 year: 'numeric', month: 'short', day: '2-digit',
 }).toUpperCase();
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
 <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white dark:bg-[#0a0a0a]">
 <QhSpinner size="lg" />
 <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
 Cargando tus pedidos...
 </p>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
 <div className="max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-16 space-y-12 pb-24">

 {/* --- HEADER --- */}
 <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
 <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-8">
 <div className="flex items-start gap-6">
 <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
 <ShoppingBag className="h-6 w-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div className="max-w-2xl">
 <div className="mb-3 inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
 <Sparkles className="h-3 w-3" strokeWidth={2} />
 Mis Compras
 </div>
 <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white uppercase mb-2">
 Historial de Pedidos
 </h1>
 <p className="text-xs font-light leading-relaxed text-gray-500">
 Rastree sus compras, audite la logística de envío y confirme recepciones desde este panel unificado.
 </p>
 </div>
 </div>

 <Button
 onClick={() => fetchOrders()}
 disabled={isLoading}
 variant="outline"
 className="rounded-none border border-black dark:border-white h-12 px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-50 shrink-0"
 >
 <RefreshCw className={cn("h-3.5 w-3.5 mr-2", isLoading && "animate-spin")} strokeWidth={2} />
 Sincronizar Datos
 </Button>
 </div>

 {/* --- ESTADÍSTICAS (BLUEPRINT GRID) --- */}
 {orders.length > 0 && (
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
 <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors">
 <div className="flex items-center justify-between gap-3 mb-6">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">En Proceso</p>
 <Package className="h-4 w-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <p className="text-3xl font-semibold tracking-tight">{activeOrders}</p>
 </div>
 <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors">
 <div className="flex items-center justify-between gap-3 mb-6">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">En Tránsito</p>
 <Truck className="h-4 w-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <p className="text-3xl font-semibold tracking-tight">{shippedOrders}</p>
 </div>
 <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors">
 <div className="flex items-center justify-between gap-3 mb-6">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Entregados</p>
 <PackageCheck className="h-4 w-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <p className="text-3xl font-semibold tracking-tight">{deliveredOrders}</p>
 </div>
 </div>
 )}
 </motion.div>

 {/* --- ESTADO VACÍO --- */}
 {orders.length === 0 ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505]"
 >
 <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-gray-300 dark:border-gray-700 bg-white dark:bg-black">
 <Truck className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
 </div>
 <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-black dark:text-white text-center">
 Historial Logístico Vacío
 </h2>
 <p className="mx-auto max-w-md text-xs font-light text-gray-500 text-center leading-relaxed">
 Las adquisiciones de productos físicos y suplementos aparecerán en este directorio para su auditoría y rastreo en tiempo real.
 </p>
 </motion.div>
 ) : (
 /* --- LISTADO DE ÓRDENES --- */
 <div className="space-y-8">
 <AnimatePresence>
 {orders.map((order, index) => {
 const statusCfg = getStatusConfig(order.orderStatus);
 const StatusIcon = statusCfg.icon;
 const isShipped = order.orderStatus === 'SHIPPED';
 const isDelivered = order.orderStatus === 'DELIVERED';
 const itemCount = order.items?.reduce((total, item) => total + item.quantity, 0) || 0;

 return (
 <motion.div
 key={order.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-colors flex flex-col hover:border-black dark:hover:border-white group"
 >
 {/* Header de Orden */}
 <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex flex-col md:flex-row md:items-center justify-between">
 <div className="p-6 md:p-8 flex items-start gap-5">
 <div className="w-12 h-12 border border-black dark:border-white bg-white dark:bg-black flex items-center justify-center shrink-0">
 <StatusIcon className="h-5 w-5 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-3 mb-2">
 <h2 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white leading-none">
 Orden #{order.id}
 </h2>
 <span className={cn(
 "border px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5",
 statusCfg.color
 )}>
 <StatusIcon className="h-3 w-3" strokeWidth={2} />
 {statusCfg.label}
 </span>
 </div>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 {formatDate(order.createdAt)}
 {order.providerName && (
 <span className="text-black dark:text-white ml-2">[{order.providerName}]</span>
 )}
 </p>
 </div>
 </div>

 <div className="flex border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 self-stretch">
 <div className="p-6 md:p-8 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-center flex-1 md:flex-none">
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Unidades</p>
 <p className="text-xl font-semibold text-black dark:text-white tracking-tight">{itemCount}</p>
 </div>
 <div className="p-6 md:p-8 flex flex-col justify-center flex-1 md:flex-none">
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total MXN</p>
 <p className="text-xl font-semibold text-black dark:text-white tracking-tight">{formatCurrency(order.totalAmount)}</p>
 </div>
 </div>
 </div>

 {/* Cuerpo de la Orden */}
 <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-0">

 {/* Izquierda: Lista de Ítems */}
 <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800">
 <h4 className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 <ReceiptText className="h-4 w-4" strokeWidth={1.5} />
 Detalle de Adquisición
 </h4>
 <ul className="divide-y divide-gray-200 dark:divide-gray-800 border-t border-b border-gray-200 dark:border-gray-800">
 {order.items?.map(item => (
 <li key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-[#050505] px-2 -mx-2 transition-colors">
 <div className="min-w-0">
 <p className="truncate text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">
 {item.name}
 </p>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 CANT: {item.quantity} | TIPO: {item.isDigital ? 'DIGITAL' : 'FÍSICO'}
 </p>
 </div>
 <div className="shrink-0 sm:text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
 <p className="font-semibold text-black dark:text-white text-sm">
 {formatCurrency(item.unitPrice * item.quantity)}
 </p>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">
 {formatCurrency(item.unitPrice)} C/U
 </p>
 </div>
 </li>
 ))}
 </ul>
 </div>

 {/* Derecha: Módulo de Logística (Margin Notes) */}
 <div className="p-6 md:p-8 bg-gray-50 dark:bg-[#050505] flex flex-col gap-8">
 
 {/* Dirección / Método de Entrega */}
 <div className="space-y-4">
 {order.shippingAddress ? (
 order.shippingAddress === 'PICKUP' ? (
 <div className="space-y-4">
 <div className="border-l-2 border-black dark:border-white pl-4 py-1">
 <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
 <MapPin className="h-3.5 w-3.5" strokeWidth={2} /> 
 Logística In-Situ
 </h4>
 <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-1">
 Recolección en Clínica
 </p>
 {order.pickupTime && (
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
 <Clock className="h-3 w-3" strokeWidth={2} />
 Cita: {new Date(order.pickupTime).toLocaleString('es-MX', {
 year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
 }).toUpperCase()}
 </p>
 )}
 </div>
 {order.deliveryPin && (
 <div className="border-l-2 border-black dark:border-white pl-4 py-3 bg-white dark:bg-black">
 <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
 <Sparkles className="h-3.5 w-3.5" strokeWidth={2} /> 
 PIN de Recolección
 </h4>
 <p className="text-2xl font-bold tracking-widest text-black dark:text-white uppercase mb-1">
 {order.deliveryPin}
 </p>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 Proporciona este código al proveedor al recolectar tu orden.
 </p>
 </div>
 )}
 </div>
 ) : (
 <div className="border-l-2 border-black dark:border-white pl-4 py-1">
 <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
 <MapPin className="h-3.5 w-3.5" strokeWidth={2} /> 
 Coordenadas de Entrega
 </h4>
 <p className="text-xs font-light text-black dark:text-white leading-relaxed uppercase">
 {order.shippingAddress}
 </p>
 </div>
 )
 ) : (
 <div className="border-l-2 border-amber-500 pl-4 py-1">
 <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
 Sin domicilio registrado. Adquisición digital o in-situ.
 </p>
 </div>
 )}
 </div>

 {/* CTA de Rastreo (SHIPPED) */}
 {isShipped && (
 <div className="border-l-2 border-teal-500 pl-4 py-2 space-y-5">
 <div>
 <h4 className="mb-2 flex items-center text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
 <Truck className="mr-2 h-3.5 w-3.5" strokeWidth={2} /> 
 Tránsito Autorizado
 </h4>
 <p className="text-xs font-light text-black dark:text-white uppercase leading-relaxed">
 {order.shippingCarrier && (
 <>PROVEEDOR: <span className="font-bold">{order.shippingCarrier.replace('_', ' ')}</span><br/></>
 )}
 {order.trackingNumber && <>ID RASTREO: <span className="font-bold">{order.trackingNumber}</span></>}
 </p>
 </div>

 <div className="flex flex-col gap-3">
 {order.trackingUrl && (
 <Button
 variant="outline"
 className="rounded-none border border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-500 hover:text-white w-full h-10 text-[9px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-4"
 onClick={() => window.open(order.trackingUrl, '_blank')}
 >
 <ExternalLink className="mr-3 h-3.5 w-3.5" strokeWidth={2} />
 Portal de Rastreo
 </Button>
 )}

 <Button
 onClick={() => handleMarkAsDelivered(order.id)}
 disabled={isUpdating === order.id}
 className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 w-full h-10 text-[9px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-4 border-0 disabled:opacity-50"
 >
 {isUpdating === order.id ? (
 <QhSpinner size="sm" className="mr-3" />
 ) : (
 <Check className="mr-3 h-3.5 w-3.5" strokeWidth={2} />
 )}
 Confirmar Recepción
 </Button>
 </div>
 </div>
 )}

 {/* Entregado (DELIVERED) */}
 {isDelivered && (
 <div className="border-l-2 border-emerald-500 pl-4 py-2">
 <h4 className="flex items-center text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
 <CheckCircle2 className="mr-2 h-3.5 w-3.5" strokeWidth={2} /> 
 Recepción Confirmada
 </h4>
 <p className="text-xs font-light text-black dark:text-white uppercase leading-relaxed">
 {order.shippingCarrier
 ? `OPERACIÓN CONCLUIDA VÍA ${order.shippingCarrier.replace('_', ' ')}.`
 : 'OPERACIÓN CONCLUIDA EXITOSAMENTE.'}
 </p>
 </div>
 )}

 {/* Cancelado (CANCELLED) */}
 {order.orderStatus === 'CANCELLED' && (
 <div className="border-l-2 border-red-500 pl-4 py-2 space-y-4">
 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
 <AlertCircle className="h-3.5 w-3.5" strokeWidth={2} />
 <h4>Anulación Ejecutada</h4>
 </div>
 
 {order.rejectionReason && (
 <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 p-3">
 <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-red-800 dark:text-red-400">
 Dictamen del Emisor:
 </p>
 <p className="text-xs italic font-light text-red-900 dark:text-red-300 uppercase">
 "{order.rejectionReason}"
 </p>
 </div>
 )}
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 Reintegro financiero procesado. Contacte a soporte si persisten inconsistencias.
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