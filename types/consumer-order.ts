// Ubicación: types/consumer-order.ts

export interface ConsumerOrderItem {
  id: number;
  catalogItemId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  isDigital: boolean;
}

export interface ConsumerOrder {
  id: number;
  providerId: number;
  providerName?: string;
  orderStatus: 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  shippingAddress: string;

  // 🚀 CAMPOS LOGÍSTICOS
  trackingNumber?: string;
  shippingCarrier?: string;
  trackingUrl?: string;

  createdAt: string;
  items: ConsumerOrderItem[];
}

