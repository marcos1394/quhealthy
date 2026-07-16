/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-doctor/button-has-type */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  Settings,
  LogOut,
  HelpCircle,
  Crown,
  BriefcaseMedical,
  UserCircle,
  Sparkles,
  Vault,
  MessageCircle,
  Star,
  HeartIcon,
  Menu,
  Package,
  ClipboardIcon,
  Handshake,
  History,
  BadgeX,
  PackageCheck,
  Calculator,
  BookOpen,
  X,
  Utensils,
  Activity,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { useSessionStore } from "@/stores/SessionStore";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  subscriptionService,
  CurrentSubscription,
} from "@/services/subscription.service";
import { useTranslations } from "next-intl";

const providerLinks = [
  {
    key: "dashboard",
    href: "/provider/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    key: "calendar",
    href: "/provider/dashboard/calendar",
    icon: CalendarDays,
    badge: null,
  },
  {
    key: "patients",
    href: "/provider/dashboard/patients",
    icon: Users,
    badge: null,
  },
  {
    key: "store",
    href: "/provider/store",
    icon: BriefcaseMedical,
    badge: null,
  },
  {
    key: "cash_register",
    href: "/provider/dashboard/cash-register",
    icon: Calculator,
    badge: null,
  },
  {
    key: "orders",
    href: "/provider/dashboard/orders",
    icon: Package,
    badge: null,
  },
  {
    key: "inventory",
    href: "/provider/dashboard/inventory",
    icon: PackageCheck,
    badge: null,
  },
  {
    key: "biomedical",
    href: "/provider/dashboard/biomedical",
    icon: Activity,
    badge: null,
  },
  {
    key: "billing",
    href: "/provider/dashboard/billing",
    icon: CreditCard,
    badge: null,
  },
  {
    key: "finance",
    href: "/provider/dashboard/finance",
    icon: Calculator,
    badge: null,
  },
  {
    key: "appointments",
    href: "/provider/dashboard/appointments",
    icon: ClipboardIcon,
    badge: null,
  },
  {
    key: "messages",
    href: "/provider/dashboard/messages",
    icon: MessageCircle,
    badge: null,
  },
  {
    key: "referrals",
    href: "/provider/dashboard/referrals",
    icon: Handshake,
    badge: null,
  },
  {
    key: "history",
    href: "/provider/dashboard/history",
    icon: History,
    badge: null,
  },
  {
    key: "marketing",
    href: "/provider/dashboard/marketing",
    icon: BadgeX,
    badge: null,
  },
];

const providerSettingsLinks = [
  {
    key: "public_profile",
    href: "/provider/dashboard/profile",
    icon: UserCircle,
    badge: null,
  },
  {
    key: "settings",
    href: "/provider/dashboard/settings",
    icon: Settings,
    badge: null,
  },
];

const patientLinks = [
  {
    key: "dashboard",
    href: "/patient/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    key: "appointments",
    href: "/patient/dashboard/appointments",
    icon: CalendarDays,
    badge: null,
  },
  { key: "discover", href: "/discover", icon: Sparkles, badge: null },
  { key: "vault", href: "/patient/dashboard/vault", icon: Vault, badge: null },
  {
    key: "nutrition",
    href: "/patient/dashboard/nutrition",
    icon: Utensils,
    badge: { count: "IA" },
  },
  {
    key: "messages",
    href: "/patient/dashboard/messages",
    icon: MessageCircle,
    badge: null,
  },
  {
    key: "packages",
    href: "/patient/dashboard/packages",
    icon: Crown,
    badge: null,
  },
  {
    key: "reviews",
    href: "/patient/dashboard/reviews",
    icon: Star,
    badge: null,
  },
  {
    key: "favorites",
    href: "/patient/dashboard/favorites",
    icon: HeartIcon,
    badge: null,
  },
  {
    key: "dependents",
    href: "/patient/dashboard/family",
    icon: Users,
    badge: null,
  },
  {
    key: "wallet",
    href: "/patient/dashboard/wallet",
    icon: CreditCard,
    badge: null,
  },
  {
    key: "orders",
    href: "/patient/dashboard/orders",
    icon: Package,
    badge: null,
  },
  {
    key: "courses",
    href: "/patient/dashboard/courses",
    icon: BookOpen,
    badge: null,
  },
];

const patientSettingsLinks = [
  {
    key: "profile",
    href: "/patient/dashboard/profile",
    icon: UserCircle,
    badge: null,
  },
  {
    key: "settings",
    href: "/patient/dashboard/settings",
    icon: Settings,
    badge: null,
  },
];

const NavItem = ({
  href,
  icon: Icon,
  label,
  badge,
  isCollapsed,
  pathname,
}: {
  href: string;
  icon: any;
  label: string;
  badge?: { count: number | string; color?: string } | null;
  isCollapsed: boolean;
  pathname: string | null;
}) => {
  const isActive =
    pathname === href ||
    (href !== "/provider/dashboard" &&
      href !== "/patient/dashboard" &&
      pathname?.startsWith(href));

  return (
    <Link
      href={href}
      title={isCollapsed ? label : ""}
      className={cn(
        "relative flex items-center gap-4 transition-colors group border",
        isCollapsed
          ? "justify-center p-3 w-12 h-12 mx-auto"
          : "px-4 py-3 w-full",
        isActive
          ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
          : "bg-transparent text-gray-500 border-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white",
      )}
    >
      <div
        className={cn(
          "relative z-10 flex items-center",
          isCollapsed ? "justify-center w-full" : "gap-4 flex-1",
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4 flex-shrink-0 transition-colors",
            isActive
              ? "text-white dark:text-black"
              : "text-gray-500 group-hover:text-white dark:group-hover:text-black",
          )}
          strokeWidth={isActive ? 2 : 1.5}
        />

        {!isCollapsed && (
          <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
            {label}
          </span>
        )}

        {/* Badge Architectura */}
        {badge && !isCollapsed && (
          <div className="ml-auto px-2 py-0.5 border border-black dark:border-white text-[9px] font-bold">
            {badge.count}
          </div>
        )}
        {badge && isCollapsed && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-black dark:bg-white border border-white dark:border-black rounded-none" />
        )}
      </div>
    </Link>
  );
};

export const Sidebar = ({
  className = "",
  isMobile = false,
  onClose,
}: {
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}) => {
  const pathname = usePathname();
  // 🚀 INICIA CERRADO POR DEFECTO PARA RESPETAR EL ESPACIO AL INGRESAR (en Desktop)
  const [isCollapsedState, setIsCollapsed] = useState(true);

  // Si estamos en la versión móvil (Sheet), forzamos que no esté colapsado
  const isCollapsed = isMobile ? false : isCollapsedState;

  const { logout } = useAuth();
  const { role, user } = useSessionStore();
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(
    null,
  );
  const t = useTranslations("SidebarNav");

  const isConsumer = role === "ROLE_CONSUMER";
  const isStaff = role === "ROLE_STAFF";
  const homeLink = isConsumer ? "/patient/dashboard" : "/provider/dashboard";

  let currentLinks = isConsumer ? patientLinks : providerLinks;
  if (isStaff && user?.permissions) {
    currentLinks = currentLinks.filter(
      (link) =>
        link.key === "dashboard" || user.permissions?.includes(link.key),
    );
  }

  const currentSettingsLinks = isConsumer
    ? patientSettingsLinks
    : providerSettingsLinks;

  useEffect(() => {
    if (!isConsumer) {
      subscriptionService
        .getCurrentSubscription()
        .then(setSubscription)
        .catch(() => setSubscription(null));
    }
  }, [isConsumer]);

  const [isSwitchingProfile, setIsSwitchingProfile] = useState(false);
  const router = useRouter();

  const handleSwitchProfile = async () => {
    setIsSwitchingProfile(true);
    const { switchRoleProfile } = useSessionStore.getState();
    const result = await switchRoleProfile();

    // Obtenemos el locale actual
    const localeMatch = window.location.pathname.match(
      /^\/([a-zA-Z]{2})(\/|$)/,
    );
    const currentLocale = localeMatch ? `/${localeMatch[1]}` : "/es";

    if (result.success) {
      toast.success(
        t("profile_switched_successfully", {
          defaultValue: "Perfil cambiado exitosamente",
        }),
        { autoClose: 2000 },
      );
      router.push(isConsumer ? "/provider/dashboard" : "/patient/dashboard");
    } else {
      setIsSwitchingProfile(false);
      if (result.error === "PROFILE_NOT_FOUND") {
        toast.info(
          t("profile_not_found_redirecting", {
            defaultValue: "No tienes este perfil aún. Redirigiendo...",
          }),
          { autoClose: 3000 },
        );
        // Redirigir al registro del rol opuesto
        router.push(
          isConsumer
            ? `${currentLocale}/register?role=PROVIDER`
            : `${currentLocale}/register?role=CONSUMER`,
        );
      } else {
        toast.error(
          t("switch_profile_error", {
            defaultValue: "Ocurrió un error al cambiar de perfil.",
          }),
        );
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info(t("logout_success"), { autoClose: 2000 });
  };

  return (
    <motion.aside
      animate={{ width: isMobile ? "100%" : isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // Curva arquitectónica, sin rebotes
      className={cn(
        "flex flex-col h-screen border-r border-gray-200 dark:border-gray-800 transition-colors duration-300 z-50 overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-[#050505]",
        className,
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "h-20 flex items-center border-b border-gray-200 dark:border-gray-800 flex-shrink-0 transition-all",
          isCollapsed ? "justify-center px-0" : "px-4 sm:px-6 gap-1",
        )}
      >
        {!isCollapsed && (
          <Link
            href={homeLink}
            className="flex-1 overflow-hidden min-w-0 mr-1 sm:mr-2"
          >
            <span className="text-[10px] sm:text-sm font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-black dark:text-white truncate block">
              QUHEALTHY
            </span>
          </Link>
        )}

        <div
          className={cn(
            "flex items-center gap-1 sm:gap-2",
            isCollapsed ? "mx-auto flex-col gap-4" : "ml-auto",
          )}
        >
          {!isCollapsed && <ThemeToggle />}
          {!isCollapsed && <NotificationBell isCollapsed={isCollapsed} />}

          {/* El botón de hamburguesa se oculta si estamos en móvil, ya que el Sheet controla el cierre */}
          {isMobile ? (
            <button
              onClick={onClose}
              className="w-10 h-10 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white hover:border-black dark:hover:border-white transition-colors flex items-center justify-center flex-shrink-0"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          ) : (
            <button
              onClick={() => setIsCollapsed(!isCollapsedState)}
              className="w-10 h-10 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white hover:border-black dark:hover:border-white transition-colors flex items-center justify-center flex-shrink-0"
            >
              <Menu className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Plan Banner (Solo Provider) */}
      {!isCollapsed && !isConsumer && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/provider/dashboard/settings#subscription">
            <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-4 flex items-start gap-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group">
              <Crown
                className="w-4 h-4 shrink-0 mt-0.5 group-hover:text-white dark:group-hover:text-black"
                strokeWidth={1.5}
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 group-hover:text-white dark:group-hover:text-black">
                  {subscription?.planName || t("no_plan")}
                </p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 group-hover:text-gray-300">
                  {subscription?.gateway === "FREE"
                    ? t("upgrade_plan")
                    : subscription
                      ? t("manage_plan")
                      : t("activate_plan")}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Navigation (Con scroll invisible/nativo adaptativo) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-[#050505] dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700">
        {/* Core Links */}
        <nav>
          {!isCollapsed && (
            <h3 className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4 px-2">
              {t("platform")}
            </h3>
          )}
          <div className="space-y-1">
            {currentLinks.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={t(link.key)}
                badge={link.badge}
                isCollapsed={isCollapsed}
                pathname={pathname}
              />
            ))}
          </div>
        </nav>

        {/* Settings Links */}
        <nav className="border-t border-gray-200 dark:border-gray-800 pt-8">
          {!isCollapsed && (
            <h3 className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4 px-2">
              {t("settings_section")}
            </h3>
          )}
          <div className="space-y-1">
            {currentSettingsLinks.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={t(link.key)}
                badge={link.badge}
                isCollapsed={isCollapsed}
                pathname={pathname}
              />
            ))}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2 flex-shrink-0 bg-gray-50 dark:bg-[#050505]">
        <button
          onClick={handleSwitchProfile}
          disabled={isSwitchingProfile}
          className={cn(
            "flex items-center gap-4 w-full px-4 py-3 transition-colors text-medical-600 dark:text-medical-400 border border-medical-200 dark:border-medical-800/50 bg-medical-50/50 dark:bg-medical-500/10 rounded-lg",
            "hover:bg-medical-100 dark:hover:bg-medical-500/20",
            isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "",
          )}
          title={
            isCollapsed
              ? isConsumer
                ? t("switch_to_provider", {
                    defaultValue: "Cambiar a Proveedor",
                  })
                : t("switch_to_patient", { defaultValue: "Cambiar a Paciente" })
              : ""
          }
        >
          <UserCircle
            className={cn(
              "w-4 h-4 flex-shrink-0",
              isSwitchingProfile && "animate-spin",
            )}
            strokeWidth={2}
          />
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
              {isSwitchingProfile
                ? t("switching", { defaultValue: "Cambiando..." })
                : isConsumer
                  ? t("switch_to_provider", {
                      defaultValue: "Cambiar a Proveedor",
                    })
                  : t("switch_to_patient", {
                      defaultValue: "Cambiar a Paciente",
                    })}
            </span>
          )}
        </button>

        {!isCollapsed && (
          <Link href="/patient/dashboard/support">
            <button className="flex items-center gap-4 w-full px-4 py-3 text-gray-500 hover:text-black dark:hover:text-white border border-transparent hover:border-gray-300 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors rounded-lg">
              <HelpCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                {t("support")}
              </span>
            </button>
          </Link>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-4 w-full px-4 py-3 transition-colors text-gray-500 border border-transparent rounded-lg",
            "hover:bg-red-500 hover:text-white hover:border-red-500",
            isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "",
          )}
          title={isCollapsed ? t("logout") : ""}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
              {t("logout")}
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};
