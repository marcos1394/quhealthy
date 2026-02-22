// hooks/useStripeConnect.ts
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { stripeConnectService } from '@/services/stripe-connect.service';
import { StripeAccountStatus } from '@/types/payment';
import { toast } from 'react-toastify';

export const useStripeConnect = () => {
  const [status, setStatus] = useState<StripeAccountStatus | null>(null);
  
  // Estado para la carga inicial de los datos
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
  
  // Estado para cuando el usuario hace clic en el botón y espera a que Stripe cargue
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  // Hooks de Next.js para manipular la URL
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Función para obtener el estado actual de la cuenta
   */
  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const data = await stripeConnectService.getAccountStatus();
      setStatus(data);
    } catch (error: any) {
      console.error('Error al obtener el estado de Stripe:', error);
      // No mostramos toast de error aquí para no molestar si simplemente no tiene cuenta aún
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  /**
   * Efecto para capturar el retorno desde Stripe, mostrar mensaje y limpiar URL
   */
  useEffect(() => {
    const setupComplete = searchParams.get('setup_complete');

    if (setupComplete === 'true') {
      // Mostramos el éxito con tema oscuro para hacer match con el UI
      toast.success('¡Proceso completado! Estamos verificando tu cuenta.', {
        theme: 'dark',
      });
      
      // Limpiamos el parámetro de la URL sin recargar la página y sin perder el scroll
      router.replace(pathname, { scroll: false });
    }

    // Siempre consultamos el estado al montar el hook o al regresar a la página
    fetchStatus();
  }, [searchParams, pathname, router, fetchStatus]);

  /**
   * Función que se ejecuta al hacer clic en "Conectar Cuenta Bancaria"
   */
  const handleOnboarding = async () => {
    setIsRedirecting(true);
    try {
      const url = await stripeConnectService.startOnboarding();
      if (url) {
        // Redirigimos al usuario a la URL segura de Stripe
        window.location.href = url;
      } else {
        throw new Error('El backend no devolvió una URL válida');
      }
    } catch (error: any) {
      console.error('Error al iniciar el Onboarding de Stripe:', error);
      toast.error('No se pudo iniciar la conexión segura con Stripe. Intenta nuevamente.', {
        theme: 'dark',
      });
      setIsRedirecting(false); // Solo lo apagamos si falla, si tiene éxito se va de la página
    }
  };

  return {
    status,
    isLoadingStatus,
    isRedirecting,
    fetchStatus,
    handleOnboarding
  };
};