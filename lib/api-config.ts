/**
 * STAGE-WEB-CANON / Iteración 2.5: Resolución canónica de la URL base del API.
 *
 * Regla de Oro:
 * En staging.quhealthy.org (y subdominios/previews de staging), NUNCA se debe
 * contactar api.quhealthy.org, INCLUSO si NEXT_PUBLIC_API_URL está mal configurada
 * o heredó la variable de producción.
 */
export const resolveApiBaseUrl = (customOrigin?: string): string => {
  let hostname = '';
  if (typeof window !== 'undefined') {
    hostname = window.location.hostname.toLowerCase();
  } else if (customOrigin) {
    try {
      hostname = new URL(customOrigin).hostname.toLowerCase();
    } catch {
      hostname = customOrigin.toLowerCase();
    }
  }

  const isStagingHost =
    hostname === 'staging.quhealthy.org' ||
    hostname.includes('staging') ||
    hostname.includes('stage');

  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  // Si estamos en un host de staging:
  if (isStagingHost) {
    // Si la variable de entorno está ausente o mal configurada apuntando a producción,
    // se fuerza la resolución hacia api-staging.quhealthy.org
    if (
      !envUrl ||
      envUrl.includes('api.quhealthy.org') ||
      envUrl === 'https://quhealthy.org' ||
      envUrl === 'http://quhealthy.org' ||
      !envUrl.includes('staging')
    ) {
      return 'https://api-staging.quhealthy.org';
    }
    return envUrl;
  }

  // Si no estamos en un host de staging en el navegador (ej. SSR, localhost, o producción)
  if (envUrl) {
    return envUrl;
  }

  return 'https://api.quhealthy.org';
};
