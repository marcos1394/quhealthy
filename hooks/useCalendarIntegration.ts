/* eslint-disable react-doctor/prefer-module-scope-pure-function */
// hooks/useCalendarIntegration.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';
import { calendarIntegrationService } from '@/services/calendar-integration.service';

export const useCalendarIntegration = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isCheckingGoogle, setIsCheckingGoogle] = useState(true);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // 1. Verificar estado actual
  const checkStatus = useCallback(async () => {
    setIsCheckingGoogle(true);
    try {
      const data = await calendarIntegrationService.getStatus();
      setIsGoogleConnected(data.connected);
      setLastSyncedAt(data.lastSyncedAt || null);
    } catch (error) {
      console.error("Error verificando estado de Google Calendar", error);
    } finally {
      setIsCheckingGoogle(false);
    }
  }, []);

  // 2. Ejecutar al montar
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // 3. Manejar la redirección de Google (Éxito/Error)
  useEffect(() => {
    const syncStatus = searchParams?.get('calendar_status');
    if (syncStatus === 'success') {
      toast.success("¡Google Calendar conectado exitosamente! 🎉", { theme: "dark" });
      setIsGoogleConnected(true);
      checkStatus().finally(() => {
        router.replace('/provider/dashboard/calendar'); // Limpiamos la URL
      });
    } else if (syncStatus === 'error') {
      toast.error("Error al conectar con Google. Intenta de nuevo.", { theme: "dark" });
      router.replace('/provider/dashboard/calendar');
    }
  }, [searchParams, router, checkStatus]);

  // 4. Acción para el botón "Vincular Google"
  const handleGoogleConnect = async () => {
    try {
      const url = await calendarIntegrationService.getConnectUrl();
      window.location.href = url; // Redirección directa al Auth de Google
    } catch (error) {
      handleApiError(error);
    }
  };

  // 5. Sincronizar manualmente con Google Calendar
  const handleSyncNow = async () => {
    setIsSyncingGoogle(true);
    try {
      await calendarIntegrationService.syncNow();
      await checkStatus();
      toast.success("Agenda sincronizada con Google Calendar", { theme: "dark" });
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  // 6. Desconectar Google Calendar
  const handleDisconnect = async () => {
    try {
      await calendarIntegrationService.disconnect();
      setIsGoogleConnected(false);
      setLastSyncedAt(null);
      toast.info("Google Calendar desconectado", { theme: "dark" });
    } catch (error) {
      handleApiError(error);
    }
  };

  return {
    isGoogleConnected,
    isCheckingGoogle,
    isSyncingGoogle,
    lastSyncedAt,
    handleGoogleConnect,
    handleSyncNow,
    handleDisconnect,
    refetchStatus: checkStatus
  };
};