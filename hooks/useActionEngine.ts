import { useRouter } from 'next/navigation';
import { HealthOSAction } from '@quhealthy/health-os-contract';

export const useActionEngine = () => {
  const router = useRouter();

  const dispatchAction = async (action: HealthOSAction) => {
    console.log('ActionEngine -> dispatching:', action);
    const payload = action.payload as any;

    switch (action.type as string) {
      case 'navigate':
        if (payload?.route) {
          router.push(payload.route);
        }
        break;

      case 'open':
        if (payload?.url) {
          window.open(payload.url, payload.target || '_blank');
        }
        break;

      case 'reserve':
        console.log('Reservando:', payload);
        const reservePayload = payload || {};
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

      case 'change_date':
        console.log('Cambiando fecha:', payload);
        if (payload?.date) {
          const formattedDate = new Date(payload.date).toLocaleDateString('es-MX', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          });
          const intentText = `Muéstrame los horarios disponibles para el ${formattedDate}`;
          const hiddenCtx = `Acción explícita de cambiar fecha de calendario a: ${payload.date}`;
          window.dispatchEvent(new CustomEvent('healthos:send_intent', { detail: { text: intentText, hiddenContext: hiddenCtx } }));
        }
        break;

      case 'initiate_checkout':
        console.log('Iniciando checkout:', payload);
        const checkoutPayload = payload || {};
        if (checkoutPayload && checkoutPayload.entityId) {
          const name = checkoutPayload.entityName || checkoutPayload.entityId;
          let intentText = `Quiero iniciar el proceso de checkout para el Dr. ${name}`;
          let hiddenCtx = `Doctor ID: ${checkoutPayload.entityId}`;
          
          if (checkoutPayload.scheduleTime) {
            const dateStr = new Date(checkoutPayload.scheduleTime).toLocaleString('es-MX', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
              hour: '2-digit', minute: '2-digit' 
            });
            intentText += ` para el ${dateStr}`;
            hiddenCtx += `, Fecha y hora solicitada: ${checkoutPayload.scheduleTime}`;
          }
          
          window.dispatchEvent(new CustomEvent('healthos:send_intent', { detail: { text: intentText, hiddenContext: hiddenCtx } }));
        }
        break;

      case 'confirm_booking':
        console.log('Confirmando reserva:', payload);
        if (payload) {
          const { doctorId, serviceId, dateTime, dependentId, symptoms, shareVaultAccess } = payload;
          const intentText = `Por favor, confirma la reserva de mi cita médica con los datos proporcionados en el formulario de checkout.`;
          const hiddenCtx = `Datos del checkout finalizado: Doctor: ${doctorId}, Servicio: ${serviceId}, Fecha: ${dateTime}, Dependiente: ${dependentId || 'titular'}, Síntomas: ${symptoms}, Compartir expediente: ${shareVaultAccess}`;
          window.dispatchEvent(new CustomEvent('healthos:send_intent', { detail: { text: intentText, hiddenContext: hiddenCtx } }));
        }
        break;

      case 'pay':
        console.log('Iniciando pago:', payload);
        if (payload?.referenceId) {
          try {
            const axiosInstance = (await import('@/lib/axios')).default;
            const response = await axiosInstance.post('/api/payments/checkout/appointment', {
              appointmentId: payload.referenceId,
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
        console.log('Descargando documento:', payload);
        if (payload?.documentId) {
          try {
            const axiosInstance = (await import('@/lib/axios')).default;
            const urlResponse = await axiosInstance.get(`/api/onboarding/consumer/vault/${payload.documentId}/url`);
            
            if (urlResponse.data && urlResponse.data.url) {
              const fileUrl = urlResponse.data.url;
              
              // Fetch the actual file blob
              const response = await fetch(fileUrl);
              const blob = await response.blob();

              const disposition = response.headers.get('content-disposition');
              let filename = `document_${payload.documentId}`;
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
