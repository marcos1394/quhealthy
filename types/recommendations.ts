// types/recommendations.ts

/**
 * DTO de recomendación de paquete de salud retornado por el motor del backend.
 * Mapea PackageRecommendationDto del catalog_service.
 */
export interface PackageRecommendation {
  /** ID del CatalogItem (PACKAGE) */
  id: number;

  /** Nombre del paquete */
  name: string;

  /** Descripción del paquete */
  description: string | null;

  /** Precio actual */
  price: number;

  /** Moneda (MXN, USD) */
  currency: string;

  /** Precio original tachado (si hay descuento) */
  compareAtPrice: number | null;

  /** Razón dinámica de la recomendación: "Basado en tu historial", "Paquete recomendado", etc. */
  reasonBadge: string;

  /** Nombre del proveedor/clínica */
  providerName: string;

  /** ID del proveedor */
  providerId: number;

  /** Slug del proveedor para construir el link de la tienda */
  providerSlug: string | null;

  /** Rating promedio (0.0–5.0) */
  averageRating: number | null;

  /** Total de reseñas */
  reviewCount: number | null;

  /** URL de imagen del paquete (opcional) */
  imageUrl: string | null;
}
