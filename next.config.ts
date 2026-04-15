// Ubicación: next.config.ts
import type { NextConfig } from "next";
import withPWAInit from "next-pwa";
import withBundleAnalyzerInit from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,

  // === 1. CONFIGURACIÓN TURBOPACK ===
  turbopack: {},

  // === 2. BYPASS DE ERRORES ===
  typescript: {
    ignoreBuildErrors: true,
  },

  // === 3. REVERSE PROXY PARA LA API ===
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.quhealthy.org/api/:path*',
      },
    ];
  },

  // === 4. CABECERAS DE SEGURIDAD (CSP) ===
  async headers() {
    const cspHeader = `
      default-src 'self';
      
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://js.stripe.com https://maps.googleapis.com https://accounts.google.com https://va.vercel-scripts.com; 
      
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; 
      
      img-src * data: blob: 'unsafe-inline';      
      font-src 'self' data: https://fonts.gstatic.com;

      media-src 'self' https://storage.googleapis.com;
      
      frame-src 'self' https://*.stripe.com https://js.stripe.com https://accounts.google.com;
      
      connect-src *;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          // 🚀 ADDED: Permite al popup de Google cerrarse y comunicarse con tu página
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ];
  },

  // === 5. OPTIMIZACIÓN DE IMÁGENES ===
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'files.stripe.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'xqejlzevtuknggchvyfa.supabase.co',
      },
      {
        protocol: 'https' as const,
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'storage.googleapis.com',
      }
    ],
  },
};

// === CONFIGURACIÓN DE PLUGINS ===

const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

// Exportación final
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withNextIntl(withBundleAnalyzer(withPWA(nextConfig as unknown as any) as any));