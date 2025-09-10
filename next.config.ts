// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // === REVERSE PROXY PARA LA API ===
  // La solución definitiva a los problemas de CORS y cookies.
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Captura todas las peticiones a /api/...
        destination: 'https://api.qubits-lm.com/api/:path*', // Y las reenvía a tu backend en Render.
      },
    ];
  },

  // === CABECERAS DE SEGURIDAD ===
  // Añade una capa de seguridad robusta a nivel de navegador.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Previene que el navegador abra iframes de tu sitio en otros dominios (protección contra clickjacking).
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Obliga a los navegadores a usar HTTPS, protegiendo contra ataques de "man-in-the-middle".
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Previene que el navegador intente adivinar el tipo de contenido de un archivo.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Controla qué información se envía en el encabezado 'Referer' a otros sitios.
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },

  // === OPTIMIZACIÓN DE IMÁGENES ===
  // Permite que Next.js optimice imágenes de dominios externos (ej. un futuro CDN o S3).
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.stripe.com', // Ejemplo: Permite imágenes de Stripe
        port: '',
      },
      // Añade aquí otros dominios de los que cargarás imágenes.
    ],
  },
  
  // === ESLINT ===
  eslint: {
    // Advertencia: Esto permite que el build se complete aunque haya errores de ESLint.
    // Es útil en desarrollo, pero en un entorno de producción ideal, esto debería ser 'false'.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;