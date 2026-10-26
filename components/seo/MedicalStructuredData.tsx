import React from "react";

export interface MedicalBusinessSchemaProps {
  type?: "MedicalClinic" | "MedicalBusiness" | "Physician";
  name: string;
  description?: string;
  url?: string;
  telephone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  medicalSpecialty?: string[];
  priceRange?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqPageSchemaProps {
  items: FaqItem[];
}

export const MedicalStructuredData: React.FC<MedicalBusinessSchemaProps> = ({
  type = "MedicalClinic",
  name,
  description,
  url = "https://www.quhealthy.org",
  telephone,
  address,
  medicalSpecialty,
  priceRange,
}) => {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": type,
    name,
    url,
    description: description || "Plataforma digital de salud integral y expediente clínico conforme a normas mexicanas.",
  };

  if (priceRange) {
    schema.priceRange = priceRange;
  }

  if (telephone) {
    schema.telephone = telephone;
  }

  if (address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: address.streetAddress || "",
      addressLocality: address.addressLocality || "Ciudad de México",
      addressRegion: address.addressRegion || "CDMX",
      postalCode: address.postalCode || "",
      addressCountry: address.addressCountry || "MX",
    };
  }

  if (medicalSpecialty && medicalSpecialty.length > 0) {
    schema.medicalSpecialty = medicalSpecialty;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const FaqStructuredData: React.FC<FaqPageSchemaProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
