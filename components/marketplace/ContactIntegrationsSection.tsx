"use client"
/* eslint-disable react-doctor/button-has-type */;

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
  Check
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
    description: "Recibe mensajes de WhatsApp de pacientes en el CRM."
  },
  {
    id: "FACEBOOK",
    name: "Facebook",
    icon: Facebook,
    description: "Conecta tu página para mensajes y publicación automática."
  },
  {
    id: "INSTAGRAM",
    name: "Instagram",
    icon: Instagram,
    description: "Conecta tu perfil de Instagram para inbox y posts."
  },
  {
    id: "EMAIL",
    name: "Correo Electrónico",
    icon: Mail,
    description: "Lee y responde correos de pacientes desde la plataforma."
  }
];

export function ContactIntegrationsSection() {
  const { connections, loadConnections, getAuthUrl, disconnectConnection, loading } = useSocial();

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

  const handleDisconnect = async (connectionId: string, platformName: string) => {
    if (confirm(`¿Estás seguro de que deseas revocar el acceso a ${platformName}?`)) {
      try {
        await disconnectConnection(connectionId);
        toast.success(`Protocolo ${platformName} desconectado correctamente`);
      } catch (error) {
        toast.error(`Error al desconectar ${platformName}`);
      }
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
      
      {/* Header Interior */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505]">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
            <LinkIcon className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">
              Medios de Contacto e Integraciones
            </h2>
            <p className="text-[10px] text-gray-500 font-light uppercase tracking-widest">
              Conecta tus redes sociales, WhatsApp y correo para centralizar comunicación en el CRM.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        {loading && connections.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-16 gap-4">
            <QhSpinner size="md" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Validando Conexiones...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {PLATFORMS.map((platform, index) => {
              const activeConnection = connections.find(c => c.platform === platform.id);
              const isConnected = !!activeConnection;

              return (
                <div 
                  key={platform.id} 
                  className={cn(
                    "p-6 md:p-8 flex flex-col justify-between transition-all duration-300 border-b border-gray-200 dark:border-gray-800 group hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer",
                    // Aseguramos que la columna izquierda tenga borde derecho en desktop
                    index % 2 === 0 ? "md:border-r" : "",
                    isConnected 
                      ? "bg-gray-50 dark:bg-[#050505]" 
                      : "bg-white dark:bg-[#0a0a0a]"
                  )}
                >
                  <div className="flex items-start gap-4 mb-8">
                    <div className={cn(
                      "w-12 h-12 flex items-center justify-center border transition-colors shrink-0",
                      isConnected 
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:bg-transparent group-hover:text-white dark:group-hover:text-black" 
                        : "border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black"
                    )}>
                      <platform.icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-2 mb-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">{platform.name}</h3>
                        {isConnected && (
                          <span className="self-start border border-black bg-black text-white dark:border-white dark:bg-white dark:text-black group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black transition-colors px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                            <Check className="w-3 h-3" strokeWidth={2} /> Enlazado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors font-light leading-relaxed">
                        {platform.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {isConnected ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {activeConnection.profileImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={activeConnection.profileImageUrl} alt="Profile" className="w-8 h-8 border border-gray-300 dark:border-gray-700 object-cover grayscale" />
                          ) : (
                            <div className="w-8 h-8 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
                              <platform.icon className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors truncate max-w-[120px]">
                            {activeConnection.platformUserName || "Cuenta Enlazada"}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDisconnect(activeConnection.id, platform.name)}
                          className="h-8 px-4 border border-red-500 text-red-600 dark:text-red-400 text-[9px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                          <Unlink className="w-3 h-3" strokeWidth={2} /> Desconectar
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleConnect(platform.id)}
                        disabled={loading}
                        className="w-full h-12 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black hover:!bg-white hover:!text-black dark:hover:!bg-black dark:hover:!text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" strokeWidth={1.5} />}
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