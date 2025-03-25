// Common interfaces for the application

import { LucideIcon } from "lucide-react";

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    rating: number;
    reviewCount: number;
  }
  
  export interface Professional {
    id: string;
    name: string;
    specialty: string;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    location: string;
    available: boolean;
  }
  
  export interface Testimonial {
    id: string;
    name: string;
    role: string;    // Reemplaza o añade según tu necesidad
    image: string;   // Reemplaza "imageUrl" si es lo que usas
    text: string;    // Reemplaza "content" si es lo que usas
    product: string; // Añade esta propiedad
    position?: string;  // Opcional si no siempre está presente
    company?: string;   // Opcional si no siempre está presente
    content?: string;   // Opcional si usas "text" en su lugar
    imageUrl?: string;  // Opcional si usas "image" en su lugar
    rating: number;
  }
  
  export interface PricingPlan {
    id: string;
    name: string;
    title: string;         // Añadido
    price: number;
    description: string;
    features: string[];
    includes: string[];    // Añadido
    isPopular: boolean;    // Añadido
    annualDiscount: number; // Añadido
    gradient: string;      // Añadido
    highlighted?: boolean;
    buttonText: string;
  }
  
  export interface Feature {
    title: string;
    description: string;
    icon: LucideIcon; // LucideIcon type
    color: string;
  }
  
  export interface NavItem {
    label: string;
    href: string;
    children?: Array<{
      label: string;
      href: string;
      description?: string;
    }>;
  }