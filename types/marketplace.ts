export interface ProviderData {
  id: string | number;
  name: string;
  category: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  
  // Coordenadas para el mapa (Google Maps)
  lat: number;
  lng: number;
  
  // Datos de contacto/ubicación adicionales
  address?: string;
  phone?: string;
  email?: string;
  
  // Precios base (para mostrar en la tarjeta)
  priceStart?: number;
  currency?: string;
}