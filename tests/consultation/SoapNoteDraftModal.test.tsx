import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SoapNoteDraftModal } from "@/components/consultation/SoapNoteDraftModal";
import { SoapNotes } from "@/types/ehr";

const mockInitialSoap: SoapNotes = {
  subjective: "Paciente refiere cefalea de 3 días de evolución.",
  objective: "TA 120/80 mmHg, FC 72 lpm, afebril.",
  assessment: "Cefalea tensional probable.",
  plan: "Paracetamol 500mg cada 8 horas por 3 días.",
};

describe("SoapNoteDraftModal (AI-COPILOT-01 / NOM-004-SSA3-2012 / NOM-024-SSA3-2012)", () => {
  it("renders regulatory banner with stable data-testid='ai-soap-suggestion-banner'", () => {
    render(
      <SoapNoteDraftModal
        isOpen={true}
        onClose={vi.fn()}
        draftSoap={mockInitialSoap}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />
    );

    const banner = screen.getByTestId("ai-soap-suggestion-banner");
    expect(banner).toBeInTheDocument();
    expect(banner.textContent).toContain("NOM-004-SSA3-2012 / NOM-024-SSA3-2012");
    expect(banner.textContent).toContain("Sugerencia de Copiloto IA");
  });

  it("populates inputs with the initial draft values", () => {
    render(
      <SoapNoteDraftModal
        isOpen={true}
        onClose={vi.fn()}
        draftSoap={mockInitialSoap}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByTestId("soap-subjective-input")).toHaveValue(mockInitialSoap.subjective);
    expect(screen.getByTestId("soap-objective-input")).toHaveValue(mockInitialSoap.objective);
    expect(screen.getByTestId("soap-assessment-input")).toHaveValue(mockInitialSoap.assessment);
    expect(screen.getByTestId("soap-plan-input")).toHaveValue(mockInitialSoap.plan);
  });

  it("calls onAccept with edited values when doctor confirms", () => {
    const onAccept = vi.fn();
    const onClose = vi.fn();

    render(
      <SoapNoteDraftModal
        isOpen={true}
        onClose={onClose}
        draftSoap={mockInitialSoap}
        onAccept={onAccept}
        onReject={vi.fn()}
      />
    );

    const subjectiveInput = screen.getByTestId("soap-subjective-input");
    fireEvent.change(subjectiveInput, {
      target: { value: "Paciente refiere cefalea leve y fatiga visual." },
    });

    const acceptBtn = screen.getByTestId("ai-soap-accept-btn");
    fireEvent.click(acceptBtn);

    expect(onAccept).toHaveBeenCalledWith(
      expect.objectContaining({
        subjective: "Paciente refiere cefalea leve y fatiga visual.",
        objective: mockInitialSoap.objective,
        assessment: mockInitialSoap.assessment,
        plan: mockInitialSoap.plan,
      })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onReject and onClose when doctor discards the draft", () => {
    const onReject = vi.fn();
    const onClose = vi.fn();

    render(
      <SoapNoteDraftModal
        isOpen={true}
        onClose={onClose}
        draftSoap={mockInitialSoap}
        onAccept={vi.fn()}
        onReject={onReject}
      />
    );

    const rejectBtn = screen.getByTestId("ai-soap-reject-btn");
    fireEvent.click(rejectBtn);

    expect(onReject).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
