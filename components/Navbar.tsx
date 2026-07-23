"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect, useRef } from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Store,
  Calendar,
  Settings,
  Megaphone,
  Search,
  Heart,
  LucideIcon,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations, useLocale } from "next-intl";

// Imports de lógica
import { useSessionStore } from "@/stores/SessionStore";
import { useAuth } from "@/hooks/useAuth";
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
    {
      name: "links.consumer.appointments",
      href: "/patient/dashboard/appointments",
      icon: Calendar,
    },
    {
      name: "links.consumer.favorites",
      href: "/patient/dashboard/favorites",
      icon: Heart,
    },
  ],
  PROVIDER: [
    {
      name: "links.provider.dashboard",
      href: "/provider/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "links.provider.calendar",
      href: "/provider/dashboard/calendar",
      icon: Calendar,
    },
    {
      name: "links.provider.patients",
      href: "/provider/dashboard/patients",
      icon: UserIcon,
    },
  ],
  ADMIN: [
    { name: "links.admin.panel", href: "/admin", icon: LayoutDashboard },
    { name: "links.admin.users", href: "/admin/users", icon: UserIcon },
  ],
};

export const Navbar: React.FC = () => {
  const {
    user,
    role,
    isAuthenticated,
    isLoading,
    initializeSession,
    _hasHydrated,
  } = useSessionStore();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("Navbar");
  const locale = useLocale();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (_hasHydrated && !hasInitialized.current && !isAuthenticated) {
      hasInitialized.current = true;
      initializeSession();
    }
  }, [_hasHydrated, isAuthenticated, initializeSession]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.info(t("toast.logout"));
    setMobileMenuOpen(false);
  };

  const isAuthLoading = !_hasHydrated || (isLoading && !!user);

  const normalizedRole = role ? role.replace("ROLE_", "") : "GUEST";
  const currentLinks: NavItem[] =
    isAuthenticated && role && LINKS[normalizedRole]
      ? LINKS[normalizedRole]
      : LINKS.GUEST;

  // ── RENDERIZADO DE AVATAR USUARIO ─────────────────────────────────────────
  const renderUserAvatar = ({
    className,
    size = "sm",
  }: { className?: string; size?: "sm" | "lg" } = {}) => (
    <Avatar
      className={cn(
        "rounded-full border border-emerald-200 dark:border-emerald-900/40 shadow-xs transition-all duration-300 shrink-0",
        size === "lg" ? "h-11 w-11" : "h-9 w-9",
        className
      )}
    >
      <AvatarImage
        src={user?.profileImageUrl || ""}
        alt={user?.firstName || "Usuario"}
        className="rounded-full object-cover"
      />
      <AvatarFallback className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-xs">
        {user?.firstName ? (
          user.firstName.substring(0, 2).toUpperCase()
        ) : (
          <UserIcon size={14} />
        )}
      </AvatarFallback>
    </Avatar>
  );

  // ── DROPDOWN DE MENÚ DE USUARIO AUTENTICADO ────────────────────────────────
  const renderUserMenuDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative h-10 w-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {renderUserAvatar()}
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-white dark:border-[#0a0a0a] rounded-full" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-1.5 font-sans"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal p-3 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 mb-1">
          <div className="flex items-center gap-3">
            {renderUserAvatar({ size: "lg" })}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-gray-400 truncate mb-1">
                {user?.email}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[9px] font-bold border border-emerald-200 dark:border-emerald-900/40">
                {role?.replace("ROLE_", "")}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <div className="space-y-0.5">
          {role === "ROLE_PROVIDER" || role === "ROLE_STAFF" ? (
            <>
              <DropdownMenuItem
                asChild
                className="rounded-xl cursor-pointer focus:bg-emerald-50/50 dark:focus:bg-emerald-950/30 p-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                <Link
                  href="/provider/dashboard"
                  className="flex items-center gap-2.5 w-full"
                >
                  <LayoutDashboard size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{t("links.provider.dashboard")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="rounded-xl cursor-pointer focus:bg-emerald-50/50 dark:focus:bg-emerald-950/30 p-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                <Link
                  href="/provider/dashboard/calendar"
                  className="flex items-center gap-2.5 w-full"
                >
                  <Calendar size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{t("links.provider.calendar")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="rounded-xl cursor-pointer focus:bg-emerald-50/50 dark:focus:bg-emerald-950/30 p-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                <Link
                  href="/provider/dashboard/marketing"
                  className="flex items-center gap-2.5 w-full"
                >
                  <Megaphone size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{t("links.provider.marketing")}</span>
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                asChild
                className="rounded-xl cursor-pointer focus:bg-emerald-50/50 dark:focus:bg-emerald-950/30 p-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                <Link href="/discover" className="flex items-center gap-2.5 w-full">
                  <Search size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{t("links.consumer.discover")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="rounded-xl cursor-pointer focus:bg-emerald-50/50 dark:focus:bg-emerald-950/30 p-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                <Link
                  href="/patient/dashboard/appointments"
                  className="flex items-center gap-2.5 w-full"
                >
                  <Calendar size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{t("links.consumer.appointments")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="rounded-xl cursor-pointer focus:bg-emerald-50/50 dark:focus:bg-emerald-950/30 p-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                <Link
                  href="/patient/dashboard/favorites"
                  className="flex items-center gap-2.5 w-full"
                >
                  <Heart size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{t("links.consumer.favorites")}</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem
            asChild
            className="rounded-xl cursor-pointer focus:bg-emerald-50/50 dark:focus:bg-emerald-950/30 p-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            <Link
              href={
                role === "ROLE_PROVIDER" || role === "ROLE_STAFF"
                  ? "/provider/settings"
                  : "/patient/dashboard/settings"
              }
              className="flex items-center gap-2.5 w-full"
            >
              <Settings size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span>{t("user_menu.settings")}</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="rounded-xl text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer p-2.5 text-xs font-bold transition-colors flex items-center gap-2.5"
        >
          <LogOut size={15} />
          <span>{t("user_menu.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 font-sans",
        isScrolled || mobileMenuOpen
          ? "bg-white/85 dark:bg-[#0a0a0a]/85 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 py-3 shadow-xs"
          : "bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm border-b border-transparent py-4"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-7xl flex items-center justify-between">
        
        {/* LOGO DE MARCA QUHEALTHY */}
        <Link href="/" className="flex items-center gap-1 group z-50">
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-opacity group-hover:opacity-80">
            QuHealthy
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">.</span>
        </Link>

        {/* NAVEGACIÓN DESKTOP */}
        {!isLoading && (
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-gray-50/80 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 shadow-xs">
            {currentLinks.map((item: NavItem) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              const targetHref =
                pathname === "/" && item.href.startsWith("/#")
                  ? item.href.substring(1)
                  : item.href;

              const linkClasses = cn(
                "relative text-xs font-bold transition-all px-4 py-2 rounded-full flex items-center gap-2 group",
                isActive
                  ? "bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              );

              const innerContent = (
                <>
                  {Icon && (
                    <Icon
                      size={14}
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      )}
                    />
                  )}
                  <span>{t(item.name)}</span>
                </>
              );

              if (targetHref.startsWith("#")) {
                return (
                  <a key={item.name} href={targetHref} className={linkClasses}>
                    {innerContent}
                  </a>
                );
              } else if (targetHref.startsWith("/#")) {
                return (
                  <a
                    key={item.name}
                    href={`/${locale}${targetHref.substring(1)}`}
                    className={linkClasses}
                  >
                    {innerContent}
                  </a>
                );
              } else {
                return (
                  <Link
                    key={item.name}
                    href={targetHref as any}
                    className={linkClasses}
                  >
                    {innerContent}
                  </Link>
                );
              }
            })}
          </nav>
        )}

        {/* ACCIONES DE NAVBAR */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthLoading ? (
            <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LanguageToggle />
              {(role === "ROLE_PROVIDER" || role === "ROLE_STAFF") && (
                <Link href="/provider/dashboard/marketing">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  >
                    <Megaphone size={18} />
                  </Button>
                </Link>
              )}
              {renderUserMenuDropdown()}
            </div>
          ) : (
            /* ESTADO VISITANTE (GUEST) */
            <>
              <ThemeToggle />
              <LanguageToggle />

              <Link href="/login?clear_session=true">
                <Button
                  variant="ghost"
                  className="rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 h-10 px-4 transition-colors"
                >
                  {t("buttons.login")}
                </Button>
              </Link>

              {/* Menú Registrarse */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 shadow-sm transition-all flex items-center gap-1.5">
                    <span>{t("buttons.register")}</span>
                    <ChevronDown size={14} className="opacity-80" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-60 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-1.5 font-sans space-y-1"
                >
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl cursor-pointer focus:bg-emerald-50/50 dark:focus:bg-emerald-950/30 p-3"
                  >
                    <Link href="/provider/register" className="flex items-center gap-3 w-full">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                        <Store size={16} strokeWidth={2} />
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <span className="font-bold text-xs text-gray-900 dark:text-white">
                          Profesional / Clínica
                        </span>
                        <span className="text-[10px] font-medium text-gray-400">
                          Ofrece tus servicios médicos
                        </span>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    asChild
                    className="rounded-xl cursor-pointer focus:bg-emerald-50/50 dark:focus:bg-emerald-950/30 p-3"
                  >
                    <Link href="/register?clear_session=true" className="flex items-center gap-3 w-full">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                        <UserIcon size={16} strokeWidth={2} />
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <span className="font-bold text-xs text-gray-900 dark:text-white">
                          Paciente
                        </span>
                        <span className="text-[10px] font-medium text-gray-400">
                          Agenda y gestiona tus citas
                        </span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* TOGGLE MENÚ MÓVIL */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-800 dark:text-white transition-colors z-50"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 overflow-hidden font-sans"
          >
            <div className="p-6 space-y-4">
              {isAuthLoading ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full" />
                    <div className="h-2.5 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full" />
                  </div>
                </div>
              ) : (
                isAuthenticated && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                    {renderUserAvatar({ size: "lg" })}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                )
              )}

              {/* Links de Navegación Móvil */}
              <div className="space-y-1 pt-2">
                {currentLinks.map((item: NavItem) => {
                  const Icon = item.icon;
                  const targetHref =
                    pathname === "/" && item.href.startsWith("/#")
                      ? item.href.substring(1)
                      : item.href;

                  const linkClasses =
                    "flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-emerald-50/50 hover:text-emerald-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-colors";

                  const innerContent = (
                    <>
                      {Icon && (
                        <Icon size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      <span>{t(item.name)}</span>
                    </>
                  );

                  if (targetHref.startsWith("#")) {
                    return (
                      <a
                        key={item.name}
                        href={targetHref}
                        onClick={() => setMobileMenuOpen(false)}
                        className={linkClasses}
                      >
                        {innerContent}
                      </a>
                    );
                  } else if (targetHref.startsWith("/#")) {
                    return (
                      <a
                        key={item.name}
                        href={`/${locale}${targetHref.substring(1)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={linkClasses}
                      >
                        {innerContent}
                      </a>
                    );
                  } else {
                    return (
                      <Link
                        key={item.name}
                        href={targetHref as any}
                        onClick={() => setMobileMenuOpen(false)}
                        className={linkClasses}
                      >
                        {innerContent}
                      </Link>
                    );
                  }
                })}
              </div>

              {/* Acciones de Cuenta en Móvil */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-gray-400">Preferencias:</span>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      href={
                        role === "ROLE_PROVIDER" || role === "ROLE_STAFF"
                          ? "/provider/settings"
                          : "/patient/dashboard/settings"
                      }
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-[#050505]"
                    >
                      <Settings size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span>{t("user_menu.settings")}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20"
                    >
                      <LogOut size={16} />
                      <span>{t("user_menu.logout")}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <Link
                      href="/login?clear_session=true"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200"
                      >
                        {t("buttons.login")}
                      </Button>
                    </Link>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/provider/register"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex-col gap-0.5">
                          <Store size={14} />
                          <span className="text-[10px]">Profesional</span>
                        </Button>
                      </Link>

                      <Link
                        href="/register?clear_session=true"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button className="w-full h-12 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold text-xs flex-col gap-0.5">
                          <UserIcon size={14} />
                          <span className="text-[10px]">Paciente</span>
                        </Button>
                      </Link>
                    </div>
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