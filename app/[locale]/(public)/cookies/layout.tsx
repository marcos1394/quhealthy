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

  const title = isEnglish ? "Cookie Policy" : "Política de Cookies";
  const description = isEnglish
    ? "Information on how QuHealthy uses cookies and tracking technologies to ensure optimal performance and security."
    : "Información sobre el uso de cookies y tecnologías de navegación en QuHealthy para garantizar rendimiento y seguridad.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/cookies`,
      languages: {
        es: `${siteUrl}/es/cookies`,
        en: `${siteUrl}/en/cookies`,
        "x-default": `${siteUrl}/es/cookies`,
      },
    },
  };
}

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
