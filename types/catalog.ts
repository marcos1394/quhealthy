// types/catalog.ts

export type ItemType = 'SERVICE' | 'PRODUCT' | 'PACKAGE';
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
  imageUrl?: string; // 📸 Agregado para GCP
  
  // Específico de Servicios
  durationMinutes?: number;
  modality?: ServiceModality;
  cancellationPolicy?: CancellationPolicy | string;
  followUpPeriodDays?: number;

  // Específico de Paquetes
  packageItemIds?: number[];
  packageContents?: any[]; // Resumen que manda el backend
}

// Interfaz para la UI de Servicios
export interface UI_Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  category: string; // 🚀 NUEVO Y OBLIGATORIO
  price: number;
  serviceDeliveryType: ServiceDeliveryType;
  cancellationPolicy: CancellationPolicy;
  followUpPeriodDays?: number;
  imageUrl?: string; // 📸 Agregado
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}

// Interfaz para la UI de Paquetes
export interface UI_Package {
  id: number;
  name: string;
  description: string;
  category?: string; // 🚀 NUEVO CAMPO OPCIONAL
  price: number;
  serviceIds: number[];
  imageUrl?: string; // 📸 Agregado
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}