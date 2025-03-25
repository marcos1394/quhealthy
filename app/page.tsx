"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";

// Secciones
import HeroSection from "@/components/sections/HeroSection";
import SuiteSection from "@/components/sections/SuiteSection";
import FeaturesSection from "@/components/sections/FeatureSection";
import TestimonialsSection from "@/components/sections/TestimonialSection";
import PricingSection from "@/components/sections/PricingSection";
import CtaSection from "@/components/sections/CtaSection";

// Constantes y tipos
import { FEATURES, PRICING_PLANS, TESTIMONIALS } from "@/lib/constants";

export default function Home() {
  // Para mostrar efectos de desplazamiento suave
  useEffect(() => {
    // Importar el polyfill de desplazamiento suave de forma dinámica solo en el cliente
    import("smoothscroll-polyfill").then((smoothScroll) => {
      smoothScroll.polyfill();
    });
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Gradient divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      {/* Suite Section */}
      <SuiteSection />

      {/* Features Section */}
      <FeaturesSection features={FEATURES} />

      {/* Gradient divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

      {/* Testimonials Section */}
      <TestimonialsSection testimonials={TESTIMONIALS} />

      {/* Pricing Section */}
      <PricingSection plans={PRICING_PLANS} />

      {/* CTA Section */}
      <CtaSection />

      {/* Floating button para volver arriba */}
      <ScrollToTopButton />
    </div>
  );
}

// Componente para botón flotante de volver arriba
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.5,
        y: isVisible ? 0 : 20,
      }}
      transition={{ duration: 0.3 }}
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg z-50"
      aria-label="Volver arriba"
      style={{ display: isVisible ? "block" : "none" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </motion.button>
  );
};