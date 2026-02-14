"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, ShoppingBag, BookOpen, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * SuiteSection Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. CHUNKING
 *    - 3 productos (dentro del número mágico 7±2)
 *    - Cada producto es un chunk significativo
 * 
 * 2. REGIÓN COMÚN (Gestalt)
 *    - Border superior colorido agrupa features del producto
 *    - Card contenedor unifica información relacionada
 * 
 * 3. SIMILITUD (Gestalt)
 *    - Estructura idéntica en los 3 productos
 *    - Facilita comparación y comprensión
 * 
 * 4. JERARQUÍA VISUAL
 *    - Icono → Nombre → Descripción → Features
 *    - Colores únicos por producto para reconocimiento
 * 
 * 5. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos distintivos por producto
 *    - Checkmarks verdes confirman features
 * 
 * 6. AFFORDANCE
 *    - Hover lift sugiere interactividad
 *    - "Explorar" con arrow indica acción
 * 
 * 7. MINIMIZAR CARGA COGNITIVA
 *    - Máximo 5 features por producto
 *    - Descripciones concisas
 */

const SuiteSection: React.FC = () => {
  const suiteProducts = [
    {
      name: "QuHealthy",
      description: "Gestión integral para profesionales de la salud. Tu consultorio en la nube.",
      icon: Lightbulb,
      colorClass: "border-purple-500/50 shadow-purple-900/20",
      iconBg: "bg-purple-500/10 text-purple-400",
      iconBorder: "border-purple-500/20",
      features: [
        "Agenda inteligente integrada",
        "Expedientes clínicos digitales",
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
      iconBorder: "border-pink-500/20",
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
      iconBorder: "border-blue-500/20",
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
    <section id="suite" className="py-32 relative overflow-hidden bg-gray-950">
      {/* Background sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950 opacity-80" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header - PRIMING */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 space-y-6"
        >
          <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            La Suite Integral
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Una plataforma modular que evoluciona contigo. 
            Activa solo lo que necesitas, cuando lo necesitas.
          </p>
        </motion.div>

        {/* Grid de Productos - SIMILITUD (Gestalt) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {suiteProducts.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="h-full"
            >
              <Card className={cn(
                "h-full flex flex-col transition-all duration-300 border-t-4 bg-gray-900/50 backdrop-blur-sm",
                "hover:-translate-y-2 hover:shadow-2xl hover:bg-gray-900/80",
                product.colorClass
              )}>
                <CardHeader className="space-y-6">
                  {/* Header con icono - REGIÓN COMÚN */}
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-4 rounded-2xl border transition-all duration-300 group-hover:scale-110",
                      product.iconBg,
                      product.iconBorder
                    )}>
                      <product.icon className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-3xl font-black text-white">
                      {product.name}
                    </CardTitle>
                  </div>
                  
                  {/* Descripción - CHUNKING */}
                  <p className="text-gray-400 text-base leading-relaxed min-h-[48px]">
                    {product.description}
                  </p>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col space-y-6">
                  <div className="h-px bg-gray-800" />
                  
                  {/* Features - RECONOCIMIENTO (checkmarks) */}
                  <ul className="space-y-4 flex-1">
                    {product.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-3 text-gray-300"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {/* CTA sutil - AFFORDANCE */}
                  <div className="pt-6 flex items-center justify-between group/cta cursor-pointer">
                    <span className="text-sm font-bold text-gray-400 group-hover/cta:text-purple-400 transition-colors duration-200">
                      Explorar {product.name}
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover/cta:text-purple-400 group-hover/cta:translate-x-1 transition-all duration-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info adicional - MINIMIZAR CARGA COGNITIVA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-gray-500 text-sm">
            💡 Cada módulo se integra perfectamente con los demás para una experiencia unificada
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SuiteSection;