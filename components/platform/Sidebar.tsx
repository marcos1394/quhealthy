"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
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
  AlertTriangle,
  FileText,
  BrainCircuit,
  Flower2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useSessionStore } from "@/stores/SessionStore";
import { useModuleStore } from "@/stores/useModuleStore";
import { useActiveModules } from "@/hooks/useActiveModules";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  subscriptionService,
  CurrentSubscription,
} from "@/services/subscription.service";

// ── CONFIGURACIÓN DE RUTAS ──────────────────────────────────────────────
const providerLinks = [
  { key: "dashboard", href: "/provider/dashboard", icon: LayoutDashboard, badge: null },
  { key: "calendar", href: "/provider/dashboard/calendar", icon: CalendarDays, badge: null },
  { key: "patients", href: "/provider/dashboard/patients", icon: Users, badge: null },
  { key: "store", href: "/provider/store", icon: BriefcaseMedical, badge: null },
  { key: "cash_register", href: "/provider/dashboard/cash-register", icon: Calculator, badge: null },
  { key: "orders", href: "/provider/dashboard/orders", icon: Package, badge: null },
  { key: "inventory", href: "/provider/dashboard/inventory", icon: PackageCheck, badge: null },
  { key: "biomedical", href: "/provider/dashboard/biomedical", icon: Activity, badge: null },
  { key: "billing", href: "/provider/dashboard/billing", icon: CreditCard, badge: null },
  { key: "finance", href: "/provider/dashboard/finance", icon: Calculator, badge: null },
  { key: "appointments", href: "/provider/dashboard/appointments", icon: ClipboardIcon, badge: null },
  { key: "emergencies", href: "/provider/dashboard/emergencies", icon: AlertTriangle, badge: null },
  { key: "messages", href: "/provider/dashboard/messages", icon: MessageCircle, badge: null },
  { key: "referrals", href: "/provider/dashboard/referrals", icon: Handshake, badge: null },
  { key: "history", href: "/provider/dashboard/history", icon: History, badge: null },
  { key: "templates", href: "/provider/dashboard/templates", icon: FileText, badge: null },
  { key: "marketing", href: "/provider/dashboard/marketing", icon: BadgeX, badge: null },
];

const providerSettingsLinks = [
  { key: "public_profile", href: "/provider/dashboard/profile", icon: UserCircle, badge: null },
  { key: "settings", href: "/provider/dashboard/settings", icon: Settings, badge: null },
];

const patientLinks = [
  { key: "dashboard", href: "/patient/dashboard", icon: LayoutDashboard, badge: null },
  { key: "copilot", href: "/copilot", icon: BrainCircuit, badge: { count: "IA" } },
  { key: "appointments", href: "/patient/dashboard/appointments", icon: CalendarDays, badge: null },
  { key: "treatments", href: "/patient/dashboard/treatments", icon: BriefcaseMedical, badge: null },
  // ─── Módulos especializados: solo visibles si el paciente tiene un diagnóstico relacionado ───
  { key: "oncology",     href: "/patient/oncology",                   icon: Activity, badge: null, condition: "oncology" },
  { key: "womens_health",href: "/patient/dashboard/womens-health",    icon: Flower2,  badge: null, condition: "womens_health" },
  { key: "diabetes",     href: "/patient/diabetes",                   icon: Activity, badge: null, condition: "diabetes" },
  // ─── Módulos base ───
  { key: "discover", href: "/discover", icon: Sparkles, badge: null },
  { key: "vault", href: "/patient/dashboard/vault", icon: Vault, badge: null },
  { key: "nutrition", href: "/patient/dashboard/nutrition", icon: Utensils, badge: { count: "IA" } },
  { key: "messages", href: "/patient/dashboard/messages", icon: MessageCircle, badge: null },
  { key: "packages", href: "/patient/dashboard/packages", icon: Crown, badge: null },
  { key: "reviews", href: "/patient/dashboard/reviews", icon: Star, badge: null },
  { key: "favorites", href: "/patient/dashboard/favorites", icon: HeartIcon, badge: null },
  { key: "dependents", href: "/patient/dashboard/family", icon: Users, badge: null },
  { key: "wallet", href: "/patient/dashboard/wallet", icon: CreditCard, badge: null },
  { key: "orders", href: "/patient/dashboard/orders", icon: Package, badge: null },
  { key: "courses", href: "/patient/dashboard/courses", icon: BookOpen, badge: null },
];

const patientSettingsLinks = [
  { key: "profile", href: "/patient/dashboard/profile", icon: UserCircle, badge: null },
  { key: "settings", href: "/patient/dashboard/settings", icon: Settings, badge: null },
];

// ── COMPONENTE DE ÍTEM DE NAVEGACIÓN ─────────────────────────────────────
const NavItem = ({
  href,
  icon: Icon,
  label,
  badge,
  isCollapsed,
  pathname,
  itemKey,
}: {
  href: string;
  icon: any;
  label: string;
  badge?: { count: number | string } | null;
  isCollapsed: boolean;
  pathname: string | null;
  itemKey: string;
}) => {
  const isActive = Boolean(
    pathname === href ||
      (href !== "/provider/dashboard" &&
        href !== "/patient/dashboard" &&
        pathname?.startsWith(href))
  );

  const getIconColorClass = (key: string, active: boolean) => {
    if (active) return "text-emerald-600 dark:text-emerald-400";
    if (["reviews"].includes(key)) return "text-amber-500";
    if (["favorites"].includes(key)) return "text-rose-500";
    if (["wallet", "billing", "finance", "cash_register"].includes(key))
      return "text-emerald-600 dark:text-emerald-400";
    if (["copilot"].includes(key)) return "text-emerald-600 dark:text-emerald-400";
    if (["messages"].includes(key)) return "text-sky-500";
    if (["packages"].includes(key)) return "text-amber-500";
    if (["orders", "inventory"].includes(key)) return "text-purple-500";
    if (["patients", "dependents", "public_profile", "profile"].includes(key))
      return "text-indigo-500";
    if (["calendar", "appointments"].includes(key)) return "text-orange-500";
    if (["womens_health", "oncology", "diabetes"].includes(key)) return "text-pink-500";
    if (["discover"].includes(key)) return "text-fuchsia-500";
    if (["emergencies"].includes(key)) return "text-rose-500";
    if (["nutrition"].includes(key)) return "text-lime-500";
    if (["treatments"].includes(key)) return "text-cyan-500";

    return "text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors";
  };

  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={cn(
        "relative flex items-center gap-3.5 transition-all duration-200 group rounded-2xl mx-1.5 cursor-pointer font-sans select-none",
        isCollapsed ? "justify-center p-2.5 w-11 h-11 mx-auto" : "px-3.5 py-2.5",
        isActive
          ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-2xs"
          : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-[#0a0a0a] hover:text-gray-900 dark:hover:text-white font-semibold"
      )}
    >
      <div
        className={cn(
          "relative z-10 flex items-center",
          isCollapsed ? "justify-center w-full" : "gap-3.5 flex-1"
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
            getIconColorClass(itemKey, isActive)
          )}
          strokeWidth={isActive ? 2.5 : 2}
        />

        {!isCollapsed && (
          <span className="text-xs truncate tracking-tight">{label}</span>
        )}

        {/* Insignias de la Plataforma */}
        {badge && !isCollapsed && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-[10px] font-mono font-bold shadow-2xs">
            {badge.count}
          </span>
        )}

        {badge && isCollapsed && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-[#0a0a0a]" />
        )}
      </div>
    </Link>
  );
};

// ── BARRA LATERAL PRINCIPAL ──────────────────────────────────────────────
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
  const router = useRouter();
  const t = useTranslations("SidebarNav");

  const [isCollapsedState, setIsCollapsed] = useState(true);
  const isCollapsed = isMobile ? false : isCollapsedState;

  const { logout } = useAuth();
  const { role, user } = useSessionStore();
  const { isModuleActive } = useModuleStore();
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [isSwitchingProfile, setIsSwitchingProfile] = useState(false);

  // Carga los módulos activos del paciente según sus diagnósticos CIE-10
  useActiveModules();

  const isConsumer = role === "ROLE_CONSUMER";
  const isStaff = role === "ROLE_STAFF";
  const homeLink = isConsumer ? "/patient/dashboard" : "/provider/dashboard";

  const currentLinks = useMemo(() => {
    let links = isConsumer ? patientLinks : providerLinks;
    // Filter specialized modules by active diagnoses
    if (isConsumer) {
      links = links.filter((link) => {
        const condition = (link as { condition?: string }).condition;
        if (!condition) return true; // base links always visible
        return isModuleActive(condition);
      });
    }
    if (isStaff && user?.permissions) {
      links = links.filter(
        (link) =>
          link.key === "dashboard" || user.permissions?.includes(link.key)
      );
    }
    return links;
  }, [isConsumer, isStaff, user?.permissions, isModuleActive]);

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

  const handleSwitchProfile = async () => {
    setIsSwitchingProfile(true);
    const { switchRoleProfile } = useSessionStore.getState();
    const result = await switchRoleProfile();

    const localeMatch = window.location.pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
    const currentLocale = localeMatch ? `/${localeMatch[1]}` : "/es";

    if (result.success) {
      toast.success(t("profile_switched_successfully"), { autoClose: 2000 });
      router.push(isConsumer ? "/provider/dashboard" : "/patient/dashboard");
    } else {
      setIsSwitchingProfile(false);
      if (result.error === "PROFILE_NOT_FOUND") {
        toast.info(t("profile_not_found_redirecting"), { autoClose: 3000 });
        router.push(
          isConsumer
            ? `${currentLocale}/register?role=PROVIDER`
            : `${currentLocale}/register?role=CONSUMER`
        );
      } else {
        toast.error(t("switch_profile_error"));
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
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col h-screen border-r border-gray-100 dark:border-gray-800 transition-colors duration-300 z-50 overflow-hidden shrink-0 bg-gray-50/60 dark:bg-[#050505] font-sans select-none",
        className
      )}
    >
      {/* ── CABECERA / MARCA ─────────────────────────────────────────── */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-gray-100 dark:border-gray-800 shrink-0 transition-all bg-white dark:bg-[#0a0a0a]",
          isCollapsed ? "justify-center px-0" : "px-4 sm:px-5 gap-2"
        )}
      >
        {!isCollapsed && (
          <Link
            href={homeLink}
            className="flex-1 items-center gap-2 flex overflow-hidden min-w-0"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
              <Sparkles className="w-4 h-4" strokeWidth={2} />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white tracking-wider truncate uppercase">
              {t("brand_name")}
            </span>
          </Link>
        )}

        <div
          className={cn(
            "flex items-center gap-1.5",
            isCollapsed ? "mx-auto flex-col gap-3" : "ml-auto"
          )}
        >
          {!isCollapsed && <ThemeToggle />}
          {!isCollapsed && <NotificationBell isCollapsed={isCollapsed} />}

          {isMobile ? (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center shrink-0 shadow-2xs cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsedState)}
              className="w-8 h-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center shrink-0 shadow-2xs cursor-pointer"
            >
              <Menu className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* ── BANNER DE PLAN DE SUSCRIPCIÓN (PROVEEDORES) ───────────────── */}
      {!isCollapsed && !isConsumer && (
        <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          <Link href="/provider/dashboard/settings#subscription">
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 flex items-start gap-3 hover:border-emerald-500/40 transition-all shadow-2xs group cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <Crown className="w-4 h-4" strokeWidth={2} />
              </div>
              <div className="space-y-0.5 truncate">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {subscription?.planName || t("no_plan")}
                </p>
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase">
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

      {/* ── NAVEGACIÓN Y MENÚS ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-2 space-y-6">
        {/* Módulo Principal */}
        <nav className="space-y-1">
          {!isCollapsed && (
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
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
                itemKey={link.key}
              />
            ))}
          </div>
        </nav>

        {/* Módulo de Configuración */}
        <nav className="border-t border-gray-100 dark:border-gray-800/80 pt-4 space-y-1">
          {!isCollapsed && (
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
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
                itemKey={link.key}
              />
            ))}
          </div>
        </nav>
      </div>

      {/* ── PIE DE PÁGINA (CAMBIO DE PERFIL Y SALIDA) ─────────────────── */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1 shrink-0 bg-white dark:bg-[#0a0a0a]">
        <button
          type="button"
          onClick={handleSwitchProfile}
          disabled={isSwitchingProfile}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#050505] transition-all group disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <UserCircle
              className={cn(
                "w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400",
                isSwitchingProfile && "animate-spin"
              )}
              strokeWidth={2}
            />
            {!isCollapsed && (
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors truncate">
                {isSwitchingProfile
                  ? t("switching")
                  : isConsumer
                  ? t("switch_to_provider")
                  : t("switch_to_patient")}
              </span>
            )}
          </div>
        </button>

        {!isCollapsed && (
          <Link href="/patient/dashboard/support">
            <button
              type="button"
              className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#050505] transition-all group cursor-pointer"
            >
              <HelpCircle
                className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                strokeWidth={2}
              />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors truncate">
                {t("support")}
              </span>
            </button>
          </Link>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full p-2.5 rounded-xl transition-all group hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? t("logout") : undefined}
        >
          <LogOut
            className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors"
            strokeWidth={2}
          />
          {!isCollapsed && (
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
              {t("logout")}
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};