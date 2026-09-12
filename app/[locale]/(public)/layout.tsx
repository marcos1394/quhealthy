import React from "react";
import { PublicLayoutShell } from "@/components/layout/PublicLayoutShell";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}) {
  const resolvedParams = params ? await params : undefined;
  const locale = resolvedParams?.locale || "es";

  const jsonLdGlobal = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.quhealthy.org/#organization",
        name: "QuHealthy",
        url: "https://www.quhealthy.org",
        logo: {
          "@type": "ImageObject",
          url: "https://www.quhealthy.org/og-image.png",
          caption: "QuHealthy - Ecosistema de Salud y Bienestar Digital",
        },
        sameAs: [
          "https://www.instagram.com/quhealthy",
          "https://twitter.com/QuHealthyApp",
        ],
        description:
          locale === "en"
            ? "Intelligent Health and Medical Management Platform"
            : "Plataforma Inteligente de Salud, Citas y Gestión Médica",
      },
      {
        "@type": "WebSite",
        "@id": "https://www.quhealthy.org/#website",
        url: "https://www.quhealthy.org",
        name: "QuHealthy",
        publisher: {
          "@id": "https://www.quhealthy.org/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `https://www.quhealthy.org/${locale}/discover?query={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGlobal) }}
      />
      <PublicLayoutShell>{children}</PublicLayoutShell>
    </>
  );
}
