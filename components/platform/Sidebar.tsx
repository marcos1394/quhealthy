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
  Package,
  ClipboardIcon,
  Handshake,
  History,
  BadgeX,
  PackageCheck,
  ShoppingBag,
  Calculator,
  BookOpen,
  X,
  Utensils,
  Activity,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  BrainCircuit,
  Flower2,
  Layers,
  Ticket,
  BarChart3,
  UsersRound,
  Store,
  ThermometerSnowflake,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  Truck,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useSessionStore } from "@/stores/SessionStore";
import { useModuleStore } from "@/stores/useModuleStore";
import { useBookingStore } from "@/hooks/useBookingStore";
import { useActiveModules } from "@/hooks/useActiveModules";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Button } from "@/components/ui/button";
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
  { key: "patient_budgets", href: "/provider/dashboard/patient-budgets", icon: FileSpreadsheet, badge: null },
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

const foundationLinks = [
  { key: "dashboard", href: "/foundation/dashboard", icon: LayoutDashboard, badge: null },
  { key: "store", href: "/foundation/store", icon: Store, badge: null },
  { key: "programs", href: "/foundation/programs", icon: Layers, badge: null },
  { key: "beneficiaries", href: "/foundation/beneficiaries", icon: Users, badge: null },
  { key: "subsidies", href: "/foundation/subsidies", icon: Ticket, badge: { count: "Fase 2" } },
  { key: "campaigns", href: "/foundation/campaigns", icon: CalendarDays, badge: { count: "Fase 3" } },
  { key: "social_bi", href: "/foundation/social-bi", icon: BarChart3, badge: { count: "Fase 4" } },
  { key: "team", href: "/foundation/team", icon: UsersRound, badge: null },
];

const foundationSettingsLinks = [
  { key: "public_profile", href: "/foundation/store/identity", icon: UserCircle, badge: null },
  { key: "settings", href: "/foundation/settings", icon: Settings, badge: null },
];

const supplierLinks = [
  { key: "dashboard", href: "/supplier/dashboard", icon: LayoutDashboard, badge: null },
  { key: "products", href: "/supplier/products", icon: Package, badge: null },
  { key: "inventory", href: "/supplier/inventory", icon: PackageCheck, badge: null },
  { key: "orders", href: "/supplier/orders", icon: ShoppingBag, badge: null },
  { key: "quotes", href: "/supplier/quotes", icon: FileText, badge: null },
  { key: "rentals", href: "/supplier/rentals", icon: Activity, badge: null },
  { key: "cold_chain", href: "/supplier/cold-chain", icon: ThermometerSnowflake, badge: null },
];

const supplierSettingsLinks = [
  { key: "onboarding", href: "/onboarding/supplier", icon: Building2, badge: null },
  { key: "settings", href: "/provider/dashboard/settings", icon: Settings, badge: null },
];

const laboratoryLinks = [
  { key: "dashboard", href: "/laboratory/dashboard", icon: LayoutDashboard, badge: null },
  { key: "store", href: "/laboratory/store", icon: Store, badge: { count: "Market" } },
  { key: "orders", href: "/laboratory/orders", icon: ClipboardIcon, badge: { count: "LIS" } },
  { key: "results", href: "/laboratory/results", icon: FileText, badge: null },
  { key: "phlebotomy", href: "/laboratory/phlebotomy", icon: Truck, badge: null },
  { key: "branches", href: "/laboratory/branches", icon: Building2, badge: null },
  { key: "compliance", href: "/laboratory/compliance", icon: ShieldCheck, badge: { count: "NOM-007" } },
  { key: "cash_register", href: "/laboratory/cash-register", icon: Calculator, badge: null },
  { key: "billing", href: "/laboratory/billing", icon: CreditCard, badge: null },
  { key: "referrals", href: "/laboratory/referrals", icon: Handshake, badge: null },
  { key: "messages", href: "/laboratory/messages", icon: MessageCircle, badge: null },
];

const laboratorySettingsLinks = [
  { key: "public_profile", href: "/laboratory/store/identity", icon: UserCircle, badge: null },
  { key: "settings", href: "/laboratory/settings", icon: Settings, badge: null },
];

const patientLinks = [
  { key: "dashboard", href: "/patient/dashboard", icon: LayoutDashboard, badge: null },
  { key: "copilot", href: "/copilot", icon: BrainCircuit, badge: { count: "IA" } },
  { key: "appointments", href: "/patient/dashboard/appointments", icon: CalendarDays, badge: null },
  { key: "treatments", href: "/patient/dashboard/treatments", icon: BriefcaseMedical, badge: null },
  // ─── Módulos especializados ───
  { key: "oncology", href: "/patient/oncology", icon: Activity, badge: null, condition: "oncology" },
  { key: "womens_health", href: "/patient/dashboard/womens-health", icon: Flower2, badge: null, condition: "womens_health" },
  { key: "diabetes", href: "/patient/diabetes", icon: Activity, badge: null, condition: "diabetes" },
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
        href !== "/foundation/dashboard" &&
        href !== "/supplier/dashboard" &&
        href !== "/laboratory/dashboard" &&
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
    if (["orders", "inventory", "products"].includes(key)) return "text-purple-500";
    if (["patients", "dependents", "public_profile", "profile", "team", "beneficiaries", "quotes", "onboarding", "branches"].includes(key))
      return "text-indigo-500";
    if (["calendar", "appointments", "campaigns", "phlebotomy"].includes(key)) return "text-orange-500";
    if (["womens_health", "oncology", "diabetes", "programs"].includes(key)) return "text-pink-500";
    if (["discover"].includes(key)) return "text-fuchsia-500";
    if (["emergencies"].includes(key)) return "text-rose-500";
    if (["nutrition", "social_bi", "compliance"].includes(key)) return "text-emerald-500";
    if (["subsidies", "rentals"].includes(key)) return "text-amber-500";
    if (["treatments", "results"].includes(key)) return "text-cyan-500";
    if (["cold_chain"].includes(key)) return "text-sky-500";
    if (["store"].includes(key)) return "text-emerald-600 dark:text-emerald-400";
    if (["referrals"].includes(key)) return "text-indigo-500";

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
          : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-[#141414] hover:text-gray-900 dark:hover:text-white font-semibold"
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

        {badge && !isCollapsed && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-[10px] font-mono font-bold shadow-2xs">
            {badge.count}
          </span>
        )}
      </div>
    </Link>
  );
};

// ── COMPONENTE PRINCIPAL SIDEBAR ─────────────────────────────────────────
export const Sidebar = ({
  className,
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

  const [isCollapsedState, setIsCollapsedState] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("quhealthy_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsedState(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const setIsCollapsed = (collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    try {
      localStorage.setItem("quhealthy_sidebar_collapsed", String(collapsed));
    } catch {
      // ignore
    }
  };

  const isCollapsed = isMobile ? false : isCollapsedState;

  const { logout } = useAuth();
  const { role, user } = useSessionStore();
  const { cart, openCart } = useBookingStore();
  const { activeModules, isModuleActive } = useModuleStore();
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [isSwitchingProfile, setIsSwitchingProfile] = useState(false);

  // Carga los módulos activos del paciente según sus diagnósticos CIE-10
  useActiveModules();

  const isLaboratory =
    pathname?.includes("/laboratory") ||
    (role as string) === "ROLE_LABORATORY" ||
    (role as string) === "LABORATORY";
  const isSupplier =
    !isLaboratory &&
    (pathname?.includes("/supplier") ||
      (role as string) === "ROLE_SUPPLIER" ||
      (role as string) === "SUPPLIER");
  const isFoundation =
    !isLaboratory &&
    (pathname?.includes("/foundation") ||
      (role as string) === "ROLE_FOUNDATION" ||
      (role as string) === "FOUNDATION");
  const isConsumer = !isLaboratory && !isFoundation && !isSupplier && role === "ROLE_CONSUMER";
  const isStaff = role === "ROLE_STAFF";
  const homeLink = isLaboratory
    ? "/laboratory/dashboard"
    : isSupplier
    ? "/supplier/dashboard"
    : isFoundation
    ? "/foundation/dashboard"
    : isConsumer
    ? "/patient/dashboard"
    : "/provider/dashboard";

  const currentLinks = useMemo(() => {
    if (isLaboratory) {
      return laboratoryLinks;
    }
    if (isSupplier) {
      return supplierLinks;
    }
    if (isFoundation) {
      return foundationLinks;
    }
    let links = isConsumer ? patientLinks : providerLinks;
    if (isConsumer) {
      links = links.filter((link) => {
        const condition = (link as { condition?: string }).condition;
        if (!condition) return true;
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
  }, [isLaboratory, isSupplier, isFoundation, isConsumer, isStaff, user?.permissions, activeModules, isModuleActive]);

  const currentSettingsLinks = isLaboratory
    ? laboratorySettingsLinks
    : isSupplier
    ? supplierSettingsLinks
    : isFoundation
    ? foundationSettingsLinks
    : isConsumer
    ? patientSettingsLinks
    : providerSettingsLinks;

  useEffect(() => {
    if (!isConsumer && !isFoundation && !isSupplier && !isLaboratory) {
      subscriptionService
        .getCurrentSubscription()
        .then(setSubscription)
        .catch(() => setSubscription(null));
    }
  }, [isConsumer, isFoundation, isSupplier, isLaboratory]);

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
          "h-16 flex items-center border-b border-gray-100 dark:border-gray-800/80 shrink-0 transition-all bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md",
          isCollapsed ? "justify-center px-2" : "justify-between px-4 sm:px-5"
        )}
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-500/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-base shadow-2xs transition-all hover:scale-105 group relative cursor-pointer"
            title={t("expand_sidebar")}
            aria-label={t("expand_sidebar")}
          >
            {/* Estado normal: Isotipo Q */}
            <span className="group-hover:hidden transition-all">Q</span>
            {/* Estado hover: Icono de expandir */}
            <PanelLeftOpen
              className="w-4 h-4 hidden group-hover:block transition-all text-emerald-700 dark:text-emerald-300"
              strokeWidth={2.5}
            />
          </button>
        ) : (
          <>
            <Link
              href={homeLink}
              className="flex items-center gap-2.5 min-w-0 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-sm shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                Q
              </div>
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm font-extrabold tracking-tight text-gray-900 dark:text-white">
                  QuHealthy<span className="text-emerald-600 dark:text-emerald-400">.</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-[#181818] border border-gray-200/60 dark:border-gray-800 text-[9px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  {isLaboratory
                    ? t("role_laboratory")
                    : isSupplier
                    ? t("role_supplier")
                    : isFoundation
                    ? t("role_foundation")
                    : isConsumer
                    ? t("role_patient")
                    : isStaff
                    ? t("role_staff")
                    : t("role_provider")}
                </span>
              </div>
            </Link>

            {isMobile ? (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl hover:bg-gray-100 dark:hover:bg-[#141414] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="w-8 h-8 rounded-xl hover:bg-gray-100 dark:hover:bg-[#141414] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center shrink-0 cursor-pointer"
                title={t("collapse_sidebar")}
                aria-label={t("collapse_sidebar")}
              >
                <PanelLeftClose className="w-4 h-4" strokeWidth={2} />
              </button>
            )}
          </>
        )}
      </div>

      {/* ── BANNER DE PLAN DE SUSCRIPCIÓN (PROVEEDORES) ───────────────── */}
      {!isCollapsed && !isConsumer && !isFoundation && !isSupplier && !isLaboratory && (
        <div className="p-3 border-b border-gray-100 dark:border-gray-800/80 bg-white dark:bg-[#0a0a0a]">
          <Link href="/provider/dashboard/settings#subscription">
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5 flex items-start gap-2.5 hover:border-emerald-500/40 transition-all shadow-2xs group cursor-pointer">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <Crown className="w-3.5 h-3.5" strokeWidth={2} />
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
      <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-1.5 space-y-5">
        {/* Módulo Principal */}
        <nav className="space-y-1">
          {!isCollapsed && (
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-1.5">
              {t("platform")}
            </h3>
          )}
          <div className="space-y-0.5">
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
        <nav className="border-t border-gray-100 dark:border-gray-800/80 pt-3 space-y-1">
          {!isCollapsed && (
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-1.5">
              {t("settings_section")}
            </h3>
          )}
          <div className="space-y-0.5">
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

      {/* ── PIE DE PÁGINA Y HUB DE UTILIDADES HOMOLOGADO ──────────────── */}
      {isCollapsed ? (
        <div className="p-2 border-t border-gray-100 dark:border-gray-800/80 bg-white dark:bg-[#0a0a0a] shrink-0 flex flex-col items-center gap-1.5">
          <NotificationBell isCollapsed={true} />

          <Button
            variant="ghost"
            size="icon"
            onClick={openCart}
            className="relative rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-[#141414] hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer h-9 w-9 p-0 flex items-center justify-center shrink-0"
            title={t("cart")}
            aria-label={t("cart")}
          >
            <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 items-center justify-center text-[8px] text-white font-mono font-black border border-white dark:border-[#0a0a0a]">
                  {cart.length > 9 ? "9+" : cart.length}
                </span>
              </span>
            )}
          </Button>

          <ThemeToggle />

          <LanguageToggle showText={false} />

          {!isFoundation && !isSupplier && !isLaboratory && (
            <button
              type="button"
              onClick={handleSwitchProfile}
              disabled={isSwitchingProfile}
              className="w-9 h-9 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-[#141414] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
              title={isConsumer ? t("switch_to_provider") : t("switch_to_patient")}
            >
              <UserCircle
                className={cn(
                  "w-4 h-4 text-emerald-600 dark:text-emerald-400",
                  isSwitchingProfile && "animate-spin"
                )}
                strokeWidth={2}
              />
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-9 h-9 rounded-2xl hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 text-gray-400 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title={t("logout")}
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <div className="p-3 border-t border-gray-100 dark:border-gray-800/80 bg-white dark:bg-[#0a0a0a] shrink-0 space-y-3">
          {/* ── BARRA DE HERRAMIENTAS HOMOLOGADA (4 BOTONES GHOST) ────── */}
          <div className="flex items-center justify-around gap-1 p-1 rounded-2xl bg-gray-100/50 dark:bg-[#121212]">
            <NotificationBell isCollapsed={false} className="flex-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={openCart}
              className="relative flex-1 h-9 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1f1f1f] hover:text-gray-900 dark:hover:text-white transition-all p-0 cursor-pointer flex items-center justify-center"
              title={t("cart")}
              aria-label={t("cart")}
            >
              <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 items-center justify-center text-[8px] text-white font-mono font-black border border-white dark:border-[#0a0a0a]">
                    {cart.length > 9 ? "9+" : cart.length}
                  </span>
                </span>
              )}
            </Button>

            <ThemeToggle className="flex-1 hover:bg-white dark:hover:bg-[#1f1f1f]" />

            <LanguageToggle showText={false} className="flex-1 hover:bg-white dark:hover:bg-[#1f1f1f]" />
          </div>

          {/* ── ACCIONES DE PERFIL, SOPORTE Y SALIDA ───────────────────── */}
          <div className="space-y-0.5">
            {!isFoundation && !isSupplier && !isLaboratory && (
              <button
                type="button"
                onClick={handleSwitchProfile}
                disabled={isSwitchingProfile}
                className="w-full flex items-center gap-2.5 p-2 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-[#141414] transition-all group disabled:opacity-50 cursor-pointer text-left"
              >
                <UserCircle
                  className={cn(
                    "w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400",
                    isSwitchingProfile && "animate-spin"
                  )}
                  strokeWidth={2}
                />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors truncate">
                  {isSwitchingProfile
                    ? t("switching")
                    : isConsumer
                    ? t("switch_to_provider")
                    : t("switch_to_patient")}
                </span>
              </button>
            )}

            <Link href="/patient/dashboard/support">
              <button
                type="button"
                className="flex items-center gap-2.5 w-full p-2 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-[#141414] transition-all group cursor-pointer text-left"
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

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full p-2 rounded-2xl transition-all group hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer text-left"
            >
              <LogOut
                className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors"
                strokeWidth={2}
              />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                {t("logout")}
              </span>
            </button>
          </div>
        </div>
      )}
    </motion.aside>
  );
};