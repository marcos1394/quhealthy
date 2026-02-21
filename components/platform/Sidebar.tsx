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
  LogOut,
  ChevronRight,
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
import { useAuth } from "@/hooks/useAuth";

// MENÚS REALES DEL NEGOCIO
const sidebarLinks = [
  { label: "Resumen", href: "/provider/dashboard", icon: LayoutDashboard, badge: null },
  { label: "Agenda", href: "/provider/calendar", icon: CalendarDays, badge: { count: 3, color: 'blue' } },
  { label: "Pacientes", href: "/provider/patients", icon: Users, badge: null },
  { label: "Mis Servicios", href: "/provider/store", icon: BriefcaseMedical, badge: null },
  { label: "Finanzas", href: "/provider/finance", icon: CreditCard, badge: null },
];

const settingsLinks = [
  { label: "Mi Perfil Público", href: "/provider/profile", icon: UserCircle, badge: null },
  { label: "Configuración", href: "/provider/settings", icon: Settings, badge: null },
];

// 🚀 EXTRAEMOS NAVITEM FUERA DEL COMPONENTE PRINCIPAL
const NavItem = ({  
  href, 
  icon: Icon, 
  label,
  badge,
  isCollapsed,
  pathname
}: { 
  href: string; 
  icon: any; 
  label: string;
  badge?: { count: number; color: string } | null;
  isCollapsed: boolean;
  pathname: string | null;
}) => {
  // Lógica para marcar activo
  const isActive = pathname === href || (href !== "/provider/dashboard" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden",
        isCollapsed ? "justify-center" : "",
        isActive
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/20"
          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
      )}
      title={isCollapsed ? label : ""} // Mostrar tooltip nativo si está colapsado
    >
      <div className={cn("relative z-10 flex items-center", isCollapsed ? "justify-center w-full" : "gap-3 flex-1")}>
        <Icon 
          className={cn(
            "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
            isActive ? "text-white" : "text-gray-500 group-hover:text-purple-400"
          )} 
        />
        
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-semibold whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badges de Notificación */}
        {badge && !isCollapsed && (
          <Badge 
            variant="outline"
            className={cn(
              "ml-auto text-xs px-1.5 min-w-[20px] h-5 border-none",
              badge.color === 'blue' ? "bg-blue-500/20 text-blue-400" : "",
              badge.color === 'emerald' ? "bg-emerald-500/20 text-emerald-400" : ""
            )}
          >
            {badge.count}
          </Badge>
        )}
      </div>
    </Link>
  );
};

export const Sidebar = ({ className = "" }: { className?: string }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth(); 

  const handleLogout = () => {
    toast.info("Sesión cerrada exitosamente", { autoClose: 2000 });
    logout(); 
  };

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "flex flex-col h-screen bg-gray-950 border-r border-gray-800 z-50 overflow-hidden flex-shrink-0",      
        className
      )}
    >
      {/* Header del Sidebar / Logo & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 flex-shrink-0">
        <Link href="/provider/dashboard" className={cn("flex items-center gap-3 min-w-0", isCollapsed ? "justify-center w-full" : "")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-900/30">
            <span className="font-black text-white text-lg">Q</span>
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent whitespace-nowrap"
              >
                QuHealthy
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Toggle Button - Oculto si está colapsado para ahorrar espacio (se muestra un chevron para expandir) */}
        {!isCollapsed && (
            <Button
            variant="ghost"
            size="default"
            onClick={() => setIsCollapsed(true)}
            className="text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg h-8 w-8 flex-shrink-0"
            >
            <ChevronLeft className="w-4 h-4" />
            </Button>
        )}
      </div>
      
      {/* Si está colapsado, mostramos un botón para expandir debajo del logo */}
      {isCollapsed && (
        <div className="flex justify-center mt-2">
            <Button
            variant="ghost"
            size="default"
            onClick={() => setIsCollapsed(false)}
            className="text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg h-8 w-8"
            >
            <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
      )}

      {/* Banner de Plan */}
      <AnimatePresence>
        {!isCollapsed && (
            <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-4 p-3 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-xl overflow-hidden"
            >
            <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-xs font-bold text-purple-400 whitespace-nowrap">Plan Básico</span>
            </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido Scrolleable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-6 custom-scrollbar">
        
        {/* Plataforma */}
        <nav>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2 overflow-hidden"
              >
                Plataforma
              </motion.h3>
            )}
          </AnimatePresence>
          <div className="space-y-1">
            {sidebarLinks.map((link) => (
              <NavItem key={link.href} {...link} isCollapsed={isCollapsed} pathname={pathname} />
            ))}
          </div>
        </nav>

        <Separator className="bg-gray-800" />

        {/* Configuración */}
        <nav>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2 overflow-hidden"
              >
                Configuración
              </motion.h3>
            )}
          </AnimatePresence>
          <div className="space-y-1">
            {settingsLinks.map((link) => (
              <NavItem key={link.href} {...link} isCollapsed={isCollapsed} pathname={pathname} />
            ))}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2 flex-shrink-0">
        <AnimatePresence>
            {!isCollapsed && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
            >
                <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl mb-2"
                >
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold whitespace-nowrap">Soporte</span>
                </Button>
            </motion.div>
            )}
        </AnimatePresence>

        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all group overflow-hidden",
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
                className="text-sm font-semibold whitespace-nowrap"
              >
                Cerrar Sesión
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};