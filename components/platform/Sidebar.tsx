/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Utilidad estándar de ShadCN
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  Settings,
  Store,
  Shield,
  LogOut,
  Activity
} from "lucide-react";

// Definimos las rutas del menú
const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agenda", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Pacientes", href: "/dashboard/patients", icon: Users },
  { label: "Finanzas", href: "/dashboard/finance", icon: CreditCard },
  { label: "Mi Tienda", href: "/dashboard/store", icon: Store },
];

const settingsLinks = [
  { label: "Seguridad", href: "/settings/security", icon: Shield },
  { label: "Actividad", href: "/settings/security/activity", icon: Activity },
  { label: "Configuración", href: "/settings/general", icon: Settings },
];

export const Sidebar = ({ className }: { className?: string }) => {
  const pathname = usePathname();

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    // Verificamos si la ruta actual empieza con el href del link (para sub-rutas)
    const isActive = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
          isActive
            ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        )}
      >
        <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500 group-hover:text-purple-400")} />
        {label}
      </Link>
    );
  };

  return (
    <div className={cn("flex flex-col h-full bg-gray-950 border-r border-gray-800", className ? className : "")}>
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <span className="font-bold text-white">Q</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            QuHealthy
          </span>
        </Link>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
        
        {/* Main Menu */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Plataforma
          </h3>
          <div className="space-y-1">
            {sidebarLinks.map((link) => (
              <NavItem key={link.href} {...link} />
            ))}
          </div>
        </div>

        {/* Settings Menu */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Ajustes
          </h3>
          <div className="space-y-1">
            {settingsLinks.map((link) => (
              <NavItem key={link.href} {...link} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer / User Profile Summary */}
      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/10 transition-all group">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};