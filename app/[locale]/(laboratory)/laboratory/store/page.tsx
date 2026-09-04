"use client";

import React, { useState, useEffect } from "react";
import {
  Store,
  ExternalLink,
  Package,
  TrendingUp,
  Truck,
  Plus,
  ArrowRight,
  ShieldCheck,
  Sliders,
  RefreshCw,
  Clock,
  Sparkles,
  DollarSign
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { laboratoryStoreService } from "@/services/laboratory-operations.service";
import {
  LaboratoryStoreMetrics,
  LaboratoryStudyCatalogItem,
} from "@/types/laboratory";

export default function LaboratoryStorePage() {
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [togglingStore, setTogglingStore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<LaboratoryStoreMetrics>({
    totalPublishedStudies: 0,
    totalMarketplaceOrders: 0,
    totalMarketplaceRevenue: 0,
    homeSamplingEnabled: false,
    storeActive: true,
  });

  const [catalog, setCatalog] = useState<LaboratoryStudyCatalogItem[]>([]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricsRes, catalogRes] = await Promise.allSettled([
        laboratoryStoreService.getStoreMetrics(),
        laboratoryStoreService.getCatalog(),
      ]);

      if (metricsRes.status === "fulfilled") {
        setMetrics(metricsRes.value);
      }
      if (catalogRes.status === "fulfilled") {
        setCatalog(catalogRes.value || []);
      }
    } catch (err: any) {
      console.error("Error al cargar datos de la tienda:", err);
      setError("No se pudo sincronizar el estado comercial de la tienda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  const handleToggleStoreStatus = async () => {
    try {
      setTogglingStore(true);
      const nextStatus = !metrics.storeActive;
      const res = await laboratoryStoreService.toggleStoreStatus(nextStatus);
      setMetrics((prev) => ({ ...prev, storeActive: res }));
    } catch (err) {
      console.error("Error al alternar estado de la tienda:", err);
    } finally {
      setTogglingStore(false);
    }
  };

  const handleTogglePublish = async (study: LaboratoryStudyCatalogItem) => {
    try {
      setUpdatingId(study.id);
      const updated = await laboratoryStoreService.updateStudyMarketplace(
        study.id,
        {
          isPublishedInMarketplace: !study.isPublishedInMarketplace,
        }
      );
      setCatalog((prev) =>
        prev.map((s) => (s.id === study.id ? updated : s))
      );
      // Actualizar contador
      setMetrics((prev) => ({
        ...prev,
        totalPublishedStudies:
          prev.totalPublishedStudies + (updated.isPublishedInMarketplace ? 1 : -1),
      }));
    } catch (err) {
      console.error("Error al actualizar visibilidad de estudio:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* ── ENCABEZADO DE LA TIENDA QUHEALTHY ────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              <Store className="w-3.5 h-3.5" />
              <span>QuMarket Laboratorios • Canal Comercial</span>
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border",
                metrics.storeActive
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  metrics.storeActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                )}
              />
              <span>
                {metrics.storeActive ? "Tienda Pública Activa" : "Tienda en Pausa"}
              </span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Mi Tienda de Análisis & Check-ups
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Publica tus estudios en el Marketplace de QuHealthy. Los pacientes y médicos de tu zona pueden consultar precios, agendar citas en sucursal o solicitar tomas a domicilio.
          </p>
        </div>

        {/* Acciones de Tienda */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadStoreData}
            disabled={loading}
            className="rounded-2xl h-11 w-11 border border-gray-200 dark:border-gray-800 cursor-pointer"
            title="Actualizar catálogo"
          >
            <RefreshCw className={cn("w-4 h-4 text-gray-500", loading && "animate-spin")} />
          </Button>

          <Button
            variant="outline"
            onClick={handleToggleStoreStatus}
            disabled={togglingStore}
            className="rounded-2xl text-xs font-bold h-11 border-gray-200 dark:border-gray-800 cursor-pointer"
          >
            <Sliders className="w-4 h-4 mr-1.5" />
            <span>
              {metrics.storeActive ? "Pausar Tienda" : "Activar Tienda"}
            </span>
          </Button>

          <Link href="/market" target="_blank">
            <Button className="rounded-2xl gap-2 font-bold text-xs h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer">
              <span>Ver Vitrina Pública</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="ghost" onClick={loadStoreData} className="text-xs font-bold">
            Reintentar
          </Button>
        </div>
      )}

      {/* ── KPIs DE RENDIMIENTO COMERCIAL EN EL MARKETPLACE ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Ingresos QuMarket
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 dark:text-white">
              ${Number(metrics.totalMarketplaceRevenue || 0).toLocaleString("es-MX", { minimumFractionDigits: 0 })}
            </span>
            <span className="text-xs font-bold text-emerald-600">MXN</span>
          </div>
          <p className="text-[11px] text-gray-400">Total recaudado por ventas online</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Pedidos Recibidos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 dark:text-white">
              {metrics.totalMarketplaceOrders}
            </span>
            <span className="text-xs font-bold text-emerald-600">Órdenes</span>
          </div>
          <p className="text-[11px] text-gray-400">Pacientes canalizados desde QuMarket</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Estudios Publicados
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {metrics.totalPublishedStudies}
            </span>
            <span className="text-xs font-bold text-indigo-600">Activos</span>
          </div>
          <p className="text-[11px] text-gray-400">Visibles para compra inmediata</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Flebotomía a Domicilio
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-2xl font-black",
                metrics.homeSamplingEnabled
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400"
              )}
            >
              {metrics.homeSamplingEnabled ? "Disponible" : "Desactivada"}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Configurado en sedes de laboratorio</p>
        </div>
      </div>

      {/* ── BENTO NAVIGATION CARDS ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Catálogo & Precios */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-colors">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Catálogo Completo
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Administra claves analíticas, tiempos de entrega y metodología clínica para cada prueba.
            </p>
          </div>
          <Link href="/laboratory/catalog">
            <Button
              variant="outline"
              className="w-full h-10 rounded-2xl text-xs font-bold border-gray-200 dark:border-gray-800 cursor-pointer"
            >
              <span>Gestionar Catálogo LIS</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Card 2: Identidad & Vitrina */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-colors">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Identidad & Acreditación
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Configura tu logotipo, aviso de funcionamiento COFEPRIS y datos del Responsable Sanitario visibles al paciente.
            </p>
          </div>
          <Link href="/laboratory/settings">
            <Button
              variant="outline"
              className="w-full h-10 rounded-2xl text-xs font-bold border-gray-200 dark:border-gray-800 cursor-pointer"
            >
              <span>Editar Perfil & Sellos</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Card 3: Cobertura Domicilio */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-colors">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Flebotomía a Domicilio
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Configura el radio de servicio en tu ciudad (km), tarifa por visita y programa citas de extracción a domicilio.
            </p>
          </div>
          <Link href="/laboratory/phlebotomy">
            <Button
              variant="outline"
              className="w-full h-10 rounded-2xl text-xs font-bold border-gray-200 dark:border-gray-800 cursor-pointer"
            >
              <span>Rutas & Cobertura</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ── TABLA DE ESTUDIOS EN VENTA DIGITAL (SWITCH DE VISIBILIDAD) ──── */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Estudios en Vitrina QuMarket
            </h2>
            <p className="text-xs text-gray-400">
              Activa o desactiva la venta online y define precios promocionales para el paciente
            </p>
          </div>

          <Link href="/laboratory/catalog">
            <Button className="rounded-2xl gap-2 font-bold text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Añadir Estudio al Catálogo</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
            <p className="text-xs text-gray-400">Cargando catálogo de la base de datos...</p>
          </div>
        ) : catalog.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20 border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                No hay estudios registrados en tu catálogo
              </h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Agrega tus pruebas de laboratorio (química clínica, hematología, perfiles) para comenzar a publicarlos en QuMarket.
              </p>
            </div>
            <Link href="/laboratory/catalog">
              <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Primer Estudio</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-2">Código & Estudio</th>
                  <th className="pb-3 px-2">Categoría</th>
                  <th className="pb-3 px-2">Precio Mostrador</th>
                  <th className="pb-3 px-2">Precio QuMarket</th>
                  <th className="pb-3 px-2">Tiempo de Entrega</th>
                  <th className="pb-3 px-2">A Domicilio</th>
                  <th className="pb-3 px-2 text-right">En Tienda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {catalog.map((study) => (
                  <tr
                    key={study.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-[#121212] transition-colors"
                  >
                    <td className="py-3.5 px-2">
                      <span className="font-bold text-gray-900 dark:text-white block">
                        {study.studyName}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400">
                        {study.studyCode}
                        {study.popularBadge ? ` • ${study.popularBadge}` : ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-gray-600 dark:text-gray-300 font-medium">
                      {study.category}
                    </td>
                    <td className="py-3.5 px-2 text-gray-500">
                      ${Number(study.basePrice || 0).toLocaleString("es-MX")} MXN
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        ${Number(study.marketplacePromoPrice || study.basePrice || 0).toLocaleString("es-MX")} MXN
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-gray-600 dark:text-gray-300">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold">
                        {study.turnaroundHours ? `${study.turnaroundHours} hrs` : "24 hrs"}
                      </span>
                    </td>
                    <td className="py-3.5 px-2">
                      {study.homeSamplingAvailable ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          <Truck className="w-3.5 h-3.5" /> Sí
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400">Solo Sucursal</span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(study)}
                        disabled={updatingId === study.id}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                          study.isPublishedInMarketplace
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
                        )}
                      >
                        {updatingId === study.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" />
                        ) : study.isPublishedInMarketplace ? (
                          "✓ Activo"
                        ) : (
                          "Pausado"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
