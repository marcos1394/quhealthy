"use client";

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Facebook, Linkedin, Youtube, Link as LinkIcon, CheckCircle, Loader2, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSocial } from '@/hooks/useSocial';
import { SocialPlatform, SocialConnectionDTO } from '@/types/social';

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

  // Guardamos la data completa de cada conexión (nombre, foto, fecha, etc.)
  const [connections, setConnections] = React.useState<Record<string, SocialConnectionDTO>>({});
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);

  // Cargar conexiones al montar o cuando refreshTrigger cambia
  useEffect(() => {
    loadConnections();
  }, [refreshTrigger]);

  const loadConnections = async () => {
    try {
      const data = await getActiveConnections();
      const map: Record<string, SocialConnectionDTO> = {};
      data.forEach(conn => {
        if (conn.connected) {
          map[conn.platform] = conn;
        }
      });
      setConnections(map);
    } catch (error) {
      console.error("Error cargando conexiones:", error);
    }
  };

  const handleConnect = async (platform: SocialPlatform) => {
    setIsProcessing(platform);
    try {
      const response = await getAuthUrl(platform);
      if (response.url) {
        window.location.href = response.url;
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
      loadConnections();
    } catch (error) {
      toast.error(t('disconnect_error') || 'Error al desconectar');
    } finally {
      setIsProcessing(null);
    }
  };

  // Formatear fecha de conexión
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Definición visual de las tarjetas
  const availableNetworks = [
    { id: 'FACEBOOK' as SocialPlatform, name: 'Facebook & Instagram', icon: Facebook, color: 'bg-[#1877F2]', gradient: 'from-[#1877F2] to-[#0C5DC7]' },
    { id: 'GOOGLE_BUSINESS' as SocialPlatform, name: 'Google Business', icon: Youtube, color: 'bg-[#EA4335]', gradient: 'from-[#EA4335] to-[#C5221F]' },
    { id: 'LINKEDIN' as SocialPlatform, name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0A66C2]', gradient: 'from-[#0A66C2] to-[#004182]' },
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
          const connection = connections[network.id];
          const isConnected = !!connection;
          const isCurrentlyProcessing = isProcessing === network.id || loading;

          return (
            <div
              key={network.id}
              className={`relative rounded-xl border overflow-hidden transition-all ${isConnected
                ? 'bg-white border-emerald-200 dark:bg-slate-800/80 dark:border-emerald-800/40 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-800/50 dark:border-slate-800 dark:hover:border-slate-700'
                }`}
            >
              {/* --- ESTADO CONECTADO: Muestra perfil --- */}
              {isConnected ? (
                <div className="flex flex-col">
                  {/* Header con gradiente de la plataforma */}
                  <div className={`bg-gradient-to-r ${network.gradient} px-4 py-3 flex items-center gap-3`}>
                    <network.icon size={18} className="text-white/90" />
                    <span className="text-sm font-semibold text-white">{network.name}</span>
                    <Badge className="ml-auto bg-white/20 text-white border-0 text-[10px] font-medium backdrop-blur-sm">
                      <CheckCircle size={10} className="mr-1" /> {t('active_badge') || 'Activo'}
                    </Badge>
                  </div>

                  {/* Perfil del usuario conectado */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {connection.profileImageUrl ? (
                        <img
                          src={connection.profileImageUrl}
                          alt={connection.platformUserName}
                          width={40}
                          height={40}
                          className="rounded-full border-2 border-emerald-200 dark:border-emerald-700 shadow-sm object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={`w-10 h-10 ${network.color} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                          {connection.platformUserName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {connection.platformUserName}
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                          {t('status_connected') || 'Sincronizado'}
                        </p>
                      </div>
                    </div>

                    {/* Fecha de conexión */}
                    {connection.connectedAt && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                        <Calendar size={11} />
                        <span>{t('connected_since') || 'Conectado el'} {formatDate(connection.connectedAt)}</span>
                      </div>
                    )}

                    {/* Botón desconectar */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(network.id)}
                      disabled={isCurrentlyProcessing}
                      className="w-full text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 mt-1"
                    >
                      {isCurrentlyProcessing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                      {t('disconnect_btn') || 'Desconectar'}
                    </Button>
                  </div>
                </div>
              ) : (
                /* --- ESTADO DESCONECTADO: Muestra botón conectar --- */
                <div className="p-5 flex flex-col items-center text-center gap-4">
                  <div className={`w-12 h-12 ${network.color} rounded-full flex items-center justify-center text-white shadow-md`}>
                    <network.icon size={24} />
                  </div>

                  <div className="flex-1 w-full">
                    <p className="font-semibold text-slate-900 dark:text-white">{network.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('status_disconnected') || 'No conectado'}
                    </p>
                  </div>

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
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}