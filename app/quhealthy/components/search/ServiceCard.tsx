"use client";
import React from 'react';
import Image from 'next/image'; // Importar Image de Next.js
import { motion } from "framer-motion";
import { MapPin, Star, DollarSign, Heart } from "lucide-react";
import { Service } from '@/app/quhealthy/types/services';
import { useRouter } from 'next/navigation';

interface ServiceCardProps {
  service: Service;
  onFavorite: (serviceId: string) => void;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 }
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onFavorite }) => {
  const router = useRouter();

  return (
    <motion.div 
      className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-teal-400 transition-all duration-300 group"
      variants={fadeIn}
      whileHover={{ y: -5 }}
    >
      <div className="relative overflow-hidden rounded-lg">
        <Image 
          src={service.imageUrl || "/placeholder.jpg"} // Usar un placeholder local
          alt={service.name} 
          width={400}
          height={300}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button 
          onClick={() => onFavorite(service.id)}
          className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-sm rounded-full"
        >
          <Heart className={`w-5 h-5 ${service.isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
        </button>
      </div>
      <div className="mt-4 space-y-3">
        <h3 className="text-xl font-semibold text-white group-hover:text-teal-400">{service.name}</h3>
        <div className="flex items-center text-gray-300">
          <MapPin className="w-4 h-4 text-teal-400 mr-1" />
          <span className="text-sm">{service.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-medium">{service.rating}</span>
            <span className="text-gray-400 text-sm">({service.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-white">{service.priceRange}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-teal-400 font-semibold">${service.price} MXN</span>
          <button 
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
            onClick={() => router.push(`/service/${service.id}`)}
          >
            Ver detalles
          </button>
        </div>
      </div>
    </motion.div>
  );
};