import type { Metadata } from "next";
import React from "react";

const suppliersMeta = {
  es: {
    title: "Proveedores de Insumos y Equipos Médicos",
    description:
      "Directorio de distribuidores y proveedores de equipo médico, medicamentos, cadena de frío y consumibles para consultorios y clínicas en QuHealthy.",
    ogTitle: "Proveedores de Equipo Médico y Farmacéutico | QuHealthy",
    ogDescription:
      "Directorio B2B de proveedores de insumos médicos y equipamiento clínico.",
  },
  en: {
    title: "Medical Equipment & Pharmaceutical Suppliers",
    description:
      "Directory of certified medical equipment suppliers, pharmaceutical cold-chain distributors, and clinical supplies on QuHealthy.",
    ogTitle: "Medical Equipment & Healthcare Suppliers | QuHealthy",
    ogDescription:
      "B2B directory of medical supplies and certified clinic equipment.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const content = suppliersMeta[isEnglish ? "en" : "es"];
  const siteUrl = "https://www.quhealthy.org";

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: `${siteUrl}/${locale}/suppliers`,
      siteName: "QuHealthy",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "QuHealthy Suppliers",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.ogTitle,
      description: content.ogDescription,
      images: [`${siteUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/suppliers`,
      languages: {
        es: `${siteUrl}/es/suppliers`,
        en: `${siteUrl}/en/suppliers`,
        "x-default": `${siteUrl}/es/suppliers`,
      },
    },
  };
}

export default function SuppliersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
