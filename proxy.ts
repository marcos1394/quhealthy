// Ubicación: src/proxy.ts (o middleware.ts)
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  let { pathname } = request.nextUrl;
  const hasToken = request.cookies.has('refreshToken');
  
  // 🛡️ 0. LÓGICA DE SUBDOMINIO PARA ADMIN PORTAL
  const hostname = request.headers.get('host') || '';
  const isAdminDomain = hostname === 'admin.quhealthy.org' || hostname.startsWith('admin.localhost');

  if (isAdminDomain) {
    const localeMatchAdmin = pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
    const localePrefix = localeMatchAdmin ? `/${localeMatchAdmin[1]}` : '';
    const pathWithoutLocale = localeMatchAdmin ? pathname.substring(3) : pathname;

    if (!pathWithoutLocale.startsWith('/admin')) {
      let newPath = '';
      if (pathWithoutLocale === '' || pathWithoutLocale === '/') {
          newPath = '/admin/dashboard';
      } else if (pathWithoutLocale === '/login') {
          newPath = '/admin/login';
      } else {
          newPath = '/admin' + pathWithoutLocale;
      }
      pathname = localePrefix + newPath;
      request.nextUrl.pathname = pathname;
    }
  }

  // =========================================================================
  // 🛡️ 3. ROMPE-BUCLES (KILL SWITCH PARA HTTP-ONLY COOKIES)
  // =========================================================================
  const isClearSession = request.nextUrl.searchParams.get('clear_session') === 'true';

  if (isClearSession) {
    // Eliminamos del request actual para que las siguientes validaciones en el proxy actúen como si no hubiera sesión
    request.cookies.delete('refreshToken');
    request.cookies.delete('__Secure-userRole');
  }

  const isTokenPresent = request.cookies.has('refreshToken');

  // 🛡️ 4. 🌐 MATCHERS A PRUEBA DE IDIOMAS Y LÓGICA DE SEGURIDAD
  // =========================================================================
  const isProviderRegisterRoute = /^\/([a-zA-Z]{2}\/)?provider\/register/.test(pathname);
  
  // 🚀 NUEVO: Identificamos la ruta pública de la receta para excluirla
  const isPublicPrescriptionRoute = /^\/([a-zA-Z]{2}\/)?patient\/prescription\//.test(pathname);

  // 🚀 NUEVO: Identificamos la ruta de login de admin para excluirla de las protegidas
  const isAdminLoginRoute = /^\/([a-zA-Z]{2}\/)?admin\/login/.test(pathname);

  // Todo bajo /patient, /provider o /admin está protegido, 
  // EXCEPTO /provider/register, la Bóveda de Recetas (/patient/prescription/...) y Admin Login
  const isProtectedRoute = /^\/([a-zA-Z]{2}\/)?(patient|provider|admin)/.test(pathname) 
    && !isProviderRegisterRoute 
    && !isPublicPrescriptionRoute
    && !isAdminLoginRoute;
  
  const isAuthRoute = /^\/([a-zA-Z]{2}\/)?(login|register|forgot-password|provider\/register|admin\/login)/.test(pathname);

  const localeMatch = pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
  const currentLocale = localeMatch ? `/${localeMatch[1]}` : '';

  // 🛡️ Lógica de Protección (Sin token -> a Login)
  if (isProtectedRoute && !isTokenPresent) {
    const url = new URL(`${currentLocale}/login`, request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 🛡️ Lógica Anti-rebote (Con token intentando ir a Login/Registro)
  // 🚀 FIX: Si la URL tiene expired=true, significa que el token falló en el frontend. NO redirigir de vuelta al dashboard.
  const isExpired = request.nextUrl.searchParams.get('expired') === 'true';
  
  if (isAuthRoute && isTokenPresent && !isExpired) {
    const userRole = request.cookies.get('__Secure-userRole')?.value;
    
    // 🚀 Redirigir según el rol guardado en la cookie
    if (userRole === 'ROLE_PROVIDER' || userRole === 'ROLE_STAFF') {
      return NextResponse.redirect(new URL(`${currentLocale}/provider/dashboard`, request.url));
    }
    if (userRole === 'ROLE_ADMIN') {
      return NextResponse.redirect(new URL(`${currentLocale}/admin/dashboard`, request.url));
    }
    
    // Default para CONSUMER o si no hay cookie
    return NextResponse.redirect(new URL(`${currentLocale}/patient/dashboard`, request.url));
  }

  // 🤖 5. SEO / BOT INTERCEPTION 🤖
  // Redes sociales (Twitter, WhatsApp, etc.) no siguen redirecciones 307 correctamente al leer metadatos.
  // Si un bot visita la raíz (/), le reescribimos internamente a /es para que reciba un 200 OK con el HTML y OG tags.
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /Twitterbot|facebookexternalhit|WhatsApp|LinkedInBot|SkypeUriPreview|TelegramBot|Slackbot|Discordbot/i.test(userAgent);

  if (isBot && (pathname === '/' || pathname === '')) {
    return NextResponse.rewrite(new URL('/es', request.url));
  }

  // Obtener respuesta base
  const response = intlMiddleware(request);

  // Aplicar headers de destrucción de cookies si se activó el kill switch
  if (isClearSession) {
    const pastDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
    const commonOpts = `Path=/; Secure; SameSite=None; Expires=${pastDate}`;

    response.headers.append('Set-Cookie', `refreshToken=; ${commonOpts}`);
    response.headers.append('Set-Cookie', `__Secure-userRole=; ${commonOpts}`);
    response.headers.append('Set-Cookie', `refreshToken=; Domain=quhealthy.org; ${commonOpts}`);
    response.headers.append('Set-Cookie', `__Secure-userRole=; Domain=quhealthy.org; ${commonOpts}`);
    response.headers.append('Set-Cookie', `refreshToken=; Domain=www.quhealthy.org; ${commonOpts}`);
    response.headers.append('Set-Cookie', `__Secure-userRole=; Domain=www.quhealthy.org; ${commonOpts}`);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};