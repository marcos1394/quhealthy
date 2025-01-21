"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  Brain, 
  Building2, 
  CheckCircle2, 
  CreditCard, 
  Globe2, 
  Heart, 
  HelpCircle,
  ShieldCheck, 
  Stethoscope, 
  Users 
} from "lucide-react";

export default function QuHealthyPage() {
  const [selectedPlan, setSelectedPlan] = useState("consumer");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Hero Section */}
      <header className="relative flex items-center justify-center min-h-screen px-8 text-center bg-gradient-to-b from-green-600 to-teal-700">
        <div className="absolute inset-0 opacity-50 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-4xl">
          <motion.h1
            className="text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            QuHealthy
          </motion.h1>
          <motion.p
            className="text-xl mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Conectando servicios de salud y belleza en México con usuarios en USA mediante tecnología blockchain e Inteligencia Artificial
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <a href="/quhealthy/authentication/consumers/signup" className="bg-white text-teal-700 font-semibold py-4 px-8 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2">
              Registrarse como Cliente <ArrowRight className="w-5 h-5" />
            </a>
            <a href="/quhealthy/authentication/providers/signup" className="bg-teal-800 text-white font-semibold py-4 px-8 rounded-lg hover:bg-teal-900 flex items-center justify-center gap-2">
              Registrarse como Proveedor <Building2 className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </header>

      {/* How It Works */}
      <section className="py-20 px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            ¿Cómo Funciona?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Brain className="w-12 h-12 text-teal-500" />,
                title: "IA Personalizada",
                description: "Nuestro sistema de IA analiza tus necesidades y preferencias para conectarte con los mejores proveedores de servicios."
              },
              {
                icon: <Globe2 className="w-12 h-12 text-teal-500" />,
                title: "Conexión Internacional",
                description: "Conectamos pacientes en USA con servicios de salud y belleza de alta calidad en México de manera segura."
              },
              {
                icon: <ShieldCheck className="w-12 h-12 text-teal-500" />,
                title: "Pagos Seguros",
                description: "Utiliza criptomonedas o métodos tradicionales para realizar pagos seguros y transparentes."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center p-8 rounded-xl bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="flex justify-center mb-6">{item.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Planes y Beneficios
          </motion.h2>

          <Tabs defaultValue="consumer" className="w-full" onValueChange={setSelectedPlan}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="consumer">Para Clientes</TabsTrigger>
              <TabsTrigger value="provider">Para Proveedores</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(selectedPlan === "consumer" ? [
                {
                  title: "Plan Básico",
                  price: "$0",
                  features: [
                    "Acceso a la plataforma",
                    "Búsqueda de servicios",
                    "Chat con proveedores",
                    "Recomendaciones básicas de IA"
                  ]
                },
                {
                  title: "Plan Premium",
                  price: "$29.99/mes",
                  features: [
                    "Todo del plan básico",
                    "Prioridad en atención",
                    "Descuentos exclusivos",
                    "Recomendaciones avanzadas de IA",
                    "Seguro de viaje básico"
                  ]
                },
                {
                  title: "Plan VIP",
                  price: "$99.99/mes",
                  features: [
                    "Todo del plan premium",
                    "Concierge personal 24/7",
                    "Seguro de viaje premium",
                    "Transporte incluido",
                    "Acceso a eventos exclusivos"
                  ]
                }
              ] : [
                {
                  title: "Membresía Básica",
                  price: "$49.99/mes",
                  features: [
                    "Perfil verificado",
                    "Listado básico",
                    "Chat con clientes",
                    "Pagos con crypto"
                  ]
                },
                {
                  title: "Membresía Pro",
                  price: "$149.99/mes",
                  features: [
                    "Todo de membresía básica",
                    "Perfil destacado",
                    "Analytics básicos",
                    "Soporte prioritario",
                    "Marketing automatizado"
                  ]
                },
                {
                  title: "Membresía Enterprise",
                  price: "$299.99/mes",
                  features: [
                    "Todo de membresía pro",
                    "Dashboard avanzado",
                    "API access",
                    "Account manager dedicado",
                    "Publicidad premium"
                  ]
                }
              ]).map((plan, index) => (
                <motion.div
                  key={index}
                  className="p-8 rounded-xl bg-gray-900 flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
                  <p className="text-4xl font-bold mb-8 text-teal-500">{plan.price}</p>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-teal-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`/register/${selectedPlan}?plan=${plan.title.toLowerCase()}`}
                    className="w-full bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-700 text-center"
                  >
                    Comenzar
                  </a>
                </motion.div>
              ))}
            </div>
          </Tabs>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Preguntas Frecuentes
          </motion.h2>

          <div className="space-y-8">
            {[
              {
                q: "¿Cómo garantizan la calidad de los servicios?",
                a: "Verificamos rigurosamente a todos nuestros proveedores, incluyendo sus credenciales, licencias y referencias. Además, mantenemos un sistema de evaluaciones y comentarios transparente."
              },
              {
                q: "¿Cómo funcionan los pagos con criptomonedas?",
                a: "Utilizamos tecnología blockchain para procesar pagos seguros. Aceptamos múltiples criptomonedas y ofrecemos un proceso paso a paso para realizar las transacciones."
              },
              {
                q: "¿Qué pasa si necesito cancelar un servicio?",
                a: "Cada proveedor tiene su política de cancelación específica, pero generalmente permiten cancelaciones sin costo hasta 48 horas antes del servicio."
              },
              {
                q: "¿Cómo funciona el sistema de IA para recomendaciones?",
                a: "Nuestra IA analiza tus preferencias, historial médico y objetivos para sugerir los servicios y proveedores más adecuados para ti."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-lg bg-gray-800"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-teal-500" />
                  {faq.q}
                </h3>
                <p className="text-gray-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <footer className="py-16 px-8 bg-teal-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-4xl font-bold mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Únete a la revolución en servicios de salud y belleza
          </motion.h2>
          <motion.p
            className="text-xl mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Comienza tu viaje hacia servicios de salud y belleza más accesibles y seguros
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <a href="/register/consumer" className="bg-white text-teal-700 font-semibold py-4 px-8 rounded-lg hover:bg-gray-200">
              Registrarse como Cliente
            </a>
            <a href="/register/provider" className="bg-teal-800 text-white font-semibold py-4 px-8 rounded-lg hover:bg-teal-900">
              Registrarse como Proveedor
            </a>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}