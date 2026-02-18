"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, LayoutDashboard, LogOut, User as UserIcon, 
  Store, Calendar, Settings, Sparkles, Megaphone, 
  Search, Heart, LucideIcon // Importamos el tipo para los iconos
} from "lucide-react";
import { toast } from 'react-toastify';

// Imports de lógica
import { useSessionStore } from '@/stores/SessionStore';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from "@/types/auth"; // Asegúrate de importar esto

// UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- 1. DEFINICIÓN DE TIPOS PARA LOS LINKS ---
interface NavItem {
  name: string;
  href: string;
  icon?: LucideIcon; // El icono es opcional
}

// --- 2. CONFIGURACIÓN DE NAVEGACIÓN (Tipada) ---
// Usamos Record para asegurar que cubrimos todos los casos o 'string' para ser flexibles
const LINKS: Record<string, NavItem[]> = {
  GUEST: [
    { name: "Descubrir", href: "/discover" },
    { name: "Para Doctores", href: "/business" },
    { name: "Precios", href: "/pricing" },
  ],
  CONSUMER: [
    { name: "Buscar Doctores", href: "/discover", icon: Search },
    { name: "Mis Citas", href: "/appointments", icon: Calendar },
    { name: "Favoritos", href: "/favorites", icon: Heart },
  ],
  PROVIDER: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Agenda", href: "/dashboard/calendar", icon: Calendar },
    { name: "Pacientes", href: "/dashboard/patients", icon: UserIcon },
  ],
  // ✅ AGREGAMOS ADMIN (Aunque sea vacío o igual a Provider por ahora para evitar el error de TS)
  ADMIN: [
    { name: "Panel Admin", href: "/admin", icon: LayoutDashboard },
    { name: "Usuarios", href: "/admin/users", icon: UserIcon },
  ]
};

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // ✅ CORRECCIÓN 1: No extraemos fetchSession del store (ya no existe ahí)
  const { user, role, isAuthenticated, isLoading } = useSessionStore();
  
  // ✅ CORRECCIÓN 2: Usamos checkSession del hook useAuth
  const { logout, checkSession } = useAuth(); 

  // 1. Hydration: Validar sesión al montar
  useEffect(() => {
    checkSession(); 
  }, []); // Array vacío para ejecutar solo al montar

  // 2. Efecto de Scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('Hasta pronto 👋');
    setMobileMenuOpen(false);
  };

  // ✅ CORRECCIÓN 3: Selección de links segura con tipos
  // Si el rol existe en LINKS, lo usamos. Si no, usamos GUEST.
  const currentLinks: NavItem[] = (isAuthenticated && role && LINKS[role]) 
    ? LINKS[role] 
    : LINKS.GUEST;

  // --- COMPONENTES INTERNOS ---

  const UserAvatar = ({ className, size = "sm" }: { className?: string, size?: "sm" | "lg" }) => (
    <Avatar className={cn(
      "border border-white/10 transition-all duration-300 group-hover:border-purple-500/50",
      size === "lg" ? "h-12 w-12" : "h-9 w-9",
    )}>
      <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "Usuario"} />
      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-xs">
        {user?.firstName ? user.firstName.substring(0, 2).toUpperCase() : <UserIcon size={14} />}
      </AvatarFallback>
    </Avatar>
  );

  const UserMenuDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent focus-visible:ring-1 focus-visible:ring-purple-500">
          <UserAvatar />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-gray-950" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 bg-gray-950/95 backdrop-blur-xl border-gray-800 shadow-2xl p-1 text-gray-200" 
        align="end" 
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal mb-1 p-2">
          <div className="flex items-center gap-3">
            <UserAvatar size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 capitalize">
                {role?.toLowerCase()}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-gray-800" />
        
        <div className="p-1 space-y-0.5">
          {role === 'PROVIDER' ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer flex items-center gap-2 text-sm">
                  <LayoutDashboard size={16} className="text-purple-400" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/calendar" className="cursor-pointer flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-blue-400" /> Mi Agenda
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/marketing" className="cursor-pointer flex items-center gap-2 text-sm">
                  <Megaphone size={16} className="text-pink-400" /> Marketing
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/appointments" className="cursor-pointer flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-purple-400" /> Mis Citas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/favorites" className="cursor-pointer flex items-center gap-2 text-sm">
                  <Heart size={16} className="text-red-400" /> Favoritos
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer flex items-center gap-2 text-sm">
              <Settings size={16} className="text-gray-400" /> Ajustes
            </Link>
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="bg-gray-800" />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer p-2 m-1 rounded-md"
        >
          <LogOut size={16} className="mr-2" /> Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled || mobileMenuOpen 
          ? "bg-gray-950/80 backdrop-blur-md border-gray-800 shadow-lg py-3" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="group flex items-center gap-2 relative z-50">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">
            QuHealthy
          </span>
        </Link>
        
        {/* DESKTOP NAV */}
        {!isLoading && (
          <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm px-1.5 py-1.5 rounded-full border border-white/10 absolute left-1/2 transform -translate-x-1/2">
            {currentLinks.map((item: NavItem) => { // ✅ CORRECCIÓN 4: Tipamos 'item' explícitamente
              const isActive = pathname === item.href;
              const Icon = item.icon; // TypeScript ya sabe que es LucideIcon | undefined
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2",
                    isActive 
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25" 
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  {Icon && <Icon size={14} className={isActive ? "text-white" : "text-gray-500"} />}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
        
        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          {isLoading ? (
             <div className="h-9 w-9 bg-gray-800 rounded-full animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              {role === 'PROVIDER' && (
                <Button variant="ghost" size="default" className="text-gray-400 hover:text-white">
                   <Megaphone size={20} />
                </Button>
              )}
              <UserMenuDropdown />
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5">
                  Ingresar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white text-black hover:bg-gray-200 font-semibold shadow-lg shadow-white/10 border-0">
                  Comenzar
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white transition-colors z-50 rounded-md hover:bg-white/10"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="md:hidden bg-gray-950 border-b border-gray-800 overflow-hidden shadow-2xl"
          >
            <div className="p-4 flex flex-col gap-2">
              {isAuthenticated && (
                <div className="flex items-center gap-3 p-3 mb-2 bg-white/5 rounded-xl border border-white/10">
                   <UserAvatar size="lg" />
                   <div>
                     <p className="text-white font-medium">{user?.firstName}</p>
                     <p className="text-xs text-gray-500">{user?.email}</p>
                   </div>
                </div>
              )}

              {currentLinks.map((item: NavItem) => { // ✅ Tipado aquí también
                 const Icon = item.icon;
                 return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white font-medium transition-colors"
                  >
                    {Icon && <Icon size={18} className="text-purple-400" />}
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="h-px bg-gray-800 my-2" />
              
              {isAuthenticated ? (
                <Button 
                  variant="destructive" 
                  onClick={handleLogout} 
                  className="w-full justify-start bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-gray-700 text-gray-300">Ingresar</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-white text-black hover:bg-gray-200">Crear Cuenta</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};