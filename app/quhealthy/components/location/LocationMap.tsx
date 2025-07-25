"use client";
import React, { useRef, useEffect } from 'react';
import { GoogleMap } from '@react-google-maps/api';

interface LocationMapProps {
  center: google.maps.LatLngLiteral;
  onMapLoad: (map: google.maps.Map) => void;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
}

export const LocationMap: React.FC<LocationMapProps> = ({ center, onMapLoad, onMapClick }) => (
  <div className="h-96 rounded-lg overflow-hidden border border-gray-600">
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={14}
      onLoad={onMapLoad}
      onClick={onMapClick}
      options={{
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID, // Usa una variable de entorno para el Map ID
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    />
  </div>
);