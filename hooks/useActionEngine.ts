import { useRouter } from 'next/navigation';
import { HealthOSAction } from '@quhealthy/health-os-contract';
import { useHealthOSStore } from '@/stores/useHealthOSStore';

export const useActionEngine = () => {
  const router = useRouter();
  // We can pull pendingActions from the store if we want to queue them
  // const addPendingAction = useHealthOSStore((state) => state.addPendingAction);

  const dispatchAction = async (action: HealthOSAction) => {
    console.log('ActionEngine -> dispatching:', action);

    switch (action.type) {
      case 'navigate':
        if (action.payload?.route) {
          router.push(action.payload.route);
        }
        break;

      case 'open':
        if (action.payload?.url) {
          window.open(action.payload.url, action.payload.target || '_blank');
        }
        break;

      case 'reserve':
        // Aquí interactuaría con el appointment.service.ts
        console.log('Reservando:', action.payload);
        // Simulamos un delay y luego enviamos al checkout
        if (action.payload) {
          alert(`Reserva iniciada para: ${action.payload.entityId} a las ${action.payload.scheduleTime}`);
        }
        break;

      case 'pay':
        // Integración real con Stripe
        console.log('Iniciando pago:', action.payload);
        if (action.payload?.referenceId) {
          try {
            // Utilizamos el axiosInstance que ya inyecta el JWT
            const axiosInstance = (await import('@/lib/axios')).default;
            const response = await axiosInstance.post('/api/payments/checkout/appointment', {
              appointmentId: action.payload.referenceId,
              requestBnpl: false,
              qupointsDiscountMxn: 0
            });
            
            if (response.data && response.data.url) {
              window.location.assign(response.data.url);
            }
          } catch (error) {
            console.error('Error al iniciar el checkout de Stripe:', error);
            alert('Hubo un error al iniciar el pago. Inténtalo de nuevo.');
          }
        }
        break;

      case 'start_chat':
      case 'call':
      case 'join_video':
        console.log('Iniciando comunicación:', action.type);
        break;

      default:
        console.warn('Action no implementada en el Engine:', action);
    }
  };

  return { dispatchAction };
};
