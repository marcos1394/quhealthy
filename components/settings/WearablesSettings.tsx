"use client";

import React, { useState, useEffect } from "react";
import { Watch, Smartphone, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

interface WearableDevice {
  provider: string;
  name: string;
  icon: React.ElementType;
  connected: boolean;
  lastSync?: string;
  type: "API" | "NATIVE";
}

export function WearablesSettings() {
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
      toast.info("Redirigiendo a Google OAuth...");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Wearables e Integraciones</h2>
          <p className="text-sm text-gray-500 font-light mt-1">Conecta tus dispositivos para sincronizar datos de salud automáticamente.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((device) => {
          const Icon = device.icon;
          return (
            <div
              key={device.provider}
              className={`border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between transition-colors ${
                device.connected ? "bg-gray-50 dark:bg-[#050505] border-black dark:border-white" : "bg-white dark:bg-[#0a0a0a]"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center border shrink-0 ${
                    device.connected ? "border-black dark:border-white bg-white dark:bg-black" : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]"
                  }`}>
                    <Icon className={`w-6 h-6 ${device.connected ? "text-black dark:text-white" : "text-gray-400"}`} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black dark:text-white uppercase tracking-tight">{device.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {device.connected ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Conectado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          <AlertCircle className="w-3 h-3" />
                          No conectado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {device.connected && device.lastSync && (
                <div className="text-[9px] font-medium text-gray-500 uppercase tracking-widest mb-4">
                  Última sinc: {device.lastSync}
                </div>
              )}

              <div className="flex items-center gap-3 mt-auto">
                {device.connected ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleDisconnect(device.provider)}
                      className="flex-1 rounded-none border border-gray-300 dark:border-gray-700 h-10 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 transition-colors"
                    >
                      Desconectar
                    </Button>
                    <Button
                      variant="outline"
                      disabled={syncing === device.provider}
                      onClick={() => handleManualSync(device.provider)}
                      className="flex-1 rounded-none border border-black dark:border-white h-10 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                      {syncing === device.provider ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        "Sincronizar"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleConnect(device.provider)}
                    className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black h-10 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Conectar
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
