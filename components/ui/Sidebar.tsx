"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Store, Calendar, Users, BarChart3, Settings,
  HeartPulse, ChevronLeft, LogOut, Sparkles
} from 'lucide-react';
import { useProviderStatusStore } from '@/stores/ProviderStatusStore';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from './button'; // Asegúrate de tener un componente Button

// --- Configuración (sin cambios) ---
const navItems = [
  { name: 'Dashboard', href: '/quhealthy/dashboard', icon: LayoutDashboard },
  { name: 'Mi Tienda', href: '/quhealthy/onboarding/marketplace', icon: Store },
  { name: 'Agenda', href: '/quhealthy/calendar', icon: Calendar },
  { name: 'Pacientes', href: '/quhealthy/patients', icon: Users },
  { name: 'Reportes', href: '/quhealthy/reports', icon: BarChart3 },
  { name: 'Configuración', href: '/quhealthy/settings', icon: Settings },
];



// --- Animaciones (sin cambios) ---
const sidebarVariants = {
  expanded: { width: 280, transition: { duration: 0.3, ease: "easeOut" } },
  collapsed: { width: 80, transition: { duration: 0.3, ease: "easeOut" } }
};

const itemVariants = {
  expanded: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
  collapsed: { opacity: 0, x: -20, transition: { duration: 0.15 } }
};


// --- Componente Principal (Refactorizado) ---
export const Sidebar: React.FC<{ className?: string }> = ({ className = "" }) => {
  const pathname = usePathname();
  const router = useRouter();

  // 1. El estado ahora se gestiona internamente
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // 2. Conectamos al estado global de Zustand para obtener la información del usuario
  const { status: providerStatus, isLoading } = useProviderStatusStore();

  // 3. Lógica de logout completa
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      useProviderStatusStore.getState().clearStatus();
      toast.success('Sesión cerrada exitosamente.');
      router.push('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("No se pudo cerrar la sesión.");
      useProviderStatusStore.getState().clearStatus();
      router.push('/');
    }
  };

  // Auto-colapsar en pantallas pequeñas
  useEffect(() => {
    const handleResize = () => setIsCollapsed(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    // Muestra un estado de carga sutil mientras se obtiene el usuario
    return <div className="hidden md:flex w-80 bg-gray-900 animate-pulse"></div>;
  }
  
  // Si no hay sesión, no renderizamos el sidebar (el layout se encargará de redirigir)
  if (!providerStatus) {
    return null;
  }

  const user = providerStatus.providerDetails;

  return (
    <motion.aside
      className={`hidden md:flex flex-col bg-gradient-to-b from-gray-900 to-gray-800/95 
                  backdrop-blur-xl border-r border-gray-700/50 relative overflow-hidden ${className}`}
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      initial={false}
    >
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between h-20 px-4 border-b border-gray-700/50 shrink-0">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="flex items-center"
              variants={itemVariants} initial="collapsed" animate="expanded" exit="collapsed"
            >
              <HeartPulse className="w-8 h-8 text-purple-400" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">QuHealthy</h1>
                <div className="flex items-center mt-1">
                  <Sparkles className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-xs text-yellow-400 font-medium">{providerStatus.planStatus}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white"
        >
          <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }}>
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}
              className={`relative flex items-center rounded-xl transition-all duration-300 overflow-hidden
                ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
                ${isActive
                  ? 'bg-purple-600/20 text-white'
                  : 'text-gray-300 hover:bg-gray-700/30'
                }`
              }
            >
              <item.icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-purple-300' : 'text-gray-400'}`} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    className="ml-4 font-medium"
                    variants={itemVariants} initial="collapsed" animate="expanded" exit="collapsed"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="relative z-10 p-4 border-t border-gray-700/50">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={itemVariants} initial="collapsed" animate="expanded" exit="collapsed"
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-2 rounded-xl bg-gray-800/50">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center font-semibold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};