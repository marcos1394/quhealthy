import type { Metadata } from "next";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const isEnglish = locale === "en";
  const siteUrl = "https://www.quhealthy.org";

  const title = isEnglish ? `Healthcare Foundation & Social Impact #${id}` : `Fundación y Programa de Salud Social #${id}`;
  const description = isEnglish
    ? "Learn about this healthcare foundation, medical subsidy programs, community health campaigns, and medical support on QuHealthy."
    : "Conoce los programas de apoyo médico, subsidios de salud y campañas de impacto social de esta fundación en QuHealthy.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/foundation/${id}`,
      languages: {
        es: `${siteUrl}/es/foundation/${id}`,
        en: `${siteUrl}/en/foundation/${id}`,
        "x-default": `${siteUrl}/es/foundation/${id}`,
      },
    },
  };
}

export default function SingleFoundationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
