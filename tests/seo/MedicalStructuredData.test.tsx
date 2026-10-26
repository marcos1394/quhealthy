import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  MedicalStructuredData,
  FaqStructuredData,
} from "@/components/seo/MedicalStructuredData";

describe("MedicalStructuredData (MKT-SEO-01)", () => {
  it("renders valid Schema.org MedicalClinic JSON-LD", () => {
    const { container } = render(
      <MedicalStructuredData
        name="QuHealthy Clínica Virtual"
        description="Ecosistema de salud digital y expediente médico"
        medicalSpecialty={["Cardiology", "Dermatology"]}
        priceRange="$$"
      />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const json = JSON.parse(script!.textContent || "{}");
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("MedicalClinic");
    expect(json.name).toBe("QuHealthy Clínica Virtual");
    expect(json.medicalSpecialty).toEqual(["Cardiology", "Dermatology"]);
    expect(json.priceRange).toBe("$$");
  });

  it("renders valid Schema.org FAQPage JSON-LD", () => {
    const faqs = [
      {
        question: "¿Cómo valida QuHealthy la cédula profesional de los médicos?",
        answer: "A través del cotejo directo ante el Registro Nacional de Profesionistas (SEP/DGP).",
      },
      {
        question: "¿El expediente clínico cumple con la NOM-004-SSA3-2012?",
        answer: "Sí, cuenta con controles de trazabilidad, integridad, autor y bitácora de consentimiento.",
      },
    ];

    const { container } = render(<FaqStructuredData items={faqs} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const json = JSON.parse(script!.textContent || "{}");
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("FAQPage");
    expect(json.mainEntity.length).toBe(2);
    expect(json.mainEntity[0].name).toBe("¿Cómo valida QuHealthy la cédula profesional de los médicos?");
    expect(json.mainEntity[0].acceptedAnswer.text).toContain("SEP/DGP");
  });
});
