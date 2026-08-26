"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { TabExecutivePulse } from "./tabs/TabExecutivePulse";
import { TabAdminCrm } from "./tabs/TabAdminCrm";
import { TabAdminSocialConnections } from "./tabs/TabAdminSocialConnections";
import { TabFinances } from "./tabs/TabFinances";
import { TabUnitEconomics } from "./tabs/TabUnitEconomics";
import { TabProductAnalytics } from "./tabs/TabProductAnalytics";
import { TabMedicalOperations } from "./tabs/TabMedicalOperations";
import { TabFoundations } from "./tabs/TabFoundations";
import { TabSystemHealth } from "./tabs/TabSystemHealth";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("pulse");
  const [selectedPeriod, setSelectedPeriod] = useState<"24h" | "7d" | "30d" | "month" | "90d">("30d");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // State data
  const [economics, setEconomics] = useState<UnitEconomicsDTO | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardDTO | null>(null);
  const [transactions, setTransactions] = useState<TransactionReportDTO[]>([]);
  const [productMetrics, setProductMetrics] = useState<ProductMetricsDTO | null>(null);
  const [providers, setProviders] = useState<ProviderAdminDTO[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogDTO[]>([]);
  const [services, setServices] = useState<MicroserviceHealthDTO[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const loadAllData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [
        econData,
        dashData,
        prodData,
        provData,
        logsData,
        srvData,
      ] = await Promise.all([
        adminService.getUnitEconomics(),
        adminService.getDashboardMetrics(),
        adminService.getProductMetrics(30),
        adminService.getProviders(),
        adminService.getAuditLogs(0, 20),
        adminService.getSystemHealthList(),
      ]);

      setEconomics(econData);
      setDashboard(dashData);
      setProductMetrics(prodData);
      setProviders(provData.content);
      setAuditLogs(logsData.content);
      setServices(srvData);
    } catch (err) {
      console.error("Error cargando métricas maestras", err);
      toast.error("Error al sincronizar datos del panel administrativo.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const cookies = document.cookie.split(";");
    const roleCookie = cookies.find((c) => c.trim().startsWith("__Secure-userRole="));
    const role = roleCookie ? roleCookie.split("=")[1] : null;

    if (role !== "ROLE_ADMIN" && role !== "ADMIN") {
      toast.error("Acceso denegado. No cuentas con permisos de administrador.");
      router.push("/admin/login");
    } else {
      useSessionStore
        .getState()
        .initializeSession()
        .then(() => {
          loadAllData();
        })
        .catch(() => {
          toast.error("Sesión inválida.");
          router.push("/admin/login");
        });
    }
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
        onSelectPeriod={setSelectedPeriod}
        onRefresh={loadAllData}
        isRefreshing={isRefreshing}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)}
      />

      {/* 🧭 Master Body with Sidebar + Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingKycCount={pendingKycCount}
          unhealthyServicesCount={unhealthyServicesCount}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full space-y-5">
          {activeTab === "pulse" && (
            <TabExecutivePulse
              economics={economics}
              dashboard={dashboard}
              productMetrics={productMetrics}
              providers={providers}
              formatCurrency={formatCurrency}
              onNavigateTab={setActiveTab}
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
        </main>
      </div>
    </div>
  );
}
