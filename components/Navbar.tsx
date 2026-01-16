"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut, UserCircle, Store, Calendar, Settings, Megaphone } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-toastify';

// Store
import { useSessionStore } from '@/stores/SessionStore';

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

// Si tienes este componente, úsalo. Si no, comenta la importación.
// import { NotificationBell } from './ui/NotificationBell';

// --- CONFIGURACIÓN DE NAVEGACIÓN ---
const publicNavItems = [
  { name: "Descubrir", href: "/discover" },
  { name: "Para Doctores", href: "/business" }, // Landing para venderle a doctores
];

const consumerNavItems = [
  { name: "Explorar", href: "/discover" },
  { name: "Mis Citas", href: "/appointments" },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  const { user, isLoading, fetchSession, clearSession } = useSessionStore();
  const isAuthenticated = !!user;
  const userRole = user?.role; // 'provider' | 'consumer' | 'admin'

  // Hydration de sesión
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Efecto de Scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout'); // Asumiendo que tienes este endpoint
      clearSession();
      toast.success('Hasta pronto 👋');
      router.push('/');
      router.refresh(); // Forzar recarga para limpiar estados de servidor si los hay
    } catch (error) {
      console.error("Logout error", error);
      // Fallback: Limpiamos localmente aunque falle el server
      clearSession();
      router.push('/');
    }
  };

  // Selección de items según rol
  const navItems = userRole === 'consumer' ? consumerNavItems : publicNavItems;

  // --- SUB-COMPONENTES ---

  const UserMenuDropdown = () => {
    if (!user) return null;

    // Rutas actualizadas a la nueva arquitectura
    const providerMenuItems = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Marketing', href: '/dashboard/marketing', icon: Megaphone },
      { name: 'Mi Tienda', href: '/dashboard/store', icon: Store },
      { name: 'Agenda', href: '/dashboard/calendar', icon: Calendar },
      { name: 'Ajustes', href: '/settings', icon: Settings },
    ];
    
    const consumerMenuItems = [
      { name: 'Mi Panel', href: '/dashboard', icon: LayoutDashboard }, // Unificado a /dashboard
      { name: 'Mis Citas', href: '/appointments', icon: UserCircle },
    ];

    const menuItems = userRole === 'provider' ? providerMenuItems : consumerMenuItems;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-800 focus:ring-0">
            <Avatar className="h-9 w-9 border border-purple-500/50">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? undefined} />
              <AvatarFallback className="bg-purple-900 text-purple-200 font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800 text-gray-200" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-white">{user.name}</p>
              <p className="text-xs leading-none text-gray-500">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-800" />
          
          {menuItems.map((item) => (
            <DropdownMenuItem key={item.name} asChild className="cursor-pointer focus:bg-gray-800 focus:text-white">
              <Link href={item.href} className="flex items-center">
                <item.icon className="mr-2 h-4 w-4 text-purple-400" />
                <span>{item.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="bg-gray-800" />
          <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-900/20 focus:text-red-300 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const AuthButtons = () => (
    <div className="flex items-center gap-4">
      <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors">
        Iniciar Sesión
      </Link>
      <Link href="/register">
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg shadow-purple-500/20">
          Crear Cuenta
        </Button>
      </Link>
    </div>
  );

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen 
          ? "bg-gray-950/80 backdrop-blur-md border-b border-gray-800 py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="z-50 relative">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            QuHealthy
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        {userRole !== 'provider' && (
           <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
             {navItems.map((item) => (
               <Link 
                 key={item.name} 
                 href={item.href} 
                 className="text-sm font-medium text-gray-300 hover:text-white transition-colors hover:scale-105 transform duration-200"
               >
                 {item.name}
               </Link>
             ))}
           </nav>
        )}
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="h-9 w-9 bg-gray-800 rounded-full animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* <NotificationBell />  <-- Descomentar cuando tengas el componente */}
              <UserMenuDropdown />
            </div>
          ) : (
            <AuthButtons />
          )}
        </div>
        
        {/* Mobile Toggle */}
        <div className="md:hidden z-50">
           <button 
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
             className="text-gray-300 hover:text-white p-2"
             aria-label="Menu"
           >
             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-gray-950 border-b border-gray-800 overflow-hidden"
          >
             <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                {navItems.map((item) => (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      className="text-lg font-medium text-gray-300 hover:text-purple-400 py-2 sborder-b border-gray-800/50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                        {item.name}
                    </Link>
                ))}

                <div className="pt-4">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.image ?? undefined} />
                            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{user?.name}</p>
                            <p className="text-xs text-gray-500">{userRole === 'provider' ? 'Profesional' : 'Paciente'}</p>
                          </div>
                       </div>
                       
                       {/* Mobile Dashboard Links */}
                       <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start border-gray-700 text-gray-300">
                             <LayoutDashboard className="mr-2 h-4 w-4" /> Ir al Dashboard
                          </Button>
                       </Link>

                       <Button variant="destructive" onClick={handleLogout} className="w-full justify-start">
                          <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                       </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-800">
                          Iniciar Sesión
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                          Crear Cuenta Gratis
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};