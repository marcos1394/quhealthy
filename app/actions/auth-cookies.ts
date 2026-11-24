'use server';

import { cookies } from 'next/headers';

/**
 * Limpia las cookies de sesión del cliente al cerrar sesión en el panel admin.
 * NOTA DE SEGURIDAD: La emisión de cookies de autenticación (refreshToken y __Secure-userRole)
 * se realiza exclusivamente desde el backend (Spring Boot AdminAuthController) con HttpOnly,
 * Secure y SameSite=None — nunca desde una Server Action invocada por el cliente.
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete('__Secure-userRole');
  cookieStore.delete('refreshToken');
}
