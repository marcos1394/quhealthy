import type { NextConfig } from "next";
import withPWAInit from "next-pwa";
import withBundleAnalyzerInit from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,

  // === 1. CONFIGURACIÓN TURBOPACK (SILENCIA EL ERROR) ===
  turbopack: {},

  // === 2. BYPASS DE ERRORES (ACTUALIZADO PARA NEXT 16) ===
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
    // ⚠️ AQUÍ ESTABA EL BLOQUEO. HEMOS AGREGADO GOOGLE.
    const cspHeader = `
      default-src 'self';
      
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://js.stripe.com https://maps.googleapis.com https://accounts.google.com; 
      
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; 
      
      img-src 'self' data: https://*.stripe.com https://files.stripe.com https://xqejlzevtuknggchvyfa.supabase.co https://maps.gstatic.com https://maps.googleapis.com https://*.googleusercontent.com;
      
      font-src 'self' data: https://fonts.gstatic.com;
      
      frame-src 'self' https://*.stripe.com https://js.stripe.com https://accounts.google.com;
      
      connect-src 'self' https://*.stripe.com https://api.qubits-lm.com wss://api.qubits-lm.com https://maps.googleapis.com https://places.googleapis.com https://xqejlzevtuknggchvyfa.supabase.co https://accounts.google.com https://api.quhealthy.org;
    `.replace(/\s{2,}/g, ' ').trim();
    // Nota: Agregué https://api.quhealthy.org en connect-src para permitir llamadas directas a tu API si Axios las hace.

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
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
      // ✅ ADDED: Necesario para mostrar la foto de perfil de Google si decides mostrarla
      {
        protocol: 'https' as const,
        hostname: '*.googleusercontent.com',
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
export default withBundleAnalyzer(withPWA(nextConfig as unknown as any) as any);