"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Star, Clock, Globe, Phone, Check } from 'lucide-react';

interface PlaceDetailsCardProps {
  placeDetails: google.maps.places.PlaceResult;
  onConfirm: () => void;
}

export const PlaceDetailsCard: React.FC<PlaceDetailsCardProps> = ({ placeDetails, onConfirm }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-800 p-4 rounded-lg border border-gray-700"
  >
    <h3 className="text-lg font-semibold text-white mb-2">{placeDetails.name}</h3>
    <p className="text-sm text-gray-300 mb-3">{placeDetails.formatted_address}</p>
    
    <div className="space-y-2 text-sm text-gray-300 mb-4">
      {placeDetails.rating && (
        <div className="flex items-center"><Star className="w-4 h-4 text-yellow-400 mr-2" /><span>{placeDetails.rating} ({placeDetails.user_ratings_total} reseñas)</span></div>
      )}
      {placeDetails.opening_hours && (
        <div className="flex items-center"><Clock className="w-4 h-4 text-teal-400 mr-2" /><span>{placeDetails.opening_hours.isOpen() ? 'Abierto ahora' : 'Cerrado'}</span></div>
      )}
      {placeDetails.website && (
        <div className="flex items-center"><Globe className="w-4 h-4 text-teal-400 mr-2" /><a href={placeDetails.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Visitar sitio web</a></div>
      )}
      {placeDetails.formatted_phone_number && (
        <div className="flex items-center"><Phone className="w-4 h-4 text-teal-400 mr-2" /><span>{placeDetails.formatted_phone_number}</span></div>
      )}
    </div>

    <Button onClick={onConfirm} className="w-full bg-teal-500 hover:bg-teal-600">
      <Check className="w-5 h-5 mr-2" />
      Confirmar este negocio
    </Button>
  </motion.div>
);