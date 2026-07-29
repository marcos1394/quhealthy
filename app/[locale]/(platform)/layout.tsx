import React from "react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { Sidebar } from "@/components/platform/Sidebar";
import { MobileNavbar } from "@/components/platform/MobileNavbar";
import AuthProvider from "@/components/providers/AuthProvider";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PlatformLayout" });

  return {
    title: {
      default: t("meta_title"),
      template: "%s | QuHealthy",
    },
    description: t("meta_description"),

    // Importante: No indexar el dashboard
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {/* Contenedor principal arquitectónico Soft Health */}
      <div className="flex flex-col md:flex-row h-screen w-full bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white font-sans antialiased selection:bg-emerald-100 dark:selection:bg-emerald-950/30 overflow-hidden transition-colors duration-500">
        {/* Navbar (Mobile only) */}
        <MobileNavbar />

        {/* Sidebar (Desktop only) */}
        <div className="hidden md:flex flex-shrink-0 h-full z-50 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          <Sidebar />
        </div>

        {/* Main Content Area con Scroll customizado */}
        <main className="flex-1 overflow-y-auto relative bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 custom-scrollbar">
          <div className="mx-auto w-full p-6 md:p-10 lg:p-12 max-w-7xl animate-in fade-in-0 duration-300">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}