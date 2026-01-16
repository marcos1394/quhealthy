// ============================================
// 📁 lib/constants.ts (ANTES content.ts)
// ============================================

export const SITE_CONFIG = {
  name: 'QuHealthy',
  tagline: 'Tu Bienestar Sin Fronteras',
  description: 'El marketplace líder que conecta profesionales de salud y belleza con clientes en todo México',
  stats: {
    providers: '500+',
    activeUsers: '10,000+',
    bookings: '50,000+',
    rating: '4.9',
  },
  contact: {
    email: 'hola@quhealthy.com',
    phone: '+52 (55) 1234-5678',
  },
  social: {
    facebook: '#',
    twitter: '#',
    instagram: '#',
    linkedin: '#',
  }
} as const;

// --- DATOS FALTANTES QUE ROMPÍAN EL BUILD ---

export const FEATURES = [
  {
    title: "Agenda Inteligente",
    description: "Sincronización automática con Google Calendar y recordatorios por WhatsApp.",
    iconName: "Calendar" 
  },
  {
    title: "Pagos Integrados",
    description: "Procesa cobros con tarjeta, transferencias y meses sin intereses.",
    iconName: "CreditCard"
  },
  {
    title: "Expediente Digital",
    description: "Historial clínico seguro y accesible desde cualquier dispositivo.",
    iconName: "FileText"
  },
  {
    title: "Video Consultas",
    description: "Plataforma de telemedicina integrada estilo Zoom.",
    iconName: "Video"
  }
];

export const TESTIMONIALS = [
  {
    name: "Dra. Ana Torres",
    role: "Dermatóloga",
    content: "QuHealthy ha automatizado el 90% de mi administración. Ahora tengo más tiempo para mis pacientes.",
    image: "/avatars/doctor1.jpg"
  },
  {
    name: "Carlos Méndez",
    role: "Paciente",
    content: "Increíblemente fácil de usar. Encontré a mi nutriólogo y pagué la consulta en minutos.",
    image: "/avatars/patient1.jpg"
  }
];

export const PRICING_PLANS = [
  {
    name: "Básico",
    price: "0",
    description: "Para profesionales que van empezando.",
    features: ["Perfil Básico", "5 Citas al mes", "Pagos en línea"]
  },
  {
    name: "Pro",
    price: "499",
    description: "Para consultorios en crecimiento.",
    features: ["Agenda Ilimitada", "Expediente Digital", "Recordatorios WhatsApp", "Soporte Prioritario"]
  },
  {
    name: "Clínica",
    price: "999",
    description: "Para centros médicos y spas.",
    features: ["Múltiples Doctores", "Analytics Avanzado", "API Access", "Gerente de Cuenta"]
  }
];