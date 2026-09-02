import type { Metadata } from "next";
import React from "react";

const foundationsMeta = {
  es: {
    title: "Fundaciones y Programas de Apoyo a la Salud",
    description:
      "Descubre fundaciones y programas de impacto social para la salud en México. Subsidios médicos, campañas preventivas y atención accesible con QuHealthy.",
    ogTitle: "Fundaciones y Programas de Salud Social | QuHealthy",
    ogDescription:
      "Apoyo y programas de salud comunitaria, subsidios médicos y atención accesible.",
  },
  en: {
    title: "Health Foundations & Community Programs",
    description:
      "Discover healthcare foundations and social impact health programs. Medical subsidies, health campaigns, and accessible care with QuHealthy.",
    ogTitle: "Health Foundations & Social Healthcare | QuHealthy",
    ogDescription:
      "Community healthcare programs, medical assistance, and wellness subsidies.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const content = foundationsMeta[isEnglish ? "en" : "es"];
  const siteUrl = "https://www.quhealthy.org";

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: `${siteUrl}/${locale}/foundations`,
      siteName: "QuHealthy",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "QuHealthy Foundations",
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
      canonical: `${siteUrl}/${locale}/foundations`,
      languages: {
        es: `${siteUrl}/es/foundations`,
        en: `${siteUrl}/en/foundations`,
        "x-default": `${siteUrl}/es/foundations`,
      },
    },
  };
}

export default function FoundationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
