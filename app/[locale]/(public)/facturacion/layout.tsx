import type { Metadata } from "next";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const siteUrl = "https://www.quhealthy.org";

  const title = isEnglish ? "Invoice & CFDI 4.0 Portal" : "Portal de Facturación Electrónica CFDI 4.0";
  const description = isEnglish
    ? "Generate, download, and manage your electronic tax invoices (CFDI 4.0) for medical and healthcare consultations on QuHealthy."
    : "Genera, descarga y gestiona tus comprobantes fiscales digitales (CFDI 4.0) de tus consultas y servicios médicos en QuHealthy.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/facturacion`,
      languages: {
        es: `${siteUrl}/es/facturacion`,
        en: `${siteUrl}/en/facturacion`,
        "x-default": `${siteUrl}/es/facturacion`,
      },
    },
  };
}

export default function FacturacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
