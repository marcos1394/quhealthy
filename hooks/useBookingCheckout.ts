// Ubicación: src/hooks/useBookingCheckout.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 🚀 Importante para la redirección
import { appointmentService } from '@/services/appointment.service';
import { paymentService } from '@/services/payment.service';
import { CheckoutParams } from '@/types/booking';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const useBookingCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter(); // 🚀 Instanciamos el router

  const processCheckout = async ({
    providerId,
    consumerId,
    dependentId,
    selectedDate,
    selectedTime,
    cart,
    consumerSymptoms,
    shippingAddress
  }: CheckoutParams) => {
    setIsProcessing(true);

    try {
      if (!cart || cart.length === 0) {
        throw new Error("El carrito está vacío.");
      }

      // 1. 🛠️ MAPEO DEL CARRITO
      const cartItems = cart.map(item => {
        let startTimeIso: string | null = null;
        let appointmentType = 'IN_PERSON';

        if (item.modality === 'ONLINE') appointmentType = 'ONLINE';

        if (item.type === 'SERVICE' || item.type === 'PACKAGE') {
          if (selectedDate && selectedTime) {
            const [hours, minutes] = selectedTime.split(':');
            const startDateTime = new Date(selectedDate);
            startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            startTimeIso = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");
          } else {
             startTimeIso = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
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

      // 2. 📦 PREPARAR ORDEN
      const preparePayload = {
        providerId,
        consumerId,
        dependentId,
        paymentMethod: 'CREDIT_CARD',
        consumerSymptoms: consumerSymptoms || `Orden desde la tienda. Ítems: ${cart.length}`,
        shippingAddress,
        cartItems
      };

      const preparedOrder = await appointmentService.prepareHybridOrder(preparePayload);

      if (!preparedOrder) throw new Error("No se pudo preparar la orden.");

      // 3. 💳 SOLICITAR LINK DE PAGO
      const paymentPayload = {
        appointmentIds: preparedOrder.createdAppointmentIds,
        orderId: preparedOrder.createdOrderId,
        providerId: providerId,
        totalAmount: preparedOrder.totalAmount,
        currency: preparedOrder.currency || "MXN"
      };

      const checkoutUrl = await paymentService.createHybridCheckout(paymentPayload);

      // 4. 🚀 REDIRECCIÓN
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No se pudo generar la sesión de pago.");
      }

    } catch (error: any) {
      console.error("❌ Checkout Error:", error);
      const errorData = error.response?.data;

      // 🚀 FIX FU-002: Retroalimentación visible y manejo de sesión
      if (errorData?.code === "VALIDATION_ERROR") {
        // Extraemos todos los mensajes de error del objeto del backend
        const validationMsgs = Object.values(errorData.errors || {}).join(", ");
        toast.error(`Error de validación: ${validationMsgs}`, { theme: "colored" });
        return;
      } 
      
      if (error.response?.status === 401) {
        // Redirigimos al login con el flag de sesión expirada
        toast.warning("Tu sesión ha expirado.");
        router.push('/login?expired=true');
        return;
      }

      // Error genérico o de red
      const errorMsg = errorData?.message || error.message || "Error al procesar la reserva.";
      toast.error(errorMsg, { theme: "colored" });
      handleApiError(error);

    } finally {
      // 🚀 FIX FU-001: Siempre liberamos el estado de carga
      setIsProcessing(false);
    }
  };

  return {
    processCheckout,
    isProcessing
  };
};