import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { ServiceCheckoutModal } from "@/components/booking/ServiceCheckoutModal";
import { AppointmentFinancesCard } from "@/components/appointments/details/AppointmentFinancesCard";
import { AppointmentSummary } from "@/components/booking/success/AppointmentSummary";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => {
    return (key: string, params?: Record<string, any>) => {
      if (ns === "AppointmentConfirmation") {
        if (key === "cash_payment_pending_notice") return "Pago pendiente en efectivo en consultorio";
        if (key === "status_pay_in_clinic") return "Pago en Consultorio";
        if (key === "status_approved") return "Pago confirmado y aprobado";
        if (key === "label_price") return "Monto total pagado";
        if (key === "label_provider") return "Especialista a cargo";
        if (key === "label_service") return "Servicio o procedimiento";
        if (key === "label_date") return "Fecha y horario";
        if (key === "label_location") return "Lugar de atención";
      }
      if (ns === "AppointmentDetails.finances") {
        if (key === "title") return "Resumen de Pago";
        if (key === "final_amount") return "Importe Total";
        if (key === "status_unpaid") return "Estado: Pendiente de Pago";
        if (key === "pay_now") return "Pagar Ahora";
        if (key === "download_receipt") return "Descargar Comprobante";
      }
      return key;
    };
  },
}));

describe("Cash Payment Booking Flow (Pago en Consultorio)", () => {
  it("allows selecting 'Pago en consultorio (Efectivo)' in ServiceCheckoutModal and triggers onProcessCheckout with CASH", () => {
    const handleProcessCheckout = vi.fn();
    const handleClose = vi.fn();

    render(
      <ServiceCheckoutModal
        isOpen={true}
        onClose={handleClose}
        onProcessCheckout={handleProcessCheckout}
        isProcessing={false}
        totalAmount={800}
      />
    );

    expect(screen.getByText("Pago en consultorio (Efectivo)")).toBeDefined();

    // Click on Cash payment button
    const cashOption = screen.getByText("Pago en consultorio (Efectivo)").closest("button");
    expect(cashOption).not.toBeNull();
    fireEvent.click(cashOption!);

    // Button label updates to confirm cash appointment
    const confirmBtn = screen.getByText("Confirmar Cita (Pagar en Consultorio)");
    expect(confirmBtn).toBeDefined();

    // Confirm checkout
    fireEvent.click(confirmBtn);
    expect(handleProcessCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethod: "CASH",
      })
    );
  });

  it("displays cash collection banner in AppointmentFinancesCard when appointment was booked with CASH", () => {
    const handleDownload = vi.fn();
    const handlePayNow = vi.fn();

    render(
      <AppointmentFinancesCard
        totalPrice={800}
        currency="MXN"
        paymentStatus="PENDING"
        paymentMethod="CASH"
        downloadInvoice={handleDownload}
        isDownloading={false}
        handlePayNow={handlePayNow}
        isProcessingPayment={false}
      />
    );

    expect(
      screen.getByText("Pago en consultorio (Efectivo) · A liquidar en recepción")
    ).toBeDefined();
    expect(screen.getByText("Pagar en línea ahora (Opcional)")).toBeDefined();
  });

  it("renders 'Pago en Consultorio' badge in AppointmentSummary when appointment has paymentMethod CASH", () => {
    const mockAppt = {
      id: 101,
      providerNameSnapshot: "Dr. Luis R. Morales Cota",
      serviceNameSnapshot: "Consulta de Angiología y Cirugía Vascular",
      startTime: "2026-11-10T10:00:00",
      type: "IN_PERSON",
      locationAddress: "Av. Universidad 120, Consultorio 304",
      totalPrice: 800,
      currency: "MXN",
      paymentMethod: "CASH",
      paymentStatus: "PENDING",
    };

    render(
      <AppointmentSummary
        appointment={mockAppt}
        formattedDateTime="Martes 10 de Noviembre, 10:00 hrs"
      />
    );

    expect(screen.getByText("Pago en Consultorio")).toBeDefined();
    expect(screen.getByText("Pago pendiente en efectivo en consultorio")).toBeDefined();
  });
});
