import type { Metadata } from "next";
import React from "react";

const aboutMeta = {
  es: {
    title: "Sobre Nosotros: Ecosistema de Salud y Bienestar",
    description:
      "Conoce la misión y visión de QuHealthy. Construimos el ecosistema inteligente de salud digital más seguro, confiable e innovador en México y Latinoamérica.",
    ogTitle: "Sobre QuHealthy | Innovación y Confianza en Salud",
    ogDescription:
      "Misión, visión e impacto de QuHealthy: transformando la atención médica con tecnología.",
  },
  en: {
    title: "About Us: Digital Health & Wellness Ecosystem",
    description:
      "Discover the mission and vision of QuHealthy. We build the most secure, reliable, and intelligent digital healthcare platform across Latin America.",
    ogTitle: "About QuHealthy | Healthcare Innovation & Trust",
    ogDescription:
      "Mission, vision, and team behind QuHealthy digital healthcare ecosystem.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const content = aboutMeta[isEnglish ? "en" : "es"];
  const siteUrl = "https://www.quhealthy.org";

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: `${siteUrl}/${locale}/about`,
      siteName: "QuHealthy",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Sobre QuHealthy",
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
      canonical: `${siteUrl}/${locale}/about`,
      languages: {
        es: `${siteUrl}/es/about`,
        en: `${siteUrl}/en/about`,
        "x-default": `${siteUrl}/es/about`,
      },
    },
  };
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
