import type { AbstractIntlMessages } from "next-intl";

/**
 * Utilidad para filtrar los mensajes enviados al cliente por grupo de rutas.
 * Evita serializar los ~560 KB del diccionario completo en cada página pública,
 * de autenticación o de onboarding, reduciendo el payload RSC/HTML entre 73% y 98%.
 */
export function pickMessages(
  messages: AbstractIntlMessages,
  namespaces: readonly string[]
): AbstractIntlMessages {
  const picked: Record<string, unknown> = {};
  for (const ns of namespaces) {
    if (ns in messages) {
      picked[ns] = messages[ns];
    }
  }
  return picked as AbstractIntlMessages;
}

/** Namespaces mínimos necesarios en el RootLayout (shell global + vistas sueltas). */
export const ROOT_NAMESPACES = [
  "CookieConsent",
  "Errors",
  "LocationPrompt",
  "PatientCheckout",
  "PublicPrescription",
  "PulsoAssistant",
  "WidgetRenderer",
] as const;

/** Rutas públicas (Landing, Discover, Storefronts, QUMarket, Pricing, Legal, Facturación). */
export const PUBLIC_NAMESPACES = [
  ...ROOT_NAMESPACES,
  "ActiveCreditsBanner",
  "AiCapabilities",
  "AuthGateModal",
  "AuthProvider",
  "Cart",
  "Checkout",
  "CourseCurriculum",
  "Cta",
  "Discover",
  "FAQ",
  "Footer",
  "Hero",
  "Intelligence",
  "Legal",
  "MarketplaceShowcase",
  "Navbar",
  "NotificationBell",
  "PlatformMobileNavbar",
  "PlatformModules",
  "Pricing",
  "ProviderScore",
  "PublicAbout",
  "PublicAcademy",
  "PublicBlog",
  "PublicBusiness",
  "PublicCareers",
  "PublicContact",
  "PublicCookies",
  "PublicFoundations",
  "PublicPrivacy",
  "PublicReturns",
  "PublicSuppliers",
  "PublicTerms",
  "QuScoreModal",
  "QuickAvailability",
  "SecurityTrust",
  "SidebarNav",
  "SpecializedJourneys",
  "StickyBookingBar",
  "StoreConflictModal",
  "StorePublic",
  "StorefrontNavigation",
  "StorefrontReviews",
  "Suite",
  "Testimonials",
] as const;

/** Rutas de autenticación (Login, Signup, Verificación, Recuperación). */
export const AUTH_NAMESPACES = [
  ...ROOT_NAMESPACES,
  "Auth",
  "AuthActivateStaff",
  "AuthForgotPassword",
  "AuthLoading",
  "AuthResetPassword",
  "AuthSignupConsumer",
  "AuthSignupFoundation",
  "AuthSignupLaboratory",
  "AuthSignupProvider",
  "AuthSignupSupplier",
  "AuthVerifyEmail",
  "AuthVerifyPhone",
  "PrivacyModal",
  "TermsModal",
] as const;

/** Flujo de Onboarding. */
export const ONBOARDING_NAMESPACES = [
  ...ROOT_NAMESPACES,
  "Auth",
  "AuthProvider",
  "CategorySelector",
  "LocationPicker",
  "MapModal",
  "OnboardingChecklist",
  "OnboardingConsumer",
  "OnboardingDependents",
  "OnboardingFiscal",
  "OnboardingKyc",
  "OnboardingLayout",
  "OnboardingLicense",
  "OnboardingProfile",
  "OnboardingWearables",
] as const;

/** Vertical Fundaciones. */
export const FOUNDATION_NAMESPACES = [
  ...ROOT_NAMESPACES,
  "AuthProvider",
  "FoundationSettings",
  "MapModal",
  "NotificationBell",
  "PlatformMobileNavbar",
  "PublicInfoSection",
  "Settings2FA",
  "SettingsNotifications",
  "SettingsSecurity",
  "SidebarNav",
  "StoreIdentity",
  "VisualIdentitySection",
] as const;

/** Verticales B2B (Laboratorios y Proveedores). */
export const B2B_SHELL_NAMESPACES = [
  ...ROOT_NAMESPACES,
  "AuthProvider",
  "NotificationBell",
  "PlatformMobileNavbar",
  "SidebarNav",
] as const;
