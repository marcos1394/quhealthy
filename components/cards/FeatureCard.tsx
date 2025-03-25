"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Card from "../Card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  color,
  delay = 0
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <Card>
      <div className={`absolute inset-0 opacity-10 ${color}`} />
      <div className={`${color} rounded-full w-16 h-16 flex items-center justify-center mb-6 shadow-lg`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-300">{description}</p>
      
      <motion.div 
        className="w-20 h-1 mt-4 rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: "5rem" }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.3, duration: 0.8 }}
        style={{ background: `linear-gradient(90deg, ${color.replace('bg-', '')}, transparent)` }}
      />
    </Card>
  </motion.div>
);

export default FeatureCard;