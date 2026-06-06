"use client";

import React, { useState, useEffect } from "react";
import { Watch, Smartphone, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

interface WearableDevice {
  provider: string;
  name: string;
  icon: React.ElementType;
  connected: boolean;
  lastSync?: string;
  type: "API" | "NATIVE";
}

export default function WearablesSettingsPage() {
  const [devices, setDevices] = useState<WearableDevice[]>([
    {
      provider: "APPLE_HEALTH",
      name: "Apple Health",
      icon: Smartphone,
      connected: false,
      type: "NATIVE",
    },
    {
      provider: "GOOGLE_FIT",
      name: "Google Fit",
      icon: Watch,
      connected: false,
      type: "API",
    },
    {
      provider: "OURA",
      name: "Oura Ring",
      icon: Watch,
      connected: false,
      type: "API",
    }
  ]);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch("/api/wearables/oauth/connections");
        if (response.ok) {
          const data = await response.json();
          setDevices(prev => prev.map(d => {
            const serverConn = data.find((c: any) => c.provider === d.provider && c.isActive);
            if (serverConn) {
              return {
                ...d,
                connected: true,
                lastSync: serverConn.updatedAt ? new Date(serverConn.updatedAt).toLocaleString() : "Hoy",
              };
            }
            return d;
          }));
        }
      } catch (e) {
        console.error("Error fetching connections", e);
      }
    };
    fetchConnections();
  }, []);

  const handleConnect = async (provider: string) => {
    if (provider === "GOOGLE_FIT") {
      // Flujo de OAuth simulado
      toast.info("Redirigiendo a Google OAuth...");
      // window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?...`;
    } else if (provider === "APPLE_HEALTH") {
      toast.info("Abre la aplicación de QuHealthy en iOS para autorizar el acceso.");
    } else {
      toast.info(`Redirigiendo a OAuth de ${provider}...`);
    }
  };

  const handleDisconnect = async (provider: string) => {
    try {
      await fetch(`/api/wearables/oauth/disconnect/${provider}`, { method: 'POST' });
      setDevices(prev => prev.map(d => d.provider === provider ? { ...d, connected: false, lastSync: undefined } : d));
      toast.success("Dispositivo desconectado correctamente.");
    } catch (e) {
      toast.error("Error al desconectar.");
    }
  };

  const handleManualSync = async (provider: string) => {
    setSyncing(provider);
    try {
      // Lógica simulada de fetch manual si implementáramos un endpoint específico
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDevices(prev => prev.map(d => d.provider === provider ? { ...d, lastSync: "Justo ahora" } : d));
      toast.success("Sincronización completada exitosamente.");
    } catch (e) {
      toast.error("Fallo al sincronizar.");
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dispositivos y Wearables</h1>
        <p className="text-slate-500 mt-2">
          Conecta tus dispositivos para que el Motor de Inteligencia Artificial genere recomendaciones clínicas precisas utilizando tus métricas en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((device) => (
          <div key={device.provider} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <device.icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </div>
                {device.connected ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                    Conectado
                  </span>
                ) : (
                  <span className="text-sm font-medium text-slate-400">Desconectado</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{device.name}</h3>
              {device.type === "NATIVE" && (
                <p className="text-sm text-slate-500 mt-1">Requiere la app móvil nativa.</p>
              )}
              {device.connected && device.lastSync && (
                <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Última sincronización: {device.lastSync}
                </p>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              {!device.connected ? (
                <button
                  onClick={() => handleConnect(device.provider)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition"
                >
                  Conectar
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleDisconnect(device.provider)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 transition"
                  >
                    Desconectar
                  </button>
                  {device.type === "API" && (
                    <button
                      onClick={() => handleManualSync(device.provider)}
                      disabled={syncing === device.provider}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition flex justify-center items-center gap-2"
                    >
                      {syncing === device.provider ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        "Sincronizar"
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex gap-3 text-sm text-blue-800 dark:text-blue-200">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p>
          Las conexiones API como Google Fit u Oura se sincronizan automáticamente todos los días a las 2:00 AM para no gastar batería de tu celular. Las conexiones nativas como Apple Health sincronizan sus datos al abrir la app móvil.
        </p>
      </div>
    </div>
  );
}
