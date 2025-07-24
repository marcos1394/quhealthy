"use client";
import { motion } from "framer-motion";
import { Search, CalendarCheck, Heart } from "lucide-react";

const steps = [
    { icon: <Search size={32} className="text-purple-400" />, title: "1. Descubre", description: "Explora un catálogo verificado de profesionales de la salud y belleza. Filtra por especialidad, ubicación y reputación." },
    { icon: <CalendarCheck size={32} className="text-purple-400" />, title: "2. Agenda", description: "Revisa la disponibilidad en tiempo real y agenda tu cita con un par de clics. Paga de forma segura, con tarjeta o cripto." },
    { icon: <Heart size={32} className="text-purple-400" />, title: "3. Disfruta", description: "Recibe un servicio de alta calidad. Tu historial y documentos se guardan de forma segura en tu perfil personal." },
];

export const HowItWorksSection = () => (
  <section className="py-20 px-8 bg-gray-950">
    <div className="max-w-7xl mx-auto">
      <motion.h2
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.5 }}
        className="text-4xl font-bold text-center mb-16 text-white"
      >
        Simple, Seguro y Eficiente
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="text-center p-8 rounded-xl bg-gray-900 border border-gray-800 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="flex justify-center items-center mb-6 w-16 h-16 rounded-full bg-purple-900/50 mx-auto">
              {step.icon}
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-purple-300">{step.title}</h3>
            <p className="text-gray-400 leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);