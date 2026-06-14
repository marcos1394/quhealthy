export interface ConsumerWalletResponse {
  id?: number;
  consumerId?: number;
  balance: number;
  currency?: string;
  expirationDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletTopUpRequest {
  amount: number;
}

export interface WalletTopUpResponse {
  url: string;
}
