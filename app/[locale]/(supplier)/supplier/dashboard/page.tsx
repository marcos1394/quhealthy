"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import {
  Package,
  PackageCheck,
  ShoppingBag,
  FileText,
  ThermometerSnowflake,
  Activity,
  Building2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Boxes,
  Truck,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { supplierService } from "@/services/supplier.service";
import {
  SupplierOrganization,
  SupplierOnboardingStatus,
  MedicalProduct,
  ProductBatch,
  SupplierPurchaseOrder,
  SupplierQuote,
  ThermalShipment,
} from "@/types/supplier";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function SupplierDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profile, setProfile] = useState<SupplierOrganization | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<SupplierOnboardingStatus | null>(null);
  const [products, setProducts] = useState<MedicalProduct[]>([]);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [orders, setOrders] = useState<SupplierPurchaseOrder[]>([]);
  const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
  const [shipments, setShipments] = useState<ThermalShipment[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [st, prof] = await Promise.allSettled([
        supplierService.getOnboardingStatus(),
        supplierService.getProfile(),
      ]);

      if (st.status === "fulfilled") setOnboardingStatus(st.value);
      if (prof.status === "fulfilled") setProfile(prof.value);

      // Cargar métricas adicionales en paralelo
      const [prodsRes, batchesRes, ordersRes, quotesRes, shipmentsRes] = await Promise.allSettled([
        supplierService.getProducts(),
        supplierService.getBatches(),
        supplierService.getPurchaseOrders(),
        supplierService.getQuotes(),
        supplierService.getThermalShipments(),
      ]);

      if (prodsRes.status === "fulfilled") setProducts(prodsRes.value || []);
      if (batchesRes.status === "fulfilled") setBatches(batchesRes.value || []);
      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value || []);
      if (quotesRes.status === "fulfilled") setQuotes(quotesRes.value || []);
      if (shipmentsRes.status === "fulfilled") setShipments(shipmentsRes.value || []);
    } catch (error) {
      console.error("Error al cargar dashboard del proveedor:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <QhSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Cargando panel de control del proveedor...
        </p>
      </div>
    );
  }

  // Cálculos de métricas
  const totalStockUnits = batches.reduce((acc, b) => acc + (b.availableQuantity || 0), 0);
  const expiringSoonBatches = batches.filter((b) => {
    if (!b.expirationDate) return false;
    const exp = new Date(b.expirationDate).getTime();
    const now = Date.now();
    const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 60;
  });
  const pendingOrders = orders.filter((o) => o.status === "ISSUED" || o.status === "CONFIRMED" || o.status === "IN_PREPARATION");
  const pendingQuotes = quotes.filter((q) => q.status === "DRAFT" || q.status === "SENT");
  const activeShipments = shipments.filter((s) => s.status === "IN_TRANSIT" || s.status === "PREPARING");

  const isVerified = profile?.status === "VERIFIED";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── ENCABEZADO PRINCIPAL ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {profile?.brandName || profile?.legalName || "Portal de Proveedor"}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                    isVerified
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                  }`}
                >
                  {isVerified ? "Verificado COFEPRIS" : "Verificación en Proceso"}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                RFC: {profile?.rfc || "Sin registrar"} • {profile?.supplierType || "Distribuidor Médico"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#141414] text-gray-600 dark:text-gray-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </button>

          <Link
            href="/supplier/products"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Producto
          </Link>
        </div>
      </div>

      {/* ── BANNER DE VERIFICACIÓN REGULATORIA (SI NO ESTÁ COMPLETO O VERIFICADO) ── */}
      {!isVerified && (
        <div className="p-5 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Expediente y Validación Regulatoria
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 max-w-2xl">
                {onboardingStatus?.missingRequirements && onboardingStatus.missingRequirements.length > 0
                  ? `Requisitos pendientes: ${onboardingStatus.missingRequirements.join(", ")}.`
                  : "Tu documentación está siendo revisada por el equipo de cumplimiento sanitario de QuHealthy."}
              </p>
            </div>
          </div>

          <Link
            href="/onboarding/supplier"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            Completar Expediente
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── TARJETAS DE KPIS PRINCIPALES ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Catálogo de Productos */}
        <Link
          href="/supplier/products"
          className="group p-5 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-purple-500/40 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Catálogo Activo</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {products.length}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Productos registrados para venta/renta
            </p>
          </div>
        </Link>

        {/* Inventario & Lotes */}
        <Link
          href="/supplier/inventory"
          className="group p-5 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/40 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Stock Total</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {totalStockUnits.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <span>{batches.length} lotes registrados</span>
              {expiringSoonBatches.length > 0 && (
                <span className="text-amber-600 font-bold">({expiringSoonBatches.length} por caducar)</span>
              )}
            </p>
          </div>
        </Link>

        {/* Cotizaciones B2B */}
        <Link
          href="/supplier/quotes"
          className="group p-5 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-indigo-500/40 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Cotizaciones B2B</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {quotes.length}
            </p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
              {pendingQuotes.length} pendientes de respuesta
            </p>
          </div>
        </Link>

        {/* Pedidos & Órdenes */}
        <Link
          href="/supplier/orders"
          className="group p-5 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-rose-500/40 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Órdenes de Compra</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {orders.length}
            </p>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
              {pendingOrders.length} en proceso de surtido
            </p>
          </div>
        </Link>
      </div>

      {/* ── MÓDULOS DE OPERACIÓN DEL PROVEEDOR ──────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Boxes className="w-4 h-4 text-indigo-600" />
          Módulos y Operaciones Especializadas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cadena de Frío */}
          <Link
            href="/supplier/cold-chain"
            className="group p-6 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-sky-500/50 transition-all shadow-2xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                <ThermometerSnowflake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Cadena de Frío & Telemetría IoT
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Monitorea envíos biológicos, vacunas y excursiones térmicas en tiempo real conforme a la NOM-059-SSA1.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
              <span>{activeShipments.length} envíos en tránsito</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Renta de Equipo Biomédico */}
          <Link
            href="/supplier/rentals"
            className="group p-6 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-amber-500/50 transition-all shadow-2xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Renta de Equipos Biomédicos
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Administra contratos de comodato y arrendamiento de tecnología médica con consultorios y clínicas.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>Gestionar contratos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Gestión de Inventario & Almacenes */}
          <Link
            href="/supplier/inventory"
            className="group p-6 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/50 transition-all shadow-2xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Inventarios & Trazabilidad NOM-137
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Control de lotes, fechas de caducidad, movimientos de stock y transferencias entre almacenes centrales.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Ver almacenes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
