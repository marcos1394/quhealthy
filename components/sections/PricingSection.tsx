"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import PlanCard from "../cards/PlanCard";

// Define la interfaz para las props
interface PricingSectionProps {
  plans: PricingPlan[];
}

// Define el tipo 'PricingPlan'
interface PricingPlan {
  title: string;
  price: number;
  description: string;
  features: string[];
  includes: string[];
  isPopular: boolean;
  annualDiscount: number;
  gradient: string;
}

const PricingSection: React.FC<PricingSectionProps> = ({ plans }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="planes" className="py-24 relative overflow-hidden">
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
            Planes Flexibles para cada Etapa
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Elige el plan que mejor se adapte a tus necesidades actuales y escala conforme crece tu práctica.
          </p>

          <div className="flex items-center justify-center mb-10">
            <span className={`mr-3 text-lg ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Mensual</span>
            <motion.div 
              className="w-16 h-8 bg-gray-700 rounded-full p-1 cursor-pointer"
              onClick={() => setIsAnnual(!isAnnual)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="w-6 h-6 bg-purple-500 rounded-full"
                animate={{ x: isAnnual ? 8 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </motion.div>
            <span className={`ml-3 text-lg ${isAnnual ? 'text-white' : 'text-gray-400'}`}>Anual</span>
            {isAnnual && (
              <motion.span 
                className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                40% Off
              </motion.span>
            )}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.title}
              title={plan.title}
              price={isAnnual ? plan.price * 0.6 : plan.price} // Ejemplo de descuento anual
              description={plan.description}
              features={plan.features}
              includes={plan.includes}
              isPopular={plan.isPopular}
              annualDiscount={isAnnual ? 0 : plan.annualDiscount}
              duration={isAnnual ? "año" : "mes"}
              gradient={plan.gradient}
              index={index}
            />
          ))}
        </div>
        
        <motion.p
          className="text-center text-gray-400 mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Todos los planes incluyen 14 días de prueba gratuita. No se requiere tarjeta de crédito.
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;