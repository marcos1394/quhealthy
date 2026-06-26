/**
 * Convierte un timestamp ISO con zona (ej. "2026-06-25T18:51:23.123Z")
 * a la hora local del dispositivo.
 *
 * IMPORTANTE: requiere que el backend mande Instant/OffsetDateTime (con "Z").
 * Si el backend manda un LocalDateTime sin zona, el navegador interpretará
 * esa hora como si YA fuera local, y el resultado quedará desfasado
 * (justo el bug que estábamos resolviendo).
 */
export function formatMessageTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatLastSeen(isoString?: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMin = Math.round((now.getTime() - date.getTime()) / 60000);

    if (diffMin < 1) return 'Activo justo ahora';
    if (diffMin < 60) return `Activo hace ${diffMin} min`;

    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `Activo hace ${diffHours} h`;

    return `Últ. vez ${date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}`;
}