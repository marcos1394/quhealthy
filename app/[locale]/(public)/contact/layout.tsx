import type { Metadata } from "next";
import React from "react";

const contactMeta = {
  es: {
    title: "Contacto y Soporte Médico",
    description:
      "Ponte en contacto con el equipo de QuHealthy. Soporte para pacientes, clínicas, proveedores y profesionales de la salud. Estamos para ayudarte.",
    ogTitle: "Contacto y Atención al Cliente | QuHealthy",
    ogDescription:
      "Ponte en contacto con QuHealthy. Atención a pacientes, médicos y clínicas.",
  },
  en: {
    title: "Contact Us & Medical Support",
    description:
      "Get in touch with the QuHealthy team. Customer support for patients, clinics, providers, and healthcare professionals.",
    ogTitle: "Contact & Support | QuHealthy",
    ogDescription:
      "Contact QuHealthy team for support, partnerships, or patient inquiries.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const content = contactMeta[isEnglish ? "en" : "es"];
  const siteUrl = "https://www.quhealthy.org";

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: `${siteUrl}/${locale}/contact`,
      siteName: "QuHealthy",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Contacto QuHealthy",
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
      canonical: `${siteUrl}/${locale}/contact`,
      languages: {
        es: `${siteUrl}/es/contact`,
        en: `${siteUrl}/en/contact`,
        "x-default": `${siteUrl}/es/contact`,
      },
    },
  };
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
