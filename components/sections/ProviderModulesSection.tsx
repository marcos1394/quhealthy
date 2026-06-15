"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  CalendarDays, 
  Users, 
  ShoppingBag, 
  Calculator, 
  TrendingUp, 
  FileText, 
  MessageCircle, 
  Package, 
  PackageCheck,
  CreditCard,
  BadgeX,
  Handshake,
  UserCircle,
  LayoutDashboard,
  ChevronRight,
  Stethoscope
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const categories = [
  {
    id: "clinic",
    title: "Gestión Clínica",
    icon: Stethoscope,
    description: "Digitaliza tu consultorio y ofrece una experiencia superior a tus pacientes con herramientas diseñadas para optimizar tu tiempo.",
    modules: [
      {
        title: "Calendario y Citas",
        icon: CalendarDays,
        description: "Agenda inteligente para ti y tu equipo. Sincronización en tiempo real, control de disponibilidad y recordatorios automáticos."
      },
      {
        title: "Expediente Electrónico",
        icon: FileText,
        description: "Historial clínico completo, seguro y siempre accesible. Cumple con las normativas más estrictas de privacidad de datos."
      },
      {
        title: "Mensajería Privada",
        icon: MessageCircle,
        description: "Comunícate de forma segura con tus pacientes desde la plataforma, manteniendo separada tu vida profesional de la personal."
      },
      {
        title: "Gestión de Pacientes",
        icon: Users,
        description: "Base de datos centralizada con perfiles detallados, notas de evolución y seguimiento a largo plazo."
      }
    ]
  },
  {
    id: "commerce",
    title: "QuMarket & Productos",
    icon: ShoppingBag,
    description: "Multiplica tus ingresos ofreciendo productos de salud, bienestar y belleza directamente desde tu consultorio digital.",
    modules: [
      {
        title: "Tu Propia Tienda",
        icon: ShoppingBag,
        description: "Catálogo en línea personalizado donde puedes listar productos recomendados, vitaminas o artículos de skin-care."
      },
      {
        title: "Control de Pedidos",
        icon: Package,
        description: "Gestiona las compras de tus pacientes, coordinando entregas a domicilio o retiros directamente en tu sucursal."
      },
      {
        title: "Inventario Inteligente",
        icon: PackageCheck,
        description: "Mantén el control exacto de tus existencias, recibe alertas de stock bajo y administra a tus proveedores fácilmente."
      }
    ]
  },
  {
    id: "finance",
    title: "Finanzas y Facturación",
    icon: Calculator,
    description: "Mantén la salud financiera de tu práctica bajo control absoluto con herramientas automatizadas que evitan fugas de capital.",
    modules: [
      {
        title: "Caja Registradora",
        icon: Calculator,
        description: "Control de ingresos y egresos diarios. Realiza cortes de caja perfectos y conciliaciones sin dolor de cabeza."
      },
      {
        title: "Facturación Automatizada",
        icon: CreditCard,
        description: "Emite facturas al instante y envía recibos directamente al correo de tus pacientes sin usar software externo."
      },
      {
        title: "Panel Financiero",
        icon: LayoutDashboard,
        description: "Reportes visuales e intuitivos sobre el rendimiento económico de tu consultorio en tiempo real."
      }
    ]
  },
  {
    id: "growth",
    title: "Crecimiento y Marketing",
    icon: TrendingUp,
    description: "Llega a más pacientes, posiciona tu marca personal como experto en salud y haz crecer tu clínica exponencialmente.",
    modules: [
      {
        title: "Perfil Público Premium",
        icon: UserCircle,
        description: "Destaca en nuestro directorio médico con un perfil profesional optimizado para atraer nuevos pacientes."
      },
      {
        title: "Campañas de Marketing",
        icon: BadgeX,
        description: "Crea y envía promociones, boletines informativos y recordatorios de check-up anual a tu base de pacientes."
      },
      {
        title: "Red de Referidos",
        icon: Handshake,
        description: "Colabora de cerca con otros especialistas de la red QuHealthy y gestiona derivaciones de forma transparente."
      }
    ]
  }
];

const ProviderModulesSection = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  const currentData = categories.find((c) => c.id === activeCategory) || categories[0];

  return (
    <section id="provider-modules" className="py-24 md:py-32 bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300 overflow-hidden relative">
      {/* Decorative blurred blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-slate-200/50 dark:bg-slate-800/20 blur-[100px]" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full bg-slate-300/30 dark:bg-slate-900/40 blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 md:px-12 xl:px-24 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <div className="inline-block border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 backdrop-blur-sm mb-6 bg-white/50 dark:bg-slate-900/50">
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
              Herramientas para Especialistas
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
            Todo lo que necesitas para tu <span className="text-slate-500 dark:text-slate-400 font-serif italic">práctica médica</span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-light max-w-2xl">
            Desde la agendación de la primera cita hasta la facturación. Una suite completa de módulos diseñados específicamente para hacer crecer tu consultorio.
          </p>
        </div>

        {/* Layout Interactivo */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-16 items-start">
          
          {/* Menú de Categorías (Izquierda) */}
          <div className="flex flex-col gap-3 sticky top-32 z-20">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              const Icon = category.icon;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-3xl text-left transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-slate-900/10 dark:shadow-white/5 border-transparent" 
                      : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    isActive 
                      ? "bg-white/20 dark:bg-slate-900/10 text-white dark:text-slate-900" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                  )}>
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <span className="font-semibold text-lg flex-1 tracking-tight">
                    {category.title}
                  </span>
                  {isActive && (
                    <motion.div layoutId="activeCatIndicator" className="absolute right-6 text-white/50 dark:text-slate-900/50">
                      <ChevronRight className="w-5 h-5" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Área de Visualización (Derecha) */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 min-h-[500px] shadow-sm relative overflow-hidden">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full flex flex-col"
              >
                {/* Categoría Header */}
                <div className="mb-10">
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white mb-6 shadow-inner">
                    <currentData.icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                    {currentData.title}
                  </h3>
                  <p className="text-lg text-slate-500 dark:text-slate-400 font-light leading-relaxed max-w-xl">
                    {currentData.description}
                  </p>
                </div>

                {/* Grid de Módulos */}
                <div className="grid md:grid-cols-2 gap-5 mt-auto">
                  {currentData.modules.map((mod, idx) => (
                    <motion.div
                      key={mod.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                      className="group p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none"
                    >
                      <div className="flex flex-col h-full">
                        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                          <mod.icon className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">
                          {mod.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light flex-1">
                          {mod.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Acción al final */}
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Explora todas las herramientas incluidas en nuestros planes.
                  </p>
                  <Button asChild className="rounded-full px-8 py-6 text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                    <Link href="#pricing">
                      Ver Planes y Precios
                    </Link>
                  </Button>
                </div>

              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ProviderModulesSection;
