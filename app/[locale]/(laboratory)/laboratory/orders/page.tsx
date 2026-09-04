"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardIcon,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  X,
  User,
  Activity,
  Phone,
  Mail,
  FileText,
  Truck,
  Store,
  Calendar
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  laboratoryOperationsService,
  laboratoryStoreService,
} from "@/services/laboratory-operations.service";
import {
  LaboratoryOrder,
  LaboratoryOrderStatus,
  LaboratoryOrderOrigin,
  LaboratoryStudyCatalogItem,
  CreateLaboratoryOrderPayload,
  LaboratoryServiceType,
} from "@/types/laboratory";

export default function LaboratoryOrdersPage() {
  const [orders, setOrders] = useState<LaboratoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LaboratoryOrderStatus | "ALL">("ALL");
  const [selectedOrigin, setSelectedOrigin] = useState<LaboratoryOrderOrigin | "ALL">("ALL");

  // Modal para nueva orden
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catalog, setCatalog] = useState<LaboratoryStudyCatalogItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [patientFullName, setPatientFullName] = useState("");
  const [patientAge, setPatientAge] = useState<number | undefined>(undefined);
  const [patientGender, setPatientGender] = useState("M");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [referringPhysicianName, setReferringPhysicianName] = useState("");
  const [fastingHoursDeclared, setFastingHoursDeclared] = useState(8);
  const [fastingVerified, setFastingVerified] = useState(true);
  const [serviceType, setServiceType] = useState<LaboratoryServiceType>("BRANCH_SAMPLE");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [sampleNotes, setSampleNotes] = useState("");
  const [selectedStudies, setSelectedStudies] = useState<LaboratoryStudyCatalogItem[]>([]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { size: 50 };
      if (selectedStatus !== "ALL") params.status = selectedStatus;
      if (selectedOrigin !== "ALL") params.origin = selectedOrigin;

      const res = await laboratoryOperationsService.getOrders(params);
      setOrders(res.content || []);
    } catch (err: any) {
      console.error("Error al cargar órdenes:", err);
      setError("No se pudo cargar la lista de órdenes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, selectedOrigin]);

  const openNewOrderModal = async () => {
    setIsModalOpen(true);
    try {
      const cat = await laboratoryStoreService.getCatalog();
      setCatalog(cat || []);
    } catch (err) {
      console.error("Error al cargar catálogo para la orden:", err);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientFullName.trim() || selectedStudies.length === 0) {
      alert("Por favor ingrese el nombre del paciente y seleccione al menos un estudio.");
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateLaboratoryOrderPayload = {
        patientFullName,
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientGender,
        patientPhone: patientPhone || undefined,
        patientEmail: patientEmail || undefined,
        referringPhysicianName: referringPhysicianName || undefined,
        fastingHoursDeclared: Number(fastingHoursDeclared),
        fastingVerified,
        serviceType,
        deliveryAddress: serviceType === "HOME_PHLEBOTOMY" ? deliveryAddress : undefined,
        sampleNotes: sampleNotes || undefined,
        origin: "DESK_WALKIN",
        items: selectedStudies.map((s) => ({
          studyCatalogId: s.id,
          studyCode: s.studyCode,
          studyName: s.studyName,
          category: s.category,
          priceMxn: s.basePrice || 0,
        })),
      };

      await laboratoryOperationsService.createOrder(payload);
      setIsModalOpen(false);
      // Reset form
      setPatientFullName("");
      setPatientAge(undefined);
      setPatientPhone("");
      setPatientEmail("");
      setReferringPhysicianName("");
      setSampleNotes("");
      setSelectedStudies([]);
      // Reload orders
      await loadOrders();
    } catch (err: any) {
      console.error("Error al crear orden:", err);
      alert("Error al registrar la orden. Revise los datos.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvanceStatus = async (order: LaboratoryOrder, nextStatus: LaboratoryOrderStatus) => {
    try {
      const updated = await laboratoryOperationsService.updateOrderStatus(order.id, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch (err) {
      console.error("Error al actualizar estatus:", err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      o.orderFolio.toLowerCase().includes(term) ||
      o.patientFullName.toLowerCase().includes(term) ||
      o.referringPhysicianName?.toLowerCase().includes(term) ||
      o.items.some((i) => i.studyName.toLowerCase().includes(term))
    );
  });

  const getStatusBadge = (status: LaboratoryOrderStatus, hasCriticalAlert: boolean) => {
    if (hasCriticalAlert) {
      return {
        label: "Alerta de Pánico",
        color: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 animate-pulse font-bold",
      };
    }
    switch (status) {
      case "RECEIVED":
        return { label: "1. Muestra Recibida", color: "bg-slate-100 text-slate-700 border-slate-200" };
      case "PRE_ANALYTICAL":
        return { label: "2. Fase Pre-analítica", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "PROCESSING":
        return { label: "3. En Análisis", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "VALIDATION_PENDING":
        return { label: "4. Por Validar QFB", color: "bg-yellow-50 text-yellow-800 border-yellow-200 font-bold" };
      case "COMPLETED":
        return { label: "5. Validado & Liberado", color: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" };
      case "DELIVERED":
        return { label: "6. Entregado", color: "bg-teal-50 text-teal-700 border-teal-200" };
      case "CANCELLED":
        return { label: "Cancelado", color: "bg-gray-100 text-gray-500 border-gray-200" };
      default:
        return { label: status, color: "bg-gray-50 text-gray-600 border-gray-200" };
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* ── ENCABEZADO ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              <ClipboardIcon className="w-3.5 h-3.5" />
              <span>LIS Operativo NOM-007</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Gestión de Órdenes & Muestras
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Recepción en mostrador, asignación de folios, trazabilidad de ayuno y pase a captura de resultados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadOrders}
            disabled={loading}
            className="rounded-2xl h-11 w-11 border border-gray-200 dark:border-gray-800 cursor-pointer"
            title="Actualizar lista"
          >
            <RefreshCw className={cn("w-4 h-4 text-gray-500", loading && "animate-spin")} />
          </Button>

          <Button
            onClick={openNewOrderModal}
            className="rounded-2xl gap-2 font-bold text-xs h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Orden en Mostrador</span>
          </Button>
        </div>
      </div>

      {/* ── FILTROS Y BUSCADOR ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        {/* Pestañas de Estatus */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "ALL", label: "Todas" },
            { id: "RECEIVED", label: "Recibidas" },
            { id: "PRE_ANALYTICAL", label: "Pre-analítica" },
            { id: "PROCESSING", label: "En Análisis" },
            { id: "VALIDATION_PENDING", label: "Por Validar" },
            { id: "COMPLETED", label: "Completadas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                selectedStatus === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-50 dark:bg-[#141414] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por folio, paciente o estudio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* ── TABLA DE ÓRDENES ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
            <p className="text-xs text-gray-400">Cargando órdenes del laboratorio...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 px-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20 border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <ClipboardIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                No se encontraron órdenes con los filtros seleccionados
              </h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Registra una nueva muestra desde recepción para iniciar la trazabilidad analítica.
              </p>
            </div>
            <Button
              onClick={openNewOrderModal}
              size="sm"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Muestra en Mostrador</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-2">Folio & Fecha</th>
                  <th className="pb-3 px-2">Paciente & Médico</th>
                  <th className="pb-3 px-2">Estudios Solicitados</th>
                  <th className="pb-3 px-2">Ayuno / Modalidad</th>
                  <th className="pb-3 px-2">Fase LIS</th>
                  <th className="pb-3 px-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {filteredOrders.map((order) => {
                  const statusBadge = getStatusBadge(order.status, order.hasCriticalAlert);
                  const studiesText = order.items.map((i) => i.studyName).join(", ");

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-[#121212] transition-colors"
                    >
                      <td className="py-3.5 px-2">
                        <span className="font-mono font-bold text-gray-900 dark:text-white block">
                          {order.orderFolio}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-2">
                        <span className="font-bold text-gray-900 dark:text-white block">
                          {order.patientFullName}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {order.patientAge ? `${order.patientAge} años` : "Edad no reg."}{" "}
                          {order.patientGender ? `• ${order.patientGender}` : ""}
                          {order.referringPhysicianName ? ` • Dr(a). ${order.referringPhysicianName}` : ""}
                        </span>
                      </td>

                      <td className="py-3.5 px-2">
                        <span
                          className="font-medium text-gray-700 dark:text-gray-300 truncate block max-w-[200px]"
                          title={studiesText}
                        >
                          {studiesText}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">
                          ${Number(order.totalAmountMxn || 0).toLocaleString("es-MX")} MXN
                        </span>
                      </td>

                      <td className="py-3.5 px-2">
                        <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block">
                          {order.serviceType === "HOME_PHLEBOTOMY" ? "A Domicilio" : "Sucursal"}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {order.fastingVerified
                            ? `${order.fastingHoursDeclared} hrs (Ayuno Verificado)`
                            : "Ayuno Sin Verificar"}
                        </span>
                      </td>

                      <td className="py-3.5 px-2">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] border inline-block whitespace-nowrap",
                            statusBadge.color
                          )}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-2 text-right space-x-1.5">
                        {order.status === "RECEIVED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdvanceStatus(order, "PRE_ANALYTICAL")}
                            className="h-8 text-[11px] rounded-xl font-bold border-amber-200 text-amber-800 hover:bg-amber-50 cursor-pointer"
                          >
                            A Pre-analítica
                          </Button>
                        )}
                        {order.status === "PRE_ANALYTICAL" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdvanceStatus(order, "PROCESSING")}
                            className="h-8 text-[11px] rounded-xl font-bold border-blue-200 text-blue-800 hover:bg-blue-50 cursor-pointer"
                          >
                            Iniciar Análisis
                          </Button>
                        )}
                        <Link href={`/laboratory/results?orderId=${order.id}`}>
                          <Button
                            size="sm"
                            className="h-8 text-[11px] rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            Capturar Resultados
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: NUEVA ORDEN EN MOSTRADOR ───────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-gray-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Ingreso de Muestra / Nueva Orden (NOM-007)
                </h3>
                <p className="text-xs text-gray-400">
                  Registro de paciente en mostrador y selección de estudios a procesar
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              {/* Datos del Paciente */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Datos del Paciente</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. María Elena Sánchez"
                      value={patientFullName}
                      onChange={(e) => setPatientFullName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">
                      Edad (Años)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      placeholder="45"
                      value={patientAge ?? ""}
                      onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">
                      Género
                    </label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="OTRO">Otro / No binario</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">
                      Teléfono WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="55 1234 5678"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">
                      Médico Remitente
                    </label>
                    <input
                      type="text"
                      placeholder="Dr. Carlos Medina"
                      value={referringPhysicianName}
                      onChange={(e) => setReferringPhysicianName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Condiciones Preanalíticas (NOM-007) */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Condiciones Pre-analíticas</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">
                      Horas de Ayuno Declaradas
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={24}
                      value={fastingHoursDeclared}
                      onChange={(e) => setFastingHoursDeclared(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div className="pt-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fastingVerified}
                        onChange={(e) => setFastingVerified(e.target.checked)}
                        className="rounded text-emerald-600 w-4 h-4 focus:ring-emerald-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Ayuno verificado por el flebotomista
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Selección de Estudios del Catálogo */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-bold text-gray-700 dark:text-gray-200 flex items-center justify-between">
                  <span>Estudios a Solicitar ({selectedStudies.length})</span>
                  <span className="text-emerald-600 font-bold">
                    Total: $
                    {selectedStudies
                      .reduce((acc, s) => acc + (s.basePrice || 0), 0)
                      .toLocaleString("es-MX")}{" "}
                    MXN
                  </span>
                </h4>

                {catalog.length === 0 ? (
                  <p className="text-gray-400 text-xs">
                    No se encontraron estudios en el catálogo. Cargando...
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {catalog.map((study) => {
                      const isSelected = selectedStudies.some((s) => s.id === study.id);
                      return (
                        <div
                          key={study.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedStudies((prev) => prev.filter((s) => s.id !== study.id));
                            } else {
                              setSelectedStudies((prev) => [...prev, study]);
                            }
                          }}
                          className={cn(
                            "p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                            isSelected
                              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold"
                              : "bg-gray-50 dark:bg-black border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                          )}
                        >
                          <div>
                            <span className="block truncate max-w-[180px]">{study.studyName}</span>
                            <span className="text-[10px] font-mono text-gray-400">
                              {study.studyCode} • {study.category}
                            </span>
                          </div>
                          <span className="text-xs font-bold shrink-0 ml-2">
                            ${study.basePrice || 0}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botones de Envío */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || selectedStudies.length === 0}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Generar Orden & Folio LIS</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
