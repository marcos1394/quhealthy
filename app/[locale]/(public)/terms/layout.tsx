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

  const title = isEnglish ? "Terms of Service" : "Términos y Condiciones";
  const description = isEnglish
    ? "Review the terms and conditions for using the QuHealthy medical platform, telemedicine services, and marketplace."
    : "Consulta los términos y condiciones de uso de la plataforma médica, telemedicina y marketplace de QuHealthy.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/terms`,
      languages: {
        es: `${siteUrl}/es/terms`,
        en: `${siteUrl}/en/terms`,
        "x-default": `${siteUrl}/es/terms`,
      },
    },
  };
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
