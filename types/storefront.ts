import { GalleryImage } from './store';

export interface StorefrontItem {
  id: number;
  providerId?: number;
  type: 'SERVICE' | 'PACKAGE' | 'PRODUCT' | 'COURSE'; // 🚀 AHORA SOPORTA LOS 4 TIPOS
  category: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  quantity?: number; // Solo para productos físicos (Stock)
  cartQuantity?: number; // 🚀 NUEVO: Cantidad en el carrito
  imageUrl?: string;
  galleryImages?: GalleryImage[];
  requiresEvaluation?: boolean;
  status?: string;
  
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
  stockQuantity?: number | null;
  isDigital?: boolean;

  // 💊 Farmacia / Cumplimiento
  requiresPrescription?: boolean;
  activeIngredient?: string;
  manufacturer?: string;

  // 🎓 NUEVOS CAMPOS: Cursos y Contenido Digital
  contentUrl?: string;

  // 📦 NUEVOS CAMPOS: Paquetes
  packageContents?: StorefrontItem[];
  isPackage?: boolean;
}

export interface StorefrontLocation {
  id: number;
  providerId: number;
  name: string;
  isMain: boolean;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  googlePlaceId?: string;
  latitude?: number;
  longitude?: number;
}

export interface StorefrontStaff {
  id: number;
  providerId: number;
  name: string;
  specialty?: string;
  credentials?: string;
  bio?: string;
  imageUrl?: string;
  role?: string;
  assignedServices?: {
    catalogItemId: number;
    catalogItemName?: string;
  }[];
}

export interface StorefrontData {
  providerId: number;
  providerType?: 'DOCTOR' | 'CLINIC' | 'FOUNDATION' | 'SUPPLIER' | 'PHARMACY';
  doctorLicense?: string;
  specialty?: string;
  cofeprisNotice?: string;
  coldChainCertified?: boolean;
  taxReceiptAvailable?: boolean;
  b2bQuoteAvailable?: boolean;
  displayName: string;
  slug: string;
  bio: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  previewVideoUrl?: string | null; 
  primaryColor: string;
  whatsappEnabled: boolean;
  instagramUrl: string | null;
  phone?: string | null;
  
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
  staff?: StorefrontStaff[];  // 🚀 Equipo y Profesionales
  staffMembers?: StorefrontStaff[];
  locations?: StorefrontLocation[]; // 🚀 Sedes y Ubicaciones
  
  
  galleryImages?: GalleryImage[];
}