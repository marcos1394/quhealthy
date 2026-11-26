"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { clearAuthCookies } from "@/app/actions/auth-cookies";
import { useSessionStore } from "@/stores/SessionStore";
import {
  adminService,
  UnitEconomicsDTO,
  AdminDashboardDTO,
  TransactionReportDTO,
  ProductMetricsDTO,
  ProviderAdminDTO,
  AuditLogDTO,
  MicroserviceHealthDTO,
} from "@/services/admin.service";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSidebar, AdminTab } from "./components/AdminSidebar";

const TabSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 w-56 rounded-xl bg-slate-200/70" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-32 rounded-2xl bg-slate-200/60" />
      <div className="h-32 rounded-2xl bg-slate-200/60" />
      <div className="h-32 rounded-2xl bg-slate-200/60" />
    </div>
    <div className="h-72 rounded-2xl bg-slate-200/50" />
  </div>
);

// Code-splitting por pestaña (evita cargar Recharts y las 9 vistas del panel en el bundle inicial)
const TabExecutivePulse = dynamic(() => import("./tabs/TabExecutivePulse").then((m) => m.TabExecutivePulse), { loading: TabSkeleton });
const TabAdminCrm = dynamic(() => import("./tabs/TabAdminCrm").then((m) => m.TabAdminCrm), { loading: TabSkeleton });
const TabAdminSocialConnections = dynamic(() => import("./tabs/TabAdminSocialConnections").then((m) => m.TabAdminSocialConnections), { loading: TabSkeleton });
const TabFinances = dynamic(() => import("./tabs/TabFinances").then((m) => m.TabFinances), { loading: TabSkeleton });
const TabUnitEconomics = dynamic(() => import("./tabs/TabUnitEconomics").then((m) => m.TabUnitEconomics), { loading: TabSkeleton });
const TabProductAnalytics = dynamic(() => import("./tabs/TabProductAnalytics").then((m) => m.TabProductAnalytics), { loading: TabSkeleton });
const TabMedicalOperations = dynamic(() => import("./tabs/TabMedicalOperations").then((m) => m.TabMedicalOperations), { loading: TabSkeleton });
const TabFoundations = dynamic(() => import("./tabs/TabFoundations").then((m) => m.TabFoundations), { loading: TabSkeleton });
const TabSystemHealth = dynamic(() => import("./tabs/TabSystemHealth").then((m) => m.TabSystemHealth), { loading: TabSkeleton });
const OperatingCockpitPilot = dynamic(() => import("./components/OperatingCockpitPilot").then((m) => m.OperatingCockpitPilot), { loading: TabSkeleton });

const VALID_TABS: AdminTab[] = [
  "pulse",
  "crm",
  "channels",
  "finances",
  "economics",
  "analytics",
  "operations",
  "foundations",
  "health",
];

const VALID_PERIODS = ["24h", "7d", "30d", "month", "90d"] as const;
type AdminPeriod = typeof VALID_PERIODS[number];

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inicialización sincronizada con URL query string (ADMIN-UX-01)
  const tabParam = searchParams.get("tab") as AdminTab | null;
  const initialTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "pulse";

  const periodParam = searchParams.get("period") as AdminPeriod | null;
  const initialPeriod = periodParam && VALID_PERIODS.includes(periodParam) ? periodParam : "30d";

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTabState] = useState<AdminTab>(initialTab);
  const [selectedPeriod, setSelectedPeriodState] = useState<AdminPeriod>(initialPeriod);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const getPeriodDays = (period: AdminPeriod): number => {
    switch (period) {
      case "24h":
        return 1;
      case "7d":
        return 7;
      case "90d":
        return 90;
      case "30d":
      case "month":
      default:
        return 30;
    }
  };

  // State data
  const [economics, setEconomics] = useState<UnitEconomicsDTO | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardDTO | null>(null);
  const [transactions, setTransactions] = useState<TransactionReportDTO[]>([]);
  const [productMetrics, setProductMetrics] = useState<ProductMetricsDTO | null>(null);
  const [providers, setProviders] = useState<ProviderAdminDTO[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogDTO[]>([]);
  const [services, setServices] = useState<MicroserviceHealthDTO[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const loadAllData = useCallback(async (periodToLoad?: AdminPeriod) => {
    const period = periodToLoad || selectedPeriod;
    try {
      setIsRefreshing(true);
      const days = getPeriodDays(period);
      const results = await Promise.allSettled([
        adminService.getUnitEconomics(period),
        adminService.getDashboardMetrics(),
        adminService.getProductMetrics(days),
        adminService.getProviders(),
        adminService.getAuditLogs(0, 20),
        adminService.getSystemHealthList(),
      ]);

      if (results[0].status === "fulfilled") setEconomics(results[0].value);
      else console.error("Error cargando Unit Economics", results[0].reason);

      if (results[1].status === "fulfilled") setDashboard(results[1].value);
      else console.error("Error cargando Dashboard Metrics", results[1].reason);

      if (results[2].status === "fulfilled") setProductMetrics(results[2].value);
      else {
        console.error("Error cargando Product Metrics", results[2].reason);
        setProductMetrics(null);
      }

      if (results[3].status === "fulfilled") setProviders(results[3].value.content);
      else console.error("Error cargando Providers", results[3].reason);

      if (results[4].status === "fulfilled") setAuditLogs(results[4].value.content);
      else console.error("Error cargando Audit Logs", results[4].reason);

      if (results[5].status === "fulfilled") setServices(results[5].value);
      else console.error("Error cargando Health List", results[5].reason);
    } catch (err) {
      console.error("Error cargando métricas maestras", err);
      toast.error("Error al sincronizar datos del panel administrativo.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedPeriod]);

  // Sincronización bidireccional con URL
  const handleTabChange = useCallback(
    (newTab: AdminTab) => {
      setActiveTabState(newTab);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("tab", newTab);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [pathname, router]
  );

  const handlePeriodChange = useCallback(
    (newPeriod: AdminPeriod) => {
      setSelectedPeriodState(newPeriod);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("period", newPeriod);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
      loadAllData(newPeriod);
    },
    [pathname, router, loadAllData]
  );

  // Reacciona a cambios en historial del navegador
  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam) && tabParam !== activeTab) {
      setActiveTabState(tabParam);
    }
  }, [tabParam, activeTab]);

  useEffect(() => {
    if (periodParam && VALID_PERIODS.includes(periodParam) && periodParam !== selectedPeriod) {
      setSelectedPeriodState(periodParam);
      loadAllData(periodParam);
    }
  }, [periodParam, selectedPeriod, loadAllData]);

  useEffect(() => {
    let isMounted = true;

    const verifyAdminSession = async () => {
      try {
        await useSessionStore.getState().initializeSession();
        if (!isMounted) return;

        const { isAuthenticated, role } = useSessionStore.getState();
        const normalizedRole = String(role || "").toUpperCase();
        if (!isAuthenticated || (normalizedRole !== "ROLE_ADMIN" && normalizedRole !== "ADMIN")) {
          toast.error("Acceso denegado. No cuentas con permisos de administrador.");
          router.push("/admin/login");
          return;
        }

        loadAllData();
      } catch {
        if (!isMounted) return;
        toast.error("Sesión inválida.");
        router.push("/admin/login");
      }
    };

    verifyAdminSession();

    return () => {
      isMounted = false;
    };
  }, [router, loadAllData]);

  // Carga diferida de transacciones de Stripe cuando se entra a Finanzas
  useEffect(() => {
    if (activeTab === "finances" && transactions.length === 0) {
      setIsLoadingTransactions(true);
      adminService
        .getTransactionsReport(30)
        .then((data) => setTransactions(data))
        .catch((err) => {
          console.error("Error al obtener transacciones de Stripe", err);
          toast.error("No se pudo cargar el reporte de transacciones");
        })
        .finally(() => setIsLoadingTransactions(false));
    }
  }, [activeTab, transactions.length]);

  const handleLogout = async () => {
    await clearAuthCookies();
    router.push("/admin/login");
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(val);

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("es-MX", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-medical-500/20 border border-medical-500/30 flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 rounded-full bg-medical-500 animate-ping"></div>
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Iniciando QuHealthy Command Center...
        </p>
      </div>
    );
  }

  const pendingKycCount = providers.filter(
    (p) => !p.onboardingComplete || p.status === "INACTIVE"
  ).length;

  const unhealthyServicesCount = services.filter((s) => s.status !== "UP").length;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans flex flex-col selection:bg-medical-500/30">
      {/* 🚀 Header */}
      <AdminHeader
        selectedPeriod={selectedPeriod}
        onSelectPeriod={handlePeriodChange}
        onRefresh={loadAllData}
        isRefreshing={isRefreshing}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)}
        isMobileOpen={mobileSidebarOpen}
      />

      {/* 🧭 Master Body with Sidebar + Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          pendingKycCount={pendingKycCount}
          unhealthyServicesCount={unhealthyServicesCount}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full space-y-5">
          <div
            role="tabpanel"
            id={`admin-panel-${activeTab}`}
            aria-labelledby={`admin-tab-${activeTab}`}
            tabIndex={0}
            className="focus-visible:outline-none"
          >
            {activeTab === "pulse" && (
              <TabExecutivePulse
                economics={economics}
                dashboard={dashboard}
                productMetrics={productMetrics}
                providers={providers}
                services={services}
                selectedPeriod={selectedPeriod}
                formatCurrency={formatCurrency}
                onNavigateTab={handleTabChange}
              />
            )}

            {activeTab === "crm" && (
              <TabAdminCrm />
            )}

            {activeTab === "channels" && (
              <TabAdminSocialConnections />
            )}

            {activeTab === "finances" && (
              <TabFinances
                economics={economics}
                transactions={transactions}
                isLoadingTransactions={isLoadingTransactions}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            )}

            {activeTab === "economics" && (
              <TabUnitEconomics
                economics={economics}
                selectedPeriod={selectedPeriod}
                formatCurrency={formatCurrency}
              />
            )}

            {activeTab === "analytics" && (
              <TabProductAnalytics productMetrics={productMetrics} />
            )}

            {activeTab === "operations" && (
              <TabMedicalOperations
                dashboard={dashboard}
                providers={providers}
                onRefreshProviders={loadAllData}
              />
            )}

            {activeTab === "foundations" && (
              <TabFoundations />
            )}

            {activeTab === "health" && (
              <TabSystemHealth
                services={services}
                auditLogs={auditLogs}
                formatDate={formatDate}
                onRefreshHealth={loadAllData}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
