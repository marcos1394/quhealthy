import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import CustomProvider from "@/components/ui/provider";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

// Vercel Pro Observability
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Notificaciones (tema-aware + i18n error hydration)
import { ToastProvider } from '@/components/providers/ToastProvider';
import 'react-toastify/dist/ReactToastify.css';
import { CookieConsent } from '@/components/ui/CookieConsent';
import { LocationPrompt } from '@/components/ui/LocationPrompt';
import { AnalyticsManager } from '@/components/providers/AnalyticsManager';

// Configuración de la fuente
const inter = Inter({ subsets: ["latin"] });

// --- METADATOS DINÁMICOS POR IDIOMA (SEO + Open Graph) ---
const ogContent = {
  es: {
    title: 'QuHealthy - Plataforma de Salud y Bienestar Digital',
    ogTitle: 'QuHealthy — Tu Ecosistema de Bienestar Digital',
    description: 'Encuentra, agenda y gestiona tus citas de salud y belleza con los mejores profesionales. La plataforma que conecta pacientes y proveedores de manera eficiente.',
    ogDescription: 'La plataforma líder para agendar y gestionar servicios de salud y belleza en México.',
    keywords: ['salud', 'belleza', 'bienestar', 'citas médicas', 'agenda online', 'profesionales de la salud', 'médicos en México'],
    locale: 'es_MX',
    imageAlt: 'Dashboard de QuHealthy mostrando una agenda de citas',
  },
  en: {
    title: 'QuHealthy - Digital Health & Wellness Platform',
    ogTitle: 'QuHealthy — Your Digital Wellness Ecosystem',
    description: 'Find, book, and manage your health and beauty appointments with top professionals. The platform that connects patients and providers efficiently.',
    ogDescription: 'The leading platform to book and manage health & beauty services.',
    keywords: ['health', 'beauty', 'wellness', 'medical appointments', 'online booking', 'health professionals'],
    locale: 'en_US',
    imageAlt: 'QuHealthy dashboard showing an appointment calendar',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang = (locale === 'en' ? 'en' : 'es') as keyof typeof ogContent;
  const content = ogContent[lang];
  const siteUrl = 'https://www.quhealthy.org';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: '%s | QuHealthy',
      default: content.title,
    },
    description: content.description,
    keywords: content.keywords,
    authors: [{ name: 'QuHealthy Team', url: siteUrl }],
    creator: 'QuHealthy',
    publisher: 'QuHealthy',
    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: `${siteUrl}/${lang}`,
      siteName: 'QuHealthy',
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: content.imageAlt,
        },
      ],
      locale: content.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.ogTitle,
      description: content.ogDescription,
      creator: '@QuHealthyApp',
      images: [`${siteUrl}/og-image.png`],
    },
    manifest: '/manifest.json',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// --- VIEWPORT ---
export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white antialiased flex flex-col min-h-screen transition-colors duration-300`}>

        <NextIntlClientProvider messages={messages}>
          <CustomProvider>

            {/* 🚀 ELIMINADO EL AUTHPROVIDER DE AQUÍ PARA EVITAR EL BUCLE EN PÁGINAS PÚBLICAS */}
            {children}

            {/* Componente de notificaciones global (auto dark/light + i18n errors) */}
            <ToastProvider />

            {/* Global Enterprise Prompts & Analytics */}
            <AnalyticsManager />
            <CookieConsent />
            <LocationPrompt />

            {/* Vercel Pro Analytics & Insights */}
            <Analytics />
            <SpeedInsights />
          </CustomProvider>
        </NextIntlClientProvider>

      </body>
    </html>
  );
}