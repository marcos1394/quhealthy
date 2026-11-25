import React from "react";
import type { Metadata } from 'next';
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { pickMessages, AUTH_NAMESPACES } from "@/i18n/scopes";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';

  return {
    title: isEnglish ? "Authentication | QuHealthy" : "Autenticación | QuHealthy",
    description: isEnglish 
      ? "Sign in, create an account or recover your password on QuHealthy." 
      : "Inicia sesión, regístrate o recupera tu cuenta en QuHealthy.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const messages = pickMessages(await getMessages(), AUTH_NAMESPACES);
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen w-full bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 antialiased">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}