"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  Settings,
  Store,
  Shield,
  LogOut,
  Activity,
  FileText,
  Star,
  Megaphone,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Bell,
  HelpCircle,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Navigation Structure
const mainNavigation = [
  {
    label: "Overview",
    href: "/provider/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: "Agenda",
    href: "/provider/dashboard/calendar",
    icon: CalendarDays,
    badge: null,
  },
  {
    label: "Citas",
    href: "/provider/dashboard/appointments",
    icon: Stethoscope,
    badge: "3",
  },
  {
    label: "Pacientes",
    href: "/provider/dashboard/patients",
    icon: Users,
    badge: null,
  },
  {
    label: "Historial",
    href: "/provider/dashboard/history",
    icon: FileText,
    badge: null,
  },
];

const businessNavigation = [
  {
    label: "Mi Tienda",
    href: "/onboarding/marketplace",
    icon: Store,
    badge: null,
  },
  {
    label: "Marketing",
    href: "/provider/dashboard/marketing",
    icon: Megaphone,
    badge: "Pro",
  },
  {
    label: "Reseñas",
    href: "/provider/dashboard/reviews",
    icon: Star,
    badge: null,
  },
];

const settingsNavigation = [
  {
    label: "Facturación",
    href: "/provider/settings/billing",
    icon: CreditCard,
  },
  {
    label: "Seguridad",
    href: "/provider/settings/security",
    icon: Shield,
  },
  {
    label: "Preferencias",
    href: "/provider/settings/preferences",
    icon: Settings,
  },
  {
    label: "Actividad",
    href: "/provider/settings/security/activity",
    icon: Activity,
  },
];

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: string | null;
  isCollapsed?: boolean;
}

const NavItem = ({ href, icon: Icon, label, badge, isCollapsed }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/provider/dashboard" && pathname?.startsWith(href));

  const content = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium relative",
        isActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      )}
    >
      <Icon className={cn(
        "w-[18px] h-[18px] flex-shrink-0",
        isActive ? "text-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-primary"
      )} />
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && (
            <Badge
              variant={badge === "Pro" ? "default" : "secondary"}
              className={cn(
                "text-[10px] px-1.5 py-0 h-5",
                badge === "Pro" 
                  ? "bg-gradient-to-r from-chart-4 to-chart-5 text-primary-foreground border-0" 
                  : "bg-sidebar-accent text-sidebar-foreground"
              )}
            >
              {badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {label}
          {badge && <Badge variant="secondary" className="text-[10px]">{badge}</Badge>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

interface NavSectionProps {
  title: string;
  items: Array<{
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string | null;
  }>;
  isCollapsed?: boolean;
  defaultOpen?: boolean;
}

const NavSection = ({ title, items, isCollapsed, defaultOpen = true }: NavSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
        ))}
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider hover:text-sidebar-foreground/60 transition-colors">
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 mt-1">
        {items.map((item) => (
          <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const Sidebar = ({ className }: { className?: string }) => {
  const [isCollapsed] = useState(false);

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-64",
        className
      )}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <Link href="/provider/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg glow-primary">
              <span className="font-bold text-primary-foreground text-lg">Q</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-sidebar-foreground">
                  QuHealthy
                </span>
                <span className="text-[10px] text-sidebar-foreground/50 -mt-0.5">
                  Enterprise
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          <NavSection
            title="Principal"
            items={mainNavigation}
            isCollapsed={isCollapsed}
          />
          
          <NavSection
            title="Negocio"
            items={businessNavigation}
            isCollapsed={isCollapsed}
          />
          
          <NavSection
            title="Configuración"
            items={settingsNavigation}
            isCollapsed={isCollapsed}
            defaultOpen={false}
          />
        </div>

        {/* Upgrade Banner */}
        {!isCollapsed && (
          <div className="mx-3 mb-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-chart-2/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-sidebar-foreground">Plan Pro</span>
            </div>
            <p className="text-xs text-sidebar-foreground/60 mb-3">
              Desbloquea todas las funciones de IA y marketing.
            </p>
            <Link
              href="/provider/settings/billing"
              className="block w-full text-center text-xs font-medium py-2 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Actualizar Plan
            </Link>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link
            href="/help"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all text-sm"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
            {!isCollapsed && <span>Centro de Ayuda</span>}
          </Link>
          
          <Link
            href="/notifications"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all text-sm relative"
          >
            <Bell className="w-[18px] h-[18px]" />
            {!isCollapsed && <span>Notificaciones</span>}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer",
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-9 w-9 border-2 border-primary/30">
              <AvatarImage src="/avatars/doctor-01.jpg" alt="Dr. Usuario" />
              <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                DR
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  Dr. Marcos Sandoval
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate">
                  Dentista General
                </p>
              </div>
            )}
            {!isCollapsed && (
              <button className="p-1.5 rounded-md text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
