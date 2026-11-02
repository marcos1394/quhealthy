/**
 * Convierte un timestamp ISO con zona (ej. "2026-06-25T18:51:23.123Z")
 * a la hora local del dispositivo.
 */
export function formatMessageTime(isoString: string): string {
    if (!isoString) return '';
    try {
        return new Date(isoString).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    } catch {
        return '';
    }
}

export function formatLastSeen(isoString?: string): string {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMin = Math.round((now.getTime() - date.getTime()) / 60000);

        if (diffMin < 1) return 'Activo justo ahora';
        if (diffMin < 60) return `Activo hace ${diffMin} min`;

        const diffHours = Math.round(diffMin / 60);
        if (diffHours < 24) return `Activo hace ${diffHours} h`;

        return `Últ. vez ${date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}`;
    } catch {
        return '';
    }
}

/**
 * Formato WhatsApp para la lista lateral de conversaciones:
 * - Si es hoy: "14:25"
 * - Si fue ayer: "Ayer"
 * - Si fue en los últimos 6 días: "Lunes", "Martes", etc.
 * - Si es más antiguo: "dd/MM/yy"
 */
export function formatChatSidebarTime(
    isoString?: string,
    labels: { today?: string; yesterday?: string } = {}
): string {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        const now = new Date();

        const isSameDay =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (isSameDay) {
            return date.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        }

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday =
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();

        if (isYesterday) {
            return labels.yesterday || 'Ayer';
        }

        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) {
            return date.toLocaleDateString('es-MX', { weekday: 'short' });
        }

        return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        });
    } catch {
        return '';
    }
}

/**
 * Separador de fecha flotante estilo WhatsApp entre mensajes
 */
export function formatMessageDateDivider(
    isoString: string,
    labels: { today?: string; yesterday?: string } = {}
): string {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        const now = new Date();

        const isSameDay =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (isSameDay) return labels.today || 'Hoy';

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday =
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();

        if (isYesterday) return labels.yesterday || 'Ayer';

        return date.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    } catch {
        return '';
    }
}
