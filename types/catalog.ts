// types/catalog.ts

import { GalleryImage } from './store';

export type ItemType = 'SERVICE' | 'PRODUCT' | 'PACKAGE' | 'COURSE' | 'SUPPLY';
export type ServiceModality = 'IN_PERSON' | 'ONLINE' | 'HYBRID';
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict';
export type ServiceDeliveryType = 'in_person' | 'video_call' | 'hybrid';

// Lo que enviamos/recibimos del Backend
export interface CatalogItemDTO {
  id?: number;
  providerId?: number;
  type: ItemType;
  name: string;
  category?: string;
  description?: string;
  price: number;
  requiresEvaluation?: boolean;
  imageUrl?: string; 
  galleryImages?: GalleryImage[]; 
  
  // Específico de Servicios
  durationMinutes?: number;
  modality?: ServiceModality;
  cancellationPolicy?: CancellationPolicy | string;
  followUpPeriodDays?: number;

  // 📦 Específico E-commerce (Productos Físicos / Farmacia)
  sku?: string;
  stockQuantity?: number;
  stockAlertThreshold?: number; // 🚨 NUEVO
  isDigital?: boolean;
  activeIngredient?: string;
  manufacturer?: string;
  requiresPrescription?: boolean;

  // 🎓 Específico Cursos / Contenido Digital
  contentUrl?: string;

  // Específico de Paquetes
  packageItems?: { itemId: number; quantity: number }[];
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
  requiresEvaluation?: boolean;
  serviceDeliveryType: ServiceDeliveryType;
  cancellationPolicy: CancellationPolicy;
  followUpPeriodDays?: number;
  imageUrl?: string; 
  galleryImages?: GalleryImage[];
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
  packageItems?: {
    id: number;
    name: string;
    type: 'SERVICE' | 'PRODUCT';
    imageUrl?: string;
    price: number;
    quantity: number;
  }[];
  imageUrl?: string; 
  galleryImages?: GalleryImage[];
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
  stockAlertThreshold?: number; // 🚨 NUEVO
  sku?: string;
  imageUrl?: string;
  
  // 💊 Campos Farmacéuticos y COFEPRIS
  activeIngredient?: string;
  manufacturer?: string;
  requiresPrescription?: boolean;
  cofeprisCategory?: string;
  isAntibiotic?: boolean;
  requiresPhysicalRetention?: boolean;
  allowsInterstateShipping?: boolean;
  technicalSheetUrl?: string;

  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}

// 🎓 NUEVO: Interfaz para la UI de Cursos Digitales (LMS)
export interface CourseLesson {
  id?: number;
  moduleId?: number;
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  orderIndex: number;
  isFreePreview?: boolean;
}

export interface CourseModule {
  id?: number;
  catalogItemId?: number;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: CourseLesson[];
}

export interface UI_Course {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  contentUrl: string; // Enlace del video/PDF (Legacy, a depreciar)
  imageUrl?: string;
  curriculum?: CourseModule[]; // Nuevo: Plan de estudios LMS
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
  minimumPassingScore?: number;
  hasCertificate?: boolean;
  certificateTemplateColor?: string;
}


// 📦 NUEVO: Interfaz para la UI de Insumos Internos
export interface UI_Supply {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number; // Costo interno (opcional)
  stockQuantity: number;
  stockAlertThreshold?: number;
  sku?: string;
  imageUrl?: string;
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}

// 🏢 NUEVO: Interfaz para Proveedores
export interface UI_Supplier {
  id: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
}

// 📦 NUEVO: Interfaz para Órdenes de Compra
export interface UI_PurchaseOrder {
  id: number;
  supplier: UI_Supplier;
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';
  paymentMethod?: 'CASH' | 'TRANSFER' | 'CREDIT';
  notes?: string;
  items: UI_PurchaseOrderItem[];
}

export interface UI_PurchaseOrderItem {
  id: number;
  catalogItemId: number;
  catalogItemName: string;
  catalogItemSku?: string;
  quantity: number;
  unitCost: number;
  totalLineCost: number;
}