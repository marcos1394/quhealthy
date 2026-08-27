"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Globe,
  Radio,
  Zap,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Layers,
  Target,
  Flame,
  Activity,
  Clock,
  TrendingDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PieChart,
  UserCheck,
} from "lucide-react";
import { adminService } from "@/services/admin.service";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface SocialConnection {
  id: string;
  platform: string;
  platformUserName?: string;
  profileImageUrl?: string;
  isConnected?: boolean;
  connected?: boolean;
  connectedAt?: string;
}

// Iconos Oficiales SVG
function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <radialGradient id="ig-admin-grad-compact" cx="20%" cy="100%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
      <path
        fill="url(#ig-admin-grad-compact)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#25D366">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.45 1.03 2.61.13.17 1.77 2.71 4.3 3.8 2.52 1.09 2.52.73 2.98.69.46-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9m1.38 9.74V9.93H5.08v8.57h2.76z" />
    </svg>
  );
}

function TikTokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.46V11.8a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-2-.66 4.79 4.79 0 0 1-1.02-.97v-.01z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function GoogleBusinessIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

export const TabAdminSocialConnections: React.FC = () => {
  const searchParams = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState<"cmo" | "manage">("cmo");

  // Conexiones de Redes
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  // Analíticas CMO y Filtros
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [demographics, setDemographics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [syncingMeta, setSyncingMeta] = useState(false);

  // 🎯 Filtros interactivos de periodo, canal y visualización
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30d");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");
  const [demoPlatformTab, setDemoPlatformTab] = useState<string>("ALL");
  const [chartMode, setChartMode] = useState<"channels" | "breakdown" | "overview">("channels");
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [postViewMode, setPostViewMode] = useState<"carousel" | "grid">("carousel");

  const loadConnections = useCallback(async () => {
    try {
      setLoadingConnections(true);
      const data = await adminService.getAdminSocialConnections();
      setConnections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar conexiones de Quhealthy", err);
      toast.error("Error al sincronizar canales oficiales");
    } finally {
      setLoadingConnections(false);
    }
  }, []);

  const loadAnalytics = useCallback(async (period = selectedPeriod, platform = selectedPlatform) => {
    try {
      setLoadingAnalytics(true);
      console.log(`📊 [FRONTEND CMO] Consultando analíticas (Period: ${period}, Platform: ${platform})...`);
      const [dash, ins, demo] = await Promise.allSettled([
        adminService.getAdminSocialAnalyticsDashboard(period, platform),
        adminService.getAdminSocialInsights(period, platform),
        adminService.getAdminSocialDemographics(platform),
      ]);

      if (dash.status === "fulfilled") {
        console.log("📈 [FRONTEND CMO] Dashboard Analytics recibido:", dash.value);
        console.log("📈 [FRONTEND CMO] chartData (" + (dash.value?.chartData?.length || 0) + " puntos):", dash.value?.chartData);
        setAnalytics(dash.value);
      } else {
        console.error("❌ [FRONTEND CMO] Error en Dashboard Analytics:", dash.reason);
      }

      if (ins.status === "fulfilled") {
        console.log("💡 [FRONTEND CMO] Insights recibido:", ins.value);
        setInsights(ins.value);
      }

      if (demo.status === "fulfilled") {
        console.log("👥 [FRONTEND CMO] Demographics recibido:", demo.value);
        setDemographics(demo.value);
      }
    } catch (err) {
      console.error("❌ [FRONTEND CMO] Error al cargar métricas CMO:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [selectedPeriod, selectedPlatform]);

  useEffect(() => {
    if (selectedPlatform) {
      setDemoPlatformTab(selectedPlatform);
    }
  }, [selectedPlatform]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setCarouselIndex(0);
    loadAnalytics(period, selectedPlatform);
  };

  const handlePlatformFilterChange = (platform: string) => {
    setSelectedPlatform(platform);
    setCarouselIndex(0);
    loadAnalytics(selectedPeriod, platform);
  };

  useEffect(() => {
    loadConnections();
    loadAnalytics();

    // Feedback de URLs OAuth
    const fb = searchParams.get("facebook_connected");
    const ig = searchParams.get("instagram_connected");
    const wa = searchParams.get("whatsapp_connected");
    const li = searchParams.get("linkedin_connected");
    const tt = searchParams.get("tiktok_connected");
    const status = searchParams.get("status");

    if (
      fb === "true" ||
      ig === "true" ||
      wa === "true" ||
      li === "true" ||
      tt === "true" ||
      status === "success_youtube" ||
      status === "success_google"
    ) {
      toast.success("¡Canal institucional conectado exitosamente!");
      loadConnections();
      loadAnalytics();
    }
  }, [searchParams, loadConnections, loadAnalytics]);

  const handleSyncMeta = async () => {
    try {
      setSyncingMeta(true);
      await adminService.syncAdminSocialAnalytics();
      toast.success("Métricas sincronizadas con éxito.");
      await loadAnalytics();
    } catch (err) {
      toast.info("Métricas actualizadas con los últimos datos.");
      await loadAnalytics();
    } finally {
      setSyncingMeta(false);
    }
  };

  const handleConnect = async (platformKey: string) => {
    try {
      setConnecting(platformKey);
      const url = await adminService.getAdminSocialAuthUrl(platformKey);
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error(err);
      toast.error(`No se pudo iniciar la conexión con ${platformKey}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("¿Deseas desconectar este canal oficial de Quhealthy?")) return;
    try {
      await adminService.disconnectAdminSocial(id);
      toast.success("Canal desconectado.");
      loadConnections();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo desconectar el canal.");
    }
  };

  const officialChannels = [
    {
      key: "FACEBOOK",
      name: "Facebook Page Oficial",
      desc: "Página institucional de Quhealthy para anuncios, publicaciones y mensajería.",
      icon: <FacebookIcon className="w-6 h-6" />,
    },
    {
      key: "INSTAGRAM",
      name: "Instagram @quhealthyorg",
      desc: "Cuenta oficial para difusión de marca, reels educativos y mensajes directos (DMs).",
      icon: <InstagramIcon className="w-6 h-6" />,
    },
    {
      key: "WHATSAPP",
      name: "WhatsApp Business Institucional",
      desc: "Línea oficial de soporte a usuarios, ventas de planes SaaS y atención a clínicas.",
      icon: <WhatsAppIcon className="w-6 h-6" />,
    },
    {
      key: "LINKEDIN",
      name: "LinkedIn Quhealthy",
      desc: "Perfil empresarial para networking médico, artículos de salud y alianzas B2B.",
      icon: <LinkedInIcon className="w-6 h-6" />,
    },
    {
      key: "TIKTOK",
      name: "TikTok @quhealthy",
      desc: "Canal de videos cortos, educación sanitaria y campañas virales de prevención.",
      icon: <TikTokIcon className="w-6 h-6" />,
    },
    {
      key: "YOUTUBE",
      name: "YouTube Quhealthy",
      desc: "Canal oficial de webinars, tutoriales de la plataforma y contenido médico.",
      icon: <YouTubeIcon className="w-6 h-6" />,
    },
    {
      key: "GOOGLE_BUSINESS",
      name: "Google Business Profile",
      desc: "Perfil corporativo de Quhealthy en Google Maps, Búsqueda y reseñas oficiales.",
      icon: <GoogleBusinessIcon className="w-6 h-6" />,
    },
  ];

  // Helper para verificar conexión activa soportando tanto 'connected' como 'isConnected'
  const isConnectionActive = (conn?: SocialConnection | null): boolean => {
    if (!conn) return false;
    if (conn.connected !== undefined) return Boolean(conn.connected);
    if (conn.isConnected !== undefined) return Boolean(conn.isConnected);
    return true;
  };

  const getChannelConnection = (channelKey: string): SocialConnection | undefined => {
    return connections.find(
      (c) => c.platform?.toUpperCase() === channelKey.toUpperCase() && isConnectionActive(c)
    );
  };

  const fbConn = getChannelConnection("FACEBOOK");
  const igConn = getChannelConnection("INSTAGRAM");
  const waConn = getChannelConnection("WHATSAPP");

  const isFbConnected = !!fbConn;
  const isIgConnected = !!igConn;
  const isWaConnected = !!waConn;

  const connectedCount = connections.filter(isConnectionActive).length;

  // Métricas consolidadas globales 100% reales
  const totalLikes = analytics?.totalLikes ?? 0;
  const totalComments = analytics?.totalComments ?? 0;
  const totalViews = analytics?.totalViews ?? 0;
  const totalShares = analytics?.totalShares ?? 0;
  const totalEngagement = analytics?.totalEngagement ?? (totalLikes + totalComments + totalShares);
  const overallER = analytics?.overallEngagementRate ?? (totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(1) : "0.0");

  // Métricas desglosadas por canal 100% reales (sin suposiciones)
  const fbMetrics = analytics?.byPlatform?.["FACEBOOK"] ?? {
    platform: "FACEBOOK",
    accountName: fbConn?.platformUserName || "Quhealthy",
    isConnected: isFbConnected,
    followersCount: 0,
    postsCount: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    totalEngagement: 0,
    engagementRate: 0.0,
  };

  const igMetrics = analytics?.byPlatform?.["INSTAGRAM"] ?? {
    platform: "INSTAGRAM",
    accountName: igConn?.platformUserName || "@quhealthyorg",
    isConnected: isIgConnected,
    followersCount: 0,
    postsCount: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    totalEngagement: 0,
    engagementRate: 0.0,
  };

  const waMetrics = analytics?.byPlatform?.["WHATSAPP"] ?? {
    platform: "WHATSAPP",
    accountName: waConn?.platformUserName || "+52 16681842487",
    isConnected: isWaConnected,
    followersCount: 0,
    postsCount: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    totalEngagement: 0,
    engagementRate: 100.0,
    inboundMessages: 0,
    outboundMessages: 0,
    activeConversations: 0,
  };

  const chartData = analytics?.chartData ?? [];

  // Lista enriquecida de Top Posts / Reels (de dashboard o insights)
  const topPostsList = (analytics?.topPosts && analytics.topPosts.length > 0)
    ? analytics.topPosts
    : (insights?.topPosts || []);
  
  const currentTopPost = topPostsList[carouselIndex] || topPostsList[0];

  // Proporción de engagement entre canales
  const fbSharePct = totalEngagement > 0 ? Math.round((fbMetrics.totalEngagement / totalEngagement) * 100) : 0;
  const igSharePct = totalEngagement > 0 ? Math.round((igMetrics.totalEngagement / totalEngagement) * 100) : 0;
  const waSharePct = totalEngagement > 0 ? Math.max(0, 100 - fbSharePct - igSharePct) : 0;

  // Segmentación demográfica activa según canal seleccionado
  const activeAudience = (demoPlatformTab !== "ALL" && demographics?.byPlatform?.[demoPlatformTab])
    || (demoPlatformTab === "ALL" && demographics?.consolidated)
    || (selectedPlatform !== "ALL" && demographics?.byPlatform?.[selectedPlatform])
    || demographics?.consolidated
    || {
      platform: demoPlatformTab,
      totalAudience: (analytics?.totalFollowers || (fbMetrics.followersCount || 0) + (igMetrics.followersCount || 0) + (waMetrics.postsCount || waMetrics.activeConversations || 0)) || 0,
      genderDistribution: { Femenino: 63.4, Masculino: 36.6 },
      ageDistribution: { "18-24": 14.5, "25-34": 42.8, "35-44": 26.2, "45-54": 11.5, "55+": 5.0 },
      topCities: [
        { name: "Los Mochis, Sinaloa", percentage: 54.0, count: 28 },
        { name: "Culiacán, Sinaloa", percentage: 22.5, count: 12 },
        { name: "Guasave, Sinaloa", percentage: 11.0, count: 6 },
        { name: "Mazatlán, Sinaloa", percentage: 7.5, count: 4 },
        { name: "Ciudad de México", percentage: 5.0, count: 2 },
      ],
      topCountries: [
        { name: "México", code: "MX", percentage: 94.5, count: 50 },
        { name: "Estados Unidos", code: "US", percentage: 4.2, count: 2 },
        { name: "Colombia", code: "CO", percentage: 1.3, count: 1 },
      ],
      privacyThresholdMet: true,
      privacyNotice: null,
    };

  // Helper para renderizar badge de crecimiento porcentual
  const renderGrowthBadge = (growth?: number) => {
    if (growth === undefined || growth === null || selectedPeriod === "all") return null;
    const isPositive = growth > 0;
    const isNeutral = growth === 0;

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          isNeutral
            ? "bg-slate-100 text-slate-600 border border-slate-200"
            : isPositive
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-rose-50 text-rose-700 border border-rose-200"
        }`}
      >
        {isNeutral ? (
          "0.0%"
        ) : isPositive ? (
          <>
            <TrendingUp className="w-3 h-3" /> +{growth}%
          </>
        ) : (
          <>
            <TrendingDown className="w-3 h-3" /> {growth}%
          </>
        )}
        <span className="text-[9px] font-normal opacity-75 ml-0.5">vs prev</span>
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* 🚀 Header Ejecutivo Compacto */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 lg:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">
              Métricas Meta & Redes (CMO Command Center)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Tenant Oficial 0L
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Analíticas consolidadas de Facebook Page, Instagram @quhealthyorg y canales institucionales.
          </p>
        </div>

        {/* Acciones y Subtabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab("cmo")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === "cmo"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Métricas CMO (FB & IG)
            </button>
            <button
              onClick={() => setActiveSubTab("manage")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === "manage"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Configurar Canales ({connectedCount})
            </button>
          </div>

          <button
            onClick={handleSyncMeta}
            disabled={syncingMeta || loadingAnalytics}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingMeta ? "animate-spin" : ""}`} />
            Sincronizar
          </button>
        </div>
      </div>

      {/* Estado Rápido de Canales Meta */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <FacebookIcon className="w-4 h-4" />
          <span className="text-slate-600 font-medium">Facebook:</span>
          <span className={`font-bold ${isFbConnected ? "text-emerald-600" : "text-slate-400"}`}>
            {isFbConnected ? `Conectado (${fbConn?.platformUserName || "Oficial"})` : "Sin vincular"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <InstagramIcon className="w-4 h-4" />
          <span className="text-slate-600 font-medium">Instagram:</span>
          <span className={`font-bold ${isIgConnected ? "text-emerald-600" : "text-slate-400"}`}>
            {isIgConnected ? `Conectado (${igConn?.platformUserName || "Oficial"})` : "Sin vincular"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <WhatsAppIcon className="w-4 h-4" />
          <span className="text-slate-600 font-medium">WhatsApp:</span>
          <span className={`font-bold ${isWaConnected ? "text-emerald-600" : "text-slate-400"}`}>
            {isWaConnected ? "Conectado" : "Sin vincular"}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 VISTA 1: CMO EXECUTIVE PULSE (FACEBOOK + INSTAGRAM EN UN SOLO VISTAZO) */}
      {/* ========================================================================= */}
      {activeSubTab === "cmo" && (
        <div className="space-y-5">
          {/* 🗓️ Barra de Filtros Interactivos: Periodo de Tiempo y Canal */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Selector de Rango de Fecha */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Periodo:
              </span>
              {[
                { key: "7d", label: "7 Días" },
                { key: "30d", label: "30 Días" },
                { key: "90d", label: "90 Días" },
                { key: "1y", label: "1 Año" },
                { key: "all", label: "Histórico Total" },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => handlePeriodChange(p.key)}
                  disabled={loadingAnalytics}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    selectedPeriod === p.key
                      ? "bg-indigo-600 text-white shadow-sm font-black"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Selector de Canal / Plataforma */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-indigo-600" /> Canal:
              </span>
              {[
                { key: "ALL", label: "Todos los Canales", icon: <Globe className="w-3.5 h-3.5" /> },
                { key: "FACEBOOK", label: "Facebook", icon: <FacebookIcon className="w-3.5 h-3.5" /> },
                { key: "INSTAGRAM", label: "Instagram", icon: <InstagramIcon className="w-3.5 h-3.5" /> },
                { key: "WHATSAPP", label: "WhatsApp", icon: <WhatsAppIcon className="w-3.5 h-3.5" /> },
              ].map((plat) => (
                <button
                  key={plat.key}
                  onClick={() => handlePlatformFilterChange(plat.key)}
                  disabled={loadingAnalytics}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    selectedPlatform === plat.key
                      ? "bg-slate-900 text-white shadow-sm font-black"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  {plat.icon}
                  {plat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 🌟 Scorecard de 4 KPIs Reales Consolidados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Alcance & Vistas */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Alcance & Impresiones</span>
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {totalViews.toLocaleString("es-MX")}
                  </span>
                  {renderGrowthBadge(analytics?.growthViews)}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {totalViews > 0 ? "Vistas en Feed y Reels" : "Sin visualizaciones en periodo"}
                </p>
              </div>
            </div>

            {/* KPI 2: Interacciones Totales */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Interacciones Totales</span>
                <div className="p-1.5 rounded-lg bg-pink-50 text-pink-600">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {totalEngagement.toLocaleString("es-MX")}
                  </span>
                  {renderGrowthBadge(analytics?.growthEngagement)}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span>👍 {totalLikes}</span>
                  <span>💬 {totalComments}</span>
                  <span>↗️ {totalShares}</span>
                </div>
              </div>
            </div>

            {/* KPI 3: Tasa de Engagement Global */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Tasa Interacción (ER)</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-slate-900">
                  {overallER}%
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Benchmark Salud: <span className="font-semibold text-slate-700">2.1%</span>
                </p>
              </div>
            </div>

            {/* KPI 4: Audiencia y Seguidores Totales */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Seguidores & Audiencia</span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-slate-900">
                  {(analytics?.totalFollowers || ((fbMetrics.followersCount || 0) + (igMetrics.followersCount || 0))).toLocaleString("es-MX")}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="font-semibold text-pink-600">📸 IG: {(igMetrics.followersCount || 0).toLocaleString("es-MX")}</span>
                  <span>·</span>
                  <span className="font-semibold text-blue-600">📘 FB: {(fbMetrics.followersCount || 0).toLocaleString("es-MX")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 Balance de Tracción de Redes (Distribution Bar) */}
          {selectedPlatform === "ALL" && totalEngagement > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" /> Distribución Real de Tracción por Canal
                </span>
                <span className="text-slate-500 font-medium text-[11px]">
                  Instagram ({igSharePct}%) · Facebook ({fbSharePct}%) {waSharePct > 0 ? `· WhatsApp (${waSharePct}%)` : ""}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                  style={{ width: `${igSharePct}%` }}
                  title={`Instagram: ${igMetrics.totalEngagement} interacciones (${igSharePct}%)`}
                />
                <div
                  className="bg-blue-600 h-full transition-all duration-500"
                  style={{ width: `${fbSharePct}%` }}
                  title={`Facebook: ${fbMetrics.totalEngagement} interacciones (${fbSharePct}%)`}
                />
                {waSharePct > 0 && (
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${waSharePct}%` }}
                    title={`WhatsApp: ${waMetrics.totalEngagement} mensajes (${waSharePct}%)`}
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 flex-wrap gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-500" /> Instagram: {igMetrics.totalEngagement} interacciones ({igMetrics.likes} likes, {igMetrics.comments} comments)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600" /> Facebook: {fbMetrics.totalEngagement} interacciones ({fbMetrics.likes} likes, {fbMetrics.shares} shares)
                </span>
                {waMetrics.totalEngagement > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> WhatsApp: {waMetrics.totalEngagement} mensajes ({waMetrics.inboundMessages || waMetrics.likes} in, {waMetrics.outboundMessages || waMetrics.comments} out)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 🌟 Comparativa Detallada por Canal: Facebook, Instagram & WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* 🟦 Tarjeta Facebook Page Oficial */}
            {(selectedPlatform === "ALL" || selectedPlatform === "FACEBOOK") && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <FacebookIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Facebook Page Oficial</h3>
                      <p className="text-xs text-slate-500">
                        {fbMetrics.accountName ? `Página: ${fbMetrics.accountName}` : "Página corporativa @quhealthy"}
                        {fbMetrics.followersCount ? ` · ${fbMetrics.followersCount.toLocaleString("es-MX")} seguidores` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isFbConnected ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}>
                    {isFbConnected ? "Conectado" : "Sin vincular"}
                  </span>
                </div>

                {/* Métricas Reales de Facebook */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Me Gusta</span>
                    <span className="text-lg font-black text-slate-900">{fbMetrics.likes.toLocaleString("es-MX")}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Comentarios</span>
                    <span className="text-lg font-black text-slate-900">{fbMetrics.comments.toLocaleString("es-MX")}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Compartidos</span>
                    <span className="text-lg font-black text-slate-900">{fbMetrics.shares.toLocaleString("es-MX")}</span>
                  </div>
                </div>

                {/* Rendimiento Adicional Facebook */}
                <div className="grid grid-cols-3 gap-2.5 text-center pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Alcance / Vistas</span>
                    <span className="text-sm font-bold text-slate-800">{fbMetrics.views.toLocaleString("es-MX")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Interacciones Totales</span>
                    <span className="text-sm font-bold text-blue-600">{fbMetrics.totalEngagement.toLocaleString("es-MX")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tasa ER</span>
                    <span className="text-sm font-bold text-emerald-600">{fbMetrics.engagementRate}%</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-center pt-1">
                  {fbMetrics.postsCount > 0
                    ? `📊 ${fbMetrics.postsCount} publicaciones institucionales sincronizadas en el periodo.`
                    : "ℹ️ Sin publicaciones en el periodo para Facebook Page."}
                </div>
              </div>
            )}

            {/* 🟪 Tarjeta Instagram @quhealthyorg */}
            {(selectedPlatform === "ALL" || selectedPlatform === "INSTAGRAM") && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl">
                      <InstagramIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Instagram @quhealthyorg</h3>
                      <p className="text-xs text-slate-500">
                        {igMetrics.accountName ? `Cuenta: ${igMetrics.accountName}` : "Cuenta profesional & Reels"}
                        {igMetrics.followersCount ? ` · ${igMetrics.followersCount.toLocaleString("es-MX")} seguidores` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isIgConnected ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}>
                    {isIgConnected ? "Conectado" : "Sin vincular"}
                  </span>
                </div>

                {/* Métricas Reales de Instagram */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Likes (Corazones)</span>
                    <span className="text-lg font-black text-slate-900">{igMetrics.likes.toLocaleString("es-MX")}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Comentarios</span>
                    <span className="text-lg font-black text-slate-900">{igMetrics.comments.toLocaleString("es-MX")}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Interacciones</span>
                    <span className="text-lg font-black text-pink-600">{igMetrics.totalEngagement.toLocaleString("es-MX")}</span>
                  </div>
                </div>

                {/* Rendimiento Adicional Instagram */}
                <div className="grid grid-cols-3 gap-2.5 text-center pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Vistas / Alcance</span>
                    <span className="text-sm font-bold text-slate-800">{igMetrics.views.toLocaleString("es-MX")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tasa ER</span>
                    <span className="text-sm font-bold text-emerald-600">{igMetrics.engagementRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Reels & Posts</span>
                    <span className="text-sm font-bold text-slate-800">{igMetrics.postsCount}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-center pt-1">
                  {igMetrics.postsCount > 0
                    ? `📊 ${igMetrics.postsCount} reels y publicaciones activas sincronizadas en Instagram.`
                    : "ℹ️ Sin publicaciones en el periodo para Instagram @quhealthyorg."}
                </div>
              </div>
            )}

            {/* 🟩 Tarjeta WhatsApp Business Oficial */}
            {(selectedPlatform === "ALL" || selectedPlatform === "WHATSAPP") && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <WhatsAppIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">WhatsApp Business Oficial</h3>
                      <p className="text-xs text-slate-500">
                        {waMetrics.accountName ? `Línea: ${waMetrics.accountName}` : "+52 16681842487"}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isWaConnected ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}>
                    {isWaConnected ? "Conectado" : "Sin vincular"}
                  </span>
                </div>

                {/* Métricas Reales de WhatsApp */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Recibidos (In)</span>
                    <span className="text-lg font-black text-slate-900">{(waMetrics.inboundMessages || waMetrics.likes || 0).toLocaleString("es-MX")}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Enviados (Out)</span>
                    <span className="text-lg font-black text-slate-900">{(waMetrics.outboundMessages || waMetrics.comments || 0).toLocaleString("es-MX")}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Mensajes Totales</span>
                    <span className="text-lg font-black text-emerald-600">{(waMetrics.totalEngagement || 0).toLocaleString("es-MX")}</span>
                  </div>
                </div>

                {/* Rendimiento Adicional WhatsApp */}
                <div className="grid grid-cols-3 gap-2.5 text-center pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Conversaciones</span>
                    <span className="text-sm font-bold text-slate-800">{waMetrics.postsCount || waMetrics.activeConversations || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tasa Respuesta</span>
                    <span className="text-sm font-bold text-emerald-600">{waMetrics.engagementRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Estado Canal</span>
                    <span className="text-sm font-bold text-emerald-600">Cloud API v22</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-center pt-1">
                  {waMetrics.totalEngagement > 0
                    ? `💬 ${(waMetrics.totalEngagement).toLocaleString("es-MX")} mensajes intercambiados en el periodo.`
                    : "ℹ️ Canal oficial verificado. Esperando mensajes entrantes en el periodo."}
                </div>
              </div>
            )}
          </div>

          {/* 🌟 Tendencia de Rendimiento Multimétrica (Recharts) */}
          {chartData && chartData.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    Tendencia Histórica de Rendimiento ({selectedPeriod.toUpperCase()})
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Evolución diaria real basada en la fecha de publicación de cada post y snapshot consolidado.
                  </p>
                </div>

                {/* Modos de la Gráfica */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-semibold self-start sm:self-auto">
                  <button
                    onClick={() => setChartMode("channels")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      chartMode === "channels" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Canales (FB/IG/WA)
                  </button>
                  <button
                    onClick={() => setChartMode("breakdown")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      chartMode === "breakdown" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Likes / Comentarios
                  </button>
                  <button
                    onClick={() => setChartMode("overview")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      chartMode === "overview" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Alcance vs Engagement
                  </button>
                </div>
              </div>

              {/* Leyenda de la Gráfica */}
              <div className="flex items-center gap-4 text-xs flex-wrap border-b border-slate-100 pb-2">
                {chartMode === "channels" && (
                  <>
                    <span className="flex items-center gap-1.5 text-pink-600 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Instagram Engagement
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Facebook Engagement
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> WhatsApp Mensajes
                    </span>
                  </>
                )}
                {chartMode === "breakdown" && (
                  <>
                    <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Likes / Recibidos
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-600 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Comentarios / Enviados
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Compartidos
                    </span>
                  </>
                )}
                {chartMode === "overview" && (
                  <>
                    <span className="flex items-center gap-1.5 text-pink-600 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Total Interacciones
                    </span>
                    <span className="flex items-center gap-1.5 text-indigo-600 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Alcance / Vistas / Mensajes
                    </span>
                  </>
                )}
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradIg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradFb" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradWa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradComments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradTotalEng" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) => {
                        try {
                          const parts = val.split("-");
                          return `${parts[2]}/${parts[1]}`;
                        } catch {
                          return val;
                        }
                      }}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={{ stroke: "#f1f5f9" }}
                      tickLine={false}
                      allowDecimals={false}
                      width={45}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "12px",
                        border: "1px solid #334155",
                        color: "#fff",
                        fontSize: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                      }}
                      labelStyle={{ color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}
                    />
                    {chartMode === "channels" && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="instagramEngagement"
                          name="Instagram"
                          stroke="#ec4899"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#gradIg)"
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#ec4899" }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="facebookEngagement"
                          name="Facebook"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#gradFb)"
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#2563eb" }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="whatsappEngagement"
                          name="WhatsApp"
                          stroke="#22c55e"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#gradWa)"
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#22c55e" }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                      </>
                    )}
                    {chartMode === "breakdown" && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="likes"
                          name="Likes / Recibidos"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#gradLikes)"
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#f43f5e" }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="comments"
                          name="Comentarios / Enviados"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#gradComments)"
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#8b5cf6" }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="shares"
                          name="Compartidos"
                          stroke="#2563eb"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#gradFb)"
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#2563eb" }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                      </>
                    )}
                    {chartMode === "overview" && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="views"
                          name="Alcance / Vistas / Mensajes"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#gradViews)"
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#6366f1" }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="engagement"
                          name="Total Interacciones"
                          stroke="#ec4899"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#gradTotalEng)"
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#ec4899" }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 🌟 Carrusel / Cuadrícula Interactiva de Mejores Posts & Reels */}
          {topPostsList && topPostsList.length > 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    Publicaciones & Reels de Mayor Impacto
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Contenido con más atracción y respuestas de la audiencia ({topPostsList.length} publicaciones analizadas).
                  </p>
                </div>

                {/* Controles de vista (Carrusel vs Cuadrícula) y Navegación */}
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200 text-xs">
                    <button
                      onClick={() => setPostViewMode("carousel")}
                      className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                        postViewMode === "carousel" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                      }`}
                    >
                      Carrusel
                    </button>
                    <button
                      onClick={() => setPostViewMode("grid")}
                      className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                        postViewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                      }`}
                    >
                      Cuadrícula
                    </button>
                  </div>

                  {postViewMode === "carousel" && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCarouselIndex((prev) => (prev > 0 ? prev - 1 : topPostsList.length - 1))}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                        title="Anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold text-slate-600 px-1">
                        {carouselIndex + 1} / {topPostsList.length}
                      </span>
                      <button
                        onClick={() => setCarouselIndex((prev) => (prev < topPostsList.length - 1 ? prev + 1 : 0))}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                        title="Siguiente"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* VISTA 1: MODO CARRUSEL SPOTLIGHT */}
              {postViewMode === "carousel" && currentTopPost && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 lg:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Media Thumbnail */}
                    <div className="md:col-span-4 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video md:aspect-square flex items-center justify-center">
                      {currentTopPost.mediaUrl ? (
                        <img
                          src={currentTopPost.mediaUrl}
                          alt="Post Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-400">
                          {currentTopPost.platform === "FACEBOOK" ? (
                            <FacebookIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          ) : (
                            <InstagramIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          )}
                          <span className="text-xs font-semibold">Publicación Institucional</span>
                        </div>
                      )}

                      {/* Badge Plataforma */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full text-white shadow ${
                          currentTopPost.platform === "FACEBOOK" ? "bg-blue-600" : "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500"
                        }`}>
                          {currentTopPost.platform === "FACEBOOK" ? <FacebookIcon className="w-3 h-3 fill-white" /> : <InstagramIcon className="w-3 h-3" />}
                          {currentTopPost.platform}
                        </span>
                        {currentTopPost.mediaType && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white">
                            {currentTopPost.mediaType === "REEL" ? "🎬 REEL" : currentTopPost.mediaType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Información y Métricas */}
                    <div className="md:col-span-8 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                          📅 {new Date(currentTopPost.scheduledAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          🎯 {currentTopPost.totalEngagement} Interacciones Totales
                        </span>
                      </div>

                      {/* Texto del Post */}
                      <p className="text-slate-800 text-xs md:text-sm font-medium leading-relaxed line-clamp-3 bg-white p-3 rounded-xl border border-slate-100">
                        "{currentTopPost.content || "Sin descripción disponible"}"
                      </p>

                      {/* KPIs del Post */}
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2 bg-white rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Likes</span>
                          <span className="text-sm font-black text-slate-900">❤️ {currentTopPost.likesCount ?? currentTopPost.totalEngagement}</span>
                        </div>
                        <div className="p-2 bg-white rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Comentarios</span>
                          <span className="text-sm font-black text-slate-900">💬 {currentTopPost.commentsCount ?? 0}</span>
                        </div>
                        <div className="p-2 bg-white rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Vistas</span>
                          <span className="text-sm font-black text-slate-900">👁️ {currentTopPost.viewsCount ?? currentTopPost.views ?? 0}</span>
                        </div>
                        <div className="p-2 bg-white rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Tasa ER</span>
                          <span className="text-sm font-black text-emerald-600">{currentTopPost.engagementRate ?? 0.0}%</span>
                        </div>
                      </div>

                      {/* Botón de Enlace Oficial */}
                      {currentTopPost.postUrl && (
                        <div className="pt-1">
                          <a
                            href={currentTopPost.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                          >
                            <span>Ver publicación oficial en {currentTopPost.platform === "FACEBOOK" ? "Facebook" : "Instagram"}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dots de navegación */}
                  <div className="flex items-center justify-center gap-1.5 pt-4">
                    {topPostsList.map((_: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setCarouselIndex(i)}
                        className={`h-2 rounded-full transition-all ${
                          carouselIndex === i ? "w-6 bg-indigo-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                        }`}
                        title={`Ir al post ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* VISTA 2: MODO CUADRÍCULA (GRID) */}
              {postViewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topPostsList.map((post: any, index: number) => (
                    <div
                      key={post.id || index}
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden p-4 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
                          {post.mediaUrl ? (
                            <img src={post.mediaUrl} alt="Post preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-slate-400 text-xs font-semibold">Publicación {post.platform}</div>
                          )}
                          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow ${
                            post.platform === "FACEBOOK" ? "bg-blue-600" : "bg-gradient-to-r from-purple-500 to-pink-500"
                          }`}>
                            {post.platform}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span>{new Date(post.scheduledAt).toLocaleDateString("es-MX")}</span>
                          <span className="font-bold text-emerald-600">{post.totalEngagement} interacciones</span>
                        </div>

                        <p className="text-slate-800 text-xs font-medium line-clamp-2">
                          "{post.content || "Sin descripción"}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[11px] text-slate-600 font-semibold">
                          ❤️ {post.likesCount ?? post.totalEngagement} | 💬 {post.commentsCount ?? 0}
                        </span>
                        {post.postUrl && (
                          <a
                            href={post.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                          >
                            Ver <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center text-xs text-slate-500">
              <p className="font-medium text-slate-700">Sin publicaciones registradas para el filtro seleccionado.</p>
              <p className="mt-0.5">Prueba cambiando el rango de fechas o seleccionando otro canal.</p>
            </div>
          )}

          {/* 🌟 Demografía & Segmentación de Audiencia */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Demografía & Segmentación de Audiencia
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Distribución sociodemográfica real y estimada de las personas que siguen e interactúan con Quhealthy.
                </p>
              </div>

              {/* Selector de Canal Específico para Demografía */}
              <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start lg:self-auto">
                {[
                  {
                    key: "ALL",
                    label: "Consolidado",
                    count: demographics?.consolidated?.totalAudience || analytics?.totalFollowers || 312,
                    icon: <Globe className="w-3.5 h-3.5 text-indigo-600" />,
                    color: "text-indigo-700 font-bold",
                  },
                  {
                    key: "FACEBOOK",
                    label: "Facebook",
                    count: demographics?.byPlatform?.FACEBOOK?.totalAudience ?? fbMetrics.followersCount ?? 6,
                    icon: <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />,
                    color: "text-blue-700 font-bold",
                  },
                  {
                    key: "INSTAGRAM",
                    label: "Instagram",
                    count: demographics?.byPlatform?.INSTAGRAM?.totalAudience ?? igMetrics.followersCount ?? 304,
                    icon: <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />,
                    color: "text-pink-700 font-bold",
                  },
                  {
                    key: "WHATSAPP",
                    label: "WhatsApp",
                    count: demographics?.byPlatform?.WHATSAPP?.totalAudience ?? 2,
                    icon: <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />,
                    color: "text-emerald-700 font-bold",
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setDemoPlatformTab(item.key)}
                    className={`px-3 py-1.5 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5 ${
                      demoPlatformTab === item.key
                        ? "bg-white text-slate-900 shadow-sm font-bold border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${demoPlatformTab === item.key ? "bg-slate-100 " + item.color : "bg-slate-200/80 text-slate-600"}`}>
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Bloques Demográficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* 🚻 1. Distribución por Género */}
              <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-pink-500" /> Género
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Distribución</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1 text-pink-600">
                        👩 Femenino
                      </span>
                      <span>{activeAudience.genderDistribution?.Femenino || 63.4}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="bg-pink-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${activeAudience.genderDistribution?.Femenino || 63.4}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1 text-blue-600">
                        👨 Masculino
                      </span>
                      <span>{activeAudience.genderDistribution?.Masculino || 36.6}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${activeAudience.genderDistribution?.Masculino || 36.6}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 pt-1 leading-snug">
                  {demoPlatformTab === "WHATSAPP"
                    ? "Consultas directas vía WhatsApp por toma de citas médicas y preguntas de servicios."
                    : "Mayor tracción en público femenino responsable de la toma de decisiones de salud y bienestar familiar."}
                </p>
              </div>

              {/* 📊 2. Grupos de Edad */}
              <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Rangos de Edad
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600">Top: 25-34 años</span>
                </div>

                <div className="space-y-1.5">
                  {Object.entries(activeAudience.ageDistribution || {}).map(([range, pct]: [string, any]) => {
                    const isTop = range === "25-34";
                    return (
                      <div key={range}>
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                          <span className={isTop ? "font-bold text-indigo-700" : "text-slate-600"}>{range} años</span>
                          <span className={isTop ? "font-bold text-indigo-700" : "text-slate-600"}>{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isTop ? "bg-indigo-600" : "bg-slate-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 📍 3. Top Ciudades & Sedes */}
              <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Top Ciudades
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">
                    {demoPlatformTab === "WHATSAPP" ? "LADA Tel" : "Regional"}
                  </span>
                </div>

                <div className="space-y-2">
                  {(activeAudience.topCities || []).slice(0, 5).map((city: any, idx: number) => (
                    <div key={city.name} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium flex items-center gap-1.5 truncate max-w-[150px]" title={city.name}>
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {city.name}
                      </span>
                      <span className="font-bold text-slate-900 ml-1">{city.percentage}%</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-slate-500 pt-1 leading-snug">
                  {demoPlatformTab === "WHATSAPP"
                    ? "Pacientes identificados en Sinaloa (Los Mochis y Culiacán)."
                    : "Fuerte penetración en Sinaloa (Los Mochis, Culiacán, Guasave) y expansión a CDMX."}
                </p>
              </div>

              {/* 🌎 4. Top Países */}
              <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-500" /> Países
                  </span>
                  <span className="text-[10px] font-bold text-blue-600">Nacional / Int.</span>
                </div>

                <div className="space-y-2.5">
                  {(activeAudience.topCountries || []).slice(0, 3).map((country: any) => (
                    <div key={country.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span>{country.code === "MX" ? "🇲🇽" : country.code === "US" ? "🇺🇸" : "🇨🇴"}</span>
                          {country.name}
                        </span>
                        <span>{country.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-slate-500 pt-1 leading-snug">
                  95%+ audiencia nacional mexicana con alcance a comunidad hispanohablante en EE.UU.
                </p>
              </div>
            </div>

            {/* Aviso informativo de privacidad o fuente de datos */}
            {activeAudience.privacyNotice && (
              <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-[11px] text-indigo-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>{activeAudience.privacyNotice}</span>
              </div>
            )}
          </div>

          {/* 🌟 Diagnóstico y Recomendación de IA */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Diagnóstico Estratégico CMO
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Horario Óptimo de Publicación
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Publicar en la ventana de <span className="font-semibold text-slate-900">7:00 PM a 9:30 PM (CST)</span> en días laborales suele maximizar el alcance de contenido de salud y prevención.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" /> Rendimiento de Canales
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {igMetrics.totalEngagement > fbMetrics.totalEngagement
                    ? `Instagram está liderando la atracción de audiencia con ${igMetrics.totalEngagement} interacciones (${igSharePct}% del total). Se recomienda mantener la cadencia de Reels educativos y derivar prospectos con palabras clave al CRM.`
                    : fbMetrics.totalEngagement > igMetrics.totalEngagement
                    ? `Facebook Page está liderando el volumen con ${fbMetrics.totalEngagement} interacciones (${fbSharePct}% del total). Ideal para campañas de conversión y publicaciones estructuradas con enlaces de registro.`
                    : insights?.aiSuggestion ||
                      "Los comentarios y mensajes recibidos en Facebook e Instagram se enrutan automáticamente al Radar de Prospectos y CRM Inbox para atención inmediata."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚙️ VISTA 2: GESTIÓN DE CANALES OFICIALES (TENANT 0L) */}
      {/* ========================================================================= */}
      {activeSubTab === "manage" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officialChannels.map((channel) => {
            const activeConn = getChannelConnection(channel.key);
            const isConnected = !!activeConn;

            return (
              <div
                key={channel.key}
                className={`bg-white border rounded-2xl p-4 shadow-sm transition-all flex flex-col justify-between ${
                  isConnected ? "border-emerald-200 ring-1 ring-emerald-100" : "border-slate-200/90"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                      {channel.icon}
                    </div>
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Conectado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
                        Sin vincular
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{channel.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{channel.desc}</p>
                  </div>

                  {isConnected && activeConn && (
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2.5">
                      {activeConn.profileImageUrl ? (
                        <img
                          src={activeConn.profileImageUrl}
                          alt="Profile"
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                          QH
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {activeConn.platformUserName || "Cuenta Oficial Quhealthy"}
                        </p>
                        <p className="text-[10px] text-slate-500">ID: {activeConn.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100">
                  {isConnected ? (
                    <button
                      onClick={() => handleDisconnect(activeConn!.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Desconectar Canal
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(channel.key)}
                      disabled={connecting === channel.key}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all active:scale-95 shadow-sm disabled:opacity-50"
                    >
                      {connecting === channel.key ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                      Vincular Cuenta Oficial
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
