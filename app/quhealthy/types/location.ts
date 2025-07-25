// src/types/location.ts

// Define la estructura de la respuesta de nuestro endpoint de validación del backend
export interface ValidationDetails {
    isValid: boolean;
    message: string;
    details: {
      formattedAddress: string;
      geocode?: google.maps.places.PlaceGeometry['location'];
      verdict?: any; // El veredicto completo de Google
      addressComponents?: google.maps.GeocoderAddressComponent[];
    };
  }
  
  // Define el objeto completo de datos de ubicación que pasaremos entre componentes
  export interface LocationData {
    lat: number;
    lng: number;
    address: string;
    placeDetails?: google.maps.places.PlaceResult;
    validationDetails?: ValidationDetails;
  }