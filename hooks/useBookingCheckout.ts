// Ubicación: src/hooks/useBookingCheckout.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { appointmentService } from '@/services/appointment.service';
import { paymentService } from '@/services/payment.service';
import { CheckoutParams } from '@/types/booking';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const useBookingCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter(); 

  const processCheckout = async ({
    providerId,
    consumerId,
    dependentId,
    selectedDate,
    selectedTime,
    cart,
    consumerSymptoms,
    shippingAddress,
    prescriptionUrls,
    pickupTime,
    destinationState,
    scheduleNow = true,
    shareVaultAccess = false
  }: CheckoutParams) => {
    setIsProcessing(true);

    try {
      if (!cart || cart.length === 0) {
        throw new Error("El carrito está vacío.");
      }

      // 🧠 1. IDENTIFICAR EL TIPO DE ORDEN
      // Es cita única SOLAMENTE si hay 1 ítem de tipo SERVICIO y además se seleccionó "Agendar Ahora"
      const isSingleAppointment = cart.length === 1 && cart[0].type === 'SERVICE' && scheduleNow;

      if (isSingleAppointment) {
        // =======================================================
        // 🩺 FLUJO A: CITA MÉDICA ÚNICA (Bypass al error Híbrido)
        // =======================================================
        const item = cart[0];
        let startTimeIso = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
        
        if (selectedDate && selectedTime) {
          const [hours, minutes] = selectedTime.split(':');
          const startDateTime = new Date(selectedDate);
          startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          startTimeIso = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");
        }

        const appointmentPayload = {
          providerId,
          consumerId,
          dependentId,
          serviceId: item.id, // 🚀 FIX: Cambiado de catalogItemId a serviceId
          startTime: startTimeIso,
          appointmentType: item.modality === 'ONLINE' ? 'ONLINE' : 'IN_PERSON',
          consumerSymptoms: consumerSymptoms || "Reserva de servicio médico",
          paymentMethod: 'CREDIT_CARD'
        };

        // 1. Crear Cita Normal (Backend Java: /api/appointments/create)
        const createdResponse = await appointmentService.createAppointment(appointmentPayload);

        // 🚀 FIX EXACTO: Como el backend responde con una lista [ {id: 44} ], sacamos el primer elemento.
        // Lo hacemos con un ternario por seguridad, por si en algún momento el backend devuelve un objeto directo.
        const appointmentId = Array.isArray(createdResponse) ? createdResponse[0].id : createdResponse.id;

        // 🚀 OTORGAR PERMISOS SI EL USUARIO LO PIDIÓ
        if (shareVaultAccess) {
          try {
            const axiosInstance = (await import('@/lib/axios')).default;
            await axiosInstance.post(`/api/onboarding/consumer/vault/permissions/grant/${providerId}`);
            console.log("Permisos del expediente otorgados exitosamente al proveedor", providerId);
          } catch (e) {
            console.error("No se pudo otorgar permiso de expediente", e);
            // No interrumpimos el flujo si falla
          }
        }

        // 2. Crear Checkout de Stripe para 1 Cita
        const checkoutUrl = await paymentService.createCheckoutSession(appointmentId);

        // 3. Redirigir a Stripe
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          throw new Error("No se pudo generar la sesión de pago de la cita.");
        }

      } else {
        // =======================================================
        // 🛒 FLUJO B: ORDEN HÍBRIDA (Productos, Paquetes o Múltiples)
        // =======================================================
        const cartItems = cart.map(item => {
          let startTimeIso: string | null = null;
          let appointmentType = item.modality === 'ONLINE' ? 'ONLINE' : 'IN_PERSON';

          if (item.type === 'SERVICE' || item.type === 'PACKAGE') {
            // Si scheduleNow es true, generamos la fecha seleccionada. Si es false (Comprar para después), enviamos null.
            if (scheduleNow && selectedDate && selectedTime) {
              const [hours, minutes] = selectedTime.split(':');
              const startDateTime = new Date(selectedDate);
              startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
              startTimeIso = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");
            } else {
               startTimeIso = null;
            }
          }

          return {
            catalogItemId: item.id,
            itemType: item.type || 'SERVICE', 
            quantity: item.quantity || 1,
            startTime: startTimeIso,
            appointmentType: appointmentType
          };
        });

        const preparePayload = {
          providerId,
          consumerId,
          dependentId,
          paymentMethod: 'CREDIT_CARD',
          consumerSymptoms: consumerSymptoms || `Orden desde la tienda. Ítems: ${cart.length}`,
          shippingAddress,
          destinationState,
          pickupTime,
          // 🚀 DIRECT-TO-CLOUD: Enviamos el JSON directo en el body, NO en metadata
          prescriptionUrls: prescriptionUrls, 
          cartItems
        };

        const preparedOrder = await appointmentService.prepareHybridOrder(preparePayload);

        if (!preparedOrder) throw new Error("No se pudo preparar la orden híbrida.");

        // 🚀 AJUSTE EXACTO: El payload que espera createHybridCheckout
        const paymentPayload = {
          appointmentIds: preparedOrder.createdAppointmentIds,
          orderId: preparedOrder.createdOrderId,
          providerId: providerId,
          totalAmount: preparedOrder.totalAmount,
          currency: preparedOrder.currency || "MXN"
        };

        // 🚀 OTORGAR PERMISOS SI EL USUARIO LO PIDIÓ
        if (shareVaultAccess) {
          try {
            const axiosInstance = (await import('@/lib/axios')).default;
            await axiosInstance.post(`/api/onboarding/consumer/vault/permissions/grant/${providerId}`);
            console.log("Permisos del expediente otorgados exitosamente al proveedor", providerId);
          } catch (e) {
            console.error("No se pudo otorgar permiso de expediente", e);
            // No interrumpimos el flujo si falla
          }
        }

        const checkoutUrl = await paymentService.createHybridCheckout(paymentPayload);

        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          throw new Error("No se pudo generar la sesión de pago híbrida.");
        }
      }

    } catch (error: any) {
      console.error("❌ Checkout Error:", error);
      const errorData = error.response?.data;

      if (errorData?.code === "VALIDATION_ERROR") {
        const validationMsgs = Object.values(errorData.errors || {}).join(", ");
        toast.error(`Error de validación: ${validationMsgs}`, { theme: "colored" });
      } 
      
      if (error.response?.status === 401) {
        toast.warning("Tu sesión ha expirado.");
        router.push('/login?expired=true');
      }

      const errorMsg = errorData?.message || error.message || "Error al procesar la reserva.";
      toast.error(errorMsg, { theme: "colored" });
      handleApiError(error);

    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processCheckout,
    isProcessing
  };
};