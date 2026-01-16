import type { Metadata } from "next";

// Secciones
import HeroSection from "@/components/sections/HeroSection";
import SuiteSection from "@/components/sections/SuiteSection";
import FeaturesSection from "@/components/sections/FeatureSection";
import TestimonialsSection from "@/components/sections/TestimonialSection";
import PricingSection from "@/components/sections/PricingSection";
import CtaSection from "@/components/sections/CtaSection";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";

// Constantes
import { FEATURES, PRICING_PLANS, TESTIMONIALS } from "@/lib/constants";

// Metadatos SEO específicos para la Home (Opcional, si ya tienes un layout bueno)
export const metadata: Metadata = {
  title: "QuHealthy | Plataforma Integral de Salud",
  description: "Marketplace de servicios de salud, belleza y bienestar.",
};

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* NOTA IMPORTANTE: 
         Asegúrate de que 'HeroSection' y los demás componentes NO tengan errores 
         por la eliminación de Chakra UI. Si usan <Box> o <Flex> de Chakra, fallarán.
      */}
      
      <HeroSection />

      {/* Divisor Gradiente (Optimizado con Tailwind puro) */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <SuiteSection />

      <FeaturesSection features={FEATURES} />

      <div className="h-px w-full bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

      <TestimonialsSection testimonials={TESTIMONIALS} />

      <PricingSection plans={PRICING_PLANS} />

      <CtaSection />

      {/* Componente Cliente inyectado en una página de Servidor */}
      <ScrollToTopButton />
    </div>
  );
}