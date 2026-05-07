// Ubicación: types/consumer-order.ts

export interface ConsumerOrderItem {
  id: number;
  catalogItemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  isDigital: boolean;
}

export interface ConsumerOrder {
  id: number;
  providerId: number;
  providerName?: string;
  orderStatus: 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  shippingAddress: string;
  trackingNumber?: string;
  createdAt: string;
  items: ConsumerOrderItem[];
}
