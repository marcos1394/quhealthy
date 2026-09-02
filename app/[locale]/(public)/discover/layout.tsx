import type { Metadata } from "next";
import React from "react";

const discoverMeta = {
  es: {
    title: "Directorio Médico y Clínicas",
    description:
      "Encuentra especialistas de salud certificados, clínicas y servicios médicos cerca de ti. Compara precios, opiniones reales y agenda tu cita online.",
    ogTitle: "Directorio de Especialistas y Clínicas de Salud | QuHealthy",
    ogDescription:
      "Encuentra especialistas de salud certificados, clínicas y servicios médicos con mapa interactivo y agenda online.",
  },
  en: {
    title: "Find Doctors and Medical Clinics",
    description:
      "Explore certified healthcare specialists and clinics near you. Compare ratings, prices, and book instant medical appointments online.",
    ogTitle: "Find Certified Doctors and Medical Clinics | QuHealthy",
    ogDescription:
      "Explore certified healthcare specialists and clinics with smart filters and instant appointment booking.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const content = discoverMeta[isEnglish ? "en" : "es"];
  const siteUrl = "https://www.quhealthy.org";

  return {
    metadataBase: new URL(siteUrl),
    title: content.title,
    description: content.description,

    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: `${siteUrl}/${locale}/discover`,
      siteName: "QuHealthy",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: isEnglish
            ? "Discover wellness specialists on QuHealthy"
            : "Descubre especialistas de bienestar en QuHealthy",
        },
      ],
      locale: isEnglish ? "en_US" : "es_MX",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: content.ogTitle,
      description: content.ogDescription,
      images: [`${siteUrl}/og-image.png`],
    },

    alternates: {
      canonical: `${siteUrl}/${locale}/discover`,
      languages: {
        es: `${siteUrl}/es/discover`,
        en: `${siteUrl}/en/discover`,
        "x-default": `${siteUrl}/es/discover`,
      },
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function DiscoverPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-full w-full overflow-hidden">{children}</div>;
}
