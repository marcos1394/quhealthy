/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  Settings,
  Store,
  LogOut,
  ChevronRight,
  Bell,
  HelpCircle,
  Crown,
  ChevronLeft,
  BriefcaseMedical,
  UserCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";

// 🚀 1. IMPORTAMOS TU HOOK DE AUTH
import { useAuth } from "@/hooks/useAuth"; // Ajusta la ruta si es necesario

// MENÚS REALES DEL NEGOCIO
const sidebarLinks = [
  { label: "Resumen", href: "/provider/dashboard", icon: LayoutDashboard, badge: null },
  { label: "Agenda", href: "/provider/calendar", icon: CalendarDays, badge: { count: 3, color: 'blue' } },
  { label: "Pacientes", href: "/provider/patients", icon: Users, badge: null },
  { label: "Mis Servicios", href: "/provider/services", icon: BriefcaseMedical, badge: null },
  { label: "Finanzas", href: "/provider/finance", icon: CreditCard, badge: null },
];

const settingsLinks = [
  { label: "Mi Perfil Público", href: "/provider/profile", icon: UserCircle, badge: null },
  { label: "Configuración", href: "/provider/settings", icon: Settings, badge: null },
];

export const Sidebar = ({ className = "" }: { className?: string }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Extraemos la función logout de tu hook
  const { logout } = useAuth(); 

  // 🚀 2. LÓGICA DE CERRAR SESIÓN DELEGADA AL HOOK
  const handleLogout = () => {
    toast.info("Sesión cerrada exitosamente", { autoClose: 2000 });
    // El hook ya se encarga de limpiar el Store, localStorage y redirigir
    logout(); 
  };

  // NavItem Component
  const NavItem = ({  
    href, 
    icon: Icon, 
    label,
    badge 
  }: { 
    href: string; 
    icon: any; 
    label: string;
    badge?: { count: number; color: string } | null;
  }) => {
    // Lógica para marcar activo (exacto o subrutas)
    const isActive = pathname === href || (href !== "/provider/dashboard" && pathname?.startsWith(href));

    return (
      <Link
        href={href}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
          isActive
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-900/30"
            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
        )}
      >
        {/* Active Indicator Animado */}
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        <div className="relative z-10 flex items-center gap-3 flex-1">
          <Icon 
            className={cn(
              "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
              isActive ? "text-white" : "text-gray-500 group-hover:text-purple-400"
            )} 
          />
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-semibold whitespace-nowrap overflow-hidden"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Badges de Notificación */}
          {badge && !isCollapsed && (
            <Badge 
              className={cn(
                "ml-auto text-xs px-1.5 min-w-[20px] h-5",
                badge.color === 'blue' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "",
                badge.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : ""
              )}
            >
              {badge.count}
            </Badge>
          )}
        </div>
      </Link>
    );
  };

  return (
    <motion.div 
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "flex flex-col h-full bg-gray-950 border-r border-gray-800 relative",      
        className
      )}
    >
      {/* Header del Sidebar / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <Link href="/provider/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-900/30">
            <span className="font-black text-white text-lg">Q</span>
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
              >
                QuHealthy
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Botón Colapsar */}
        <Button
          variant="ghost"
          size="default"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg h-8 w-8 flex-shrink-0"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Banner de Plan (Solo visible expandido) */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-3 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-xl"
        >
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-purple-400">Plan Básico</span>
          </div>
        </motion.div>
      )}

      {/* Contenido Scrolleable (Menús) */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
        
        {/* Sección Principal */}
        <nav>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2"
              >
                Plataforma
              </motion.h3>
            )}
          </AnimatePresence>
          <div className="space-y-1">
            {sidebarLinks.map((link) => (
              <NavItem key={link.href} {...link} />
            ))}
          </div>
        </nav>

        <Separator className="bg-gray-800" />

        {/* Sección Ajustes */}
        <nav>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2"
              >
                Configuración
              </motion.h3>
            )}
          </AnimatePresence>
          <div className="space-y-1">
            {settingsLinks.map((link) => (
              <NavItem key={link.href} {...link} />
            ))}
          </div>
        </nav>
      </div>

      {/* Footer: Acciones y Logout */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        {!isCollapsed && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Soporte</span>
          </Button>
        )}

        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all group",
            "text-gray-400 hover:text-red-400 hover:bg-red-500/10",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? "Cerrar Sesión" : ""}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-semibold whitespace-nowrap overflow-hidden"
              >
                Cerrar Sesión
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
};