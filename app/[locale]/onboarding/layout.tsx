import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import AuthProvider from "@/components/providers/AuthProvider";
import { OnboardingHeader } from "./OnboardingHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "OnboardingLayout" });

  return {
    title: {
      default: t("meta_title"),
      template: "%s | QuHealthy",
    },
    description: t("meta_description"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex flex-col h-screen w-full bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white font-sans antialiased selection:bg-emerald-100 dark:selection:bg-emerald-950/30 overflow-hidden transition-colors duration-500">
        {/* Topbar flotante */}
        <OnboardingHeader />

        {/* Área de contenido principal */}
        <main className="flex-1 overflow-y-auto relative bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 custom-scrollbar">
          <div className="container mx-auto px-4 pb-12 max-w-4xl animate-in fade-in-0 duration-300 h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}