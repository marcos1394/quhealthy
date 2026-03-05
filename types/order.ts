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
}

export interface ShipOrderRequest {
  trackingNumber: string;
}