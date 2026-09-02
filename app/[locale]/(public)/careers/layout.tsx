import type { Metadata } from "next";
import React from "react";

const careersMeta = {
  es: {
    title: "Únete a Nuestro Equipo: Empleo y Carreras",
    description:
      "Construye el futuro de la salud digital con nosotros. Conoce las vacantes y oportunidades laborales en ingeniería, producto, salud y operaciones en QuHealthy.",
    ogTitle: "Carreras y Empleo en Salud Digital | QuHealthy",
    ogDescription:
      "Oportunidades de trabajo y vacantes en QuHealthy.",
  },
  en: {
    title: "Careers & Jobs in Digital Health",
    description:
      "Build the future of digital healthcare with us. Explore open positions in software engineering, medical product design, and healthcare operations at QuHealthy.",
    ogTitle: "Careers & Jobs in Digital Health | QuHealthy",
    ogDescription:
      "Join the QuHealthy team. View our open positions and career opportunities.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const content = careersMeta[isEnglish ? "en" : "es"];
  const siteUrl = "https://www.quhealthy.org";

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: `${siteUrl}/${locale}/careers`,
      siteName: "QuHealthy",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Carreras en QuHealthy",
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
      canonical: `${siteUrl}/${locale}/careers`,
      languages: {
        es: `${siteUrl}/es/careers`,
        en: `${siteUrl}/en/careers`,
        "x-default": `${siteUrl}/es/careers`,
      },
    },
  };
}

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
