// src/types/location.ts
export interface ValidationDetails {
  isValid: boolean;
  message: string;
  details: {
    formattedAddress: string;
    geocode?: google.maps.places.PlaceGeometry['location'];
    verdict?: any;
    addressComponents?: google.maps.GeocoderAddressComponent[];
  };
}

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  name?: string; // Añadimos el nombre del negocio
  placeDetails?: google.maps.places.PlaceResult;
  validationDetails?: ValidationDetails;
}