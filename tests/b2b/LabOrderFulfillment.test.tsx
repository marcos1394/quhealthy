import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  LabOrderFulfillmentCard,
  B2BLabOrder,
} from "@/components/b2b/LabOrderFulfillmentCard";

describe("COM-B2B-ORDERS-01: LabOrderFulfillmentCard", () => {
  const baseOrder: B2BLabOrder = {
    id: 101,
    folio: "LAB-2026-0891",
    patientName: "Ana Sofia Morales",
    referringPhysician: "Dra. Valentina Ruiz (Endocrinología)",
    studyName: "Perfil Tiroideo Completo (TSH, T3, T4 Libre)",
    serviceType: "BRANCH_SAMPLE",
    status: "ORDERED",
    createdAt: "2026-10-27T10:00:00Z",
    resultsPdfUrl: "https://storage.quhealthy.org/labs/results-101.pdf",
  };

  it("renders order details and initial ORDERED status badge", () => {
    render(<LabOrderFulfillmentCard order={baseOrder} />);

    expect(screen.getByText("Folio: LAB-2026-0891")).toBeInTheDocument();
    expect(screen.getByText("Ana Sofia Morales")).toBeInTheDocument();
    expect(screen.getByText("Dra. Valentina Ruiz (Endocrinología)")).toBeInTheDocument();
    expect(screen.getByText("Perfil Tiroideo Completo (TSH, T3, T4 Libre)")).toBeInTheDocument();

    const badge = screen.getByTestId("b2b-lab-order-status-badge");
    expect(badge).toHaveTextContent("ORDERED");
  });

  it("advances status from ORDERED to SAMPLE_COLLECTED on button click", async () => {
    const handleUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <LabOrderFulfillmentCard order={baseOrder} onUpdateStatus={handleUpdate} />
    );

    const advanceBtn = screen.getByTestId("advance-order-status-btn");
    expect(advanceBtn).toHaveTextContent("Marcar Muestra Recolectada");

    fireEvent.click(advanceBtn);

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalledWith(101, "SAMPLE_COLLECTED");
    });

    const badge = screen.getByTestId("b2b-lab-order-status-badge");
    expect(badge).toHaveTextContent("SAMPLE_COLLECTED");
  });

  it("advances status from SAMPLE_COLLECTED to RESULTS_READY and shows download link", async () => {
    const sampleCollectedOrder: B2BLabOrder = {
      ...baseOrder,
      status: "SAMPLE_COLLECTED",
    };

    const handleUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <LabOrderFulfillmentCard
        order={sampleCollectedOrder}
        onUpdateStatus={handleUpdate}
      />
    );

    const badge = screen.getByTestId("b2b-lab-order-status-badge");
    expect(badge).toHaveTextContent("SAMPLE_COLLECTED");

    const advanceBtn = screen.getByTestId("advance-order-status-btn");
    expect(advanceBtn).toHaveTextContent("Liberar Resultados QFB");

    fireEvent.click(advanceBtn);

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalledWith(101, "RESULTS_READY");
    });

    expect(screen.getByTestId("b2b-lab-order-status-badge")).toHaveTextContent("RESULTS_READY");
    expect(screen.getByTestId("download-results-btn")).toBeInTheDocument();
  });

  it("respects isReadOnly prop and does not render advance button", () => {
    render(<LabOrderFulfillmentCard order={baseOrder} isReadOnly={true} />);

    expect(screen.queryByTestId("advance-order-status-btn")).not.toBeInTheDocument();
  });
});
