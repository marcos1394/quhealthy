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

  const title = isEnglish ? "Refund & Cancellation Policy" : "Política de Cancelación y Reembolsos";
  const description = isEnglish
    ? "Learn about appointment cancellations, refund processes, and purchase guarantees for medical services on QuHealthy."
    : "Conoce las políticas de cancelación de citas médicas, devoluciones de marketplace y garantías de servicio en QuHealthy.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/returns`,
      languages: {
        es: `${siteUrl}/es/returns`,
        en: `${siteUrl}/en/returns`,
        "x-default": `${siteUrl}/es/returns`,
      },
    },
  };
}

export default function ReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
