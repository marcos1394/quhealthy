"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut, UserCircle, Store, Calendar, Settings, Megaphone, Sparkles } from "lucide-react";
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

// --- CONFIGURACIÓN DE NAVEGACIÓN ---
const publicNavItems = [
  { name: "Descubrir", href: "/discover" },
  { name: "Para Doctores", href: "/business" },
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
  const userRole = user?.role;

  // Hydration de sesión
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Efecto de Scroll mejorado
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      clearSession();
      toast.success('Hasta pronto 👋');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error("Logout error", error);
      clearSession();
      router.push('/');
    }
  };

  const navItems = userRole === 'consumer' ? consumerNavItems : publicNavItems;

  // --- SUB-COMPONENTES ---

  const UserMenuDropdown = () => {
    if (!user) return null;

    const providerMenuItems = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Marketing', href: '/dashboard/marketing', icon: Megaphone },
      { name: 'Mi Tienda', href: '/dashboard/store', icon: Store },
      { name: 'Agenda', href: '/dashboard/calendar', icon: Calendar },
      { name: 'Ajustes', href: '/settings', icon: Settings },
    ];
    
    const consumerMenuItems = [
      { name: 'Mi Panel', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Mis Citas', href: '/appointments', icon: UserCircle },
    ];

    const menuItems = userRole === 'provider' ? providerMenuItems : consumerMenuItems;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-10 w-10 rounded-full hover:bg-purple-900/20 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all duration-200"
          >
            <Avatar className="h-10 w-10 border-2 border-purple-500/50 hover:border-purple-400 transition-colors duration-200">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-sm">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-gray-950" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-72 bg-gray-900/95 backdrop-blur-xl border-gray-800 shadow-2xl" 
          align="end" 
          forceMount
          sideOffset={8}
        >
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-purple-500/50">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                {userRole && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-medium uppercase">
                    {userRole === 'provider' ? 'Profesional' : 'Paciente'}
                  </span>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-gray-800" />
          
          <div className="p-2">
            {menuItems.map((item) => (
              <DropdownMenuItem 
                key={item.name} 
                asChild 
                className="cursor-pointer rounded-lg focus:bg-purple-900/20 focus:text-white mb-1 transition-colors duration-150"
              >
                <Link href={item.href} className="flex items-center px-3 py-2">
                  <item.icon className="mr-3 h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
          
          <DropdownMenuSeparator className="bg-gray-800" />
          
          <div className="p-2">
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="text-red-400 focus:bg-red-900/20 focus:text-red-300 cursor-pointer rounded-lg px-3 py-2 transition-colors duration-150"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const AuthButtons = () => (
    <div className="flex items-center gap-3">
      <Link href="/login">
        <Button 
          variant="ghost" 
          size="sm" 
          className="hidden sm:flex text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
        >
          Iniciar Sesión
        </Button>
      </Link>
      <Link href="/register">
        <Button 
          size="sm" 
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
        >
          Crear Cuenta
        </Button>
      </Link>
    </div>
  );

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen 
          ? "bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl shadow-black/20 py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        
        {/* Logo mejorado */}
        <Link href="/" className="z-50 relative group">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
              QuHealthy
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        {userRole !== 'provider' && (
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className="relative text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>
        )}
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <UserMenuDropdown />
            </div>
          ) : (
            <AuthButtons />
          )}
        </div>
        
        {/* Mobile Toggle */}
        <div className="md:hidden z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay mejorado */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className="text-lg font-medium text-gray-300 hover:text-purple-400 py-3 px-4 rounded-lg hover:bg-gray-800/50 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-800">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-900/50 rounded-lg border border-gray-800">
                      <Avatar className="h-12 w-12 border-2 border-purple-500/50">
                        <AvatarImage src={user?.image ?? undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold">
                          {user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {userRole === 'provider' ? 'Profesional' : 'Paciente'}
                        </p>
                      </div>
                    </div>
                    
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> 
                        Ir al Dashboard
                      </Button>
                    </Link>

                    <Button 
                      variant="destructive" 
                      onClick={handleLogout} 
                      className="w-full justify-start bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> 
                      Cerrar Sesión
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
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">
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