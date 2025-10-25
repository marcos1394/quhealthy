"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Store, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  HeartPulse,
  LogOut,
  MessageSquare,
  ClipboardList
} from 'lucide-react';
import { useSessionStore } from '@/stores/SessionStore'; // 1. Importamos el store de sesión unificado
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from '@/components/ui/button'; // Asegúrate que la ruta a tu componente Button sea correcta

// Array de configuración para los elementos de navegación.
const navItems = [
   { name: 'Dashboard', href: '/quhealthy/provider/dashboard', icon: LayoutDashboard },
  { name: 'Mi Tienda', href: '/quhealthy/provider/onboarding/marketplace', icon: Store },
  { name: 'Agenda', href: '/quhealthy/provider/dashboard/calendar', icon: Calendar },
  { name: 'Mis Citas', href: '/quhealthy/provider/dashboard/appointments', icon: ClipboardList },
  { name: 'Reseñas', href: '/quhealthy/provider/dashboard/reviews', icon: MessageSquare }, // <-- AÑADE ESTA LÍNEA
  { name: 'Pacientes', href: '/quhealthy/provider/patients', icon: Users },
  { name: 'Reportes', href: '/quhealthy/provider/reports', icon: BarChart3 },
  { name: 'Configuración', href: '/quhealthy/provider/settings', icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  // 2. Usamos el nuevo store para la lógica
  const { user, isLoading, clearSession } = useSessionStore();
  
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      clearSession(); // <-- Usamos la acción del nuevo store
      toast.success('Sesión cerrada exitosamente.');
      router.push('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("No se pudo cerrar la sesión.");
      clearSession(); // Forzamos la limpieza y redirección como fallback
      router.push('/');
    }
  };

  // Si está cargando, mostramos un esqueleto para evitar saltos en la UI
  if (isLoading) {
    return <aside className="hidden md:flex flex-col w-64 bg-gray-900 animate-pulse"></aside>;
  }
  
  // Si no hay sesión o el rol no es de proveedor, no se muestra nada.
  // El layout se encargará de redirigir si es necesario.
  if (!user || user.role !== 'provider') {
    return null;
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-900/70 backdrop-blur-xl border-r border-gray-700/50">
      <div className="flex items-center justify-center h-20 border-b border-gray-700/50 shrink-0">
        <HeartPulse className="w-8 h-8 text-purple-400" />
        <h1 className="text-2xl font-bold text-white ml-3">QuHealthy</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-base
                ${
                  isActive
                    ? 'bg-purple-600/50 text-white font-semibold shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`
              }
            >
              <item.icon className={`w-5 h-5 mr-4 ${isActive ? 'text-purple-300' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-700/50">
        <Button 
          variant="destructive" 
          className="w-full bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
};