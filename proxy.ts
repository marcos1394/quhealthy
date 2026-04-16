// Ubicación: src/proxy.ts (o middleware.ts)
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has('refreshToken');

  // =========================================================================
  // 🛡️ 3. ROMPE-BUCLES (KILL SWITCH PARA HTTP-ONLY COOKIES)
  // =========================================================================
  if (request.nextUrl.searchParams.get('clear_session') === 'true') {
    const url = new URL(request.url);
    url.searchParams.delete('clear_session');
    const response = NextResponse.redirect(url);

    // B. Destruimos la cookie asegurando coincidencia de dominio con Java
    response.cookies.set({
      name: 'refreshToken',
      value: '',
      path: '/',
      domain: 'quhealthy.org', // 🚀 Aseguramos matar la cookie compartida
      maxAge: 0,
      secure: true,
      sameSite: 'none'
    });

    return response;
  }

  // 🛡️ 4. 🌐 MATCHERS A PRUEBA DE IDIOMAS Y LÓGICA DE SEGURIDAD
  // =========================================================================
  const isProviderRegisterRoute = /^\/([a-zA-Z]{2}\/)?provider\/register/.test(pathname);

  // Todo bajo /patient, /provider o /admin está protegido, EXCEPTO /provider/register
  const isProtectedRoute = /^\/([a-zA-Z]{2}\/)?(patient|provider|admin)/.test(pathname) && !isProviderRegisterRoute;
  
  const isAuthRoute = /^\/([a-zA-Z]{2}\/)?(login|register|forgot-password|provider\/register)/.test(pathname);

  const localeMatch = pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
  const currentLocale = localeMatch ? `/${localeMatch[1]}` : '';

  // 🛡️ Lógica de Protección (Sin token -> a Login)
  if (isProtectedRoute && !hasToken) {
    const url = new URL(`${currentLocale}/login`, request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 🛡️ Lógica Anti-rebote (Con token intentando ir a Login/Registro)
  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL(`${currentLocale}/patient/dashboard`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};