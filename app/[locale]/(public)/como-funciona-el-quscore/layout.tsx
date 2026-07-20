import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://www.quhealthy.org";

  return {
    alternates: {
      canonical: `${baseUrl}/${locale}/como-funciona-el-quscore`,
      languages: {
        es: `${baseUrl}/es/como-funciona-el-quscore`,
        en: `${baseUrl}/en/how-quscore-works`, // or /en/como-funciona-el-quscore if same slug
        "x-default": `${baseUrl}/es/como-funciona-el-quscore`,
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
