import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  formatWhatsAppNumber,
  formatWhatsAppUrl,
  resolveStoreContactPhone,
} from "@/lib/whatsapp";
import { StorefrontHero } from "@/components/store/StorefrontHero";
import { StorefrontData } from "@/types/storefront";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, options?: any) => {
    if (key === "contact_whatsapp") return "Contactar por WhatsApp";
    if (key === "call_phone") return "Llamar";
    if (key === "about_specialist") return "Sobre el Especialista";
    return options?.defaultValue || key;
  },
}));

// Mock child components to keep render lightweight
vi.mock("@/components/ui/FavoriteButton", () => ({
  FavoriteButton: () => <button data-testid="favorite-btn">Fav</button>,
}));
vi.mock("@/components/store/QuScoreModal", () => ({
  QuScoreModal: () => null,
}));
vi.mock("@/components/store/QuickAvailability", () => ({
  QuickAvailability: () => null,
}));

describe("lib/whatsapp: Phone formatting and resolution", () => {
  it("formats standard Mexican 10-digit number with country code 52", () => {
    expect(formatWhatsAppNumber("6688821862")).toBe("526688821862");
    expect(formatWhatsAppNumber("(668) 882-1862")).toBe("526688821862");
    expect(formatWhatsAppNumber("+52 668 882 1862")).toBe("526688821862");
  });

  it("handles numbers already containing international country code 52", () => {
    expect(formatWhatsAppNumber("526688821862")).toBe("526688821862");
    expect(formatWhatsAppNumber("5216688821862")).toBe("5216688821862");
  });

  it("strips non-digits and returns empty string when invalid", () => {
    expect(formatWhatsAppNumber("")).toBe("");
    expect(formatWhatsAppNumber("   ")).toBe("");
    expect(formatWhatsAppNumber("abc-xyz")).toBe("");
  });

  it("generates wa.me URL with normalized destination phone and message", () => {
    const url = formatWhatsAppUrl("6688821862", "Hola AsapMedix");
    expect(url).toBe("https://wa.me/526688821862?text=Hola%20AsapMedix");
  });

  it("NEVER generates empty wa.me/?text= when phone is missing", () => {
    const url = formatWhatsAppUrl("", "Hola");
    expect(url).toBe("");
  });

  it("resolves phone from store.phone first", () => {
    const store: Partial<StorefrontData> = {
      displayName: "Clínica Test",
      phone: "6681234567",
      bio: "Otra info",
    };
    expect(resolveStoreContactPhone(store)).toBe("6681234567");
  });

  it("resolves phone from store.bio when store.phone is null (ASAP Medix case)", () => {
    const store: Partial<StorefrontData> = {
      displayName: "AsapMedix",
      phone: null,
      bio: "Proveedor de insumos médicos COFEPRIS 2625015006B00008. Cotizaciones sin compromiso al 6688821862",
    };
    expect(resolveStoreContactPhone(store)).toBe("6688821862");
  });

  it("returns null when no phone exists in phone, locations or bio", () => {
    const store: Partial<StorefrontData> = {
      displayName: "Tienda Sin Teléfono",
      phone: null,
      bio: "Solo vendemos en línea sin teléfono registrado",
    };
    expect(resolveStoreContactPhone(store)).toBeNull();
  });
});

describe("StorefrontHero: WhatsApp & Direct Contact Buttons", () => {
  const baseStore: StorefrontData = {
    providerId: 34,
    displayName: "AsapMedix",
    slug: "asap-medix",
    bio: "Insumos médicos de alta calidad",
    logoUrl: null,
    bannerUrl: null,
    primaryColor: "#059669",
    whatsappEnabled: true,
    instagramUrl: null,
    phone: "6688821862",
    rating: 5,
    reviewsCount: 10,
    services: [],
    packages: [],
    products: [],
    courses: [],
  };

  it("renders WhatsApp button with correct destination phone when store.phone is set", () => {
    render(<StorefrontHero store={baseStore} isFavorited={false} />);

    const waBtn = screen.getByTestId("storefront-whatsapp-btn");
    expect(waBtn).toBeInTheDocument();
    expect(waBtn).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/526688821862?text=")
    );

    const phoneBtn = screen.getByTestId("storefront-phone-btn");
    expect(phoneBtn).toBeInTheDocument();
    expect(phoneBtn).toHaveAttribute("href", "tel:6688821862");
  });

  it("extracts phone from bio and creates WhatsApp button when store.phone is null", () => {
    const storeWithBioPhone: StorefrontData = {
      ...baseStore,
      phone: null,
      bio: "Cotizaciones sin compromiso al 6688821862",
    };

    render(<StorefrontHero store={storeWithBioPhone} isFavorited={false} />);

    const waBtn = screen.getByTestId("storefront-whatsapp-btn");
    expect(waBtn).toBeInTheDocument();
    expect(waBtn).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/526688821862?text=")
    );
  });

  it("does NOT render WhatsApp button or broken wa.me/?text= link when no phone is available", () => {
    const storeWithoutPhone: StorefrontData = {
      ...baseStore,
      phone: null,
      bio: "Perfil sin número de contacto",
    };

    render(<StorefrontHero store={storeWithoutPhone} isFavorited={false} />);

    expect(screen.queryByTestId("storefront-whatsapp-btn")).not.toBeInTheDocument();
    expect(screen.queryByTestId("storefront-phone-btn")).not.toBeInTheDocument();
  });
});
