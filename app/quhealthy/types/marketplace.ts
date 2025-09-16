// --- Tipos Primitivos para el Marketplace ---

// Representa una etiqueta o especialidad del proveedor
export interface Tag {
  name: string;
}

// Representa al autor de una reseña
export interface ReviewAuthor {
  name: string;
}

// Representa una reseña individual
export interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  providerResponse: string | null;
  createdAt: string;
  author: ReviewAuthor;
}

export interface Marketplace {
    storeName: string;
    storeSlug: string;
    storeBanner: string | null;
    storeLogo: string | null;
    customDescription: string | null;

  // Añade aquí cualquier otro campo del marketplace que necesites en el futuro



}

export interface ProviderData {
    id: number;
    name: string;
    marketplace: Marketplace;
    tags: Tag[];
}

// Representa un servicio individual del catálogo
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // en minutos
  imageUrl?: string | null;
  category: string;
}

// Representa un miembro del equipo (función premium)
export interface StaffMember {
  id: number;
  name: string;
  title: string; // Ej: "Nutrióloga Certificada"
  bio: string | null;
  imageUrl: string | null;
  specialties: string;
}


// --- El Tipo de Dato Principal para la Página de Perfil Público ---
// Esta es la estructura completa que une toda la información de un proveedor para su página pública.

export interface ProviderProfileData {
  id: number;
  storeName: string;
  storeSlug: string;
  storeLogo: string | null;
  storeBanner: string | null;
  customDescription: string | null;
  primaryColor: string;
  provider: {
    name: string;
    archetype: string;
  };
  services: Service[];
  staff: StaffMember[];
  reviews: {
    average: number;
    count: number;
    items: ReviewItem[];
  };
  tags: Tag[]; // Incluimos los tags también
}