import { Feature, PricingPlan, Testimonial, NavItem } from "../types";
import { 
  Heart, UserCheck, Activity, Calendar, Map, Search, 
  MessageSquare, CreditCard, ShieldCheck, Star 
} from "lucide-react";

// Navigation Items
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Servicios",
    href: "#",
    children: [
      {
        label: "Profesionales de salud",
        href: "/profesionales",
        description: "Encuentra médicos, terapeutas y otros especialistas"
      },
      {
        label: "Tratamientos",
        href: "/tratamientos",
        description: "Explora tratamientos disponibles en tu zona"
      },
      {
        label: "Clínicas",
        href: "/clinicas",
        description: "Descubre centros médicos y clínicas especializadas"
      }
    ]
  },
  {
    label: "Productos",
    href: "/productos",
  },
  {
    label: "Soluciones",
    href: "#",
    children: [
      {
        label: "Para profesionales",
        href: "/para-profesionales",
        description: "Gestiona tu agenda y amplía tu alcance"
      },
      {
        label: "Para clínicas",
        href: "/para-clinicas",
        description: "Software de gestión para centros médicos"
      }
    ]
  },
  {
    label: "Precios",
    href: "/precios",
  },
  {
    label: "Blog",
    href: "/blog",
  }
];

// Features List
export const FEATURES: Feature[] = [
  {
    title: "Profesionales verificados",
    description: "Todos los profesionales pasan por un riguroso proceso de verificación para garantizar la máxima calidad.",
    icon: UserCheck,
    color: "bg-purple-500"
  },
  {
    title: "Reservas en tiempo real",
    description: "Agenda citas con cualquier especialista en tiempo real y recibe confirmación instantánea.",
    icon: Calendar,
    color: "bg-pink-500"
  },
  {
    title: "Geolocalización inteligente",
    description: "Encuentra los mejores profesionales y servicios cerca de ti con un solo clic.",
    icon: Map,
    color: "bg-blue-500"
  },
  {
    title: "Búsqueda avanzada",
    description: "Filtros personalizados para encontrar exactamente lo que necesitas según tus preferencias.",
    icon: Search,
    color: "bg-green-500"
  },
  {
    title: "Valoraciones verificadas",
    description: "Opiniones reales de usuarios que han utilizado los servicios para ayudarte a elegir.",
    icon: Star,
    color: "bg-yellow-500"
  },
  {
    title: "Chat privado",
    description: "Comunícate directamente con los profesionales para resolver tus dudas antes de reservar.",
    icon: MessageSquare,
    color: "bg-indigo-500"
  }
];

// Pricing Plans
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Básico",
    title: "Básico",
    price: 0,
    description: "Ideal para usuarios ocasionales",
    features: [
      "Búsqueda de profesionales",
      "Reserva de citas",
      "Valoraciones limitadas",
      "Soporte por email"
    ],
    includes: ["Búsqueda", "Reservas"],
    isPopular: false,
    annualDiscount: 0,
    gradient: "bg-gradient-to-br from-gray-700 to-gray-900",
    highlighted: false,
    buttonText: "Comenzar gratis"
  },
  {
    id: "premium",
    name: "Premium",
    title: "Premium",
    price: 9.99,
    description: "Para usuarios frecuentes",
    features: [
      "Todo lo del plan Básico",
      "Chat ilimitado con profesionales",
      "Descuentos exclusivos",
      "Cancelación gratuita",
      "Prioridad en reservas"
    ],
    includes: ["Búsqueda", "Reservas", "Chat"],
    isPopular: true,
    annualDiscount: 10,
    gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
    highlighted: true,
    buttonText: "Prueba 7 días gratis"
  },
  {
    id: "business",
    name: "Business",
    title: "Business",
    price: 24.99,
    description: "Para familias y pequeñas empresas",
    features: [
      "Todo lo del plan Premium",
      "Hasta 5 usuarios",
      "Historial médico compartido",
      "Consultas prioritarias",
      "Gestor personal",
      "Soporte 24/7"
    ],
    includes: ["Búsqueda", "Reservas", "Chat", "Gestión"],
    isPopular: false,
    annualDiscount: 15,
    gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
    highlighted: false,
    buttonText: "Contactar ventas"
  }
];

// Testimonials
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "María López",
    role: "Paciente",
    image: "/images/testimonials/person1.jpg",
    text: "QuHealthy ha cambiado completamente mi experiencia con la atención médica. Encontré a un especialista excelente en minutos y pude reservar una cita para el mismo día.",
    product: "QuHealthy",
    rating: 5
  },
  {
    id: "2",
    name: "Dr. Carlos Mendoza",
    role: "Dermatólogo",
    image: "/images/testimonials/person2.jpg",
    text: "Como profesional, la plataforma me ha permitido gestionar mejor mi tiempo y conectar con pacientes que realmente necesitan mis servicios específicos.",
    product: "QuHealthy",
    rating: 5
  },
  {
    id: "3",
    name: "Laura Sánchez",
    role: "Directora",
    image: "/images/testimonials/person3.jpg",
    text: "Desde que integramos QuHealthy en nuestro centro, hemos aumentado las reservas en un 40% y mejorado significativamente la satisfacción de nuestros clientes.",
    product: "QuHealthy",
    rating: 4
  }
];

// Categories for products or services
export const CATEGORIES = [
  "Medicina General",
  "Especialistas",
  "Terapias",
  "Nutrición",
  "Entrenamiento",
  "Belleza",
  "Bienestar Mental"
];

// Common application measurements/sizes
export const SIZES = {
  headerHeight: "72px",
  maxContentWidth: "1200px",
  footerHeight: "420px"
};

// Brand colors
export const COLORS = {
  primary: "#8B5CF6", // Purple
  secondary: "#EC4899", // Pink
  accent: "#06B6D4", // Cyan
  background: "#0F172A", // Dark blue
  text: "#F1F5F9", // Light gray
  textDark: "#64748B" // Medium gray
};

// Animation durations
export const ANIMATION = {
  fast: 0.2,
  normal: 0.5,
  slow: 0.8
};

// App routes
export const ROUTES = {
  home: "/",
  professionals: "/profesionales",
  treatments: "/tratamientos",
  clinics: "/clinicas",
  products: "/productos",
  login: "/login",
  register: "/registro",
  dashboard: "/dashboard",
  profile: "/perfil",
  about: "/sobre-nosotros",
  contact: "/contacto",
  terms: "/terminos",
  privacy: "/privacidad"
};

// API endpoints (for frontend reference)
export const API = {
  baseUrl: "/api",
  professionals: "/api/professionals",
  treatments: "/api/treatments",
  clinics: "/api/clinics",
  products: "/api/products",
  bookings: "/api/bookings",
  auth: "/api/auth"
};