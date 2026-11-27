"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import {
  Share2,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Stethoscope,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Globe,
  Database,
} from "lucide-react";
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
  GrowthOverviewDTO,
} from "@/services/admin.service";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSidebar, AdminTab } from "./components/AdminSidebar";
import type { SocialOverviewSnapshot } from "./tabs/TabCommandCenter";
import type { GrowthSubTab } from "./tabs/TabGrowthSeo";

const TabSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 w-56 rounded-xl bg-slate-200/70" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="h-28 rounded-2xl bg-slate-200/60" />
      <div className="h-28 rounded-2xl bg-slate-200/60" />
      <div className="h-28 rounded-2xl bg-slate-200/60" />
      <div className="h-28 rounded-2xl bg-slate-200/60" />
    </div>
    <div className="h-72 rounded-2xl bg-slate-200/50" />
  </div>
);

// Code-splitting por pilar ejecutivo
const TabCommandCenter = dynamic(
  () => import("./tabs/TabCommandCenter").then((m) => m.TabCommandCenter),
  { loading: TabSkeleton }
);
const TabGrowthSeo = dynamic(
  () => import("./tabs/TabGrowthSeo").then((m) => m.TabGrowthSeo),
  { loading: TabSkeleton }
);
const TabAdminCrm = dynamic(
  () => import("./tabs/TabAdminCrm").then((m) => m.TabAdminCrm),
  { loading: TabSkeleton }
);
const TabAdminSocialConnections = dynamic(
  () =>
    import("./tabs/TabAdminSocialConnections").then(
      (m) => m.TabAdminSocialConnections
    ),
  { loading: TabSkeleton }
);
const TabFinances = dynamic(
  () => import("./tabs/TabFinances").then((m) => m.TabFinances),
  { loading: TabSkeleton }
);
const TabUnitEconomics = dynamic(
  () => import("./tabs/TabUnitEconomics").then((m) => m.TabUnitEconomics),
  { loading: TabSkeleton }
);
const TabMedicalOperations = dynamic(
  () =>
    import("./tabs/TabMedicalOperations").then((m) => m.TabMedicalOperations),
  { loading: TabSkeleton }
);
const TabFoundations = dynamic(
  () => import("./tabs/TabFoundations").then((m) => m.TabFoundations),
  { loading: TabSkeleton }
);
const TabSystemHealth = dynamic(
  () => import("./tabs/TabSystemHealth").then((m) => m.TabSystemHealth),
  { loading: TabSkeleton }
);

const VALID_TABS: AdminTab[] = ["pulse", "growth", "social", "business", "health"];
const VALID_PERIODS = ["24h", "7d", "30d", "month", "90d"] as const;
type AdminPeriod = (typeof VALID_PERIODS)[number];

type SocialSubTab = "channels" | "crm";
type BusinessSubTab = "finances" | "economics" | "operations" | "foundations";

function resolveTabFromQuery(rawTab: string | null): {
  tab: AdminTab;
  growthSub?: GrowthSubTab;
  socialSub?: SocialSubTab;
  businessSub?: BusinessSubTab;
} {
  if (!rawTab) return { tab: "pulse" };
  if (VALID_TABS.includes(rawTab as AdminTab)) {
    return { tab: rawTab as AdminTab };
  }
  // Compatibilidad con URLs y enlaces legados de los 9 tabs anteriores
  switch (rawTab) {
    case "analytics":
      return { tab: "growth", growthSub: "product" };
    case "channels":
      return { tab: "social", socialSub: "channels" };
    case "crm":
      return { tab: "social", socialSub: "crm" };
    case "finances":
      return { tab: "business", businessSub: "finances" };
    case "economics":
      return { tab: "business", businessSub: "economics" };
    case "operations":
      return { tab: "business", businessSub: "operations" };
    case "foundations":
      return { tab: "business", businessSub: "foundations" };
    default:
      return { tab: "pulse" };
  }
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const resolvedInitial = resolveTabFromQuery(searchParams.get("tab"));
  const periodParam = searchParams.get("period") as AdminPeriod | null;
  const initialPeriod =
    periodParam && VALID_PERIODS.includes(periodParam) ? periodParam : "30d";

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingGrowth, setIsLoadingGrowth] = useState(false);

  const [activeTab, setActiveTabState] = useState<AdminTab>(resolvedInitial.tab);
  const [growthSubTab, setGrowthSubTab] = useState<GrowthSubTab>(
    resolvedInitial.growthSub || "seo"
  );
  const [socialSubTab, setSocialSubTab] = useState<SocialSubTab>(
    resolvedInitial.socialSub || "channels"
  );
  const [businessSubTab, setBusinessSubTab] = useState<BusinessSubTab>(
    resolvedInitial.businessSub || "finances"
  );

  const [selectedPeriod, setSelectedPeriodState] =
    useState<AdminPeriod>(initialPeriod);
  const [growthDays, setGrowthDays] = useState<number>(30);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // State data
  const [economics, setEconomics] = useState<UnitEconomicsDTO | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardDTO | null>(null);
  const [transactions, setTransactions] = useState<TransactionReportDTO[]>([]);
  const [productMetrics, setProductMetrics] =
    useState<ProductMetricsDTO | null>(null);
  const [providers, setProviders] = useState<ProviderAdminDTO[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogDTO[]>([]);
  const [services, setServices] = useState<MicroserviceHealthDTO[]>([]);
  const [growthOverview, setGrowthOverview] =
    useState<GrowthOverviewDTO | null>(null);
  const [socialSnapshot, setSocialSnapshot] =
    useState<SocialOverviewSnapshot | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

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

  const fetchGrowthOverview = useCallback(
    async (days: number, forceRefresh = false) => {
      try {
        setIsLoadingGrowth(true);
        const data = await adminService.getGrowthOverview(days, forceRefresh);
        setGrowthOverview(data);
        if (forceRefresh) {
          toast.success("Métricas de Search Console y GA4 actualizadas en vivo.");
        }
      } catch (err) {
        console.error("Error cargando Growth Overview (GSC/GA4)", err);
        if (forceRefresh) {
          toast.error("No se pudo sincronizar Search Console / GA4.");
        }
      } finally {
        setIsLoadingGrowth(false);
      }
    },
    []
  );

  const loadAllData = useCallback(
    async (periodToLoad?: AdminPeriod) => {
      const period = periodToLoad || selectedPeriod;
      try {
        setIsRefreshing(true);
        const days = getPeriodDays(period);
        const growthRangeDays = days <= 7 ? 7 : days >= 90 ? 90 : 30;
        const socialPeriod = period === "24h" ? "7d" : period === "month" ? "30d" : period;

        const results = await Promise.allSettled([
          adminService.getUnitEconomics(period),
          adminService.getDashboardMetrics(),
          adminService.getProductMetrics(days),
          adminService.getProviders(),
          adminService.getAuditLogs(0, 20),
          adminService.getSystemHealthList(),
          adminService.getGrowthOverview(growthRangeDays, false),
          adminService.getAdminSocialAnalyticsDashboard(socialPeriod),
        ]);

        if (results[0].status === "fulfilled") setEconomics(results[0].value);
        else console.error("Error cargando Unit Economics", results[0].reason);

        if (results[1].status === "fulfilled") setDashboard(results[1].value);
        else console.error("Error cargando Dashboard Metrics", results[1].reason);

        if (results[2].status === "fulfilled")
          setProductMetrics(results[2].value);
        else setProductMetrics(null);

        if (results[3].status === "fulfilled")
          setProviders(results[3].value.content);
        else console.error("Error cargando Providers", results[3].reason);

        if (results[4].status === "fulfilled")
          setAuditLogs(results[4].value.content);
        else console.error("Error cargando Audit Logs", results[4].reason);

        if (results[5].status === "fulfilled") setServices(results[5].value);
        else console.error("Error cargando Health List", results[5].reason);

        if (results[6].status === "fulfilled") {
          setGrowthOverview(results[6].value);
          setGrowthDays(results[6].value.periodDays || growthRangeDays);
        }

        if (results[7].status === "fulfilled" && results[7].value) {
          const socialData = results[7].value;
          const platformsMap = socialData.byPlatform || {};
          const entries = Object.values(platformsMap) as Array<{
            platform?: string;
            isConnected?: boolean;
            followersCount?: number;
            totalEngagement?: number;
          }>;
          const activeEntries = entries.filter((e) => e.isConnected);
          setSocialSnapshot({
            totalFollowers: entries.reduce(
              (acc, e) => acc + (e.followersCount || 0),
              0
            ),
            totalEngagement:
              socialData.totalEngagement ??
              entries.reduce((acc, e) => acc + (e.totalEngagement || 0), 0),
            connectedChannels: activeEntries.length,
            activePlatforms: activeEntries
              .map((e) => e.platform || "")
              .filter(Boolean),
          });
        }
      } catch (err) {
        console.error("Error cargando métricas maestras", err);
        toast.error("Error al sincronizar datos del panel administrativo.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedPeriod]
  );

  const handleNavigateTab = useCallback(
    (newTab: AdminTab, subTab?: string) => {
      setActiveTabState(newTab);
      if (newTab === "growth" && subTab && (subTab === "seo" || subTab === "ga4" || subTab === "product")) {
        setGrowthSubTab(subTab);
      }
      if (newTab === "social" && subTab && (subTab === "channels" || subTab === "crm")) {
        setSocialSubTab(subTab);
      }
      if (
        newTab === "business" &&
        subTab &&
        (subTab === "finances" ||
          subTab === "economics" ||
          subTab === "operations" ||
          subTab === "foundations")
      ) {
        setBusinessSubTab(subTab);
      }

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

  const handleChangeGrowthDays = useCallback(
    (days: number) => {
      setGrowthDays(days);
      fetchGrowthOverview(days, false);
    },
    [fetchGrowthOverview]
  );

  useEffect(() => {
    let isMounted = true;

    const verifyAdminSession = async () => {
      try {
        await useSessionStore.getState().initializeSession();
        if (!isMounted) return;

        const { isAuthenticated, role } = useSessionStore.getState();
        const normalizedRole = String(role || "").toUpperCase();
        if (
          !isAuthenticated ||
          (normalizedRole !== "ROLE_ADMIN" && normalizedRole !== "ADMIN")
        ) {
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

  // Carga diferida de transacciones de Stripe al abrir Finanzas
  useEffect(() => {
    if (
      activeTab === "business" &&
      businessSubTab === "finances" &&
      transactions.length === 0
    ) {
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
  }, [activeTab, businessSubTab, transactions.length]);

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
          <div className="w-6 h-6 rounded-full bg-medical-500 animate-ping" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Iniciando QuHealthy Command Center v2...
        </p>
      </div>
    );
  }

  const pendingKycCount = providers.filter(
    (p) => !p.onboardingComplete || p.status === "INACTIVE"
  ).length;
  const unhealthyServicesCount = services.filter((s) => s.status !== "UP").length;
  const seoQuickWinsCount =
    growthOverview?.searchConsole?.quickWinQueries?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans flex flex-col selection:bg-medical-500/30">
      <AdminHeader
        selectedPeriod={selectedPeriod}
        onSelectPeriod={handlePeriodChange}
        onRefresh={() => loadAllData()}
        isRefreshing={isRefreshing}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)}
        isMobileOpen={mobileSidebarOpen}
      />

      <div className="flex-1 flex flex-col lg:flex-row">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={(tab) => handleNavigateTab(tab)}
          pendingKycCount={pendingKycCount}
          unhealthyServicesCount={unhealthyServicesCount}
          seoQuickWinsCount={seoQuickWinsCount}
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
            {/* 1. COMMAND CENTER (NORTH STAR HOME) */}
            {activeTab === "pulse" && (
              <TabCommandCenter
                growthOverview={growthOverview}
                socialSnapshot={socialSnapshot}
                economics={economics}
                dashboard={dashboard}
                productMetrics={productMetrics}
                providers={providers}
                services={services}
                selectedPeriod={selectedPeriod}
                formatCurrency={formatCurrency}
                onNavigateTab={handleNavigateTab}
              />
            )}

            {/* 2. ADQUISICIÓN & SEO (SEARCH CONSOLE + GA4 + PRODUCTO) */}
            {activeTab === "growth" && (
              <TabGrowthSeo
                key={growthSubTab}
                growthOverview={growthOverview}
                productMetrics={productMetrics}
                isLoadingGrowth={isLoadingGrowth}
                growthDays={growthDays}
                onChangeGrowthDays={handleChangeGrowthDays}
                onForceRefreshGrowth={() => fetchGrowthOverview(growthDays, true)}
                initialSubTab={growthSubTab}
              />
            )}

            {/* 3. REDES SOCIALES & CRM */}
            {activeTab === "social" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {([
                    { id: "channels" as const, label: "Métricas CMO & Canales (Meta/IG/YT)", icon: Share2 },
                    { id: "crm" as const, label: "CRM Corporativo & Leads", icon: MessageSquare },
                  ]).map((s) => {
                    const Icon = s.icon;
                    const active = socialSubTab === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSocialSubTab(s.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                          active
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>

                {socialSubTab === "channels" ? (
                  <TabAdminSocialConnections />
                ) : (
                  <TabAdminCrm />
                )}
              </div>
            )}

            {/* 4. NEGOCIO, FINANZAS & OPERACIONES */}
            {activeTab === "business" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {([
                    { id: "finances" as const, label: "Finanzas & Stripe", icon: DollarSign },
                    { id: "economics" as const, label: "Unit Economics & Costos", icon: TrendingUp },
                    {
                      id: "operations" as const,
                      label: "Operaciones & KYC",
                      icon: Stethoscope,
                      badge: pendingKycCount > 0 ? `${pendingKycCount}` : undefined,
                    },
                    { id: "foundations" as const, label: "Fundaciones & Subsidios", icon: FileCheck },
                  ]).map((b) => {
                    const Icon = b.icon;
                    const active = businessSubTab === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBusinessSubTab(b.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                          active
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{b.label}</span>
                        {b.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              active
                                ? "bg-white/20 text-white"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {b.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {businessSubTab === "finances" && (
                  <TabFinances
                    economics={economics}
                    transactions={transactions}
                    isLoadingTransactions={isLoadingTransactions}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                  />
                )}
                {businessSubTab === "economics" && (
                  <TabUnitEconomics
                    economics={economics}
                    selectedPeriod={selectedPeriod}
                    formatCurrency={formatCurrency}
                  />
                )}
                {businessSubTab === "operations" && (
                  <TabMedicalOperations
                    dashboard={dashboard}
                    providers={providers}
                    onRefreshProviders={loadAllData}
                  />
                )}
                {businessSubTab === "foundations" && <TabFoundations />}
              </div>
            )}

            {/* 5. PLATAFORMA & CONECTORES */}
            {activeTab === "health" && (
              <div className="space-y-6">
                {/* Estado de Conectores Externos (GSC, GA4, Meta, Redis) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                  <h2 className="text-sm font-bold text-slate-900 mb-3">
                    Estado de Conectores de Crecimiento & Datos
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {
                        name: "Google Search Console",
                        detail: growthOverview?.searchConsole?.siteUrl || "sc-domain:quhealthy.org",
                        ok: Boolean(growthOverview?.searchConsole?.connected),
                        icon: Search,
                      },
                      {
                        name: "Google Analytics 4",
                        detail: `Propiedad ${growthOverview?.ga4?.propertyId || "523194200"}`,
                        ok: Boolean(growthOverview?.ga4?.connected),
                        icon: Globe,
                      },
                      {
                        name: "Redes Sociales / Meta",
                        detail: `${socialSnapshot?.connectedChannels ?? 0} canales activos`,
                        ok: (socialSnapshot?.connectedChannels ?? 0) > 0,
                        icon: Share2,
                      },
                      {
                        name: "Caché Upstash Redis",
                        detail: growthOverview?.cached ? "Hit activo (TTL 3h)" : "En línea",
                        ok: true,
                        icon: Database,
                      },
                    ].map((conn) => {
                      const Icon = conn.icon;
                      return (
                        <div
                          key={conn.name}
                          className="rounded-xl border border-slate-200/80 p-3.5 flex items-start justify-between gap-2 bg-slate-50/60"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                              <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{conn.name}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-1">
                              {conn.detail}
                            </p>
                          </div>
                          {conn.ok ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <TabSystemHealth
                  services={services}
                  auditLogs={auditLogs}
                  formatDate={formatDate}
                  onRefreshHealth={loadAllData}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
