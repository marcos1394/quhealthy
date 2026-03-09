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

  // 1. Verificar estado actual
  const checkStatus = useCallback(async () => {
    setIsCheckingGoogle(true);
    try {
      const data = await calendarIntegrationService.getStatus();
      setIsGoogleConnected(data.connected);
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
      router.replace('/provider/dashboard/calendar'); // Limpiamos la URL
    } else if (syncStatus === 'error') {
      return;
      router.replace('/provider/dashboard/calendar');
    }
  }, [searchParams, router]);

  // 4. Acción para el botón "Vincular Google"
  const handleGoogleConnect = async () => {
    try {
      const url = await calendarIntegrationService.getConnectUrl();
      window.location.href = url; // Redirección directa al Auth de Google
    } catch (error) {
      return;
    }
  };

  return {
    isGoogleConnected,
    isCheckingGoogle,
    handleGoogleConnect,
    refetchStatus: checkStatus
  };
};