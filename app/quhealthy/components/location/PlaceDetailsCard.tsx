"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Globe, Phone, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface PlaceDetailsCardProps {
  place: google.maps.places.PlaceResult;
  onConfirm: () => void;
  onClear: () => void; // Para el botón "Buscar de nuevo"
}

export const PlaceDetailsCard: React.FC<PlaceDetailsCardProps> = ({ place, onConfirm, onClear }) => {
  // Obtenemos la URL de la primera foto disponible
  const photoUrl = place.photos?.[0]?.getUrl();

  const handleConfirm = () => {
    onConfirm();
    toast.success("Información del negocio pre-cargada correctamente.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      className="bg-gray-800/80 p-4 rounded-lg border border-gray-700 space-y-4"
    >
      {/* Sección de Foto y Título */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {photoUrl && (
          <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
            <Image 
              src={photoUrl}
              alt={`Foto de ${place.name}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="96px"
            />
          </div>
        )}
        <div className="flex-grow">
          <p className="text-sm text-purple-400 font-semibold">¿Es este tu negocio?</p>
          <h3 className="text-xl font-bold text-white mt-1">{place.name}</h3>
          <p className="text-sm text-gray-300">{place.formatted_address}</p>
        </div>
      </div>

      {/* Sección de Detalles */}
      <div className="space-y-2 text-sm text-gray-300">
        {place.rating && (
          <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /><span>{place.rating} ({place.user_ratings_total} reseñas)</span></div>
        )}
        {place.formatted_phone_number && (
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-teal-400" /><span>{place.formatted_phone_number}</span></div>
        )}
        {place.website && (
          <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-teal-400" /><a href={place.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{place.website}</a></div>
        )}
      </div>

      {/* Sección de Horarios */}
      {place.opening_hours?.weekday_text && (
        <div>
          <Separator className="bg-gray-700 my-3" />
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <h4 className="text-sm font-semibold text-white">Horario de Apertura</h4>
          </div>
          <ul className="text-xs text-gray-400 space-y-1 pl-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            {place.opening_hours.weekday_text.map((daySchedule, index) => (
              <li key={index}>{daySchedule}</li>
            ))}
          </ul>
        </div>
      )}
      
      <Separator className="bg-gray-700 my-3" />

      {/* Sección de Acciones */}
      <div className="flex flex-col sm:flex-row gap-2">
         <Button onClick={onClear} variant="outline" className="flex-1 border-gray-600 hover:bg-gray-700 text-gray-300">
            <X className="w-4 h-4 mr-2" />
            No, buscar de nuevo
         </Button>
         <Button onClick={handleConfirm} className="flex-1 bg-purple-600 hover:bg-purple-700">
          <Check className="w-5 h-5 mr-2" />
          Sí, confirmar y usar datos
        </Button>
      </div>
    </motion.div>
  );
};