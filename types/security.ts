export interface MfaSetupResponse {
  secret: string;
  qrCodeUri: string;
}

export interface MfaEnableResponse {
  recoveryCodes: string[];
}

export interface ActiveSessionResponse {
  sessionId: string;
  deviceName: string;
  ipAddress: string;
  lastActiveAt: string;
  current: boolean;
}
