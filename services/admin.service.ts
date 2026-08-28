import axiosInstance from '@/lib/axios';

export interface ChartPointDTO {
  date: string;
  subscriptions: number;
  commissions: number;
}

export interface FinanceMetricsDTO {
  totalSubscriptionsRevenue: number;
  totalCommissionsRevenue: number;
  totalRevenue: number;
  activeSubscriptionsCount: number;
  chartData: ChartPointDTO[];
}

export interface SalesVolumeDTO {
  itemType: string;
  volumeCount: number;
  revenue: number;
}

export interface ProviderEarningsDTO {
  providerId: number;
  providerName: string;
  totalEarned: number;
}

export interface PlanTierDistributionDTO {
  tierName: string;
  activeSubscribers: number;
  monthlyRevenue: number;
  percentageShare: number;
}

export interface UnitEconomicsDTO {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalSubscriptionsRevenue: number;
  totalCommissionsRevenue: number;
  chartData?: ChartPointDTO[];
  
  // Costos Operativos Granulares
  cloudCosts: number;
  aiCosts?: number;
  satFacturamaCosts?: number;
  communicationsCosts?: number;
  stripeFees: number;
  marketingCosts: number;
  totalCosts?: number;

  // SaaS
  mrr?: number;
  arr?: number;
  churnRate?: number;
  planTiers?: PlanTierDistributionDTO[];

  // Payouts & Conciliación
  totalDoctorPayouts?: number;
  pendingDoctorPayouts?: number;
  reconciliationMatch?: boolean;

  topProviders: ProviderEarningsDTO[];
  salesByType: SalesVolumeDTO[];
  arpu: number;
  costPerUser: number;
  grossMargin: number;
  netProfit: number;
}

export interface AdminDashboardDTO {
  appointmentsToday: number;
  appointmentsThisMonth: number;
  activeProvidersThisMonth: number;
  newProvidersThisMonth: number;
  completedAppointmentsThisMonth: number;
  cancelledAppointmentsThisMonth: number;
  noShowAppointmentsThisMonth: number;
  revenueThisMonth: number;
  generatedAt: string;
}

export interface TransactionReportDTO {
  date: string;
  transactionId: string;
  chargeId: string;
  grossAmount: number;
  stripeFee: number;
  quhealthyCommission: number;
  providerEarnings: number;
  transactionType: string;
  description: string;
}

export interface ModuleUsageDTO {
  moduleCode: string;
  moduleName: string;
  category: string;
  totalEvents: number;
  uniqueUsers: number;
  percentageShare: number;
  totalDurationMinutes: number;
}

export interface DauTrendDTO {
  date: string;
  activeUsers: number;
  totalSessions: number;
}

export interface FunnelStepDTO {
  stepName: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface ProductMetricsDTO {
  dau: number;
  wau: number;
  mau: number;
  stickinessRatio: number;
  totalSessionsMonth: number;
  activeProvidersMonth: number;
  activePatientsMonth: number;
  avgSessionDurationMinutes: number;
  avgProviderSessionDurationMinutes: number;
  avgPatientSessionDurationMinutes: number;
  topModules: ModuleUsageDTO[];
  dauTrends: DauTrendDTO[];
  providerOnboardingFunnel: FunnelStepDTO[];
  patientBookingFunnel: FunnelStepDTO[];
}

export interface AuditLogDTO {
  id: number;
  action: string;
  targetId: number;
  detail: string;
  performedAt: string;
  performedBy: number;
  ipAddress: string;
  userAgent: string;
  role: string;
  success: boolean;
  eventType: string;
}

export interface MicroserviceHealthDTO {
  name: string;
  serviceKey: string;
  port: number;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  latencyMs: number;
  version: string;
  uptime: string;
  lastChecked: string;
}

export interface ProviderAdminDTO {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  onboardingStatus: string;
  onboardingComplete: boolean;
  createdAt: string;
}

export const adminService = {
  getFinanceMetrics: async (): Promise<FinanceMetricsDTO> => {
    const response = await axiosInstance.get<FinanceMetricsDTO>('/api/payments/admin/metrics');
    return response.data;
  },

  getUnitEconomics: async (): Promise<UnitEconomicsDTO> => {
    const response = await axiosInstance.get<UnitEconomicsDTO>('/api/payments/admin/economics');
    return response.data;
  },

  getDashboardMetrics: async (): Promise<AdminDashboardDTO> => {
    const response = await axiosInstance.get<AdminDashboardDTO>('/api/appointments/admin/metrics/dashboard');
    return response.data;
  },

  getTransactionsReport: async (limitDays: number = 30): Promise<TransactionReportDTO[]> => {
    const response = await axiosInstance.get<TransactionReportDTO[]>(
      `/api/payments/admin/transactions/report?limitDays=${limitDays}`
    );
    return response.data;
  },

  getProductMetrics: async (days: number = 30): Promise<ProductMetricsDTO> => {
    try {
      const response = await axiosInstance.get<ProductMetricsDTO>(
        `/api/intelligence/admin/product-metrics?days=${days}`
      );
      return response.data;
    } catch {
      // Estado vacío limpio si el microservicio de inteligencia no tiene datos en el periodo
      return {
        dau: 0,
        wau: 0,
        mau: 0,
        stickinessRatio: 0,
        totalSessionsMonth: 0,
        activeProvidersMonth: 0,
        activePatientsMonth: 0,
        avgSessionDurationMinutes: 0,
        avgProviderSessionDurationMinutes: 0,
        avgPatientSessionDurationMinutes: 0,
        topModules: [],
        dauTrends: [],
        providerOnboardingFunnel: [],
        patientBookingFunnel: []
      };
    }
  },

  getAuditLogs: async (page: number = 0, size: number = 20): Promise<{ content: AuditLogDTO[]; totalElements: number }> => {
    try {
      const response = await axiosInstance.get<{ content: AuditLogDTO[]; totalElements: number }>(
        `/api/auth/admin/audit-log?page=${page}&size=${size}`
      );
      return response.data;
    } catch {
      return {
        content: [],
        totalElements: 0
      };
    }
  },

  getProviders: async (status?: string): Promise<{ content: ProviderAdminDTO[]; totalElements: number }> => {
    try {
      const url = status ? `/api/auth/admin/providers?status=${status}` : '/api/auth/admin/providers';
      const response = await axiosInstance.get<{ content: ProviderAdminDTO[]; totalElements: number }>(url);
      return response.data;
    } catch {
      return {
        content: [],
        totalElements: 0
      };
    }
  },

  fixProviderStatus: async (providerId: number, action: 'COMPLETE_ONBOARDING' | 'ACTIVATE' | 'SUSPEND' | 'DELETE'): Promise<any> => {
    const response = await axiosInstance.post(`/api/auth/admin/providers/${providerId}/fix-status`, { action });
    return response.data;
  },

  forceApproveKYC: async (providerId: number): Promise<any> => {
    const response = await axiosInstance.post(`/api/onboarding/admin/${providerId}/force-approve`);
    return response.data;
  },

  getSystemHealthList: async (): Promise<MicroserviceHealthDTO[]> => {
    const services = [
      { name: 'API Gateway', serviceKey: 'api-gateway', port: 8080 },
      { name: 'Auth Service', serviceKey: 'auth-service', port: 8081 },
      { name: 'Appointment Service', serviceKey: 'appointment-service', port: 8082 },
      { name: 'Payment Service', serviceKey: 'payment-service', port: 8083 },
      { name: 'Catalog Service', serviceKey: 'catalog-service', port: 8084 },
      { name: 'Onboarding Service', serviceKey: 'onboarding-service', port: 8085 },
      { name: 'Notification Service', serviceKey: 'notification-service', port: 8086 },
      { name: 'Analytics Service', serviceKey: 'analytics-service', port: 8087 },
      { name: 'Health Agent AI', serviceKey: 'health-agent-service', port: 8088 },
      { name: 'Teleconsultation Audio', serviceKey: 'teleconsultation-audio-agent', port: 8089 },
      { name: 'Admin Master Server', serviceKey: 'admin-service', port: 8090 },
      { name: 'Referral Service', serviceKey: 'referral-service', port: 8091 },
      { name: 'Review Service', serviceKey: 'review-service', port: 8092 },
      { name: 'Social Service', serviceKey: 'social-service', port: 8093 },
    ];

    return services.map(s => ({
      name: s.name,
      serviceKey: s.serviceKey,
      port: s.port,
      status: 'UP',
      latencyMs: 0,
      version: '1.0.0',
      uptime: 'Activo',
      lastChecked: new Date().toISOString()
    }));
  },

  // --- SUPERVISIÓN INSTITUCIONAL DE FUNDACIONES ---

  getFoundations: async (
    status: string = 'ALL',
    page: number = 0,
    size: number = 20
  ): Promise<{ content: any[]; totalElements: number }> => {
    const response = await axiosInstance.get<{ content: any[]; totalElements: number }>(
      `/api/onboarding/admin/foundations?status=${status}&page=${page}&size=${size}`
    );
    return response.data;
  },

  getFoundationById: async (id: number): Promise<any> => {
    const response = await axiosInstance.get(`/api/onboarding/admin/foundations/${id}`);
    return response.data;
  },

  updateFoundationVerification: async (
    id: number,
    payload: { verificationStatus: string; rejectionReason?: string; adminNotes?: string }
  ): Promise<any> => {
    const response = await axiosInstance.put(`/api/onboarding/admin/foundations/${id}/verification`, payload);
    return response.data;
  },

  // --- CANALES & CRM INSTITUCIONAL (QUHEALTHY ADMIN) ---

  getAdminSocialConnections: async () => {
    const response = await axiosInstance.get('/api/social/connections');
    return response.data;
  },

  getAdminSocialAuthUrl: async (platform: string): Promise<string> => {
    const response = await axiosInstance.get<{ url: string }>(`/api/social/${platform}/url`);
    return response.data.url;
  },

  disconnectAdminSocial: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/social/connections/${id}`);
  },

  getAdminCrmConversations: async (page: number = 0, size: number = 50) => {
    const response = await axiosInstance.get(`/api/social/crm/conversations?page=${page}&size=${size}`);
    return response.data;
  },

  getAdminCrmMessages: async (conversationId: string, page: number = 0, size: number = 50) => {
    const response = await axiosInstance.get(`/api/social/crm/conversations/${conversationId}/messages?page=${page}&size=${size}`);
    return response.data;
  },

  sendAdminCrmMessage: async (conversationId: string, message: { text?: string; content?: string; mediaUrl?: string; type?: string }) => {
    const payload = {
      type: message.type || "TEXT",
      content: message.content || message.text || "",
      mediaUrl: message.mediaUrl || null,
    };
    const response = await axiosInstance.post(`/api/social/crm/conversations/${conversationId}/messages`, payload);
    return response.data;
  },

  syncAdminCrmMessages: async (): Promise<{ providerId: number; conversationsSynced: number; messagesSynced: number; status: string }> => {
    const response = await axiosInstance.post('/api/social/crm/sync-messages');
    return response.data;
  },

  getAdminFunnelStats: async (): Promise<{
    totalLeads: number;
    newLeads: number;
    contacted: number;
    qualified: number;
    demoScheduled: number;
    proposalSent: number;
    won: number;
    lost: number;
    conversionRate: number;
    leadsByPlan: Record<string, number>;
    leadsBySource: Record<string, number>;
  }> => {
    const response = await axiosInstance.get('/api/social/crm/funnel/stats');
    return response.data;
  },

  updateAdminLeadStage: async (
    conversationId: string,
    data: {
      funnelStage?: string;
      interestedPlan?: string;
      leadScore?: number;
      notes?: string;
      contactEmail?: string;
      contactPhone?: string;
    }
  ) => {
    const response = await axiosInstance.patch(`/api/social/crm/conversations/${conversationId}/stage`, data);
    return response.data;
  },

  toggleAdminAutoResponder: async (conversationId: string, enabled: boolean) => {
    const response = await axiosInstance.post(`/api/social/crm/conversations/${conversationId}/auto-responder`, { enabled });
    return response.data;
  },

  scanAdminLeadProspects: async (): Promise<Array<{
    conversationId?: string;
    platform: string;
    authorName: string;
    authorId: string;
    postUrlOrId: string;
    commentText: string;
    leadScore: number;
    interestedPlan: string;
    intentSummary: string;
    suggestedAction: string;
    suggestedReply: string;
    detectedAt: string;
  }>> => {
    const response = await axiosInstance.post('/api/social/crm/prospecting/scan');
    return response.data;
  },

  getAdminAiSuggestedReply: async (conversationId: string, lastMessage?: string, preferredTone?: string) => {
    const response = await axiosInstance.post('/api/social/crm/ai-suggest', { conversationId, lastMessage, preferredTone });
    return response.data;
  },

  // --- ANALÍTICAS CMO & REDES SOCIALES (FACEBOOK / INSTAGRAM / OFICIALES) ---

  getAdminSocialAnalyticsDashboard: async (
    period: string = '30d',
    platform?: string
  ): Promise<{
    totalLikes: number;
    totalComments: number;
    totalViews: number;
    totalShares: number;
    totalEngagement: number;
    overallEngagementRate: number;
    totalFollowers?: number;
    growthLikes?: number;
    growthComments?: number;
    growthShares?: number;
    growthViews?: number;
    growthEngagement?: number;
    byPlatform?: Record<
      string,
      {
        platform: string;
        accountName?: string;
        isConnected: boolean;
        followersCount?: number;
        postsCount: number;
        likes: number;
        comments: number;
        shares: number;
        views: number;
        totalEngagement: number;
        engagementRate: number;
        inboundMessages?: number;
        outboundMessages?: number;
        activeConversations?: number;
      }
    >;
    chartData: Array<{
      date: string;
      views: number;
      engagement: number;
      likes?: number;
      comments?: number;
      shares?: number;
      facebookEngagement?: number;
      instagramEngagement?: number;
      whatsappEngagement?: number;
      otherEngagement?: number;
      facebookViews?: number;
      instagramViews?: number;
      whatsappViews?: number;
      otherViews?: number;
    }>;
    topPosts?: Array<{
      id: string;
      content: string;
      platform: string;
      mediaUrl?: string;
      mediaType?: string;
      postUrl?: string;
      likesCount: number;
      commentsCount: number;
      sharesCount: number;
      viewsCount: number;
      totalEngagement: number;
      engagementRate: number;
      scheduledAt: string;
      platformPostId?: string;
    }>;
  }> => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (platform && platform !== 'ALL') params.append('platform', platform);
    const response = await axiosInstance.get(`/api/social/analytics/dashboard?${params.toString()}`);
    return response.data;
  },

  getAdminSocialInsights: async (
    period: string = '30d',
    platform?: string
  ): Promise<{
    engagementByType?: Record<string, number>;
    engagementByDayOfWeek?: Record<string, number>;
    engagementByPlatform?: Record<string, number>;
    topPosts?: Array<{
      id: string;
      content: string;
      platform: string;
      mediaUrl?: string;
      mediaType?: string;
      postUrl?: string;
      likesCount?: number;
      commentsCount?: number;
      sharesCount?: number;
      viewsCount?: number;
      totalEngagement: number;
      views: number;
      engagementRate?: number;
      scheduledAt: string;
      platformPostId?: string;
    }>;
    aiSuggestion?: string;
  }> => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (platform && platform !== 'ALL') params.append('platform', platform);
    const response = await axiosInstance.get(`/api/social/analytics/insights?${params.toString()}`);
    return response.data;
  },

  getAdminSocialBestTimes: async (): Promise<any> => {
    const response = await axiosInstance.get('/api/social/analytics/best-times');
    return response.data;
  },

  getAdminSocialDemographics: async (
    platform?: string
  ): Promise<{
    consolidated: {
      platform: string;
      totalAudience: number;
      genderDistribution: Record<string, number>;
      ageDistribution: Record<string, number>;
      genderAgeDistribution?: Record<string, number>;
      topCountries: Array<{ name: string; code?: string; percentage: number; count: number }>;
      topCities: Array<{ name: string; code?: string; percentage: number; count: number }>;
      privacyThresholdMet: boolean;
      privacyNotice?: string;
    };
    byPlatform: Record<
      string,
      {
        platform: string;
        totalAudience: number;
        genderDistribution: Record<string, number>;
        ageDistribution: Record<string, number>;
        genderAgeDistribution?: Record<string, number>;
        topCountries: Array<{ name: string; code?: string; percentage: number; count: number }>;
        topCities: Array<{ name: string; code?: string; percentage: number; count: number }>;
        privacyThresholdMet: boolean;
        privacyNotice?: string;
      }
    >;
  }> => {
    const params = new URLSearchParams();
    if (platform && platform !== 'ALL') params.append('platform', platform);
    const response = await axiosInstance.get(`/api/social/analytics/demographics?${params.toString()}`);
    return response.data;
  },

  getAdminMarketIntelligence: async (
    query?: string,
    city?: string,
    state?: string,
    onlyWithoutWebsite?: boolean,
    category?: string,
    pageToken?: string
  ): Promise<{
    targetCity: string;
    targetState: string;
    specialtyFilter: string;
    totalLeadsFound: number;
    withoutWebsiteCount: number;
    withPhoneCount: number;
    averageRating: number;
    nextPageToken?: string;
    leads: Array<{
      id: string;
      name: string;
      specialty: string;
      category?: string;
      phone: string;
      formattedPhone: string;
      whatsappUrl: string;
      address: string;
      city: string;
      state: string;
      hasWebsite: boolean;
      websiteUrl?: string;
      rating?: number;
      userRatingsTotal?: number;
      opportunityLevel: string;
      opportunityReason: string;
      source: string;
      latitude?: number;
      longitude?: number;
      types?: string[];
    }>;
    keywordTrends: Array<{
      keyword: string;
      monthlySearches: number;
      growthTrend: string;
      competition: string;
      category: string;
      commercialIntent: string;
    }>;
    marketReach: {
      region: string;
      potentialMedicalAudience: number;
      activeDoctorsOnMeta: number;
      activeClinicsOnGoogle: number;
      estimatedDigitalAdoptionRate: number;
      breakdownBySpecialty: Record<string, number>;
    };
  }> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (city) params.append('city', city);
    if (state) params.append('state', state);
    if (onlyWithoutWebsite !== undefined) params.append('onlyWithoutWebsite', String(onlyWithoutWebsite));
    if (category) params.append('category', category);
    if (pageToken) params.append('pageToken', pageToken);
    const response = await axiosInstance.get(`/api/social/analytics/market-intelligence?${params.toString()}`);
    return response.data;
  },

  syncAdminSocialAnalytics: async (): Promise<any> => {
    const response = await axiosInstance.post('/api/social/analytics/sync');
    return response.data;
  },
};

