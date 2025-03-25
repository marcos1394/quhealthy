"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "../Button";

interface PlanCardProps {
  title: string;
  price: number;
  description: string;
  features: string[];
  includes: string[];
  isPopular: boolean;
  annualDiscount: number;
  duration: string;
  gradient: string;
  index: number;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  price,
  description,
  features,
  includes,
  isPopular,
  annualDiscount,
  duration,
  gradient,
  index,
}) => {
  // Animate features in sequence
  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1 + i * 0.1,
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className={`relative overflow-hidden rounded-xl ${
        isPopular ? "border-2 border-purple-400 shadow-lg shadow-purple-500/20" : "border border-gray-700"
      } bg-gray-900 backdrop-blur-md p-8 text-white`}
    >
      <div className={`absolute inset-0 opacity-20 ${gradient}`} />
      
      {isPopular && (
        <div className="absolute -right-12 top-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-1 transform rotate-45 text-sm font-bold shadow-lg">
          Popular
        </div>
      )}
      
      <div className="mb-4 relative">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
      </div>
      
      <div className="flex items-baseline mb-6 relative">
        <span className="text-4xl font-bold">${price}</span>
        <span className="ml-2 text-gray-300">/{duration}</span>
      </div>
      
      <p className="text-gray-100 leading-relaxed mb-6 relative">{description}</p>
      
      <div className="space-y-3 mb-8 relative">
        {features.map((feature, i) => (
          <motion.div 
            key={i} 
            className="flex items-center"
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={featureVariants}
          >
            <motion.svg 
              className="w-5 h-5 text-green-400 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </motion.svg>
            <span className="text-gray-100">{feature}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="border-t border-gray-700 pt-6 relative">
        <h4 className="text-lg font-bold mb-4">Incluye:</h4>
        <div className="flex flex-wrap gap-2">
          {includes.map((product, i) => (
            <motion.span 
              key={i} 
              className="px-3 py-1 rounded-full bg-gray-700 text-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ scale: 1.05, backgroundColor: getProductColor(product) }}
            >
              {product}
            </motion.span>
          ))}
        </div>
      </div>

      {annualDiscount > 0 && (
        <motion.p 
          className="text-sm text-green-400 my-4 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          <span className="font-bold">{annualDiscount}% de descuento</span> en planes anuales
        </motion.p>
      )}
      
      <div className="mt-6 relative">
        <Button 
          href="/signup" 
          variant="primary" 
          size="lg" 
          className="w-full"
        >
          Comenzar Ahora
        </Button>
      </div>
    </motion.div>
  );
};

// Helper para obtener colores según el producto
const getProductColor = (product: string): string => {
  switch (product) {
    case "Quhealthy":
      return "#A855F7"; // purple-500
    case "Qumarket":
      return "#EC4899"; // pink-500
    case "Qublocks":
      return "#3B82F6"; // blue-500
    default:
      return "#6B7280"; // gray-500
  }
};

export default PlanCard;