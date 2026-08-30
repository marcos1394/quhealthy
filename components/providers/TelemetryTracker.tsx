"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@/stores/SessionStore";
import { telemetry } from "@/lib/telemetry";

const getModuleCodeFromPath = (path: string): string => {
  if (!path) return "DASHBOARD";
  
  const p = path.toLowerCase();
  
  if (p.includes("/provider/dashboard/appointments") || p.includes("/provider/dashboard/calendar") || p.includes("/patient/dashboard/appointments")) {
    return "AGENDA";
  }
  if (p.includes("/provider/consultation") || p.includes("/patient/video-call") || p.includes("/patient/booking")) {
    return "CONSULTATION";
  }
  if (p.includes("/provider/dashboard/patients") || p.includes("/patient/dashboard/vault") || p.includes("/patient/dashboard/treatments") || p.includes("/patient/dashboard/family")) {
    return "EHR";
  }
  if (p.includes("/provider/dashboard/billing") || p.includes("/provider/dashboard/cash-register") || p.includes("/provider/dashboard/finance") || p.includes("/provider/dashboard/accounting")) {
    return "BILLING";
  }
  if (p.includes("/copilot")) {
    return "COPILOT";
  }
  if (p.includes("/provider/dashboard/inventory") || p.includes("/supplier/inventory") || p.includes("/supplier/cold-chain")) {
    return "INVENTORY";
  }
  if (p.includes("/provider/store") || p.includes("/store") || p.includes("/market") || p.includes("/checkout")) {
    return "STORE";
  }
  if (p.includes("/provider/dashboard/marketing") || p.includes("/admin/dashboard")) {
    return "MARKETING";
  }
  if (p.includes("/prescription") || p.includes("/provider/settings/prescription")) {
    return "PRESCRIPTION";
  }
  if (p.includes("/provider/dashboard") || p.includes("/patient/dashboard") || p.includes("/foundation/dashboard") || p.includes("/supplier/dashboard")) {
    return "DASHBOARD";
  }

  return "GENERAL";
};

export const TelemetryTracker = () => {
  const pathname = usePathname();
  const user = useSessionStore((state) => state.user);
  const role = useSessionStore((state) => state.role);

  // 1. Inicializar sesión de telemetría con ID y Rol del usuario
  useEffect(() => {
    const userId = user?.id ? Number(user.id) : undefined;
    telemetry.init(userId, role || undefined);
  }, [user, role]);

  // 2. Registrar cambio de módulo/ruta en vivo
  useEffect(() => {
    if (!pathname) return;
    const moduleCode = getModuleCodeFromPath(pathname);
    telemetry.setModule(moduleCode);
  }, [pathname]);

  return null;
};
