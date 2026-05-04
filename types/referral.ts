export type ReferralStatus = 'PENDING' | 'ACTIVATED';

export interface ReferralItemDto {
  id: number;
  referredId: number;
  status: ReferralStatus;
  benefitType: string;
  createdAt: string;
  activatedAt: string | null;
}

export interface ReferralDashboardResponse {
  referralCode?: string; // Asegúrate de enviarlo desde el backend
  totalReferrals: number;
  activatedReferrals: number;
  pendingReferrals: number;
  history: ReferralItemDto[];
}
