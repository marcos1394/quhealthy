import type { Metadata } from "next";

// Secciones
import HeroSection from "@/components/sections/HeroSection";
import SuiteSection from "@/components/sections/SuiteSection";
import FeaturesSection from "@/components/sections/FeatureSection";
import TestimonialsSection from "@/components/sections/TestimonialSection";
import PricingSection from "@/components/sections/PricingSection";
import CtaSection from "@/components/sections/CtaSection";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";

// Constantes ya no necesarias aquí

import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;

  // Inicializamos el t con namespace general si existe, o defaults seguros
  // Hacemos try/catch para fallback si no hubiese las keys
  return {
    title: locale === 'en' ? "QuHealthy | Comprehensive Health Platform" : "QuHealthy | Plataforma Integral de Salud",
    description: locale === 'en' ? "The #1 marketplace for health, beauty and wellness services." : "El marketplace #1 de servicios de salud, belleza y bienestar.",
  };
}

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* NOTA IMPORTANTE: 
         Asegúrate de que 'HeroSection' y los demás componentes NO tengan errores 
         por la eliminación de Chakra UI. Si usan <Box> o <Flex> de Chakra, fallarán.
      */}

      <HeroSection />
      <SuiteSection />
      <FeaturesSection />
      <TestimonialsSection />

      <PricingSection />

      <CtaSection />

      {/* Componente Cliente inyectado en una página de Servidor */}
      <ScrollToTopButton />
    </div>
  );
}