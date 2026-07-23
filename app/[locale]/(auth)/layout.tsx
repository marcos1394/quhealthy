import React from "react";
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';

  return {
    title: isEnglish ? "Authentication | QuHealthy" : "Autenticación | QuHealthy",
    description: isEnglish 
      ? "Sign in, create an account or recover your password on QuHealthy." 
      : "Inicia sesión, regístrate o recupera tu cuenta en QuHealthy.",
    robots: {
      index: false, // No indexar páginas de autenticación/registro
      follow: true,
    },
  };
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 antialiased">
      {children}
    </div>
  );
}