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
 label: 'Pago Pendiente',
 color: 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
 accent: 'border-amber-200',
 icon: Clock
 },
 PENDING_PRESCRIPTION_REVIEW: {
 label: 'Revisión de Receta',
 color: 'border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400',
 accent: 'border-indigo-200',
 icon: FileText
 },
 PROCESSING: {
 label: 'Preparando',
 color: 'border-gray-200 text-gray-700 bg-gray-50 dark:bg-gray-500/10 dark:border-gray-500/20 dark:text-gray-300',
 accent: 'border-gray-200',
 icon: Package
 },
 SHIPPED: {
 label: 'En Tránsito',
 color: 'border-teal-200 text-teal-700 bg-teal-50 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400',
 accent: 'border-teal-200',
 icon: Truck
 },
 DELIVERED: {
 label: 'Entregado',
 color: 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
 accent: 'border-emerald-200',
 icon: CheckCircle2
 },
 CANCELLED: {
 label: 'Anulado',
 color: 'border-red-200 text-red-700 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
 accent: 'border-red-200',
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
 });
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
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans transition-colors duration-300">
 <div className="max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-16 space-y-12 pb-24">

 {/* --- HEADER --- */}
  <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
  <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between pb-8">
  <div className="flex items-start gap-6">
  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-900/20">
  <ShoppingBag className="h-7 w-7 text-teal-600" strokeWidth={2} />
  </div>
  <div className="max-w-2xl">
  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-teal-100/50 dark:bg-teal-900/30 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
  Mis Compras
  </div>
  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
  Historial de Pedidos
  </h1>
  <p className="text-sm font-medium leading-relaxed text-gray-500">
  Rastree sus compras, audite la logística de envío y confirme recepciones desde este panel unificado.
  </p>
  </div>
  </div>

  <Button
  onClick={() => fetchOrders()}
  disabled={isLoading}
  variant="outline"
  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-11 px-5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50 shrink-0"
  >
  <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} strokeWidth={2} />
  Sincronizar Datos
  </Button>
  </div>

  {/* --- ESTADÍSTICAS --- */}
  {orders.length > 0 && (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between shadow-sm transition-shadow hover:shadow-md">
  <div className="flex items-center justify-between gap-3 mb-6">
  <p className="text-xs font-semibold text-gray-500">En Proceso</p>
  <Package className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
  </div>
  <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{activeOrders}</p>
  </div>
  <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between shadow-sm transition-shadow hover:shadow-md">
  <div className="flex items-center justify-between gap-3 mb-6">
  <p className="text-xs font-semibold text-gray-500">En Tránsito</p>
  <Truck className="h-5 w-5 text-teal-400" strokeWidth={1.5} />
  </div>
  <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{shippedOrders}</p>
  </div>
  <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between shadow-sm transition-shadow hover:shadow-md">
  <div className="flex items-center justify-between gap-3 mb-6">
  <p className="text-xs font-semibold text-gray-500">Entregados</p>
  <PackageCheck className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
  </div>
  <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{deliveredOrders}</p>
  </div>
  </div>
  )}
  </motion.div>

 {/* --- ESTADO VACÍO --- */}
 {orders.length === 0 ? (
  <motion.div
  initial={{ opacity: 0, scale: 0.98 }}
  animate={{ opacity: 1, scale: 1 }}
  className="flex flex-col items-center justify-center py-24 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm"
  >
  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900/50">
  <Truck className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
  </div>
  <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white text-center">
  Aún no tienes pedidos
  </h2>
  <p className="mx-auto max-w-md text-sm font-medium text-gray-500 text-center leading-relaxed">
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
  className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-all hover:shadow-md flex flex-col group overflow-hidden"
  >
  {/* Header de Orden */}
  <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col md:flex-row md:items-center justify-between">
  <div className="p-6 md:p-8 flex items-start gap-5">
  <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center shrink-0">
  <StatusIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
  </div>
  <div>
  <div className="flex flex-wrap items-center gap-3 mb-2">
  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
  Orden #{order.id}
  </h2>
  <span className={cn(
  "border px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5",
  statusCfg.color
  )}>
  <StatusIcon className="h-3.5 w-3.5" strokeWidth={2} />
  {statusCfg.label}
  </span>
  </div>
  <p className="text-sm font-semibold text-gray-500">
  {formatDate(order.createdAt)}
  {order.providerName && (
  <span className="text-gray-700 dark:text-gray-300 ml-2 font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-xs">{order.providerName}</span>
  )}
  </p>
  </div>
  </div>

  <div className="flex border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 self-stretch">
  <div className="p-6 md:p-8 border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center flex-1 md:flex-none">
  <p className="text-xs font-semibold text-gray-500 mb-1">Unidades</p>
  <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{itemCount}</p>
  </div>
  <div className="p-6 md:p-8 flex flex-col justify-center flex-1 md:flex-none">
  <p className="text-xs font-semibold text-gray-500 mb-1">Total MXN</p>
  <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(order.totalAmount)}</p>
  </div>
  </div>
  </div>

 {/* Cuerpo de la Orden */}
 <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[400px] gap-0">

 {/* Izquierda: Lista de Ítems */}
  <div className="p-6 md:p-8 border-b lg:border-b-0 border-gray-100 dark:border-gray-800 lg:rounded-bl-3xl">
  <h4 className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
  <ReceiptText className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
  Detalle de Adquisición
  </h4>
  <ul className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-b border-gray-100 dark:border-gray-800">
  {order.items?.map(item => (
  <li key={item.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors rounded-xl px-3 -mx-3">
  <div className="min-w-0">
  <p className="truncate text-base font-bold text-gray-900 dark:text-white mb-1">
  {item.name}
  </p>
  <p className="text-xs font-semibold text-gray-500">
  Cant: {item.quantity} | Tipo: {item.isDigital ? 'Digital' : 'Físico'}
  </p>
  </div>
  <div className="shrink-0 sm:text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
  <p className="font-bold text-gray-900 dark:text-white text-base">
  {formatCurrency(item.unitPrice * item.quantity)}
  </p>
  <p className="text-xs font-semibold text-gray-400 mt-1">
  {formatCurrency(item.unitPrice)} c/u
  </p>
  </div>
  </li>
  ))}
  </ul>
  </div>

 {/* Derecha: Módulo de Logística (Margin Notes) */}
  <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] flex flex-col gap-6 lg:border-l border-gray-100 dark:border-gray-800 lg:rounded-br-3xl h-full">
  
  {/* Dirección / Método de Entrega */}
  <div className="space-y-4">
  {order.shippingAddress ? (
  order.shippingAddress === 'PICKUP' ? (
  <div className="space-y-4">
  <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 p-4 shadow-sm">
  <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
  <MapPin className="h-4 w-4" strokeWidth={2} /> 
  Logística In-Situ
  </h4>
  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
  Recolección en Clínica
  </p>
  {order.pickupTime && (
  <p className="text-xs font-semibold text-gray-500 flex items-center gap-2">
  <Clock className="h-3.5 w-3.5" strokeWidth={2} />
  Cita: {new Date(order.pickupTime).toLocaleString('es-MX', {
  year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
  })}
  </p>
  )}
  </div>
  {order.deliveryPin && (
  <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 p-4 shadow-sm">
  <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
  <Sparkles className="h-4 w-4" strokeWidth={2} /> 
  PIN de Recolección
  </h4>
  <p className="text-2xl font-bold tracking-widest text-emerald-600 mb-1">
  {order.deliveryPin}
  </p>
  <p className="text-xs font-semibold text-gray-400">
  Proporciona este código al proveedor al recolectar tu orden.
  </p>
  </div>
  )}
  </div>
  ) : (
  <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 p-4 shadow-sm">
  <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
  <MapPin className="h-4 w-4" strokeWidth={2} /> 
  Coordenadas de Entrega
  </h4>
  <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
  {order.shippingAddress}
  </p>
  </div>
  )
  ) : (
  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
  <p className="text-xs font-semibold text-amber-700 dark:text-amber-500">
  Sin domicilio registrado. Adquisición digital o in-situ.
  </p>
  </div>
  )}
  </div>

 {/* CTA de Rastreo (SHIPPED) */}
  {isShipped && (
  <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-5 space-y-5 shadow-sm">
  <div>
  <h4 className="mb-2 flex items-center text-sm font-bold text-teal-700 dark:text-teal-400">
  <Truck className="mr-2 h-5 w-5" strokeWidth={2} /> 
  Tránsito Autorizado
  </h4>
  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
  {order.shippingCarrier && (
  <>Proveedor: <span className="font-bold text-gray-900 dark:text-white">{order.shippingCarrier.replace('_', ' ')}</span><br/></>
  )}
  {order.trackingNumber && <>ID Rastreo: <span className="font-bold text-gray-900 dark:text-white">{order.trackingNumber}</span></>}
  </p>
  </div>

  <div className="flex flex-col gap-3">
  {order.trackingUrl && (
  <Button
  variant="outline"
  className="rounded-xl border border-teal-200 text-teal-700 dark:text-teal-400 hover:bg-teal-50 hover:border-teal-300 w-full h-11 text-sm font-bold transition-all shadow-sm flex justify-start pl-4"
  onClick={() => window.open(order.trackingUrl, '_blank')}
  >
  <ExternalLink className="mr-3 h-4 w-4" strokeWidth={2} />
  Portal de Rastreo
  </Button>
  )}

  <Button
  onClick={() => handleMarkAsDelivered(order.id)}
  disabled={isUpdating === order.id}
  className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 w-full h-11 text-sm font-bold transition-all shadow-sm flex justify-start pl-4 border-0 disabled:opacity-50"
  >
  {isUpdating === order.id ? (
  <QhSpinner size="sm" className="mr-3" />
  ) : (
  <Check className="mr-3 h-4 w-4" strokeWidth={2} />
  )}
  Confirmar Recepción
  </Button>
  </div>
  </div>
  )}

 {/* Entregado (DELIVERED) */}
  {isDelivered && (
  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
  <h4 className="flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">
  <CheckCircle2 className="mr-2 h-5 w-5" strokeWidth={2} /> 
  Recepción Confirmada
  </h4>
  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
  {order.shippingCarrier
  ? `Operación concluida vía ${order.shippingCarrier.replace('_', ' ')}.`
  : 'Operación concluida exitosamente.'}
  </p>
  </div>
  )}

 {/* Cancelado (CANCELLED) */}
  {order.orderStatus === 'CANCELLED' && (
  <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 space-y-4 shadow-sm">
  <div className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-500">
  <AlertCircle className="h-5 w-5" strokeWidth={2} />
  <h4>Anulación Ejecutada</h4>
  </div>
  
  {order.rejectionReason && (
  <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-100/50 dark:bg-red-900/10 p-4">
  <p className="mb-1 text-xs font-semibold text-red-800 dark:text-red-400">
  Dictamen del Emisor:
  </p>
  <p className="text-sm font-medium text-red-900 dark:text-red-300">
  "{order.rejectionReason}"
  </p>
  </div>
  )}
  <p className="text-xs font-semibold text-gray-500">
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