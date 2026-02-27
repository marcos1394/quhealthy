"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LayoutDashboard, LogOut, User as UserIcon,
  Store, Calendar, Settings, Sparkles, Megaphone,
  Search, Heart, LucideIcon // Importamos el tipo para los iconos
} from "lucide-react";
import { toast } from 'react-toastify';
import { useTranslations } from "next-intl";

// Imports de lógica
import { useSessionStore } from '@/stores/SessionStore';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from "@/types/auth"; // Asegúrate de importar esto

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
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

// --- 1. DEFINICIÓN DE TIPOS PARA LOS LINKS ---
interface NavItem {
  name: string;
  href: string;
  icon?: LucideIcon; // El icono es opcional
}

// --- 2. CONFIGURACIÓN DE NAVEGACIÓN (Tipada) ---
// Usamos Record para asegurar que cubrimos todos los casos o 'string' para ser flexibles
const LINKS: Record<string, NavItem[]> = {
  GUEST: [
    { name: "links.guest.discover", href: "/discover" },
    { name: "links.guest.business", href: "/business" },
    { name: "links.guest.pricing", href: "/pricing" },
  ],
  CONSUMER: [
    { name: "links.consumer.discover", href: "/discover", icon: Search },
    { name: "links.consumer.appointments", href: "/appointments", icon: Calendar },
    { name: "links.consumer.favorites", href: "/favorites", icon: Heart },
  ],
  PROVIDER: [
    { name: "links.provider.dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "links.provider.calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "links.provider.patients", href: "/dashboard/patients", icon: UserIcon },
  ],
  ADMIN: [
    { name: "links.admin.panel", href: "/admin", icon: LayoutDashboard },
    { name: "links.admin.users", href: "/admin/users", icon: UserIcon },
  ]
};

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // ✅ CORRECCIÓN 1: No extraemos fetchSession del store (ya no existe ahí)
  const { user, role, isAuthenticated, isLoading } = useSessionStore();

  // ✅ CORRECCIÓN 2: Usamos checkSession del hook useAuth
  const { logout, checkSession } = useAuth();

  const t = useTranslations('Navbar');

  // 1. Hydration: Validar sesión al montar
  useEffect(() => {
    checkSession();
  }, []); // Array vacío para ejecutar solo al montar

  // 2. Efecto de Scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info(t('toast.logout'));
    setMobileMenuOpen(false);
  };

  // ✅ CORRECCIÓN 3: Selección de links segura con tipos
  // Si el rol existe en LINKS, lo usamos. Si no, usamos GUEST.
  const currentLinks: NavItem[] = (isAuthenticated && role && LINKS[role])
    ? LINKS[role]
    : LINKS.GUEST;

  // --- COMPONENTES INTERNOS ---

  const UserAvatar = ({ className, size = "sm" }: { className?: string, size?: "sm" | "lg" }) => (
    <Avatar className={cn(
      "border border-slate-200 dark:border-slate-800 transition-colors duration-300",
      size === "lg" ? "h-12 w-12" : "h-9 w-9",
      className
    )}>
      <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "Usuario"} />
      <AvatarFallback className="bg-medical-50 text-medical-700 dark:bg-medical-900/30 dark:text-medical-300 font-semibold text-xs">
        {user?.firstName ? user.firstName.substring(0, 2).toUpperCase() : <UserIcon size={14} />}
      </AvatarFallback>
    </Avatar>
  );

  const UserMenuDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent focus-visible:ring-1 focus-visible:ring-purple-500">
          <UserAvatar />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-gray-950" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 bg-gray-950/95 backdrop-blur-xl border-gray-800 shadow-2xl p-1 text-gray-200"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal mb-1 p-2">
          <div className="flex items-center gap-3">
            <UserAvatar size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-medical-500/10 text-medical-400 border border-medical-500/20 capitalize">
                {role?.toLowerCase()}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-800" />

        <div className="p-1 space-y-0.5">
          {role === 'PROVIDER' ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer flex items-center gap-2 text-sm">
                  <LayoutDashboard size={16} className="text-medical-400" /> {t('links.provider.dashboard')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/calendar" className="cursor-pointer flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-teal-400" /> {t('links.provider.calendar')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/marketing" className="cursor-pointer flex items-center gap-2 text-sm">
                  <Megaphone size={16} className="text-emerald-400" /> {t('links.provider.marketing')}
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/appointments" className="cursor-pointer flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-medical-400" /> {t('links.consumer.appointments')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/favorites" className="cursor-pointer flex items-center gap-2 text-sm">
                  <Heart size={16} className="text-red-400" /> {t('links.consumer.favorites')}
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer flex items-center gap-2 text-sm">
              <Settings size={16} className="text-gray-400" /> {t('user_menu.settings')}
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-gray-800" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer p-2 m-1 rounded-md"
        >
          <LogOut size={16} className="mr-2" /> {t('user_menu.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled || mobileMenuOpen
          ? "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 py-3 shadow-sm"
          : "bg-white dark:bg-slate-950 border-transparent py-4 md:py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">

        {/* LOGO - Minimalista */}
        <Link href="/" className="flex items-center gap-2 relative z-50">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-medical-600">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            QuHealthy
          </span>
        </Link>

        {/* DESKTOP NAV - Estilo plano */}
        {!isLoading && (
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            {currentLinks.map((item: NavItem) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 flex items-center gap-2",
                    isActive
                      ? "text-medical-600 dark:text-medical-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  {Icon && <Icon size={16} className={isActive ? "text-medical-600 dark:text-medical-400" : "text-slate-400"} />}
                  {t(item.name)}
                </Link>
              );
            })}
          </nav>
        )}

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-3">

          {/* ✅ LÓGICA MEJORADA: 
             Solo mostramos el esqueleto si está cargando Y ADEMÁS creemos que hay sesión (token existe).
             Si está cargando pero no hay token, mostramos los botones de invitado directamente.
          */}
          {isLoading && useSessionStore.getState().token ? (
            <div className="h-9 w-9 bg-gray-800 rounded-full animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <LanguageToggle />
              {role === 'PROVIDER' && (
                <Button variant="ghost" size="default" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <Megaphone size={20} />
                </Button>
              )}
              <UserMenuDropdown />
            </div>
          ) : (
            // ESTADO GUEST (Visitante)
            <>
              <ThemeToggle />
              <LanguageToggle />
              <Link href="/login">
                <Button variant="ghost" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-9 px-4">
                  {t('buttons.login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-medical-600 text-white hover:bg-medical-700 font-medium h-9 px-5 rounded-md border-0 transition-colors">
                  {t('buttons.register')}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white transition-colors z-50 rounded-md hover:bg-white/10"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg"
          >
            <div className="p-4 flex flex-col gap-2">
              {isAuthenticated && (
                <div className="flex items-center gap-3 p-3 mb-2 bg-white/5 rounded-xl border border-white/10">
                  <UserAvatar size="lg" />
                  <div>
                    <p className="text-white font-medium">{user?.firstName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              )}

              {currentLinks.map((item: NavItem) => { // ✅ Tipado aquí también
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                  >
                    {Icon && <Icon size={18} className="text-medical-500 dark:text-medical-400" />}
                    {t(item.name)}
                  </Link>
                );
              })}

              <div className="h-px bg-gray-800 my-2" />

              {isAuthenticated ? (
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full justify-start bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20"
                >
                  <LogOut className="mr-2 h-4 w-4" /> {t('user_menu.logout')}
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">{t('buttons.login')}</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-medical-600 text-white hover:bg-medical-700">{t('buttons.create_account')}</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};