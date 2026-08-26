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
} from "lucide-react";
import { adminService } from "@/services/admin.service";

interface SocialConnection {
  id: string;
  platform: string;
  platformUserName?: string;
  profileImageUrl?: string;
  isConnected: boolean;
  connectedAt?: string;
}

// Iconos Oficiales SVG
function FacebookIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <radialGradient id="ig-admin-grad" cx="20%" cy="100%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
      <path
        fill="url(#ig-admin-grad)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#25D366">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.45 1.03 2.61.13.17 1.77 2.71 4.3 3.8 2.52 1.09 2.52.73 2.98.69.46-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9m1.38 9.74V9.93H5.08v8.57h2.76z" />
    </svg>
  );
}

function TikTokIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.46V11.8a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-2-.66 4.79 4.79 0 0 1-1.02-.97v-.01z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-6 h-6" }: { className?: string }) {
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

function GoogleBusinessIcon({ className = "w-6 h-6" }: { className?: string }) {
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
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAdminSocialConnections();
      setConnections(data || []);
    } catch (err) {
      console.error("Error al cargar conexiones de Quhealthy", err);
      toast.error("Error al sincronizar canales oficiales de Quhealthy");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();

    // Feedback de URLs
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
      toast.success("¡Canal institucional de Quhealthy conectado exitosamente!");
      loadConnections();
    }
  }, [searchParams, loadConnections]);

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
      key: "WHATSAPP",
      name: "WhatsApp Business Institucional",
      desc: "Línea oficial de soporte a usuarios, ventas de planes SaaS y atención a clínicas.",
      icon: <WhatsAppIcon className="w-8 h-8" />,
      accent: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/30",
    },
    {
      key: "FACEBOOK",
      name: "Facebook Page Oficial",
      desc: "Página institucional de Quhealthy para anuncios, publicaciones y mensajería.",
      icon: <FacebookIcon className="w-8 h-8" />,
      accent: "from-blue-500/10 to-blue-500/5 border-blue-500/30",
    },
    {
      key: "INSTAGRAM",
      name: "Instagram @quhealthyorg",
      desc: "Cuenta oficial para difusión de marca, reels educativos y mensajes directos (DMs).",
      icon: <InstagramIcon className="w-8 h-8" />,
      accent: "from-pink-500/10 to-pink-500/5 border-pink-500/30",
    },
    {
      key: "LINKEDIN",
      name: "LinkedIn Quhealthy",
      desc: "Perfil empresarial para networking médico, artículos de salud y alianzas B2B.",
      icon: <LinkedInIcon className="w-8 h-8" />,
      accent: "from-indigo-500/10 to-indigo-500/5 border-indigo-500/30",
    },
    {
      key: "TIKTOK",
      name: "TikTok @quhealthy",
      desc: "Canal de videos cortos, educación sanitaria y campañas virales de prevención.",
      icon: <TikTokIcon className="w-8 h-8" />,
      accent: "from-slate-700/10 to-slate-700/5 border-slate-600/30",
    },
    {
      key: "YOUTUBE",
      name: "YouTube Quhealthy",
      desc: "Canal oficial de webinars, tutoriales de la plataforma y contenido médico.",
      icon: <YouTubeIcon className="w-8 h-8" />,
      accent: "from-rose-500/10 to-rose-500/5 border-rose-500/30",
    },
    {
      key: "GOOGLE_BUSINESS",
      name: "Google Business Profile",
      desc: "Perfil corporativo de Quhealthy en Google Maps, Búsqueda y reseñas oficiales.",
      icon: <GoogleBusinessIcon className="w-8 h-8" />,
      accent: "from-amber-500/10 to-amber-500/5 border-amber-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de Cabecera */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" /> Canales Oficiales Quhealthy (Tenant 0L)
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Ecosistema de Redes y Canales Institucionales
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Vincula y administra las cuentas corporativas oficiales de Quhealthy. Los mensajes entrantes de WhatsApp, Instagram y Facebook se canalizarán automáticamente hacia el **Admin CRM Inbox**.
            </p>
          </div>

          <button
            onClick={loadConnections}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sincronizar Canales
          </button>
        </div>
      </div>

      {/* Grid de Canales Oficiales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {officialChannels.map((channel) => {
          const activeConn = connections.find(
            (c) => c.platform?.toUpperCase() === channel.key
          );
          const isConnected = !!activeConn;

          return (
            <div
              key={channel.key}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                isConnected ? "border-emerald-200 ring-1 ring-emerald-100" : "border-slate-200/90"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    {channel.icon}
                  </div>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                      Sin vincular
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{channel.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{channel.desc}</p>
                </div>

                {isConnected && activeConn && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                    {activeConn.profileImageUrl ? (
                      <img
                        src={activeConn.profileImageUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        QH
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {activeConn.platformUserName || "Cuenta Oficial Quhealthy"}
                      </p>
                      <p className="text-[11px] text-slate-500">ID: {activeConn.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(activeConn!.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Desconectar Canal
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(channel.key)}
                    disabled={connecting === channel.key}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all active:scale-95 shadow-sm disabled:opacity-50"
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
    </div>
  );
};
