/**
 * 📲 WhatsApp & Phone Resolution Utilities
 * Provee formateo estándar internacional para WhatsApp (especialmente México +52)
 * y resolución inteligente de teléfonos de contacto en tiendas y proveedores.
 */

import { StorefrontData } from "@/types/storefront";

/**
 * Limpia y normaliza un número telefónico para WhatsApp.
 * - 10 dígitos (México): Se agrega prefijo internacional '52' -> '526688821862'
 * - 12 dígitos que ya inician con '52': Se mantiene intacto.
 * - 13 dígitos con formato móvil histórico '521': Se mantiene intacto.
 * - Si está vacío o no tiene dígitos: Retorna cadena vacía.
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (!clean) return "";

  // Remover ceros iniciales (e.g., prefijos locales antiguos como 044 / 045)
  if (clean.startsWith("0")) {
    clean = clean.replace(/^0+/, "");
  }

  // Si son 10 dígitos (número estándar mexicano), agregar prefijo país 52
  if (clean.length === 10) {
    return `52${clean}`;
  }

  return clean;
}

/**
 * Genera el enlace seguro de WhatsApp (wa.me).
 * NUNCA genera un enlace 'https://wa.me/?text=...' sin número de destino
 * para evitar abrir WhatsApp con un diálogo vacío de reenvío de contactos.
 */
export function formatWhatsAppUrl(phone: string, text?: string): string {
  const normalizedNumber = formatWhatsAppNumber(phone);
  if (!normalizedNumber) return "";

  if (!text) {
    return `https://wa.me/${normalizedNumber}`;
  }

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Resuelve el teléfono de contacto de una tienda o prestador con estrategia de fallback en cascada:
 * 1. Campo directo `store.phone`
 * 2. Campos alternativos `contactPhone`, `whatsappNumber`, `whatsappPhone`
 * 3. Teléfono de sucursales/ubicaciones (`locations`)
 * 4. Extracción inteligente desde la biografía si el prestador incluyó su número (ej. AsapMedix "Cotizaciones sin compromiso al 6688821862")
 */
export function resolveStoreContactPhone(store?: Partial<StorefrontData> | null): string | null {
  if (!store) return null;

  // 1. Teléfono directo configurado en la tienda
  if (store.phone && typeof store.phone === "string") {
    const clean = store.phone.replace(/\D/g, "");
    if (clean.length >= 7) {
      return store.phone.trim();
    }
  }

  // 2. Propiedades alternas de contacto
  const record = store as Record<string, unknown>;
  const altCandidates = [record.contactPhone, record.whatsappNumber, record.whatsappPhone];
  for (const alt of altCandidates) {
    if (alt && typeof alt === "string") {
      const clean = alt.replace(/\D/g, "");
      if (clean.length >= 7) {
        return alt.trim();
      }
    }
  }

  // 3. Sucursales físicas con teléfono
  if (Array.isArray(store.locations)) {
    const mainLoc = store.locations.find((l: any) => l.isMain && l.phone);
    if (mainLoc && (mainLoc as any).phone) {
      return String((mainLoc as any).phone).trim();
    }

    const anyLoc = store.locations.find((l: any) => l.phone);
    if (anyLoc && (anyLoc as any).phone) {
      return String((anyLoc as any).phone).trim();
    }
  }

  // 4. Extracción inteligente de la biografía (ej. AsapMedix "Cotizaciones sin compromiso al 6688821862")
  if (store.bio && typeof store.bio === "string") {
    // Prioridad 1: Buscar números con contexto explícito de contacto (cotizaciones, tel, cel, wa, whatsapp, contacto)
    const contextMatch = store.bio.match(
      /(?:cotizaciones?|whatsapp|wa|tel(?:[eé]fono)?|cel(?:ular)?|contacto|citas?|info|informes?)[^\d\n\r+]{0,25}(?:\+?52\s?)?(?:1\s?)?([1-9]\d{9})(?![a-zA-Z0-9])/i
    );
    if (contextMatch && contextMatch[1]) {
      return contextMatch[1].trim();
    }

    // Prioridad 2: Buscar números formateados con separadores (ej: 668-882-1862 o 668 882 1862)
    const formattedMatch = store.bio.match(
      /(?<![a-zA-Z0-9])(?:\+?52[\s.-]?)?(?:1[\s.-]?)?([1-9]\d{2}[\s.-]\d{3}[\s.-]\d{4})(?![a-zA-Z0-9])/
    );
    if (formattedMatch && formattedMatch[1]) {
      return formattedMatch[1].replace(/\D/g, "");
    }

    // Prioridad 3: Buscar cualquier número de 10 dígitos aislado ignorando líneas regulatorias/legales
    const lines = store.bio.split("\n");
    for (const line of lines) {
      if (/cofepris|licencia|tr[aá]mite|folio|rfc|curp/i.test(line)) continue;
      const match = line.match(/(?<![a-zA-Z0-9])(?:\+?52\s?)?(?:1\s?)?([1-9]\d{9})(?![a-zA-Z0-9])/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }

  return null;
}
