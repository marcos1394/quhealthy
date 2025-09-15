// next.config.mjs
import withPWAInit from "next-pwa";
import withBundleAnalyzerInit from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true, // <-- AÑADE ESTA LÍNEA

  // === REVERSE PROXY PARA LA API ===
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.qubits-lm.com/api/:path*',
      },
    ];
  },

  // === CABECERAS DE SEGURIDAD ===
  async headers() {
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://*.stripecdn.com;
        style-src 'self' 'unsafe-inline' https://*.stripe.com;
        img-src 'self' 'unsafe-inline' data: https://*.stripe.com https://*.stripecdn.com;
        font-src 'self' data:;
        frame-src 'self' https://*.stripe.com;
        connect-src 'self' https://*.stripe.com;
    `.replace(/\s{2,}/g, ' ').trim(); // Limpia espacios extra

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

  // === OPTIMIZACIÓN DE IMÁGENES ===
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'files.stripe.com',
        port: '',
      },
    ],
  },
  
  // === ESLINT ===
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Configuración para el Bundle Analyzer
const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === 'true',
});

// Configuración para la PWA
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

// Envolvemos nuestra configuración y hacemos una aserción de tipo para resolver el conflicto.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withBundleAnalyzer(withPWA(nextConfig) as any);