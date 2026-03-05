export interface StorefrontItem {
  id: number;
  type: 'SERVICE' | 'PACKAGE' | 'PRODUCT' | 'COURSE'; // 🚀 AHORA SOPORTA LOS 4 TIPOS
  category: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  
  // 🩺 Campos de Servicio
  durationMinutes?: number;
  modality?: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  cancellationPolicy?: string;
  followUpPeriodDays?: number;

  // 🚀 Campos de Marketing (Compartidos)
  compareAtPrice?: number | null;
  searchTags?: string[];

  // 📦 NUEVOS CAMPOS: Productos Físicos (Farmacia)
  sku?: string;
  stockQuantity?: number;
  isDigital?: boolean;

  // 🎓 NUEVOS CAMPOS: Cursos y Contenido Digital
  contentUrl?: string;
}

export interface StorefrontData {
  providerId: number;
  displayName: string;
  slug: string;
  bio: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  previewVideoUrl?: string | null; 
  primaryColor: string;
  whatsappEnabled: boolean;
  instagramUrl: string | null;
  
  // Datos de Ubicación y Tienda
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  languages?: string[];
  cancellationPolicy?: string;
  tags?: string[]; 

  rating: number;
  reviewsCount: number;

  // 🚀 EL INVENTARIO COMPLETO SEPARADO
  services: StorefrontItem[];
  packages: StorefrontItem[];
  products: StorefrontItem[]; // 🚀 Nueva lista de Farmacia
  courses: StorefrontItem[];  // 🚀 Nueva lista de Cursos
}