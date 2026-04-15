// Ubicación: src/middleware.ts (o src/proxy.ts dependiendo de tu versión de Next.js)
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Inicializamos tu middleware de internacionalización original
const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 2. Leemos la cookie HttpOnly de sesión
  const hasToken = request.cookies.has('refreshToken');

  // =========================================================================
  // 🛡️ 3. ROMPE-BUCLES (KILL SWITCH PARA HTTP-ONLY COOKIES)
  // =========================================================================
  if (request.nextUrl.searchParams.get('clear_session') === 'true') {
    // A. Limpiamos la URL para que el usuario no vea el parámetro raro (?clear_session=true)
    const url = new URL(request.url);
    url.searchParams.delete('clear_session');
    const response = NextResponse.redirect(url);

    // B. Destruimos la cookie desde el servidor usando los mismos parámetros que Java
    response.cookies.set({
      name: 'refreshToken',
      value: '',
      path: '/',
      domain: 'quhealthy.org',
      maxAge: 0, // 0 = Borrar inmediatamente
      secure: true,
      sameSite: 'none'
    });

    return response;
  }

  // =========================================================================
  // 4. 🌐 MATCHERS A PRUEBA DE IDIOMAS Y LÓGICA DE SEGURIDAD
  // =========================================================================
  
  // Esta Regex ignora si la URL tiene un prefijo de 2 letras (ej: /es/login o /en/login) o no lo tiene (/login)
  const isProtectedRoute = /^\/([a-zA-Z]{2}\/)?(patient|provider|admin)/.test(pathname);
  const isAuthRoute = /^\/([a-zA-Z]{2}\/)?(login|register|forgot-password)/.test(pathname);

  // Extraemos el locale actual para mantener al usuario en su idioma al redirigir
  const localeMatch = pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
  const currentLocale = localeMatch ? `/${localeMatch[1]}` : '';

  // 🛡️ Lógica de Protección (Sin token -> a Login)
  if (isProtectedRoute && !hasToken) {
    const url = new URL(`${currentLocale}/login`, request.url);
    url.searchParams.set('callbackUrl', pathname); // Guardamos a dónde iba para UX
    return NextResponse.redirect(url);
  }

  // 🛡️ Lógica Anti-rebote (Con token intentando ir a Login/Registro)
  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL(`${currentLocale}/patient/dashboard`, request.url));
  }

  // 5. 🌐 DELEGACIÓN
  // Si pasó las validaciones de seguridad, le pasamos la estafeta a next-intl 
  // para que haga su magia con los idiomas, redirecciones por defecto y traducciones.
  return intlMiddleware(request);
}

// Mantenemos tu config original que ya estaba optimizada para next-intl
export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};