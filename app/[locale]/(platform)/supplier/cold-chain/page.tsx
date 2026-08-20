"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import {
  ThermometerSnowflake,
  Activity,
  AlertOctagon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Truck,
  Layers,
  Radio,
  Clock,
  ShieldAlert,
  BatteryCharging,
  Warehouse,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { supplierService } from "@/services/supplier.service";
import {
  ThermalShipment,
  TemperatureLog,
  ThermalExcursionEvent,
  SupplierWarehouse,
  ThermalPackagingType,
  ThermalShipmentStatus,
  ExcursionSeverity,
  ExcursionResolution,
  SaveThermalShipmentPayload,
  RecordTemperatureTelemetryPayload,
  ResolveExcursionPayload,
} from "@/types/supplier";

export default function ColdChainLogisticsPage() {
  const [activeTab, setActiveTab] = useState<"shipments" | "excursions">("shipments");
  const [isLoading, setIsLoading] = useState(true);

  // Core Data
  const [shipments, setShipments] = useState<ThermalShipment[]>([]);
  const [excursions, setExcursions] = useState<ThermalExcursionEvent[]>([]);
  const [warehouses, setWarehouses] = useState<SupplierWarehouse[]>([]);

  // Telemetría & Curva Térmica
  const [selectedShipment, setSelectedShipment] = useState<ThermalShipment | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<TemperatureLog[]>([]);
  const [telemetryModalOpen, setTelemetryModalOpen] = useState(false);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);

  // Modal 1: Nuevo Despacho Térmico
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [isSavingShipment, setIsSavingShipment] = useState(false);
  const [whId, setWhId] = useState<number | "">("");
  const [pkgType, setPkgType] = useState<ThermalPackagingType>("GEL_PACK_INSULATED");
  const [minTemp, setMinTemp] = useState("2.00");
  const [maxTemp, setMaxTemp] = useState("8.00");
  const [dataLoggerId, setDataLoggerId] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipmentNotes, setShipmentNotes] = useState("");

  // Modal 2: Simulación de Telemetría IoT
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simTemp, setSimTemp] = useState("4.5");
  const [simHumidity, setSimHumidity] = useState("45");
  const [simBattery, setSimBattery] = useState("95");

  // Modal 3: Dictamen de Excursión QA
  const [excursionModalOpen, setExcursionModalOpen] = useState(false);
  const [selectedExcursionId, setSelectedExcursionId] = useState<number | null>(null);
  const [qaResolution, setQaResolution] = useState<ExcursionResolution>("APPROVED_BY_QA");
  const [qaInspector, setQaInspector] = useState("");
  const [qaNotes, setQaNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setIsLoading(true);
      const [shipList, excurList, whList] = await Promise.all([
        supplierService.getThermalShipments(),
        supplierService.getThermalExcursions(),
        supplierService.getWarehouses(),
      ]);

      setShipments(shipList);
      setExcursions(excurList);
      setWarehouses(whList);
    } catch {
      toast.error("Error al cargar la información de cadena de frío.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whId || !minTemp || !maxTemp) {
      toast.warning("Completa el almacén y rangos de temperatura.");
      return;
    }

    try {
      setIsSavingShipment(true);
      const payload: SaveThermalShipmentPayload = {
        sourceWarehouseId: Number(whId),
        packagingType: pkgType,
        targetMinTemp: parseFloat(minTemp),
        targetMaxTemp: parseFloat(maxTemp),
        dataLoggerId: dataLoggerId.trim() || undefined,
        carrierName: carrierName.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        notes: shipmentNotes.trim() || undefined,
      };

      await supplierService.createThermalShipment(payload);
      toast.success("Despacho térmico creado con éxito.");
      setShipmentModalOpen(false);
      setDataLoggerId("");
      loadAll();
    } catch {
      toast.error("Error al crear el despacho térmico.");
    } finally {
      setIsSavingShipment(false);
    }
  };

  const handleStartTransit = async (shipmentId: number) => {
    try {
      await supplierService.startThermalShipmentTransit(shipmentId);
      toast.success("Ruta iniciada. Monitoreo IoT de telemetría activo.");
      loadAll();
    } catch {
      toast.error("Error al iniciar tránsito.");
    }
  };

  const handleConfirmDelivery = async (shipmentId: number) => {
    try {
      await supplierService.confirmThermalShipmentDelivery(shipmentId);
      toast.success("Entrega confirmada y dictamen de recepción registrado.");
      loadAll();
    } catch {
      toast.error("Error al confirmar entrega.");
    }
  };

  const handleOpenTelemetry = async (shipment: ThermalShipment) => {
    setSelectedShipment(shipment);
    setTelemetryModalOpen(true);
    try {
      setLoadingTelemetry(true);
      const data = await supplierService.getShipmentTelemetry(shipment.id);
      setTelemetryLogs(data);
    } catch {
      toast.error("Error al consultar telemetría.");
    } finally {
      setLoadingTelemetry(false);
    }
  };

  const handleSendSimulatedTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    try {
      const payload: RecordTemperatureTelemetryPayload = {
        shipmentId: selectedShipment.id,
        dataLoggerId: selectedShipment.dataLoggerId || "IOT-DEV-001",
        temperatureCelsius: parseFloat(simTemp),
        humidityPercentage: parseFloat(simHumidity) || undefined,
        batteryLevel: parseInt(simBattery, 10) || undefined,
      };

      await supplierService.recordTelemetry(payload);
      toast.success(`Lectura de ${simTemp}°C transmitida correctamente.`);
      setSimModalOpen(false);

      // Recargar logs del modal y despachos generales
      const updatedLogs = await supplierService.getShipmentTelemetry(selectedShipment.id);
      setTelemetryLogs(updatedLogs);
      loadAll();
    } catch {
      toast.error("Error al transmitir telemetría.");
    }
  };

  const handleResolveExcursion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExcursionId || !qaInspector.trim()) {
      toast.warning("Completa el nombre del responsable sanitario QA.");
      return;
    }

    try {
      setIsResolving(true);
      const payload: ResolveExcursionPayload = {
        resolution: qaResolution,
        qaInspectorName: qaInspector.trim(),
        qaNotes: qaNotes.trim() || undefined,
      };

      await supplierService.resolveExcursion(selectedExcursionId, payload);
      toast.success("Dictamen de calidad registrado y caso cerrado.");
      setExcursionModalOpen(false);
      loadAll();
    } catch {
      toast.error("Error al emitir dictamen.");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 font-sans">
      {/* 🚀 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              Fase 5: Cadena de Frío & Monitoreo IoT
            </span>
            <span className="text-xs text-slate-400">{shipments.length} Despachos Térmicos</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Logística Térmica & Telemetría IoT</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo en tiempo real de temperatura (2°C - 8°C / Congelación), prevención de excursiones y dictámenes QA.
          </p>
        </div>

        <button
          onClick={() => setShipmentModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Despacho Térmico
        </button>
      </div>

      {/* 🧭 Tabs */}
      <div className="flex border-b border-slate-200 gap-6 mb-6">
        <button
          onClick={() => setActiveTab("shipments")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "shipments"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ThermometerSnowflake className="w-4 h-4" />
          Despachos Térmicos ({shipments.length})
        </button>

        <button
          onClick={() => setActiveTab("excursions")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "excursions"
              ? "border-amber-600 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          Alertas de Excursión QA ({excursions.length})
        </button>
      </div>

      {/* ❄️ TAB 1: DESPACHOS TÉRMICOS */}
      {activeTab === "shipments" && (
        <div className="space-y-4 animate-in fade-in">
          {isLoading ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 flex flex-col items-center">
              <QhSpinner size="lg" className="text-blue-600" />
              <p className="text-xs font-bold text-slate-500 mt-4 animate-pulse">Cargando despachos refrigerados...</p>
            </div>
          ) : shipments.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400">
              <ThermometerSnowflake className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold text-slate-700">No hay despachos térmicos activos</p>
              <p className="text-xs text-slate-400 mt-1">Crea un nuevo despacho refrigerado para monitorear cadena de frío en ruta.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shipments.map((s) => (
                <div key={s.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                        s.isCurrentlyExcursion ? "bg-red-50 text-red-600 animate-pulse" : "bg-blue-50 text-blue-600"
                      }`}>
                        <ThermometerSnowflake className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-mono font-black text-xs text-slate-900 block">{s.shipmentNumber}</span>
                        <span className="text-[11px] text-slate-400">{s.sourceWarehouseName}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === "DELIVERED_COMPLIANT"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : s.status === "IN_TRANSIT"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : s.isCurrentlyExcursion
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                  </div>

                  {/* Estado Térmico en Tiempo Real */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                        Rango Objetivo
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {s.targetMinTemp}°C a {s.targetMaxTemp}°C
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Empaque: {s.packagingType}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                        Última Temp. IoT
                      </span>
                      <div className="flex items-center gap-1 justify-end font-mono">
                        <span className={`text-base font-black ${
                          s.isCurrentlyExcursion ? "text-red-600" : "text-emerald-600"
                        }`}>
                          {s.currentTemperature !== undefined && s.currentTemperature !== null
                            ? `${s.currentTemperature}°C`
                            : "Sin señal"}
                        </span>
                        {s.isCurrentlyExcursion ? (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Sensor: {s.dataLoggerId || "N/A"}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => handleOpenTelemetry(s)}
                      className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 text-xs"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      Ver Curva Térmica
                    </button>

                    <div className="flex items-center gap-2">
                      {s.status === "PREPARING" && (
                        <button
                          onClick={() => handleStartTransit(s.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                        >
                          Iniciar Ruta
                        </button>
                      )}

                      {s.status === "IN_TRANSIT" && (
                        <button
                          onClick={() => handleConfirmDelivery(s.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                        >
                          Confirmar Entrega
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ⚠️ TAB 2: EXCURSIONES TÉRMICAS & DICTAMEN QA */}
      {activeTab === "excursions" && (
        <div className="space-y-4 animate-in fade-in">
          {excursions.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold text-slate-700">Sin excursiones térmicas registradas</p>
              <p className="text-xs text-slate-400 mt-1">Todos los envíos se han mantenido 100% dentro del rango sanitario permitido.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Fecha & Hora</th>
                      <th className="py-3.5 px-4">Severidad</th>
                      <th className="py-3.5 px-4">Temperatura Pico</th>
                      <th className="py-3.5 px-4">Dictamen de Calidad QA</th>
                      <th className="py-3.5 px-4">Responsable Sanitario</th>
                      <th className="py-3.5 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {excursions.map((ex) => (
                      <tr key={ex.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-mono text-slate-900 block">
                            {new Date(ex.startAt).toLocaleString()}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ex.severity === "CRITICAL"
                                ? "bg-red-100 text-red-800"
                                : ex.severity === "MODERATE"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {ex.severity}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono font-bold text-red-600">
                          {ex.peakTemperature}°C
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ex.resolution === "APPROVED_BY_QA"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : ex.resolution === "DISCARDED_DESTROYED"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {ex.resolution}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-700">
                          {ex.qaInspectorName || "Pendiente de dictamen"}
                        </td>

                        <td className="py-4 px-4 text-right">
                          {ex.resolution === "PENDING_REVIEW" && (
                            <button
                              onClick={() => {
                                setSelectedExcursionId(ex.id);
                                setExcursionModalOpen(true);
                              }}
                              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px]"
                            >
                              Emitir Dictamen
                            </button>
                          )}
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

      {/* 🚀 MODAL 1: NUEVO DESPACHO TÉRMICO */}
      {shipmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">
                  Logística en Frío
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Crear Despacho Térmico</h3>
              </div>
              <button onClick={() => setShipmentModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Almacén de Origen *</label>
                <select
                  required
                  value={whId}
                  onChange={(e) => setWhId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="">Selecciona almacén...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo de Embalaje Térmico *</label>
                <select
                  value={pkgType}
                  onChange={(e) => setPkgType(e.target.value as ThermalPackagingType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="GEL_PACK_INSULATED">Hielera Insulada con Gel Refrigerante (2°C - 8°C)</option>
                  <option value="DRY_ICE">Hielo Seco / Criopreservación (&lt; -20°C)</option>
                  <option value="ACTIVE_REFRIGERATION_VEHICLE">Vehículo con Refrigeración Activa (Thermo King)</option>
                  <option value="PHASE_CHANGE_MATERIAL">Material de Cambio de Fase (PCM)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Temp. Mínima (°C) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={minTemp}
                    onChange={(e) => setMinTemp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Temp. Máxima (°C) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={maxTemp}
                    onChange={(e) => setMaxTemp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ID del Sensor IoT / Data Logger</label>
                <input
                  type="text"
                  placeholder="Ej. LOGGER-COLD-8821"
                  value={dataLoggerId}
                  onChange={(e) => setDataLoggerId(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Transportista</label>
                  <input
                    type="text"
                    placeholder="Ej. Flotilla Propia / DHL ColdChain"
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Número de Guía</label>
                  <input
                    type="text"
                    placeholder="TRACK-FRD-991"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShipmentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingShipment}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {isSavingShipment ? "Creando..." : "Crear Despacho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL 2: CURVA TÉRMICA & TELEMETRÍA IOT */}
      {telemetryModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">
                  Curva Térmica IoT
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Despacho {selectedShipment.shipmentNumber}
                </h3>
              </div>
              <button onClick={() => setTelemetryModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-blue-900 font-bold">
                  Rango Permitido: {selectedShipment.targetMinTemp}°C - {selectedShipment.targetMaxTemp}°C
                </span>
              </div>
              <button
                onClick={() => setSimModalOpen(true)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px]"
              >
                + Simular Lectura IoT
              </button>
            </div>

            {loadingTelemetry ? (
              <div className="p-8 text-center">
                <QhSpinner size="md" className="text-blue-600" />
              </div>
            ) : telemetryLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>No hay lecturas registradas para este sensor.</p>
                <p className="text-[11px] mt-1">Usa "+ Simular Lectura IoT" para registrar datos de telemetría.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                  Historial de Telemetría ({telemetryLogs.length} lecturas)
                </span>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto border border-slate-200 rounded-2xl">
                  {telemetryLogs.map((l) => (
                    <div key={l.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div className="space-y-0.5">
                        <span className="font-mono text-slate-700 block text-[11px]">
                          {new Date(l.recordedAt).toLocaleTimeString()} — {new Date(l.recordedAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Batería: {l.batteryLevel || 100}% • Humedad: {l.humidityPercentage || 40}%
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-black text-sm ${
                          l.isExcursion ? "text-red-600" : "text-emerald-600"
                        }`}>
                          {l.temperatureCelsius}°C
                        </span>
                        {l.isExcursion && (
                          <span className="text-[10px] text-red-600 font-bold block">¡Excursión!</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🚀 MODAL 3: SIMULACIÓN DE TELEMETRÍA IOT */}
      {simModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900">Simulador de Sensor IoT</h4>
              <button onClick={() => setSimModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendSimulatedTelemetry} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Temperatura a Transmitir (°C) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={simTemp}
                  onChange={(e) => setSimTemp(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Humedad %</label>
                  <input
                    type="number"
                    value={simHumidity}
                    onChange={(e) => setSimHumidity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batería %</label>
                  <input
                    type="number"
                    value={simBattery}
                    onChange={(e) => setSimBattery(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSimModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-xl"
                >
                  Enviar Ping IoT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL 4: DICTAMEN DE EXCURSIÓN QA */}
      {excursionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">
                  Aseguramiento de Calidad
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Dictamen de Excursión Térmica</h3>
              </div>
              <button onClick={() => setExcursionModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveExcursion} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Resolución / Dictamen Sanitario *</label>
                <select
                  value={qaResolution}
                  onChange={(e) => setQaResolution(e.target.value as ExcursionResolution)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="APPROVED_BY_QA">Aprobado por QA (Estabilidad no comprometida)</option>
                  <option value="QUARANTINED">Puesto en Cuarentena para Pruebas Analíticas</option>
                  <option value="DISCARDED_DESTROYED">Desechado / Destruido por Pérdida de Cadena de Frío</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Responsable Sanitario / Inspector QA *</label>
                <input
                  type="text"
                  required
                  placeholder="Q.F.B. María Elena Morales"
                  value={qaInspector}
                  onChange={(e) => setQaInspector(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notas Técnicas y Justificación</label>
                <textarea
                  rows={2}
                  placeholder="Se validó tabla de estabilidad térmica del fabricante y la curva no superó el umbral cinético..."
                  value={qaNotes}
                  onChange={(e) => setQaNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExcursionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isResolving}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {isResolving ? "Guardando..." : "Firmar Dictamen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
