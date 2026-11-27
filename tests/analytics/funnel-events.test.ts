import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sanitizeAnalyticsPayload,
  trackFunnelEvent,
  trackProviderFunnel,
  trackPatientFunnel,
  trackEcommerceEvent,
  trackReferralInviteSent,
} from "@/lib/analytics/funnel-events";

describe("Funnel Events & Anti-PII Guard (MKT-ANL-01)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).gtag = vi.fn();
  });

  it("sanitizes forbidden PII keys like email, phone, name, clinicalNotes", () => {
    const dirtyPayload = {
      specialty: "Cardiología",
      city: "CDMX",
      email: "doctor@quhealthy.org",
      phone: "5512345678",
      patientName: "Juan Pérez",
      clinicalNotes: "Paciente refiere dolor torácico",
      stepNumber: 1,
    };

    const clean = sanitizeAnalyticsPayload(dirtyPayload as any);

    expect(clean.specialty).toBe("Cardiología");
    expect(clean.city).toBe("CDMX");
    expect(clean.stepNumber).toBe(1);
    expect(clean.email).toBeUndefined();
    expect(clean.phone).toBeUndefined();
    expect(clean.patientName).toBeUndefined();
    expect(clean.clinicalNotes).toBeUndefined();
  });

  it("detects and rejects string values matching email or phone regex even under custom keys", () => {
    const sneakingPayload = {
      userField: "sneaky-email@example.com",
      notesCustom: "+52 55 1234 5678",
      validCode: "CARDIO_2026",
    };

    const clean = sanitizeAnalyticsPayload(sneakingPayload as any);

    expect(clean.validCode).toBe("CARDIO_2026");
    expect(clean.userField).toBeUndefined();
    expect(clean.notesCustom).toBeUndefined();
  });

  it("calls window.gtag with sanitized parameters for provider funnel", () => {
    const dispatched = trackProviderFunnel("view_business_landing", {
      leadSource: "organic_search",
      city: "Guadalajara",
    });

    expect(dispatched).toBe(true);
    expect((window as any).gtag).toHaveBeenCalledTimes(1);
    expect((window as any).gtag).toHaveBeenCalledWith(
      "event",
      "view_business_landing",
      {
        funnel_type: "provider",
        leadSource: "organic_search",
        city: "Guadalajara",
      }
    );
  });

  it("calls window.gtag with sanitized parameters for patient funnel", () => {
    const dispatched = trackPatientFunnel("booking_confirmed", {
      specialty: "Dermatología",
      consultationType: "telemedicine",
      providerId: 42,
    });

    expect(dispatched).toBe(true);
    expect((window as any).gtag).toHaveBeenCalledTimes(1);
    expect((window as any).gtag).toHaveBeenCalledWith(
      "event",
      "booking_confirmed",
      {
        funnel_type: "patient",
        specialty: "Dermatología",
        consultationType: "telemedicine",
        providerId: 42,
      }
    );
  });

  it("dispatches referral_invite_sent with channel and role without PII (MKT-REF-01)", () => {
    const dispatched = trackReferralInviteSent("whatsapp", "provider");

    expect(dispatched).toBe(true);
    expect((window as any).gtag).toHaveBeenCalledTimes(1);
    expect((window as any).gtag).toHaveBeenCalledWith(
      "event",
      "referral_invite_sent",
      {
        channel: "whatsapp",
        referrer_role: "provider",
        funnel_type: "provider",
      }
    );
  });

  it("dispatches standard GA4 ecommerce events (view_item, add_to_cart, begin_checkout, sign_up) without PII", () => {
    const dispatched = trackEcommerceEvent("view_item", {
      item_id: "284",
      item_category: "PRODUCT",
      value: 4500,
      currency: "MXN",
      email: "should-be-stripped@example.com",
    });

    expect(dispatched).toBe(true);
    expect((window as any).gtag).toHaveBeenCalledWith("event", "view_item", {
      item_id: "284",
      item_category: "PRODUCT",
      value: 4500,
      currency: "MXN",
    });
  });

  it("never dispatches GA4 events when current path is an /admin route", () => {
    window.history.pushState({}, "", "/es/admin/dashboard");
    const dispatched = trackEcommerceEvent("view_item", { item_id: "1" });
    expect(dispatched).toBe(false);
    expect((window as any).gtag).not.toHaveBeenCalled();
    window.history.pushState({}, "", "/es");
  });
});
