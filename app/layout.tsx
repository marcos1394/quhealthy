import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import CustomProvider from "@/components/ui/provider";
import "./globals.css";

// --- IMPORTACIÓN DE COMPONENTES UI (NUEVO) ---
import { Navbar } from "@/components/Navbar"; // Asegúrate de que Navbar.tsx esté en components
import Footer from "@/components/Footer";     // Asegúrate de que Footer.tsx esté en components

// Vercel Pro Observability
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Notificaciones
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configuración de la fuente
const inter = Inter({ subsets: ["latin"] });

// --- METADATOS PROFESIONALES PARA SEO ---
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

// --- VIEWPORT ---
export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-900 text-white antialiased`}>
        
        <CustomProvider>
          {/* Estructura Flex Global:
            1. Navbar: Fijo arriba (fixed en su componente).
            2. Main: Ocupa el espacio restante (flex-grow) y tiene padding-top (pt-20) 
               para no quedar oculto bajo el Navbar.
            3. Footer: Siempre al final.
          */}
          <div className="flex flex-col min-h-screen">
            
            <Navbar />
            
            <main className="flex-grow pt-20 relative z-0">
               {children}
            </main>

            <Footer />
            
          </div>
          
          {/* Componente de notificaciones global */}
          <ToastContainer theme="dark" position="bottom-right" />

          {/* Vercel Pro Analytics & Insights */}
          <Analytics />
          <SpeedInsights />
        </CustomProvider>
      </body>
    </html>
  );
}