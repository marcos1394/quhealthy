import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PatientCareKitModal } from "@/components/consultation/PatientCareKitModal";
import { healthOSService, PatientCareKitResponse } from "@/services/healthOS.service";

// Mock del servicio de Health OS
vi.mock("@/services/healthOS.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/healthOS.service")>();
  return {
    ...actual,
    healthOSService: {
      ...actual.healthOSService,
      generatePatientCareKit: vi.fn(),
    },
  };
});

// Mock de react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock de navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
  },
});

const mockCareKit: PatientCareKitResponse = {
  id: "carekit-test-123",
  kitTitle: "Plan de Cuidado Personalizado — Faringitis Aguda",
  patientName: "Ana Gómez",
  doctorName: "Dr. Roberto Casas",
  medicalSpecialty: "Medicina Familiar",
  diagnosis: "J02.9 Faringitis aguda bacteriana",
  patientFriendlySummary: "Tienes una infección leve en la garganta. Con descanso y el antibiótico prescrito sanarás en 5 a 7 días.",
  keyCarePoints: [
    "Completar los 7 días de antibiótico a la hora indicada.",
    "Beber al menos 2 litros de agua tibia al día.",
  ],
  warningSigns: [
    "Dificultad para respirar o tragar saliva.",
    "Fiebre persistente mayor a 38.5°C por más de 48 horas.",
  ],
  recoveryGuide: {
    id: "guide-123",
    guideTitle: "Audio-Guía de Recuperación",
    patientName: "Ana Gómez",
    diagnosis: "Faringitis aguda bacteriana",
    fullScriptText: "Bienvenida a tu audio-guía de recuperación...",
    sections: [
      {
        id: "diagnostico",
        title: "Tu Diagnóstico en Palabras Simples",
        category: "DIAGNOSIS",
        summary: "Infección de garganta tratable con antibiótico.",
        spokenText: "Hola Ana, tienes faringitis aguda...",
        estimatedSeconds: 25,
      },
      {
        id: "medicamentos",
        title: "Cómo Tomar tus Medicamentos",
        category: "MEDICATIONS",
        summary: "Amoxicilina 500mg cada 8 horas.",
        spokenText: "Toma tu antibiótico puntual con alimentos...",
        estimatedSeconds: 30,
      },
    ],
    audioBase64: "UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
    format: "audio/wav",
    totalDurationSeconds: 55,
    createdAt: new Date().toISOString(),
  },
  infographic: {
    id: "info-123",
    title: "Cuidado de Vías Respiratorias Superiores",
    medicalTopic: "Faringitis Aguda",
    category: "ANATOMY",
    summary: "Guía anatómica de las amígdalas y medidas de alivio.",
    imageUrl: "https://images.unsplash.com/photo-500",
    aspectRatio: "16:9",
    keyPoints: ["Hidratación continua", "Gárgaras de agua tibia con sal"],
    disclaimer: "Ilustración médica generada para educación del paciente.",
    createdAt: new Date().toISOString(),
  },
  shareableWhatsAppText: "Hola Ana, te comparto tu plan de cuidado médico...",
  createdAt: new Date().toISOString(),
  status: "COMPLETED",
};

describe("PatientCareKitModal (Health OS Multimodal Patient Care Kit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders regulatory notice with stable data-testid='care-kit-regulatory-notice'", () => {
    render(
      <PatientCareKitModal
        isOpen={true}
        onClose={vi.fn()}
        patientName="Ana Gómez"
        doctorName="Dr. Roberto Casas"
        diagnosis="Faringitis aguda"
        plan="Amoxicilina 500mg cada 8h"
      />
    );

    const notice = screen.getByTestId("care-kit-regulatory-notice");
    expect(notice).toBeInTheDocument();
    expect(notice.textContent).toContain("Material Educativo y Terapéutico Personalizado para el Paciente");
  });

  it("renders pre-generation view with doctor's clinical input and generate button", () => {
    render(
      <PatientCareKitModal
        isOpen={true}
        onClose={vi.fn()}
        patientName="Ana Gómez"
        doctorName="Dr. Roberto Casas"
        medicalSpecialty="Medicina Familiar"
        diagnosis="Faringitis aguda bacteriana"
        plan="Amoxicilina 500mg cada 8h por 7 días"
      />
    );

    expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
    expect(screen.getByText("Faringitis aguda bacteriana")).toBeInTheDocument();
    expect(screen.getByTestId("generate-care-kit-btn")).toBeInTheDocument();
  });

  it("calls healthOSService.generatePatientCareKit and renders summary and tabs upon generation", async () => {
    vi.mocked(healthOSService.generatePatientCareKit).mockResolvedValueOnce(mockCareKit);

    render(
      <PatientCareKitModal
        isOpen={true}
        onClose={vi.fn()}
        patientName="Ana Gómez"
        doctorName="Dr. Roberto Casas"
        diagnosis="Faringitis aguda bacteriana"
        plan="Amoxicilina 500mg cada 8h por 7 días"
      />
    );

    const generateBtn = screen.getByTestId("generate-care-kit-btn");
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(healthOSService.generatePatientCareKit).toHaveBeenCalledWith(
        expect.objectContaining({
          patientName: "Ana Gómez",
          diagnosis: "Faringitis aguda bacteriana",
          includeAudioGuide: true,
          includeInfographic: true,
        })
      );
    });

    expect(await screen.findByText("Plan de Cuidado Personalizado — Faringitis Aguda")).toBeInTheDocument();
    expect(screen.getByTestId("care-kit-warning-signs")).toBeInTheDocument();
    expect(screen.getByText("Dificultad para respirar o tragar saliva.")).toBeInTheDocument();
  });

  it("allows copying WhatsApp formatted text to clipboard", async () => {
    render(
      <PatientCareKitModal
        isOpen={true}
        onClose={vi.fn()}
        initialCareKit={mockCareKit}
        initialTab="whatsapp"
      />
    );

    const copyBtn = screen.getByTestId("care-kit-copy-wa-btn");
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockCareKit.shareableWhatsAppText);
  });
});
