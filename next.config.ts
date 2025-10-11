import withPWAInit from "next-pwa";
import withBundleAnalyzerInit from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,

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
            script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://js.stripe.com;
            style-src 'self' 'unsafe-inline';
            img-src 'self' data: https://*.stripe.com https://files.stripe.com https://xqejlzevtuknggchvyfa.supabase.co;
            font-src 'self' data:;
            frame-src 'self' https://*.stripe.com https://js.stripe.com;
            
            connect-src 'self' https://*.stripe.com https://api.qubits-lm.com wss://api.qubits-lm.com;

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
            },
            // --- INICIO DE LA CORRECCIÓN ---
            // Permite que Next.js optimice las imágenes de tu bucket de Supabase
            {
                protocol: 'https' as const,
                hostname: 'xqejlzevtuknggchvyfa.supabase.co',
            }
            // --- FIN DE LA CORRECCIÓN ---
        ],
    },
    
    eslint: {
        ignoreDuringBuilds: true,
    },
};

const withBundleAnalyzer = withBundleAnalyzerInit({
    enabled: process.env.ANALYZE === 'true',
});

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === 'development',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withBundleAnalyzer(withPWA(nextConfig) as any);