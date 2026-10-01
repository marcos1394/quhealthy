'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  GitCommit,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  RefreshCw,
} from 'lucide-react';
import {
  KpiSnapshotV1,
  SourceHealthV1,
  OperationalEventV1,
  PILOT_KPI_DEPLOYMENT_FREQUENCY,
  isCertifiedSnapshot,
  isUnavailableSnapshot,
  isErrorSnapshot,
} from '@/types/contracts/intelligence';
import { corporateIntelligenceService } from '@/services/corporateIntelligenceService';

interface OperatingCockpitPilotProps {
  initialSnapshot?: KpiSnapshotV1 | null;
  initialHealth?: SourceHealthV1 | null;
}

export const OperatingCockpitPilot: React.FC<OperatingCockpitPilotProps> = ({
  initialSnapshot = null,
  initialHealth = null,
}) => {
  const [snapshot, setSnapshot] = useState<KpiSnapshotV1 | null>(initialSnapshot);
  const [health, setHealth] = useState<SourceHealthV1 | null>(initialHealth);
  const [events, setEvents] = useState<OperationalEventV1[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFeatureEnabled = process.env.NEXT_PUBLIC_FEATURE_INTEL_PILOT === 'true';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [latestSnap, healthResp, eventsResp] = await Promise.all([
        corporateIntelligenceService.getLatestKpiSnapshot(PILOT_KPI_DEPLOYMENT_FREQUENCY),
        corporateIntelligenceService.getSourceHealth({ source: 'GITHUB' }),
        corporateIntelligenceService.getOperationalEvents({ page: 0, size: 5 }),
      ]);
      setSnapshot(latestSnap);
      if (healthResp?.content?.length > 0) {
        setHealth(healthResp.content[0]);
      }
      if (eventsResp?.content?.length > 0) {
        setEvents(eventsResp.content);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error cargando datos de inteligencia';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFeatureEnabled) {
      void loadData();
    }
  }, [isFeatureEnabled, loadData]);

  if (!isFeatureEnabled) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado y Gobernanza */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 text-white rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
              PILOTO V1 READ-ONLY
            </span>
            <span className="text-xs text-slate-400 font-mono">
              INTEL-API-01 / INTEL-CONTRACT-01
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 tracking-tight">
            CEO Operating Command Center — Señal de Delivery
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Snapshot canónico gobernado para <code>marcos1394/github-backend-java</code>
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Recargar'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Falla de comunicación con Intelligence API</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Grid de Señales y Salud */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* KPI Piloto: Frecuencia de Despliegues */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Frecuencia de Despliegue
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <GitCommit className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            {snapshot ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {snapshot.value !== null ? `${snapshot.value}` : '—'}
                  </span>
                  {snapshot.value !== null && (
                    <span className="text-xs font-medium text-slate-500">despliegues / día</span>
                  )}
                </div>

                {/* Badges de Veracidad Semántica */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                  {isCertifiedSnapshot(snapshot) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Certificado (Reconciliado)
                    </span>
                  )}
                  {snapshot.status === 'PROVISIONAL' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      Provisional
                    </span>
                  )}
                  {isUnavailableSnapshot(snapshot) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-300">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Sin datos (Ausencia)
                    </span>
                  )}
                  {isErrorSnapshot(snapshot) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                      <XCircle className="w-3.5 h-3.5" />
                      Falla de Extracción
                    </span>
                  )}
                  {snapshot.value === 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px]">
                      0.0 Medido Real
                    </span>
                  )}
                </div>

                {snapshot.evidenceRef && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono truncate">{snapshot.evidenceRef}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-400 text-sm italic py-2">Cargando métrica...</div>
            )}
          </div>
        </div>

        {/* Salud del Conector Externo (GitHub) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Salud de Conector: GitHub
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            {health ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Estado</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      health.connectorStatus === 'ONLINE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {health.connectorStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Frescura de datos</span>
                  <span className="font-mono font-medium text-slate-700">
                    {health.freshnessSeconds}s
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Errores (24h)</span>
                  <span className="font-mono font-medium text-slate-700">
                    {health.errorCount24h}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Calidad de datos</span>
                  <span className="font-semibold text-emerald-600">
                    {health.dataQualityStatus}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm italic py-2">Cargando estado...</div>
            )}
          </div>
        </div>

        {/* Clasificación de Seguridad y Gobernanza */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Gobernanza & A1 Policy
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Clasificación</span>
              <span className="font-mono font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md">
                A1 (Operativo Seguro)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Modo de Operación</span>
              <span className="font-semibold text-slate-800">Sólo Lectura (Read-Only)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Credenciales Externas</span>
              <span className="font-semibold text-emerald-600">Segregadas en Backend</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Custodio Humano</span>
              <span className="font-mono text-slate-700">founder_owner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Eventos Operativos Recientes */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Eventos Operativos Recientes (Canónicos)
          </h3>
          <span className="text-xs text-slate-400 font-mono">v1.0.0</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tipo de Evento</th>
                <th className="py-3 px-4">Fuente / Ref</th>
                <th className="py-3 px-4">Severidad</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Resumen</th>
                <th className="py-3 px-4">Evidencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {events.length > 0 ? (
                events.map((evt) => (
                  <tr key={evt.eventId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {evt.eventType}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {evt.source}: {evt.sourceAccountRef}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px]">
                        {evt.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate" title={evt.summary}>
                      {evt.summary}
                    </td>
                    <td className="py-3 px-4">
                      {evt.evidenceUrl ? (
                        <a
                          href={evt.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Ver <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                    {loading ? 'Consultando eventos operativos...' : 'No hay eventos registrados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
