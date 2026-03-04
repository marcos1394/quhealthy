/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CalendarDays, Users, CreditCard, Settings, LogOut, ChevronRight, HelpCircle, Crown, ChevronLeft, BriefcaseMedical, UserCircle, Sparkles, Vault, MessageCircle, Star, HeartIcon, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { useSessionStore } from "@/stores/SessionStore";
import { Label } from "recharts";

const providerLinks = [
  { label: "Overview", href: "/provider/dashboard", icon: LayoutDashboard, badge: null },
  { label: "Calendar", href: "/provider/dashboard/calendar", icon: CalendarDays, badge: { count: 3, color: "blue" } },
  { label: "Patients", href: "/provider/dashboard/patients", icon: Users, badge: null },
  { label: "Services", href: "/provider/store", icon: BriefcaseMedical, badge: null },
  { label: "Billing", href: "/provider/dashboard/billing", icon: CreditCard, badge: null },
];

const providerSettingsLinks = [
  { label: "Public Profile", href: "/provider/profile", icon: UserCircle, badge: null },
  { label: "Settings", href: "/provider/settings", icon: Settings, badge: null },
];

const patientLinks = [
  { label: "Overview", href: "/patient/dashboard", icon: LayoutDashboard, badge: null },
  { label: "Appointments", href: "/patient/dashboard/appointments", icon: CalendarDays, badge: null },
  { label: "Discover", href: "/patient/discover", icon: Sparkles, badge: null },
  { label: "Vault", href: "/patient/dashboard/vault", icon: Vault, badge: null },
  { label: "Messages", href: "/patient/dashboard/messages", icon: MessageCircle, badge: null },
  { label: "Packages", href: "/patient/dashboard/packages", icon: Crown, badge: null },
  { label: "Reviews", href: "/patient/dashboard/reviews", icon: Star, badge: null },
  { label: "Favorites", href: "/patient/dashboard/favorites", icon: HeartIcon, badge: null },
  { label: "Dependents", href: "/patient/dashboard/family", icon: Users, badge: null },

];

const patientSettingsLinks = [
  { label: "Profile", href: "/patient/profile", icon: UserCircle, badge: null },
  { label: "Settings", href: "/patient/settings", icon: Settings, badge: null },
];

const NavItem = ({ href, icon: Icon, label, badge, isCollapsed, pathname }: {
  href: string; icon: any; label: string; badge?: { count: number; color: string } | null; isCollapsed: boolean; pathname: string | null;
}) => {
  const isActive = pathname === href || (href !== "/provider/dashboard" && pathname?.startsWith(href));

  return (
    <Link href={href} title={isCollapsed ? label : ""}
      className={cn(
        "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden",
        isCollapsed ? "justify-center" : "",
        isActive
          ? "bg-medical-600 dark:bg-medical-500 text-white shadow-sm"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
      )}>
      <div className={cn("relative z-10 flex items-center", isCollapsed ? "justify-center w-full" : "gap-3 flex-1")}>
        <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white")} />
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
              className={cn("text-sm font-medium whitespace-nowrap", isActive ? "text-white" : "")}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {badge && !isCollapsed && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
            <Badge variant="outline" className={cn("text-xs px-2 min-w-[20px] h-5 border-none font-semibold",
              badge.color === "blue" ? "bg-blue-500 text-white" : "", badge.color === "emerald" ? "bg-emerald-500 text-white" : "")}>
              {badge.count}
            </Badge>
          </motion.div>
        )}
        {badge && isCollapsed && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5">
            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold text-white",
              badge.color === "blue" ? "bg-blue-500" : "", badge.color === "emerald" ? "bg-emerald-500" : "")}>
              {badge.count}
            </div>
          </motion.div>
        )}
      </div>
      {isActive && (
        <motion.div layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-white rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      )}
    </Link>
  );
};

export const Sidebar = ({ className = "" }: { className?: string }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const { role } = useSessionStore();

  const isConsumer = role === 'CONSUMER';
  const homeLink = isConsumer ? "/patient/dashboard" : "/provider/dashboard";
  const currentLinks = isConsumer ? patientLinks : providerLinks;
  const currentSettingsLinks = isConsumer ? patientSettingsLinks : providerSettingsLinks;

  const handleLogout = () => { toast.info("Session closed successfully", { autoClose: 2000 }); logout(); };

  return (
    <motion.aside animate={{ width: isCollapsed ? 80 : 280 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "flex flex-col h-screen border-r transition-colors duration-300 z-50 overflow-hidden flex-shrink-0",
        "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800",
        className
      )}>
      {/* Header */}
      <div className={cn("h-20 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl transition-colors", isCollapsed ? "justify-center" : "justify-between")}>
        <AnimatePresence>
          {!isCollapsed && (
            <Link href={homeLink} className="flex-1 overflow-hidden">
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight whitespace-nowrap inline-block">
                QuHealthy
              </motion.span>
            </Link>
          )}
        </AnimatePresence>

        <Button variant="outline" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl h-10 w-10 flex-shrink-0 shadow-sm transition-all ml-auto">
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Plan Banner (Only for Provider) */}
      <AnimatePresence>
        {!isCollapsed && !isConsumer && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mx-4 mt-4 p-3 bg-medical-50 dark:bg-medical-500/5 border border-medical-200 dark:border-medical-500/20 rounded-xl overflow-hidden relative group cursor-pointer hover:border-medical-500/50 transition-all">
            <div className="absolute top-1 right-1"><Sparkles className="w-3 h-3 text-medical-400 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-medical-100 dark:bg-medical-500/10 rounded-lg">
                <Crown className="w-4 h-4 text-medical-600 dark:text-medical-400 flex-shrink-0" />
              </div>
              <div>
                <p className="text-xs font-semibold text-medical-600 dark:text-medical-400 whitespace-nowrap">Basic Plan</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light">Upgrade your plan</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-6 custom-scrollbar">
        <nav>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1.5">
                Platform
              </motion.h3>
            )}
          </AnimatePresence>
          <div className="space-y-1">
            {currentLinks.map((link, index) => (
              <motion.div key={link.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                <NavItem {...link} isCollapsed={isCollapsed} pathname={pathname} />
              </motion.div>
            ))}
          </div>
        </nav>

        <Separator className="bg-slate-200 dark:bg-slate-800" />

        <nav>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1.5">
                Settings
              </motion.h3>
            )}
          </AnimatePresence>
          <div className="space-y-1">
            {currentSettingsLinks.map((link, index) => (
              <motion.div key={link.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                <NavItem {...link} isCollapsed={isCollapsed} pathname={pathname} />
              </motion.div>
            ))}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5 flex-shrink-0 bg-white dark:bg-slate-950 transition-colors">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="overflow-hidden">
              <Button variant="ghost" className="w-full justify-start gap-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl h-10 transition-all group">
                <HelpCircle className="w-4 h-4 flex-shrink-0" /><span className="text-sm font-medium whitespace-nowrap">Support</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all group overflow-hidden",
            "text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10",
            isCollapsed ? "justify-center" : ""
          )} title={isCollapsed ? "Log Out" : ""}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium whitespace-nowrap">Log Out</motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
};