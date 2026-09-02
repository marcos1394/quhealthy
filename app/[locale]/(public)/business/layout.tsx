import type { Metadata } from "next";
import React from "react";

const businessMeta = {
  es: {
    title: "Salud y Bienestar Corporativo para Empresas",
    description:
      "Plataforma de salud y bienestar integral para empresas. Chequeos médicos preventivos, telemedicina y beneficios de salud para tus colaboradores en QuHealthy.",
    ogTitle: "Salud y Bienestar Corporativo | QuHealthy Empresas",
    ogDescription:
      "Programas de salud y bienestar corporativo para empresas y colaboradores.",
  },
  en: {
    title: "Corporate Healthcare & Employee Wellness",
    description:
      "Comprehensive healthcare and wellness solutions for businesses. Preventive health checkups, telemedicine, and health benefits for teams on QuHealthy.",
    ogTitle: "Corporate Healthcare & Wellness | QuHealthy Business",
    ogDescription:
      "Corporate wellness programs and telemedicine for modern businesses.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const content = businessMeta[isEnglish ? "en" : "es"];
  const siteUrl = "https://www.quhealthy.org";

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: `${siteUrl}/${locale}/business`,
      siteName: "QuHealthy",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "QuHealthy Empresas",
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
      canonical: `${siteUrl}/${locale}/business`,
      languages: {
        es: `${siteUrl}/es/business`,
        en: `${siteUrl}/en/business`,
        "x-default": `${siteUrl}/es/business`,
      },
    },
  };
}

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
