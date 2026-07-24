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
          let intentText = `Quiero agendar cita con el Dr. ${name}`;
          let hiddenCtx = `Doctor ID: ${reservePayload.entityId}`;
          
          if (reservePayload.scheduleTime) {
            const dateStr = new Date(reservePayload.scheduleTime).toLocaleString('es-MX', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
              hour: '2-digit', minute: '2-digit' 
            });
            intentText += ` para el ${dateStr}`;
            hiddenCtx += `, Fecha y hora solicitada: ${reservePayload.scheduleTime}`;
          }
          
          // Emit a custom event so the Copilot page can intercept it and send it to the AI
          window.dispatchEvent(new CustomEvent('healthos:send_intent', { detail: { text: intentText, hiddenContext: hiddenCtx } }));
          
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

      case 'download':
        console.log('Descargando documento:', action.payload);
        if (action.payload?.documentId) {
          try {
            const axiosInstance = (await import('@/lib/axios')).default;
            const urlResponse = await axiosInstance.get(`/api/onboarding/consumer/vault/${action.payload.documentId}/url`);
            
            if (urlResponse.data && urlResponse.data.url) {
              const fileUrl = urlResponse.data.url;
              
              // Fetch the actual file blob
              const response = await fetch(fileUrl);
              const blob = await response.blob();

              const disposition = response.headers.get('content-disposition');
              let filename = `document_${action.payload.documentId}`;
              if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) { 
                  filename = matches[1].replace(/['"]/g, '');
                }
              }

              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', filename);
              document.body.appendChild(link);
              link.click();
              link.remove();
              window.URL.revokeObjectURL(url);
            }
          } catch (error) {
            console.error('Error al descargar el documento:', error);
            alert('No se pudo descargar el documento en este momento.');
          }
        }
        break;

      default:
        console.warn('Action no implementada en el Engine:', action);
    }
  };

  return { dispatchAction };
};
