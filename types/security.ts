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

export interface ProviderSettingsResponse {
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  marketingEmailsOptIn: boolean;
  appointmentRemindersEnabled: boolean;
  loginAlertsEnabled: boolean;
}

export interface UpdateProviderSettingsRequest {
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  marketingEmailsOptIn: boolean;
  appointmentRemindersEnabled: boolean;
  loginAlertsEnabled: boolean;
}
