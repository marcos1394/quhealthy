import { describe, it, expect } from 'vitest';
import nextConfig from '@/next.config';

describe('OPS-SEC-03: Endurecimiento de Cabeceras de Seguridad HTTP (OWASP)', () => {
  it('contiene todas las cabeceras de seguridad requeridas por OWASP en la ruta raíz /:path*', async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) throw new Error('nextConfig.headers is undefined');

    const headersList = await nextConfig.headers();
    const rootRoute = headersList.find((h) => h.source === '/:path*');

    expect(rootRoute).toBeDefined();
    const headersMap = new Map(rootRoute?.headers.map((h) => [h.key, h.value]));

    // 1. Content Security Policy
    expect(headersMap.has('Content-Security-Policy')).toBe(true);
    const csp = headersMap.get('Content-Security-Policy');
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain('https://*.stripe.com');

    // 2. Strict Transport Security
    expect(headersMap.has('Strict-Transport-Security')).toBe(true);
    expect(headersMap.get('Strict-Transport-Security')).toContain('max-age=63072000');

    // 3. X-Frame-Options
    expect(headersMap.has('X-Frame-Options')).toBe(true);
    expect(headersMap.get('X-Frame-Options')).toBe('SAMEORIGIN');

    // 4. X-Content-Type-Options
    expect(headersMap.has('X-Content-Type-Options')).toBe(true);
    expect(headersMap.get('X-Content-Type-Options')).toBe('nosniff');

    // 5. Referrer Policy
    expect(headersMap.has('Referrer-Policy')).toBe(true);
    expect(headersMap.get('Referrer-Policy')).toBe('origin-when-cross-origin');

    // 6. Permissions Policy
    expect(headersMap.has('Permissions-Policy')).toBe(true);
    expect(headersMap.get('Permissions-Policy')).toContain('camera=(self)');
    expect(headersMap.get('Permissions-Policy')).toContain('microphone=(self)');
    expect(headersMap.get('Permissions-Policy')).toContain('geolocation=(self)');
  });

  it('aplica noindex y no-store a las rutas administrativas de auditoría /admin/:path*', async () => {
    if (!nextConfig.headers) throw new Error('nextConfig.headers is undefined');

    const headersList = await nextConfig.headers();
    const adminRoute = headersList.find((h) => h.source === '/admin/:path*');

    expect(adminRoute).toBeDefined();
    const adminHeadersMap = new Map(adminRoute?.headers.map((h) => [h.key, h.value]));

    expect(adminHeadersMap.get('X-Robots-Tag')).toBe('noindex, nofollow, noarchive');
    expect(adminHeadersMap.get('Cache-Control')).toBe('no-store, max-age=0, must-revalidate');
  });
});
