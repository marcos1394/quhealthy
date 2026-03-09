import { useState } from 'react';
import { appointmentService } from '@/services/appointment.service';
import { paymentService } from '@/services/payment.service';
import { CheckoutParams } from '@/types/booking';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const useBookingCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processCheckout = async ({
    providerId,
    consumerId,
    dependentId,
    selectedDate,
    selectedTime,
    cart,
    consumerSymptoms,
    shippingAddress // 🚀 Añadido para productos físicos
  }: CheckoutParams) => {
    setIsProcessing(true);

    try {
      if (!cart || cart.length === 0) {
        throw new Error("El carrito está vacío.");
      }

      // 1. 🛠️ MAPEO INTELIGENTE DEL CARRITO
      const cartItems = cart.map(item => {
        let startTimeIso: string | null = null;
        let appointmentType = 'IN_PERSON';

        // Validar modalidades
        if (item.modality === 'ONLINE') {
          appointmentType = 'ONLINE';
        }

        // Si es Servicio o Paquete, asignamos la fecha elegida
        if (item.type === 'SERVICE' || item.type === 'PACKAGE') {
          if (selectedDate && selectedTime) {
            const [hours, minutes] = selectedTime.split(':');
            const startDateTime = new Date(selectedDate);
            startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            startTimeIso = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");
          } else {
             // Fallback de seguridad por si falla la UI
             startTimeIso = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
          }
        }

        return {
          catalogItemId: item.id,
          itemType: item.type || 'SERVICE', // SERVICE, PRODUCT, COURSE, PACKAGE
          quantity: item.quantity || 1,
          startTime: startTimeIso,
          appointmentType: appointmentType
        };
      });

      // 2. 📦 PASO 1: PREPARAR ORDEN EN BACKEND
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

      if (!preparedOrder) {
        throw new Error("No se pudo preparar la orden en el servidor.");
      }

      // 3. 💳 PASO 2: SOLICITAR LINK DE PAGO A STRIPE
      const paymentPayload = {
        appointmentIds: preparedOrder.createdAppointmentIds,
        orderId: preparedOrder.createdOrderId,
        providerId: providerId,
        totalAmount: preparedOrder.totalAmount,
        currency: preparedOrder.currency || "MXN"
      };

      const checkoutUrl = await paymentService.createHybridCheckout(paymentPayload);

      // 4. 🚀 REDIRECCIÓN FINAL
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No se pudo generar la sesión de pago de Stripe.");
      }

    } catch (error: any) {
      console.error("❌ Checkout Error:", error);

      const errorData = error.response?.data;

      if (errorData?.code === "VALIDATION_ERROR") {
        const validationMsgs = Object.values(errorData.errors).join(", ");
        return;
      } else if (error.response?.status === 401) {
        return;
      } else {
        const errorMsg = errorData?.message || error.message || "Error al procesar la reserva.";
        return;
      }

      setIsProcessing(false);
    }
  };

  return {
    processCheckout,
    isProcessing
  };
};