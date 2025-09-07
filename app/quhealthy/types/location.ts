// src/types/location.ts

export interface AddressComponents {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  neighborhood?: string;
  suburb?: string;
  houseNumber?: string;
}

export interface ValidationDetails {
  isValid: boolean;
  isServiceArea?: boolean;
  confidence?: number;
  message?: string;
  addressComponents?: AddressComponents;
  formattedAddress?: string;
}

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  name?: string;
  validationDetails?: ValidationDetails;
}

// Additional types for Nominatim (OpenStreetMap) API responses
export interface NominatimAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface NominatimResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  name?: string; // ← Añadir esta línea
  address?: NominatimAddress;
}