"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { 
  Link as LinkIcon, 
  Unlink, 
  RefreshCw,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  CheckCircle2
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSocial } from "@/hooks/useSocial";
import { SocialPlatform } from "@/types/social";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  {
    id: "WHATSAPP",
    name: "WhatsApp Business",
    icon: MessageCircle,
    color: "bg-emerald-500",
    description: "Recibe mensajes de WhatsApp de tus pacientes directamente en el CRM."
  },
  {
    id: "FACEBOOK",
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600",
    description: "Conecta tu página para mensajes y publicación automática."
  },
  {
    id: "INSTAGRAM",
    name: "Instagram",
    icon: Instagram,
    color: "bg-pink-600",
    description: "Conecta tu perfil de Instagram para inbox y posts."
  },
  {
    id: "EMAIL",
    name: "Correo Electrónico (Gmail)",
    icon: Mail,
    color: "bg-red-500",
    description: "Lee y responde correos de tus pacientes desde la plataforma."
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
    if (confirm(`¿Estás seguro de que deseas desconectar ${platformName}?`)) {
      try {
        await disconnectConnection(connectionId);
        toast.success(`${platformName} desconectado correctamente`);
      } catch (error) {
        toast.error(`Error al desconectar ${platformName}`);
      }
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20"
          >
            <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <div>
            <CardTitle className="text-xl font-black text-slate-900 dark:text-white mb-1">
              Medios de Contacto e Integraciones
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Conecta tus redes sociales, WhatsApp y correo para centralizar tus mensajes en el CRM de QuHealthy.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading && connections.length === 0 ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-8 h-8 text-medical-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORMS.map((platform) => {
              const activeConnection = connections.find(c => c.platform === platform.id);
              const isConnected = !!activeConnection;

              return (
                <div 
                  key={platform.id} 
                  className={cn(
                    "border rounded-xl p-5 flex flex-col justify-between transition-all",
                    isConnected 
                      ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-900/10" 
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn("p-3 rounded-xl text-white", platform.color)}>
                      <platform.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 dark:text-white">{platform.name}</h3>
                        {isConnected && (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Conectado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{platform.description}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    {isConnected ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {activeConnection.profileImageUrl && (
                            <img src={activeConnection.profileImageUrl} alt="Profile" className="w-6 h-6 rounded-full" />
                          )}
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                            {activeConnection.platformUserName}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDisconnect(activeConnection.id, platform.name)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Unlink className="w-4 h-4 mr-2" />
                          Desconectar
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleConnect(platform.id)}
                        disabled={loading}
                      >
                        {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                        Conectar {platform.name}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
