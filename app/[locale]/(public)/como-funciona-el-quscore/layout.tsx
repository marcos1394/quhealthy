import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://www.quhealthy.org";
  const isEnglish = locale === "en";

  const title = isEnglish
    ? "How QuScore Works: Trust & Medical Quality"
    : "¿Cómo Funciona el QuScore? Confianza y Calidad Médica";

  const description = isEnglish
    ? "Discover how QuScore measures medical quality, verified patient reviews, professional certifications, and security standards on QuHealthy."
    : "Descubre cómo el QuScore evalúa la calidad médica, opiniones reales de pacientes, certificaciones profesionales y seguridad en QuHealthy.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/como-funciona-el-quscore`,
      siteName: "QuHealthy",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "QuScore - Calificación de Confianza Médica",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/como-funciona-el-quscore`,
      languages: {
        es: `${baseUrl}/es/como-funciona-el-quscore`,
        en: `${baseUrl}/en/como-funciona-el-quscore`,
        "x-default": `${baseUrl}/es/como-funciona-el-quscore`,
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
