/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Store, Calendar, Users, BarChart3, Settings,
  ClipboardList, MessageSquare, Menu, LogOut, Sparkles
} from 'lucide-react';
import { useSessionStore } from '@/stores/SessionStore';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from './button';
import { handleApiError } from '@/lib/handleApiError';

const sidebarVariants = {
  expanded: { width: 280, transition: { duration: 0.3, ease: "easeOut" } },
  collapsed: { width: 80, transition: { duration: 0.3, ease: "easeOut" } }
};

const itemVariants = {
  expanded: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
  collapsed: { opacity: 0, x: -20, transition: { duration: 0.15 } }
};

export const Sidebar: React.FC<{ className?: string }> = ({ className = "" }) => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('SidebarNav');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoading, clearSession } = useSessionStore();

  const navItems = [
    { name: t('dashboard'), href: '/quhealthy/provider/dashboard', icon: LayoutDashboard },
    { name: t('store'), href: '/quhealthy/provider/onboarding/marketplace', icon: Store },
    { name: t('calendar'), href: '/quhealthy/provider/dashboard/calendar', icon: Calendar },
    { name: t('appointments'), href: '/quhealthy/provider/dashboard/appointments', icon: ClipboardList },
    { name: t('reviews'), href: '/quhealthy/provider/dashboard/reviews', icon: MessageSquare },
    { name: t('patients'), href: '/quhealthy/provider/patients', icon: Users },
    { name: t('reports'), href: '/quhealthy/provider/reports', icon: BarChart3 },
    { name: t('settings'), href: '/quhealthy/provider/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      clearSession();
      toast.success(t('logout_success'));
      router.push('/');
    } catch (error) {
      clearSession();
      router.push('/');
    }
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

  if (!user || user.role !== 'PROVIDER') {
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
                  <span className="text-xs text-yellow-400 font-medium capitalize">{user.planStatus || 'Trial'}</span>
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

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
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