"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Truck,
  Store,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Plus,
  Search,
  Activity,
  Award,
  RefreshCw,
  Clock,
  UserCheck
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  laboratoryOperationsService,
  laboratoryStoreService,
} from "@/services/laboratory-operations.service";
import {
  LaboratoryDashboardMetrics,
  LaboratoryOrder,
  LaboratoryStoreMetrics,
  LaboratoryOrderStatus
} from "@/types/laboratory";

export default function LaboratoryDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<LaboratoryDashboardMetrics>({
    todaySamplesReceived: 0,
    pendingAnalysis: 0,
    pendingValidation: 0,
    criticalAlertsCount: 0,
    completedToday: 0,
    marketplaceOrdersCount: 0,
    marketplaceRevenueMxn: 0,
    homeSamplingActive: 0,
  });

  const [storeMetrics, setStoreMetrics] = useState<LaboratoryStoreMetrics>({
    totalPublishedStudies: 0,
    totalMarketplaceOrders: 0,
    totalMarketplaceRevenue: 0,
    homeSamplingEnabled: false,
    storeActive: true,
  });

  const [orders, setOrders] = useState<LaboratoryOrder[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, storeRes, ordersRes] = await Promise.allSettled([
        laboratoryOperationsService.getDashboardMetrics(),
        laboratoryStoreService.getStoreMetrics(),
        laboratoryOperationsService.getOrders({ size: 10 }),
      ]);

      if (dashRes.status === "fulfilled") {
        setMetrics(dashRes.value);
      }
      if (storeRes.status === "fulfilled") {
        setStoreMetrics(storeRes.value);
      }
      if (ordersRes.status === "fulfilled") {
        setOrders(ordersRes.value?.content || []);
      }
    } catch (err: any) {
      console.error("Error al cargar telemetría del laboratorio:", err);
      setError("No se pudo cargar la información operativa en tiempo real.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const matchesFolio = o.orderFolio?.toLowerCase().includes(term);
    const matchesPatient = o.patientFullName?.toLowerCase().includes(term);
    const matchesStudies = o.items?.some((i) =>
      i.studyName?.toLowerCase().includes(term)
    );
    return matchesFolio || matchesPatient || matchesStudies;
  });

  const getStatusBadge = (status: LaboratoryOrderStatus, hasCriticalAlert: boolean) => {
    if (hasCriticalAlert) {
      return {
        label: "Alerta de Pánico",
        color:
          "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 animate-pulse font-bold",
      };
    }
    switch (status) {
      case "RECEIVED":
        return {
          label: "Muestra Recibida",
          color:
            "bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200",
        };
      case "PRE_ANALYTICAL":
        return {
          label: "Pre-analítica",
          color:
            "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200",
        };
      case "PROCESSING":
        return {
          label: "En Análisis",
          color:
            "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200",
        };
      case "VALIDATION_PENDING":
        return {
          label: "Por Validar (QFB)",
          color:
            "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300 border-yellow-200 font-semibold",
        };
      case "COMPLETED":
        return {
          label: "Validado & Liberado",
          color:
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 font-bold",
        };
      case "DELIVERED":
        return {
          label: "Entregado al Paciente",
          color:
            "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200",
        };
      case "CANCELLED":
        return {
          label: "Cancelado",
          color:
            "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200",
        };
      default:
        return {
          label: status,
          color: "bg-gray-50 text-gray-600 border-gray-200",
        };
    }
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case "HOME_PHLEBOTOMY":
        return "Toma a Domicilio";
      case "EXTERNAL_DELIVERY":
        return "Muestra Remitida";
      case "BRANCH_SAMPLE":
      default:
        return "Toma en Sucursal";
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* ── ENCABEZADO PRINCIPAL DE BIENVENIDA & ESTADO SANITARIO ────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NOM-007-SSA3-2011 • LIS Operativo</span>
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border",
                storeMetrics.storeActive
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/40"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              )}
            >
              <Store className="w-3.5 h-3.5" />
              <span>
                {storeMetrics.storeActive
                  ? "Tienda QuMarket Activa"
                  : "Tienda en Pausa"}
              </span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Panel Operativo & Comercial de Laboratorio
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Control integral del flujo de muestras, validación paramétrica por Químico Responsable y venta de check-ups en QuMarket.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadData}
            disabled={loading}
            className="rounded-2xl h-11 w-11 border border-gray-200 dark:border-gray-800 cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className={cn("w-4 h-4 text-gray-500", loading && "animate-spin")} />
          </Button>

          <Link href="/laboratory/orders">
            <Button
              variant="outline"
              className="rounded-2xl gap-2 font-bold text-xs h-11 border-gray-200 dark:border-gray-800 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Gestionar Órdenes</span>
            </Button>
          </Link>

          <Link href="/laboratory/store">
            <Button className="rounded-2xl gap-2 font-bold text-xs h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer">
              <Store className="w-4 h-4" />
              <span>Mi Tienda QuMarket</span>
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="ghost" onClick={loadData} className="text-xs font-bold">
            Reintentar
          </Button>
        </div>
      )}

      {/* ── BENTO GRID DE KPIs OPERATIVOS & COMERCIALES ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Muestras del Día */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Muestras de Hoy
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900 dark:text-white">
                {metrics.todaySamplesReceived}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {metrics.completedToday} validadas
              </span>
            </div>
            <p className="text-[11px] font-medium text-gray-400 mt-1">
              {metrics.pendingAnalysis} muestras en proceso analítico
            </p>
          </div>
        </div>

        {/* KPI 2: Por Validar (Firma QFB) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Por Validar (QFB)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900 dark:text-white">
                {metrics.pendingValidation}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Pendientes
              </span>
            </div>
            <p className="text-[11px] font-medium text-gray-400 mt-1">
              Firma y cédula profesional requerida
            </p>
          </div>
        </div>

        {/* KPI 3: Valores Críticos / Pánico */}
        <div
          className={cn(
            "p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border shadow-sm space-y-3",
            metrics.criticalAlertsCount > 0
              ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/30"
              : "border-gray-100 dark:border-gray-800"
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider",
                metrics.criticalAlertsCount > 0 ? "text-rose-600" : "text-gray-500"
              )}
            >
              Alertas de Pánico
            </span>
            <div
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center",
                metrics.criticalAlertsCount > 0
                  ? "bg-rose-100 dark:bg-rose-950/50 text-rose-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400"
              )}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-3xl font-black",
                  metrics.criticalAlertsCount > 0
                    ? "text-rose-600"
                    : "text-gray-900 dark:text-white"
                )}
              >
                {metrics.criticalAlertsCount}
              </span>
              <span
                className={cn(
                  "text-xs font-bold",
                  metrics.criticalAlertsCount > 0 ? "text-rose-600" : "text-gray-400"
                )}
              >
                {metrics.criticalAlertsCount > 0
                  ? "Acción Inmediata"
                  : "Sin valores críticos"}
              </span>
            </div>
            <p className="text-[11px] font-medium text-gray-400 mt-1">
              Valores fuera del límite de alerta fisiológica
            </p>
          </div>
        </div>

        {/* KPI 4: Ventas Tienda QuMarket */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Ventas QuMarket
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900 dark:text-white">
                ${metrics.marketplaceRevenueMxn.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
              </span>
              <span className="text-xs font-bold text-purple-600">MXN</span>
            </div>
            <p className="text-[11px] font-medium text-gray-400 mt-1">
              {metrics.marketplaceOrdersCount} pedidos recibidos online
            </p>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN CENTRAL: WORKLIST LIS Y ACCESO A TIENDA ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tabla de Órdenes Recientes (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Flujo de Muestras del Día (Worklist)
              </h2>
              <p className="text-xs text-gray-400">
                Monitoreo de fases preanalítica, analítica y liberación
              </p>
            </div>

            {/* Buscador de Muestra */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar folio, paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Tabla de Muestras */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              <p className="text-xs text-gray-400">Cargando órdenes de la base de datos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 px-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20 border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  No hay órdenes registradas aún
                </h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  Las órdenes que ingresen desde mostrador, referencias médicas o compras en QuMarket aparecerán aquí en tiempo real.
                </p>
              </div>
              <Link href="/laboratory/orders">
                <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar Primer Muestra</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 px-2">Folio & Fecha</th>
                    <th className="pb-3 px-2">Paciente</th>
                    <th className="pb-3 px-2">Estudios</th>
                    <th className="pb-3 px-2">Ayuno / Modalidad</th>
                    <th className="pb-3 px-2">Fase LIS</th>
                    <th className="pb-3 px-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                  {filteredOrders.map((order) => {
                    const statusBadge = getStatusBadge(order.status, order.hasCriticalAlert);
                    const studiesLabel = order.items?.map((i) => i.studyName).join(", ") || "Estudios no especificados";

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-[#121212] transition-colors"
                      >
                        <td className="py-3.5 px-2">
                          <span className="font-mono font-bold text-gray-900 dark:text-white">
                            {order.orderFolio}
                          </span>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {new Date(order.createdAt).toLocaleDateString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {order.patientFullName}
                          </span>
                          <p className="text-[10px] text-gray-400">
                            {order.patientAge ? `${order.patientAge} años` : "Edad no reg."}{" "}
                            {order.patientGender ? `• ${order.patientGender}` : ""}
                          </p>
                        </td>
                        <td className="py-3.5 px-2">
                          <span
                            className="font-medium text-gray-700 dark:text-gray-300 truncate block max-w-[180px]"
                            title={studiesLabel}
                          >
                            {studiesLabel}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600">
                            ${Number(order.totalAmountMxn || 0).toLocaleString("es-MX")} MXN
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block">
                            {getServiceTypeLabel(order.serviceType)}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {order.fastingVerified
                              ? `${order.fastingHoursDeclared} hrs (Verificado)`
                              : "Ayuno pendiente"}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block whitespace-nowrap",
                              statusBadge.color
                            )}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <Link href={`/laboratory/orders`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl cursor-pointer"
                            >
                              <span>Ver</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
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

          <div className="pt-2 flex items-center justify-between text-xs text-gray-400">
            <span>
              Mostrando {filteredOrders.length} de {orders.length} órdenes en lista
            </span>
            <Link
              href="/laboratory/orders"
              className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
            >
              Ver Worklist completo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Panel Lateral: Tienda QuMarket & Accesos Clave (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tarjeta de Tienda QuMarket */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-gray-900 to-black text-white border border-emerald-800/40 shadow-xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Store className="w-3.5 h-3.5" />
                <span>Vitrina QuMarket</span>
              </span>
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  storeMetrics.storeActive ? "bg-emerald-400 animate-pulse" : "bg-gray-500"
                )}
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Tu Tienda Digital</h3>
              <p className="text-xs text-gray-300 mt-1">
                Pacientes en tu ciudad pueden comprar check-ups y solicitar toma de muestras a domicilio directamente.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Estudios Publicados:</span>
                <span className="font-bold text-white">
                  {storeMetrics.totalPublishedStudies} activos
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Toma a Domicilio:</span>
                <span className="font-bold text-emerald-400">
                  {storeMetrics.homeSamplingEnabled ? "Habilitada" : "En Mostrador"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link href="/laboratory/store">
                <Button className="w-full h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2">
                  <span>Administrar Catálogo & Precios</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Tarjeta de Cumplimiento Sanitario NOM-007 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Acreditación Sanitaria
                </h4>
                <p className="text-[10px] text-gray-400">COFEPRIS & DGP</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Responsable Sanitario Cédula Verificada</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bitácora RPBI al corriente (NOM-087)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Aviso de Funcionamiento Registrado</span>
              </div>
            </div>

            <Link href="/laboratory/compliance" className="block">
              <Button
                variant="outline"
                className="w-full h-10 rounded-2xl text-xs font-bold border-gray-200 dark:border-gray-800 cursor-pointer"
              >
                <span>Ver Bitácora Sanitaria</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
