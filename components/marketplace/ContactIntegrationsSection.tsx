"use client";
/* eslint-disable react-doctor/button-has-type */

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Link as LinkIcon,
  Unlink,
  RefreshCw,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  Check,
} from "lucide-react";

import { useSocial } from "@/hooks/useSocial";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";

const PLATFORMS = [
  {
    id: "WHATSAPP",
    name: "WhatsApp Business",
    icon: MessageCircle,
    description: "Recibe mensajes de WhatsApp de pacientes en el CRM.",
  },
  {
    id: "FACEBOOK",
    name: "Facebook",
    icon: Facebook,
    description: "Conecta tu página para mensajes y publicación automática.",
  },
  {
    id: "INSTAGRAM",
    name: "Instagram",
    icon: Instagram,
    description: "Conecta tu perfil de Instagram para inbox y posts.",
  },
  {
    id: "EMAIL",
    name: "Correo Electrónico",
    icon: Mail,
    description: "Lee y responde correos de pacientes desde la plataforma.",
  },
];

export function ContactIntegrationsSection() {
  const {
    connections,
    loadConnections,
    getAuthUrl,
    disconnectConnection,
    loading,
  } = useSocial();

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleConnect = async (platformId: string) => {
    try {
      const response = await getAuthUrl(platformId);
      if (response && response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      toast.error(`Error al conectar con ${platformId}`);
    }
  };

  const handleDisconnect = async (
    connectionId: string,
    platformName: string,
  ) => {
    if (
      confirm(
        `¿Estás seguro de que deseas revocar el acceso a ${platformName}?`,
      )
    ) {
      try {
        await disconnectConnection(connectionId);
        toast.success(`Protocolo ${platformName} desconectado correctamente`);
      } catch (error) {
        toast.error(`Error al desconectar ${platformName}`);
      }
    }
  };

  return (
    <div className="flex flex-col bg-transparent">
      {/* Header Interior */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-white dark:bg-[#0a0a0a] rounded-t-3xl">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <LinkIcon
              className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
              strokeWidth={2}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Medios de Contacto e Integraciones
            </h2>
            <p className="text-sm font-medium text-gray-500">
              Conecta tus redes sociales, WhatsApp y correo para centralizar
              comunicación en el CRM.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] rounded-b-3xl p-6 md:p-8">
        {loading && connections.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-16 gap-4">
            <QhSpinner size="md" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Validando Conexiones...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORMS.map((platform, index) => {
              const activeConnection = connections.find(
                (c) => c.platform === platform.id,
              );
              const isConnected = !!activeConnection;

              return (
                <div
                  key={platform.id}
                  className={cn(
                    "p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative shadow-sm hover:shadow-md",
                    isConnected
                      ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-300 dark:hover:border-emerald-700",
                  )}
                >
                  <div className="flex items-start gap-4 mb-8">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-sm",
                        isConnected
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-gray-50 dark:bg-[#050505] text-gray-400 border border-gray-200 dark:border-gray-800",
                      )}
                    >
                      <platform.icon className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-2 mb-2">
                        <h3
                          className={cn(
                            "text-sm font-bold transition-colors",
                            isConnected
                              ? "text-emerald-800 dark:text-emerald-300"
                              : "text-gray-900 dark:text-white",
                          )}
                        >
                          {platform.name}
                        </h3>
                        {isConnected && (
                          <span className="self-start bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm">
                            <Check className="w-4 h-4" strokeWidth={2} />{" "}
                            Enlazado
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-sm font-medium leading-relaxed transition-colors",
                          isConnected
                            ? "text-emerald-700/80 dark:text-emerald-400/80"
                            : "text-gray-500",
                        )}
                      >
                        {platform.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {isConnected ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 bg-white/50 dark:bg-[#0a0a0a]/50 shadow-sm">
                        <div className="flex items-center gap-3">
                          {activeConnection.profileImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={activeConnection.profileImageUrl}
                              alt="Profile"
                              className="w-10 h-10 rounded-full border border-emerald-100 dark:border-emerald-800 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full border border-emerald-100 dark:border-emerald-800 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20">
                              <platform.icon className="w-4 h-4 text-emerald-500" />
                            </div>
                          )}
                          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100 truncate max-w-[120px]">
                            {activeConnection.platformUserName ||
                              "Cuenta Enlazada"}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleDisconnect(
                              activeConnection.id,
                              platform.name,
                            )
                          }
                          className="h-10 px-4 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                        >
                          <Unlink className="w-4 h-4" strokeWidth={2} />{" "}
                          Desconectar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnect(platform.id)}
                        disabled={loading}
                        className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {loading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <LinkIcon className="w-5 h-5" strokeWidth={2} />
                        )}
                        Configurar Protocolo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
