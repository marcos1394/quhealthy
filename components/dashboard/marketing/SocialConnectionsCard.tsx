"use client";

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Facebook, Linkedin, Youtube, Video, Link as LinkIcon, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSocial } from '@/hooks/useSocial';
import { SocialPlatform } from '@/types/social';

interface SocialConnectionsCardProps {
  refreshTrigger?: number;
}

export function SocialConnectionsCard({ refreshTrigger = 0 }: SocialConnectionsCardProps) {
  const t = useTranslations('DashboardMarketing');
  const {
    getActiveConnections,
    getAuthUrl,
    disconnectPlatform,
    loading
  } = useSocial();

  // Estado local para guardar las conexiones activas
  const [activePlatforms, setActivePlatforms] = React.useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);

  // Cargar conexiones al montar el componente o cuando refreshTrigger cambia
  useEffect(() => {
    loadConnections();
  }, [refreshTrigger]);

  const loadConnections = async () => {
    try {
      const connections = await getActiveConnections();
      const platformMap: Record<string, boolean> = {};
      connections.forEach(conn => {
        platformMap[conn.platform] = conn.isActive;
      });
      setActivePlatforms(platformMap);
    } catch (error) {
      console.error("Error cargando conexiones:", error);
    }
  };

  const handleConnect = async (platform: SocialPlatform) => {
    setIsProcessing(platform);
    try {
      // 🚀 Usamos nuestro endpoint del backend en lugar de hardcodear rutas
      const response = await getAuthUrl(platform);
      if (response.url) {
        window.location.href = response.url; // Redirigir a Meta/Google/LinkedIn
      }
    } catch (error) {
      toast.error(t('connect_error') || 'Error al conectar con la plataforma');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDisconnect = async (platform: SocialPlatform) => {
    setIsProcessing(platform);
    try {
      await disconnectPlatform(platform);
      toast.success(t('disconnect_success') || 'Cuenta desconectada');
      loadConnections(); // Recargar el estado
    } catch (error) {
      toast.error(t('disconnect_error') || 'Error al desconectar');
    } finally {
      setIsProcessing(null);
    }
  };

  // Definición visual de las tarjetas
  const availableNetworks = [
    { id: 'FACEBOOK' as SocialPlatform, name: 'Facebook & Instagram', icon: Facebook, color: 'bg-[#1877F2]' },
    { id: 'GOOGLE_BUSINESS' as SocialPlatform, name: 'Google Business', icon: Youtube, color: 'bg-[#EA4335]' }, // Cambia Youtube por el icono de Google si lo tienes
    { id: 'LINKEDIN' as SocialPlatform, name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0A66C2]' },
  ];

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
          {t('connect_section_title')}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          {t('connect_section_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {availableNetworks.map((network) => {
          const isConnected = activePlatforms[network.id];
          const isCurrentlyProcessing = isProcessing === network.id || loading;

          return (
            <div
              key={network.id}
              className={`p-5 rounded-xl border flex flex-col items-center text-center gap-4 transition-colors ${isConnected
                  ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/30'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-800/50 dark:border-slate-800 dark:hover:border-slate-700'
                }`}
            >
              <div className={`w-12 h-12 ${network.color} rounded-full flex items-center justify-center text-white shadow-md`}>
                <network.icon size={24} />
              </div>

              <div className="flex-1 w-full">
                <p className="font-semibold text-slate-900 dark:text-white">{network.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isConnected ? t('status_connected') || 'Sincronizado' : t('status_disconnected') || 'No conectado'}
                </p>
              </div>

              {isConnected ? (
                <div className="w-full space-y-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 w-full justify-center py-1.5 font-medium">
                    <CheckCircle size={14} className="mr-1.5" /> {t('active_badge') || 'Activo'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(network.id)}
                    disabled={isCurrentlyProcessing}
                    className="w-full text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    {isCurrentlyProcessing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                    {t('disconnect_btn') || 'Desconectar'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnect(network.id)}
                  disabled={isCurrentlyProcessing}
                  className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm"
                >
                  {isCurrentlyProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <LinkIcon size={14} className="mr-2" />
                  )}
                  {t('connect_btn')}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}