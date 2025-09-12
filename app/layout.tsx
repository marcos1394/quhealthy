import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import CustomProvider from "@/components/ui/provider";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configuración de la fuente
const inter = Inter({ subsets: ["latin"] });

// --- METADATOS PROFESIONALES PARA SEO (sin cambios) ---
export const metadata: Metadata = {
  metadataBase: new URL('https://www.quhealthy.com'),
  title: {
    template: '%s | QuHealthy',
    default: 'QuHealthy - Plataforma de Salud y Bienestar Digital',
  },
  description: "Encuentra, agenda y gestiona tus citas de salud y belleza con los mejores profesionales. QuHealthy es la plataforma digital que conecta pacientes y proveedores de manera eficiente.",
  keywords: ['salud', 'belleza', 'bienestar', 'citas médicas', 'agenda online', 'profesionales de la salud', 'terapia', 'spa', 'médicos en México'],
  authors: [{ name: 'QuHealthy Team', url: 'https://www.quhealthy.com' }],
  creator: 'QuHealthy',
  publisher: 'QuHealthy',
  openGraph: {
    title: 'QuHealthy - Tu Ecosistema de Bienestar Digital',
    description: 'La plataforma líder para agendar y gestionar servicios de salud y belleza.',
    url: 'https://www.quhealthy.com',
    siteName: 'QuHealthy',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dashboard de QuHealthy mostrando una agenda de citas',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuHealthy - Tu Ecosistema de Bienestar Digital',
    description: 'La plataforma líder para agendar y gestionar servicios de salud y belleza.',
    creator: '@QuHealthyApp',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
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

// --- VIEWPORT (sin cambios) ---
export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-900 text-white`}>
        {/*
          ELIMINAMOS GlobalStateInitializer de aquí.
          Este layout ahora es "agnóstico": no sabe si un usuario ha iniciado sesión o no.
          Su única responsabilidad es proveer la estructura base para TODA la aplicación.
        */}
        <CustomProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <ToastContainer theme="dark" position="bottom-right" />
        </CustomProvider>
      </body>
    </html>
  );
}