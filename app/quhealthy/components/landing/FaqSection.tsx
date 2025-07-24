"use client";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaqItem } from '@/app/quhealthy/types/landing';

const faqs: FaqItem[] = [
    { question: "¿Cómo garantizan la calidad de los proveedores?", answer: "Verificamos rigurosamente a todos los profesionales, validando sus credenciales, licencias y experiencia a través de nuestro proceso de KYC (Conoce a tu Cliente)." },
    { question: "¿Es seguro pagar a través de la plataforma?", answer: "Sí. Utilizamos pasarelas de pago líderes en el mercado y tecnología blockchain para asegurar que cada transacción sea segura, transparente y rastreable." },
    { question: "¿Puedo acceder a servicios en México si vivo en Estados Unidos?", answer: "¡Por supuesto! Ese es el corazón de QuHealthy. Facilitamos el turismo médico y de bienestar, conectándote con servicios de alta calidad a precios competitivos." },
    { question: "¿Qué es QuMarket y QuBlocks?", answer: "QuMarket es nuestro marketplace donde los proveedores pueden vender productos. QuBlocks es nuestra plataforma educativa donde pueden ofrecer cursos y talleres, todo integrado en tu plan." },
];

export const FaqSection = () => (
  <section className="py-20 px-8 bg-gray-950">
    <div className="max-w-4xl mx-auto">
      <motion.h2
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.5 }}
        className="text-4xl font-bold text-center mb-12 text-white"
      >
        Preguntas Frecuentes
      </motion.h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
           <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: index * 0.1 }}
          >
            <AccordionItem value={`item-${index}`} className="bg-gray-900 border-b border-gray-800 rounded-lg mb-4 px-6">
              <AccordionTrigger className="text-lg font-semibold text-white hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-gray-400 text-base leading-relaxed pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  </section>
);