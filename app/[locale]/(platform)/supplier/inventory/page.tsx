"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import {
  Layers,
  Truck,
  History,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Warehouse,
  ArrowRight,
  RefreshCw,
  X,
  FileSpreadsheet,
  AlertCircle,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { supplierService } from "@/services/supplier.service";
import {
  ProductBatch,
  InventoryTransfer,
  InventoryMovement,
  SupplierWarehouse,
  MedicalProduct,
  BatchStatus,
  MovementType,
  TransferStatus,
  SaveProductBatchPayload,
  CreateInventoryTransferPayload,
  InventoryAdjustmentPayload,
} from "@/types/supplier";

export default function SupplierInventoryPage() {
  const [activeTab, setActiveTab] = useState<"batches" | "transfers" | "movements">("batches");
  const [isLoading, setIsLoading] = useState(true);

  // Core Data
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [warehouses, setWarehouses] = useState<SupplierWarehouse[]>([]);
  const [products, setProducts] = useState<MedicalProduct[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modal 1: Nuevo Lote
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [isSavingBatch, setIsSavingBatch] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | "">("");
  const [lotNumber, setLotNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [batchQuantity, setBatchQuantity] = useState<string>("");
  const [unitCost, setUnitCost] = useState<string>("");

  // Modal 2: Solicitar Transferencia
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [isSavingTransfer, setIsSavingTransfer] = useState(false);
  const [sourceWarehouseId, setSourceWarehouseId] = useState<number | "">("");
  const [targetWarehouseId, setTargetWarehouseId] = useState<number | "">("");
  const [transferProductId, setTransferProductId] = useState<number | "">("");
  const [transferBatchId, setTransferBatchId] = useState<number | "">("");
  const [transferQty, setTransferQty] = useState<string>("");
  const [transferNotes, setTransferNotes] = useState("");

  // Modal 3: Ajuste Manual de Kardex
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [isSavingAdjustment, setIsSavingAdjustment] = useState(false);
  const [adjustBatchId, setAdjustBatchId] = useState<number | "">("");
  const [adjustQty, setAdjustQty] = useState<string>("");
  const [adjustType, setAdjustType] = useState<MovementType>("ADJUSTMENT");
  const [adjustNotes, setAdjustNotes] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [batchData, transferData, movementData, whData, prodData] = await Promise.all([
        supplierService.getBatches(),
        supplierService.getTransfers(),
        supplierService.getMovementsPaged(0, 50),
        supplierService.getWarehouses(),
        supplierService.getProducts(),
      ]);

      setBatches(batchData);
      setTransfers(transferData);
      setMovements(movementData.content || []);
      setWarehouses(whData);
      setProducts(prodData);
    } catch {
      toast.error("Error al cargar la información de inventarios.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedWarehouseId || !lotNumber.trim() || !batchQuantity) {
      toast.warning("Completa todos los campos obligatorios del lote.");
      return;
    }

    try {
      setIsSavingBatch(true);
      const payload: SaveProductBatchPayload = {
        productId: Number(selectedProductId),
        warehouseId: Number(selectedWarehouseId),
        lotNumber: lotNumber.trim().toUpperCase(),
        expirationDate: expirationDate || undefined,
        quantity: parseInt(batchQuantity, 10),
        unitCost: unitCost ? parseFloat(unitCost) : undefined,
      };

      await supplierService.createBatch(payload);
      toast.success("Lote registrado e ingresado al kardex con éxito.");
      setBatchModalOpen(false);
      setLotNumber("");
      setBatchQuantity("");
      setUnitCost("");
      loadAllData();
    } catch {
      toast.error("Error al registrar el lote.");
    } finally {
      setIsSavingBatch(false);
    }
  };

  const handleRequestTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceWarehouseId || !targetWarehouseId || !transferProductId || !transferBatchId || !transferQty) {
      toast.warning("Completa todos los datos de la transferencia.");
      return;
    }
    if (sourceWarehouseId === targetWarehouseId) {
      toast.warning("El almacén de origen y destino no pueden ser el mismo.");
      return;
    }

    try {
      setIsSavingTransfer(true);
      const payload: CreateInventoryTransferPayload = {
        sourceWarehouseId: Number(sourceWarehouseId),
        targetWarehouseId: Number(targetWarehouseId),
        productId: Number(transferProductId),
        batchId: Number(transferBatchId),
        quantity: parseInt(transferQty, 10),
        notes: transferNotes.trim() || undefined,
      };

      await supplierService.requestTransfer(payload);
      toast.success("Traspaso solicitado con éxito.");
      setTransferModalOpen(false);
      setTransferQty("");
      setTransferNotes("");
      loadAllData();
    } catch {
      toast.error("Error al solicitar el traspaso.");
    } finally {
      setIsSavingTransfer(false);
    }
  };

  const handleApproveTransfer = async (id: number) => {
    try {
      await supplierService.approveTransfer(id);
      toast.success("Transferencia aprobada y despachada (En Tránsito).");
      loadAllData();
    } catch {
      toast.error("Error al aprobar la transferencia.");
    }
  };

  const handleReceiveTransfer = async (id: number) => {
    try {
      await supplierService.receiveTransfer(id);
      toast.success("Transferencia recibida e ingresada al almacén destino.");
      loadAllData();
    } catch {
      toast.error("Error al confirmar la recepción.");
    }
  };

  const handleCancelTransfer = async (id: number) => {
    if (!confirm("¿Deseas cancelar esta transferencia?")) return;
    try {
      await supplierService.cancelTransfer(id);
      toast.success("Transferencia cancelada.");
      loadAllData();
    } catch {
      toast.error("Error al cancelar la transferencia.");
    }
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustBatchId || !adjustQty) {
      toast.warning("Indica el lote y la cantidad a ajustar.");
      return;
    }

    try {
      setIsSavingAdjustment(true);
      const payload: InventoryAdjustmentPayload = {
        batchId: Number(adjustBatchId),
        quantity: parseInt(adjustQty, 10),
        movementType: adjustType,
        notes: adjustNotes.trim() || undefined,
      };

      await supplierService.createInventoryAdjustment(payload);
      toast.success("Ajuste de inventario registrado con éxito.");
      setAdjustmentModalOpen(false);
      setAdjustQty("");
      setAdjustNotes("");
      loadAllData();
    } catch {
      toast.error("Error al registrar el ajuste de inventario.");
    } finally {
      setIsSavingAdjustment(false);
    }
  };

  const filteredBatches = batches.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.lotNumber.toLowerCase().includes(q) ||
      (b.productName && b.productName.toLowerCase().includes(q)) ||
      (b.warehouseName && b.warehouseName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 font-sans">
      {/* 🚀 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Multi-Almacén & Trazabilidad
            </span>
            <span className="text-xs text-slate-400">{warehouses.length} Almacenes Activos</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Gestión de Inventarios & Lotes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de números de lote, fechas de vencimiento, transferencias inter-almacén y auditoría matemática de kardex.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAdjustmentModalOpen(true)}
            className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl transition-all shadow-2xs flex items-center gap-2"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            Ajuste de Kardex
          </button>

          <button
            onClick={() => setTransferModalOpen(true)}
            className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl transition-all shadow-2xs flex items-center gap-2"
          >
            <Truck className="w-3.5 h-3.5 text-slate-500" />
            Solicitar Traspaso
          </button>

          <button
            onClick={() => setBatchModalOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ingresar Nuevo Lote
          </button>
        </div>
      </div>

      {/* 🧭 Tabs */}
      <div className="flex border-b border-slate-200 gap-6 mb-6">
        <button
          onClick={() => setActiveTab("batches")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "batches"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          Lotes & Caducidades ({batches.length})
        </button>

        <button
          onClick={() => setActiveTab("transfers")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "transfers"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Truck className="w-4 h-4" />
          Transferencias Inter-Almacén ({transfers.length})
        </button>

        <button
          onClick={() => setActiveTab("movements")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "movements"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <History className="w-4 h-4" />
          Kardex & Auditoría Histórica
        </button>
      </div>

      {/* 📋 TAB 1: LOTES & CADUCIDADES */}
      {activeTab === "batches" && (
        <div className="space-y-4 animate-in fade-in">
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por lote, insumo médico o almacén..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-none text-slate-700"
            />
          </div>

          {isLoading ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 flex flex-col items-center">
              <QhSpinner size="lg" className="text-indigo-600" />
              <p className="text-xs font-bold text-slate-500 mt-4 animate-pulse">Cargando lotes...</p>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold text-slate-700">No hay lotes registrados</p>
              <p className="text-xs text-slate-400 mt-1">Haz clic en "Ingresar Nuevo Lote" para dar entrada a stock físico.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Lote & Producto</th>
                      <th className="py-3.5 px-4">Almacén</th>
                      <th className="py-3.5 px-4">Fecha Caducidad</th>
                      <th className="py-3.5 px-4">Stock Disponible</th>
                      <th className="py-3.5 px-4">Reservado</th>
                      <th className="py-3.5 px-4">Estatus Sanitario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBatches.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-mono font-extrabold text-slate-900 text-xs">
                              LOTE #{b.lotNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 block">{b.productName}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                            {b.warehouseName}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {b.expirationDate || "Sin caducidad"}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-extrabold text-slate-900 text-xs">
                            {b.availableQuantity} u.
                          </span>
                          <span className="text-[10px] text-slate-400 block">Total: {b.quantity} u.</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-medium text-amber-700">{b.reservedQuantity} u.</span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : b.status === "QUARANTINE"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🚚 TAB 2: TRANSFERENCIAS INTER-ALMACÉN */}
      {activeTab === "transfers" && (
        <div className="space-y-4 animate-in fade-in">
          {transfers.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold text-slate-700">No hay transferencias activas</p>
              <p className="text-xs text-slate-400 mt-1">Usa el botón "Solicitar Traspaso" para mover mercancía entre sedes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transfers.map((trf) => (
                <div key={trf.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-xs text-indigo-700">
                      {trf.transferNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        trf.status === "RECEIVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : trf.status === "IN_TRANSIT"
                          ? "bg-blue-100 text-blue-800"
                          : trf.status === "REQUESTED"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {trf.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{trf.productName}</h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Lote: #{trf.lotNumber} • Cantidad: <b className="text-slate-800">{trf.quantity} unidades</b>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs text-slate-600">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Origen</span>
                      <span className="font-bold text-slate-800">{trf.sourceWarehouseName}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="space-y-0.5 text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Destino</span>
                      <span className="font-bold text-slate-800">{trf.targetWarehouseName}</span>
                    </div>
                  </div>

                  {/* Acciones por estado */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {trf.status === "REQUESTED" && (
                      <>
                        <button
                          onClick={() => handleCancelTransfer(trf.id)}
                          className="px-3 py-1.5 text-slate-500 hover:text-rose-600 text-xs font-bold"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleApproveTransfer(trf.id)}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                        >
                          Aprobar & Despachar
                        </button>
                      </>
                    )}

                    {trf.status === "IN_TRANSIT" && (
                      <button
                        onClick={() => handleReceiveTransfer(trf.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                      >
                        Confirmar Recepción
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 📊 TAB 3: KARDEX & AUDITORÍA */}
      {activeTab === "movements" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Fecha & Hora</th>
                    <th className="py-3.5 px-4">Tipo de Movimiento</th>
                    <th className="py-3.5 px-4">Producto & Lote</th>
                    <th className="py-3.5 px-4">Almacén</th>
                    <th className="py-3.5 px-4 text-right">Cantidad</th>
                    <th className="py-3.5 px-4 text-right">Saldo Posterior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {mov.createdAt ? new Date(mov.createdAt).toLocaleString() : "Reciente"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                          {mov.movementType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{mov.productName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Lote: #{mov.lotNumber}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">{mov.warehouseName}</td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-black ${
                            mov.quantity > 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} u.
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {mov.balanceAfter} u.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 MODAL: NUEVO LOTE */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Entrada de Stock
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Ingresar Nuevo Lote Físico</h3>
              </div>
              <button onClick={() => setBatchModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Producto / Insumo *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="">Selecciona un producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Almacén Destino *</label>
                <select
                  required
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="">Selecciona un almacén...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Número de Lote *</label>
                  <input
                    type="text"
                    required
                    placeholder="LOT-2026-A1"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha de Caducidad</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cantidad *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="100"
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Costo Unitario (MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="45.00"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingBatch}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {isSavingBatch ? "Ingresando..." : "Ingresar Lote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL: SOLICITAR TRASPASO */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Logística Inter-Almacén
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Solicitar Traspaso de Stock</h3>
              </div>
              <button onClick={() => setTransferModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestTransfer} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Almacén Origen *</label>
                  <select
                    required
                    value={sourceWarehouseId}
                    onChange={(e) => setSourceWarehouseId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="">Selecciona origen...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Almacén Destino *</label>
                  <select
                    required
                    value={targetWarehouseId}
                    onChange={(e) => setTargetWarehouseId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="">Selecciona destino...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Producto a Traspasar *</label>
                <select
                  required
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="">Selecciona producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lote Disponible de Origen *</label>
                <select
                  required
                  value={transferBatchId}
                  onChange={(e) => setTransferBatchId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                >
                  <option value="">Selecciona lote...</option>
                  {batches
                    .filter(
                      (b) =>
                        (!transferProductId || b.productId === transferProductId) &&
                        (!sourceWarehouseId || b.warehouseId === sourceWarehouseId)
                    )
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        Lote #{b.lotNumber} (Disp: {b.availableQuantity} u.)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cantidad a Traspasar *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="50"
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingTransfer}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {isSavingTransfer ? "Solicitando..." : "Confirmar Traspaso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL: AJUSTE MANUAL DE KARDEX */}
      {adjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Auditoría Física
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Ajuste Manual de Inventario</h3>
              </div>
              <button onClick={() => setAdjustmentModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lote Físico a Ajustar *</label>
                <select
                  required
                  value={adjustBatchId}
                  onChange={(e) => setAdjustBatchId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                >
                  <option value="">Selecciona lote...</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.productName} — Lote #{b.lotNumber} ({b.warehouseName}) [Actual: {b.quantity} u.]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Ajuste</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as MovementType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  >
                    <option value="ADJUSTMENT">Ajuste de Conteo</option>
                    <option value="EXPIRATION">Baja por Caducidad</option>
                    <option value="QUARANTINE">Aislamiento por Calidad</option>
                    <option value="RETURN">Devolución de Cliente</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cantidad (+/-) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej. -5 o +10"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo / Justificación</label>
                <input
                  type="text"
                  placeholder="Ej. Merma por daño en empaque / Auditoría física trimestral"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingAdjustment}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {isSavingAdjustment ? "Registrando..." : "Aplicar Ajuste"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
