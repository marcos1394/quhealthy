"use client";

import { CtaSection } from "@/app/quhealthy/components/landing/CtaSection";
import { FaqSection } from "@/app/quhealthy/components/landing/FaqSection";
import { HeroSection } from "@/app/quhealthy/components/landing/HeroSection";
import { HowItWorksSection } from "@/app/quhealthy/components/landing/HowItWorksSection";
import { PlansSection } from "@/app/quhealthy/components/landing/PlansSection";

export default function QuHealthyLandingPage() {
  return (
    // El div principal se elimina, ya que el layout.tsx provee el <body>
    <>
      <HeroSection />
      <HowItWorksSection />
      <PlansSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}