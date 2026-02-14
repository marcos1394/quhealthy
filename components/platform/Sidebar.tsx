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
  Shield,
  LogOut,
  Activity,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Bell,
  HelpCircle,
  Crown,
  ChevronLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * Sidebar Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. JERARQUÍA VISUAL
 *    - Active state destacado (purple gradient)
 *    - Secciones claramente separadas
 *    - Icons con colores distintivos
 *    - Badges informativos
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Active indicator visual
 *    - Hover effects claros
 *    - Collapse animation suave
 *    - Badge counters
 * 
 * 3. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Icons descriptivos por sección
 *    - Labels claros
 *    - Tooltips en collapsed mode
 *    - Visual grouping
 * 
 * 4. PRIMING
 *    - Quick stats visibles
 *    - Unread badges
 *    - Premium indicator
 *    - Growth metrics
 * 
 * 5. AFFORDANCE
 *    - Clickable areas claras
 *    - Hover states distintos
 *    - Collapse toggle visible
 *    - Clear CTAs
 * 
 * 6. CREDIBILIDAD
 *    - Professional branding
 *    - Stats display
 *    - Plan badge
 *    - Trust indicators
 */

// Sidebar links con badges y counters - PRIMING
const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
  { label: "Agenda", href: "/dashboard/calendar", icon: CalendarDays, badge: { count: 8, color: 'blue' } },
  { label: "Pacientes", href: "/dashboard/patients", icon: Users, badge: { count: 3, color: 'emerald' } },
  { label: "Finanzas", href: "/dashboard/finance", icon: CreditCard, badge: null },
  { label: "Mi Tienda", href: "/dashboard/store", icon: Store, badge: null },
];

const settingsLinks = [
  { label: "Seguridad", href: "/settings/security", icon: Shield, badge: null },
  { label: "Actividad", href: "/settings/security/activity", icon: Activity, badge: null },
  { label: "Configuración", href: "/settings/general", icon: Settings, badge: null },
];

export const Sidebar = ({ className = "" }: { className?: string }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // NavItem Component - JERARQUÍA VISUAL
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
    const isActive = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

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
        {/* Active Indicator */}
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

          {/* Badge Counter - PRIMING */}
          {badge && !isCollapsed && (
            <Badge 
              className={cn(
                "ml-auto text-xs px-1.5 min-w-[20px] h-5",
                badge.color === 'blue' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "",
                badge.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "",
                badge.color === 'purple' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : ""
              )}
            >
              {badge.count}
            </Badge>
          )}
        </div>

        {/* Chevron Indicator */}
        {isActive && !isCollapsed && (
          <ChevronRight className="w-4 h-4 text-white ml-auto opacity-50" />
        )}
      </Link>
    );
  };

  return (
    <motion.div 
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "flex flex-col h-full bg-gray-950 border-r border-gray-800 relative",      
        ` ${className ?? ""}`
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
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

        {/* Collapse Toggle - AFFORDANCE */}
        <Button
          variant="ghost"
          size="default"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg h-8 w-8 flex-shrink-0"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Quick Stats Banner - CREDIBILIDAD */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-3 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-purple-400">Plan Premium</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-lg font-black text-emerald-400">24</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">Hoy</p>
            </div>
            <div>
              <p className="text-lg font-black text-blue-400">4.8★</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">Rating</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
        
        {/* Main Menu */}
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

        {/* Settings Menu */}
        <nav>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2"
              >
                Ajustes
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

      {/* Quick Actions Section */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 space-y-2"
        >
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 h-10"
          >
            <Bell className="w-4 h-4" />
            <span className="text-sm">Notificaciones</span>
            <Badge className="ml-auto bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
              3
            </Badge>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 h-10"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">Ayuda</span>
          </Button>
        </motion.div>
      )}

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-800">
        <button 
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all group",
            "text-gray-400 hover:text-red-400 hover:bg-red-900/10",
            isCollapsed ? "justify-center" : ""
          )}
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

      {/* Collapsed Stats Indicator */}
      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col gap-2"
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
};