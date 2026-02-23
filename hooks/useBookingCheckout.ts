// hooks/useBookingCheckout.ts
import { useState } from 'react';
import { appointmentService } from '@/services/appointment.service';
import { paymentService } from '@/services/payment.service'; // 🚀 Ahora sí existe
import { CheckoutParams, CreateAppointmentRequest } from '@/types/booking';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

export const useBookingCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processCheckout = async ({ providerId, selectedDate, selectedTime, cart }: CheckoutParams) => {
    setIsProcessing(true);

    try {
      // 1. Preparar el LocalDateTime para Java (YYYY-MM-DDTHH:mm:ss)
      const [hours, minutes] = selectedTime.split(':');
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const startTimeIso = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");

      // 2. Extraer IDs según el tipo
      const serviceIds = cart
        .filter(item => item.type === 'SERVICE')
        .map(item => item.id);
      
      const packageIds = cart
        .filter(item => item.type === 'PACKAGE')
        .map(item => item.id);

      // 3. Crear la Cita (Estado: PENDING_PAYMENT)
      const payload: CreateAppointmentRequest = {
        providerId,
        startTime: startTimeIso,
        serviceIds,
        packageIds,
        notes: "Agendado vía QuHealthy Storefront"
      };

      const appointment = await appointmentService.createAppointment(payload);

      if (!appointment?.id) {
        throw new Error("No se pudo obtener el ID de la cita generada.");
      }

      // 4. Solicitar URL de pago a Stripe vía Payment Service
      const checkoutUrl = await paymentService.createCheckoutSession(appointment.id);

      if (checkoutUrl) {
        // 5. Redirección final a la pasarela de Stripe
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Stripe no devolvió una URL de pago válida.");
      }

    } catch (error: any) {
      console.error("❌ Checkout Error:", error);
      
      const status = error.response?.status;
      
      if (status === 401) {
        toast.error("Tu sesión ha expirado o no has iniciado sesión.", { theme: 'dark' });
      } else {
        const errorMsg = error.response?.data?.message || "Error al procesar la reserva. Intenta de nuevo.";
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