// hooks/useBookingCheckout.ts
import { useState } from 'react';
import { appointmentService } from '@/services/appointment.service';
import { paymentService } from '@/services/payment.service';
import { CheckoutParams, CreateAppointmentRequest } from '@/types/booking';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

export const useBookingCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processCheckout = async ({ 
    providerId, 
    consumerId, 
    selectedDate, 
    selectedTime, 
    cart, 
    consumerSymptoms // 🚀 Recibimos el texto desde el componente
  }: CheckoutParams) => {
    setIsProcessing(true);

    try {
      // 1. Preparar el LocalDateTime para Java (YYYY-MM-DDTHH:mm:ss)
      const [hours, minutes] = selectedTime.split(':');
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const startTimeIso = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");

      // 2. Validación de seguridad del carrito
      if (cart.length === 0) {
        throw new Error("El carrito está vacío.");
      }

      // 3. Mapeo al DTO de Java
      const mainItem = cart[0];

      const payload: CreateAppointmentRequest = {
        providerId,
        consumerId, // 🚀 ESCENARIO 2: Si el doctor agenda, aquí va el ID del paciente. Si no, va undefined.
        serviceId: mainItem.id, 
        startTime: startTimeIso,
        appointmentType: 'ONLINE', 
        paymentMethod: 'CREDIT_CARD', 
        // 🚀 NUEVO: Usamos el motivo ingresado por el paciente. Si viene vacío/undefined, aplicamos el texto por defecto.
        consumerSymptoms: consumerSymptoms || `Reserva realizada desde la tienda. Ítems totales: ${cart.length}`
      };

      // 4. Crear la Cita (Estado inicial: PENDING_PAYMENT)
      const appointment = await appointmentService.createAppointment(payload);

      if (!appointment?.id) {
        throw new Error("El servidor no devolvió un ID de cita válido.");
      }

      // 5. Solicitar URL de pago a Stripe
      const checkoutUrl = await paymentService.createCheckoutSession(appointment.id);

      if (checkoutUrl) {
        // 6. Redirección final al checkout seguro de Stripe
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No se pudo generar la sesión de pago de Stripe.");
      }

    } catch (error: any) {
      console.error("❌ Checkout Error:", error);
      
      const errorData = error.response?.data;
      
      if (errorData?.code === "VALIDATION_ERROR") {
        const validationMsgs = Object.values(errorData.errors).join(", ");
        toast.error(`Datos inválidos: ${validationMsgs}`, { theme: 'dark' });
      } else if (error.response?.status === 401) {
        toast.error("Debes iniciar sesión para completar la reserva.", { theme: 'dark' });
      } else {
        const errorMsg = errorData?.message || error.message || "Error al procesar la reserva.";
        toast.error(errorMsg, { theme: 'dark' });
      }
      
      setIsProcessing(false); 
    }
  };

  return {
    processCheckout,
    isProcessing
  };
};