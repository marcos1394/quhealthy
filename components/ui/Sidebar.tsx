/* eslint-disable react-doctor/no-react19-deprecated-apis */
/* eslint-disable react-doctor/no-initialize-state */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
 LayoutDashboard, Store, Calendar, Users, BarChart3, Settings,
 ClipboardList, MessageSquare, Menu, LogOut, Sparkles, ShoppingBag,
 CreditCard, Package, DollarSign, Globe, Shield
} from 'lucide-react';
import { useSessionStore } from '@/stores/SessionStore';
import { useProviderRole, type StaffModule } from '@/hooks/useProviderRole';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './button';

const sidebarVariants = {
 expanded: { width: 280, transition: { duration: 0.3, ease: "easeOut" } },
 collapsed: { width: 80, transition: { duration: 0.3, ease: "easeOut" } }
};

const itemVariants = {
 expanded: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
 collapsed: { opacity: 0, x: -20, transition: { duration: 0.15 } }
};

interface NavItem {
 name: string;
 href: string;
 icon: React.ElementType;
 /** Módulo requerido para que STAFF pueda ver este ítem. undefined = solo PROVIDER */
 module?: StaffModule;
}

export const Sidebar: React.FC<{ className?: string }> = ({ className = "" }) => {
 const pathname = usePathname();
 const router = useRouter();
 const t = useTranslations('SidebarNav');
 const [isCollapsed, setIsCollapsed] = useState(false);
 const { user, isLoading } = useSessionStore();
 const { logout } = useAuth();
 const { isStaff, isProvider, canAccess, roleLabel } = useProviderRole();

 /**
  * Todos los ítems del sidebar con su módulo requerido.
  * Los ítems sin `module` son exclusivos del PROVIDER (no aparecen para STAFF).
  */
 const allNavItems: NavItem[] = [
  { name: t('dashboard'),      href: '/provider/dashboard',             icon: LayoutDashboard },
  { name: 'Citas',             href: '/provider/dashboard/appointments', icon: ClipboardList,  module: 'APPOINTMENTS' },
  { name: 'Calendario',        href: '/provider/dashboard/calendar',     icon: Calendar,       module: 'CALENDAR' },
  { name: 'Pacientes',         href: '/provider/dashboard/patients',     icon: Users,          module: 'PATIENTS' },
  { name: 'Mensajes / CRM',    href: '/provider/dashboard/messages',     icon: MessageSquare,  module: 'MESSAGES' },
  { name: 'Órdenes',           href: '/provider/dashboard/orders',       icon: ShoppingBag,    module: 'ORDERS' },
  { name: 'Caja',              href: '/provider/dashboard/cash-register', icon: DollarSign,    module: 'CASH_REGISTER' },
  { name: 'Facturación',       href: '/provider/dashboard/billing',      icon: CreditCard,     module: 'BILLING' },
  { name: 'Inventario',        href: '/provider/dashboard/inventory',    icon: Package,        module: 'INVENTORY' },
  { name: 'Perfil Público',    href: '/provider/dashboard/profile',      icon: Globe,          module: 'PUBLIC_PROFILE' },
  // ── Solo PROVIDER ──────────────────────────────────────────
  { name: t('store'),          href: '/provider/onboarding/marketplace', icon: Store },
  { name: 'Marketing',         href: '/provider/dashboard/marketing',    icon: BarChart3 },
  { name: 'Contabilidad',      href: '/provider/dashboard/accounting',   icon: BarChart3 },
  { name: t('settings'),       href: '/provider/settings',               icon: Settings },
 ];

 /**
  * Filtrar ítems visibles según el rol:
  * - PROVIDER: ve todo
  * - STAFF: solo los ítems cuyo módulo está en sus permissions,
  *          más el Dashboard siempre visible
  */
 const navItems = allNavItems.filter((item) => {
  if (isProvider) return true; // el doctor ve todo
  if (isStaff) {
   // Sin módulo asignado = exclusivo del provider, STAFF no lo ve
   if (!item.module) return item.href === '/provider/dashboard'; // Dashboard siempre
   return canAccess(item.module);
  }
  return false;
 });

 const handleLogout = async () => {
  await logout();
  toast.success(t('logout_success'));
 };

 useEffect(() => {
  const handleResize = () => setIsCollapsed(window.innerWidth < 1024);
  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
 }, []);

 if (isLoading) {
  return <aside className="hidden md:flex flex-col w-64 bg-slate-900 dark:bg-slate-950 animate-pulse"></aside>;
 }

 if (!user || (user.role !== 'ROLE_PROVIDER' && user.role !== 'ROLE_STAFF')) {
  return null;
 }

 return (
  <motion.aside
  className={`hidden md:flex flex-col bg-gradient-to-b from-slate-900 to-slate-800/95 dark:from-slate-950 dark:to-slate-900/95
  backdrop-blur-xl border-r border-slate-700/50 dark:border-slate-800/50 relative overflow-hidden ${className}`}
  variants={sidebarVariants}
  animate={isCollapsed ? "collapsed" : "expanded"}
  initial={false}
  >
  {/* Header */}
  <div className="relative z-10 flex items-center h-20 px-4 border-b border-slate-700/50 dark:border-slate-800/50 shrink-0">
   <AnimatePresence>
   {!isCollapsed && (
    <motion.div
    className="flex items-center"
    variants={itemVariants} initial="collapsed" animate="expanded" exit="collapsed"
    >
    <div className="ml-1">
     <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
     QuHealthy
     </h1>
     <div className="flex items-center mt-0.5">
     <Sparkles className="w-3 h-3 text-yellow-400 mr-1" />
     {isStaff ? (
      <span className="text-xs text-sky-400 font-medium capitalize">{roleLabel}</span>
     ) : (
      <span className="text-xs text-yellow-400 font-medium capitalize">{user.planStatus || 'Trial'}</span>
     )}
     </div>
    </div>
    </motion.div>
   )}
   </AnimatePresence>
   <motion.button
   onClick={() => setIsCollapsed(!isCollapsed)}
   className="p-2.5 rounded-xl bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 hover:bg-slate-700 dark:hover:bg-slate-800 hover:border-slate-600 dark:hover:border-slate-700 text-slate-300 hover:text-white ml-auto shadow-sm transition-all"
   >
   <Menu className="w-5 h-5" />
   </motion.button>
  </div>

  {/* Badge STAFF (si aplica) */}
  {isStaff && !isCollapsed && (
   <div className="relative z-10 mx-4 mt-3 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center gap-2">
    <Shield className="w-3 h-3 text-sky-400 shrink-0" />
    <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider truncate">
    Acceso limitado
    </span>
   </div>
  )}

  {/* Navigation */}
  <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
  {navItems.map((item) => {
   const isActive = pathname.includes(item.href);
   return (
   <Link key={item.href} href={item.href}
    className={`relative flex items-center rounded-xl transition-all duration-300 overflow-hidden
    ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
    ${isActive
     ? 'bg-medical-600/20 dark:bg-medical-500/15 text-white'
     : 'text-slate-300 dark:text-slate-400 hover:bg-slate-700/30 dark:hover:bg-slate-800/50'
    }`
   }
   >
   <item.icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-medical-300 dark:text-medical-400' : 'text-slate-400 dark:text-slate-500'}`} />
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
  <div className="relative z-10 p-4 border-t border-slate-700/50 dark:border-slate-800/50">
  <AnimatePresence>
   {!isCollapsed && (
   <motion.div
    variants={itemVariants} initial="collapsed" animate="expanded" exit="collapsed"
    className="space-y-3"
   >
    <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-800/50 dark:bg-slate-900/50">
    <div className="relative">
     <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
     {user.profileImageUrl ? (
      <img src={user.profileImageUrl} alt={user.firstName} className="w-full h-full object-cover" />
     ) : (
      <span className="text-white text-xs font-semibold">
      {user.firstName?.charAt(0).toUpperCase()}
      </span>
     )}
     </div>
     <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800 dark:border-slate-950" />
    </div>
    <div className="flex-1 min-w-0 transition-opacity duration-300">
     <p className="font-medium text-white text-sm truncate">{user.firstName} {user.lastName}</p>
     <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
     {isStaff ? roleLabel : user.email}
     </p>
    </div>
    </div>
    <Button variant="destructive" className="w-full" onClick={handleLogout}>
    <LogOut className="w-4 h-4 mr-2" />
    {t('logout')}
    </Button>
   </motion.div>
   )}
  </AnimatePresence>
  </div>
  </motion.aside>
 );
};