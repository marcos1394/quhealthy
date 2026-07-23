import { useRouter } from 'next/navigation';
import { HealthOSAction } from '@quhealthy/health-os-contract';

export const useActionEngine = () => {
  const router = useRouter();

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
        console.log('Reservando:', action.payload);
        const reservePayload = (action.payload as any) || {};
        if (reservePayload && reservePayload.entityId) {
          const name = reservePayload.entityName || reservePayload.entityId;
          const intentText = `Quiero agendar cita con el Dr. ${name} (ID: ${reservePayload.entityId})`;
          
          // Emit a custom event so the Copilot page can intercept it and send it to the AI
          window.dispatchEvent(new CustomEvent('healthos:send_intent', { detail: intentText }));
          
          // Ensure we are on the copilot page
          if (!window.location.pathname.includes('/copilot')) {
            router.push('/copilot');
          }
        } else {
          console.warn("Faltan datos de entidad en la acción reserve.");
        }
        break;

      case 'pay':
        console.log('Iniciando pago:', action.payload);
        if (action.payload?.referenceId) {
          try {
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
