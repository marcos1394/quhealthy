// types/catalog.ts

export type ItemType = 'SERVICE' | 'PRODUCT' | 'PACKAGE' | 'COURSE'; // 🚀 NUEVOS TIPOS
export type ServiceModality = 'IN_PERSON' | 'ONLINE' | 'HYBRID';
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict';
export type ServiceDeliveryType = 'in_person' | 'video_call' | 'hybrid';

// Lo que enviamos/recibimos del Backend
export interface CatalogItemDTO {
  id?: number;
  type: ItemType;
  name: string;
  category?: string;
  description?: string;
  price: number;
  imageUrl?: string; 
  
  // Específico de Servicios
  durationMinutes?: number;
  modality?: ServiceModality;
  cancellationPolicy?: CancellationPolicy | string;
  followUpPeriodDays?: number;

  // 📦 Específico E-commerce (Productos Físicos)
  sku?: string;
  stockQuantity?: number;
  isDigital?: boolean;

  // 🎓 Específico Cursos / Contenido Digital
  contentUrl?: string;

  // Específico de Paquetes
  packageItemIds?: number[];
  packageContents?: any[]; 
}

// Interfaz para la UI de Servicios
export interface UI_Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  category: string; 
  price: number;
  serviceDeliveryType: ServiceDeliveryType;
  cancellationPolicy: CancellationPolicy;
  followUpPeriodDays?: number;
  imageUrl?: string; 
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}

// Interfaz para la UI de Paquetes
export interface UI_Package {
  id: number;
  name: string;
  description: string;
  category?: string; 
  price: number;
  serviceIds: number[];
  imageUrl?: string; 
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}

// 📦 NUEVO: Interfaz para la UI de Productos Físicos
export interface UI_Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  sku?: string;
  imageUrl?: string;
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}

// 🎓 NUEVO: Interfaz para la UI de Cursos Digitales
export interface UI_Course {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  contentUrl: string; // Enlace del video/PDF
  imageUrl?: string;
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}