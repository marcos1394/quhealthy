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
  UserCircle,
  Menu,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";

// Hook de Auth
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

// NavItem Component
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
  const isActive = pathname === href || (href !== "/provider/dashboard" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden",
        isCollapsed ? "justify-center" : "",
        isActive
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-400 hover:text-white hover:bg-gray-800/60"
      )}
      title={isCollapsed ? label : ""}
    >
      {/* Subtle glow effect on active */}
      {isActive && (
        <div className="absolute inset-0 bg-blue-500/20 blur-xl" />
      )}

      {/* Hover glow effect */}
      {!isActive && (
        <div className="absolute inset-0 bg-gray-700/0 group-hover:bg-gray-700/30 transition-all duration-300" />
      )}

      <div className={cn("relative z-10 flex items-center", isCollapsed ? "justify-center w-full" : "gap-4 flex-1")}>
        <div className="relative">
          <Icon 
            className={cn(
              "w-6 h-6 flex-shrink-0 transition-all duration-300",
              isActive 
                ? "text-white" 
                : "text-gray-500 group-hover:text-white"
            )} 
          />
        </div>
        
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "text-sm font-bold whitespace-nowrap",
                isActive ? "text-white" : ""
              )}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badges de Notificación */}
        {badge && !isCollapsed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto"
          >
            <Badge 
              variant="outline"
              className={cn(
                "text-xs px-2 min-w-[22px] h-6 border-none font-bold",
                badge.color === 'blue' ? "bg-blue-500/90 text-white" : "",
                badge.color === 'emerald' ? "bg-emerald-500/90 text-white" : ""
              )}
            >
              {badge.count}
            </Badge>
          </motion.div>
        )}

        {/* Badge collapsed */}
        {badge && isCollapsed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white",
              badge.color === 'blue' ? "bg-blue-500" : "",
              badge.color === 'emerald' ? "bg-emerald-500" : ""
            )}>
              {badge.count}
            </div>
          </motion.div>
        )}
      </div>

      {/* Active indicator line */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-blue-400 rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
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
      animate={{ width: isCollapsed ? 88 : 300 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "flex flex-col h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900 border-r border-gray-800/50 z-50 overflow-hidden flex-shrink-0 shadow-2xl",      
        className
      )}
    >
      {/* Header del Sidebar / Logo & Toggle */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-gray-800/50 flex-shrink-0 bg-gray-950/50 backdrop-blur-xl">
        <Link href="/provider/dashboard" className={cn("flex items-center gap-3 min-w-0", isCollapsed ? "justify-center w-full hidden" : "")}>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-purple-900/50"
          >
            <span className="font-black text-white text-xl">Q</span>
          </motion.div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-2xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent whitespace-nowrap"
              >
                QuHealthy
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Toggle Button Expandido */}
        {!isCollapsed && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="default"
              onClick={() => setIsCollapsed(true)}
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl h-11 w-11 flex-shrink-0 transition-all shadow-lg hover:shadow-xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </div>
      
      {/* Toggle Button Colapsado */}
      {isCollapsed && (
        <div className="flex justify-center mt-5 mb-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="default"
              onClick={() => setIsCollapsed(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl h-12 w-12 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      )}

      {/* Banner de Plan */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-5 mt-5 p-4 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-pink-500/10 border border-purple-500/30 rounded-2xl overflow-hidden shadow-lg relative group cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 transition-all"
          >
            {/* Sparkle effect */}
            <div className="absolute top-1 right-1">
              <Sparkles className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <Crown className="w-5 h-5 text-purple-400 flex-shrink-0" />
              </div>
              <div>
                <p className="text-sm font-black text-purple-400 whitespace-nowrap">Plan Básico</p>
                <p className="text-[10px] text-purple-300/60 font-semibold">Actualiza tu plan</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido Scrolleable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-8 px-5 space-y-8 custom-scrollbar">
        
        {/* Plataforma */}
        <nav>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 px-2 overflow-hidden flex items-center gap-2"
              >
                <div className="w-1 h-1 rounded-full bg-purple-500" />
                Plataforma
              </motion.h3>
            )}
          </AnimatePresence>
          <div className="space-y-2">
            {sidebarLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavItem {...link} isCollapsed={isCollapsed} pathname={pathname} />
              </motion.div>
            ))}
          </div>
        </nav>

        <Separator className="bg-gray-800/50" />

        {/* Configuración */}
        <nav>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 px-2 overflow-hidden flex items-center gap-2"
              >
                <div className="w-1 h-1 rounded-full bg-pink-500" />
                Configuración
              </motion.h3>
            )}
          </AnimatePresence>
          <div className="space-y-2">
            {settingsLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavItem {...link} isCollapsed={isCollapsed} pathname={pathname} />
              </motion.div>
            ))}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-gray-800/50 space-y-2 flex-shrink-0 bg-gray-950/50 backdrop-blur-xl">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="overflow-hidden"
            >
              <Button
                variant="ghost"
                className="w-full justify-start gap-4 text-gray-400 hover:text-white hover:bg-gray-800/80 rounded-2xl h-12 transition-all group"
              >
                <HelpCircle className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold whitespace-nowrap">Soporte</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all group overflow-hidden shadow-lg",
            "text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border-2 border-transparent",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? "Cerrar Sesión" : ""}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-bold whitespace-nowrap"
              >
                Cerrar Sesión
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
};