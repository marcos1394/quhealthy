import type { Metadata } from "next";
import React from "react";

const academyMeta = {
  es: {
    title: "Academia Médica y Capacitación en Salud",
    description:
      "Cursos médicos certificados, educación continua para profesionales de la salud y pacientes. Aprende sobre nutrición, medicina digital y gestión clínica en QuHealthy.",
    ogTitle: "Academia Digital de Salud y Medicina | QuHealthy",
    ogDescription:
      "Cursos médicos certificados, educación continua en salud y bienestar.",
  },
  en: {
    title: "Medical Academy & Health Courses",
    description:
      "Certified medical courses and continuous education for healthcare professionals and patients. Master digital health and clinical management on QuHealthy.",
    ogTitle: "Digital Medical Academy & Health Courses | QuHealthy",
    ogDescription:
      "Certified health courses, wellness masterclasses, and medical training.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const content = academyMeta[isEnglish ? "en" : "es"];
  const siteUrl = "https://www.quhealthy.org";

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: `${siteUrl}/${locale}/academy`,
      siteName: "QuHealthy",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "QuHealthy Academy",
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
      canonical: `${siteUrl}/${locale}/academy`,
      languages: {
        es: `${siteUrl}/es/academy`,
        en: `${siteUrl}/en/academy`,
        "x-default": `${siteUrl}/es/academy`,
      },
    },
  };
}

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
