import type { Metadata } from "next";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const siteUrl = "https://www.quhealthy.org";

  const title = isEnglish ? "Privacy Policy" : "Aviso de Privacidad";
  const description = isEnglish
    ? "Read QuHealthy's privacy policy and how we protect your personal and medical health data under NOM-004 and international security standards."
    : "Conoce el aviso de privacidad de QuHealthy y cómo protegemos tus datos personales y expediente clínico bajo la NOM-004 y cifrado AES-256.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/privacy`,
      languages: {
        es: `${siteUrl}/es/privacy`,
        en: `${siteUrl}/en/privacy`,
        "x-default": `${siteUrl}/es/privacy`,
      },
    },
  };
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
