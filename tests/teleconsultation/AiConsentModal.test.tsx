import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AiConsentModal } from "@/components/teleconsultation/AiConsentModal";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: any) => {
    if (key === "consent_version") return "1.0-e2e";
    return params?.defaultValue || key;
  },
  useLocale: () => "es",
}));

describe("AiConsentModal (HU-EHR-024 / ENG-EHR-024-UI)", () => {
  it("renders with stable data-testid='consent-modal' and action buttons", () => {
    const onSubmit = vi.fn();
    render(<AiConsentModal onSubmit={onSubmit} />);

    const modal = screen.getByTestId("consent-modal");
    expect(modal).toBeInTheDocument();

    const submitBtn = screen.getByTestId("consent-submit-btn");
    expect(submitBtn).toBeInTheDocument();
  });

  it("renders all consent checkboxes with data-testid='consent-accept-checkbox'", () => {
    render(<AiConsentModal onSubmit={vi.fn()} />);

    const checkboxes = screen.getAllByTestId("consent-accept-checkbox");
    expect(checkboxes.length).toBe(3);
    checkboxes.forEach((cb) => {
      expect(cb).not.toBeChecked();
    });
  });

  it("submits accepted consent preferences when checkboxes are clicked", () => {
    const onSubmit = vi.fn();
    render(<AiConsentModal onSubmit={onSubmit} />);

    const labels = screen.getAllByRole("checkbox", { hidden: true });
    expect(labels.length).toBe(3);

    // Toggle audio and clinical note consent
    const audioLabel = screen.getByText("audio_title").closest("label");
    const clinicalNoteLabel = screen.getByText("clinical_note_title").closest("label");

    expect(audioLabel).not.toBeNull();
    expect(clinicalNoteLabel).not.toBeNull();

    fireEvent.click(audioLabel!);
    fireEvent.click(clinicalNoteLabel!);

    const submitBtn = screen.getByTestId("consent-submit-btn");
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      audioProcessingAccepted: true,
      clinicalNoteAccepted: true,
      dataStorageAccepted: false,
      consentVersion: "1.0-e2e",
    });
  });
});
