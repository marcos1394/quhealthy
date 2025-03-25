"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Shield, Calendar, CreditCard, Users, Star, MessageCircle, Gift, PieChart, LucideIcon } from "lucide-react";
import FeatureCard from "../cards/FeatureCard";

// Define la interfaz para las props
interface FeaturesSectionProps {
  features: Feature[];
}

// Define el tipo 'Feature' usando LucideIcon
interface Feature {
  title: string;
  description: string;
  icon: LucideIcon; // Cambiado a LucideIcon
  color: string;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
  return (
    <section id="caracteristicas" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-gray-900"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Características Diseñadas para Profesionales
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Herramientas pensadas específicamente para el crecimiento y optimización de profesionales de la salud y bienestar.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;