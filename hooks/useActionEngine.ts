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
        alert(`Reserva iniciada para: ${action.payload.entityId} a las ${action.payload.scheduleTime}`);
        break;

      case 'pay':
        // Integración con payment.service.ts o pasarela Stripe
        console.log('Iniciando pago:', action.payload);
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
