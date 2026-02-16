// src/types/location.ts
export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
  city?: string;
  state?: string;
}

export interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialCoords?: { lat: number; lng: number };
  initialAddress?: string;
  className?: string;
  initialLocation?: LocationData;
}