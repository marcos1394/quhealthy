"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, ShoppingBag, BookOpen } from "lucide-react";
import Card from "../Card";
import ProductPill from "../ProductPill";

const SuiteSection: React.FC = () => {
  const suiteProducts = [
    {
      name: "Quhealthy",
      description: "Gestión de servicios profesionales para profesionales de salud y bienestar",
      icon: Lightbulb,
      color: "bg-gradient-to-r from-purple-500 to-purple-700",
      pillColor: "bg-purple-500",
      features: [
        "Agenda online integrada",
        "Expedientes digitales",
        "Teleconsultas",
        "Pagos en línea",
        "Recordatorios automáticos"
      ]
    },
    {
      name: "Qumarket",
      description: "Marketplace especializado de productos para salud, belleza y bienestar",
      icon: ShoppingBag,
      color: "bg-gradient-to-r from-pink-500 to-pink-700",
      pillColor: "bg-pink-500",
      features: [
        "Tienda personalizada",
        "Catálogo especializado",
        "Comisiones reducidas",
        "Envíos automatizados",
        "Recomendaciones inteligentes"
      ]
    },
    {
      name: "Qublocks",
      description: "Plataforma educativa para profesionales y clientes del mundo wellness",
      icon: BookOpen,
      color: "bg-gradient-to-r from-blue-500 to-blue-700",
      pillColor: "bg-blue-500",
      features: [
        "Cursos especializados",
        "Webinars exclusivos",
        "Comunidad de aprendizaje",
        "Certificaciones validadas",
        "Contenido personalizado"
      ]
    }
  ];

  return (
    <section id="suite" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            La Suite Integral para Profesionales
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Una plataforma completa que evoluciona contigo y tu práctica profesional, potenciando cada aspecto de tu negocio.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {suiteProducts.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="h-full" gradient={product.color}>
                <div className="flex items-center mb-6">
                  <div className={`${product.pillColor} rounded-full w-12 h-12 flex items-center justify-center`}>
                    <product.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold ml-4 text-white">{product.name}</h3>
                </div>
                <p className="text-gray-300 mb-6">{product.description}</p>
                <ul className="space-y-3 mb-8">
                  {product.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center text-gray-200"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <ProductPill name={product.name} color={product.pillColor} delay={index * 0.1} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuiteSection;