export interface AgentMarketplaceSearchRequest {
  query?: string;
  specialty?: string;
  city?: string;
  maxPriceMxn?: number;
  requiresCertified?: boolean;
  preferredDate?: string;
  limit?: number;
  clientAgentName?: string;
}

export interface AgentDoctorQuote {
  providerId: number;
  doctorName: string;
  specialty: string;
  clinicName: string;
  city: string;
  address: string;
  photoUrl?: string;
  cedulaProfesional: string;
  isCertified: boolean;
  quScore: number;
  reviewCount: number;
  serviceId: number;
  serviceName: string;
  durationMinutes: number;
  basePriceMxn: number;
  finalPriceMxn: number;
  discountPercentage: number;
  meetsBudget: boolean;
  availableSlots: string[];
  nextAvailableSlot: string;
  bookingUrl: string;
  holdPayload?: Record<string, unknown>;
}

export interface AgentMarketplaceSearchResponse {
  extractedCriteria: {
    specialty?: string;
    city?: string;
    maxPriceMxn?: number;
    requiresCertified?: boolean;
    rawQuery?: string;
  };
  totalFound: number;
  quotes: AgentDoctorQuote[];
  regulatoryDisclaimer: string;
  mcpTool: string;
  timestamp: string;
}

export interface McpJsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface McpJsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: Record<string, unknown>;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}
