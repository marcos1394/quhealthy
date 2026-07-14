import type { Metadata } from "next";
import React from "react";

const discoverMeta = {
  es: {
    title: "Descubre Especialistas | QuHealthy",
    description:
      "Explora profesionales de salud, belleza y bienestar cerca de ti. Compara valoraciones, precios y agenda tu cita de forma rápida y segura en QuHealthy.",
    ogTitle: "Descubre los Mejores Especialistas de Bienestar | QuHealthy",
    ogDescription:
      "Encuentra profesionales de salud y bienestar en tu zona con mapa interactivo, filtros avanzados y reservas en un solo lugar.",
  },
  en: {
    title: "Discover Specialists | QuHealthy",
    description:
      "Explore health, beauty, and wellness specialists near you. Compare ratings, prices, and book appointments easily on QuHealthy.",
    ogTitle: "Discover Top Wellness Specialists | QuHealthy",
    ogDescription:
      "Find health and wellness professionals in your area with an interactive map, smart filters, and instant booking.",
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
  const siteUrl = "https://quhealthy.org"; // ← Sin www (recomendado)

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