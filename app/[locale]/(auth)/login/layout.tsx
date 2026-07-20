import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://www.quhealthy.org";

  return {
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/login`,
      languages: {
        es: `${baseUrl}/es/login`,
        en: `${baseUrl}/en/login`,
        "x-default": `${baseUrl}/es/login`,
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
