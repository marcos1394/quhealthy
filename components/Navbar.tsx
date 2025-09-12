"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut, UserCircle } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useProviderStatusStore } from '@/stores/ProviderStatusStore';
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

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  const { status: providerStatus, isLoading } = useProviderStatusStore();
  const isAuthenticated = !!providerStatus;

  const handleLogout = async () => {
    try {
      // 1. Llama al endpoint del backend para que elimine la cookie httpOnly
      await axios.post('/api/auth/logout');
      
      // 2. Limpia el estado global en el frontend (Zustand)
      useProviderStatusStore.getState().clearStatus();
      
      toast.success('Sesión cerrada exitosamente.');
      
      // 3. Redirige al usuario a la página de inicio
      router.push('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("No se pudo cerrar la sesión. Inténtalo de nuevo.");
      // Como fallback, limpiamos el estado y redirigimos de todas formas
      useProviderStatusStore.getState().clearStatus();
      router.push('/');
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Productos", href: "/#suite" },
    { name: "Características", href: "/#caracteristicas" },
    { name: "Planes", href: "/#planes" },
    { name: "Contacto", href: "/contacto" },
  ];

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 focus:outline-none"
        >
          <Avatar className="w-9 h-9 border-2 border-purple-400">
            <AvatarImage src={/* providerStatus?.providerDetails?.avatarUrl || */ undefined} alt="Avatar" />
            <AvatarFallback className="bg-gray-700 text-purple-300 font-semibold">
              {providerStatus?.providerDetails?.name?.charAt(0).toUpperCase() || 'P'}
            </AvatarFallback>
          </Avatar>
          <span className="hidden lg:block text-white font-medium">{providerStatus?.providerDetails?.name}</span>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white w-56" align="end">
        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/quhealthy/profile/providers/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/quhealthy/profile/providers/settings">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Perfil y Configuración</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-500/20 focus:text-red-300 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const AuthButtons = () => (
    <>
      <Link href="/quhealthy/authentication/providers/login" className="text-white hover:text-purple-400 transition-colors font-medium">
        Ingresar
      </Link>
      <Link href="/quhealthy/authentication/providers/signup">
        <Button size="sm">Comenzar Gratis</Button>
      </Link>
    </>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-gray-900/80 backdrop-blur-lg py-3 shadow-lg shadow-purple-950/20" : "bg-transparent py-4"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">Quhealthy</Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="text-white hover:text-purple-400 transition-colors relative group font-medium">
              {item.name}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isLoading ? <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" /> : isAuthenticated ? <UserMenu /> : <AuthButtons />}
        </div>
        
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden bg-gray-900 border-t border-gray-800">
            <div className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => <Link key={item.name} href={item.href} className="text-white py-3 px-4 hover:bg-gray-800 rounded-lg text-lg" onClick={() => setMobileMenuOpen(false)}>{item.name}</Link>)}
              <div className="pt-4 mt-2 border-t border-gray-800">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <Link href="/quhealthy/profile/providers/dashboard" className="block text-center text-white py-3 px-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Ir al Dashboard</Link>
                    <Button onClick={handleLogout} variant="destructive" className="w-full h-12">Cerrar Sesión</Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link href="/quhealthy/authentication/providers/login" className="text-center text-white py-3 px-4 hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Ingresar</Link>
                    <Link href="/quhealthy/authentication/providers/signup"><Button className="w-full h-12">Comenzar Gratis</Button></Link>
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

export default Navbar;