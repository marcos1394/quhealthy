// types/orders.ts

export type OrderStatus = 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface OrderItemDto {
  catalogItemId: number;
  itemName: string;
  itemType: string;
  quantity: number;
  isDigital: boolean;
}

export interface OrderResponseDto {
  id: number;
  consumerName: string;
  consumerEmail: string;
  shippingAddress: string;
  trackingNumber: string | null;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  currency: string;
  createdAt: string;
  items: OrderItemDto[];
  prescriptionUrls?: string;
  prescriptionApproved?: boolean; // 🚀 NUEVO: Agregar este campo (lo puse opcional para compatibilidad)
  rejectionReason?: string;
  packageEvidenceUrls?: string; // 🚀 NUEVA LÍNEA
}

export interface ShipOrderRequest {
  trackingNumber: string;
  shippingCarrier?: string;
  packageEvidenceUrls?: string; // 🚀 NUEVA LÍNEA
}