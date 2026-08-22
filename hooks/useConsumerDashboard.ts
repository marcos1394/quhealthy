// src/hooks/useConsumerDashboard.ts
import { useState, useEffect, useCallback } from "react";
import { appointmentService } from "@/services/appointment.service";
import { consumerWalletService } from "@/services/consumer-wallet.service";
import { consumerPackageService } from "@/services/consumer-package.service";
import { ConsumerOrderService } from "@/services/consumer-order.service";
import { healthVaultService } from "@/services/healthVault.service";
import { Appointment } from "@/types/appointments";
import { ActivityItem } from "@/components/dashboard/PatientActivityTimeline";
import { ConsumerProfileDto } from "@/components/dashboard/PatientDashboardHeader";

export const useConsumerDashboard = (initialProfileId?: number) => {
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    initialProfileId || null
  );
  const [profiles, setProfiles] = useState<ConsumerProfileDto[]>([]);

  const [data, setData] = useState<{
    nextAppointment: Appointment | null;
    healthMetrics: any[];
    pendingPrescriptionsCount: number;
    walletBalance: number;
    walletCurrency: string;
    activePackagesCount: number;
    vaultDocsCount: number;
    activeOrdersCount: number;
    recentActivity: ActivityItem[];
  }>({
    nextAppointment: null,
    healthMetrics: [],
    pendingPrescriptionsCount: 0,
    walletBalance: 0,
    walletCurrency: "MXN",
    activePackagesCount: 0,
    vaultDocsCount: 0,
    activeOrdersCount: 0,
    recentActivity: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Carga paralela con manejo de fallbacks seguros
      const [
        summaryRes,
        profilesRes,
        walletRes,
        packagesRes,
        ordersRes,
        vaultRes,
        appointmentsRes,
      ] = await Promise.allSettled([
        appointmentService.getConsumerDashboardSummary(selectedProfileId || undefined),
        appointmentService.getConsumerProfiles(),
        consumerWalletService.getMyWallet(),
        consumerPackageService.getMyWallet(),
        ConsumerOrderService.getOrders(),
        healthVaultService.getDocuments(),
        appointmentService.getMyAppointments(0, 10),
      ]);

      // 1. Perfiles
      if (profilesRes.status === "fulfilled" && Array.isArray(profilesRes.value)) {
        setProfiles(profilesRes.value);
        if (!selectedProfileId && profilesRes.value.length > 0) {
          const primary = profilesRes.value.find((p: any) => p.isPrimary) || profilesRes.value[0];
          setSelectedProfileId(primary.id);
        }
      }

      // 2. Resumen Principal
      let nextAppt: Appointment | null = null;
      let metrics: any[] = [];
      let pendingPrescriptions = 0;

      if (summaryRes.status === "fulfilled" && summaryRes.value) {
        const summary = summaryRes.value;
        if (summary.upcomingAppointment) {
          nextAppt = {
            id: summary.upcomingAppointment.id,
            startTime: summary.upcomingAppointment.time,
            providerNameSnapshot: summary.upcomingAppointment.providerName,
            serviceNameSnapshot: summary.upcomingAppointment.type,
            provider: {
              specialty: summary.upcomingAppointment.specialty,
              image: undefined,
            },
          } as Appointment;
        }
        metrics = summary.healthMetrics || [];
        pendingPrescriptions = summary.pendingPrescriptionsCount || 0;
      }

      // 3. QuWallet
      let balance = 0;
      let currency = "MXN";
      if (walletRes.status === "fulfilled" && walletRes.value) {
        balance = walletRes.value.balance || 0;
        currency = walletRes.value.currency || "MXN";
      }

      // 4. Paquetes
      let activePackages = 0;
      if (packagesRes.status === "fulfilled" && Array.isArray(packagesRes.value)) {
        activePackages = packagesRes.value.reduce(
          (acc: number, pkg: any) => acc + (pkg.remainingQuantity || pkg.sessionsCount || 0),
          0
        );
      }

      // 5. Órdenes
      let activeOrders = 0;
      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value)) {
        activeOrders = ordersRes.value.filter(
          (o: any) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
        ).length;
      }

      // 6. Expediente & Vault
      let vaultDocs = 0;
      if (vaultRes.status === "fulfilled" && Array.isArray(vaultRes.value)) {
        vaultDocs = vaultRes.value.length;
      }

      // 7. Línea de Tiempo (Actividades recientes)
      const activities: ActivityItem[] = [];

      if (appointmentsRes.status === "fulfilled" && appointmentsRes.value?.content) {
        const pastAppointments = appointmentsRes.value.content.slice(0, 4);
        pastAppointments.forEach((appt: any) => {
          activities.push({
            id: `appt-${appt.id}`,
            type: "APPOINTMENT",
            title: appt.providerNameSnapshot || "Consulta Médica",
            subtitle: appt.serviceNameSnapshot || appt.provider?.specialty || "Consulta general",
            date: appt.startTime || appt.createdAt,
            link: `/patient/dashboard/appointments`,
          });
        });
      }

      if (vaultRes.status === "fulfilled" && Array.isArray(vaultRes.value)) {
        const recentDocs = vaultRes.value.slice(0, 2);
        recentDocs.forEach((doc: any) => {
          activities.push({
            id: `doc-${doc.id}`,
            type: "DOCUMENT",
            title: doc.title || doc.originalFileName || "Documento Clínico",
            subtitle: doc.documentType || "Expediente digital",
            date: doc.createdAt,
            link: `/patient/dashboard/vault`,
          });
        });
      }

      // Ordenar actividades de más reciente a más antigua
      activities.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setData({
        nextAppointment: nextAppt,
        healthMetrics: metrics,
        pendingPrescriptionsCount: pendingPrescriptions,
        walletBalance: balance,
        walletCurrency: currency,
        activePackagesCount: activePackages,
        vaultDocsCount: vaultDocs,
        activeOrdersCount: activeOrders,
        recentActivity: activities.slice(0, 5),
      });
    } catch (err: unknown) {
      console.error("Error fetching consumer dashboard summary:", err);
      setError("No se pudo cargar la información del dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProfileId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    nextAppointment: data.nextAppointment,
    healthMetrics: data.healthMetrics,
    pendingPrescriptionsCount: data.pendingPrescriptionsCount,
    walletBalance: data.walletBalance,
    walletCurrency: data.walletCurrency,
    activePackagesCount: data.activePackagesCount,
    vaultDocsCount: data.vaultDocsCount,
    activeOrdersCount: data.activeOrdersCount,
    recentActivity: data.recentActivity,
    profiles,
    selectedProfileId,
    setSelectedProfileId,
    isLoading,
    error,
    refreshDashboard: loadDashboard,
  };
};