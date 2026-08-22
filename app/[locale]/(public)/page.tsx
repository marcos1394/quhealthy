import type { Metadata } from "next";

// Secciones
import HeroSection from "@/components/sections/HeroSection";
import { AiCapabilitiesShowcase } from "@/components/sections/AiCapabilitiesShowcase";
import { MarketplaceShowcaseSection } from "@/components/sections/MarketplaceShowcaseSection";
import { PlatformModulesSection } from "@/components/sections/PlatformModulesSection";
import { SpecializedJourneysSection } from "@/components/sections/SpecializedJourneysSection";
import SuiteSection from "@/components/sections/SuiteSection";
import { SecurityTrustSection } from "@/components/sections/SecurityTrustSection";
import TestimonialsSection from "@/components/sections/TestimonialSection";
import PricingSection from "@/components/sections/PricingSection";
import { FaqSection } from "@/components/sections/FaqSection";
import CtaSection from "@/components/sections/CtaSection";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://www.quhealthy.org";

  return {
    title: locale === 'en' 
      ? "QuHealthy | The Intelligent Health & Medical Ecosystem" 
      : "QuHealthy | El Ecosistema Inteligente de Salud y Gestión Médica",
    description: locale === 'en' 
      ? "Digitalize your medical practice or manage your comprehensive health. AI Scribe, EHR, electronic prescriptions, telemedicine, and specialized patient care journeys."
      : "Digitaliza tu consultorio o cuida de tu salud integral. Copiloto IA, ECE NOM-004, recetas digitales, telemedicina con traducción en vivo y expedientes cifrados.",
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        es: `${baseUrl}/es`,
        en: `${baseUrl}/en`,
        "x-default": `${baseUrl}/es`,
      },
    },
  };
}

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* 1. Hero con Buscador y Mockups en Vivo */}
      <HeroSection />

      {/* 2. Superpoderes de IA: AI Scribe, Traducción Simultánea y Recetas Inteligentes */}
      <AiCapabilitiesShowcase />

      {/* 3. Marketplace en Vivo: Especialistas, Paquetes, Servicios y Farmacia */}
      <MarketplaceShowcaseSection />

      {/* 4. Módulos Interactivos de la Plataforma (Pacientes & Médicos) */}
      <PlatformModulesSection />

      {/* 4. Rutas Especializadas: Salud Mujer/Embarazo, Diabetes, Oncología, Nutrición IA, Familia y Wearables */}
      <SpecializedJourneysSection />

      {/* 5. Ecosistema QuHealthy Suite */}
      <SuiteSection />

      {/* 6. Seguridad, Privacidad y Cumplimiento Normativo (NOM-004, NOM-024, COFEPRIS, SEP, AES-256) */}
      <SecurityTrustSection />

      {/* 7. Testimonios Reales */}
      <TestimonialsSection />

      {/* 8. Planes y Precios */}
      <PricingSection />

      {/* 9. Preguntas Frecuentes (FAQ Segmentado) */}
      <FaqSection />

      {/* 10. CTA Final de Conversión */}
      <CtaSection />

      {/* Botón Flotante para Volver al Inicio */}
      <ScrollToTopButton />
    </div>
  );
}