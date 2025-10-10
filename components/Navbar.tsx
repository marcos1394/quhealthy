/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut, UserCircle, Store, Calendar, Settings } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-toastify';
// --- INICIO DE LA CORRECCIÓN ---
import { useSessionStore } from '@/stores/SessionStore'; // 1. Importamos el nuevo store unificado
// --- FIN DE LA CORRECCIÓN ---
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationBell } from './ui/NotificationBell'; // <-- Importa el nuevo componente


// Items de navegación para usuarios NO autenticados
const publicNavItems = [
  { name: "Descubrir", href: "/discover" },
  { name: "Para Profesionales", href: "/#profesionales" },
];

// Items de navegación para CONSUMIDORES autenticados
const consumerNavItems = [
    { name: "Descubrir", href: "/discover" },
    { name: "Mis Citas", href: "/consumer/appointments" },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  // --- INICIO DE LA CORRECCIÓN ---
  // 2. Usamos el nuevo store para obtener el usuario y el estado de carga
  const { user, isLoading, clearSession } = useSessionStore();
  const isAuthenticated = !!user;
  const userRole = user?.role;
  // --- FIN DE LA CORRECCIÓN ---

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      clearSession(); // Usamos la acción del nuevo store
      toast.success('Sesión cerrada exitosamente.');
      router.push('/');
    } catch (error) {
      toast.error("No se pudo cerrar la sesión.");
      clearSession();
      router.push('/');
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = userRole === 'consumer' ? consumerNavItems : publicNavItems;

  const UserMenu = () => {
    if (!user) return null;

    const providerMenuItems = [
      { name: 'Dashboard', href: '/quhealthy/dashboard', icon: LayoutDashboard },
      { name: 'Mi Tienda', href: '/quhealthy/onboarding/marketplace', icon: Store },
      { name: 'Agenda', href: '/quhealthy/dashboard/calendar', icon: Calendar },
      { name: 'Configuración', href: '/quhealthy/settings', icon: Settings },
    ];
    
    const consumerMenuItems = [
      { name: 'Mi Panel', href: '/consumer/dashboard', icon: LayoutDashboard },
      { name: 'Mis Citas', href: '/consumer/appointments', icon: UserCircle },
    ];

    const menuItems = userRole === 'provider' ? providerMenuItems : consumerMenuItems;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            <Avatar className="w-9 h-9 border-2 border-purple-400">
              <AvatarFallback className="bg-gray-700 text-purple-300 font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:block text-white font-medium">{user.name}</span>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white w-56" align="end">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          
          {menuItems.map((item) => (
            <DropdownMenuItem key={item.name} asChild className="cursor-pointer">
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4 text-gray-400" />
                <span>{item.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-500/20 focus:text-red-300">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const AuthButtons = () => (
    <>
      <Link href="/login" className="text-white hover:text-purple-400">Ingresar</Link>
      <Link href="/signup"><Button size="sm">Crear Cuenta</Button></Link>
    </>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${isScrolled ? "bg-gray-900/80 backdrop-blur-lg py-3" : "bg-transparent py-4"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">Quhealthy</Link>
        
        {userRole !== 'provider' && (
            <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="text-white hover:text-purple-400">
                {item.name}
                </Link>
            ))}
            </nav>
        )}
        
        {userRole === 'provider' && <div className="flex-1"></div>}

        <div className="hidden md:flex items-center gap-4">
  {isLoading 
    ? <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" /> 
    : isAuthenticated 
      ? (
          <>
            {/* --- AÑADE ESTA LÍNEA --- */}
            <NotificationBell />
            {/* ----------------------- */}
            <UserMenu />
          </>
        ) 
      : <AuthButtons />
  }
</div>
        
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};