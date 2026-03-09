import { toast } from 'react-toastify';

// =========================================================================
//  Error Dictionary — HTTP status code → i18n key mapping
//  The actual translations live in messages/{locale}.json under "Errors"
// =========================================================================

const ERROR_MAP: Record<string, string> = {
    '400': 'Solicitud inválida. Revisa la información e intenta de nuevo.',
    '401': 'Tu sesión ha expirado. Inicia sesión nuevamente.',
    '403': 'No tienes permisos para realizar esta acción.',
    '404': 'El recurso solicitado no fue encontrado.',
    '408': 'La solicitud tardó demasiado. Intenta nuevamente.',
    '409': 'Ocurrió un conflicto. El recurso podría ya existir.',
    '413': 'El archivo es demasiado grande. Intenta con uno más pequeño.',
    '422': 'Los datos proporcionados no son válidos.',
    '429': 'Demasiadas solicitudes. Espera un momento.',
    '500': 'Error interno del servidor. Estamos trabajando para solucionarlo.',
    '502': 'Servicio temporalmente no disponible.',
    '503': 'Servicio en mantenimiento. Intenta más tarde.',
    'network': 'No se pudo conectar con el servidor. Verifica tu conexión.',
    'timeout': 'La solicitud tardó demasiado. Intenta de nuevo.',
    'unknown': 'Ocurrió un error inesperado. Intenta nuevamente.',
};

// =========================================================================
//  Locale-aware error resolver
//  Since axios interceptor runs outside React, we store a simple map
//  that gets hydrated from the Errors namespace on app init.
// =========================================================================
let _errorMessages: Record<string, string> = { ...ERROR_MAP };

/**
 * Call this once from the root layout to hydrate the error dictionary
 * with the current locale's translations.
 */
export function hydrateErrorMessages(messages: Record<string, string>) {
    _errorMessages = { ...ERROR_MAP, ...messages };
}

/**
 * Resolves an HTTP status code (or key like 'network') to a translated message.
 */
export function getErrorMessage(statusOrKey: number | string): string {
    const key = String(statusOrKey);
    return _errorMessages[key] || _errorMessages['unknown'] || ERROR_MAP['unknown'];
}

/**
 * Global error handler — call from hooks/components instead of raw toast.error().
 *
 * Priority:
 * 1. Server-provided message (error.response.data.message) — most specific
 * 2. HTTP-code i18n fallback from dictionary
 * 3. Generic unknown fallback
 *
 * @param error - The caught error (from axios or any)
 * @param customMessage - Optional override message from the caller
 */
export function handleApiError(error: any, customMessage?: string): void {
    // If a custom message was provided, use it directly
    if (customMessage) {
        toast.error(customMessage);
        return;
    }

    const status: number | undefined =
        error?.status || error?.response?.status;

    const serverMessage: string | undefined =
        error?.response?.data?.message || error?.message;

    // If the server gave a specific message AND it's not a generic Axios message, prefer it
    if (serverMessage && !serverMessage.startsWith('Request failed with status')) {
        toast.error(serverMessage);
        return;
    }

    // Otherwise, resolve from the HTTP dictionary
    if (status) {
        toast.error(getErrorMessage(status));
        return;
    }

    // Network / timeout errors from Axios
    if (error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK') {
        const key = error.code === 'ECONNABORTED' ? 'timeout' : 'network';
        toast.error(getErrorMessage(key));
        return;
    }

    // Final fallback
    toast.error(getErrorMessage('unknown'));
}
