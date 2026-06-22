export const COOKIE_CONSENT_KEY = "quhealthy_cookie_consent";
export const COOKIE_POLICY_VERSION = "2026-06-18";

export interface CookieConsentRecord {
  essential: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  policyVersion: string;
}

export type ConsentChoice = Pick<CookieConsentRecord, "functional" | "analytics" | "marketing">;

export const ALL_ACCEPTED: ConsentChoice = { functional: true, analytics: true, marketing: true };
export const ONLY_ESSENTIAL: ConsentChoice = { functional: false, analytics: false, marketing: false };

export function readCookieConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.policyVersion === COOKIE_POLICY_VERSION &&
      typeof parsed.functional === "boolean" &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.marketing === "boolean"
    ) {
      return { essential: true, ...parsed };
    }
    return null;
  } catch {
    return null;
  }
}
