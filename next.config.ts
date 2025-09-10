// next.config.mjs
import withPWAInit from "next-pwa";
import withBundleAnalyzerInit from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    return [
      {
        source: '/:path*',
        headers: [
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