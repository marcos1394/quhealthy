import type { Metadata } from "next";
import React from "react";

const discoverMeta = {
  es: {
    title: "Descubre Especialistas",
    description:
      "Explora el mapa de doctores y especialistas de salud, belleza y bienestar cerca de ti. Compara ratings, precios y agenda tu cita en QuHealthy.",
    ogTitle: "Descubre Doctores y Especialistas | QuHealthy",
    ogDescription:
      "Encuentra los mejores profesionales de salud en tu zona. Mapa interactivo, filtros y reservas en un solo lugar.",
  },
  en: {
    title: "Discover Specialists",
    description:
      "Explore the map of doctors and health, beauty, and wellness specialists near you. Compare ratings, prices, and book on QuHealthy.",
    ogTitle: "Discover Doctors & Specialists | QuHealthy",
    ogDescription:
      "Find top health professionals in your area. Interactive map, filters, and booking in one place.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const lang = (locale === "en" ? "en" : "es") as keyof typeof discoverMeta;
  const content = discoverMeta[lang];
  const siteUrl = "https://www.quhealthy.org";

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: `${siteUrl}/${lang}/discover`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.ogTitle,
      description: content.ogDescription,
    },
    alternates: {
      canonical: `${siteUrl}/${lang}/discover`,
      languages: {
        es: `${siteUrl}/es/discover`,
        en: `${siteUrl}/en/discover`,
      },
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
