"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  gradient?: string;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = "",
  hoverEffect = true,
  gradient
}) => {
  const baseClasses = "bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-8 border border-gray-700 relative overflow-hidden";
  
  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      whileHover={hoverEffect ? { y: -5, transition: { duration: 0.2 } } : undefined}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      {gradient && (
        <div className={`absolute inset-0 opacity-10 ${gradient}`} />
      )}
      {children}
    </motion.div>
  );
};

export default Card;