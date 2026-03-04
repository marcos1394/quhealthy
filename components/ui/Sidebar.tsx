/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Store, Calendar, Users, BarChart3, Settings,
  HeartPulse, ChevronLeft, LogOut, Sparkles,
  ClipboardList,
  MessageSquare,
  Menu
} from 'lucide-react';
import { useSessionStore } from '@/stores/SessionStore'; // 1. Importamos el nuevo store unificado
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from './button';

// Configuración de los elementos de navegación
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

// Animaciones (sin cambios)
const sidebarVariants = {
  expanded: { width: 280, transition: { duration: 0.3, ease: "easeOut" } },
  collapsed: { width: 80, transition: { duration: 0.3, ease: "easeOut" } }
};

const itemVariants = {
  expanded: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
  collapsed: { opacity: 0, x: -20, transition: { duration: 0.15 } }
};

// Componente Principal
export const Sidebar: React.FC<{ className?: string }> = ({ className = "" }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 2. Usamos el nuevo store de sesión
  const { user, isLoading, clearSession } = useSessionStore();

  // 3. La lógica de logout ahora usa 'clearSession'
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      clearSession();
      toast.success('Sesión cerrada exitosamente.');
      router.push('/');
    } catch (error) {
      toast.error("No se pudo cerrar la sesión.");
      clearSession();
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

  // Mientras se carga la sesión, mostramos un esqueleto para evitar saltos
  if (isLoading) {
    return <aside className="hidden md:flex flex-col w-64 bg-gray-900 animate-pulse"></aside>;
  }

  // Si no hay sesión o el rol no es de proveedor, no se muestra el sidebar
  if (!user || user.role !== 'PROVIDER') {
    return null;
  }

  return (
    <motion.aside
      className={`hidden md:flex flex-col bg-gradient-to-b from-gray-900 to-gray-800/95 
                  backdrop-blur-xl border-r border-gray-700/50 relative overflow-hidden ${className}`}
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      initial={false}
    >
      {/* Header */}
      <div className="relative z-10 flex items-center h-20 px-4 border-b border-gray-700/50 shrink-0">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="flex items-center"
              variants={itemVariants} initial="collapsed" animate="expanded" exit="collapsed"
            >
              <div className="ml-1">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
                  QuHealthy
                </h1>
                <div className="flex items-center mt-0.5">
                  <Sparkles className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-xs text-yellow-400 font-medium capitalize">{user.planStatus || 'Trial'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2.5 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 text-gray-300 hover:text-white ml-auto shadow-sm transition-all"
        >
          <Menu className="w-5 h-5" />
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
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-semibold">
                        {user.firstName?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800" />
                </div>
                <div className="flex-1 min-w-0 transition-opacity duration-300">
                  <p className="font-medium text-white text-sm truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
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