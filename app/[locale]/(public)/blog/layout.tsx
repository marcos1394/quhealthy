import type { Metadata } from "next";
import React from "react";

const blogMeta = {
  es: {
    title: "Blog Médico, Salud y Tecnología",
    description:
      "Artículos médicos certificados, guías de salud, avances en telemedicina e inteligencia artificial para el cuidado de tu bienestar en QuHealthy.",
    ogTitle: "Blog Médico y Salud Digital | QuHealthy",
    ogDescription:
      "Artículos médicos certificados, guías de salud, telemedicina e IA en QuHealthy.",
  },
  en: {
    title: "Medical Blog, Health & Technology",
    description:
      "Certified medical articles, wellness guides, advances in telemedicine, and AI for healthcare management on QuHealthy.",
    ogTitle: "Medical Blog & Digital Health | QuHealthy",
    ogDescription:
      "Certified medical articles, healthcare insights, and telemedicine news on QuHealthy.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const content = blogMeta[isEnglish ? "en" : "es"];
  const siteUrl = "https://www.quhealthy.org";

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: `${siteUrl}/${locale}/blog`,
      siteName: "QuHealthy",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "QuHealthy Blog",
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
      canonical: `${siteUrl}/${locale}/blog`,
      languages: {
        es: `${siteUrl}/es/blog`,
        en: `${siteUrl}/en/blog`,
        "x-default": `${siteUrl}/es/blog`,
      },
    },
  };
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
