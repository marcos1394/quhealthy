"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut, UserCircle, Store, Calendar, Settings, Megaphone } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSessionStore } from '@/stores/SessionStore';
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
import { NotificationBell } from './ui/NotificationBell';

// Items de navegación para usuarios NO autenticados
const publicNavItems = [
  { name: "Descubrir", href: "/discover" },
  // Puedes descomentar esto si quieres un link a una landing page para proveedores
  // { name: "Para Profesionales", href: "/#profesionales" }, 
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
  
  const { user, isLoading, fetchSession, clearSession } = useSessionStore();
  const isAuthenticated = !!user;
  const userRole = user?.role;

  // Iniciamos la carga de la sesión al montar el componente
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleLogout = async () => {
    try {
      const roleBeforeLogout = user?.role;
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      clearSession();
      toast.success('Sesión cerrada exitosamente.');
      
      // Redirección inteligente post-logout
      if (roleBeforeLogout === 'provider') {
        router.push('/quhealthy/authentication/providers/login');
      } else {
        router.push('/');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Determinamos qué items mostrar en la barra central
  const navItems = userRole === 'consumer' ? consumerNavItems : publicNavItems;

  const UserMenu = () => {
    if (!user) return null;

    // Rutas corregidas para el dashboard del proveedor
    const providerMenuItems = [
      { name: 'Dashboard', href: '/quhealthy/providers/dashboard', icon: LayoutDashboard },
      { name: 'Marketing', href: '/quhealthy/providers/dashboard/marketing', icon: Megaphone },
      { name: 'Mi Tienda', href: '/quhealthy/providers/onboarding/marketplace', icon: Store },
      { name: 'Agenda', href: '/quhealthy/providers/dashboard/calendar', icon: Calendar },
      { name: 'Configuración', href: '/quhealthy/providers/dashboard/settings', icon: Settings },
    ];
    
    const consumerMenuItems = [
      { name: 'Mi Panel', href: '/quhealthy/consumer/dashboard', icon: LayoutDashboard },
      { name: 'Mis Citas', href: '/quhealthy/consumer/appointments', icon: UserCircle },
    ];

    const menuItems = userRole === 'provider' ? providerMenuItems : consumerMenuItems;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button whileHover={{ scale: 1.05 }} className="flex items-center gap-3 focus:outline-none">
            <Avatar className="w-9 h-9 border-2 border-purple-400 cursor-pointer">
              <AvatarFallback className="bg-gray-700 text-purple-300 font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:block text-white font-medium text-sm">{user.name}</span>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white w-56 mt-2" align="end">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          
          {menuItems.map((item) => (
            <DropdownMenuItem key={item.name} asChild className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
              <Link href={item.href} className="flex items-center w-full">
                <item.icon className="mr-2 h-4 w-4 text-gray-400" />
                <span>{item.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-500/20 focus:text-red-300 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const AuthButtons = () => (
    <div className="flex items-center gap-4">
      <Link href="/quhealthy/authentication/providers/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">
        Soy Proveedor
      </Link>
      <Link href="/quhealthy/authentication/providers/login" className="text-sm font-medium text-white hover:text-purple-400 transition-colors">
        Ingresar
      </Link>
      <Link href="/quhealthy/authentication/providers/signup">
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-0">
          Crear Cuenta
        </Button>
      </Link>
    </div>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-gray-900/90 backdrop-blur-lg border-b border-gray-800 py-3" : "bg-transparent py-5"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          QuHealthy
        </Link>
        
        {/* Navegación Central (Solo si no es proveedor, para mantener el foco) */}
        {userRole !== 'provider' && (
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                {item.name}
                </Link>
            ))}
            </nav>
        )}
        
        {/* Lado Derecho: Auth / User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            // Skeleton de carga sutil para evitar saltos de layout
            <div className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded-full" />
                <div className="w-20 h-4 bg-gray-700 rounded hidden lg:block" />
            </div>
          ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <UserMenu />
              </div>
            ) : (
              <AuthButtons />
            )
          }
        </div>
        
        {/* Menú Móvil */}
        <div className="md:hidden flex items-center gap-4">
            {/* Mostramos la campana también en móvil si está logueado */}
            {isAuthenticated && <NotificationBell />}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2 hover:bg-gray-800 rounded-lg transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      {/* Dropdown Móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="md:hidden absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-800 p-4 shadow-xl"
            >
                <nav className="flex flex-col gap-4">
                    {navItems.map((item) => (
                        <Link key={item.name} href={item.href} className="text-gray-300 hover:text-white py-2 border-b border-gray-800" onClick={() => setMobileMenuOpen(false)}>
                            {item.name}
                        </Link>
                    ))}
                    
                    {isAuthenticated ? (
                        // En móvil, el menú de usuario se expande aquí
                         <div className="flex flex-col gap-2 pt-2">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Mi Cuenta</p>
                            {userRole === 'provider' ? (
                                <>
                                    <Link href="/quhealthy/provider/dashboard" className="flex items-center gap-2 text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}><LayoutDashboard size={16}/> Dashboard</Link>
                                    <Link href="/quhealthy/provider/dashboard/marketing" className="flex items-center gap-2 text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}><Megaphone size={16}/> Marketing</Link>
                                    <Link href="/quhealthy/provider/onboarding/marketplace" className="flex items-center gap-2 text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}><Store size={16}/> Mi Tienda</Link>
                                    <Link href="/quhealthy/provider/dashboard/calendar" className="flex items-center gap-2 text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}><Calendar size={16}/> Agenda</Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/quhealthy/consumer/dashboard" className="flex items-center gap-2 text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}><LayoutDashboard size={16}/> Mi Panel</Link>
                                    <Link href="/quhealthy/consumer/appointments" className="flex items-center gap-2 text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}><UserCircle size={16}/> Mis Citas</Link>
                                </>
                            )}
                            <Button variant="destructive" onClick={handleLogout} className="w-full justify-start mt-4">
                                <LogOut size={16} className="mr-2"/> Cerrar Sesión
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 pt-4">
                             <Link href="/login" onClick={() => setMobileMenuOpen(false)}><Button variant="outline" className="w-full border-gray-600 text-gray-300">Ingresar como Paciente</Button></Link>
                             <Link href="/provider/authentication/login" onClick={() => setMobileMenuOpen(false)}><Button variant="ghost" className="w-full text-gray-400">Ingresar como Proveedor</Button></Link>
                             <Link href="/signup" onClick={() => setMobileMenuOpen(false)}><Button className="w-full bg-purple-600">Crear Cuenta</Button></Link>
                        </div>
                    )}
                </nav>
            </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};