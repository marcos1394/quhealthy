import React from "react";
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';

  return {
    title: isEnglish ? "Sign In | QuHealthy" : "Iniciar Sesión | QuHealthy",
    description: isEnglish 
      ? "Sign in, create an account or recover your password on QuHealthy." 
      : "Inicia sesión, regístrate o recupera tu cuenta en QuHealthy.",
    robots: {
      index: false,           // ← Importante: no indexar páginas de auth
      follow: true,
    },
  };
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      {children}
    </div>
  );
}