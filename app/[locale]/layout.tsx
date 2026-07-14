import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import CustomProvider from "@/components/ui/provider";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

// Vercel Analytics & Speed Insights
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

// Providers y componentes globales
import { ToastProvider } from '@/components/providers/ToastProvider';
import 'react-toastify/dist/ReactToastify.css';
import { CookieConsent } from '@/components/ui/CookieConsent';
import { LocationPrompt } from '@/components/ui/LocationPrompt';
import { AnalyticsManager } from '@/components/providers/AnalyticsManager';

// Fuente
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// ==================== METADATA ====================
const siteUrl = 'https://quhealthy.org';

const metadataContent = {
  es: {
    title: 'QuHealthy | Ecosistema de Bienestar Digital',
    ogTitle: 'QuHealthy — Tu Ecosistema de Bienestar Digital',
    description: 'Descubre, conecta y gestiona tu bienestar en una sola plataforma inteligente. Agenda citas, sigue hábitos y accede a servicios de salud y bienestar personalizados.',
    ogDescription: 'La plataforma todo-en-uno para tu bienestar: encuentra profesionales, agenda servicios y construye hábitos saludables.',
    keywords: [
      'bienestar digital', 
      'plataforma de bienestar', 
      'salud y bienestar', 
      'agenda de citas', 
      'profesionales de la salud', 
      'hábitos saludables',
      'wellness app'
    ] as const satisfies readonly string[],
    locale: 'es_MX',
    imageAlt: 'QuHealthy - Ecosistema de Bienestar Digital',
  },
  en: {
    title: 'QuHealthy | Digital Wellness Ecosystem',
    ogTitle: 'QuHealthy — Your Digital Wellness Ecosystem',
    description: 'Discover, connect, and manage your wellness in one intelligent platform. Book appointments, track habits, and access personalized health & wellness services.',
    ogDescription: 'The all-in-one platform for your wellness: find professionals, book services, and build healthy habits.',
    keywords: [
      'digital wellness', 
      'wellness platform', 
      'health and wellness', 
      'appointment booking', 
      'health professionals', 
      'healthy habits',
      'wellness ecosystem'
    ] as const satisfies readonly string[],
    locale: 'en_US',
    imageAlt: 'QuHealthy - Digital Wellness Ecosystem',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang = (locale === 'en' ? 'en' : 'es') as keyof typeof metadataContent;
  const content = metadataContent[lang];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: content.title,
      template: '%s | QuHealthy',
    },
    description: content.description,
    keywords: [...content.keywords],
    authors: [{ name: 'QuHealthy' }],
    creator: 'QuHealthy',
    publisher: 'QuHealthy',

    // Hreflang
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: '/es',
        en: '/en',
        'x-default': '/es',
      },
    },

    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: `${siteUrl}/${locale}`,
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
      images: [`${siteUrl}/og-image.png`],
      creator: '@QuHealthyApp',
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

// ==================== VIEWPORT ====================
export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// ==================== ROOT LAYOUT ====================
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white antialiased flex flex-col min-h-screen transition-colors duration-300`}
      >
        <NextIntlClientProvider messages={messages}>
          <CustomProvider>
            {children}

            {/* Global Providers & UI */}
            <ToastProvider />
            <AnalyticsManager />
            <CookieConsent />
            <LocationPrompt />

            {/* Vercel Analytics */}
            <Analytics />
            <SpeedInsights />

            {/* Chatwoot Live Chat */}
            <Script id="chatwoot-widget" strategy="afterInteractive">
              {`
                (function(d,t) {
                  var BASE_URL="https://app.chatwoot.com";
                  var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
                  g.src=BASE_URL+"/packs/js/sdk.js";
                  g.async = true;
                  s.parentNode.insertBefore(g,s);
                  g.onload=function(){
                    window.chatwootSDK.run({
                      websiteToken: '8NAP7B6kCJdHWj4S3vemxeJb',
                      baseUrl: BASE_URL
                    })
                  }
                })(document,"script");
              `}
            </Script>
          </CustomProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}