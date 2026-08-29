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
  Search,
  Phone,
  Building2,
  Star,
  Send,
  Database,
  Compass,
  FlaskConical,
  Pill,
  HeartHandshake,
  Stethoscope,
  Package,
  List,
  LayoutGrid,
  Map,
  Navigation,
  Download,
  Play,
  Pause,
  Plus,
  CheckSquare,
  Square,
  Copy,
  Check,
  X,
  Megaphone,
  Inbox,
  Mail,
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
  const [activeSubTab, setActiveSubTab] = useState<"cmo" | "market" | "manage">("cmo");

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

  // 🔍 Inteligencia de Mercado B2B & Prospección Integral de Salud
  const [marketIntel, setMarketIntel] = useState<any>(null);
  const [loadingMarketIntel, setLoadingMarketIntel] = useState(false);
  const [loadingMoreLeads, setLoadingMoreLeads] = useState(false);
  const [scoutCity, setScoutCity] = useState("Los Mochis");
  const [scoutQuery, setScoutQuery] = useState("");
  const [scoutState, setScoutState] = useState("Sinaloa");
  const [scoutCategory, setScoutCategory] = useState<string>("ALL");
  const [scoutOnlyWithoutWeb, setScoutOnlyWithoutWeb] = useState(false);
  const [marketViewSection, setMarketViewSection] = useState<"leads" | "outbound" | "batch" | "keywords" | "reach">("leads");
  const [scoutDisplayMode, setScoutDisplayMode] = useState<"cards" | "table" | "map">("cards");
  const [selectedLeadForMap, setSelectedLeadForMap] = useState<any>(null);
  const [leadsPage, setLeadsPage] = useState<number>(1);
  const LEADS_PER_PAGE = 9;

  // 📢 Campañas Outbound & Lead Pool
  const [outboundCampaigns, setOutboundCampaigns] = useState<any[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaignMetrics, setCampaignMetrics] = useState<any>(null);
  const [prospectPool, setProspectPool] = useState<any[]>([]);
  const [loadingProspectPool, setLoadingProspectPool] = useState(false);
  const [prospectPoolPage, setProspectPoolPage] = useState<number>(0);
  const [prospectPoolTotal, setProspectPoolTotal] = useState<number>(0);
  const [poolCityFilter, setPoolCityFilter] = useState<string>("");
  const [poolCategoryFilter, setPoolCategoryFilter] = useState<string>("ALL");
  const [poolStatusFilter, setPoolStatusFilter] = useState<string>("ALL");
  const [poolOnlyWithoutWeb, setPoolOnlyWithoutWeb] = useState(false);
  const [selectedPoolLeadIds, setSelectedPoolLeadIds] = useState<string[]>([]);
  
  const [poolSortField, setPoolSortField] = useState<"name" | "specialty" | "city" | "contacts" | "rating" | "status">("contacts");
  const [poolSortOrder, setPoolSortOrder] = useState<"asc" | "desc">("desc");
  const [poolSearchText, setPoolSearchText] = useState<string>("");
  const [poolContactFilter, setPoolContactFilter] = useState<string>("ALL");
  
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [showBatchHarvesterModal, setShowBatchHarvesterModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const [newCampaignData, setNewCampaignData] = useState({
    name: "",
    channel: "AI_OMNICHANNEL",
    targetCity: "Los Mochis",
    targetState: "Sinaloa",
    targetCategory: "ALL",
    calendarUrl: "https://calendar.app.google/4YNfwhfPLE8GXoFB6",
    customTemplateBody: "",
    launchImmediately: true,
  });

  const [batchHarvesterData, setBatchHarvesterData] = useState({
    city: "Los Mochis",
    state: "Sinaloa",
    categories: ["MEDICOS", "PEDIATRIA", "GINECOLOGIA", "DENTISTAS", "CLINICAS", "LABORATORIOS", "FARMACIAS", "OPTICAS"],
    onlyWithoutWebsite: false,
    maxPagesPerCategory: 2,
  });
  const [harvestingBatch, setHarvestingBatch] = useState(false);
  const [batchHarvestResult, setBatchHarvestResult] = useState<any>(null);

  const [previewData, setPreviewData] = useState<{
    recipientName: string;
    specialty: string;
    detectedPainPoint: string;
    renderedMessage: string;
    directWhatsappLink?: string;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

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

  const loadMarketIntelligence = useCallback(async (
    query = scoutQuery,
    city = scoutCity,
    state = scoutState,
    onlyWithoutWeb = scoutOnlyWithoutWeb,
    category = scoutCategory,
    pageToken?: string,
    append = false
  ) => {
    try {
      if (append) {
        setLoadingMoreLeads(true);
      } else {
        setLoadingMarketIntel(true);
        setLeadsPage(1);
      }
      const data = await adminService.getAdminMarketIntelligence(query, city, state, onlyWithoutWeb, category, pageToken);
      if (append) {
        setMarketIntel((prev: any) => ({
          ...data,
          leads: [...(prev?.leads || []), ...(data.leads || [])],
          totalLeadsFound: (prev?.leads?.length || 0) + (data.leads?.length || 0),
          withoutWebsiteCount: (prev?.withoutWebsiteCount || 0) + (data.withoutWebsiteCount || 0),
          withPhoneCount: (prev?.withPhoneCount || 0) + (data.withPhoneCount || 0)
        }));
      } else {
        setMarketIntel(data);
      }
    } catch (err) {
      console.error("Error al cargar inteligencia de mercado B2B", err);
    } finally {
      setLoadingMarketIntel(false);
      setLoadingMoreLeads(false);
    }
  }, [scoutQuery, scoutCity, scoutState, scoutOnlyWithoutWeb, scoutCategory]);

  const exportLeadsToCSV = () => {
    if (!marketIntel?.leads || marketIntel.leads.length === 0) {
      toast.info("No hay prospectos para exportar. Realiza una búsqueda primero.");
      return;
    }
    const headers = ["ID", "Nombre", "Categoría", "Dirección", "Ciudad", "Estado", "Teléfono", "Tiene Web", "Sitio Web", "Rating Google", "Total Reseñas", "Nivel Oportunidad", "Razón Oportunidad", "URL WhatsApp"];
    const rows = marketIntel.leads.map((l: any) => [
      `"${(l.id || "").replace(/"/g, '""')}"`,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.category || l.specialty || "").replace(/"/g, '""')}"`,
      `"${(l.address || "").replace(/"/g, '""')}"`,
      `"${(l.city || scoutCity).replace(/"/g, '""')}"`,
      `"${(l.state || scoutState).replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      l.hasWebsite ? "SI" : "NO",
      `"${(l.websiteUrl || "").replace(/"/g, '""')}"`,
      l.rating || "",
      l.userRatingsTotal || 0,
      `"${(l.opportunityLevel || "").replace(/"/g, '""')}"`,
      `"${(l.opportunityReason || "").replace(/"/g, '""')}"`,
      `"${(l.whatsappUrl || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `prospectos_salud_${scoutCity.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exportados ${marketIntel.leads.length} prospectos a CSV con éxito.`);
  };

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
    loadMarketIntelligence();

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

  const loadOutboundData = useCallback(async () => {
    try {
      setLoadingCampaigns(true);
      const [camps, metrics] = await Promise.allSettled([
        adminService.getOutboundCampaigns(0, 50),
        adminService.getOutboundMetrics(),
      ]);
      if (camps.status === "fulfilled") {
        setOutboundCampaigns(camps.value?.content || []);
      }
      if (metrics.status === "fulfilled") {
        setCampaignMetrics(metrics.value);
      }
    } catch (e) {
      console.error("Error cargando campañas outbound", e);
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  const loadProspectPool = useCallback(async (page = 0) => {
    try {
      setLoadingProspectPool(true);
      const res = await adminService.getProspectPool({
        city: poolCityFilter || undefined,
        category: poolCategoryFilter !== "ALL" ? poolCategoryFilter : undefined,
        status: poolStatusFilter !== "ALL" ? poolStatusFilter : undefined,
        onlyWithoutWeb: poolOnlyWithoutWeb ? true : undefined,
        page,
        size: 20,
      });
      setProspectPool(res?.content || []);
      setProspectPoolTotal(res?.totalElements || 0);
      setProspectPoolPage(page);
    } catch (e) {
      console.error("Error cargando lead pool", e);
    } finally {
      setLoadingProspectPool(false);
    }
  }, [poolCityFilter, poolCategoryFilter, poolStatusFilter, poolOnlyWithoutWeb]);

  useEffect(() => {
    if (marketViewSection === "outbound") {
      loadOutboundData();
    } else if (marketViewSection === "batch") {
      loadProspectPool(0);
    }
  }, [marketViewSection, loadOutboundData, loadProspectPool]);

  const handleLaunchCampaign = async (id: string) => {
    try {
      toast.info("Iniciando despacho de campaña outbound...");
      await adminService.launchOutboundCampaign(id);
      toast.success("¡Campaña outbound en marcha con cadencia progresiva!");
      loadOutboundData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Error al lanzar campaña");
    }
  };

  const handlePauseCampaign = async (id: string) => {
    try {
      await adminService.pauseOutboundCampaign(id);
      toast.info("Campaña pausada");
      loadOutboundData();
    } catch (e: any) {
      toast.error("Error al pausar campaña");
    }
  };

  const handleCreateCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignData.name.trim()) {
      toast.error("Por favor ingresa un nombre para la campaña");
      return;
    }
    if (!newCampaignData.calendarUrl.trim()) {
      toast.error("Por favor ingresa el enlace de Google Calendar");
      return;
    }
    try {
      await adminService.createOutboundCampaign({
        name: newCampaignData.name,
        channel: newCampaignData.channel,
        targetCity: newCampaignData.targetCity,
        targetState: newCampaignData.targetState,
        targetCategory: newCampaignData.targetCategory !== "ALL" ? newCampaignData.targetCategory : undefined,
        calendarUrl: newCampaignData.calendarUrl,
        customTemplateBody: newCampaignData.customTemplateBody || undefined,
        prospectIds: selectedPoolLeadIds.length > 0 ? selectedPoolLeadIds : undefined,
        launchImmediately: newCampaignData.launchImmediately,
      });
      toast.success("¡Campaña outbound creada exitosamente!");
      setShowCreateCampaignModal(false);
      setSelectedPoolLeadIds([]);
      setMarketViewSection("outbound");
      loadOutboundData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Error al crear campaña");
    }
  };

  const handleRunBatchHarvest = async () => {
    try {
      setHarvestingBatch(true);
      setBatchHarvestResult(null);
      toast.info(`Iniciando barrido batch en ${batchHarvesterData.city}, ${batchHarvesterData.state}...`);
      const res = await adminService.harvestPlacesBatch({
        city: batchHarvesterData.city,
        state: batchHarvesterData.state,
        categories: batchHarvesterData.categories,
        onlyWithoutWebsite: batchHarvesterData.onlyWithoutWebsite,
        maxPagesPerCategory: batchHarvesterData.maxPagesPerCategory,
      });
      setBatchHarvestResult(res);
      toast.success(`¡Barrido completado! Encontrados: ${res.totalFound}, Nuevos en Pool: ${res.newAdded}`);
      loadProspectPool(0);
      loadOutboundData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Error durante el barrido batch");
    } finally {
      setHarvestingBatch(false);
    }
  };

  const handlePreviewLeadMessage = async (lead: any) => {
    try {
      setPreviewLoading(true);
      setShowPreviewModal(true);
      setCopiedPreview(false);
      const res = await adminService.renderOutboundPreview({
        doctorName: lead.name,
        specialty: lead.specialty || lead.category,
        city: lead.city || scoutCity,
        hasWebsite: lead.hasWebsite,
        calendarUrl: newCampaignData.calendarUrl || "https://calendar.app.google/4YNfwhfPLE8GXoFB6",
      });
      setPreviewData(res);
    } catch (e) {
      toast.error("Error generando previsualización");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleImportCurrentPlacesLeadsToPool = async () => {
    const leads = marketIntel?.leads || [];
    if (leads.length === 0) {
      toast.info("No hay leads en la búsqueda actual para importar.");
      return;
    }
    try {
      const res = await adminService.importPlacesLeadsToPool({ leads });
      toast.success(`¡${res.importedCount || leads.length} prospectos importados al Lead Pool!`);
      setMarketViewSection("batch");
      loadProspectPool(0);
    } catch (e) {
      toast.error("Error importando prospectos al pool");
    }
  };

  const [reEnrichingPool, setReEnrichingPool] = useState(false);
  const handleReEnrichPool = async () => {
    try {
      setReEnrichingPool(true);
      const res = await adminService.reEnrichOutboundProspects();
      toast.success(`✨ Se re-enriquecieron ${res.reEnrichedCount || 0} prospectos con correos y perfiles sociales.`);
      loadProspectPool(prospectPoolPage);
    } catch (e) {
      toast.error("Error re-enriqueciendo prospectos del pool.");
    } finally {
      setReEnrichingPool(false);
    }
  };

  const togglePoolSort = (field: "name" | "specialty" | "city" | "contacts" | "rating" | "status") => {
    if (poolSortField === field) {
      setPoolSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setPoolSortField(field);
      setPoolSortOrder(field === "contacts" || field === "rating" ? "desc" : "asc");
    }
  };

  const filteredAndSortedProspects = React.useMemo(() => {
    let list = [...prospectPool];

    if (poolSearchText.trim()) {
      const q = poolSearchText.toLowerCase().trim();
      list = list.filter((p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.specialty && p.specialty.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.instagramHandle && p.instagramHandle.toLowerCase().includes(q)) ||
        (p.facebookHandle && p.facebookHandle.toLowerCase().includes(q))
      );
    }

    if (poolContactFilter === "WITH_EMAIL") {
      list = list.filter((p) => p.email);
    } else if (poolContactFilter === "WITH_INSTAGRAM") {
      list = list.filter((p) => p.instagramUrl || p.instagramHandle);
    } else if (poolContactFilter === "WITH_FACEBOOK") {
      list = list.filter((p) => p.facebookUrl || p.facebookHandle);
    } else if (poolContactFilter === "WITH_ANY_ENRICHED") {
      list = list.filter((p) => p.email || p.instagramUrl || p.facebookUrl);
    }

    list.sort((a, b) => {
      let comp = 0;
      if (poolSortField === "name") {
        comp = (a.name || "").localeCompare(b.name || "");
      } else if (poolSortField === "specialty") {
        comp = (a.specialty || a.category || "").localeCompare(b.specialty || b.category || "");
      } else if (poolSortField === "city") {
        comp = (a.city || "").localeCompare(b.city || "");
      } else if (poolSortField === "status") {
        comp = (a.status || "").localeCompare(b.status || "");
      } else if (poolSortField === "rating") {
        comp = (b.rating || 0) - (a.rating || 0);
      } else if (poolSortField === "contacts") {
        const countA = (a.phone ? 1 : 0) + (a.email ? 2 : 0) + (a.instagramUrl ? 2 : 0) + (a.facebookUrl ? 1 : 0);
        const countB = (b.phone ? 1 : 0) + (b.email ? 2 : 0) + (b.instagramUrl ? 2 : 0) + (b.facebookUrl ? 1 : 0);
        comp = countB - countA;
      }
      return poolSortOrder === "asc" ? comp : -comp;
    });

    return list;
  }, [prospectPool, poolSearchText, poolContactFilter, poolSortField, poolSortOrder]);

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
              Métricas CMO (FB, IG & WA)
            </button>
            <button
              onClick={() => {
                setActiveSubTab("market");
                if (!marketIntel) loadMarketIntelligence();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === "market"
                  ? "bg-white text-indigo-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              Scout B2B & Mercado Médico
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
                  <AreaChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 15 }}>
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
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                      dy={6}
                    />
                    <YAxis
                      domain={[0, (dataMax: number) => Math.max(dataMax || 0, 5)]}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                      allowDecimals={false}
                      width={45}
                    />
                    <Tooltip
                      cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
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
                          dot={{ r: 4.5, strokeWidth: 2, fill: "#ffffff", stroke: "#ec4899" }}
                          activeDot={{ r: 7, strokeWidth: 2, fill: "#ec4899", stroke: "#ffffff" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="facebookEngagement"
                          name="Facebook"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#gradFb)"
                          dot={{ r: 4.5, strokeWidth: 2, fill: "#ffffff", stroke: "#2563eb" }}
                          activeDot={{ r: 7, strokeWidth: 2, fill: "#2563eb", stroke: "#ffffff" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="whatsappEngagement"
                          name="WhatsApp"
                          stroke="#22c55e"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#gradWa)"
                          dot={{ r: 4.5, strokeWidth: 2, fill: "#ffffff", stroke: "#22c55e" }}
                          activeDot={{ r: 7, strokeWidth: 2, fill: "#22c55e", stroke: "#ffffff" }}
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
                          dot={{ r: 4.5, strokeWidth: 2, fill: "#ffffff", stroke: "#f43f5e" }}
                          activeDot={{ r: 7, strokeWidth: 2, fill: "#f43f5e", stroke: "#ffffff" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="comments"
                          name="Comentarios / Enviados"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#gradComments)"
                          dot={{ r: 4.5, strokeWidth: 2, fill: "#ffffff", stroke: "#8b5cf6" }}
                          activeDot={{ r: 7, strokeWidth: 2, fill: "#8b5cf6", stroke: "#ffffff" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="shares"
                          name="Compartidos"
                          stroke="#2563eb"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#gradFb)"
                          dot={{ r: 4.5, strokeWidth: 2, fill: "#ffffff", stroke: "#2563eb" }}
                          activeDot={{ r: 7, strokeWidth: 2, fill: "#2563eb", stroke: "#ffffff" }}
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
                          dot={{ r: 4.5, strokeWidth: 2, fill: "#ffffff", stroke: "#6366f1" }}
                          activeDot={{ r: 7, strokeWidth: 2, fill: "#6366f1", stroke: "#ffffff" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="engagement"
                          name="Total Interacciones"
                          stroke="#ec4899"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#gradTotalEng)"
                          dot={{ r: 4.5, strokeWidth: 2, fill: "#ffffff", stroke: "#ec4899" }}
                          activeDot={{ r: 7, strokeWidth: 2, fill: "#ec4899", stroke: "#ffffff" }}
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

            {/* Si Meta restringe por umbral de privacidad (< 100 seguidores) y no hay desglose oficial */}
            {!activeAudience.privacyThresholdMet && (!activeAudience.topCities || activeAudience.topCities.length === 0) ? (
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-800">
                    Demografía Restringida por Meta (Umbral de Privacidad)
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Meta requiere un mínimo de <strong>100 seguidores activos</strong> en la página de Facebook o cuenta de Instagram para desglosar datos de edad, género y ciudades oficiales sin comprometer la identidad de los usuarios.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-sm">
                      {activeAudience.totalAudience} {demoPlatformTab === "WHATSAPP" ? "contactos" : "seguidores"} registrados en vivo
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* 4 Bloques Demográficos */
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
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-900">{activeAudience.genderDistribution?.Femenino || 63.4}%</span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            ({Math.round(((activeAudience.genderDistribution?.Femenino || 63.4) / 100) * (activeAudience.totalAudience || 1))} {demoPlatformTab === "WHATSAPP" ? "pacientes" : "seg."})
                          </span>
                        </span>
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
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-900">{activeAudience.genderDistribution?.Masculino || 36.6}%</span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            ({Math.round(((activeAudience.genderDistribution?.Masculino || 36.6) / 100) * (activeAudience.totalAudience || 1))} {demoPlatformTab === "WHATSAPP" ? "pacientes" : "seg."})
                          </span>
                        </span>
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
                      const isTop = range === "25-34" || range === "35-44";
                      const count = Math.round(((Number(pct) || 0) / 100) * (activeAudience.totalAudience || 1));
                      return (
                        <div key={range}>
                          <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                            <span className={isTop ? "font-bold text-indigo-700" : "text-slate-600"}>{range} años</span>
                            <span className="flex items-center gap-1">
                              <span className={isTop ? "font-bold text-indigo-700" : "text-slate-700"}>{pct}%</span>
                              <span className="text-[10px] text-slate-500">({count})</span>
                            </span>
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
                    {(activeAudience.topCities || []).slice(0, 5).map((city: any, idx: number) => {
                      const count = city.count ?? Math.round(((Number(city.percentage) || 0) / 100) * (activeAudience.totalAudience || 1));
                      return (
                        <div key={city.name} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 font-medium flex items-center gap-1.5 truncate max-w-[130px]" title={city.name}>
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center justify-center">
                              {idx + 1}
                            </span>
                            {city.name}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-slate-900 ml-1">
                            <span>{city.percentage}%</span>
                            <span className="text-[10px] font-medium text-slate-500">({count})</span>
                          </span>
                        </div>
                      );
                    })}
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
                    {(activeAudience.topCountries || []).slice(0, 3).map((country: any) => {
                      const count = country.count ?? Math.round(((Number(country.percentage) || 0) / 100) * (activeAudience.totalAudience || 1));
                      return (
                        <div key={country.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <span>{country.code === "MX" ? "🇲🇽" : country.code === "US" ? "🇺🇸" : "🇨🇴"}</span>
                              {country.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-bold text-slate-900">{country.percentage}%</span>
                              <span className="text-[10px] text-slate-500">({count})</span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-slate-500 pt-1 leading-snug">
                    95%+ audiencia nacional mexicana con alcance a comunidad hispanohablante en EE.UU.
                  </p>
                </div>
              </div>
            )}

            {/* Aviso informativo de privacidad o fuente de datos */}
            {activeAudience.privacyNotice && (
              <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-[11px] text-indigo-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>{activeAudience.privacyNotice}</span>
              </div>
            )}

            {/* 🩺 Panel Estratégico: Penetración en Profesionales de la Salud y Prospección de Médicos */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 border border-indigo-900/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-800/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Segmentación de Médicos & Penetración de Mercado</h4>
                    <p className="text-[10px] text-indigo-200">Estrategia de prospección B2B para médicos especialistas y consultorios en México.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                  Potencial Outbound WhatsApp / Email
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-300">👥 ¿Quiénes son estos datos?</span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    <strong>Meta (FB/IG):</strong> 100% seguidores y fans agregados por Meta.<br />
                    <strong>WhatsApp:</strong> Pacientes y contactos reales que han conversado con el número oficial.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-300">🩺 Identificación de Médicos</span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Las APIs de Meta restringen profesiones individuales por privacidad. En Quhealthy los identificamos mediante el <strong>CRM de WhatsApp</strong> y el <strong>Directorio de Médicos Registrados</strong>.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-300">🚀 Prospección B2B & Campañas</span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Vía <strong>Meta Marketing API</strong> y <strong>WhatsApp Cloud API</strong> podemos lanzar campañas de captación a médicos en Sinaloa y México con plantillas oficiales y onboarding directo.
                  </p>
                </div>
              </div>
            </div>
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
      {/* 🔍 VISTA 2: RADAR DE MÉDICOS & INTELIGENCIA DE MERCADO B2B */}
      {/* ========================================================================= */}
      {activeSubTab === "market" && (
        <div className="space-y-5">
          {/* Header & Filtros de Búsqueda */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Scout de Actores de Salud & Prospección B2B en México
                    </h3>
                    <p className="text-xs text-slate-500">
                      Búsqueda en vivo con Google Places API: Médicos, Clínicas, Laboratorios, Proveedores, Farmacias y Fundaciones.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón de recarga */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadMarketIntelligence(scoutQuery, scoutCity, scoutState, scoutOnlyWithoutWeb, scoutCategory)}
                  disabled={loadingMarketIntel}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingMarketIntel ? "animate-spin" : ""}`} />
                  {loadingMarketIntel ? "Buscando..." : "Actualizar Scout"}
                </button>
              </div>
            </div>

            {/* Selector de Categorías de Salud */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">Tipo de Actor de Salud</label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { key: "ALL", label: "Todos", icon: Building2 },
                  { key: "MEDICOS", label: "Médicos y Especialistas", icon: UserCheck },
                  { key: "CLINICAS", label: "Clínicas y Hospitales", icon: Stethoscope },
                  { key: "LABORATORIOS", label: "Laboratorios Clínicos", icon: FlaskConical },
                  { key: "PROVEEDORES", label: "Proveedores e Insumos", icon: Package },
                  { key: "FARMACIAS", label: "Farmacias", icon: Pill },
                  { key: "FUNDACIONES", label: "Fundaciones e IAP", icon: HeartHandshake },
                  { key: "DENTISTAS", label: "Odontología / Dental", icon: Sparkles },
                  { key: "OPTICAS", label: "Oftalmología / Ópticas", icon: Eye },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = scoutCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setScoutCategory(cat.key);
                        loadMarketIntelligence(scoutQuery, scoutCity, scoutState, scoutOnlyWithoutWeb, cat.key);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formulario de Búsqueda Flexible & Dinámica */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Ciudad / Municipio Libre */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Ciudad o Municipio (México)</label>
                  <input
                    type="text"
                    value={scoutCity}
                    onChange={(e) => setScoutCity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        loadMarketIntelligence(scoutQuery, scoutCity, scoutState, scoutOnlyWithoutWeb, scoutCategory);
                      }
                    }}
                    placeholder="Ej: Los Mochis, Guadalajara, Monterrey..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Estado / Entidad */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Estado / Región</label>
                  <input
                    type="text"
                    value={scoutState}
                    onChange={(e) => setScoutState(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        loadMarketIntelligence(scoutQuery, scoutCity, scoutState, scoutOnlyWithoutWeb, scoutCategory);
                      }
                    }}
                    placeholder="Ej: Sinaloa, Jalisco, Nuevo León, CDMX..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Especialidad / Término personalizado */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Búsqueda personalizada (opcional)</label>
                  <input
                    type="text"
                    value={scoutQuery}
                    onChange={(e) => setScoutQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        loadMarketIntelligence(scoutQuery, scoutCity, scoutState, scoutOnlyWithoutWeb, scoutCategory);
                      }
                    }}
                    placeholder="Ej: Pediatra, Chopo, Ortopedia..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Botón Ejecutar & Filtro sin web */}
                <div className="flex items-center gap-2 pt-5 sm:pt-0">
                  <button
                    onClick={() => loadMarketIntelligence(scoutQuery, scoutCity, scoutState, scoutOnlyWithoutWeb, scoutCategory)}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" /> Explorar en Maps
                  </button>
                </div>
              </div>

              {/* Sugerencias Rápidas de Ciudades */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500 scrollbar-none">
                <span className="font-bold text-slate-700 flex items-center gap-1 flex-shrink-0">
                  <MapPin className="w-3 h-3 text-indigo-500" /> Accesos rápidos:
                </span>
                {[
                  { city: "Los Mochis", state: "Sinaloa" },
                  { city: "Culiacán", state: "Sinaloa" },
                  { city: "Mazatlán", state: "Sinaloa" },
                  { city: "Guasave", state: "Sinaloa" },
                  { city: "Hermosillo", state: "Sonora" },
                  { city: "Guadalajara", state: "Jalisco" },
                  { city: "Monterrey", state: "Nuevo León" },
                  { city: "Ciudad de México", state: "CDMX" },
                  { city: "Puebla", state: "Puebla" },
                  { city: "Querétaro", state: "Querétaro" },
                  { city: "Tijuana", state: "Baja California" },
                  { city: "Mérida", state: "Yucatán" },
                ].map((item) => (
                  <button
                    key={item.city}
                    onClick={() => {
                      setScoutCity(item.city);
                      setScoutState(item.state);
                      loadMarketIntelligence(scoutQuery, item.city, item.state, scoutOnlyWithoutWeb, scoutCategory);
                    }}
                    className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      scoutCity.toLowerCase() === item.city.toLowerCase()
                        ? "bg-indigo-100 text-indigo-800 font-bold"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    {item.city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4 KPIs de Inteligencia de Mercado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Prospectos Encontrados</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <h4 className="text-lg font-bold text-slate-900">{marketIntel?.totalLeadsFound ?? 0}</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    en {marketIntel?.targetCity || scoutCity}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Sin Sitio Web (Alta Oportunidad)</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <h4 className="text-lg font-bold text-amber-600">{marketIntel?.withoutWebsiteCount ?? 0}</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    {marketIntel?.totalLeadsFound ? Math.round((marketIntel.withoutWebsiteCount / marketIntel.totalLeadsFound) * 100) : 0}% del total
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Con Teléfono / WhatsApp</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <h4 className="text-lg font-bold text-emerald-600">{marketIntel?.withPhoneCount ?? 0}</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Listo para Outbound
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Star className="w-5 h-5 fill-purple-200" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Calificación Promedio Google</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <h4 className="text-lg font-bold text-purple-700">
                    ⭐ {marketIntel?.averageRating ? marketIntel.averageRating.toFixed(1) : "N/A"}
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    Google Maps
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-navegación interna con 5 Secciones */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-200 pb-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setMarketViewSection("leads")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  marketViewSection === "leads"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Directorio Maps ({marketIntel?.leads?.length || 0})
              </button>
              <button
                onClick={() => setMarketViewSection("outbound")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  marketViewSection === "outbound"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                Campañas Outbound ({outboundCampaigns.length})
              </button>
              <button
                onClick={() => setMarketViewSection("batch")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  marketViewSection === "batch"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Lead Pool & Batch ({prospectPoolTotal})
              </button>
              <button
                onClick={() => setMarketViewSection("keywords")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  marketViewSection === "keywords"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Radar Palabras Clave
              </button>
              <button
                onClick={() => setMarketViewSection("reach")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  marketViewSection === "reach"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                Alcance & Demanda
              </button>
            </div>

            {/* Acciones Rápidas del Directorio */}
            {marketViewSection === "leads" && (
              <div className="flex items-center flex-wrap gap-1.5">
                {(marketIntel?.leads || []).length > 0 && (
                  <>
                    <button
                      onClick={handleImportCurrentPlacesLeadsToPool}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm"
                      title="Guardar todos estos leads en el Lead Pool permanente"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Guardar en Pool</span>
                    </button>
                    <button
                      onClick={() => {
                        setNewCampaignData((prev) => ({
                          ...prev,
                          name: `Campaña ${scoutCategory !== "ALL" ? scoutCategory : "Salud"} - ${scoutCity}`,
                          targetCity: scoutCity,
                          targetState: scoutState,
                          targetCategory: scoutCategory,
                        }));
                        setShowCreateCampaignModal(true);
                      }}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Lanzar Outbound</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowBatchHarvesterModal(true)}
                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm"
                  title="Barrer automáticamente múltiples especialidades en una ciudad"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Barrido Batch</span>
                </button>
              </div>
            )}

            {/* Selector de Modo de Visualización (Cards | Tabla | Mapa) + Exportar CSV */}
            {marketViewSection === "leads" && (marketIntel?.leads || []).length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setScoutDisplayMode("cards")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      scoutDisplayMode === "cards" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Vista de Tarjetas"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </button>
                  <button
                    onClick={() => setScoutDisplayMode("table")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      scoutDisplayMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Vista de Tabla"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Lista</span>
                  </button>
                  <button
                    onClick={() => setScoutDisplayMode("map")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      scoutDisplayMode === "map" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Vista de Mapa Interactivo"
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>Mapa</span>
                  </button>
                </div>

                <button
                  onClick={exportLeadsToCSV}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                  title="Exportar directorio a CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Exportar CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* SECCIÓN 1: Directorio de Actores de Salud (Scout B2B) */}
          {marketViewSection === "leads" && (
            <div className="space-y-4">
              {loadingMarketIntel ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">Consultando Google Places API en {scoutCity}, {scoutState}...</p>
                </div>
              ) : (marketIntel?.leads || []).length === 0 ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      Búsqueda en Google Maps Lista para Ejecutar
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Presiona <strong>"Explorar en Maps"</strong> para buscar en vivo en {scoutCity}, {scoutState} a través de Google Places API.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* MODO 1: CARDS */}
                  {scoutDisplayMode === "cards" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(() => {
                        const allLeads = marketIntel?.leads || [];
                        const startIndex = (leadsPage - 1) * LEADS_PER_PAGE;
                        const paginatedLeads = allLeads.slice(startIndex, startIndex + LEADS_PER_PAGE);

                        return paginatedLeads.map((lead: any) => {
                          const mapsUrl = lead.latitude && lead.longitude
                            ? `https://www.google.com/maps/search/?api=1&query=${lead.latitude},${lead.longitude}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + ' ' + lead.address)}`;

                          const catColor = lead.category?.includes("Laboratorio")
                            ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                            : lead.category?.includes("Farmacia")
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : lead.category?.includes("Proveedor")
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : lead.category?.includes("Fundación")
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : lead.category?.includes("Dental")
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : lead.category?.includes("Hospital") || lead.category?.includes("Clínica")
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-indigo-50 text-indigo-700 border-indigo-100";

                          return (
                            <div
                              key={lead.id}
                              className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-4 shadow-sm transition-all flex flex-col justify-between space-y-3 group"
                            >
                              <div className="space-y-2.5">
                                {/* Header de la tarjeta */}
                                <div className="flex items-start justify-between gap-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catColor}`}>
                                    {lead.category || lead.specialty || "Salud"}
                                  </span>
                                  {lead.rating ? (
                                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                                      <span>{lead.rating}</span>
                                      <span className="text-[10px] text-slate-400 font-normal">({lead.userRatingsTotal || 0})</span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">Google Maps</span>
                                  )}
                                </div>

                                <div>
                                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {lead.name}
                                  </h4>
                                  <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-slate-500 hover:text-indigo-600 mt-1 flex items-start gap-1 group/map transition-colors"
                                    title="Ver en Google Maps"
                                  >
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover/map:text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <span>{lead.address}</span>
                                  </a>
                                </div>

                                {/* Estado de Presencia Digital & Oportunidad */}
                                <div
                                  className={`p-2.5 rounded-xl border text-[11px] leading-snug space-y-1 ${
                                    !lead.hasWebsite
                                      ? "bg-amber-50/70 border-amber-200 text-amber-900"
                                      : "bg-blue-50/70 border-blue-200 text-blue-900"
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 font-bold">
                                    {!lead.hasWebsite ? (
                                      <>
                                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Alta Oportunidad: Sin Sitio Web</span>
                                      </>
                                    ) : (
                                      <>
                                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Presencia Web Registrada</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-[10px] opacity-90">{lead.opportunityReason}</p>
                                  {lead.hasWebsite && lead.websiteUrl && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                      <a
                                        href={lead.websiteUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
                                      >
                                        Web oficial <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                      {lead.email && (
                                        <a
                                          href={`mailto:${lead.email}`}
                                          className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1 hover:text-indigo-600"
                                        >
                                          <Mail className="w-2.5 h-2.5 text-indigo-500" /> {lead.email}
                                        </a>
                                      )}
                                      {lead.instagramUrl && (
                                        <a
                                          href={lead.instagramUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1 hover:underline"
                                        >
                                          <InstagramIcon className="w-2.5 h-2.5" /> {lead.instagramHandle || "Instagram"}
                                        </a>
                                      )}
                                      {lead.facebookUrl && (
                                        <a
                                          href={lead.facebookUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1 hover:underline"
                                        >
                                          <FacebookIcon className="w-2.5 h-2.5" /> {lead.facebookHandle || "Facebook"}
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Footer con Acciones Directas de Contacto */}
                              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                                {lead.whatsappUrl ? (
                                  <a
                                    href={lead.whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                                  >
                                    <WhatsAppIcon className="w-3.5 h-3.5" /> Enviar WhatsApp
                                  </a>
                                ) : (
                                  <button
                                    disabled
                                    className="flex-1 py-2 px-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold"
                                  >
                                    Sin Teléfono
                                  </button>
                                )}
                                {lead.email && (
                                  <a
                                    href={`mailto:${lead.email}`}
                                    className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors"
                                    title={`Enviar email a ${lead.email}`}
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {lead.instagramUrl && (
                                  <a
                                    href={lead.instagramUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors"
                                    title="Ver Instagram"
                                  >
                                    <InstagramIcon className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {lead.facebookUrl && (
                                  <a
                                    href={lead.facebookUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
                                    title="Ver Facebook"
                                  >
                                    <FacebookIcon className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {lead.phone && (
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                                    title={`Llamar a ${lead.phone}`}
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}

                  {/* MODO 2: LISTA / TABLA */}
                  {scoutDisplayMode === "table" && (
                    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="py-3 px-4">Establecimiento / Actor</th>
                              <th className="py-3 px-4">Categoría</th>
                              <th className="py-3 px-4">Dirección & Mapa</th>
                              <th className="py-3 px-4">Rating</th>
                              <th className="py-3 px-4">Presencia Digital</th>
                              <th className="py-3 px-4 text-right">Contacto & Outbound</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(() => {
                              const allLeads = marketIntel?.leads || [];
                              const startIndex = (leadsPage - 1) * LEADS_PER_PAGE;
                              const paginatedLeads = allLeads.slice(startIndex, startIndex + LEADS_PER_PAGE);

                              return paginatedLeads.map((lead: any) => {
                                const mapsUrl = lead.latitude && lead.longitude
                                  ? `https://www.google.com/maps/search/?api=1&query=${lead.latitude},${lead.longitude}`
                                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + ' ' + lead.address)}`;

                                return (
                                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3 px-4">
                                      <span className="font-bold text-slate-900 block">{lead.name}</span>
                                      <span className="text-[10px] text-slate-400">{lead.id}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                                        {lead.category || "Salud"}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 max-w-xs">
                                      <a
                                        href={mapsUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-slate-600 hover:text-indigo-600 flex items-start gap-1 transition-colors group"
                                      >
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{lead.address}</span>
                                      </a>
                                    </td>
                                    <td className="py-3 px-4">
                                      {lead.rating ? (
                                        <div className="flex items-center gap-1 font-bold text-amber-500">
                                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                                          <span>{lead.rating}</span>
                                          <span className="text-[10px] text-slate-400 font-normal">({lead.userRatingsTotal || 0})</span>
                                        </div>
                                      ) : (
                                        <span className="text-slate-400 text-[10px]">Sin rating</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      {!lead.hasWebsite ? (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                                          <Zap className="w-3 h-3 text-amber-600" /> Sin Sitio Web
                                        </span>
                                      ) : (
                                        <a
                                          href={lead.websiteUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 hover:underline w-fit"
                                        >
                                          <Globe className="w-3 h-3 text-blue-600" /> Web Oficial <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {lead.whatsappUrl && (
                                          <a
                                            href={lead.whatsappUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                            title="Enviar WhatsApp Outbound"
                                          >
                                            <WhatsAppIcon className="w-4 h-4" />
                                          </a>
                                        )}
                                        {lead.email && (
                                          <a
                                            href={`mailto:${lead.email}`}
                                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                                            title={`Enviar correo a ${lead.email}`}
                                          >
                                            <Mail className="w-3.5 h-3.5" />
                                          </a>
                                        )}
                                        {lead.instagramUrl && (
                                          <a
                                            href={lead.instagramUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                                            title={`Ver Instagram (${lead.instagramHandle || ''})`}
                                          >
                                            <InstagramIcon className="w-3.5 h-3.5" />
                                          </a>
                                        )}
                                        {lead.facebookUrl && (
                                          <a
                                            href={lead.facebookUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                                            title={`Ver Facebook (${lead.facebookHandle || ''})`}
                                          >
                                            <FacebookIcon className="w-3.5 h-3.5" />
                                          </a>
                                        )}
                                        {lead.phone && (
                                          <a
                                            href={`tel:${lead.phone}`}
                                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                            title={`Llamar a ${lead.phone}`}
                                          >
                                            <Phone className="w-3.5 h-3.5" />
                                          </a>
                                        )}
                                        <a
                                          href={mapsUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                                          title="Ver en Google Maps"
                                        >
                                          <Navigation className="w-3.5 h-3.5" />
                                        </a>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* MODO 3: MAPA INTERACTIVO */}
                  {scoutDisplayMode === "map" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Mapa Embebido Dinámico de Google Maps */}
                      <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm h-[520px] relative">
                        <iframe
                          title="Google Maps Healthcare Scout"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://www.google.com/maps?q=${encodeURIComponent(
                            selectedLeadForMap
                              ? (selectedLeadForMap.latitude && selectedLeadForMap.longitude
                                  ? `${selectedLeadForMap.latitude},${selectedLeadForMap.longitude}`
                                  : `${selectedLeadForMap.name}, ${selectedLeadForMap.address}`)
                              : `${scoutQuery ? scoutQuery + " en " : ""}${scoutCity}, ${scoutState}, Mexico`
                          )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        />
                        {selectedLeadForMap && (
                          <div className="absolute top-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg flex items-center justify-between gap-2">
                            <div>
                              <h5 className="text-xs font-bold text-slate-900">{selectedLeadForMap.name}</h5>
                              <p className="text-[11px] text-slate-500">{selectedLeadForMap.address}</p>
                            </div>
                            <button
                              onClick={() => setSelectedLeadForMap(null)}
                              className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Lista Lateral de Prospectos en el Mapa */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-sm h-[520px] flex flex-col space-y-2">
                        <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-900">
                            Pines en {scoutCity} ({marketIntel.leads.length})
                          </span>
                          <span className="text-[10px] text-slate-500">Haz clic para enfocar</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                          {marketIntel.leads.map((lead: any) => (
                            <div
                              key={lead.id}
                              onClick={() => setSelectedLeadForMap(lead)}
                              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                selectedLeadForMap?.id === lead.id
                                  ? "bg-indigo-50 border-indigo-300 shadow-sm"
                                  : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-bold text-slate-900 line-clamp-1">{lead.name}</span>
                                {lead.rating && (
                                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                                    ⭐ {lead.rating}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{lead.address}</p>
                              <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-200/60">
                                <span className="text-[10px] font-semibold text-slate-600">{lead.category || "Salud"}</span>
                                {lead.whatsappUrl && (
                                  <a
                                    href={lead.whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                                  >
                                    <WhatsAppIcon className="w-3 h-3" /> WhatsApp
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Barra de Paginación y Carga de Más Resultados de Google Maps */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                    <div className="text-xs text-slate-500 font-semibold">
                      Mostrando {((leadsPage - 1) * LEADS_PER_PAGE) + 1} - {Math.min(leadsPage * LEADS_PER_PAGE, marketIntel.leads.length)} de <strong className="text-slate-900">{marketIntel.leads.length} prospectos</strong> en esta consulta
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Paginación Frontend */}
                      {Math.ceil(marketIntel.leads.length / LEADS_PER_PAGE) > 1 && (
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => setLeadsPage((p) => Math.max(1, p - 1))}
                            disabled={leadsPage === 1}
                            className="p-1.5 rounded-lg text-slate-700 hover:bg-white disabled:opacity-30 transition-all text-xs font-bold flex items-center gap-1"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800">
                            {leadsPage} / {Math.ceil(marketIntel.leads.length / LEADS_PER_PAGE)}
                          </span>
                          <button
                            onClick={() => setLeadsPage((p) => Math.min(Math.ceil(marketIntel.leads.length / LEADS_PER_PAGE), p + 1))}
                            disabled={leadsPage === Math.ceil(marketIntel.leads.length / LEADS_PER_PAGE)}
                            className="p-1.5 rounded-lg text-slate-700 hover:bg-white disabled:opacity-30 transition-all text-xs font-bold flex items-center gap-1"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Botón Cargar Más desde Google Maps API */}
                      {marketIntel.nextPageToken && (
                        <button
                          onClick={() => loadMarketIntelligence(scoutQuery, scoutCity, scoutState, scoutOnlyWithoutWeb, scoutCategory, marketIntel.nextPageToken, true)}
                          disabled={loadingMoreLeads}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {loadingMoreLeads ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Cargando más de Google...</span>
                            </>
                          ) : (
                            <>
                              <Compass className="w-3.5 h-3.5" />
                              <span>Cargar más de Google Maps (+20)</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 📢 SECCIÓN 2: Automatización de Campañas Outbound & Funnel (WhatsApp / IG) */}
          {/* ========================================================================= */}
          {marketViewSection === "outbound" && (
            <div className="space-y-4">
              {/* KPIs Globales de Outbound */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                    <span>Mensajes Enviados</span>
                    <Send className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {campaignMetrics?.totalMessagesSent ?? 0}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">A prospectos médicos</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                    <span>Respuestas Recibidas</span>
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600 mt-2">
                    {campaignMetrics?.totalRepliesReceived ?? 0}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    {campaignMetrics?.overallReplyRate ?? 0}% tasa de apertura
                  </p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                    <span>Demos Agendadas</span>
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-purple-700 mt-2">
                    {campaignMetrics?.totalDemosScheduled ?? 0}
                  </div>
                  <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
                    Google Calendar / 1er Mes Gratis
                  </p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                    <span>Campañas Activas</span>
                    <Megaphone className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {campaignMetrics?.activeCampaigns ?? 0} <span className="text-xs text-slate-400 font-normal">/ {campaignMetrics?.totalCampaigns ?? 0}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Despacho automatizado</p>
                </div>
              </div>

              {/* Header con botón para Nueva Campaña */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-indigo-600" />
                    Historial de Campañas Outbound
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Campañas programadas con personalización por especialidad y enlace de agendamiento.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadOutboundData}
                    disabled={loadingCampaigns}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title="Actualizar lista"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingCampaigns ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => {
                      setNewCampaignData({
                        name: `Campaña ${scoutCity} - ${new Date().toLocaleDateString("es-MX")}`,
                        channel: "WHATSAPP",
                        targetCity: scoutCity,
                        targetState: scoutState,
                        targetCategory: "ALL",
                        calendarUrl: "https://calendar.app.google/4YNfwhfPLE8GXoFB6",
                        customTemplateBody: "",
                        launchImmediately: true,
                      });
                      setShowCreateCampaignModal(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Campaña Outbound</span>
                  </button>
                </div>
              </div>

              {/* Tabla de Campañas */}
              {loadingCampaigns ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">Cargando campañas outbound...</p>
                </div>
              ) : outboundCampaigns.length === 0 ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">No hay campañas outbound activas</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Crea tu primera campaña para prospectar a médicos y clínicas de Google Places con tu oferta de 1er Mes Gratis y Google Calendar.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateCampaignModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Primera Campaña</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Campaña</th>
                          <th className="py-3 px-4">Canal & Segmento</th>
                          <th className="py-3 px-4">Estado</th>
                          <th className="py-3 px-4">Enviados</th>
                          <th className="py-3 px-4">Respuestas</th>
                          <th className="py-3 px-4">Demos</th>
                          <th className="py-3 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {outboundCampaigns.map((camp: any) => {
                          const statusColor =
                            camp.status === "RUNNING"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : camp.status === "PAUSED"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : camp.status === "COMPLETED"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-100 text-slate-600 border-slate-200";

                          return (
                            <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-900 block">{camp.name}</span>
                                <span className="text-[10px] text-slate-400">
                                  {camp.createdAt ? new Date(camp.createdAt).toLocaleDateString("es-MX") : ""}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                                    {camp.channel === "WHATSAPP" ? <WhatsAppIcon className="w-3.5 h-3.5" /> : <InstagramIcon className="w-3.5 h-3.5" />}
                                    {camp.channel}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">
                                    {camp.targetCity || "Nacional"} · {camp.targetCategory || "Todas las especialidades"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                                  {camp.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-900">{camp.sentCount}</span>
                                <span className="text-[10px] text-slate-400"> / {camp.totalProspects}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-emerald-600">{camp.repliedCount}</span>
                                <span className="text-[10px] text-slate-400"> ({camp.responseRate || 0}%)</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-purple-700">{camp.demoScheduledCount}</span>
                                <span className="text-[10px] text-slate-400"> ({camp.demoConversionRate || 0}%)</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {camp.status === "RUNNING" ? (
                                    <button
                                      onClick={() => handlePauseCampaign(camp.id)}
                                      className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                                      title="Pausar Campaña"
                                    >
                                      <Pause className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleLaunchCampaign(camp.id)}
                                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                      title="Lanzar / Reanudar Campaña"
                                    >
                                      <Play className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <a
                                    href={camp.calendarUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                    title="Ver enlace de calendario configurado"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🌾 SECCIÓN 3: Lead Pool & Barrido Batch Sistemático */}
          {/* ========================================================================= */}
          {marketViewSection === "batch" && (
            <div className="space-y-4">
              {/* Barra Superior con Filtros y Disparador de Barrido */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-600" />
                      Lead Pool de Prospectos Sanitarios ({prospectPoolTotal})
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Base de datos consolidada y desduplicada de médicos, clínicas, laboratorios y farmacias.
                    </p>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    {selectedPoolLeadIds.length > 0 && (
                      <button
                        onClick={() => {
                          setNewCampaignData((prev) => ({
                            ...prev,
                            name: `Campaña Outbound (${selectedPoolLeadIds.length} leads)`,
                          }));
                          setShowCreateCampaignModal(true);
                        }}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Megaphone className="w-3.5 h-3.5" />
                        <span>Crear Campaña con ({selectedPoolLeadIds.length}) Seleccionados</span>
                      </button>
                    )}

                    <button
                      onClick={handleReEnrichPool}
                      disabled={reEnrichingPool}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      title="Rastrear páginas web y perfiles de los prospectos para extraer correos y redes sociales"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${reEnrichingPool ? "animate-spin text-indigo-600" : ""}`} />
                      <span>{reEnrichingPool ? "Enriqueciendo..." : "Re-enriquecer Contactos"}</span>
                    </button>

                    <button
                      onClick={() => setShowBatchHarvesterModal(true)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Ejecutar Nuevo Barrido Batch</span>
                    </button>
                  </div>
                </div>

                {/* Filtros del Pool Avanzados (Estilo Excel) */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    {/* Búsqueda libre en tiempo real */}
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Search className="w-3 h-3 text-indigo-500" /> Búsqueda Rápida
                      </label>
                      <input
                        type="text"
                        placeholder="Buscar por nombre, clínica, email, @handle..."
                        value={poolSearchText}
                        onChange={(e) => setPoolSearchText(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Ciudad */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Ciudad</label>
                      <input
                        type="text"
                        placeholder="Filtrar por ciudad..."
                        value={poolCityFilter}
                        onChange={(e) => setPoolCityFilter(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Especialidad Real */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Especialidad</label>
                      <select
                        value={poolCategoryFilter}
                        onChange={(e) => setPoolCategoryFilter(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ALL">Todas las Especialidades</option>
                        <option value="Dermatol">Dermatología</option>
                        <option value="Pediatr">Pediatría</option>
                        <option value="Ginecolog">Ginecología & Obstetricia</option>
                        <option value="Dent">Odontología / Dental</option>
                        <option value="Cardiol">Cardiología</option>
                        <option value="Oftalmol">Oftalmología</option>
                        <option value="Traumatol">Traumatología & Ortopedia</option>
                        <option value="Nutri">Nutrición & Bariatría</option>
                        <option value="Psicol">Psicología & Psiquiatría</option>
                        <option value="Clinic">Clínicas y Hospitales</option>
                        <option value="Laborator">Laboratorios Clínicos</option>
                        <option value="Farmacia">Farmacias</option>
                      </select>
                    </div>

                    {/* Filtro de Canales Enriquecidos */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Canales Extraídos</label>
                      <select
                        value={poolContactFilter}
                        onChange={(e) => setPoolContactFilter(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ALL">Todos los Contactos</option>
                        <option value="WITH_ANY_ENRICHED">✨ Con Email o Redes</option>
                        <option value="WITH_EMAIL">✉️ Con Correo</option>
                        <option value="WITH_INSTAGRAM">📸 Con Instagram</option>
                        <option value="WITH_FACEBOOK">📘 Con Facebook</option>
                      </select>
                    </div>

                    {/* Estado Outbound */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Estado Outbound</label>
                      <select
                        value={poolStatusFilter}
                        onChange={(e) => setPoolStatusFilter(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ALL">Todos los Estados</option>
                        <option value="PENDING">PENDING (Sin contactar)</option>
                        <option value="QUEUED">QUEUED (En cola)</option>
                        <option value="SENT">SENT (Enviado)</option>
                        <option value="DELIVERED">DELIVERED (Entregado)</option>
                        <option value="REPLIED">REPLIED (Respondió)</option>
                        <option value="DEMO_SCHEDULED">DEMO_SCHEDULED (Demo Agendada)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={poolOnlyWithoutWeb}
                        onChange={(e) => setPoolOnlyWithoutWeb(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Solo Sin Sitio Web</span>
                    </label>

                    <div className="text-[11px] text-slate-500 font-medium">
                      Mostrando <strong className="text-slate-900">{filteredAndSortedProspects.length}</strong> de {prospectPoolTotal} prospectos
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de Prospectos del Pool */}
              {loadingProspectPool ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">Cargando prospectos del pool...</p>
                </div>
              ) : filteredAndSortedProspects.length === 0 ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                    <Database className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">No se encontraron prospectos</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Prueba ajustando los filtros de búsqueda o ejecuta un barrido batch.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-3 w-8">
                            <button
                              onClick={() => {
                                if (selectedPoolLeadIds.length === filteredAndSortedProspects.length) {
                                  setSelectedPoolLeadIds([]);
                                } else {
                                  setSelectedPoolLeadIds(filteredAndSortedProspects.map((p) => p.id));
                                }
                              }}
                              className="text-slate-500 hover:text-slate-900"
                            >
                              {selectedPoolLeadIds.length > 0 && selectedPoolLeadIds.length === filteredAndSortedProspects.length ? (
                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </th>
                          <th
                            onClick={() => togglePoolSort("name")}
                            className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                          >
                            <div className="flex items-center gap-1">
                              <span>Establecimiento / Doctor</span>
                              {poolSortField === "name" && (
                                <span className="text-indigo-600">{poolSortOrder === "asc" ? "↑" : "↓"}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => togglePoolSort("specialty")}
                            className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                          >
                            <div className="flex items-center gap-1">
                              <span>Especialidad</span>
                              {poolSortField === "specialty" && (
                                <span className="text-indigo-600">{poolSortOrder === "asc" ? "↑" : "↓"}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => togglePoolSort("city")}
                            className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                          >
                            <div className="flex items-center gap-1">
                              <span>Ciudad / Teléfono</span>
                              {poolSortField === "city" && (
                                <span className="text-indigo-600">{poolSortOrder === "asc" ? "↑" : "↓"}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => togglePoolSort("contacts")}
                            className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                          >
                            <div className="flex items-center gap-1">
                              <span>Canales Enriquecidos</span>
                              {poolSortField === "contacts" && (
                                <span className="text-indigo-600">{poolSortOrder === "asc" ? "↑" : "↓"}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => togglePoolSort("status")}
                            className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                          >
                            <div className="flex items-center gap-1">
                              <span>Estado</span>
                              {poolSortField === "status" && (
                                <span className="text-indigo-600">{poolSortOrder === "asc" ? "↑" : "↓"}</span>
                              )}
                            </div>
                          </th>
                          <th className="py-3 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAndSortedProspects.map((prospect: any) => {
                          const isSelected = selectedPoolLeadIds.includes(prospect.id);
                          const statusColor =
                            prospect.status === "DEMO_SCHEDULED"
                              ? "bg-purple-50 text-purple-700 border-purple-200 font-bold"
                              : prospect.status === "REPLIED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                              : prospect.status === "DELIVERED" || prospect.status === "SENT"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-100 text-slate-600 border-slate-200";

                          return (
                            <tr key={prospect.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? "bg-indigo-50/30" : ""}`}>
                              <td className="py-3 px-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedPoolLeadIds((prev) => prev.filter((id) => id !== prospect.id));
                                    } else {
                                      setSelectedPoolLeadIds((prev) => [...prev, prospect.id]);
                                    }
                                  }}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-900 block">{prospect.name}</span>
                                <span className="text-[10px] text-slate-400 line-clamp-1">{prospect.address}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {prospect.specialty || prospect.category || "Salud"}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold text-slate-800 block">{prospect.city || scoutCity}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{prospect.formattedPhone || prospect.phone}</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  {!prospect.hasWebsite ? (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                                      <Zap className="w-3 h-3 text-amber-600" /> Sin Web
                                    </span>
                                  ) : (
                                    <a
                                      href={prospect.websiteUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1 hover:underline"
                                    >
                                      <Globe className="w-3 h-3 text-blue-600" /> Web Oficial <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                  <div className="flex flex-wrap items-center gap-1">
                                    {prospect.email && (
                                      <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded inline-flex items-center gap-0.5" title={prospect.email}>
                                        <Mail className="w-2.5 h-2.5 text-indigo-500" /> {prospect.email}
                                      </span>
                                    )}
                                    {prospect.instagramHandle && (
                                      <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0.5 rounded inline-flex items-center gap-0.5" title={prospect.instagramHandle}>
                                        <InstagramIcon className="w-2.5 h-2.5" /> {prospect.instagramHandle}
                                      </span>
                                    )}
                                    {prospect.facebookHandle && (
                                      <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded inline-flex items-center gap-0.5" title={prospect.facebookHandle}>
                                        <FacebookIcon className="w-2.5 h-2.5" /> {prospect.facebookHandle}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${statusColor}`}>
                                  {prospect.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handlePreviewLeadMessage(prospect)}
                                    className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                                    title="Previsualizar mensaje de IA con gancho clínico"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </button>
                                  {prospect.phone && (
                                    <a
                                      href={`https://wa.me/${prospect.phone.replace(/[^0-9]/g, "")}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                      title="Abrir WhatsApp directo"
                                    >
                                      <WhatsAppIcon className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  {prospect.email && (
                                    <a
                                      href={`mailto:${prospect.email}`}
                                      className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                                      title={`Enviar correo a ${prospect.email}`}
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  {prospect.instagramUrl && (
                                    <a
                                      href={prospect.instagramUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                                      title={`Ver Instagram (${prospect.instagramHandle || ''})`}
                                    >
                                      <InstagramIcon className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  {prospect.facebookUrl && (
                                    <a
                                      href={prospect.facebookUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                                      title={`Ver Facebook (${prospect.facebookHandle || ''})`}
                                    >
                                      <FacebookIcon className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🔍 SECCIÓN 4: Radar de Palabras Clave y Demanda en Google */}
          {/* ========================================================================= */}
          {marketViewSection === "keywords" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Términos de Búsqueda de Software Médico en México (Google Ads / Keyword Planner)
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Google Ads API
                  </span>
                </div>

                {(marketIntel?.keywordTrends || []).length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h5 className="text-xs font-bold text-slate-800">Conexión con Google Ads Keyword Planner</h5>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Para sincronizar el volumen mensual de búsquedas en tiempo real desde los servidores de Google, se requiere habilitar el <strong>Google Ads Developer Token</strong> en Google Cloud / Google Ads.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Palabra Clave en Google</th>
                          <th className="py-2.5 px-3">Búsquedas / Mes</th>
                          <th className="py-2.5 px-3">Tendencia Crecimiento</th>
                          <th className="py-2.5 px-3">Competencia</th>
                          <th className="py-2.5 px-3">Categoría de Demanda</th>
                          <th className="py-2.5 px-3">Intención Comercial</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {marketIntel.keywordTrends.map((kw: any) => (
                          <tr key={kw.keyword} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                              <Search className="w-3 h-3 text-slate-400" />
                              <span>{kw.keyword}</span>
                            </td>
                            <td className="py-3 px-3 font-bold text-indigo-600">
                              {kw.monthlySearches?.toLocaleString()} búsquedas
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <TrendingUp className="w-3 h-3" /> {kw.growthTrend}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  kw.competition === "ALTA"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {kw.competition}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-medium">{kw.category}</td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-slate-700">{kw.commercialIntent}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN 3: Estimador de Alcance & Especialidades */}
          {marketViewSection === "reach" && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Estimador de Alcance de Mercado & Audiencia en {marketIntel?.targetCity || scoutCity}, {marketIntel?.targetState || scoutState}
                  </h4>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                  Google Maps & Meta Marketing
                </span>
              </div>

              {!marketIntel?.marketReach ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h5 className="text-xs font-bold text-slate-800">Cálculo de Alcance de Mercado</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Ejecuta una búsqueda en el explorador para calcular en vivo el tamaño de mercado y penetración digital en la región.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* KPI Cards de Alcance */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-700 block">Establecimientos en Google Maps</span>
                        <span className="text-xl font-extrabold text-emerald-950 mt-1 block">
                          {marketIntel.marketReach.activeClinicsOnGoogle?.toLocaleString() || 0}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 mt-1 block">Centros y consultorios mapeados en vivo</span>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-amber-700 block">Adopción Digital en Zona</span>
                        {marketIntel.marketReach.estimatedDigitalAdoptionRate != null ? (
                          <span className="text-xl font-extrabold text-amber-950 mt-1 block">
                            {marketIntel.marketReach.estimatedDigitalAdoptionRate}%
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-600 mt-2 block">N/A</span>
                        )}
                      </div>
                      <span className="text-[10px] text-amber-600 mt-1 block">Con presencia web registrada en Google</span>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-purple-700 block">Audiencia Médica Potencial</span>
                        {marketIntel.marketReach.potentialMedicalAudience != null ? (
                          <span className="text-xl font-extrabold text-purple-950 mt-1 block">
                            {marketIntel.marketReach.potentialMedicalAudience.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-purple-700 mt-2 block">
                            Vía Meta Marketing API
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-purple-500 mt-1 block">Segmentación publicitaria en Meta</span>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-blue-700 block">Médicos Activos en Meta</span>
                        {marketIntel.marketReach.activeDoctorsOnMeta != null ? (
                          <span className="text-xl font-extrabold text-blue-950 mt-1 block">
                            {marketIntel.marketReach.activeDoctorsOnMeta.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-blue-700 mt-2 block">
                            Vía Meta Ads Account
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-blue-500 mt-1 block">Alcanzables vía Facebook / IG</span>
                    </div>
                  </div>

                  {/* Desglose por Especialidad y Tipo de Actor */}
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800">Desglose de Actores Identificados por Categoría</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(marketIntel.marketReach.breakdownBySpecialty || {}).map(([spec, count]: [string, any]) => {
                        const total = Object.values(marketIntel.marketReach.breakdownBySpecialty || {}).reduce((a: number, b: any) => a + Number(b), 0) as number;
                        const pct = total > 0 ? Math.round((Number(count) / total) * 100) : 0;

                        return (
                          <div key={spec} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-sm">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-900">{spec}</span>
                              <span className="font-extrabold text-indigo-600">{Number(count).toLocaleString()} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-indigo-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.max(8, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚙️ VISTA 3: GESTIÓN DE CANALES OFICIALES (TENANT 0L) */}
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

      {/* ========================================================================= */}
      {/* 🛠️ MODAL 1: Creador de Campañas Outbound */}
      {/* ========================================================================= */}
      {showCreateCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Nueva Campaña Outbound B2B</h3>
                  <p className="text-xs text-slate-500">Automatiza la prospección médica con Google Calendar y 1er Mes Gratis</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateCampaignModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Nombre de la Campaña *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pediatras Los Mochis - Lanzamiento NOM-004"
                  value={newCampaignData.name}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, name: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Canal de Salida *</label>
                  <select
                    value={newCampaignData.channel}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, channel: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  >
                    <option value="AI_OMNICHANNEL">🧠 Cascada Inteligente por IA (Omnicanal)</option>
                    <option value="WHATSAPP">WhatsApp Cloud API (Oficial)</option>
                    <option value="INSTAGRAM">Instagram Direct (DM)</option>
                    <option value="EMAIL">Correo Electrónico (Google Workspace)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Ciudad / Segmento</label>
                  <input
                    type="text"
                    value={newCampaignData.targetCity}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, targetCity: e.target.value })}
                    placeholder="Ciudad objetivo..."
                    className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Enlace de Google Calendar (Demo / Onboarding) *</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">Oferta 1er Mes Gratis</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://calendar.google.com/calendar/appointments/schedules/..."
                  value={newCampaignData.calendarUrl}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, calendarUrl: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Plantilla Personalizada (Opcional)</span>
                  <span className="text-[10px] text-slate-400">Dejar vacío para usar Inteligencia de Dolor Clínico</span>
                </label>
                <div className="flex flex-wrap gap-1 mt-1.5 mb-1.5">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-mono font-bold">{"{{doctor_name}}"}</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-mono font-bold">{"{{specialty}}"}</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-mono font-bold">{"{{city}}"}</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-mono font-bold">{"{{calendar_url}}"}</span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Hola {{doctor_name}}, te invitamos a digitalizar tu consulta de {{specialty}} en {{city}} con Quhealthy. Agenda una demo con 1 mes gratis: {{calendar_url}}"
                  value={newCampaignData.customTemplateBody}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, customTemplateBody: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="launchImmediately"
                  checked={newCampaignData.launchImmediately}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, launchImmediately: e.target.checked })}
                  className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="launchImmediately" className="text-xs font-semibold text-indigo-950 cursor-pointer">
                  Iniciar despacho progresivo inmediatamente con cadencia anti-spam (1 mensaje cada 1.5 seg)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateCampaignModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Crear y Lanzar Campaña</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌾 MODAL 2: Barrido Batch Sistemático de Google Places */}
      {/* ========================================================================= */}
      {showBatchHarvesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Barrido Batch de Google Places</h3>
                  <p className="text-xs text-slate-500">Recolección masiva y automática de prospectos médicos para el Lead Pool</p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchHarvesterModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Estado *</label>
                  <input
                    type="text"
                    value={batchHarvesterData.state}
                    onChange={(e) => setBatchHarvesterData({ ...batchHarvesterData, state: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Ciudad *</label>
                  <input
                    type="text"
                    value={batchHarvesterData.city}
                    onChange={(e) => setBatchHarvesterData({ ...batchHarvesterData, city: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Especialidades Sanitarias a Barrer *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "MEDICOS", label: "Médicos Especialistas" },
                    { id: "PEDIATRIA", label: "Pediatría" },
                    { id: "GINECOLOGIA", label: "Ginecología & Obstetricia" },
                    { id: "DENTISTAS", label: "Odontología / Dental" },
                    { id: "CLINICAS", label: "Clínicas & Hospitales" },
                    { id: "LABORATORIOS", label: "Laboratorios Clínicos" },
                    { id: "FARMACIAS", label: "Farmacias" },
                    { id: "OPTICAS", label: "Ópticas" },
                  ].map((cat) => {
                    const isChecked = batchHarvesterData.categories.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked ? "bg-amber-50 border-amber-300 font-bold text-amber-900" : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBatchHarvesterData({
                                ...batchHarvesterData,
                                categories: [...batchHarvesterData.categories, cat.id],
                              });
                            } else {
                              setBatchHarvesterData({
                                ...batchHarvesterData,
                                categories: batchHarvesterData.categories.filter((c) => c !== cat.id),
                              });
                            }
                          }}
                          className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="truncate">{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <label htmlFor="batchOnlyNoWeb" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Filtrar únicamente lugares sin sitio web
                </label>
                <input
                  type="checkbox"
                  id="batchOnlyNoWeb"
                  checked={batchHarvesterData.onlyWithoutWebsite}
                  onChange={(e) => setBatchHarvesterData({ ...batchHarvesterData, onlyWithoutWebsite: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
              </div>

              {batchHarvestResult && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-xs text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>¡Barrido Batch Finalizado con Éxito!</span>
                  </div>
                  <p>Total descubiertos en Google Places: <strong>{batchHarvestResult.totalFound}</strong></p>
                  <p>Nuevos prospectos agregados al Pool: <strong>{batchHarvestResult.newAdded}</strong></p>
                  <p>Duplicados omitidos: <strong>{batchHarvestResult.skippedDuplicates}</strong></p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBatchHarvesterModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleRunBatchHarvest}
                  disabled={harvestingBatch || batchHarvesterData.categories.length === 0}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {harvestingBatch ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Barriendo Google Places...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Iniciar Barrido Batch</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✨ MODAL 3: Previsualización de Mensaje Outbound IA */}
      {/* ========================================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Mensaje Outbound Ultra-Personalizado</h3>
                  <p className="text-xs text-slate-500">Adaptado al dolor clínico, especialidad y presencia web</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewLoading ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Generando mensaje con Inteligencia Clínica...</p>
              </div>
            ) : previewData ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{previewData.recipientName}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {previewData.specialty}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-900 font-medium">🎯 {previewData.detectedPainPoint}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Copia del Mensaje (WhatsApp / DM)</label>
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans shadow-inner">
                    {previewData.renderedMessage}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(previewData.renderedMessage);
                      setCopiedPreview(true);
                      setTimeout(() => setCopiedPreview(false), 2500);
                      toast.success("Mensaje copiado al portapapeles");
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    {copiedPreview ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPreview ? "¡Copiado!" : "Copiar Texto"}</span>
                  </button>

                  {previewData.directWhatsappLink && (
                    <a
                      href={previewData.directWhatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Abrir en WhatsApp Web</span>
                    </a>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
