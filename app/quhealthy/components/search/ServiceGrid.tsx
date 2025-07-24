"use client";
import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ServiceCard } from './ServiceCard';
import { Service } from '@/app/quhealthy/types/services';

interface ServiceGridProps {
  services: Service[];
  onFavorite: (serviceId: string) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services, onFavorite }) => (
  <motion.div 
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    initial="initial"
    animate="animate"
  >
    <AnimatePresence>
      {services.map((service) => (
        <ServiceCard 
          key={service.id} 
          service={service} 
          onFavorite={onFavorite}
        />
      ))}
    </AnimatePresence>
  </motion.div>
);