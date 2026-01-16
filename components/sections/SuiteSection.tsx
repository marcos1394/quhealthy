"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, ShoppingBag, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductPill from "@/components/ProductPill";

const SuiteSection: React.FC = () => {
  const suiteProducts = [
    {
      name: "QuHealthy",
      description: "Gestión integral para profesionales de la salud. Tu consultorio en la nube.",
      icon: Lightbulb,
      // Usamos clases de borde y texto para el tema
      colorClass: "border-purple-500/50 shadow-purple-900/20",
      iconBg: "bg-purple-500/10 text-purple-400",
      pillColor: "bg-purple-600",
      features: [
        "Agenda inteligente integrada",
        "Expedientes clínicos digitales (ECE)",
        "Telemedicina en HD",
        "Pasarela de pagos automatizada",
        "Recordatorios vía WhatsApp"
      ]
    },
    {
      name: "QuMarket",
      description: "El marketplace donde tus productos llegan a miles de pacientes verificados.",
      icon: ShoppingBag,
      colorClass: "border-pink-500/50 shadow-pink-900/20",
      iconBg: "bg-pink-500/10 text-pink-400",
      pillColor: "bg-pink-600",
      features: [
        "Tienda personalizada en minutos",
        "Catálogo global de salud",
        "Comisiones competitivas",
        "Logística de envíos resuelta",
        "Cross-selling inteligente"
      ]
    },
    {
      name: "QuBlocks",
      description: "Academia y comunidad para la educación continua del sector wellness.",
      icon: BookOpen,
      colorClass: "border-blue-500/50 shadow-blue-900/20",
      iconBg: "bg-blue-500/10 text-blue-400",
      pillColor: "bg-blue-600",
      features: [
        "Cursos con certificación Blockchain",
        "Webinars exclusivos en vivo",
        "Networking profesional",
        "Validación de habilidades",
        "Biblioteca de recursos"
      ]
    }
  ];

  return (
    <section id="suite" className="py-24 relative overflow-hidden bg-gray-950">
      {/* Fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950 opacity-80 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent pb-2">
            La Suite Integral
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Una plataforma modular que evoluciona contigo. 
            Activa solo lo que necesitas, cuando lo necesitas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {suiteProducts.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <Card className={cn(
                "h-full flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-t-4", 
                product.colorClass
              )}>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={cn("p-3 rounded-xl", product.iconBg)}>
                      <product.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl text-white font-bold">{product.name}</CardTitle>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed h-12">
                    {product.description}
                  </p>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <div className="w-full h-px bg-gray-800 mb-6" /> {/* Separador */}
                  
                  <ul className="space-y-4 mb-8 flex-1">
                    {product.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start text-gray-300 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 shrink-0" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                  
                  <div className="mt-auto pt-4 flex justify-end">
                    <ProductPill 
                      name={`Explorar ${product.name}`} 
                      color={product.pillColor} 
                      delay={index * 0.1} 
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuiteSection;