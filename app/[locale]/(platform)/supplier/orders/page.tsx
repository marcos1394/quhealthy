"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  X,
  Package,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { supplierService } from "@/services/supplier.service";
import {
  SupplierPurchaseOrder,
  PurchaseOrderStatus,
  UpdatePurchaseOrderStatusPayload,
} from "@/types/supplier";

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<SupplierPurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal Actualizar Estatus & Tracking
  const [modalOpen, setModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SupplierPurchaseOrder | null>(null);
  const [newStatus, setNewStatus] = useState<PurchaseOrderStatus>("CONFIRMED");
  const [carrierName, setCarrierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await supplierService.getPurchaseOrders();
      setOrders(data);
    } catch {
      toast.error("Error al cargar las órdenes de compra.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStatusModal = (order: SupplierPurchaseOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setCarrierName(order.carrierName || "Flotilla Propia (Cadena de Frío)");
    setTrackingNumber(order.trackingNumber || "");
    setEstimatedDelivery(order.estimatedDeliveryDate || "");
    setNotes(order.notes || "");
    setModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setIsUpdating(true);
      const payload: UpdatePurchaseOrderStatusPayload = {
        status: newStatus,
        carrierName: carrierName.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        estimatedDeliveryDate: estimatedDelivery || undefined,
        notes: notes.trim() || undefined,
      };

      await supplierService.updatePurchaseOrderStatus(selectedOrder.id, payload);
      toast.success(`Orden ${selectedOrder.poNumber} actualizada a estado: ${newStatus}`);
      setModalOpen(false);
      loadOrders();
    } catch {
      toast.error("Error al actualizar la orden.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      o.poNumber.toLowerCase().includes(term) ||
      (o.buyerOrganizationName && o.buyerOrganizationName.toLowerCase().includes(term)) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(term));
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 font-sans">
      {/* 🚀 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Despacho B2B & Fulfillment
            </span>
            <span className="text-xs text-slate-400">{orders.length} Órdenes Activas</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Órdenes de Compra (Purchase Orders)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Surtido de pedidos formales, guías de paquetería y seguimiento de entregas a clínicas y hospitales.
          </p>
        </div>
      </div>

      {/* 🔍 Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por PO, comprador o número de guía..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ISSUED">Emitida (ISSUED)</option>
            <option value="CONFIRMED">Confirmada (CONFIRMED)</option>
            <option value="IN_PREPARATION">En Preparación (IN_PREPARATION)</option>
            <option value="DISPATCHED">Despachada / En Ruta (DISPATCHED)</option>
            <option value="DELIVERED">Entregada (DELIVERED)</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
      </div>

      {/* 📦 Orders List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 flex flex-col items-center">
          <QhSpinner size="lg" className="text-indigo-600" />
          <p className="text-xs font-bold text-slate-500 mt-4 animate-pulse">Cargando órdenes de compra...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-bold text-slate-700">No hay órdenes de compra registradas</p>
          <p className="text-xs text-slate-400 mt-1">Las órdenes se generarán cuando un cliente acepte una cotización o haga una compra B2B.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">{order.poNumber}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : order.status === "DISPATCHED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : order.status === "IN_PREPARATION"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Cliente: <b>{order.buyerOrganizationName}</b> • Términos: {order.paymentTerms || "Inmediato"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900 font-mono block">
                    ${order.total?.toLocaleString()} {order.currency}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Fecha: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>

              {/* Detalle de Partidas & Tracking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                    Partidas de la Orden ({order.items?.length || 0})
                  </span>
                  <div className="divide-y divide-slate-200/60">
                    {order.items?.map((it) => (
                      <div key={it.id} className="py-1.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800 block">{it.productName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Cant: {it.quantity} u.</span>
                        </div>
                        <span className="font-mono font-extrabold text-slate-900">
                          ${it.totalPrice?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                    Información Logística & Entrega
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Paquetería: <b>{order.carrierName || "Pendiente de asignación"}</b></span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-center gap-2 font-mono text-slate-600">
                        <span className="text-[10px] text-slate-400">Guía:</span>
                        <b className="text-indigo-700">{order.trackingNumber}</b>
                      </div>
                    )}
                    {order.estimatedDeliveryDate && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Entrega Estimada: <b>{order.estimatedDeliveryDate}</b></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de Gestión */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenStatusModal(order)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Actualizar Despacho & Guía
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🚀 MODAL: ACTUALIZAR ESTATUS & TRACKING */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Fulfillment Logístico
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Actualizar Orden {selectedOrder.poNumber}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Estado de la Orden *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as PurchaseOrderStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="CONFIRMED">Confirmada (CONFIRMED)</option>
                  <option value="IN_PREPARATION">En Preparación / Picking (IN_PREPARATION)</option>
                  <option value="DISPATCHED">Despachada / En Ruta (DISPATCHED)</option>
                  <option value="DELIVERED">Entregada (DELIVERED)</option>
                  <option value="CANCELLED">Cancelada (CANCELLED)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Empresa de Transporte / Paquetería</label>
                <input
                  type="text"
                  placeholder="Ej. DHL Express / Flotilla Refrigerada QuHealthy"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Número de Guía / Tracking</label>
                <input
                  type="text"
                  placeholder="Ej. TRACK-8921-MX"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fecha Estimada de Entrega</label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {isUpdating ? "Actualizando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
