"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LayoutDashboard, LogOut, User as UserIcon,
  Store, Calendar, Settings, Megaphone,
  Search, Heart, LucideIcon
} from "lucide-react";
import { toast } from 'react-toastify';
import { useTranslations } from "next-intl";

// Imports de lógica
import { useSessionStore } from '@/stores/SessionStore';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from "@/types/auth"; 

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
  icon?: LucideIcon;
}

// --- 2. CONFIGURACIÓN DE NAVEGACIÓN ---
const LINKS: Record<string, NavItem[]> = {
  GUEST: [
    { name: "links.guest.suite", href: "/#suite" },
    { name: "links.guest.modules", href: "/#platform-modules" },
    { name: "links.guest.pricing", href: "/#pricing" },
    { name: "links.guest.testimonials", href: "/#testimonials" },
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

  const { user, role, isAuthenticated, isLoading, initializeSession, _hasHydrated } = useSessionStore();
  const { logout } = useAuth();
  const t = useTranslations('Navbar');

  useEffect(() => {
    if (_hasHydrated) {
      initializeSession();
    }
  }, [_hasHydrated, initializeSession]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.info(t('toast.logout'));
    setMobileMenuOpen(false);
  };

  const currentLinks: NavItem[] = (isAuthenticated && role && LINKS[role])
    ? LINKS[role]
    : LINKS.GUEST;

  // --- COMPONENTES INTERNOS ---

  // Avatar Arquitectónico (Cuadrado, sin redondeos, grayscale por defecto)
  const UserAvatar = ({ className, size = "sm" }: { className?: string, size?: "sm" | "lg" }) => (
    <Avatar className={cn(
      "rounded-none border border-black dark:border-white transition-all duration-300 grayscale hover:grayscale-0",
      size === "lg" ? "h-12 w-12" : "h-9 w-9",
      className
    )}>
      <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "Usuario"} className="rounded-none object-cover" />
      <AvatarFallback className="rounded-none bg-gray-100 text-black dark:bg-[#050505] dark:text-white font-bold text-[10px] uppercase tracking-widest">
        {user?.firstName ? user.firstName.substring(0, 2) : <UserIcon size={14} />}
      </AvatarFallback>
    </Avatar>
  );

  const UserMenuDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-none p-0 hover:bg-transparent focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white">
          <UserAvatar />
          <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-black dark:bg-white border-2 border-white dark:border-[#0a0a0a]" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 bg-white dark:bg-[#0a0a0a] rounded-none border border-black dark:border-white shadow-none p-0"
        align="end"
        sideOffset={12}
      >
        <DropdownMenuLabel className="font-normal p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <UserAvatar size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-black dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mb-2">{user?.email}</p>
              <span className="inline-block px-2 py-0.5 border border-black dark:border-white text-black dark:text-white text-[8px] font-bold uppercase tracking-widest">
                {role}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <div className="py-2">
          {role === 'PROVIDER' ? (
            <>
              <DropdownMenuItem asChild className="rounded-none focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                  <LayoutDashboard size={14} /> {t('links.provider.dashboard')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-none focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
                <Link href="/dashboard/calendar" className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                  <Calendar size={14} /> {t('links.provider.calendar')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-none focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
                <Link href="/dashboard/marketing" className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                  <Megaphone size={14} /> {t('links.provider.marketing')}
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild className="rounded-none focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
                <Link href="/appointments" className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                  <Calendar size={14} /> {t('links.consumer.appointments')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-none focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
                <Link href="/favorites" className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                  <Heart size={14} /> {t('links.consumer.favorites')}
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem asChild className="rounded-none focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
            <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
              <Settings size={14} /> {t('user_menu.settings')}
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800 m-0" />

        <div className="p-2">
          <DropdownMenuItem
            onClick={handleLogout}
            className="rounded-none text-red-600 focus:text-white focus:bg-red-600 dark:focus:bg-red-600 cursor-pointer px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            <LogOut size={14} className="mr-3" /> {t('user_menu.logout')}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled || mobileMenuOpen
          ? "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 py-3"
          : "bg-white dark:bg-[#0a0a0a] border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 xl:px-24 flex items-center justify-between">

        {/* LOGO - Editorial Minimalist */}
        <Link href="/" className="flex items-center gap-2 relative z-50 group">
          <span className="text-2xl font-serif italic tracking-tight text-black dark:text-white transition-opacity group-hover:opacity-60">
            QuHealthy.
          </span>
        </Link>

        {/* DESKTOP NAV - Estilo plano y técnico */}
        {!isLoading && (
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {currentLinks.map((item: NavItem) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              const targetHref = (pathname === "/" && item.href.startsWith("/#"))
                ? item.href.substring(1) 
                : item.href;

              const linkClasses = cn(
                "relative text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 flex items-center gap-2 py-2 group",
                isActive ? "text-black dark:text-white" : "text-gray-400 hover:text-black dark:hover:text-white"
              );

              const innerContent = (
                <>
                  {Icon && <Icon size={14} className={cn("transition-colors", isActive ? "text-black dark:text-white" : "text-gray-400 group-hover:text-black dark:group-hover:text-white")} />}
                  {t(item.name)}
                  
                  {/* Arquitectural Underline Indicator */}
                  {isActive ? (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-px bg-black dark:bg-white"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  ) : (
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-black dark:bg-white opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all origin-left duration-300 ease-out" />
                  )}
                </>
              );

              return targetHref.startsWith("#") ? (
                <a key={item.name} href={targetHref} className={linkClasses}>{innerContent}</a>
              ) : (
                <Link key={item.name} href={targetHref} className={linkClasses}>{innerContent}</Link>
              );
            })}
          </nav>
        )}

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-4">

          {isLoading && useSessionStore.getState().token ? (
            <div className="h-9 w-9 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-5">
              <ThemeToggle />
              <LanguageToggle />
              {role === 'PROVIDER' && (
                <Button variant="ghost" size="icon" className="rounded-none text-gray-500 hover:text-black dark:hover:text-white">
                  <Megaphone size={18} />
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
                <Button variant="ghost" className="rounded-none text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-transparent h-10 px-4 transition-colors">
                  {t('buttons.login')}
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-10 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0">
                    {t('buttons.register')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#0a0a0a] rounded-none border border-black dark:border-white shadow-none p-0">
                  <DropdownMenuItem asChild className="rounded-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
                    <Link href="/provider/register" className="flex items-center gap-4 w-full">
                      <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center text-black dark:text-white">
                        <Store size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white">Profesional</span>
                        <span className="text-[9px] font-light text-gray-500">Ofrece tus servicios</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="rounded-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 p-4">
                    <Link href="/register" className="flex items-center gap-4 w-full">
                      <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center text-black dark:text-white">
                        <UserIcon size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white">Paciente</span>
                        <span className="text-[9px] font-light text-gray-500">Agenda tus citas</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-black dark:text-white transition-colors z-50 border border-transparent hover:border-black dark:hover:border-white"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE MENU (Blueprint Style) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="md:hidden bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="flex flex-col">
              {isAuthenticated && (
                <div className="flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                  <UserAvatar size="lg" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">{user?.firstName}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                </div>
              )}

              {currentLinks.map((item: NavItem) => {
                const Icon = item.icon;
                const targetHref = (pathname === "/" && item.href.startsWith("/#"))
                  ? item.href.substring(1) 
                  : item.href;

                const linkClasses = "flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors";

                return targetHref.startsWith("#") ? (
                  <a key={item.name} href={targetHref} onClick={() => setMobileMenuOpen(false)} className={linkClasses}>
                    {Icon && <Icon size={14} />} {t(item.name)}
                  </a>
                ) : (
                  <Link key={item.name} href={targetHref} onClick={() => setMobileMenuOpen(false)} className={linkClasses}>
                    {Icon && <Icon size={14} />} {t(item.name)}
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 p-6 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                >
                  <LogOut size={14} /> {t('user_menu.logout')}
                </button>
              ) : (
                <div className="p-6 flex flex-col gap-4 bg-gray-50 dark:bg-[#050505]">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-none border-black dark:border-white text-black dark:text-white h-12 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                      {t('buttons.login')}
                    </Button>
                  </Link>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Link href="/provider/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full rounded-none bg-black dark:bg-white text-white dark:text-black h-16 flex-col gap-2 hover:opacity-80">
                        <Store size={14} />
                        <span className="text-[9px] uppercase font-bold tracking-widest">Profesional</span>
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full rounded-none bg-black dark:bg-white text-white dark:text-black h-16 flex-col gap-2 hover:opacity-80">
                        <UserIcon size={14} />
                        <span className="text-[9px] uppercase font-bold tracking-widest">Paciente</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};