// Ubicación: src/proxy.ts (o middleware.ts en la raíz)
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Inicializamos tu middleware de internacionalización original
const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) { // Cambia 'proxy' a 'middleware' si sigues en Next 14/15
  const { pathname } = request.nextUrl;

  // 2. Leemos la cookie HttpOnly de sesión
  const hasToken = request.cookies.has('refreshToken');

  // 3. 🌐 MATCHERS A PRUEBA DE IDIOMAS
  // Esta Regex ignora si la URL tiene un prefijo de 2 letras (ej: /es/login o /en/login) o no lo tiene (/login)
  const isProtectedRoute = /^\/([a-zA-Z]{2}\/)?(patient|provider|admin)/.test(pathname);
  const isAuthRoute = /^\/([a-zA-Z]{2}\/)?(login|register|forgot-password)/.test(pathname);

  // Extraemos el locale actual para mantener al usuario en su idioma al redirigir
  const localeMatch = pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
  const currentLocale = localeMatch ? `/${localeMatch[1]}` : '';

  // 4. 🛡️ Lógica de Protección (Sin token -> a Login)
  if (isProtectedRoute && !hasToken) {
    const url = new URL(`${currentLocale}/login`, request.url);
    url.searchParams.set('callbackUrl', pathname); // Guardamos a dónde iba para UX
    return NextResponse.redirect(url);
  }

  // 5. 🛡️ Lógica Anti-rebote (Con token intentando ir a Login/Registro)
  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL(`${currentLocale}/patient/dashboard`, request.url));
  }

  // 6. 🌐 DELEGACIÓN
  // Si pasó las validaciones de seguridad, le pasamos la estafeta a next-intl 
  // para que haga su magia con los idiomas, redirecciones por defecto y traducciones.
  return intlMiddleware(request);
}

// Mantenemos tu config original que ya estaba optimizada para next-intl
export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};