import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google'; // Usaremos una fuente de Google optimizada por Next.js
import CustomProvider from "@/components/ui/provider";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configuración de la fuente
const inter = Inter({ subsets: ["latin"] });

// --- METADATOS PROFESIONALES PARA SEO ---
export const metadata: Metadata = {
  // Base para construir URLs absolutas
  metadataBase: new URL('https://www.quhealthy.com'), // Reemplaza con tu dominio de producción

  // Título dinámico
  title: {
    template: '%s | QuHealthy', // Cada página podrá definir su propio título
    default: 'QuHealthy - Plataforma de Salud y Bienestar Digital', // Título por defecto
  },
  
  description: "Encuentra, agenda y gestiona tus citas de salud y belleza con los mejores profesionales. QuHealthy es la plataforma digital que conecta pacientes y proveedores de manera eficiente.",
  
  // Palabras clave
  keywords: ['salud', 'belleza', 'bienestar', 'citas médicas', 'agenda online', 'profesionales de la salud', 'terapia', 'spa', 'médicos en México'],
  
  // Autores y publicadores
  authors: [{ name: 'QuHealthy Team', url: 'https://www.quhealthy.com' }],
  creator: 'QuHealthy',
  publisher: 'QuHealthy',

  // Open Graph (para compartir en redes sociales como Facebook, WhatsApp)
  openGraph: {
    title: 'QuHealthy - Tu Ecosistema de Bienestar Digital',
    description: 'La plataforma líder para agendar y gestionar servicios de salud y belleza.',
    url: 'https://www.quhealthy.com',
    siteName: 'QuHealthy',
    images: [
      {
        url: '/og-image.png', // Imagen principal para compartir (debe estar en /public)
        width: 1200,
        height: 630,
        alt: 'Dashboard de QuHealthy mostrando una agenda de citas',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },

  // Twitter Card (para compartir en Twitter/X)
  twitter: {
    card: 'summary_large_image',
    title: 'QuHealthy - Tu Ecosistema de Bienestar Digital',
    description: 'La plataforma líder para agendar y gestionar servicios de salud y belleza.',
    creator: '@QuHealthyApp', // Reemplaza con tu usuario de Twitter
    images: ['/og-image.png'], // Usa la misma imagen que Open Graph
  },

  // Íconos (Favicon, Apple Touch Icon, etc.)
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  
  // Manifest para PWA (Progressive Web App)
  manifest: '/manifest.json',

  // Robots (instrucciones para los buscadores)
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

// --- VIEWPORT (Control sobre la visualización en móviles) ---
export const viewport: Viewport = {
  themeColor: '#111827', // Coincide con el color de fondo de tu app
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <CustomProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          {/* Contenedor para las notificaciones toast en toda la app */}
          <ToastContainer theme="dark" position="bottom-right" />
        </CustomProvider>
      </body>
    </html>
  );
}